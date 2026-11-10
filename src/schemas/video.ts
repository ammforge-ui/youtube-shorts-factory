import { z } from "zod";
export const Word = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().positive(),
});
export const Rect = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});
export const SoundEvent = z.object({
  event: z.string(),
  frame: z.number().int().nonnegative(),
  sound: z.enum([
    "digital_pop",
    "soft_whoosh",
    "ui_click",
    "keyboard",
    "light_glitch",
    "digital_reveal",
    "soft_impact",
    "text_accent",
    "transition",
    "ending",
  ]),
  intensity: z.number().min(0).max(1),
});
export const Direction = z.object({
  purpose: z.enum([
    "hook",
    "curiosity",
    "intro",
    "demonstration",
    "payoff",
    "takeaway",
    "cta",
  ]),
  layout: z.enum([
    "cipher",
    "transform",
    "browser",
    "detail",
    "result",
    "explainer",
    "ending",
    "comparison",
    "device",
  ]),
  graphic: z
    .object({
      heading: z.string(),
      contrast: z.string().optional(),
      subheading: z.string().optional(),
      explanation: z.string().optional(),
      cards: z
        .array(
          z.object({
            heading: z.string(),
            body: z.string(),
            detail: z.string(),
          }),
        )
        .default([]),
    })
    .optional(),
  narration: z.string(),
  asset: z.string(),
  mediaType: z.enum(["video", "image"]),
  sourceWidth: z.number().positive(),
  sourceHeight: z.number().positive(),
  sourceFontPx: z.number().positive().default(20),
  camera: z
    .array(z.object({ frame: z.number().nonnegative(), target: Rect }))
    .min(1),
  focus: Rect.optional(),
  cursor: z
    .array(
      z.object({
        frame: z.number().nonnegative(),
        x: z.number(),
        y: z.number(),
        click: z.boolean().default(false),
      }),
    )
    .default([]),
  typography: z.enum(["hook", "explainer", "caption"]),
  captionPlacement: z.enum(["bottom", "top"]).default("bottom"),
  transition: z.enum(["cut", "slide", "mask", "scale"]),
  musicIntensity: z.number().min(0).max(1),
  tone: z.enum(["curious", "playful", "clear", "satisfying"]),
  motion: z.enum([
    "zoom-in",
    "zoom-out",
    "pan",
    "slide-reveal",
    "masked-reveal",
    "text-pop",
    "kinetic",
    "spotlight",
    "cursor",
    "before-after",
    "split-screen",
    "browser-card",
    "device",
    "result-emphasis",
    "parallax",
  ]),
});
export const Scene = z.object({
  title: z.string().max(60),
  eyebrow: z.string(),
  detail: z.string().max(120),
  duration: z.number().positive(),
  shot: z.enum(["overview", "input", "action", "result", "mobile", "cta"]),
  footage: z.string(),
  startFrom: z.number().nonnegative().default(0),
  direction: Direction.optional(),
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
  creative: z
    .object({
      version: z.union([z.literal(2), z.literal(3)]),
      example: z.string(),
      encoded: z.string(),
      bpm: z.number().min(105).max(125),
      soundEvents: z.array(SoundEvent),
      brand: z.string(),
      musicAsset: z.string(),
    })
    .optional(),
});
export type VideoSpec = z.infer<typeof VideoSchema>;

export type CreativeDirection = z.infer<typeof Direction>;
export type AudioEvent = z.infer<typeof SoundEvent>;
export type FocusRect = z.infer<typeof Rect>;
