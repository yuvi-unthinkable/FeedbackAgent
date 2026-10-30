/**
 * server.js
 * Express API + Dual WebSocket Bridge Router
 * 
 * - /dashboard-events: Streams live call telemetry to React Medical Dashboard
 * - /twilio-stream: Bidirectional media bridge for Twilio <Connect><Stream>
 * - REST API for patients, outbound calls, webhook callbacks, and clinical reports
 */

require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');
const twilio = require('twilio');

const {
  getPatients,
  getPatientById,
  updateRecordingUrl,
  getReportsByPatientId,
  saveCallReport
} = require('./supabaseClient');
const { generateMedicalReport } = require('./reportWorker');
const { startPatientCall } = require('./twilioClient');
const CallSession = require('./CallSession');
const {
  inspectCallerInput,
  getMedicalConstitutionPrompt,
  sanitizeAiResponse
} = require('./medicalGuardrails');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Store active call sessions keyed by sessionId / callSid
const activeSessions = new Map();

// Dashboard WebSocket clients pool
const dashboardClients = new Set();

// Rolling system logs buffer (max 500 entries)
const systemLogs = [];
const MAX_LOGS = 500;

function addLog(category, message, details = null) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString(),
    category: String(category).toUpperCase(),
    message: String(message),
    details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : null
  };

  systemLogs.unshift(entry);
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.pop();
  }

  console.log(`[${entry.timeFormatted}] [${entry.category}] ${entry.message}`);

  broadcastToDashboard({
    type: 'system-log',
    log: entry
  });

  return entry;
}

function broadcastToDashboard(event) {
  const payload = JSON.stringify(event);
  for (const client of dashboardClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('[server] Error sending to dashboard client:', err);
      }
    }
  }
}

/**
 * Calls Google Gemini (gemini-3.5-flash-lite) to generate intelligent spoken turns,
 * with fast fallback to Groq (qwen/qwen3.8-27b) if needed.
 */
async function generateGeminiVoiceReply({ systemPrompt, history = [], userMessage }) {
  const constitution = getMedicalConstitutionPrompt();
  const effectiveSystemPrompt = systemPrompt && systemPrompt.includes('CLINICAL SAFETY CONSTITUTION')
    ? systemPrompt
    : `${systemPrompt || ''}\n\n${constitution}`.trim();

  if (process.env.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const contents = [];
      for (const h of history) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const payload = {
        contents,
        systemInstruction: effectiveSystemPrompt ? { parts: [{ text: effectiveSystemPrompt }] } : undefined,
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.6
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) return sanitizeAiResponse(reply);
      } else {
        const errTxt = await res.text();
        console.warn(`[server] Gemini API returned ${res.status}: ${errTxt}. Falling back to Groq.`);
      }
    } catch (err) {
      console.warn('[server] Gemini call failed, falling back to Groq:', err.message);
    }
  }

  // Fallback to Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: effectiveSystemPrompt },
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.text
        })),
        { role: 'user', content: userMessage }
      ];

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          messages,
          max_tokens: 120,
          temperature: 0.5
        })
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return sanitizeAiResponse(reply);
      }
    } catch (groqErr) {
      console.error('[server] Groq fallback error:', groqErr.message);
    }
  }

  return sanitizeAiResponse("Thank you for letting me know. How are you feeling right now?");
}

// ---------------------------------------------------------
// REST API Endpoints
// ---------------------------------------------------------

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /logs
 * Serves standalone live HTML telemetry dashboard
 */
app.get('/logs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logs.html'));
});

/**
 * GET /api/logs
 * Returns telemetry logs and current active calls
 */
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    count: systemLogs.length,
    activeCalls: activeSessions.size,
    logs: systemLogs
  });
});

/**
 * POST /api/logs/clear
 * Clears telemetry logs
 */
app.post('/api/logs/clear', (req, res) => {
  systemLogs.length = 0;
  addLog('SYSTEM', 'Telemetry logs cleared by user.');
  res.json({ success: true });
});

