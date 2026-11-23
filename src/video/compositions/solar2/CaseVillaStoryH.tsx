import React from "react";
import { AbsoluteFill } from "remotion";
import { od, type } from "../../design2";
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
  ScrimH,
} from "./kit";

export type CaseVillaStoryHProps = {
  broll: BrollShot[];
  ticker: string[];
  kicker: string;
  titleLines: string[];
  sub: string;
  stats: {
    value: string;
    label: string;
    count?: number;
    countSuffix?: string;
    countDecimals?: number;
    countSep?: boolean;
  }[];
  ctaTitle: string;
  ctaSub: string;
  url: string;
};

const CUTS = [0, 130, 260, 370, 450];

/**
 * «yolo»-ролик — рандомный широкоформатный кейс (1920×1080):
 * вилла в Краби с системой 10kW. Цифры — реальные, с сайта (KrabiCaseStory):
 * −7,900 ฿/мес, 95,000 ฿/год, 16 панелей, окупаемость 4.5 года.
 * Механика та же, что в остальных H-копиях: левая колонка текста под ScrimH,
 * карточки справа, CTA слева, лента b-roll с видео-клипом посередине.
 */
export const CaseVillaStoryH: React.FC<CaseVillaStoryHProps> = ({
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
      <OdBroll shots={broll} cuts={CUTS} dim={0.16} />
      <ScrimH strength={0.87} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — левая колонка: кейс одной строкой смысла */}
      <Scene
        from={0}
        to={158}
        dir="left"
        style={{ position: "absolute", left: 72, right: 980, top: 240 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} size={type.h1} maxWidth={860} />
        <OdSub start={44} maxWidth={820}>
          {sub}
        </OdSub>
      </Scene>

      {/* Сцена 2 — три цифры кейса справа внизу */}
      <Scene
        from={150}
        to={332}
        dir="right"
        style={{
          position: "absolute",
          left: 700,
          right: 72,
          bottom: 176,
          display: "flex",
          gap: 24,
          justifyContent: "flex-end",
        }}
      >
        {stats.map((s, i) => (
          <OdStat
            key={s.value}
            value={s.value}
            label={s.label}
            start={168 + i * 8}
            width={i === 0 ? 400 : 336}
            count={s.count}
            countSuffix={s.countSuffix}
            countDecimals={s.countDecimals}
            countSep={s.countSep}
          />
        ))}
      </Scene>

      {/* Сцена 3 — CTA слева внизу */}
      <Scene
        from={326}
        to={450}
        dir="up"
        fade={14}
        style={{ position: "absolute", left: 72, right: 1000, bottom: 150 }}
      >
        <OdCta title={ctaTitle} sub={ctaSub} url={url} start={334} />
      </Scene>

      <OdTicker items={ticker} start={46} bottom={30} />
      <OdDots cuts={CUTS} />
    </AbsoluteFill>
  );
};

export const caseVillaStoryHDefaults: CaseVillaStoryHProps = {
  broll: [
    { src: "images/broll/villa-sunset.jpg" },
    { src: "images/broll/night-villa.jpg" },
    { src: "videos/broll/engineer-tablet.mp4", kind: "video", kbFrom: 1.0, kbTo: 1.07 },
    { src: "images/broll/resort-panels.jpg" },
  ],
  ticker: [
    "เคสจริง กระบี่",
    "Deye Hybrid + Dyness 10kWh",
    "ประหยัด 95,000 บาท/ปี",
    "คืนทุน 4.5 ปี",
    "TAWAN POWER",
  ],
  kicker: "เคสจริง · วิลล่ากระบี่ 10kW",
  titleLines: ["วิลล่า กระบี่ ลด ค่าไฟ", "7,900 บาท ต่อ เดือน"],
  sub: "Deye Hybrid + Dyness 10kWh — แผง 16 แผง 450W ผลิตไฟกลางวัน เก็บแบตใช้กลางคืน ทำงานอัตโนมัติ 24 ชม.",
  stats: [
    {
      value: "95,000 ฿",
      label: "ประหยัดค่าไฟต่อปี",
      count: 95000,
      countSuffix: " ฿",
      countSep: true,
    },
    {
      value: "16 แผง",
      label: "450W ต่อแผง · ระบบที่วิศวกรเราติดตั้งเอง",
      count: 16,
      countSuffix: " แผง",
    },
    {
      value: "4.5 ปี",
      label: "จุดคืนทุนของระบบ",
      count: 4.5,
      countDecimals: 1,
      countSuffix: " ปี",
    },
  ],
  ctaTitle: "อยากรู้บิลตัวเองลดได้เท่าไหร่?",
  ctaSub: "ส่งบิลค่าไฟล่าสุด ทีมเราคำนวณให้ฟรี",
  url: "tawanpower.vercel.app",
};
