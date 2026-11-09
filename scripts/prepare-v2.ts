process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
import fs from "node:fs";
const { capture } = await import("../src/services/capture");
import { json, run } from "../src/services/system";
const out = "output/cyberchef-v2";
const topic = JSON.parse(fs.readFileSync("data/cyberchef-v2.json", "utf8"));
fs.mkdirSync(out, { recursive: true });
json(out + "/topic.json", topic);
if (!process.argv.includes("--reuse") || !fs.existsSync(out + "/capture.json"))
  await capture(out, { message: topic.example, premium: true });
if (
  !process.argv.includes("--capture-only") &&
  (!process.argv.includes("--reuse") ||
    !fs.existsSync(out + "/narration.wav.json"))
)
  console.log(
    run("python", [
      "scripts/tts.py",
      out + "/topic.json",
      out + "/narration.wav",
    ]),
  );
