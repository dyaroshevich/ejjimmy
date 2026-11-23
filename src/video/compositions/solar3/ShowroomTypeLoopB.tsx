import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ds, type, weight } from "../../design3";
import { DS2_FAMILY, DS2_MONO } from "../../loadFonts3";

/**
 * Showroom loop B — «บิลไฟฟ้าขึ้นทุกเดือน» (счёт за свет растёт → ฿0 с солнцем).
 * Бесшовный луп 20с @30fps, 1920×1080, без голоса, шоурум крутит по кругу.
 * ДС 2.0: lime = цифры/действие, cyan = подсветка/kicker, night-фон,
 * градиент — только декоративные полосы. Thai без letter-spacing.
 */

const DURATION = 600;

/** Растущий счётчик денег (hua-мм+, tabular-nums). */
const BahtCount: React.FC<{
  to: number;
  start: number;
  size?: number;
  color?: string;
  prefix?: string;
}> = ({ to, start, size = 360, color = ds.colors.lime, prefix = "" }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const val = Math.round(to * (1 - Math.pow(1 - t, 3)));
  return (
    <span
      style={{
        fontFamily: DS2_FAMILY,
        fontWeight: weight.price,
        fontSize: size,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: -10,
        color,
        lineHeight: 1,
      }}
    >
      {prefix}
      {val.toLocaleString("en-US")}
    </span>
  );
};