/**
 * GET /api/patients
 * Returns list of seeded fictional mock patients for clinical review
 */
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await getPatients();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/calls/outbound
 * Initiates an outbound consultation call (Twilio or Local Simulation)
 */
app.post('/api/calls/outbound', async (req, res) => {
  const { patientId, isCustomCall, customPrompt, personName, agentName, callObjective } = req.body;
  const forceSimulate = req.query.simulate === 'true' || req.body.simulate === true;

  let patient;

  if (isCustomCall || customPrompt) {
    const name = personName || 'Valued Caller';
    patient = {
      id: patientId || `custom_${Date.now()}`,
      name,
      age: 38,
      phone: req.body.customPhone || req.body.phoneNumber || '+919140511451',
      isCustomCall: true,
      customPrompt,
      agentName: agentName || 'Maya',
      consultationReason: callObjective || 'Inbound/Outbound Inquiry & Appointment Booking',
      consultationContext: customPrompt || 'Ask why the caller reached out, answer their questions, and assist them with scheduling an appointment.',
      requiredQuestions: [
        'What is the primary reason for your call today?',
        'Would you like to schedule an appointment with one of our doctors or specialists?',
        'What date and time works best for you?'
      ],
      approvedGuidance: [
        'Confirm appointment details and provide clinic opening hours (Mon-Sat 8AM-8PM).',
        'Remind patient to arrive 10 minutes early with valid identification.'
      ]
    };
  } else {
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const patientRecord = await getPatientById(patientId);
    if (!patientRecord) {
      return res.status(404).json({ error: `Patient not found: ${patientId}` });
    }

    patient = {
      ...patientRecord,
      phone: req.body.customPhone || req.body.phoneNumber || patientRecord.phone
    };
  }

  try {
    const host = req.headers.host || `localhost:${PORT}`;
    let callSid;
    let isSimulated = forceSimulate;

    if (forceSimulate || !process.env.TWILIO_ACCOUNT_SID) {
      callSid = `sim_${Date.now()}`;
      isSimulated = true;
    } else {
      const callResult = await startPatientCall(patient, host);
      callSid = callResult.callSid;
      isSimulated = callResult.isSimulated;
    }

    addLog('CALL-INIT', `Outbound call initiated for ${patient.name} (${patient.phone}) [CallSid: ${callSid}]`, {
      isSimulated,
      patientId: patient.id,
      phone: patient.phone
    });

    // Instantiate CallSession
    const session = new CallSession({
      sessionId: callSid,
      patient,
      isSimulated,
      broadcastFn: broadcastToDashboard
    });

    activeSessions.set(callSid, session);

    if (isSimulated) {
      session.start();
    }

    res.json({
      success: true,
      sessionId: callSid,
      patientId: patient.id,
      patientName: patient.name,
      isSimulated
    });
  } catch (err) {
    console.error('[server] Outbound call error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/calls/terminate
 * Manually terminates an ongoing call session
 */
app.post('/api/calls/terminate', async (req, res) => {
  const { sessionId } = req.body;
  const session = activeSessions.get(sessionId);

  if (session) {
    await session.endCall();
    activeSessions.delete(sessionId);
    return res.json({ success: true, message: 'Call terminated' });
  }

  if (!sessionId && activeSessions.size > 0) {
    for (const [id, s] of activeSessions.entries()) {
      await s.endCall();
      activeSessions.delete(id);
    }
    return res.json({ success: true, message: 'All active calls terminated' });
  }

  res.status(404).json({ error: 'Session not found' });
});

/**
 * POST /api/calls/voice-turn
 * Generates Maya's conversational response during live browser voice calls
 */
app.post('/api/calls/voice-turn', async (req, res) => {
  const { patientId, history, userMessage, customPrompt, personName, agentName } = req.body;
  const patient = patientId ? await getPatientById(patientId) : null;
  const name = personName || patient?.name || 'the caller';

  // Medical Guardrail Inspection
  const guardrailCheck = inspectCallerInput(userMessage, { patient, name });
  if (!guardrailCheck.passed) {
    addLog('GUARDRAIL-ALERT', guardrailCheck.alertMessage, {
      severity: guardrailCheck.severity,
      category: guardrailCheck.category,
      actionTaken: guardrailCheck.actionTaken,
      patientId
    });
    broadcastToDashboard({
      type: 'guardrail-alert',
      patientId,
      guardrailType: guardrailCheck.triggeredGuardrail,
      severity: guardrailCheck.severity,
      category: guardrailCheck.category,
      message: guardrailCheck.alertMessage,
      actionTaken: guardrailCheck.actionTaken,
      userSpeech: userMessage,
      timestamp: Date.now()
    });

    if (guardrailCheck.overrideReply) {
      return res.json({
        replyText: guardrailCheck.overrideReply,
        guardrailAlert: guardrailCheck
      });
    }
  }

  let systemPrompt;
  if (customPrompt) {
    systemPrompt = `You are ${agentName || 'Maya, the AI Assistant'}. You are on an interactive voice call with ${name}.
Your Core Objectives & Scenario:
${customPrompt}

Rules:
1. Speak warmly, clearly, and naturally like an experienced professional agent.
2. Keep each response concise (1 to 2 short sentences at a time) so the conversation flows back and forth easily.
3. If the person states why they called, address it directly.
4. If they want to book an appointment, ask for their preferred doctor/specialty, preferred date, and time, and confirm the booking.
5. If they ask questions, answer them helpfully and ask if they need anything else.`;
  } else if (patient) {
    systemPrompt = `You are Maya, an empathetic, concise, and professional medical consultation agent calling ${patient.name} (${patient.age} years old).
Consultation Reason: ${patient.consultationReason}
Clinical Background: ${patient.consultationContext}

Required Consultation Questions to cover:
${(patient.requiredQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Approved Guidance to deliver:
${(patient.approvedGuidance || []).map(g => `- ${g}`).join('\n')}

Rules:
1. Respond naturally to what the patient just said in 1 to 2 short sentences.
2. If symptoms or adherence are mentioned, acknowledge them empathetically.
3. Progressively ask the next unanswered required question or deliver the appropriate guidance.
4. Keep answers conversational, spoken-friendly, and very brief so the patient can easily reply.`;
  } else {
    systemPrompt = `You are a helpful and friendly appointment booking and customer support agent speaking with ${name}. Keep responses to 1-2 spoken sentences.`;
  }

  // Inject Medical Constitution
  systemPrompt += `\n\n${getMedicalConstitutionPrompt()}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.text
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    if (process.env.GROQ_API_KEY) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          messages,
          max_tokens: 120,
          temperature: 0.3
        })
      });
      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices[0]?.message?.content?.trim();
        return res.json({ replyText: sanitizeAiResponse(reply) });
      }
    }

    if (process.env.GEMINI_API_KEY) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\nPatient says: ${userMessage}` }]
              }
            ]
          })
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return res.json({ replyText: sanitizeAiResponse(reply) });
      }
    }

    res.json({ replyText: sanitizeAiResponse("Thank you for sharing that. How is your overall breathing and comfort today?") });
  } catch (err) {
    console.error('[server] voice-turn error:', err);
    res.json({ replyText: "Thank you for letting me know. Are you experiencing any new or worsening symptoms today?" });
  }
});

