import fs from "node:fs";
import { run } from "../src/services/system";
const out = "output/cyberchef-v2";
if (!fs.existsSync(out + "/final-v2.mp4")) throw new Error("Render v2 first");
fs.mkdirSync("artifacts", { recursive: true });
const files = [
  "final-v2.mp4",
  "script-v2.txt",
  "storyboard-v2.json",
  "captions-v2.srt",
  "quality-report.json",
  "audio-report.json",
  "retention-report.json",
  "audio-assets.json",
  "contact-sheet.png",
  "waveform.png",
  "improvements.md",
  "production-report.md",
  "mix-delivery-check.json",
  "visual-review.json",
  "capture.json",
  "layout-report.json",
  "playback-check.json",
  "playback.png",
  "audio-library",
];
for (const f of files)
  if (!fs.existsSync(out + "/" + f))
    throw new Error("Missing deliverable: " + f);
run("tar", ["-czf", "artifacts/cyberchef-v2.tar.gz", "-C", out, ...files]);
console.log(process.cwd() + "/artifacts/cyberchef-v2.tar.gz");

run("tar", [
  "-czf",
  "artifacts/premium-source.tar.gz",
  "AGENTS.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "remotion.config.ts",
  "remotion-ui.json",
  ".gitignore",
  ".env.example",
  ".npmrc",
  "requirements-tts.txt",
  "config",
  "src",
  "scripts",
  "assets",
  "data/test-topic.json",
  "data/research-candidates.json",
  "data/cyberchef-v2.json",
  "data/preview-v2.json",
  "docs",
  "public/fonts",
]);
console.log(process.cwd() + "/artifacts/premium-source.tar.gz");
