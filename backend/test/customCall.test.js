const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

describe('Custom Prompt & Appointment Booking Agent Flow', () => {
  let serverProcess;
  const baseUrl = 'http://localhost:4000';

  test('POST /api/calls/outbound with isCustomCall initiates a custom booking session', async () => {
    const res = await fetch(`${baseUrl}/api/calls/outbound?simulate=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCustomCall: true,
        personName: 'David Miller',
        agentName: 'Alex — Receptionist',
        customPrompt: 'Ask why David called, answer doctor availability questions, and book an appointment.',
        simulate: true
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.patientName, 'David Miller');
    assert.equal(data.isSimulated, true);
    assert.ok(data.sessionId);
  });

  test('POST /api/calls/voice-turn responds intelligently to custom appointment queries', async () => {
    const res = await fetch(`${baseUrl}/api/calls/voice-turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCustomCall: true,
        personName: 'David Miller',
        agentName: 'Alex',
        customPrompt: 'Ask why David called, answer doctor availability questions, and book an appointment with Dr. Sharma.',
        history: [
          { role: 'assistant', text: 'Hello David, this is Alex. What was the primary reason for your call today?' }
        ],
        userMessage: 'Hi Alex, I have recurring headaches and want to know if Dr. Sharma is free this Friday?'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.replyText);
    assert.ok(data.replyText.length > 5);
  });

  test('POST /api/calls/end-web-call extracts appointment booking details', async () => {
    const res = await fetch(`${baseUrl}/api/calls/end-web-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCustomCall: true,
        personName: 'David Miller',
        agentName: 'Alex',
        customPrompt: 'Inquire why caller reached out and book an appointment.',
        transcript: [
          { role: 'assistant', text: 'Hello David, why did you call today?' },
          { role: 'user', text: 'I want to schedule an appointment with Dr. Sharma for Friday at 2:00 PM.' },
          { role: 'assistant', text: 'You are booked for Friday at 2:00 PM with Dr. Sharma!' }
        ]
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.report);
    assert.ok(data.report.clinicalSummary);
    assert.ok(data.report.appointmentBooked);
    assert.equal(typeof data.report.appointmentBooked.isBooked, 'boolean');
  });
});
