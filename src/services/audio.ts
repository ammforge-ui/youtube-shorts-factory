import fs from "node:fs";
import { run } from "./system";
export function mixAudio(out: string, duration: number, cues: number[]) {
  // Original synthesized UI cues; no third-party music or samples.
  const sr = 48000;
  const samples = new Int16Array(Math.ceil(duration * sr));
  for (const at of cues)
    for (let i = 0; i < sr * 0.13; i++) {
      const t = i / sr;
      const n = Math.floor(at * sr) + i;
      if (n < samples.length)
        samples[n] += Math.round(
          1700 *
            Math.sin(2 * Math.PI * (740 * t + 600 * t * t)) *
            Math.exp(-t * 35),
        );
    }
  const h = Buffer.alloc(44);
  h.write("RIFF");
  h.writeUInt32LE(36 + samples.byteLength, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(samples.byteLength, 40);
  fs.writeFileSync(
    out + "/effects.wav",
    Buffer.concat([h, Buffer.from(samples.buffer)]),
  );
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    out + "/narration.wav",
    "-i",
    out + "/effects.wav",
    "-filter_complex",
    `[0:a]loudnorm=I=-16:TP=-2:LRA=7,apad,atrim=0:${duration},afade=t=out:st=${duration - 0.4}:d=0.4,asplit=2[voice][side];[1:a][side]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=150[fx];[voice][fx]amix=inputs=2:normalize=0,alimiter=limit=0.89[out]`,
    "-map",
    "[out]",
    "-ar",
    "48000",
    out + "/mix.wav",
  ]);
}
