# -*- coding: utf-8 -*-
"""Собирает report/system_expansion.csv — продуктовые возможности (системы/категории)."""
import csv

COLS = [
    "opp_id", "system_name", "segment", "size_kwp", "storage_kwh", "grid_type",
    "bom_key_items", "bom_cost_thb", "market_price_min_thb", "market_price_max_thb",
    "price_per_kwp_thb", "price_unit", "market_evidence", "our_position", "opportunity_type",
    "barrier_to_entry", "est_gross_margin_pct", "score_demand", "score_competition",
    "score_fit", "priority", "effort_weeks", "confidence", "source_urls", "notes",
]

R = []


def add(**kw):
    R.append({c: kw.get(c, "THB/kWp" if c == "price_unit" else "") for c in COLS})


add(opp_id="SYS-01",
    system_name="Гибрид 5 кВт 1 фаза + 5.1 кВт·ч (бюджет-вилла/гестхаус)",
    segment="Residential / гестхаус 2–4 спальни", size_kwp="5", storage_kwh="5.12", grid_type="1 фаза",
    bom_key_items="Deye SUN-5K-SG04LP1 28,355 + LVTOPSUN 5.12 кВт·ч 31,500 + 12 панелей 630 Вт 30,300 + крепёж 8,000 + BOS 9,000 + кабель 4,500",
    bom_cost_thb="112000", market_price_min_thb="120000", market_price_max_thb="160000",
    price_per_kwp_thb="24000–32000",
    market_evidence="Saimai Solar: 5 кВт 1ф on-grid 130,000; South Energy Supply (Hat Yai) Solis 5 кВт пакет 149,000; ASP Solar (Surat) 150,000–200,000. Гибрид с батареей = +25–40 тыс. к рынку on-grid",
    our_position="нет: минимальный пакет с батареей — Sigenergy 375,000 (в 2.4× дороже рынка)",
    opportunity_type="новая категория / value-линия", barrier_to_entry="закупка 48 В-компонентов, обучение монтажников, сертификация батареи",
    est_gross_margin_pct="18–24", score_demand="5", score_competition="4", score_fit="3",
    priority="4", effort_weeks="4", confidence="high",
    source_urls="https://saimaisolar.com/; https://aspsolar.co.th/; uploads/quotes.csv",
    notes="Цель: закрыть средний сегмент и не терять клиента, который сравнивает нас с 19Energy. Ставит батарею в дом, где сеть падает 5–15 раз/мес (Ланта, Ао Нанг в сезон дождей).")

add(opp_id="SYS-02",
    system_name="Гибрид 12 кВт 3 фазы + 10 кВт·ч (вилла с бассейном)",
    segment="Residential premium / вилла", size_kwp="12", storage_kwh="10.24", grid_type="3 фазы",
    bom_key_items="Deye SUN-12K-SG04LP3 60,200 + 2× Dyness DL5.0C 67,410 + 19 панелей 630 Вт 47,975 + крепёж 12,000 + AC-DC combiner 3ф 12,250 + BOS 14,000",
    bom_cost_thb="214000", market_price_min_thb="270000", market_price_max_thb="340000",
    price_per_kwp_thb="22500–28300",
    market_evidence="ช่างโซล่าเซลล์: 10 кВт 3ф 300,000–310,000; Saimai 10 кВт 3ф 220,000; наш 10 кВт Sigenergy пакет 555,000 = +30.6% к рынку",
    our_position="есть только Sigenergy 10 кВт 555,000 → проигрыш по цене 1.6–2.5×",
    opportunity_type="новая категория (средний сегмент)", barrier_to_entry="нужны 3-фазные гибриды 48 В и LV-батареи с сертификацией",
    est_gross_margin_pct="20–26", score_demand="5", score_competition="4", score_fit="3",
    priority="5", effort_weeks="5", confidence="high",
    source_urls="https://www.deyeinverter.com/; https://www.thaisolarsystem.com/; uploads/quotes.csv",
    notes="Самый частый размер виллы в Ао Нанге/Кхлонг Мыанг. Бассейн + 3 кондиционера = 8–12 кВт пик. Sigenergy оставить как premium-ответ, Deye — как working answer.")

