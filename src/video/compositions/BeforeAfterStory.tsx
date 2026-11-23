import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

interface BeforeAfterStoryProps {
  title: string;
  beforeImage: string;
  afterImage: string;
  system: string;
  savings: string;
}

export const BeforeAfterStory: React.FC<BeforeAfterStoryProps> = ({
  title,
  beforeImage,
  afterImage,
  system,
  savings,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sliderPosition = interpolate(frame, [30, 120], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const infoOpacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: gradients.surface,
        fontFamily: FONT_FAMILY,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 800,
          color: tokens.colors.text,
          textAlign: "center",
          margin: "60px 0 40px 0",
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {title}
      </h1>

      {/* Before/After Slider */}
      <div
        style={{
          width: "900px",
          height: "900px",
          position: "relative",
          borderRadius: tokens.radius.card,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
          marginBottom: "40px",
        }}
      >
        {/* After Image (Background) */}
        <Img
          src={staticFile(afterImage)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Before Image (Clipped) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Img
            src={staticFile(beforeImage)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Slider Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${sliderPosition}%`,
            width: "6px",
            height: "100%",
            background: "#fff",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        />

        {/* Slider Handle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${sliderPosition}%`,
            transform: "translate(-50%, -50%)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: "24px" }}>⟷</div>
        </div>

        {/* Labels */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: tokens.radius.md,
            fontSize: "28px",
            fontWeight: 600,
          }}
        >
          ก่อน
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            background: tokens.colors.primary,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: tokens.radius.md,
            fontSize: "28px",
            fontWeight: 600,
          }}
        >
          หลัง
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          opacity: infoOpacity,
        }}
      >
        <div
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: tokens.colors.text,
          }}
        >
          ระบบ {system}
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: tokens.colors.savings,
          }}
        >
          ประหยัด {savings}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          background: tokens.colors.primary,
          color: "#fff",
          padding: "24px 64px",
          borderRadius: tokens.radius.button,
          fontSize: "40px",
          fontWeight: 700,
          opacity: ctaOpacity,
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
        }}
      >
        ดูรายละเอียด
      </div>
    </AbsoluteFill>
  );
};
