// Batch 4: admin shell, error, dashboard, leads list, products, super tabs
// Usage: node scripts/i18n-batch4.mjs
import fs from 'node:fs';

const T = {
  admin: {
    navDashboard: { th: 'แดชบอร์ด', en: 'Dashboard', 'zh-CN': '仪表盘', ru: 'Дашборд' },
    navLeads: { th: 'รายชื่อลูกค้า', en: 'Leads', 'zh-CN': '客户名单', ru: 'Лиды' },
    navProducts: { th: 'สินค้า/บริการ', en: 'Products', 'zh-CN': '产品/服务', ru: 'Товары/услуги' },
    navSuper: { th: 'ตั้งค่าระบบ', en: 'System settings', 'zh-CN': '系统设置', ru: 'Настройки' },
    adminPanel: { th: 'แผงควบคุมแอดมิน', en: 'Admin panel', 'zh-CN': '管理面板', ru: 'Админ-панель' },
    toggleTheme: { th: 'สลับโหมด', en: 'Toggle theme', 'zh-CN': '切换主题', ru: 'Сменить тему' },
    aiOk: { th: 'ระบบ AI ออนไลน์', en: 'AI online', 'zh-CN': 'AI在线', ru: 'AI онлайн' },
    aiError: { th: 'ระบบ AI ขัดข้อง', en: 'AI error', 'zh-CN': 'AI故障', ru: 'Ошибка AI' },
    aiChecking: { th: 'กำลังตรวจสอบ AI...', en: 'Checking AI...', 'zh-CN': '正在检查AI…', ru: 'Проверка AI…' },
    logout: { th: 'ออกจากระบบ', en: 'Log out', 'zh-CN': '退出登录', ru: 'Выйти' },
    backToSite: { th: 'กลับหน้าเว็บไซต์', en: 'Back to site', 'zh-CN': '返回网站', ru: 'На сайт' },
    errTitle: { th: 'เกิดข้อผิดพลาด', en: 'Something went wrong', 'zh-CN': '出错了', ru: 'Произошла ошибка' },
    errSub: { th: 'ไม่สามารถโหลดข้อมูลหน้าจัดการได้', en: "Couldn't load the admin page", 'zh-CN': '无法加载管理页面', ru: 'Не удалось загрузить страницу' },
    errRetry: { th: 'ลองใหม่อีกครั้ง', en: 'Try again', 'zh-CN': '重试', ru: 'Попробовать снова' },
    errHome: { th: 'กลับไปที่หน้าหลัก', en: 'Back to home', 'zh-CN': '返回首页', ru: 'На главную' },
    tabQuiz: { th: 'บรีฟธุรกิจ', en: 'Business brief', 'zh-CN': '业务简报', ru: 'Бизнес-бриф' },
    tabAi: { th: 'ตั้งค่า AI', en: 'AI settings', 'zh-CN': 'AI设置', ru: 'Настройки AI' },
    tabKnowledge: { th: 'ฐานความรู้', en: 'Knowledge base', 'zh-CN': '知识库', ru: 'База знаний' },
    tabChat: { th: 'ประวัติแชท', en: 'Chat history', 'zh-CN': '聊天记录', ru: 'История чата' },
    tabNotif: { th: 'การแจ้งเตือน', en: 'Notifications', 'zh-CN': '通知', ru: 'Уведомления' },
    tabHealth: { th: 'สถานะระบบ', en: 'System status', 'zh-CN': '系统状态', ru: 'Состояние системы' },
    leadsTitle: { th: 'รายชื่อลูกค้าทั้งหมด', en: 'All leads', 'zh-CN': '全部客户', ru: 'Все лиды' },
    leadsCount: { th: '{n} รายการ', en: '{n} leads', 'zh-CN': '{n}条', ru: 'Всего: {n}' },
    newLead: { th: 'สร้างลูกค้าใหม่', en: 'New lead', 'zh-CN': '新建客户', ru: 'Новый лид' },
    searchPh: { th: 'ค้นหาชื่อหรือเบอร์โทร...', en: 'Search name or phone...', 'zh-CN': '搜索姓名或电话…', ru: 'Имя или телефон…' },
    loading: { th: 'กำลังโหลดรายการ...', en: 'Loading...', 'zh-CN': '加载中…', ru: 'Загрузка…' },
    empty: { th: 'ไม่พบรายการที่ค้นหา', en: 'No matching leads', 'zh-CN': '没有匹配的客户', ru: 'Ничего не найдено' },
    stNew: { th: 'ใหม่', en: 'New', 'zh-CN': '新', ru: 'Новый' },
    stWon: { th: 'ติดตั้งแล้ว', en: 'Installed', 'zh-CN': '已安装', ru: 'Установлен' },
    stLost: { th: 'ยกเลิก', en: 'Cancelled', 'zh-CN': '已取消', ru: 'Отменён' },
    productsTitle: { th: 'รายการสินค้า', en: 'Products', 'zh-CN': '产品列表', ru: 'Товары' },
    addProduct: { th: 'เพิ่มสินค้า', en: 'Add product', 'zh-CN': '添加产品', ru: 'Добавить товар' },
    loadingProducts: { th: 'กำลังโหลดรายการ...', en: 'Loading products...', 'zh-CN': '加载产品中…', ru: 'Загрузка товаров…' },
    noProducts: { th: 'ไม่พบรายการสินค้า', en: 'No products found', 'zh-CN': '没有产品', ru: 'Товары не найдены' },
    newProductTitle: { th: 'เพิ่มสินค้าใหม่', en: 'Add new product', 'zh-CN': '添加新产品', ru: 'Новый товар' },
    save: { th: 'บันทึก', en: 'Save', 'zh-CN': '保存', ru: 'Сохранить' },
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
console.log('BATCH4-OK');