add(opp_id="SYS-03",
    system_name="Гибрид 16 кВт 1 фаза (большая вилла / гостхаус 8–12 номеров)",
    segment="Residential premium / small hospitality", size_kwp="16", storage_kwh="15.36", grid_type="1 фаза",
    bom_key_items="Deye SUN-16K-SG01LP1 77,600 + 3× Dyness DL5.0C 101,115 + 26 панелей 630 Вт 65,650 + крепёж 15,000 + BOS 16,000",
    bom_cost_thb="275000", market_price_min_thb="340000", market_price_max_thb="430000",
    price_per_kwp_thb="21250–26900",
    market_evidence="4 продавца Deye 16K 1ф (67,500–97,700); сегмент однофазных вилл 15–20 кВт ни у кого из южных EPC не закрыт пакетом",
    our_position="нет ни одного 1-фазного решения выше 10 кВт",
    opportunity_type="новая категория (закрытие дырки ассортимента)", barrier_to_entry="проверить PEA-лимит на 1-фазное подключение >15 кВт",
    est_gross_margin_pct="22–28", score_demand="4", score_competition="3", score_fit="4",
    priority="6", effort_weeks="4", confidence="high",
    source_urls="https://www.supersolarz.com/inverterdeye; https://www.thaisolarsystem.com/",
    notes="Уникальная ниша: у конкурентов 1-фазные пакеты заканчиваются на 10 кВт. Если клиент с 1-фазным вводом хочет 16 кВт — идти больше некуда. Проверить правила PEA по однофазному вводу (см. непроверенное).")

add(opp_id="SYS-04",
    system_name="C&I 20 кВт 3 фазы «one-box» на одном инверторе",
    segment="C&I / отель, ресторан, магазин", size_kwp="20", storage_kwh="0", grid_type="3 фазы",
    bom_key_items="Huawei SUN2000-20KTL-M5 65,500 + 32 панели 630 Вт 80,800 + крепёж 18,000 + AC-DC combiner 2str 12,500 + BOS/кабель 22,000 + СМР 45,000",
    bom_cost_thb="244000", market_price_min_thb="350000", market_price_max_thb="514000",
    price_per_kwp_thb="17500–25700", price_unit="THB/kWp (market total, VAT-normalized)",
    market_evidence="20 кВт turnkey (n=5, 0 южных): 350,000 FaiFaa; 353,500 Sunnergy (акция, обычная 392,800); 359,000 Khumwai/Deye; 390,000 Saimai; 514,000 Thai Watsadu (акция). Медиана 359,000 → 384,130 после нормализации к НДС 7%. Наш пакет 443,000 = +15.3% к медиане; НДС-статус нашей цены в каталоге не указан. При BOM 244,000 маржа 30–53% в этом диапазоне.",
    our_position="Пакет 443,000 — каталожная цена на 2×GoodWe 10 кВт (retail). При 1×Huawei 20KTL-M5 BOM 244,000; сравнение 443,000 с рынком — retail vs retail, а 244,000 — себестоимость.",
    opportunity_type="переупаковка существующего продукта", barrier_to_entry="нет (Huawei уже в портфеле)",
    est_gross_margin_pct="30–53", score_demand="5", score_competition="4", score_fit="5",
    priority="3", effort_weeks="2", confidence="low",
    source_urls="http://www.ideasolarshop.com/category/31/huawei-inverter-2; https://saimaisolar.com/; uploads/quotes.csv",
    notes="Быстрый фикс: 1×20 кВт вместо 2×10 кВт снижает BOM до 244,000. Важно: 443,000 − 244,000 = 199,000 — это retail минус BOM, а не чистая экономия; фактическую экономию считать по закупочному BOM. Делать первым.")

