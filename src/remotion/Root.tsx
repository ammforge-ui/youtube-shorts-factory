import React from "react";
import { Composition } from "remotion";
import { Short } from "./templates/Short";
import { VideoSchema } from "../schemas/video";
import previews from "../../data/preview-v2.json";
export const Root: React.FC = () => (
  <>
    {(["discovery", "mobile", "before-after"] as const).map((template) => (
      <Composition
        key={template}
        id={template}
        component={Short}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={900}
        defaultProps={{ spec: VideoSchema.parse(previews[template]) }}
        calculateMetadata={({ props }) => {
          const spec = VideoSchema.parse(props.spec);
          return {
            durationInFrames: Math.round(spec.duration * 30),
            props: { spec },
          };
        }}
      />
    ))}
  </>
);
