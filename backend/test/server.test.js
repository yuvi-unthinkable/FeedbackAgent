const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { server, activeSessions } = require('../src/server');

const TEST_PORT = 4099;

describe('Express API & WebSocket Server (server.js)', () => {
  before((done) => {
    server.listen(TEST_PORT, done);
  });

  after(async () => {
    for (const s of activeSessions.values()) {
      await s.endCall();
    }
    activeSessions.clear();
    await new Promise(resolve => server.close(resolve));
  });

  it('GET /api/health should return ok status', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
  });

  it('GET /api/patients should return seeded HIPAA-safe mock patients', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/patients`);
    assert.strictEqual(res.status, 200);
    const patients = await res.json();
    assert.ok(Array.isArray(patients));
    assert.ok(patients.length >= 3);
    assert.strictEqual(patients[0].id, 'pat_001');
    assert.ok(patients[0].requiredQuestions.length > 0);
  });

  it('POST /api/calls/outbound?simulate=true should initiate a simulated call session', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/calls/outbound?simulate=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: 'pat_001' })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.isSimulated, true);
    assert.strictEqual(data.patientId, 'pat_001');
    assert.ok(data.sessionId.startsWith('sim_'));
  });

  it('GET /api/reports/:patientId should return array of reports', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/reports/pat_001`);
    assert.strictEqual(res.status, 200);
    const reports = await res.json();
    assert.ok(Array.isArray(reports));
  });
});