add(opp_id="SYS-05",
    system_name="Микроинверторный пакет 3–8 кВт (сложные/затенённые крыши)",
    segment="Residential / виллы с многоскатной крышей, отели с пальмами", size_kwp="3–8", storage_kwh="0 (опция 5.1)", grid_type="1 фаза",
    bom_key_items="Hoymiles HMS-2000-4T 10,000 × 2–4 + панели 630 Вт + крепёж + узел AC-сборки + кабель",
    bom_cost_thb="60000", market_price_min_thb="95000", market_price_max_thb="135000",
    price_per_kwp_thb="17000–25000",
    market_evidence="KG Solar (Phuket) продаёт отдельный Micro Package (Hoymiles) от 135,000; 5 продавцов HMS-2000; Samui Build — островной магазин",
    our_position="нет ни одной микроинверторной позиции",
    opportunity_type="новая категория (техническая ниша)", barrier_to_entry="нет (не нужен PEA-лист на микроинверторы до 2 кВт, но нужно уточнить)",
    est_gross_margin_pct="25–30", score_demand="4", score_competition="3", score_fit="4",
    priority="7", effort_weeks="3", confidence="high",
    source_urls="https://kgsolar.com/phuket-solar-cell/; https://www.thaisolarsystem.com/product/1240/microinverter-hoymiles-2kw-1phase",
    notes="Наш технический аргумент: тень от пальм и соседних зданий — главная причина недовыработки в Краби. Микроинвертор решает это без оптимизаторов и без SolarEdge-цены.")

add(opp_id="SYS-06",
    system_name="Premium micro-пакет Enphase 5–8 кВт",
    segment="Residential premium (виллы 8–15 млн THB)", size_kwp="5–8", storage_kwh="0", grid_type="1 фаза",
    bom_key_items="8–12× Enphase IQ8P 6,212 + панели AIKO 650 + IQ Gateway + крепёж",
    bom_cost_thb="125000", market_price_min_thb="189000", market_price_max_thb="265000",
    price_per_kwp_thb="33000–38000",
    market_evidence="Benergytech Enphase пакет 5.3 кВт 189,000; KG Solar Enphase package от 135,000 без батареи",
    our_position="нет",
    opportunity_type="новая категория (premium)", barrier_to_entry="нужен статус установщика Enphase + Gateway + обучение",
    est_gross_margin_pct="28–35", score_demand="3", score_competition="2", score_fit="2",
    priority="9", effort_weeks="6", confidence="medium",
    source_urls="https://r3solarcell.co.th/product/enphase-micro-inverter-iq8p/; https://kgsolar.com/phuket-solar-cell/",
    notes="Только для клиентов, которым важны 25 лет гарантии и «нет high-voltage DC на крыше». Не для массового 5 кВт.")

add(opp_id="SYS-07",
    system_name="Retrofit-батарея к существующей Huawei on-grid (6.9–13.8 кВт·ч)",
    segment="Установленная база Huawei в Краби/Пхукете", size_kwp="0 (retrofit)", storage_kwh="6.9–13.8", grid_type="1/3 фазы",
    bom_key_items="LUNA2000-10KW-C1 power module 31,860 + 1–2× LUNA2000-7-E1 75,840",
    bom_cost_thb="108000", market_price_min_thb="145000", market_price_max_thb="185000",
    price_per_kwp_thb="n/a (THB/кВт·ч 13,000–15,000)", price_unit="n/a (батарея: THB/kWh 13,000–15,000)",
    market_evidence="3 продавца LUNA2000-7-E1 (63,720–115,000); R3 и Selfconcept продают и модуль, и power module отдельно",
    our_position="нет",
    opportunity_type="новая услуга (retrofit к чужой базе)", barrier_to_entry="нужен доступ к Smart Dongle и паролю установщика клиента",
    est_gross_margin_pct="20–25", score_demand="4", score_competition="2", score_fit="5",
    priority="8", effort_weeks="3", confidence="medium",
    source_urls="https://r3solarcell.co.th/; https://shop.selfconcept-onlineshop.com/products/huawei-power-module-luna2000-10kw-c-1",
    notes="Самый дешёвый способ получить лид: люди, у которых уже стоит Huawei 5–10 кВт без батареи (за последние 4 года в Таиланде поставлено много). Продавать «добавим батарею к вашей системе», не «новую систему».")

