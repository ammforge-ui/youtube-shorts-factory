import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { run, json } from "../services/system";
import type { AudioEvent, VideoSpec } from "../schemas/video";
const SR = 48000;
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
function wav(file: string, left: Float64Array, right?: Float64Array) {
  const channels = right ? 2 : 1;
  const b = Buffer.alloc(left.length * channels * 2);
  for (let i = 0; i < left.length; i++) {
    b.writeInt16LE(
      Math.round(Math.max(-0.98, Math.min(0.98, left[i])) * 32767),
      i * channels * 2,
    );
    if (right)
      b.writeInt16LE(
        Math.round(Math.max(-0.98, Math.min(0.98, right[i])) * 32767),
        i * 4 + 2,
      );
  }
  const h = Buffer.alloc(44);
  h.write("RIFF");
  h.writeUInt32LE(36 + b.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(b.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, b]));
}
function measurements(file: string) {
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      file,
      "-af",
      "volumedetect,silencedetect=noise=-45dB:d=0.15",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  if (r.status !== 0) throw new Error(r.stderr);
  const mean = Number(r.stderr.match(/mean_volume: ([-\d.]+)/)?.[1]);
  const peak = Number(r.stderr.match(/max_volume: ([-\d.]+)/)?.[1]);
  return {
    meanDb: mean,
    peakDb: peak,
    silenceLog: r.stderr.split("\n").filter((x) => x.includes("silence_")),
  };
}
export function directAudio(out: string, spec: VideoSpec) {
  if (!spec.creative) throw new Error("Audio direction required");
  const n = Math.ceil(spec.duration * SR);
  let seed = 72819;
  const noise = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2147483648 - 1;
  };
  const left = new Float64Array(n),
    right = new Float64Array(n);
  let fxL = new Float64Array(n),
    fxR = new Float64Array(n);
  const beat = 60 / spec.creative.bpm;
  const chords = [
    [59, 62, 66, 69],
    [55, 59, 62, 66],
    [50, 54, 57, 61],
    [57, 61, 64, 71],
  ];
  const add = (
    at: number,
    len: number,
    pan: number,
    fn: (t: number, i: number) => number,
    isFx = false,
  ) => {
    const base = Math.round(at * SR);
    for (let i = 0; i < len * SR && base + i < n; i++) {
      if (base + i < 0) continue;
      const x = fn(i / SR, i);
      const a = isFx ? fxL : left,
        b = isFx ? fxR : right;
      a[base + i] += x * Math.sqrt((1 - pan) / 2);
      b[base + i] += x * Math.sqrt((1 + pan) / 2);
    }
  };
  // 4/4 composition: two-bar harmonic rhythm, melodic arpeggio, bass, syncopated percussion.
  for (let k = 0; k * beat < spec.duration; k++) {
    const at = k * beat;
    const chord = chords[Math.floor(k / 8) % 4];
    const pos = k % 4;
    if (pos === 0 || pos === 2)
      add(
        at,
        0.24,
        0,
        (t) =>
          0.19 *
          Math.sin(2 * Math.PI * (52 * t + 5 * (1 - Math.exp(-t * 35)))) *
          Math.exp(-t * 23),
      );
    if (pos === 1 || pos === 3)
      add(
        at,
        0.13,
        0.12,
        (t) =>
          0.042 * noise() * Math.exp(-t * 34) +
          0.025 * Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 40),
      );
    add(
      at,
      0.36,
      -0.12,
      (t) =>
        0.052 *
        (Math.sin(2 * Math.PI * midi(chord[0] - 12) * t) +
          0.2 * Math.sin(4 * Math.PI * midi(chord[0] - 12) * t)) *
        Math.min(1, t / 0.012) *
        Math.exp(-t * 8),
    );
    for (let h = 0; h < 2; h++)
      add(
        at + (h * beat) / 2,
        0.06,
        h ? -0.35 : 0.35,
        (t) => 0.018 * noise() * Math.exp(-t * 65),
      );
    if (k % 8 === 0)
      for (const [j, note] of chord.entries())
        add(
          at,
          beat * 7.5,
          (j - 1.5) / 3,
          (t) =>
            0.014 *
            (Math.sin(2 * Math.PI * midi(note) * t) +
              0.12 * Math.sin(6 * Math.PI * midi(note) * t)) *
            Math.min(1, t / 0.35) *
            Math.min(1, (beat * 7.5 - t) / 0.6),
        );
    for (let a = 0; a < 2; a++) {
      const idx = [0, 2, 1, 3, 2, 1, 3, 2][(k * 2 + a) % 8];
      const note = chord[idx] + 12;
      add(
        at + (a * beat) / 2,
        0.32,
        a ? -0.5 : 0.5,
        (t) =>
          0.034 *
          (Math.sin(2 * Math.PI * midi(note) * t) +
            0.22 * Math.sin(4 * Math.PI * midi(note) * t) +
            0.08 * Math.sin(6 * Math.PI * midi(note) * t)) *
          Math.min(1, t / 0.006) *
          Math.exp(-t * 12),
      );
    }
  }
  // Original timbral library: transient, noise-sweep and harmonic reveal families.
  const eventSound = (e: AudioEvent) => {
    const at = e.frame / 30,
      g = e.intensity;
    switch (e.sound) {
      case "soft_whoosh":
      case "transition":
        add(
          at - 0.05,
          0.32,
          -0.1,
          (t) =>
            g *
            0.11 *
            noise() *
            Math.sin((Math.PI * t) / 0.32) ** 2 *
            Math.sin(2 * Math.PI * (900 * t + 1200 * t * t)),
          true,
        );
        break;
      case "keyboard":
        for (let j = 0; j < 6; j++)
          add(
            at + j * 0.075,
            0.025,
            ((j % 2) - 0.5) * 0.4,
            (t) =>
              g *
              0.1 *
              (noise() * 0.7 + Math.sin(2 * Math.PI * 850 * t) * 0.3) *
              Math.exp(-t * 180),
            true,
          );
        break;
      case "light_glitch":
        for (let j = 0; j < 4; j++)
          add(
            at + j * 0.045,
            0.035,
            ((j % 2) - 0.5) * 0.8,
            (t) =>
              g *
              0.07 *
              (noise() * 0.4 +
                Math.sin(2 * Math.PI * (440 + j * 110) * t) * 0.6) *
              Math.exp(-t * 70),
            true,
          );
        break;
      case "digital_reveal":
      case "ending":
        for (const [j, note] of [74, 78, 81, 86].entries())
          add(
            at + j * 0.055,
            0.7,
            (j - 1.5) / 3,
            (t) =>
              g *
              0.065 *
              (Math.sin(2 * Math.PI * midi(note) * t) +
                0.15 * Math.sin(4 * Math.PI * midi(note) * t)) *
              Math.min(1, t / 0.005) *
              Math.exp(-t * 7),
            true,
          );
        break;
      case "soft_impact":
      case "digital_pop":
        add(
          at,
          0.23,
          0,
          (t) =>
            g *
            0.24 *
            Math.sin(2 * Math.PI * (90 * t + 7 * (1 - Math.exp(-t * 25)))) *
            Math.exp(-t * 24),
          true,
        );
        break;
      case "ui_click":
        add(
          at,
          0.055,
          0,
          (t) =>
            g *
            0.13 *
            (Math.sin(2 * Math.PI * 1250 * t) + 0.25 * noise()) *
            Math.exp(-t * 90),
          true,
        );
        break;
      case "text_accent":
        add(
          at,
          0.22,
          0.1,
          (t) =>
            g *
            0.11 *
            (Math.sin(2 * Math.PI * 740 * t) +
              0.25 * Math.sin(2 * Math.PI * 1110 * t)) *
            Math.exp(-t * 22),
          true,
        );
        break;
    }
  };
  for (const e of spec.creative.soundEvents) eventSound(e);
  for (const note of [74, 78, 81])
    add(
      spec.duration - 0.55,
      0.55,
      0,
      (t) =>
        0.028 *
        Math.sin(2 * Math.PI * midi(note) * t) *
        Math.min(1, t / 0.01) *
        Math.exp(-t * 5),
      true,
    );
  // Scene intensity envelopes and musical fade/resolve; smooth interpolation avoids gain jumps.
  const ranges = spec.scenes.map((s, i) => ({
    start: spec.scenes.slice(0, i).reduce((t, x) => t + x.duration, 0),
    end: spec.scenes.slice(0, i + 1).reduce((t, x) => t + x.duration, 0),
    gain: s.direction?.musicIntensity ?? 0.5,
  }));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const r = ranges.find((x) => t >= x.start && t < x.end) || ranges.at(-1)!;
    const prior = ranges[Math.max(0, ranges.indexOf(r) - 1)].gain;
    const p = Math.min(1, (t - r.start) / 0.22);
    const gain = prior + (r.gain - prior) * (p * p * (3 - 2 * p));
    const fade =
      Math.min(1, t / 0.025) *
      Math.min(1, Math.max(0, (spec.duration - t) / 0.45));
    left[i] *= gain * fade;
    right[i] *= gain * fade;
    fxL[i] *= Math.min(1, Math.max(0, (spec.duration - t) / 0.15));
    fxR[i] *= Math.min(1, Math.max(0, (spec.duration - t) / 0.15));
  }
  wav(out + "/music.wav", left, right);
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    out + "/music.wav",
    "-af",
    "loudnorm=I=-22:TP=-5:LRA=6",
    "-ar",
    "48000",
    out + "/music-normalized.wav",
  ]);
  fs.copyFileSync(out + "/music-normalized.wav", out + "/music.wav");
  wav(out + "/effects.wav", fxL, fxR);
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    out + "/narration.wav",
    "-af",
    "loudnorm=I=-16:TP=-2:LRA=7",
    "-ar",
    "48000",
    out + "/voice-normalized.wav",
  ]);
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    out + "/voice-normalized.wav",
    "-i",
    out + "/music.wav",
    "-i",
    out + "/effects.wav",
    "-filter_complex",
    `[0:a]apad,atrim=0:${spec.duration},aformat=channel_layouts=stereo,asplit=2[voice][side];[1:a]volume=0.85[music];[music][side]sidechaincompress=threshold=0.035:ratio=3:attack=20:release=230:makeup=1[bed];[voice][bed][2:a]amix=inputs=3:normalize=0:duration=longest,atrim=0:${spec.duration},afade=t=out:st=${spec.duration - 0.28}:d=0.28,alimiter=limit=0.89:level=false[out]`,
    "-map",
    "[out]",
    "-ar",
    "48000",
    out + "/mix.wav",
  ]);
  // Isolate the actually ducked bed for stem-level evidence and inspection.
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    out + "/voice-normalized.wav",
    "-i",
    out + "/music.wav",
    "-filter_complex",
    "[1:a]volume=0.85[m];[m][0:a]sidechaincompress=threshold=0.035:ratio=3:attack=20:release=230[bed]",
    "-map",
    "[bed]",
    out + "/music-ducked.wav",
  ]);
  const report = {
    bpm: spec.creative.bpm,
    composition:
      "Original two-bar B-minor/Gmaj7/Dmaj7/Aadd9 progression; plucked arpeggio, warm pad, bass, kick, snare and hats; seeded synthesis.",
    license: {
      source: "src/directors/AudioDirector.ts",
      type: "Original procedural composition and effects; no external recordings or samples",
      allowedUsage:
        "YouTube publishing and automated production; no attribution required",
      restrictions:
        "No claim of exclusive rights to generated musical patterns",
    },
    narration: measurements(out + "/voice-normalized.wav"),
    music: measurements(out + "/music.wav"),
    duckedMusic: measurements(out + "/music-ducked.wav"),
    effects: measurements(out + "/effects.wav"),
    mix: measurements(out + "/mix.wav"),
    events: spec.creative.soundEvents,
    ducking: {
      threshold: 0.035,
      ratio: 3,
      attackMs: 20,
      releaseMs: 230,
      method: "Actual narration sidechain compressor",
    },
    perceptualReview:
      "Not yet auditioned by a human; objective stem/level checks do not establish musical taste.",
  };
  if (
    !Number.isFinite(report.mix.meanDb) ||
    report.mix.peakDb > -0.5 ||
    report.music.meanDb < -45 ||
    report.effects.peakDb < -35
  )
    throw new Error("Audio integrity/presence check failed");
  json(out + "/audio-report.json", report);
  const actualL = fxL,
    actualR = fxR;
  const library = out + "/audio-library";
  fs.mkdirSync(library, { recursive: true });
  const sounds: AudioEvent["sound"][] = [
    "digital_pop",
    "soft_whoosh",
    "ui_click",
    "keyboard",
    "light_glitch",
    "digital_reveal",
    "soft_impact",
    "text_accent",
    "transition",
    "ending",
  ];
  for (const sound of sounds) {
    fxL = new Float64Array(SR);
    fxR = new Float64Array(SR);
    eventSound({ event: "library_" + sound, frame: 0, sound, intensity: 0.6 });
    wav(library + "/" + sound + ".wav", fxL, fxR);
  }
  fxL = actualL;
  fxR = actualR;
  json(out + "/audio-assets.json", {
    ...report.license,
    assets: [
      { filename: "music.wav", role: "arranged 116 BPM bed" },
      ...sounds.map((sound) => ({
        filename: "audio-library/" + sound + ".wav",
        role: sound,
      })),
    ],
    attribution: "none required",
  });
  return report;
}
export { measurements as measureAudio };
