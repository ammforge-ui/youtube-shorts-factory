import fs from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { json, probe, run } from "../services/system";
import type { VideoSpec } from "../schemas/video";
import { measureAudio } from "./AudioDirector";
import { inspectRetention } from "./RetentionDirector";
export function inspectPremium(out: string, spec: VideoSpec) {
  const file = out + "/final-v2.mp4";
  run("python", ["scripts/validate-mix.py", out]);
  const delivery = JSON.parse(
    fs.readFileSync(out + "/mix-delivery-check.json", "utf8"),
  );
  const p = probe(file),
    v = p.streams.find((x: any) => x.codec_type === "video"),
    a = p.streams.find((x: any) => x.codec_type === "audio");
  const decoded = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const audio = measureAudio(file);
  const ar = JSON.parse(fs.readFileSync(out + "/audio-report.json", "utf8"));
  const endSilence = audio.silenceLog
    .map((x) => x.match(/silence_start: ([\d.]+)/))
    .filter(Boolean)
    .map((x) => Number(x![1]))
    .filter((x) => x > spec.duration - 0.8);
  const trailing = endSilence.length
    ? Number(p.format.duration) - endSilence.at(-1)!
    : 0;
  const black = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      file,
      "-vf",
      "blackdetect=d=0.12:pix_th=0.04:pic_th=0.99",
      "-an",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (black.status !== 0) throw new Error(black.stderr);
  const capture = JSON.parse(fs.readFileSync(out + "/capture.json", "utf8"));
  const layout = JSON.parse(
    fs.readFileSync(out + "/layout-report.json", "utf8"),
  );
  const chosenCapture = capture.captures.find(
    (c: any) => c.name === (spec.template === "mobile" ? "mobile" : "desktop"),
  );
  const checks = {
    layoutSafe: layout.passed === true,
    recordingLandmarks:
      chosenCapture.landmarks?.inputVisibleStatus === "aligned" &&
      chosenCapture.landmarks?.resultVisibleStatus === "aligned",
    resolution: v.width === 1080 && v.height === 1920,
    fps: v.avg_frame_rate === "30/1",
    h264: v.codec_name === "h264",
    aac: a?.codec_name === "aac",
    duration:
      Number(p.format.duration) >= 28 && Number(p.format.duration) <= 32,
    fullDecode: decoded.status === 0 && !decoded.stderr.trim(),
    noBlackGaps: !black.stderr.includes("black_start:"),
    narrationPresent: ar.narration.meanDb > -35,
    musicPresent: ar.duckedMusic.meanDb > -40,
    musicBalanced:
      ar.duckedMusic.meanDb > ar.narration.meanDb - 22 &&
      ar.duckedMusic.meanDb < ar.narration.meanDb - 7,
    effectsPresent: ar.effects.peakDb > -35,
    noClipping: audio.peakDb <= -0.5,
    noEndingSilence: trailing <= 0.3,
    sceneCoverage:
      Math.abs(
        spec.scenes.reduce((x, s) => x + s.duration, 0) - spec.duration,
      ) < 0.035,
    wordTiming: spec.words.every(
      (w, i) =>
        w.end > w.start &&
        w.end <= spec.duration &&
        (i === 0 || w.start >= spec.words[i - 1].end - 0.04),
    ),
    assets:
      spec.scenes.every((s) => fs.existsSync("public/" + s.direction!.asset)) &&
      fs.existsSync("public/" + spec.audio),
    intendedMixDelivered: delivery.passed === true,
    actualDemo: capture.captures.every(
      (c: any) => c.actual.trim() === spec.creative!.example,
    ),
  };
  const retention = inspectRetention(spec);
  json(out + "/retention-report.json", retention);
  const score = (value: number, basis: string, evidence: string) => ({
    score: value,
    basis,
    evidence,
  });
  const scorecard = {
    technicalCorrectness: score(
      Object.values(checks).every(Boolean) ? 9 : 4,
      "deterministic",
      "Codec/dimensions/full decode and media checks",
    ),
    hookEffectiveness: score(
      8,
      "subjective editorial assessment",
      "Frame-zero large encoded subject; actual viewer response unknown",
    ),
    storyClarity: score(
      8,
      "subjective editorial assessment",
      "Fictional example → real steps → result → distinction",
    ),
    visualPresentation: score(
      8,
      "subjective editorial assessment; see hash-bound visual review",
      "Seven layout types and consistent navy/lime tokens",
    ),
    animationQuality: score(
      8,
      "implementation + subjective",
      "Frame-based easing, measured camera paths and official scramble typography",
    ),
    interfaceReadability: score(
      retention.checks.estimatedInterfaceReadability ? 8 : 5,
      "measured estimate + review",
      "Source editor font × camera scale; inspect actual frames",
    ),
    captionQuality: score(
      retention.checks.noCrossSentenceCaptions ? 8 : 4,
      "timing tests + subjective",
      "Acoustic timestamps, sentence/clause grouping, floating placement",
    ),
    narrationQuality: score(
      7,
      "engine + measured audio; perceptual review pending",
      "Local neural LJ Speech, acoustic word alignment; naturalness not objectively measured",
    ),
    musicQuality: score(
      7,
      "original composition; perceptual review pending",
      "116 BPM harmony/arpeggio/percussion with ducking; no claim of library-track quality",
    ),
    soundEffectQuality: score(
      8,
      "event timing; perceptual review pending",
      "Distinct seeded transient/sweep/reveal cues tied to story events",
    ),
    audioMixing: score(
      checks.noClipping && checks.musicPresent ? 8 : 4,
      "measured levels; perceptual review pending",
      "Speech sidechain and measured stem levels",
    ),
    endingQuality: score(
      checks.noEndingSilence && retention.checks.shortEnding ? 8 : 5,
      "duration/silence checks + subjective",
      "Short overlay connected to result, musical cadence/fade",
    ),
    overallPolish: score(
      8,
      "provisional editorial assessment",
      "Improvement relative to v1; not a retention or virality prediction",
    ),
  };
  const reviewed = fs.existsSync(out + "/visual-review.json")
    ? JSON.parse(fs.readFileSync(out + "/visual-review.json", "utf8"))
    : null;
  const digest = createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
  const report = {
    sha256: digest,
    createdAt: new Date().toISOString(),
    passed: Object.values(checks).every(Boolean) && retention.passed,
    technical: checks,
    media: {
      duration: Number(p.format.duration),
      width: v.width,
      height: v.height,
      fps: v.avg_frame_rate,
      videoCodec: v.codec_name,
      audioCodec: a?.codec_name,
      bytes: fs.statSync(file).size,
    },
    audio: {
      ...audio,
      trailingSilenceSeconds: trailing,
      stemPresence:
        "Measured isolated stems; exact recombination/delivery check performed separately",
      mixDelivery: delivery,
      humanListening:
        "Audio-input audition was attempted but this assistant environment does not support audio input. No perceptual listening approval is claimed.",
    },
    retention,
    layout: {
      passed: layout.passed,
      sampleCount: layout.sampleCount,
      violations: layout.violations,
      overlaps: layout.overlaps,
    },
    recordingAlignment: chosenCapture.landmarks,
    scorecard,
    visualReview:
      reviewed?.sha256 === digest ? reviewed : "Pending encoded frame review",
    limitations: [
      "Scores marked subjective are editorial estimates, not objective creativity/retention measurements.",
      "No new autonomous web discovery or product adapters are claimed.",
    ],
  };
  json(out + "/quality-report.json", report);
  return report;
}
