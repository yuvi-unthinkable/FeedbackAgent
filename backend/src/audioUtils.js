/**
 * audioUtils.js
 * Pure JS zero-dependency G.711 mu-law <-> 16-bit Linear PCM Resampler
 * 
 * - Twilio streams 8kHz G.711 mu-law audio
 * - Gemini Live API accepts 16kHz 16-bit Linear PCM (audio/pcm;rate=16000)
 * - Gemini Live API outputs 24kHz 16-bit Linear PCM (audio/pcm;rate=24000)
 */

// Precompute 256-entry lookup table for standard ITU-T G.711 mu-law to 16-bit linear PCM decoding
const MULAW_TO_PCM16_TABLE = new Int16Array(256);
for (let i = 0; i < 256; i++) {
  const uByte = ~i & 0xff;
  const sign = uByte & 0x80;
  const exponent = (uByte >> 4) & 0x07;
  const mantissa = uByte & 0x0f;
  let sample = ((mantissa << 3) + 0x84) << exponent;
  sample -= 0x84;
  MULAW_TO_PCM16_TABLE[i] = sign !== 0 ? -sample : sample;
}

const BIAS = 0x84; // 132
const CLIP = 32635;

/**
 * Encodes a 16-bit signed Linear PCM sample (-32768 to 32767) to an 8-bit mu-law byte.
 * @param {number} sample - 16-bit signed integer
 * @returns {number} 8-bit unsigned mu-law byte (0-255)
 */
function pcmSampleToMuLaw(sample) {
  let sign = 0x00;
  if (sample < 0) {
    sign = 0x80;
    sample = -sample;
  }
  if (sample > CLIP) {
    sample = CLIP;
  }
  sample += BIAS;

  let exponent = 7;
  for (let expMask = 0x4000; (sample & expMask) === 0 && exponent > 0; expMask >>= 1) {
    exponent--;
  }

  const mantissa = (sample >> (exponent + 3)) & 0x0f;
  const uByte = ~(sign | (exponent << 4) | mantissa) & 0xff;
  return uByte;
}

/**
 * Decodes base64 8kHz G.711 mu-law bytes from Twilio into 16-bit Linear PCM
 * and upsamples from 8kHz to 16kHz (2x linear interpolation).
 * 
 * @param {string} base64Mulaw - Base64 encoded 8kHz mu-law audio payload from Twilio
 * @returns {string} Base64 encoded 16kHz 16-bit Linear PCM audio for Gemini Live
 */
function mulawToPcm16(base64Mulaw) {
  if (!base64Mulaw) return '';
  const mulawBuffer = Buffer.from(base64Mulaw, 'base64');
  const num8kSamples = mulawBuffer.length;
  if (num8kSamples === 0) return '';

  // Decode 8kHz mu-law samples to 16-bit linear PCM
  const pcm8k = new Int16Array(num8kSamples);
  for (let i = 0; i < num8kSamples; i++) {
    pcm8k[i] = MULAW_TO_PCM16_TABLE[mulawBuffer[i]];
  }

  // 2x upsampling from 8kHz to 16kHz with linear interpolation
  const num16kSamples = num8kSamples * 2;
  const pcm16kBuffer = Buffer.alloc(num16kSamples * 2); // 2 bytes per sample (int16 LE)

  for (let i = 0; i < num8kSamples; i++) {
    const current = pcm8k[i];
    const next = i + 1 < num8kSamples ? pcm8k[i + 1] : current;
    const interpolated = Math.round((current + next) / 2);

    pcm16kBuffer.writeInt16LE(current, i * 4);
    pcm16kBuffer.writeInt16LE(interpolated, i * 4 + 2);
  }

  return pcm16kBuffer.toString('base64');
}

/**
 * Downsamples 24kHz 16-bit Linear PCM audio from Gemini Live down to 8kHz (3:1 decimation)
 * and encodes into G.711 mu-law bytes for Twilio playback.
 * 
 * @param {string} base64Pcm24 - Base64 encoded 24kHz 16-bit Linear PCM from Gemini Live
 * @returns {string} Base64 encoded 8kHz G.711 mu-law payload for Twilio
 */
function pcm24ToMulaw(base64Pcm24) {
  if (!base64Pcm24) return '';
  const pcm24Buffer = Buffer.from(base64Pcm24, 'base64');
  const num24kSamples = Math.floor(pcm24Buffer.length / 2);
  if (num24kSamples === 0) return '';

  // Downsample 24kHz -> 8kHz (factor of 3) using 3-sample boxcar averaging filter
  const num8kSamples = Math.floor(num24kSamples / 3);
  const mulawBuffer = Buffer.alloc(num8kSamples);

  for (let i = 0; i < num8kSamples; i++) {
    const idx = i * 3;
    const s0 = pcm24Buffer.readInt16LE(idx * 2);
    const s1 = pcm24Buffer.readInt16LE((idx + 1) * 2);
    const s2 = pcm24Buffer.readInt16LE((idx + 2) * 2);

    const avgSample = Math.round((s0 + s1 + s2) / 3);
    mulawBuffer[i] = pcmSampleToMuLaw(avgSample);
  }

  return mulawBuffer.toString('base64');
}

module.exports = {
  mulawToPcm16,
  pcm24ToMulaw,
  pcmSampleToMuLaw,
  MULAW_TO_PCM16_TABLE
};
