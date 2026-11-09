import fs from "node:fs";
import { VideoSchema } from "../src/schemas/video";
import { verify } from "../src/services/quality";
const out = process.argv[2] || "output/test-run";
const q = verify(
  out,
  VideoSchema.parse(
    JSON.parse(fs.readFileSync(out + "/storyboard.json", "utf8")),
  ),
);
console.log(JSON.stringify(q, null, 2));
if (!q.passed) process.exitCode = 1;
