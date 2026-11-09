import fs from "node:fs";
import { capture } from "./capture";
import { research } from "./research";
import { json, run } from "./system";
import { cyberchefStory } from "../directors/StoryDirector";
import { directAudio } from "../directors/AudioDirector";
import { srt } from "../directors/CaptionDirector";
import { inspectRetention } from "../directors/RetentionDirector";
import { inspectPremium } from "../directors/QualityController";
import { render } from "./render";
import type { VideoSpec } from "../schemas/video";
export async function premiumPipeline(
  out = "output/cyberchef-v2",
  template: VideoSpec["template"] = "discovery",
  reuse = false,
  topicPath = "data/cyberchef-v2.json",
  stillsOnly = false,
) {
  fs.mkdirSync(out, { recursive: true });
  const topic = JSON.parse(fs.readFileSync(topicPath, "utf8"));
  if (topic.id !== "cyberchef-base64-v2")
    throw new Error("No verified premium capture adapter for " + topic.id);
  await research(out);
  json(out + "/topic.json", topic);
  if (!reuse || !fs.existsSync(out + "/capture.json"))
    await capture(out, { message: topic.example, premium: true });
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
    ),
    evidence = JSON.parse(fs.readFileSync(out + "/capture.json", "utf8"));
  const key = out.replace(/^output\//, "").replace(/[^a-zA-Z0-9_-]/g, "-");
  const media = "public/media/" + key;
  fs.mkdirSync(media, { recursive: true });
  for (const file of [
    "desktop.mp4",
    "mobile.mp4",
    "desktop-before.png",
    "desktop-input.png",
    "desktop-result.png",
    "mobile-input.png",
    "mobile-result.png",
  ])
    fs.copyFileSync(out + "/" + file, media + "/" + file);
  const spec = cyberchefStory({
    topic,
    voice,
    capture: evidence,
    key,
    template,
  });
  const retention = inspectRetention(spec);
  json(out + "/retention-report.json", retention);
  if (!retention.passed)
    throw new Error(
      "Creative preflight failed: " + JSON.stringify(retention.checks),
    );
  directAudio(out, spec);
  for (const file of ["mix.wav", "music.wav"])
    fs.copyFileSync(out + "/" + file, media + "/" + file);
  json(out + "/storyboard-v2.json", spec);
  fs.writeFileSync(out + "/script-v2.txt", spec.narration + "\n");
  fs.writeFileSync(out + "/captions-v2.srt", srt(spec.words));
  console.log("Premium render:", spec.duration, "seconds");
  await render(spec, out, stillsOnly, "final-v2.mp4");
  if (stillsOnly) return spec;
  const q = inspectPremium(out, spec);
  if (!q.passed)
    throw new Error("Premium QC failed: " + JSON.stringify(q.technical));
  run("python", ["scripts/review-v2.py", out]);
  console.log(
    run(process.execPath, [
      "node_modules/tsx/dist/cli.mjs",
      "scripts/playback-check.ts",
      out,
      "final-v2.mp4",
    ]),
  );
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
    review: "Editorial/listening review required",
  });
  json(historyFile, history);
  fs.writeFileSync(
    out + "/production-report.md",
    `# CyberChef V2 production\n\n${q.media.duration}s, 1080 × 1920, 30 FPS, H.264/AAC, ${q.media.bytes} bytes.\n\nActual official CyberChef release served locally. Fictional example: ${topic.example}. Real desktop/mobile decoding assertions passed. Opening transformation is labeled an illustration; actual application footage begins at the tool introduction.\n\nNarration generated locally and acoustically aligned. Original 116 BPM music and distinct event effects synthesized from source. Speech-aware music ducking and stem checks executed. No external copyrighted music or samples. Perceptual listening review remains required; no human audition is claimed.\n\nTechnical and editorial heuristic checks: ${q.passed ? "PASS" : "FAIL"}. Quality category scores are provisional and explicitly label subjective judgments. They do not predict YouTube retention. See quality-report.json, audio-report.json and retention-report.json.\n\nOriginal v1 retained. New soundtrack, phrase captions, measured camera paths and story directives are reusable. Only the CyberChef topic adapter currently exists; autonomous daily discovery and additional capture adapters remain unfinished. No upload performed.\n`,
  );
  console.log("\nCompleted " + out + "/final-v2.mp4");
  return spec;
}
