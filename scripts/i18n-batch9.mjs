// Batch 9: post editor + super tabs + offer hub + lead analytics
// Usage: node scripts/i18n-batch9.mjs
import fs from 'node:fs';

const T = {
  admin: {
    peLoadFail: { th: 'ไม่สามารถโหลดบทความได้', en: "Couldn't load article", 'zh-CN': '无法加载文章', ru: 'Не удалось загрузить статью' },
    peSaveFail: { th: 'เกิดข้อผิดพลาดในการบันทึก', en: 'Save failed', 'zh-CN': '保存失败', ru: 'Ошибка сохранения' },
    aiModelTitle: { th: 'โมเดลปัญญาประดิษฐ์ที่ใช้งาน', en: 'Active AI model', 'zh-CN': '使用中的AI模型', ru: 'Активная AI-модель' },
    aiDescGroq: { th: 'เร็วที่สุด เหมาะกับแชททั่วไป', en: 'Fastest, great for general chat', 'zh-CN': '最快，适合日常聊天', ru: 'Самый быстрый, для обычного чата' },
    aiDescGemini: { th: 'ฉลาดที่สุด มีเหตุผลดีเยี่ยม', en: 'Smartest, excellent reasoning', 'zh-CN': '最聪明，推理出色', ru: 'Самый умный, отличное рассуждение' },
    aiDescOpenai: { th: 'ตัวเลือกสำรองความเร็วสูง', en: 'High-speed fallback option', 'zh-CN': '高速备选', ru: 'Быстрый запасной вариант' },
    aiDescZai: { th: 'โมเดลประสิทธิภาพสูงรุ่นใหม่', en: 'New high-performance model', 'zh-CN': '新一代高性能模型', ru: 'Новая высокопроизводительная модель' },
    aiInUse: { th: 'กำลังใช้งาน', en: 'In use', 'zh-CN': '使用中', ru: 'Используется' },
    aiTemp: { th: 'ระดับความสร้างสรรค์ (Temperature)', en: 'Creativity level (Temperature)', 'zh-CN': '创造力（Temperature）', ru: 'Креативность (Temperature)' },
    aiTempLow: { th: 'เน้นข้อเท็จจริง', en: 'Factual', 'zh-CN': '重事实', ru: 'Факты' },
    aiTempHigh: { th: 'เน้นสำนวน', en: 'Expressive', 'zh-CN': '重表达', ru: 'Экспрессия' },
    aiSaved: { th: 'บันทึกสำเร็จ!', en: 'Saved!', 'zh-CN': '已保存！', ru: 'Сохранено!' },
    chatStats: { th: 'สถิติการใช้งาน AI', en: 'AI usage stats', 'zh-CN': 'AI使用统计', ru: 'Статистика AI' },
    chatToday: { th: 'วันนี้', en: 'Today', 'zh-CN': '今天', ru: 'Сегодня' },
    chatWeek: { th: 'สัปดาห์นี้', en: 'This week', 'zh-CN': '本周', ru: 'На этой неделе' },
    chatTotal: { th: 'ทั้งหมด', en: 'Total', 'zh-CN': '全部', ru: 'Всего' },
    chatQueue: { th: 'คิวลูกค้าจากแชทบอท', en: 'Chatbot lead queue', 'zh-CN': '聊天机器人客户队列', ru: 'Очередь лидов из чат-бота' },
    chatLatest: { th: '{n} รายการล่าสุด', en: '{n} latest', 'zh-CN': '最新{n}条', ru: 'Последние: {n}' },
    chatEmpty: { th: 'ยังไม่มีข้อมูลการแชท', en: 'No chat data yet', 'zh-CN': '暂无聊天数据', ru: 'Данных чата пока нет' },
    chatNoName: { th: 'ลูกค้าทั่วไป', en: 'Guest customer', 'zh-CN': '普通客户', ru: 'Гость' },
    chatNoPhone: { th: 'ไม่มีเบอร์โทรศัพท์', en: 'No phone number', 'zh-CN': '无电话号码', ru: 'Без телефона' },
    kbTitle: { th: 'ใช้ฐานข้อมูลภายในระบบ', en: 'Using internal database', 'zh-CN': '使用系统内部数据库', ru: 'Внутренняя база данных' },
    kbSub: { th: 'ปัจจุบันระบบใช้ฐานข้อมูล Supabase ภายในเป็นหลักในการดึงความรู้ (RAG) คุณสามารถเชื่อมต่อ Endpoint ภายนอกเพิ่มเติมได้ด้านล่าง', en: 'The system uses the internal Supabase database for knowledge retrieval (RAG). You can connect an external endpoint below', 'zh-CN': '系统以内置Supabase数据库为知识检索（RAG）主力，可在下方连接外部端点', ru: 'Система использует внутреннюю базу Supabase для знаний (RAG). Ниже можно подключить внешний эндпоинт' },
    kbExtTitle: { th: 'การตั้งค่า RAG Endpoint ภายนอก', en: 'External RAG endpoint settings', 'zh-CN': '外部RAG端点设置', ru: 'Настройки внешнего RAG' },
    kbUrl: { th: 'URL ของ Endpoint', en: 'Endpoint URL', 'zh-CN': '端点URL', ru: 'URL эндпоинта' },
    kbKey: { th: 'API Key (ถ้ามี)', en: 'API key (if any)', 'zh-CN': 'API密钥（如有）', ru: 'API-ключ (если есть)' },
    kbTest: { th: 'ทดสอบการเชื่อมต่อ', en: 'Test connection', 'zh-CN': '测试连接', ru: 'Проверить соединение' },
    kbTesting: { th: 'กำลังทดสอบ...', en: 'Testing...', 'zh-CN': '测试中…', ru: 'Проверка…' },
    kbOk: { th: 'เชื่อมต่อสำเร็จ!', en: 'Connected!', 'zh-CN': '连接成功！', ru: 'Подключено!' },
    kbFail: { th: 'ล้มเหลว', en: 'Failed', 'zh-CN': '失败', ru: 'Ошибка' },
    kbSave: { th: 'บันทึก', en: 'Save', 'zh-CN': '保存', ru: 'Сохранить' },
    kbSaved: { th: 'บันทึกแล้ว!', en: 'Saved!', 'zh-CN': '已保存！', ru: 'Сохранено!' },
    kbConfigured: { th: 'กำหนดค่า RAG ภายนอกเรียบร้อยแล้ว', en: 'External RAG is configured', 'zh-CN': '外部RAG已配置', ru: 'Внешний RAG настроен' },
    kbNotConfigured: { th: 'ยังไม่ได้กำหนดค่า', en: 'Not configured', 'zh-CN': '未配置', ru: 'Не настроено' },
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
console.log('BATCH9-OK');
