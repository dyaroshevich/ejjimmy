import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { videoBrand } from "../brand";

interface BrandStoryProps {
  tagline: string;
  stats: Array<{ value: string; label: string }>;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ tagline, stats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const logoScale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  const statOpacity = (index: number) =>
    interpolate(frame, [50 + index * 20, 70 + index * 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const statY = (index: number) =>
    interpolate(frame, [50 + index * 20, 70 + index * 20], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const taglineOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [200, 220], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: gradients.dark,
        fontFamily: FONT_FAMILY,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: tokens.colors.primary,
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <span style={{ fontSize: "100px" }}>☀️</span>
          {videoBrand.name}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "60px",
          marginBottom: "60px",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              textAlign: "center",
              opacity: statOpacity(index),
              transform: `translateY(${statY(index)}px)`,
            }}
          >
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: tokens.colors.savings,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "28px",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "48px",
          fontWeight: 600,
          color: tokens.colors.textDark,
          textAlign: "center",
          marginBottom: "80px",
          opacity: taglineOpacity,
        }}
      >
        {tagline}
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
        เริ่มต้นใช้พลังงานสะอาด
      </div>
    </AbsoluteFill>
  );
};
