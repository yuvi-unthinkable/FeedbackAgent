import React, { useState, useMemo } from 'react';
import {
  Phone,
  Play,
  User,
  Activity,
  FileText,
  AlertCircle,
  Edit3,
  Check,
  Mic,
  Search,
  ChevronDown,
  ChevronUp,
  Pill,
  MapPin,
  Clock,
  Heart,
  ShieldAlert,
  AlertTriangle,
  X
} from 'lucide-react';

export function PatientQueue({
  patients,
  activePatient,
  callStatus,
  onStartCall,
  onStartWebVoiceCall,
  onViewHistory
}) {
  const [customPhones, setCustomPhones] = useState({});
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  const isCallBusy = callStatus === 'active' || callStatus === 'connecting';

  const handlePhoneChange = (patientId, val) => {
    setCustomPhones(prev => ({ ...prev, [patientId]: val }));
  };

  const categories = [
    { id: 'ALL', label: 'All Patients' },
    { id: 'CARDIAC', label: 'Cardiology' },
    { id: 'DIABETES', label: 'Diabetes & Endo' },
    { id: 'RESPIRATORY', label: 'Respiratory' },
    { id: 'POST_OP', label: 'Post-Surgical' },
    { id: 'RECOVERY', label: 'Recovery & Fatigue' }
  ];

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Category filter
      if (activeCategory !== 'ALL') {
        const cond = (patient.current_health_condition || patient.consultationReason || '').toLowerCase();
        if (activeCategory === 'CARDIAC' && !cond.includes('heart') && !cond.includes('hypertension') && !cond.includes('stent') && !cond.includes('cardio') && !cond.includes('fibrillation')) return false;
        if (activeCategory === 'DIABETES' && !cond.includes('diabet') && !cond.includes('thyroid') && !cond.includes('hypogonad')) return false;
        if (activeCategory === 'RESPIRATORY' && !cond.includes('asthma') && !cond.includes('copd') && !cond.includes('pulmon')) return false;
        if (activeCategory === 'POST_OP' && !cond.includes('post-op') && !cond.includes('arthroscopic') && !cond.includes('cholecystectomy')) return false;
        if (activeCategory === 'RECOVERY' && !cond.includes('fatigue') && !cond.includes('rehab') && !cond.includes('recovery')) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (patient.name || '').toLowerCase();
      const condition = (patient.current_health_condition || patient.consultationReason || '').toLowerCase();
      const phone = (patient.phone || patient.mob_no || '').toLowerCase();
      const city = (patient.address || '').toLowerCase();
      const meds = Array.isArray(patient.current_medication)
        ? patient.current_medication.map(m => (typeof m === 'string' ? m : m.name || '')).join(' ').toLowerCase()
        : '';

      return name.includes(q) || condition.includes(q) || phone.includes(q) || city.includes(q) || meds.includes(q);
    });
  }, [patients, searchQuery, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Patient Consultation Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              50 Patient Profiles synced with Supabase DB. Click any patient to inspect or place calls with Maya.
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shrink-0">
            {filteredPatients.length} / {patients.length} Loaded
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 50 patients by name, diagnosis, medication, or city..."
            className="w-full text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-950/50'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 p-6">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-semibold">No patients match your search criteria</p>
            <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or choosing another category filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
              className="mt-3 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isSelected = activePatient?.id === patient.id;
            const currentPhone = customPhones[patient.id] ?? (patient.phone || patient.mob_no);
            const isEditing = editingPhoneId === patient.id;
            const isExpanded = expandedPatientId === patient.id;

            const conditionText = patient.current_health_condition || patient.consultationReason || 'Routine Checkup';
            const medications = patient.current_medication || patient.currentMedication || [];
            const historyList = patient.previous_medical_history || patient.previousMedicalHistory || [];
            const allergies = patient.allergies || [];
            const feedbackGiven = patient.feedback_given_last_time || patient.feedbackGivenLastTime;

            return (
              <div
                key={patient.id}
                className={`p-3.5 rounded-xl transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Name, Age, Gender, Blood Group, Phone */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-slate-100 text-sm">{patient.name}</h3>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {patient.age}y
                      </span>
                      {patient.gender && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                          {patient.gender}
                        </span>
                      )}
                      {patient.blood_group && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 font-mono">
                          {patient.blood_group}
                        </span>
                      )}

                      {/* Phone Number Display / Edit */}
                      {!isEditing ? (
                        <button
                          onClick={() => setEditingPhoneId(patient.id)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono bg-cyan-950/50 hover:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900/60 flex items-center gap-1 transition"
                          title="Click to edit destination phone number for testing"
                        >
                          <span>{currentPhone}</span>
                          <Edit3 className="w-3 h-3 opacity-70" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={currentPhone}
                            onChange={(e) => handlePhoneChange(patient.id, e.target.value)}
                            placeholder="+919140511451"
                            className="text-[11px] font-mono bg-slate-950 border border-cyan-500 rounded px-2 py-0.5 text-white focus:outline-none w-32"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingPhoneId(null)}
                            className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-500 text-[10px]"
                            title="Save phone number"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Condition badge */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{conditionText}</span>
                    </div>

                    {/* Quick address display */}
                    {patient.address && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onViewHistory(patient)}
                      className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-md transition flex items-center gap-1"
                      title="View past consultation reports"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                      onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
                      className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/70 rounded-md transition"
                      title={isExpanded ? "Collapse clinical details" : "Expand clinical details"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs animate-fadeIn">
                    {/* Previous Feedback Given */}
                    {feedbackGiven && (
                      <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40">
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Feedback Given Last Consultation
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {feedbackGiven}
                        </p>
                      </div>
                    )}

                    {/* Active Medications List */}
                    {medications.length > 0 && (
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          Current Medication ({medications.length})
                        </div>
                        <div className="space-y-1">
                          {medications.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                              <span className="font-semibold text-slate-200">
                                {typeof med === 'string' ? med : med.name}
                              </span>
                              {typeof med === 'object' && med.frequency && (
                                <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                                  {med.dosage ? `${med.dosage} · ` : ''}{med.frequency}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previous Medical History & Allergies */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {historyList.length > 0 && (
                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                            Medical History:
                          </span>
                          <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                            {historyList.map((h, i) => (
                              <li key={i} className="truncate">{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {allergies.length > 0 && (
                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                          <span className="font-bold text-[10px] text-rose-400 uppercase tracking-wider block mb-1">
                            Allergies:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {allergies.map((a, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40 text-[10px]">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    {patient.emergency_contact && patient.emergency_contact.name && (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/40 px-2 py-1 rounded">
                        <span>Emergency: <strong className="text-slate-200">{patient.emergency_contact.name}</strong> ({patient.emergency_contact.relation || 'Contact'})</span>
                        <span className="font-mono text-cyan-400">{patient.emergency_contact.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/60">
                  {/* Talk to Maya (Web Mic & Speakers) */}
                  <button
                    disabled={isCallBusy}
                    onClick={() => onStartWebVoiceCall(patient)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition shadow-lg ${
                      isCallBusy
                        ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/40 border border-emerald-400/40 active:scale-98'
                    }`}
                    id={`btn-web-mic-${patient.id}`}
                  >
                    <Mic className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Talk to Maya (Browser Mic & Speakers)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isCallBusy}
                      onClick={() => onStartCall(patient, true, currentPhone)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isCallBusy
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 active:scale-98'
                      }`}
                      id={`btn-simulate-${patient.id}`}
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                      <span>Simulate Dialogue</span>
                    </button>

                    <button
                      disabled={isCallBusy}
                      onClick={() => onStartCall(patient, false, currentPhone)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isCallBusy
                          ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white active:scale-98'
                      }`}
                      id={`btn-twilio-${patient.id}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Twilio Call</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
