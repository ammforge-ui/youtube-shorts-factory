import { z } from "zod";
export const Word = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().positive(),
});
export const Scene = z.object({
  title: z.string().max(60),
  eyebrow: z.string(),
  detail: z.string().max(120),
  duration: z.number().positive(),
  shot: z.enum(["overview", "input", "action", "result", "mobile", "cta"]),
  footage: z.string(),
  startFrom: z.number().nonnegative().default(0),
});
export const VideoSchema = z.object({
  id: z.string(),
  template: z.enum(["discovery", "mobile", "before-after"]),
  product: z.string(),
  url: z.string(),
  localCopy: z.boolean(),
  duration: z.number().min(25).max(40),
  narration: z.string(),
  audio: z.string(),
  words: z.array(Word).min(1),
  scenes: z.array(Scene).min(3),
});
export type VideoSpec = z.infer<typeof VideoSchema>;
