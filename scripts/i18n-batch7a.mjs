// Batch 7a: admin content shell + overview + calendar
// Usage: node scripts/i18n-batch7a.mjs
import fs from 'node:fs';

const T = {
  content: {
    navOverview: { th: 'ภาพรวม', en: 'Overview', 'zh-CN': '总览', ru: 'Обзор' },
    grpPlan: { th: 'แผนงาน', en: 'Planning', 'zh-CN': '策划', ru: 'Планирование' },
    navCalendar: { th: 'ปฏิทิน', en: 'Calendar', 'zh-CN': '日历', ru: 'Календарь' },
    navPipeline: { th: 'ขั้นตอนการทำงาน', en: 'Workflow', 'zh-CN': '工作流', ru: 'Процессы' },
    navResearch: { th: 'งานวิจัย', en: 'Research', 'zh-CN': '研究', ru: 'Исследования' },
    grpProduce: { th: 'การผลิต', en: 'Production', 'zh-CN': '生产', ru: 'Производство' },
    navPosts: { th: 'บทความ', en: 'Articles', 'zh-CN': '文章', ru: 'Статьи' },
    navGenerator: { th: 'เครื่องมือสร้าง AI', en: 'AI builder', 'zh-CN': 'AI创作', ru: 'AI-генератор' },
    navLibrary: { th: 'คลังสื่อ', en: 'Media library', 'zh-CN': '媒体库', ru: 'Медиатека' },
    grpPublish: { th: 'การเผยแพร่', en: 'Publishing', 'zh-CN': '发布', ru: 'Публикация' },
    navQueue: { th: 'คิวโพสต์', en: 'Post queue', 'zh-CN': '发布队列', ru: 'Очередь' },
    navAnalytics: { th: 'การวิเคราะห์', en: 'Analytics', 'zh-CN': '数据分析', ru: 'Аналитика' },
    grpManage: { th: 'การจัดการ', en: 'Manage', 'zh-CN': '管理', ru: 'Управление' },
    navFranchises: { th: 'แฟรนไชส์', en: 'Franchises', 'zh-CN': '加盟', ru: 'Франшизы' },
    navSettings: { th: 'การตั้งค่า', en: 'Settings', 'zh-CN': '设置', ru: 'Настройки' },
    adminRole: { th: 'ผู้ดูแลระบบ', en: 'Administrator', 'zh-CN': '管理员', ru: 'Администратор' },
    newPost: { th: 'โพสต์ใหม่', en: 'New post', 'zh-CN': '新建帖子', ru: 'Новый пост' },
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
console.log('BATCH7A-OK');
