import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

const Sky: React.FC<{ frame: number; isNight: boolean }> = ({ frame, isNight }) => {
  const dayProgress = interpolate(frame, [0, 120, 121, 240], [0, 0, 1, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const skyColor = isNight
    ? interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(frame, [0, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dayBg = "linear-gradient(180deg, #38bdf8 0%, #7dd3fc 40%, #bae6fd 100%)";
  const nightBg = "linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 100%)";

  return (
    <AbsoluteFill
      style={{
        background: dayProgress < 0.5 ? dayBg : nightBg,
        transition: "background 0.5s",
      }}
    />
  );
};

const Sun: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15, 100, 120], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const y = interpolate(frame, [0, 60, 120], [300, 200, 300], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scale = interpolate(frame, [0, 60, 120], [0.8, 1.1, 0.8], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "540px",
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        fontSize: "120px",
      }}
    >
      ☀️
    </div>
  );
};

const Moon: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [120, 140, 220, 240], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const y = interpolate(frame, [120, 180, 240], [300, 220, 300], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "540px",
        top: y,
        transform: "translate(-50%, -50%)",
        opacity,
        fontSize: "100px",
      }}
    >
      🌙
    </div>
  );
};

const Stars: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const starPositions = [
    { x: 150, y: 180 }, { x: 350, y: 120 }, { x: 750, y: 160 },
    { x: 900, y: 200 }, { x: 200, y: 300 }, { x: 850, y: 280 },
    { x: 450, y: 100 }, { x: 650, y: 140 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {starPositions.map((star, i) => {
        const twinkle = interpolate(
          frame,
          [140 + i * 5, 155 + i * 5, 170 + i * 5],
          [0.3, 1, 0.3],
          { extrapolateRight: "extend" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y,
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#fff",
              opacity: twinkle,
              boxShadow: "0 0 8px #fff",
            }}
          />
        );
      })}
    </div>
  );
};

const Clouds: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15, 100, 120], [0.6, 0.6, 0.6, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [0, 240], [-200 + i * 400, 100 + i * 400]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 350 + i * 30,
              fontSize: "60px",
            }}
          >
            ☁️
          </div>
        );
      })}
    </div>
  );
};

const Panel: React.FC<{ frame: number }> = ({ frame }) => {
  const productionOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const productionPower = interpolate(frame, [10, 60], [0, 5.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nightProduction = interpolate(frame, [120, 140], [5.0, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const power = frame < 120 ? productionPower : nightProduction;

  return (
    <div style={{ position: "absolute", left: "180px", top: "520px", transform: "translate(-50%, -50%)" }}>
      <div
        style={{
          width: "220px",
          height: "160px",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          borderRadius: "16px",
          border: "3px solid #334155",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: "6px",
          padding: "12px",
          boxShadow: `0 0 ${power > 2 ? 30 : 0}px ${tokens.colors.primary}60`,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              background: `linear-gradient(135deg, #1e40af ${power * 20}%, #1e3a5f)`,
              borderRadius: "4px",
            }}
          />
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontFamily: tokens.fonts.mono,
          fontSize: "24px",
          fontWeight: 700,
          color: tokens.colors.primary,
          opacity: productionOpacity,
        }}
      >
        {power.toFixed(1)} kW
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "18px",
          color: tokens.colors.textMuted,
        }}
      >
        แผงโซลาร์
      </div>
    </div>
  );
};

