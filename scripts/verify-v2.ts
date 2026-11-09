import fs from "node:fs";
import { VideoSchema } from "../src/schemas/video";
import { inspectPremium } from "../src/directors/QualityController";
const out = process.argv[2] || "output/cyberchef-v2";
const spec = VideoSchema.parse(
  JSON.parse(fs.readFileSync(out + "/storyboard-v2.json", "utf8")),
);
const q = inspectPremium(out, spec);
console.log(
  JSON.stringify(
    {
      passed: q.passed,
      technical: q.technical,
      retention: q.retention.measurements,
      media: q.media,
      audio: q.audio,
    },
    null,
    2,
  ),
);
if (!q.passed) process.exitCode = 1;
