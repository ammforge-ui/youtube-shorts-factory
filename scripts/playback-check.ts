import { createServer } from "node:http";
import fs from "node:fs";
import { chromium } from "playwright";
import { json } from "../src/services/system";
const file = "output/test-run/final.mp4";
const server = createServer((req, res) => {
  const size = fs.statSync(file).size;
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Accept-Ranges", "bytes");
  const match = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if (match) {
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": end - start + 1,
    });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    res.setHeader("Content-Length", size);
    fs.createReadStream(file).pipe(res);
  }
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as { port: number }).port;
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
try {
  const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
  page.setDefaultTimeout(15000);
  await page.setContent(
    `<body style="margin:0;background:#10151d;display:flex;justify-content:center"><video controls style="height:850px;max-width:100%" src="http://127.0.0.1:${port}/final.mp4"></video></body>`,
  );
  await page.waitForFunction(
    () => document.querySelector("video")!.readyState >= 2,
  );
  await page.evaluate(async () => {
    const v = document.querySelector("video")!;
    v.muted = true;
    await v.play();
  });
  await page.waitForFunction(
    () => document.querySelector("video")!.currentTime > 1,
  );
  const initial = await page
    .locator("video")
    .evaluate((v) => (v as HTMLVideoElement).currentTime);
  await page.evaluate(() => {
    const v = document.querySelector("video")!;
    v.pause();
    v.currentTime = 14;
  });
  await page.waitForFunction(() => {
    const v = document.querySelector("video")!;
    return (
      !v.seeking && v.readyState >= 2 && Math.abs(v.currentTime - 14) < 0.2
    );
  });
  const result = await page.evaluate(() => {
    const v = document.querySelector("video")!;
    return {
      width: v.videoWidth,
      height: v.videoHeight,
      duration: v.duration,
      seekTime: v.currentTime,
      readyState: v.readyState,
      error: v.error,
    };
  });
  if (result.width !== 1080 || result.error)
    throw new Error(JSON.stringify(result));
  await page.screenshot({ path: "output/test-run/playback.png" });
  json("output/test-run/playback-check.json", {
    ...result,
    initialPlaybackAdvanced: initial > 1,
    passed: true,
  });
  console.log(result);
} finally {
  await browser.close();
  server.close();
}
