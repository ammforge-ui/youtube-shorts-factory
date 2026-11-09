import fs from "node:fs";
import { run } from "../src/services/system";
const out = process.argv[2] || "output/test-run";
if (!fs.existsSync(out + "/final.mp4")) throw new Error("Render first");
fs.mkdirSync("artifacts", { recursive: true });
const files = [
  "final.mp4",
  "title.txt",
  "description.txt",
  "hashtags.txt",
  "script.txt",
  "captions.srt",
  "storyboard.json",
  "research.json",
  "quality-report.json",
  "production-report.md",
  "contact-sheet.jpg",
  "capture.json",
  "playback-check.json",
  "visual-review.json",
].filter((f) => fs.existsSync(out + "/" + f));
run("tar", ["-czf", "artifacts/test-run.tar.gz", "-C", out, ...files]);
run("tar", [
  "-czf",
  "artifacts/source.tar.gz",
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
console.log(
  "Exported: " +
    process.cwd() +
    "/artifacts/test-run.tar.gz and artifacts/source.tar.gz",
);
