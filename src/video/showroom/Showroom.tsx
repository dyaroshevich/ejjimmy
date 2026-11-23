import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadK2D } from '@remotion/google-fonts/K2D';
import { loadFont as loadNotoSansThai } from '@remotion/google-fonts/NotoSansThai';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSyne } from '@remotion/google-fonts/Syne';
import { loadFont as loadSarabun } from '@remotion/google-fonts/Sarabun';
import cuesData from './cues.json';

/**
 * Showroom — параметрическая витрина Solar Krabi по мастер-плану.
 *
 * Одна композиция на формат (9:16 Reel / 16:9 Showroom TV) обслуживает все
 * темы и обе дизайн-системы: `topic` выбирает контент и тайминги субтитров
 * из cues.json, `theme` — оформление. Длительность приходит из calculateMetadata
 * (считается от реальной озвучки), поэтому кадры всегда совпадают с голосом.
 *
 *  - DS 2.0 (`ds2`): светлый фон, squircle-карточки, lime #B7FF41 / cyan #1BE1FB,
 *    K2D × Noto Sans Thai, плоский lime-CTA.
 *  - Dark OPS (`ops`): #080C18 / surface #111827, volt lime #A3C66A, grid,
 *    scanlines, grain, corner-cut, hazard-полоски, Syne × JetBrains Mono × Noto.
 *
 * Субтитры — новые тайские фразы из THAI-RECORD, каждая привязана к своему
 * куску дорожки (см. tools/vo_lines.py), шрифт Noto Sans Thai.
 */

const k2d = loadK2D('normal', { subsets: ['latin', 'latin-ext'], weights: ['400', '600', '700', '800'] });
const thai = loadNotoSansThai('normal', { subsets: ['thai', 'latin'], weights: ['400', '500', '600', '700'] });
const mono = loadJetBrainsMono('normal', { subsets: ['latin'], weights: ['400', '600'] });
const syne = loadSyne('normal', { subsets: ['latin'], weights: ['600', '700', '800'] });
// Сайт Solar набран Sarabun — держим тот же шрифт в роликах.
const sarabun = loadSarabun('normal', { subsets: ['thai', 'latin'], weights: ['400', '600', '700', '800'] });

const SANS_DS2 = `${sarabun.fontFamily}, ${thai.fontFamily}, system-ui, sans-serif`;
const SANS_OPS = `${syne.fontFamily}, ${thai.fontFamily}, system-ui, sans-serif`;
const MONO_OPS = `${mono.fontFamily}, ${thai.fontFamily}, monospace`;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

type Theme = 'ds2' | 'ops';

/** Ключи cues.json пишутся с префиксом ниши (`ev-…` / `solar-…`), а props.topic — без. */
const resolveKey = (t: string): string =>
  Object.keys(cuesData).find((k) => k === t || k.endsWith(`-${t}`)) ??
  Object.keys(cuesData)[0];

type TopicCfg = {
  kicker: string;
  header: string[];
  stat?: { value: string; label: string };
  price?: string;
  cta: string;
  media: string[];
};

const TOPICS: Record<string, TopicCfg> = {
  'business-roi': {
    kicker: 'SOLAR FOR BUSINESS',
    header: ['โซลาร์สำหรับธุรกิจ', 'คืนทุน 3-4 ปี'],
    stat: { value: '50%', label: 'หักภาษี BOI ได้สูงสุด' },
    price: 'มีทางเลือก PPA',
    cta: 'ประเมินหน้างานฟรี',
    media: ['images/broll/resort-panels.jpg', 'images/crew/crew-inverter.jpg', 'images/broll/shop-day.jpg'],
  },
  'family-savings': {
    kicker: 'SOLAR FOR HOME',
    header: ['ค่าไฟแพงขึ้นทุกปี', 'ติดโซลาร์ที่บ้าน'],
    stat: { value: '70%', label: 'ประหยัดค่าไฟได้' },
    price: 'คืนทุน 3-5 ปี',
    cta: 'ประเมินด้วย AI ฟรี',
    media: ['images/broll/house-water.jpg', 'images/broll/villa-sunset.jpg', 'images/broll/night-villa.jpg'],
  },
  'battery-charge': {
    kicker: 'SOLAR + BATTERY',
    header: ['แบตเตอรี่สำรองไฟ', 'ไฟดับก็ยังสบาย'],
    stat: { value: '10 kWh', label: 'เก็บไฟใช้กลางคืน' },
    price: 'ติดตั้งวันเดียว',
    cta: 'ประเมินฟรีที่กระบี่',
    media: ['images/broll/battery-wall.jpg', 'images/crew/crew-inverter.jpg', 'images/broll/night-villa.jpg'],
  },
  'product-demo': {
    kicker: 'PRODUCT DEMO',
    header: ['อินเวอร์เตอร์ไฮบริด', 'จ่ายไฟทั้งหลัง'],
    stat: { value: '10 kW', label: 'Deye · GoodWe · Sigenergy' },
    price: 'ของจริงที่โชว์รูม',
    cta: 'นัดชมฟรี',
    media: ['images/crew/crew-inverter.jpg', 'images/crew/crew-showroom.jpg', 'images/broll/shop-day.jpg'],
  },
};

