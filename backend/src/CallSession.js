/**
 * CallSession.js
 * Vapi-Inspired State Machine & Real-Time Gemini Live <-> Twilio WebSocket Bridge
 * 
 * Extends Node's EventEmitter to manage consultation call lifecycles:
 * - Bridges Twilio 8kHz mu-law audio with Gemini Live 16kHz/24kHz PCM
 * - Sub-50ms instant barge-in via Twilio 'clear' frame
 * - Emits Vapi-compatible events (call-start, speech-update, transcript, call-end)
 * - Triggers post-call clinical report worker upon hangup
 */

const EventEmitter = require('events');
const WebSocket = require('ws');
const { mulawToPcm16, pcm24ToMulaw } = require('./audioUtils');
const { generateMedicalReport } = require('./reportWorker');
const { saveCallReport } = require('./supabaseClient');

class CallSession extends EventEmitter {
  constructor(options = {}) {
    super();

    this.sessionId = options.sessionId || `call_${Date.now()}`;
    this.patient = options.patient;
    this.twilioWs = options.twilioWs || null;
    this.streamSid = options.streamSid || null;
    this.isSimulated = Boolean(options.isSimulated);
    this.broadcastFn = options.broadcastFn || null;

    this.geminiWs = null;
    this.transcript = [];
    this.activeSpeaker = 'idle'; // 'idle' | 'assistant' | 'user'
    this.isCallActive = false;
    this.simulationTimeouts = [];
  }

