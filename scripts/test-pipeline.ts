process.env.PLAYWRIGHT_BROWSERS_PATH ||= "/workspace/pw-browsers";
const { pipeline } = await import("../src/services/pipeline");
await pipeline(
  "output/test-run",
  process.argv.find((x) => x.startsWith("--template="))?.split("=")[1] ||
    "discovery",
  process.argv.includes("--reuse"),
);

export {};
