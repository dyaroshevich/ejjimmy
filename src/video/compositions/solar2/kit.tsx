import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { od, type, weight } from "../../design2";
import { SARA_FAMILY } from "../../loadFonts";

/**
 * Путь к ассету из props. Очередь завода передаёт photo относительным путём
 * ("images/ai/solar-img-02.png"), а <Img> резолвит его от origin страницы бандла —
 * получаем 404. Поэтому в рантайме прогоняем путь через staticFile().
 */
export const assetSrc = (src: string): string => {
  if (!src) return src;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  const base = typeof window === "undefined" ? "" : (window as any).remotion_staticBase;
  if (base && src.startsWith(base)) return src;
  return staticFile(src.replace(/^\/+/, ""));
};

/** Прозрачность сцены: мягкий вход/выход по краям отрезка. */
export const sceneOpacity = (frame: number, start: number, end: number, fade = 10) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Появление снизу с пружиной — общий вход для блоков. */
export const rise = (frame: number, start: number, fps: number, dist = 44) => {
  const t = spring({
    frame: frame - start,
    fps,
    config: { damping: 200, mass: 0.7 },
  });
  return {
    opacity: interpolate(t, [0, 0.35, 1], [0, 1, 1]),
    transform: `translateY(${interpolate(t, [0, 1], [dist, 0])}px)`,
  };
};

/** Фото на весь кадр с медленным наездом (Ken Burns). */
export const OdPhoto: React.FC<{
  src: string;
  from?: number;
  to?: number;
  dim?: number;
  position?: string;
  children?: React.ReactNode;
}> = ({ src, from = 1.04, to = 1.13, dim = 0, position = "center", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], {
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill>
      <Img
        src={assetSrc(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${scale})`,
        }}
      />
      {dim > 0 ? (
        <AbsoluteFill style={{ background: `rgba(15,23,42,${dim})` }} />
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

/** Затемнение снизу — текст поверх фото всегда читаем. */
export const Scrim: React.FC<{height?: number; strength?: number}> = ({
  height = 900,
  strength = 0.82,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0) 38%, rgba(15,23,42,${strength * 0.35}) 62%, rgba(15,23,42,${strength}) 100%)`,
      height,
      top: undefined,
      bottom: 0,
    }}
  />
);

/**
 * Горизонтальный скрим (16:9): тёмный слева под текстовую колонку,
 * прозрачный справа под визуал, плюс подвал под бегущую строку.
 */
export const ScrimH: React.FC<{ strength?: number }> = ({ strength = 0.88 }) => (
  <AbsoluteFill
    style={{
      background: [
        `linear-gradient(90deg, rgba(15,23,42,${strength}) 0%, rgba(15,23,42,${strength * 0.9}) 36%, rgba(15,23,42,${strength * 0.4}) 64%, rgba(15,23,42,0.12) 100%)`,
        "linear-gradient(180deg, rgba(15,23,42,0) 74%, rgba(15,23,42,0.7) 100%)",
      ].join(", "),
    }}
  />
);

