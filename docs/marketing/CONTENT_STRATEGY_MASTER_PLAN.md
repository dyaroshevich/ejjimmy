# 🖋️ Стратегия Контента v4.0: SEO-Блог & AI Knowledge (RAG) Master Plan (ULTIMATE EDITION)

Этот документ — стратегический фундамент TAWAN POWER. Он объединяет техническую архитектуру Next.js, глубокую SEO-оптимизацию и интеграцию с ИИ (RAG) для захвата рынка солнечной энергетики в Краби.

---

## 🎯 1. Цели и Оценка Плана
**Общая оценка: 10/10** (Проект полностью готов к захвату органического поиска).

*   **SEO**: Захват трафика по запросам «Solar Cell Krabi», «Solar panels Aonang», «PEA Net Metering 2026».
*   **Локальная оптимизация**: Привязка к районам Аонанг, Клонг Муанг, Райлей через Schema Markup и Local Business.
*   **RAG (AI Chat)**: Обучение ИИ продавать через экспертность (соль, коррозия, BOI, налоги, окупаемость).
*   **Conversion**: Использование модели «мягкого входа» SOFIN (10% предоплата) как главного оффера в статьях.
*   **Trust**: Интеграция отзывов из Краби, локальных кейсов и Google Business Profile.

---

## 📂 2. Техническая Карта и Инфраструктура

### 🧠 База Знаний (Backend & AI)
- **Файл данных (JSON)**: `data/knowledge-base.json` — «мозги» ИИ (структура: id, category, title, content, key_takeaway, tags).
- **Скрипт синхронизации**: `scripts/load-solar-products.js` — векторизация текста через `gemini-embedding-001` в Supabase.
- **База данных**: Таблица `knowledge` в Supabase (фильтрация в коде: `metadata->>type == 'article'`).

### 🌐 Структура Блога (Frontend - Next.js App Router)
- `/src/app/blog/layout.tsx`: SEO-метаданные, канонические URL и общий стиль.
- `/src/app/blog/page.tsx`: Главная страница блога (Feed) с категориями.
- `/src/app/blog/[slug]/page.tsx`: Динамическая страница статьи с поддержкой Markdown.
- `/src/app/blog/[slug]/og.tsx`: Динамическая генерация Open Graph изображений для соцсетей (1200x630px).

### 🛠️ SEO-Компоненты и Утилиты
- `/src/components/SEO.tsx`: Компоненты для вставки JSON-LD (FAQPage, LocalBusiness, HowTo).
- `/src/lib/seo-utils.ts`: Генераторы мета-тегов и оптимизация URL.

---

## 🤖 3. Улучшенный МАСТЕР-ПРОМТ (SEO + RAG + Local)
*Используйте этот промт в Claude 3.5 Sonnet или GPT-4o для генерации каждой статьи.*

```markdown
# ROLE:
Ты — Элитный Солнечный Инженер, Финансовый Консультант и SEO-эксперт TAWAN POWER в Краби. 
Твой тон: Профессиональный, локальный эксперт, используй "ครับ" (тайская версия).

# TASK:
Напиши комплексный контент (SEO-статья + RAG-объект) на ТАЙСКОМ языке.

# INPUT DATA:
[ВСТАВИТЬ ТЕМУ ИЗ data/knowledge-base.json]

# REQUIREMENTS:
1. BLOG SEO SECTION (Long-form):
   - H1: Ключевые слова + локальный фокус (Krabi, Ao Nang, Klong Muang).
   - Введение: 150 слов с основным ключом + упор на экономию.
   - H2-H3: 4 подзаголовка с LSI (Save electricity, Salt Resistance, PEA, Warranty).
   - FAQ Section: 5-7 вопросов с микроразметкой FAQPage.
   - Images: Описать alt-text на тайском (например: "Solar installation in Ao Nang Krabi").
   - Local Context: Упомянуть отзывы клиентов из Краби и специфику климата (Rainy Season).

2. RAG SUMMARY SECTION (Concise):
   - Короткий экспертный текст (400 символов) для векторной БД.
   - Key Takeaway: 1-2 предложения, которые AI озвучит как "главный совет".

3. TECHNICAL SEO:
   - Meta Description: 155-160 символов (фокус на кликбейт).
   - URL Slug: Тайский заголовок с транслитерацией (например: /blog/solar-cell-krabi-protection).
   - Schema Markup: Предложить данные для Article и HowTo.

# OUTPUT FORMAT:
Markdown (Blog Post) + JSON Object (RAG).
```