type ThemeCfg = {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  muted: string;
  accent: string;
  secondary: string;
  radius: number;
  display: string;
  mono: string;
  light: boolean;
};

const THEMES: Record<Theme, ThemeCfg> = {
  // Светлая тема — токены сайта (TawanPower/src/app/globals.css):
  // primary #ff8a00, primary-deep #ea580c, surface #ffffff / #f8fafc, текст #0f172a.
  // Раньше здесь стоял lime/cyan из Remotion-лаборатории.
  ds2: {
    bg: '#F8FAFC',
    card: 'rgba(255,255,255,0.96)',
    cardBorder: '#E2E8F0',
    text: '#0F172A',
    muted: '#475569',
    accent: '#FF8A00',
    secondary: '#EA580C',
    radius: 16,
    display: SANS_DS2,
    mono: MONO_OPS,
    light: true,
  },
  ops: {
    bg: '#080C18',
    card: 'rgba(17,24,39,0.86)',
    cardBorder: 'rgba(163,198,106,0.35)',
    text: '#E7F0DA',
    muted: 'rgba(231,240,218,0.62)',
    accent: '#A3C66A',
    secondary: '#A3C66A',
    radius: 6,
    display: SANS_OPS,
    mono: MONO_OPS,
    light: false,
  },
};

/* ------------------------------------------------------------------ */
/* Декор темы                                                          */
/* ------------------------------------------------------------------ */

const OpsOrnament: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {/* сетка */}
    <AbsoluteFill
      style={{
        opacity: 0.22,
        backgroundImage:
          'linear-gradient(rgba(163,198,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(163,198,106,0.5) 1px, transparent 1px)',
        backgroundSize: '96px 96px',
      }}
    />
    {/* scanlines */}
    <AbsoluteFill
      style={{
        opacity: 0.16,
        backgroundImage:
          'repeating-linear-gradient(180deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 4px)',
      }}
    />
    {/* hazard-полоски по нижнему краю */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 14,
        opacity: 0.8,
        backgroundImage:
          'repeating-linear-gradient(45deg, #A3C66A 0px, #A3C66A 14px, transparent 14px, transparent 28px)',
      }}
    />
    {/* лёгкое зерно */}
    <AbsoluteFill
      style={{
        opacity: 0.10,
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
      }}
    />
  </AbsoluteFill>
);

const Ds2Ornament: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 12% 0%, rgba(255,138,0,0.16) 0%, rgba(255,138,0,0) 60%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 62%)',
      }}
    />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Медиа-фон со сменой кадров                                          */
/* ------------------------------------------------------------------ */

