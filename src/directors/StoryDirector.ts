import {
  VideoSchema,
  type VideoSpec,
  type CreativeDirection,
  type FocusRect,
} from "../schemas/video";
import { focusPath } from "./ScreenFocusDirector";
type Input = {
  topic: any;
  voice: { duration: number; words: VideoSpec["words"] };
  capture: any;
  key: string;
  template: VideoSpec["template"];
};
/** CyberChef story adapter; framework rendering consumes only the resulting directions. */
export function cyberchefStory({
  topic,
  voice,
  capture,
  key,
  template,
}: Input): VideoSpec {
  const w = voice.words;
  const at = (s: string, n = 0) => {
    const x = w.filter(
      (x) => x.text.replace(/[^a-z0-9]/gi, "").toLowerCase() === s,
    )[n];
    if (!x) throw new Error("Story anchor missing: " + s);
    return Math.round(x.start * 30) / 30;
  };
  const phrase = (text: string) => {
    const tokens = text.split(" ");
    const index = w.findIndex((_, i) =>
      tokens.every(
        (token, j) =>
          w[i + j]?.text.replace(/[^a-z0-9]/gi, "").toLowerCase() === token,
      ),
    );
    if (index < 0) throw new Error("Missing story phrase " + text);
    return Math.round(w[index].start * 30) / 30;
  };
  const duration = Math.ceil((voice.duration + 0.4) * 30) / 30;
  const bounds = [
    0,
    at("meet"),
    at("here"),
    at("paste"),
    at("find"),
    at("auto"),
    phrase("no password"),
    phrase("it changes"),
    at("save"),
    duration,
  ];
  const c = capture.captures.find(
    (x: any) => x.name === (template === "mobile" ? "mobile" : "desktop"),
  );
  const source = c.viewport;
  const b = c.targets;
  const panel = (r: any): FocusRect => ({
    x: r.x - 18 * (c.coordinateScale || 1),
    y: r.y + 8,
    width: Math.min(r.width + 12, 420 * (c.coordinateScale || 1)),
    height: 145,
  });
  const input = panel(b.input),
    output = panel(b.output);
  const recipe = {
    x: b.recipe.x,
    y: b.recipe.y,
    width: Math.min(b.recipe.width, 380),
    height: 290,
  };
  const full = { x: 0, y: 0, width: source.width, height: source.height };
  const rows: [
    string,
    CreativeDirection["purpose"],
    CreativeDirection["layout"],
    FocusRect,
    number,
    CreativeDirection["motion"],
  ][] = [
    [
      "What does this say?",
      "hook",
      "cipher",
      input,
      Math.max(
        c.timeline.ready,
        (c.landmarks?.inputVisible ?? c.timeline.input) - 0.32,
      ),
      "text-pop",
    ],
    [
      topic.example,
      "curiosity",
      "transform",
      output,
      c.timeline.result,
      "masked-reveal",
    ],
    ["CyberChef", "intro", "browser", input, c.timeline.ready, "browser-card"],
    [
      "Paste the text.",
      "demonstration",
      "detail",
      input,
      Math.max(
        c.timeline.ready,
        (c.landmarks?.inputVisible ?? c.timeline.input) - 0.32,
      ),
      "zoom-in",
    ],
    [
      "From Base64",
      "demonstration",
      "detail",
      recipe,
      Math.max(
        c.timeline.ready,
        (c.landmarks?.resultVisible ?? c.timeline.result) - 1.0,
      ),
      "spotlight",
    ],
    [
      topic.example,
      "payoff",
      "result",
      output,
      c.timeline.result,
      "result-emphasis",
    ],
    [
      "ENCODING ≠ ENCRYPTION",
      "takeaway",
      "explainer",
      output,
      c.timeline.result,
      "split-screen",
    ],
    [
      "Format. Not secrecy.",
      "takeaway",
      "explainer",
      output,
      c.timeline.result,
      "kinetic",
    ],
    ["Save this tool.", "cta", "ending", output, c.timeline.result, "parallax"],
  ];
  let wordCursor = 0;
  const scenes = rows.map(
    ([title, purpose, layout, target, start, motion], i) => {
      const begin = bounds[i],
        end = bounds[i + 1],
        frames = Math.round((end - begin) * 30);
      const ws = w.filter(
        (x) => x.start >= begin - 0.02 && x.start < end - 0.02,
      );
      wordCursor += ws.length;
      let actualLayout = layout;
      if (
        template === "mobile" &&
        ["browser", "detail", "result"].includes(layout)
      )
        actualLayout = "device";
      if (template === "before-after" && layout === "result")
        actualLayout = "comparison";
      const mediaType = ["browser", "result", "ending"].includes(layout)
        ? "image"
        : "video";
      return {
        title,
        eyebrow: "",
        detail: "",
        duration: end - begin,
        shot:
          purpose === "cta" ? "cta" : purpose === "payoff" ? "result" : "input",
        footage: `media/${key}/${c.name}.mp4`,
        startFrom: Math.max(0, start),
        direction: {
          purpose,
          layout: actualLayout,
          graphic:
            layout === "explainer"
              ? title === "Format. Not secrecy."
                ? {
                    heading: "CHANGES THE FORMAT.",
                    contrast: "ADDS NO SECRECY.",
                    subheading: "FORMAT, NOT SECRECY",
                    explanation:
                      "Base64 can be decoded. It does not protect a secret.",
                    cards: [],
                  }
                : {
                    heading: "ENCODING",
                    contrast: "ENCRYPTION",
                    subheading: "THE IMPORTANT DIFFERENCE",
                    cards: [
                      {
                        heading: "Encoding",
                        body: "Changes the format.",
                        detail: "No secrecy added.",
                      },
                      {
                        heading: "Encryption",
                        body: "Protects with a key.",
                        detail: "A different job.",
                      },
                    ],
                  }
              : undefined,
          narration: ws.map((x) => x.text).join(" "),
          asset: `media/${key}/${c.name}${layout === "browser" ? "-input.png" : mediaType === "image" ? "-result.png" : ".mp4"}`,
          mediaType,
          sourceWidth: source.width,
          sourceHeight: source.height,
          sourceFontPx: c.editorFontPx || 20,
          camera:
            layout === "browser"
              ? [
                  { frame: 0, target: full },
                  { frame: 36, target },
                ]
              : title === "From Base64"
                ? [
                    {
                      frame: 0,
                      target: {
                        ...c.targets.operation,
                        width: Math.max(c.targets.operation.width, 240),
                        height: 150,
                      },
                    },
                    {
                      frame: 28,
                      target: {
                        ...c.targets.operation,
                        width: Math.max(c.targets.operation.width, 240),
                        height: 150,
                      },
                    },
                    { frame: 50, target: recipe },
                  ]
                : focusPath(target, frames, motion),
          focus: target,
          cursor: [
            {
              frame: title === "From Base64" ? 21 : 12,
              x:
                title === "From Base64"
                  ? c.targets.operation.x + 70
                  : target.x + 35,
              y:
                title === "From Base64"
                  ? c.targets.operation.y + 20
                  : target.y + 50,
              click: purpose === "demonstration",
            },
          ],
          typography:
            purpose === "hook"
              ? "hook"
              : purpose === "takeaway"
                ? "explainer"
                : "caption",
          captionPlacement: purpose === "payoff" ? "top" : "bottom",
          transition: i === 0 ? "cut" : ["slide", "mask", "scale"][i % 3],
          musicIntensity:
            purpose === "hook" || purpose === "payoff" ? 0.8 : 0.5,
          tone:
            purpose === "payoff"
              ? "satisfying"
              : purpose === "demonstration"
                ? "clear"
                : "curious",
          motion,
        },
      };
    },
  );
  const events = [
    {
      event: "encoded_arrival",
      frame: 0,
      sound: "digital_pop",
      intensity: 0.6,
    },
    {
      event: "decoding_illustration",
      frame: Math.round(bounds[1] * 30),
      sound: "light_glitch",
      intensity: 0.35,
    },
    {
      event: "interface",
      frame: Math.round(bounds[2] * 30),
      sound: "soft_whoosh",
      intensity: 0.35,
    },
    {
      event: "input",
      frame: Math.round(bounds[3] * 30 + 10),
      sound: "keyboard",
      intensity: 0.3,
    },
    {
      event: "select",
      frame: Math.round(bounds[4] * 30 + 21),
      sound: "ui_click",
      intensity: 0.5,
    },
    {
      event: "result",
      frame: Math.round(bounds[5] * 30),
      sound: "digital_reveal",
      intensity: 0.6,
    },
    {
      event: "distinction",
      frame: Math.round(bounds[6] * 30),
      sound: "text_accent",
      intensity: 0.35,
    },
    {
      event: "ending",
      frame: Math.round(bounds[8] * 30),
      sound: "ending",
      intensity: 0.5,
    },
  ];
  return VideoSchema.parse({
    ...topic,
    template,
    duration,
    words: w,
    audio: `media/${key}/mix.wav`,
    scenes,
    creative: {
      version: 2,
      example: topic.example,
      encoded: capture.input,
      bpm: 116,
      soundEvents: events,
      brand: "THE TOOL FILES",
      musicAsset: `media/${key}/music.wav`,
    },
  });
}