/** Направленная сцена (совместима с геометрией кита solar3). */
const S: React.FC<{
  from: number;
  to: number;
  dir?: "up" | "down" | "left" | "right";
  fade?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ from, to, dir = "up", fade = 13, blur = 16, style, children }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [from, from + fade], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outP = interpolate(frame, [to - fade, to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const axis = dir === "up" || dir === "down" ? "Y" : "X";
  const sign = dir === "up" || dir === "left" ? 1 : -1;
  const off = sign * (1 - inP) * 90 - sign * (1 - outP) * 64;
  const blurPx = (1 - inP) * blur + (1 - outP) * blur * 0.8;
  return (
    <div
      style={{
        opacity: inP * outP,
        transform: axis === "Y" ? `translateY(${off}px)` : `translateX(${off}px)`,
        filter: blurPx > 0.4 ? `blur(${blurPx}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Слова въезжают по одному (Thai без трекинга). */
const Kinetic: React.FC<{
  words: string[];
  start: number;
  size?: number;
  accent?: string[];
  align?: "left" | "center";
}> = ({ words, start, size = 170, accent = [], align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accents = new Set(accent);
  return (
    <div
      lang="th"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
        justifyContent: align === "center" ? "center" : "flex-start",
        fontFamily: DS2_FAMILY,
        fontWeight: weight.price,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: -4,
        color: ds.colors.paper,
      }}
    >
      {words.map((word, i) => {
        const t = spring({
          frame: frame - start - i * 6,
          fps,
          config: { damping: 13, mass: 0.55 },
          durationInFrames: 26,
        });
        const a = accents.has(word);
        return (
          <span
            key={`${i}-${word}`}
            style={{
              display: "inline-block",
              color: a ? ds.colors.lime : ds.colors.paper,
              opacity: interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(t, [0, 1], [80, 0])}px)`,
              filter: t < 0.95 ? `blur(${interpolate(t, [0, 1], [12, 0])}px)` : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Чип-тостер: единственная lime-CTA-плашка в финале. */
const CtaPill: React.FC<{ label: string; note: string; start: number }> = ({
  label,
  note,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - start, fps, config: { damping: 14, mass: 0.7 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(t, [0, 1], [60, 0])}px)`,
      }}
    >
      <div
        lang="th"
        style={{
          background: ds.colors.lime,
          color: ds.colors.ink,
          fontFamily: DS2_FAMILY,
          fontWeight: weight.bold,
          fontSize: 46,
          padding: "22px 52px",
          borderRadius: ds.radius.pill,
          boxShadow: ds.shadow.pop,
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "0 34px",
          borderRadius: ds.radius.pill,
          border: "2px solid rgba(27,225,251,0.5)",
          color: ds.colors.cyan,
          fontFamily: DS2_FAMILY,
          fontWeight: weight.bold,
          fontSize: 42,
          lineHeight: 2.35,
        }}
      >
        {note}
      </div>
    </div>
  );
};

export const ShowroomTypeLoopB: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: ds.colors.night }}>
      {/* Сценное свечение — чуть теплее, там где «проблема», холодное к решению */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1100px 560px at 50% 120%, rgba(183,255,65,0.09), rgba(10,15,10,0) 70%), radial-gradient(860px 460px at 8% -8%, rgba(27,225,251,0.07), rgba(10,15,10,0) 60%)",
        }}
      />

      {/* Верхняя декоративная полоса + бренд-чип (живут весь луп) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: ds.grad }} />
      <div style={{ position: "absolute", top: 56, left: 72, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 34, height: 34, borderRadius: 14, background: ds.colors.lime, boxShadow: ds.shadow.pop }} />
        <div
          style={{
            fontFamily: DS2_FAMILY,
            fontWeight: weight.bold,
            fontSize: 22,
            letterSpacing: 2.2,
            color: ds.colors.paper,
          }}
        >
          TAWAN POWER
        </div>
      </div>

      {/* ── Сцена 1 (0-170): счёт растёт каждое месяце — ขึ้นทุกเดือน ── */}
      <S from={0} to={178} dir="up" style={{ position: "absolute", left: 72, right: 72, top: 200 }}>
        <div
          lang="th"
          style={{ fontFamily: DS2_FAMILY, fontWeight: weight.regular, fontSize: 30, letterSpacing: 4, color: ds.colors.cyan, marginBottom: 22 }}
        >
          บิลค่าไฟของคุณ เดือนนี้
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <BahtCount to={7100} start={14} prefix="฿" size={330} />
          <div
            lang="th"
            style={{
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 110,
              color: "rgba(247,246,243,0.85)",
            }}
          >
            ↑ ขึ้นทุกเดือน
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: DS2_MONO,
            fontWeight: 600,
            fontSize: 30,
            color: "rgba(247,246,243,0.62)",
          }}
        >
          <div style={{ width: 320, height: 4, borderRadius: ds.radius.pill, background: ds.grad }} />
          จ่ายแอร์ให้การไฟฟ้า PEA
        </div>
      </S>

      {/* ── Сцена 2 (166-330): признаки — «หลังคาของคุณ ผลิตไฟได้เอง» ── */}
      <S from={166} to={336} dir="left" style={{ position: "absolute", left: 72, right: 72, top: 210 }}>
        <div
          lang="th"
          style={{ fontFamily: DS2_FAMILY, fontWeight: weight.regular, fontSize: 30, letterSpacing: 4, color: ds.colors.cyan, marginBottom: 22 }}
        >
          ทางออกอยู่บนหลังคาของคุณ
        </div>
        <Kinetic start={180} size={165} words={["หลังคา", "ผลิตไฟ"]} accent={["ผลิตไฟ"]} />
        <div
          style={{
            marginTop: 46,
            display: "flex",
            gap: 18,
          }}
        >
          {["ใช้แดดฟรี", "ไม่มีค่าเชื้อเพลิง", "เก็บไว้ใช้กลางคืน"].map((item, i) => (
            <div
              key={item}
              style={{
                flex: 1,
                borderRadius: ds.radius.pill,
                border: i === 1 ? "2px solid rgba(27,225,251,0.55)" : "2px solid rgba(183,255,65,0.45)",
                background: "rgba(10,15,10,0.45)",
                padding: "18px 30px",
                fontFamily: DS2_FAMILY,
                fontWeight: weight.bold,
                fontSize: 40,
                color: i === 1 ? ds.colors.cyan : ds.colors.lime,
                textAlign: "center",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </S>

      {/* ── Сцена 3 (322-470): счётчик ฿0 — хук ── */}
      <S from={322} to={474} dir="up" style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <div
          lang="th"
          style={{ fontFamily: DS2_FAMILY, fontWeight: weight.regular, fontSize: 30, letterSpacing: 4, color: ds.colors.cyan, marginBottom: 18 }}
        >
          หลังติดตั้งโซลาร์ แล้วค่าไฟกลายเป็น
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, justifyContent: "center" }}>
          <BahtCount to={0} start={336} prefix="฿" size={360} />
          <div
            lang="th"
            style={{ fontFamily: DS2_FAMILY, fontWeight: weight.bold, fontSize: 120, color: ds.colors.paper }}
          >
            กลางวัน
          </div>
        </div>
        <div
          lang="th"
          style={{
            marginTop: 40,
            fontFamily: DS2_FAMILY,
            fontWeight: weight.medium,
            fontSize: 36,
            color: "rgba(247,246,243,0.72)",
          }}
        >
          แต่ลืมบาทค่าไฟที่ รับประกัน 25 ปี
        </div>
      </S>

      {/* ── Сцена 4 (460-600): CTA-аутро ── */}
      <S from={462} to={602} dir="up" style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center" }}>
        <Kinetic
          start={472}
          size={140}
          align="center"
          words={["แดดกระบี่", "= ไฟฟ้าฟรี"]}
          accent={["= ไฟฟ้าฟรี"]}
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
          <CtaPill label="รับประเมินหน้างานฟรี" note="tawanpower.vercel.app" start={492} />
        </div>
      </S>

      {/* Прогресс лупа внизу — бесшовный */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(247,246,243,0.08)" }}>
        <div
          style={{
            width: `${(frame / DURATION) * 100}%`,
            height: "100%",
            background: ds.grad,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const SHOWROOM_TYPE_LOOP_B_DURATION = DURATION;
