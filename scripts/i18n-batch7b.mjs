// Batch 7b: admin content calendar + analytics
// Usage: node scripts/i18n-batch7b.mjs
import fs from 'node:fs';

const T = {
  content: {
    calSub: { th: 'วางแผนและจัดการตารางการเผยแพร่เนื้อหาอย่างเป็นระบบ', en: 'Plan and manage the publishing schedule', 'zh-CN': '规划管理内容发布日程', ru: 'Планирование графика публикаций' },
    calPlan: { th: 'วางแผนโพสต์', en: 'Plan a post', 'zh-CN': '规划帖子', ru: 'Запланировать пост' },
    calLoading: { th: 'กำลังโหลดปฏิทิน...', en: 'Loading calendar...', 'zh-CN': '加载日历中…', ru: 'Загрузка календаря…' },
    calUpcoming: { th: 'รายการที่กำลังจะมาถึง', en: 'Upcoming', 'zh-CN': '即将到来', ru: 'Предстоящее' },
    calEmpty: { th: 'ยังไม่มีรายการที่วางแผนไว้', en: 'Nothing scheduled yet', 'zh-CN': '暂无计划', ru: 'Пока пусто' },
    calLoadFail: { th: 'โหลดข้อมูลปฏิทินไม่สำเร็จ', en: "Couldn't load calendar", 'zh-CN': '日历加载失败', ru: 'Не удалось загрузить календарь' },
    daySun: { th: 'อาทิตย์', en: 'Sun', 'zh-CN': '周日', ru: 'Вс' },
    dayMon: { th: 'จันทร์', en: 'Mon', 'zh-CN': '周一', ru: 'Пн' },
    dayTue: { th: 'อังคาร', en: 'Tue', 'zh-CN': '周二', ru: 'Вт' },
    dayWed: { th: 'พุธ', en: 'Wed', 'zh-CN': '周三', ru: 'Ср' },
    dayThu: { th: 'พฤหัสบดี', en: 'Thu', 'zh-CN': '周四', ru: 'Чт' },
    dayFri: { th: 'ศุกร์', en: 'Fri', 'zh-CN': '周五', ru: 'Пт' },
    daySat: { th: 'เสาร์', en: 'Sat', 'zh-CN': '周六', ru: 'Сб' },
    monthJun: { th: 'มิถุนายน 2026', en: 'June 2026', 'zh-CN': '2026年6月', ru: 'Июнь 2026' },
    monthJul: { th: 'กรกฎาคม 2026', en: 'July 2026', 'zh-CN': '2026年7月', ru: 'Июль 2026' },
    anSub: { th: 'วิเคราะห์ประสิทธิภาพเนื้อหาและพฤติกรรมผู้อ่านอย่างเจาะลึก', en: 'Deep-dive into content performance and reader behavior', 'zh-CN': '深入分析内容效果与读者行为', ru: 'Глубокий анализ контента и поведения читателей' },
    anViews: { th: 'ยอดดูรวม (Total Views)', en: 'Total views', 'zh-CN': '总浏览量', ru: 'Всего просмотров' },
    anEngage: { th: 'การมีส่วนร่วม (Engagement)', en: 'Engagement', 'zh-CN': '互动量', ru: 'Вовлечённость' },
    anCtr: { th: 'อัตราการคลิก (CTR)', en: 'Click rate (CTR)', 'zh-CN': '点击率', ru: 'CTR' },
    anFollowers: { th: 'ผู้ติดตามใหม่', en: 'New followers', 'zh-CN': '新增粉丝', ru: 'Новые подписчики' },
    range7: { th: '7 วันล่าสุด', en: 'Last 7 days', 'zh-CN': '最近7天', ru: 'Последние 7 дней' },
    range30: { th: '30 วันล่าสุด', en: 'Last 30 days', 'zh-CN': '最近30天', ru: 'Последние 30 дней' },
    range90: { th: '90 วันล่าสุด', en: 'Last 90 days', 'zh-CN': '最近90天', ru: 'Последние 90 дней' },
    trafficTitle: { th: 'แนวโน้มยอดเข้าชม (Traffic Overview)', en: 'Traffic overview', 'zh-CN': '流量总览', ru: 'Обзор трафика' },
    chartEmpty: { th: 'กราฟแสดงผลกำลังประมวลผลข้อมูลล่าสุด...', en: 'Chart is processing the latest data...', 'zh-CN': '图表正在处理最新数据…', ru: 'График обрабатывает свежие данные…' },
    platformTitle: { th: 'สัดส่วนตามแพลตฟอร์ม', en: 'Share by platform', 'zh-CN': '各平台占比', ru: 'Доли платформ' },
    topTitle: { th: 'เนื้อหาที่ได้รับความนิยมสูงสุด', en: 'Top performing content', 'zh-CN': '最受欢迎的内容', ru: 'Топ-контент' },
    thArticle: { th: 'หัวข้อบทความ', en: 'Article', 'zh-CN': '文章', ru: 'Статья' },
    thViews: { th: 'ยอดดู', en: 'Views', 'zh-CN': '浏览', ru: 'Просмотры' },
    thShares: { th: 'แชร์', en: 'Shares', 'zh-CN': '分享', ru: 'Репосты' },
    thScore: { th: 'คะแนน', en: 'Score', 'zh-CN': '评分', ru: 'Оценка' },
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
console.log('BATCH7B-OK');
