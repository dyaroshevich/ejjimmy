import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { scalePop, slideIn } from "../animations";

// ─── SCENES ────────────────────────────────────────────────────────

const Day1Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 15);

  const panelsCount = 8;
  const panelsRevealed = Math.min(Math.floor(frame / 4), panelsCount);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 40%, #e0f2fe 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      <div style={{
        position: "absolute", top: "8%", right: "15%",
        fontSize: "80px",
        opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `scale(${scalePop(frame, 5, 20)})`,
      }}>
        ☀️
      </div>

      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "18px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>
          วันที่ 1
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: tokens.colors.text, lineHeight: 1.2 }}>
          ติดตั้งเสร็จ!
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
        <div style={{
          width: "100%", height: "0",
          borderLeft: "40px solid transparent",
          borderRight: "40px solid transparent",
          borderBottom: "120px solid #92400e",
          position: "relative",
        }} />

        <div style={{
          position: "absolute", top: "30px", left: "50%", transform: "translateX(-50%)",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px",
          width: "70%",
        }}>
          {Array.from({ length: panelsCount }).map((_, i) => (
            <div key={i} style={{
              width: "100%", aspectRatio: "16/10",
              background: i < panelsRevealed
                ? "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)"
                : "transparent",
              borderRadius: "4px",
              border: i < panelsRevealed ? "1px solid #60a5fa" : "1px dashed rgba(255,255,255,0.3)",
              opacity: i < panelsRevealed ? interpolate(frame, [i * 4, i * 4 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0,
              transform: `scale(${i < panelsRevealed ? scalePop(frame, i * 4, 12) : 0.5})`,
              boxShadow: i < panelsRevealed ? "0 2px 8px rgba(37,99,235,0.3)" : undefined,
            }} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: "40px", fontSize: "22px", color: tokens.colors.textMuted, fontWeight: 600, opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        แผงโซลาร์ 5kW บนหลังคา
      </div>
    </AbsoluteFill>
  );
};

const Day30Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 15);

  const counterProgress = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayUnits = Math.round(450 * counterProgress);
  const displayBaht = Math.round(4500 * counterProgress);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "18px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>
          วันที่ 30
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: tokens.colors.text, lineHeight: 1.2 }}>
          บิลแรกมาแล้ว
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", width: "100%", maxWidth: "800px" }}>
        <div style={{
          flex: 1, background: "#fff", borderRadius: "24px", padding: "32px",
          border: "2px solid rgba(239,68,68,0.2)", textAlign: "center",
          opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: "14px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>ก่อน</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: tokens.colors.danger }}>฿4,500</div>
          <div style={{ fontSize: "14px", color: tokens.colors.textMuted, marginTop: "8px" }}>450 หน่วย</div>
        </div>

        <div style={{
          flex: 1, background: "#fff", borderRadius: "24px", padding: "32px",
          border: `2px solid ${tokens.colors.primary}40`, textAlign: "center",
          opacity: interpolate(frame, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${scalePop(frame, 25, 20)})`,
        }}>
          <div style={{ fontSize: "14px", color: tokens.colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>หลัง</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: tokens.colors.primary }}>฿0</div>
          <div style={{ fontSize: "14px", color: tokens.colors.textMuted, marginTop: "8px" }}>{displayUnits} หน่วย (ผลิตเอง)</div>
        </div>
      </div>

      <div style={{
        marginTop: "40px", textAlign: "center",
        opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `scale(${scalePop(frame, 50, 20)})`,
      }}>
        <div style={{ fontSize: "18px", color: tokens.colors.textMuted, fontWeight: 700 }}>ประหยัดไปแล้ว</div>
        <div style={{ fontSize: "64px", fontWeight: 900, color: tokens.colors.secondary, fontFamily: tokens.fonts.mono }}>
          ฿{displayBaht.toLocaleString()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Day180Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 15);

  const progressWidth = interpolate(frame, [20, 70], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const milestoneOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const milestoneScale = scalePop(frame, 70, 25);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0e00 0%, #2D1A04 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>
          วันที่ 180
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
          ครึ่งทางแล้ว!
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>฿0</span>
          <span style={{ fontSize: "16px", color: tokens.colors.secondary, fontWeight: 700 }}>คืนทุน</span>
        </div>
        <div style={{ width: "100%", height: "24px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{
            width: `${progressWidth}%`, height: "100%",
            background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
            borderRadius: "12px",
            boxShadow: `0 0 20px ${tokens.colors.primary}60`,
          }} />
        </div>
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <span style={{ fontSize: "28px", fontWeight: 900, color: tokens.colors.secondary }}>
            {Math.round(progressWidth)}%
          </span>
        </div>
      </div>

      <div style={{ opacity: milestoneOpacity, transform: `scale(${milestoneScale})`, textAlign: "center" }}>
        <div style={{ fontSize: "80px", marginBottom: "16px" }}>🎯</div>
        <div style={{ fontSize: "32px", fontWeight: 900, color: tokens.colors.secondary, lineHeight: 1.3 }}>
          ไปแล้ว 50% ของจุดคืนทุน
        </div>
        <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", marginTop: "12px" }}>
          อีก 180 วันก็คืนทุน!
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ConfettiPiece: React.FC<{ frame: number; index: number; totalFrames: number }> = ({ frame, index, totalFrames }) => {
  const colors = [tokens.colors.primary, tokens.colors.secondary, "#fff"];
  const color = colors[index % 3];
  const isRound = index % 2 === 0;
  const startX = (index * 17) % 100;
  const startY = -10 + (index * 13) % 40;
  const wobble = Math.sin(frame * 0.1 + index) * 15;

  const y = interpolate(frame, [0, totalFrames], [startY, startY + 120], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const rotation = frame * (3 + index % 5);

  const opacity = interpolate(frame, [0, 10, totalFrames - 15, totalFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      left: `${startX + wobble * 0.3}%`,
      top: `${y}%`,
      width: "8px", height: "8px",
      background: color,
      borderRadius: isRound ? "50%" : "2px",
      transform: `rotate(${rotation}deg)`,
      opacity,
    }} />
  );
};

const Day365Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 0, 30, 15);

  const counterProgress = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displaySavings = Math.round(31800 * counterProgress);

  const confettiOpacity = interpolate(frame, [30, 40, 70, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: confettiOpacity }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece key={i} frame={frame} index={i} totalFrames={80} />
        ))}
      </div>

      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: "center", marginBottom: "48px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>
          วันที่ 365
        </div>
        <div style={{ fontSize: "44px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
          คืนทุนแล้ว! 🎉
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.08)", borderRadius: "32px", padding: "48px 40px",
        width: "100%", maxWidth: "800px", textAlign: "center",
        border: `2px solid ${tokens.colors.primary}30`,
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          ประหยัดไปทั้งปี
        </div>
        <div style={{ fontSize: "80px", fontWeight: 900, color: tokens.colors.secondary, lineHeight: 1 }}>
          ฿{displaySavings.toLocaleString()}
        </div>
        <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", marginTop: "12px" }}>
          เทียบกับค่าไฟเดิม
        </div>

        <div style={{ marginTop: "32px", padding: "16px", background: `${tokens.colors.primary}15`, borderRadius: "16px", display: "flex", justifyContent: "space-around" }}>
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>ค่าไฟเก่า/ปี</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: tokens.colors.danger }}>฿54,000</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>ค่าไฟใหม่/ปี</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: tokens.colors.primary }}>฿0</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = scalePop(frame, 0, 18);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaPulse = interpolate(frame, [35, 55, 75, 95], [1, 1.05, 1, 1.05], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, #E67A00 100%)`,
        fontFamily: FONT_FAMILY,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{ fontSize: "52px", fontWeight: 900, color: "#fff", textAlign: "center", transform: `scale(${scale})`, opacity, lineHeight: 1.3, marginBottom: "48px" }}>
        365 วัน<br /><span style={{ color: "#fef3c7" }}>คุ้มกว่าที่คิด</span>
      </div>

      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "34px", fontWeight: 800,
        opacity: ctaOpacity, transform: `scale(${ctaPulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        เริ่มวันนี้เลย
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────

export const Day365Story: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={4 * fps}>
        <Day1Scene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={4 * fps} durationInFrames={4 * fps}>
        <Day30Scene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={4 * fps}>
        <Day180Scene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={12 * fps} durationInFrames={4 * fps}>
        <Day365Scene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={16 * fps} durationInFrames={3 * fps}>
        <CTAScene frame={useCurrentFrame()} />
      </Sequence>
    </AbsoluteFill>
  );
};