const MediaWall: React.FC<{ media: string[]; theme: ThemeCfg; total: number }> = ({
  media,
  theme,
  total,
}) => {
  const frame = useCurrentFrame();
  const per = Math.ceil(total / media.length);
  return (
    <AbsoluteFill>
      {media.map((src, i) => {
        const from = i * per;
        const to = from + per;
        if (frame < from - 15 || frame > to + 15) return null;
        const local = frame - from;
        const fadeIn = interpolate(local, [-15, 6], [0, 1], clamp);
        const fadeOut = interpolate(frame, [to - 10, to + 6], [1, 0], clamp);
        const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
        const scale = interpolate(local, [0, per], [1.04, 1.14], { ...clamp });
        return (
          <AbsoluteFill key={src} style={{ opacity }}>
            <Img
              src={staticFile(src)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${scale})`,
              }}
            />
          </AbsoluteFill>
        );
      })}
      {/* затемнение под текст: под светлой темой сильнее, чтобы карточки читались */}
      <AbsoluteFill
        style={{
          background: theme.light
            ? 'linear-gradient(180deg, rgba(243,247,238,0.72) 0%, rgba(243,247,238,0.42) 45%, rgba(243,247,238,0.86) 100%)'
            : 'linear-gradient(180deg, rgba(8,12,24,0.82) 0%, rgba(8,12,24,0.55) 45%, rgba(8,12,24,0.92) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Сцена                                                               */
/* ------------------------------------------------------------------ */

export type ShowroomProps = {
  topic: string;
  theme: Theme;
};

export const Showroom: React.FC<ShowroomProps> = ({ topic, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const t = THEMES[theme];
  const cfg = TOPICS[topic] ?? TOPICS['business-roi'];
  const data = (cuesData as Record<string, { duration: number; frames: number; cues: { text: string; start: number; end: number }[] }>)[resolveKey(topic)];
  const cues = data?.cues ?? [];
  const total = Math.round((data?.duration ?? 15) * fps);

  const seconds = frame / fps;
  const active = cues.find((c) => seconds >= c.start - 0.08 && seconds <= c.end + 0.12) ?? null;
  const activeIndex = cues.findIndex((c) => c === active);

  const intro = interpolate(frame, [4, 26], [0, 1], { ...clamp });
  const headerOut = interpolate(seconds, [total / fps - 2.2, total / fps - 1.4], [1, 0], clamp);
  const ctaIn = interpolate(seconds, [total / fps - 3.2, total / fps - 2.4], [0, 1], clamp);

  const pad = portrait ? 72 : 96;
  const headerSize = portrait ? (theme === 'ops' ? 108 : 112) : 96;
  const cueSize = portrait ? 54 : 46;

  return (
    <AbsoluteFill style={{ background: t.bg, overflow: 'hidden' }}>
      <MediaWall media={cfg.media} theme={t} total={total} />
      {theme === 'ops' ? <OpsOrnament /> : <Ds2Ornament />}

      {/* ── верх: кикер + заголовок ── */}
      <div
        style={{
          position: 'absolute',
          top: pad,
          left: pad,
          right: pad,
          opacity: intro * headerOut,
          transform: `translateY(${(1 - intro) * 40}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: theme === 'ops' ? '10px 22px' : '12px 26px',
            borderRadius: theme === 'ops' ? 4 : 999,
            background: theme === 'ops' ? 'rgba(163,198,106,0.14)' : t.accent,
            border: theme === 'ops' ? '1px solid rgba(163,198,106,0.5)' : 'none',
            clipPath: theme === 'ops' ? 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' : undefined,
            fontFamily: t.mono,
            fontSize: portrait ? 26 : 22,
            fontWeight: 600,
            letterSpacing: '0.24em',
            color: theme === 'ops' ? t.accent : '#FFFFFF',
          }}
        >
          {cfg.kicker}
        </div>

        <div style={{ marginTop: portrait ? 26 : 20 }}>
          {cfg.header.map((line, i) => (
            <div
              key={line}
              style={{
                fontFamily: t.display,
                fontWeight: theme === 'ops' ? 800 : 800,
                fontSize: headerSize * (i === 1 ? 1.18 : 1),
                // Тайские надстрочные/подстрочные знаки выше латиницы: при 1.04
                // верх второй строки уходит под белое свечение первой и срезается.
                lineHeight: 1.26,
                color: i === 1 ? t.accent : t.text,
                textShadow: theme === 'ops' ? '0 6px 30px rgba(0,0,0,0.6)' : '0 2px 18px rgba(255,255,255,0.65)',
                opacity: interpolate(frame, [10 + i * 7, 30 + i * 7], [0, 1], clamp),
                transform: `translateY(${interpolate(frame, [10 + i * 7, 32 + i * 7], [26, 0], { ...clamp, easing: ease })}px)`,
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {(cfg.stat || cfg.price) && (
          <div
            style={{
              marginTop: portrait ? 30 : 24,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              opacity: interpolate(frame, [34, 54], [0, 1], clamp),
            }}
          >
            {cfg.stat && (
              <div
                style={{
                  padding: theme === 'ops' ? '16px 26px' : '18px 30px',
                  borderRadius: t.radius,
                  background: t.card,
                  border: `1px solid ${t.cardBorder}`,
                  clipPath:
                    theme === 'ops'
                      ? 'polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)'
                      : undefined,
                  boxShadow: theme === 'ops' ? 'none' : '0 18px 50px rgba(11,18,32,0.14)',
                }}
              >
                <div
                  style={{
                    fontFamily: t.display,
                    fontWeight: 800,
                    fontSize: portrait ? 76 : 64,
                    lineHeight: 1,
                    color: theme === 'ops' ? t.accent : '#0B1220',
                  }}
                >
                  {cfg.stat.value}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: t.display,
                    fontSize: portrait ? 26 : 22,
                    fontWeight: 600,
                    color: t.muted,
                  }}
                >
                  {cfg.stat.label}
                </div>
              </div>
            )}
            {cfg.price && (
              <div
                style={{
                  padding: theme === 'ops' ? '16px 26px' : '18px 30px',
                  borderRadius: t.radius,
                  background: theme === 'ops' ? 'rgba(163,198,106,0.12)' : '#0B1220',
                  border: theme === 'ops' ? '1px solid rgba(163,198,106,0.5)' : 'none',
                  clipPath:
                    theme === 'ops'
                      ? 'polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)'
                      : undefined,
                  fontFamily: t.display,
                  fontWeight: 700,
                  fontSize: portrait ? 40 : 34,
                  color: theme === 'ops' ? t.accent : t.accent,
                }}
              >
                {cfg.price}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── низ: субтитр текущей фразы + CTA ── */}
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          bottom: portrait ? 150 : 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <div
          style={{
            minHeight: cueSize * 2.6,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          {active ? (
            <div
              key={activeIndex}
              style={{
                padding: portrait ? '24px 34px' : '20px 30px',
                borderRadius: t.radius,
                background: t.card,
                border: `1px solid ${t.cardBorder}`,
                clipPath:
                  theme === 'ops'
                    ? 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
                    : undefined,
                boxShadow: theme === 'ops' ? 'none' : '0 22px 60px rgba(11,18,32,0.18)',
                maxWidth: '100%',
              }}
            >
              <div
                style={{
                  fontFamily: t.display,
                  fontWeight: 700,
                  fontSize: cueSize,
                  lineHeight: 1.34,
                  color: t.text,
                }}
              >
                {active.text}
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 24}px)`,
          }}
        >
          <div
            style={{
              padding: portrait ? '22px 44px' : '18px 40px',
              borderRadius: theme === 'ops' ? 4 : 999,
              background: theme === 'ops' ? t.accent : t.accent,
              color: theme === 'ops' ? '#08110A' : '#FFFFFF',
              fontFamily: t.display,
              fontWeight: 800,
              fontSize: portrait ? 40 : 34,
              clipPath: theme === 'ops' ? 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)' : undefined,
              boxShadow: theme === 'ops' ? 'none' : '0 16px 40px rgba(255,138,0,0.32)',
            }}
          >
            {cfg.cta}
          </div>
          <div
            style={{
              fontFamily: t.mono,
              fontSize: portrait ? 26 : 22,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: theme === 'ops' ? t.accent : '#0B1220',
            }}
          >
            tawanpower.vercel.app · /
          </div>
        </div>
      </div>

      {/* прогресс речи */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: theme === 'ops' ? 10 : 8,
          width: `${(frame / Math.max(1, total)) * 100}%`,
          background: t.accent,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};

export const SHOWROOM_TOPICS = Object.keys(TOPICS);
export const SHOWROOM_FRAMES: Record<string, number> = Object.fromEntries(
  Object.entries(cuesData as Record<string, { frames: number }>).map(
    ([k, v]) => [k.replace(/^(ev|solar)-/, ''), v.frames],
  ),
);
