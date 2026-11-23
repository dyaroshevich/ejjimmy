# Tawan Power — Pre-Launch & Post-Launch Playbook

**Дата:** 18 May 2026  
**Статус:** In Progress  
**Цель:** Переход от разработки к запуску на рынок

---

## 📌 Сводка

Продукт прошёл стадию активной разработки и приближается к финалу. Следующие этапы:

1. **Pre-Launch** — подготовка к запуску (тестирование, безопасность, инфраструктура)
2. **Launch** — выход на рынок (маркетинг, получение первых лидов)
3. **Post-Launch** — операционная деятельность, аналитика, улучшения

---

## 🎯 Pre-Launch Checklist

### 1. 🔒 Безопасность & Compliance

#### Критические (P0)
- [ ] **RLS включены на всех таблицах**
  - `leads` (миграция: `supabase/migrations/20260517000000_fix_leads_rls.sql`)
  - `solar_products` (миграция: `supabase/migrations/20260315114445_disable_rls_solar_products.sql`)
  - `knowledge`
  - **Action:** Переписать policies для:
    - `anon` role: только `SELECT` на публичные данные
    - `authenticated` role: полный CRUD на свои лиды
    - `service_role`: полный доступ

- [ ] **Авторизация админки**
  - Сейчас `/admin/*` полностью открыт (см. `BLIND_SPOTS.md` H1-H3)
  - **Action:** Добавить Supabase Auth проверку в:
    - `src/app/admin/layout.tsx`
    - `src/app/admin/leads/page.tsx`
    - `src/app/admin/super/page.tsx`
  - **Роли:** `admin` (обычные админы), `super_admin` (полный доступ)

- [ ] **PDPA Compliance (Thailand)**
  - Добавить чекбокс согласия на обработку персональных данных в `LeadForm`
  - Текст на тайском + русском/английском
  - Хранить consent timestamp в таблице `leads`
  - **Action:** Обновить `src/components/LeadForm.tsx`

- [ ] **Валидация входных данных**
  - Phone: Thai mobile format `^0[689]\d{8}$` (см. `BLIND_SPOTS.md` H3)
  - Name: XSS sanitization, max длина
  - Location: очистка от script тегов
  - **Action:** `src/lib/lead-manager.ts:49-102`

#### Высокие (P1)
- [ ] **Rate Limiting** на всех API routes
  - `/api/chat` — 20 req/min (AI expensive)
  - `/api/notify-line` — 10 req/min
  - `/api/lead` — 30 req/min
  - **Tool:** `@upstash/ratelimit` или custom middleware

- [ ] **XSS Sanitization** — использовать `DOMPurify` для всех пользовательских input

- [ ] **Secrets Management** — проверить, что `.env.local` не в git, все keys в Supabase Vault

### 2. 🧪 Тестирование & Стабильность

#### Функциональное тестирование
- [ ] **Критические user flows:**
  1. ✅ Посещение сайта → заполнение формы → получение thank you
  2. ✅ Чат → вопрос → AI ответ → сохранение transcript
  3. ✅ Админка → просмотр лидов → фильтрация по source → пометка contacted
  4. ✅ PWA → установка → push notification → открытие → отметка прочитано
  5. ✅ Каталог продуктов → поиск по типу/бренду/цене

- [ ] **Edge cases:**
  - AI API недоступен → fallback message
  - Supabase connection lost → friendly error
  - Send push to unsubscribed user → graceful handling
  - Concurrent lead submission → deduplication (см. `BLIND_SPOTS.md` B1)

#### Производительность
- [ ] **Исправить N+1 запросы** (см. `BLIND_SPOTS.md` P1)
  - `src/components/SolarChat.tsx:94-114` → заменить на `.in('id', productIds)`
  
- [ ] **Пагинация ProductGrid** (P2, `BLIND_SPOTS.md` P2)
  - Сейчас загружает все продукты → 50+ записей
  - **Action:** Добавить `limit/offset` + инфинити скролл

- [ ] **Image optimization** (P2)
  - Заменить `<img>` на `next/image` в `ProductCard.tsx`
  - Добавить `loading="lazy"`

- [ ] **Индексы БД** — проверить, что все созданы:
  ```sql
  \d solar_products -- проверка индексов
  ```
  Рекомендуется добавить composite индекс (см. ниже)

#### Мониторинг
- [ ] **Error tracking** — Sentry или LogRocket
  - Next.js + Supabase + LINE API
  - Установить SDK, настроить alerts

- [ ] **Uptime monitoring** — UptimeRobot, Pingdom
  - Health endpoint: `/api/health`
  - Check: 200 OK, DB connection, AI API status

