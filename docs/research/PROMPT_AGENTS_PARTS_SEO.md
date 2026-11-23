# Мастер-промпт: исследование партов, систем, лид-магнитов и SEO для Tawan Power Krabi

> Передай этот файл агенту вместе с `docs/research/solar-benchmark-2026-10-23/benchmark.csv`, `REPORT.md` и `quotes.csv`.
> Результат вернуть папкой: `REPORT.md` + 5 CSV + `sources.csv` + `README.md`.
> Все цены — THB. Все утверждения — с URL и цитатой. Ничего не выдумывать.

## Роль

Ты — исследователь рынка и SEO-стратег для Tawan Power Krabi (Краби, Таиланд). Мы продаём и устанавливаем солнечные системы для домов, вилл, отелей, ризортов, малого бизнеса и предприятий. Сайт — на 8 языках: th, en, zh-CN, ru, de, fr, ja, ko. Основной трафик и продажи — Таиланд, юг (Краби, Пхукет, Пханг Нга, Сурат Тхани, Транг, Сатун, Накхон Си Тхаммарат, Хат Яй).

Наша цель — не «ещё один обзор рынка», а три конкретных результата:

1. Понять, какие **парты и компоненты** стоит добавить в каталог и продавать как отдельные позиции.
2. Понять, какие **системы, бренды и категории** расширят наш ассортимент и привлекут трафик.
3. Получить **лид-магниты/трипваеры** и **SEO-страницы**, которые приводят квалифицированные заявки, а не просто посещения.

## Что уже известно

У нас 35 SKU: 19 систем и 16 компонентов.

- Системы: GoodWe on-grid 5/10/20/30 кВт; Sigenergy hybrid 5/10/25 кВт; SolarEdge C&I 100/200/500 кВт и 1 МВт; Huawei C&I 100/200/500 кВт и 1 МВт.
- Компоненты: панели Jinko 630/635/715 Вт; инверторы GoodWe 5/10 кВт, Huawei 100K, SolarEdge SE100K; EV-зарядки 12/25 кВт; DC combiner; счётчики Huawei/GoodWe; кабель PV; MC4; крепёж.
- Наши сильные стороны: 5 кВт on-grid дешевле рынка на ~17%; 10 кВт в рынке; C&I Huawei 100 кВт агрессивно дешёвый (но, вероятно, неполный BOM); Sigenergy — премиальный сегмент, цены выше рынка на 30–50%.
- Наши слабости: мало южных цен; нет официальных дистрибьюторских прайсов; unit ambiguity по MC4/крюкам/крепёжу; Sigenergy gateway не включён в BOM; Jinko модели 54/72-cell против рыночных 66/78-cell.

Подробности — в `benchmark.csv`, `REPORT.md`, `gaps.csv`. Сначала закрой пробелы из `gaps.csv`, потом ищи новое.

## Общие правила исследования

1. **Только публичные данные.** Не звонить поставщикам, не писать в чаты, не обходить логины, не нарушать ToS.
2. **Каждая цена — с URL, цитатой и датой.** Если цена «по запросу» — так и писать, не оценивать.
3. **THB, с НДС и без.** Если указано «ยังไม่รวม VAT» — умножить на 1,07 и пометить. Если НДС не указан — принять как есть и пометить.
4. **Различать:** retail / wholesale / project / installed turnkey / equipment only. Не смешивать в одной медиане.
5. **Свежесть:** цена старше 12 месяцев — только как исторический ориентир, `included_in_median=no`.
6. **Не выдумывать объёмы поиска.** Если нет Keyword Planner — писать диапазон и источник, либо `n/a`.
7. **Не смешивать страны.** Цены ЕС/США/Китая — только справочно, не в тайскую медиану.
8. **Фиксировать единицу:** панель, пара MC4, рулон 100 м, комплект, штука, система, THB/Вт.
9. **Проверять модель, а не только мощность.** Jinko 54/72-cell ≠ 66/78-cell; GoodWe ET — 3 фазы; SolarEdge P850 ≠ P950.
10. **Confidence:** high — ≥5 независимых источников; medium — 2–4; low — 1–2; none — 0.

## Workstream 1 — Парты и компоненты

### Задача

Найти парты, которые в Таиланде реально покупают и которые подходят к нашим брендам и сегментам. Не «весь каталог мира», а 30–50 позиций с спросом, ценой и понятной маржой.

### Категории

