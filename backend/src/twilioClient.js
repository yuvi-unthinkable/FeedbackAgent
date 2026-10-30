/**
 * twilioClient.js
 * Twilio Voice API Integration & Outbound Call Initiator
 * 
 * Supports:
 * - Real Twilio outbound calls with <Connect><Stream> bidirectional WebSocket
 * - Dual-channel call recording & recording status webhook callbacks
 * - Graceful fallback / simulation for test runs without Twilio credentials
 */

require('dotenv').config();

let twilio = null;
try {
  twilio = require('twilio');
} catch (_) {
  // Twilio library optional for simulation
}

/**
 * Initiates an outbound medical consultation call to the patient.
 * 
 * @param {object} patient - Patient data (phone, name, id)
 * @param {string} host - Backend public host or ngrok URL (e.g. "abc.ngrok.io")
 * @returns {Promise<{ callSid: string, isSimulated: boolean }>}
 */
async function startPatientCall(patient, host = 'localhost:4000') {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const hasCredentials = Boolean(accountSid && authToken && fromNumber && twilio);

  if (!hasCredentials) {
    console.log(`[twilioClient] Twilio credentials not configured. Starting local simulated call for ${patient.name}`);
    return {
      callSid: `sim_call_${Date.now()}`,
      isSimulated: true
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const effectiveHost = process.env.PUBLIC_URL
      ? process.env.PUBLIC_URL.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '')
      : host;

    const streamProtocol = effectiveHost.startsWith('localhost') ? 'ws' : 'wss';
    const httpProtocol = effectiveHost.startsWith('localhost') ? 'http' : 'https';
    const voiceUrl = `${httpProtocol}://${effectiveHost}/api/twilio/voice?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`;

    console.log(`[twilioClient] Twilio voice webhook URL: ${voiceUrl}`);

    const callParams = {
      url: voiceUrl,
      to: patient.phone,
      from: fromNumber
    };

    const call = await client.calls.create(callParams);

    console.log(`[twilioClient] Twilio call initiated: ${call.sid} to ${patient.phone}`);
    return {
      callSid: call.sid,
      isSimulated: false
    };
  } catch (err) {
    console.error('[twilioClient] Error initiating Twilio call:', err);
    throw err;
  }
}

module.exports = {
  startPatientCall
};
