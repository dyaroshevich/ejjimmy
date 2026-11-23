import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";

interface ProductStoryProps {
  name: string;
  brand: string;
  price: string;
  savings: string;
  warranty: string;
  image: string;
  highlights: string[];
}

export const ProductStory: React.FC<ProductStoryProps> = ({
  name,
  brand,
  price,
  savings,
  warranty,
  image,
  highlights,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const productScale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  const priceOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savingsY = interpolate(frame, [50, 70], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightOpacity = (index: number) =>
    interpolate(frame, [70 + index * 20, 90 + index * 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const ctaOpacity = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: gradients.surface,
        fontFamily: FONT_FAMILY,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Brand Badge */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "40px",
          background: tokens.colors.primary,
          color: "#fff",
          padding: "12px 24px",
          borderRadius: tokens.radius.badge,
          fontSize: "24px",
          fontWeight: 600,
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {brand}
      </div>

      {/* Product Image */}
      <div
        style={{
          width: "800px",
          height: "800px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${productScale})`,
          marginBottom: "40px",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
          }}
        />
      </div>

      {/* Product Name */}
      <h1
        style={{
          fontSize: "56px",
          fontWeight: 800,
          color: tokens.colors.text,
          textAlign: "center",
          margin: "0 0 20px 0",
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {name}
      </h1>

      {/* Price */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: 800,
          color: tokens.colors.primary,
          opacity: priceOpacity,
          marginBottom: "16px",
        }}
      >
        {price}
      </div>

      {/* Savings */}
      <div
        style={{
          fontSize: "48px",
          fontWeight: 600,
          color: tokens.colors.savings,
          transform: `translateY(${savingsY}px)`,
          opacity: interpolate(frame, [50, 65], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginBottom: "40px",
        }}
      >
        ประหยัด {savings}
      </div>

      {/* Highlights */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {highlights.map((highlight, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "36px",
              color: tokens.colors.text,
              opacity: highlightOpacity(index),
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: tokens.colors.primary,
              }}
            />
            {highlight}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          background: tokens.colors.primary,
          color: "#fff",
          padding: "24px 64px",
          borderRadius: tokens.radius.button,
          fontSize: "40px",
          fontWeight: 700,
          opacity: ctaOpacity,
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
        }}
      >
        สอบถามเลย
      </div>

      {/* Warranty Badge */}
      <div
        style={{
          position: "absolute",
          bottom: "180px",
          background: tokens.colors.savings,
          color: "#fff",
          padding: "12px 32px",
          borderRadius: tokens.radius.badge,
          fontSize: "28px",
          fontWeight: 600,
          opacity: ctaOpacity,
        }}
      >
        รับประกัน {warranty}
      </div>
    </AbsoluteFill>
  );
};
