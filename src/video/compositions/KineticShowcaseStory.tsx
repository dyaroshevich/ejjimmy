import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import {
  letterByLetter,
  letterOpacity,
  letterScale,
  wordReveal,
  wordOpacity,
  wordSlide,
  counterAnimation,
  counterFormatted,
  glowPulse,
  glowBurst,
  particleBurst,
  barGrow,
  timelineProgress,
  dramaticReveal,
  shakeIntense,
  backgroundText,
  scalePop,
  slideIn,
  pulse,
  shake,
  bounce,
  stagger,
  anticipate,
} from "../animations";

// ═══════════════════════════════════════════════════════════════════
// SCENE 1: HOOK — "คุณ... จ่าย... เ่าไหร่?" (0-5s, 150 frames)
// ═══════════════════════════════════════════════════════════════════
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["คุณ", "จ่าย", "เท่าไหร่?"];

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)`,
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: bgOpacity,
      }}
    >
      {/* Background decorative text */}
      <div
        style={{
          position: "absolute",
          fontSize: "200px",
          fontWeight: 900,
          color: "#fff",
          opacity: 0.03,
          transform: `scale(${interpolate(frame, [0, 150], [1.2, 0.9])})`,
          letterSpacing: "-0.05em",
        }}
      >
        คุณ
      </div>

      {/* Main kinetic text */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        {words.map((word, i) => {
          const start = i * 20;
          const opacity = wordOpacity(i, frame, 0, 20, 12);
          const slideY = wordSlide(i, frame, 0, 20, 60);
          const scale = opacity > 0
            ? interpolate(
                frame,
                [start, start + 15],
                [0.6, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
              )
            : 0.6;

          return (
            <div
              key={i}
              style={{
                fontSize: i === 2 ? "96px" : "80px",
                fontWeight: 900,
                color: i === 2 ? tokens.colors.secondary : "#fff",
                opacity,
                transform: `translateY(${slideY}px) scale(${scale})`,
                textShadow: i === 2 ? `0 0 40px ${tokens.colors.secondary}60` : "none",
              }}
            >
              {word}
            </div>
          );
        })}
      </div>

      {/* Subtle glow line */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          width: interpolate(frame, [30, 90], [0, 80], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) + "%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${tokens.colors.primary}, transparent)`,
          opacity: interpolate(frame, [30, 60, 120, 150], [0, 0.6, 0.6, 0]),
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 2: SHOCK — Счётчик ฿15,000 + shake (5-12s, 210 frames)
// ═══════════════════════════════════════════════════════════════════
const ShockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const counter = counterAnimation(15000, frame, 10, 80);
  const shakeVal = shakeIntense(frame, 60, 40, 8);
  const flash = interpolate(frame, [60, 65, 70], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${shakeVal.x}px, ${shakeVal.y}px) rotate(${shakeVal.rotation}deg)`,
      }}
    >
      {/* Red flash overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle, ${tokens.colors.danger}40 0%, transparent 70%)`,
          opacity: flash,
        }}
      />

      <div
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: tokens.colors.textMuted,
          opacity: titleOpacity,
          marginBottom: "24px",
        }}
      >
        ค่าไฟเดือนนี้
      </div>

      <div
        style={{
          fontSize: "120px",
          fontWeight: 900,
          color: tokens.colors.danger,
          textShadow: `0 0 60px ${tokens.colors.danger}60`,
          transform: `scale(${scalePop(frame, 10, 30)})`,
        }}
      >
        ฿{counter.toLocaleString()}
      </div>

      <div
        style={{
          fontSize: "28px",
          color: tokens.colors.textMuted,
          marginTop: "16px",
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ทุกเดือน... ทุกปี...
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 3: PAUSE — "มากเกินไป" elastic text (12-16s, 120 frames)
// ═══════════════════════════════════════════════════════════════════
const PauseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { opacity, scale, glow } = dramaticReveal(frame, 10, 40);

  const letters = "มากเกินไป".split("");

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tokens.colors.danger}20 0%, transparent 70%)`,
          opacity,
          filter: `blur(${glow}px)`,
        }}
      />

      {/* Kinetic text — each letter */}
      <div style={{ display: "flex", gap: "8px" }}>
        {letters.map((letter, i) => (
          <div
            key={i}
            style={{
              fontSize: "100px",
              fontWeight: 900,
              color: "#fff",
              opacity: letterOpacity(i, frame, 15, 4, 10),
              transform: `scale(${letterScale(i, frame, 15, 4, 1.4)})`,
              textShadow: `0 0 ${glow}px ${tokens.colors.danger}80`,
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 4: GRAPH — Animated bar chart (16-25s, 270 frames)
// ═══════════════════════════════════════════════════════════════════
const GraphScene: React.FC = () => {
  const frame = useCurrentFrame();
  const months = [
    { label: "ม.ค.", value: 12000, color: "#ef4444" },
    { label: "ก.พ.", value: 13500, color: "#ef4444" },
    { label: "มี.ค.", value: 15000, color: "#ef4444" },
    { label: "เม.ย.", value: 14200, color: "#ef4444" },
  ];

  const maxValue = 18000;
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          opacity: titleOpacity,
          marginBottom: "60px",
        }}
      >
        ค่าไฟที่เพิ่มขึ้น
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "32px",
          paddingBottom: "40px",
        }}
      >
        {months.map((month, i) => {
          const barDelay = stagger(i, 20, 30);
          const barHeight = barGrow(frame, barDelay, 35, (month.value / maxValue) * 100);
          const labelOpacity = interpolate(frame, [barDelay, barDelay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isLast = i === months.length - 1;
          const glowShadow = isLast
            ? glowPulse(frame, barDelay + 35, tokens.colors.danger, 15, 0.2)
            : "none";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: month.color,
                  opacity: labelOpacity,
                }}
              >
                ฿{(month.value / 1000).toFixed(1)}K
              </div>
              <div
                style={{
                  width: "120px",
                  height: "400px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${barHeight}%`,
                    background: isLast
                      ? `linear-gradient(180deg, ${tokens.colors.danger}, #991b1b)`
                      : `linear-gradient(180deg, ${month.color}cc, ${month.color}80)`,
                    borderRadius: "16px",
                    boxShadow: glowShadow,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#fff",
                  opacity: labelOpacity,
                }}
              >
                {month.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 5: TRANSITION — "แต่วันนี้..." + sun reveal (25-32s, 210 frames)
// ═══════════════════════════════════════════════════════════════════
const TransitionScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 20, 80, 100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sunScale = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const sunGlow = glowBurst(frame, 70, 50, tokens.colors.secondary, 50);

  const bgGradient = interpolate(frame, [60, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, 
          #0a0a0a ${100 - bgGradient * 100}%, 
          #2D1A04 ${100 - bgGradient * 50}%, 
          #3D260A 100%)`,
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Text */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: 900,
          color: "#fff",
          opacity: textOpacity,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        แต่วันนี้...
      </div>

      {/* Sun */}
      <div
        style={{
          position: "absolute",
          fontSize: "180px",
          transform: `scale(${sunScale})`,
          filter: `drop-shadow(0 0 40px ${tokens.colors.secondary}80)`,
          boxShadow: sunGlow,
          borderRadius: "50%",
        }}
      >
        ☀️
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 6: SOLUTION — Tawan Power + particles (32-40s, 240 frames)
// ═══════════════════════════════════════════════════════════════════
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = particleBurst(frame, 40, 16, 250);
  const titleScale = scalePop(frame, 20, 30);
  const titleOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleSlide = slideIn(frame, 50, 40, 20);

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
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: i % 2 === 0 ? tokens.colors.secondary : tokens.colors.primary,
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale}) rotate(${p.rotation}deg)`,
          }}
        />
      ))}

      {/* Sun icon */}
      <div
        style={{
          fontSize: "120px",
          marginBottom: "32px",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          filter: `drop-shadow(0 0 30px ${tokens.colors.secondary}60)`,
        }}
      >
        ☀️
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          textShadow: `0 0 30px ${tokens.colors.primary}40`,
        }}
      >
        Tawan Power
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          color: tokens.colors.secondary,
          marginTop: "24px",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleSlide}px)`,
        }}
      >
        พลังงานสะอาดสำหรับทุกคน
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 7: BENEFITS — 3 преимущества stagger (40-52s, 360 frames)
// ═══════════════════════════════════════════════════════════════════
const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const benefits = [
    { icon: "💰", title: "ลดค่าไฟ 70%", desc: "ประหยัดสูงสุด ฿4,500/เดือน" },
    { icon: "🛡️", title: "รับประกัน 30 ปี", desc: "แผงโซลาร์คุณภาพสูง" },
    { icon: "⚡", title: "ติดตั้งฟรี", desc: "ขออนุญาต PEA/MEA ฟรี" },
  ];

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #0f172a 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "52px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          opacity: titleOpacity,
          marginBottom: "60px",
        }}
      >
        ทำไมต้อง TAWAN POWER?
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "40px",
        }}
      >
        {benefits.map((benefit, i) => {
          const delay = stagger(i, 30, 30);
          const itemOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemSlide = slideIn(frame, delay, 80, 25);
          const itemScale = scalePop(frame, delay, 25);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                padding: "32px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "24px",
                border: `1px solid rgba(255,255,255,0.06)`,
                opacity: itemOpacity,
                transform: `translateX(${itemSlide}px) scale(${itemScale})`,
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  width: "100px",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${tokens.colors.primary}15`,
                  borderRadius: "20px",
                  flexShrink: 0,
                }}
              >
                {benefit.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  {benefit.title}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    color: tokens.colors.textMuted,
                  }}
                >
                  {benefit.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 8: COUNTER — "฿54,000/ปี" counter (52-60s, 240 frames)
// ═══════════════════════════════════════════════════════════════════
const CounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const counter = counterAnimation(54000, frame, 20, 60);
  const glow = glowPulse(frame, 60, tokens.colors.primary, 25, 0.12);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      <div
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          opacity: titleOpacity,
          marginBottom: "32px",
        }}
      >
        ประหยัดได้สูงสุด
      </div>

      <div
        style={{
          fontSize: "110px",
          fontWeight: 900,
          color: "#fff",
          textShadow: glow,
          transform: `scale(${scalePop(frame, 20, 30)})`,
        }}
      >
        ฿{counter.toLocaleString()}
      </div>

      <div
        style={{
          fontSize: "40px",
          fontWeight: 700,
          color: tokens.colors.secondary,
          marginTop: "16px",
          opacity: subtitleOpacity,
        }}
      >
        ต่อปี
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 9: TIMELINE — 4.5 ปี ถึงจุดคุ้มทุน (60-70s, 300 frames)
// ═══════════════════════════════════════════════════════════════════
const TimelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { progress, currentStep } = timelineProgress(frame, 20, 180, 5);
  const steps = ["0", "1 ปี", "2 ปี", "3 ปี", "4.5 ปี"];
  const labels = ["เริ่ม", "ประหยัด", "คุ้มทุน", "กำไร", "อิสระ"];

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #0f172a 100%)",
        fontFamily: FONT_FAMILY,
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          opacity: titleOpacity,
          marginBottom: "80px",
        }}
      >
        จุดคุ้มทุน
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Timeline bar */}
        <div
          style={{
            width: "80%",
            height: "8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            position: "relative",
            marginBottom: "60px",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
              borderRadius: "4px",
              boxShadow: `0 0 20px ${tokens.colors.primary}60`,
            }}
          />
          {/* Progress dot */}
          <div
            style={{
              position: "absolute",
              left: `${progress * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: tokens.colors.secondary,
              boxShadow: `0 0 20px ${tokens.colors.secondary}80`,
            }}
          />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", width: "80%", justifyContent: "space-between" }}>
          {steps.map((step, i) => {
            const isActive = i <= currentStep;
            const stepOpacity = interpolate(
              frame,
              [20 + i * 36, 30 + i * 36],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  opacity: stepOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: isActive ? tokens.colors.secondary : "rgba(255,255,255,0.3)",
                  }}
                >
                  {step}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {labels[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 10: PROOF — "500+ โครงการ" typewriter (70-78s, 240 frames)
// ═══════════════════════════════════════════════════════════════════
const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bgText = backgroundText(frame, 0, 240, 0, 0);

  const counter = counterAnimation(500, frame, 20, 50);

  const textOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = glowPulse(frame, 70, tokens.colors.primary, 20, 0.1);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background decorative text */}
      <div
        style={{
          position: "absolute",
          fontSize: "300px",
          fontWeight: 900,
          color: "#fff",
          opacity: bgText.opacity,
          transform: `scale(${bgText.scale}) translateX(${bgText.x}px)`,
          letterSpacing: "-0.05em",
        }}
      >
        500+
      </div>

      <div
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          opacity: textOpacity,
          marginBottom: "24px",
        }}
      >
        ความไว้วางใจจาก
      </div>

      <div
        style={{
          fontSize: "100px",
          fontWeight: 900,
          color: "#fff",
          textShadow: glow,
          transform: `scale(${scalePop(frame, 20, 25)})`,
        }}
      >
        {counter}+
      </div>

      <div
        style={{
          fontSize: "40px",
          fontWeight: 700,
          color: tokens.colors.primary,
          marginTop: "16px",
          opacity: subtitleOpacity,
        }}
      >
        โครงการทั่วประเทศไทย
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 11: CTA — "เริ่มวันนี้" pulsing (78-85s, 210 frames)
// ═══════════════════════════════════════════════════════════════════
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleScale = scalePop(frame, 10, 25);
  const titleOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const btnPulse = pulse(frame, 40, 0.12, 0.05);
  const btnGlow = glowPulse(frame, 40, tokens.colors.primary, 30, 0.12);
  const btnOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)`,
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "72px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          lineHeight: 1.3,
          marginBottom: "60px",
        }}
      >
        เริ่ม<span style={{ color: tokens.colors.secondary }}>วันนี้</span>
      </div>

      <div
        style={{
          background: "#fff",
          color: tokens.colors.primary,
          padding: "28px 80px",
          borderRadius: "60px",
          fontSize: "36px",
          fontWeight: 800,
          transform: `scale(${btnPulse})`,
          opacity: btnOpacity,
          boxShadow: btnGlow,
        }}
      >
        ขอรับคำปรึกษาฟรี
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 12: LOGO — Final reveal (85-90s, 150 frames)
// ═══════════════════════════════════════════════════════════════════
const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = particleBurst(frame, 20, 20, 300);
  const logoScale = scalePop(frame, 10, 30);
  const logoOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineSlide = slideIn(frame, 40, 30, 20);

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
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: i % 3 === 0 ? tokens.colors.secondary : i % 3 === 1 ? tokens.colors.primary : "#fff",
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
          }}
        />
      ))}

      {/* Sun icon */}
      <div
        style={{
          fontSize: "100px",
          marginBottom: "24px",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 0 30px ${tokens.colors.secondary}60)`,
        }}
      >
        ☀️
      </div>

      {/* Logo text */}
      <div
        style={{
          fontSize: "56px",
          fontWeight: 900,
          color: "#fff",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          letterSpacing: "0.05em",
        }}
      >
        Tawan Power
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 600,
          color: tokens.colors.secondary,
          marginTop: "20px",
          opacity: taglineOpacity,
          transform: `translateY(${taglineSlide}px)`,
        }}
      >
        พลังงานสะอาด · อนาคตสดใส
      </div>

      {/* Contact */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          fontSize: "24px",
          color: "rgba(255,255,255,0.5)",
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        @tawanpower · tawanpower.com
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════
export const KineticShowcaseStory: React.FC = () => {
  const { fps } = useVideoConfig();

  // 90 seconds = 2700 frames @ 30fps
  const scenes = [
    { component: HookScene, start: 0, duration: 5 * fps },        // 0-5s
    { component: ShockScene, start: 5 * fps, duration: 7 * fps },  // 5-12s
    { component: PauseScene, start: 12 * fps, duration: 4 * fps }, // 12-16s
    { component: GraphScene, start: 16 * fps, duration: 9 * fps }, // 16-25s
    { component: TransitionScene, start: 25 * fps, duration: 7 * fps }, // 25-32s
    { component: SolutionScene, start: 32 * fps, duration: 8 * fps }, // 32-40s
    { component: BenefitsScene, start: 40 * fps, duration: 12 * fps }, // 40-52s
    { component: CounterScene, start: 52 * fps, duration: 8 * fps }, // 52-60s
    { component: TimelineScene, start: 60 * fps, duration: 10 * fps }, // 60-70s
    { component: ProofScene, start: 70 * fps, duration: 8 * fps }, // 70-78s
    { component: CTAScene, start: 78 * fps, duration: 7 * fps },   // 78-85s
    { component: LogoScene, start: 85 * fps, duration: 5 * fps },  // 85-90s
  ];

  return (
    <AbsoluteFill>
      {scenes.map(({ component: Component, start, duration }, i) => (
        <Sequence key={i} from={start} durationInFrames={duration}>
          <Component />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
