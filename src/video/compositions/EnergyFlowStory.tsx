import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

const Sun: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const pulse = interpolate(frame, [0, 30, 60], [1, 1.1, 1], { extrapolateRight: "extend" });
  const rayOpacity = interpolate(frame, [0, 20], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
      {/* Rays */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "4px",
            height: "60px",
            background: `linear-gradient(180deg, ${tokens.colors.secondary}, transparent)`,
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-50px)`,
            opacity: rayOpacity,
          }}
        />
      ))}
      {/* Sun body */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tokens.colors.secondary} 0%, #f97316 100%)`,
          boxShadow: `0 0 60px ${tokens.colors.secondary}80`,
          transform: `scale(${pulse})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "60px",
        }}
      >
        ☀️
      </div>
    </div>
  );
};

const Panel: React.FC<{ frame: number; x: number; y: number; delay: number }> = ({ frame, x, y, delay }) => {
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [delay + 20, delay + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity,
      }}
    >
      <div
        style={{
          width: "160px",
          height: "120px",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          borderRadius: "12px",
          border: "3px solid #334155",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: "4px",
          padding: "8px",
          boxShadow: `0 0 ${glow * 30}px ${tokens.colors.primary}60`,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              background: `linear-gradient(135deg, #1e40af ${glow * 100}%, #1e3a5f)`,
              borderRadius: "2px",
            }}
          />
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "20px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        แผงโซลาร์
      </div>
    </div>
  );
};

const Inverter: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const opacity = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [45, 75, 105], [1, 1.05, 1], { extrapolateRight: "extend" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity,
      }}
    >
      <div
        style={{
          width: "140px",
          height: "180px",
          background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: "16px",
          border: `3px solid ${tokens.colors.primary}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transform: `scale(${pulse})`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontSize: "40px" }}>⚡</div>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "18px",
            fontWeight: 700,
            color: tokens.colors.primary,
          }}
        >
          5.0 kW
        </div>
        <div
          style={{
            width: "40px",
            height: "4px",
            background: tokens.colors.primary,
            borderRadius: "2px",
          }}
        />
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "20px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        อินเวอร์เตอร์
      </div>
    </div>
  );
};

const House: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const opacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lightOn = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity,
      }}
    >
      <div
        style={{
          width: "160px",
          height: "140px",
          background: "#f8fafc",
          borderRadius: "12px",
          border: "3px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          position: "relative",
        }}
      >
        {/* Window glow */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "40px",
            height: "40px",
            background: `rgba(245,158,11,${lightOn * 0.8})`,
            borderRadius: "4px",
            boxShadow: lightOn > 0.5 ? `0 0 20px ${tokens.colors.secondary}60` : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "40px",
            height: "40px",
            background: `rgba(245,158,11,${lightOn * 0.8})`,
            borderRadius: "4px",
            boxShadow: lightOn > 0.5 ? `0 0 20px ${tokens.colors.secondary}60` : "none",
          }}
        />
        <div style={{ fontSize: "40px", marginTop: "20px" }}>🏠</div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "20px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        บ้านคุณ
      </div>
    </div>
  );
};

const Grid: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const opacity = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity,
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: "12px",
          border: "3px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "50px",
        }}
      >
        ⚡
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "20px",
          fontWeight: 700,
          color: tokens.colors.text,
        }}
      >
        สายส่งไฟฟ้า (PEA)
      </div>
    </div>
  );
};

const EnergyParticle: React.FC<{
  frame: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
  color: string;
}> = ({ frame, startX, startY, endX, endY, delay, duration, color }) => {
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);
  const opacity = progress > 0 && progress < 1 ? 1 : 0;
  const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1.2, 0.5]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 15px ${color}`,
        opacity,
      }}
    />
  );
};

const FlowScene: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "60px",
          fontSize: "40px",
          fontWeight: 800,
          color: tokens.colors.text,
          opacity: titleOpacity,
        }}
      >
        กระแสไฟฟ้าไหลอย่างไร
      </div>

      {/* Components */}
      <Sun frame={frame} x={540} y={280} />
      <Panel frame={frame} x={540} y={520} delay={15} />
      <Inverter frame={frame} x={540} y={780} />
      <House frame={frame} x={300} y={1050} />
      <Grid frame={frame} x={780} y={1050} />

      {/* Energy particles: Sun → Panel */}
      {[0, 20, 40, 60, 80].map((delay, i) => (
        <EnergyParticle
          key={`sp-${i}`}
          frame={frame}
          startX={540}
          startY={340}
          endX={540}
          endY={460}
          delay={delay}
          duration={25}
          color={tokens.colors.secondary}
        />
      ))}

      {/* Energy particles: Panel → Inverter */}
      {[10, 35, 55, 75, 95].map((delay, i) => (
        <EnergyParticle
          key={`pi-${i}`}
          frame={frame}
          startX={540}
          startY={580}
          endX={540}
          endY={690}
          delay={delay}
          duration={25}
          color={tokens.colors.primary}
        />
      ))}

      {/* Energy particles: Inverter → House */}
      {[30, 55, 80].map((delay, i) => (
        <EnergyParticle
          key={`ih-${i}`}
          frame={frame}
          startX={480}
          startY={870}
          endX={340}
          endY={980}
          delay={delay}
          duration={30}
          color="#3b82f6"
        />
      ))}

      {/* Energy particles: Inverter → Grid */}
      {[45, 70, 95].map((delay, i) => (
        <EnergyParticle
          key={`ig-${i}`}
          frame={frame}
          startX={600}
          startY={870}
          endX={740}
          endY={980}
          delay={delay}
          duration={30}
          color="#8b5cf6"
        />
      ))}

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "60px",
          right: "60px",
          display: "flex",
          justifyContent: "space-around",
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {[
          { icon: "☀️", label: "แสงแดด", color: tokens.colors.secondary },
          { icon: "⚡", label: "ไฟฟ้า", color: tokens.colors.primary },
          { icon: "🏠", label: "ใช้ในบ้าน", color: "#3b82f6" },
          { icon: "💰", label: "ขายคืน", color: "#8b5cf6" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px" }}>{item.icon}</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: item.color, marginTop: "8px" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = interpolate(frame, [0, 18], [0.6, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [22, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
          fontSize: "52px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
          lineHeight: 1.3,
          marginBottom: "48px",
        }}
      >
        ระบบโซลาร์
        <br />
        <span style={{ color: "#fef3c7" }}>ทำงานอัตโนมัติ</span>
      </div>

      <div
        style={{
          background: "#fff",
          color: tokens.colors.primary,
          padding: "28px 72px",
          borderRadius: "60px",
          fontSize: "36px",
          fontWeight: 800,
          opacity: ctaOpacity,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        ติดตั้งเลย
      </div>
    </AbsoluteFill>
  );
};

export const EnergyFlowStory: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={7 * fps}>
        <FlowScene frame={useCurrentFrame()} />
      </Sequence>
      <Sequence from={7 * fps} durationInFrames={3 * fps}>
        <CTAScene frame={useCurrentFrame()} />
      </Sequence>
    </AbsoluteFill>
  );
};
