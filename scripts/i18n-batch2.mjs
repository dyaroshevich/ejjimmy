// Batch 2: products (grid/card/detail), cases, knowledge
// Usage: node scripts/i18n-batch2.mjs
import fs from 'node:fs';

const T = {
  products: {
    title: { th: 'แคตตาล็อกอุปกรณ์', en: 'Equipment catalog', 'zh-CN': '设备目录', ru: 'Каталог оборудования' },
    sub: { th: 'เลือกสรรอุปกรณ์คุณภาพสูงมาตรฐานสากล เพื่อประสิทธิภาพสูงสุดในระยะยาว', en: 'Top-tier international-standard equipment for lasting performance', 'zh-CN': '精选国际标准高品质设备，长期高效', ru: 'Лучшее оборудование мировых стандартов для долгой службы' },
    catHome: { th: 'ระบบสำหรับบ้าน', en: 'Home systems', 'zh-CN': '家庭系统', ru: 'Для дома' },
    catBusiness: { th: 'ระบบสำหรับธุรกิจ', en: 'Business systems', 'zh-CN': '商业系统', ru: 'Для бизнеса' },
    catHybrid: { th: 'ระบบพรีเมียม (Hybrid)', en: 'Premium systems (Hybrid)', 'zh-CN': '高端系统（混合）', ru: 'Премиум-системы (Hybrid)' },
    catComponents: { th: 'อุปกรณ์และอื่นๆ', en: 'Components & more', 'zh-CN': '配件及其他', ru: 'Комплектующие и другое' },
    empty: { th: 'ไม่พบข้อมูลอุปกรณ์ในหมวดนี้', en: 'No equipment in this category', 'zh-CN': '该类别暂无设备', ru: 'В категории нет оборудования' },
    showMore: { th: 'แสดงเพิ่มเติม', en: 'Show more', 'zh-CN': '显示更多', ru: 'Показать ещё' },
    priceAsk: { th: 'สอบถามราคา', en: 'Ask for price', 'zh-CN': '询价', ru: 'Узнать цену' },
    typeSystem: { th: 'ชุดระบบโซลาร์', en: 'Solar system kit', 'zh-CN': '太阳能系统套装', ru: 'Комплект солнечной системы' },
    typePackage: { th: 'ชุดแพ็กเกจ', en: 'Package kit', 'zh-CN': '套餐', ru: 'Пакет' },
    typePanel: { th: 'แผงโซลาร์เซลล์', en: 'Solar panels', 'zh-CN': '太阳能板', ru: 'Солнечные панели' },
    typeInverter: { th: 'อินเวอร์เตอร์', en: 'Inverter', 'zh-CN': '逆变器', ru: 'Инвертор' },
    typeBattery: { th: 'แบตเตอรี่', en: 'Battery', 'zh-CN': '电池', ru: 'Аккумулятор' },
    typeCharger: { th: 'เครื่องชาร์จ EV', en: 'EV charger', 'zh-CN': '电动汽车充电桩', ru: 'Зарядка для EV' },
    typeMounting: { th: 'โครงสร้างจับยึด', en: 'Mounting structure', 'zh-CN': '支架结构', ru: 'Монтажная конструкция' },
    typeAccessory: { th: 'อุปกรณ์เสริม', en: 'Accessories', 'zh-CN': '配件', ru: 'Аксессуары' },
    fullPrice: { th: 'ราคาเต็ม', en: 'Full price', 'zh-CN': '总价', ru: 'Полная цена' },
    perMonth: { th: '/ด.', en: '/mo', 'zh-CN': '/月', ru: '/мес' },
    price: { th: 'ราคา', en: 'Price', 'zh-CN': '价格', ru: 'Цена' },
    installStart: { th: 'ผ่อนเริ่มต้น', en: 'Installments from', 'zh-CN': '分期低至', ru: 'Рассрочка от' },
    savePower: { th: 'ประหยัดค่าไฟ', en: 'Power savings', 'zh-CN': '省电', ru: 'Экономия' },
    monthlyInst: { th: 'ยอดผ่อนรายเดือน', en: 'Monthly installment', 'zh-CN': '月供', ru: 'Ежемесячный платёж' },
    roiPlan: { th: 'ROI แพลน', en: 'ROI Plan', 'zh-CN': 'ROI方案', ru: 'ROI-план' },
    details: { th: 'ดูรายละเอียด', en: 'View details', 'zh-CN': '查看详情', ru: 'Подробнее' },
    ctaSystem: { th: 'สอบถามราคาและผ่อน', en: 'Ask price & installments', 'zh-CN': '咨询价格与分期', ru: 'Цена и рассрочка' },
    ctaOther: { th: 'สอบถามข้อมูล', en: 'Ask for info', 'zh-CN': '咨询详情', ru: 'Задать вопрос' },
    msgSystem: { th: 'สนใจจองแพ็กเกจ {name} ครับ', en: "I'd like to book the {name} package", 'zh-CN': '我想预订{name}套餐', ru: 'Хочу заказать пакет {name}' },
    msgOther: { th: 'สนใจสั่งซื้อ หรือ สอบถามข้อมูลเพิ่มเติมเกี่ยวกับ {name} ครับ', en: "I'd like to order or ask about {name}", 'zh-CN': '我想订购或咨询{name}', ru: 'Хочу заказать или узнать о {name} больше' },
    sysKw: { th: 'ระบบ {kw} kW', en: '{kw} kW system', 'zh-CN': '{kw}kW系统', ru: 'Система {kw} кВт' },
    totalVat: { th: 'ราคาเต็มรวมภาษี', en: 'Full price incl. VAT', 'zh-CN': '含税总价', ru: 'Цена с НДС' },
    includesInstall: { th: 'รวมอุปกรณ์และติดตั้ง', en: 'Incl. equipment & install', 'zh-CN': '含设备与安装', ru: 'Оборудование и монтаж включены' },
    estSave: { th: 'ประมาณการค่าไฟที่ลดได้', en: 'Est. power savings', 'zh-CN': '预计省电', ru: 'Оценка экономии' },
    finance: { th: 'ข้อมูลการเงิน', en: 'Financing', 'zh-CN': '财务方案', ru: 'Финансирование' },
    investPlan: { th: 'แผนการคุ้มทุน', en: 'Payback plan', 'zh-CN': '回本计划', ru: 'План окупаемости' },
    monthlyDiff: { th: 'ส่วนต่างรายเดือน', en: 'Monthly difference', 'zh-CN': '月度差额', ru: 'Разница в месяц' },
    cashPositive: { th: 'กำไรทันที (CASH+)', en: 'Instant profit (CASH+)', 'zh-CN': '即时盈利（CASH+）', ru: 'Прибыль сразу (CASH+)' },
    positiveFlow: { th: 'ระบบผลิตไฟได้มากกว่ายอดผ่อน ทำให้คุณมีกระแสเงินสดบวกตั้งแต่วันแรก', en: 'The system generates more value than the installment, so you are cash-positive from day one', 'zh-CN': '系统发电价值超过月供，第一天起现金流为正', ru: 'Система даёт больше, чем платёж, — плюс с первого дня' },
    negativeFlow: { th: 'ส่วนต่างระหว่างยอดผ่อนและค่าไฟที่ประหยัดได้ต่อเดือน', en: 'Gap between installment and monthly power savings', 'zh-CN': '月供与月省电费之间的差额', ru: 'Разница между платежом и месячной экономией' },
    profitNow: { th: 'ระบบผลิตไฟได้มากกว่ายอดผ่อน!<br/>เริ่มคุ้มทุนได้ทันที', en: 'The system beats the installment!<br/>Payback starts now', 'zh-CN': '发电价值超过月供！<br/>立即开始回本', ru: 'Генерация больше платежа!<br/>Окупаемость уже идёт' },
    techSpecs: { th: 'ข้อมูลทางเทคนิค', en: 'Technical specs', 'zh-CN': '技术参数', ru: 'Характеристики' },
    kitIncludes: { th: 'รายการอุปกรณ์ในชุด', en: "What's in the kit", 'zh-CN': '套装包含', ru: 'Состав комплекта' },
    quoteFor: { th: 'สนใจขอใบเสนอราคาสำหรับ {name} ครับ', en: 'Interested in a quote for {name}', 'zh-CN': '想获取{name}的报价', ru: 'Интересует цена на {name}' },
    askBrand: { th: 'ขอสอบถามข้อมูลเชิงลึกเกี่ยวกับ {brand} รุ่น {model} หน่อยครับ', en: 'A deep-dive on the {brand} {model}, please', 'zh-CN': '请详细介绍{brand}{model}', ru: 'Расскажите подробнее о {brand} {model}' },
    getQuote: { th: 'ขอใบเสนอราคา', en: 'Get a quote', 'zh-CN': '获取报价', ru: 'Запросить цену' },
    consultExpert: { th: 'ปรึกษาผู้เชี่ยวชาญ', en: 'Consult an expert', 'zh-CN': '咨询专家', ru: 'Консультация эксперта' },
    installedBy: { th: 'ติดตั้งโดยทีมช่างมาตรฐาน', en: 'Installed by certified crew', 'zh-CN': '标准团队安装', ru: 'Монтаж сертифицированной бригадой' },
    serviceArea: { th: 'กระบี่, ประเทศไทย', en: 'Krabi, Thailand', 'zh-CN': '泰国甲米', ru: 'Краби, Таиланд' },
    warranty25: { th: 'รับประกัน 25 ปี', en: '25-year warranty', 'zh-CN': '25年质保', ru: 'Гарантия 25 лет' },
  },
  cases: {
    badge: { th: 'ผลลัพธ์จริง', en: 'Real Results', 'zh-CN': '真实成果', ru: 'Реальные результаты' },
    titleA: { th: 'ผลงานการติดตั้ง', en: 'Our installations', 'zh-CN': '安装成果', ru: 'Наши установки' },
    titleB: { th: 'ในพื้นที่จังหวัดกระบี่', en: 'across Krabi province', 'zh-CN': '遍布甲米府', ru: 'по всей провинции Краби' },
    sub: { th: 'สัมผัสประสบการณ์จริงจากลูกค้าที่เปลี่ยนมาใช้พลังงานสะอาดกับ TAWAN POWER', en: 'Real stories from customers who switched to clean energy with us', 'zh-CN': '来自改用清洁能源客户的真实体验', ru: 'Реальные истории клиентов, перешедших на чистую энергию' },
    mapLink: { th: 'ดูแผนที่ผลงานทั้งหมด', en: 'View full map', 'zh-CN': '查看全部案例地图', ru: 'Все работы на карте' },
    investment: { th: 'เงินลงทุน', en: 'Investment', 'zh-CN': '投资', ru: 'Инвестиции' },
    mounting: { th: 'ระยะติดตั้ง', en: 'Mounting', 'zh-CN': '安装周期', ru: 'Монтаж' },
    mountingDefault: { th: '3 วัน', en: '3 days', 'zh-CN': '3天', ru: '3 дня' },
    cta: { th: 'ดูรายละเอียดโครงการ', en: 'View case details', 'zh-CN': '查看项目详情', ru: 'Детали проекта' },
  },
  knowledge: {
    badge: { th: 'ศูนย์การเรียนรู้โซลาร์', en: 'Solar learning hub', 'zh-CN': '太阳能学习中心', ru: 'Учебный центр' },
    title: { th: 'ตอบทุกข้อสงสัย', en: 'Answers to everything', 'zh-CN': '有问必答', ru: 'Ответы на всё' },
    sub: { th: 'แหล่งรวบรวมข้อมูลและความรู้เชิงลึก เพื่อให้คุณก้าวสู่การใช้พลังงานสะอาดได้อย่างมั่นใจ', en: 'In-depth knowledge for a confident step into clean energy', 'zh-CN': '深度知识，助您自信迈向清洁能源', ru: 'Глубокие знания для уверенного перехода на чистую энергию' },
    catAll: { th: 'ทั้งหมด', en: 'All', 'zh-CN': '全部', ru: 'Все' },
    catSaving: { th: 'การประหยัด', en: 'Saving', 'zh-CN': '节能', ru: 'Экономия' },
    catTech: { th: 'เทคโนโลยี', en: 'Technology', 'zh-CN': '技术', ru: 'Технологии' },
    catFaq: { th: 'คำถามที่พบบ่อย', en: 'FAQ', 'zh-CN': '常见问题', ru: 'FAQ' },
    empty: { th: 'ไม่พบข้อมูลในหมวดหมู่นี้', en: 'Nothing in this category', 'zh-CN': '该类别暂无内容', ru: 'В категории пусто' },
    readMore: { th: 'อ่านเพิ่มเติม', en: 'Read more', 'zh-CN': '阅读更多', ru: 'Читать далее' },
    allArticles: { th: 'ดูบทความทั้งหมด', en: 'View all articles', 'zh-CN': '查看全部文章', ru: 'Все статьи' },
    defaultTitle: { th: 'คู่มือการติดตั้งโซลาร์', en: 'Solar installation guide', 'zh-CN': '太阳能安装指南', ru: 'Гид по установке' },
    defaultSummary: { th: 'เรียนรู้ขั้นตอนและสิทธิประโยชน์จากการติดตั้งระบบโซลาร์เซลล์ในจังหวัดกระบี่', en: 'Learn the steps and benefits of installing solar in Krabi', 'zh-CN': '了解在甲米安装太阳能的流程与权益', ru: 'Шаги и выгоды установки в Краби' },
    catGeneral: { th: 'ความรู้ทั่วไป', en: 'General knowledge', 'zh-CN': '通用知识', ru: 'Общие знания' },
    catDocs: { th: 'เอกสารและ PEA', en: 'Documents & PEA', 'zh-CN': '文件与PEA', ru: 'Документы и PEA' },
    chatTopic: { th: 'ผมสนใจหัวข้อ "{title}" ครับ ช่วยอธิบายเพิ่มเติมหน่อย', en: 'I\'m interested in "{title}" — please explain more', 'zh-CN': '我对“{title}”感兴趣，请详细讲讲', ru: 'Интересует тема «{title}» — расскажите подробнее' },
    chatAll: { th: 'ขอดูบทความทั้งหมดในศูนย์ความรู้ครับ', en: 'Show all knowledge hub articles', 'zh-CN': '请查看知识中心全部文章', ru: 'Покажите все статьи учебного центра' },
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
console.log('BATCH2-OK');