/** Верхний чип бренда — Latin, поэтому трекинг разрешён. */
export const OdBrand: React.FC<{label?: string; start?: number; style?: React.CSSProperties}> = ({
  label = "TAWAN POWER",
  start = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = rise(frame, start, fps, -18);
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...animStyle,
        ...style,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: od.radius.pill,
          background: od.colors.primary,
          boxShadow: od.shadow.md,
        }}
      />
      <div
        style={{
          fontFamily: SARA_FAMILY,
          fontWeight: weight.bold,
          fontSize: type.kicker,
          letterSpacing: 2.4,
          color: od.colors.white,
          textShadow: "0 2px 12px rgba(15,23,42,0.5)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Кикер: мелкая строка над заголовком, на тёмной подложке — иначе теряется на фото. */
export const OdKicker: React.FC<{
  children: React.ReactNode;
  start: number;
  color?: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ children, start, color = od.colors.primary, align = "left", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = rise(frame, start, fps, 24);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: align === "center" ? "center" : "flex-start",
        marginBottom: 20,
        ...animStyle,
        ...style,
      }}
    >
      <div
        lang="th"
        style={{
          fontFamily: SARA_FAMILY,
          fontWeight: weight.bold,
          fontSize: type.kicker,
          letterSpacing: 1.2,
          color,
          background: "rgba(15,23,42,0.55)",
          borderRadius: od.radius.pill,
          padding: "10px 22px",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Заголовок. Thai не трекаем (DESIGN.md: letter-spacing ломает тон-марки). */
export const OdTitle: React.FC<{
  children: React.ReactNode;
  start: number;
  size?: number;
  color?: string;
  align?: "left" | "center";
  maxWidth?: number;
}> = ({
  children,
  start,
  size = type.display,
  color = od.colors.white,
  align = "left",
  maxWidth = 940,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = rise(frame, start, fps, 40);
  return (
    <div
      lang="th"
      style={{
        fontFamily: SARA_FAMILY,
        fontWeight: weight.extrabold,
        fontSize: size,
        lineHeight: 1.14,
        color,
        textAlign: align,
        maxWidth,
        textShadow: "0 6px 30px rgba(15,23,42,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Подзаголовок под заголовком. */
export const OdSub: React.FC<{
  children: React.ReactNode;
  start: number;
  color?: string;
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({ children, start, color = "rgba(255,255,255,0.88)", maxWidth = 900, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = rise(frame, start, fps, 30);
  return (
    <div
      lang="th"
      style={{
        fontFamily: SARA_FAMILY,
        fontWeight: weight.medium,
        fontSize: type.body,
        lineHeight: 1.5,
        color,
        marginTop: 24,
        maxWidth,
        textShadow: "0 2px 16px rgba(15,23,42,0.4)",
        ...animStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Белая карточка дизайн-2.0 (radius card + soft shadow). */
export const OdCard: React.FC<{
  children: React.ReactNode;
  start: number;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, start, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = rise(frame, start + delay, fps, 46);
  return (
    <div
      style={{
        background: od.colors.card,
        borderRadius: od.radius.card,
        boxShadow: od.shadow.md,
        border: `2px solid ${od.colors.border}`,
        padding: "36px 40px",
        ...anim,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Число, которое доезжает до значения — для стат-карточек и хайлайтов. */
export const OdCount: React.FC<{
  to: number;
  from?: number;
  start: number;
  dur?: number;
  suffix?: string;
  decimals?: number;
  sep?: boolean;
  style?: React.CSSProperties;
}> = ({ to, from = 0, start, dur = 34, suffix = "", decimals = 0, sep = false, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const val = from + (to - from) * p;
  const text =
    decimals > 0
      ? val.toFixed(decimals)
      : sep
        ? Math.round(val).toLocaleString("en-US")
        : Math.round(val).toString();
  return (
    <span style={style}>
      {text}
      {suffix}
    </span>
  );
};

/** Стат-карточка: крупная цифра + подпись. count — цифра доезжает счётчиком. */
export const OdStat: React.FC<{
  value: string;
  label: string;
  start: number;
  delay?: number;
  width?: number;
  tone?: "light" | "dark";
  count?: number;
  countSuffix?: string;
  countDecimals?: number;
  countSep?: boolean;
  size?: number;
}> = ({
  value,
  label,
  start,
  delay = 0,
  width = 300,
  tone = "light",
  count,
  countSuffix,
  countDecimals,
  countSep,
  size = type.stat,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = rise(frame, start + delay, fps, 40);
  const dark = tone === "dark";
  return (
    <div
      style={{
        width,
        background: dark ? "rgba(15,23,42,0.62)" : od.colors.card,
        backdropFilter: dark ? "blur(12px)" : undefined,
        borderRadius: od.radius.card,
        border: `2px solid ${dark ? "rgba(255,255,255,0.18)" : od.colors.border}`,
        boxShadow: dark ? od.shadow.lg : od.shadow.md,
        padding: "30px 28px",
        ...anim,
      }}
    >
      <div
        style={{
          width: 56,
          height: 6,
          borderRadius: od.radius.pill,
          background: od.colors.primary,
          marginBottom: 20,
        }}
      />
      <div
        lang="th"
        style={{
          fontFamily: SARA_FAMILY,
          fontWeight: weight.extrabold,
          fontSize: size,
          lineHeight: 1.05,
          color: dark ? od.colors.white : od.colors.fg,
        }}
      >
        {count !== undefined ? (
          <OdCount
            to={count}
            suffix={countSuffix ?? ""}
            decimals={countDecimals ?? 0}
            sep={countSep ?? false}
            start={start + delay + 4}
          />
        ) : (
          value
        )}
      </div>
      <div
        lang="th"
        style={{
          fontFamily: SARA_FAMILY,
          fontWeight: weight.medium,
          fontSize: type.label,
          lineHeight: 1.4,
          marginTop: 12,
          color: dark ? "rgba(255,255,255,0.82)" : od.colors.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Список фактов: белый блок с буллетами. */
export const OdList: React.FC<{
  items: string[];
  start: number;
  title?: string;
  maxWidth?: number;
}> = ({ items, start, title, maxWidth = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = rise(frame, start, fps, 44);
  return (
    <div
      style={{
        maxWidth,
        background: od.colors.card,
        borderRadius: od.radius.luxe,
        border: `2px solid ${od.colors.border}`,
        boxShadow: od.shadow.lg,
        padding: "40px 44px",
        ...anim,
      }}
    >
      {title ? (
        <div
          lang="th"
          style={{
            fontFamily: SARA_FAMILY,
            fontWeight: weight.extrabold,
            fontSize: type.h3,
            color: od.colors.fg,
            marginBottom: 24,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((item, i) => {
          const rowAnim = rise(frame, start + 8 + i * 6, fps, 22);
          return (
            <div
              key={item}
              style={{ display: "flex", gap: 20, alignItems: "flex-start", ...rowAnim }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: od.radius.pill,
                  background: od.colors.cream,
                  color: od.colors.primaryInk,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: weight.bold,
                }}
              >
                ✓
              </div>
              <div
                lang="th"
                style={{
                  fontFamily: SARA_FAMILY,
                  fontWeight: weight.semibold,
                  fontSize: type.body,
                  lineHeight: 1.45,
                  color: od.colors.fg,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Финальный CTA-блок. */
export const OdCta: React.FC<{
  title: string;
  sub?: string;
  url?: string;
  start: number;
  style?: React.CSSProperties;
}> = ({ title, sub, url = "tawanpower.vercel.app", start, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = rise(frame, start, fps, 56);
  return (
    <div
      style={{
        background: "transparent",
        borderRadius: od.radius.luxe,
        boxShadow: "none",
        border: "none",
        padding: "40px 44px",
        ...anim,
        ...style,
      }}
    >
      <div
        lang="th"
        style={{
          fontFamily: SARA_FAMILY,
          fontWeight: weight.extrabold,
          fontSize: 64,
          lineHeight: 1.2,
          color: od.colors.white,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          lang="th"
          style={{
            fontFamily: SARA_FAMILY,
            fontWeight: weight.medium,
            fontSize: 32,
            color: od.colors.white,
            marginTop: 20,
            textAlign: "center",
          }}
        >
          {sub}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginTop: 36,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            transform: `scale(${1 + 0.025 * Math.sin(Math.max(0, frame - start) / 14)})`,
            background: `linear-gradient(135deg, ${od.colors.primary}, ${od.colors.primaryDeep})`,
            color: od.colors.white,
            fontFamily: SARA_FAMILY,
            fontWeight: weight.bold,
            fontSize: 24,
            padding: "24px 48px",
            borderRadius: od.radius.pill,
            boxShadow: od.shadow.md,
          }}
        >
          คุยกับเราทาง LINE
          {/* блик, периодически пробегающий по кнопке */}
          <div
            style={{
              position: "absolute",
              top: -20,
              bottom: -20,
              width: 90,
              left: `${(Math.max(0, frame - start - 24) * 3.2) % 260 - 70}px`,
              background:
                "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0) 100%)",
              transform: "rotate(8deg)",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: SARA_FAMILY,
            fontWeight: weight.bold,
            fontSize: type.label,
            color: od.colors.primaryInk,
            letterSpacing: 0.6,
          }}
        >
          {url}
        </div>
      </div>
    </div>
  );
};

/** Тонкий прогресс ролика внизу кадра. */
export const OdProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = Math.min(1, frame / durationInFrames);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 8,
        background: "rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${od.colors.primary}, ${od.colors.secondary})`,
        }}
      />
    </div>
  );
};

/** Плашка бренда в правом нижнем углу кадра. */
export const OdWatermark: React.FC<{start?: number; style?: React.CSSProperties}> = ({ start = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = rise(frame, start, fps, 18);
  return (
    <div
      style={{
        position: "absolute",
        right: 64,
        top: 70,
        padding: "12px 22px",
        borderRadius: od.radius.pill,
        background: "rgba(255,255,255,0.14)",
        border: "2px solid rgba(255,255,255,0.28)",
        fontFamily: SARA_FAMILY,
        fontWeight: weight.bold,
        fontSize: 21,
        letterSpacing: 1.6,
        color: od.colors.white,
        ...anim,
        ...style,
      }}
    >
      tawanpower
    </div>
  );
};

/**
 * Сцена с направленным переходом: вход сдвиг+блюр, выход сдвиг+блюр.
 * Заменяет голый sceneOpacity — слои больше не «исчезают в никуда».
 */
export const Scene: React.FC<{
  from: number;
  to: number;
  dir?: "up" | "down" | "left" | "right";
  fade?: number;
  blur?: number;
  shift?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ from, to, dir = "up", fade = 13, blur = 16, shift = 70, style, children }) => {
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
  const off = sign * (1 - inP) * shift - sign * (1 - outP) * shift * 0.55;
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

/** «Шторка» — прямоугольное появление через clip-path. */
export const wipeStyle = (
  frame: number,
  start: number,
  dur = 14,
  dir: "left" | "right" | "up" | "down" = "left"
): React.CSSProperties => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const v = (1 - p) * 101;
  const clip =
    dir === "left"
      ? `inset(0 ${v}% 0 0)`
      : dir === "right"
        ? `inset(0 0 0 ${v}%)`
        : dir === "up"
          ? `inset(${v}% 0 0 0)`
          : `inset(0 0 ${v}% 0)`;
  return { clipPath: clip, WebkitClipPath: clip } as React.CSSProperties;
};

/**
 * Кинетический заголовок: слова въезжают по одному с пружиной и блюром.
 * Thai не трекаем — слова раздаём заранее пробелами (токены DESIGN.md).
 */
export const OdKinetic: React.FC<{
  lines: string[];
  start: number;
  step?: number;
  size?: number;
  color?: string;
  align?: "left" | "center";
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  start,
  step = 6,
  size = type.display,
  color = od.colors.white,
  align = "left",
  maxWidth = 960,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  return (
    <div
      lang="th"
      style={{
        fontFamily: SARA_FAMILY,
        fontWeight: weight.extrabold,
        fontSize: size,
        lineHeight: 1.16,
        color,
        textAlign: align,
        maxWidth,
        textShadow: "0 6px 30px rgba(15,23,42,0.45)",
        ...style,
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
              gap: "0 0.32em",
              justifyContent: align === "center" ? "center" : "flex-start",
            }}
          >
            {words.map((word) => {
              const i = idx++;
              const t = spring({
                frame: frame - start - i * step,
                fps,
                config: { damping: 13, mass: 0.55 },
              });
              return (
                <span
                  key={`${i}-${word}`}
                  style={{
                    display: "inline-block",
                    opacity: interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
                    transform: `translateY(${interpolate(t, [0, 1], [46, 0])}px) scale(${interpolate(
                      t,
                      [0, 1],
                      [0.9, 1]
                    )})`,
                    filter: t < 0.95 ? `blur(${interpolate(t, [0, 1], [10, 0])}px)` : undefined,
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

export type BrollShot = {
  src: string;
  kind?: "img" | "video";
  position?: string;
  kbFrom?: number;
  kbTo?: number;
  pan?: number;
};

/**
 * Фоновая лента кадров: Ken Burns внутри кадра, между кадрами — блюр-кроссфейды
 * и «шторки» с чередованием направления. Видео-клипы играют со своего начала
 * (Sequence layout="none" — время клипа относительно старта кадра ленты).
 */
export const OdBroll: React.FC<{
  shots: BrollShot[];
  cuts: number[];
  trans?: number;
  dim?: number;
}> = ({ shots, cuts, trans = 14, dim = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // страховка: границ должно быть на одну больше, чем кадров ленты
  const xs =
    cuts.length === shots.length + 1
      ? cuts
      : shots.map((_, i) => Math.round((i * durationInFrames) / shots.length)).concat(durationInFrames);
  return (
    <AbsoluteFill style={{ backgroundColor: od.colors.bg, overflow: "hidden" }}>
      {shots.map((shot, i) => {
        const s = xs[i];
        const e = xs[i + 1];
        if (frame < s - 2 || frame > e + 2) return null;
        const first = i === 0;
        const last = i === shots.length - 1;
        const inP = first
          ? 1
          : interpolate(frame, [s - trans * 0.4, s + trans * 0.6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
        const outP = last
          ? 1
          : interpolate(frame, [e - trans * 0.7, e], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.quad),
            });
        const kbFrom = shot.kbFrom ?? (i % 2 === 0 ? 1.05 : 1.13);
        const kbTo = shot.kbTo ?? (i % 2 === 0 ? 1.14 : 1.04);
        const scale = interpolate(frame, [s, e], [kbFrom, kbTo], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        });
        const panPx =
          (shot.pan ?? (i % 2 === 0 ? -28 : 28)) *
          interpolate(frame, [s, e], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        const media =
          shot.kind === "video" ? (
            <Sequence from={s} durationInFrames={Math.max(2, e - s)} layout="none">
              <OffthreadVideo
                src={assetSrc(shot.src)}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: shot.position ?? "center",
                }}
              />
            </Sequence>
          ) : (
            <Img
              src={assetSrc(shot.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: shot.position ?? "center",
              }}
            />
          );
        return (
          <AbsoluteFill
            key={shot.src + i}
            style={{
              opacity: inP * outP,
              filter: !first && inP < 1 ? `blur(${(1 - inP) * 22}px)` : undefined,
              ...(!first && inP < 1
                ? wipeStyle(frame, s - trans * 0.4, trans, i % 2 === 0 ? "left" : "up")
                : {}),
            }}
          >
            <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${panPx}px)` }}>
              {media}
            </AbsoluteFill>
            {dim > 0 ? <AbsoluteFill style={{ background: `rgba(15,23,42,${dim})` }} /> : null}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Бегущая строка-теги внизу/верху кадра — постоянное движение. */
export const OdTicker: React.FC<{
  items: string[];
  start?: number;
  speed?: number;
  bottom?: number;
  top?: number;
  style?: React.CSSProperties;
}> = ({ items, start = 30, speed = 0.15, bottom = 28, top, style }) => {
  const frame = useCurrentFrame();
  const pct = ((Math.max(0, frame - start) * speed) % 50).toFixed(3);
  const track = [...items, ...items];
  const mask =
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom,
        overflow: "hidden",
        maskImage: mask,
        WebkitMaskImage: mask,
        ...style,
      }}
    >
      <div style={{ display: "flex", width: "max-content", transform: `translateX(-${pct}%)` }}>
        {track.map((item, i) => (
          <div
            key={`${item}-${i}`}
            style={{
              flexShrink: 0,
              margin: "0 10px",
              padding: "10px 24px",
              borderRadius: od.radius.pill,
              border: "2px solid rgba(255,255,255,0.28)",
              background: "rgba(15,23,42,0.5)",
              fontFamily: SARA_FAMILY,
              fontWeight: weight.bold,
              fontSize: 24,
              color: "rgba(255,255,255,0.92)",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Точки-прогресс по сценам справа: активная сцена вытягивается. */
export const OdDots: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 24,
        top: "40%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "center",
      }}
    >
      {cuts.slice(0, -1).map((s, i) => {
        const active = frame >= s && frame < cuts[i + 1];
        const done = frame >= cuts[i + 1];
        return (
          <div
            key={s}
            style={{
              width: active ? 14 : 10,
              height: active ? 36 : 10,
              borderRadius: od.radius.pill,
              background: active
                ? od.colors.primary
                : done
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.32)",
              boxShadow: active ? od.shadow.md : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