add(opp_id="SYS-08",
    system_name="Солнечный насос для плантаций (пальма/каучук/дуриан)",
    segment="Agro / сад 1–5 рай", size_kwp="0.75–3", storage_kwh="0", grid_type="off-grid",
    bom_key_items="комплект насоса 750 Вт 23,750 + 2–3 панели + крепёж на грунт",
    bom_cost_thb="35000", market_price_min_thb="45000", market_price_max_thb="70000",
    price_per_kwp_thb="52000–60000",
    market_evidence="Thai-AgroTech и Sunnergy публикуют готовые комплекты 750 Вт (21,500–31,900); вокруг Ао Лык и Кхлонг Тхом — плантации",
    our_position="нет",
    opportunity_type="новая категория (agro)", barrier_to_entry="другой тип монтажа (грунт/скважина), нужен партнёр-бурильщик",
    est_gross_margin_pct="25–30", score_demand="3", score_competition="2", score_fit="2",
    priority="10", effort_weeks="3", confidence="medium",
    source_urls="https://www.thaiagrotech.com/; https://www.sunnergysolar.com/category/75/",
    notes="Не вписывается в бренд-портфель (SolarEdge/Sigenergy), поэтому только как отдельный лендинг /solar-pump и партнёрская схема, без каталога.")

add(opp_id="SYS-09",
    system_name="Солнечный карпорт / навес для парковки",
    segment="Residential / boutique-hotel / офис", size_kwp="1–12.5", storage_kwh="0 (опция)", grid_type="1/3 фазы",
    bom_key_items="металлокаркас + панели + инвертор + крепёж; 1 машина 1 кВт 49,000 → 4 машины 10 кВт 299,000",
    bom_cost_thb="180000", market_price_min_thb="240000", market_price_max_thb="300000",
    price_per_kwp_thb="26000–30000",
    market_evidence="Публичные карпорт-пакеты: 1 машина + 1 кВт 49,000; +1.5 кВт 59,000; +2 кВт 69,000; 2 машины + 5 кВт 179,000; 4 машины + 10 кВт 299,000; 4-местный 12.5 кВт 478,000–519,000",
    our_position="нет",
    opportunity_type="новая категория (строительная часть)", barrier_to_entry="нужен инженер-конструктор и расчёт ветровой/снеговой нагрузки (см. กฎกระทรวง 72: ≤20 кг/м²)",
    est_gross_margin_pct="22–28", score_demand="4", score_competition="2", score_fit="4",
    priority="8", effort_weeks="8", confidence="medium",
    source_urls="uploads/quotes.csv; https://www.thaisolarsystem.com/",
    notes="Для отелей это двойная продажа: тень для машины + кВт. Средний чек в 2–4× выше обычной крыши. Требует партнёра-металлоконструктора.")

add(opp_id="SYS-10",
    system_name="Плавающая СЭС (float / понтон)",
    segment="C&I / водоёмы отелей, фермерские пруды", size_kwp="10–100", storage_kwh="0", grid_type="3 фазы",
    bom_key_items="понтон 30 панелей 219,874 + панели + инвертор + якорная система",
    bom_cost_thb="n/a", market_price_min_thb="n/a", market_price_max_thb="n/a",
    price_per_kwp_thb="35000–45000", price_unit="THB/kWp (market total не указан)",
    market_evidence="Единственный тайский прайс на понтон: 219,874 за 30 панелей; общий диапазон float-СЭС 35,000–45,000 THB/кВт. Абсолютной цены пакета нет — минимум/максимум не применимы.",
    our_position="нет",
    opportunity_type="новая категория (нишевая)", barrier_to_entry="гидрология, разрешения на водоём, отсутствие опыта",
    est_gross_margin_pct="20–25", score_demand="2", score_competition="1", score_fit="1",
    priority="1", effort_weeks="12", confidence="low",
    source_urls="uploads/quotes.csv",
    notes="НЕ рекомендую в 2027: слишком мало данных (n=1), нет местной экспертизы, риск затопления/шторма. Держать в списке наблюдения.")

