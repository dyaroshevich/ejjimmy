import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

interface CaseStudyStoryProps {
  title: string;
  location: string;
  system: string;
  panels: number;
  annualSavings: string;
  payback: string;
  beforeImage: string;
  afterImage: string;
  quote: string;
}

export const CaseStudyStory: React.FC<CaseStudyStoryProps> = ({
  title,
  location,
  system,
  panels,
  annualSavings,
  payback,
  beforeImage,
  afterImage,
  quote,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sliderPosition = interpolate(frame, [30, 90], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const statsOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const quoteOpacity = interpolate(frame, [150, 170], [0, 1], {
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
      {/* Location Badge */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "40px",
          background: tokens.colors.secondary,
          color: "#fff",
          padding: "12px 24px",
          borderRadius: tokens.radius.badge,
          fontSize: "24px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        📍 {location}
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 800,
          color: tokens.colors.text,
          textAlign: "center",
          margin: "100px 0 40px 0",
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
          height: "600px",
          position: "relative",
          borderRadius: tokens.radius.card,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
            width: "4px",
            height: "100%",
            background: "#fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        />

        {/* Labels */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: tokens.radius.sm,
            fontSize: "20px",
          }}
        >
          ก่อน
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: tokens.radius.sm,
            fontSize: "20px",
          }}
        >
          หลัง
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "40px",
          opacity: statsOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.primary,
            }}
          >
            {panels}
          </div>
          <div style={{ fontSize: "24px", color: tokens.colors.textMuted }}>
            แผง
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.savings,
            }}
          >
            {annualSavings}
          </div>
          <div style={{ fontSize: "24px", color: tokens.colors.textMuted }}>
            ประหยัด/ปี
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.accent2,
            }}
          >
            {payback}
          </div>
          <div style={{ fontSize: "24px", color: tokens.colors.textMuted }}>
            คืนทุน
          </div>
        </div>
      </div>

      {/* System Info */}
      <div
        style={{
          background: "#f8fafc",
          padding: "24px 40px",
          borderRadius: tokens.radius.card,
          fontSize: "28px",
          color: tokens.colors.text,
          marginBottom: "40px",
          opacity: statsOpacity,
        }}
      >
        ระบบ: {system}
      </div>

      {/* Quote */}
      <div
        style={{
          fontSize: "32px",
          fontStyle: "italic",
          color: tokens.colors.textMuted,
          textAlign: "center",
          maxWidth: "800px",
          opacity: quoteOpacity,
        }}
      >
        {'\u201C'}{quote}{'\u201D'}
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
        ดูผลงานทั้งหมด
      </div>
    </AbsoluteFill>
  );
};
