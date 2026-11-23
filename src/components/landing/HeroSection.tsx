'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { heroCopy } from '@/lib/hero-variants';


type Photo = { src: string; cap: string };

// Four frames × three photos, the pool the approved sheet's carousel script reads. That
// script never runs — an unclosed `play()` makes the mock's whole inline <script> a syntax
// error, so the approved file renders an empty collage even in its own preview. The markup,
// the `.frame`/`.slide` rules and both intervals are the sheet's; only the crossfade is
// rebuilt for React: three stacked layers per frame instead of swapping `src` mid-fade.
const POOLS: { cls: string; photos: Photo[] }[] = [
  { cls: 'f1', photos: [
    { src: '/images/crew/roof-1103.jpg', cap: 'cap1' },
    { src: '/images/crew/crew-shirt.jpg', cap: 'cap2' },
    { src: '/images/crew/crew-portal.jpg', cap: 'cap3' }] },
  { cls: 'f2', photos: [
    { src: '/images/crew/batt-0584.jpg', cap: 'cap4' },
    { src: '/images/crew/crew-inverter.jpg', cap: 'cap5' },
    { src: '/images/crew/crew-showroom.jpg', cap: 'cap6' }] },
  { cls: 'f3', photos: [
    { src: '/images/crew/crew-smile.jpg', cap: 'cap7' },
    { src: '/images/crew/sigen-batt.webp', cap: 'cap8' },
    { src: '/images/crew/roof-1904.jpg', cap: 'cap9' }] },
  { cls: 'f4', photos: [
    { src: '/images/crew/eng-1518.jpg', cap: 'cap10' },
    { src: '/images/crew/crew-paint.jpg', cap: 'cap11' },
    { src: '/images/crew/crew-shirtwide.jpg', cap: 'cap12' }] },
];

const SLIDES = POOLS.flatMap((p) => p.photos);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// No `sizes` anywhere in this file: with it, next/image emits a 256..3840w srcset and puts
// `w=3840` in `src`. Both galleries are hidden at the other breakpoint, and a hidden image
// resolves its candidate against no box, so Chrome took the 3840 fallback and the dev
// optimizer failed it. Fixed width/height caps the request at the CSS box x3.
function Frame({ cls, photos, every, reduced }: { cls: string; photos: Photo[]; every: number; reduced: boolean }) {
  const t = useTranslations('hero');
  const [idx, setIdx] = useState(0);
  const [swap, setSwap] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % photos.length), every);
    return () => clearInterval(id);
  }, [reduced, every, photos.length]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSwap(true);
    const id = setTimeout(() => setSwap(false), 380);
    return () => clearTimeout(id);
  }, [idx]);

  return (
    <figure className={`frame ${cls}`}>
      {photos.map((p, i) => (
        <Image
          key={p.src}
          src={p.src}
          alt=""
          width={300}
          height={300}
          className={i === idx ? 'on' : undefined}
          loading={i === 0 ? undefined : 'lazy'}
        />
      ))}
      <figcaption className={swap ? 'swap' : undefined}>{t(photos[idx].cap)}</figcaption>
    </figure>
  );
}

