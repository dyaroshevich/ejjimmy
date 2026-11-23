import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { pulse, scalePop } from "../animations";
import { videoBrand } from "../brand";

const HeroScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleScale = interpolate(frame, [0, 20], [0.5, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const glowOpacity = interpolate(frame, [15, 35], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Floating particles
  const particles = Array.from({ length: 6 }, (_, i) => ({
    x: 20 + (i * 15) % 60,
    y: 30 + (i * 20) % 40,
    delay: i * 8,
    size: 4 + (i % 3) * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => {
        const pOpacity = interpolate(frame, [p.delay, p.delay + 15, p.delay + 30], [0, 0.4, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pY = interpolate(frame, [p.delay, p.delay + 40], [p.y, p.y - 20], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${pY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: tokens.colors.secondary,
              opacity: pOpacity,
            }}
          />
        );
      })}

      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
          opacity: glowOpacity,
          filter: "blur(80px)",
        }}
      />

      {/* Coin icon */}
      <div
        style={{
          fontSize: "100px",
          marginBottom: "32px",
          opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `rotate(${interpolate(frame, [5, 25], [-15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg) scale(${scalePop(frame, 5, 20)})`,
        }}
      >
        💰
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "60px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          lineHeight: 1.2,
        }}
      >
        ลงทุน <span style={{ color: tokens.colors.secondary }}>120,000</span>
        <br />
        ได้คืน <span style={{ color: tokens.colors.secondary }}>750,000</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "28px",
          color: "rgba(255,255,255,0.6)",
          marginTop: "24px",
          opacity: interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        ใน 25 ปี = กำไร 630,000 บาท
      </div>

      {/* Shimmer line */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: 0,
          width: "100%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${tokens.colors.secondary}, transparent)`,
          opacity: interpolate(frame, [30, 45, 55], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(frame, [30, 55], [-100, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const InvestmentScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barWidth = interpolate(frame, [15, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const amountOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Counting animation for amount
  const countProgress = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayAmount = Math.round(120000 * countProgress);

  // Description stagger
  const descOpacity = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descSlide = interpolate(frame, [65, 80], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
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
          marginBottom: "60px",
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        ค่าลงทุนเริ่มต้น
      </div>

      {/* Investment amount */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "40px",
            background: "#e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "40px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
              borderRadius: "20px",
              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}
          />
        </div>

        {/* Amount with counting */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 900,
            color: tokens.colors.primary,
            opacity: amountOpacity,
            fontFamily: tokens.fonts.mono,
            transform: `scale(${scalePop(frame, 50, 20)})`,
          }}
        >
          ฿{displayAmount.toLocaleString()}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "32px",
            color: tokens.colors.textMuted,
            marginTop: "24px",
            textAlign: "center",
            opacity: descOpacity,
            transform: `translateY(${descSlide}px)`,
          }}
        >
          ชุดโซลาร์ 5kW พร้อมติดตั้ง
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MonthlySavingsScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const months = [
    { name: "ม.ค.", savings: 2500 },
    { name: "ก.พ.", savings: 2500 },
    { name: "มี.ค.", savings: 2800 },
    { name: "เม.ย.", savings: 3000 },
    { name: "พ.ค.", savings: 3200 },
    { name: "มิ.ย.", savings: 3000 },
    { name: "ก.ค.", savings: 2800 },
    { name: "ส.ค.", savings: 2800 },
    { name: "ก.ย.", savings: 2700 },
    { name: "ต.ค.", savings: 2600 },
    { name: "พ.ย.", savings: 2400 },
    { name: "ธ.ค.", savings: 2300 },
  ];

  const totalSavings = months.reduce((acc, m) => acc + m.savings, 0);
  const maxSavings = 3200;
  const peakIdx = months.reduce((best, m, i) => m.savings > months[best].savings ? i : best, 0);

  const totalProgress = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayTotal = Math.round(totalSavings * totalProgress);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div style={{ fontSize: "44px", fontWeight: 800, color: tokens.colors.text, marginBottom: "16px", opacity: titleOpacity, transform: `translateY(${titleSlide}px)` }}>
        ประหยัดทุกเดือน
      </div>
      <div style={{ fontSize: "28px", color: tokens.colors.textMuted, marginBottom: "48px", opacity: titleOpacity, transform: `translateY(${titleSlide}px)` }}>
        ประหยัดเฉลี่ย ฿2,650/เดือน
      </div>

      {/* Bar chart */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "12px", paddingBottom: "40px" }}>
        {months.map((month, i) => {
          const barDelay = 10 + i * 4;
          const barHeight = interpolate(frame, [barDelay, barDelay + 15], [0, (month.savings / maxSavings) * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const labelOpacity = interpolate(frame, [barDelay + 10, barDelay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isPeak = i === peakIdx;
          const peakGlow = isPeak ? interpolate(frame, [barDelay + 15, barDelay + 25, barDelay + 35], [0, 0.6, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: "18px", fontWeight: isPeak ? 800 : 700, color: isPeak ? tokens.colors.secondary : tokens.colors.primary, marginBottom: "8px", opacity: labelOpacity, transform: isPeak ? `scale(${scalePop(frame, barDelay + 10, 15)})` : undefined }}>
                {month.savings.toLocaleString()}
              </div>
              <div style={{
                width: "100%", height: `${barHeight}%`,
                background: isPeak ? `linear-gradient(180deg, ${tokens.colors.secondary} 0%, ${tokens.colors.primary} 100%)` : `linear-gradient(180deg, rgba(16,185,129,0.6) 0%, ${tokens.colors.primary} 100%)`,
                borderRadius: "8px 8px 0 0", minHeight: "8px",
                boxShadow: isPeak ? `0 0 ${20 + peakGlow * 20}px rgba(245,158,11,${peakGlow})` : undefined,
              }} />
              <div style={{ fontSize: "16px", color: isPeak ? tokens.colors.secondary : tokens.colors.textMuted, marginTop: "12px", opacity: labelOpacity, fontWeight: isPeak ? 700 : 400 }}>
                {month.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total with counting */}
      <div style={{ fontSize: "36px", fontWeight: 800, color: tokens.colors.primary, textAlign: "center", opacity: interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${scalePop(frame, 65, 20)})` }}>
        ประหยัดรวม ฿{displayTotal.toLocaleString()}/ปี
      </div>
    </AbsoluteFill>
  );
};

const BreakEvenScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const years = [1, 2, 3, 4, 5, 6, 7];
  const investment = 120000;
  const yearlySavings = 31800;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0e00 0%, #2D1A04 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div style={{ fontSize: "44px", fontWeight: 800, color: "#fff", marginBottom: "16px", opacity: titleOpacity, transform: `translateY(${titleSlide}px)` }}>
        จุดคืนทุน
      </div>
      <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.6)", marginBottom: "48px", opacity: titleOpacity, transform: `translateY(${titleSlide}px)` }}>
        คืนทุนในปีที่ 4
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
        {years.map((year, i) => {
          const cumSavings = yearlySavings * year;
          const isProfit = cumSavings >= investment;
          const barDelay = 10 + i * 12;
          const barWidth = interpolate(frame, [barDelay, barDelay + 20], [0, Math.min((cumSavings / investment) * 50, 100)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const labelOpacity = interpolate(frame, [barDelay + 15, barDelay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isBreakEven = year === 4;
          const milestoneGlow = isBreakEven ? interpolate(frame, [barDelay + 20, barDelay + 30, barDelay + 45], [0, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Year label */}
              <div style={{ width: "80px", fontFamily: tokens.fonts.mono, fontSize: "28px", fontWeight: 700, color: isProfit ? tokens.colors.secondary : "rgba(255,255,255,0.5)", textAlign: "right", opacity: labelOpacity, transform: isBreakEven ? `scale(${scalePop(frame, barDelay + 15, 15)})` : undefined }}>
                ปี {year}
              </div>

              {/* Bar */}
              <div style={{ flex: 1, height: "48px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${barWidth}%`, height: "100%",
                  background: isProfit ? `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})` : "rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "16px",
                }}>
                  {barWidth > 20 && (
                    <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                      ฿{cumSavings.toLocaleString()}
                    </span>
                  )}
                </div>
                {/* Break-even milestone glow */}
                {isBreakEven && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "8px",
                    border: `2px solid rgba(245,158,11,${milestoneGlow})`,
                    boxShadow: `0 0 ${milestoneGlow * 30}px rgba(245,158,11,${milestoneGlow * 0.5})`,
                  }} />
                )}
              </div>

              {/* Status */}
              <div style={{ width: "120px", fontSize: "22px", fontWeight: 700, color: isProfit ? tokens.colors.secondary : "rgba(255,255,255,0.4)", opacity: labelOpacity }}>
                {isProfit ? "✅ กำไร" : "⏳ รอ"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment dashed line */}
      <div style={{ position: "absolute", left: "160px", right: "120px", top: "50%", height: "3px", background: "rgba(239,68,68,0.5)", borderStyle: "dashed", opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 18], [0.6, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [22, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [35, 55, 75, 95], [1, 1.05, 1, 1.05], { extrapolateRight: "clamp" });
  const contactOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contactSlide = interpolate(frame, [40, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Shimmer particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: 10 + (i * 12) % 80,
    y: 20 + (i * 17) % 60,
    delay: i * 6,
    size: 3 + (i % 3) * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, #E67A00 100%)`,
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => {
        const pOpacity = interpolate(frame, [p.delay, p.delay + 12, p.delay + 24], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const pY = interpolate(frame, [p.delay, p.delay + 30], [p.y, p.y - 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${pY}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", background: "rgba(255,255,255,0.6)", opacity: pOpacity }} />
        );
      })}

      <div style={{ fontSize: "56px", fontWeight: 900, color: "#fff", textAlign: "center", transform: `scale(${scale})`, opacity, lineHeight: 1.3, marginBottom: "48px" }}>
        เริ่มประหยัด<br /><span style={{ color: "#fef3c7" }}>ตั้งแต่วันแรก</span>
      </div>

      <div style={{
        background: "#fff", color: tokens.colors.primary,
        padding: "28px 72px", borderRadius: "60px",
        fontSize: "36px", fontWeight: 800,
        opacity: ctaOpacity, transform: `scale(${pulse})`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        คำนวณของคุณฟรี
      </div>

      {/* Contact info */}
      <div style={{ marginTop: "40px", fontSize: "26px", color: "rgba(255,255,255,0.85)", textAlign: "center", opacity: contactOpacity, transform: `translateY(${contactSlide}px)` }}>
        {videoBrand.name} · {videoBrand.location}
      </div>
    </AbsoluteFill>
  );
};

export const ROICalculatorStory: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={3 * fps}>
        <HeroScene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={3 * fps} durationInFrames={3 * fps}>
        <InvestmentScene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={6 * fps} durationInFrames={4 * fps}>
        <MonthlySavingsScene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={10 * fps} durationInFrames={4 * fps}>
        <BreakEvenScene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={14 * fps} durationInFrames={3 * fps}>
        <CTAScene frame={useCurrentFrame()} />
      </Sequence>
    </AbsoluteFill>
  );
};
