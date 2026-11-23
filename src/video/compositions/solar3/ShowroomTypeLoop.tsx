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
 * Ролик для офлайн-шоурума: бесшовный луп 20с @30fps, 1920×1080.
 * Чистая моушн-типографика на всю ширину экрана, без голоса (экран в зале mute).
 * Дизайн-система 2.0: lime = действие, cyan = подсветка/номера, night-фон,
 * градиент lime→cyan — только декоративная полоса.
 * Луп бесшовный: бренд-чип и прогресс-полоса живут весь цикл, фон равномерный,
 * все сцены в конце и начале чистые. Плеер шоурума крутит файл по кругу.
 */

const DURATION = 600;

// ── участники лупа ──

/** Бренд-чип сверху слева, живёт весь луп. */
const BrandChip: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 56,
      left: 72,
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 14,
        background: ds.colors.lime,
        boxShadow: ds.shadow.pop,
      }}
    />
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
);

/** Декоративная grad-полоса поверх всего кадра (единственный градиент). */
const TopStripe: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: ds.grad,
    }}
  />
);

/** Гигантский кинетический заголовок: слова въезжают по одному (Thai без трекинга). */
const GiantKinetic: React.FC<{
  lines: string[];
  start: number;
  size?: number;
  accentWords?: string[];
  align?: "left" | "center";
}> = ({ lines, start, size = 150, accentWords = [], align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  const accents = new Set(accentWords);
  return (
    <div
      lang="th"
      style={{
        fontFamily: DS2_FAMILY,
        fontWeight: weight.price,
        fontSize: size,
        lineHeight: 1.08,
        color: ds.colors.paper,
        textAlign: align === "center" ? "center" : "left",
        letterSpacing: -4,
      }}
    >
      {lines.map((line, li) => {
        const words = line.split(" ").filter(Boolean);
        return (
          <div
            key={`${li}-${line}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 0.22em",
              justifyContent: align === "center" ? "center" : "flex-start",
            }}
          >
            {words.map((word) => {
              const i = idx++;
              const t = spring({
                frame: frame - start - i * 5,
                fps,
                config: { damping: 13, mass: 0.55 },
                durationInFrames: 26,
              });
              const accent = accents.has(word);
              return (
                <span
                  key={`${i}-${word}`}
                  style={{
                    display: "inline-block",
                    color: accent ? ds.colors.lime : ds.colors.paper,
                    opacity: interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
                    transform: `translateY(${interpolate(t, [0, 1], [90, 0])}px) scale(${interpolate(
                      t,
                      [0, 1],
                      [0.88, 1]
                    )})`,
                    filter: t < 0.95 ? `blur(${interpolate(t, [0, 1], [14, 0])}px)` : undefined,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Тонкая lime-линия-подчерк под заголовком (въезжает как линейка). */
const Underline: React.FC<{ start: number; width: number; color?: string }> = ({
  start,
  width,
  color = ds.colors.cyan,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        height: 6,
        width: width * t,
        borderRadius: ds.radius.pill,
        background: color,
        opacity: 0.9,
      }}
    />
  );
};

/** Одна бегущая строка-ряд (марки), направление чередуем. */
const MarqueeRow: React.FC<{
  items: string[];
  start: number;
  speed: number;
  dir?: 1 | -1;
  size?: number;
  y?: number;
}> = ({ items, start, speed, dir = 1, size = 72, y = 0 }) => {
  // Marquee бесшовный сам по себе (позиция зациклена mod 50%), границы лупа не рвут его.
  const frame = useCurrentFrame();
  const raw = frame < start ? 0 : (frame - start) * speed;
  const pct = ((raw % 50) + 50) % 50;
  const offset = dir === 1 ? -pct : pct - 50;
  const track = [...items, ...items, ...items, ...items];
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        overflow: "hidden",
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          transform: `translateX(${offset}%)`,
        }}
      >
        {track.map((item, i) => {
          const lime = i % 2 === 0;
          return (
            <div
              key={`${item}-${i}`}
              style={{
                flexShrink: 0,
                margin: "0 14px",
                padding: "14px 34px",
                borderRadius: ds.radius.pill,
                border: lime
                  ? "2px solid rgba(183,255,65,0.5)"
                  : "2px solid rgba(27,225,251,0.45)",
                background: lime ? "rgba(183,255,65,0.08)" : "rgba(27,225,251,0.08)",
                fontFamily: DS2_FAMILY,
                fontWeight: weight.bold,
                fontSize: size,
                color: lime ? ds.colors.lime : ds.colors.cyan,
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Сцена с направленным переходом (переиспользуем геометрию кита solar3). */
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

/** Гигантская считающая цифра (для «70%», «120+»). */
const GiantCount: React.FC<{
  to: number;
  start: number;
  suffix?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ to, start, suffix = "", size = 330, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const easeOut = 1 - (1 - t) * (1 - t * t); // лёгкая дуга, цифра «дозревает»
  return (
    <span
      style={{
        fontFamily: DS2_FAMILY,
        fontWeight: weight.price,
        fontSize: size,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: -10,
        color: ds.colors.lime,
        ...style,
      }}
    >
      {Math.round(to * easeOut)}
      {suffix}
    </span>
  );
};

export const ShowroomTypeLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: ds.colors.night }}>
      {/* мягкое свечение как подсветка сцены, слегка дышит */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1200px 620px at 50% 118%, rgba(183,255,65,0.10), rgba(10,15,10,0) 70%), radial-gradient(900px 500px at 92% -10%, rgba(27,225,251,0.08), rgba(10,15,10,0) 60%)",
        }}
      />
      <TopStripe />
      <BrandChip />

      {/* ── Сцена 1 (0–160): обещание  — гигантская типографика на всю ширину ── */}
      <S
        from={0}
        to={162}
        dir="up"
        style={{ position: "absolute", left: 72, right: 72, top: 250 }}
      >
        <div
          lang="th"
          style={{
            fontFamily: DS2_FAMILY,
            fontWeight: weight.regular,
            fontSize: 30,
            letterSpacing: 4,
            color: ds.colors.cyan,
            marginBottom: 26,
          }}
        >
          โซลาร์กระบี่ · ติดตั้งโดยทีมท้องถิ่น
        </div>
        <GiantKinetic
          start={10}
          size={168}
          lines={["ติดตั้ง โดย", "เพื่อนบ้าน"]}
          accentWords={["เพื่อนบ้าน"]}
        />
        <Underline start={40} width={620} />
      </S>

      {/* ── Сцена 2 (150–320): маркa-ряды + счётчик доверия ── */}
      <S
        from={148}
        to={326}
        dir="left"
        style={{ position: "absolute", left: 0, right: 0, top: 240 }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            textAlign: "center",
          }}
        >
          <div
            lang="th"
            style={{
              fontFamily: DS2_FAMILY,
              fontWeight: weight.medium,
              fontSize: 34,
              color: "rgba(247,246,243,0.72)",
              marginBottom: 10,
            }}
          >
            ระบบที่ติดตั้งแล้วทั่วกระบี่
          </div>
          <GiantCount to={120} start={162} suffix="+" size={300} />
        </div>
        <MarqueeRow
          items={["อ่าวนาง", "เกาะลันตา", "คลองท่อม", "นางเชือก", "พระน้ำทิพย์", "เมืองกระบี่"]}
          start={18}
          speed={0.053}
          dir={1}
          size={50}
          y={370}
        />
        <MarqueeRow
          items={["รับประกัน 25 ปี", "ติดตั้ง 1–3 วัน", "ไม่มีผู้รับเหมาช่วง", "ทีมช่างท้องถิ่น", "ดูแลตลอดชีพ"]}
          start={18}
          speed={0.045}
          dir={-1}
          size={50}
          y={515}
        />
      </S>

      {/* ── Сцена 3 (312–468): гигантский −70% ── */}
      <S
        from={314}
        to={470}
        dir="up"
        style={{ position: "absolute", left: 72, right: 72, top: 210 }}
      >
        <div
          lang="th"
          style={{
            fontFamily: DS2_FAMILY,
            fontWeight: weight.regular,
            fontSize: 30,
            letterSpacing: 4,
            color: ds.colors.cyan,
            marginBottom: 18,
          }}
        >
          ค่าไฟลดลงได้ถึง
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <GiantCount to={70} start={330} suffix="%" size={360} />
          <div
            lang="th"
            style={{
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 130,
              color: ds.colors.paper,
              lineHeight: 1.05,
            }}
          >
            ด้วยแดดกระบี่
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            width: 720,
            height: 4,
            borderRadius: ds.radius.pill,
            background: ds.grad,
          }}
        />
        <div
          lang="th"
          style={{
            fontFamily: DS2_MONO,
            fontWeight: 600,
            fontSize: 30,
            color: "rgba(247,246,243,0.66)",
            marginTop: 20,
          }}
        >
          คืนทุน 3–5 ปี · ประเมินฟรีด้วย AI
        </div>
      </S>

      {/* ── Сцена 4 (456–600): брендовый аутро ── */}
      <S
        from={458}
        to={602}
        dir="up"
        style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}
      >
        <GiantKinetic
          start={466}
          size={140}
          align="center"
          lines={["แดดกระบี่ เป็น ไฟของคุณ"]}
          accentWords={["ไฟของคุณ"]}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 26,
            marginTop: 60,
          }}
        >
          <div
            lang="th"
            style={{
              background: ds.colors.lime,
              color: ds.colors.ink,
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 42,
              padding: "20px 46px",
              borderRadius: ds.radius.pill,
              boxShadow: ds.shadow.pop,
            }}
          >
            รับประเมินหน้างานฟรี
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 34px",
              borderRadius: ds.radius.pill,
              border: "2px solid rgba(27,225,251,0.5)",
              color: ds.colors.cyan,
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 42,
            }}
          >
            tawanpower.vercel.app
          </div>
        </div>
      </S>

      {/* Прогресс лупа в самом низу — тонкая декоративная полоса */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          maxWidth: 1920,
          background: "rgba(247,246,243,0.08)",
        }}
      >
        <div
          style={{
            width: `${(frame / DURATION) * 100}%`,
            height: "100%",
            background: ds.grad,
          }}
        />
      </div>
      <div style={{ fontSize: 0, color: "transparent" }}>{fps > 0 ? null : null}</div>
    </AbsoluteFill>
  );
};

export const SHOWROOM_TYPE_DURATION = DURATION;
