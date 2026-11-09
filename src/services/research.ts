import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { json } from "./system";
export async function research(out: string) {
  const candidates = JSON.parse(
    fs.readFileSync("data/research-candidates.json", "utf8"),
  );
  const sourceDir = out + "/research-sources";
  fs.mkdirSync(sourceDir, { recursive: true });
  const results = await Promise.all(
    candidates.map(async (c: any) => {
      const file =
        sourceDir +
        "/" +
        c.name.toLowerCase().replace(/[^a-z0-9]/g, "-") +
        ".md";
      try {
        const { stdout } = await promisify(execFile)(
          "curl",
          [
            "-fsSL",
            "--max-time",
            "20",
            "--output",
            file,
            "--write-out",
            "%{http_code}",
            c.source,
          ],
          { maxBuffer: 1024 * 1024 },
        );
        return {
          ...c,
          recheckedAt: new Date().toISOString(),
          currentSourceStatus: Number(stdout),
          evidenceFile: file,
          sourceBytes: fs.statSync(file).size,
        };
      } catch (e) {
        return {
          ...c,
          recheckedAt: new Date().toISOString(),
          currentSourceStatus: String(e),
        };
      }
    }),
  );
  const selected = {
    name: "CyberChef",
    officialWebsite: "https://gchq.github.io/CyberChef/",
    officialSource: "https://github.com/gchq/CyberChef",
    release: "https://github.com/gchq/CyberChef/releases/tag/v11.5.0",
    verifiedFeatures: [
      "From Base64 decodes the recorded input to Build something useful.",
      "Recipe operations execute with Auto Bake",
      "Official downloadable browser application runs locally",
    ],
    claimsSources: ["https://github.com/gchq/CyberChef/blob/master/README.md"],
    reason:
      "No account, no payment, meaningful deterministic result; official release available despite hosted-site restrictions.",
    angle:
      "Turn an encoded message into readable English without calling it encryption breaking.",
    limitations: [
      "Hosted website blocked by cloud network policy. Actual official release recorded locally.",
      "Candidate scores are editorial judgments, not measured audience data.",
      "Photopea official documentation could not be retrieved; its capabilities remain unverified here.",
    ],
  };
  const r = {
    checkedAt: new Date().toISOString(),
    candidates: results,
    selected,
  };
  json(out + "/research.json", r);
  return r;
}