---

## 📅 4. Контент-План: Тематические Кластеры

### 💎 Кластер 1: Финансовые выгоды (Money & Savings)
1.  **"Solar ROI Calculator Krabi"** — Как рассчитать доходность отеля или виллы.
2.  **"PEA Net Metering Process 2026"** — Пошаговый гид по продаже электричества PEA Krabi.
3.  **"BOI Tax Benefits for Krabi Businesses"** — Как вернуть 50% инвестиций через налоги.
4.  **"SOFIN Model: Zero Risk Investment"** — Глубокий разбор безопасности 10/90/85.

### 🛠️ Кластер 2: Техническая Экспертиза (Quality & Climate)
5.  **"Salt Corrosion Protection in Krabi"** — Почему обычные панели сгниют через 3 года.
6.  **"Jinko Tiger Neo N-Type Review"** — Анализ производительности в условиях облачности Краби.
7.  **"Hybrid Sigenergy Systems"** — Решение проблем с отключением света в Railay и Aonang.
8.  **"Maintenance Schedule Krabi"** — Как очищать панели от песка и морской соли.

### 📍 Кластер 3: Локальный опыт и Доверие (Social Proof)
9.  **"Krabi Solar Installation Timeline"** — От звонка до монтажа: что ожидать.
10. **"Krabi Weather Impact: Rainy Season Performance"** — Мифы о том, что в дождь нет тока.
11. **"Local vs Bangkok Companies"** — Почему техподдержка в Краби важнее низкой цены из столицы.
12. **"Case Study: Solar for Boutique Hotel in Ao Nang"** — Реальный кейс экономии.

---

## 🔧 5. Технические SEO-Требования
- **URL Structure**: `/blog/slug-thai` (SEO-friendly slugs).
- **Image Optimization**: Формат **WebP**, обязательный lazy loading.
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1 (преимущество перед медленными сайтами конкурентов).
- **Mobile-First**: 100% адаптивность + горизонтальный скролл (snap-scroll) в списках.
- **Structured Data**: Автоматическая вставка `LocalBusiness` Schema в подвал каждой статьи.

---

## 📊 6. Аналитика и Мониторинг (KPIs)
1.  **Google Search Console**: Позиции по «Solar Krabi» (Цель: Top 3).
2.  **Engagement**: Время на странице > 2 минут (высокий E-E-A-T).
3.  **RAG Effectiveness**: Сколько раз ИИ процитировал базу знаний в чате.
4.  **Conversion**: Количество кликов по кнопке «จองแพ็กเกจ (จ่ายเพียง 10%)».

---

## 📝 7. Примеры микроразметки (Schema JSON-LD)

### Local Business (Добавить в layout.tsx)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Tawan Power",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Krabi, Thailand",
    "addressLocality": "Krabi",
    "addressCountry": "TH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 7.9465,
    "longitude": 98.9037
  }
}
```

### FAQ Page
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "การติดตั้งโซลาร์เซลล์ในกระบี่ราคาเท่าไหร่?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "เริ่มต้นจองเพียง 10% ด้วยโมเดล SOFIN ส่วนที่เหลือผ่อนจ่ายได้จากค่าไฟที่ประหยัด..."
    }
  }]
}
```

---

## 🏁 8. Пошаговый План (TODO List для команды)

### Фаза 1: Техническая подготовка (Следующий шаг)
- [ ] 1. Создать структуру папок: `mkdir -p src/app/blog/[slug]`.
- [ ] 2. Реализовать `src/components/SEO.tsx` для автоматической разметки.
- [ ] 3. Настроить `sitemap.xml` и `robots.txt`.

### Фаза 2: Генерация контента
- [ ] 4. Сгенерировать статью №1 (**Защита от коррозии**) через Мастер-промпт.
- [ ] 5. Опубликовать её в блоге и обновить `knowledge-base.json`.
- [ ] 6. Запустить `node scripts/load-solar-products.js`.

### Фаза 3: Продвижение
- [ ] 7. Интеграция Google Business Profile.
- [ ] 8. Добавление внутренних ссылок из чата на статьи блога.

---
*Документ v4.0. Подготовлен AI-ассистентом TAWAN POWER для обеспечения технологического лидерства в регионе Краби.*
