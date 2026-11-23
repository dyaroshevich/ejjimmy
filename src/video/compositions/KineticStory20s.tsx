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
// (0-3s, 90 frames)
// ═══════════════════════════════════════════════════════════════════
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bgScale = interpolate(frame, [0, 90], [1.2, 1.0], {
    extrapolateRight: "clamp",
  });

  const glitchActive = frame > 18 && frame < 28;
  const glitchX = glitchActive ? Math.sin(frame * 47) * 10 : 0;
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
          bottom: "320px",
          left: "60px",
          right: "60px",
        }}
      >
        {["คุณ", "จ่าย", "เท่าไหร่?"].map((word, i) => {
          const opacity = wordOpacity(i, frame, 2, 12, 10);
          const y = slideIn(frame, 2 + i * 12, 100, 16);
          const scale = interpolate(frame, [2 + i * 12, 2 + i * 12 + 12], [0.5, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.5)),
          });
          return (
            <div
              key={i}
              style={{
                fontSize: i === 2 ? "180px" : "150px",
                fontWeight: 900,
                color: i === 2 ? tokens.colors.secondary : "#fff",
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
                textShadow: i === 2
                  ? `0 0 100px ${tokens.colors.secondary}aa, 0 10px 50px rgba(0,0,0,0.9)`
                  : "0 10px 50px rgba(0,0,0,0.9)",
                lineHeight: 1.05,
              }}
            >
              {word}
            </div>
          );
        })}
        <div
          style={{
            fontSize: "36px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "32px",
            opacity: interpolate(frame, [50, 65], [0, 1], {
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
// (3-5.5s, 75 frames)
// ═══════════════════════════════════════════════════════════════════
const ShockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const counter = counterAnimation(15000, frame, 3, 45);
  const shakeVal = shakeIntense(frame, 40, 28, 16);
  const flash = interpolate(frame, [40, 43, 48], [0, 0.5, 0], {
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
        opacity: interpolate(elapsed, [0, 5, 30], [0, 0.8, 0], {
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
            fontSize: "36px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
            marginBottom: "20px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          ค่าไฟเดือนนี้
        </div>
        <div
          style={{
            fontSize: "180px",
            fontWeight: 900,
            color: tokens.colors.danger,
            textShadow: `0 0 120px ${tokens.colors.danger}90, 0 0 240px ${tokens.colors.danger}40, 0 8px 40px rgba(0,0,0,0.6)`,
            transform: `scale(${scalePop(frame, 3, 16)})`,
            lineHeight: 1,
          }}
        >
          ฿{counter.toLocaleString()}
        </div>
        <div
          style={{
            position: "absolute",
            width: interpolate(frame, [42, 52], [0, 500], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            height: "4px",
            background: tokens.colors.danger,
            opacity: interpolate(frame, [42, 48, 60], [0, 0.8, 0], {
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
            opacity: interpolate(frame, [48, 58], [0, 1], {
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
// SCENE 3: REAL PROJECT — Full-screen hero + 3 stats + 3 detail photos
// (5.5-8.5s, 90 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const ProjectScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#0a0a0a" }}>
      {/* Hero photo — FULL SCREEN */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <Img
          src={staticFile("images/krabi-001.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.5)",
            transform: `scale(${interpolate(frame, [0, 90], [1.1, 1.0], { extrapolateRight: "clamp" })})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.9) 100%)",
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
        <div style={{ fontSize: "72px", fontWeight: 900, color: "#fff", textShadow: "0 4px 30px rgba(0,0,0,0.7)" }}>
          โครงการจริง
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: tokens.colors.secondary,
            marginTop: "8px",
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
            <div style={{ fontSize: "26px", color: "rgba(255,255,255,0.6)", marginBottom: "10px", letterSpacing: "0.08em" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: stat.color, lineHeight: 1, textShadow: `0 0 30px ${stat.color}40` }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "30px", fontWeight: 600, color: stat.color, opacity: 0.7, marginTop: "6px" }}>
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
            borderRadius: "36px",
            overflow: "hidden",
            border: `2px solid ${tokens.colors.primary}40`,
            opacity: interpolate(frame, [35, 45], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateX(${slideIn(frame, 35, 50, 14)}px)`,
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
            borderRadius: "36px",
            overflow: "hidden",
            border: `2px solid ${tokens.colors.secondary}40`,
            opacity: interpolate(frame, [42, 52], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateX(${slideIn(frame, 42, -50, 14)}px)`,
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
          borderRadius: "36px",
          overflow: "hidden",
          border: `2px solid rgba(255,255,255,0.12)`,
          opacity: interpolate(frame, [50, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${slideIn(frame, 50, 30, 14)}px)`,
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
// SCENE 4: PHOTO SWIPE — 4 full-screen photos with Ken Burns + swipe
// (8.5-11.5s, 90 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const PhotoSwipeScene: React.FC = () => {
  const frame = useCurrentFrame();

  const photos = [
    { src: "images/1779681091103.jpg", zoomFrom: 1.15, zoomTo: 1.0, xFrom: 20, xTo: -20 },
    { src: "images/1779681091334.jpg", zoomFrom: 1.0, zoomTo: 1.12, xFrom: -15, xTo: 15 },
    { src: "images/1779681103087.jpg", zoomFrom: 1.1, zoomTo: 1.0, xFrom: 10, xTo: -10 },
    { src: "images/1779681103133.jpg", zoomFrom: 1.0, zoomTo: 1.15, xFrom: -20, xTo: 20 },
  ];

  const photoDuration = 22; // ~0.73s per photo
  const transitionDuration = 6;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#000" }}>
      {photos.map((photo, i) => {
        const start = i * photoDuration;
        const end = start + photoDuration + transitionDuration;
        const isActive = frame >= start && frame < end;

        if (!isActive) return null;

        const localFrame = frame - start;
        const totalVisible = photoDuration + transitionDuration;

        // Ken Burns zoom
        const zoom = interpolate(localFrame, [0, totalVisible], [photo.zoomFrom, photo.zoomTo], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Ken Burns pan
        const panX = interpolate(localFrame, [0, totalVisible], [photo.xFrom, photo.xTo], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Swipe in from right
        const enterX = interpolate(localFrame, [0, transitionDuration], [100, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        // Swipe out to left (only for non-last photos)
        const exitX = i < photos.length - 1
          ? interpolate(localFrame, [photoDuration, totalVisible], [0, -100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.cubic),
            })
          : 0;

        const translateX = enterX + exitX;

        // Fade
        const opacity = interpolate(localFrame, [0, 3, photoDuration - 3, totalVisible], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity,
              transform: `translateX(${translateX}%)`,
              willChange: "transform",
            }}
          >
            <Img
              src={staticFile(photo.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${zoom}) translateX(${panX}px)`,
              }}
            />
          </div>
        );
      })}

      {/* Dark vignette overlay */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle counter label */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [10, 20, 75, 85], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.12em",
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            background: "rgba(0,0,0,0.3)",
            display: "inline-block",
            padding: "12px 32px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          📸 กระบี่ — ติดตั้งจริง
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 5: SAVINGS — Giant number center + before/after comparison
// (11.5-14s, 75 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const BarChartScene: React.FC = () => {
  const frame = useCurrentFrame();

  const savingsCounter = counterAnimation(10500, frame, 8, 30);
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

      {/* Tagline */}
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
// SCENE 6: PRODUCTS — Centered layout: product + name + specs
// (14-17s, 90 frames)
// Canvas: 1080 x 1920
// ═══════════════════════════════════════════════════════════════════
const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();

  const inverterScale = scalePop(frame, 3, 18);
  const inverterOpacity = interpolate(frame, [3, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: "#0a0a0a" }}>
      {/* Background photo — 20px rounded corners */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          bottom: "20px",
          borderRadius: "36px",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("images/krabi-002.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.08) blur(2px)",
          }}
        />
      </div>

      {/* ═══ CENTERED CONTENT ═══ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 50px",
        }}
      >
        {/* Product image — with rounded corners */}
        <div
          style={{
            width: "620px",
            height: "620px",
              borderRadius: "36px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.05)",
              border: `2px solid ${tokens.colors.primary}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: inverterOpacity,
            transform: `scale(${inverterScale})`,
            boxShadow: `0 24px 70px rgba(0,0,0,0.5), 0 0 50px ${tokens.colors.primary}15`,
          }}
        >
          <Img
            src={staticFile("content/products/goodwe-5kw-inverter/main.webp")}
            style={{
              width: "88%",
              height: "88%",
              objectFit: "contain",
              borderRadius: "36px",
              filter: "drop-shadow(0 24px 50px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        {/* Product name — centered */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            opacity: interpolate(frame, [10, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: "60px",
              fontWeight: 900,
              color: "#fff",
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
              letterSpacing: "0.02em",
            }}
          >
            GoodWe 10 kW
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "10px",
              letterSpacing: "0.08em",
            }}
          >
            Hybrid Inverter · 10kW System
          </div>
        </div>

        {/* Specs — centered grid, 2x2 */}
        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            width: "100%",
            maxWidth: "880px",
          }}
        >
          {[
            { icon: "⚡", text: "10 kW", sub: "กำลังผลิต", color: tokens.colors.primary },
            { icon: "💰", text: "฿180K", sub: "ราคา", color: tokens.colors.secondary },
            { icon: "🛡️", text: "30 ปี", sub: "รับประกัน", color: "#fff" },
            { icon: "📱", text: "APP", sub: "Monitoring", color: "#fff" },
          ].map((spec, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "22px",
                padding: "32px 30px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "22px",
                border: "1px solid rgba(255,255,255,0.1)",
                opacity: interpolate(frame, [20 + i * 5, 28 + i * 5], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateY(${slideIn(frame, 20 + i * 5, 30, 12)}px)`,
              }}
            >
              <span style={{ fontSize: "52px" }}>{spec.icon}</span>
              <div>
                <div style={{ fontSize: "48px", fontWeight: 800, color: spec.color, lineHeight: 1 }}>{spec.text}</div>
                <div style={{ fontSize: "26px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>{spec.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel + Battery row */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "20px",
            width: "100%",
            maxWidth: "880px",
            opacity: interpolate(frame, [40, 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "24px 24px",
              background: `linear-gradient(135deg, ${tokens.colors.secondary}12, rgba(255,255,255,0.04))`,
              borderRadius: "18px",
              border: `2px solid ${tokens.colors.secondary}30`,
            }}
          >
            <Img
              src={staticFile("content/products/jinko-630w-panel/main.webp")}
              style={{ width: "72px", height: "72px", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: tokens.colors.secondary }}>Jinko 630W</div>
              <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)" }}>แผงโซลาร์</div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "24px 24px",
              background: `linear-gradient(135deg, ${tokens.colors.primary}12, rgba(255,255,255,0.04))`,
              borderRadius: "18px",
              border: `2px solid ${tokens.colors.primary}30`,
            }}
          >
            <Img
              src={staticFile("content/products/sigen-battery-5kwh/main.webp")}
              style={{ width: "72px", height: "72px", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: tokens.colors.primary }}>SigEnergy</div>
              <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)" }}>แบต 5kWh</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCENE 7: BRANDS — Dramatic logo reveal with glow
// (17-19s, 60 frames)
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
// SCENE 8: CTA + LOGO — Epic finale
// (19-20s, 30 frames)
// ═══════════════════════════════════════════════════════════════════
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = particleBurst(frame, 5, 20, 300);
  const logoScale = scalePop(frame, 2, 12);
  const logoOpacity = interpolate(frame, [2, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const btnPulse = pulse(frame, 10, 0.14, 0.06);
  const btnGlow = glowPulse(frame, 10, tokens.colors.primary, 35, 0.14);
  const btnOpacity = interpolate(frame, [10, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = interpolate(frame, [6, 25], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ringOpacity = interpolate(frame, [6, 15, 25], [0, 0.3, 0], {
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
            opacity: interpolate(frame, [18, 28], [0, 1], {
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
// MAIN — 20 seconds (600 frames @ 30fps)
// ═══════════════════════════════════════════════════════════════════
export const KineticStory20s: React.FC = () => {
  const { fps } = useVideoConfig();

  const scenes = [
    { component: HookScene, start: 0, duration: 3 * fps },           // 0-3s (90f)
    { component: ShockScene, start: 3 * fps, duration: 2.5 * fps },  // 3-5.5s (75f)
    { component: ProjectScene, start: 5.5 * fps, duration: 3 * fps },// 5.5-8.5s (90f)
    { component: PhotoSwipeScene, start: 8.5 * fps, duration: 3 * fps }, // 8.5-11.5s (90f)
    { component: BarChartScene, start: 11.5 * fps, duration: 2.5 * fps }, // 11.5-14s (75f)
    { component: ProductScene, start: 14 * fps, duration: 3 * fps }, // 14-17s (90f)
    { component: BrandsScene, start: 17 * fps, duration: 2 * fps },  // 17-19s (60f)
    { component: FinalScene, start: 19 * fps, duration: 1 * fps },   // 19-20s (30f)
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
