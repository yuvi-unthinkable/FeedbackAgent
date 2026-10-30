import React, { useEffect, useRef } from 'react';
import {
  Radio,
  PhoneOff,
  Bot,
  User,
  Zap,
  Volume2,
  Clock,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';

export function LiveCallMonitor({
  callStatus,
  activePatient,
  activeCallId,
  activeSpeaker,
  liveTranscript,
  bargeInCount,
  isBargeInActive,
  activeGuardrailAlert,
  onDismissGuardrail,
  onTerminateCall
}) {
  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript feed
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  const isCallActive = callStatus === 'active' || callStatus === 'connecting';

  if (!isCallActive && callStatus !== 'ended') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 rounded-2xl border border-slate-800/60">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4 text-cyan-400 border border-slate-700/50">
          <Radio className="w-8 h-8 opacity-75" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Active Consultation</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Select a patient from the queue and click <strong className="text-cyan-400">"Simulate Call"</strong> or <strong className="text-emerald-400">"Call (Twilio)"</strong> to begin real-time speech dialogue.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Live Monitor Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${isCallActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
            <div className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${isCallActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {activePatient?.name || 'Consultation Session'}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {callStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Session ID: {activeCallId || 'initiating...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Barge-In Flash Badge */}
          {isBargeInActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse shadow-lg shadow-rose-950/50">
              <Zap className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>Barge-In Detected (&lt;50ms)</span>
            </div>
          )}

          {bargeInCount > 0 && !isBargeInActive && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{bargeInCount} Interruption{bargeInCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {isCallActive && (
            <button
              onClick={onTerminateCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white transition active:scale-95 shadow-md shadow-rose-950/40"
              id="btn-terminate-call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Clinical Safety Guardrail Alert Banner */}
      {activeGuardrailAlert && (
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-3 animate-fadeIn ${
            activeGuardrailAlert.severity === 'CRITICAL'
              ? 'bg-rose-950/90 border-rose-500/70 text-rose-200'
              : activeGuardrailAlert.severity === 'HIGH'
              ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
              : 'bg-blue-950/90 border-blue-500/70 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                activeGuardrailAlert.severity === 'CRITICAL'
                  ? 'bg-rose-900/60 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-amber-900/60 border-amber-500 text-amber-300'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeGuardrailAlert.severity === 'CRITICAL'
                    ? '⚠️ EMERGENCY RED-FLAG OVERRIDE'
                    : '🛡️ MEDICAL GUARDRAIL TRIGGERED'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-black/40 border border-white/20">
                  {activeGuardrailAlert.guardrailType}
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5 opacity-90">
                {activeGuardrailAlert.message}
              </p>
            </div>
          </div>

          <button
            onClick={onDismissGuardrail}
            className="p-1.5 rounded-lg hover:bg-black/20 text-slate-300 hover:text-white transition"
            title="Acknowledge alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Speaker Pulse Visualizer */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/40 border-b border-slate-850">
        {/* Assistant Card */}
        <div
          className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
            activeSpeaker === 'assistant'
              ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${activeSpeaker === 'assistant' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {activePatient?.agentName || 'Dr. AI Assistant'}
              </div>
              <div className="text-[10px] text-cyan-400 font-medium">
                {activeSpeaker === 'assistant' ? 'Speaking...' : 'Listening'}
              </div>
            </div>
          </div>

          {activeSpeaker === 'assistant' ? (
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-1" />
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-2" />
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-3" />
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-4" />
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-5" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4 text-slate-600" />
          )}
        </div>

        {/* Patient Card */}
        <div
          className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
            activeSpeaker === 'user'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${activeSpeaker === 'user' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">{activePatient?.name || 'Patient'}</div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {activeSpeaker === 'user' ? 'Speaking...' : 'Listening'}
              </div>
            </div>
          </div>

          {activeSpeaker === 'user' ? (
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-1" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-4" />
              <span className="w-1 bg-emerald-400 rounded-full animate-wave-5" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4 text-slate-600" />
          )}
        </div>
      </div>

      {/* Auto-scrolling Live Transcript Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
        {liveTranscript.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
            Waiting for audio stream speech detection...
          </div>
        ) : (
          liveTranscript.map((turn, index) => {
            const isAssistant = turn.role === 'assistant';
            return (
              <div
                key={index}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/70 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                    isAssistant
                      ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                      : 'bg-emerald-950/70 text-emerald-100 border border-emerald-800/60 rounded-tr-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-semibold tracking-wider uppercase opacity-75">
                    <span>{isAssistant ? (activePatient?.agentName || 'Dr. AI') : (activePatient?.name || 'Patient')}</span>
                    <span className="font-mono">{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p>{turn.text}</p>
                </div>

                {!isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/70 flex items-center justify-center text-emerald-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}