add(opp_id="SYS-11",
    system_name="Off-grid / backup для островов (Ланта, Пхи-Пхи, Липе)",
    segment="Resort / вилла на острове без стабильной сети", size_kwp="3–10", storage_kwh="10–20", grid_type="off-grid / гибрид",
    bom_key_items="Deye 5–16K гибрид + 2–4× LVT/Dyness 48 В + ATS 100A + панели",
    bom_cost_thb="160000", market_price_min_thb="200000", market_price_max_thb="290000",
    price_per_kwp_thb="28000–38000",
    market_evidence="Off-grid 3 кВт + 10 кВт·ч публично 120,000–160,000; hybrid 5 кВт + 10 кВт·ч 150,000–220,000; ATS 100A 910 THB",
    our_position="частично: Sigenergy умеет backup, но цена не для островного resort-а",
    opportunity_type="новая категория (сегмент)", barrier_to_entry="логистика на остров (паром), сервис, влажность/соль",
    est_gross_margin_pct="25–32", score_demand="4", score_competition="2", score_fit="4",
    priority="6", effort_weeks="5", confidence="medium",
    source_urls="uploads/quotes.csv; https://www.thaisolarsystem.com/product/1253/",
    notes="19Energy уже продаёт по районам Ао Нанг/Ланта/Ао Лык — они наши прямые конкуренты именно в этом сегменте. Высокая маржа из-за логистики, но и высокий риск сервиса.")

add(opp_id="SYS-12",
    system_name="EV-зарядка AC 7/22 кВт как отдельная линейка (отель/вилла)",
    segment="Hospitality / premium residential", size_kwp="0", storage_kwh="0", grid_type="1/3 фазы",
    bom_key_items="Huawei SCharger-7KS 19,900–27,675 / 22KT 29,900–36,831 + монтаж 13,000–21,000",
    bom_cost_thb="34000", market_price_min_thb="41000", market_price_max_thb="55000",
    price_per_kwp_thb="n/a", price_unit="n/a (цена за устройство 7/22 кВт)",
    market_evidence="4 продавца Huawei 7/22 кВт; с монтажом 41,000–55,000; ABB 22 кВт с монтажом 52,000; наш EV DC 25 кВт 129,000 = OVERPRICED +28.6%",
    our_position="есть только DC 12/25 кВт (129,000) — в 3–4× дороже массового спроса",
    opportunity_type="расширение линейки вниз", barrier_to_entry="нет (AC-зарядка не требует лицензии сверх электрика)",
    est_gross_margin_pct="25–35", score_demand="5", score_competition="3", score_fit="5",
    priority="4", effort_weeks="2", confidence="high",
    source_urls="https://www.evcharger.co.th/; https://khumwaisolar.com/product/abb-terra-ac-wallbox-22kw/",
    notes="Монтаж = 60% выручки услуги. Продавать «зарядка + монтаж + нагрузочный аудит» пакетом. AC-линейка закрывает отели, которые не готовы платить 129k за DC.")

add(opp_id="SYS-13",
    system_name="C&I 100–150 кВт с rapid shutdown и мониторингом",
    segment="C&I / завод, крупный отель, торговый центр", size_kwp="100–150", storage_kwh="0 (опция)", grid_type="3 фазы",
    bom_key_items="Huawei 100 кВт (2×50KTL-M3 186,102 или 150K 210,000) + логгер SmartLogger3000A 18,387 + оптимизаторы MERC-1300W-P + MDB 24,000–29,000",
    bom_cost_thb="n/a", market_price_min_thb="1841000", market_price_max_thb="2630000",
    price_per_kwp_thb="18400–26300", price_unit="THB/kWp (turnkey EPC; наш пакет — не BOM)",
    market_evidence="100 кВт turnkey (n=4, национальные): 1,841,000 SGE; 1,900,000 Saimai; 2,390,000 Syconnext; 2,630,000 Siam Innovation. Медиана 2,145,000 = 21,450 THB/кВт. Zeta 1,490,000 — promo-floor, вне медианы. Наш пакет 1,450,000 = 14,500 THB/кВт, но это цена каталога без логгера, оптимизаторов, MDB и СМР — с turnkey не сравнима. Rapid shutdown обязателен при ≥200 кВА (วสท. 022013-22).",
    our_position="Пакет 1,450,000 (14,500 THB/кВт) — цена каталога, не BOM: нет логгера, оптимизаторов RSD, MDB и СМР. Полный BOM не собран.",
    opportunity_type="исправление BOM + сертификация", barrier_to_entry="нужен инженер-проектировщик и допуск к PEA Grid Code",
    est_gross_margin_pct="n/a", score_demand="4", score_competition="3", score_fit="5",
    priority="5", effort_weeks="6", confidence="low",
    source_urls="https://shop.sirichaielectric.com/; https://www.energy-3e.com/; uploads/quotes.csv; uploads/REPORT.md §7",
    notes="Все C&I-КП должны содержать отдельные строки: инвертор, гарантия 5 vs 10 лет, логгер, оптимизаторы для RSD, MDB, СМР, PEA-сборы. Иначе цена несравнима с конкурентами.")

