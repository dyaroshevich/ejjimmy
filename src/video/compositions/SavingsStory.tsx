import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

interface SavingsStoryProps {
  monthlyBill: number;
  systemPower: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  lifetimeSavings: number;
}

export const SavingsStory: React.FC<SavingsStoryProps> = ({
  monthlyBill,
  systemPower,
  monthlySavings,
  annualSavings,
  paybackYears,
  lifetimeSavings,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const formatNumber = (num: number) =>
    num.toLocaleString("th-TH");

  const billOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const billScale = interpolate(frame, [20, 40], [1, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savingsOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savingsScale = interpolate(frame, [50, 70], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const paybackOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lifetimeOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: gradients.dark,
        fontFamily: FONT_FAMILY,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Current Bill */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "60px",
          opacity: billOpacity,
          transform: `scale(${billScale})`,
        }}
      >
        <div
          style={{
            fontSize: "36px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "16px",
          }}
        >
          ค่าไฟตอนนี้
        </div>
        <div
          style={{
            fontSize: "96px",
            fontWeight: 800,
            color: tokens.colors.danger,
          }}
        >
          ฿{formatNumber(monthlyBill)}
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          /เดือน
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          fontSize: "64px",
          color: tokens.colors.primary,
          marginBottom: "60px",
          opacity: interpolate(frame, [40, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ↓
      </div>

      {/* New Bill */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "60px",
          opacity: savingsOpacity,
          transform: `scale(${savingsScale})`,
        }}
      >
        <div
          style={{
            fontSize: "36px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "16px",
          }}
        >
          ค่าไฟใหม่
        </div>
        <div
          style={{
            fontSize: "96px",
            fontWeight: 800,
            color: tokens.colors.primary,
          }}
        >
          ฿{formatNumber(monthlyBill - monthlySavings)}
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          /เดือน
        </div>
      </div>

      {/* Savings */}
      <div
        style={{
          display: "flex",
          gap: "60px",
          marginBottom: "60px",
          opacity: savingsOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: tokens.colors.savings,
            }}
          >
            ฿{formatNumber(monthlySavings)}
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            ประหยัด/เดือน
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: tokens.colors.savings,
            }}
          >
            ฿{formatNumber(annualSavings)}
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            ประหยัด/ปี
          </div>
        </div>
      </div>

      {/* Payback */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          opacity: paybackOpacity,
        }}
      >
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: tokens.colors.accent2,
          }}
        >
          คืนทุนใน {paybackYears} ปี
        </div>
      </div>

      {/* Lifetime */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "80px",
          opacity: lifetimeOpacity,
        }}
      >
        <div
          style={{
            fontSize: "36px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "16px",
          }}
        >
          ประหยัดตลอด 25 ปี
        </div>
        <div
          style={{
            fontSize: "80px",
            fontWeight: 800,
            color: tokens.colors.primary,
          }}
        >
          ฿{formatNumber(lifetimeSavings)}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          background: tokens.colors.primary,
          color: "#fff",
          padding: "24px 64px",
          borderRadius: tokens.radius.button,
          fontSize: "40px",
          fontWeight: 700,
          opacity: ctaOpacity,
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
        }}
      >
        คำนวณของคุณฟรี
      </div>
    </AbsoluteFill>
  );
};