- [ ] **Performance monitoring** — Vercel Analytics + Web Vitals
  - LCP, CLS, FID
  - Real User Monitoring (RUM)

### 3. 📊 Operational Readiness

#### CRM Integration
- [ ] **Выбрать CRM** или построить простую на Supabase:
  - **Вариант A:** Google Sheets (упрощённый, бесплатный)
    - Use `e.g. SheetDB` или Zapier → Google Sheets
  - **Вариант B:** Pipedrive/HubSpot (платный, но полный функционал)
  - **Вариант C:** Custom CRM в админке
    - Leads list с полями: source, status, assigned_to, notes
    - Timeline истории взаимодействий
    - Email integration (SendGrid API)

- [ ] **Lead assignment workflow**
  - Кто получает новый lead? Round-robin или manual assignment?
  - SLA: contacted within 24h, qualified within 72h
  - Уведомление админу через Web Push + Telegram

- [ ] **Admin UI polish**
  - Badge count непрочитанных лидов (real-time через Realtime)
  - Search по имени/phone/location
  - Filters: source (site/chat/line), status (new/contacted/qualified)
  - Export в CSV
  - Bulk actions: mark as contacted, delete, assign

#### Notifications Redundancy
- [ ] **Telegram Bot fallback** (см. `BLIND_SPOTS.md` фаза 2-3 недели)
  - Создать бота через @BotFather
  - Реализовать `/api/telegram/route.ts`
  - Отправлять лиды в Telegram-чаты админов
  - Action: Статус отправки в `leads` таблице

- [ ] **PWA Push reliability**
  - Проверить работу на iOS (Safari 16.4+), Android, Desktop
  - Fallback если push.subscribe fail → Telegram/Email
  - Tracking: delivered, opened, clicked

#### Dashboard Metrics
- [ ] **Metrics в админке:**
  - Leads за период (день/неделя/месяц)
  - Conversion funnel: leads → contacted → qualified → won
  - Source effectiveness: сайт vs chat vs LINE
  - Avg response time (от lead до first reply)
  - Активные чаты

### 4. 🚀 Marketing & Brand

#### SEO & Discovery
- [ ] **On-page SEO**
  - Meta title/description на всех страницах
  - Open Graph tags (для соцсетей)
  - Schema.org markup (`LocalBusiness`, `SolarEnergy`)
  - Sitemap (`sitemap.xml`) + `robots.txt`
  - Canonical URLs

- [ ] **Local SEO** (Thailand)
  - Google Business Profile
  - Citations: TrueID, Wongnai, Google Maps
  - Reviews: просить от клиентов

- [ ] **Content Marketing**
  - Блог: "Сколько стоят солнечные панели в Таиланде?", "Правила установки в Пхукете"
  - YouTube: видео монтажа, отзывы
  - Lead magnets:
    - Калькулятор сметы (PDF)
    - Сравнение брендов (Jinko vs Longi vs Canadian)
    - "5 ошибок при выборе инвертора" (checklist)

#### Analytics & Tracking
- [ ] **Google Analytics 4** setup
  - Events: `generate_quote`, `start_chat`, `submit_lead`
  - Conversions: lead submission, chat started
  - UTM parameters campaign tracking

- [ ] **Conversion tracking**
  - Google Ads conversion pixel
  - Facebook/Meta pixel (если реклама там)

- [ ] **Heatmaps & Session recordings** — Hotjar или Microsoft Clarity
  - Видеть, где клики, scroll depth, mouse movement

