import fs from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { json, probe, run } from "./system";
import type { VideoSpec } from "../schemas/video";
export function verify(out: string, spec: VideoSpec) {
  const p = probe(out + "/final.mp4"),
    v = p.streams.find((s: any) => s.codec_type === "video"),
    a = p.streams.find((s: any) => s.codec_type === "audio");
  const audio = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      out + "/final.mp4",
      "-af",
      "volumedetect",
      "-vn",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (audio.status !== 0) throw new Error(audio.stderr);
  const mean = Number(audio.stderr.match(/mean_volume: ([-\d.]+)/)?.[1]);
  const peak = Number(audio.stderr.match(/max_volume: ([-\d.]+)/)?.[1]);
  const black = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      out + "/final.mp4",
      "-vf",
      "blackdetect=d=0.15:pix_th=0.05:pic_th=0.98",
      "-an",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (black.status !== 0) throw new Error(black.stderr);
  const decode = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", out + "/final.mp4", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const checks = {
    fileNonempty: fs.statSync(out + "/final.mp4").size > 10000,
    resolution: v.width === 1080 && v.height === 1920,
    fps: v.avg_frame_rate === "30/1",
    duration:
      Number(p.format.duration) >= 25 && Number(p.format.duration) <= 40,
    h264: v.codec_name === "h264",
    aac: a?.codec_name === "aac",
    audioAudible: mean > -40 && mean < -8,
    noClipping: peak <= -0.5,
    fullDecode: decode.status === 0 && !decode.stderr.trim(),
    noBlackGaps: !black.stderr.includes("black_start:"),
    captionCoverage:
      spec.words.length > 30 &&
      spec.words.every(
        (w, i) =>
          w.end > w.start &&
          w.end <= spec.duration &&
          (i === 0 || w.start >= spec.words[i - 1].start),
      ),
    sceneCoverage:
      Math.abs(
        spec.scenes.reduce((n, s) => n + s.duration, 0) - spec.duration,
      ) < 0.04,
    mediaPresent:
      spec.scenes.every((s) => fs.existsSync("public/" + s.footage)) &&
      fs.existsSync("public/" + spec.audio),
  };
  const digest = createHash("sha256")
    .update(fs.readFileSync(out + "/final.mp4"))
    .digest("hex");
  const reviewed = fs.existsSync(out + "/visual-review.json")
    ? JSON.parse(fs.readFileSync(out + "/visual-review.json", "utf8"))
    : null;
  const report = {
    sha256: digest,
    createdAt: new Date().toISOString(),
    technical: checks,
    passed: Object.values(checks).every(Boolean),
    media: {
      duration: Number(p.format.duration),
      width: v.width,
      height: v.height,
      frameRate: v.avg_frame_rate,
      videoCodec: v.codec_name,
      audioCodec: a?.codec_name,
      bytes: fs.statSync(out + "/final.mp4").size,
    },
    audio: {
      meanDb: mean,
      peakDb: peak,
      narrationEngine: "Piper LJ Speech via sherpa-onnx",
      music: "none; original synthesized cues only",
      ducking: "sidechain compressor on effects",
    },
    captions: {
      method: "PocketSphinx acoustic forced alignment",
      wordCount: spec.words.length,
      review:
        "Automated monotonicity/coverage; human listening review still recommended before upload.",
    },
    visual: {
      automated: "Full decode and black-gap scan",
      representativeFrames: spec.scenes.map((_, i) => `scene-${i}.png`),
      review: reviewed?.sha256 === digest ? reviewed : "pending",
    },
    content: {
      faceless: true,
      product: "CyberChef",
      demo: "Actual official local release; asserted Base64 result in capture.json",
      claims: "README and recorded interaction; no income claims",
      publication: "Not uploaded to YouTube",
    },
    limitations: [
      "Automated checks do not establish subjective professional quality.",
      "No claim of human perceptual audio review.",
    ],
  };
  json(out + "/quality-report.json", report);
  return report;
}
