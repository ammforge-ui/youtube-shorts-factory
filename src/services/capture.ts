import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { json, run } from "./system";
export async function capture(
  out: string,
  options: { message?: string; premium?: boolean } = {},
) {
  const root = process.env.CYBERCHEF_DIR || "/workspace/tools/cyberchef";
  const server = createServer((req, res) => {
    const p = path.join(
      root,
      decodeURIComponent((req.url || "/").split("?")[0]),
    );
    if (
      !p.startsWith(root + "/") ||
      !fs.existsSync(p) ||
      !fs.statSync(p).isFile()
    ) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      p.endsWith(".html")
        ? "text/html"
        : p.endsWith(".js")
          ? "text/javascript"
          : p.endsWith(".css")
            ? "text/css"
            : "application/octet-stream",
    );
    fs.createReadStream(p).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const evidence: any = {
    version: "11.5.0",
    mode: "official release served locally",
    input: Buffer.from(options.message || "Build something useful.").toString(
      "base64",
    ),
    expected: options.message || "Build something useful.",
    captures: [],
  };
  try {
    for (const mobile of [false, true]) {
      const name = mobile ? "mobile" : "desktop";
      const ctx = await browser.newContext({
        viewport: mobile
          ? { width: 480, height: 850 }
          : { width: 1000, height: 1050 },
        deviceScaleFactor: 1,
        recordVideo: {
          dir: out + "/raw",
          size: mobile
            ? { width: 480, height: 850 }
            : { width: 1000, height: 1050 },
        },
        isMobile: mobile,
        hasTouch: mobile,
      });
      const recordStarted = Date.now();
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${port}/CyberChef_v11.5.0.html`, {
        waitUntil: "load",
        timeout: 60000,
      });
      await page.locator("#input-text .cm-content").waitFor({ timeout: 30000 });
      await page.addStyleTag({
        content: ".popover,.tooltip {display:none !important;}",
      });
      if (mobile)
        await page.addStyleTag({
          content:
            ".cm-content {font-size:28px !important;line-height:1.5 !important;}",
        });
      if (options.premium)
        await page.addStyleTag({
          content:
            ".cm-content{font-size:20px !important;line-height:1.4 !important;}",
        });
      await page.waitForTimeout(800);
      const readyAt = (Date.now() - recordStarted) / 1000;
      const coordinateScale =
        (page.viewportSize()?.width || 1000) /
        (await page.evaluate(() => window.innerWidth));
      const toPixels = (r: any) =>
        r
          ? {
              x: r.x * coordinateScale,
              y: r.y * coordinateScale,
              width: r.width * coordinateScale,
              height: r.height * coordinateScale,
            }
          : null;
      const timeline: Record<string, number> = { ready: readyAt };
      const targets: Record<string, unknown> = {};
      for (const [key, selector] of Object.entries({
        input: "#input-text",
        output: "#output-text",
        search: "#search",
        recipe: "#recipe",
      })) {
        const box = await page.locator(selector).first().boundingBox();
        if (box) targets[key] = toPixels(box);
      }
      await page.screenshot({ path: `${out}/${name}-before.png` });
      timeline.input = (Date.now() - recordStarted) / 1000;
      await page.locator("#input-text .cm-content").click();
      if (options.premium) {
        await page.waitForTimeout(250);
        await page.keyboard.insertText(evidence.input);
      } else await page.keyboard.type(evidence.input, { delay: 75 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${out}/${name}-input.png` });
      timeline.select = (Date.now() - recordStarted) / 1000;
      const operation = page.getByText("From Base64", { exact: true }).first();
      targets.operation = toPixels(await operation.boundingBox());
      await operation.dblclick();
      await page.mouse.move(10, 25);
      await page.waitForFunction(
        (expected: string) =>
          document
            .querySelector("#output-text")
            ?.textContent?.includes(expected),
        evidence.expected,
        { timeout: 30000 },
      );
      timeline.result = (Date.now() - recordStarted) / 1000;
      await page.mouse.move(10, 25);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${out}/${name}-result.png` });
      await page.waitForTimeout(6000);
      const actual = await page.locator("#output-text .cm-content").innerText();
      if (actual.trim() !== evidence.expected)
        throw new Error("Decode assertion failed: " + actual);
      const v = page.video()!;
      await ctx.close();
      const raw = await v.path();
      run("ffmpeg", [
        "-v",
        "error",
        "-y",
        "-i",
        raw,
        "-an",
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        `${out}/${name}.mp4`,
      ]);
      let landmarks;
      if (options.premium) {
        const metadataFile = `${out}/${name}-capture-geometry.json`;
        json(metadataFile, { targets, coordinateScale });
        landmarks = JSON.parse(
          run("python", [
            "scripts/align-recording.py",
            `${out}/${name}.mp4`,
            `${out}/${name}-input.png`,
            `${out}/${name}-result.png`,
            metadataFile,
          ]),
        );
      }
      evidence.captures.push({
        name,
        actual,
        errors,
        readyAt,
        landmarks,
        timeline,
        targets,
        coordinateScale,
        editorFontPx: options.premium
          ? 20 * coordinateScale
          : (mobile ? 28 : 14) * coordinateScale,
        viewport: mobile
          ? { width: 480, height: 850 }
          : { width: 1000, height: 1050 },
        recording: `${name}.mp4`,
      });
    }
  } finally {
    await browser.close();
    server.close();
  }
  json(out + "/capture.json", evidence);
  return evidence;
}
