// Batch 7e: admin content generator + library
// Usage: node scripts/i18n-batch7e.mjs
import fs from 'node:fs';

const T = {
  content: {
    genSub: { th: 'สร้างเนื้อหาคุณภาพสูงด้วยขุมพลัง AI สำหรับทุกช่องทาง', en: 'High-quality AI content for every channel', 'zh-CN': '用AI为各渠道创作高质量内容', ru: 'Качественный AI-контент для всех каналов' },
    tplBlog: { th: 'บทความยาว (Blog Post)', en: 'Long article (Blog Post)', 'zh-CN': '长文（博客）', ru: 'Длинная статья (блог)' },
    tplFb: { th: 'โพสต์ Facebook', en: 'Facebook post', 'zh-CN': 'Facebook帖子', ru: 'Пост в Facebook' },
    tplLine: { th: 'LINE Broadcast', en: 'LINE Broadcast', 'zh-CN': 'LINE群发', ru: 'LINE-рассылка' },
    tplCompare: { th: 'เปรียบเทียบแบรนด์', en: 'Brand comparison', 'zh-CN': '品牌对比', ru: 'Сравнение брендов' },
    tplIndustrial: { th: 'คู่มือสำหรับโรงงาน', en: 'Factory guide', 'zh-CN': '工厂指南', ru: 'Гид для заводов' },
    tonePro: { th: 'เป็นทางการ (มืออาชีพ)', en: 'Formal (professional)', 'zh-CN': '正式（专业）', ru: 'Официальный' },
    toneFriendly: { th: 'เป็นกันเอง (ท้องถิ่นกระบี่)', en: 'Friendly (local Krabi)', 'zh-CN': '亲切（甲米本地）', ru: 'Дружелюбный (Краби)' },
    toneEdu: { th: 'เน้นความรู้ (ผู้เชี่ยวชาญ)', en: 'Educational (expert)', 'zh-CN': '知识型（专家）', ru: 'Экспертный' },
    toneUrgent: { th: 'เร่งด่วน (โปรโมชั่น)', en: 'Urgent (promo)', 'zh-CN': '紧迫（促销）', ru: 'Срочный (акция)' },
    genNeedTopic: { th: 'กรุณาระบุหัวข้อหรือคีย์เวิร์ด', en: 'Please enter a topic or keywords', 'zh-CN': '请输入主题或关键词', ru: 'Укажите тему или ключи' },
    genDone: { th: 'สร้างเนื้อหาสำเร็จ', en: 'Content created', 'zh-CN': '内容已生成', ru: 'Контент готов' },
    genFail: { th: 'เกิดข้อผิดพลาด: ', en: 'Error: ', 'zh-CN': '出错：', ru: 'Ошибка: ' },
    copied: { th: 'คัดลอกลง Clipboard แล้ว', en: 'Copied to clipboard', 'zh-CN': '已复制到剪贴板', ru: 'Скопировано' },
    genSettings: { th: 'การตั้งค่าการสร้างเนื้อหา', en: 'Generation settings', 'zh-CN': '生成设置', ru: 'Настройки генерации' },
    genTemplate: { th: 'เทมเพลตเนื้อหา', en: 'Content template', 'zh-CN': '内容模板', ru: 'Шаблон контента' },
    genTopic: { th: 'หัวข้อหลัก / คีย์เวิร์ด', en: 'Topic / keywords', 'zh-CN': '主题/关键词', ru: 'Тема / ключи' },
    genTopicPh: { th: 'เช่น การประหยัดค่าไฟด้วยระบบ Hybrid ในช่วงหน้าฝน...', en: 'e.g. saving power with Hybrid in rainy season...', 'zh-CN': '如：雨季用Hybrid系统省电…', ru: 'Напр. экономия с Hybrid в сезон дождей…' },
    genTone: { th: 'โทนเสียง (Tone)', en: 'Tone', 'zh-CN': '语气', ru: 'Тон' },
    genContext: { th: 'บริบทเพิ่มเติม (Context)', en: 'Extra context', 'zh-CN': '补充背景', ru: 'Доп. контекст' },
    genContextPh: { th: 'ระบุรายละเอียดที่ต้องการให้ AI ทราบ เช่น กลุ่มเป้าหมายเป็นเจ้าของบ้านพักพูลวิลล่า หรือเน้นเรื่องแบตเตอรี่ Sigenergy...', en: 'Details for the AI, e.g. target pool-villa owners, or focus on Sigenergy batteries...', 'zh-CN': '告诉AI的细节，如目标是泳池别墅业主，或聚焦Sigenergy电池…', ru: 'Детали для AI: напр. владельцы вилл с бассейном, фокус на батареях Sigenergy…' },
    genWorking: { th: 'กำลังรังสรรค์เนื้อหา...', en: 'Creating content...', 'zh-CN': '创作中…', ru: 'Создание…' },
    genCreate: { th: 'สร้างเนื้อหาด้วย AI', en: 'Generate with AI', 'zh-CN': 'AI生成', ru: 'Сгенерировать' },
    genPreview: { th: 'ตัวอย่างผลลัพธ์ (Preview)', en: 'Result preview', 'zh-CN': '结果预览', ru: 'Предпросмотр' },
    genCopy: { th: 'คัดลอก', en: 'Copy', 'zh-CN': '复制', ru: 'Копировать' },
    genToPipe: { th: 'ส่งงานไปที่ Pipeline', en: 'Send to pipeline', 'zh-CN': '发送到流水线', ru: 'В пайплайн' },
    genEmpty: { th: 'พร้อมสร้างสรรค์เนื้อหา!', en: 'Ready to create!', 'zh-CN': '准备开工！', ru: 'Готовы творить!' },
    genEmptySub: { th: 'ระบุข้อมูลที่ฝั่งซ้ายและให้ AI รังสรรค์งานคุณภาพให้กับธุรกิจของคุณ', en: 'Fill in the left panel and let AI craft quality content for your business', 'zh-CN': '在左侧填写信息，让AI为您的业务创作优质内容', ru: 'Заполните панель слева — AI создаст контент для бизнеса' },
    libSub: { th: 'จัดการไฟล์รูปภาพ วิดีโอ และเอกสารประกอบเนื้อหาอย่างมีประสิทธิภาพ', en: 'Manage images, videos and content docs efficiently', 'zh-CN': '高效管理图片、视频与内容文档', ru: 'Управление фото, видео и документами' },
    uploading: { th: 'Uploading...', en: 'Uploading...', 'zh-CN': '上传中…', ru: 'Загрузка…' },
    uploadFile: { th: 'อัปโหลดไฟล์', en: 'Upload file', 'zh-CN': '上传文件', ru: 'Загрузить файл' },
    libSearchPh: { th: 'ค้นหาไฟล์ในคลัง...', en: 'Search the library...', 'zh-CN': '搜索媒体库…', ru: 'Поиск по медиатеке…' },
    libAll: { th: 'ทั้งหมด', en: 'All', 'zh-CN': '全部', ru: 'Все' },
    libSelected: { th: 'ไฟล์ถูกเลือก', en: 'files selected', 'zh-CN': '个文件已选', ru: 'выбрано' },
    libDeleteSel: { th: 'ลบที่เลือก', en: 'Delete selected', 'zh-CN': '删除所选', ru: 'Удалить выбранное' },
    libCancel: { th: 'ยกเลิก', en: 'Cancel', 'zh-CN': '取消', ru: 'Отмена' },
    libLoading: { th: 'กำลังโหลดคลังสื่อ...', en: 'Loading library...', 'zh-CN': '加载媒体库中…', ru: 'Загрузка медиатеки…' },
    libEmpty: { th: 'ไม่พบไฟล์ที่ต้องการ', en: 'No files found', 'zh-CN': '没有找到文件', ru: 'Файлы не найдены' },
    libEmptyHint: { th: 'ลองอัปโหลดไฟล์ใหม่ หรือเปลี่ยนหมวดหมู่การค้นหา', en: 'Try uploading or changing the search category', 'zh-CN': '试试上传新文件或更换搜索类别', ru: 'Загрузите файл или смените категорию' },
    libLoadFail: { th: 'โหลดไฟล์ไม่สำเร็จ', en: "Couldn't load files", 'zh-CN': '文件加载失败', ru: 'Не удалось загрузить файлы' },
    libDup: { th: 'ไฟล์นี้มีอยู่ในคลังแล้ว', en: 'File already in library', 'zh-CN': '该文件已在库中', ru: 'Файл уже в библиотеке' },
    libUpDone: { th: 'อัปโหลดไฟล์สำเร็จ', en: 'Upload complete', 'zh-CN': '上传成功', ru: 'Загружено' },
    libUpFail: { th: 'อัปโหลดล้มเหลว', en: 'Upload failed', 'zh-CN': '上传失败', ru: 'Ошибка загрузки' },
    libConfirmDel: { th: 'ยืนยันการลบไฟล์นี้?', en: 'Delete this file?', 'zh-CN': '确认删除该文件？', ru: 'Удалить файл?' },
    libDelDone: { th: 'ลบไฟล์เรียบร้อย', en: 'File deleted', 'zh-CN': '文件已删除', ru: 'Файл удалён' },
    libDelFail: { th: 'ลบไฟล์ไม่สำเร็จ', en: "Couldn't delete file", 'zh-CN': '删除文件失败', ru: 'Не удалось удалить' },
    libThName: { th: 'ชื่อไฟล์', en: 'File name', 'zh-CN': '文件名', ru: 'Имя файла' },
    libThSize: { th: 'ขนาด', en: 'Size', 'zh-CN': '大小', ru: 'Размер' },
    libThDate: { th: 'วันที่อัปโหลด', en: 'Uploaded', 'zh-CN': '上传日期', ru: 'Загружен' },
    libThManage: { th: 'การจัดการ', en: 'Manage', 'zh-CN': '管理', ru: 'Управление' },
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
console.log('BATCH7E-OK');
