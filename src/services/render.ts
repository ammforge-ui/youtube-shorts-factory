import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import path from "node:path";
import type { VideoSpec } from "../schemas/video";
export async function render(spec: VideoSpec, out: string, onlyStills = false) {
  const serveUrl = await bundle({
    entryPoint: "src/remotion/index.ts",
    webpackOverride: (c) => ({
      ...c,
      resolve: {
        ...c.resolve,
        alias: { ...c.resolve?.alias, "@": path.resolve("src") },
      },
    }),
  });
  const browserExecutable = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
  const inputProps = { spec };
  const composition = await selectComposition({
    serveUrl,
    id: spec.template,
    inputProps,
    browserExecutable,
  });
  let lastProgress = -1;
  if (!onlyStills)
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: "h264",
      audioCodec: "aac",
      pixelFormat: "yuv420p",
      crf: 19,
      outputLocation: out + "/final.mp4",
      browserExecutable,
      concurrency: 2,
      chromiumOptions: { disableWebSecurity: false },
      onProgress: ({ progress }) => {
        const tick = Math.floor(progress * 10) * 10;
        if (tick !== lastProgress) {
          lastProgress = tick;
          process.stdout.write(`\rRender ${tick}%`);
        }
      },
    });
  let t = 0;
  for (let i = 0; i < spec.scenes.length; i++) {
    const s = spec.scenes[i];
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      output: out + `/scene-${i}.png`,
      frame: Math.min(
        Math.round((t + Math.min(1.5, s.duration / 2)) * 30),
        composition.durationInFrames - 1,
      ),
      browserExecutable,
    });
    t += s.duration;
  }
}
