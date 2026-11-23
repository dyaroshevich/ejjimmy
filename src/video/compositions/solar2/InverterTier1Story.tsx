import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { od, type, weight } from "../../design2";
import { SARA_FAMILY } from "../../loadFonts";
import {
  BrollShot,
  OdBroll,
  OdBrand,
  OdCount,
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

export type InverterTier1StoryProps = {
  broll: BrollShot[];
  ticker: string[];
  kicker: string;
  titleLines: string[];
  sub: string;
  brands: string[];
  facts: { value: string; label: string; count?: number; countSuffix?: string }[];
  ctaTitle: string;
  ctaSub: string;
  url: string;
};

const CUTS = [0, 130, 260, 370, 450];


/**
 * Ролик 3 — «อินเวอร์เตอร์เกรด Tier-1».
 * Фон — лента: AI-кадр → инвертор-батарея в тёмном гараже → макро «ячеек» → абстрактная энергия.
 * Сцены уезжают/въезжают со сдвигом и блюром, заголовок — кинетический, цифры-гарантии считаются.
 */
export const InverterTier1Story: React.FC<InverterTier1StoryProps> = ({
  broll,
  ticker,
  kicker,
  titleLines,
  sub,
  brands,
  facts,
  ctaTitle,
  ctaSub,
  url,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: od.colors.bg }}>
      <OdBroll shots={broll} cuts={CUTS} dim={0.2} />
      <Scrim height={1300} strength={0.62} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — заголовок */}
      <Scene
        from={0}
        to={152}
        dir="up"
        style={{ position: "absolute", left: 64, right: 64, top: 380 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} size={type.h1} />
        <OdSub start={40}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — бренды и гарантии */}
      <Scene
        from={145}
        to={330}
        dir="left"
        style={{ position: "absolute", left: 64, right: 64, bottom: 190 }}
      >
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {brands.map((b, i) => (
            <div
              key={b}
              style={{
                padding: "14px 30px",
                borderRadius: od.radius.pill,
                background: od.colors.card,
                border: `2px solid ${od.colors.border}`,
                boxShadow: od.shadow.md,
                fontFamily: SARA_FAMILY,
                fontWeight: weight.bold,
                fontSize: type.label,
                color: od.colors.fg,
                ...rise(frame, 148 + i * 6, fps, 22),
              }}
            >
              {b}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {facts.map((f, i) => (
            <div
              key={f.value}
              style={{
                flex: 1,
                background: od.colors.card,
                borderRadius: od.radius.card,
                border: `2px solid ${od.colors.border}`,
                boxShadow: od.shadow.md,
                padding: "28px 26px",
              }}
            >
              <FactValue fact={f} start={162 + i * 8} />
              <div
                lang="th"
                style={{
                  fontFamily: SARA_FAMILY,
                  fontWeight: weight.medium,
                  fontSize: type.label,
                  lineHeight: 1.4,
                  marginTop: 10,
                  color: od.colors.muted,
                }}
              >
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </Scene>

      {/* Сцена 3 — CTA */}
      <Scene
        from={324}
        to={450}
        dir="up"
        fade={14}
        style={{ position: "absolute", left: 64, right: 64, bottom: 130 }}
      >
        <OdCta title={ctaTitle} sub={ctaSub} url={url} start={332} />
      </Scene>

      <OdTicker items={ticker} start={46} bottom={30} />
      <OdDots cuts={CUTS} />
    </AbsoluteFill>
  );
};

const FactValue: React.FC<{
  fact: { value: string; count?: number; countSuffix?: string };
  start: number;
}> = ({ fact, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style: React.CSSProperties = {
    fontFamily: SARA_FAMILY,
    fontWeight: weight.extrabold,
    fontSize: 52,
    lineHeight: 1.1,
    color: od.colors.primaryInk,
    display: "inline-block",
    ...rise(frame, start, fps, 24),
  };
  if (fact.count !== undefined) {
    return (
      <div lang="th" style={{ overflow: "hidden" }}>
        <OdCount
          to={fact.count}
          suffix={fact.countSuffix ?? ""}
          start={start + 4}
          style={style}
        />
      </div>
    );
  }
  return (
    <div lang="th" style={{ overflow: "hidden" }}>
      <span style={style}>{fact.value}</span>
    </div>
  );
};

export const inverterTier1StoryDefaults: InverterTier1StoryProps = {
  broll: [
    { src: "images/ai/solar-img-03.png" },
    { src: "images/broll/battery-wall.jpg", position: "50% 45%" },
    { src: "images/broll/hex-cells.jpg" },
    { src: "images/broll/abstract-energy.jpg", position: "50% 30%" },
  ],
  ticker: ["Deye", "GoodWe", "Sigenergy", "รับประกันในไทย", "Hybrid ต่อเนื่อง 24 ชม."],
  kicker: "อุปกรณ์ · เกรด Tier-1",
  titleLines: ["เลือก อินเวอร์เตอร์", "ที่ รับประกัน ใน ไทย"],
  sub: "Deye, GoodWe และ Sigenergy — เทียบสเปกก่อนตัดสินใจ พร้อมทีมวิศวกรที่ดูแลตั้งแต่เริ่มจนจบ",
  brands: ["Deye", "GoodWe", "Sigenergy"],
  facts: [
    { value: "25 ปี", label: "รับประกันประสิทธิภาพแผงโซลาร์", count: 25, countSuffix: " ปี" },
    { value: "12 ปี", label: "รับประกันตัวเครื่องอินเวอร์เตอร์", count: 12, countSuffix: " ปี" },
    { value: "24 ชม.", label: "Hybrid มีไฟใช้ ต่อเนื่องแม้ไฟดับ", count: 24, countSuffix: " ชม." },
  ],
  ctaTitle: "สอบถามอินเวอร์เตอร์",
  ctaSub: "เทียบสเปกชัด ๆ ก่อนตัดสินใจ — คุยกับวิศวกรจริง",
  url: "tawanpower.vercel.app",
};
