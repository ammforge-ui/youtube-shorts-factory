import type { CreativeDirection, FocusRect } from "../schemas/video";
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export function cameraPose(
  target: FocusRect,
  source: { width: number; height: number },
  view: { width: number; height: number },
) {
  const scale = Math.max(
    view.width / target.width,
    view.height / source.height,
    view.width / source.width,
  );
  return {
    scale,
    x: clamp(
      view.width / 2 - (target.x + target.width / 2) * scale,
      view.width - source.width * scale,
      0,
    ),
    y: clamp(
      view.height / 2 - (target.y + target.height / 2) * scale,
      view.height - source.height * scale,
      0,
    ),
  };
}
export function focusPath(
  rect: FocusRect,
  frames: number,
  kind: CreativeDirection["motion"],
): CreativeDirection["camera"] {
  const wide = {
    x: rect.x - rect.width * 0.06,
    y: rect.y,
    width: rect.width * 1.12,
    height: rect.height,
  };
  return kind === "zoom-out"
    ? [
        { frame: 0, target: rect },
        { frame: Math.min(36, frames - 1), target: wide },
      ]
    : [
        { frame: 0, target: wide },
        { frame: Math.min(36, frames - 1), target: rect },
      ];
}