#### Brand Assets
- [ ] **Brand Guidelines** уже есть (`DESIGN.md`) — проверить compliance:
  - Logo на всех страницах
  - Цвета: интерьер brand purple (#6366f1), акцент оранжевый
  - Шрифты: Inter (body), Space Grotesk (headings)
  - Tone of voice: "Tan" — AI консультант (см. `docs/TONE_OF_VOICE.md`)

- [ ] **Marketing materials**
  - Логотипы (vector: SVG, raster: PNG 512px, 1024px)
  - Banner sizes для Google Ads, Facebook (1200x628, 1080x1080)
  - Business card template
  - Email signatures

### 5. 📈 Sales & Operations

#### Sales Process
- [ ] **Sales script** (пока есть только support-scripts.md)
  - Cold call script (если будем звонить лидам)
  - Follow-up email templates (1 день, 3 дня, 1 неделя)
  - Objection handling: "дорого", "подумаю", "уже другие посчитали"

- [ ] **Quotation system**
  - Auto-generate PDF quote из данных solar calculator
  - Включить: продукт, цена, сроки, гарантии, условия оплаты
  - Digital signature (PandaDoc/HelloSign API)

- [ ] **Pricing strategy**
  - Volume discounts (5+ панелей = 5% off)
  - Seasonal promotions (учёба сезонный?)
  - Financing options: 0% на 12 месяцев (partner с bank)
  - Trade-in old system?

#### Installation & Support
- [ ] **Installation partners**
  - Найти/обучить монтажников в Пхукете/Бангкоке
  - SLA: установка within 7 дней после оплаты
  - Quality checklist: tilt angle, wiring, inspection

- [ ] **Warranty documentation**
  - Product warranty: 10-25 лет (в зависимости от бренда)
  - Workmanship warranty: 5 лет
  - Exclusions:storm damage, user error
  - Claims process

- [ ] **Support system**
  - FAQ на сайте
  - Help center (Zendesk/Intercom)
  - Escalation matrix (уже есть `escalation-matrix.md`)
  - Response SLA: 4h для рабочих часов

#### Payment & Contracts
- [ ] **Payment terms**
  - 50% предоплата, 50% после установки
  - Или: 30/40/30 (заказ, доставка, монтаж)
  - Online payment:PromptPay (QR), bank transfer, credit card

- [ ] **Contract templates**
  - Service agreement (Scope of Work)
  - Terms & Conditions
  - Privacy Policy (PDPA compliant)
  - NDA для коммерческих предложений

- [ ] **Invoice automation**
  - Generate PDF из Supabase → Send via email
  - stripe/Paddle для recurring payments?

### 6. 📋 Legal & Documentation

- [ ] **Terms of Service**
  - Disclaimer: оценки calculator не являются офертой
  - Limitation of liability
  - Governing law: Thailand
  - Dispute resolution

- [ ] **Privacy Policy** (PDPA compliant)
  - Какие данные собираем (name, phone, email, location)
  - Зачем (quote generation, support)
  - Кто имеет доступ (Tawan Power staff)
  - Хранение: 5 лет (tax purposes), потом delete
  - Права пользователя: access, correction, deletion
  - Контакт для запросов: privacy@tawanpower.com

- [ ] **Cookie Policy** (если используем аналитику)
  - Necessary, Analytical, Marketing cookies
  - Cookie banner (OneTrust/CookieYes)

- [ ] **Quotation Terms** — условия коммерческих предложений
  - Validity: 30 дней
  - Price changes: due to exchange rate, supplier price increase
  - Exclusions: permits, electrical upgrades

### 7. 👥 Team & Processes

#### Roles & Responsibilities
- [ ] **Defined roles:**
  - **Admin** (сейчас 1 человек): обрабатывает лиды, отвечает в чате
  - **Sales Manager** (принять на hire): квалификация крупных лидов
  - **Installation Team** (партнёры): физический монтаж
  - **Support Agent** (после scale): post-installation支持

- [ ] **Handover workflow**
  ```
  Marketing (lead generation) → Admin (initial contact) → 
  Sales Manager (qualification) → Installation Team → Support
  ```
  - Handoff checklist: каждая стадия отмечает прогресс
  - Notification: следующему ответсвенному через Slack/Telegram

#### Daily Operations
- [ ] **Morning standup** (15 min)
  - Новые лиды вчера/сегодня
  - Hot leads awaiting response
  - Проблемы/блокеры
  - Today's priorities

- [ ] **Escalation dry-run** (тест матрицы)
  - Симулировать critical incident (AI down, DB fail)
  - Кто вызывает, в какой срок, как reach

- [ ] **Training materials**
  - How to use Admin Panel (screen recording + doc)
  - FAQ for常见的 клиентские вопросы
  - Solar basics training (для sales)

### 8. 💰 Finance & Metrics

#### Unit Economics
- [ ] **Calculate CAC (Customer Acquisition Cost)**
  - Advertising spend / количество лидов
  - Пример: ฿5000 / 50 leads = ฿100/lead

- [ ] **Calculate LTV (Lifetime Value)**
  - Avg system price ÷ конверсия
  - Upsell opportunities (batteries later)
  - Referrals

- [ ] **Gross Margin** по продуктам
  - Panel cost vs sale price
  - Inverter margin
  - Installation markup

#### KPIs Dashboard
- [ ] **Daily metrics:**
  - Leads count по source
  - Response time (avg, median)
  - Conversion: lead → quote → qualified → sale

- [ ] **Weekly metrics:**
  - Cost per lead (paid channels)
  - Lead quality score (phone valid, intent high)
  - Chat engagement rate

- [ ] **Monthly metrics:**
  - Revenue, Gross margin
  - Customer acquisition cost (CAC)
  - LTV:CAC ratio (target > 3:1)
  - Churn (если подписки)

### 9. 🔧 Technical Debt & Scaling

#### Known Issues (из аудита)
- [ ] **Fix N+1** в `SolarChat.tsx` (P1)
- [ ] **Add composite index** on `solar_products(type, power_kw)` (P3)
- [ ] **Implement deduplication** for leads (B1)
- [ ] **Auto-save calculator** (M6)
- [ ] **Rate limiting** на API routes

#### Scaling Preparation
- [ ] **Database connection pooling** — проверить Supabase limits
- [ ] **Cache strategy** — Redis для частых запросов (products list)
- [ ] **Queue for async tasks** — Vercel Queues для notifications
- [ ] **CDN** — Vercel Edge Config для гео-распределения

#### Monitoring & Reliability
- [ ] **SLA definition** — 99.5% uptime target
- [ ] **Alerting** — Slack/Telegram alerts на:
  - Error rate > 5%
  - API latency > 2s
  - New lead notification fail
- [ ] **Incident response plan** — who, what, when
- [ ] **Post-mortem template** — для каждого инцидента

---

## 🚀 Launch Phase

### Week 1: Soft Launch
- [ ] **Invite-only beta:** 10-20 early adopters (friends, family)
- [ ] **Feedback collection:** что не работает, что путают
- [ ] **Fix critical bugs** в течение 24h
- [ ] **Monitor metrics:** ошибки, время отклика, конверсия

### Week 2-4: Gradual Rollout
- [ ] **Open to public** но с low ad spend (10% бюджета)
- [ ] **A/B testing:**
  - Landing page headline variations
  - CTA button text ("Get Quote" vs "Calculate Savings")
  - Chat vs form primary CTA
- [ ] **Collect testimonials** от первых клиентов

### Month 2-3: Scale
- [ ] **Increase ad spend** на каналы с CAC < LTV/3
- [ ] **Content SEO** — publish 2-3 статьи в неделю
- [ ] **Partnerships** с installation companies
- [ ] **Referral program** — ฿1000 за приведённого клиента

---

## 📈 Post-Launch Optimization

### Continuous Improvement
- [ ] **Weekly review** — метрики, проблемы, wins
- [ ] **Monthly roadmap planning** — что улучшить
- [ ] **Customer interviews** — 5-10 пользователей в месяц
- [ ] **Competitor analysis** — что делают другие solar компании в Таиланде

### Product Evolution
- [ ] **FEATURES:**
  - Telegram bot (fallback notifications)
  - Mobile app (React Native если PWA недостаточно)
  - English language version (экспорт)
  - Customer portal (track installation progress)
  - Subscription maintenance plan (через Stripe)

- [ ] **INTEGRATIONS:**
  - WhatsApp Business API
  - Email marketing (Mailchimp/Brevo)
  - Accounting (Xero/QuickBooks)
  - Fleet management (для installation team)

---

## ⚠️ Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LINE API limit (300/mo) | High | High | Telegram fallback + Web Push primary |
| AI API downtime | Medium | High | Fallback message + "we'll reply shortly" |
| No leads в первые 2 недели | Medium | Medium | Pre-launch waiting list, ads start soft |
| Installation delays | Medium | High | Partner SLA penalties, buffer time |
| PDPA fine | Low | Critical | Legal review, consent checkbox, data retention |
| Competition (local solar companies) | High | Medium | Differentiation: AI-powered, instant quote |
| Currency fluctuation (USD/THB) | Medium | Medium | Price adjustments quarterly |

---

## 📞 Emergency Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| DB down/backup restore | Supabase Support | 1h |
| Vercel deployment fail | Team member | 2h |
| LINE API limit exceeded | Dev team | Immediate |
| Critical security bug | Dev team | Immediate |
| Installation partner issue | Operations lead | 4h |

---

## ✅ Pre-Launch Sign-off

| Role | Name | Sign-off Date | Notes |
|------|------|---------------|-------|
| Tech Lead | — | — | All tests pass, no critical bugs |
| Security | — | — | RLS, auth, PDPA compliant |
| Ops | — | — | CRM ready, team trained |
| Legal | — | — | T&C, Privacy Policy approved |
| Marketing | — | — | Content ready, ads scheduled |

---

**Next Action Items:**
1. Назначить ответственных за каждый раздел
2. Установить дедлайны (2 недели на pre-launch)
3. Daily standup начать сейчас
4. Первый milestone: PWA Push работает + RLS включены

---

*Документ обновлён: 18 May 2026*  
*Автор: Claude + Tawan Power Team*
