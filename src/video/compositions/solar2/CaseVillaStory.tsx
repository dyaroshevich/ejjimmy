import React from "react";
import { AbsoluteFill } from "remotion";
import { od, type } from "../../design2";
import {
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
import type { CaseVillaStoryHProps } from "./CaseVillaStoryH";

const CUTS = [0, 130, 260, 370, 450];

/**
 * Вертикальная 9:16 версия кейса-ролика «вилла 10kW» для TikTok/Reels.
 * Цифры, тайминги и лента b-roll — те же, что в горизонтальной копии;
 * отличается только раскладка (сетка вертикальных роликов серии: текст сверху,
 * карточки снизу, CTA ниже). Стат-карточки: шрифт 52 и ширина 310 —
 * «95,000 ฿» с счётчиком не переносится в 1080.
 */
export const CaseVillaStory: React.FC<CaseVillaStoryHProps> = ({
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
      <Scrim height={1920} strength={0.74} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — кейс: заголовок сверху */}
      <Scene
        from={0}
        to={158}
        dir="up"
        style={{ position: "absolute", left: 64, right: 64, top: 400 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} size={type.h1} maxWidth={940} />
        <OdSub start={44}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — три цифры кейса внизу */}
      <Scene
        from={150}
        to={332}
        dir="left"
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 260,
          display: "flex",
          gap: 24,
        }}
      >
        {stats.map((s, i) => (
          <OdStat
            key={s.value}
            value={s.value}
            label={s.label}
            start={168 + i * 8}
            width={310}
            size={52}
            count={s.count}
            countSuffix={s.countSuffix}
            countDecimals={s.countDecimals}
            countSep={s.countSep}
          />
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

export const caseVillaStoryDefaults: CaseVillaStoryHProps = {
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
