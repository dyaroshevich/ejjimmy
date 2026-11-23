// Batch 7f: admin content posts
// Usage: node scripts/i18n-batch7f.mjs
import fs from 'node:fs';

const T = {
  content: {
    postManage: { th: 'จัดการบทความ', en: 'Manage articles', 'zh-CN': '管理文章', ru: 'Управление статьями' },
    postNew: { th: 'สร้างบทความใหม่', en: 'New article', 'zh-CN': '新建文章', ru: 'Новая статья' },
    postSearchPh: { th: 'ค้นหาบทความ...', en: 'Search articles...', 'zh-CN': '搜索文章…', ru: 'Поиск статей…' },
    catTech: { th: 'เทคโนโลยี', en: 'Technology', 'zh-CN': '技术', ru: 'Технологии' },
    catGuide: { th: 'คู่มือ', en: 'Guides', 'zh-CN': '指南', ru: 'Гиды' },
    catNews: { th: 'ข่าวสาร', en: 'News', 'zh-CN': '资讯', ru: 'Новости' },
    catCase: { th: 'กรณีศึกษา', en: 'Case studies', 'zh-CN': '案例研究', ru: 'Кейсы' },
    catGeneral: { th: 'ทั่วไป', en: 'General', 'zh-CN': '通用', ru: 'Общее' },
    stPublished: { th: 'เผยแพร่แล้ว', en: 'Published', 'zh-CN': '已发布', ru: 'Опубликовано' },
    stDraft: { th: 'แบบร่าง', en: 'Draft', 'zh-CN': '草稿', ru: 'Черновик' },
    postEmpty: { th: 'ไม่พบบทความ', en: 'No articles found', 'zh-CN': '没有文章', ru: 'Статьи не найдены' },
    postEmptyHint: { th: 'ลองเปลี่ยนตัวกรองหรือสร้างบทความใหม่', en: 'Try changing filters or create a new article', 'zh-CN': '试试更换筛选或新建文章', ru: 'Смените фильтр или создайте статью' },
    postThTitle: { th: 'บทความ', en: 'Article', 'zh-CN': '文章', ru: 'Статья' },
    postThCat: { th: 'หมวดหมู่', en: 'Category', 'zh-CN': '分类', ru: 'Категория' },
    postThStatus: { th: 'สถานะ', en: 'Status', 'zh-CN': '状态', ru: 'Статус' },
    postThDate: { th: 'วันที่เผยแพร่', en: 'Published on', 'zh-CN': '发布日期', ru: 'Дата публикации' },
    postThActions: { th: 'การดำเนินการ', en: 'Actions', 'zh-CN': '操作', ru: 'Действия' },
    delTitle: { th: 'ยืนยันการลบ', en: 'Confirm delete', 'zh-CN': '确认删除', ru: 'Подтвердите удаление' },
    delSub: { th: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้', en: 'This cannot be undone', 'zh-CN': '此操作不可撤销', ru: 'Это необратимо' },
    delCancel: { th: 'ยกเลิก', en: 'Cancel', 'zh-CN': '取消', ru: 'Отмена' },
    delDeleting: { th: 'กำลังลบ...', en: 'Deleting...', 'zh-CN': '删除中…', ru: 'Удаление…' },
    delDelete: { th: 'ลบบทความ', en: 'Delete article', 'zh-CN': '删除文章', ru: 'Удалить статью' },
    delFail: { th: 'ลบบทความไม่สำเร็จ', en: "Couldn't delete article", 'zh-CN': '删除文章失败', ru: 'Не удалось удалить' },
    genericFail: { th: 'เกิดข้อผิดพลาด', en: 'Something went wrong', 'zh-CN': '出错了', ru: 'Что-то пошло не так' },
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
console.log('BATCH7F-OK');
