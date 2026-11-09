import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import type { VideoSpec } from "../schemas/video";
export async function render(
  spec: VideoSpec,
  out: string,
  onlyStills = false,
  filename = "final.mp4",
  frameRange?: [number, number],
) {
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
      frameRange,
      codec: "h264",
      audioCodec: "aac",
      pixelFormat: "yuv420p",
      crf: 19,
      outputLocation: out + "/" + filename,
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
  if (frameRange) return;
  const layoutRecords: any[] = [];
  const captureLayout = (log: { text: string }) => {
    const marker = "__FACTORY_LAYOUT__";
    const i = log.text.indexOf(marker);
    if (i >= 0) {
      try {
        layoutRecords.push(JSON.parse(log.text.slice(i + marker.length)));
      } catch {}
    }
  };
  let t = 0;
  for (let i = 0; i < spec.scenes.length; i++) {
    const s = spec.scenes[i];
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      output: out + `/scene-${i}.png`,
      onBrowserLog: captureLayout,
      frame: Math.min(
        Math.round((t + Math.min(1.5, s.duration / 2)) * 30),
        composition.durationInFrames - 1,
      ),
      browserExecutable,
    });
    t += s.duration;
  }
  if (spec.creative) {
    const violations = layoutRecords.flatMap((r) =>
      r.regions.flatMap((region: any) =>
        region.textRects
          .filter(
            (b: any) =>
              b.x < 55 ||
              b.x + b.width > 960 ||
              b.y < 95 ||
              b.y + b.height > 1705,
          )
          .map((b: any) => ({ frame: r.frame, kind: region.kind, ...b })),
      ),
    );
    const overlaps = layoutRecords.flatMap((r) => {
      const captions = r.regions.filter((x: any) => x.kind === "caption");
      const targets = r.regions.filter(
        (x: any) => x.kind === "footage" || x.kind === "title",
      );
      return captions.flatMap((a: any) =>
        targets
          .filter(
            (b: any) =>
              a.x < b.x + b.width &&
              a.x + a.width > b.x &&
              a.y < b.y + b.height &&
              a.y + a.height > b.y,
          )
          .map((b: any) => ({ frame: r.frame, a: a.kind, b: b.kind })),
      );
    });
    const report = {
      method:
        "Measured browser DOM text geometry at representative renderStill frames after font readiness",
      sampleCount: layoutRecords.length,
      passed:
        layoutRecords.length > 0 && !violations.length && !overlaps.length,
      violations,
      overlaps,
      records: layoutRecords,
    };
    fs.writeFileSync(
      out + "/layout-report.json",
      JSON.stringify(report, null, 2),
    );
    if (!report.passed)
      throw new Error(
        "Visual layout audit failed: " +
          JSON.stringify({ violations, overlaps, samples: report.sampleCount }),
      );
  }
}
