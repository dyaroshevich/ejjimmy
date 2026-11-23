// Batch 7c: admin content overview + distribution + franchises
// Usage: node scripts/i18n-batch7c.mjs
import fs from 'node:fs';

const T = {
  content: {
    ovSub: { th: 'ภาพรวมการดำเนินงานและสถิติประสิทธิภาพเนื้อหา', en: 'Ops overview and content performance stats', 'zh-CN': '运营总览与内容数据', ru: 'Обзор работы и статистика контента' },
    ovPosts: { th: 'โพสต์ทั้งหมด', en: 'Total posts', 'zh-CN': '全部帖子', ru: 'Всего постов' },
    ovPostsTrend: { th: '+12% ต่อเดือน', en: '+12% per month', 'zh-CN': '每月+12%', ru: '+12% в месяц' },
    ovPlanned: { th: 'วางแผนแล้ว', en: 'Scheduled', 'zh-CN': '已规划', ru: 'Запланировано' },
    ovPlannedTrend: { th: 'ในอีก 7 วันข้างหน้า', en: 'In the next 7 days', 'zh-CN': '未来7天', ru: 'На следующие 7 дней' },
    ovReview: { th: 'อยู่ระหว่างตรวจสอบ', en: 'In review', 'zh-CN': '审核中', ru: 'На проверке' },
    ovReviewTrend: { th: 'ต้องได้รับการตรวจสอบจากบรรณาธิการ', en: 'Needs editor review', 'zh-CN': '需编辑审核', ru: 'Нужна проверка редактора' },
    ovReach: { th: 'การเข้าถึงเฉลี่ย', en: 'Avg. reach', 'zh-CN': '平均触达', ru: 'Средний охват' },
    ovReachTrend: { th: '+8.5% เทียบกับก่อนหน้า', en: '+8.5% vs before', 'zh-CN': '环比+8.5%', ru: '+8,5% к прошлому' },
    ovActivity: { th: 'กิจกรรมล่าสุด', en: 'Recent activity', 'zh-CN': '最新动态', ru: 'Последняя активность' },
    ovActivitySub: { th: 'ฟีดอัปเดตแบบเรียลไทม์', en: 'Realtime feed', 'zh-CN': '实时动态', ru: 'Лента в реальном времени' },
    ovTop: { th: 'โพสต์ยอดนิยมประจำสัปดาห์', en: 'Top posts this week', 'zh-CN': '本周热门帖子', ru: 'Топ постов недели' },
    ovTopSub: { th: 'อันดับตามการเข้าถึงและการมีส่วนร่วม', en: 'Ranked by reach & engagement', 'zh-CN': '按触达与互动排名', ru: 'По охвату и вовлечённости' },
    distSub: { th: 'จัดการช่องทางการเผยแพร่และวิเคราะห์ประสิทธิภาพ', en: 'Manage channels and analyze performance', 'zh-CN': '管理发布渠道并分析效果', ru: 'Управление каналами и анализ эффективности' },
    distBroadcast: { th: 'กระจายเนื้อหา (Broadcast)', en: 'Broadcast content', 'zh-CN': '群发内容', ru: 'Рассылка контента' },
    distLatest: { th: 'ประสิทธิภาพเนื้อหาล่าสุด', en: 'Latest content performance', 'zh-CN': '最新内容效果', ru: 'Свежая эффективность' },
    distViewAll: { th: 'ดูทั้งหมด', en: 'View all', 'zh-CN': '查看全部', ru: 'Смотреть всё' },
    distLine: { th: 'ส่ง LINE Broadcast', en: 'Send LINE broadcast', 'zh-CN': '发送LINE群发', ru: 'Отправить LINE-рассылку' },
    distLineSub: { th: 'ส่งเนื้อหาใหม่ให้ผู้ติดตาม 8,245 คนทันที', en: 'Push new content to 8,245 followers instantly', 'zh-CN': '即时推送新内容给8,245位粉丝', ru: 'Новый контент 8 245 подписчикам сразу' },
    distFb: { th: 'แชร์ลง Facebook', en: 'Share to Facebook', 'zh-CN': '分享到Facebook', ru: 'Опубликовать в Facebook' },
    distFbSub: { th: 'ตั้งเวลาโพสต์ลงในหน้าเพจและกลุ่มที่เกี่ยวข้อง', en: 'Schedule posts to pages and relevant groups', 'zh-CN': '定时发布到主页和相关群组', ru: 'Запланировать посты на страницы и в группы' },
    distSeo: { th: 'อัปเดต SEO Metadata', en: 'Update SEO metadata', 'zh-CN': '更新SEO元数据', ru: 'Обновить SEO-метаданные' },
    distSeoSub: { th: 'ปรับแต่งคีย์เวิร์ดเพื่อให้ติดอันดับการค้นหาดีขึ้น', en: 'Tune keywords for better rankings', 'zh-CN': '优化关键词以提升搜索排名', ru: 'Настроить ключи для роста в поиске' },
    frStatus: { th: 'สถานะ', en: 'Status', 'zh-CN': '状态', ru: 'Статус' },
    frPosts: { th: 'โพสต์', en: 'Posts', 'zh-CN': '帖子', ru: 'Посты' },
    frReach: { th: 'การเข้าถึง', en: 'Reach', 'zh-CN': '触达', ru: 'Охват' },
    frActive: { th: 'เปิดใช้งาน', en: 'Active', 'zh-CN': '启用中', ru: 'Активен' },
    frSetup: { th: 'ตั้งค่าระบบ', en: 'Setting up', 'zh-CN': '配置中', ru: 'Настройка' },
    frGlobal: { th: 'เนื้อหาหลักแชร์ร่วมกัน (Global Posts)', en: 'Shared global posts', 'zh-CN': '全局共享内容', ru: 'Общие глобальные посты' },
    frGlobalSub: { th: 'โพสต์ที่สร้างโดย Master และแบ่งปันให้ทุกสาขาใช้งาน', en: 'Posts by Master shared with all branches', 'zh-CN': '由Master创建并共享给所有分店的帖子', ru: 'Посты Master для всех филиалов' },
    frThTitle: { th: 'หัวข้อ', en: 'Title', 'zh-CN': '标题', ru: 'Заголовок' },
    frThType: { th: 'ประเภท', en: 'Type', 'zh-CN': '类型', ru: 'Тип' },
    frThDate: { th: 'วันที่', en: 'Date', 'zh-CN': '日期', ru: 'Дата' },
    frThStatus: { th: 'สถานะ', en: 'Status', 'zh-CN': '状态', ru: 'Статус' },
    frThManage: { th: 'จัดการ', en: 'Manage', 'zh-CN': '管理', ru: 'Управление' },
    frPublished: { th: 'เผยแพร่แล้ว', en: 'Published', 'zh-CN': '已发布', ru: 'Опубликовано' },
    frInProgress: { th: 'กำลังดำเนินการ', en: 'In progress', 'zh-CN': '进行中', ru: 'В работе' },
    frConfigure: { th: 'ตั้งค่า', en: 'Configure', 'zh-CN': '配置', ru: 'Настроить' },
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
console.log('BATCH7C-OK');
