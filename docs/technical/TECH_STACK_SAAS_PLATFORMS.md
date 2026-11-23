# Tawan Power — IT Infrastructure & SaaS Platforms

**Дата:** 18 May 2026  
**Цель:** Выбор готовых SaaS вместо самописных решений для масштабирования

---

## 🎯 Философия: Buy vs Build

### Принципы выбора:
- ✅ **Покупаем** если: это не core competency, есть reliable SaaS, стоимость < ฿5000/mo
- ✅ **Строим** если: это уникальное конкурентное преимущество, или SaaS слишком дорог
- ⚠️ **Гибрид** если: SaaS + кастомные интеграции

---

## 📦 Current Architecture (что уже есть)

| Layer | Current Stack | Cost | Notes |
|-------|---------------|------|-------|
| **Frontend** | Next.js (App Router) | Vercel Hobby ~$0/mo | |
| **Database** | Supabase (Postgres) | ~$25/mo (10k rows) | |
| **Auth** | Supabase Auth | Included | |
| **Realtime** | Supabase Realtime | Included | |
| **AI Chat** | GROQ + Gemini | ~$20-50/mo | |
| **Push Notifications** | Pure Web Push (VAPID) | Free | |
| **Hosting** | Vercel | ~$20/mo (Pro) | |
| **Storage** | Supabase Storage | ~$0.08/GB | |

**Итого текущий стек:** ~$70-100/month

---

## 🏢 SaaS Platforms to Consider

### 1. CRM (Customer Relationship Management)

**Проблема:** Сейчас лиды только в Supabase → нужно строить CRM функционал

#### Вариант A: Pipedrive (Рекомендуется для старта)
```
Плюсы:
- Готовые pipelines, stages, activities
- Email integration (Google/Microsoft)
- Mobile app
- API для интеграции
- Цена: ~$15-30/user/mo

Минусы:
- Не очень кастомизируемый
- Может быть overkill для 1-2 пользователей
```

**Интеграция:**
- Webhook из Supabase → Pipedrive deal creation
- Sync contacts, notes, files
- Использовать Make.com/Zapier если need simple

#### Вариант B: HubSpot (Free tier)
```
Плюсы:
- Free CRM до 1M contacts
- Marketing automation
- Live chat (заменяет наш чат?)

Минусы:
- Expensive when scale (>$1000/mo)
- Complex настройки
```

#### Вариант C: Build on Supabase (DIY)
```
Плюсы:
- Полный контроль
- Бесплатно пока scale
- Интегрировано с текущей БД

Минусы:
- Нужно строить UI (админка уже есть!)
- Нет advanced features (forecasting, email sequences)
- Support burden на нас
```

**Рекомендация:**  
Начните с **Supabase DIY** (уже почти есть в админке), потом мигрируйте в Pipedrive когда >1000 leads/month.

---

### 2. Email Marketing & Automation

**Текущее состояние:** Нет email-рассылок

#### Варианты:
- **Brevo (ex Sendinblue)** — ~$25/mo до 20k emails
  - Transactional + marketing
  - API easy integration
  - Templates для quotation follow-up

- **Mailchimp** — ~$30/mo до 500 contacts (дорого)
  - Better templates
  - More features (segmentation, A/B)

- **Resend** — ~$20/mo, developer-friendly
  - Simple API
  - Good for transactional emails

**Use cases:**
- Thank you email после lead submission
- Quote follow-up (день 1, день 3, день 7)
- Newsletter с solar tips
- Monthly newsletter "Solar News from Thailand"

---

### 3. Quotation & Proposal Software

**Проблема:** Нужно генерировать PDF quotes автоматически

#### Вариант A: PandaDoc
```
Цена: ~$25-50/mo
Плюсы:
- Professional PDF templates
- E-signature
- Tracking (когда открыли)
- Templates library

Интеграция: Supabase webhook → PandaDoc API → send to customer
```

#### Вариант B: Proposify
```
Цена: ~$50/mo
Плюсы:
- Beautiful templates
- Team collaboration
- Analytics

Минусы: дороже
```

#### Вариант C: Build ourselves (Supabase + PDF generator)
```
Стек: @react-pdf/renderer или Puppeteer
Плюсы:
- Полный контроль
- Интеграция с product catalog напрямую
- Бесплатно

Минусы:
- Нужно поддерживать
- Limited features
```

**Рекомендация:** Build ourselves на первых порах → потом мигрируем в PandaDoc если нужны e-sign + tracking.

---

### 4. Payment Processing

**Текущее состояние:** Только bank transfer (часы/ПриветПэй)

#### Needs:
- Online payment link (Stripe/Payment Links)
- Recurring payments (оплата по частям)
- Deposit collection

#### Варианты в Таиланде:
1. **2C2P** — популярен в SEA ~2.5-3.5% fee
2. **Stripe** — доступен? Проверить (Stripe Thailand)
3. **PromptPay QR** — через банк ( cheapest, ~0.5-1%)
4. **KBank Merchant** — если у вас счет в КБанке

**Recommendation:** Начните с PromptPay QR code в PDF quote → потом добавить Stripe для международных клиентов.

---

### 5. Accounting & Invoicing

