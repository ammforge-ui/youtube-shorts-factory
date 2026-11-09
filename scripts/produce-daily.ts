import fs from "node:fs";
import { json } from "../src/services/system";
process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
const config = JSON.parse(fs.readFileSync("config/production.json", "utf8"));
const count = Number(process.env.PRODUCTION_COUNT || config.dailyCount);
if (!Number.isInteger(count) || count < 1 || count > 3)
  throw new Error("PRODUCTION_COUNT must be 1–3");
const h = "data/production-history/history.json";
const history = fs.existsSync(h) ? JSON.parse(fs.readFileSync(h, "utf8")) : [];
const eligible = config.topicQueue
  .map((p: string) => ({ p, topic: JSON.parse(fs.readFileSync(p, "utf8")) }))
  .filter((x: any) => !history.some((r: any) => r.id === x.topic.id));
const chosen = eligible.slice(0, count);
const results = [];
const day = new Date().toISOString().replace(/[:.]/g, "-");
const { pipeline } = await import("../src/services/pipeline");
for (const { p, topic } of chosen) {
  try {
    const out = `output/daily-${day}/${topic.id}`;
    await pipeline(out, topic.template, false, p);
    results.push({ id: topic.id, out, status: "technical-qc-passed" });
  } catch (e) {
    results.push({ id: topic.id, status: "failed", error: String(e) });
  }
}
const report = {
  requested: count,
  produced: results.filter((r) => r.status === "technical-qc-passed").length,
  results,
  remainingCapability:
    "Curated verified queue only. Autonomous open-web topic discovery, new product capture adapters, and three distinct verified subjects are not implemented.",
  reason:
    chosen.length < count
      ? "Insufficient new verified topics; duplicates are not manufactured."
      : null,
};
json(`output/daily-${day}/daily-report.json`, report);
console.log(JSON.stringify(report, null, 2));
if (report.produced < count) process.exitCode = 2;
