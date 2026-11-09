process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
import fs from "node:fs";
import { cyberchefStory } from "../src/directors/StoryDirector";
import { render } from "../src/services/render";
import { json } from "../src/services/system";
import { VideoSchema } from "../src/schemas/video";
const out = "output/cyberchef-v2";
const topic = JSON.parse(fs.readFileSync("data/cyberchef-v2.json", "utf8")),
  voice = JSON.parse(fs.readFileSync(out + "/narration.wav.json", "utf8")),
  capture = JSON.parse(fs.readFileSync(out + "/capture.json", "utf8"));
const previews: any = {};
for (const template of ["discovery", "mobile", "before-after"] as const)
  previews[template] = cyberchefStory({
    topic,
    voice,
    capture,
    key: "cyberchef-v2",
    template,
  });
json("data/preview-v2.json", previews);
for (const template of ["mobile", "before-after"] as const) {
  const dir = "output/premium-template-" + template;
  fs.mkdirSync(dir, { recursive: true });
  await render(previews[template], dir, true);
  console.log(template, "preview + DOM audit passed");
}
const legacy = VideoSchema.parse(
  JSON.parse(fs.readFileSync("output/test-run/storyboard.json", "utf8")),
);
fs.mkdirSync("output/legacy-compatibility", { recursive: true });
await render(legacy, "output/legacy-compatibility", true);
console.log("Legacy actual render compatibility passed");
