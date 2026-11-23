# README — как устроен пакет `report/`

Исследование рынка для **Tawan Power Krabi** (юг Таиланда, 8 языков).
Дата сбора данных: **20–23 октября 2026**. Валюта: **THB**.

---

## 1. Структура пакета

```
report/
├── REPORT.md              # сводный отчёт на русском, 9 разделов (основной документ)
├── parts_market.csv       # 64 SKU: цены, медианы, поставщики, приоритеты
├── system_expansion.csv   # 15 продуктовых возможностей (системы/категории)
├── lead_magnets.csv       # 22 лид-магнита, из них 4 платных трипваера
├── seo_pages.csv          # 33 страницы, 8 языков, 26 hreflang-групп
├── sources.csv            # 114 источников: URL + цитата + дата + надёжность
│
├── parts_data.py          # данные для parts_market.csv
├── build_parts.py         # генератор parts_market.csv
├── build_systems.py       # генератор system_expansion.csv
├── build_leads.py         # генератор lead_magnets.csv
├── build_seo.py           # генератор seo_pages.csv
├── sources_data.py        # реестр источников (append-only, 5 блоков)
└── build_sources.py       # генератор sources.csv
```

**Пересборка CSV** (данные → файл):

```bash
cd report
python3 build_sources.py    # → sources.csv        (пишет "sources: 114")
python3 build_parts.py      # → parts_market.csv
python3 build_systems.py    # → system_expansion.csv
python3 build_leads.py      # → lead_magnets.csv
python3 build_seo.py        # → seo_pages.csv
```

Все скрипты идемпотентны: данные лежат в `.py`-файлах, CSV генерируются заново. Ручных правок в CSV нет — при изменении цены правится `.py`.

---

## 2. Схемы CSV

### `parts_market.csv` — 25 колонок

| Колонка | Смысл |
|---|---|
| `part_id` | Уникальный ID (`PAN-LON-630`, `INV-HW-10M1`, …) |
| `category` | Панель / Инвертор / Батарея / BOS / Крепёж / Кабель / EV-зарядка / Пумпа |
| `brand`, `model`, `spec` | Бренд, точная модель, спецификация |
| `unit` | **Единица: панель, шт, пара, рулон 100 м, комплект.** Заполнена в каждой строке |
| `price_thb_min` / `median` / `max` | Только тайские цены, только внутри одного типа цены |
| `price_type` | retail / wholesale / project / installed turnkey / equipment only |
| `vat_included` | yes / no / not stated / mixed (+ пометка о нормализации) |
| `moq`, `warranty_months` | Минимальный заказ, гарантия в месяцах |
| `availability`, `supplier` | Наличие и перечень продавцов |
| `source_count` | Число независимых источников (основа `confidence`) |
| `source_urls`, `source_date` | URL через `;` и дата проверки |
| `demand_signal` | Текстовое обоснование спроса (без выдуманных объёмов) |
| `demand_score_1_5`, `competition_score_1_5`, `fit_score_1_5` | Оценки 1–5 |
| `priority` | `demand + fit + margin − competition` |
| `notes` | Управленческий вывод: что делать с позицией |
| `confidence` | high ≥5 источников, medium 2–4, low 1–2, none 0 |

### `system_expansion.csv` — 24 колонки

`opp_id`, `system_name`, `segment`, `size_kwp`, `storage_kwh`, `grid_type`, `bom_key_items`, `bom_cost_thb`, `market_price_min_thb`, `market_price_max_thb`, `price_per_kwp_thb`, `market_evidence`, `our_position`, `opportunity_type`, `barrier_to_entry`, `est_gross_margin_pct`, `score_demand`, `score_competition`, `score_fit`, `priority`, `effort_weeks`, `confidence`, `source_urls`, `notes`.

### `lead_magnets.csv` — 23 колонки

`magnet_id`, `title_th`, `title_en`, `magnet_type`, `funnel_stage`, `target_audience`, `trigger`, `format`, `pages`, `languages`, `production_hours`, `cost_thb`, `data_needed`, `cta`, `is_tripwire`, `tripwire_price_thb`, `credit_to_project`, `follow_up_channel`, `follow_up_days`, `priority`, `fit_score_1_5`, `cannibal_risk`, `notes`.

### `seo_pages.csv` — 25 колонок

`page_id`, `lang`, `hreflang_group`, `url_slug`, `page_type`, `primary_keyword`, `secondary_keywords`, `search_intent`, `funnel_stage`, `audience`, `title_seo`, `meta_description`, `h1`, `word_target`, `volume_th`, `volume_signal`, `volume_source`, `cta`, `internal_links`, `canonical_rule`, `cannibalization_risk`, `existing_url`, `competitor_coverage`, `priority`, `notes`.

### `sources.csv` — 13 колонок

`id`, `workstream`, `title`, `url`, `publisher`, `type`, `published`, `lang`, `quote`, `used_for`, `reliability`, `notes`.

---

## 3. Методика

### 3.1. Сбор

