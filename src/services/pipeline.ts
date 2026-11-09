import fs from "node:fs";
import path from "node:path";
import { capture } from "./capture";
import { research } from "./research";
import { json, run, probe } from "./system";
import { mixAudio } from "./audio";
import { render } from "./render";
import { verify } from "./quality";
import { VideoSchema } from "../schemas/video";
const stamp = (s: number) => {
  const ms = Math.round(s * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
export async function pipeline(
  out = "output/test-run",
  template = "discovery",
  reuse = false,
  topicPath = "data/test-topic.json",
) {
  fs.mkdirSync(out, { recursive: true });
  const topic = JSON.parse(fs.readFileSync(topicPath, "utf8"));
  topic.template = template;
  if (topic.id === "cyberchef-base64-v2") {
    const { premiumPipeline } = await import("./premiumPipeline");
    return premiumPipeline(
      out,
      template as "discovery" | "mobile" | "before-after",
      reuse,
      topicPath,
    );
  }
  if (topic.id !== "cyberchef-base64" || topic.product !== "CyberChef")
    throw new Error("Unsupported capture/script adapter: " + topic.id);
  await research(out);
  if (!reuse || !fs.existsSync(out + "/capture.json")) await capture(out);
  json(out + "/topic.json", topic);
  if (!reuse || !fs.existsSync(out + "/narration.wav.json"))
    console.log(
      run("python", [
        "scripts/tts.py",
        out + "/topic.json",
        out + "/narration.wav",
      ]),
    );
  const voice = JSON.parse(
    fs.readFileSync(out + "/narration.wav.json", "utf8"),
  );
  const duration = Math.ceil((voice.duration + 0.65) * 30) / 30;
  if (duration < 25 || duration > 40)
    throw new Error("Narration duration outside Shorts target: " + duration);
  const w = voice.words;
  const at = (word: string, n = 0) =>
    w.filter(
      (x: any) => x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === word,
    )[n]?.start;
  const boundaries = [
    0,
    at("meet"),
    at("here"),
    at("then"),
    at("auto"),
    at("that", 2),
    at("save"),
    duration,
  ];
  if (boundaries.some((x) => typeof x !== "number"))
    throw new Error("Missing storyboard anchor");
  const rows = [
    [
      "Decode the mystery.",
      "THE HOOK",
      "Random-looking text. A readable message.",
      "input",
      3,
    ],
    [
      "Meet CyberChef.",
      "THE DISCOVERY",
      "A free, open-source browser toolbox.",
      "overview",
      3,
    ],
    [
      "Paste the message.",
      "01 / INPUT",
      "This example is Base64-encoded text.",
      "input",
      3,
    ],
    [
      "Add From Base64.",
      "02 / RECIPE",
      "Double-click the operation. Auto Bake is on.",
      "action",
      6.3,
    ],
    [
      "Build something useful.",
      "03 / RESULT",
      "A real decoded result, straight from the browser.",
      "result",
      6,
    ],
    [
      "Decode. Don’t decrypt.",
      "KNOW THE DIFFERENCE",
      "Base64 is encoding. It is not encryption.",
      "result",
      7,
    ],
    [
      "Keep this tool handy.",
      "YOUR NEXT DISCOVERY",
      "Save CyberChef. Follow for useful software.",
      "cta",
      0,
    ],
  ];
  const key = out.replace(/^output\//, "").replace(/[^a-zA-Z0-9_-]/g, "-");
  const mediaDir = "public/media/" + key;
  fs.mkdirSync(mediaDir, { recursive: true });
  for (const f of [
    "desktop.mp4",
    "mobile.mp4",
    "desktop-result.png",
    "mobile-result.png",
    "desktop-input.png",
    "mobile-input.png",
  ])
    fs.copyFileSync(out + "/" + f, mediaDir + "/" + f);
  const captureData = JSON.parse(
    fs.readFileSync(out + "/capture.json", "utf8"),
  );
  const ready =
    captureData.captures.find(
      (x: any) => x.name === (template === "mobile" ? "mobile" : "desktop"),
    ).readyAt ?? 3;
  const scenes = rows.map((r, i) => ({
    title: r[0],
    eyebrow: r[1],
    detail: r[2],
    shot: r[3],
    duration: boundaries[i + 1] - boundaries[i],
    footage: `media/${key}/${template === "mobile" ? "mobile" : "desktop"}.mp4`,
    startFrom: Math.max(0, Number(r[4]) + ready - 3 + 0.3),
  }));
  mixAudio(out, duration, [boundaries[3], boundaries[4], boundaries[6]]);
  fs.copyFileSync(out + "/mix.wav", mediaDir + "/mix.wav");
  const spec = VideoSchema.parse({
    ...topic,
    duration,
    audio: `media/${key}/mix.wav`,
    words: w,
    scenes,
  });
  json(out + "/storyboard.json", spec);
  fs.writeFileSync(out + "/script.txt", topic.narration + "\n");
  let srt = "";
  for (let i = 0; i < w.length; i += 4) {
    const group = w.slice(i, i + 4);
    srt += `${i / 4 + 1}\n${stamp(group[0].start)} --> ${stamp(group.at(-1).end)}\n${group.map((x: any) => x.text).join(" ")}\n\n`;
  }
  fs.writeFileSync(out + "/captions.srt", srt);
  fs.writeFileSync(
    out + "/title.txt",
    "Decode Base64 in your browser with CyberChef #Shorts\n",
  );
  fs.writeFileSync(
    out + "/description.txt",
    "CyberChef is a free, open-source browser toolbox. This original recording uses the official v11.5.0 local release. We decode a harmless Base64 example; this is not encryption breaking.\nTry it: https://gchq.github.io/CyberChef/\nSource: https://github.com/gchq/CyberChef\nNarration: local Piper LJ Speech voice. Original synthesized sound effects; no third-party music.\n",
  );
  fs.writeFileSync(
    out + "/hashtags.txt",
    "#Shorts #CyberChef #DeveloperTools #Productivity\n",
  );
  console.log("Rendering", duration, "seconds");
  await render(spec, out);
  const quality = verify(out, spec);
  if (!quality.passed)
    throw new Error("QC failed: " + JSON.stringify(quality.technical));
  const historyFile = "data/production-history/history.json";
  const history = fs.existsSync(historyFile)
    ? JSON.parse(fs.readFileSync(historyFile, "utf8"))
    : [];
  history.push({
    id: spec.id,
    template,
    createdAt: new Date().toISOString(),
    out,
    status: "technical-qc-passed",
    review: "visual/audio editorial approval required",
  });
  json(historyFile, history);
  fs.writeFileSync(
    out + "/production-report.md",
    `# Production report\n\nRendered ${duration.toFixed(2)} seconds at 1080 × 1920, 30 FPS, H.264/AAC.\n\nActual CyberChef official release recorded locally in desktop and mobile Chromium. Hosted site blocked by network policy. Candidate findings and source access status are in research.json. No fixture used.\n\nNarration: local neural Piper LJ Speech; actual-audio PocketSphinx word alignment. Audio normalized with sidechain ducking on original synthesized cues. No third-party music.\n\nTechnical QC: ${quality.passed ? "PASS" : "FAIL"}. See quality-report.json. Representative frames saved. Editorial listening and human caption review remain recommended before publication.\n\nRemotionUI installed via official CLI and local registry built from official GitHub source; see docs/remotionui.md.\n\nNo YouTube upload performed. Daily topic discovery beyond the curated CyberChef adapter remains unfinished.\n`,
  );
  console.log("\nCompleted:", out + "/final.mp4");
  return spec;
}
