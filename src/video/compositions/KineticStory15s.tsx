import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import {
  letterOpacity,
  letterScale,
  wordOpacity,
  counterAnimation,
  glowPulse,
  particleBurst,
  barGrow,
  scalePop,
  slideIn,
  pulse,
  shakeIntense,
  stagger,
} from "../animations";

// ═══════════════════════════════════════════════════════════════════
// SCENE 1: HOOK — Glitch reveal + massive text
// (0-2.5s, 75 frames)
// ═══════════════════════════════════════════════════════════════════
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bgScale = interpolate(frame, [0, 75], [1.2, 1.0], {
    extrapolateRight: "clamp",
  });

  const glitchActive = frame > 15 && frame < 22;
  const glitchX = glitchActive ? Math.sin(frame * 47) * 8 : 0;
  const glitchClip = glitchActive
    ? `inset(${30 + Math.sin(frame * 31) * 20}% 0 ${40 + Math.cos(frame * 23) * 15}% 0)`
    : "none";

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <Img
        src={staticFile("images/krabi-001.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${bgScale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      {glitchActive && (
        <Img
          src={staticFile("images/1779681103039.jpg")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale}) translateX(${glitchX}px)`,
            clipPath: glitchClip,
            opacity: 0.7,
            mixBlendMode: "screen",
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
          opacity: interpolate(frame, [0, 10], [0, 0.4], { extrapolateRight: "clamp" }),
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "200px",
          left: "60px",
          right: "60px",
        }}
      >
        {["คุณ", "จ่าย", "เท่าไหร่?"].map((word, i) => {
          const opacity = wordOpacity(i, frame, 2, 10, 8);
          const y = slideIn(frame, 2 + i * 10, 80, 14);
          const scale = interpolate(frame, [2 + i * 10, 2 + i * 10 + 10], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.5)),
          });
          return (
            <div
              key={i}
              style={{
                fontSize: i === 2 ? "110px" : "88px",
                fontWeight: 900,
                color: i === 2 ? tokens.colors.secondary : "#fff",
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
                textShadow: i === 2
                  ? `0 0 60px ${tokens.colors.secondary}80, 0 6px 30px rgba(0,0,0,0.8)`
                  : "0 6px 30px rgba(0,0,0,0.8)",
                lineHeight: 1.1,
              }}
            >
              {word}
            </div>
          );
        })}
        <div
          style={{
            fontSize: "26px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "24px",
            opacity: interpolate(frame, [42, 55], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            letterSpacing: "0.08em",
          }}
        >
          ค่าไฟของคุณ... สูงเกินไป
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "60px",
          width: "60px",
          height: "60px",
          borderTop: `3px solid ${tokens.colors.secondary}`,
          borderRight: `3px solid ${tokens.colors.secondary}`,
          opacity: interpolate(frame, [0, 15], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 2: SHOCK — Mega counter + fire particles + shake
// (2.5-4.5s, 60 frames)
// ═══════════════════════════════════════════════════════════════════
const ShockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const counter = counterAnimation(15000, frame, 3, 35);
  const shakeVal = shakeIntense(frame, 30, 28, 16);
  const flash = interpolate(frame, [30, 33, 38], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fireParticles = [];
  for (let i = 0; i < 20; i++) {
    const delay = 5 + i * 2;
    if (frame > delay) {
      const elapsed = frame - delay;
      fireParticles.push({
        x: 540 + Math.sin(i * 1.7) * (200 + elapsed * 3),
        y: 960 - elapsed * (8 + i * 0.5),
        opacity: interpolate(elapsed, [0, 5, 25], [0, 0.8, 0], {
          extrapolateRight: "clamp",
        }),
        size: 4 + Math.random() * 6,
        color: i % 3 === 0 ? "#ff6b35" : i % 3 === 1 ? "#ffcc02" : "#ff3333",
      });
    }
  }

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        transform: `translate(${shakeVal.x}px, ${shakeVal.y}px) rotate(${shakeVal.rotation}deg)`,
      }}
    >
      <div style={{ position: "absolute", width: "100%", height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
        {["1779681091103.jpg", "1779681103087.jpg", "1779681091454.jpg", "1779681103133.jpg"].map((img, i) => (
          <Img
            key={i}
            src={staticFile(`images/${img}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.2) saturate(0.8)" }}
          />
        ))}
      </div>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${tokens.colors.danger}60 0%, transparent 60%)`,
          opacity: flash,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      {fireParticles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
            marginBottom: "16px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          ค่าไฟเดือนนี้
        </div>
        <div
          style={{
            fontSize: "140px",
            fontWeight: 900,
            color: tokens.colors.danger,
            textShadow: `0 0 100px ${tokens.colors.danger}90, 0 0 200px ${tokens.colors.danger}40, 0 6px 30px rgba(0,0,0,0.6)`,
            transform: `scale(${scalePop(frame, 3, 16)})`,
            lineHeight: 1,
          }}
        >
          ฿{counter.toLocaleString()}
        </div>
        <div
          style={{
            position: "absolute",
            width: interpolate(frame, [32, 42], [0, 500], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            height: "4px",
            background: tokens.colors.danger,
            opacity: interpolate(frame, [32, 38, 50], [0, 0.8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: "rotate(-5deg)",
          }}
        />
        <div
          style={{
            fontSize: "26px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "28px",
            opacity: interpolate(frame, [38, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            letterSpacing: "0.1em",
          }}
        >
          ทุกเดือน... ทุกปี... ไม่จบ
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 3: REAL PROJECT — Full photo hero + 2 detail photos + stats
// (4.5-7s, 75 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const ProjectScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#0a0a0a" }}>
      {/* Hero photo — top 28% */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", overflow: "hidden" }}>
        <Img
          src={staticFile("images/krabi-001.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${interpolate(frame, [0, 75], [1.1, 1.0], { extrapolateRight: "clamp" })})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            background: "linear-gradient(transparent, #0a0a0a)",
          }}
        />
      </div>

      {/* Title overlay on hero */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "60px",
          opacity: interpolate(frame, [3, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${slideIn(frame, 3, 40, 12)}px)`,
        }}
      >
        <div style={{ fontSize: "52px", fontWeight: 900, color: "#fff", textShadow: "0 4px 30px rgba(0,0,0,0.7)" }}>
          โครงการจริง
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: tokens.colors.secondary,
            marginTop: "6px",
          }}
        >
          📍 กระบี่ — ระบบ 10kW
        </div>
      </div>

      {/* ═══ STATS CENTERED — 3 big numbers ═══ */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          padding: "0 50px",
        }}
      >
        {[
          { label: "แผงโซลาร์", value: "16", unit: "แผง", color: tokens.colors.primary, delay: 10 },
          { label: "ประหยัด", value: "฿95K", unit: "/ปี", color: tokens.colors.secondary, delay: 18 },
          { label: "คืนทุน", value: "4.5", unit: "ปี", color: "#fff", delay: 26 },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "28px 16px",
              background: `linear-gradient(135deg, ${stat.color}18, rgba(255,255,255,0.06))`,
              borderRadius: "24px",
              border: `2px solid ${stat.color}40`,
              textAlign: "center",
              opacity: interpolate(frame, [stat.delay, stat.delay + 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${slideIn(frame, stat.delay, 50, 14)}px) scale(${scalePop(frame, stat.delay, 14)})`,
            }}
          >
            <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)", marginBottom: "10px", letterSpacing: "0.08em" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "64px", fontWeight: 900, color: stat.color, lineHeight: 1, textShadow: `0 0 30px ${stat.color}40` }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 600, color: stat.color, opacity: 0.7, marginTop: "6px" }}>
              {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ PHOTOS BELOW STATS ═══ */}
      {/* 2 installation detail photos */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "0",
          right: "0",
          display: "flex",
          gap: "16px",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "280px",
            borderRadius: "20px",
            overflow: "hidden",
            border: `2px solid ${tokens.colors.primary}40`,
            opacity: interpolate(frame, [30, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateX(${slideIn(frame, 30, 50, 14)}px)`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 15px ${tokens.colors.primary}15`,
          }}
        >
          <Img
            src={staticFile("images/1779681091454.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            flex: 1,
            height: "280px",
            borderRadius: "20px",
            overflow: "hidden",
            border: `2px solid ${tokens.colors.secondary}40`,
            opacity: interpolate(frame, [36, 46], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateX(${slideIn(frame, 36, -50, 14)}px)`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 15px ${tokens.colors.secondary}15`,
          }}
        >
          <Img
            src={staticFile("images/1779681102957.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* 3rd photo — wider */}
      <div
        style={{
          position: "absolute",
          top: "76%",
          left: "40px",
          right: "40px",
          height: "180px",
          borderRadius: "20px",
          overflow: "hidden",
          border: `2px solid rgba(255,255,255,0.12)`,
          opacity: interpolate(frame, [40, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${slideIn(frame, 40, 30, 14)}px)`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        <Img
          src={staticFile("images/1779681103087.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 4: SAVINGS — Giant number center + before/after comparison
// (7-9s, 60 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const BarChartScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Counter animation for the big number
  const savingsCounter = counterAnimation(10500, frame, 8, 30);

  // Before/after bars
  const billBar = barGrow(frame, 5, 20, 100);
  const solarBar = barGrow(frame, 12, 20, 35);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#000" }}>
      <Img
        src={staticFile("images/1779681110450.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.18) blur(3px)",
        }}
      />

      {/* ═══ TOP HALF: Label + Giant Number centered ═══ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "52%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "0.2em",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            opacity: interpolate(frame, [3, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          คุณประหยัดได้
        </div>

        {/* Giant number */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            transform: `scale(${scalePop(frame, 5, 16)})`,
            opacity: interpolate(frame, [5, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: "160px",
              fontWeight: 900,
              color: tokens.colors.secondary,
              textShadow: `0 0 80px ${tokens.colors.secondary}60, 0 0 160px ${tokens.colors.secondary}25, 0 8px 40px rgba(0,0,0,0.5)`,
              lineHeight: 1,
            }}
          >
            ฿{savingsCounter.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "46px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              marginTop: "12px",
              letterSpacing: "0.1em",
            }}
          >
            /เดือน
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM HALF: Two bars + labels ═══ */}
      <div
        style={{
          position: "absolute",
          top: "54%",
          left: "70px",
          right: "70px",
          bottom: "100px",
          display: "flex",
          gap: "24px",
        }}
      >
        {/* Before — tall red bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#ff4444",
              textShadow: "0 0 20px rgba(255,68,68,0.5)",
              opacity: interpolate(frame, [10, 18], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ฿15,000
          </div>
          <div
            style={{
              width: "100%",
              flex: 1,
              background: "linear-gradient(180deg, #ff4444 0%, #cc0000 50%, #880000 100%)",
              borderRadius: "16px 16px 6px 6px",
              boxShadow: "0 0 40px rgba(255,68,68,0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,68,68,0.6)",
              transform: `scaleY(${billBar / 100})`,
              transformOrigin: "bottom",
            }}
          />
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              background: "rgba(255,68,68,0.25)",
              padding: "8px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,68,68,0.3)",
              opacity: interpolate(frame, [15, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ไม่ติดโซลาร์
          </div>
        </div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingBottom: "80px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#ffffff",
              textShadow: "0 0 20px rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              padding: "14px 18px",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.2)",
              opacity: interpolate(frame, [18, 24], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            VS
          </div>
        </div>

        {/* After — short green bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#44ff88",
              textShadow: "0 0 20px rgba(68,255,136,0.5)",
              opacity: interpolate(frame, [18, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ฿4,500
          </div>
          <div
            style={{
              width: "100%",
              flex: 1,
              background: "linear-gradient(180deg, #44ff88 0%, #22cc66 50%, #118844 100%)",
              borderRadius: "16px 16px 6px 6px",
              boxShadow: "0 0 40px rgba(68,255,136,0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
              border: "2px solid rgba(68,255,136,0.6)",
              transform: `scaleY(${solarBar / 100})`,
              transformOrigin: "bottom",
            }}
          />
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              background: "rgba(68,255,136,0.2)",
              padding: "8px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(68,255,136,0.3)",
              opacity: interpolate(frame, [22, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ติดโซลาร์
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: Tagline ═══ */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [35, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "0.12em",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            background: "rgba(255,255,255,0.1)",
            display: "inline-block",
            padding: "12px 32px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          ลดค่าไฟ 70% ทันที
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 5: PRODUCTS — Hero inverter + panel/battery row + specs
// (9-11.5s, 75 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();

  const inverterScale = scalePop(frame, 3, 18);
  const inverterOpacity = interpolate(frame, [3, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bottomOpacity = interpolate(frame, [25, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#0a0a0a" }}>
      {/* Background photo — very dark */}
      <Img
        src={staticFile("images/krabi-002.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.08) blur(2px)",
        }}
      />

      {/* Radial glow behind inverter */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tokens.colors.primary}18 0%, transparent 70%)`,
          opacity: inverterOpacity,
        }}
      />

      {/* HERO inverter — 700x700, centered */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "50%",
          transform: `translateX(-50%) scale(${inverterScale})`,
          opacity: inverterOpacity,
          width: "700px",
          height: "700px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile("content/products/goodwe-5kw-inverter/main.webp")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 50px rgba(16,185,129,0.2))",
          }}
        />
      </div>

      {/* Product name — bold, centered below inverter */}
      <div
        style={{
          position: "absolute",
          top: "760px",
          left: "50%",
          transform: `translateX(-50%)`,
          opacity: interpolate(frame, [10, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
            letterSpacing: "0.02em",
          }}
        >
          GoodWe 5 kW
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "8px",
            letterSpacing: "0.08em",
          }}
        >
          Hybrid Inverter · สำหรับบ้าน
        </div>
      </div>

      {/* Bottom section: 3 columns — panel, specs, battery */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "40px",
          right: "40px",
          height: "440px",
          display: "flex",
          gap: "16px",
          opacity: bottomOpacity,
          transform: `translateY(${slideIn(frame, 25, 60, 16)}px)`,
        }}
      >
        {/* Panel card */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            border: `2px solid ${tokens.colors.secondary}25`,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 10px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <Img
            src={staticFile("content/products/jinko-630w-panel/main.webp")}
            style={{ width: "160px", height: "160px", objectFit: "contain", marginBottom: "16px" }}
          />
          <div style={{ fontSize: "26px", fontWeight: 800, color: tokens.colors.secondary, textAlign: "center" }}>Jinko 630W</div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>แผงโซลาร์</div>
        </div>

        {/* Specs column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "⚡", text: "5 kW", sub: "กำลังผลิต", color: tokens.colors.primary },
            { icon: "💰", text: "฿120K", sub: "ราคา", color: tokens.colors.secondary },
            { icon: "🛡️", text: "30 ปี", sub: "รับประกัน", color: "#fff" },
            { icon: "📱", text: "APP", sub: "Monitoring", color: "#fff" },
          ].map((spec, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px 18px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: interpolate(frame, [30 + i * 4, 36 + i * 4], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateX(${slideIn(frame, 30 + i * 4, 40, 10)}px)`,
              }}
            >
              <span style={{ fontSize: "28px" }}>{spec.icon}</span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: spec.color, lineHeight: 1 }}>{spec.text}</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{spec.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Battery card */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            border: `2px solid ${tokens.colors.primary}25`,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 10px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <Img
            src={staticFile("content/products/sigen-battery-5kwh/main.webp")}
            style={{ width: "160px", height: "160px", objectFit: "contain", marginBottom: "16px" }}
          />
          <div style={{ fontSize: "26px", fontWeight: 800, color: tokens.colors.primary, textAlign: "center" }}>SigEnergy</div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>แบต 5kWh</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 6: BRANDS — Dramatic logo reveal with glow
// (11.5-13s, 45 frames)
// ═══════════════════════════════════════════════════════════════════
const BrandsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const brands = ["goodwe", "jinko-solar", "sigenergy", "huawei", "solaredge"];

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <Img
        src={staticFile("images/1779681091773.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.15) blur(2px)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            fontWeight: 900,
            color: "#fff",
            opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          พันธมิตรระดับโลก
        </div>
        <div
          style={{
            display: "flex",
            gap: "28px",
            alignItems: "center",
          }}
        >
          {brands.map((brand, i) => {
            const brandDelay = 8 + i * 4;
            const brandOpacity = interpolate(frame, [brandDelay, brandDelay + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const brandScale = scalePop(frame, brandDelay, 12);
            const glowIntensity = interpolate(frame, [brandDelay + 8, brandDelay + 14, brandDelay + 20], [0, 15, 8], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: brandOpacity,
                  transform: `scale(${brandScale})`,
                  filter: `drop-shadow(0 0 ${glowIntensity}px rgba(255,255,255,0.3))`,
                }}
              >
                <Img
                  src={staticFile(`content/brands/${brand}.webp`)}
                  style={{
                    height: "44px",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: tokens.colors.secondary,
            opacity: interpolate(frame, [28, 38], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            letterSpacing: "0.1em",
          }}
        >
          คุณภาพที่ไว้วางใจได้
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 7: CTA + LOGO — Epic finale
// (13-15s, 60 frames)
// ═══════════════════════════════════════════════════════════════════
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = particleBurst(frame, 8, 20, 300);
  const logoScale = scalePop(frame, 3, 18);
  const logoOpacity = interpolate(frame, [3, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const btnPulse = pulse(frame, 18, 0.14, 0.06);
  const btnGlow = glowPulse(frame, 18, tokens.colors.primary, 35, 0.14);
  const btnOpacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = interpolate(frame, [10, 40], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ringOpacity = interpolate(frame, [10, 25, 40], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <Img
        src={staticFile("images/1779681103087.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.12) blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: `2px solid ${tokens.colors.primary}`,
          opacity: ringOpacity,
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: i % 4 === 0 ? tokens.colors.secondary : i % 4 === 1 ? tokens.colors.primary : i % 4 === 2 ? "#fff" : "#fbbf24",
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
            boxShadow: `0 0 8px currentColor`,
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "60px",
            fontWeight: 900,
            color: "#fff",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            letterSpacing: "0.06em",
            textShadow: `0 0 60px ${tokens.colors.primary}40, 0 4px 30px rgba(0,0,0,0.6)`,
          }}
        >
          Tawan Power
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: tokens.colors.secondary,
            opacity: logoOpacity,
            marginBottom: "40px",
            letterSpacing: "0.15em",
          }}
        >
          พลังงานสะอาด · อนาคตสดใส
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${tokens.colors.primary}, #E67A00)`,
            color: "#fff",
            padding: "22px 60px",
            borderRadius: "60px",
            fontSize: "32px",
            fontWeight: 800,
            transform: `scale(${btnPulse})`,
            opacity: btnOpacity,
            boxShadow: `${btnGlow}, 0 8px 30px rgba(0,0,0,0.3)`,
            letterSpacing: "0.05em",
          }}
        >
          ขอรับคำปรึกษาฟรี
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "90px",
            fontSize: "20px",
            color: "rgba(255,255,255,0.4)",
            opacity: interpolate(frame, [32, 45], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            letterSpacing: "0.1em",
          }}
        >
          @tawanpower · tawanpower.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN — 15 seconds (450 frames @ 30fps)
// ═══════════════════════════════════════════════════════════════════
export const KineticStory15s: React.FC = () => {
  const { fps } = useVideoConfig();

  const scenes = [
    { component: HookScene, start: 0, duration: 2.5 * fps },
    { component: ShockScene, start: 2.5 * fps, duration: 2 * fps },
    { component: ProjectScene, start: 4.5 * fps, duration: 2.5 * fps },
    { component: BarChartScene, start: 7 * fps, duration: 2 * fps },
    { component: ProductScene, start: 9 * fps, duration: 2.5 * fps },
    { component: BrandsScene, start: 11.5 * fps, duration: 1.5 * fps },
    { component: FinalScene, start: 13 * fps, duration: 2 * fps },
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
