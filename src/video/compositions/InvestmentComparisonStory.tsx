import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { scalePop, slideIn, anticipate, pulse } from "../animations";

const INVESTMENT = 120000;
const YEARS = [0, 1, 2, 3, 5, 10, 15, 20, 25];

function carValue(year: number): number {
  return Math.round(INVESTMENT * Math.pow(0.9, year));
}
function goldValue(year: number): number {
  return Math.round(INVESTMENT * Math.pow(1.055, year));
}
function solarValue(year: number): number {
  return INVESTMENT + 31800 * year;
}
function formatBaht(v: number): string {
  if (v >= 1000000) return `฿${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `฿${(v / 1000).toFixed(0)}K`;
  return `฿${v.toLocaleString()}`;
}

// ─── UNIQUE STYLE: Animated bars + counter ────────────────────────

const HeroScene: React.FC<{ frame: number }> = ({ frame }) => {
  // Стиль: быстрый fade + масштабирование сзади
  const bgScale = interpolate(frame, [0, 30], [1.1, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = slideIn(frame, 5, 50, 20);

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transform: `scale(${bgScale})`,
    }}>
      <div style={{
        fontSize: "52px", fontWeight: 900, color: "#fff", textAlign: "center",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`, lineHeight: 1.2,
      }}>
        <span style={{ fontSize: "64px", color: tokens.colors.secondary }}>฿120,000</span>
        <br />ลงทุนอะไรดี?
      </div>

      <div style={{ display: "flex", gap: "56px", marginTop: "64px" }}>
        {["🚗", "🥇", "☀️"].map((icon, i) => {
          const d = 20 + i * 10;
          const s = scalePop(frame, d, 20);
          return (
            <div key={i} style={{
              fontSize: "80px",
              opacity: interpolate(frame, [d, d + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `scale(${s})`,
            }}>{icon}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ComparisonScene: React.FC<{ frame: number }> = ({ frame }) => {
  const yearIndex = interpolate(frame, [0, 270], [0, YEARS.length - 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const currentYear = YEARS[Math.floor(yearIndex)];
  const car = carValue(currentYear);
  const gold = goldValue(currentYear);
  const solar = solarValue(currentYear);
  const maxBar = solarValue(25);

  const headerOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const columns = [
    { icon: "🚗", label: "รถ", value: car, color: tokens.colors.danger },
    { icon: "🥇", label: "ทอง", value: gold, color: tokens.colors.secondary },
    { icon: "☀️", label: "โซลาร์", value: solar, color: tokens.colors.primary },
  ];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
      fontFamily: FONT_FAMILY, padding: "60px 48px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ textAlign: "center", marginBottom: "20px", opacity: headerOpacity }}>
        <div style={{ fontSize: "32px", fontWeight: 900, color: tokens.colors.text }}>
          ปีที่ {Math.round(interpolate(frame, [0, 270], [0, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}
        </div>
        <div style={{ fontSize: "16px", color: tokens.colors.textMuted }}>เริ่ม ฿120,000 เท่ากัน</div>
      </div>

      {/* Timeline */}
      <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px", marginBottom: "28px" }}>
        <div style={{
          width: `${(yearIndex / (YEARS.length - 1)) * 100}%`, height: "100%",
          background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
          borderRadius: "2px",
        }} />
      </div>

      <div style={{ flex: 1, display: "flex", gap: "16px", alignItems: "flex-end" }}>
        {columns.map((col, i) => {
          const barHeight = (col.value / maxBar) * 100;
          const isWinner = col.label === "โซลาร์";
          const entryDelay = i * 6;
          const entryOpacity = interpolate(frame, [entryDelay, entryDelay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              opacity: entryOpacity,
            }}>
              <div style={{ fontSize: "44px", marginBottom: "6px" }}>{col.icon}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: tokens.colors.text, marginBottom: "8px" }}>{col.label}</div>
              <div style={{
                fontSize: isWinner ? "32px" : "24px", fontWeight: 900, color: col.color,
                marginBottom: "8px", textAlign: "center",
              }}>{formatBaht(col.value)}</div>
              <div style={{
                width: "100%", height: "340px", background: "#e2e8f0",
                borderRadius: "12px", overflow: "hidden",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
              }}>
                <div style={{
                  width: "100%", height: `${Math.max(barHeight, 2)}%`,
                  background: isWinner
                    ? `linear-gradient(180deg, ${tokens.colors.secondary}, ${tokens.colors.primary})`
                    : col.color,
                  borderRadius: "12px",
                  boxShadow: isWinner ? `0 0 16px ${tokens.colors.primary}50` : undefined,
                }} />
              </div>
              <div style={{ fontSize: "20px", marginTop: "8px", color: col.color, fontWeight: 700 }}>
                {isWinner ? "↑" : col.value < INVESTMENT ? "↓" : "↑"}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const WinnerScene: React.FC<{ frame: number }> = ({ frame }) => {
  const badgeScale = scalePop(frame, 8, 28);
  const badgeOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const carFinal = carValue(25);
  const goldFinal = goldValue(25);
  const solarFinal = solarValue(25);
  const results = [
    { icon: "🚗", label: "รถ", value: carFinal, color: tokens.colors.danger },
    { icon: "🥇", label: "ทอง", value: goldFinal, color: tokens.colors.secondary },
    { icon: "☀️", label: "โซลาร์", value: solarFinal, color: tokens.colors.primary },
  ];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
      fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "60px 48px",
    }}>
      <div style={{ opacity: badgeOpacity, transform: `scale(${badgeScale})`, textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "88px", marginBottom: "12px" }}>☀️</div>
        <div style={{ fontSize: "48px", fontWeight: 900, color: "#fff" }}>ชนะขาดลอย</div>
        <div style={{ fontSize: "22px", color: tokens.colors.secondary, marginTop: "8px" }}>
          ฿120K → ฿750K ใน 25 ปี
        </div>
      </div>

      <div style={{ width: "100%" }}>
        {results.map((r, i) => {
          const d = 25 + i * 12;
          const rowOpacity = interpolate(frame, [d, d + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isWinner = r.label === "โซลาร์";
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px", marginBottom: "10px",
              background: isWinner ? `${tokens.colors.primary}20` : "rgba(255,255,255,0.05)",
              borderRadius: "14px",
              border: isWinner ? `2px solid ${tokens.colors.primary}40` : "1px solid rgba(255,255,255,0.08)",
              opacity: rowOpacity,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "34px" }}>{r.icon}</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{r.label}</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: r.color }}>{formatBaht(r.value)}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CTAStoryScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = scalePop(frame, 0, 22);
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const ctaPulse = pulse(frame, 30, 0.1, 0.04);

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
        เริ่มลงทุน<br /><span style={{ color: "#fef3c7" }}>ตั้งแต่วันนี้</span>
      </div>
      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "34px", fontWeight: 800,
        transform: `scale(${ctaPulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>ขอรับคำปรึกษาฟรี</div>
    </AbsoluteFill>
  );
};

export const InvestmentComparisonStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={3 * fps}><HeroScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={3 * fps} durationInFrames={9 * fps}><ComparisonScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={12 * fps} durationInFrames={4 * fps}><WinnerScene frame={useCurrentFrame()} /></Sequence>
      <Sequence from={16 * fps} durationInFrames={4 * fps}><CTAStoryScene frame={useCurrentFrame()} /></Sequence>
    </AbsoluteFill>
  );
};
