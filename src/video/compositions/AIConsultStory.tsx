import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { videoBrand } from "../brand";

interface AIConsultStoryProps {
  title: string;
  features: string[];
  chatDemo: Array<{ user: string; ai: string }>;
}

export const AIConsultStory: React.FC<AIConsultStoryProps> = ({
  title,
  features,
  chatDemo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = interpolate(frame, [0, 20], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  const messageOpacity = (index: number) =>
    interpolate(frame, [30 + index * 30, 50 + index * 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const messageY = (index: number) =>
    interpolate(frame, [30 + index * 30, 50 + index * 30], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const featureOpacity = (index: number) =>
    interpolate(frame, [150 + index * 25, 175 + index * 25], [0, 1], {
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
        background: gradients.dark,
        fontFamily: FONT_FAMILY,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "52px",
          fontWeight: 800,
          color: tokens.colors.textDark,
          textAlign: "center",
          margin: "0 0 40px 0",
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {title}
      </h1>

      {/* Phone Mockup */}
      <div
        style={{
          width: "700px",
          height: "900px",
          background: "#1a1a1a",
          borderRadius: "40px",
          padding: "20px",
          transform: `scale(${phoneScale})`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          marginBottom: "40px",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            background: tokens.colors.primary,
            borderRadius: "30px 30px 0 0",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ☀️
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}>
              {videoBrand.name} AI
            </div>
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>
              ออนไลน์อยู่
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            background: "#f0f0f0",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            height: "700px",
          }}
        >
          {chatDemo.map((msg, index) => (
            <>
              {/* User Message */}
              <div
                style={{
                  alignSelf: "flex-end",
                  background: tokens.colors.primary,
                  color: "#fff",
                  padding: "16px 20px",
                  borderRadius: "20px 20px 4px 20px",
                  maxWidth: "80%",
                  fontSize: "22px",
                  opacity: messageOpacity(index),
                  transform: `translateY(${messageY(index)}px)`,
                }}
              >
                {msg.user}
              </div>

              {/* AI Message */}
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#fff",
                  color: tokens.colors.text,
                  padding: "16px 20px",
                  borderRadius: "20px 20px 20px 4px",
                  maxWidth: "80%",
                  fontSize: "22px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  opacity: messageOpacity(index),
                  transform: `translateY(${messageY(index)}px)`,
                }}
              >
                {msg.ai}
              </div>
            </>
          ))}

          {/* Typing Indicator */}
          <div
            style={{
              alignSelf: "flex-start",
              background: "#fff",
              padding: "16px 24px",
              borderRadius: "20px",
              display: "flex",
              gap: "8px",
              opacity: interpolate(frame, [100, 120], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#999",
                animation: "pulse 1s infinite",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#999",
                animation: "pulse 1s infinite 0.3s",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#999",
                animation: "pulse 1s infinite 0.6s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "32px",
              color: tokens.colors.textDark,
              opacity: featureOpacity(index),
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: tokens.colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              ✓
            </div>
            {feature}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          background: tokens.colors.secondary,
          color: "#fff",
          padding: "24px 64px",
          borderRadius: tokens.radius.button,
          fontSize: "40px",
          fontWeight: 700,
          opacity: ctaOpacity,
          boxShadow: "0 10px 30px rgba(245, 158, 11, 0.3)",
        }}
      >
        ลองถาม AI เลย
      </div>
    </AbsoluteFill>
  );
};