add(opp_id="SYS-14",
    system_name="PPA / аренда крыши (сервисная модель, не продажа)",
    segment="C&I / ритейл, склад, отель с крышей ≥1,000 м²", size_kwp="100–1000", storage_kwh="0", grid_type="3 фазы",
    bom_key_items="инвестиция в СЭС + договор 15–25 лет; ставка 2.50–3.20 THB/кВт·ч",
    bom_cost_thb="n/a", market_price_min_thb="n/a", market_price_max_thb="n/a",
    price_per_kwp_thb="n/a (тариф 2.50–3.20 THB/кВт·ч)", price_unit="THB/kWh tariff (market total не применим)",
    market_evidence="PPA-ставки 2.50–3.20 THB/кВт·ч, срок 15–25 лет, скидка 10–30% к сетевому тарифу 4.13; порог — счёт ≥100,000 THB/мес, крыша ≥1,000 м² (CapSolar, GreenYellow, TSE)",
    our_position="нет (мы продаём оборудование, не электричество)",
    opportunity_type="новая бизнес-модель (партнёрская)", barrier_to_entry="капитал, юрструктура, договор с PEA, 15-летний риск",
    est_gross_margin_pct="n/a", score_demand="3", score_competition="2", score_fit="2",
    priority="3", effort_weeks="20", confidence="medium",
    source_urls="uploads/REPORT.md §7; https://www.capsolar.co.th/",
    notes="Не для нас как для установщика, НО: партнёрство с PPA-фондом даёт нам поток монтажных подрядов без собственного капитала. Обсуждать как referal-модель, а не как новый продукт.")

add(opp_id="SYS-15",
    system_name="Пакет 30 кВт под PEA-субсидию и налоговый вычет",
    segment="SME / отель 20–40 номеров", size_kwp="30", storage_kwh="0", grid_type="3 фазы",
    bom_key_items="Huawei 30KTL-M3 76,950 + 48 панелей 630 Вт 121,200 + крепёж 25,000 + AC-DC 3str 12,250 + BOS/кабель 30,000 + СМР 60,000",
    bom_cost_thb="326000", market_price_min_thb="420000", market_price_max_thb="550000",
    price_per_kwp_thb="14000–18000",
    market_evidence="Saimai: 30 кВт PEA 550,000; налоговый вычет до 200,000 THB (พ.ร.ฎ. 805, 3 мар 2026 – 31 дек 2571, ≤10 кВт); субсидия 50,000 THB/дом для 5–10 кВт",
    our_position="нет пакета 30 кВт в каталоге",
    opportunity_type="новая упаковка (+ господдержка в КП)", barrier_to_entry="нет",
    est_gross_margin_pct="20–24", score_demand="4", score_competition="3", score_fit="5",
    priority="6", effort_weeks="3", confidence="medium",
    source_urls="https://saimaisolar.com/; uploads/REPORT.md §7",
    notes="Важно: вычет по พ.ร.ฎ. 805 ограничен 10 кВт и требует e-Tax Invoice + подключения к сети. Для 30 кВт пакета это НЕ применимо → не обещать вычет в КП на 30 кВт, это юридический риск.")

with open("system_expansion.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=COLS, quoting=csv.QUOTE_ALL)
    w.writeheader()
    w.writerows(R)

print("system_expansion.csv rows:", len(R))