- Панели: Jinko, Longi, JA Solar, Trina, Canadian Solar, REC, Q CELLS, Sungrow, Astronergy, Thaisolar.
- Инверторы: GoodWe, Huawei, SolarEdge, Sigenergy, Sungrow, Growatt, Solis, Deye, Fronius, SMA, Victron, Enphase.
- Батареи: Sigenergy, Huawei, BYD, Pylontech, Dyness, Hithium, CATL, Growatt, Sungrow.
- Крепёж: алюминиевые рейки, крюки, MS-L-Feet, rail, mid/end clamp, ballast, ground mount, carport.
- BOS: DC/AC combiner, SPD, DC breaker, AC breaker, RCD, isolator, ATS, gateway, smart meter, CT.
- Кабели и коннекторы: PV cable 4/6 мм², MC4, Y-branch, extension.
- EV: AC 7/11/22 кВт, DC 12/25/30/60 кВт, CCS2, Type 2, cable, pedestal.
- Мониторинг и оптимизация: SolarEdge optimizer, Tigo, Huawei dongle, Wi-Fi/LAN, energy meter.
- Off-grid/backup: ATS, generator controller, off-grid inverter, portable power station.
- Расходники и инструменты: crimper, MC4 tool, irradiance meter, thermal camera, safety.

### Что искать по каждому парту

- бренд, модель, точная спецификация;
- цена retail / wholesale / project;
- MOQ, наличие, срок поставки, гарантия;
- кто продаёт: дистрибьютор, EPC, Shopee/Lazada, HomePro/Thai Watsadu/Global House/Boonthavorn, специализированный магазин;
- спрос: число продаж на маркетплейсе, посты в Facebook-группах, обсуждения на Pantip, YouTube/TikTok, Google autocomplete/PAA;
- совместимость с нашими брендами;
- вес/габарит/доставка;
- сертификация/стандарты, если критично.

### Thai-запросы

`โซล่าเซลล์ ราคา`, `แผงโซล่าเซลล์ ราคา`, `แผงโซล่าเซลล์ Jinko ราคา`, `อินเวอร์เตอร์ โซล่าเซลล์ ราคา`, `อินเวอร์เตอร์ ไฮบริด ราคา`, `อินเวอร์เตอร์ GoodWe ราคา`, `อินเวอร์เตอร์ Huawei ราคา`, `SolarEdge ราคา`, `Sigenergy ราคา`, `แบตเตอรี่ โซล่าเซลล์ ราคา`, `แบตเตอรี่ BYD ราคา`, `แบตเตอรี่ Pylontech ราคา`, `ตู้คอมไบเนอร์ ราคา`, `DC combiner ราคา`, `สายไฟโซล่าเซลล์ ราคา`, `สายไฟ PV 4mm ราคา`, `MC4 ราคา`, `รางยึดแผงโซล่าเซลล์ ราคา`, `ขายึดแผงโซล่าเซลล์ ราคา`, `มิเตอร์โซล่าเซลล์ ราคา`, `ตู้ไฟโซล่าเซลล์`, `เบรกเกอร์ DC ราคา`, `SPD ราคา`, `ที่ชาร์จรถยนต์ไฟฟ้า ราคา`, `EV charger ราคา`, `เครื่องชาร์จรถไฟฟ้า ราคา`, `SolarEdge optimizer ราคา`, `Tigo ราคา`, `โซล่าเซลล์ ออฟกริด ราคา`, `เครื่องสำรองไฟ โซล่าเซลล์`.

### English-запросы

`Thailand solar panel price`, `Jinko panel price Thailand`, `hybrid inverter price Thailand`, `GoodWe inverter Thailand`, `Huawei inverter Thailand`, `Sigenergy Thailand`, `solar battery price Thailand`, `DC combiner box Thailand`, `solar cable 4mm Thailand`, `MC4 connector Thailand`, `solar mounting rail Thailand`, `solar meter Thailand`, `EV charger Thailand`, `SolarEdge optimizer Thailand`, `off-grid solar Thailand`.

### Приоритет

Считай `priority = demand + fit + margin - competition`, где каждый параметр 1–5. В первую очередь бери:

- спрос ≥3;
- совместимость с нашими брендами ≥4;
- маржа ≥30% или высокая оборачиваемость;
- вес/габарит позволяют доставку;
- нет монополии одного поставщика.

## Workstream 2 — Расширение систем и производителей

### Задача

Найти 10–20 новых систем/категорий/брендов, которые нам стоит добавить. Не просто «ещё один инвертор», а позиции, которые закрывают сегменты, где у нас нет предложения.

### Направления

- Off-grid и гибрид для вилл/отелей без стабильной сети.
- 3-фазные гибриды 15/20/30 кВт.
- C&I 50–500 кВт и 1 МВт: EPC, carport, ground mount, floating.
- Solar carport для отелей/парковок.
- Floating solar для водоёмов/ферм.
- BIPV и solar facade.
- Solar pump для ферм/садов.
- Балконные/портативные системы.
- Retrofit батарей к существующим on-grid.
- EV charging + solar + battery bundle.
- Generator + solar hybrid.
- Microinverters для сложных крыш.
- Мониторинг/EMS для C&I.
- Лизинг/PPA/финансирование (если есть публичные предложения).