const Battery: React.FC<{ frame: number }> = ({ frame }) => {
  const dayCharge = interpolate(frame, [10, 100], [20, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nightDischarge = interpolate(frame, [120, 220], [100, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charge = frame <= 100 ? dayCharge : nightDischarge;
  const dischargeLabel = frame > 120;

  const chargeColor = charge > 60 ? tokens.colors.primary : charge > 30 ? tokens.colors.secondary : "#ef4444";
  const pulse = dischargeLabel
    ? interpolate(frame, [130, 160, 190, 220], [1, 0.95, 1, 0.95], { extrapolateRight: "extend" })
    : 1;

  return (
    <div style={{ position: "absolute", left: "540px", top: "520px", transform: "translate(-50%, -50%)" }}>
      <div
        style={{
          width: "200px",
          height: "280px",
          background: "#f8fafc",
          borderRadius: "20px",
          border: `4px solid ${chargeColor}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "16px",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 20px ${chargeColor}30`,
          transform: `scale(${pulse})`,
        }}
      >
        {/* Battery cap */}
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "20px",
            background: "#94a3b8",
            borderRadius: "8px 8px 0 0",
          }}
        />

        {/* Charge level */}
        <div
          style={{
            width: "100%",
            height: `${charge}%`,
            background: `linear-gradient(180deg, ${chargeColor} 0%, ${chargeColor}cc 100%)`,
            borderRadius: "12px",
            transition: "height 0.3s",
            position: "absolute",
            bottom: "16px",
            left: "16px",
            right: "16px",
          }}
        />

        {/* Percentage */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: tokens.fonts.mono,
            fontSize: "36px",
            fontWeight: 900,
            color: charge > 50 ? "#fff" : tokens.colors.text,
            textShadow: charge > 50 ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {Math.round(charge)}%
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "22px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        {dischargeLabel ? "🔋 จ่ายไฟ" : "⚡ ชาร์จ"}
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "18px",
          color: tokens.colors.textMuted,
        }}
      >
        Dyness 10kWh
      </div>
    </div>
  );
};

const House: React.FC<{ frame: number }> = ({ frame }) => {
  const isNight = frame > 120;
  const lightsOn = interpolate(frame, [125, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", left: "880px", top: "520px", transform: "translate(-50%, -50%)" }}>
      <div
        style={{
          width: "200px",
          height: "180px",
          background: "#f8fafc",
          borderRadius: "16px",
          border: "3px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Windows */}
        {[
          { left: 20, top: 30 },
          { left: 20, top: 100 },
          { right: 20, top: 30 },
          { right: 20, top: 100 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos.left,
              right: pos.right,
              top: pos.top,
              width: "50px",
              height: "50px",
              background: isNight
                ? `rgba(245,158,11,${lightsOn * 0.9})`
                : "#e2e8f0",
              borderRadius: "6px",
              boxShadow: isNight && lightsOn > 0.5 ? `0 0 20px ${tokens.colors.secondary}80` : "none",
            }}
          />
        ))}
        <div style={{ fontSize: "50px", position: "relative", zIndex: 1 }}>🏠</div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "22px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        บ้านคุณ
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "18px",
          color: tokens.colors.textMuted,
        }}
      >
        {isNight ? "ใช้ไฟจากแบตเตอรี่" : "ใช้ไฟจากโซลาร์"}
      </div>
    </div>
  );
};

const PowerLabel: React.FC<{ frame: number }> = ({ frame }) => {
  const isNight = frame > 120;
  const opacity = interpolate(frame, [140, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!isNight) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "300px",
        left: "540px",
        transform: "translateX(-50%)",
        background: tokens.colors.primary,
        color: "#fff",
        padding: "20px 48px",
        borderRadius: "60px",
        fontFamily: FONT_FAMILY,
        fontSize: "28px",
        fontWeight: 800,
        opacity,
        boxShadow: `0 10px 40px ${tokens.colors.primary}60`,
      }}
    >
      ⚡ แบตเตอรี่จ่ายไฟให้บ้าน
    </div>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 18], [0.6, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

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
      <div
        style={{
          fontSize: "48px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
          lineHeight: 1.3,
          marginBottom: "32px",
        }}
      >
        โซลาร์ + แบตเตอรี่
        <br />
        <span style={{ color: "#fef3c7" }}>ไฟฟ้า 24 ชม.</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "24px",
          opacity: interpolate(frame, [22, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {["☀️ กลางวัน", "🌙 กลางคืน", "💰 ประหยัด"].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "16px 24px",
              borderRadius: "16px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const DayNightStory: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const isNight = frame >= 120;

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={8 * fps}>
        <AbsoluteFill>
          <Sky frame={frame} isNight={isNight} />
          <Sun frame={frame} />
          <Moon frame={frame} />
          <Stars frame={frame} />
          <Clouds frame={frame} />

          {/* Ground */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "600px",
              background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)",
              borderRadius: "50% 50% 0 0 / 100px 100px 0 0",
            }}
          />

          {/* Title */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "60px",
              right: "60px",
              textAlign: "center",
              fontFamily: FONT_FAMILY,
              fontSize: "38px",
              fontWeight: 800,
              color: isNight ? "#fff" : tokens.colors.text,
            }}
          >
            {isNight ? "🌙 กลางคืน — แบตเตอรี่จ่ายไฟ" : "☀️ กลางวัน — โซลาร์ชาร์จแบต"}
          </div>

          <Panel frame={frame} />
          <Battery frame={frame} />
          <House frame={frame} />
          <PowerLabel frame={frame} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={8 * fps} durationInFrames={2 * fps}>
        <CTAScene frame={useCurrentFrame()} />
      </Sequence>
    </AbsoluteFill>
  );
};