export default function HeroSection({ heroVariant, stampLayout = '3' }: { heroVariant?: string; stampLayout?: '1' | '2' | '3' }) {
  const t = useTranslations('hero');
  const locale = useLocale();
  // Thai + English get the A/B copy; every other locale keeps the approved messages strings.
  const v = heroCopy(heroVariant, locale);
  const reduced = useReducedMotion();
  const strip = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [cur, setCur] = useState(0);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    if (reduced || !onScreen) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      setCur((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [reduced, onScreen]);

  // `scrollIntoView` walks every ancestor scroller and `block: 'nearest'` only spares the ones
  // that already see the node — so once the visitor had scrolled past the hero, the 5-second
  // advance pulled the PAGE back up to the strip ("дрыгается, бывало перелистывало в начало").
  // Writing scrollLeft moves this one container and nothing else; the epsilon keeps the
  // onScroll → setCur → effect loop from fighting a drag that has already settled.
  useEffect(() => {
    const box = strip.current;
    const el = box?.children[cur] as HTMLElement | undefined;
    if (!box || !el) return;
    const target = Math.max(0, el.offsetLeft - (box.clientWidth - el.clientWidth) / 2);
    if (Math.abs(box.scrollLeft - target) < 2) return;
    box.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  }, [cur, reduced]);

  useEffect(() => {
    const box = strip.current;
    if (!box) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0 });
    io.observe(box);
    return () => io.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const box = strip.current;
    if (!box) return;
    const cx = box.scrollLeft + box.clientWidth / 2;
    let best = 0, bd = Infinity;
    for (let i = 0; i < box.children.length; i++) {
      const el = box.children[i] as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - cx);
      if (d < bd) { bd = d; best = i; }
    }
    setCur((c) => (c === best ? c : best));
  }, []);

  return (
    <section className="block" id="top" data-od-id="uni-hero" aria-label={t('aria')} style={{ paddingTop: 'clamp(48px, 6vw, 96px)' }}>
      <div className="wrap">
        <div className={`ch-hero ch-hero--stamp${stampLayout}`}>
          <div className="ch-grid">
            <div>
              <p className="kicker">
                {/* The 0฿ sticker is a child of the kicker so a phone can set it beside the two lines
                   (`?stamp=1|2|3`, see globals.css; 3 is the default). `.kicker` stays static on
                   desktop, so the sheet's absolute rules still resolve against `.ch-hero`. */}
                <svg className="stamp" viewBox="0 0 100 100" aria-hidden="true">
            <g className="stamp-rays" stroke="#ff8a00" strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(0 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(30 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(60 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(90 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(120 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(150 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(180 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(210 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(240 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(270 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(300 50 50)`} />
              <line x1="50" y1="1.5" x2="50" y2="8.5" transform={`rotate(330 50 50)`} />
            </g>
            {/* The disc was #0f172a, so on the light theme the one element the sheet draws as a sun
               read as a black hole beside an orange header mark. Orange disc, dark ink on it:
               0F172A on FF8A00 is ~6.7:1, where white would have been 2.26:1 — the same trap as
               the LINE button. The rim moves to the deep orange so the edge still reads. */}
            <circle cx="50" cy="50" r="40" fill="#ff8a00" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ea580c" strokeWidth="1.4" opacity="0.55" />
            <text x="50" y="53" textAnchor="middle" fontSize="33" fontWeight="800" fill="#0f172a" letterSpacing="-1.5">0฿</text>
            <text x="50" y="69" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a" letterSpacing="0.5">ค่าสำรวจ</text>
                </svg>
                {/* The clause is its own node so a phone can put the rule ABOVE it and the sticker beside
                   it (`?stamp=3`, globals.css); on desktop the span is just another flex item. */}
                <span className="kicker-text">{v?.kicker ?? t('kicker')}</span>
              </p>
              <h1 className="display">
                <span>{v?.h1a ?? t('h1a')}</span><span className="hl">{v?.h1b ?? t('h1b')}</span> <span>{v?.h1c ?? t('h1c')}</span>
              </h1>
              <p className="sub">{v?.sub ?? t('sub')}</p>
              <div className="cta-row">
                <a className="btn btn--primary btn--lg" href="#systems">
                  {t('ctaLine')}
                </a>
                <a className="btn btn--secondary" href="#contact">{t('ctaSee')}</a>
              </div>
            </div>
            <div className="collage">
              {POOLS.map((p, i) => (
                <Frame key={p.cls} cls={p.cls} photos={p.photos} every={4200 + i * 1300} reduced={reduced} />
              ))}
            </div>
          </div>
          <div className="strip-wrap">
            <div
              className="strip"
              ref={strip}
              onScroll={onScroll}
              onPointerDown={() => { paused.current = true; }}
              onPointerUp={() => { paused.current = false; }}
            >
              {SLIDES.map((s, i) => (
                <figure className="slide" key={s.src}>
                  <Image
                    src={s.src}
                    alt={t(s.cap)}
                    width={340}
                    height={425}
                    priority={i === 0}
                    loading={i > 1 ? 'lazy' : undefined}
                  />
                  <figcaption>{t(s.cap)}</figcaption>
                </figure>
              ))}
            </div>
            <div className="dots" aria-hidden="true">
              {SLIDES.map((s, i) => (
                <i key={s.src} className={i === cur ? 'on' : undefined} />
              ))}
            </div>
            <p className="count">{cur + 1} / {SLIDES.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
