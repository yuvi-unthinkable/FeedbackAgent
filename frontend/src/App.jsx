import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Radio,
  FileCheck2,
  Sparkles,
  PhoneCall,
  History,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';
import { useCallSocket } from './hooks/useCallSocket';
import { PatientQueue } from './components/PatientQueue';
import { CustomAgentStudio } from './components/CustomAgentStudio';
import { LiveCallMonitor } from './components/LiveCallMonitor';
import { ConsultationReportModal } from './components/ConsultationReportModal';
import { API_BASE } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' | 'custom'
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [historyModalPatient, setHistoryModalPatient] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const {
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
    dismissGuardrailAlert,
    startCall,
    startWebVoiceCall,
    terminateCall,
    clearCallState,
    setLatestReport
  } = useCallSocket();

  // Load patients on mount
  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch(`${API_BASE}/api/patients`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    }
    fetchPatients();
  }, []);

  // View past reports for a patient
  const handleViewHistory = async (patient) => {
    setHistoryModalPatient(patient);
    setLoadingReports(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/${patient.id}`);
      if (res.ok) {
        const data = await res.json();
        setPatientReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                MedVoice AI
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                VAPI ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time Speech-to-Speech Medical Consultation & Doctor Dashboard
            </p>
          </div>
        </div>

        {/* Right Header Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Socket Connection Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {socketConnected ? 'Telemetry Live' : 'Reconnecting...'}
            </span>
          </div>

          {/* Architecture Badges */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800">
              Twilio 8kHz μ-Law
            </span>
            <span className="text-slate-600">⇄</span>
            <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-cyan-300">
              Gemini Live 16/24kHz PCM
            </span>
            <span className="text-slate-600">⇄</span>
            <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-emerald-300">
              Groq/Llama-3.3
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Patient Consultation Queue or Custom Agent Studio (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col h-[calc(100vh-120px)] glass-panel rounded-2xl p-4 shadow-xl">
          {/* Option Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800 mb-3.5 shrink-0">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                activeTab === 'clinical'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
              id="tab-clinical-queue"
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clinical Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                activeTab === 'custom'
                  ? 'bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-cyan-300 shadow-md border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
              id="tab-custom-studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Agent & Booking</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'clinical' ? (
              loadingPatients ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading clinical consultation queue...
                </div>
              ) : (
                <PatientQueue
                  patients={patients}
                  activePatient={activePatient}
                  callStatus={callStatus}
                  onStartCall={startCall}
                  onStartWebVoiceCall={startWebVoiceCall}
                  onViewHistory={handleViewHistory}
                />
              )
            ) : (
              <CustomAgentStudio
                callStatus={callStatus}
                onStartCall={startCall}
                onStartWebVoiceCall={startWebVoiceCall}
              />
            )}
          </div>
        </section>

        {/* Right Column: Live Call Monitor (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col h-[calc(100vh-120px)]">
          <LiveCallMonitor
            callStatus={callStatus}
            activePatient={activePatient}
            activeCallId={activeCallId}
            activeSpeaker={activeSpeaker}
            liveTranscript={liveTranscript}
            bargeInCount={bargeInCount}
            isBargeInActive={isBargeInActive}
            activeGuardrailAlert={activeGuardrailAlert}
            onDismissGuardrail={dismissGuardrailAlert}
            onTerminateCall={terminateCall}
          />
        </section>
      </main>

      {/* Completed Consultation Report Modal */}
      {latestReport && (
        <ConsultationReportModal
          report={latestReport}
          onClose={() => {
            setLatestReport(null);
            clearCallState();
          }}
        />
      )}

      {/* Patient History Modal */}
      {historyModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  Past Consultations — {historyModalPatient.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Historical consultation reports, Q&A findings, and call recordings
                </p>
              </div>
              <button
                onClick={() => setHistoryModalPatient(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
              {loadingReports ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading past records...</div>
              ) : patientReports.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No past consultation reports found for this patient. Click "Simulate Call" or "Call" to conduct the first consultation.
                </div>
              ) : (
                patientReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                    onClick={() => {
                      setHistoryModalPatient(null);
                      setLatestReport(rep);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          rep.urgencyLevel === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : rep.urgencyLevel === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {rep.urgencyLevel || 'LOW'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-2 line-clamp-2">
                      {rep.clinicalSummary}
                    </p>
                    <div className="mt-2 text-[11px] text-cyan-400 font-medium">
                      Click to inspect full clinical report & audio &rarr;
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
