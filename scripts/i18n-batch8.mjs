// Batch 8: admin components (post modal/editor, create lead, offer hub, analytics)
// Usage: node scripts/i18n-batch8.mjs
import fs from 'node:fs';

const T = {
  admin: {
    pmTitle: { th: 'โพสต์ใหม่ / งานใหม่', en: 'New post / task', 'zh-CN': '新建帖子/任务', ru: 'Новый пост / задача' },
    pmHeading: { th: 'หัวข้อ / ชื่อโพสต์', en: 'Title', 'zh-CN': '标题', ru: 'Заголовок' },
    pmTitlePh: { th: 'ตัวอย่างเช่น รีวิวอินเวอร์เตอร์ Deye 10kW', en: 'e.g. Deye 10kW inverter review', 'zh-CN': '如：Deye 10kW逆变器评测', ru: 'Напр. обзор инвертора Deye 10kW' },
    pmType: { th: 'ประเภทเนื้อหา', en: 'Content type', 'zh-CN': '内容类型', ru: 'Тип контента' },
    pmPlatform: { th: 'แพลตฟอร์ม', en: 'Platform', 'zh-CN': '平台', ru: 'Платформа' },
    pmDesc: { th: 'คำอธิบาย / สคริปต์', en: 'Description / script', 'zh-CN': '描述/脚本', ru: 'Описание / сценарий' },
    pmDescPh: { th: 'คำอธิบายสั้นๆ แผนเนื้อหา หรือสคริปต์วิดีโอ...', en: 'Short description, content plan or video script...', 'zh-CN': '简短描述、内容计划或视频脚本…', ru: 'Краткое описание, план или сценарий видео…' },
    pmCancel: { th: 'ยกเลิก', en: 'Cancel', 'zh-CN': '取消', ru: 'Отмена' },
    pmCreating: { th: 'กำลังสร้าง...', en: 'Creating...', 'zh-CN': '创建中…', ru: 'Создание…' },
    pmCreate: { th: 'สร้างงาน', en: 'Create task', 'zh-CN': '创建任务', ru: 'Создать' },
    optVideo: { th: 'Video (วิดีโอ)', en: 'Video', 'zh-CN': '视频', ru: 'Видео' },
    optPost: { th: 'Post (โพสต์)', en: 'Post', 'zh-CN': '帖子', ru: 'Пост' },
    optCarousel: { th: 'Carousel (ภาพสไลด์)', en: 'Carousel', 'zh-CN': '轮播图', ru: 'Карусель' },
    optStory: { th: 'Story (สตอรี่)', en: 'Story', 'zh-CN': '快拍', ru: 'Сторис' },
    optArticle: { th: 'Article (บทความ)', en: 'Article', 'zh-CN': '文章', ru: 'Статья' },
    optAd: { th: 'Ad (โฆษณา)', en: 'Ad', 'zh-CN': '广告', ru: 'Реклама' },
    optBlog: { th: 'Blog (บล็อก)', en: 'Blog', 'zh-CN': '博客', ru: 'Блог' },
    peCreate: { th: 'สร้างบทความใหม่', en: 'New article', 'zh-CN': '新建文章', ru: 'Новая статья' },
    peEdit: { th: 'แก้ไขบทความ', en: 'Edit article', 'zh-CN': '编辑文章', ru: 'Редактировать статью' },
    peTitle: { th: 'หัวข้อ', en: 'Title', 'zh-CN': '标题', ru: 'Заголовок' },
    peTitlePh: { th: 'ชื่อบทความ...', en: 'Article title...', 'zh-CN': '文章标题…', ru: 'Заголовок статьи…' },
    peBody: { th: 'เนื้อหา (Markdown)', en: 'Body (Markdown)', 'zh-CN': '正文（Markdown）', ru: 'Текст (Markdown)' },
    peBodyPh: { th: 'เขียนเนื้อหาบทความในรูปแบบ Markdown...', en: 'Write the article in Markdown...', 'zh-CN': '用Markdown写正文…', ru: 'Текст статьи в Markdown…' },
    peExcerpt: { th: 'ข้อความย่อ', en: 'Excerpt', 'zh-CN': '摘要', ru: 'Анонс' },
    peExcerptPh: { th: 'คำอธิบายสั้นๆ สำหรับแสดงในรายการบทความ...', en: 'Short description for the article list...', 'zh-CN': '用于文章列表的简短描述…', ru: 'Краткое описание для списка…' },
    pePublish: { th: 'เผยแพร่', en: 'Publish', 'zh-CN': '发布', ru: 'Публикация' },
    peStatus: { th: 'สถานะ', en: 'Status', 'zh-CN': '状态', ru: 'Статус' },
    pePubDate: { th: 'วันที่เผยแพร่', en: 'Publish date', 'zh-CN': '发布日期', ru: 'Дата публикации' },
    peSaveDraft: { th: 'บันทึกร่าง', en: 'Save draft', 'zh-CN': '保存草稿', ru: 'Сохранить черновик' },
    pePublishBtn: { th: 'เผยแพร่', en: 'Publish', 'zh-CN': '发布', ru: 'Опубликовать' },
    peCategory: { th: 'หมวดหมู่', en: 'Category', 'zh-CN': '分类', ru: 'Категория' },
    peTags: { th: 'แท็ก (คั่นด้วยเครื่องหมาย ,)', en: 'Tags (comma separated)', 'zh-CN': '标签（逗号分隔）', ru: 'Теги (через запятую)' },
    peTagsPh: { th: 'โซลาร์เซลล์, พลังงานแสงอาทิตย์, กระบี่', en: 'solar, energy, krabi', 'zh-CN': '太阳能，能源，甲米', ru: 'солнце, энергия, Краби' },
    peCover: { th: 'ภาพปก (URL)', en: 'Cover image (URL)', 'zh-CN': '封面图（URL）', ru: 'Обложка (URL)' },
    peSeoTitlePh: { th: 'ชื่อสำหรับ SEO', en: 'SEO title', 'zh-CN': 'SEO标题', ru: 'SEO-заголовок' },
    peSeoDescPh: { th: 'คำอธิบายสำหรับเครื่องมือค้นหา...', en: 'Description for search engines...', 'zh-CN': '搜索引擎描述…', ru: 'Описание для поисковиков…' },
    peAuthor: { th: 'ผู้เขียน', en: 'Author', 'zh-CN': '作者', ru: 'Автор' },
    clNeedName: { th: 'กรุณาระบุชื่อลูกค้า', en: 'Please enter the customer name', 'zh-CN': '请输入客户姓名', ru: 'Укажите имя клиента' },
    clCreated: { th: 'สร้างลูกค้ารายใหม่สำเร็จ!', en: 'New lead created!', 'zh-CN': '新客户已创建！', ru: 'Новый лид создан!' },
    clTitle: { th: 'สร้างรายชื่อลูกค้าใหม่', en: 'Create new lead', 'zh-CN': '新建客户', ru: 'Новый лид' },
    clName: { th: 'ชื่อลูกค้า *', en: 'Customer name *', 'zh-CN': '客户姓名*', ru: 'Имя клиента *' },
    clNamePh: { th: 'ชื่อ-นามสกุล', en: 'Full name', 'zh-CN': '姓名', ru: 'Имя и фамилия' },
    clPhone: { th: 'เบอร์โทรศัพท์', en: 'Phone', 'zh-CN': '电话', ru: 'Телефон' },
    clEmail: { th: 'อีเมล', en: 'Email', 'zh-CN': '邮箱', ru: 'Email' },
    clLocation: { th: 'จังหวัด / พื้นที่', en: 'Province / area', 'zh-CN': '府/地区', ru: 'Провинция / район' },
    clLocationPh: { th: 'เช่น กระบี่', en: 'e.g. Krabi', 'zh-CN': '如：甲米', ru: 'Напр. Краби' },
    clSubmit: { th: 'บันทึกและสร้างลูกค้า', en: 'Save & create lead', 'zh-CN': '保存并新建客户', ru: 'Сохранить и создать' },
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
console.log('BATCH8-OK');
