import React from "react";
import { AbsoluteFill } from "remotion";
import { od } from "../../design2";
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
  ScrimH,
} from "./kit";
import type { RoofTeamStoryProps } from "./RoofTeamStory";

const CUTS = [0, 130, 260, 370, 450];

/**
 * Горизонтальная копия ролика 1 (1920×1080): текст уходит в левую колонку,
 * стат-карточки — вправо внизу, скрим боковой (ScrimH). Тайминги сцен и
 * лента b-roll те же, что и в вертикальной версии — озвучка ложится одинаково.
 */
export const RoofTeamStoryH: React.FC<RoofTeamStoryProps> = ({
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
      <ScrimH strength={0.86} />
      <OdBrand start={4} />
      <OdWatermark start={8} />

      {/* Сцена 1 — левая колонка */}
      <Scene
        from={0}
        to={158}
        dir="left"
        style={{ position: "absolute", left: 72, right: 980, top: 250 }}
      >
        <OdKicker start={12}>{kicker}</OdKicker>
        <OdKinetic lines={titleLines} start={20} maxWidth={860} />
        <OdSub start={44} maxWidth={820}>
          {sub}
        </OdSub>
      </Scene>

      {/* Сцена 2 — стат-карточки справа внизу */}
      <Scene
        from={150}
        to={332}
        dir="right"
        style={{
          position: "absolute",
          left: 780,
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
            width={300}
            count={s.count}
            countSuffix={s.countSuffix}
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
