// Batch 3b: chat namespace (SolarChat)
// Usage: node scripts/i18n-batch3b.mjs
import fs from 'node:fs';

const T = {
  chat: {
    typing: { th: 'กำลังพิมพ์…', en: 'Typing…', 'zh-CN': '正在输入…', ru: 'Печатает…' },
    tabSavings: { th: 'ประหยัด/เดือน', en: 'Saved/mo', 'zh-CN': '月省', ru: 'Экономия/мес' },
    tabPayback: { th: 'จุดคุ้มทุน', en: 'Payback', 'zh-CN': '回本点', ru: 'Окупаемость' },
    tabOverview: { th: 'ภาพรวม 25 ปี', en: '25-year view', 'zh-CN': '25年总览', ru: 'Обзор 25 лет' },
    saveMax: { th: 'ประหยัดค่าไฟได้สูงสุด', en: 'Max power savings', 'zh-CN': '最高可省电费', ru: 'Макс. экономия' },
    perMonth: { th: '/เดือน', en: '/month', 'zh-CN': '/月', ru: '/мес.' },
    coffeeEq: { th: 'เท่ากับกาแฟฟรี {n} แก้วทุกเดือน!', en: "That's {n} free coffees every month!", 'zh-CN': '相当于每月{n}杯免费咖啡！', ru: 'Это {n} бесплатных кофе каждый месяц!' },
    paybackTime: { th: 'ระยะเวลาคืนทุนโดยประมาณ', en: 'Est. payback period', 'zh-CN': '预计回本周期', ru: 'Примерный срок окупаемости' },
    yearsUnit: { th: 'ปี', en: 'yrs', 'zh-CN': '年', ru: 'г.' },
    freeAfter: { th: 'หลังจากนี้คือการใช้ไฟฟรีตลอดอายุการใช้งาน', en: "After that, free power for the system's lifetime", 'zh-CN': '之后终身免费用电', ru: 'Дальше — бесплатное электричество весь срок службы' },
    longSave: { th: 'ประหยัดเงินในระยะยาว (25 ปี)', en: 'Long-term savings (25 yrs)', 'zh-CN': '长期节省（25年）', ru: 'Долгосрочная экономия (25 лет)' },
    million: { th: 'ล้าน', en: 'M', 'zh-CN': '百万', ru: 'млн' },
    homeValueUp: { th: 'เพิ่มมูลค่าให้บ้านของคุณอย่างมหาศาล', en: 'Massively boosts your home value', 'zh-CN': '大幅提升房屋价值', ru: 'Серьёзно растит стоимость дома' },
    sysSize: { th: 'ขนาดระบบ', en: 'System size', 'zh-CN': '系统规模', ru: 'Мощность системы' },
    equipment: { th: 'อุปกรณ์', en: 'Equipment', 'zh-CN': '设备', ru: 'Оборудование' },
    tierPremium: { th: 'พรีเมียม', en: 'Premium', 'zh-CN': '高端', ru: 'Премиум' },
    tierSaver: { th: 'ประหยัด', en: 'Saver', 'zh-CN': '经济型', ru: 'Эконом' },
    bookSurvey: { th: 'จองคิวสำรวจหน้างานฟรี', en: 'Book a free site survey', 'zh-CN': '预约免费上门勘察', ru: 'Заказать бесплатный выезд' },
    saved: { th: 'บันทึกแล้ว', en: 'Saved', 'zh-CN': '已保存', ru: 'Сохранено' },
    saveLine: { th: 'บันทึกลง LINE', en: 'Save to LINE', 'zh-CN': '保存到LINE', ru: 'Сохранить в LINE' },
    consultEng: { th: 'ปรึกษาวิศวกร', en: 'Talk to an engineer', 'zh-CN': '咨询工程师', ru: 'Связаться с инженером' },
    analyzing: { th: 'แทนกำลังวิเคราะห์ข้อมูล...', en: 'Analyzing...', 'zh-CN': '分析中…', ru: 'Анализ…' },
    openProposal: { th: 'เปิดหน้าข้อเสนอพิเศษของคุณ', en: 'Open your special offer', 'zh-CN': '打开您的专属方案', ru: 'Открыть ваше спецпредложение' },
    recalc: { th: 'คำนวณใหม่อีกครั้ง', en: 'Recalculate', 'zh-CN': '重新测算', ru: 'Пересчитать' },
    welcomeTag: { th: 'ยินดีต้อนรับสู่ โซลาร์ 1 กระบี่', en: 'Welcome to TAWAN POWER', 'zh-CN': '欢迎来到 TAWAN POWER', ru: 'Добро пожаловать в TAWAN POWER' },
    welcomeTitle: { th: 'ต้องการให้เราช่วยเรื่องอะไรดีครับ?', en: 'How can we help?', 'zh-CN': '需要我们帮什么？', ru: 'Чем помочь?' },
    wizTitle: { th: 'คำนวณประหยัด', en: 'Savings calculator', 'zh-CN': '节能测算', ru: 'Калькулятор экономии' },
    wizDesc: { th: 'วิเคราะห์พื้นที่และจุดคืนทุนแม่นยำ', en: 'Precise area & payback analysis', 'zh-CN': '精准分析场地与回本', ru: 'Точный анализ и окупаемость' },
    catTitle: { th: 'แคตตาล็อก', en: 'Catalog', 'zh-CN': '产品目录', ru: 'Каталог' },
    catDesc: { th: 'ชุดอุปกรณ์ Tier 1 ที่ดีที่สุด', en: 'The best Tier 1 kits', 'zh-CN': '最好的Tier 1套装', ru: 'Лучшие комплекты Tier 1' },
    procTitle: { th: 'ขั้นตอนติดตั้ง', en: 'Installation steps', 'zh-CN': '安装流程', ru: 'Этапы монтажа' },
    procDesc: { th: 'กระบวนการตั้งแต่เริ่มจนเชื่อมต่อ', en: 'From start to grid connection', 'zh-CN': '从开工到并网全流程', ru: 'От старта до подключения' },
    faqTitle: { th: 'ข้อมูลโซลาร์', en: 'Solar info', 'zh-CN': '太阳能知识', ru: 'О солнце' },
    faqDesc: { th: 'ความรู้พื้นฐานและข้อสงสัย', en: 'Basics & FAQ', 'zh-CN': '基础知识与疑问', ru: 'База и вопросы' },
    errInvalid: { th: 'กรุณาป้อนค่าที่ถูกต้อง (มากกว่า 0) ครับ', en: 'Please enter a valid value (over 0)', 'zh-CN': '请输入有效数值（大于0）', ru: 'Введите корректное значение (больше 0)' },
    greetHome: { th: 'ยินดีต้อนรับครับ! สนใจติดตั้งโซลาร์เซลล์สำหรับ "บ้านหรือวิลล่า" ใช่ไหมครับ? 🏠\n\nผมช่วยประเมินการประหยัดค่าไฟและแนะนำระบบที่เหมาะสมให้ได้ทันทีครับ อยากเริ่มจากส่วนไหนดี?', en: 'Welcome! Interested in solar for your "home or villa"? 🏠\n\nI can assess your power savings and recommend the right system right away. Where shall we start?', 'zh-CN': '欢迎！您想为“住宅或别墅”安装太阳能吗？🏠\n\n我可以立即评估省电情况并推荐合适的系统。想从哪里开始？', ru: 'Добро пожаловать! Интересует солнце для «дома или виллы»? 🏠\n\nОценю экономию и подберу подходящую систему прямо сейчас. С чего начнём?' },
    greetBiz: { th: 'สวัสดีครับ! สำหรับ "ภาคธุรกิจและโรงแรม" ระบบโซลาร์คือการลงทุนที่คุ้มค่าที่สุดครับ 🏨\n\nผมพร้อมช่วยคำนวณ ROI และจุดคืนทุนให้คุณเห็นภาพชัดเจนที่สุดครับ สนใจข้อมูลส่วนไหนครับ?', en: 'Hello! For "businesses and hotels", solar is the smartest investment 🏨\n\nI\'ll calculate ROI and payback so you see the full picture. What would you like to know?', 'zh-CN': '您好！对“企业和酒店”来说，太阳能是最划算的投资🏨\n\n我来帮您测算ROI和回本点，一目了然。想了解哪方面？', ru: 'Здравствуйте! Для «бизнеса и отелей» солнце — самая выгодная инвестиция 🏨\n\nРассчитаю ROI и окупаемость — всё будет наглядно. Что интересует?' },
    greetDefault: { th: 'สวัสดีครับ! ยินดีที่ได้พบคุณที่ โซลาร์ 1 กระบี่ ครับ ☀️\n\nผมพร้อมช่วยแนะนำโซลูชันโซลาร์เซลล์ที่คุ้มค่าที่สุด\nคุณสามารถ "เลือกหัวข้อ" ด้านล่าง หรือ "พิมพ์สอบถาม" ได้ทันทีครับ', en: 'Hello! Welcome to TAWAN POWER ☀️\n\nI\'ll help you find the most worthwhile solar solution.\nPick a "topic" below or just "type your question".', 'zh-CN': '您好！欢迎来到 TAWAN POWER ☀️\n\n我来帮您找到最划算的太阳能方案。\n可以在下方“选择主题”，或直接“输入问题”。', ru: 'Здравствуйте! Добро пожаловать в TAWAN POWER ☀️\n\nПомогу найти самое выгодное солнечное решение.\nВыберите «тему» ниже или просто «напишите вопрос».' },
    openerA: { th: 'สวัสดีครับ!', en: 'Hello!', 'zh-CN': '您好！', ru: 'Здравствуйте!' },
    openerB: { th: 'ยินดีต้อนรับครับ!', en: 'Welcome!', 'zh-CN': '欢迎！', ru: 'Добро пожаловать!' },
    helloName: { th: 'สวัสดีครับ คุณ {name}!', en: 'Hello, {name}!', 'zh-CN': '您好，{name}！', ru: 'Здравствуйте, {name}!' },
    welcomeName: { th: 'สวัสดีครับ คุณ {name}! ยินดีต้อนรับครับ', en: 'Hello, {name}! Welcome!', 'zh-CN': '您好，{name}！欢迎！', ru: 'Здравствуйте, {name}! Добро пожаловать!' },
    voiceUnsupported: { th: 'ขออภัยครับ เบราว์เซอร์ของคุณยังไม่รองรับการสั่งงานด้วยเสียง กรุณาพิมพ์สอบถามได้เลยครับ 🎤', en: "Sorry, your browser doesn't support voice input. Please type instead 🎤", 'zh-CN': '抱歉，您的浏览器不支持语音输入，请直接输入🎤', ru: 'Извините, браузер не поддерживает голосовой ввод. Напишите текстом 🎤' },
    voiceErr: { th: 'ขออภัยครับ เบราว์เซอร์ของคุณยังไม่รองรับการสั่งงานด้วยเสียง', en: "Sorry, your browser doesn't support voice input", 'zh-CN': '抱歉，您的浏览器不支持语音输入', ru: 'Извините, браузер не поддерживает голосовой ввод' },
    listening: { th: 'กำลังฟังครับ... 🎤\nพูดได้เลยครับ เช่น "ผมอยากติดตั้งโซลาร์บนหลังคาบ้าน"', en: 'Listening... 🎤\nGo ahead, e.g. "I want solar on my roof"', 'zh-CN': '正在聆听…🎤\n请说，例如“我想在屋顶装太阳能”', ru: 'Слушаю… 🎤\nГоворите, например «хочу солнце на крышу»' },
    voiceNoHear: { th: 'ไม่ได้ยินเสียงครับ ลองพิมพ์สอบถามหรือกดไมค์อีกครั้งนะครับ 🎤', en: "Didn't catch that. Try typing or tap the mic again 🎤", 'zh-CN': '没听清，请打字或再按一次麦克风🎤', ru: 'Не расслышал. Напишите или нажмите микрофон ещё раз 🎤' },
    quickCatalog: { th: 'ขอดูรายละเอียดชุดอุปกรณ์ครับ', en: 'Show me the equipment details', 'zh-CN': '请查看设备详情', ru: 'Покажите детали оборудования' },
    quickSteps: { th: 'ขั้นตอนการติดตั้งมีอะไรบ้าง?', en: 'What are the installation steps?', 'zh-CN': '安装流程是怎样的？', ru: 'Какие этапы монтажа?' },
    newCustomer: { th: 'ลูกค้าใหม่ (จากแชท)', en: 'New customer (from chat)', 'zh-CN': '新客户（来自聊天）', ru: 'Новый клиент (из чата)' },
    quoteFail: { th: 'ไม่สามารถเปิดใบเสนอราคาได้ในขณะนี้', en: "Can't open the proposal right now", 'zh-CN': '暂时无法打开报价单', ru: 'Не удаётся открыть предложение' },
    surveyMsg: { th: 'สนใจจองคิวสำรวจหน้างานฟรีครับ', en: "I'd like to book a free site survey", 'zh-CN': '我想预约免费上门勘察', ru: 'Хочу заказать бесплатный выезд' },
    savedToast: { th: 'บันทึกลง LINE เรียบร้อย', en: 'Saved to LINE', 'zh-CN': '已保存到LINE', ru: 'Сохранено в LINE' },
    consultMsg: { th: 'ขอคุยกับวิศวกรเพื่อปรึกษาเชิงลึกครับ', en: "I'd like an in-depth engineer consultation", 'zh-CN': '我想和工程师深入聊聊', ru: 'Хочу подробную консультацию инженера' },
    assessedMsg: { th: 'ประเมินเบื้องต้นเรียบร้อยแล้วครับ! นี่คือข้อมูลสำหรับพิจารณาเบื้องต้นครับ:', en: "Preliminary assessment done! Here's your overview:", 'zh-CN': '初步评估完成！以下是供参考的信息：', ru: 'Предварительная оценка готова! Вот краткий итог:' },
    quickConsult: { th: 'ขอคุยกับเจ้าหน้าที่โดยตรงครับ', en: "I'd like to talk to a human directly", 'zh-CN': '我想直接和工作人员聊', ru: 'Хочу поговорить с человеком напрямую' },
    quickConsultLabel: { th: 'ปรึกษาโครงการ / นัดทีมวิศวกร', en: 'Discuss project / meet engineers', 'zh-CN': '咨询项目/约工程师团队', ru: 'Проект / встреча с инженерами' },
    inputPh: { th: 'สอบถาม หรือกดเพื่อพูด…', en: 'Ask or tap to speak…', 'zh-CN': '提问或按住说话…', ru: 'Спросите или нажмите, чтобы говорить…' },
    aiFooter: { th: 'AI และทีมสนับสนุน', en: 'AI & support team', 'zh-CN': 'AI与支持团队', ru: 'AI и поддержка' },
    errGeneric: { th: 'ขออภัยครับ เกิดข้อผิดพลาด ลองใหม่อีกครั้งครับ', en: 'Sorry, something failed. Try again', 'zh-CN': '抱歉，出错了，请重试', ru: 'Извините, ошибка. Попробуйте ещё раз' },
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
console.log('BATCH3B-OK');
