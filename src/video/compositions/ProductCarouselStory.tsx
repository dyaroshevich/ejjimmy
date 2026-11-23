import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig, Img, Easing } from "remotion";
import { staticFile } from "remotion";
import { tokens } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

const PRODUCTS = [
  {
    name: "GoodWe 5kW",
    price: "฿120,000",
    savings: "฿2,500/เดือน",
    image: "/content/products/goodwe-5kw-1phase/main.webp",
    badge: "ยอดนิยม",
    badgeColor: "#FF8A00",
  },
  {
    name: "GoodWe 10kW",
    price: "฿228,000",
    savings: "฿5,000/เดือน",
    image: "/content/products/goodwe-10kw-3phase/main.webp",
    badge: "สำหรับบ้านใหญ่",
    badgeColor: "#3b82f6",
  },
  {
    name: "GoodWe 20kW",
    price: "฿420,000",
    savings: "฿10,000/เดือน",
    image: "/content/products/goodwe-20kw-3phase/main.webp",
    badge: "ธุรกิจ",
    badgeColor: "#8b5cf6",
  },
  {
    name: "Jinko 715W",
    price: "฿12,500/แผง",
    savings: "ประสิทธิภาพสูง",
    image: "/content/products/jinko-715w-panel/main.webp",
    badge: "แผงพรีเมียม",
    badgeColor: "#f59e0b",
  },
  {
    name: "Sigenergy 10kWh",
    price: "฿89,000",
    savings: "เก็บพลังงานได้",
    image: "/content/products/sigenergy-10kwh-1phase/main.webp",
    badge: "Battery",
    badgeColor: "#ef4444",
  },
  {
    name: "EV Charger 12kW",
    price: "฿35,000",
    savings: "ชาร์จรถได้",
    image: "/content/products/ev-charger-12kw/main.webp",
    badge: "EV",
    badgeColor: "#06b6d4",
  },
];

const SHOW_FRAMES = 45;
const SWIPE_FRAMES = 15;

const HeroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleScale = interpolate(frame, [0, 25], [0.3, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [20, 40], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineScale = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowOpacity = interpolate(frame, [30, 50], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0e00 0%, #2D1A04 50%, #3D260A 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
          opacity: glowOpacity,
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          fontSize: "80px",
          marginBottom: "32px",
          opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(frame, [5, 25], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }}
      >
        ☀️
      </div>

      <div
        style={{
          fontSize: "64px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          lineHeight: 1.2,
          letterSpacing: "-2px",
        }}
      >
        โซลาร์เซลล์
        <br />
        <span style={{ color: tokens.colors.secondary }}>คุณภาพ</span> ระดับโลก
      </div>

      <div
        style={{
          width: `${lineScale * 300}px`,
          height: "4px",
          background: `linear-gradient(90deg, transparent, ${tokens.colors.secondary}, transparent)`,
          margin: "40px 0",
        }}
      />

      <div
        style={{
          fontSize: "32px",
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          lineHeight: 1.5,
        }}
      >
        เลือกอุปกรณ์ที่เหมาะกับคุณ
        <br />
        จากแบรนด์ชั้นนำทั่วโลก
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "100px",
          display: "flex",
          gap: "8px",
          opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? "32px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === 0 ? tokens.colors.secondary : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ProductSlide: React.FC<{
  product: (typeof PRODUCTS)[number];
  index: number;
  translateX: number;
  opacity: number;
}> = ({ product, index, translateX, opacity }) => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 60px",
        transform: `translateX(${translateX}%)`,
        opacity,
      }}
    >
      {/* Product number watermark */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "60px",
          fontFamily: tokens.fonts.mono,
          fontSize: "120px",
          fontWeight: 900,
          color: "rgba(16,185,129,0.08)",
          lineHeight: 1,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "60px",
          background: product.badgeColor,
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "30px",
          fontSize: "24px",
          fontWeight: 700,
          boxShadow: `0 8px 24px ${product.badgeColor}40`,
        }}
      >
        {product.badge}
      </div>

      {/* Image */}
      <div
        style={{
          width: "700px",
          height: "700px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        <Img
          src={staticFile(product.image)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.15))",
          }}
        />
      </div>

      {/* Product name */}
      <div
        style={{
          fontSize: "48px",
          fontWeight: 800,
          color: tokens.colors.text,
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        {product.name}
      </div>

      {/* Price */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: 900,
          color: tokens.colors.primary,
          marginBottom: "12px",
        }}
      >
        {product.price}
      </div>

      {/* Savings */}
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          color: tokens.colors.secondary,
          background: "#fef3c7",
          padding: "12px 32px",
          borderRadius: "20px",
        }}
      >
        ประหยัด {product.savings}
      </div>
    </AbsoluteFill>
  );
};

const CarouselScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const totalCards = PRODUCTS.length;
  const segmentLength = SHOW_FRAMES;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {PRODUCTS.map((product, i) => {
        const cardStart = i * segmentLength;
        const cardEnd = cardStart + SHOW_FRAMES + SWIPE_FRAMES;

        const slideInProgress = frame >= cardStart && frame < cardStart + SWIPE_FRAMES;
        const slideOutStart = cardStart + SHOW_FRAMES;
        const slideOutInProgress = frame >= slideOutStart && frame < slideOutStart + SWIPE_FRAMES;

        let translateX = 100;
        let opacity = 0;

        if (frame < cardStart) {
          translateX = 100;
          opacity = 0;
        } else if (frame >= cardStart && frame < cardStart + SWIPE_FRAMES) {
          const progress = interpolate(frame, [cardStart, cardStart + SWIPE_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          translateX = interpolate(progress, [0, 1], [100, 0]);
          opacity = interpolate(progress, [0, 1], [0, 1]);
        } else if (frame >= cardStart + SWIPE_FRAMES && frame < slideOutStart) {
          translateX = 0;
          opacity = 1;
        } else if (frame >= slideOutStart && frame < slideOutStart + SWIPE_FRAMES) {
          const progress = interpolate(frame, [slideOutStart, slideOutStart + SWIPE_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          });
          translateX = interpolate(progress, [0, 1], [0, -100]);
          opacity = interpolate(progress, [0, 1], [1, 0]);
        } else {
          translateX = -100;
          opacity = 0;
        }

        return (
          <ProductSlide
            key={i}
            product={product}
            index={i}
            translateX={translateX}
            opacity={opacity}
          />
        );
      })}

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 100,
        }}
      >
        {PRODUCTS.map((_, i) => {
          const cardStart = i * segmentLength;
          const isActive = frame >= cardStart && frame < cardStart + SHOW_FRAMES + SWIPE_FRAMES;
          return (
            <div
              key={i}
              style={{
                width: isActive ? "32px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: isActive ? tokens.colors.primary : "rgba(0,0,0,0.2)",
                transition: "all 0.3s",
              }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "6px",
          background: "rgba(0,0,0,0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(frame / (totalCards * segmentLength)) * 100}%`,
            background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = interpolate(frame, [0, 20], [0.6, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [40, 60, 80, 100], [1, 1.05, 1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #FF8A00 0%, #E67A00 50%, #3D260A 100%)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 60px",
      }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "4px",
            height: interpolate(frame, [10, 30], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            background: "rgba(255,255,255,0.1)",
            transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
            transformOrigin: "center",
          }}
        />
      ))}

      <div
        style={{
          fontSize: "56px",
          fontWeight: 900,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
          lineHeight: 1.3,
          marginBottom: "48px",
        }}
      >
        เลือกระบุ
        <br />
        ที่<span style={{ color: "#fef3c7" }}>เหมาะกับคุณ</span>
      </div>

      <div
        style={{
          background: "#fff",
          color: tokens.colors.primary,
          padding: "28px 72px",
          borderRadius: "60px",
          fontSize: "36px",
          fontWeight: 800,
          opacity: ctaOpacity,
          transform: `scale(${pulse})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        ดูสินค้าทั้งหมด →
      </div>

      <div
        style={{
          marginTop: "48px",
          fontSize: "26px",
          color: "rgba(255,255,255,0.8)",
          fontFamily: tokens.fonts.mono,
          opacity: ctaOpacity,
        }}
      >
        tawanpower.vercel.app
      </div>
    </AbsoluteFill>
  );
};

export const ProductCarouselStory: React.FC = () => {
  const { fps } = useVideoConfig();

  const HERO_DUR = 4 * fps;
  const CAROUSEL_DUR = PRODUCTS.length * SHOW_FRAMES + SWIPE_FRAMES;
  const CTA_DUR = 4 * fps;

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={HERO_DUR}>
        <HeroScene frame={useCurrentFrame()} fps={fps} />
      </Sequence>

      <Sequence from={HERO_DUR} durationInFrames={CAROUSEL_DUR}>
        <CarouselScene frame={useCurrentFrame()} fps={fps} />
      </Sequence>

      <Sequence from={HERO_DUR + CAROUSEL_DUR} durationInFrames={CTA_DUR}>
        <CTAScene frame={useCurrentFrame()} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
