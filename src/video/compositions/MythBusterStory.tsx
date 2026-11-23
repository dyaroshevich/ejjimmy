import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { scalePop, slideIn, shake, pulse } from "../animations";

// ─── UNIQUE STYLE: Debunk — question → cross → proof ──────────────

const MythQuestionScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 40, 16);
  const questionScale = scalePop(frame, 12, 22);
  const questionOpacity = interpolate(frame, [12, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeAmount = shake(frame, 40, 20, 5, 8);

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "20px", opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        ความเชื่อผิดๆ
      </div>

      <div style={{
        transform: `scale(${questionScale}) translateX(${shakeAmount}px)`,
        opacity: questionOpacity,
        background: "rgba(255,255,255,0.08)", borderRadius: "28px", padding: "44px 36px",
        width: "100%", maxWidth: "780px", border: "2px solid rgba(255,255,255,0.1)", textAlign: "center",
      }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>🌧️</div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
          {'"ถ้าแดดหมด'}<br />{'จะทำยังไง?"'}
        </div>
        <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginTop: "14px" }}>— คำถามยอดฮิต</div>
      </div>
    </AbsoluteFill>
  );
};

const DebunkScene: React.FC<{ frame: number }> = ({ frame }) => {
  const crossScale = scalePop(frame, 0, 18);
  const crossOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const factY = slideIn(frame, 20, 30, 16);
  const factOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsOpacity = interpolate(frame, [45, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{ position: "relative", marginBottom: "40px" }}>
        <div style={{ fontSize: "38px", fontWeight: 900, color: tokens.colors.danger, opacity: 0.4, textDecoration: "line-through" }}>
          {'"ถ้าแดดหมด ระบบใช้ไม่ได้"'}
        </div>
        <div style={{
          position: "absolute", top: "-18px", right: "-36px", fontSize: "60px",
          opacity: crossOpacity, transform: `scale(${crossScale}) rotate(-15deg)`,
        }}>❌</div>
      </div>

      <div style={{ opacity: factOpacity, transform: `translateY(${factY}px)`, textAlign: "center", marginBottom: "36px" }}>
        <div style={{ fontSize: "36px", fontWeight: 900, color: tokens.colors.primary, lineHeight: 1.3 }}>
          กระบี่มีแดด <span style={{ color: tokens.colors.secondary }}>365 วัน</span>
        </div>
        <div style={{ fontSize: "20px", color: tokens.colors.textMuted, marginTop: "10px" }}>ฝนตกก็ยังมีแสง UV ผ่านเมฆได้</div>
      </div>

      <div style={{ opacity: statsOpacity, display: "flex", gap: "20px", width: "100%", maxWidth: "780px" }}>
        {[
          { value: "2,100+", label: "ชั่วโมงแดด/ปี", icon: "☀️" },
          { value: "98%", label: "วันที่มีแดด", icon: "📅" },
          { value: "0", label: "วันแดดหมดจริงๆ", icon: "🌧️" },
        ].map((stat, i) => {
          const d = 50 + i * 7;
          const statScale = scalePop(frame, d, 14);
          const statOpacity = interpolate(frame, [d, d + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              flex: 1, background: "#fff", borderRadius: "20px", padding: "24px 14px",
              textAlign: "center", opacity: statOpacity, transform: `scale(${statScale})`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: "34px", marginBottom: "6px" }}>{stat.icon}</div>
              <div style={{ fontSize: "30px", fontWeight: 900, color: tokens.colors.primary }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: tokens.colors.textMuted, marginTop: "4px", fontWeight: 600 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const MathProofScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 14);

  const mathLines = [
    { text: "ผลิตไฟเฉลี่ย 12 หน่วย/วัน", delay: 12 },
    { text: "× 365 วัน = 4,380 หน่วย/ปี", delay: 24 },
    { text: "× ฿10/หน่วย = ฿43,800", delay: 36 },
    { text: "= ประหยัด ฿3,650/เดือน", delay: 48 },
  ];

  const totalScale = scalePop(frame, 65, 22);
  const totalOpacity = interpolate(frame, [65, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>พิสูจน์ด้วยตัวเลข</div>
        <div style={{ fontSize: "40px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>คณิตศาสตร์ไม่โกหก</div>
      </div>

      <div style={{ width: "100%", maxWidth: "780px" }}>
        {mathLines.map((line, i) => {
          const lineOpacity = interpolate(frame, [line.delay, line.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const lineX = slideIn(frame, line.delay, 35, 14);
          const isLast = i === mathLines.length - 1;
          return (
            <div key={i} style={{
              fontSize: isLast ? "30px" : "26px", fontWeight: isLast ? 900 : 700,
              color: isLast ? tokens.colors.secondary : "rgba(255,255,255,0.8)",
              marginBottom: "16px", opacity: lineOpacity, transform: `translateX(${lineX}px)`,
              padding: "14px 20px",
              background: isLast ? `${tokens.colors.secondary}15` : "rgba(255,255,255,0.05)",
              borderRadius: "10px", borderLeft: `4px solid ${isLast ? tokens.colors.secondary : tokens.colors.primary}`,
            }}>{line.text}</div>
          );
        })}
      </div>

      <div style={{
        marginTop: "28px", opacity: totalOpacity, transform: `scale(${totalScale})`,
        background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
        color: "#fff", padding: "18px 44px", borderRadius: "20px",
        fontSize: "26px", fontWeight: 900, boxShadow: `0 12px 40px ${tokens.colors.primary}40`,
      }}>☀️ แดดไม่เคยหมด แค่หมอกบางวัน</div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = scalePop(frame, 0, 18);
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const ctaPulse = pulse(frame, 25, 0.1, 0.04);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, #E67A00 100%)`,
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        fontSize: "52px", fontWeight: 900, color: "#fff", textAlign: "center",
        transform: `scale(${scale})`, opacity, lineHeight: 1.3, marginBottom: "48px",
      }}>
        ไม่ต้องกลัว<br /><span style={{ color: "#fef3c7" }}>แดดมีทุกวัน</span>
      </div>
      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "34px", fontWeight: 800,
        transform: `scale(${ctaPulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>ดูตัวเลขจริง</div>
    </AbsoluteFill>
  );
};

export const MythBusterStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={3 * fps}><MythQuestionScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={3 * fps} durationInFrames={4 * fps}><DebunkScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={7 * fps} durationInFrames={5 * fps}><MathProofScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={12 * fps} durationInFrames={3 * fps}><CTAScene frame={useCurrentFrame()} /></Sequence>
    </AbsoluteFill>
  );
};
