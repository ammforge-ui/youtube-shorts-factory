import assert from "node:assert/strict";
import fs from "node:fs";
import { VideoSchema } from "../src/schemas/video";
const s = VideoSchema.parse(
  JSON.parse(fs.readFileSync("output/test-run/storyboard.json", "utf8")),
);
assert(!VideoSchema.safeParse({ ...s, duration: 45 }).success);
assert(!VideoSchema.safeParse({ ...s, template: "landscape" }).success);
assert(
  !VideoSchema.safeParse({ ...s, scenes: [{ ...s.scenes[0], duration: 0 }] })
    .success,
);
assert.equal(s.words.map((w) => w.text).join(" "), s.narration);
assert(
  Math.abs(s.scenes.reduce((x, a) => x + a.duration, 0) - s.duration) < 0.04,
);
const capture = JSON.parse(
  fs.readFileSync("output/test-run/capture.json", "utf8"),
);
assert.equal(capture.captures.length, 2);
for (const c of capture.captures)
  assert.equal(c.actual.trim(), capture.expected);
console.log(
  "6 invariant checks passed; desktop/mobile actual decode assertions passed.",
);
