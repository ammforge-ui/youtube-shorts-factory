import React from "react";
import {
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import type { CreativeDirection } from "../../schemas/video";
import { cameraPose } from "../../directors/ScreenFocusDirector";
import { tokens } from "../../directors/MotionDirector";
export function SmartScreenZoom({
  direction: d,
  startFrom,
  width = 900,
  height = 680,
}: {
  direction: CreativeDirection;
  startFrom: number;
  width?: number;
  height?: number;
}) {
  const f = useCurrentFrame();
  const keys = d.camera;
  const source = { width: d.sourceWidth, height: d.sourceHeight };
  const poses = keys.map((k) =>
    cameraPose(k.target, source, { width, height }),
  );
  const frames = keys.map((x) => x.frame);
  const val = (key: "x" | "y" | "scale") =>
    keys.length === 1
      ? poses[0][key]
      : interpolate(
          f,
          frames,
          poses.map((p) => p[key]),
          {
            easing: tokens.ease,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
  const x = val("x"),
    y = val("y"),
    scale = val("scale");
  const media = {
    position: "absolute" as const,
    width: source.width,
    height: source.height,
    left: 0,
    top: 0,
  };
  const target = d.focus;
  return (
    <div
      data-safe="footage"
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        borderRadius: 30,
        background: "#eff3f8",
        boxShadow: tokens.shadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: source.width,
          height: source.height,
          transformOrigin: "0 0",
          transform: `translate(${x}px,${y}px) scale(${scale})`,
        }}
      >
        {d.mediaType === "image" ? (
          <Img src={staticFile(d.asset)} style={media} />
        ) : (
          <OffthreadVideo
            muted
            src={staticFile(d.asset)}
            startFrom={Math.round(startFrom * 30)}
            style={media}
          />
        )}
        {target &&
          d.purpose === "demonstration" &&
          d.motion === "spotlight" && (
            <div
              style={{
                position: "absolute",
                left: target.x + 3,
                top: target.y + 3,
                width: target.width - 6,
                height: Math.min(target.height - 6, 110),
                border: "2px solid #8dd435",
                borderRadius: 8,
                boxShadow: "0 0 0 1000px #08101a12",
                opacity: interpolate(f, [8, 20, 60, 80], [0, 0.8, 0.8, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          )}
      </div>
      {d.cursor.map((c, i) => {
        const pulse = interpolate(
          f,
          [c.frame, c.frame + 9, c.frame + 22],
          [0, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x * scale + x,
              top: c.y * scale + y,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid #a4e843",
              background: "#baff5a22",
              boxShadow: `0 0 0 ${pulse * 18}px #baff5a33`,
              opacity: d.purpose === "demonstration" ? pulse : 0,
            }}
          />
        );
      })}
    </div>
  );
}
