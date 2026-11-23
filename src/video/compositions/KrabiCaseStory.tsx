import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens, gradients } from "../tokens";
import { FONT_FAMILY } from "../loadFonts";
import { typewriter, isTyping, slideIn, scalePop, pulse } from "../animations";
import { videoBrand } from "../brand";

function progress(frame: number, totalFrames: number): number {
  return interpolate(frame, [0, totalFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

interface KrabiCaseStoryProps {
  title?: string;
  location?: string;
  system?: string;
  panels?: number;
  powerKw?: number;
  annualSavings?: string;
  monthlySavings?: string;
  payback?: string;
  beforeImage?: string;
  afterImage?: string;
  galleryImages?: string[];
  installationPhotos?: string[];
  quote?: string;
  clientName?: string;
  systemDetails?: string[];
  problemText?: string;
  solutionText?: string;
  standardsText?: string;
  equipment?: { title: string; desc: string; icon: string }[];
  installationSteps?: string[];
}

export const KrabiCaseStory: React.FC<KrabiCaseStoryProps> = ({
  title = "วิลล่ากระบี่ — ระบบ 10kW",
  location = "จังหวัดกระบี่",
  system = "Deye Hybrid + Dyness 10kWh",
  panels = 16,
  powerKw = 10,
  annualSavings = "฿95,000",
  monthlySavings = "฿7,900",
  payback = "4.5 ปี",
  beforeImage = "images/krabi-002.png",
  afterImage = "images/1779681091103.jpg",
  galleryImages = [
    "images/krabi-002-gallery-01.png",
    "images/krabi-002-gallery-02.png",
    "images/1779681103039.jpg",
    "images/1779681103087.jpg",
  ],
  installationPhotos = [
    "images/1779681091334.jpg",
    "images/1779681091454.jpg",
    "images/1779681091518.jpg",
    "images/1779681091586.jpg",
    "images/1779681091664.jpg",
    "images/1779681091724.jpg",
    "images/1779681091773.jpg",
    "images/1779681091838.jpg",
    "images/1779681091904.jpg",
  ],
  quote = "ระบบช่วยลดค่าไฟได้มาก คุ้มค่าจริงๆ ครับ",
  clientName = "คุณสมชาย",
  systemDetails = [
    "Deye SUN-10K-SG04LP1-EU Hybrid",
    " Dyness BX51100 10kWh",
    "แผง 16 แผง 450W",
    "MECER ATS Transfer Switch",
  ],
  problemText = "วิลล่าขนาดใหญ่ในกระบี่ มีค่าไฟสูงถึง ฿15,000/เดือน จากเครื่องปรับอากาศหลายเครื่องและระบบไฟฟ้าครบวงจร",
  solutionText = "ติดตั้งระบบไฮบริด 10kW ที่ทำงานอัตโนมัติตลอด 24 ชม. — ผลิตไฟจากแสงแดดตอนกลางวัน เก็บไว้ในแบตเตอรี่สำหรับกลางคืน",
  standardsText = "ทีมวิศวกรใช้โครงสร้างอลูมิเนียมเกรดสูง ทนทานต่อไอทะเล พร้อมระบบป้องกันฟ้าผ่าตามมาตรฐานวิศวกรรมไฟฟ้า",
  equipment = [
    { title: "อินเวอร์เตอร์", desc: "Deye SUN-10K-SG04LP1-EU Hybrid", icon: "⚡" },
    { title: "แผงโซลาร์", desc: "16 แผง 450W — ประสิทธิภาพสูง", icon: "☀️" },
    { title: "แบตเตอรี่", desc: "Dyness BX51100 10kWh — สำรองไฟทั้งคืน", icon: "🔋" },
    { title: "ระบบยึด", desc: "Aluminum High-Grade — ทนไอทะเล", icon: "🔧" },
  ],
  installationSteps = [
    "สำรวจหน้างานและออกแบบระบบ",
    "ติดตั้งโครงสร้างยึดแผงบนหลังคา",
    "เดินสายไฟและต่ออินเวอร์เตอร์",
    "ติดตั้งแผงโซลาร์ 16 แผง",
    "ต่อแบตเตอรี่ Dyness 10kWh",
    "ทดสอบระบบและเปิดใช้งาน",
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing (1200 frames = 40 seconds)
  const HERO_END = 75;
  const PROBLEM_START = 75;
  const PROBLEM_END = 165;
  const BEFORE_START = 165;
  const BEFORE_END = 270;
  const INSTALL_START = 270;
  const INSTALL_END = 510;
  const EQUIP_START = 510;
  const EQUIP_END = 660;
  const RESULT_START = 660;
  const RESULT_END = 840;
  const QUOTE_START = 840;
  const QUOTE_END = 1020;
  const CTA_START = 1020;

  // Helper animations
  const fadeIn = (start: number, dur = 15) =>
    interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeOut = (end: number, dur = 10) =>
    interpolate(frame, [end - dur, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const slideIn = (start: number, dist = 60) =>
    interpolate(frame, [start, start + 20], [dist, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sceneOpacity = (start: number, end: number) =>
    Math.min(fadeIn(start), fadeOut(end));

  // Hero
  const heroOpacity = sceneOpacity(0, HERO_END);

  // Problem
  const problemOpacity = sceneOpacity(PROBLEM_START, PROBLEM_END);

  // Before/After
  const sliderPos = interpolate(frame, [BEFORE_START + 20, BEFORE_START + 80], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const beforeOpacity = sceneOpacity(BEFORE_START, BEFORE_END);

  // Installation carousel
  const installOpacity = sceneOpacity(INSTALL_START, INSTALL_END);
  const installIdx = Math.floor((frame - INSTALL_START) / 40) % installationPhotos.length;

  // Equipment
  const equipOpacity = sceneOpacity(EQUIP_START, EQUIP_END);

  // Result
  const resultOpacity = sceneOpacity(RESULT_START, RESULT_END);

  // Quote
  const quoteOpacity = sceneOpacity(QUOTE_START, QUOTE_END);

  // CTA
  const ctaOpacity = fadeIn(CTA_START, 25);
  const ctaPulse = pulse(frame, CTA_START + 25);

  // Progress bar
  const progressBar = progress(frame, 1200);

  // Typewriter effects for long text
  const problemTypewriter = typewriter(problemText, frame, PROBLEM_START + 20, 1.5);
  const solutionTypewriter = typewriter(solutionText, frame, BEFORE_START + 30, 1.5);
  const standardsTypewriter = typewriter(standardsText, frame, INSTALL_START + 60, 1.5);

  return (
    <AbsoluteFill
      style={{
        background: gradients.dark,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      {/* ============ PROGRESS BAR ============ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "rgba(255,255,255,0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: `${progressBar}%`,
            height: "100%",
            background: tokens.colors.primary,
          }}
        />
      </div>

      {/* ============ HERO SCENE ============ */}
      {frame < HERO_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: heroOpacity,
          }}
        >
          <div style={{ fontSize: "100px", marginBottom: "24px" }}>📍</div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "36px",
              color: tokens.colors.primary,
              fontWeight: 500,
            }}
          >
            {location}
          </div>
          <div
            style={{
              marginTop: "32px",
              fontSize: "28px",
              color: tokens.colors.textMuted,
              background: "rgba(255,255,255,0.05)",
              padding: "12px 32px",
              borderRadius: tokens.radius.badge,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ระบบ {powerKw}kW — {system}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ PROBLEM SCENE ============ */}
      {frame >= PROBLEM_START && frame < PROBLEM_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            opacity: problemOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              position: "absolute",
              top: "120px",
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: fadeIn(PROBLEM_START),
            }}
          >
            บทที่ 1 — ปัญหา
          </div>

          {/* Icon */}
          <div
            style={{
              fontSize: "80px",
              marginBottom: "32px",
              transform: `translateY(${slideIn(PROBLEM_START)}px)`,
            }}
          >
            💡
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              textAlign: "center",
              marginBottom: "32px",
              transform: `translateY(${slideIn(PROBLEM_START + 5)}px)`,
            }}
          >
            ทำไมต้องโซลาร์?
          </div>

          {/* Problem text */}
          <div
            style={{
              fontSize: "32px",
              color: tokens.colors.textMuted,
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: "850px",
              opacity: fadeIn(PROBLEM_START + 15),
              minHeight: "120px",
            }}
          >
            {problemTypewriter}
            {isTyping(frame, PROBLEM_START + 20, problemText, 1.5) && (
              <span
                style={{
                  display: "inline-block",
                  width: "3px",
                  height: "1em",
                  background: tokens.colors.primary,
                  marginLeft: "4px",
                  animation: "blink 1s infinite",
                }}
              />
            )}
          </div>

          {/* Bill highlight */}
          <div
            style={{
              marginTop: "40px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "2px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "20px",
              padding: "20px 48px",
              textAlign: "center",
              opacity: fadeIn(PROBLEM_START + 25),
            }}
          >
            <div style={{ fontSize: "24px", color: tokens.colors.textMuted, marginBottom: "8px" }}>
              ค่าไฟเฉลี่ย
            </div>
            <div style={{ fontSize: "56px", fontWeight: 800, color: tokens.colors.danger }}>
              ฿15,000/เดือน
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ============ BEFORE/AFTER SCENE ============ */}
      {frame >= BEFORE_START && frame < BEFORE_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "80px",
            opacity: beforeOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              opacity: fadeIn(BEFORE_START),
            }}
          >
            บทที่ 2 — เปรียบเทียบ
          </div>

          {/* Section title */}
          <div
            style={{
              fontSize: "44px",
              fontWeight: 700,
              color: tokens.colors.textDark,
              marginBottom: "32px",
              transform: `translateY(${slideIn(BEFORE_START)}px)`,
            }}
          >
            ก่อน &amp; หลัง
          </div>

          {/* Slider */}
          <div
            style={{
              width: "920px",
              height: "620px",
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* After */}
            <Img
              src={staticFile(afterImage)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Before (clipped) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <Img
                src={staticFile(beforeImage)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            {/* Slider line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${sliderPos}%`,
                width: "4px",
                height: "100%",
                background: "#fff",
                boxShadow: "0 0 12px rgba(0,0,0,0.5)",
              }}
            />
            {/* Labels */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: tokens.radius.sm,
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              ก่อน
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                background: "rgba(16,185,129,0.8)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: tokens.radius.sm,
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              หลัง
            </div>
          </div>

          {/* Solution text */}
          <div
            style={{
              fontSize: "28px",
              color: tokens.colors.textMuted,
              textAlign: "center",
              maxWidth: "800px",
              marginTop: "32px",
              lineHeight: 1.5,
              opacity: fadeIn(BEFORE_START + 30),
              minHeight: "80px",
            }}
          >
            {solutionTypewriter}
            {isTyping(frame, BEFORE_START + 30, solutionText, 1.5) && (
              <span
                style={{
                  display: "inline-block",
                  width: "3px",
                  height: "1em",
                  background: tokens.colors.primary,
                  marginLeft: "4px",
                  animation: "blink 1s infinite",
                }}
              />
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ INSTALLATION PHOTOS WITH TEXT ============ */}
      {frame >= INSTALL_START && frame < INSTALL_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "60px",
            opacity: installOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "12px",
              opacity: fadeIn(INSTALL_START),
            }}
          >
            บทที่ 3 — การติดตั้ง
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: tokens.colors.textDark,
              marginBottom: "8px",
              transform: `translateY(${slideIn(INSTALL_START)}px)`,
            }}
          >
            ขั้นตอนการติดตั้ง
          </div>
          <div
            style={{
              fontSize: "24px",
              color: tokens.colors.textMuted,
              marginBottom: "24px",
            }}
          >
            ภาพจริงจากหน้างาน
          </div>

          {/* Photo card with text overlay */}
          <div
            style={{
              width: "880px",
              height: "580px",
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <Img
              src={staticFile(installationPhotos[installIdx])}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Step text overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                padding: "60px 32px 32px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: tokens.colors.primary,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                ขั้นตอนที่ {installIdx + 1}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {installationSteps[installIdx]}
              </div>
            </div>
            {/* Photo counter */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: tokens.radius.badge,
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {installIdx + 1} / {installationPhotos.length}
            </div>
          </div>

          {/* Dots */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {installationPhotos.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: i === installIdx ? tokens.colors.primary : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {/* Standards text */}
          <div
            style={{
              fontSize: "24px",
              color: tokens.colors.textMuted,
              textAlign: "center",
              maxWidth: "800px",
              marginTop: "24px",
              lineHeight: 1.5,
              opacity: fadeIn(INSTALL_START + 60),
              minHeight: "72px",
            }}
          >
            {standardsTypewriter}
            {isTyping(frame, INSTALL_START + 60, standardsText, 1.5) && (
              <span
                style={{
                  display: "inline-block",
                  width: "3px",
                  height: "1em",
                  background: tokens.colors.primary,
                  marginLeft: "4px",
                  animation: "blink 1s infinite",
                }}
              />
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ EQUIPMENT SCENE ============ */}
      {frame >= EQUIP_START && frame < EQUIP_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            opacity: equipOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "24px",
              opacity: fadeIn(EQUIP_START),
            }}
          >
            บทที่ 4 — เทคโนโลยี
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              marginBottom: "40px",
              transform: `translateY(${slideIn(EQUIP_START)}px)`,
            }}
          >
            ขุมพลังเทคโนโลยี
          </div>

          {/* Equipment grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              maxWidth: "880px",
            }}
          >
            {equipment.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "28px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  opacity: fadeIn(EQUIP_START + 10 + i * 8),
                }}
              >
                <div style={{ fontSize: "40px" }}>{item.icon}</div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: tokens.colors.primary,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: tokens.colors.textDark,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ RESULT SCENE ============ */}
      {frame >= RESULT_START && frame < RESULT_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: resultOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "24px",
              opacity: fadeIn(RESULT_START),
            }}
          >
            บทที่ 5 — ผลลัพธ์
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              marginBottom: "40px",
              transform: `translateY(${slideIn(RESULT_START)}px)`,
            }}
          >
            ผลลัพธ์ที่ได้
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            {[
              { value: `${panels}`, label: "แผง", color: tokens.colors.primary },
              { value: `${powerKw}kW`, label: "กำลังผลิต", color: tokens.colors.accent2 },
              { value: monthlySavings, label: "ประหยัด/เดือน", color: tokens.colors.savings },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "24px 36px",
                  textAlign: "center",
                  minWidth: "200px",
                  opacity: fadeIn(RESULT_START + 10 + i * 8),
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    color: stat.color,
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: tokens.colors.textMuted,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Annual savings highlight */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
              border: "2px solid rgba(16,185,129,0.3)",
              borderRadius: "20px",
              padding: "24px 56px",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                color: tokens.colors.textMuted,
                marginBottom: "8px",
              }}
            >
              ประหยัดต่อปี
            </div>
            <div
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: tokens.colors.primary,
              }}
            >
              {annualSavings}
            </div>
          </div>

          {/* Payback */}
          <div
            style={{
              fontSize: "32px",
              color: tokens.colors.textDark,
              background: "rgba(59, 130, 246, 0.15)",
              padding: "16px 48px",
              borderRadius: tokens.radius.badge,
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            คืนทุนใน {payback}
          </div>
        </AbsoluteFill>
      )}

      {/* ============ QUOTE SCENE ============ */}
      {frame >= QUOTE_START && frame < QUOTE_END && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            opacity: quoteOpacity,
          }}
        >
          {/* Chapter badge */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: tokens.colors.primary,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "40px",
              opacity: fadeIn(QUOTE_START),
            }}
          >
            บทที่ 6 — ความคิดเห็น
          </div>

          {/* Quote mark */}
          <div
            style={{
              fontSize: "120px",
              color: tokens.colors.primary,
              opacity: 0.3,
              lineHeight: 1,
              marginBottom: "-20px",
              transform: `translateY(${slideIn(QUOTE_START)}px)`,
            }}
          >
            &ldquo;
          </div>

          {/* Quote text */}
          <div
            style={{
              fontSize: "36px",
              fontStyle: "italic",
              color: tokens.colors.textDark,
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: "800px",
              marginBottom: "32px",
            }}
          >
            {quote}
          </div>

          {/* Client */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Avatar placeholder */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF8A00, #E67A00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {clientName.charAt(0)}
            </div>
            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: tokens.colors.textDark,
                }}
              >
                {clientName}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: tokens.colors.textMuted,
                }}
              >
                เจ้าของวิลล่า
              </div>
            </div>
          </div>

          {/* Rating stars */}
          <div
            style={{
              marginTop: "32px",
              fontSize: "36px",
              letterSpacing: "8px",
              opacity: fadeIn(QUOTE_START + 20),
            }}
          >
            ⭐⭐⭐⭐⭐
          </div>
        </AbsoluteFill>
      )}

      {/* ============ CTA SCENE ============ */}
      {frame >= CTA_START && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: ctaOpacity,
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: tokens.colors.textDark,
              textAlign: "center",
              marginBottom: "24px",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            พร้อมเริ่มต้น<br />
            <span style={{ color: tokens.colors.primary }}>พลังงานสะอาด?</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: tokens.colors.textMuted,
              textAlign: "center",
              maxWidth: "700px",
              marginBottom: "40px",
              lineHeight: 1.5,
            }}
          >
            ทีมวิศวกร {videoBrand.name} พร้อมให้คำปรึกษาฟรี<br />
            ประเมินหน้างาน ออกแบบระบบ ติดตั้งครบวงจร
          </div>

          {/* CTA button */}
          <div
            style={{
              background: tokens.colors.primary,
              color: "#fff",
              padding: "28px 80px",
              borderRadius: tokens.radius.button,
              fontSize: "44px",
              fontWeight: 700,
              boxShadow: "0 12px 40px rgba(16, 185, 129, 0.4)",
              transform: `scale(${ctaPulse})`,
            }}
          >
            ปรึกษาฟรี
          </div>

          {/* Contact info */}
          <div
            style={{
              marginTop: "32px",
              fontSize: "24px",
              color: tokens.colors.textMuted,
              opacity: fadeIn(CTA_START + 30),
            }}
          >
            {videoBrand.name} — {videoBrand.tagline}
          </div>
        </AbsoluteFill>
      )}

      {/* Blink animation for typewriter cursor */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </AbsoluteFill>
  );
};
