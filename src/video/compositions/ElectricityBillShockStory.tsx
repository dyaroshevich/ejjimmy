import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { scalePop, slideIn, shake, pulse } from "../animations";

// ─── UNIQUE STYLE: Drama — shake, flash, contrast ─────────────────

const ShockScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 40, 16);
  const billScale = scalePop(frame, 12, 22);
  const billOpacity = interpolate(frame, [12, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Сильный shake с затуханием — драматический эффект
  const shakeAmount = shake(frame, 30, 25, 6, 8);

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{
        fontSize: "38px", fontWeight: 800, color: tokens.colors.danger,
        textAlign: "center", opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: "36px",
      }}>ค่าไฟเดือนนี้...</div>

      <div style={{
        transform: `scale(${billScale}) translateX(${shakeAmount}px)`,
        opacity: billOpacity,
        background: "#fff", borderRadius: "28px", padding: "44px 36px",
        width: "100%", maxWidth: "780px",
        boxShadow: "0 20px 60px rgba(239,68,68,0.18)",
        border: "2px solid rgba(239,68,68,0.2)", textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", color: tokens.colors.textMuted, marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          ใบแจ้งค่าไฟฟ้า
        </div>
        <div style={{ fontSize: "22px", color: tokens.colors.text, marginBottom: "20px", fontWeight: 600 }}>
          การไฟฟ้าส่วนภูมิภาค
        </div>
        <div style={{ fontSize: "108px", fontWeight: 900, color: tokens.colors.danger, lineHeight: 1, marginBottom: "6px" }}>
          ฿4,500
        </div>
        <div style={{ fontSize: "18px", color: tokens.colors.textMuted, fontWeight: 600 }}>/เดือน</div>

        <div style={{ marginTop: "28px", padding: "14px", background: "#fef2f2", borderRadius: "14px", display: "flex", justifyContent: "space-around" }}>
          <div>
            <div style={{ fontSize: "13px", color: tokens.colors.textMuted, fontWeight: 700 }}>หน่วย</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: tokens.colors.danger }}>450</div>
            <div style={{ fontSize: "11px", color: tokens.colors.textMuted }}>kWh</div>
          </div>
          <div style={{ width: "1px", background: "#e5e7eb" }} />
          <div>
            <div style={{ fontSize: "13px", color: tokens.colors.textMuted, fontWeight: 700 }}>ต่อหน่วย</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: tokens.colors.danger }}>฿10</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TransitionScene: React.FC<{ frame: number }> = ({ frame }) => {
  // Взрыв белого света → затемнение
  const flashOpacity = interpolate(frame, [0, 4, 12, 25], [0, 1, 0.8, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textScale = scalePop(frame, 8, 18);

  return (
    <AbsoluteFill style={{
      background: "#000", fontFamily: FONT_FAMILY,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flashOpacity }} />
      <div style={{ opacity: textOpacity, transform: `scale(${textScale})`, textAlign: "center" }}>
        <div style={{ fontSize: "72px", marginBottom: "20px" }}>☀️</div>
        <div style={{ fontSize: "48px", fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
          ติดตั้งโซลาร์<br />บนหลังคา
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SavingsScene: React.FC<{ frame: number }> = ({ frame }) => {
  // Вращающийся счётчик → карточка → экономия → бейдж
  const meterRotation = interpolate(frame, [0, 100], [0, -720], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const billScale = scalePop(frame, 25, 18);
  const billOpacity = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const savingsScale = scalePop(frame, 55, 18);
  const savingsOpacity = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeScale = scalePop(frame, 85, 22);
  const badgeOpacity = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      {/* Meter */}
      <div style={{
        width: "180px", height: "180px", borderRadius: "50%",
        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        border: "5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)", marginBottom: "36px", position: "relative",
      }}>
        <div style={{ fontSize: "44px", transform: `rotate(${meterRotation}deg)` }}>⚡</div>
        <div style={{
          position: "absolute", bottom: "-8px",
          background: tokens.colors.primary, color: "#fff",
          padding: "5px 14px", borderRadius: "16px", fontSize: "13px", fontWeight: 800,
        }}>ย้อนกลับ!</div>
      </div>

      <div style={{
        transform: `scale(${billScale})`, opacity: billOpacity,
        background: "#fff", borderRadius: "22px", padding: "28px",
        width: "100%", maxWidth: "680px", boxShadow: "0 12px 40px rgba(16,185,129,0.12)",
        border: `2px solid ${tokens.colors.primary}30`, textAlign: "center", marginBottom: "20px",
      }}>
        <div style={{ fontSize: "13px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
          หลังโซลาร์
        </div>
        <div style={{ fontSize: "76px", fontWeight: 900, color: tokens.colors.primary, lineHeight: 1 }}>฿0</div>
        <div style={{ fontSize: "16px", color: tokens.colors.textMuted }}>/เดือน</div>
      </div>

      <div style={{ opacity: savingsOpacity, transform: `scale(${savingsScale})`, textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", color: tokens.colors.textMuted, fontWeight: 700 }}>ประหยัดไป</div>
        <div style={{ fontSize: "58px", fontWeight: 900, color: tokens.colors.secondary }}>฿54,000</div>
        <div style={{ fontSize: "16px", color: tokens.colors.textMuted }}>ในปีแรก</div>
      </div>

      <div style={{
        opacity: badgeOpacity, transform: `scale(${badgeScale})`,
        background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
        color: "#fff", padding: "14px 36px", borderRadius: "50px",
        fontSize: "26px", fontWeight: 900,
        boxShadow: `0 12px 40px ${tokens.colors.primary}40`,
      }}>CASH+ ตั้งแต่วันแรก ✨</div>
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
        หยุดจ่ายค่าไฟ<br /><span style={{ color: "#fef3c7" }}>เริ่มรับเงินคืน</span>
      </div>
      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "34px", fontWeight: 800,
        transform: `scale(${ctaPulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>คำนวณของคุณฟรี</div>
    </AbsoluteFill>
  );
};

export const ElectricityBillShockStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={4 * fps}><ShockScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={4 * fps} durationInFrames={2 * fps}><TransitionScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={6 * fps} durationInFrames={5 * fps}><SavingsScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={11 * fps} durationInFrames={3 * fps}><CTAScene frame={useCurrentFrame()} /></Sequence>
    </AbsoluteFill>
  );
};
