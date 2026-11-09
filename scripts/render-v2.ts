process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
const { premiumPipeline } = await import("../src/services/premiumPipeline");
await premiumPipeline(
  "output/cyberchef-v2",
  (process.argv.find((x) => x.startsWith("--template="))?.split("=")[1] ||
    "discovery") as "discovery" | "mobile" | "before-after",
  process.argv.includes("--reuse"),
  "data/cyberchef-v2.json",
  process.argv.includes("--stills"),
);

export {};
