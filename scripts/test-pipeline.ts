process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
if (process.argv.includes("--legacy")) {
  const { pipeline } = await import("../src/services/pipeline");
  await pipeline(
    "output/legacy-retest",
    "discovery",
    process.argv.includes("--reuse"),
  );
} else {
  const { premiumPipeline } = await import("../src/services/premiumPipeline");
  await premiumPipeline(
    process.argv.find((x) => x.startsWith("--out="))?.slice(6) || `output/pipeline-check-${Date.now()}`,
    (process.argv.find((x) => x.startsWith("--template="))?.split("=")[1] ||
      "discovery") as "discovery" | "mobile" | "before-after",
    process.argv.includes("--reuse"),
  );
}
export {};
