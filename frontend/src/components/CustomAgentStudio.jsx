import React, { useState } from 'react';
import {
  Sparkles,
  Phone,
  Play,
  Mic,
  User,
  Bot,
  Calendar,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  Zap,
  RotateCcw
} from 'lucide-react';

const PRESETS = [
  {
    id: 'appointment_inquiry',
    title: '📅 Appointment & Inquiry',
    description: 'Ask why caller reached out, answer clinic/doctor questions, and book an appointment',
    agentName: 'Maya — Clinic Receptionist',
    defaultPrompt: (name) =>
      `You are Maya, the friendly clinic receptionist and appointment coordinator calling ${name}. Greet them warmly, ask what the primary reason for their call or visit is today, answer any questions they have regarding doctor availability, clinic timings (Mon-Sat 8AM-8PM), or services, and assist them with booking an appointment by confirming the preferred doctor, date, and time.`
  },
  {
    id: 'general_faq',
    title: '❓ Clinic Services & FAQ',
    description: 'Answer questions on insurance, timings, fees, and doctor specialties',
    agentName: 'Jordan — Patient Concierge',
    defaultPrompt: (name) =>
      `You are Jordan, the patient concierge calling ${name}. Greet them, ask what questions they have about our medical center, answer queries regarding insurance accepted, consultation charges, and clinic hours, and offer to schedule an appointment if requested.`
  },
  {
    id: 'post_visit',
    title: '🩺 Post-Visit Care & Check-in',
    description: 'Check how patient is feeling, review medication, and book follow-up if needed',
    agentName: 'Nurse Taylor — Care Coordinator',
    defaultPrompt: (name) =>
      `You are Nurse Taylor calling ${name} for a post-visit health check-in. Ask how they are feeling today, whether they have experienced any side effects or worsening symptoms, remind them about their medication instructions, and schedule a follow-up appointment if they need a doctor review.`
  },
  {
    id: 'blank',
    title: '✍️ Custom Prompt',
    description: 'Create your own prompt and custom instructions for any scenario',
    agentName: 'AI Voice Assistant',
    defaultPrompt: (name) =>
      `You are a professional voice agent on a live call with ${name}. Ask why they called, answer their questions clearly and concisely (1-2 sentences at a time), and assist them with their request.`
  }
];

export function CustomAgentStudio({
  callStatus,
  onStartCall,
  onStartWebVoiceCall
}) {
  const [personName, setPersonName] = useState('John Doe');
  const [phoneNumber, setPhoneNumber] = useState('+919140511451');
  const [agentName, setAgentName] = useState('Maya — Clinic Coordinator');
  const [selectedPreset, setSelectedPreset] = useState('appointment_inquiry');
  const [customPrompt, setCustomPrompt] = useState(
    PRESETS[0].defaultPrompt('John Doe')
  );

  const isCallBusy = callStatus === 'active' || callStatus === 'connecting';

  // Apply a preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setAgentName(preset.agentName);
    setCustomPrompt(preset.defaultPrompt(personName || 'Valued Caller'));
  };

  // Update prompt when name changes
  const handleNameChange = (newName) => {
    setPersonName(newName);
  };

  // Build the unified patient/call configuration object
  const buildCallPayload = () => {
    const effectiveName = personName.trim() || 'Valued Caller';
    const effectiveAgent = agentName.trim() || 'Maya';

    return {
      id: `custom_${Date.now()}`,
      name: effectiveName,
      age: 38,
      phone: phoneNumber.trim() || '+919140511451',
      isCustomCall: true,
      agentName: effectiveAgent,
      customPrompt: customPrompt.trim(),
      initialGreeting: `Hello ${effectiveName}, this is ${effectiveAgent}. I'm following up on your request—what was the primary reason for your call today, and how can I assist you with booking an appointment or answering questions?`,
      consultationReason: 'Inquiry Resolution & Appointment Booking',
      consultationContext: customPrompt.trim(),
      requiredQuestions: [
        'What was the primary reason for your call today?',
        'Would you like to schedule an appointment with one of our doctors?',
        'What date and time works best for you?'
      ],
      approvedGuidance: [
        'Clinic hours are Monday to Saturday, 8:00 AM to 8:00 PM.',
        'Appointment booking confirmed. Please arrive 10 minutes early with ID and previous medical records.'
      ]
    };
  };

  const handleStartWebVoice = () => {
    const payload = buildCallPayload();
    onStartWebVoiceCall(payload);
  };

  const handleStartSimulate = () => {
    const payload = buildCallPayload();
    onStartCall(payload, true, payload.phone);
  };

  const handleStartTwilio = () => {
    const payload = buildCallPayload();
    onStartCall(payload, false, payload.phone);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      {/* Header Banner */}
      <div className="pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-cyan-500 text-white shadow-md shadow-cyan-950/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Custom Prompt & Appointment Studio
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80">
            PROMPT DRIVEN
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Provide your custom instructions. The AI agent will call the person, ask why they called, answer queries, and book appointments.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Preset Selector Chips */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider flex items-center justify-between">
            <span>Quick Scenario Presets</span>
            <span className="text-[10px] text-cyan-400 font-normal">Click to load</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{preset.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact & Persona Details */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-cyan-400" />
              Person to Call
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500 transition font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+919140511451"
              className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Bot className="w-3 h-3 text-amber-400" />
              Agent Name & Persona
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Maya — Clinic Appointment Coordinator"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500 transition font-medium"
            />
          </div>
        </div>

        {/* Custom Prompt & Instructions Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Agent Prompt & Instructions
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              {customPrompt.length} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={5}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Give the agent instructions on what to ask, what information to collect, and how to book appointments..."
              className="w-full text-xs bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans leading-relaxed resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Live Initial Greeting Preview */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Agent Opening Line Preview
          </div>
          <p className="text-slate-300 italic text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
            "Hello <strong className="text-white">{personName || 'Valued Caller'}</strong>, this is <strong className="text-cyan-300">{agentName || 'Maya'}</strong>. I'm following up on your request—what was the primary reason for your call today, and how can I assist you with booking an appointment or answering questions?"
          </p>
        </div>

        {/* Technical Capabilities Badges */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">&lt;50ms Barge-In</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Auto Slot Book</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">LLM Summary</span>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          {/* Primary Action: Talk via Browser Microphone & Speakers */}
          <button
            disabled={isCallBusy}
            onClick={handleStartWebVoice}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
              isCallBusy
                ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/40 border border-emerald-400/40 active:scale-98'
            }`}
            id="btn-custom-web-mic"
          >
            <Mic className="w-4 h-4 fill-current text-white" />
            <span>Talk to Agent (Browser Mic & Speakers)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={isCallBusy}
              onClick={handleStartSimulate}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isCallBusy
                  ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 active:scale-98'
              }`}
              id="btn-custom-simulate"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span>Simulate Conversation</span>
            </button>

            <button
              disabled={isCallBusy}
              onClick={handleStartTwilio}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                isCallBusy
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white active:scale-98'
              }`}
              id="btn-custom-twilio"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Twilio Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