Только **публичные данные**: открытые прайс-листы, карточки интернет-магазинов, страницы дистрибьюторов, официальные документы PEA/MEA и королевские декреты. Без звонков поставщикам, без запросов КП, без обхода логинов.

Каждый источник фиксируется в `sources_data.py` с **дословной цитатой** — это позволяет перепроверить любую цифру, не доверяя пересказу.

### 3.2. Нормализация цен

| Правило | Реализация |
|---|---|
| Только THB | Цены EUR/USD/CNY в медиану **не входят** |
| НДС | Нет НДС → ×1,07 + пометка; НДС не указан → принимаем и помечаем |
| Тип цены | 5 взаимоисключающих категорий, в одну медиану не смешиваются |
| Возраст >12 мес. | `included_in_median=no`, только исторический ориентир |
| Единица | Обязательна в каждой строке |
| Модель | Проверка модели, а не мощности (54/72 vs 66/78-cell; ET = 3 фазы; P850 ≠ P950) |

### 3.3. Медиана

Считается по массиву тайских цен одного типа в скрипте `build_parts.py`:

```python
vals = sorted(vals)
n = len(vals)
med = vals[n // 2] if n % 2 else (vals[n // 2 - 1] + vals[n // 2]) / 2
```

Если n = 1, медиана = сама цена, но `confidence = low`. Если n = 0 — строка в файл не попадает.

### 3.4. Confidence

| Уровень | Источников | Что значит |
|---|---|---|
| high | ≥5 | рынок сформирован, можно ставить в КП |
| medium | 2–4 | ориентир, нужна проверка перед КП |
| low | 1–2 | единственная точка данных, использовать как справочную |
| none | 0 | данных нет — строки нет |

### 3.5. Объёмы поиска

**Не выдумываются.** Во всех 33 SEO-страницах `volume_th = n/a`. Вместо цифры — `volume_signal` (текстовый сигнал: реклама у конкурентов, страница у конкурента, число продавцов, автодополнение) и `volume_source` (описание метода оценки). Причина: Google Keyword Planner и Ahrefs недоступны без аккаунта.

---

## 4. Логика решений, зашитая в файлы

1. **Не смешивать страны.** В тайской медиане нет ни одной цены ЕС/США/Китая.
2. **Не смешивать типы цен.** Turnkey-пакет не сравнивается с ценой «голого» оборудования.
3. **Не смешивать классы батарей.** 48 В (5 900–7 800 THB/кВт·ч) и HV (10 900–16 700 THB/кВт·ч) — разные товары.
4. **Не использовать Zeta 14,9 THB/Вт как базу Huawei** — это SolarEdge 100 кВт.
5. **Sigenergy gateway считается включённым только если он в BOM.** В нашем BOM его не было → сравнение было занижено на 16 110–29 900 THB.
6. **Трипваер — платный, недорогой (990–2 500 THB), с 100% зачётом в проект.** Никаких приложений и интеграций.
7. **Одна страница = один первичный ключ.** Языковые версии разведены через `hreflang_group`, а не считаются дублями.
8. **`existing_url = n/a`** — сайт Tawan Power не найден, риск каннибализации с существующими страницами не проверен.

---

## 5. Проверка комплектности

```bash
cd report
python3 - <<'EOF'
import csv
for f, min_rows in [("parts_market.csv",30),("system_expansion.csv",10),
                    ("lead_magnets.csv",15),("seo_pages.csv",20)]:
    rows = list(csv.DictReader(open(f, encoding="utf-8-sig")))
    print(f, len(rows), "OK" if len(rows) >= min_rows else "FAIL", f"{len(rows[0])} cols")
EOF
```

Ожидаемый результат:

```
parts_market.csv 64 OK 25 cols
system_expansion.csv 15 OK 24 cols
lead_magnets.csv 22 OK 23 cols
seo_pages.csv 33 OK 25 cols
```

Все CSV — **UTF-8 с BOM** (`utf-8-sig`), с заголовками, все поля в кавычках (`QUOTE_ALL`). BOM добавлен, чтобы Excel в тайской локали корректно открывал тайские и русские символы.

---

## 6. Ограничения

- **Сайт Tawan Power не найден** → `existing_url`, риск каннибализации и текущая структура сайта не проверены.
- **Объёмы поиска отсутствуют** → приоритеты SEO построены на косвенных сигналах.
- **P850 SolarEdge** в Таиланде не публикуется (единственный незакрытый пробел).
- **Южное покрытие** ограничено: Краби, Пхукет, Хат-Яй, Сурат, Самуи. Нет: Транг, Сатун, Пханг Нга, Накхон-си-Тхаммарат.
- **Юридические документы** (พ.ร.ฎ. 805, субсидия 2569, PEA/MEA тарифы) требуют сверки с первоисточниками на дату публикации.
- **Инсоляция по районам** не подтверждена — есть только одна цифра (1 350 kWh/kWp/год для юга от 19Energy).
- **Гарантийные условия вендоров** взяты из карточек продавцов, а не из официальных warranty-документов.

Полный список непроверенного — в `REPORT.md`, раздел 9.
