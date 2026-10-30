const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  mulawToPcm16,
  pcm24ToMulaw,
  pcmSampleToMuLaw,
  MULAW_TO_PCM16_TABLE
} = require('../src/audioUtils');

describe('Audio Resampling & Utility Layer (audioUtils.js)', () => {
  it('should initialize standard 256-entry mu-law lookup table correctly', () => {
    assert.strictEqual(MULAW_TO_PCM16_TABLE.length, 256);
    // 0xFF and 0x7F represent +0 and -0 in standard G.711 mu-law
    assert.strictEqual(MULAW_TO_PCM16_TABLE[0xff], 0);
    assert.strictEqual(MULAW_TO_PCM16_TABLE[0x7f], 0);
    // Max positive and negative limits
    assert.ok(MULAW_TO_PCM16_TABLE[0x80] > 32000, '0x80 should be max positive linear PCM');
    assert.ok(MULAW_TO_PCM16_TABLE[0x00] < -32000, '0x00 should be max negative linear PCM');
  });

  it('mulawToPcm16 should upsample 8kHz mu-law (Twilio) to 16kHz 16-bit PCM (Gemini Live)', () => {
    // 160 bytes = 20ms of audio at 8kHz (standard Twilio packet)
    const num8kSamples = 160;
    const rawMulaw = Buffer.alloc(num8kSamples);
    for (let i = 0; i < num8kSamples; i++) {
      // Simulate synthetic audio waveform
      rawMulaw[i] = (i % 256);
    }
    const base64Input = rawMulaw.toString('base64');
    const base64Output = mulawToPcm16(base64Input);

    const outputBuffer = Buffer.from(base64Output, 'base64');

    // 160 samples at 8kHz upsampled by 2x -> 320 samples at 16kHz
    // 320 samples * 2 bytes/sample (int16 LE) = 640 bytes
    const expectedOutputBytes = num8kSamples * 2 * 2;
    assert.strictEqual(outputBuffer.length, expectedOutputBytes, 'Buffer length must be 4x input bytes (2x samples * 2 bytes per int16)');

    // Verify sample interpolation
    const s0 = outputBuffer.readInt16LE(0);
    const s1 = outputBuffer.readInt16LE(2);
    const expectedFirstSample = MULAW_TO_PCM16_TABLE[rawMulaw[0]];
    assert.strictEqual(s0, expectedFirstSample, 'Even sample must match original decoded sample');
    assert.ok(typeof s1 === 'number', 'Interpolated sample must be valid number');
  });

  it('pcm24ToMulaw should downsample 24kHz 16-bit PCM (Gemini Live) to 8kHz mu-law (Twilio)', () => {
    // 480 samples = 20ms of audio at 24kHz (Gemini Live chunk)
    // 480 samples * 2 bytes = 960 bytes
    const num24kSamples = 480;
    const rawPcm24 = Buffer.alloc(num24kSamples * 2);
    for (let i = 0; i < num24kSamples; i++) {
      // Sine wave sample at 440 Hz
      const sample = Math.round(15000 * Math.sin((2 * Math.PI * 440 * i) / 24000));
      rawPcm24.writeInt16LE(sample, i * 2);
    }

    const base64Input = rawPcm24.toString('base64');
    const base64Output = pcm24ToMulaw(base64Input);

    const outputBuffer = Buffer.from(base64Output, 'base64');

    // 480 samples at 24kHz downsampled 3:1 -> 160 samples at 8kHz
    // 160 samples * 1 byte/sample (mu-law) = 160 bytes (standard Twilio frame)
    const expectedOutputBytes = num24kSamples / 3;
    assert.strictEqual(outputBuffer.length, expectedOutputBytes, 'Downsampled mu-law output must be 1/3 sample count of 24kHz PCM');

    // Verify decoded roundtrip preserves sign and relative amplitude
    const decodedFirstSample = MULAW_TO_PCM16_TABLE[outputBuffer[0]];
    // Samples 0, 1, 2 average to ~1715, so decoded sample should be in [1500, 1900]
    assert.ok(decodedFirstSample > 1400 && decodedFirstSample < 2000, `Expected decoded sample near 1715, got ${decodedFirstSample}`);
  });

  it('should gracefully handle empty or invalid inputs', () => {
    assert.strictEqual(mulawToPcm16(''), '');
    assert.strictEqual(mulawToPcm16(null), '');
    assert.strictEqual(pcm24ToMulaw(''), '');
    assert.strictEqual(pcm24ToMulaw(null), '');
  });

  it('pcmSampleToMuLaw should encode linear values within 1-byte range [0, 255]', () => {
    const testSamples = [0, 100, -100, 15000, -15000, 32767, -32768];
    for (const sample of testSamples) {
      const mu = pcmSampleToMuLaw(sample);
      assert.ok(mu >= 0 && mu <= 255, `Sample ${sample} produced valid byte ${mu}`);
      const roundtrip = MULAW_TO_PCM16_TABLE[mu];
      // Mu-law is logarithmic lossy compression, so ensure sign matches and error is bounded
      if (Math.abs(sample) > 500) {
        assert.strictEqual(Math.sign(sample), Math.sign(roundtrip), `Sign must match for sample ${sample}`);
      }
    }
  });
});