/**
 * POST /api/calls/end-web-call
 * Generates post-call clinical report for web voice calls
 */
app.post('/api/calls/end-web-call', async (req, res) => {
  const { patientId, transcript, customPrompt, personName, agentName, isCustomCall, guardrailAlerts } = req.body;
  let patient = patientId ? await getPatientById(patientId) : null;

  if (isCustomCall || !patient) {
    patient = {
      id: patientId || `custom_${Date.now()}`,
      name: personName || patient?.name || 'Valued Caller',
      age: 35,
      isCustomCall: true,
      customPrompt,
      agentName: agentName || 'Maya',
      consultationReason: 'Customer Inquiry & Appointment Booking',
      consultationContext: customPrompt || 'Inquiry and appointment booking call.',
      requiredQuestions: [
        'What was the primary reason for your call?',
        'Was an appointment successfully scheduled or requested?',
        'Were your questions answered to your satisfaction?'
      ],
      approvedGuidance: [
        'Confirmed clinic details, hours, and next steps.',
        'Provided follow-up contact information.'
      ]
    };
  }

  const { generateMedicalReport } = require('./reportWorker');
  const { saveCallReport } = require('./supabaseClient');

  try {
    const report = await generateMedicalReport(patient, transcript || [], guardrailAlerts || []);
    const savedRecord = await saveCallReport({
      id: `rep_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      callSid: `web_${Date.now()}`,
      recordingUrl: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
      ...report,
      transcript: transcript || [],
      createdAt: new Date().toISOString()
    });

    broadcastToDashboard({
      type: 'end-of-call-report',
      patientId: patient.id,
      report: savedRecord,
      timestamp: Date.now()
    });

    res.json({ success: true, report: savedRecord });
  } catch (err) {
    console.error('[server] end-web-call error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET/POST /api/twilio/voice
 * Returns TwiML for Twilio outbound calls with speech-to-text gather & Polly neural voice
 */
app.all('/api/twilio/voice', async (req, res) => {
  const patientId = req.query?.patientId || req.body?.patientId || '';
  const patientName = req.query?.patientName || req.body?.patientName || 'Patient';
  const callSid = req.query?.CallSid || req.body?.CallSid || req.query?.callSid || `call_${Date.now()}`;

  const effectiveHost = process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '')
    : req.headers.host || `localhost:${PORT}`;

  const httpProtocol = effectiveHost.startsWith('localhost') ? 'http' : 'https';

  let session = activeSessions.get(callSid);
  let patient = session?.patient;
  if (!patient && patientId) {
    patient = await getPatientById(patientId);
  }

  const name = patient?.name || patientName;
  let greeting;
  if (patient?.isCustomCall) {
    greeting = `Hello ${name}. I am ${patient.agentName || 'Maya — Clinic Coordinator'}, your AI assistant. How can I help you today?`;
  } else if (patient?.consultationReason) {
    greeting = `Hello ${name}. This is Maya following up on your consultation. How are you feeling today?`;
  } else {
    greeting = `Hello ${name}. I am Maya, your AI assistant. How can I assist you today?`;
  }

  addLog('TWILIO-CALL', `Call connected for ${name}. Playing opening greeting: "${greeting}"`, { callSid, patientId });

  // Ensure session exists
  if (!session) {
    session = new CallSession({
      sessionId: callSid,
      patient: patient || { id: patientId, name },
      isSimulated: false,
      broadcastFn: broadcastToDashboard
    });
    activeSessions.set(callSid, session);
  }

  session.transcript.push({ role: 'assistant', text: greeting, timestamp: Date.now() });
  broadcastToDashboard({
    type: 'transcript',
    role: 'assistant',
    transcriptType: 'final',
    transcript: greeting,
    timestamp: Date.now()
  });

  const twiml = new twilio.twiml.VoiceResponse();
  const actionUrl = `${httpProtocol}://${effectiveHost}/api/twilio/voice-turn?patientId=${encodeURIComponent(patientId)}&callSid=${encodeURIComponent(callSid)}`;
  const spokenGreeting = greeting.replace(/[\u2014\u2013]/g, ', ');

  const gather = twiml.gather({
    input: 'speech',
    action: actionUrl,
    method: 'POST',
    speechTimeout: 'auto',
    speechModel: 'phone_call',
    language: 'en-IN'
  });
  gather.say({ voice: 'Polly.Aditi', language: 'en-IN' }, spokenGreeting);

  twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "I didn't catch that. Please let me know how I can help you, or say goodbye to end the call.");
  twiml.gather({
    input: 'speech',
    action: actionUrl,
    method: 'POST',
    speechTimeout: 'auto',
    speechModel: 'phone_call',
    language: 'en-IN'
  });
  twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Thank you for your time. Have a wonderful day. Goodbye!");
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * ALL /api/twilio/voice-turn
 * Interactive speech-to-text turn handler powered by Google Gemini (gemini-3.5-flash-lite)
 */
app.all('/api/twilio/voice-turn', async (req, res) => {
  const callSid = req.query?.callSid || req.body?.CallSid || req.body?.callSid || req.query?.CallSid || '';
  const patientId = req.query?.patientId || req.body?.patientId || '';
  const userSpeech = req.body?.SpeechResult || req.query?.SpeechResult || '';
  const confidence = req.body?.Confidence || req.query?.Confidence || '';

  const effectiveHost = process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '')
    : req.headers.host || `localhost:${PORT}`;
  const httpProtocol = effectiveHost.startsWith('localhost') ? 'http' : 'https';
  const actionUrl = `${httpProtocol}://${effectiveHost}/api/twilio/voice-turn?patientId=${encodeURIComponent(patientId)}&callSid=${encodeURIComponent(callSid)}`;

  let session = activeSessions.get(callSid);
  let patient = session?.patient;
  if (!patient && patientId) {
    patient = await getPatientById(patientId);
  }

  const name = patient?.name || 'Caller';

  if (!userSpeech || userSpeech.trim().length === 0) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "I am still here. Please let me know how I can help, or say goodbye to end.");
    twiml.gather({
      input: 'speech',
      action: actionUrl,
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      language: 'en-IN'
    });
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Goodbye!");
    twiml.hangup();
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // 1. Log caller speech
  addLog('USER-SPEECH', `Caller (${name}): "${userSpeech}"`, { confidence, callSid });

  // 2. Broadcast to dashboard
  broadcastToDashboard({
    type: 'transcript',
    role: 'user',
    transcriptType: 'final',
    transcript: userSpeech,
    timestamp: Date.now()
  });

  // 3. Save to session transcript
  if (!session) {
    session = new CallSession({
      sessionId: callSid,
      patient: patient || { id: patientId, name },
      isSimulated: false,
      broadcastFn: broadcastToDashboard
    });
    activeSessions.set(callSid, session);
  }
  session.transcript.push({ role: 'user', text: userSpeech, timestamp: Date.now() });

  // Medical Guardrail Inspection
  const guardrailCheck = inspectCallerInput(userSpeech, { patient, callSid });
  if (!guardrailCheck.passed) {
    addLog('GUARDRAIL-ALERT', guardrailCheck.alertMessage, {
      severity: guardrailCheck.severity,
      category: guardrailCheck.category,
      actionTaken: guardrailCheck.actionTaken,
      callSid
    });

    broadcastToDashboard({
      type: 'guardrail-alert',
      callSid,
      patientId,
      guardrailType: guardrailCheck.triggeredGuardrail,
      severity: guardrailCheck.severity,
      category: guardrailCheck.category,
      message: guardrailCheck.alertMessage,
      actionTaken: guardrailCheck.actionTaken,
      userSpeech,
      timestamp: Date.now()
    });

    session.guardrailEvents = session.guardrailEvents || [];
    session.guardrailEvents.push(guardrailCheck);
  }

  // Handle Critical Emergency Red-Flag Override (Immediate Emergency Action)
  if (guardrailCheck.triggeredGuardrail === 'EMERGENCY_RED_FLAG') {
    const spokenEmergency = guardrailCheck.overrideReply.replace(/[\u2014\u2013]/g, ', ');
    session.transcript.push({ role: 'assistant', text: guardrailCheck.overrideReply, timestamp: Date.now() });

    addLog('REPORT-WORKER', 'Critical emergency red-flag triggered! Generating urgent triage report...', { turns: session.transcript.length });
    generateMedicalReport(session.patient, session.transcript, session.guardrailEvents || []).then(async (report) => {
      const savedRecord = await saveCallReport({
        id: `rep_${Date.now()}`,
        patientId: session.patient.id,
        patientName: session.patient.name,
        callSid: callSid,
        recordingUrl: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
        ...report,
        urgencyLevel: 'HIGH',
        followUpRequired: true,
        transcript: session.transcript,
        createdAt: new Date().toISOString()
      });
      addLog('REPORT-WORKER', `Emergency report saved! Urgency: HIGH - Escalation Required.`, { reportId: savedRecord.id });
      broadcastToDashboard({
        type: 'end-of-call-report',
        patientId: session.patient.id,
        report: savedRecord,
        timestamp: Date.now()
      });
    }).catch(err => {
      addLog('ERROR', `Error generating emergency report: ${err.message}`);
    });

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, spokenEmergency);
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Please hang up now and seek immediate emergency medical care. Goodbye.");
    twiml.hangup();
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // 4. Construct prompt for Google Gemini
  let systemPrompt;
  if (patient?.isCustomCall) {
    systemPrompt = `You are ${patient.agentName || 'Maya, the AI Assistant'}. You are on an interactive voice phone call with ${name}.
Your Core Objectives & Scenario:
${patient.customPrompt || 'Ask why the caller reached out, answer their questions, and assist them with booking an appointment.'}

Rules:
1. Speak warmly, clearly, and naturally like an experienced professional agent.
2. Keep each response strictly to 1 or 2 spoken sentences so the conversation flows easily over the phone.
3. If the person states why they called, address it directly.
4. If they want to book an appointment, ask for their preferred doctor/specialty, preferred date, and time, and confirm the booking.
5. If they ask questions, answer them helpfully.`;
  } else if (patient) {
    systemPrompt = `You are Maya, an empathetic, concise, and professional medical consultation agent calling ${patient.name} (${patient.age || 30} years old).
Consultation Reason: ${patient.consultationReason}
Clinical Background: ${patient.consultationContext}

Required Consultation Questions to cover:
${(patient.requiredQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Approved Guidance to deliver:
${(patient.approvedGuidance || []).map(g => `- ${g}`).join('\n')}

Rules:
1. Respond naturally to what the patient just said in 1 to 2 short sentences.
2. If symptoms or adherence are mentioned, acknowledge them empathetically.
3. Progressively ask the next unanswered required question or deliver the appropriate guidance.
4. Keep answers conversational, spoken-friendly, and very brief.`;
  } else {
    systemPrompt = `You are a helpful and friendly appointment booking and medical support agent speaking with ${name}. Keep responses to 1-2 spoken sentences.`;
  }

  // Inject Medical Constitution
  systemPrompt += `\n\n${getMedicalConstitutionPrompt()}`;

  // 5. Query Google Gemini or use Guardrail Override
  let aiResponse;
  if (guardrailCheck.overrideReply) {
    aiResponse = guardrailCheck.overrideReply;
  } else {
    const rawAi = await generateGeminiVoiceReply({
      systemPrompt,
      history: session.transcript.slice(0, -1),
      userMessage: userSpeech
    });
    aiResponse = sanitizeAiResponse(rawAi);
  }

  // 6. Log Gemini response
  addLog('GEMINI-AI', `Maya: "${aiResponse}"`, { callSid });

  // 7. Broadcast to dashboard
  broadcastToDashboard({
    type: 'transcript',
    role: 'assistant',
    transcriptType: 'final',
    transcript: aiResponse,
    timestamp: Date.now()
  });

  session.transcript.push({ role: 'assistant', text: aiResponse, timestamp: Date.now() });

  // 8. Check for user farewell
  const isFarewell = /(goodbye|bye bye|\bbye\b|that is all|that's all|thank you bye|hang up)/i.test(userSpeech);

  if (isFarewell && session && session.transcript && session.transcript.length > 0) {
    addLog('REPORT-WORKER', `Call concluded. Generating post-call report with Google Gemini...`, { turns: session.transcript.length });
    generateMedicalReport(session.patient, session.transcript, session.guardrailEvents || []).then(async (report) => {
      const savedRecord = await saveCallReport({
        id: `rep_${Date.now()}`,
        patientId: session.patient.id,
        patientName: session.patient.name,
        callSid: callSid,
        recordingUrl: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
        ...report,
        transcript: session.transcript,
        createdAt: new Date().toISOString()
      });
      addLog('REPORT-WORKER', `Report saved to Supabase! Appointment: ${savedRecord.appointmentBooked?.isBooked ? 'CONFIRMED' : 'Not booked'}`, savedRecord.appointmentBooked);
      broadcastToDashboard({
        type: 'end-of-call-report',
        patientId: session.patient.id,
        report: savedRecord,
        timestamp: Date.now()
      });
    }).catch(err => {
      addLog('ERROR', `Error generating report: ${err.message}`);
    });
  }

  const twiml = new twilio.twiml.VoiceResponse();
  const spokenAi = aiResponse.replace(/[\u2014\u2013]/g, ', ');
  if (isFarewell) {
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, spokenAi);
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Thank you for speaking with me. Have a wonderful day. Goodbye!");
    twiml.hangup();
  } else {
    const gather = twiml.gather({
      input: 'speech',
      action: actionUrl,
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      language: 'en-IN'
    });
    gather.say({ voice: 'Polly.Aditi', language: 'en-IN' }, spokenAi);

    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Are you still there? Please let me know how I can help, or say goodbye to end.");
    twiml.gather({
      input: 'speech',
      action: actionUrl,
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      language: 'en-IN'
    });
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, "Thank you for calling. Goodbye!");
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * POST /api/twilio/call-status
 * Webhook callback for Twilio call state updates (initiated, ringing, answered, completed)
 */
app.post('/api/twilio/call-status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration, To } = req.body;
  const patientId = req.query?.patientId || '';

  addLog('CALL-STATUS', `Call ${CallSid} status: ${CallStatus}${CallDuration ? ` (${CallDuration}s)` : ''}`, { To, CallStatus });

  if (CallStatus === 'completed') {
    const session = activeSessions.get(CallSid);
    if (session && session.transcript && session.transcript.length > 0) {
      addLog('REPORT-WORKER', `Call completed. Generating clinical & appointment summary with Google Gemini...`, { turns: session.transcript.length });
      try {
        const report = await generateMedicalReport(session.patient, session.transcript);
        const savedRecord = await saveCallReport({
          id: `rep_${Date.now()}`,
          patientId: session.patient.id,
          patientName: session.patient.name,
          callSid: CallSid,
          recordingUrl: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
          ...report,
          transcript: session.transcript,
          createdAt: new Date().toISOString()
        });

        addLog('REPORT-WORKER', `Report saved to Supabase! Appointment: ${savedRecord.appointmentBooked?.isBooked ? 'CONFIRMED' : 'Not booked'}`, savedRecord.appointmentBooked);

        broadcastToDashboard({
          type: 'end-of-call-report',
          patientId: session.patient.id,
          report: savedRecord,
          timestamp: Date.now()
        });
      } catch (repErr) {
        addLog('ERROR', `Error generating report: ${repErr.message}`);
      }
    }
    activeSessions.delete(CallSid);
  }

  res.sendStatus(200);
});

/**
 * POST /api/webhooks/recording-ready
 * Twilio recording callback webhook
 */
app.post('/api/webhooks/recording-ready', async (req, res) => {
  const { CallSid, RecordingUrl } = req.body;
  console.log(`[server] Webhook received for CallSid ${CallSid}: ${RecordingUrl}`);

  if (CallSid && RecordingUrl) {
    await updateRecordingUrl(CallSid, RecordingUrl);
    broadcastToDashboard({
      type: 'recording-ready',
      callSid: CallSid,
      recordingUrl: RecordingUrl
    });
  }

  res.status(200).send('<Response></Response>');
});

/**
 * GET /api/reports/:patientId
 * Returns historical consultation reports and audio recordings
 */
app.get('/api/reports/:patientId', async (req, res) => {
  try {
    const reports = await getReportsByPatientId(req.params.patientId);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// HTTP Server & Dual WebSocket Router
// ---------------------------------------------------------

const server = http.createServer(app);

// Dashboard WebSocket Server
const wssDashboard = new WebSocketServer({ noServer: true });
wssDashboard.on('connection', (ws) => {
  dashboardClients.add(ws);
  console.log(`[server] Dashboard client connected. Total clients: ${dashboardClients.size}`);

  // Send initial connection acknowledgement
  ws.send(JSON.stringify({
    type: 'connection-established',
    activeCalls: activeSessions.size,
    timestamp: Date.now()
  }));

  ws.on('close', () => {
    dashboardClients.delete(ws);
    console.log(`[server] Dashboard client disconnected. Total clients: ${dashboardClients.size}`);
  });
});

// Twilio Stream WebSocket Server
const wssTwilio = new WebSocketServer({ noServer: true });
wssTwilio.on('connection', (ws) => {
  console.log('[server] Twilio Media Stream WebSocket connected');
  let currentSession = null;
  let streamSid = null;

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.event) {
        case 'connected':
          console.log('[Twilio WS] Protocol connected');
          break;

        case 'start': {
          streamSid = msg.start.streamSid;
          const callSid = msg.start.callSid;
          const customParams = msg.start.customParameters || {};
          const patientId = customParams.patientId;

          console.log(`[Twilio WS] Stream started: streamSid=${streamSid}, callSid=${callSid}, patientId=${patientId}`);

          // Retrieve or create session
          currentSession = activeSessions.get(callSid);
          if (!currentSession && patientId) {
            const patient = await getPatientById(patientId);
            currentSession = new CallSession({
              sessionId: callSid,
              patient,
              twilioWs: ws,
              streamSid,
              isSimulated: false,
              broadcastFn: broadcastToDashboard
            });
            activeSessions.set(callSid, currentSession);
          } else if (currentSession) {
            currentSession.twilioWs = ws;
            currentSession.streamSid = streamSid;
          }

          if (currentSession) {
            currentSession.start();
          }
          break;
        }

        case 'media':
          if (currentSession && msg.media?.payload) {
            currentSession.handleTwilioMedia(msg.media.payload);
          }
          break;

        case 'stop':
          console.log(`[Twilio WS] Stream stopped: ${streamSid}`);
          if (currentSession) {
            await currentSession.endCall();
            activeSessions.delete(currentSession.sessionId);
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('[Twilio WS] Error handling stream message:', err);
    }
  });

  ws.on('close', async () => {
    console.log('[Twilio WS] Twilio connection closed');
    if (currentSession) {
      await currentSession.endCall();
      activeSessions.delete(currentSession.sessionId);
    }
  });
});

// Upgrade router dispatching WebSocket requests by pathname
server.on('upgrade', (request, socket, head) => {
  const host = request.headers.host || 'localhost';
  const { pathname } = new URL(request.url, `http://${host}`);
  console.log(`[server upgrade] URL: ${request.url} | Pathname: ${pathname} | Host: ${host}`);

  if (pathname === '/dashboard-events' || pathname.startsWith('/dashboard-events')) {
    wssDashboard.handleUpgrade(request, socket, head, (ws) => {
      wssDashboard.emit('connection', ws, request);
    });
  } else if (pathname === '/twilio-stream' || pathname.startsWith('/twilio-stream')) {
    wssTwilio.handleUpgrade(request, socket, head, (ws) => {
      wssTwilio.emit('connection', ws, request);
    });
  } else {
    console.warn(`[server upgrade] Rejecting unrecognized upgrade path: ${pathname}`);
    socket.destroy();
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[server] Medical Voice Agent Backend listening on http://localhost:${PORT}`);
    console.log(`[server] Dashboard WS: ws://localhost:${PORT}/dashboard-events`);
    console.log(`[server] Twilio Stream WS: ws://localhost:${PORT}/twilio-stream`);
  });
}

module.exports = { app, server, activeSessions };
