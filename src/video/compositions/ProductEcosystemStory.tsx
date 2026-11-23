import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { slideIn, pulse } from "../animations";
import { videoBrand } from "../brand";

function sceneOpacity(frame: number, start: number, end: number, fadeIn = 15, fadeOut = 10): number {
  const inOp = interpolate(frame, [start, start + fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outOp = interpolate(frame, [end - fadeOut, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(inOp, outOp);
}

function progress(frame: number, totalFrames: number): number {
  return interpolate(frame, [0, totalFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

interface ProductEcosystemStoryProps {
  title?: string;
  homeName?: string;
  homePrice?: string;
  homeSavings?: string;
  bizName?: string;
  bizPrice?: string;
  bizRoi?: string;
  premiumName?: string;
  premiumPrice?: string;
  premiumFeatures?: string[];
  components?: { name: string; icon: string }[];
  ctaText?: string;
}

export const ProductEcosystemStory: React.FC<ProductEcosystemStoryProps> = ({
  title = "โซลาร์ครบทุกประเภท",
  homeName = "GoodWe 5 kW",
  homePrice = "฿120,000",
  homeSavings = "ลดค่าไฟ ฿2,500/เดือน",
  bizName = "ระบบ 20kW Hybrid",
  bizPrice = "฿380,000",
  bizRoi = "ROI 4 ปี",
  premiumName = "Sigenergy 5-in-1",
  premiumPrice = "฿250,000",
  premiumFeatures = ["Inverter + Battery", "EV Charger", "MPPT", "EMS"],
  components = [
    { name: "แผงโซลาร์", icon: "☀️" },
    { name: "อินเวอร์เตอร์", icon: "⚡" },
    { name: "แบตเตอรี่", icon: "🔋" },
  ],
  ctaText = "เลือกระบบที่เหมาะกับคุณ",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing (frames)
  const HERO_END = 60;
  const HOME_START = 60;
  const HOME_END = 165;
  const BIZ_START = 165;
  const BIZ_END = 270;
  const PREMIUM_START = 270;
  const PREMIUM_END = 390;
  const COMP_START = 390;
  const COMP_END = 480;
  const CTA_START = 480;

  // Hero animations — fade out by frame 39 (01:29)
  const heroOpacity = interpolate(frame, [0, 20, 30, 39], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroTitleOpacity = interpolate(frame, [15, 30, 33, 39], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene transitions (using shared utilities)
  const homeOpacity = sceneOpacity(frame, HOME_START, HOME_END);
  const bizOpacity = sceneOpacity(frame, BIZ_START, BIZ_END);
  const premiumOpacity = sceneOpacity(frame, PREMIUM_START, PREMIUM_END);
  const compOpacity = sceneOpacity(frame, COMP_START, COMP_END);
  const ctaOpacity = sceneOpacity(frame, CTA_START, 600, 20, 10);

  // Components carousel
  const compIndex = Math.floor((frame - COMP_START) / 30) % components.length;
  const compProgress = ((frame - COMP_START) % 30) / 30;

  // CTA pulse (using shared utility)
  const ctaPulse = pulse(frame, CTA_START + 20);

  // Progress bar
  const progressBar = progress(frame, 600);

  return (
    <AbsoluteFill
      style={{
        background: gradients.dark,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      {/* ============ HERO ============ */}
      {frame < 39 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: heroOpacity,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              fontSize: "120px",
              marginBottom: "24px",
              opacity: heroOpacity,
            }}
          >
            ☀️
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              textAlign: "center",
              opacity: heroTitleOpacity,
              letterSpacing: "-0.02em",
            }}
          >
            {videoBrand.name}
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 400,
              color: tokens.colors.primary,
              marginTop: "16px",
              opacity: heroTitleOpacity,
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ HOME SCENE ============ */}
      {frame >= HOME_START && frame < HOME_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: homeOpacity,
          }}
        >
          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: "120px",
              background: tokens.colors.primary,
              color: "#fff",
              padding: "16px 40px",
              borderRadius: tokens.radius.badge,
              fontSize: "32px",
              fontWeight: 700,
              transform: `translateY(${slideIn(frame, HOME_START)}px)`,
            }}
          >
            🏠 สำหรับบ้าน
          </div>

          {/* Product icon */}
          <div
            style={{
              fontSize: "160px",
              marginBottom: "40px",
              transform: `scale(${interpolate(frame, [HOME_START + 10, HOME_START + 30], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}
          >
            ⚡
          </div>

          {/* Product name */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              marginBottom: "24px",
              transform: `translateY(${slideIn(frame, HOME_START + 5)}px)`,
            }}
          >
            {homeName}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: tokens.colors.primary,
              marginBottom: "16px",
              opacity: interpolate(frame, [HOME_START + 20, HOME_START + 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {homePrice}
          </div>

          {/* Savings */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 600,
              color: tokens.colors.savings,
              opacity: interpolate(frame, [HOME_START + 30, HOME_START + 45], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {homeSavings}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ BUSINESS SCENE ============ */}
      {frame >= BIZ_START && frame < BIZ_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: bizOpacity,
          }}
        >
          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: "120px",
              background: tokens.colors.accent2,
              color: "#fff",
              padding: "16px 40px",
              borderRadius: tokens.radius.badge,
              fontSize: "32px",
              fontWeight: 700,
              transform: `translateY(${slideIn(frame, BIZ_START)}px)`,
            }}
          >
            🏢 สำหรับธุรกิจ
          </div>

          {/* Product icon */}
          <div
            style={{
              fontSize: "160px",
              marginBottom: "40px",
              transform: `scale(${interpolate(frame, [BIZ_START + 10, BIZ_START + 30], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}
          >
            🏭
          </div>

          {/* Product name */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              marginBottom: "24px",
              transform: `translateY(${slideIn(frame, BIZ_START + 5)}px)`,
            }}
          >
            {bizName}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: tokens.colors.accent2,
              marginBottom: "16px",
              opacity: interpolate(frame, [BIZ_START + 20, BIZ_START + 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {bizPrice}
          </div>

          {/* ROI badge */}
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: tokens.colors.textDark,
              background: "rgba(59, 130, 246, 0.2)",
              padding: "16px 48px",
              borderRadius: tokens.radius.badge,
              border: "2px solid rgba(59, 130, 246, 0.4)",
              opacity: interpolate(frame, [BIZ_START + 30, BIZ_START + 45], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {bizRoi}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ PREMIUM SCENE ============ */}
      {frame >= PREMIUM_START && frame < PREMIUM_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: premiumOpacity,
          }}
        >
          {/* Gold gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(245,158,11,0.1) 0%, transparent 40%, rgba(245,158,11,0.05) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: "120px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              padding: "16px 40px",
              borderRadius: tokens.radius.badge,
              fontSize: "32px",
              fontWeight: 700,
              transform: `translateY(${slideIn(frame, PREMIUM_START)}px)`,
              boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
            }}
          >
            👑 พรีเมียม
          </div>

          {/* Product icon */}
          <div
            style={{
              fontSize: "160px",
              marginBottom: "40px",
              transform: `scale(${interpolate(frame, [PREMIUM_START + 10, PREMIUM_START + 30], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              filter: "drop-shadow(0 0 40px rgba(245, 158, 11, 0.4))",
            }}
          >
            ⚡
          </div>

          {/* Product name */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              marginBottom: "24px",
              transform: `translateY(${slideIn(frame, PREMIUM_START + 5)}px)`,
            }}
          >
            {premiumName}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: tokens.colors.secondary,
              marginBottom: "32px",
              opacity: interpolate(frame, [PREMIUM_START + 20, PREMIUM_START + 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {premiumPrice}
          </div>

          {/* Features grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
              maxWidth: "900px",
            }}
          >
            {premiumFeatures.map((feat, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: tokens.colors.textDark,
                  padding: "12px 28px",
                  borderRadius: tokens.radius.badge,
                  fontSize: "28px",
                  fontWeight: 600,
                  opacity: interpolate(frame, [PREMIUM_START + 30 + i * 8, PREMIUM_START + 40 + i * 8], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {feat}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ COMPONENTS SCENE ============ */}
      {frame >= COMP_START && frame < COMP_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: compOpacity,
          }}
        >
          {/* Title */}
          <div
            style={{
              position: "absolute",
              top: "160px",
              fontSize: "44px",
              fontWeight: 700,
              color: tokens.colors.textDark,
              opacity: interpolate(frame, [COMP_START, COMP_START + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            อุปกรณ์ทั้งหมด
          </div>

          {/* Carousel card */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "60px 80px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              transform: `scale(${interpolate(compProgress, [0, 0.1, 0.9, 1], [0.9, 1, 1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}
          >
            <div style={{ fontSize: "120px" }}>
              {components[compIndex]?.icon}
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: tokens.colors.textDark,
              }}
            >
              {components[compIndex]?.name}
            </div>
          </div>

          {/* Dots indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "200px",
              display: "flex",
              gap: "12px",
            }}
          >
            {components.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: i === compIndex ? tokens.colors.primary : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ CTA SCENE ============ */}
      {frame >= CTA_START && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: ctaOpacity,
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />

          {/* CTA text */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              textAlign: "center",
              marginBottom: "48px",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            {ctaText}
          </div>

          {/* CTA button */}
          <div
            style={{
              background: tokens.colors.primary,
              color: "#fff",
              padding: "28px 80px",
              borderRadius: tokens.radius.button,
              fontSize: "44px",
              fontWeight: 700,
              boxShadow: "0 12px 40px rgba(16, 185, 129, 0.4)",
              transform: `scale(${ctaPulse})`,
            }}
          >
            สอบถามเลย
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: tokens.colors.textMuted,
              marginTop: "32px",
              opacity: interpolate(frame, [CTA_START + 30, CTA_START + 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {videoBrand.name} — {videoBrand.tagline}
          </div>
        </AbsoluteFill>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "rgba(255,255,255,0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: `${progressBar}%`,
            height: "100%",
            background: tokens.colors.primary,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