| Tool | Price | Notes |
|------|-------|-------|
| **Xero** | ~฿300-500/mo | Popular in Thailand, GST ready |
| **QuickBooks** | ~$30/mo | International, Thai compliant? |
| **FreshBooks** | ~$20/mo | Simple, good for freelancers |
| **Supabase DIY** | Free | Build simple invoice generator |

**Интеграция:** Invoice creation → auto-debit from leads → payment reminder emails

---

### 6. Project Management & Installation Tracking

**Проблема:** Как отслеживать установки от lead до completion

#### Вариант A: Notion (free для маленькой команды)
```
Database: Projects (leads → projects)
Properties: status, installation_date, team, materials
Templates: Installation checklist
Shared с installation team
```

#### Вариант B: ClickUp (~$10-20/user/mo)
```
More structured
Tasks, dependencies, Gantt
Time tracking
Mobile app for installers
```

#### Вариант C: Custom in Supabase + Admin UI
```
Build project table linked to leads
Photos upload (before/after)
Team assignment
Status updates from field
```

**Рекомендация:** Notion для старта → ClickUp при >5 install/month.

---

### 7. Communication Platforms

| Need | Current | SaaS Alternative |
|------|---------|------------------|
| Internal chat | LINE (personal) | Slack (~$8/user/mo) or Telegram |
| Customer support | LINE Bot WhatsApp Business API | ~$0.005/message (Meta) |
| Video calls | — | Google Meet, Zoom |
| SMS notifications | LINE Push (300/mo limit) | SMS Provider (SMS Thailand, ~฿1-2/msg) |

---

### 8. Analytics & Business Intelligence

**Current:** Vercel Analytics + GA4 (basic)

#### Needs:
- Dashboard по leads, conversion, revenue
- Cohort analysis
- Forecasting

#### Tools:
- **Looker Studio** (free) + Supabase connector
- **Metabase** (open source, self-hosted)
- **ChartMogul** (if SaaS model)
- **Custom dashboard** в админке (Next.js + Supabase)

**Рекомендация:** Custom dashboard в админке на основе Metabase charts.

---

### 9. File Storage & Document Management

**Current:** Supabase Storage

#### Needs:
- Quote PDFs
- Contracts
- Installation photos
- Warranty docs

#### Options:
- **Cloudflare R2** — cheap ($0.015/GB), S3 compatible
- **Wasabi** — $6.99/TB/month, нет egress fees
- **Supabase Storage** — пока нормально, но дороже при scale

---

## 💰 SaaS Budget Plan (Monthly)

| Category | Tool | Cost (฿) | Phase |
|----------|------|----------|-------|
| CRM | Pipedrive (1 seat) | ~฿500 | Month 3+ |
| Email | Brevo | ~฿800 | Month 2+ |
| Quotations | Custom (free) | ~฿0 | — |
| Payments | Stripe/PromptPay | ~฿0 + fee | — |
| Accounting | Xero | ~฿500 | Month 4+ |
| Project Mgmt | Notion (team) | ~฿0 | — |
| Communication | Slack | ~฿200 | Month 2+ |
| Analytics | Looker Studio | Free | — |
| Storage | Cloudflare R2 | ~฿100 | Month 6+ |
| **Total** | | **~฿2100/mo** | ~$60/mo |

**Note:** Early stage можно всё DIY (~฿0) пока <100 leads/month.

---

## 🚀 Migration Strategy

### Phase 1 (Now): DIY на Supabase
- CRM: расширить админку
- Invoices: @react-pdf/renderer
- Analytics: custom dashboard
- Communications: LINE + Telegram

### Phase 2 (Month 2-3): Hybrid
- Добавить Brevo для email
- Добавить Xero для accounting
- Stripe для payments
- Notion для installation tracking

### Phase 3 (Month 6+): Full SaaS stack
- Pipedrive (полноценный CRM)
- ClickUp для проектов
- Cloudflare R2 для storage
- Slack для команды

---

## 🔄 Tech Stack Evolution Map

```
Now:
Supabase + Next.js + AI + Web Push
      ↓
Phase 2:
Supabase + Next.js + Brevo + Xero + Stripe + Notion
      ↓
Phase 3:
Pipedrive + ClickUp + Stack (fully integrated via APIs)
```

---

## ⚠️ SaaS Pitfalls to Avoid

1. **Overpaying early** — многие SaaS накручивают цены для малого бизнеса
2. **Vendor lock-in** — сложная миграция данных из SaaS (ex: Pipedrive → HubSpot)
3. **Integration complexity** — каждый SaaS нужен middleware (Zapier/Make.com ~$30/mo)
4. **Security** — каждый SaaS добавляет attack surface

**Rule:** Добавляйте новый SaaS только когда ROI > ฿2000/mo (экономит >10 часов времени).

---

## 📊 Decision Matrix

| Tool | Need Now? | Can DIY? | Cost | Lock-in | Score |
|------|-----------|----------|------|---------|-------|
| CRM | ✅ | Partially | $$$ | Medium | 7/10 |
| Email | ✅ | ✅ | $ | Low | 8/10 |
| Payments | ✅ | ❌ | $% | Medium | 9/10 |
| Accounting | Month 4 | ❌ | $$ | High | 6/10 |
| Quotes | ✅ | ✅ | $ | Low | 9/10 |

---

*Документ обновлён: 18 May 2026*
