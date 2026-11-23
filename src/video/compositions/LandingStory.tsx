import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

const FEATURES = [
  { icon: "💬", title: "ถามเรื่องโซลาร์", desc: "ข้อมูลพื้นฐานและเชิงลึก" },
  { icon: "⚡", title: "ดูข้อมูลอุปกรณ์", desc: "เปรียบเทียบแผงและอินเวอร์เตอร์" },
  { icon: "📊", title: "ประเมินเบื้องต้น", desc: "คำนวณขนาดและจุดคืนทุน" },
  { icon: "👷", title: "คุยกับวิศวกร", desc: "ปรึกษาทีมงานผ่านแชท" },
];

const STEPS = [
  { num: "01", title: "เลือกประเภทอาคาร", desc: "ระบุเป้าหมายเพื่อรับข้อมูลที่เจาะจง" },
  { num: "02", title: "คุยและประเมิน", desc: "ประเมินราคาผ่าน AI ในไม่ถึงนาที" },
  { num: "03", title: "ปรึกษากับวิศวกร", desc: "นัดสำรวจหน้างานฟรี" },
];

const BrandIntro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoScale = interpolate(frame, [0, 20], [0.5, 1], { extrapolateRight: "clamp" });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [25, 45], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #2D1A04 0%, #1a0e00 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "120px",
          fontWeight: 900,
          color: tokens.colors.primary,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          letterSpacing: "-4px",
          textAlign: "center",
        }}
      >
        TAWAN POWER
        <br />
        KRABI
      </div>

      {/* Divider */}
      <div
        style={{
          width: interpolate(frame, [20, 40], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: "4px",
          background: tokens.colors.secondary,
          margin: "40px 0",
          borderRadius: "2px",
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: "52px",
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          lineHeight: 1.3,
        }}
      >
        เปลี่ยนแสงแดด
        <br />
        เป็นความประหยัด
      </div>

      {/* Sub */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          marginTop: "32px",
          opacity: subOpacity,
          maxWidth: "700px",
          lineHeight: 1.5,
        }}
      >
        ผู้เชี่ยวชาญด้านโซลาร์ในกระบี่
        <br />
        ประเมินฟรีด้วย AI รับประกัน 25 ปี
      </div>
    </AbsoluteFill>
  );
};

const FeaturesSlide: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: gradients.surface,
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: "44px",
          fontWeight: 800,
          color: tokens.colors.text,
          marginBottom: "48px",
          opacity: titleOpacity,
        }}
      >
        สิ่งที่คุณจะได้รับ
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {FEATURES.map((feature, i) => {
          const delay = 15 + i * 12;
          const featureOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const featureX = interpolate(frame, [delay, delay + 12], [-40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                opacity: featureOpacity,
                transform: `translateX(${featureX}px)`,
                background: "#f8fafc",
                padding: "28px 32px",
                borderRadius: "16px",
                borderLeft: `5px solid ${tokens.colors.primary}`,
              }}
            >
              <div style={{ fontSize: "48px" }}>{feature.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: tokens.colors.text,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    color: tokens.colors.textMuted,
                    marginTop: "4px",
                  }}
                >
                  {feature.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const StepsSlide: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #2D1A04 0%, #1a0e00 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: "44px",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "16px",
          opacity: titleOpacity,
        }}
      >
        เริ่มต้นง่าย ๆ
      </div>
      <div
        style={{
          fontSize: "28px",
          color: "rgba(255,255,255,0.6)",
          marginBottom: "48px",
          opacity: titleOpacity,
        }}
      >
        ใน 3 ขั้นตอน
      </div>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {STEPS.map((step, i) => {
          const delay = 20 + i * 20;
          const stepOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const stepY = interpolate(frame, [delay, delay + 15], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "24px",
                opacity: stepOpacity,
                transform: `translateY(${stepY}px)`,
              }}
            >
              {/* Step Number */}
              <div
                style={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: "56px",
                  fontWeight: 800,
                  color: tokens.colors.secondary,
                  lineHeight: 1,
                  minWidth: "100px",
                }}
              >
                {step.num}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    color: "rgba(255,255,255,0.6)",
                    marginTop: "8px",
                    lineHeight: 1.4,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CTASlide: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [40, 60, 80, 100], [1, 1.05, 1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #FF8A00 0%, #E67A00 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
      }}
    >
      {/* Main CTA */}
      <div
        style={{
          fontSize: "56px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
          lineHeight: 1.3,
          marginBottom: "40px",
        }}
      >
        เริ่มประหยัด
        <br />
        <span style={{ color: "#fef3c7" }}>วันนี้</span>
      </div>

      {/* CTA Button */}
      <div
        style={{
          background: "#fff",
          color: tokens.colors.primary,
          padding: "28px 72px",
          borderRadius: "60px",
          fontSize: "36px",
          fontWeight: 800,
          opacity: ctaOpacity,
          transform: `scale(${pulse})`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        ประเมินฟรี
      </div>

      {/* Contact */}
      <div
        style={{
          marginTop: "48px",
          fontSize: "28px",
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          opacity: ctaOpacity,
          fontFamily: tokens.fonts.mono,
        }}
      >
        tawanpower.vercel.app
      </div>
    </AbsoluteFill>
  );
};

export const LandingStory: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* 0-5s: Brand Intro */}
      <Sequence from={0} durationInFrames={5 * fps}>
        <BrandIntro frame={useCurrentFrame()} fps={fps} />
      </Sequence>

      {/* 5-10s: Features */}
      <Sequence from={5 * fps} durationInFrames={5 * fps}>
        <FeaturesSlide frame={useCurrentFrame()} fps={fps} />
      </Sequence>

      {/* 10-15s: Steps */}
      <Sequence from={10 * fps} durationInFrames={5 * fps}>
        <StepsSlide frame={useCurrentFrame()} fps={fps} />
      </Sequence>

      {/* 15-20s: CTA */}
      <Sequence from={15 * fps} durationInFrames={5 * fps}>
        <CTASlide frame={useCurrentFrame()} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
