# Tawan Power — API Integration Analysis

**Источник:** scraping-apis-for-devs (github.com/cporter202/scraping-apis-for-devs) — 2,622 API из 17 категорий

**Дата:** 4 June 2026

---

## Текущее состояние проекта

Tawan Power — **Solar Revenue Engine** для Краби, Таиланд:

- AI-чат (Groq + Gemini + RAG)
- Каталог солнечных продуктов (11 товаров)
- Система лидогенерации (LeadForm → Supabase)
- Админ-панель (CRUD лиды/товары)
- PWA + Web Push
- Интеграция LINE
- Генерация PDF предложений

---

## Приоритетные API по сферам бизнеса

### P0: Лидогенерация (Lead Generation)

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| Google Maps Email Extractor | Найти контакты отелей/вилл/бизнесов в Краби для B2B-продаж солнечных систем | Сбор контактов коммерческих объектов |
| Google Maps Scraper | Собрать все бизнесы в Краби по категориям (hotel, resort, villa, factory) | Таргетинг коммерческого сегмента |
| LinkedIn Companies & Profiles Scraper | B2B-аутрич к менеджерам отелей, директорам фабрик | Прямые продажи коммерческим объектам |
| Social Media Leads Analyzer | Сбор email/телефонов с 8 платформ — пополнение CRM | Enrichment лидов |
| Advanced Website Email Scraper | Сбор контактов с сайтов конкурентов/партнеров | Партнерская программа |
| All-in-One Social Media Email Scraper | Поиск лидов по ключевым словам (solar Krabi) через соцсети | Холодный аутрич |
| YouTuber Scraper - Emails & Socials | Поиск тайских инфлюенсеров для партнерства | Influencer marketing |

### P0: SEO & Органический трафик

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| Google Search Scraper | Мониторинг позиций по ключевикам (solar Krabi, พลังงานแสงอาทิตย์) | SEO-аналитика |
| Backlink Building Agent | Автоматизация аутрича для ссылок | SEO-продвижение |
| BuiltWith Domain Scraper | Анализ tech stack конкурентов | Конкурентная разведка |
| Broken Link Checker | Мониторинг битых ссылок на сайте | Техническое SEO |
| Website Content Crawler Pro | Сбор контента для RAG-базы знаний AI | Обогащение ответов AI |

### P0: Социальные сети (Thai Market)

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| TikTok Scraper (Location/Api) | Поиск контента по гео-меткам в Краби, мониторинг упоминаний solar | Маркетинг в TikTok |
| Instagram Location Scraper | Сбор постов по локациям в Краби — поиск B2B-лидов | Таргетированный поиск клиентов |
| Facebook Video Downloader | Сбор креативов для рекламы | Ad creative |
| TikTok Video Transcriber | Транскрибация видео для контент-плана | Контент-маркетинг |
| Instagram Comments Scraper | Анализ аудитории конкурентов | Исследование рынка |

### P1: E-commerce & Product Intelligence

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| Alibaba Scraper | Мониторинг цен на солнечные панели у поставщиков | Закупки |
| AliExpress Scraper | Сравнение цен на оборудование | Product research |
| Amazon Product Details Scraper | Исследование рынка solar products | Конкурентный анализ |

### P1: MCP Серверы (AI Enhancement)

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| Google Maps MCP | Встроить поиск ближайших инсталляций в AI-чат контекст | Умный AI-консультант |
| Website Content Crawler Pro | Питать RAG-базу знаний свежим контентом | AI knowledge base |
| Markdownify MCP Server | Конвертировать веб-страницы для AI consumption | RAG enrichment |
| RAG Browser | Веб-браузинг для AI при ответах на вопросы | AI с доступом в интернет |
| WordPress MCP Server | Управление блоговым контентом (если блог на WP) | Контент-маркетинг |

### P1: Мониторинг новостей & рынка

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| RSS News Scraper | Мониторинг новостей о солнечной энергетике в Таиланде | Content для блога |
| Google News Scraper | Отслеживание госпрограмм по солнечной энергии | Знание контекста |
| Advanced Finviz Scraper | Мониторинг котировок solar компаний | Финансовый контекст для AI |

### P2: Automation & Workflow

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| All-in-One Media Downloader | Скачивание контента для соцсетей | Маркетинговые материалы |
| All Social Media Posts Extractor | Сбор контента по хештегам (#solar #Krabi) | Исследование трендов |
| Google Maps Reviews Scraper | Сбор отзывов о конкурентах | Репутационный анализ |

### P3: Real Estate & Travel (Commercial Solar Leads)

| API | Зачем Tawan Power | Как использовать |
|-----|-------------------|-----------------|
| Airbnb Scraper / Email Scraper | Контакты владельцев вилл — prime target для солнечных систем | B2C-лиды |
| Airbnb Property Details | Параметры объектов (площадь, потребление) | Квалификация лидов |
| 99.co Property Listings Scraper | Поиск объектов недвижимости в Таиланде | Pre-qualification |
| Booking.com Review Scraper | Анализ отелей в Краби — потенциальных B2B-клиентов | B2B sales |

---

## Сводный план интеграции по приоритетам

```
P0 НЕДЕЛЯ 1-2 (Lead Gen Core):
  - Внедрить Google Maps Scraper → сбор бизнесов в Краби
  - Настроить Social Media Leads Analyzer → обогащение CRM
  - Интегрировать Google Maps MCP → контекст для AI-чата
  - Добавить Website Content Crawler → RAG-база знаний

P1 НЕДЕЛЯ 3-4 (SEO & Social):
  - Google Search Scraper → SEO-мониторинг
  - Backlink Building Agent → ссылочное продвижение
  - TikTok/Instagram Location Scraper → поиск B2C/B2B лидов
  - Markdownify MCP → RAG enrichment
  - RSS News Scraper → контент для блога

P2 МЕСЯЦ 2 (Growth):
  - Alibaba/AliExpress Scraper → мониторинг закупок
  - Airbnb Scraper → B2C-лиды (владельцы вилл)
  - Broken Link Checker → SEO health
  - RAG Browser → AI с веб-доступом
  - BuiltWith Scraper → конкурентная разведка

P3 МЕСЯЦ 3 (Scale):
  - All Social Media Posts Extractor → контент-стратегия
  - Booking.com Scraper → отельный B2B
  - Google Maps Reviews → мониторинг репутации
  - WordPress MCP → блог-менеджмент
```

---

## Быстрые победы (Fast Wins)

1. **Google Maps MCP + AI-чат** — подключить сейчас: AI сможет отвечать "где ближайший магазин/установка"
2. **Website Content Crawler Pro** — скормить 100 сайтов solar компаний в RAG для AI
3. **Google Maps Email Extractor** — за день собрать 500+ контактов отелей Краби
4. **TikTok/Instagram Location Scraper** — найти всех кто постит #солнечнаяэнергия в Краби

---

## Файл данных

`scraping_apis.json` — полная выгрузка всех 2,622 API из scraping-apis-for-devs (сгенерирован 4 June 2026)
