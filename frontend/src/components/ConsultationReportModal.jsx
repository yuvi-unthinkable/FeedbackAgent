import React from 'react';
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  Calendar,
  User,
  Activity,
  HeartPulse,
  Download
} from 'lucide-react';

export function ConsultationReportModal({ report, onClose }) {
  if (!report) return null;

  const urgency = report.urgencyLevel?.toUpperCase() || 'LOW';

  const urgencyBadgeConfig = {
    HIGH: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-500/50',
      icon: AlertTriangle,
      label: 'HIGH PRIORITY — IMMEDIATE CLINICAL ACTION'
    },
    MEDIUM: {
      bg: 'bg-amber-950/80',
      text: 'text-amber-300',
      border: 'border-amber-500/50',
      icon: AlertCircle,
      label: 'MEDIUM RISK — CARE TEAM REVIEW'
    },
    LOW: {
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-300',
      border: 'border-emerald-500/50',
      icon: CheckCircle2,
      label: 'LOW RISK — ROUTINE MONITORING'
    }
  };

  const currentBadge = urgencyBadgeConfig[urgency] || urgencyBadgeConfig.LOW;
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Clinical Consultation Report
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {report.patientName || 'Patient Consultation'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Report ID: {report.id} • {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            id="btn-close-report-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Urgency Level Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${currentBadge.bg} ${currentBadge.border}`}>
            <div className="flex items-center gap-2.5">
              <BadgeIcon className={`w-5 h-5 ${currentBadge.text}`} />
              <div>
                <div className={`text-xs font-bold tracking-wider ${currentBadge.text}`}>
                  {currentBadge.label}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {report.followUpRequired
                    ? 'Follow-up consultation or triage notification required within 24 hours.'
                    : 'No acute emergency criteria triggered. Continue scheduled ambulatory plan.'}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md border ${currentBadge.border} ${currentBadge.text}`}>
              {urgency}
            </span>
          </div>

          {/* Clinical Guardrail Safety Incidents */}
          {report.guardrailAlerts && report.guardrailAlerts.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 space-y-3 shadow-lg shadow-rose-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Clinical Guardrail Incidents ({report.guardrailAlerts.length})
                    </h4>
                    <p className="text-[11px] text-rose-300">
                      Medical safety protocols triggered during consultation
                    </p>
                  </div>
                </div>
                {report.requiresEscalation && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">
                    DOCTOR ESCALATION REQUIRED
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {report.guardrailAlerts.map((alert, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-rose-900/40 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        {alert.category || alert.guardrailType}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                        {alert.severity || 'ALERT'}
                      </span>
                    </div>
                    <p className="text-slate-200 mt-1">{alert.message || alert.alertMessage}</p>
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                      <span>Action: <strong className="text-cyan-400">{alert.actionTaken || 'Safety Override'}</strong></span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'During Call'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Booking Details Card */}
          {report.appointmentBooked && report.appointmentBooked.isBooked && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 shadow-lg shadow-cyan-950/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Appointment Scheduled & Confirmed
                    </h4>
                    <p className="text-[11px] text-cyan-300">
                      Automated appointment extraction from conversation
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500 text-slate-950 uppercase">
                  {report.appointmentBooked.status || 'CONFIRMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Doctor / Department</div>
                  <div className="text-slate-100 font-bold mt-0.5">
                    {report.appointmentBooked.doctorOrDepartment || 'Specialty Care'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Date & Time</div>
                  <div className="text-cyan-300 font-bold font-mono mt-0.5">
                    {report.appointmentBooked.dateTime || 'Upcoming Slot'}
                  </div>
                </div>
              </div>

              {report.appointmentBooked.notes && (
                <div className="mt-2.5 text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                  <span className="font-semibold text-slate-400">Notes & Instructions: </span>
                  {report.appointmentBooked.notes}
                </div>
              )}
            </div>
          )}

          {/* Clinical Summary Narrative */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Clinical Summary
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200 leading-relaxed text-xs">
              {report.clinicalSummary}
            </div>
          </div>

          {/* Symptoms Reported */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Symptoms Identified ({report.symptomsReported?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.symptomsReported?.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Structured Q&A Mapping Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Structured Question & Answer Mapping
            </h3>
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5 w-1/2">Required Consultation Question</th>
                    <th className="py-2.5 px-3.5 w-1/2">Patient Answer & Extracted Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(report.questionResponses || []).map((qa, index) => (
                    <tr key={index} className="hover:bg-slate-850/30 transition">
                      <td className="py-2.5 px-3.5 text-slate-300 font-medium align-top">
                        {qa.question}
                      </td>
                      <td className="py-2.5 px-3.5 text-cyan-200 align-top">
                        {qa.patientAnswer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidance Delivered */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Approved Guidance Delivered to Patient
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(report.guidanceDelivered || []).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Audio Recording Player */}
          {report.recordingUrl && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Dual-Channel Call Audio Recording
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Twilio Audio Recording</span>
              </div>
              <audio
                controls
                className="w-full h-9 rounded-lg"
                src={report.recordingUrl}
                preload="metadata"
                id="audio-call-recording"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            HIPAA Compliant Simulated Record
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95 shadow-md shadow-cyan-950/40"
          >
            Close Consultation Report
          </button>
        </div>
      </div>
    </div>
  );
}
