import { Composition, registerRoot } from "remotion";
import { ProductStory } from "./compositions/ProductStory";
import { AIConsultStory } from "./compositions/AIConsultStory";
import { CaseStudyStory } from "./compositions/CaseStudyStory";
import { SavingsStory } from "./compositions/SavingsStory";
import { BeforeAfterStory } from "./compositions/BeforeAfterStory";
import { BrandStory } from "./compositions/BrandStory";
import { LandingStory } from "./compositions/LandingStory";
import { ProductCarouselStory } from "./compositions/ProductCarouselStory";
import { ROICalculatorStory } from "./compositions/ROICalculatorStory";
import { EnergyFlowStory } from "./compositions/EnergyFlowStory";
import { DayNightStory } from "./compositions/DayNightStory";
import { ProductEcosystemStory } from "./compositions/ProductEcosystemStory";
import { KrabiCaseStory } from "./compositions/KrabiCaseStory";
import { InvestmentComparisonStory } from "./compositions/InvestmentComparisonStory";
import { ElectricityBillShockStory } from "./compositions/ElectricityBillShockStory";
import { Day365Story } from "./compositions/Day365Story";
import { MythBusterStory } from "./compositions/MythBusterStory";
import { POVSolarDayStory } from "./compositions/POVSolarDayStory";
import { KineticShowcaseStory } from "./compositions/KineticShowcaseStory";
import { KineticStory15s } from "./compositions/KineticStory15s";
import { KineticStory20s } from "./compositions/KineticStory20s";
import { KineticStory20sCase2 } from "./compositions/KineticStory20s-Case2";
import { KineticStory20sParametric } from "./compositions/KineticStory20sParametric";
import {
  RoofTeamStory,
  roofTeamStoryDefaults,
} from "./compositions/solar2/RoofTeamStory";
import {
  FamilySavingsStory,
  familySavingsStoryDefaults,
} from "./compositions/solar2/FamilySavingsStory";
import {
  InverterTier1Story,
  inverterTier1StoryDefaults,
} from "./compositions/solar2/InverterTier1Story";
import {
  KrabiWeatherStory,
  krabiWeatherStoryDefaults,
} from "./compositions/solar2/KrabiWeatherStory";
import {
  BusinessRoiStory,
  businessRoiStoryDefaults,
} from "./compositions/solar2/BusinessRoiStory";
import { RoofTeamStoryH } from "./compositions/solar2/RoofTeamStoryH";
import { BusinessRoiStoryH } from "./compositions/solar2/BusinessRoiStoryH";
import {
  CaseVillaStoryH,
  caseVillaStoryHDefaults,
} from "./compositions/solar2/CaseVillaStoryH";
import {
  CaseVillaStory,
  caseVillaStoryDefaults,
} from "./compositions/solar2/CaseVillaStory";
import { SHOWROOM_TYPE_DURATION, ShowroomTypeLoop } from "./compositions/solar3/ShowroomTypeLoop";
import {
  SHOWROOM_TYPE_LOOP_B_DURATION,
  ShowroomTypeLoopB,
} from "./compositions/solar3/ShowroomTypeLoopB";
import {
  SHOWROOM_TYPE_LOOP_C_DURATION,
  ShowroomTypeLoopC,
} from "./compositions/solar3/ShowroomTypeLoopC";
import { Showroom, SHOWROOM_FRAMES } from "./showroom/Showroom";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductStory"
        component={ProductStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          name: "ชุดโซลาร์ 5 kW (GoodWe)",
          brand: "GoodWe",
          price: "฿120,000",
          savings: "฿2,500/เดือน",
          warranty: "30 ปี",
          image: "/content/products/goodwe-5kw-1phase/main.webp",
          highlights: [
            "ลดค่าไฟ ฿2,500/เดือน",
            "รับประกันแผง 30 ปี",
            "ติดตั้งฟรี! ขออนุญาต PEA/MEA ฟรี",
            "ระบบ Monitoring ผ่าน APP"
          ]
        }}
      />

      <Composition
        id="AIConsultStory"
        component={AIConsultStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "ถาม AI ได้ทุกเรื่องโซลาร์",
          features: [
            "คำนวณค่าไฟให้ฟรี",
            "แนะนำระบบเหมาะกับบ้าน",
            "ตอบทันที 24 ชม.",
            "ไม่ต้องรอพนักงาน"
          ],
          chatDemo: [
            { user: "บ้านใช้ไฟ 3,000/เดือน ต้องติดกี่กิโลวัตต์?", ai: "แนะนำระบบ 5kW ประหยัดได้ ฿2,500/เดือน คืนทุน 4 ปี" },
            { user: "ราคาเท่าไหร่?", ai: "ชุด GoodWe 5kW ราคา ฿120,000 พร้อมติดตั้งครบวงจร" },
            { user: "มีรับประกันไหม?", ai: "รับประกันแผง 30 ปี อินเวอร์เตอร์ 5 ปี บริการหลังการขายฟรี!" }
          ]
        }}
      />

      <Composition
        id="CaseStudyStory"
        component={CaseStudyStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "วิลล่ากระบี่ — ระบบ 10kW",
          location: "จังหวัดกระบี่",
          system: "Deye Hybrid + Dyness 10kWh",
          panels: 16,
          annualSavings: "฿95,000",
          payback: "4.5 ปี",
          beforeImage: "/images/krabi-001.png",
          afterImage: "/images/1779681091103.jpg",
          quote: "ระบบช่วยลดค่าไฟได้มาก!"
        }}
      />

      <Composition
        id="SavingsStory"
        component={SavingsStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          monthlyBill: 5000,
          systemPower: 10,
          monthlySavings: 4500,
          annualSavings: 54000,
          paybackYears: 4.2,
          lifetimeSavings: 1350000
        }}
      />

      <Composition
        id="BeforeAfterStory"
        component={BeforeAfterStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "เปลี่ยนหลังคาเป็นโรงไฟฟ้า",
          beforeImage: "/images/krabi-002.png",
          afterImage: "/images/1779681103039.jpg",
          system: "20kW Hybrid",
          savings: "฿180,000/ปี"
        }}
      />

      <Composition
        id="LandingStory"
        component={LandingStory}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ProductCarouselStory"
        component={ProductCarouselStory}
        durationInFrames={525}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="BrandStory"
        component={BrandStory as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          tagline: "พลังงานสะอาดสำหรับกระบี่",
          stats: [
            { value: "500+", label: "โครงการ" },
            { value: "10 ปี", label: "ประสบการณ์" },
            { value: "30 ปี", label: "รับประกัน" }
          ]
        }}
      />

      <Composition
        id="ROICalculatorStory"
        component={ROICalculatorStory}
        durationInFrames={525}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="EnergyFlowStory"
        component={EnergyFlowStory}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="DayNightStory"
        component={DayNightStory}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ProductEcosystemStory"
        component={ProductEcosystemStory}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "โซลาร์ครบทุกประเภท",
          homeName: "GoodWe 5 kW",
          homePrice: "฿120,000",
          homeSavings: "ลดค่าไฟ ฿2,500/เดือน",
          bizName: "ระบบ 20kW Hybrid",
          bizPrice: "฿380,000",
          bizRoi: "ROI 4 ปี",
          premiumName: "Sigenergy 5-in-1",
          premiumPrice: "฿250,000",
          premiumFeatures: ["Inverter + Battery", "EV Charger", "MPPT", "EMS"],
          components: [
            { name: "แผงโซลาร์", icon: "☀️" },
            { name: "อินเวอร์เตอร์", icon: "⚡" },
            { name: "แบตเตอรี่", icon: "🔋" },
          ],
          ctaText: "เลือกระบบที่เหมาะกับคุณ",
        }}
      />

      <Composition
        id="KrabiCaseStory"
        component={KrabiCaseStory}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "วิลล่ากระบี่ — ระบบ 10kW",
          location: "จังหวัดกระบี่",
          system: "Deye Hybrid + Dyness 10kWh",
          panels: 16,
          powerKw: 10,
          annualSavings: "฿95,000",
          monthlySavings: "฿7,900",
          payback: "4.5 ปี",
          beforeImage: "images/krabi-002.png",
          afterImage: "images/1779681091103.jpg",
          galleryImages: [
            "images/krabi-002-gallery-01.png",
            "images/krabi-002-gallery-02.png",
            "images/1779681103039.jpg",
            "images/1779681103087.jpg",
          ],
          installationPhotos: [
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
          quote: "ระบบช่วยลดค่าไฟได้มาก คุ้มค่าจริงๆ ครับ",
          clientName: "คุณสมชาย",
          systemDetails: [
            "Deye SUN-10K-SG04LP1-EU Hybrid",
            " Dyness BX51100 10kWh",
            "แผง 16 แผง 450W",
            "MECER ATS Transfer Switch",
          ],
          problemText: "วิลล่าขนาดใหญ่ในกระบี่ มีค่าไฟสูงถึง ฿15,000/เดือน จากเครื่องปรับอากาศหลายเครื่องและระบบไฟฟ้าครบวงจร",
          solutionText: "ติดตั้งระบบไฮบริด 10kW ที่ทำงานอัตโนมัติตลอด 24 ชม. — ผลิตไฟจากแสงแดดตอนกลางวัน เก็บไว้ในแบตเตอรี่สำหรับกลางคืน",
          standardsText: "ทีมวิศวกรใช้โครงสร้างอลูมิเนียมเกรดสูง ทนทานต่อไอทะเล พร้อมระบบป้องกันฟ้าผ่าตามมาตรฐานวิศวกรรมไฟฟ้า",
          equipment: [
            { title: "อินเวอร์เตอร์", desc: "Deye SUN-10K-SG04LP1-EU Hybrid", icon: "⚡" },
            { title: "แผงโซลาร์", desc: "16 แผง 450W — ประสิทธิภาพสูง", icon: "☀️" },
            { title: "แบตเตอรี่", desc: "Dyness BX51100 10kWh — สำรองไฟทั้งคืน", icon: "🔋" },
            { title: "ระบบยึด", desc: "Aluminum High-Grade — ทนไอทะเล", icon: "🔧" },
          ],
          installationSteps: [
            "สำรวจหน้างานและออกแบบระบบ",
            "ติดตั้งโครงสร้างยึดแผงบนหลังคา",
            "เดินสายไฟและต่ออินเวอร์เตอร์",
            "ติดตั้งแผงโซลาร์ 16 แผง",
            "ต่อแบตเตอรี่ Dyness 10kWh",
            "ทดสอบระบบและเปิดใช้งาน",
          ],
        }}
      />

      <Composition
        id="InvestmentComparisonStory"
        component={InvestmentComparisonStory}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ElectricityBillShockStory"
        component={ElectricityBillShockStory}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="Day365Story"
        component={Day365Story}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="MythBusterStory"
        component={MythBusterStory}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="POVSolarDayStory"
        component={POVSolarDayStory}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="KineticShowcaseStory"
        component={KineticShowcaseStory}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="KineticStory15s"
        component={KineticStory15s}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="KineticStory20s"
        component={KineticStory20s}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="KineticStory20sCase2"
        component={KineticStory20sCase2}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ── OpenDesign 2.0: фото-ролики (дизайн-2.0 токены, Sarabun) ── */}
      <Composition
        id="SolarRoofTeamStory"
        component={RoofTeamStory as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={roofTeamStoryDefaults as any}
      />

      <Composition
        id="SolarFamilySavingsStory"
        component={FamilySavingsStory as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={familySavingsStoryDefaults as any}
      />

      <Composition
        id="SolarInverterTier1Story"
        component={InverterTier1Story as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={inverterTier1StoryDefaults as any}
      />

      <Composition
        id="SolarKrabiWeatherStory"
        component={KrabiWeatherStory as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={krabiWeatherStoryDefaults as any}
      />

      <Composition
        id="SolarBusinessRoiStory"
        component={BusinessRoiStory as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={businessRoiStoryDefaults as any}
      />

      {/* ── Горизонтальные копии (16:9) для YouTube/сайта ── */}
      <Composition
        id="SolarRoofTeamStoryH"
        component={RoofTeamStoryH as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={roofTeamStoryDefaults as any}
      />

      <Composition
        id="SolarBusinessRoiStoryH"
        component={BusinessRoiStoryH as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={businessRoiStoryDefaults as any}
      />

      <Composition
        id="SolarCaseVillaStoryH"
        component={CaseVillaStoryH as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={caseVillaStoryHDefaults as any}
      />

      <Composition
        id="SolarCaseVillaStory"
        component={CaseVillaStory as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={caseVillaStoryDefaults as any}
      />

      <Composition
        id="KineticStory20sParametric"
        component={KineticStory20sParametric as any}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          productName: "GoodWe 10 kW Hybrid",
          productBrand: "GoodWe",
          powerKw: 10,
          priceThb: "฿228,000",
          panelCount: 16,
          panelBrand: "Jinko 715W",
          batteryName: "Dyness 10kWh",
          batteryKwh: "10kWh",
          warrantyYears: 30,
          paybackYears: "~4.5",
          monthlySavings: 7900,
          annualSavings: 95000,
          monthlyBillBefore: 15000,
          monthlyBillAfter: 7100,
          productImage: "content/products/goodwe-10kw-inverter/main.webp",
          caseImage: "images/krabi-001.png",
          caseGallery: ["images/1779681103039.jpg", "images/1779681103087.jpg", "images/1779681091103.jpg"],
          locationName: "กระบี่",
          systemType: "Hybrid"
        }}
      />
            <Composition
        id="Solar3ShowroomTypeLoop"
        component={ShowroomTypeLoop as any}
        durationInFrames={SHOWROOM_TYPE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Solar3ShowroomTypeLoopB"
        component={ShowroomTypeLoopB as any}
        durationInFrames={SHOWROOM_TYPE_LOOP_B_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Solar3ShowroomTypeLoopC"
        component={ShowroomTypeLoopC as any}
        durationInFrames={SHOWROOM_TYPE_LOOP_C_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Мастер-план: тема/контент из props, длительность — от реальной озвучки */}
      <Composition
        id="SolarShowroom9x16"
        component={Showroom}
        durationInFrames={SHOWROOM_FRAMES['business-roi'] ?? 500}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ topic: 'business-roi', theme: 'ds2' } as const}
        calculateMetadata={({ props }) => ({
          durationInFrames: SHOWROOM_FRAMES[props.topic] ?? 500,
        })}
      />
      <Composition
        id="SolarShowroom16x9"
        component={Showroom}
        durationInFrames={SHOWROOM_FRAMES['business-roi'] ?? 500}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ topic: 'business-roi', theme: 'ds2' } as const}
        calculateMetadata={({ props }) => ({
          durationInFrames: SHOWROOM_FRAMES[props.topic] ?? 500,
        })}
      />
    </>
  );
};

registerRoot(RemotionRoot);
