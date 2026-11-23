import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ds, weight } from "../../design3";
import { DS2_FAMILY, DS2_MONO } from "../../loadFonts3";

/**
 * Showroom loop C — кинетический оффер «ประเมินฟรี · ติดตั้งโดยเพื่อนบ้าน».
 * Бесшовный луп 20с @30fps, 1920×1080, шоурум крутит по кругу (mute-экран).
 * Гигантская типографика на всю ширину: марки рядов встречного направления,
 * оффер-с plaто ฿0 ประเมินฟรี, аутро с плоской lime-CTA.
 * ДС 2.0: lime = действие/оффер, cyan = подсветка/kickers, градиент — полосы.
 */

const DURATION = 600;

/** Гигантская бегущая строка: слова-чипы шириной во весь экран. */
const GiantMarquee: React.FC<{
  items: string[];
  dir?: 1 | -1;
  speed?: number;
  top: number;
  size?: number;
  dim?: boolean;
}> = ({ items, dir = 1, speed = 0.05, top, size = 150, dim = false }) => {
  const frame = useCurrentFrame();
  // бесшовно: позиция = (frame*speed) mod 50%
  const raw = frame * speed;
  const pct = ((raw % 50) + 50) % 50;
  const offset = dir === 1 ? -pct : pct - 50;
  const track = [...items, ...items, ...items, ...items];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          transform: `translateX(${offset}%)`,
          opacity: dim ? 0.5 : 1,
        }}
      >
        {track.map((item, i) => {
          const lime = i % 2 === 0;
          return (
            <span
              lang="th"
              key={`${item}-${i}`}
              style={{
                display: "inline-block",
                margin: "0 0.22em",
                fontFamily: DS2_FAMILY,
                fontWeight: weight.price,
                fontSize: size,
                lineHeight: 1.16,
                color: dim ? "rgba(247,246,243,0.34)" : lime ? ds.colors.lime : ds.colors.paper,
                letterSpacing: -4,
              }}
            >
              {item}
              <span
                style={{
                  display: "inline-block",
                  width: size * 0.22,
                  height: size * 0.22,
                  margin: `0 0 0 ${size * 0.22}px`,
                  borderRadius: 999,
                  background: dim ? "rgba(247,246,243,0.2)" : lime ? ds.colors.lime : ds.colors.cyan,
                  verticalAlign: "middle",
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Сцена-переиспользование геометрии (shift+blur, направление на вход/выход). */
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

/** Words въезжают по одному (Thai без трекинга). */
const Kinetic: React.FC<{
  words: string[];
  start: number;
  size?: number;
  accent?: string[];
  align?: "left" | "center";
}> = ({ words, start, size = 150, accent = [], align = "left" }) => {
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
        lineHeight: 1.12,
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
              transform: `translateY(${interpolate(t, [0, 1], [74, 0])}px)`,
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

export const ShowroomTypeLoopC: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: ds.colors.night }}>
      {/* Подсветка сцены */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1150px 600px at 50% 116%, rgba(183,255,65,0.10), rgba(10,15,10,0) 72%), radial-gradient(820px 440px at 90% -6%, rgba(27,225,251,0.08), rgba(10,15,10,0) 62%)",
        }}
      />
      {/* Верхняя декоративная полоса + бренд-чип — живут весь луп */}
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

      {/* ── Сцена 1 (0-220): три встречныеål марки-строки на всю ширину.
           Гасим к кадру 165, плавно возвращаем в хвосте — стык бесшовный. ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [140, 168, 584, 600], [1, 0, 0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
      <GiantMarquee
        items={["ประเมินฟรี", "ไม่มีค่าเริ่มต้น", "สำรวจหน้างาน"]}
        dir={1}
        speed={0.062}
        top={180}
        size={160}
      />
      <GiantMarquee
        items={["ติดตั้งโดยเพื่อนบ้าน", "ไม่ใช่บริษัทนอก"]}
        dir={-1}
        speed={0.05}
        top={400}
        size={160}
        dim
      />
      <GiantMarquee
        items={["คืนทุน 3–5 ปี", "ประหยัด 70%"]}
        dir={1}
        speed={0.042}
        top={640}
        size={160}
      />
      </div>

      {/* ── Сцена 2 (150-380): оффер ฿0 — шаги 01/02/03 ── */}
      <S
        from={150}
        to={384}
        dir="up"
        style={{ position: "absolute", left: 72, right: 72, top: 236 }}
      >
        <div
          lang="th"
          style={{ fontFamily: DS2_FAMILY, fontWeight: weight.regular, fontSize: 30, letterSpacing: 4, color: ds.colors.cyan, marginBottom: 20 }}
        >
          เริ่มต้นง่าย ๆ แบบนี้
        </div>
        <Kinetic start={162} size={150} words={["ประเมินหน้างาน", "ฟรี 0฿"]} accent={["ฟรี 0฿"]} />
        <div style={{ marginTop: 46, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { n: "01", th: "แอดไลน์ ส่งค่าไฟล่าสุด", c: ds.colors.lime },
            { n: "02", th: "AI คำนวณระบบที่เหมาะกับบ้าน", c: ds.colors.cyan },
            { n: "03", th: "ทีมติดตั้ง 1–3 วัน แล้วประหยัดทันที", c: ds.colors.lime },
          ].map((row, i) => (
            <div
              key={row.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                background: "rgba(30,38,22,0.62)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: ds.radius.squash,
                padding: "20px 32px",
              }}
            >
              <span
                style={{ fontFamily: DS2_MONO, fontWeight: 600, fontSize: 34, color: row.c }}
              >
                {row.n}
              </span>
              <span
                lang="th"
                style={{
                  fontFamily: DS2_FAMILY,
                  fontWeight: weight.semibold,
                  fontSize: 42,
                  color: ds.colors.paper,
                }}
              >
                {row.th}
              </span>
            </div>
          ))}
        </div>
      </S>

      {/* ── Сцена 3 (372-600): аутро-CTA ── */}
      <S
        from={374}
        to={602}
        dir="up"
        style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center" }}
      >
        <Kinetic
          start={386}
          size={140}
          align="center"
          words={["รับประเมินหน้างานฟรี", "วันนี้"]}
          accent={["ฟรี", "วันนี้"]}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 26,
            marginTop: 56,
          }}
        >
          <div
            lang="th"
            style={{
              background: ds.colors.lime,
              color: ds.colors.ink,
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 44,
              padding: "22px 50px",
              borderRadius: ds.radius.pill,
              boxShadow: ds.shadow.pop,
            }}
          >
            แอดไลน์ @tawanpower
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 36px",
              borderRadius: ds.radius.pill,
              border: "2px solid rgba(27,225,251,0.5)",
              color: ds.colors.cyan,
              fontFamily: DS2_FAMILY,
              fontWeight: weight.bold,
              fontSize: 44,
            }}
          >
            tawanpower.vercel.app
          </div>
        </div>
      </S>

      {/* Прогресс лупа — бесшовная тонкая полоса */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          background: "rgba(247,246,243,0.08)",
        }}
      >
        <div style={{ width: `${(frame / DURATION) * 100}%`, height: "100%", background: ds.grad }} />
      </div>
    </AbsoluteFill>
  );
};

export const SHOWROOM_TYPE_LOOP_C_DURATION = DURATION;
