// Batch 7g: admin content research + settings
// Usage: node scripts/i18n-batch7g.mjs
import fs from 'node:fs';

const T = {
  content: {
    resSub: { th: 'จัดการข้อมูลวิจัย คู่แข่ง และคลังความรู้ RAG สำหรับ AI', en: 'Manage research, competitors and the RAG knowledge base for AI', 'zh-CN': '管理研究、竞品与AI的RAG知识库', ru: 'Исследования, конкуренты и RAG-база для AI' },
    resUpload: { th: 'อัปโหลดงานวิจัย', en: 'Upload research', 'zh-CN': '上传研究', ru: 'Загрузить исследование' },
    resOnlyDocs: { th: 'รองรับเฉพาะ PDF, CSV, TXT หรือ MD เท่านั้น', en: 'PDF, CSV, TXT or MD only', 'zh-CN': '仅支持PDF、CSV、TXT或MD', ru: 'Только PDF, CSV, TXT или MD' },
    resDup: { th: 'ไฟล์นี้มีอยู่ในระบบแล้ว', en: 'File already in system', 'zh-CN': '该文件已在系统中', ru: 'Файл уже в системе' },
    resUpDone: { th: 'อัปโหลดไฟล์สำเร็จ', en: 'Upload complete', 'zh-CN': '上传成功', ru: 'Загружено' },
    resUpFail: { th: 'อัปโหลดล้มเหลว: ', en: 'Upload failed: ', 'zh-CN': '上传失败：', ru: 'Ошибка загрузки: ' },
    resIndexed: { th: 'เพิ่มเข้าคลังความรู้ AI แล้ว ({n} ส่วน)', en: 'Added to AI knowledge base ({n} chunks)', 'zh-CN': '已加入AI知识库（{n}块）', ru: 'Добавлено в базу знаний ({n} чанков)' },
    resIndexFail: { th: 'ไม่สามารถทำดัชนีได้', en: "Couldn't index", 'zh-CN': '无法建索引', ru: 'Не удалось индексировать' },
    resPickOne: { th: 'กรุณาเลือกเอกสารอย่างน้อย 1 ฉบับ', en: 'Please select at least 1 document', 'zh-CN': '请至少选择1个文档', ru: 'Выберите хотя бы 1 документ' },
    resAnalyzed: { th: 'วิเคราะห์ข้อมูลสำเร็จ', en: 'Analysis complete', 'zh-CN': '分析完成', ru: 'Анализ готов' },
    resAnalyzeFail: { th: 'การวิเคราะห์ล้มเหลว: ', en: 'Analysis failed: ', 'zh-CN': '分析失败：', ru: 'Ошибка анализа: ' },
    resRagTitle: { th: 'ระบบ AI อัจฉริยะ (RAG)', en: 'Smart AI system (RAG)', 'zh-CN': '智能AI系统（RAG）', ru: 'Умный AI (RAG)' },
    resKb: { th: 'คลังความรู้ (Knowledge Base)', en: 'Knowledge base', 'zh-CN': '知识库', ru: 'База знаний' },
    resSearchPh: { th: 'ค้นหาเอกสาร...', en: 'Search documents...', 'zh-CN': '搜索文档…', ru: 'Поиск документов…' },
    resLoading: { th: 'กำลังโหลดเอกสาร...', en: 'Loading documents...', 'zh-CN': '加载文档中…', ru: 'Загрузка документов…' },
    resEmpty: { th: 'ยังไม่มีเอกสารในคลังความรู้', en: 'Knowledge base is empty', 'zh-CN': '知识库为空', ru: 'База знаний пуста' },
    resTaskSummary: { th: 'สรุปเนื้อหาสำคัญ', en: 'Summarize key points', 'zh-CN': '总结要点', ru: 'Сводка главного' },
    resTaskSummaryD: { th: 'กลั่นกรองข้อมูลเชิงลึกจากเอกสารที่เลือก', en: 'Distill insights from selected docs', 'zh-CN': '从所选文档提炼洞察', ru: 'Выжимка из выбранных документов' },
    resTaskTrends: { th: 'วิเคราะห์เทรนด์ตลาด', en: 'Analyze market trends', 'zh-CN': '分析市场趋势', ru: 'Анализ трендов рынка' },
    resTaskTrendsD: { th: 'ค้นหาแนวโน้มโซลาร์เซลล์ล่าสุด', en: 'Find the latest solar trends', 'zh-CN': '发现最新太阳能趋势', ru: 'Последние тренды солнца' },
    resTaskComp: { th: 'วิเคราะห์คู่แข่ง', en: 'Analyze competitors', 'zh-CN': '分析竞争对手', ru: 'Анализ конкурентов' },
    resTaskCompD: { th: 'เปรียบเทียบจุดแข็งจุดอ่อนในตลาด', en: 'Compare market strengths & weaknesses', 'zh-CN': '对比市场优劣势', ru: 'Сильные и слабые стороны рынка' },
    resSelected: { th: 'เอกสารที่เลือก ({n})', en: 'Selected documents ({n})', 'zh-CN': '已选文档（{n}）', ru: 'Выбрано документов ({n})' },
    resClear: { th: 'ล้างทั้งหมด', en: 'Clear all', 'zh-CN': '清空', ru: 'Очистить' },
    resPickHint: { th: 'เลือกเอกสารด้านซ้ายเพื่อเริ่มงาน', en: 'Pick documents on the left to start', 'zh-CN': '在左侧选择文档开始', ru: 'Выберите документы слева' },
    resAnalyzing: { th: 'กำลังวิเคราะห์ข้อมูล...', en: 'Analyzing data...', 'zh-CN': '分析数据中…', ru: 'Анализ данных…' },
    resAnalyzingSub: { th: 'AI ({p}) กำลังประมวลผลข้อมูลจากเอกสาร {n} ฉบับ เพื่อหาข้อมูลเชิงลึกที่สำคัญที่สุดสำหรับคุณ', en: 'AI ({p}) is processing {n} documents to find the most important insights for you', 'zh-CN': 'AI（{p}）正在处理{n}个文档，为您挖掘最重要的洞察', ru: 'AI ({p}) обрабатывает {n} документов — ищем главное для вас' },
    resUseDraft: { th: 'ใช้ร่างบทความ', en: 'Use as article draft', 'zh-CN': '用作文章草稿', ru: 'В черновик статьи' },
    resCloseReport: { th: 'ปิดรายงาน', en: 'Close report', 'zh-CN': '关闭报告', ru: 'Закрыть отчёт' },
    setBrand: { th: 'การตั้งค่าแบรนด์ (ถูกจำกัดสำหรับแฟรนไชส์)', en: 'Brand settings (restricted for franchises)', 'zh-CN': '品牌设置（加盟受限）', ru: 'Настройки бренда (ограничено для франшиз)' },
    setPrimary: { th: 'สีหลัก', en: 'Primary color', 'zh-CN': '主色', ru: 'Основной цвет' },
    setSecondary: { th: 'สีรอง', en: 'Secondary color', 'zh-CN': '次色', ru: 'Второй цвет' },
    setPlatforms: { th: 'การเชื่อมต่อแพลตฟอร์ม', en: 'Platform connections', 'zh-CN': '平台连接', ru: 'Подключения платформ' },
    setConnected: { th: 'เชื่อมต่อแล้ว', en: 'Connected', 'zh-CN': '已连接', ru: 'Подключено' },
    setNotConnected: { th: 'ยังไม่ได้เชื่อมต่อ', en: 'Not connected', 'zh-CN': '未连接', ru: 'Не подключено' },
    setConnect: { th: 'เชื่อมต่อ', en: 'Connect', 'zh-CN': '连接', ru: 'Подключить' },
    setAiPrompt: { th: 'คำสั่งหลัก AI', en: 'Main AI instructions', 'zh-CN': 'AI主指令', ru: 'Главная AI-инструкция' },
    setAiPromptLabel: { th: 'คำสั่ง AI Assistant ส่วนกลาง', en: 'Global AI assistant instructions', 'zh-CN': '全局AI助手指令', ru: 'Глобальная инструкция ассистента' },
    setAiPromptPh: { th: 'คำแนะนำสำหรับการสร้างเนื้อหา...', en: 'Guidance for content creation...', 'zh-CN': '内容创作指引…', ru: 'Рекомендации для создания контента…' },
    setSave: { th: 'บันทึกการตั้งค่า', en: 'Save settings', 'zh-CN': '保存设置', ru: 'Сохранить настройки' },
    setTonePro: { th: 'มืออาชีพ น่าเชื่อถือ เน้นภูมิภาค', en: 'Professional, trustworthy, regional focus', 'zh-CN': '专业可信，聚焦区域', ru: 'Профессиональный, надёжный, региональный' },
    setToneFriendly: { th: 'เป็นมิตร เข้าถึงง่าย เรียบง่าย', en: 'Friendly, approachable, simple', 'zh-CN': '亲切易懂，简单明了', ru: 'Дружелюбный, простой' },
    setToneExpert: { th: 'เชี่ยวชาญ เจาะลึกทางเทคนิค วิเคราะห์', en: 'Expert, technical deep-dive, analytical', 'zh-CN': '专家级，技术深挖', ru: 'Экспертный, технический' },
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
console.log('BATCH7G-OK');
