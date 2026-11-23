# 🎯 Tawan Power: Skills Matrix & Competency Map

**Документ:** Матрица компетенций для полного цикла проекта  
**Версия:** 1.0  
**Дата:** 2026-05-15  
**Проект:** Solar Krabi AI Advisor → Tawan Power

---

## 📋 Оглавление

1. [Введение](#введение)
2. [Ключевые مهارetyp (Skill Areas)](#ключевые-навыки-skill-areas)
3. [Матрица компетенций](#матрица-компетенций)
4. [Детализация по навыкам](#детализация-по-навыкам)
5. [Roadmap развития команд](#roadmap-развития-команд)
6. [Критические точки](#критические-точки-where-skills-matter-most)

---

## Введение

### Цель документа
Предоставить структурированное представление о навыках, требуемых для успешной реализации проекта Tawan Power на всех этапах жизненного цикла — от разработки до монетизации.

### Контекст проекта
**Tawan Power** — это Solar Revenue Engine: AI-платформа для консультаций по солнечной энергии в Краби (Таиланд), которая превращает трафик в квалифицированные лиды через иммерсивный чат-интерфейс и интеллектуальные расчеты.

**Текущий статус:** Phase 1 завершен, Phase 2 (CRM & Lead Capture) в процессе  
**Технический стек:** Next.js, TypeScript, Groq (Llama 3), Gemini, Supabase (Postgres + Realtime), LINE Flex Messaging

---

## Ключевые навыки (Skill Areas)

### 1. Full-Stack TypeScript Engineering
**Код:** `FS-TS`  
**Уровень:** Senior+  
**Область:** Разработка и поддержка кодовой базы

**Компетенции:**
- Next.js 14/15 App Router, Server Actions, Route Handlers (API)
- TypeScript: advanced types, generics, utility types, type-safe APIs
- React: hooks, performance optimization, concurrent features
- State management: Context API, server state (TanStack Query/SWR), localStorage persistence
- API design: REST, GraphQL considerations, error handling patterns
- Testing: Jest/Vitest, React Testing Library, E2E (Playwright/Cypress)

**Почему это критично:**
Калькулятор солнечных систем (`solarCalculator.ts`) — математическое ядро, требуется высокая точность и type safety. Чат-интерфейс с conversational state требует грамотной архитектуры persistence.

---

### 2. AI/ML Engineering & Prompt Craft
**Код:** `AI-ML`  
**Уровень:** Senior+  
**Область:** Интеграция и оптимизация ИИ-компонентов

**Компетенции:**
- LLM API integration (Groq, Anthropic, Google AI, OpenAI)
- Tool/Function calling: saveLead, calculateSolar, getProductCatalog
- Prompt engineering: system prompts, few-shot examples, fallback strategies
- Streaming: Server-Sent Events (SSE), React streaming API
- RAG implementation: vector search, embeddings, Pinecone/Supabase Vector
- Latency optimization: caching, request deduplication, model selection
- Observability: logging, tracing, token usage, cost monitoring

**Почему это критично:**
Качество AI-консультации напрямую влияет на конверсию. Нужна точность extraction лид-данных и корректность расчетов. Fallback Groq → Gemini обеспечивает uptime.

---

### 3. Product & UX Strategy
**Код:** `UX-PM`  
**Уровень:** Senior PM/UX Designer  
**Область:** Пользовательский опыт и продуктовые решения

**Компетенции:**
- Mobile-first UX, PWA design principles
- Conversion funnel optimization: awareness → consideration → conversion
- Information architecture, microcopy, tone of voice (Thai/English)
- Progressive disclosure, zero-friction patterns, immersive experience
- User research: interviews, surveys, session replay (PostHog/Mouseflow)
- Analytics setup: funnel tracking, event taxonomy, cohort analysis
- Accessibility (WCAG 2.2 AA), performance budgets

**Почему это критично:**
Продукт позиционируется как "Solar Revenue Engine", а не "AI chat". Ключевой метрик: % пользователей, converters в реальные сделки. "Seamless Shell" (лендинг + иммерсивный чат) требует сложной UX-архитектуры.

---

### 4. Data & Analytics
**Код:** `DATA`  
**Уровень:** Data Engineer/Analyst  
**Область:** Данные, аналитика, бизнес-инсайты

**Компетенции:**
- PostgreSQL: advanced queries, indexes, materialized views
- Supabase Realtime: real-time dashboards, subscriptions
- Data modeling: schema design, foreign keys, constraints
- ETL pipelines: data cleaning, enrichment, aggregation
- BI tools: Metabase, Superset, custom dashboards
- Tracking implementation: events, user properties, conversions
- Privacy compliance: GDPR, Thai PDPA, PII masking

**Почему это критично:**
Нужно понимать, на каком этапе воронки пользователи теряются. Admin realtime dashboard для отдела продаж. Измерение ROI: сколько лидов → сколько instalations.

---

### 5. Business Dev & Partnerships
**Код:** `BIZDEV`  
**Уровень:** BizDev Manager  
**Обладаение:** Бизнес-интеграции и монетизация

**Компетенции:**
- B2B integrations: CRM (Salesforce, HubSpot), notification systems (Line Notify)
- API negotiation, webhook design, error handling in production
- Vendor/supplier partnerships: solar panel manufacturers, inverter suppliers
- Monetization models: commission structures, subscription, lead fees
- Contract negotiation, SLA design, escalation procedures
- Regulatory compliance: Thai business laws, solar permits, data protection
- Customer onboarding, training, handoff processes

**Почему это критично:**
Интеграция с LINE (основной messenger в Таиланде) — ключевой канал. Платежная система Sofin (предоплаты). Партнерство с поставщиками для RAG knowledge base. Handoff: лид → инженер → сделка.

---

## Матрица компетенций

### Легенда
| Символ | Значение |
|--------|----------|
| ✅ **Critical** | Навык обязателен, без него этап невозможен |
| 🔄 **Important** | Навык важен, существенно влияет на качество |
| ⚪ **Nice-to-have** | Желателен, но не блокирует прогресс |
| — **Not needed** | Не требуется на данном этапе |

### Таблица: Навыки × Этапы жизненного цикла

| Skill →<br>Stage ↓ | FS-TS<br>Full-Stack TS | AI-ML<br>AI/ML Eng | UX-PM<br>Product/UX | DATA<br>Data & Analytics | BIZDEV<br>Business Dev |
|-------------------|----------------------|--------------------|-------------------|--------------------------|------------------------|
| **Development** | ✅ | ✅ | ✅ | ⚪ | ⚪ |
| **Testing** | ✅ | ✅ | 🔄 | ⚪ | — |
| **Deployment** | ✅ | 🔄 | — | 🔄 | 🔄 |
| **Operations** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Growth** | 🔄 | ✅ | ✅ | ✅ | ✅ |
| **Revenue** | ⚪ | 🔄 | 🔄 | ✅ | ✅ |

---

### Пояснения к матрице

#### Development Phase (Разработка)
- **FS-TS:** Создание ядра калькулятора, чат-компонентов, API endpoints
- **AI-ML:** Интеграция Groq/Gemini, tool calling, промпты
- **UX-PM:** Дизайн UX flows, прототипирование, интеракции
- **DATA:** Настройка базы данных, начальные миграции
- **BIZDEV:** — не требуется, но начальные переговоры с поставщиками

#### Testing Phase (Тестирование)
- **FS-TS:** Unit/integration tests, E2E coverage
- **AI-ML:** A/B testing промптов, evaluation datasets
- **UX-PM:** Юзабилити-тесты, QA UI states
- **DATA:** — минимально
- **BIZDEV:** — не требуется

#### Deployment Phase (Деплой)
- **FS-TS:** CI/CD, конфигурация Vercel, мониторинг
- **AI-ML:** настройка rate limits, monitoring costs
- **UX-PM:** — не требуется
- **DATA:** ETL для production analytics
- **BIZDEV:** подготовка к онбордингу клиентов, SLA

#### Operations Phase (Эксплуатация)
- **FS-TS:** Bug fixes, техническая поддержка, рефакторинг
- **AI-ML:** оптимизация latency, backups промптов, fallback logic
- **UX-PM:** сбор фидбека, итерация UX
- **DATA:** мониторинг health, alerting, отчеты для продаж
- **BIZDEV:** поддержка клиентов, обработка escalations

#### Growth Phase (Рост)
- **FS-TS:** масштабирование, новая функциональность
- **AI-ML:** RAG для каталога оборудования, multilingual support
- **UX-PM:** Conversion rate optimization, A/B tests
- **DATA:** рост аналитики, ML-модели для lead scoring
- **BIZDEV:** новые партнерства, интеграции CRM, расширение регионов

#### Revenue Phase (Монетизация)
- **FS-TS:** платежные системы, reporting, invoices
- **AI-ML:** премиум-модели, upsell suggestions
- **UX-PM:** UX для платящих пользователей, retention
- **DATA:** revenue reporting, LTV/CAC, ROI для клиентов
- **BIZDEV:** переговоры по комиссиям, contracts, scaling partnerships

---

## Детализация по навыкам

### 1. Full-Stack TypeScript Engineering

#### Этап: Development
**Задачи:**
- [ ] Реализация `SolarCalculator` с точностью 2 знака после запятой
- [ ] Chat UI компоненты: message bubbles, quick replies, result cards
- [ ] API routes: POST /api/chat, POST /api/leads, GET /api/admin/leads
- [ ] State persistence: localStorage schema, hydration, conflict resolution
- [ ] Middleware: rate limiting, auth, error boundaries

**Сложность:** Senior+ (знание Next.js, React Server Components, streaming)

#### Этап: Operations
**Задачи:**
- [ ] Monitoring: Sentry, LogRocket, custom error tracking
- [ ] Performance: bundle analysis (`@next/bundle-analyzer`), Core Web Vitals
- [ ] Refactoring: extract reusable components, eliminate duplication
- [ ] Migration: Next.js upgrades, breaking changes

**Критические навыки:**
- Profiling (React DevTools, Chrome Performance)
- Code splitting strategies
- Database query optimization (Supabase indexes)

---

### 2. AI/ML Engineering & Prompt Craft

#### Этап: Development
**Задачи:**
- [ ] Настройка Groq API client с Llama 3 70B (temperature=0.5, max_tokens=2048)
- [ ] System prompt: Thai/English bilingual, tone "expert but not pushy"
- [ ] Tool calling: `saveLead(phone, line_id, bill_kwh, system_size_kw, payback_years)`
- [ ] Fallback logic: error handling → retry → switch to Gemini
- [ ] Streaming implementation for chat UX (SSE)

**Сложность:** Senior+ (prompt engineering, tool calling, streaming)

**Пример промпта:**
```
You are a solar energy consultant for Tawan Power in Krabi, Thailand.
Your goal: guide user to a free consultation with a human engineer.

Residential users: focus on savings, payback, number of panels.
Commercial users: focus on ROI, OPEX reduction, feasibility.

Extract: bill_kwh (monthly electricity), roof_type, installation_preference.
If user provides bill amount, convert to kWh using Thai tariff (4.7 THB/kWh).

Never invent numbers. Always reveal assumptions.
End by offering: "Save this consultation in LINE?" or "Discuss with engineer?"
```

#### Этап: Growth
**Задачи:**
- [ ] RAG implementation: embed solar product catalog (panels, inverters)
- [ ] Vector search: "panels for humid climate", "inverter with 10-year warranty"
- [ ] Multilingual: Thai language support in prompts
- [ ] Personalization: previous consultations context

**Технологии:** Supabase Vector, OpenAI embeddings, Pinecone alternative

---

### 3. Product & UX Strategy

#### Этап: Development
**Задачи:**
- [ ] Define user personas: Residential Homeowner, Hotel Manager
- [ ] UX flows: first message → segment selection → chat → lead capture
- [ ] Wireframes: Sticky Consultation Bar, Full-screen Chat, Admin Dashboard
- [ ] Component specs: quick reply buttons, result cards, form inputs
- [ ] Mobile constraints: LINE Browser (visualViewport, 100dvh, safe-area)

**Сложность:** Senior PM/UX Designer (mobile-first, conversion optimization)

**Криrical decisions:**
- No pressure tone: "No aggressive CTAs"
- Progressive qualification: contact only after delivering value
- Seamless shell: landing page + chat in same page (no navigation)

#### Этап: Growth
**Задачи:**
- [ ] Funnel metrics: Drop-off points → UX fixes
- [ ] A/B tests: CTA text, button colors, timing of lead capture
- [ ] Session replay analysis: where users hesitate
- [ ] Accessibility audit: keyboard nav, screen readers, contrast ratios

---

### 4. Data & Analytics

#### Этап: Deployment
**Задачи:**
- [ ] Database schema: `leads`, `sessions`, `calculations`, `config` tables
- [ ] Row Level Security (RLS): ensure user isolation, admin override
- [ ] Realtime channels: `leads` → admin dashboard subscription
- [ ] Initial data: app_config (tariffs, solar hours, region params)

**Пример schema:**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  line_id TEXT,
  phone TEXT,
  segment TEXT CHECK (segment IN ('residential', 'commercial')),
  bill_kwh DECIMAL(10,2),
  system_size_kw DECIMAL(5,2),
  payback_years DECIMAL(4,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Этап: Operations
**Задачи:**
- [ ] Dashboard: leads by status, conversion rate, avg system size
- [ ] Alerts: new lead notification → LINE Notify or Slack
- [ ] Data quality: deduplication, validation, cleanup
- [ ] Reports: weekly delivery to sales team

#### Этап: Revenue
**Задачи:**
- [ ] Lead→Deal conversion tracking
- [ ] LTV/CAC analysis
- [ ] ROI dashboard per region (Krabi, Phuket, Samui)
- [ ] Customer segmentation for upsell

---

### 5. Business Dev & Partnerships

#### Этап: Deployment
**Задачи:**
- [ ] API keys: Groq, Gemini, Supabase — production rollout checklist
- [ ] LINE Flex Messaging: webhook verification, LIF app setup
- [ ] Vendor onboarding: contact suppliers for product catalog RAG
- [ ] Contracts: terms of service, privacy policy, data processing agreement

#### Этап: Growth
**Задачи:**
- [ ] CRM integration: Line Notify, Google Sheets, or external CRM
- [ ] Partnership agreements: solar panel suppliers (discount codes?)
- [ ] Localization: Thai-speaking support, LINE chat handoff
- [ ] Pricing strategy: consultation fees, commission structure

#### Этап: Revenue
**Задачи:**
- [ ] Monetization: commission per installation, subscription for premium features
- [ ] Expansion: new regions (Phuket, Samui, Chiang Mai)
- [ ] B2B offerings: white-label for other solar companies
- [ ] Investor deck: metrics, traction, unit economics

---

## Roadmap развития команд

### Phase 1 (Current): Solo Founder / Small Team
**Команда:** 1 Full-Stack (FS-TS + AI-ML) + 1 Product/UX  
**Аутсорс:** Data analytics, BizDev

**Необходимые навыки:**
- FS-TS: развертывание MVP, настройка инфраструктуры
- AI-ML: prompt engineering, fallback logic
- UX-PM: UX flows, conversion design
- DATA: baseline Supabase schema, простой admin dashboard
- BIZDEV: начальные LINE/поставщики интеграции

---

### Phase 2 (Scaling): 5-7 человек
**Команда:**
- 2 Full-Stack Devs (FS-TS)
- 1 AI Engineer (AI-ML)
- 1 UX/Product Designer (UX-PM)
- 1 Data Analyst (DATA)
- 1 BizDev Manager (BIZDEV)

**Развитие навыков:**
- FS-TS: модульная архитектура, feature flags, canary releases
- AI-ML: RAG, embeddings, multilingual support
- UX-PM: A/B testing, accessibility, performance optimization
- DATA: advanced analytics, ML lead scoring
- BIZDEV: CRM интеграция, партнерские программы, scaling partnerships

---

### Phase 3 (Enterprise): 10-15+ человек
**Команда:**
- 3-4 Full-Stack (FS-TS + specialization: frontend/backend)
- 2 AI Engineers (AI-ML)
- 1 Data Engineer + 1 Analyst (DATA)
- 2 Product/UX (UX-PM)
- 2 BizDev/Partnerships (BIZDEV)
- 1 DevSecOps

**Расширение навыков:**
- FS-TS: микроcервисы, multi-region Deployments, сложные миграции
- AI-ML: custom fine-tuning, cost optimization at scale, observability
- UX-PM: enterprise UX, admin tooling, training materials
- DATA: data warehouse (Snowflake/BigQuery), dashboards дляexecutives
- BIZDEV: multi-country expansion, B2B enterprise contracts, investor relations

---

## Критические точки (Where Skills Matter Most)

### 1. MVP Launch (Development → Deployment)
**Критические навыки:** FS-TS + AI-ML + UX-PM  
**Why:** Первая версия должна работать на 100%. Ошибки в калькуляторе или чате убивают доверие. UX должен быть безупречным для mobile-first.

**Checklist:**
- [ ] Calculator produces realistic numbers (test against known good values)
- [ ] Chat Responses: no hallucinations, correct tone, proper tool calls
- [ ] Lead capture: data lands in Supabase reliably
- [ ] Admin dashboard: realtime updates, correct data display
- [ ] LINE integration: webhook verified, LIF app working

---

### 2. First 100 Leads (Operations → Growth)
**Критические навыки:** DATA + BIZDEV + AI-ML  
**Why:** Первые 100 лидов — возможность выявить паттерны и улучшить.

**Checklist:**
- [ ] Conversion funnel: % of chats → leads → contacted → deal
- [ ] Quality of leads: accurate phone numbers, real intent
- [ ] Handoff process: инженер получает полный контекст
- [ ] AI accuracy: % of correct calculations, lead extraction errors
- [ ] User feedback: собрать отзывы, улучшить UX

---

### 3. Scaling to Multi-Region (Growth → Revenue)
**Критические навыки:** BIZDEV + FS-TS + DATA + AI-ML  
**Why:** Расширение географически требует инфраструктурных изменений и новых партнерств.

**Checklist:**
- [ ] Multi-region config: tariffs, solar hours, local numismatic
- [ ] Localized UX: Thai language, regional variations
- [ ] Performance: latency < 200ms TTFT for all regions
- [ ] Data isolation: per-region dashboards, compliance
- [ ] Partnerships: local suppliers, installation companies

---

### 4. RAG Knowledge Base Implementation (Growth Phase)
**Критические навыки:** AI-ML + DATA  
**Why:** Качество рекомендаций по оборудованию определяет ценность для коммерческих клиентов.

**Checklist:**
- [ ] Product catalog embedding: accurate specs, dimensions, warranties
- [ ] Query understanding: "панели для влажного климата", "инвертор с резервом"
- [ ] Relevance ranking: лучшие варианты наверху
- [ ] Freshness: обновление каталога при поступлении новой продукции
- [ ] Citations: ссылки на спецификации производителей

---

### 5. Monetization & Profitability (Revenue Phase)
**Критические навыки:** BIZDEV + DATA  
**Why:** Без revenue проект не sustainable. Нужно выстроить unit economics.

**Checklist:**
- [ ] Unit economics: LTV > 3× CAC
- [ ] Commission model: % от сделки, flat fee per lead?
- [ ] Retention: % repeat customers, referral rate
- [ ] Churn: reasons why deals fall through
- [ ] Expansion: upsell opportunities (batteries, monitoring)

---

## Сводная таблица приоритетов

| Навык | Dev | Ops | Growth | Revenue | Зрелость проекта |
|-------|-----|-----|--------|---------|------------------|
| FS-TS | High | High | Medium | Low | Senior+ (обязателен всегда) |
| AI-ML | High | High | High | Medium | Senior+ (ядро продукта) |
| UX-PM | High | High | High | Medium | Senior (conversions зависят от UX) |
| DATA | Medium | High | High | High | Mid-level (необходим для масштабирования) |
| BIZDEV | Low | Medium | High | High | Mid-level (запуск revenue требует экспертизы) |

---

## Рекомендации по найму/развитию

### Если вы solo founder:
1. **Приоритет 1:** Наймите Full-Stack TypeScript (контракт, 2-3 месяца) для стабильного MVP
2. **Приоритет 2:** DIY Product/UX (изучите STRATEGY_v2.md, ROADMAP.md)
3. **Приоритет 3:** Аутсорс Data analytics (Supabase Realtime dashboard готовится быстро)
4. **Приоритет 4:** AI/ML — используйте готовые промпты, итерируйте на фидбэке
5. **Приоритет 5:** BizDev — личные контакты,	local networking в Краби/Пхукете

### Если собираете команду:
1. **Lead Developer (FS-TS + AI-ML):** 60% времени на ядро, 40% на AI
2. **Product Designer (UX-PM):** 100% времени на пользовательские flows
3. **Data Specialist (DATA):** part-time (20h/week) на старте, full-time при Growth
4. **BizDev (BIZDEV):** part-time на старте, full-time при scaling

### Если масштабируете:
- **AI-ML** выделить в отдельную команду (RAG, embeddings, cost optimization)
- **DATA** создать data warehouse + BI-отдел
- **BIZDEV** расширить до партнерств и регионального расширения

---

## Заключение

Эта матрица компетенций отражает полный цикл проекта от кода до денег. Ключевой вывод:

**Full-Stack TypeScript + AI/ML Engineering** — это фундамент, без которого проект не существует.  
**Product/UX** — это конверсия, без которой нет монетизации.  
**Data/Analytics** — это growth, без которого нет масштабирования.  
**Business Dev** — это revenue, без которого проект не устойчив.

На ранней стадии можно совмещать роли (например, Full-Stack Engineer → learns AI prompting). На стадии scaling разделение специализации повышает качество и скорость.

---

## Приложения

### A. Глоссарий навыков

| Аббревиатура | Полное название | Основные технологии |
|--------------|-----------------|-------------------|
| FS-TS | Full-Stack TypeScript | Next.js, React, TypeScript, Supabase, Vercel |
| AI-ML | AI/ML Engineering | Groq, Anthropic, Google AI, LLM, RAG, embeddings |
| UX-PM | Product & UX Strategy | Mobile-first, conversion optimization, Figma, analytics |
| DATA | Data & Analytics | PostgreSQL, Realtime, BI tools, event tracking |
| BIZDEV | Business Development | CRM integration, partnerships, monetization, contracts |

### B. Рекомендуемые инструменты по навыкам

**FS-TS:**
- IDE: VS Code + TypeScript/React extensions
- Testing: Jest, Playwright
- Monitoring: Sentry, LogRocket
- CI/CD: GitHub Actions

**AI-ML:**
- LLM APIs: Groq (Llama 3), Anthropic (Claude), Google (Gemini)
- Embeddings: OpenAI text-embedding-ada-002, Supabase Vector
- Tools: LangChain/JS, Vercel AI SDK
- Observability: custom logging, token tracking

**UX-PM:**
- Design: Figma, Penpot
- Prototyping: Framer, Webflow (для быстрых UX-тестов)
- Analytics: PostHog, Plausible, Vercel Analytics
- Session replay: LogRocket, FullStory

**DATA:**
- Database: Supabase (Postgres), pgAdmin
- ETL: Supabase Edge Functions, Neon
- BI: Metabase (open-source), Superset, custom Next.js dashboard
- Tracking: custom events → Supabase table, PostHog

**BIZDEV:**
- CRM: simple → Google Sheets; advanced → Notion, Airtable, Salesforce
- Notifications: LINE Notify API, Slack webhooks
- Contracts: PandaDoc, HelloSign
- Payments: Sofin, Stripe (если нужны pre-payments)

### C. Чек-лист onboarding для новых членов команды

**День 1:**
- [ ] Прочитать PROJECT_SUMMARY.md, STRATEGY_v2.md, ROADMAP.md
- [ ] Понять архитектуру: App Router, Server Actions, API routes
- [ ] Запустить локально: `npm run dev`, проверить /chat и /admin
- [ ] Изучить Supabase schema через studio.supabase.com

**Неделя 1:**
- [ ] Разобраться с `solarCalculator.ts` — как считаются параметры
- [ ] Протестировать чат: разные сегменты (residential/commercial)
- [ ] Создать тестового лида через кнопку "Сохранить"
- [ ] Посмотреть admin dashboard

**Неделя 2:**
- [ ] Изменить промпт в `src/lib/ai.ts` (если есть) или соответствующем файле
- [ ] Добавить новое поле в `leads` таблицу, обновить UI
- [ ] Настроить отслеживание нового события (например, консультация)
- [ ] Поучаствовать в продажном звонке/чат-сессии

**Месяц 1:**
- [ ] Развернуть деплой на Vercel (собственные переменные окружения)
- [ ] Протестировать fallback: Groq API down → Gemini работает?
- [ ] Сделать code review для члена команды
- [ ] Предложить улучшение UX/performance/analytics

---

**Document Owner:** @dyaroshevich  
**Last Updated:** 2026-05-15  
**Next Review:** после Phase 2 завершения
