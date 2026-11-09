import fs from "node:fs";
import { render } from "../src/services/render";
import { VideoSchema } from "../src/schemas/video";
const s = VideoSchema.parse(
  JSON.parse(fs.readFileSync("output/test-run/storyboard.json", "utf8")),
);
for (const template of ["mobile", "before-after"] as const) {
  const out = "output/template-check-" + template;
  fs.mkdirSync(out, { recursive: true });
  await render(
    {
      ...s,
      template,
      scenes: s.scenes.map((x) => ({
        ...x,
        footage:
          template === "mobile"
            ? x.footage.replace("desktop", "mobile")
            : x.footage,
        shot: x.shot,
      })),
    },
    out,
    true,
  );
  console.log("Stills rendered for", template);
}
