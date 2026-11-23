import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { od, type, weight } from "../../design2";
import { SARA_FAMILY } from "../../loadFonts";
import {
  BrollShot,
  OdBroll,
  OdCount,
  OdCta,
  OdDots,
  OdKinetic,
  OdSub,
  OdTicker,
  OdWatermark,
  Scene,
  ScrimH,
  rise,
} from "./kit";
import type { BusinessRoiStoryProps } from "./BusinessRoiStory";

const CUTS = [0, 130, 260, 370, 450];

export const BusinessRoiStoryH: React.FC<BusinessRoiStoryProps> = ({
  broll,
  ticker,
  kicker,
  titleLines,
  sub,
  highlight,
  steps,
  ctaTitle,
  ctaSub,
  url,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: od.colors.bg }}>
      <OdBroll shots={broll} cuts={CUTS} dim={0.2} />
      <ScrimH strength={0.88} />

      {/* Сцена 1 — левая колонка */}
      <Scene
        from={0}
        to={144}
        dir="left"
        style={{ position: "absolute", left: 72, top: 230 }}
      >
        <OdKinetic lines={titleLines} start={20} size={type.h1} maxWidth={860} style={{ fontSize: 96, lineHeight: 1.05 }} />
        <OdSub start={42} maxWidth={820} style={{ fontSize: 36, lineHeight: 1.4, color: od.colors.white }}>{sub}</OdSub>
      </Scene>

      {/* Сцена 2 — хайлайт справа внизу, выше чтобы машина видна, плашка влево, текст белый */}
      <Scene
        from={146}
        to={334}
        dir="right"
        style={{
          position: "absolute",
          left: 72,
          bottom: 140,
          display: "flex",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: 480,
            background: `linear-gradient(150deg, ${od.colors.primary}, ${od.colors.primaryDeep})`,
            borderRadius: od.radius.card,
            boxShadow: od.shadow.luxe,
            padding: "40px 36px",
            ...rise(frame, 154, fps, 34),
          }}
        >
          <div
            lang="th"
            style={{
              fontFamily: SARA_FAMILY,
              fontWeight: weight.extrabold,
              fontSize: 100,
              lineHeight: 1,
              color: od.colors.white,
              overflow: "hidden",
            }}
          >
            {highlight.count !== undefined ? (
              <OdCount
                to={highlight.count}
                suffix={highlight.countSuffix ?? ""}
                start={160}
                style={{ display: "inline-block", ...rise(frame, 158, fps, 40), fontSize: 100 }}
              />
            ) : (
              highlight.value
            )}
          </div>
          <div
            lang="th"
            style={{
              fontFamily: SARA_FAMILY,
              fontWeight: weight.semibold,
              fontSize: 32,
              lineHeight: 1.4,
              marginTop: 20,
              color: "rgba(255,255,255,0.96)",
            }}
          >
            {highlight.label}
          </div>
        </div>
      </Scene>

      {/* Сцена 3 — CTA слева внизу, белый шрифт, крупнее, без плашки */}
      <Scene
        from={328}
        to={450}
        dir="up"
        fade={14}
        style={{ position: "absolute", left: 72, right: 72, bottom: 200, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <OdCta title={ctaTitle} sub={ctaSub} url={url} start={336} style={{ background: "transparent", boxShadow: "none", color: od.colors.white }} />
      </Scene>

      {/* Тикер только снизу, 2.5× больше (70px) */}
      <OdTicker items={ticker} start={0} bottom={40} style={{ fontSize: 70, fontWeight: 700 }} />
      <OdDots cuts={CUTS} />
    </AbsoluteFill>
  );
};

export const businessRoiStoryHDocs: BusinessRoiStoryProps = {
  broll: [
    { src: "images/crew/roof-1904.jpg" },
    { src: "images/broll/night-villa.jpg" },
    { src: "videos/broll/night-ev.mp4", kind: "video", kbFrom: 1.0, kbTo: 1.06 },
    { src: "images/broll/resort-panels.jpg" },
  ],
  ticker: ["Solar PPA ไม่ต้องลงทุนเอง", "ROI 3–4 ปี", "หักภาษี BOI 50%", "โรงงาน 20kW+", "ปรึกษาฟรี"],
  kicker: "สำหรับธุรกิจ · เชิงพาณิชย์",
  titleLines: ["ธุรกิจ คืนทุน ไว", "ภายใน 3–4 ปี"],
  sub: "ลดต้นทุนพลังงาน เพิ่มกำไร และยกระดับภาพลักษณ์ธุรกิจ ด้วยระบบที่ออกแบบจากบิลค่าไฟจริง",
  highlight: {
    value: "50%",
    label: "หักภาษีเงินได้นิติบุคคล (BOI) ได้สูงสุด 50% ของเงินลงทุน",
    count: 50,
    countSuffix: "%",
  },
  steps: [
    { title: "วิเคราะห์จุดคืนทุน (ROI)", desc: "ด้วย AI และบิลค่าไฟจริง" },
    { title: "โซลูชัน Solar PPA", desc: "ไม่ต้องลงทุนเองทั้งก้อน" },
    { title: "ติดตั้งโรงงาน 2–4 สัปดาห์", desc: "ทีมงานท้องถิ่น ดูแลเอกสารให้" },
  ],
  ctaTitle: "ปรึกษาโครงการธุรกิจ",
  ctaSub: "ประเมินความคุ้มค่าให้ก่อนตัดสินใจลงทุน",
  url: "tawanpower.vercel.app",
};