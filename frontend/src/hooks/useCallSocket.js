/**
 * useCallSocket.js
 * React hook replicating @vapi-ai/web client event listener patterns
 * Connects to ws://localhost:4000/dashboard-events and provides:
 * 1. Twilio Telephonic Call state synchronization
 * 2. Simulated Call execution
 * 3. Direct Browser Web Voice Calling (Microphone & Speaker speech-to-speech with instant barge-in)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE, getWsUrl } from '../config';

export function useCallSocket() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'connecting' | 'active' | 'ended'
  const [activeCallId, setActiveCallId] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState('idle'); // 'idle' | 'assistant' | 'user'
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [bargeInCount, setBargeInCount] = useState(0);
  const [isBargeInActive, setIsBargeInActive] = useState(false);
  const [isWebCall, setIsWebCall] = useState(false);
  const [activeGuardrailAlert, setActiveGuardrailAlert] = useState(null);

  const socketRef = useRef(null);
  const bargeInTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const isWebCallRef = useRef(false);
  const transcriptRef = useRef([]);

  // Keep transcriptRef in sync with state
  useEffect(() => {
    transcriptRef.current = liveTranscript;
  }, [liveTranscript]);

  // Connect to WebSocket
  useEffect(() => {
    const wsUrl = getWsUrl();

    let reconnectTimer;
    let ws;

    function connect() {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[useCallSocket] Connected to Dashboard WebSocket');
        setSocketConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerEvent(data);
        } catch (err) {
          console.error('[useCallSocket] Error parsing WS event:', err);
        }
      };

      ws.onclose = () => {
        console.log('[useCallSocket] Dashboard WebSocket disconnected, retrying in 2s...');
        setSocketConnected(false);
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.warn('[useCallSocket] WebSocket error:', err);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const triggerBargeInTelemetry = useCallback(() => {
    setBargeInCount(count => count + 1);
    setIsBargeInActive(true);
    setActiveSpeaker('user');

    if (bargeInTimeoutRef.current) {
      clearTimeout(bargeInTimeoutRef.current);
    }
    bargeInTimeoutRef.current = setTimeout(() => {
      setIsBargeInActive(false);
    }, 2500);
  }, []);

  const handleServerEvent = useCallback((event) => {
    // If a Web Voice Call is actively handling speech locally, ignore duplicate telephonic broadcast events
    if (isWebCallRef.current && (event.type === 'speech-update' || event.type === 'transcript')) {
      return;
    }

    switch (event.type) {
      case 'call-start':
        setCallStatus('active');
        setActiveCallId(event.callId);
        setActiveSpeaker('idle');
        setLiveTranscript([]);
        setLatestReport(null);
        setBargeInCount(0);
        setIsBargeInActive(false);
        setActiveGuardrailAlert(null);
        break;

      case 'speech-update':
        if (event.status === 'started') {
          setActiveSpeaker(event.role);
        } else if (event.status === 'stopped') {
          setActiveSpeaker(prev => (prev === event.role ? 'idle' : prev));
        }
        break;

      case 'transcript':
        setLiveTranscript(prev => [
          ...prev,
          {
            role: event.role,
            text: event.transcript || event.text,
            timestamp: event.timestamp || Date.now()
          }
        ]);
        break;

      case 'user-interrupted':
        triggerBargeInTelemetry();
        break;

      case 'call-end':
        setCallStatus('ended');
        setActiveSpeaker('idle');
        break;

      case 'end-of-call-report':
        setLatestReport(event.report);
        setCallStatus('ended');
        break;

      case 'guardrail-alert':
        setActiveGuardrailAlert({
          guardrailType: event.guardrailType,
          severity: event.severity,
          category: event.category,
          message: event.message,
          actionTaken: event.actionTaken,
          userSpeech: event.userSpeech,
          timestamp: event.timestamp || Date.now()
        });
        break;

      default:
        break;
    }
  }, [triggerBargeInTelemetry]);

  // Speak assistant text using browser speech synthesis
  const speakAssistantText = useCallback((text, onEnd) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setActiveSpeaker('assistant');
    };

    utterance.onend = () => {
      setActiveSpeaker('idle');
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setActiveSpeaker('idle');
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Initiate a Direct Web Voice Call (Browser Mic & Speakers)
  const startWebVoiceCall = useCallback((patient) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support the Web Speech Recognition API. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    setIsWebCall(true);
    isWebCallRef.current = true;
    setCallStatus('active');
    setActiveCallId(`web_${Date.now()}`);
    setActivePatient(patient);
    setLiveTranscript([]);
    setLatestReport(null);
    setBargeInCount(0);
    setIsBargeInActive(false);

    // Initial assistant greeting
    const firstGreeting = patient.initialGreeting || (patient.isCustomCall
      ? `Hello ${patient.name}, this is ${patient.agentName || 'Alex'}. I'm following up on your request—what was the primary reason for your call today, and how can I help you?`
      : `Hello ${patient.name}, this is Dr. AI calling from your care team for your scheduled health check-in. ${patient.requiredQuestions?.[0] || 'How are you feeling today?'}`);

    const greetingEntry = {
      role: 'assistant',
      text: firstGreeting,
      timestamp: Date.now()
    };
    setLiveTranscript([greetingEntry]);

    // Setup speech recognition for user's microphone
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;

    recognition.onspeechstart = () => {
      // Instant Barge-In detection! If assistant is speaking when user starts talking, abort immediately!
      if (window.speechSynthesis.speaking) {
        console.log('[WebVoiceCall] Barge-in! Aborting assistant speech...');
        window.speechSynthesis.cancel();
        triggerBargeInTelemetry();
      } else {
        setActiveSpeaker('user');
      }
    };

    recognition.onresult = async (event) => {
      const lastResultIndex = event.results.length - 1;
      const userText = event.results[lastResultIndex][0]?.transcript?.trim();

      if (!userText || !isWebCallRef.current) return;

      console.log('[WebVoiceCall] User said:', userText);

      // Record user turn
      const userEntry = {
        role: 'user',
        text: userText,
        timestamp: Date.now()
      };

      setLiveTranscript(prev => [...prev, userEntry]);
      setActiveSpeaker('idle');

      // Request conversational reply from Maya via backend
      try {
        const historySnapshot = [...transcriptRef.current, userEntry];
        const res = await fetch(`${API_BASE}/api/calls/voice-turn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            history: historySnapshot,
            userMessage: userText,
            customPrompt: patient.customPrompt,
            personName: patient.name,
            agentName: patient.agentName,
            isCustomCall: patient.isCustomCall
          })
        });

        if (res.ok) {
          const data = await res.json();
          const assistantReply = data.replyText;

          if (assistantReply && isWebCallRef.current) {
            const assistantEntry = {
              role: 'assistant',
              text: assistantReply,
              timestamp: Date.now()
            };
            setLiveTranscript(prev => [...prev, assistantEntry]);

            // Speak assistant response out loud
            speakAssistantText(assistantReply);
          }
        }
      } catch (err) {
        console.error('[WebVoiceCall] Error getting voice turn:', err);
      }
    };

    recognition.onerror = (e) => {
      console.warn('[WebVoiceCall] Recognition error:', e.error);
      if (e.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
      }
    };

    recognition.onend = () => {
      // Keep recognition listening while call is active
      if (isWebCallRef.current && callStatus === 'active') {
        try {
          recognition.start();
        } catch (_) {}
      }
    };

    // Speak first greeting out loud, then start listening
    speakAssistantText(firstGreeting, () => {
      try {
        recognition.start();
      } catch (_) {}
    });
  }, [speakAssistantText, triggerBargeInTelemetry, callStatus]);

  // Initiate an outbound consultation call (Twilio or Simulation)
  const startCall = useCallback(async (patient, simulate = false, customPhone = null) => {
    setIsWebCall(false);
    isWebCallRef.current = false;
    setCallStatus('connecting');
    const effectivePatient = {
      ...patient,
      phone: customPhone || patient.phone
    };
    setActivePatient(effectivePatient);
    setLiveTranscript([]);
    setLatestReport(null);
    setBargeInCount(0);

    try {
      const res = await fetch(`${API_BASE}/api/calls/outbound?simulate=${simulate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          simulate,
          customPhone,
          isCustomCall: patient.isCustomCall,
          customPrompt: patient.customPrompt,
          personName: patient.name,
          agentName: patient.agentName,
          callObjective: patient.consultationReason
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start call');
      }

      const data = await res.json();
      setActiveCallId(data.sessionId);
    } catch (err) {
      console.error('[useCallSocket] Failed to start call:', err);
      setCallStatus('idle');
      alert(`Could not start consultation call: ${err.message}`);
    }
  }, []);

  // Terminate call (Web Call or Telephonic Call)
  const terminateCall = useCallback(async () => {
    if (isWebCallRef.current) {
      isWebCallRef.current = false;
      setIsWebCall(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        recognitionRef.current = null;
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setCallStatus('ended');
      setActiveSpeaker('idle');

      // Request post-call clinical report from backend
      try {
        const res = await fetch(`${API_BASE}/api/calls/end-web-call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: activePatient?.id,
            transcript: transcriptRef.current,
            customPrompt: activePatient?.customPrompt,
            personName: activePatient?.name,
            agentName: activePatient?.agentName,
            isCustomCall: activePatient?.isCustomCall
          })
        });

        if (res.ok) {
          const data = await res.json();
          setLatestReport(data.report);
        }
      } catch (err) {
        console.error('[useCallSocket] Error generating web call report:', err);
      }
      return;
    }

    try {
      await fetch(`${API_BASE}/api/calls/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeCallId })
      });
      setCallStatus('ended');
      setActiveSpeaker('idle');
    } catch (err) {
      console.error('[useCallSocket] Error terminating call:', err);
    }
  }, [activeCallId, activePatient]);

  const clearCallState = useCallback(() => {
    setCallStatus('idle');
    setActiveCallId(null);
    setActivePatient(null);
    setActiveSpeaker('idle');
    setLiveTranscript([]);
    setLatestReport(null);
    setBargeInCount(0);
    setIsBargeInActive(false);
    setIsWebCall(false);
    isWebCallRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    socketConnected,
    callStatus,
    activeCallId,
    activePatient,
    activeSpeaker,
    liveTranscript,
    latestReport,
    bargeInCount,
    isBargeInActive,
    isWebCall,
    activeGuardrailAlert,
    dismissGuardrailAlert: () => setActiveGuardrailAlert(null),
    startCall,
    startWebVoiceCall,
    terminateCall,
    clearCallState,
    setLatestReport
  };
}