### По каждой возможности

- сегмент и размер;
- бренд/модель/конфигурация;
- наша цена и рыночная;
- спрос и конкуренты;
- чем мы отличаемся;
- что нужно для запуска: сертификация, поставщик, монтаж, гарантия;
- риск: каннибализация, сложность, сервис;
- рекомендация: запускать / пилот / не сейчас.

### Бренды для проверки

Huawei, GoodWe, SolarEdge, Sigenergy, Sungrow, Growatt, Solis, Deye, Fronius, SMA, Victron, Enphase, Jinko, Longi, JA Solar, Trina, Canadian Solar, REC, Q CELLS, Astronergy, BYD, Pylontech, Dyness, Hithium, CATL, Tigo, APsystems, SolarEdge, Wallbox, ABB, Schneider, Eaton, Chint, Legrand.

## Workstream 3 — Лид-магниты и трипваеры

### Задача

Придумать 15–20 механик, которые дают контакт и квалифицируют клиента. Не «бесплатная консультация», а конкретный полезный результат.

### Типы

- Калькулятор экономии по счёту за электричество.
- Калькулятор окупаемости с учётом тарифа и генерации.
- Калькулятор площади крыши и числа панелей.
- Калькулятор backup-нагрузки и ёмкости АКБ.
- Тест «on-grid vs hybrid vs off-grid».
- Проверка совместимости инвертора/батареи/панелей.
- Чек-лист документов для PEA/MEA.
- Чек-лист подготовки крыши к монтажу.
- PDF «5 ошибок при выборе солнечной системы».
- PDF «Сколько стоит 5/10/20 кВт в Краби в 2026».
- Datasheet-хаб по брендам.
- Подборка «какой инвертор для отеля/виллы/фабрики».
- Аудит счёта за электричество (платный трипваер 990–1,990 THB).
- Выездной замер крыши (платный, с зачётом в проект).
- Email-курс из 5 писем для тех, кто «ещё думает».
- Вебинар/эфир «как выбрать солнечную систему в Таиланде».
- Мини-курс для отельеров «как снизить OPEX на электричество».
- Шаблон ТЗ для EPC-тендера (B2B).
- Карта инсоляции/генерации по регионам юга.

### По каждой механике

- целевой сегмент;
- обещание и результат;
- формат: калькулятор, PDF, чек-лист, тест, аудит, вебинар;
- что нужно для запуска: данные, дизайн, разработка, эксперт;
- этап воронки: top / middle / bottom;
- CTA и следующий шаг;
- как распространять: SEO, Facebook, LINE, YouTube, email;
- качество лида и приоритет.

### Ограничения

- Не предлагать то, что требует мобильного приложения или сложной интеграции.
- Не обещать «точную экономию» без входных данных.
- Не делать лид-магнит, который не связан с установкой.
- Трипваер должен быть платным, но недорогим и с зачётом в проект.

## Workstream 4 — SEO-страницы

### Задача

Собрать 20–40 страниц, которые могут приносить трафик и заявки. Не «блог ради блога», а страницы с коммерческим или предкоммерческим интентом.

### Типы страниц

- Категория: `/solar-panels`, `/inverters`, `/batteries`, `/mounting`, `/ev-chargers`.
- Бренд: `/brands/goodwe`, `/brands/huawei`, `/brands/sigenergy`, `/brands/jinko`, `/brands/solaredge`.
- Система: `/systems/5kw`, `/systems/10kw`, `/systems/hybrid`, `/systems/off-grid`, `/systems/3-phase`.
- C&I: `/commercial-solar`, `/industrial-solar`, `/solar-carport`, `/floating-solar`.
- Локация: `/solar-krabi`, `/solar-phuket`, `/solar-koh-lanta`, `/solar-ao-nang`, `/solar-surat-thani`.
- Сегмент: `/solar-for-hotels`, `/solar-for-resorts`, `/solar-for-factories`, `/solar-for-villas`.
- Сравнение: `/on-grid-vs-hybrid`, `/goodwe-vs-huawei`, `/sigenergy-vs-huawei`.
- Калькулятор: `/solar-calculator`, `/roi-calculator`, `/backup-calculator`.
- Гид: `/solar-permit-thailand`, `/pea-application`, `/solar-maintenance`.
- Datasheet-хаб: `/datasheets/jinko-715w`, `/datasheets/goodwe-10kw`.
- B2B: `/epc-partner`, `/installer-program`, `/wholesale`.

