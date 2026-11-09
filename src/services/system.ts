import { execFileSync } from "node:child_process";
import fs from "node:fs";
export const json = (p: string, v: unknown) => {
  fs.mkdirSync(p.slice(0, p.lastIndexOf("/")) || ".", { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
};
export const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
export const probe = (p: string) =>
  JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-show_format",
      "-show_streams",
      "-of",
      "json",
      p,
    ]),
  );
