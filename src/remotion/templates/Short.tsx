import React from "react";
import {FactoryShort} from "../premium/FactoryShort";
import {PremiumShort} from "../premium/PremiumShort";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { CaptionHighlight } from "../primitives/caption-highlight";
import { SplitTextChars } from "../primitives/split-text-chars";
import { SlideUp } from "../primitives/slide-up";
import { FadeIn } from "../primitives/fade-in";
import type { VideoSpec } from "../../schemas/video";
const accent = "#baff5a";
const css = `@font-face{font-family:Display;src:url('${staticFile("fonts/Display-Bold.ttf")}')}@font-face{font-family:Body;src:url('${staticFile("fonts/Body-Regular.ttf")}')}*{box-sizing:border-box}`;
function Scene({
  scene,
  spec,
  index,
}: {
  scene: VideoSpec["scenes"][number];
  spec: VideoSpec;
  index: number;
}) {
  const f = useCurrentFrame();
  const progress = interpolate(f, [0, 22], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const phone = spec.template === "mobile" || scene.shot === "mobile";
  const cta = scene.shot === "cta";
  const result = scene.shot === "result";
  const hook = index === 0;
  const focused = ["input", "action", "result"].includes(scene.shot) && !phone;
  const videoStyle: React.CSSProperties =
    phone && scene.shot !== "overview"
      ? {
          position: "absolute",
          width: 960,
          height: 1700,
          left: scene.shot === "action" ? -230 : -520,
          top: result ? -850 : -30,
        }
      : focused
        ? {
            position: "absolute",
            width: 3000,
            height: 3150,
            left: scene.shot === "action" ? -730 : -1650,
            top: result ? -1630 : -60,
          }
        : { width: "100%", height: "100%", objectFit: "contain" };
  return (
    <AbsoluteFill
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 35}px)`,
      }}
    >
      <div style={{ position: "absolute", left: 80, top: 240, right: 130 }}>
        <div
          style={{
            fontSize: 25,
            letterSpacing: 5,
            color: accent,
            marginBottom: 30,
            fontFamily: "Body",
          }}
        >
          {scene.eyebrow}
        </div>
        <SplitTextChars
          text={scene.title}
          mode="words"
          effect="fade-up"
          fontFamily="Display"
          fontSize={index === 0 ? 89 : 73}
          textAlign="left"
          lineHeight={1.08}
          style={{ maxWidth: 850 }}
        />
        <div
          style={{
            marginTop: 28,
            color: "#aab5c6",
            fontSize: 31,
            lineHeight: 1.4,
            maxWidth: 780,
            fontFamily: "Body",
          }}
        >
          {scene.detail}
        </div>
      </div>
      {!cta ? (
        <div
          style={{
            position: "absolute",
            left: phone ? 220 : 80,
            top: 640,
            width: phone ? 570 : 880,
            height: phone ? 800 : 790,
            borderRadius: phone ? 60 : 28,
            border: phone ? "14px solid #293544" : "2px solid #465365",
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 40px 100px #0008",
            transform: `scale(${1 + (Math.min(f, 180) / 180) * 0.018}) rotate(${phone ? -2 : 0}deg)`,
          }}
        >
          {!phone && (
            <div
              style={{
                height: 52,
                background: "#17202e",
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "0 20px",
                color: "#b0bbcb",
                fontSize: 20,
              }}
            >
              <span style={{ color: accent }}>●</span>
              <span>CyberChef · official local copy</span>
            </div>
          )}
          <div
            style={{
              position: "relative",
              height: phone ? 772 : 736,
              overflow: "hidden",
            }}
          >
            {hook ? (
              <Img
                src={staticFile(scene.footage.replace(".mp4", "-input.png"))}
                style={videoStyle}
              />
            ) : result ? (
              <Img
                src={staticFile(scene.footage.replace(".mp4", "-result.png"))}
                style={videoStyle}
              />
            ) : (
              <OffthreadVideo
                muted
                src={staticFile(scene.footage)}
                startFrom={Math.round(scene.startFrom * 30)}
                style={videoStyle}
              />
            )}
          </div>
          {phone && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 180,
                width: 180,
                height: 20,
                borderRadius: 20,
                background: "#293544",
              }}
            />
          )}
        </div>
      ) : (
        <div style={{ position: "absolute", top: 760, left: 80, right: 130 }}>
          <SlideUp durationInFrames={24}>
            <div
              style={{
                background: accent,
                color: "#0c131c",
                fontSize: 56,
                padding: "35px 40px",
                borderRadius: 25,
                fontFamily: "Display",
              }}
            >
              USEFUL SOFTWARE.
              <br />
              ZERO HYPE.
            </div>
          </SlideUp>
          <div
            style={{
              fontSize: 31,
              color: "#d2dbe7",
              marginTop: 50,
              lineHeight: 1.6,
            }}
          >
            Try the official tool
            <br />
            <span style={{ color: accent, fontSize: 32 }}>{spec.url}</span>
          </div>
          <div style={{ fontSize: 25, color: "#8a98ad", marginTop: 30 }}>
            Local copy shown · No account used
          </div>
        </div>
      )}
      {spec.template === "before-after" && (
        <div
          style={{
            position: "absolute",
            top: 565,
            left: 80,
            fontSize: 26,
            color: accent,
          }}
        >
          ENCODED INPUT → READABLE OUTPUT
        </div>
      )}
      {!cta && (
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 1470,
            fontSize: 24,
            letterSpacing: 2,
            color: "#8997aa",
          }}
        >
          REAL BROWSER CAPTURE / {phone ? "MOBILE VIEW" : "DESKTOP VIEW"}
        </div>
      )}
    </AbsoluteFill>
  );
}
export const Short: React.FC<{ spec: VideoSpec }> = ({ spec }) => spec.creative?.version===3?<FactoryShort spec={spec}/>:spec.creative?.version===2?<PremiumShort spec={spec}/>:<LegacyShort spec={spec}/>;
const LegacyShort: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const time = f / 30;
  let cursor = 0;
  const groups = [];
  for (let i = 0; i < spec.words.length; i += 4) {
    const ws = spec.words.slice(i, i + 4);
    groups.push({
      text: ws.map((w) => w.text).join(" "),
      startMs: ws[0].start * 1000,
      durationMs: (ws.at(-1)!.end - ws[0].start) * 1000,
      tokens: ws.map((w, j) => ({
        text: (j ? " " : "") + w.text,
        fromMs: w.start * 1000,
        toMs: w.end * 1000,
      })),
    });
  }
  const page = groups.find(
    (g) => time * 1000 >= g.startMs && time * 1000 < g.startMs + g.durationMs,
  );
  return (
    <AbsoluteFill
      style={{ background: "#0b111c", color: "#f2f5fa", fontFamily: "Display" }}
    >
      <style>{css}</style>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${65 + Math.sin(f / 110) * 10}% 12%,#1d3443 0%,transparent 57%),radial-gradient(ellipse at 0% 100%,#19283b,transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 110,
          fontSize: 24,
          letterSpacing: 4,
          color: "#9eacc0",
        }}
      >
        THE TOOL FILES <span style={{ color: accent }}> / 001</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 130,
          top: 110,
          fontSize: 23,
          color: accent,
        }}
      >
        FREE + OPEN SOURCE
      </div>
      {spec.scenes.map((s, i) => {
        const from = Math.round(cursor * 30);
        cursor += s.duration;
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={Math.round(s.duration * 30)}
          >
            <Scene scene={s} index={i} spec={spec} />
          </Sequence>
        );
      })}
      {page && (
        <div
          style={{
            position: "absolute",
            left: 85,
            right: 145,
            top: 1570,
            minHeight: 130,
            padding: "22px 24px",
            borderRadius: 24,
            background: "#080d16ee",
            border: "1px solid #334052",
          }}
        >
          <CaptionHighlight
            page={page}
            frame={f - Math.round((page.startMs / 1000) * 30)}
            fontSize={49}
            activeColor={accent}
            inactiveColor="#edf2f9"
            shadow={false}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 142,
          left: 80,
          width: 870,
          height: 5,
          background: "#293444",
        }}
      >
        <div
          style={{
            height: 5,
            width: `${(time / spec.duration) * 100}%`,
            background: accent,
          }}
        />
      </div>
      <Audio src={staticFile(spec.audio)} />
    </AbsoluteFill>
  );
};
