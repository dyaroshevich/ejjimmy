// Batch 7d: admin content pipeline + publishing
// Usage: node scripts/i18n-batch7d.mjs
import fs from 'node:fs';

const T = {
  content: {
    pipeSub: { th: 'ติดตามและจัดการสถานะการผลิตเนื้อหาอย่างเป็นระบบ', en: 'Track and manage production status', 'zh-CN': '跟踪管理内容生产状态', ru: 'Трекинг статусов производства' },
    pipePh: { th: 'หัวข้อเนื้อหาใหม่...', en: 'New content topic...', 'zh-CN': '新内容主题…', ru: 'Новая тема…' },
    pipeAdding: { th: 'กำลังเพิ่ม...', en: 'Adding...', 'zh-CN': '添加中…', ru: 'Добавление…' },
    pipeAdd: { th: 'เพิ่มงาน', en: 'Add task', 'zh-CN': '添加任务', ru: 'Добавить' },
    pipeLoading: { th: 'กำลังโหลดไปป์ไลน์...', en: 'Loading pipeline...', 'zh-CN': '加载流水线中…', ru: 'Загрузка…' },
    stagePlanning: { th: 'การวางแผน', en: 'Planning', 'zh-CN': '策划中', ru: 'Планирование' },
    stageWriting: { th: 'กำลังเขียน', en: 'Writing', 'zh-CN': '撰写中', ru: 'Написание' },
    stageReview: { th: 'รอตรวจทาน', en: 'In review', 'zh-CN': '待审核', ru: 'Проверка' },
    stageReady: { th: 'พร้อมเผยแพร่', en: 'Ready', 'zh-CN': '待发布', ru: 'Готово' },
    pipeLoadFail: { th: 'ไม่สามารถโหลดข้อมูลได้', en: "Couldn't load data", 'zh-CN': '加载数据失败', ru: 'Не удалось загрузить' },
    pipeLineFail: { th: 'โหลดข้อมูลไปป์ไลน์ไม่สำเร็จ', en: "Couldn't load pipeline", 'zh-CN': '流水线加载失败', ru: 'Не удалось загрузить пайплайн' },
    statusUpdated: { th: 'อัปเดตสถานะสำเร็จ', en: 'Status updated', 'zh-CN': '状态已更新', ru: 'Статус обновлён' },
    statusUpdateFail: { th: 'อัปเดตสถานะไม่สำเร็จ', en: "Couldn't update status", 'zh-CN': '状态更新失败', ru: 'Не удалось обновить статус' },
    taskAdded: { th: 'เพิ่มงานใหม่สำเร็จ', en: 'Task added', 'zh-CN': '任务已添加', ru: 'Задача добавлена' },
    taskAddFail: { th: 'เพิ่มงานไม่สำเร็จ', en: "Couldn't add task", 'zh-CN': '添加任务失败', ru: 'Не удалось добавить' },
    pubSub: { th: 'จัดการคิวการเผยแพร่เนื้อหาไปยังช่องทางโซเชียลมีเดียต่างๆ', en: 'Manage the publishing queue across social channels', 'zh-CN': '管理各社交渠道的内容发布队列', ru: 'Очередь публикаций в соцсетях' },
    pubNewSchedule: { th: 'ตารางเวลาใหม่', en: 'New schedule', 'zh-CN': '新建排期', ru: 'Новое расписание' },
    pubAll: { th: 'ทั้งหมด', en: 'All', 'zh-CN': '全部', ru: 'Все' },
    pubHelpTitle: { th: 'ต้องการตัวช่วยในการโพสต์ไหมครับ?', en: 'Need help posting?', 'zh-CN': '需要发布助手吗？', ru: 'Нужна помощь с постами?' },
    pubHelpDesc: { th: 'AI ของเราสามารถช่วยวิเคราะห์และแนะนำเวลาที่เหมาะสมที่สุด (Best Time to Post) สำหรับกลุ่มเป้าหมายในจังหวัดกระบี่ เพื่อเพิ่มการมองเห็นและ Engagement ให้สูงสุด', en: 'Our AI analyzes and recommends the best posting times for Krabi audiences to maximize reach and engagement', 'zh-CN': '我们的AI可分析并推荐针对甲米受众的最佳发布时间，最大化曝光与互动', ru: 'Наш AI подскажет лучшее время постов для аудитории Краби — максимум охвата и вовлечения' },
    pubHelpCta: { th: 'ขอคำแนะนำจาก AI', en: 'Ask AI for advice', 'zh-CN': '向AI求建议', ru: 'Спросить AI' },
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
console.log('BATCH7D-OK');
