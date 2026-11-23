import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { scalePop, slideIn, anticipate, pulse } from "../animations";

// ─── UNIQUE STYLE: POV Narrative — day cycle storytelling ──────────

const MorningScene: React.FC<{ frame: number }> = ({ frame }) => {
  // Плавное рассветное появление — bg медленно проявляется
  const bgOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const phoneScale = scalePop(frame, 18, 22);
  const phoneOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const earnings = interpolate(frame, [32, 65], [0, 142], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const notifY = slideIn(frame, 70, 25, 12);
  const notifOpacity = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 30%, #fbbf24 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
      opacity: bgOpacity,
    }}>
      <div style={{
        position: "absolute", top: "56px", left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.3)", color: "#fff",
        padding: "7px 22px", borderRadius: "18px",
        fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
        opacity: interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>POV: คุณตื่นนอน</div>

      <div style={{
        transform: `scale(${phoneScale})`, opacity: phoneOpacity,
        background: "#fff", borderRadius: "28px", padding: "28px",
        width: "100%", maxWidth: "680px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "10px",
            background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
          }}>☀️</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: tokens.colors.text }}>Solar System</div>
            <div style={{ fontSize: "11px", color: tokens.colors.textMuted }}>เมื่อ 06:45 น.</div>
          </div>
        </div>
        <div style={{ fontSize: "16px", color: tokens.colors.text, fontWeight: 600, marginBottom: "10px" }}>
          🌅 พระอาทิตย์ขึ้นแล้ว!
        </div>
        <div style={{ fontSize: "48px", fontWeight: 900, color: tokens.colors.primary, lineHeight: 1 }}>
          +฿{Math.round(earnings).toLocaleString()}
        </div>
        <div style={{ fontSize: "13px", color: tokens.colors.textMuted, marginTop: "3px" }}>รายได้จากโซลาร์วันนี้</div>
      </div>

      <div style={{
        marginTop: "20px", opacity: notifOpacity, transform: `translateY(${notifY}px)`,
        background: `${tokens.colors.primary}15`, borderRadius: "14px", padding: "14px 20px",
        width: "100%", maxWidth: "680px", border: `1px solid ${tokens.colors.primary}30`,
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ fontSize: "22px" }}>⚡</span>
        <span style={{ fontSize: "15px", color: tokens.colors.primary, fontWeight: 700 }}>
          ระบบเริ่มผลิตไฟแล้ว — 8 แผงทำงานเต็มที่
        </span>
      </div>
    </AbsoluteFill>
  );
};

const NoonScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 14);
  const sunScale = interpolate(frame, [0, 55], [0.8, 1.2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const sunGlow = interpolate(frame, [0, 28, 55], [0.3, 0.6, 0.3], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panelPower = interpolate(frame, [12, 38], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const outputKw = interpolate(frame, [12, 38], [0, 4.8], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 40%, #fef3c7 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{
        position: "absolute", top: "10%", left: "50%",
        transform: `translateX(-50%) scale(${sunScale})`, fontSize: "110px",
        filter: `drop-shadow(0 0 ${sunGlow * 55}px rgba(251,191,36,${sunGlow}))`,
      }}>☀️</div>

      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "40px", marginTop: "90px" }}>
        <div style={{ fontSize: "16px", color: "rgba(0,0,0,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>เที่ยงวัน</div>
        <div style={{ fontSize: "42px", fontWeight: 900, color: tokens.colors.text, lineHeight: 1.2 }}>โซลาร์ทำงานเต็มที่</div>
      </div>

      <div style={{
        background: "#fff", borderRadius: "28px", padding: "36px",
        width: "100%", maxWidth: "680px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)", textAlign: "center",
      }}>
        <div style={{ fontSize: "13px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>กำลังผลิตตอนนี้</div>
        <div style={{ fontSize: "80px", fontWeight: 900, color: tokens.colors.primary, lineHeight: 1 }}>{outputKw.toFixed(1)}</div>
        <div style={{ fontSize: "22px", color: tokens.colors.textMuted, fontWeight: 700, marginBottom: "20px" }}>kW</div>

        <div style={{ width: "100%", height: "14px", background: "#e2e8f0", borderRadius: "7px", overflow: "hidden", marginBottom: "14px" }}>
          <div style={{
            width: `${panelPower}%`, height: "100%",
            background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
            borderRadius: "7px", boxShadow: `0 0 10px ${tokens.colors.primary}40`,
          }} />
        </div>
        <div style={{ fontSize: "13px", color: tokens.colors.textMuted }}>{Math.round(panelPower)}% ของกำลังสูงสุด 5kW</div>

        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px" }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const panelOnFrame = 12 + i * 3;
            const panelOpacity = interpolate(frame, [panelOnFrame, panelOnFrame + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const panelOn = frame > panelOnFrame;
            return (
              <div key={i} style={{
                aspectRatio: "16/10", borderRadius: "5px",
                background: panelOn ? "linear-gradient(135deg, #1e3a5f, #2563eb)" : "#e2e8f0",
                border: panelOn ? "1px solid #60a5fa" : "1px solid #d1d5db",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: panelOn ? "#fff" : "#9ca3af",
                opacity: panelOn ? panelOpacity : 1,
              }}>{panelOn ? "⚡" : "—"}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EveningScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 14);
  const tvOnFrame = 22;
  const tvGlow = interpolate(frame, [tvOnFrame, tvOnFrame + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const tvOn = frame > tvOnFrame;
  const badgeScale = scalePop(frame, 42, 18);
  const badgeOpacity = interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>ค่ำคืน</div>
        <div style={{ fontSize: "42px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}> המשפחהดูทีวี</div>
      </div>

      <div style={{
        width: "100%", maxWidth: "680px", background: "#111",
        borderRadius: "14px", padding: "20px",
        border: `3px solid ${tvOn ? tokens.colors.primary : "#333"}`,
        boxShadow: tvOn ? `0 0 ${tvGlow * 36}px ${tokens.colors.primary}30` : "none",
        position: "relative",
      }}>
        <div style={{
          width: "100%", aspectRatio: "16/9", borderRadius: "6px",
          background: tvOn ? `linear-gradient(135deg, ${tokens.colors.primary}30, ${tokens.colors.secondary}30)` : "#0a0a0a",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px",
        }}>{tvOn ? "🎬" : "⚫"}</div>
        <div style={{
          position: "absolute", bottom: "6px", right: "14px",
          width: "7px", height: "7px", borderRadius: "50%",
          background: tvOn ? tokens.colors.primary : "#333",
          boxShadow: tvOn ? `0 0 7px ${tokens.colors.primary}` : "none",
        }} />
      </div>

      <div style={{
        marginTop: "28px", opacity: badgeOpacity, transform: `scale(${badgeScale})`,
        background: `${tokens.colors.primary}15`, borderRadius: "14px", padding: "18px 28px",
        border: `1px solid ${tokens.colors.primary}30`, textAlign: "center",
      }}>
        <div style={{ fontSize: "26px", fontWeight: 900, color: tokens.colors.primary }}>📺 ทีวีดูด้วยโซลาร์</div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>ผลิตไฟกลางวัน → เก็บในแบต → ใช้ตอนกลางคืน</div>
      </div>
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
        ชีวิตมีโซลาร์<br /><span style={{ color: "#fef3c7" }}>ดีกว่าที่คิด</span>
      </div>
      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "34px", fontWeight: 800,
        transform: `scale(${ctaPulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>เริ่มเลยวันนี้</div>
    </AbsoluteFill>
  );
};

export const POVSolarDayStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={4 * fps}><MorningScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={4 * fps} durationInFrames={4 * fps}><NoonScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={8 * fps} durationInFrames={4 * fps}><EveningScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={12 * fps} durationInFrames={3 * fps}><CTAScene frame={useCurrentFrame()} /></Sequence>
    </AbsoluteFill>
  );
};
