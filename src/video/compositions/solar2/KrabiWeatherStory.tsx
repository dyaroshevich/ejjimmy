import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { od, type, weight } from "../../design2";
import { SARA_FAMILY } from "../../loadFonts";
import {
  BrollShot,
  OdBroll,
  OdBrand,
  OdCta,
  OdDots,
  OdKinetic,
  OdKicker,
  OdSub,
  OdTicker,
  OdWatermark,
  Scene,
  Scrim,
  rise,
} from "./kit";

export type KrabiWeatherStoryProps = {
  broll: BrollShot[];
  ticker: string[];
  kicker: string;
  titleLines: string[];
  sub: string;
  facts: { title: string; desc: string }[];
  ctaTitle: string;
  ctaSub: string;
  url: string;
};

const CUTS = [0, 130, 260, 370, 450];

/**
 * Ролик 4 — «วันที่มีเมฆมาก โซลาร์ยังคุ้มไหม?».
 * Фон — лента: реальная крыша → бухта с «петлей энергии» → ролик инженера → резорт с панелями.
 * Сцены уезжают/въезжают со сдвигом и блюром, заголовок — кинетический.
 */
export const KrabiWeatherStory: React.FC<KrabiWeatherStoryProps> = ({
  broll,
  ticker,
  kicker,
  titleLines,
  sub,
  facts,
  ctaTitle,
  ctaSub,
  url,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: od.colors.bg }}>
      <OdBroll shots={broll} cuts={CUTS} dim={0.18} />
      <Scrim height={1920} strength={0.78} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — вопрос */}
      <Scene
        from={0}
        to={154}
        dir="up"
        style={{ position: "absolute", left: 64, right: 64, top: 360 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} size={type.h1} />
        <OdSub start={44}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — четыре ответа */}
      <Scene
        from={146}
        to={334}
        dir="right"
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 190,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {facts.map((f, i) => (
          <div
            key={f.title}
            style={{
              background: od.colors.card,
              borderRadius: od.radius.card,
              border: `2px solid ${od.colors.border}`,
              boxShadow: od.shadow.md,
              padding: "26px 26px 28px",
              ...rise(frame, 154 + i * 7, fps, 34),
            }}
          >
            <div
              style={{
                width: 48,
                height: 6,
                borderRadius: od.radius.pill,
                background: od.colors.primary,
                marginBottom: 16,
                transform: `scaleX(${Math.max(0, Math.min(1, (frame - 158 - i * 7) / 12))})`,
                transformOrigin: "left center",
              }}
            />
            <div
              lang="th"
              style={{
                fontFamily: SARA_FAMILY,
                fontWeight: weight.bold,
                fontSize: type.h3,
                lineHeight: 1.25,
                color: od.colors.fg,
              }}
            >
              {f.title}
            </div>
            <div
              lang="th"
              style={{
                fontFamily: SARA_FAMILY,
                fontWeight: weight.regular,
                fontSize: type.label,
                lineHeight: 1.45,
                marginTop: 10,
                color: od.colors.muted,
              }}
            >
              {f.desc}
            </div>
          </div>
        ))}
      </Scene>

      {/* Сцена 3 — CTA */}
      <Scene
        from={328}
        to={450}
        dir="up"
        fade={14}
        style={{ position: "absolute", left: 64, right: 64, bottom: 130 }}
      >
        <OdCta title={ctaTitle} sub={ctaSub} url={url} start={336} />
      </Scene>

      <OdTicker items={ticker} start={46} bottom={30} />
      <OdDots cuts={CUTS} />
    </AbsoluteFill>
  );
};

export const krabiWeatherStoryDefaults: KrabiWeatherStoryProps = {
  broll: [
    { src: "images/crew/roof-1103.jpg" },
    { src: "images/broll/karst-bay.jpg" },
    { src: "videos/broll/engineer-tablet.mp4", kind: "video", kbFrom: 1.0, kbTo: 1.07 },
    { src: "images/broll/karst-resort.jpg" },
  ],
  ticker: ["N-Type รับแสงกระจาย", "6005-T5 ทนไอเกลือ", "ผลิตไฟได้แม้เมฆมาก", "ล้างแผงปีละ 1–2 ครั้ง", "กระบี่"],
  kicker: "ความรู้ · กระบี่",
  titleLines: ["วัน ที่ มี เมฆ มาก", "โซลาร์ ยัง คุ้ม ไหม"],
  sub: "คำตอบสั้น ๆ: คุ้ม — และกระบี่มีข้อได้เปรียบที่คนอื่นไม่มี",
  facts: [
    {
      title: "40–60%",
      desc: "ผลิตไฟได้แม้หน้าฝน ยังคุ้มกับค่าไฟ",
    },
    {
      title: "N-Type",
      desc: "รับแสงกระจาย (Diffused Light) ได้ดี แม้เมฆมาก",
    },
    {
      title: "6005-T5",
      desc: "โครงสร้างอลูมิเนียมเกรดสูง ทนไอเกลือในกระบี่",
    },
    {
      title: "1–2 ครั้ง",
      desc: "ล้างแผงปีละ 1–2 ครั้ง พร้อมแพ็กเกจดูแลระบบ",
    },
  ],
  ctaTitle: "ถามเรื่องโซลาร์ได้ทุกอย่าง",
  ctaSub: "ตอบไวในแชท ภาษาของคุณ",
  url: "tawanpower.vercel.app",
};
