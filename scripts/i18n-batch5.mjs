// Batch 5: admin dashboard + products pages
// Usage: node scripts/i18n-batch5.mjs
import fs from 'node:fs';

const T = {
  admin: {
    dashTitle: { th: 'ภาพรวมระบบ', en: 'System overview', 'zh-CN': '系统总览', ru: 'Обзор системы' },
    dashSub: { th: 'สรุปภาพรวมทั้งหมด', en: 'Everything at a glance', 'zh-CN': '一览全局', ru: 'Всё главное' },
    realtime: { th: 'อัปเดตเรียลไทม์', en: 'Realtime updates', 'zh-CN': '实时更新', ru: 'Обновления в реальном времени' },
    statTotal: { th: 'ลีดทั้งหมด', en: 'Total leads', 'zh-CN': '全部线索', ru: 'Всего лидов' },
    statUnread: { th: 'ยังไม่ได้อ่าน', en: 'Unread', 'zh-CN': '未读', ru: 'Непрочитанные' },
    statChat: { th: 'จากแชทบอท', en: 'From chatbot', 'zh-CN': '来自聊天机器人', ru: 'Из чат-бота' },
    statWon: { th: 'ปิดการขายแล้ว', en: 'Closed won', 'zh-CN': '已成交', ru: 'Выиграно' },
    recentTitle: { th: 'การติดต่อล่าสุด', en: 'Recent contacts', 'zh-CN': '最近联系', ru: 'Последние контакты' },
    fAll: { th: 'ทั้งหมด', en: 'All', 'zh-CN': '全部', ru: 'Все' },
    fNew: { th: 'ใหม่', en: 'New', 'zh-CN': '新', ru: 'Новые' },
    fChat: { th: 'แชทบอท', en: 'Chatbot', 'zh-CN': '聊天机器人', ru: 'Чат-бот' },
    fWeb: { th: 'เว็บไซต์', en: 'Website', 'zh-CN': '网站', ru: 'Сайт' },
    loadingData: { th: 'กำลังโหลดข้อมูล...', en: 'Loading data...', 'zh-CN': '加载数据中…', ru: 'Загрузка данных…' },
    noContacts: { th: 'ไม่พบรายการติดต่อ', en: 'No contacts found', 'zh-CN': '没有联系记录', ru: 'Контакты не найдены' },
    noName: { th: 'ไม่ระบุชื่อ', en: 'Unnamed', 'zh-CN': '未命名', ru: 'Без имени' },
    fromChat: { th: 'จากแชทบอท', en: 'From chatbot', 'zh-CN': '来自聊天机器人', ru: 'Из чат-бота' },
    fromWeb: { th: 'จากเว็บไซต์', en: 'From website', 'zh-CN': '来自网站', ru: 'С сайта' },
    billLabel: { th: 'ค่าไฟ', en: 'Power bill', 'zh-CN': '电费', ru: 'Счёт за свет' },
    stageNew: { th: 'ใหม่', en: 'New', 'zh-CN': '新线索', ru: 'Новые' },
    stageContacted: { th: 'ติดต่อแล้ว', en: 'Contacted', 'zh-CN': '已联系', ru: 'Связались' },
    stageQuoted: { th: 'เสนอราคา', en: 'Quoted', 'zh-CN': '已报价', ru: 'КП отправлено' },
    stageSigned: { th: 'เซ็นสัญญา', en: 'Signed', 'zh-CN': '已签约', ru: 'Договор' },
    stageWon: { th: 'ติดตั้งแล้ว', en: 'Installed', 'zh-CN': '已安装', ru: 'Установлен' },
    prodDetailTitle: { th: 'รายละเอียดสินค้า', en: 'Product details', 'zh-CN': '产品详情', ru: 'Детали товара' },
    backToProducts: { th: 'กลับไปสินค้า', en: 'Back to products', 'zh-CN': '返回产品', ru: 'К товарам' },
    productNotFound: { th: 'ไม่พบสินค้า', en: 'Product not found', 'zh-CN': '未找到产品', ru: 'Товар не найден' },
    edit: { th: 'แก้ไข', en: 'Edit', 'zh-CN': '编辑', ru: 'Изменить' },
    loadingProduct: { th: 'กำลังโหลด...', en: 'Loading...', 'zh-CN': '加载中…', ru: 'Загрузка…' },
    uploadFail: { th: 'อัปโหลดไม่สำเร็จ: ', en: 'Upload failed: ', 'zh-CN': '上传失败：', ru: 'Ошибка загрузки: ' },
    productNotFoundErr: { th: 'ไม่พบสินค้า', en: 'Product not found', 'zh-CN': '未找到产品', ru: 'Товар не найден' },
    prodNamePh: { th: 'เช่น 3kW Starter Package', en: 'e.g. 3kW Starter Package', 'zh-CN': '如：3kW入门套餐', ru: 'Напр. 3kW Starter Package' },
    prodDescPh: { th: 'รายละเอียดสินค้า...', en: 'Product description...', 'zh-CN': '产品描述…', ru: 'Описание товара…' },
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
console.log('BATCH5-OK');
