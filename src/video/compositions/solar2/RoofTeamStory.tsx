import React from "react";
import { AbsoluteFill } from "remotion";
import { od } from "../../design2";
import {
  BrollShot,
  OdBroll,
  OdBrand,
  OdCta,
  OdDots,
  OdKinetic,
  OdKicker,
  OdStat,
  OdSub,
  OdTicker,
  OdWatermark,
  Scene,
  Scrim,
} from "./kit";

export type Stat = { value: string; label: string; count?: number; countSuffix?: string };

export type RoofTeamStoryProps = {
  broll: BrollShot[];
  ticker: string[];
  kicker: string;
  titleLines: string[];
  sub: string;
  stats: Stat[];
  ctaTitle: string;
  ctaSub: string;
  url: string;
};

const CUTS = [0, 130, 260, 370, 450];

/**
 * Ролик 1 — «ติดตั้งโดยเพื่อนบ้าน».
 * Фон — лента b-roll: AI-кадр → реальная бригада на крыше → видео с крыши → магазин.
 * Сцены уезжают/въезжают со сдвигом и блюром, заголовок — кинетический.
 */
export const RoofTeamStory: React.FC<RoofTeamStoryProps> = ({
  broll,
  ticker,
  kicker,
  titleLines,
  sub,
  stats,
  ctaTitle,
  ctaSub,
  url,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: od.colors.bg }}>
      <OdBroll shots={broll} cuts={CUTS} dim={0.14} />
      <Scrim height={1920} strength={0.72} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — обещание */}
      <Scene
        from={0}
        to={158}
        dir="up"
        style={{ position: "absolute", left: 64, right: 64, top: 420 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} />
        <OdSub start={44}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — цифры доверия (счётчики) */}
      <Scene
        from={150}
        to={332}
        dir="left"
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 260,
          display: "flex",
          gap: 24,
        }}
      >
        {stats.map((s, i) => (
          <StatCard key={s.value} stat={s} start={168 + i * 8} />
        ))}
      </Scene>

      {/* Сцена 3 — CTA */}
      <Scene
        from={326}
        to={450}
        dir="up"
        fade={14}
        style={{ position: "absolute", left: 64, right: 64, bottom: 130 }}
      >
        <OdCta title={ctaTitle} sub={ctaSub} url={url} start={334} />
      </Scene>

      <OdTicker items={ticker} start={46} bottom={30} />
      <OdDots cuts={CUTS} />
    </AbsoluteFill>
  );
};

const StatCard: React.FC<{ stat: Stat; start: number }> = ({ stat, start }) => (
  <OdStat
    value={stat.value}
    label={stat.label}
    start={start}
    width={300}
    count={stat.count}
    countSuffix={stat.countSuffix}
  />
);

export const roofTeamStoryDefaults: RoofTeamStoryProps = {
  broll: [
    { src: "images/ai/solar-img-01.png" },
    { src: "images/broll/crew-install.jpg", position: "50% 40%" },
    { src: "videos/broll/roof-panels.mp4", kind: "video", kbFrom: 1.0, kbTo: 1.08 },
    { src: "images/broll/shop-day.jpg", position: "50% 30%" },
  ],
  ticker: ["ติดโซลาร์ที่กระบี่", "ทีมช่างท้องถิ่น", "รับประกัน 25 ปี", "ประเมินหน้างานฟรี", "TAWAN POWER"],
  kicker: "ทีมช่างกระบี่ · 120+ ระบบ",
  titleLines: ["ติดตั้ง โดย เพื่อนบ้าน", "ไม่ใช่ คนแปลกหน้า"],
  sub: "วิศวกรของเราบนหลังคาคุณ — ไม่มีผู้รับเหมาช่วง ไม่หายหลังรับเงิน",
  stats: [
    { value: "120+", label: "ระบบทั่วกระบี่ อ่าวนาง และคลองท่อม", count: 120, countSuffix: "+" },
    { value: "1–3 วัน", label: "ติดตั้งเสร็จตามบ้าน" },
    { value: "25 ปี", label: "รับประกันประสิทธิภาพอุปกรณ์", count: 25, countSuffix: " ปี" },
  ],
  ctaTitle: "เริ่มประเมินฟรี",
  ctaSub: "สำรวจหน้างานฟรี โดยวิศวกรท้องถิ่น",
  url: "tawanpower.vercel.app",
};
