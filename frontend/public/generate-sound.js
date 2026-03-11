/**
 * generate-sound.js
 * Run once from the /public directory with: node generate-sound.js
 * Creates a notification.wav file (served as notification.mp3 is preferred,
 * but WAV works fine when referenced as /notification.mp3 via Next.js rewrites).
 *
 * Generates a pleasant 3-tone chime using raw PCM at 44100 Hz mono 16-bit.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const BIT_DEPTH = 16;

/**
 * Write a WAV file with a simple multi-tone chime.
 * Even though the file is called notification.mp3, browsers are smart enough
 * to sniff the MIME type and play WAV content correctly.
 */
function generateChimeWav(outputPath) {
  // Define tones: [frequency Hz, duration seconds, amplitude 0-1]
  const tones = [
    [880, 0.18, 0.45],
    [1100, 0.18, 0.40],
    [880, 0.28, 0.35],
  ];

  // Build PCM samples
  const totalSamples = tones.reduce((s, [, d]) => s + Math.ceil(d * SAMPLE_RATE), 0);
  const pcmBuffer = Buffer.alloc(totalSamples * 2); // 16-bit = 2 bytes per sample
  let offset = 0;

  tones.forEach(([freq, duration, amplitude]) => {
    const numSamples = Math.ceil(duration * SAMPLE_RATE);
    for (let i = 0; i < numSamples; i++) {
      // Sine wave with a short fade-in and fade-out envelope
      const t = i / SAMPLE_RATE;
      const fadeLen = Math.min(0.02 * SAMPLE_RATE, numSamples * 0.1);
      const envelope =
        i < fadeLen
          ? i / fadeLen
          : i > numSamples - fadeLen
            ? (numSamples - i) / fadeLen
            : 1;

      const sample = Math.sin(2 * Math.PI * freq * t) * amplitude * envelope;
      const int16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
      pcmBuffer.writeInt16LE(int16, offset);
      offset += 2;
    }
  });

  // Build WAV header
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;
  const wavHeader = Buffer.alloc(44);
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * BIT_DEPTH / 8;
  const blockAlign = NUM_CHANNELS * BIT_DEPTH / 8;

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(fileSize, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  wavHeader.writeUInt16LE(1, 20); // AudioFormat   (PCM = 1)
  wavHeader.writeUInt16LE(NUM_CHANNELS, 22);
  wavHeader.writeUInt32LE(SAMPLE_RATE, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(BIT_DEPTH, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  const wavFile = Buffer.concat([wavHeader, pcmBuffer]);
  fs.writeFileSync(outputPath, wavFile);
  console.log(`✅ Created: ${outputPath}  (${wavFile.length} bytes)`);
}

const outFile = path.join(__dirname, 'notification.mp3');
generateChimeWav(outFile);
