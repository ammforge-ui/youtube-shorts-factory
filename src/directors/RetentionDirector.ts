import limits from "../../config/creative-quality.json";
import type { VideoSpec } from "../schemas/video";
import { phrases, captionAreas } from "./CaptionDirector";
import { cameraPose } from "./ScreenFocusDirector";
export function inspectRetention(spec: VideoSpec) {
  let start = 0;
  const shots = spec.scenes.map((s) => {
    const a = {
      start,
      end: start + s.duration,
      duration: s.duration,
      d: s.direction!,
    };
    start += s.duration;
    return a;
  });
  const firstDemo =
    shots.find((x) => x.d.purpose === "demonstration")?.start ?? Infinity;
  const payoff = shots.find((x) => x.d.purpose === "payoff")?.start ?? Infinity;
  const cta = shots
    .filter((x) => x.d.purpose === "cta")
    .reduce((n, x) => n + x.duration, 0);
  const layouts = new Set(shots.map((x) => x.d.layout));
  const ps = phrases(spec.words);
  const crossSentence = ps.some((p) => /[.!?]\s+\S/.test(p.text));
  const textSizes = shots
    .filter((x) => ["detail", "result", "device"].includes(x.d.layout))
    .map(
      (x) =>
        x.d.sourceFontPx *
        cameraPose(
          x.d.camera.at(-1)!.target,
          { width: x.d.sourceWidth, height: x.d.sourceHeight },
          { width: x.d.layout === "device" ? 720 : 900, height: 680 },
        ).scale,
    );
  const checks = {
    firstFrameSubject: shots[0]?.d.layout === "cipher",
    hookWithinThreshold: shots[0].duration <= limits.maxHookSeconds,
    firstUsefulDemo: firstDemo <= limits.maxFirstDemoSeconds,
    payoffTiming: payoff <= limits.maxPayoffSeconds,
    shortEnding: cta <= limits.maxCtaSeconds,
    layoutVariety: layouts.size >= limits.minLayoutVariety,
    noCrossSentenceCaptions: !crossSentence,
    captionDensity: ps.every((p) => p.tokens.length <= limits.captionMaxWords),
    captionSafeArea: Object.values(captionAreas).every(
      (r) =>
        r.x >= 80 &&
        r.x + r.width <= 950 &&
        r.y >= 120 &&
        r.y + r.height <= 1680 + 25,
    ),
    estimatedInterfaceReadability: textSizes.every(
      (n) => n >= limits.minInterfaceTextPx,
    ),
  };
  const warnings = shots
    .filter((x) => x.duration > limits.maxHeldShotSeconds)
    .map(
      (x) =>
        `Review ${x.d.layout} hold at ${x.start.toFixed(2)}s (${x.duration.toFixed(2)}s); a stable explanation may be appropriate.`,
    );
  return {
    kind: "Editorial heuristics; not a prediction of retention or virality",
    thresholds: limits,
    checks,
    passed: Object.values(checks).every(Boolean),
    measurements: {
      firstDemoSeconds: firstDemo,
      payoffSeconds: payoff,
      ctaSeconds: cta,
      layoutCount: layouts.size,
      layoutTypes: [...layouts],
      estimatedMinimumInterfaceTextPx: Math.min(...textSizes),
      phraseCount: ps.length,
      longestCaptionWords: Math.max(...ps.map((p) => p.tokens.length)),
    },
    warnings,
    recommendations: [
      "Compare future audience retention using YouTube Analytics.",
      "Have a listener review the neural voice, musical taste and mix on phone speakers.",
    ],
  };
}
