import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setChromeMode("chrome-for-testing");
Config.setBrowserExecutable(process.env.CHROMIUM_PATH || "/usr/bin/chromium");

import path from "node:path";
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: { ...c.resolve?.alias, "@": path.resolve("src") },
  },
}));
