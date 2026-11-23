// Batch 3: sofin, sigenergy, calc (web calculator), chat, line
// Usage: node scripts/i18n-batch3.mjs
import fs from 'node:fs';

const T = {
  sofin: {
    badge: { th: 'ระบบนิเวศการลงทุน SOFIN', en: 'SOFIN investment ecosystem', 'zh-CN': 'SOFIN投资生态', ru: 'Инвестиционная экосистема SOFIN' },
    titleA: { th: 'ลงทุนในโซลาร์', en: 'Invest in solar', 'zh-CN': '投资太阳能', ru: 'Инвестируйте в солнце' },
    titleB: { th: 'รับรายได้จากพลังงาน', en: 'earn from energy', 'zh-CN': '从能源中获益', ru: 'получайте доход от энергии' },
    sub: { th: 'นวัตกรรมการลงทุนในพลังงานสะอาดที่มั่นคง ปลอดภัย และสร้างผลตอบแทนที่ยั่งยืน', en: 'Secure, stable clean-energy investing with sustainable returns', 'zh-CN': '安全稳定的清洁能源投资，创造可持续回报', ru: 'Безопасные стабильные инвестиции в чистую энергию' },
    mechTitle: { th: 'กลไกการคุ้มครองเงินทุน 10/90/85', en: '10/90/85 capital protection', 'zh-CN': '10/90/85资金保障机制', ru: 'Защита капитала 10/90/85' },
    mechSub: { th: 'โมเดลที่ออกแบบมาเพื่อลดความเสี่ยงและเพิ่มความมั่นใจให้ผู้ลงทุน', en: 'Built to cut risk and boost investor confidence', 'zh-CN': '降低风险、增强投资者信心的模式', ru: 'Модель снижения риска и уверенности инвесторов' },
    ownerLabel: { th: 'ส่วนของเจ้าของ', en: 'Owner share', 'zh-CN': '业主出资', ru: 'Доля владельца' },
    ownerDesc: { th: 'เงินลงทุนเริ่มแรกจากเจ้าของโครงการ', en: 'Initial capital from the project owner', 'zh-CN': '项目业主的初始投入', ru: 'Стартовый капитал владельца проекта' },
    investLabel: { th: 'การลงทุน', en: 'Investment', 'zh-CN': '投资', ru: 'Инвестиции' },
    protectSub: { th: 'ระบบคุ้มครองเงินทุนด้วยสินทรัพย์', en: 'Asset-backed capital protection', 'zh-CN': '资产保障资金安全', ru: 'Защита капитала активами' },
    safeBadge: { th: 'ปลอดภัยและมั่นคง', en: 'Safe & secure', 'zh-CN': '安全稳健', ru: 'Безопасно и надёжно' },
    assetLabel: { th: 'สินทรัพย์', en: 'Assets', 'zh-CN': '资产', ru: 'Активы' },
    assetDesc: { th: 'ค้ำประกันด้วยแผงโซลาร์เซลล์ Tier 1 ที่เป็นกรรมสิทธิ์ของคุณโดยตรง', en: 'Backed by Tier 1 panels you directly own', 'zh-CN': '由您直接拥有的Tier 1组件担保', ru: 'Обеспечено Tier 1 панелями в вашей собственности' },
    reserveLabel: { th: 'สำรอง', en: 'Reserve', 'zh-CN': '储备金', ru: 'Резерв' },
    reserveDesc: { th: 'เงินสำรองฉุกเฉินเพื่อบริหารจัดการความเสี่ยงและสภาพคล่อง', en: 'Emergency reserve for risk and liquidity', 'zh-CN': '应急储备金，管理风险与流动性', ru: 'Экстренный резерв для рисков и ликвидности' },
    b1t: { th: 'ติดตามพอร์ตการลงทุน', en: 'Track your portfolio', 'zh-CN': '跟踪投资组合', ru: 'Отслеживайте портфель' },
    b1d: { th: 'ดูผลตอบแทนและกำไรสะสมแบบเรียลไทม์ผ่านแผงควบคุมส่วนตัวของคุณ', en: 'Real-time returns in your personal dashboard', 'zh-CN': '在个人面板实时查看收益', ru: 'Доходность в реальном времени в личном кабинете' },
    b2t: { th: 'ตรวจสอบสถานะโครงการ', en: 'Monitor projects', 'zh-CN': '监控项目', ru: 'Мониторинг проектов' },
    b2d: { th: 'ติดตามขั้นตอนการติดตั้งและการชำระเงินได้ทุกที่ทุกเวลาอย่างโปร่งใส', en: 'Transparent install and payment tracking, anytime', 'zh-CN': '随时随地透明跟踪安装与付款', ru: 'Прозрачный трекинг монтажа и платежей' },
    b3t: { th: 'ความปลอดภัยระดับสูง', en: 'Top-grade security', 'zh-CN': '顶级安全', ru: 'Высшая безопасность' },
    b3d: { th: 'มั่นใจด้วยระบบรักษาความปลอดภัยมาตรฐานสากล ปกป้องทุกข้อมูลสำคัญ', en: 'International-standard security protecting all key data', 'zh-CN': '国际标准安保，保护重要数据', ru: 'Безопасность мирового уровня для ваших данных' },
    stdLabel: { th: 'มาตรฐานระดับสากล', en: 'International standard', 'zh-CN': '国际标准', ru: 'Мировой стандарт' },
    cta: { th: 'เริ่มลงทุนอย่างปลอดภัย', en: 'Start investing safely', 'zh-CN': '安全开始投资', ru: 'Начать безопасно инвестировать' },
  },
  sigenergy: {
    badge: { th: 'เทคโนโลยีโซลาร์ระดับพรีเมียม', en: 'Premium solar technology', 'zh-CN': '高端太阳能技术', ru: 'Премиальные солнечные технологии' },
    titleB: { th: '5-in-One ระบบแรกของโลก', en: "World's first 5-in-One", 'zh-CN': '全球首款5合1', ru: 'Первая в мире 5-в-1' },
    subA: { th: 'ปฏิวัติวงการโซลาร์ด้วยระบบ AI Hybrid ที่รวมทุกอย่างไว้ในหนึ่งเดียว', en: 'A revolutionary AI-hybrid all-in-one solar system', 'zh-CN': 'AI混合一体机，革新太阳能行业', ru: 'Революционная AI-гибридная всё-в-одном система' },
    subB: { th: 'ดีไซน์พรีเมียม ประสิทธิภาพสูงสุด และความปลอดภัยระดับโลก', en: 'Premium design, peak efficiency, world-class safety', 'zh-CN': '高端设计，极致效率，世界级安全', ru: 'Премиум-дизайн, максимум эффективности, мировая безопасность' },
    f1t: { th: 'ระบบจัดการพลังงาน AI', en: 'AI energy management', 'zh-CN': 'AI能源管理', ru: 'AI-управление энергией' },
    f1d: { th: 'สมองกลอัจฉริยะวิเคราะห์การใช้ไฟแบบเรียลไทม์ เพื่อการประหยัดสูงสุด', en: 'Smart analytics of usage in real time for max savings', 'zh-CN': '实时智能分析用电，最大化节能', ru: 'Умный анализ потребления в реальном времени' },
    f2t: { th: 'แบตเตอรี่แบบโมดูลาร์', en: 'Modular battery', 'zh-CN': '模块化电池', ru: 'Модульный аккумулятор' },
    f2d: { th: 'ปรับเพิ่มความจุได้ตามต้องการ ตั้งแต่ 5kWh ถึง 48kWh ต่อชุด', en: 'Expandable from 5kWh to 48kWh per stack', 'zh-CN': '单组容量5kWh至48kWh可扩展', ru: 'Расширение от 5 до 48 кВт·ч' },
    f3t: { th: 'ที่ชาร์จรถไฟฟ้าในตัว', en: 'Built-in EV charger', 'zh-CN': '内置电车充电', ru: 'Встроенная EV-зарядка' },
    f3d: { th: 'รองรับการชาร์จรถไฟฟ้าด้วยพลังงานสะอาด 100% โดยไม่ต้องเดินสายใหม่', en: '100% clean EV charging with no rewiring', 'zh-CN': '100%清洁能源充电，无需重新布线', ru: 'Зарядка EV чистой энергией без новой проводки' },
    f4t: { th: 'ความปลอดภัยระดับสูงสุด', en: 'Maximum safety', 'zh-CN': '极致安全', ru: 'Максимум безопасности' },
    f4d: { th: 'มาตรฐานความปลอดภัยระดับสูง พร้อมระบบดับเพลิงอัตโนมัติในตัว', en: 'High safety standards with built-in auto fire suppression', 'zh-CN': '高安全标准，内置自动灭火', ru: 'Высокие стандарты и автопожаротушение' },
    cta: { th: 'ชมแพ็กเกจราคาพรีเมียม', en: 'View premium packages', 'zh-CN': '查看高端套餐', ru: 'Премиум-пакеты' },
    hotInverter: { th: 'อินเวอร์เตอร์อัจฉริยะ', en: 'Smart inverter', 'zh-CN': '智能逆变器', ru: 'Умный инвертор' },
    hotBattery: { th: 'โมดูลแบตเตอรี่', en: 'Battery module', 'zh-CN': '电池模块', ru: 'Аккумуляторный модуль' },
    hotEv: { th: 'ที่ชาร์จ EV', en: 'EV charger', 'zh-CN': '电车充电', ru: 'EV-зарядка' },
    m1label: { th: 'เวลาสลับระบบ', en: 'Switchover time', 'zh-CN': '切换时间', ru: 'Время переключения' },
    m1sub: { th: 'ระบบสำรองไฟเร็วที่สุด', en: 'Fastest backup', 'zh-CN': '最快的备用电源', ru: 'Самый быстрый бэкап' },
    m2label: { th: 'ประสิทธิภาพพลังงาน', en: 'Energy efficiency', 'zh-CN': '能源效率', ru: 'Эффективность' },
    m2sub: { th: 'ประสิทธิภาพสูงสุด', en: 'Peak performance', 'zh-CN': '极致性能', ru: 'Пиковая мощность' },
    m3label: { th: 'การรับประกันสินค้า', en: 'Product warranty', 'zh-CN': '产品质保', ru: 'Гарантия' },
    m3sub: { th: 'การรับประกันยาวนาน', en: 'Long warranty', 'zh-CN': '超长质保', ru: 'Долгая гарантия' },
    m4label: { th: 'ควบคุมอัจฉริยะ', en: 'Smart control', 'zh-CN': '智能控制', ru: 'Умное управление' },
    m4sub: { th: 'รองรับอนาคต', en: 'Future-ready', 'zh-CN': '面向未来', ru: 'Готовность к будущему' },
  },
  calc: {
    stepBuilding: { th: 'ประเภทอาคาร', en: 'Building type', 'zh-CN': '建筑类型', ru: 'Тип здания' },
    stepBuildingSub: { th: 'ต้องการติดตั้งที่ไหนครับ?', en: 'Where to install?', 'zh-CN': '想装在哪里？', ru: 'Где ставить?' },
    stepBill: { th: 'ค่าไฟฟ้าต่อเดือน', en: 'Monthly power bill', 'zh-CN': '每月电费', ru: 'Месячный счёт за свет' },
    stepBillSub: { th: 'ค่าไฟเฉลี่ยของคุณประมาณเท่าไหร่?', en: 'Roughly how much is your average bill?', 'zh-CN': '您的平均电费大概多少？', ru: 'Сколько в среднем платите?' },
    stepRoof: { th: 'ประเภทหลังคา', en: 'Roof type', 'zh-CN': '屋顶类型', ru: 'Тип крыши' },
    stepRoofSub: { th: 'ลักษณะหลังคาเป็นแบบไหนครับ?', en: 'What is your roof like?', 'zh-CN': '您的屋顶是什么样的？', ru: 'Какая у вас крыша?' },
    stepLoc: { th: 'พื้นที่ติดตั้ง', en: 'Installation area', 'zh-CN': '安装地区', ru: 'Район установки' },
    stepLocSub: { th: 'คุณอยู่ที่จังหวัดไหนครับ?', en: 'Which province are you in?', 'zh-CN': '您在哪个府？', ru: 'В какой вы провинции?' },
    moreThan: { th: 'มากกว่า 50,000 ฿', en: 'Over 50,000 ฿', 'zh-CN': '超过50,000฿', ru: 'Более 50 000 ฿' },
    analyzing: { th: 'กำลังวิเคราะห์ข้อมูล...', en: 'Analyzing...', 'zh-CN': '分析中…', ru: 'Анализ…' },
    analyzingSub: { th: 'AI แทนกำลังคำนวณจุดคืนทุนที่คุ้มค่าที่สุดสำหรับคุณ', en: 'AI is finding your optimal payback', 'zh-CN': 'AI正在为您计算最划算的回本点', ru: 'AI считает вашу оптимальную окупаемость' },
    bldRes: { th: 'บ้านพักอาศัย', en: 'Residential home', 'zh-CN': '住宅', ru: 'Жилой дом' },
    bldResD: { th: 'บ้านเดี่ยว / วิลล่า', en: 'House / villa', 'zh-CN': '独栋/别墅', ru: 'Дом / вилла' },
    bldCom: { th: 'ร้านค้า / ออฟฟิศ', en: 'Shop / office', 'zh-CN': '商店/办公室', ru: 'Магазин / офис' },
    bldComD: { th: 'อาคารพาณิชย์ / สำนักงาน', en: 'Commercial building / office', 'zh-CN': '商业楼/写字楼', ru: 'Коммерческое здание / офис' },
    bldInd: { th: 'โรงงาน / โกดัง', en: 'Factory / warehouse', 'zh-CN': '工厂/仓库', ru: 'Завод / склад' },
    bldIndD: { th: 'โรงงานอุตสาหกรรม / คลังสินค้า', en: 'Industrial plant / storage', 'zh-CN': '工业厂房/仓储', ru: 'Производство / склад' },
    roofConcrete: { th: 'หลังคาคอนกรีต', en: 'Concrete roof', 'zh-CN': '混凝土屋顶', ru: 'Бетонная крыша' },
    roofConcreteD: { th: 'หลังคาซีแพค / ดาดฟ้าคอนกรีต', en: 'Tile / concrete slab', 'zh-CN': '瓦屋面/混凝土', ru: 'Черепица / бетон' },
    roofMetal: { th: 'หลังคาเมทัลชีท', en: 'Metal sheet roof', 'zh-CN': '彩钢瓦屋顶', ru: 'Металлическая крыша' },
    roofMetalD: { th: 'หลังคาเหล็ก / แผ่นเมทัลชีท', en: 'Steel / metal sheets', 'zh-CN': '钢结构/彩钢板', ru: 'Сталь / профлист' },
    roofGround: { th: 'ติดตั้งบนพื้นดิน', en: 'Ground mount', 'zh-CN': '地面安装', ru: 'Наземный монтаж' },
    roofGroundD: { th: 'พื้นที่ว่างรอบอาคาร', en: 'Open space around building', 'zh-CN': '建筑周边空地', ru: 'Свободная территория' },
    locKrabi: { th: 'จังหวัดกระบี่', en: 'Krabi province', 'zh-CN': '甲米府', ru: 'Провинция Краби' },
    locKrabiD: { th: 'พื้นที่ในจังหวัดกระบี่', en: 'Areas in Krabi', 'zh-CN': '甲米府内地区', ru: 'Районы Краби' },
    locPhuket: { th: 'จังหวัดภูเก็ต', en: 'Phuket province', 'zh-CN': '普吉府', ru: 'Провинция Пхукет' },
    locPhuketD: { th: 'พื้นที่ในจังหวัดภูเก็ต', en: 'Areas in Phuket', 'zh-CN': '普吉府内地区', ru: 'Районы Пхукета' },
    locOther: { th: 'พื้นที่อื่นๆ', en: 'Other areas', 'zh-CN': '其他地区', ru: 'Другие районы' },
    locOtherD: { th: 'จังหวัดอื่นๆ ในประเทศไทย', en: 'Other Thai provinces', 'zh-CN': '泰国其他府', ru: 'Другие провинции Таиланда' },
  },
  line: {
    hello: { th: 'สวัสดี, {name}', en: 'Hello, {name}', 'zh-CN': '您好，{name}', ru: 'Здравствуйте, {name}' },
    connectLine: { th: 'เชื่อมต่อ LINE', en: 'Connect LINE', 'zh-CN': '连接LINE', ru: 'Подключить LINE' },
    loginLine: { th: 'เข้าสู่ระบบ LINE', en: 'Log in with LINE', 'zh-CN': 'LINE登录', ru: 'Войти через LINE' },
  },
};

for (const loc of ['th', 'en', 'zh-CN', 'ru']) {
  const p = 'messages/' + loc + '.json';
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const ns of Object.keys(T)) {
    m[ns] = m[ns] || {};
    for (const k of Object.keys(T[ns])) m[ns][k] = T[ns][k][loc];
  }
  fs.writeFileSync(p, JSON.stringify(m, null, 1) + '\n');
}
console.log('BATCH3-OK');
