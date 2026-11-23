// Batch 6: admin lead detail page
// Usage: node scripts/i18n-batch6.mjs
import fs from 'node:fs';

const T = {
  admin: {
    ldLost: { th: 'ยกเลิกรายการ (Lead Lost)', en: 'Lead lost', 'zh-CN': '已流失', ru: 'Лид потерян' },
    reopen: { th: 'เปิดใหม่', en: 'Reopen', 'zh-CN': '重新打开', ru: 'Открыть снова' },
    noLead: { th: 'ไม่พบลีด', en: 'Lead not found', 'zh-CN': '未找到客户', ru: 'Лид не найден' },
    namePh: { th: 'ระบุชื่อลูกค้า', en: 'Customer name', 'zh-CN': '客户姓名', ru: 'Имя клиента' },
    call: { th: 'โทร', en: 'Call', 'zh-CN': '致电', ru: 'Позвонить' },
    copyIntroTitle: { th: 'คัดลอกข้อความทักทายลูกค้าทาง LINE', en: 'Copy LINE greeting for customer', 'zh-CN': '复制LINE问候语', ru: 'Скопировать приветствие для LINE' },
    copyLine: { th: 'คัดลอก LINE', en: 'Copy LINE', 'zh-CN': '复制LINE', ru: 'Копировать LINE' },
    aiInsight: { th: 'AI สรุปความต้องการ (Quick Insight)', en: 'AI needs summary (Quick Insight)', 'zh-CN': 'AI需求总结', ru: 'AI-сводка потребностей' },
    summarizing: { th: 'กำลังสรุป...', en: 'Summarizing...', 'zh-CN': '总结中…', ru: 'Анализ…' },
    summarizeAgain: { th: 'สรุปอีกครั้ง', en: 'Summarize again', 'zh-CN': '重新总结', ru: 'Ещё раз' },
    summarizeNow: { th: 'สรุปเลย', en: 'Summarize', 'zh-CN': '立即总结', ru: 'Сводка' },
    aiHint: { th: 'คลิกปุ่มด้านขวา เพื่อให้ AI ช่วยสรุปความต้องการของลูกค้าจากประวัติแชท', en: 'Click the button for AI to summarize needs from chat history', 'zh-CN': '点击右侧按钮，让AI根据聊天记录总结客户需求', ru: 'Нажмите кнопку — AI сведёт потребности из истории чата' },
    proposalHistory: { th: 'ประวัติใบเสนอราคา', en: 'Proposal history', 'zh-CN': '报价历史', ru: 'История КП' },
    defaultProposal: { th: 'ใบเสนอราคา', en: 'Proposal', 'zh-CN': '报价单', ru: 'КП' },
    noProposals: { th: 'ยังไม่มีประวัติใบเสนอราคา', en: 'No proposals yet', 'zh-CN': '暂无报价记录', ru: 'Предложений пока нет' },
    profileTitle: { th: 'ข้อมูลลูกค้า (Customer Profile)', en: 'Customer profile', 'zh-CN': '客户资料', ru: 'Профиль клиента' },
    avgBill: { th: 'ค่าไฟเฉลี่ย/เดือน', en: 'Avg. bill/month', 'zh-CN': '月均电费', ru: 'Средний счёт/мес' },
    billRange: { th: 'ช่วง', en: 'Range', 'zh-CN': '区间', ru: 'Диапазон' },
    systemIs: { th: 'ระบบ', en: 'System', 'zh-CN': '系统', ru: 'Система' },
    phone: { th: 'เบอร์โทรศัพท์', en: 'Phone', 'zh-CN': '电话', ru: 'Телефон' },
    province: { th: 'จังหวัด (City/Province)', en: 'Province', 'zh-CN': '府/省', ru: 'Провинция' },
    lineId: { th: 'ไลน์ไอดี (LINE ID)', en: 'LINE ID', 'zh-CN': 'LINE ID', ru: 'LINE ID' },
    email: { th: 'อีเมล', en: 'Email', 'zh-CN': '邮箱', ru: 'Email' },
    bldType: { th: 'ประเภทอาคาร', en: 'Building type', 'zh-CN': '建筑类型', ru: 'Тип здания' },
    roofType: { th: 'ประเภทหลังคา', en: 'Roof type', 'zh-CN': '屋顶类型', ru: 'Тип крыши' },
    howHeard: { th: 'ช่องทางที่รู้จักเรา', en: 'How they found us', 'zh-CN': '获知渠道', ru: 'Откуда узнали' },
    billPh: { th: 'เช่น 5000', en: 'e.g. 5000', 'zh-CN': '如5000', ru: 'Напр. 5000' },
    savedAuto: { th: 'บันทึกข้อมูลเรียบร้อยแล้ว', en: 'Saved', 'zh-CN': '已保存', ru: 'Сохранено' },
    autosaved: { th: 'ระบบบันทึกข้อมูลให้อัตโนมัติ (Auto-saved)', en: 'Auto-saved', 'zh-CN': '已自动保存', ru: 'Автосохранение включено' },
    notesTitle: { th: 'หมายเหตุของแอดมิน (Admin Notes)', en: 'Admin notes', 'zh-CN': '管理员备注', ru: 'Заметки' },
    notesPh: { th: 'เขียนโน้ตเพิ่มเติมเกี่ยวกับลูกค้า...', en: 'Add notes about this customer...', 'zh-CN': '补充客户备注…', ru: 'Заметки о клиенте…' },
    chatHistTitle: { th: 'ประวัติการพูดคุยกับ AI แทน', en: 'Chat history with AI', 'zh-CN': '与AI的聊天记录', ru: 'История чата с AI' },
    aiTan: { th: 'AI แทน', en: 'AI Tan', 'zh-CN': 'AI Tan', ru: 'AI Тан' },
    customer: { th: 'ลูกค้า', en: 'Customer', 'zh-CN': '客户', ru: 'Клиент' },
    qrHint: { th: 'แสดง QR Code นี้ให้ลูกค้าสแกนเพื่อเปิดหน้าใบเสนอราคาแบบตอบโต้ได้ (Interactive) บนมือถือของลูกค้าโดยตรง', en: 'Show this QR to the customer to open the interactive proposal on their phone', 'zh-CN': '请客户扫描此二维码，在手机上打开交互式报价单', ru: 'Покажите QR клиенту — интерактивное КП откроется на его телефоне' },
    copyProposalLink: { th: 'คัดลอกลิงก์หน้าเสนอราคา', en: 'Copy proposal link', 'zh-CN': '复制报价链接', ru: 'Копировать ссылку на КП' },
    confirmDelete: { th: 'ยืนยันการลบข้อมูลถาวร? ข้อมูลนี้จะไม่สามารถกู้คืนได้', en: 'Permanently delete? This cannot be undone', 'zh-CN': '确认永久删除？此操作不可恢复', ru: 'Удалить навсегда? Это необратимо' },
    deleteFail: { th: 'ลบไม่สำเร็จ: ', en: 'Delete failed: ', 'zh-CN': '删除失败：', ru: 'Ошибка удаления: ' },
    dangerZone: { th: 'ลบข้อมูลลูกค้ารายนี้ออกจากระบบ (Danger Zone)', en: 'Delete this lead (Danger Zone)', 'zh-CN': '删除该客户（危险区）', ru: 'Удалить лида (опасная зона)' },
    proposalDone: { th: 'สร้างใบเสนอราคา {label} สำเร็จ!', en: 'Proposal {label} created!', 'zh-CN': '报价单{label}已生成！', ru: 'КП {label} готово!' },
    pdfNotReady: { th: 'PDF ไม่พร้อมชั่วคราว — ใช้หน้าเว็บเสนอราคาแทน', en: 'PDF temporarily unavailable — using web proposal instead', 'zh-CN': 'PDF暂不可用——改用网页报价', ru: 'PDF временно недоступен — используем веб-КП' },
    proposalNotReady: { th: 'ใบเสนอราคายังไม่พร้อม', en: 'Proposal not ready yet', 'zh-CN': '报价单还没好', ru: 'КП ещё не готово' },
    genericError: { th: 'เกิดข้อผิดพลาด: ', en: 'Error: ', 'zh-CN': '出错：', ru: 'Ошибка: ' },
    snapshotDeleted: { th: 'ลบเวอร์ชันนี้แล้ว', en: 'Version deleted', 'zh-CN': '已删除该版本', ru: 'Версия удалена' },
    snapshotDeleteFail: { th: 'เกิดข้อผิดพลาดในการลบ', en: 'Delete failed', 'zh-CN': '删除失败', ru: 'Ошибка удаления' },
    networkError: { th: 'ข้อผิดพลาดเครือข่าย', en: 'Network error', 'zh-CN': '网络错误', ru: 'Ошибка сети' },
    saveFail: { th: 'ไม่สามารถบันทึกข้อมูลได้', en: "Couldn't save", 'zh-CN': '保存失败', ru: 'Не удалось сохранить' },
    linkCopied: { th: 'Link copied!', en: 'Link copied!', 'zh-CN': '链接已复制！', ru: 'Ссылка скопирована!' },
    introCopied: { th: 'คัดลอกข้อความทักทายแล้ว', en: 'Greeting copied', 'zh-CN': '问候语已复制', ru: 'Приветствие скопировано' },
    scanToView: { th: 'สแกนเพื่อดูข้อเสนอส่วนตัว (Client View)', en: 'Scan for personal offer (Client View)', 'zh-CN': '扫码查看专属方案', ru: 'Сканируйте — персональное КП' },
    ldStageNew: { th: 'รายการใหม่', en: 'New', 'zh-CN': '新线索', ru: 'Новый' },
    ldStageContacted: { th: 'ติดต่อแล้ว', en: 'Contacted', 'zh-CN': '已联系', ru: 'Связались' },
    ldStageQuoted: { th: 'เสนอราคาแล้ว', en: 'Quoted', 'zh-CN': '已报价', ru: 'КП отправлено' },
    ldStageSigned: { th: 'เซ็นสัญญาแล้ว', en: 'Signed', 'zh-CN': '已签约', ru: 'Договор' },
    ldStageWon: { th: 'ติดตั้งเสร็จสิ้น', en: 'Installed', 'zh-CN': '已安装', ru: 'Установлен' },
    lineT1: { th: '☀️ TAWAN POWER — ข้อเสนอพิเศษสำหรับคุณ {name} ☀️', en: '☀️ TAWAN POWER — special offer for you, {name} ☀️', 'zh-CN': '☀️ TAWAN POWER —— {name}专属方案 ☀️', ru: '☀️ TAWAN POWER — спецпредложение для вас, {name} ☀️' },
    lineT2: { th: 'สวัสดีครับคุณ {name} 🙏', en: 'Hello {name} 🙏', 'zh-CN': '您好{name} 🙏', ru: 'Здравствуйте, {name} 🙏' },
    lineT3: { th: 'ทาง TAWAN POWER ได้จัดทำข้อเสนอพิเศษสำหรับระบบโซลาร์เซลล์ถึงมือคุณแล้วครับ!', en: 'TAWAN POWER has prepared a special solar offer for you!', 'zh-CN': 'TAWAN POWER已为您准备好太阳能专属方案！', ru: 'TAWAN POWER подготовил для вас спецпредложение по солнцу!' },
    lineT4: { th: '📦 เกรดอุปกรณ์: {tier}{model}', en: '📦 Equipment grade: {tier}{model}', 'zh-CN': '📦 设备等级：{tier}{model}', ru: '📦 Класс оборудования: {tier}{model}' },
    lineT5: { th: '⚡ ขนาดระบบ: {kw} kW', en: '⚡ System size: {kw} kW', 'zh-CN': '⚡ 系统规模：{kw}kW', ru: '⚡ Мощность: {kw} кВт' },
    lineT6: { th: '💰 มูลค่าโครงการ: ฿{price}', en: '💰 Project value: ฿{price}', 'zh-CN': '💰 项目金额：฿{price}', ru: '💰 Стоимость проекта: ฿{price}' },
    lineT7: { th: '📊 ดูรายละเอียดใบเสนอราคาฉบับเต็ม:', en: '📊 Full proposal details:', 'zh-CN': '📊 完整报价详情：', ru: '📊 Полные детали КП:' },
    lineT8: { th: '👉 ตอบกลับข้อความนี้เพื่อรับคำปรึกษาฟรี หรือนัดวัดพื้นที่หน้างานได้เลยครับ', en: '👉 Reply for a free consultation or to book a site survey', 'zh-CN': '👉 回复即可免费咨询或预约上门勘察', ru: '👉 Ответьте — бесплатная консультация или выезд на замер' },
    lineT9: { th: 'TAWAN POWER — พลังงานสะอาดเพื่อคุณภาพชีวิตที่ดีขึ้น ☀️', en: 'TAWAN POWER — clean energy for a better life ☀️', 'zh-CN': 'TAWAN POWER —— 清洁能源，美好生活 ☀️', ru: 'TAWAN POWER — чистая энергия для лучшей жизни ☀️' },
    introMsg: { th: 'สวัสดีครับคุณ {name} ผมจาก TAWAN POWER นะครับ เห็นว่าคุณสนใจระบบ {power} พื้นที่ {location} ไม่ทราบว่าสะดวกให้ข้อมูลเพิ่มเติมหรือนัดวัดพื้นที่หน้างานไหมครับ?', en: 'Hello {name}, this is TAWAN POWER. I see you\'re interested in a {power} system in {location} — could you share more details or book a site survey?', 'zh-CN': '您好{name}，我是TAWAN POWER。看到您对{location}的{power}系统感兴趣，方便提供更多信息或预约上门勘察吗？', ru: 'Здравствуйте, {name}, это TAWAN POWER. Вижу интерес к системе {power} в {location} — подскажете детали или назначим выезд на замер?' },
    defaultCustomer: { th: 'ลูกค้า', en: 'customer', 'zh-CN': '客户', ru: 'клиент' },
    defaultLocation: { th: 'กระบี่', en: 'Krabi', 'zh-CN': '甲米', ru: 'Краби' },
    defaultPower: { th: 'โซลาร์เซลล์', en: 'solar', 'zh-CN': '太阳能', ru: 'солнечной системе' },
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
console.log('BATCH6-OK');
