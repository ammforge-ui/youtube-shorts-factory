import React from "react";
import { useLayoutAudit } from "./useLayoutAudit";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import type { VideoSpec, CreativeDirection } from "../../schemas/video";
import { phrases, captionAreas } from "../../directors/CaptionDirector";
import { tokens, entrance } from "../../directors/MotionDirector";
import { SmartScreenZoom } from "./SmartScreenZoom";
import { CaptionHighlight } from "../primitives/caption-highlight";
import { ScrambleText } from "../primitives/scramble-text";
import { SplitTextChars } from "../primitives/split-text-chars";
const lime = tokens.colors.lime;
function Head({
  text,
  size = 96,
  color = "#f6f8fc",
}: {
  text: string;
  size?: number;
  color?: string;
}) {
  return (
    <SplitTextChars
      text={text}
      mode="words"
      effect="fade-up"
      durationInFrames={10}
      staggerInFrames={2}
      fontSize={size}
      fontWeight={700}
      fontFamily="Display"
      textAlign="left"
      color={color}
      lineHeight={1.07}
    />
  );
}
function PremiumScene({
  s,
  spec,
}: {
  s: VideoSpec["scenes"][number];
  spec: VideoSpec;
}) {
  const f = useCurrentFrame(),
    d = s.direction!;
  const c = spec.creative!;
  const graphic = d.graphic;
  const p = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const isCipher = d.layout === "cipher",
    isTransform = d.layout === "transform";
  const titleStyle: React.CSSProperties = {
    position: "absolute",
    left: 80,
    right: 150,
    top: d.captionPlacement === "top" ? 390 : 220,
  };
  const media = (h = 690, w = 900) => (
    <SmartScreenZoom
      direction={d}
      startFrom={s.startFrom}
      width={w}
      height={h}
    />
  );
  const illustration = (
    <>
      <div
        style={{
          fontSize: 25,
          letterSpacing: 4,
          color: "#9caec5",
          marginBottom: 35,
        }}
      >
        FICTIONAL EXAMPLE
      </div>
      <div
        style={{
          fontSize: 52,
          color: lime,
          fontFamily: "Body",
          wordBreak: "break-all",
          lineHeight: 1.5,
        }}
      >
        {c.encoded}
      </div>
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          color: lime,
          fontSize: 55,
        }}
      >
        ↓
      </div>
      <div
        style={{
          fontFamily: "Display",
          fontSize: 98,
          lineHeight: 1.08,
          color: "#fff",
        }}
      >
        <ScrambleText
          text={c.example}
          fontSize={98}
          textAlign="left"
          durationInFrames={25}
          tickInFrames={2}
          scrambleColor={lime}
          scrambleOpacity={0.8}
        />
      </div>
    </>
  );
  return (
    <AbsoluteFill style={d.purpose === "hook" ? {} : entrance(f, d.transition)}>
      {isCipher ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 150, top: 260 }}>
            <div
              style={{
                fontSize: 29,
                color: lime,
                letterSpacing: 5,
                marginBottom: 45,
              }}
            >
              CAN YOU READ THIS?
            </div>
            <div
              style={{
                fontSize: 74,
                fontFamily: "Display",
                lineHeight: 1.28,
                wordBreak: "break-all",
                transform: `translateY(${Math.sin(f / 7) * 5}px) scale(${1.015 + Math.sin(f / 10) * 0.012})`,
              }}
            >
              {c.encoded.slice(0, 12)}
              <br />
              <span style={{ color: lime }}>{c.encoded.slice(12)}</span>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 850,
              left: 80,
              right: 150,
              borderLeft: "7px solid " + lime,
              paddingLeft: 35,
              fontSize: 105,
              lineHeight: 1.05,
              fontFamily: "Display",
            }}
          >
            It says
            <br />
            <span style={{ color: lime }}>something simple.</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 1320,
              left: 80,
              fontSize: 29,
              color: "#aab9ca",
            }}
          >
            FICTIONAL EXAMPLE
          </div>
        </>
      ) : isTransform ? (
        <div
          data-safe="title"
          style={{ position: "absolute", top: 290, left: 80, right: 150 }}
        >
          {illustration}
          <div style={{ marginTop: 65, fontSize: 34, color: "#a8b8ca" }}>
            {d.purpose === "curiosity" && s.title.includes("fictional")
              ? "Just a harmless example."
              : "Same message. Readable format."}
          </div>
        </div>
      ) : d.layout === "explainer" && !graphic?.cards.length ? (
        <>
          <div style={{ position: "absolute", top: 300, left: 80, right: 150 }}>
            <Head text={graphic?.heading || s.title} size={105} />
            <div style={{ height: 80 }} />
            <Head text={graphic?.contrast || ""} size={100} color={lime} />
            <div
              style={{
                marginTop: 100,
                fontSize: 34,
                lineHeight: 1.6,
                fontFamily: "Body",
                color: "#adbdce",
              }}
            >
              {graphic?.explanation}
            </div>
          </div>
        </>
      ) : d.layout === "explainer" ? (
        <>
          <div style={{ position: "absolute", top: 270, left: 80, right: 150 }}>
            <div
              style={{
                fontSize: 28,
                color: lime,
                letterSpacing: 4,
                marginBottom: 36,
              }}
            >
              {graphic?.subheading}
            </div>
            <Head text={graphic?.heading || s.title} size={91} />
            <div
              style={{
                fontSize: 150,
                color: lime,
                lineHeight: 1.15,
                transform: `scale(${1 + Math.sin((Math.min(f, 20) / 20) * Math.PI) * 0.12})`,
              }}
            >
              ≠
            </div>
            <Head text={graphic?.contrast || ""} size={85} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 875,
              left: 80,
              right: 150,
              display: "flex",
              flexDirection: "column",
              gap: 25,
            }}
          >
            {(graphic?.cards || []).map((row, i) => (
              <div
                key={row.heading}
                style={{
                  padding: "28px 34px",
                  background: i ? "#1a2637" : "#baff5a",
                  color: i ? "#edf3fc" : "#101c10",
                  borderRadius: 26,
                  transform: `translateX(${(1 - p) * (i ? 60 : -60)}px)`,
                }}
              >
                <div style={{ fontSize: 38, fontFamily: "Display" }}>
                  {row.heading}
                </div>
                <div style={{ fontSize: 32, marginTop: 8, fontFamily: "Body" }}>
                  {row.body} <span style={{ opacity: 0.72 }}>{row.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : d.layout === "ending" ? (
        <>
          <div style={{ position: "absolute", top: 260, left: 80, right: 150 }}>
            <Head text="Keep this one." size={95} />
            <div style={{ fontSize: 36, color: lime, marginTop: 25 }}>
              {spec.product}
            </div>
          </div>
          <div style={{ position: "absolute", top: 640, left: 80 }}>
            {media(530)}
          </div>
          <div
            style={{
              position: "absolute",
              top: 1270,
              left: 80,
              fontSize: 31,
              color: "#d4deea",
            }}
          >
            {spec.url}
          </div>
        </>
      ) : d.layout === "comparison" ? (
        <>
          <div data-safe="title" style={titleStyle}>
            <Head text="Same message. New format." size={83} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 550,
              left: 80,
              right: 150,
              fontSize: 38,
              color: lime,
              wordBreak: "break-all",
            }}
          >
            BEFORE · {c.encoded}
          </div>
          <div style={{ position: "absolute", top: 780, left: 80 }}>
            {media(530)}
          </div>
          <div
            style={{
              position: "absolute",
              top: 1380,
              left: 80,
              fontSize: 35,
              color: lime,
            }}
          >
            AFTER · readable text
          </div>
        </>
      ) : d.layout === "device" ? (
        <>
          <div data-safe="title" style={titleStyle}>
            <Head text={s.title} size={84} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 540,
              left: 120,
              border: "13px solid #34445a",
              borderRadius: 65,
              overflow: "hidden",
              transform: `rotate(${-2 + p}deg)`,
            }}
          >
            {media(850, 720)}
          </div>
        </>
      ) : (
        <>
          <div data-safe="title" style={titleStyle}>
            {d.purpose === "intro" ? (
              <>
                <div style={{ fontSize: 29, color: lime, marginBottom: 25 }}>
                  FREE BROWSER TOOLBOX
                </div>
                <Head text={spec.product} size={111} />
                <div style={{ fontSize: 34, color: "#aebdd0", marginTop: 22 }}>
                  Free, open source. Runs locally, too.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 27, color: lime, marginBottom: 24 }}>
                  {d.purpose === "payoff"
                    ? "THE REAL DECODED RESULT"
                    : d.motion === "spotlight"
                      ? "ADD THE OPERATION"
                      : "YOUR EXAMPLE MESSAGE"}
                </div>
                <Head text={s.title} size={d.purpose === "payoff" ? 102 : 92} />
              </>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top:
                d.captionPlacement === "top"
                  ? 790
                  : d.purpose === "intro"
                    ? 650
                    : 610,
              transform:
                d.layout === "browser"
                  ? `perspective(1500px) rotateY(${(1 - p) * -9}deg)`
                  : undefined,
            }}
          >
            {media(
              d.purpose === "intro" ? 710 : d.purpose === "payoff" ? 500 : 740,
            )}
          </div>
          {d.purpose === "payoff" && (
            <div
              style={{
                position: "absolute",
                top: d.captionPlacement === "top" ? 1360 : 1300,
                left: 80,
                fontSize: 32,
                color: lime,
              }}
            >
              Original message restored.
            </div>
          )}
        </>
      )}
    </AbsoluteFill>
  );
}
export function PremiumShort({ spec }: { spec: VideoSpec }) {
  const f = useCurrentFrame();
  useLayoutAudit(f);
  const t = f / 30;
  let cursor = 0;
  const ps = phrases(spec.words);
  const page = ps.find(
    (p) => t * 1000 >= p.startMs && t * 1000 < p.startMs + p.durationMs,
  );
  const current = spec.scenes.find((s) => {
    const start = cursor;
    cursor += s.duration;
    return t >= start && t < cursor;
  });
  cursor = 0;
  const area = captionAreas[current?.direction?.captionPlacement || "bottom"];
  return (
    <AbsoluteFill
      style={{
        background: tokens.colors.navy,
        color: tokens.colors.white,
        fontFamily: "Display",
      }}
    >
      <style>{`@font-face{font-family:Display;src:url('${staticFile("fonts/Display-Bold.ttf")}')}@font-face{font-family:Body;src:url('${staticFile("fonts/Body-Regular.ttf")}')}*{box-sizing:border-box}`}</style>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${72 + Math.sin(f / 90) * 12}% 15%,#25453d 0%,transparent 58%),radial-gradient(ellipse at 10% 90%,#1a2b48 0%,transparent 57%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 115,
          left: 80,
          fontSize: 23,
          letterSpacing: 4,
          color: "#8194ae",
        }}
      >
        {spec.creative!.brand}
      </div>
      {spec.scenes.map((s, i) => {
        const from = Math.round(cursor * 30);
        cursor += s.duration;
        const end = Math.round(cursor * 30);
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            <PremiumScene s={s} spec={spec} />
          </Sequence>
        );
      })}
      {page && (
        <div
          data-safe="caption"
          style={{
            position: "absolute",
            left: area.x,
            top: area.y,
            width: area.width,
            minHeight: area.height,
            textShadow: "0 3px 6px #000, 0 8px 22px #000b",
            WebkitTextStroke: "0.7px #08111b",
          }}
        >
          <CaptionHighlight
            page={page}
            frame={f - Math.round((page.startMs / 1000) * 30)}
            fontSize={tokens.type.caption}
            activeColor={lime}
            inactiveColor="#fff"
            shadow
            emphasisScale={1.045}
          />
        </div>
      )}
      <Audio src={staticFile(spec.audio)} />
    </AbsoluteFill>
  );
}