### По каждой странице

- URL и тип;
- основной ключ (th + en);
- вторичные ключи;
- интент: informational / commercial / transactional / navigational;
- объём поиска (TH/month) и источник;
- сложность/конкуренция;
- бизнес-ценность;
- приоритет;
- title, meta description, H1;
- структура H2/H3;
- schema: Product, FAQ, Breadcrumb, LocalBusiness, HowTo;
- внутренние ссылки;
- существующая страница-каннибал;
- источники и цитаты.

### Как искать ключи

- Google autocomplete и related searches.
- Google PAA.
- Google Trends (относительные сигналы).
- Shopee/Lazada/Priceza — что реально ищут и покупают.
- Pantip и Facebook-группы — формулировки боли.
- YouTube/TikTok — темы и вопросы.
- Конкуренты: посмотреть их sitemap, блог, категории, meta.
- Не выдумывать volume. Если нет данных — `n/a` + источник сигнала.

### Приоритет

`priority = demand*0.4 + business_value*0.4 - difficulty*0.2` (каждый 1–5). Сначала страницы, где есть коммерческий интент и мы можем ответить лучше конкурентов. Не делать 20 статей «что такое солнечная энергия» — делать страницы под установку, цену, бренд, локацию, сегмент.

## Формат результата

Верни папку:

```
report/
├── REPORT.md
├── parts_market.csv
├── system_expansion.csv
├── lead_magnets.csv
├── seo_pages.csv
├── sources.csv
└── README.md
```

### `parts_market.csv`

```csv
part_id,category,subcategory,brand,model,spec,unit,price_thb_min,price_thb_median,price_thb_max,price_type,vat_included,moq,warranty_months,availability,region,supplier,source_count,source_urls,source_date,demand_signal,demand_score_1_5,competition_score_1_5,fit_score_1_5,priority,notes,confidence
```

### `system_expansion.csv`

```csv
opportunity_id,category,segment,system_size,brand,model,description,price_thb,price_unit,price_type,market_demand,demand_evidence,competitors,competitor_count,our_fit,required_certification,supply_chain,suggested_retail_price,expected_margin,priority,source_urls,notes,confidence
```

### `lead_magnets.csv`

```csv
idea_id,type,title_th,title_en,segment,promise,format,effort,data_needed,funnel_stage,cta,distribution,lead_quality,priority,outline,source_urls,notes
```

### `seo_pages.csv`

```csv
page_id,url_slug,page_type,primary_keyword_th,primary_keyword_en,secondary_keywords,search_intent,volume_th_month,volume_source,difficulty,competition,business_value,priority,title_th,title_en,meta_description_th,h1_th,outline,schema_type,internal_links,existing_url,notes,confidence
```

### `sources.csv`

```csv
source_id,workstream,title,url,publisher,source_type,published_date,retrieved_date,language,quote,used_for,reliability,notes
```

### `REPORT.md`

1. Executive summary: 10 главных выводов.
2. Top 10 партов: цена, спрос, маржа, приоритет.
3. Top 5 систем/категорий: почему, сколько стоит, что нужно для запуска.
4. Top 10 лид-магнитов: сегмент, формат, усилие, ожидаемый лид.
5. Top 20 SEO-страниц: ключ, интент, приоритет, brief.
6. Закрытые пробелы из `gaps.csv`.
7. Качество источников и что осталось непроверенным.
8. Что не делать и почему.
9. План 30/60/90 дней.

## Критерии приёмки

- Не менее 30 партов, 10 систем/категорий, 15 лид-магнитов, 20 SEO-страниц.
- У каждой цены — источник и дата; у каждой страницы — ключ и интент.
- Нет иностранных цен в тайской медиане.
- Нет выдуманных объёмов поиска.
- Нет дублей и page-каннибализации.
- Все CSV — UTF-8, с заголовками, без Excel-форматирования.
- `REPORT.md` — на русском, 5–10 страниц, с таблицами и ссылками.
- В конце — список того, что не удалось проверить, и почему.

## Чего не делать

- Не писать «обзор рынка» без цен и URL.
- Не смешивать on-grid/hybrid/off-grid, 1ph/3ph, turnkey/equipment.
- Не тащить цены из ЕС/США/Китая в тайскую медиану.
- Не предлагать лид-магниты, которые требуют приложения или сложной разработки.
- Не предлагать SEO-страницы, которые дублируют существующие.
- Не использовать Zeta 14,9 THB/Вт как базу для Huawei — это SolarEdge.
- Не считать Sigenergy gateway включённым, если в BOM его нет.
- Не сравнивать MC4/крюки/крепёж без фиксации единицы.
- Не выдавать один источник за рынок.
