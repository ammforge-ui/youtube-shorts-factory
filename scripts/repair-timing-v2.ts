import fs from "node:fs";
import { cyberchefStory } from "../src/directors/StoryDirector";
import { render } from "../src/services/render";
import { json, run, probe } from "../src/services/system";
const out = "output/cyberchef-v2";
const topic = JSON.parse(fs.readFileSync("data/cyberchef-v2.json", "utf8"));
const voice = JSON.parse(fs.readFileSync(out + "/narration.wav.json", "utf8")),
  capture = JSON.parse(fs.readFileSync(out + "/capture.json", "utf8"));
const spec = cyberchefStory({
  topic,
  voice,
  capture,
  key: "cyberchef-v2",
  template: "discovery",
});
json(out + "/storyboard-v2.json", spec);
json(
  "data/preview-v2.json",
  Object.fromEntries(
    (["discovery", "mobile", "before-after"] as const).map((template) => [
      template,
      cyberchefStory({ topic, voice, capture, key: "cyberchef-v2", template }),
    ]),
  ),
);
let cursor = 0,
  from = 0,
  end = 0;
for (const s of spec.scenes) {
  if (s.title === "Paste the text.") from = Math.round(cursor * 30);
  if (
    (process.argv.includes("--input-only") && s.title === "From Base64") ||
    s.direction?.purpose === "payoff"
  ) {
    end = Math.round(cursor * 30);
    break;
  }
  cursor += s.duration;
}
if (!from || end <= from) throw new Error("Repair anchors invalid");
console.log(
  "Re-rendering affected input/selection frames",
  from,
  "to",
  end - 1,
);
await render(spec, out, false, "timing-repair.mp4", [from, end - 1]);
const original = out + "/pre-repair.mp4";
fs.copyFileSync(out + "/final-v2.mp4", original);
run("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-i",
  original,
  "-i",
  out + "/timing-repair.mp4",
  "-filter_complex",
  `[0:v]trim=end_frame=${from},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=${end},setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[v]`,
  "-map",
  "[v]",
  "-map",
  "0:a",
  "-c:v",
  "libx264",
  "-crf",
  "19",
  "-preset",
  "fast",
  "-pix_fmt",
  "yuv420p",
  "-r",
  "30",
  "-c:a",
  "copy",
  "-movflags",
  "+faststart",
  out + "/repaired-final.mp4",
]);
const p = probe(out + "/repaired-final.mp4");
if (Math.abs(Number(p.format.duration) - spec.duration) > 0.08)
  throw new Error("Repair duration mismatch");
fs.renameSync(out + "/repaired-final.mp4", out + "/final-v2.mp4");
json(out + "/timing-repair.json", {
  frameRange: [from, end - 1],
  method:
    "Re-render affected scenes with pixel-aligned source offsets, concatenate original before/after video, retain original full mix audio",
  duration: Number(p.format.duration),
});
run("python", ["scripts/review-v2.py", out]);
console.log("Timing repair complete");
