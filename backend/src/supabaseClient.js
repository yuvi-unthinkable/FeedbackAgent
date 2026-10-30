/**
 * supabaseClient.js
 * Database client for patients and consultation call reports.
 * Connects to remote Supabase PostgreSQL database using @supabase/supabase-js
 * with resilient in-memory caching and automatic offline fallback.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { PATIENTS_50 } = require('./mockPatients');
const SEED_PATIENTS = PATIENTS_50;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log(`[supabaseClient] Initialized Supabase client for: ${supabaseUrl}`);
  } catch (err) {
    console.warn('[supabaseClient] Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('[supabaseClient] Supabase credentials not found. Using local in-memory storage.');
}

class StorageManager {
  constructor() {
    this.patients = new Map();
    this.callReports = new Map();

    // Seed mock patients in local cache
    for (const pat of SEED_PATIENTS) {
      this.patients.set(pat.id, pat);
    }
  }

  async getPatients() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('id', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            name: row.name,
            age: row.age,
            gender: row.gender,
            phone: row.phone || row.mob_no,
            mob_no: row.mob_no || row.phone,
            address: row.address,
            bloodGroup: row.blood_group,
            currentHealthCondition: row.current_health_condition || row.consultation_reason,
            feedbackGivenLastTime: row.feedback_given_last_time,
            currentMedication: row.current_medication || [],
            previousMedicalHistory: row.previous_medical_history || [],
            allergies: row.allergies || [],
            emergencyContact: row.emergency_contact || {},
            lastVisitDate: row.last_visit_date,
            consultationReason: row.consultation_reason || row.current_health_condition,
            consultationContext: row.consultation_context,
            requiredQuestions: row.required_questions || [],
            approvedGuidance: row.approved_guidance || []
          }));
        }
      } catch (err) {
        // Fall back to local cache
      }
    }
    return Array.from(this.patients.values());
  }

  async getPatientById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            age: data.age,
            gender: data.gender,
            phone: data.phone || data.mob_no,
            mob_no: data.mob_no || data.phone,
            address: data.address,
            bloodGroup: data.blood_group,
            currentHealthCondition: data.current_health_condition || data.consultation_reason,
            feedbackGivenLastTime: data.feedback_given_last_time,
            currentMedication: data.current_medication || [],
            previousMedicalHistory: data.previous_medical_history || [],
            allergies: data.allergies || [],
            emergencyContact: data.emergency_contact || {},
            lastVisitDate: data.last_visit_date,
            consultationReason: data.consultation_reason || data.current_health_condition,
            consultationContext: data.consultation_context,
            requiredQuestions: data.required_questions || [],
            approvedGuidance: data.approved_guidance || []
          };
        }
      } catch (err) {
        // Fall back to local cache
      }
    }
    return this.patients.get(id) || null;
  }

  async saveCallReport(reportData) {
    const reportId = reportData.id || `rep_${Date.now()}`;
    const record = {
      id: reportId,
      patientId: reportData.patientId,
      patientName: reportData.patientName,
      callSid: reportData.callSid || null,
      recordingUrl: reportData.recordingUrl || null,
      clinicalSummary: reportData.clinicalSummary || '',
      urgencyLevel: reportData.urgencyLevel || 'LOW',
      symptomsReported: reportData.symptomsReported || [],
      questionResponses: reportData.questionResponses || [],
      guidanceDelivered: reportData.guidanceDelivered || [],
      followUpRequired: reportData.followUpRequired ?? false,
      appointmentBooked: reportData.appointmentBooked || null,
      guardrailAlerts: reportData.guardrailAlerts || [],
      transcript: reportData.transcript || [],
      createdAt: reportData.createdAt || new Date().toISOString()
    };

    // 1. Always store in local memory for high reliability & zero downtime
    this.callReports.set(reportId, record);

    // 2. Persist to remote Supabase Database
    if (supabase) {
      try {
        const row = {
          id: record.id,
          patient_id: record.patientId,
          patient_name: record.patientName,
          call_sid: record.callSid,
          recording_url: record.recordingUrl,
          clinical_summary: record.clinicalSummary,
          urgency_level: record.urgencyLevel,
          symptoms_reported: record.symptomsReported,
          question_responses: record.questionResponses,
          guidance_delivered: record.guidanceDelivered,
          follow_up_required: record.followUpRequired,
          appointment_booked: record.appointmentBooked,
          guardrail_alerts: record.guardrailAlerts,
          transcript: record.transcript,
          created_at: record.createdAt
        };

        const { data, error } = await supabase
          .from('call_reports')
          .insert([row])
          .select();

        if (error) {
          console.warn(`[supabaseClient] Remote Supabase write skipped (${error.code}): ${error.message}`);
          console.warn(`[supabaseClient] NOTE: If table is missing, run backend/supabase_schema.sql in your Supabase SQL editor.`);
        } else {
          console.log(`[supabaseClient] Successfully inserted report ${record.id} into remote Supabase call_reports table!`);
        }
      } catch (err) {
        console.warn('[supabaseClient] Network exception connecting to Supabase:', err.message);
      }
    }

    return record;
  }

  async updateRecordingUrl(callSid, recordingUrl) {
    // Update local store
    for (const [id, rep] of this.callReports.entries()) {
      if (rep.callSid === callSid) {
        rep.recordingUrl = recordingUrl;
        this.callReports.set(id, rep);
        break;
      }
    }

    // Update remote Supabase
    if (supabase) {
      try {
        await supabase
          .from('call_reports')
          .update({ recording_url: recordingUrl })
          .eq('call_sid', callSid);
      } catch (err) {
        console.warn('[supabaseClient] Could not update recording URL in Supabase:', err.message);
      }
    }

    return null;
  }

  async getReportsByPatientId(patientId) {
    // 1. Try querying remote Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('call_reports')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            patientId: row.patient_id,
            patientName: row.patient_name,
            callSid: row.call_sid,
            recordingUrl: row.recording_url,
            clinicalSummary: row.clinical_summary,
            urgencyLevel: row.urgency_level,
            symptomsReported: row.symptoms_reported || [],
            questionResponses: row.question_responses || [],
            guidanceDelivered: row.guidance_delivered || [],
            followUpRequired: row.follow_up_required ?? false,
            appointmentBooked: row.appointment_booked || null,
            guardrailAlerts: row.guardrail_alerts || [],
            transcript: row.transcript || [],
            createdAt: row.created_at
          }));
        }
      } catch (err) {
        // Fall back to local store
      }
    }

    // 2. Fall back to in-memory store
    const results = [];
    for (const rep of this.callReports.values()) {
      if (rep.patientId === patientId) {
        results.push(rep);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

const storage = new StorageManager();

module.exports = {
  supabase,
  SEED_PATIENTS,
  getPatients: () => storage.getPatients(),
  getPatientById: (id) => storage.getPatientById(id),
  saveCallReport: (data) => storage.saveCallReport(data),
  updateRecordingUrl: (callSid, url) => storage.updateRecordingUrl(callSid, url),
  getReportsByPatientId: (patientId) => storage.getReportsByPatientId(patientId)
};
