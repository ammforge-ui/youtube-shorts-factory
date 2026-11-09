import React from "react";
import { Composition } from "remotion";
import { Short } from "./templates/Short";
import { VideoSchema, VideoSpec } from "../schemas/video";
const demo: VideoSpec = {
  id: "preview",
  template: "discovery",
  product: "CyberChef",
  url: "gchq.github.io/CyberChef",
  localCopy: true,
  duration: 30,
  narration: "",
  audio: "media/test-run/mix.wav",
  words: [{ text: "Preview", start: 0, end: 1 }],
  scenes: [
    {
      title: "Decode the mystery.",
      eyebrow: "TOOL DISCOVERY",
      detail: "Run npm run test:pipeline to populate footage.",
      duration: 30,
      shot: "cta",
      footage: "media/test-run/desktop.mp4",
      startFrom: 0,
    },
  ],
};
export const Root: React.FC = () => (
  <>
    {(["discovery", "mobile", "before-after"] as const).map((t) => (
      <Composition
        key={t}
        id={t}
        component={Short}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={900}
        defaultProps={{ spec: { ...demo, template: t } }}
        calculateMetadata={({ props }) => {
          const s = VideoSchema.parse(props.spec);
          return {
            durationInFrames: Math.round(s.duration * 30),
            props: { spec: s },
          };
        }}
      />
    ))}
  </>
);
