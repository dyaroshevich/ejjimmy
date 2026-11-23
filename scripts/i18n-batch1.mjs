// Batch 1: landing chrome (segments, features, steps, trust, contact, leadForm, shell)
// Usage: node scripts/i18n-batch1.mjs
import fs from 'node:fs';

const T = {
  segments: {
    title: { th: 'เลือกโซลูชันที่เหมาะกับคุณ', en: 'Choose the right solution', 'zh-CN': '选择适合您的方案', ru: 'Выберите подходящее решение' },
    sub: { th: 'นวัตกรรมที่ออกแบบมาเพื่อตอบโจทย์ทุกเป้าหมายที่แตกต่างกันของคุณ', en: 'Innovation designed for your every goal', 'zh-CN': '为您的不同目标量身打造的创新', ru: 'Инновации под каждую вашу цель' },
    tabHome: { th: 'บ้าน', en: 'Home', 'zh-CN': '家庭', ru: 'Дом' },
    tabBusiness: { th: 'ธุรกิจ', en: 'Business', 'zh-CN': '商业', ru: 'Бизнес' },
    homeTitle: { th: 'สำหรับบ้าน', en: 'For homes', 'zh-CN': '家庭用户', ru: 'Для дома' },
    homeTag: { th: 'ที่อยู่อาศัย', en: 'Residential', 'zh-CN': '住宅', ru: 'Жильё' },
    homeDesc: { th: 'เปลี่ยนหลังคาบ้านเป็นแหล่งรายได้ ลดค่าไฟสูงสุด 70% ด้วยระบบอัจฉริยะ', en: 'Turn your rooftop into income. Cut bills up to 70% with a smart system', 'zh-CN': '把屋顶变成收入来源，智能系统最高省电70%', ru: 'Превратите крышу в доход. Снизьте счета до 70% с умной системой' },
    homeF1: { th: 'ประเมินการประหยัดด้วย AI ฟรี', en: 'Free AI savings assessment', 'zh-CN': '免费AI节能评估', ru: 'Бесплатная AI-оценка экономии' },
    homeF2: { th: 'รับประกันอุปกรณ์ 25 ปี', en: '25-year equipment warranty', 'zh-CN': '设备25年质保', ru: 'Гарантия на оборудование 25 лет' },
    homeCta1: { th: 'เริ่มประเมินฟรี', en: 'Start free assessment', 'zh-CN': '免费评估', ru: 'Бесплатная оценка' },
    homeCta2: { th: 'คุยกับวิศวกร', en: 'Talk to an engineer', 'zh-CN': '咨询工程师', ru: 'Связаться с инженером' },
    bizTitle: { th: 'สำหรับธุรกิจ', en: 'For business', 'zh-CN': '商业用户', ru: 'Для бизнеса' },
    bizTag: { th: 'เชิงพาณิชย์', en: 'Commercial', 'zh-CN': '工商业', ru: 'Коммерция' },
    bizDesc: { th: 'คืนทุนไว เพิ่มผลกำไรด้วยการลดต้นทุนพลังงาน และยกระดับภาพลักษณ์ธุรกิจ', en: 'Fast payback. Boost profit by cutting energy costs and elevate your brand', 'zh-CN': '快速回本，降低能源成本提升利润，树立企业形象', ru: 'Быстрая окупаемость. Растите прибыль, снижая затраты на энергию' },
    bizF1: { th: 'วิเคราะห์จุดคืนทุน (ROI) เชิงลึก', en: 'In-depth ROI analysis', 'zh-CN': '深度ROI分析', ru: 'Глубокий ROI-анализ' },
    bizF2: { th: 'โซลูชัน Solar PPA อัจฉริยะ', en: 'Smart Solar PPA solutions', 'zh-CN': '智能Solar PPA方案', ru: 'Умные Solar PPA решения' },
    bizCta1: { th: 'ประเมินความคุ้มค่า', en: 'Assess the value', 'zh-CN': '评估价值', ru: 'Оценить выгоду' },
    bizCta2: { th: 'ปรึกษาโครงการ', en: 'Discuss your project', 'zh-CN': '咨询项目', ru: 'Обсудить проект' },
  },
  features: {
    title: { th: 'สิ่งที่คุณจะได้รับจากเรา', en: 'What you get from us', 'zh-CN': '您将获得的服务', ru: 'Что вы получите' },
    sub: { th: 'บริการครบวงจรด้วยวิศวกรผู้เชี่ยวชาญ เพื่อความมั่นใจในทุกขั้นตอนการใช้งาน', en: 'End-to-end service by expert engineers, confidence at every step', 'zh-CN': '专家工程师全程服务，每一步都放心', ru: 'Полный цикл от инженеров-экспертов — уверенность на каждом шаге' },
    f1t: { th: 'ถามเรื่องโซลาร์', en: 'Ask about solar', 'zh-CN': '咨询太阳能', ru: 'Спросить про солнце' },
    f1d: { th: 'ข้อมูลพื้นฐานและเชิงลึก', en: 'Basics and in-depth info', 'zh-CN': '基础与深度信息', ru: 'База и детали' },
    f1label: { th: 'แชทถามคำถามทั่วไป', en: 'Chat: ask general questions', 'zh-CN': '聊天咨询一般问题', ru: 'Чат: общие вопросы' },
    f2t: { th: 'ดูข้อมูลอุปกรณ์', en: 'Browse equipment', 'zh-CN': '查看设备', ru: 'Каталог оборудования' },
    f2d: { th: 'เปรียบเทียบแผงและอินเวอร์เตอร์', en: 'Compare panels and inverters', 'zh-CN': '对比组件与逆变器', ru: 'Сравнение панелей и инверторов' },
    f2msg: { th: 'ขอดูรายละเอียดชุดอุปกรณ์ครับ', en: 'Show me the equipment details', 'zh-CN': '请查看设备详情', ru: 'Покажите детали оборудования' },
    f2label: { th: 'ดูรายละเอียดชุดอุปกรณ์', en: 'View equipment details', 'zh-CN': '查看设备详情', ru: 'Детали оборудования' },
    f3t: { th: 'ประเมินเบื้องต้น', en: 'Quick assessment', 'zh-CN': '初步评估', ru: 'Быстрая оценка' },
    f3d: { th: 'คำนวณขนาดและจุดคืนทุน', en: 'Size and payback calculation', 'zh-CN': '规模与回本测算', ru: 'Расчёт мощности и окупаемости' },
    f3label: { th: 'คำนวณราคาและจุดคืนทุน', en: 'Calculate price and payback', 'zh-CN': '测算价格与回本', ru: 'Рассчитать цену и окупаемость' },
    f4t: { th: 'คุยกับวิศวกร', en: 'Talk to an engineer', 'zh-CN': '咨询工程师', ru: 'Связаться с инженером' },
    f4d: { th: 'ปรึกษาทีมงานผ่านแชท', en: 'Consult the team via chat', 'zh-CN': '通过聊天咨询团队', ru: 'Консультация в чате' },
    f4label: { th: 'ติดต่อเจ้าหน้าที่ฝ่ายเทคนิค', en: 'Contact technical staff', 'zh-CN': '联系技术人员', ru: 'Связаться с техспециалистом' },
  },
  steps: {
    title: { th: 'เริ่มต้นง่าย ๆ ใน 3 ขั้นตอน', en: 'Easy start in 3 steps', 'zh-CN': '3步轻松开始', ru: 'Лёгкий старт за 3 шага' },
    sub: { th: 'กระบวนการที่โปร่งใสและรวดเร็ว เพื่อให้คุณเริ่มใช้พลังงานสะอาดได้ทันที', en: 'A transparent, fast process to get you on clean energy right away', 'zh-CN': '透明高效的流程，立即用上清洁能源', ru: 'Прозрачный быстрый процесс — чистая энергия сразу' },
    s1t: { th: 'เลือกประเภทอาคาร', en: 'Pick your building type', 'zh-CN': '选择建筑类型', ru: 'Выберите тип здания' },
    s1d: { th: 'ระบุเป้าหมายเพื่อรับข้อมูลที่เจาะจงกับความต้องการของคุณที่สุด', en: 'Tell us your goal for tailored advice', 'zh-CN': '说明您的目标，获取精准建议', ru: 'Укажите цель — подберём точное решение' },
    s2t: { th: 'คุยและประเมิน', en: 'Chat and assess', 'zh-CN': '沟通评估', ru: 'Чат и оценка' },
    s2d: { th: 'ประเมินราคาเบื้องต้นและจุดคืนทุนผ่าน AI อัจฉริยะในเวลาไม่ถึงนาที', en: 'Instant AI price and payback estimate in under a minute', 'zh-CN': 'AI一分钟内给出价格与回本预估', ru: 'AI-оценка цены и окупаемости меньше чем за минуту' },
    s3t: { th: 'ปรึกษากับวิศวกร', en: 'Consult an engineer', 'zh-CN': '咨询工程师', ru: 'Консультация инженера' },
    s3d: { th: 'นัดสำรวจหน้างานฟรีโดยทีมวิศวกรผู้เชี่ยวชาญเพื่อออกแบบระบบจริง', en: 'Free on-site survey by experts to design your real system', 'zh-CN': '专家免费上门勘察，设计真实系统', ru: 'Бесплатный выезд инженеров для проекта системы' },
    cta: { th: 'ประเมินราคาฟรีตอนนี้', en: 'Get a free quote now', 'zh-CN': '立即免费估价', ru: 'Бесплатная оценка сейчас' },
    ctaLabel: { th: 'เริ่มประเมินระบบโซลาร์เซลล์', en: 'Start a solar assessment', 'zh-CN': '开始太阳能评估', ru: 'Начать оценку солнечной системы' },
  },
  trust: {
    heading: { th: 'ผู้เชี่ยวชาญที่คุณไว้วางใจได้', en: 'Experts you can trust', 'zh-CN': '值得信赖的专家', ru: 'Эксперты, которым доверяют' },
  },
  contact: {
    badge: { th: 'ติดต่อเรา', en: 'Contact us', 'zh-CN': '联系我们', ru: 'Свяжитесь с нами' },
    title: { th: 'ฝากข้อมูลให้เราติดต่อกลับ', en: "Leave your info, we'll call back", 'zh-CN': '留下信息，我们回电', ru: 'Оставьте контакты — перезвоним' },
    sub: { th: 'ให้วิศวกรผู้เชี่ยวชาญช่วยวางแผนและประเมินระบบที่เหมาะสมที่สุดสำหรับคุณ', en: 'Let expert engineers plan the best system for you', 'zh-CN': '让专家工程师为您规划最合适的系统', ru: 'Инженеры-эксперты спланируют лучшую систему для вас' },
    desc: { th: 'หากไม่สะดวกใช้แชท ฝากข้อมูลเบื้องต้นไว้ได้เลย ทีมวิศวกรจะช่วยประเมินและติดต่อกลับพร้อมแนวทางที่เหมาะกับคุณ', en: 'Prefer not to chat? Leave your details and our engineers will assess and call back with the right plan', 'zh-CN': '不方便聊天？留下基本信息，工程师团队会评估并回电给出合适方案', ru: 'Неудобно в чате? Оставьте данные — инженеры оценят и перезвонят с подходящим решением' },
    b1: { th: 'ข้อมูลส่วนตัวของคุณปลอดภัย', en: 'Your data is safe', 'zh-CN': '您的信息安全无忧', ru: 'Ваши данные в безопасности' },
    b2: { th: 'ติดต่อกลับภายใน 24 ชม.', en: 'Callback within 24 hours', 'zh-CN': '24小时内回电', ru: 'Перезвоним в течение 24 часов' },
    b3: { th: 'ไม่มีค่าใช้จ่ายในการประเมินเบื้องต้น', en: 'Free preliminary assessment', 'zh-CN': '初步评估免费', ru: 'Предварительная оценка бесплатно' },
  },
  leadForm: {
    successToast: { th: 'ขอบคุณที่ไว้วางใจ TAWAN POWER ครับ เราได้รับข้อมูลของคุณเรียบร้อยแล้ว', en: "Thank you for trusting TAWAN POWER. We've received your info", 'zh-CN': '感谢信任 TAWAN POWER，我们已收到您的信息', ru: 'Спасибо за доверие TAWAN POWER. Данные получены' },
    errorToast: { th: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง: ', en: 'Something went wrong, please retry: ', 'zh-CN': '出错了，请重试：', ru: 'Ошибка, попробуйте ещё раз: ' },
    failToast: { th: 'ระบบมีปัญหา กรุณาลองใหม่ภายหลัง', en: 'System issue, please try again later', 'zh-CN': '系统繁忙，请稍后再试', ru: 'Системная ошибка, попробуйте позже' },
    successTitle: { th: 'ส่งข้อมูลสำเร็จ!', en: 'Sent successfully!', 'zh-CN': '提交成功！', ru: 'Отправлено!' },
    successSub: { th: 'เราจะติดต่อกลับโดยเร็วที่สุดครับ', en: "We'll contact you ASAP", 'zh-CN': '我们会尽快联系您', ru: 'Мы свяжемся с вами как можно скорее' },
    nameLabel: { th: 'ชื่อ-นามสกุล', en: 'Full name', 'zh-CN': '姓名', ru: 'Имя и фамилия' },
    namePh: { th: 'คุณสมชาย ใจดี', en: 'e.g. John Smith', 'zh-CN': '如：张三', ru: 'Например, Иван Петров' },
    phoneLabel: { th: 'เบอร์โทรศัพท์', en: 'Phone number', 'zh-CN': '电话号码', ru: 'Телефон' },
    locationLabel: { th: 'พื้นที่ติดตั้ง (เช่น อ่าวนาง, ในเมือง)', en: 'Installation area (e.g. Ao Nang, Town)', 'zh-CN': '安装地区（如奥南、市区）', ru: 'Район установки (напр. Ао Нанг, город)' },
    locationPh: { th: 'เช่น อ่าวนาง', en: 'e.g. Ao Nang', 'zh-CN': '如：奥南', ru: 'Напр. Ао Нанг' },
    submit: { th: 'ส่งข้อมูลติดต่อเพื่อรับคำปรึกษา', en: 'Send details for consultation', 'zh-CN': '提交信息获取咨询', ru: 'Отправить данные для консультации' },
    sending: { th: 'กำลังส่งข้อมูล…', en: 'Sending…', 'zh-CN': '提交中…', ru: 'Отправка…' },
  },
  shell: {
    formTitle: { th: 'ขอรับคำปรึกษา', en: 'Request consultation', 'zh-CN': '申请咨询', ru: 'Заказать консультацию' },
    formSub: { th: 'กรุณากรอกข้อมูลเพื่อให้วิศวกรติดต่อกลับ', en: 'Fill in your details for an engineer callback', 'zh-CN': '请填写信息，工程师会回电', ru: 'Заполните данные — инженер перезвонит' },
    formLabel: { th: 'ฟอร์มขอรับคำปรึกษา', en: 'Consultation request form', 'zh-CN': '咨询申请表', ru: 'Форма консультации' },
    closeForm: { th: 'ปิดฟอร์ม', en: 'Close form', 'zh-CN': '关闭表单', ru: 'Закрыть форму' },
    closeChat: { th: 'ปิดแชท', en: 'Close chat', 'zh-CN': '关闭聊天', ru: 'Закрыть чат' },
    stickyTag: { th: 'AI และทีมสนับสนุน', en: 'AI & support team', 'zh-CN': 'AI与支持团队', ru: 'AI и поддержка' },
    stickyHint: { th: 'ถามเรื่องโซลาร์ หรือเริ่มประเมินเบื้องต้น...', en: 'Ask about solar or start an assessment...', 'zh-CN': '咨询太阳能或开始评估…', ru: 'Спросите про солнце или начните оценку…' },
    voiceLabel: { th: 'เริ่มประเมินด้วยเสียง (Voice Assessment)', en: 'Start voice assessment', 'zh-CN': '开始语音评估', ru: 'Начать голосовую оценку' },
    chatLabel: { th: 'เปิดแชทเพื่อปรึกษา AI (Open Chat)', en: 'Open chat for AI consultation', 'zh-CN': '打开聊天咨询AI', ru: 'Открыть чат с AI' },
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
console.log('BATCH1-OK');
