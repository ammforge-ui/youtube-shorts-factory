import assert from "node:assert/strict";
import fs from "node:fs";
import { phrases } from "../src/directors/CaptionDirector";
import { cameraPose } from "../src/directors/ScreenFocusDirector";
import { SoundEvent, VideoSchema } from "../src/schemas/video";
const words =
  "No password was cracked. Base64 is encoding, not encryption. Save this tool for later."
    .split(" ")
    .map((text, i) => ({ text, start: i * 0.3, end: i * 0.3 + 0.25 }));
const groups = phrases(words);
assert(groups.every((x) => !/[.!?]\s+\S/.test(x.text)));
assert.equal(groups.flatMap((x) => x.tokens).length, words.length);
assert(groups.every((x) => x.tokens.length <= 6));
const pose = cameraPose(
  { x: 550, y: 550, width: 380, height: 150 },
  { width: 1000, height: 1050 },
  { width: 900, height: 680 },
);
assert(pose.x <= 0 && pose.y <= 0);
assert(pose.x + 1000 * pose.scale >= 900);
assert(pose.y + 1050 * pose.scale >= 680);
assert(
  !SoundEvent.safeParse({
    event: "x",
    frame: -1,
    sound: "ui_click",
    intensity: 4,
  }).success,
);
assert(
  !SoundEvent.safeParse({
    event: "x",
    frame: 1,
    sound: "unknown",
    intensity: 0.5,
  }).success,
);
const old = VideoSchema.parse(
  JSON.parse(fs.readFileSync("output/test-run/storyboard.json", "utf8")),
);
assert(!old.creative);
console.log(
  "Creative checks passed: phrase boundaries/tokens/density, bounded camera coverage, event validation, legacy spec compatibility.",
);
