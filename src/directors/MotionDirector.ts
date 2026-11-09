import { Easing, interpolate } from "remotion";
import type { CreativeDirection } from "../schemas/video";
export const tokens = {
  colors: {
    navy: "#080f1a",
    lime: "#baff5a",
    white: "#f6f8fc",
    muted: "#a9b9cc",
  },
  safe: { left: 80, right: 150, top: 120, bottom: 240 },
  type: { hook: 112, title: 86, caption: 58 },
  ease: Easing.bezier(0.22, 1, 0.36, 1),
  shadow: "0 30px 90px #0008",
};
export function entrance(
  frame: number,
  transition: CreativeDirection["transition"],
) {
  const p = interpolate(frame, [0, 16], [0, 1], {
    easing: tokens.ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    opacity: 1,
    transform:
      transition === "slide"
        ? `translateX(${(1 - p) * 85}px)`
        : transition === "scale"
          ? `scale(${0.94 + 0.06 * p})`
          : "none",
    clipPath:
      transition === "mask"
        ? `inset(0 ${(1 - p) * 100}% 0 0 round 24px)`
        : "none",
  };
}
export const treatments: Record<
  CreativeDirection["purpose"],
  CreativeDirection["motion"][]
> = {
  hook: ["text-pop", "kinetic"],
  curiosity: ["masked-reveal", "before-after"],
  intro: ["browser-card", "zoom-in"],
  demonstration: ["pan", "spotlight", "cursor"],
  payoff: ["result-emphasis", "zoom-out"],
  takeaway: ["split-screen", "kinetic"],
  cta: ["parallax"],
};
