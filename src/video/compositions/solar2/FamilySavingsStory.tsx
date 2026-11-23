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
  OdList,
  OdSub,
  OdTicker,
  OdWatermark,
  Scene,
  Scrim,
} from "./kit";

export type FamilySavingsStoryProps = {
  broll: BrollShot[];
  ticker: string[];
  kicker: string;
  titleLines: string[];
  sub: string;
  factsTitle: string;
  facts: string[];
  ctaTitle: string;
  ctaSub: string;
  url: string;
};

const CUTS = [0, 130, 260, 370, 450];

/**
 * Ролик 2 — «ลดค่าไฟสูงสุด 70%».
 * Фон — лента: AI-кадр → вилла на закате → ролик с людьми → дом у воды.
 * Сцены уезжают/въезжают со сдвигом и блюром, заголовок — кинетический.
 */
export const FamilySavingsStory: React.FC<FamilySavingsStoryProps> = ({
  broll,
  ticker,
  kicker,
  titleLines,
  sub,
  factsTitle,
  facts,
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

      {/* Сцена 1 — обещание */}
      <Scene
        from={0}
        to={156}
        dir="up"
        style={{ position: "absolute", left: 64, right: 64, top: 380 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} />
        <OdSub start={44}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — как считаем экономию */}
      <Scene
        from={148}
        to={330}
        dir="right"
        style={{ position: "absolute", left: 64, right: 64, bottom: 200 }}
      >
        <OdList items={facts} title={factsTitle} start={158} />
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

export const familySavingsStoryDefaults: FamilySavingsStoryProps = {
  broll: [
    { src: "images/ai/solar-img-02.png" },
    { src: "images/broll/villa-sea.jpg" },
    { src: "videos/broll/couple.mp4", kind: "video", kbFrom: 1.0, kbTo: 1.06 },
    { src: "images/broll/house-water.jpg" },
  ],
  ticker: ["ลดค่าไฟสูงสุด 70%", "คืนทุน 3–5 ปี", "Net Metering", "ประเมินฟรีด้วย AI", "โซลาร์บ้าน"],
  kicker: "สำหรับบ้าน · ที่อยู่อาศัย",
  titleLines: ["เปลี่ยน หลังคา บ้าน", "เป็น แหล่ง รายได้"],
  sub: "ลดค่าไฟสูงสุด 70% ด้วยระบบอัจฉริยะที่ออกแบบเฉพาะบ้านและค่าไฟจริงของคุณ",
  factsTitle: "คิดให้คุณฟรี ด้วย AI",
  facts: [
    "คืนทุนภายใน 3–5 ปี ด้วยแดดพีคเฉลี่ยวันละ 5 ชั่วโมง",
    "ไฟที่เหลือขายคืนกริด ผ่านเน็ตมิเตอร์ริง — เราเดินเรื่องให้",
    "แบตเตอรี่มีเมื่ออยากมีไฟสำรองตอนไฟดับ ไม่บังคับ",
  ],
  ctaTitle: "ประเมินการประหยัดด้วย AI ฟรี",
  ctaSub: "ใช้บิลค่าไฟจริงของคุณ ไม่ใช่ตัวเลขกลาง",
  url: "tawanpower.vercel.app",
};