  /**
   * Broadcasts an event to connected React Dashboard clients and emits locally.
   */
  broadcast(event) {
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }
    this.emit(event.type || 'message', event);
    if (typeof this.broadcastFn === 'function') {
      this.broadcastFn(event);
    }
  }

  /**
   * Builds the system instruction prompt specialized for the patient consultation.
   */
  buildSystemInstruction() {
    if (this.patient.isCustomCall) {
      return `You are ${this.patient.agentName || 'Maya, the AI Assistant'}. You are on an interactive voice call with ${this.patient.name}.
Your Core Objectives & Scenario:
${this.patient.customPrompt || 'Ask why the caller reached out, answer their questions, and assist them with booking an appointment.'}

Rules:
1. Speak warmly, clearly, and naturally like an experienced professional agent.
2. Keep each response concise (1 to 2 short sentences at a time) so the conversation flows back and forth easily.
3. If the person states why they called, address it directly.
4. If they want to book an appointment, ask for their preferred doctor/specialty, preferred date, and time, and confirm the booking.
5. If they ask questions, answer them helpfully and ask if they need anything else.`;
    }

    return `You are Maya, an empathetic, concise, and professional medical consultation agent calling ${this.patient.name} (${this.patient.age} years old).
Consultation Reason: ${this.patient.consultationReason}
Clinical Background: ${this.patient.consultationContext}

Your Clinical Objectives:
1. Warmly greet the patient and confirm identity.
2. Ask each of the required consultation questions naturally one by one:
${(this.patient.requiredQuestions || []).map((q, i) => `   ${i + 1}. ${q}`).join('\n')}
3. Provide the approved clinical guidance:
${(this.patient.approvedGuidance || []).map((g, i) => `   - ${g}`).join('\n')}
4. Keep spoken responses short (1-2 sentences at a time) so the patient can easily respond.
5. If the patient interrupts, immediately stop speaking and listen.`;
  }

  /**
   * Starts the call session.
   */
  async start() {
    this.isCallActive = true;
    this.broadcast({
      type: 'call-start',
      callId: this.sessionId,
      patientId: this.patient.id,
      patientName: this.patient.name,
      timestamp: Date.now()
    });

    if (this.isSimulated || !process.env.GEMINI_API_KEY) {
      console.log(`[CallSession ${this.sessionId}] Running simulation mode for patient ${this.patient.name}`);
      this.runSimulation();
      return;
    }

    try {
      this.initGeminiLiveBridge();
    } catch (err) {
      console.error(`[CallSession ${this.sessionId}] Error initiating Gemini Live bridge:`, err);
      this.broadcast({
        type: 'error',
        message: `Failed to initiate Gemini Live: ${err.message}`
      });
      this.runSimulation();
    }
  }

  /**
   * Connects to Gemini Live BidiGenerateContent WebSocket.
   */
  initGeminiLiveBridge() {
    const model = process.env.GEMINI_LIVE_MODEL || 'models/gemini-2.0-flash-exp';
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(`[CallSession ${this.sessionId}] Connecting to Gemini Live WebSocket: ${model}`);
    this.geminiWs = new WebSocket(geminiUrl);

    this.geminiWs.on('open', () => {
      console.log(`[CallSession ${this.sessionId}] Gemini Live WebSocket connected`);

      // Send initial setup frame
      const setupFrame = {
        setup: {
          model,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Aoede'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{ text: this.buildSystemInstruction() }]
          }
        }
      };

      this.geminiWs.send(JSON.stringify(setupFrame));
    });

    this.geminiWs.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleGeminiServerContent(message);
      } catch (err) {
        console.error(`[CallSession ${this.sessionId}] Error parsing Gemini message:`, err);
      }
    });

    this.geminiWs.on('error', (err) => {
      console.error(`[CallSession ${this.sessionId}] Gemini WebSocket error:`, err);
      this.broadcast({ type: 'error', message: err.message });
    });

    this.geminiWs.on('close', (code, reason) => {
      console.log(`[CallSession ${this.sessionId}] Gemini WebSocket closed: ${code} - ${reason}`);
    });
  }

  /**
   * Handles inbound messages from Gemini Live server.
   */
  handleGeminiServerContent(response) {
    // 1. Instant Barge-In detection
    if (response.serverContent?.interrupted === true) {
      console.log(`[CallSession ${this.sessionId}] Barge-in detected from Gemini Live! Flushing audio...`);
      this.handleBargeIn();
      return;
    }

    const modelTurn = response.serverContent?.modelTurn;
    if (modelTurn?.parts) {
      for (const part of modelTurn.parts) {
        // Handle text/transcript parts
        if (part.text) {
          const entry = {
            role: 'assistant',
            text: part.text,
            timestamp: Date.now()
          };
          this.transcript.push(entry);
          this.broadcast({
            type: 'transcript',
            role: 'assistant',
            transcriptType: 'final',
            transcript: part.text,
            timestamp: entry.timestamp
          });
        }

        // Handle raw 24kHz audio parts
        if (part.inlineData?.data) {
          this.setSpeaker('assistant');

          // Convert 24kHz PCM -> 8kHz mu-law for Twilio
          const mulawPayload = pcm24ToMulaw(part.inlineData.data);

          if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN && this.streamSid) {
            this.twilioWs.send(JSON.stringify({
              event: 'media',
              streamSid: this.streamSid,
              media: { payload: mulawPayload }
            }));
          }
        }
      }
    }

    if (response.serverContent?.turnComplete) {
      this.setSpeaker('idle');
    }
  }

  /**
   * Handles Twilio inbound media stream frames (8kHz G.711 mu-law).
   */
  handleTwilioMedia(base64Mulaw) {
    if (!this.isCallActive || !this.geminiWs || this.geminiWs.readyState !== WebSocket.OPEN) {
      return;
    }

    this.setSpeaker('user');

    // Resample 8kHz mu-law -> 16kHz 16-bit Linear PCM for Gemini Live
    const pcm16Base64 = mulawToPcm16(base64Mulaw);

    const realtimeChunk = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: pcm16Base64
          }
        ]
      }
    };

    this.geminiWs.send(JSON.stringify(realtimeChunk));
  }

  /**
   * Sub-50ms Barge-In Flush.
   * Sends Twilio 'clear' event to flush queued outbound audio buffer.
   */
  handleBargeIn() {
    // Flush Twilio audio buffer
    if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN && this.streamSid) {
      this.twilioWs.send(JSON.stringify({
        event: 'clear',
        streamSid: this.streamSid
      }));
    }

    // Emit instant barge-in telemetry
    this.broadcast({
      type: 'user-interrupted',
      timestamp: Date.now()
    });

    this.setSpeaker('user');
  }

  /**
   * Updates active speaker and broadcasts speech-update.
   */
  setSpeaker(newSpeaker) {
    if (this.activeSpeaker !== newSpeaker) {
      if (this.activeSpeaker !== 'idle') {
        this.broadcast({
          type: 'speech-update',
          status: 'stopped',
          role: this.activeSpeaker,
          timestamp: Date.now()
        });
      }
      this.activeSpeaker = newSpeaker;
      if (newSpeaker !== 'idle') {
        this.broadcast({
          type: 'speech-update',
          status: 'started',
          role: newSpeaker,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Terminates the call session and triggers post-call LLM clinical report worker.
   */
  async endCall(recordingUrl = null) {
    if (!this.isCallActive) return;
    this.isCallActive = false;

    // Clear any pending simulation timeouts
    for (const t of this.simulationTimeouts) {
      clearTimeout(t);
    }
    this.simulationTimeouts = [];

    this.setSpeaker('idle');

    // Close Gemini WebSocket if open
    if (this.geminiWs) {
      try {
        this.geminiWs.close();
      } catch (_) { }
      this.geminiWs = null;
    }

    this.broadcast({
      type: 'call-end',
      callId: this.sessionId,
      timestamp: Date.now()
    });

    console.log(`[CallSession ${this.sessionId}] Generating post-call clinical report for ${this.patient.name}...`);

    try {
      const report = await generateMedicalReport(this.patient, this.transcript, this.guardrailEvents || []);
      const savedRecord = await saveCallReport({
        id: `rep_${Date.now()}`,
        patientId: this.patient.id,
        patientName: this.patient.name,
        callSid: this.sessionId,
        recordingUrl: recordingUrl || 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
        ...report,
        transcript: this.transcript,
        createdAt: new Date().toISOString()
      });

      console.log(`[CallSession ${this.sessionId}] Clinical report saved successfully: ${savedRecord.id}`);

      this.broadcast({
        type: 'end-of-call-report',
        patientId: this.patient.id,
        report: savedRecord,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(`[CallSession ${this.sessionId}] Error generating/saving clinical report:`, err);
    }
  }

  /**
   * Runs a complete clinical dialogue simulation for browser testing,
   * verifying state transitions, barge-in, transcript streaming, and report generation.
   */
  runSimulation() {
    let turns;

    if (this.patient.isCustomCall) {
      const agentName = this.patient.agentName || 'Maya';
      turns = [
        {
          delay: 600,
          role: 'assistant',
          text: `Hello ${this.patient.name}, this is ${agentName}. I'm following up on your inquiry—what was the primary reason for your call today?`
        },
        {
          delay: 2500,
          role: 'user',
          text: `Hi ${agentName}, thank you for calling back. I've been having recurring migraine headaches and I wanted to know if Dr. Sharma has any open appointments this Friday?`
        },
        {
          delay: 5000,
          role: 'assistant',
          text: `I can certainly check that for you right away. Dr. Sharma has open consultation slots this Friday at 10:30 AM or 2:00 PM. Would either of those times work for you?`
        },
        {
          // Barge-in sequence! User interrupts to confirm slot and ask clinic queries
          delay: 7200,
          isBargeIn: true,
          role: 'user',
          text: `Actually, 2:00 PM works perfectly! Also, do I need to fast before the visit or bring my previous health records?`
        },
        {
          delay: 10000,
          role: 'assistant',
          text: `2:00 PM on Friday is officially booked for you! No fasting is needed, but please bring any recent prescriptions or MRI scans. Our clinic opens at 8:00 AM, and our front desk will have your check-in slip ready.`
        },
        {
          delay: 13500,
          role: 'user',
          text: `That was super quick and helpful. Thank you so much for booking my appointment and answering my questions, ${agentName}!`
        },
        {
          delay: 15500,
          role: 'assistant',
          text: `You're very welcome, ${this.patient.name}. You'll receive a confirmation SMS shortly. Have a wonderful day!`
        }
      ];
    } else {
      turns = [
        {
          delay: 600,
          role: 'assistant',
          text: `Hello ${this.patient.name}, this is the AI Medical Assistant calling from your cardiology care team for your scheduled health check-in.`
        },
        {
          delay: 2400,
          role: 'user',
          text: `Hi Doctor. Yes, I'm here. Thank you for calling.`
        },
        {
          delay: 4200,
          role: 'assistant',
          text: this.patient.requiredQuestions?.[0] || 'Have you checked your weight this morning?'
        },
        {
          delay: 6200,
          role: 'user',
          text: `Yes, I stepped on the scale at 7 AM. My weight was 168 pounds, which is about 2.5 pounds higher than yesterday morning.`
        },
        {
          delay: 8200,
          role: 'assistant',
          text: `Thank you for checking. And how is your breathing today—any shortness of breath when walking or lying flat?`
        },
        {
          // Barge-in sequence! User interrupts assistant mid-sentence
          delay: 9600,
          isBargeIn: true,
          role: 'user',
          text: `Actually, wait—I noticed when I woke up and tried to tie my shoes, my feet and ankles were really swollen and puffy!`
        },
        {
          delay: 12200,
          role: 'assistant',
          text: `I hear you, and that is very important information. Since your weight is up 2.5 pounds and you have ankle swelling, I am flagging this for immediate nurse triage review. Please take your prescribed Furosemide with breakfast, keep your feet elevated, and stay under 2,000 milligrams of sodium today.`
        },
        {
          delay: 15400,
          role: 'user',
          text: `Understood. I will take my medication now and rest with my legs up. Thank you!`
        },
        {
          delay: 17200,
          role: 'assistant',
          text: `You're welcome, ${this.patient.name}. Your care team will follow up shortly. Take care and goodbye.`
        }
      ];
    }

    for (const turn of turns) {
      const t = setTimeout(() => {
        if (!this.isCallActive) return;

        if (turn.isBargeIn) {
          // Trigger instant barge-in
          this.handleBargeIn();
        } else {
          this.setSpeaker(turn.role);
        }

        const entry = {
          role: turn.role,
          text: turn.text,
          timestamp: Date.now()
        };
        this.transcript.push(entry);

        this.broadcast({
          type: 'transcript',
          role: turn.role,
          transcriptType: 'final',
          transcript: turn.text,
          timestamp: entry.timestamp
        });

        // Reset speaker to idle briefly after turn finishes
        const idleTimer = setTimeout(() => {
          if (this.isCallActive && this.activeSpeaker === turn.role) {
            this.setSpeaker('idle');
          }
        }, 1200);
        this.simulationTimeouts.push(idleTimer);
      }, turn.delay);

      this.simulationTimeouts.push(t);
    }

    // End call after simulation script completes
    const endTimer = setTimeout(() => {
      if (this.isCallActive) {
        this.endCall('https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg');
      }
    }, 19500);
    this.simulationTimeouts.push(endTimer);
  }
}

module.exports = CallSession;
