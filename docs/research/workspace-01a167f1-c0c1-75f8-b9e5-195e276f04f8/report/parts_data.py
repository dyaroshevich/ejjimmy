# -*- coding: utf-8 -*-
"""parts_market.csv builder. Median computed from `vals` (all in THB, normalised to incl-VAT where stated)."""

P = []


def part(pid, cat, sub, brand, model, spec, unit, vals, price_type, vat, moq, warranty,
         avail, region, supplier, urls, sdate, demand, d, c, f, m, notes, conf):
    vals = sorted(vals)
    n = len(vals)
    med = vals[n // 2] if n % 2 else (vals[n // 2 - 1] + vals[n // 2]) / 2
    P.append(dict(
        part_id=pid, category=cat, subcategory=sub, brand=brand, model=model, spec=spec,
        unit=unit, price_thb_min=vals[0], price_thb_median=round(med, 2), price_thb_max=vals[-1],
        price_type=price_type, vat_included=vat, moq=moq, warranty_months=warranty,
        availability=avail, region=region, supplier=supplier, source_count=n,
        source_urls="; ".join(urls), source_date=sdate, demand_signal=demand,
        demand_score_1_5=d, competition_score_1_5=c, fit_score_1_5=f,
        priority=round(d + f + m - c, 1), notes=notes, confidence=conf
    ))


# ============================================================ ПАНЕЛИ
part("PAN-LON-630", "Панель", "N-type TOPCon 630 Вт", "LONGi", "LR5-78HGD-630M",
     "630 Вт, 78-cell, bifacial dual glass, N-type", "панель", [2394, 2587, 2590, 3600],
     "retail_equipment_only", "mixed (несколько продавцов incl/excl VAT)", "1 панель", 144,
     "in stock, 4 продавца", "national (Bangkok + online)",
     "Siwasolar; Thai Solar System; EnSolarth; Khumwai Solar",
     ["https://siwasolar.com/en/product-category/solar-panels/longi/",
      "https://www.thaisolarsystem.com/category/181/solar-cell-%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-longi",
      "https://www.ensolarth.com/category", "https://khumwaisolar.com/product-category/longi-solar-panel/"],
     "2026-10-23", "4 независимых продавца, 3.5–4.2 THB/Вт; LONGi — топ-3 бренд по узнаваемости в TH; используется 19Energy в южных проектах",
     5, 4, 4, 4,
     "70 Вт-класс: 3.4–4.1 THB/Вт против наших Jinko 6.5–6.9 THB/Вт. Маржа при перепродаже 15–25%, но категория — трафикообразующая (нужна для SEO /datasheets, /brands/longi). Наш Jinko дороже рынка на 28–47% → LONGi как «рыночный якорь» в каталоге.",
     "high")

part("PAN-LON-585", "Панель", "N-type TOPCon 585 Вт", "LONGi", "LR5-72HGD-585M",
     "585 Вт, 72-cell, bifacial dual glass", "панель", [2204, 2414, 3200],
     "retail_equipment_only", "mixed (несколько продавцов)", "1 панель", 144,
     "in stock, 3 продавца", "national", "Siwasolar; Thai Solar System; Khumwai Solar",
     ["https://siwasolar.com/en/product-category/solar-panels/longi/",
      "https://www.thaisolarsystem.com/category/181/solar-cell-%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-longi",
      "https://khumwaisolar.com/product-category/longi-solar-panel/"],
     "2026-10-23", "585 Вт — самый частый размер в стандартных пакетах 5–10 кВт у 19Energy/KG Solar; 3 продавца",
     4, 3, 5, 4,
     "4.13 THB/Вт медиана — дешевле 630–650 Вт в THB/Вт. Идеальная «рабочая лошадка» для пакетов 5–10 кВт и для замены нашего Jinko 630. Лёгкая (31.8 кг по карточке JA) → дешевле доставка на острова.",
     "medium")

part("PAN-JA-630", "Панель", "N-type TOPCon 630 Вт", "JA Solar", "JAM72D42-630/LB",
     "630 Вт, 72-cell, bifacial double glass", "панель", [2331, 2525, 2587, 3300],
     "retail_equipment_only", "mixed", "1 панель", 144,
     "in stock, 4 продавца", "national", "Siwasolar; Boonrawd/Bask; Thai Solar System; Khumwai Solar",
     ["https://siwasolar.com/en/product/ja-630w/", "https://boonrawd2020.com/index.php/product/ja-solar-630w/",
      "https://www.thaisolarsystem.com/category/282/solar-cell-%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-ja",
      "https://khumwaisolar.com/product-category/ja-solar-panel/"],
     "2026-10-23", "JA Solar — бренд №1 по упоминаниям у южных EPC (19Energy ставит JA первым в списке); 4 продавца",
     5, 4, 5, 4,
     "4.01 THB/Вт медиана — лучшая цена за THB/Вт среди tier-1 630 Вт. Прямая замена нашему Jinko 635 (6.61 THB/Вт). Совместима со всеми нашими инверторами (Voc 41.8 В).",
     "high")

part("PAN-AIKO-650", "Панель", "ABC N-type 650 Вт (премиум)", "AIKO", "G650-MCH72Mw (Comet 2U)",
     "650 Вт, N-type ABC, КПД 24.0%", "панель", [2342, 3299, 3799],
     "retail_equipment_only", "mixed", "1 панель", 180,
     "in stock, 3 продавца", "national", "R3 Solar Cell; QES Energy; Khumwai Solar",
     ["https://r3solarcell.co.th/product-category/solar-cell-%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C/aiko/",
      "https://www.qesenergy.co.th/articles/why-aiko-solar-panels.html",
      "https://khumwaisolar.com/product-category/aiko-solar-panel/"],
     "2026-10-23", "AIKO — панель №1 в премиум-пакетах (Sigenergy-сеты SKE, Enphase-пакет Benergytech); QES публикует цену per W",
     4, 3, 4, 3,
     "5.08 THB/Вт (QES, официальная таблица) — премия +25% к JA/LONGi за 24% КПД и 30 лет. Для вилл/отелей с ограниченной площадью крыши: больше кВт на тех же м². Разброс цен 2,342–3,799 → маржа нестабильна, брать у дистрибьютора с прайсом.",
     "medium")

part("PAN-AIKO-620", "Панель", "ABC N-type 620 Вт", "AIKO", "A620-MAH72Mw (Comet 2N)",
     "620 Вт, N-type ABC, КПД 23.5%", "панель", [2722, 3099], "retail_equipment_only",
     "mixed", "1 панель", 180, "in stock, 2 продавца", "national", "Khumwai Solar; QES Energy",
     ["https://khumwaisolar.com/product-category/aiko-solar-panel/",
      "https://www.qesenergy.co.th/articles/why-aiko-solar-panels.html"],
     "2026-10-23", "5.00 THB/Вт по официальной таблице QES; 620 Вт — стандарт для пакетов Sigenergy 1 фаза",
     3, 3, 4, 3, "Используется в готовых Sigenergy-пакетах конкурентов → нужна для сравнимых BOM. Цена ровно 5.00 THB/Вт — удобный «якорь» для калькулятора.",
     "low")

part("PAN-TRI-700", "Панель", "N-type 700 Вт (крупный формат)", "Trina Solar", "TSM-NEG21C.20",
     "700 Вт, Vertex N, i-TOPCon, bifacial dual glass", "панель", [2660, 2782],
     "retail_equipment_only", "not stated", "1 панель", 144,
     "in stock, 2 продавца", "national", "SunTech 1989; Thai Solar System",
     ["https://suntech1989.com/product/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-trina-700w-n-type/",
      "https://www.thaisolarsystem.com/category/183/solar-cell-%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-trinasolar"],
     "2026-10-23", "3.80–3.97 THB/Вт — самый низкий THB/Вт среди tier-1; 2 продавца",
     3, 2, 4, 4,
     "Лучший THB/Вт, но 700 Вт = 2.38×1.30 м: тяжелее (33–35 кг), сложнее на мансардных крышах и на отелях с узкими скатами; на 715 Вт-вариант цена доходит до 3,575 (SKE). Для поля/навеса — да; для виллы — нет. Осторожно с ветровой нагрузкой на юге.",
     "low")

part("PAN-BUD-585", "Панель", "585 Вт, бюджетный tier-2/3", "BQ Solar / Shinfa / SUNTECH",
     "BQ-144HBM; Shinfa 580; SUNTECH 585", "585 Вт, N-type TOPCon, 2 glass", "панель",
     [2050, 2100, 2500], "retail_equipment_only", "mixed", "1 панель", 60,
     "in stock, 3 продавца", "national", "Thai Solar System; Green Smart Tech",
     ["https://www.thaisolarsystem.com/product/941/%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-585w-mono-bq-solar-2glass%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2-30-%E0%B8%9B%E0%B8%B5",
      "https://www.greensmart-tech.com/product-category/solar-panel/"],
     "2026-10-23", "3.59 THB/Вт — дно рынка; используется в тендерных пакетах «лишь бы дешевле»",
     3, 1, 2, 4,
     "НЕ рекомендую как основной SKU: подрывает позиционирование (у нас SolarEdge/Sigenergy). Держать только как «tender floor» для ответа на конкурентные ТЗ по цене — с явным дисклеймером по гарантии и tier.",
     "low")

# ============================================================ ИНВЕРТОРЫ
part("INV-HW-5L1", "Инвертор", "On-grid 5 кВт, 1 фаза", "Huawei", "SUN2000-5KTL-L1",
     "5 кВт, 1 фаза, 2 MPPT, AFCI, IP65, в списке PEA/MEA", "шт", [25539, 25800, 25900, 31790],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 120,
     "in stock, 4 продавца", "national", "Solar Top; Sirichai; Thai Inverter; Willpower",
     ["https://www.solartop.net/category/huawei/19",
      "https://shop.sirichaielectric.com/product/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-INVERTER-1%E0%B9%80%E0%B8%9F%E0%B8%AA-5KW-SUN2000-5KTL-L1-HUAWEI-(%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-10%E0%B8%9B%E0%B8%B5)",
      "https://thaiinverter.com/product-category/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%A0%E0%B8%97%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/",
      "https://www.willpowerinter.com/productbrand/98/huawei"],
     "2026-10-23", "PEA/MEA-лист указан прямо в карточках; 4 продавца + Solaris (Krabi) 30,500",
     5, 4, 5, 4,
     "Прямой апгрейд нашего SKU: у нас в каталоге гибрид GW5000 (которого в 1 фазе не существует). Huawei 5KTL-L1 at 25,850 = идеальная замена для 5-кВт on-grid пакета. Маржа 12–18% wholesale→retail; главная ценность — трафик по ключу «Huawei 5kW ราคา».",
     "high")

part("INV-HW-10M1", "Инвертор", "On-grid 10 кВт, 3 фазы", "Huawei", "SUN2000-10KTL-M1",
     "10 кВт, 3 фазы, 2 MPPT, AFCI", "шт", [38900, 42872, 45100, 46290, 54900],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 120,
     "in stock, 5 продавцов", "national", "R3; ThaiPopula; Solar Energy Thailand; Willpower; Solaris (Krabi)",
     ["https://r3solarcell.co.th/product/huawei-10kw-3phase-sun2000-10ktl-m1-copy/",
      "https://thaipopula.com/index.php/huawei-inverter-sun2000-20ktl-m2-solar-cell.html",
      "https://solar-energythailand.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C/",
      "https://www.willpowerinter.com/productbrand/98/huawei",
      "https://solaris.co.th/inverter/huawei/huawei-sun2000-15ktl-m2/"],
     "2026-10-23", "5 продавцов + Krabi-дистрибьютор Solaris 54,900; базовый инвертор всех пакетов 10 кВт на юге",
     5, 4, 5, 5,
     "Ключевая позиция: наш пакет 10 кВт = 228,000 при рынке 264,825. Huawei 10K по 45,100 vs GoodWe SDT 34,000 — премия 11 тыс., но бренд сильнее и есть PEA-лист. Держать оба: GoodWe = цена, Huawei = бренд.",
     "high")

part("INV-HW-20M5", "Инвертор", "On-grid 20 кВт, 3 фазы", "Huawei", "SUN2000-20KTL-M5",
     "20 кВт, 3 фазы, 2 MPPT", "шт", [58000, 58330, 65500, 69015, 73000],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 120,
     "in stock, 5 продавцов", "national", "Green Smart Tech; Solar Energy Thailand; Solar Top; Idea Solar; Sunnergy",
     ["https://www.greensmarttech.com/product/inverter-huawei-sun2000-20ktl-m5/",
      "https://solar-energythailand.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C/",
      "https://www.solartop.net/product/390/huawei-inverter-20kw-3phase-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-sun2000-20ktl-m5-%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%A5%E0%B8%B4%E0%B8%AA%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%B2pea-%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-10-%E0%B8%9B%E0%B8%B5%E0%B8%A8%E0%B8%B9%E0%B8%99%E0%B8%A2%E0%B9%8C%E0%B9%84%E0%B8%97%E0%B8%A2",
      "http://www.ideasolarshop.com/product/443/huawei-inverter-20kw-3phase-sun2000-20ktl-m5",
      "https://www.sunnergytech.com/product/2189/huawei-sun2000-20ktl-m5-%E0%B8%81%E0%B8%A3%E0%B8%B4%E0%B8%94%E0%B9%84%E0%B8%97%E0%B8%94%E0%B9%8C%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-20kw-3-phase"],
     "2026-10-23", "5 продавцов; 20 кВт — самый частый размер C&I-пакета у 19Energy и Saimai",
     4, 4, 5, 4,
     "РЕШЕНИЕ проблемы 20 кВт из gaps.csv: наш BOM = 2× GoodWe 10 кВт (443,000). Один Huawei 20K (65,500) снимает ~30 тыс. из себестоимости и приводит пакет в MARKET. Это продуктовое, а не ценовое решение.",
     "high")

part("INV-HW-30M3", "Инвертор", "On-grid 30 кВт, 3 фазы", "Huawei", "SUN2000-30KTL-M3",
     "30 кВт, 3 фазы, 3 MPPT", "шт", [71860, 75017, 76950, 83500],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 60,
     "in stock, 4 продавца", "national", "Solar Energy Thailand (5Y); Sirichai; Idea Solar; Solar Energy Thailand (10Y)",
     ["https://solar-energythailand.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C/",
      "https://shop.sirichaielectric.com/product/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-INVERTER-3%E0%B9%80%E0%B8%9F%E0%B8%AA-30KW-SUN2000-30KTL-M3-HUAWEI-(%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-5%E0%B8%9B%E0%B8%B5)",
      "http://www.ideasolarshop.com/category/31/huawei-inverter-2"],
     "2026-10-23", "4 продавца; WARRANTY 5 vs 10 лет меняет цену на 16% (71,860 → 83,500) — критично для КП",
     3, 3, 4, 4,
     "Закрывает GAP BOM-goodwe-30kw-inverter: GW30K-MT в рознице TH не найден, а Huawei 30K — есть. Разница гарантии 5/10 лет = ~11,640 THB: всегда указывать срок в КП.",
     "medium")

part("INV-HW-50M3", "Инвертор", "On-grid 50 кВт, 3 фазы (C&I)", "Huawei", "SUN2000-50KTL-M3",
     "50 кВт, 3 фазы, 4 MPPT, AFCI, IP66", "шт", [86940, 90500, 95602, 111990],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 60,
     "in stock, 4 продавца", "national", "Idea Solar; Thai Inverter; Sirichai; Willpower (+82,590 aged)",
     ["http://www.ideasolarshop.com/category/31/huawei-inverter-2",
      "https://thaiinverter.com/product-category/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%A0%E0%B8%97%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/",
      "uploads/quotes.csv#BOM-huawei-50kw-inverter"],
     "2026-10-23", "Базовый блок нашего C&I BOM (150+50 схема); 4 продавца",
     4, 3, 5, 5,
     "КРИТИЧНО для C&I: позволяет собрать Huawei 100 кВт как 2×50K (или 150K+50K) и посчитать реальную себестоимость — сейчас наш 14.5 THB/Вт подозрительно низок (см. gaps: неполный BOM). 2×93,051 = 186 тыс. на 100 кВт = 1.86 THB/Вт только инвертор → 14.5 THB/Вт физически включает всё остальное, но без MDB/СМР.",
     "high")

part("INV-HW-150MG0", "Инвертор", "On-grid 150 кВт (C&I)", "Huawei", "SUN2000-150KTL-MG0",
     "150 кВт, 3 фазы, 9 MPPT", "шт", [207660, 210000, 228595, 272678, 275120],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 60,
     "in stock, 5 продавцов", "national", "Selfconcept; Super Solar Z; Sirichai; Energy-3E (10Y); Willpower (5Y)",
     ["https://shop.selfconcept-onlineshop.com/products/huawei-inverter-sun2000-150ktl-mg0",
      "https://www.supersolarz.com/category/4115/1225/",
      "uploads/quotes.csv#BOM-huawei-150kw-inverter"],
     "2026-10-23", "Единственный блок для 500 кВт и 1 МВт (×3, ×7); 5 продавцов",
     3, 3, 5, 5,
     "Гарантия 5 vs 10 лет = 210,000 → 272,678 (+30%). Для C&I всегда разделять в BOM: инвертор / гарантия / MDB / СМР. Без этого наша цена 20.5 THB/Вт на 500 кВт несравнима с EPC-ставками.",
     "high")

part("INV-GW-5ES", "Инвертор", "Гибрид 5 кВт, 1 фаза", "GoodWe", "GW5000-ES-20",
     "5 кВт, 1 фаза, гибрид LV, 2 MPPT, + GM1000 meter", "шт", [32000],
     "retail_equipment_only", "not stated", "1 шт", 60,
     "in stock, 2 продавца (Solar Touch, BigGo)", "national", "Solar Touch; BigGo marketplace",
     ["https://solartouch.co.th/product-category/all-products/inverter/",
      "https://biggo.co.th/s/Goodwe/"],
     "2026-10-23", "Единственный реальный 1-фазный гибрид GoodWe в рознице TH",
     3, 2, 5, 4,
     "Закрывает GAP goodwe-5kw-inverter: GW5000-ET в 1 фазе не существует. Переименовать наш SKU: GW5000-ES-20 (гибрид, 32,000) или GW5000-DNS-30 (on-grid, 15,900–18,000). Сейчас наши 18,000 = on-grid цена под гибридным названием.",
     "high")

part("INV-GW-10ET", "Инвертор", "Гибрид 10 кВт, 3 фазы", "GoodWe", "GW10K-ET-20",
     "10 кВт, 3 фазы, гибрид HV, 2 MPPT", "шт", [64000, 108000],
     "retail_equipment_only", "not stated", "1 шт", 60,
     "in stock, 2 продавца", "national", "Solar Touch; Technosolars",
     ["https://solartouch.co.th/product-category/all-products/inverter/",
      "http://www.technosolars.com/category/62/grid-tie-inverter/goodwe"],
     "2026-10-23", "Разброс 64,000–108,000 = 69% — рынок не сформировал цену; 2 продавца",
     3, 2, 5, 3,
     "Разброс такого размера означает: часть продавцов даёт старую серию/без гарантии. Наши 32,000 совпадают с on-grid SDT-30 (34,000), а НЕ с ET (64,000) → SKU в каталоге классифицирован неверно. Исправить модель и цену.",
     "medium")

part("INV-DEYE-5", "Инвертор", "Гибрид 5 кВт, 1 фаза (бюджет)", "Deye", "SUN-5K-SG04LP1-EU-SM2",
     "5 кВт, 1 фаза, гибрид LV 48 В, 2 MPPT, CT+wifi", "шт", [25800, 28355, 33000],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 3 продавца", "national", "Idea Solar; Thai Solar System; Super Solar Z",
     ["http://www.ideasolarshop.com/category/28/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-on-off-grid-hybrid",
      "https://www.thaisolarsystem.com/category/232/inverter/%E0%B9%84%E0%B8%AE%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%94-%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-hybrid-on-grid-solar-inverter/deye-hybrid-inverter",
      "https://www.supersolarz.com/inverterdeye"],
     "2026-10-23", "Deye — де-факто бренд №1 для бюджетных гибридов в TH; 3 продавца, явно MEA/PEA + 10 лет",
     4, 4, 2, 5,
     "28,355 за гибрид 5 кВт vs GoodWe ES 32,000 — Deye на 11% дешевле. Опасно для маржи премиум-брендов, но НЕОБХОДИМО, чтобы отвечать на бюджеты отелей/вилл 3–5 кВт. Держать как «good-better-best» нижнюю ступень, не как основной.",
     "high")

part("INV-DEYE-16", "Инвертор", "Гибрид 16 кВт, 1 фаза", "Deye", "SUN-16K-SG01LP1-EU",
     "16 кВт, 1 фаза, гибрид LV 48 В, 200A", "шт", [67500, 77600, 78645, 97700],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 4 продавца", "national", "Idea Solar; Super Solar Z; Thai Solar System; Double N",
     ["http://www.ideasolarshop.com/category/28/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-on-off-grid-hybrid",
      "https://www.supersolarz.com/inverterdeye",
      "https://www.thaisolarsystem.com/category/232/inverter/%E0%B9%84%E0%B8%AE%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%94-%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-hybrid-on-grid-solar-inverter/deye-hybrid-inverter"],
     "2026-10-23", "16 кВт 1-фазный — то, чего у нас НЕТ вообще; 4 продавца; сегмент вилл с 3-фазной сетью, но однофазной нагрузкой",
     4, 3, 3, 5,
     "Ключевая дырка в ассортименте: у нас 1 фаза максимум 10 кВт (Sigenergy). Виллы Таиланда часто 1-фазные с 15–20 кВт пиком (бассейн+кондиционеры). 78,123 против пакета Sigenergy 555,000 — разница в 7 раз.",
     "high")

part("INV-SOLIS-5", "Инвертор", "On-grid 5 кВт, 1 фаза (бюджет)", "Solis", "S6-GR1P5K",
     "5 кВт, 1 фаза, +CT, PEA/MEA, гарантия 5 лет", "шт", [15800, 16960],
     "retail_equipment_only", "not stated", "1 шт", 60,
     "in stock, 2 продавца", "national", "SPNM; R3 Solar Cell",
     ["https://www.spnm1.com/category/inverter/1",
      "https://www.r3solarcell.com/category/15/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/solis"],
     "2026-10-23", "15,800 — самая низкая цена on-grid 5 кВт в Таиланде; 2 продавца; массово используется в южных пакетах (South Energy Supply: Solis)",
     4, 4, 3, 5,
     "Это тот инвертор, которым нас «убивают» на 5 кВт: South Energy Supply (Hat Yai) ставит Solis в пакет 149,000. Себестоимость 16,380 даёт пакет 5 кВт с маржой ~45% при цене 120,000. Брать как «value»-линию в паре с Deye.",
     "medium")

part("INV-SUNG-10", "Инвертор", "On-grid 10 кВт, 3 фазы", "Sungrow", "SG10RT",
     "10 кВт, 3 фазы, +WiNet, гарантия 10 лет", "шт", [50400, 56925],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 2 продавца", "national", "Solaris Green Energy (Krabi); Super Solar Z",
     ["https://solaris.co.th/inverter/all-inverter/",
      "https://www.supersolarz.com/category/4115/1242/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-sungrow"],
     "2026-10-23", "Продаётся дистрибьютором в КРАБИ (Solaris) → доступен локально, склад на юге",
     3, 3, 4, 4,
     "Sungrow — единственный tier-1, у которого есть склад у нашего прямого конкурента в Краби (Solaris). Если не хотим терять 10-кВт сегмент — нужен либо Sungrow, либо агрессивная цена на Huawei. Solaris продаёт SG10RT-P2 по 50,400.",
     "medium")

part("INV-MICRO-HMS", "Инвертор", "Микроинвертор 2000 ВА, 4 входа", "Hoymiles", "HMS-2000-4T",
     "2000 ВА, 1 фаза, 4 MPPT, IP67, 12 лет", "шт", [9300, 10000, 10416, 12020, 12336],
     "retail_equipment_only", "not stated", "1 шт", 144,
     "in stock, 5 продавцов", "national", "SunTech; Thospaak; Thai Solar System; Samui Build; 3E",
     ["https://www.thaisolarsystem.com/product/1240/microinverter-hoymiles-2kw-1phase",
      "https://suntech1989.com/product/hoymile-microinverter-2/",
      "https://thospaak.com/product/hoymiles-hms-2000-4t/",
      "https://samuibuild.com/hoymiles-microinverter-hms-2000-%E0%B9%80%E0%B8%9E%E0%B8%A1%E0%B8%9E%E0%B8%A5%E0%B8%87%E0%B8%87%E0%B8%B2%E0%B8%99-2000w-%E0%B8%9B%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B8%A0%E0%B8%A2-%E0%B9%80%E0%B8%8A%E0%B8%AD%E0%B8%96%E0%B8%AD%E0%B9%84%E0%B8%94-%E0%B8%A3%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-12-%E0%B8%9B-939",
      "https://www.3e-thailand.com/products_detail/view/7693999"],
     "2026-10-23", "5 продавцов, включая магазин на Самуи (островной сегмент!)",
     4, 3, 3, 5,
     "Решение для сложных крыш отелей/вилл (многоскатные, тень от пальм). 10,416 за 2 кВт = 5.2 THB/Вт против 4.5 у стринга — премия ~15%, но KG Solar продаёт Enphase/Hoymiles как отдельные «Micro Package». Брать для 3–8 кВт объектов.",
     "high")

part("INV-ENPH", "Инвертор", "Микроинвертор 475 ВА", "Enphase", "IQ8P-72-2-INT",
     "475 ВА, 1 фаза, 25 лет, rapid shutdown", "шт", [5800, 6623],
     "retail_equipment_only", "not stated", "1 шт", 300,
     "in stock, 2 продавца", "national", "R3 Solar Cell; Thai Solar System",
     ["https://r3solarcell.co.th/product/enphase-micro-inverter-iq8p/",
      "https://www.thaisolarsystem.com/product/980/enphase-iq8p-microinverter-iq8p-72-2-int-0-475kw"],
     "2026-10-23", "Enphase — единственный 25-летний warranty на рынке; KG Solar (Phuket) продаёт как топ-пакет",
     3, 2, 2, 3,
     "6,212/шт × 8 = 49,700 только на инверторы для 5 кВт-системы → пакет 189,000–265,000 (Benergytech). Это премиум для вилл с тенью/сложной крышей, не для массового 5 кВт. Держать как «premium micro» альтернативу Hoymiles.",
     "medium")

part("INV-HW-20MB0", "Инвертор", "Гибрид 20 кВт, 3 фазы (ESS-slot)", "Huawei", "SUN2000-20K-MB0",
     "20 кВт, 3 фазы, готов к LUNA2000, 10 лет", "шт", [70700, 73776],
     "retail_equipment_only", "mixed (нормализовано к 7%)", "1 шт", 120,
     "in stock, 2 продавца", "national", "Idea Solar; Sirichai",
     ["http://www.ideasolarshop.com/category/31/huawei-inverter-2",
      "https://shop.sirichaielectric.com/product/%E0%B8%AD%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-INVERTER-3%E0%B9%80%E0%B8%9F%E0%B8%AA-20KW-SUN2000-20K-MB0-HUAWEI-(%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-10%E0%B8%9B%E0%B8%B5)"],
     "2026-10-23", "Единственный способ подключить LUNA2000 к 20 кВт у Huawei; 2 продавца",
     3, 2, 5, 4,
     "Связка для отелей: 20 кВт + LUNA2000 6.9 кВт·ч = 72,238 + 75,840 + 31,860 (power module) = 179,938 оборудование. У нас такого продукта нет вообще — а это ровно «отель без стабильной сети».",
     "medium")

# ============================================================ БАТАРЕИ
part("BAT-HW-7E1", "Батарея", "HV-модуль 6.9 кВт·ч", "Huawei", "LUNA2000-7-E1",
     "6.9 кВт·ч полезной, HV, 10 лет", "шт", [63720, 75840, 115000],
     "retail_equipment_only", "mixed", "1 шт", 120,
     "in stock, 3 продавца", "national", "R3 Solar Cell; Selfconcept; Priceza/BigGo marketplace",
     ["https://r3solarcell.co.th/product/%E0%B9%80%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%A5%E0%B8%B4%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-huawei-lun/",
      "https://shop.selfconcept-onlineshop.com/products/huawei-battery-module-luna2000-7-e1"],
     "2026-10-23", "Разброс 63,720–129,000 (marketplace-перепродавцы) — 2× по одной модели",
     3, 3, 5, 4,
     "Kлюч к отельной теме: retrofit-батарея к уже стоящим Huawei on-grid. 75,840–104,455 за 6.9 кВт·ч = 11,000–15,000 THB/кВт·ч — дорого; отсюда и появляется ниша дешёвых 48 В (см. LVT/Dyness 6,100–7,300 THB/кВт·ч). Не смешивать эти два класса в одной медиане!",
     "medium")

part("BAT-HW-10C1", "Батарея", "Power module к LUNA2000", "Huawei", "LUNA2000-10KW-C1",
     "контроллер/инвертор батареи, 10 кВт", "шт", [29090, 31860, 34500],
     "retail_equipment_only", "mixed", "1 шт", 120,
     "in stock, 3 продавца", "national", "R3; Selfconcept; ThaiPopula",
     ["https://r3solarcell.co.th/product/%E0%B9%80%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%A5%E0%B8%B4%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-huawei-lun/",
      "https://shop.selfconcept-onlineshop.com/products/huawei-power-module-luna2000-10kw-c-1"],
     "2026-10-23", "Обязателен к каждой LUNA-сборке; 3 продавца",
     3, 2, 5, 4,
     "Скрытая строка BOM: без неё LUNA2000 не работает. Наш аналог — Sigenergy gateway: в обоих случаях «забытый» блок 24–36 тыс. искажает сравнение пакетов на 6–10%. Всегда выносить в КП отдельной строкой.",
     "high")

part("BAT-BYD-LV5", "Батарея", "48 В LFP 5 кВт·ч", "BYD", "LV5.0 (100Ah 51.2V)",
     "5 кВт·ч, 51.2 В, 10 лет", "шт", [36500, 39055],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 1–2 продавца", "national", "Thai Solar System",
     ["https://www.thaisolarsystem.com/product/tag/%E0%B9%81%E0%B8%9A%E0%B8%95%E0%B8%A5%E0%B8%B4%E0%B9%80%E0%B8%98%E0%B8%B5%E0%B8%A2%E0%B8%A1"],
     "2026-10-23", "BYD — самый узнаваемый бренд батарей у клиентов; 1 продавец с 2 SKU-вариантами",
     4, 2, 3, 3,
     "7,300–7,800 THB/кВт·ч. Работает с Deye/Solis/LVTOPSUN-инверторами (48 В), НЕ с нашими Sigenergy/GoodWe HV. Позиция для value-линии, не для премиума.",
     "medium")

part("BAT-DYN-DL5", "Батарея", "48 В LFP 5.12 кВт·ч", "Dyness", "DL5.0C (100Ah 51.2V)",
     "5.12 кВт·ч, 51.2 В, 10 лет", "шт", [33705, 39500],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 2 продавца", "national", "Thai Solar System; SunTech 1989",
     ["https://www.thaisolarsystem.com/category/294/lithium/dyness",
      "https://suntech1989.com/product/dyness-dl5-0c-5-12kwh-1c-battery/"],
     "2026-10-23", "Dyness — «второй BYD» по узнаваемости, дешевле на ~7%; 2 продавца",
     4, 3, 3, 4,
     "6,583–7,715 THB/кВт·ч — самая низкая цена за кВт·ч среди tier-1 48 В. Идеально для retrofit к Deye-гибридам и для backup в отелях на Ланте (сезонные отключения).",
     "medium")

part("BAT-DYN-PB10", "Батарея", "48 В LFP 10 кВт·ч (IP65)", "Dyness", "Powerbox Pro 10kWh",
     "10 кВт·ч, IP65, 10 лет", "шт", [59000], "retail_equipment_only", "not stated", "1 шт", 120,
     "promo (из 69,999)", "national", "SKE Solar",
     ["https://www.supsaringkan.co.th/category/1651/solar-cell-battery"],
     "2026-04-11", "Единственная публичная цена 10 кВт·ч 48 В; акция 59,000",
     3, 1, 3, 5,
     "5,900 THB/кВт·ч — лучшая цена за кВт·ч из всех найденных (в 2.5 раза дешевле Huawei LUNA). Для backup-вилл и отелей это главный ценовой аргумент. Риск: 1 источник, акция может закончиться.",
     "low")

part("BAT-LVT-100", "Батарея", "48 В LFP 5.12 кВт·ч", "LVTOPSUN", "LVTS-512100-G3",
     "5.12 кВт·ч, 51.2 В, 10 лет", "шт", [31100, 31500, 33500],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 3 продавца", "national", "Sunnergy Tech; Thai Solar System",
     ["https://www.sunnergytech.com/product/2066/lvtopusn-lvts-512100-g3-lifepo4-battery-100ah-51-2v",
      "https://www.thaisolarsystem.com/product/tag/%E0%B9%81%E0%B8%9A%E0%B8%95%E0%B8%A5%E0%B8%B4%E0%B9%80%E0%B8%98%E0%B8%B5%E0%B8%A2%E0%B8%A1"],
     "2026-10-23", "LVTOPSUN — бренд, который южные EPC (19Energy) прямо ставят в пакеты; 3 продавца",
     4, 3, 3, 5,
     "6,152 THB/кВт·ч — дешевле Dyness/BYD. 19Energy указывает LVTopsun как штатную батарею → если мы не имеем её в каталоге, мы проигрываем сравнение по цене backup-пакета.",
     "high")

part("BAT-SIG-10", "Батарея", "HV-модуль 9.04 кВт·ч", "Sigenergy", "SigenStor BAT 10.0",
     "9.04 кВт·ч полезной, HV, 10 лет", "шт", [98910, 110000],
     "retail_equipment_only", "yes (продавцы указывают «รวม Vat 7%»)", "1 шт", 120,
     "in stock, 2 продавца", "national", "SGE Energy; Solar Tech Center",
     ["https://sgeenergy.co.th/product/sigenstor-battery-10kwh/",
      "https://www.solartech-center.co.th/sigenergy"],
     "2026-10-23", "2 продавца; входит во все Sigenergy-пакеты конкурентов",
     3, 2, 5, 3,
     "10,940–12,168 THB/кВт·ч — в 1.7–2× дороже 48 В-аналогов. Вот почему наши Sigenergy-пакеты выглядят +30…+51% к рынку: сам модуль дорогой. Решение — пересобрать пакет (меньше панелей/другой gateway) или уйти в NEO-линейку.",
     "medium")

part("BAT-SIG-GW1", "BOS", "Sigen Gateway 1 фаза 12 кВт (63A)", "Sigenergy", "Sigen Gateway Home SP 12K",
     "12 кВт, 1 фаза, 63A, backup/ATS-функция", "шт", [16110, 24000, 29900],
     "retail_equipment_only", "yes (продавцы указывают «รวม Vat 7%»)", "1 шт", 60,
     "in stock, 3 продавца", "national", "SGE Energy; Solar Tech Center; Insider System",
     ["https://sgeenergy.co.th/product/sigenstor-gateway-homepro-sp-f-100a/",
      "https://www.solartech-center.co.th/sigenergy",
      "https://insidersystem.co.th/sigenergy-price-solar-battery-promotion-june-2026/"],
     "2026-10-23", "3 независимых продавца публикуют цену → рынок сформирован",
     3, 2, 5, 5,
     "ЗАКРЫВАЕТ GAP BOM-sigen-gateway: 16,110–29,900 за 1-фазный gateway. Наш BOM без gateway занижает сравнение с конкурентами на 16–30 тыс. Теперь можно честно посчитать: наш пакет 5 кВт+6 кВт·ч = 375,000 → с gateway должен быть ~400,000, то есть +61% к рынку.",
     "high")

part("BAT-SIG-GW3", "BOS", "Sigen Gateway 3 фазы 30 кВт (63A)", "Sigenergy", "Sigen Gateway Home TP 30K",
     "30 кВт, 3 фазы, backup/ATS", "шт", [22900, 32000, 47000],
     "retail_equipment_only", "yes", "1 шт", 60,
     "in stock, 3 продавца", "national", "Solar Tech Center; Insider System; 3-phase list",
     ["https://www.solartech-center.co.th/sigenergy",
      "https://insidersystem.co.th/sigenergy-price-solar-battery-promotion-june-2026/"],
     "2026-10-23", "3 фазы: 22,900–47,900 по данным дистрибьютора; 2 продавца с точной моделью",
     3, 2, 5, 5,
     "Для трёхфазных объектов (отель, вилла) gateway дороже 1-фазного на 8–17 тыс. Наш пакет 10 кВт 3ф + 10 кВт·ч (555,000) должен включать +32,000 → 587,000 = +38% к рынку вместо заявленных +30.6%.",
     "high")

part("BAT-LVT-HV15", "Батарея", "HV 15.66 кВт·ч", "LVTOPSUN", "LVTS-5220-HV3",
     "15.66 кВт·ч, high voltage, 3 модуля", "шт", [153010, 157290],
     "retail_equipment_only", "not stated", "1 шт", 120,
     "in stock, 2 продавца", "national", "Thai Solar System; Sunnergy",
     ["https://www.thaisolarsystem.com/product/1045/battery-15-66kwh-high-voltage-lvtopsun",
      "https://www.thaisolarsystem.com/category/265/battery-lithium-high-volt/lvtopsun"],
     "2026-10-23", "HV 15.66 кВт·ч за 153–157 тыс. — альтернатива Sigenergy для 3-фазных гибридов; 2 SKU у 1 продавца",
     2, 1, 3, 3,
     "9,770–10,043 THB/кВт·ч — на 20% дешевле Sigenergy BAT. Для отелей, где важна цена кВт·ч, а не бренд: LVTOPSUN HV + Deye/Solis 3ф гибрид = пакет на 35–40% дешевле Sigenergy.",
     "low")

# ============================================================ КРЕПЁЖ
part("MNT-RAIL-48", "Крепёж", "Алюминиевая рейка 4.8 м", "SE47 / прочие", "Rail L4800 AL6005-T5",
     "4.8 м, AL6005-T5, анодированная", "шт", [420, 490, 800], "retail_equipment_only",
     "not stated", "1 шт", 0, "in stock, 3 продавца", "national", "Double N Solar; Sunnergy; Solar-Thailand",
     ["https://doublen-solar.com/product/%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-4-8%E0%B8%A1-se47-raill480/",
      "https://doublen-solar.com/product/hanger-bolt-and-stud-l-feet/"],
     "2026-10-23", "3 продавца; 420–490 за 4.8 м = 87–102 THB/м; входит в каждый пакет",
     5, 3, 4, 4,
     "Единица зафиксирована: THB/шт (4.8 м). 490/шт = 102 THB/м. На 5 кВт-систему уходит ~8–10 реек (4 ряда × 2) → 4–5 тыс. THB. Наш SKU «крепёж» без единицы — переделать в 3 позиции: рейка, L-Feet, крюк.",
     "high")

part("MNT-LFEET", "Крепёж", "L-Feet для металлочерепицы", "Antai / EEG / Lumira", "L-Feet Kit 80mm",
     "L-Feet AL6005-T5 + EPDM, 80–120 мм", "шт", [30, 35, 36, 38, 48, 50],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 6 продавцов", "national",
     "SunTech; Double N; Antai/QS; Lumira/PB; Dohome; Energy-3E",
     ["https://doublen-solar.com/product/%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%A2%E0%B8%B6%E0%B8%94-l-feet-kit-for-metal-sheet/",
      "https://www.qesenergy.co.th/category/%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C",
      "https://www.dohome.co.th/th/roof-bracket-for-metal-sheet-10327527.html"],
     "2026-10-23", "6 продавцов включая Dohome (national retail) → товар-коммодити; 30–50 THB/шт",
     5, 4, 5, 3,
     "ЗАКРЫВАЕТ GAP UNIT_AMBIGUOUS: единица = 1 шт L-Feet (не «комплект»). Наш SKU MS-L-Feet 1,500 THB — это, судя по рынку, упаковка на крышу (≈40 шт × 37). Фиксировать как «комплект на 1 кВт» и указывать число штук. Иначе сравнивать нельзя.",
     "high")

part("MNT-HB", "Крепёж", "Hanger Bolt + L-Feet (черепица лонг-кау)", "Antai / EEG / Double N", "M10×200 + L-Feet",
     "M10×200 SUS304 + L bracket + EPDM", "шт", [60, 75, 90, 106, 145],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 5 продавцов", "national",
     "EEG/PB Store; Double N; QES/Antai; Energy-3E; Solar Top",
     ["https://www.pbasupply.net/home/product2/?id=2944",
      "https://doublen-solar.com/product/hanger-bolt-and-stud-l-feet/",
      "https://www.energy-3e.com/products_detail/view/7772739",
      "https://www.solartop.net/product/hanger-bolt-%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2-%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A5%E0%B8%AD%E0%B8%99%E0%B8%84%E0%B8%B9%E0%B9%88/11000913317000308"],
     "2026-10-23", "5 продавцов; обязателен для черепичных крыш (большинство вилл Краби) ",
     5, 3, 5, 4,
     "Отдельный SKU от L-Feet: другой тип крыши (лонг-кау/черепица). В Краби черепица — доминирующий тип кровли у вилл и гестхаусов. 60–145 THB/шт, медиана 90.",
     "high")

part("MNT-CPAC", "Крепёж", "Крюк под черепицу CPAC", "Double N / CPAC-совместимые", "TILE HOOK for CPAC",
     "крюк под цементно-песчаную черепицу CPAC", "шт", [87, 110, 120],
     "retail_equipment_only", "not stated", "1 шт", 120, "in stock, 3 продавца", "national",
     "Energy-3E; Double N; Solar Product",
     ["http://energy-3e.tarad.com/products_detail/view/7773040",
      "https://doublen-solar.com/product/hanger-bolt-and-stud-l-feet/",
      "https://www.solarproduct.solar/16919690/ตัวยึดหลังคา-cpac"],
     "2026-10-23", "3 продавца × 87–120 THB/шт; CPAC — самый распространённый тип черепицы в Таиланде",
     4, 2, 5, 3,
     "ЗАКРЫВАЕТ GAP: наш CPAC-крюк 1,800 THB при рынке 87–120 = 15–20×. Это упаковка (обычно 10–20 шт) либо ошибка. Единица = 1 шт. Пересчитать SKU: 1,800 / 110 ≈ 16 шт в упаковке — похоже на правду, но это надо доказать, а не предполагать.",
     "high")

part("MNT-MID", "Крепёж", "Mid clamp 30–35 мм", "Antai / MEGA / Keenoc", "Mid Clamp 30/35",
     "межпанельный зажим AL6005-T5", "шт", [13.2, 16.7, 20, 20, 22.2],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 5 продавцов", "national",
     "3E/Hoshi; QES/Antai; Super Solar Z; Double N; Thai Solar System",
     ["https://www.3ebattery.com/products_detail/view/7741717",
      "https://www.qesenergy.co.th/category/%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C",
      "https://www.supersolarz.com/category/4110/mounting-solar"],
     "2026-10-23", "5 продавцов, 13–22 THB/шт — чистый коммодити",
     4, 5, 4, 2,
     "Маржи почти нет (13–22 THB при закупке ~10). Ценность только в комплектации: продавать «комплект крепежа на 1 кВт» (рейки+clamps+крюки) одним SKU с наценкой 25–30% за сборку. Отдельной строкой в каталоге — нет смысла.",
     "high")

part("MNT-END", "Крепёж", "End clamp 30–40 мм", "Antai / MEGA", "End Clamp 30/40",
     "крайний зажим AL6005-T5", "шт", [17, 19, 20, 22, 25],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 5 продавцов", "national",
     "QES/Antai; Thai Solar System/MEGA; Super Solar Z; PN Thailand; Double N",
     ["https://www.qesenergy.co.th/category/%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C",
      "https://www.thaisolarsystem.com/product/850/%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B9%81%E0%B8%9C%E0%B8%87-end-clamp-30-35-mm"],
     "2026-10-23", "5 продавцов; продаётся и поштучно, и упаковками по 12 (ThaiPopula 300/12 = 25/шт)",
     4, 5, 4, 2,
     "Тот же вывод, что и по mid clamp: только в комплекте. Упаковка 12 шт за 300 THB (ThaiPopula) = 25 THB/шт — это верх рынка.",
     "high")

part("MNT-LUG", "Крепёж", "Grounding lug / заземление", "Antai / EEG / Double N", "Grounding Lug",
     "зажим заземления для рейки/панели", "шт", [17, 19.5, 20, 25],
     "retail_equipment_only", "not stated", "1 шт", 0, "in stock, 4 продавца", "national",
     "Energy-3E; QES/Antai; Super Solar Z; Double N",
     ["https://www.energy-3e.com/products_detail/view/7772739",
      "https://www.qesenergy.co.th/category/%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%A2%E0%B8%B6%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C"],
     "2026-10-23", "4 продавца; обязательный элемент по ВСт (заземление рамы)",
     4, 4, 4, 2,
     "17–25 THB. Низкая маржа, но нужен для чек-листа «комплект крепежа по ВСт». Включить в комплект, не отдельным SKU.",
     "high")

part("MNT-KLIP", "Крепёж", "Kliplok-700 bracket", "RRACKS / Antai", "XL Kliplok 700 50mm",
     "зажим на фальцевую кровлю без сверления", "шт", [49, 65.48],
     "retail_equipment_only", "yes (ThaiPopula указывает incl VAT)", "1 шт", 0,
     "in stock, 2 продавца", "national", "ThaiPopula/RRACKS; Super Solar Z/Antai",
     ["https://thaipopula.com/index.php/rracks-xl-kliplok-700-bracket-assembly-50mm.html",
      "https://www.supersolarz.com/category/4110/mounting-solar"],
     "2026-10-23", "2 продавца; незаменим для фальцевой кровли (склады, ангары, некоторые отели)",
     3, 1, 3, 4,
     "49–65 THB против 37 у L-Feet: премия за «без сверления». На объектах с фальцевой кровлей (ангары, C&I) это единственный вариант без риска протечек → сильный аргумент в КП, а не товар для маржи.",
     "medium")

# ============================================================ BOS
part("BOS-SPD-DC3", "BOS", "DC SPD 1000 В, 3P", "Suntree", "SUP2H1-PV",
     "DC SPD 1000V 3P 20–40kA", "шт", [782, 940.5, 946, 1000, 1070, 1231, 1420],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 7 продавцов", "national",
     "SunTech; Lazada/SSS; Prathan; Super Solar Z; Thai Solar System; Energy-3E; Suntree TH",
     ["https://suntech1989.com/product/%E0%B9%80%E0%B8%AA%E0%B8%B4%E0%B8%A3%E0%B9%8C%E0%B8%88%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B9%88%E0%B8%B2-dc-surge-suntree-dc-1000v-3p-20-40ka-%E0%B8%AA%E0%B8%B5/",
      "https://prathan.co.th/product.list/brand/BS25/D03?name=%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%88%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B9%88%E0%B8%B2+SPD",
      "https://www.suntreethailand.com/product/suntree-sup2h1-pv-dc-surge-protective-device-3p-1000v-20-40ka-spd-%E0%B8%AA%E0%B8%B5%E0%B8%AA%E0%B9%89%E0%B8%A1-%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B9%88%E0%B8%B2-%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%87/11001008008000098"],
     "2026-10-23", "7 продавцов включая Lazada и официальный сайт Suntree TH → максимальная ликвидность",
     5, 5, 5, 2,
     "782–1,420 за устройство = 80% разброс. Идеальный «добор в корзину» (attach rate) к любому DC combiner. Маржа 40–60% при закупке у Suntree напрямую. Наш DC combiner 4,500 уже MARKET — но SPD в нём не выделен.",
     "high")

part("BOS-SPD-DC2", "BOS", "DC SPD 500 В, 2P", "Suntree", "SUP2H-PV",
     "DC SPD 500V 2P 20–40kA", "шт", [535, 692.84, 702, 770],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 4 продавца", "national",
     "SunTech; Prathan; Lazada; Sato-Power",
     ["https://suntech1989.com/product/%E0%B9%80%E0%B8%AA%E0%B8%B4%E0%B8%A3%E0%B9%8C%E0%B8%88%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B9%88%E0%B8%B2-dc-surge-suntree-dc-500v-2p-20-40ka-%E0%B8%AA%E0%B8%B5%E0%B9%80/",
      "https://prathan.co.th/product.list/brand/BS25/D03?name=%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%88%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%9C%E0%B9%88%E0%B8%B2+SPD"],
     "2026-10-23", "4 продавца; 2P нужен для 1-фазных систем 3–5 кВт",
     4, 4, 5, 2,
     "Аналог 3P, но для 1-фазных. Нужен, потому что в нашем каталоге лишь один DC combiner без разбивки по фазам/напряжениям.",
     "high")

part("BOS-MCCB-DC", "BOS", "DC MCCB 2P 100A 1000 В", "Suntree", "SM8-250HPV",
     "DC MCCB 2P 100A, 1000 В", "шт", [2300, 2664.75, 2950, 4000],
     "retail_equipment_only", "mixed", "1 шт", 0, "in stock, 4 продавца", "national",
     "Sato-Power; Prathan; Suntree TH; SCD Power",
     ["https://www.sato-power.com/Protection%20Suntree.html", "https://prathan.co.th/product/THUNSM8250HPV2P100A",
      "https://www.suntreethailand.com/product/suntree-sm8-250hpv-2p-pv-specially-used-dc-molded-case-circuit-breaker-1000v-%E0%B9%80%E0%B8%9A%E0%B8%A3%E0%B8%81%E0%B9%80%E0%B8%81%E0%B8%AD%E0%B8%A3%E0%B9%8C-%E0%B9%81%E0%B8%9A%E0%B8%95%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B8%B5%E0%B9%88-100-2/11001008008000032"],
     "2026-10-23", "4 продавца; главный DC-разъединитель для батарейных систем 48 В",
     4, 3, 4, 3,
     "2,300–4,000 = 74% разброс между 500 В и 1000 В версиями. В КП всегда указывать напряжение: 500 В версия дешевле, но не годится для 1000 В стрингов. Типичная ошибка в дешёвых BOM.",
     "high")

part("BOS-MCB-DC32", "BOS", "DC MCB 32A 550 В, 2P", "Suntree / Chint", "SL7-63 DC 32A",
     "DC MCB 550 В, 32 А, 2 полюса", "шт", [430, 480], "retail_equipment_only", "not stated",
     "1 шт", 0, "in stock, 2 продавца", "national", "Thai-AgroTech; Thai Solar System",
     ["https://www.thaiagrotech.com/category/16/%E0%B9%80%E0%B8%9A%E0%B8%A3%E0%B8%81%E0%B9%80%E0%B8%81%E0%B8%AD%E0%B8%A3%E0%B9%8C-%E0%B8%9F%E0%B8%B4%E0%B8%A7%E0%B8%AA%E0%B9%8C-surge/%E0%B9%80%E0%B8%9A%E0%B8%A3%E0%B8%81%E0%B9%80%E0%B8%81%E0%B8%AD%E0%B8%A3%E0%B9%8C-dc-solar",
      "https://www.thaisolarsystem.com/product/866/%E0%B9%80%E0%B8%9A%E0%B8%A3%E0%B8%81%E0%B9%80%E0%B8%81%E0%B8%AD%E0%B8%A3%E0%B9%8C-suntree-dc-32a-550v-2p"],
     "2026-10-23", "2 продавца; базовый стринговый автомат, есть в каждом пакете",
     3, 3, 4, 2,
     "430–480 THB/шт × 2–4 шт на систему. Низкая маржа, но высокая частота. Хорош как позиция «BOS-набор» вместе со SPD.",
     "medium")

part("BOS-COMB-2S", "BOS", "AC-DC combiner 2 string, 3 фазы", "Thai-AgroTech / Suntree", "AC-DC 2str 3ph 10kW",
     "2 string, DC 1000 В, 3 фазы, MCCB+SPD, IP45", "шт", [8500, 10500, 12500, 15500],
     "retail_equipment_only", "not stated", "1 шт", 12, "in stock, 3 продавца", "national",
     "Thai-AgroTech (3 варианта); Light-House; Thai Solar System",
     ["https://www.thaiagrotech.com/product/104/ac-dc-combiner-box-2string-3phase-%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%9A%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C",
      "https://www.thaiagrotech.com/product/175/%E0%B8%95%E0%B8%B9%E0%B9%89%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B8%9A%E0%B8%B2%E0%B8%A2%E0%B9%80%E0%B8%99%E0%B8%AD%E0%B8%A3%E0%B9%8C-suntree-ac-dc-combiner-2string-3phase-%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%9A%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-%E0%B9%81%E0%B8%9A%E0%B8%9A-2-%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B8%B4%E0%B8%87-%E0%B8%82%E0%B8%99%E0%B8%B2%E0%B8%94"],
     "2026-10-23", "3 продавца; 8,500–15,500 = 82% разброс из-за комплектации (SPD/MCCB/стекло)",
     4, 3, 5, 4,
     "Наш DC combiner 4,500 — это НЕ то же самое: у нас только DC-часть. Полный AC-DC 3-фазный combiner — 8,500–15,500. Если мы продаём 4,500 как «combiner», клиент ждёт AC-часть → возвраты. Разделить SKU: DC-only vs AC-DC.",
     "high")

part("BOS-COMB-3S", "BOS", "AC-DC combiner 3 string, 10–20 кВт", "Thai-AgroTech", "AC-DC 3str 10-20kW 3ph",
     "3 string, 10–20 кВт, 3 фазы, 17 кг", "шт", [10500, 12250],
     "retail_equipment_only", "not stated", "1 шт", 12, "in stock, 1 продавец", "national",
     "Thai-AgroTech", ["https://www.thaiagrotech.com/product/145/ac-dc-combiner-box-3string-%E0%B8%82%E0%B8%99%E0%B8%B2%E0%B8%94-10-20kw-3phase-%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%9A%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C"],
     "2026-10-23", "1 продавец, но чёткая цена и вес; нужен для 15–20 кВт систем",
     3, 1, 4, 3,
     "12,250 → акция 10,500. Для систем 15–20 кВт (отель, вилла с бассейном) — обязательный элемент. 17 кг → доставка на острова считать отдельно.",
     "medium")

part("BOS-METER-DTSU", "BOS", "Смарт-метр 3 фазы (Huawei)", "Huawei", "DTSU666-H (250A/50mA)",
     "3 фазы, 250A CT, zero-export, MEA-лист", "шт", [3020, 3118, 3190, 3230, 3600, 3858, 3980, 4000, 4800],
     "retail_equipment_only", "mixed", "1 шт", 24, "in stock, 9 продавцов", "national",
     "QuizNet; Thai Watsadu; Godungfaifaa; SunTech; Solar Tech Center; 3E; Thai Solar System; Sunnergy; Priceza",
     ["https://quiznet.co.th/product/dtsu666-hw/",
      "https://www.thaiwatsadu.com/th/product/%E0%B8%AA%E0%B8%A1%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%97%E0%B8%A1%E0%B8%B4%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%B2-3-%E0%B9%80%E0%B8%9F%E0%B8%AA-(250-%E0%B9%81%E0%B8%AD%E0%B8%A1%E0%B8%9B%E0%B9%8C)-HUAWEI-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-DTSU666-H-%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7-60375489",
      "https://www.go-dung-fai-faa.com/product/Huawei-Smart-Meter-3-Phase--250A-CT--a50af709",
      "https://www.3e-thailand.com/products_detail/view/7688832",
      "https://www.sunnergytech.com/product/2192/huawei-dtsu-666-h-power-sensor-for-3-phase"],
     "2026-10-23", "9 продавцов + Thai Watsadu (big-box) → коммодити с максимальной прозрачностью",
     5, 5, 5, 3,
     "Медиана 3,600 THB. Наш 1-фазный DDSU666-H стоит 4,900 при рынке 1,814–4,100 → завышение +123%. С 3-фазным DTSU картина та же: 4,900 против 3,600 = +36%. Пересмотреть оба SKU.",
     "high")

part("BOS-METER-GM3K", "BOS", "Смарт-метр 3 фазы (GoodWe)", "GoodWe", "GM3000",
     "3 фазы, CT в комплекте, RS485", "шт", [8000, 10000], "retail_equipment_only",
     "not stated", "1 шт", 24, "in stock, 1 продавец", "national", "Technosolars",
     ["http://www.technosolars.com/category/62/grid-tie-inverter/goodwe"],
     "2026-10-23", "1 продавец публикует цену (8,000 со скидкой, 10,000 базовая)",
     2, 1, 5, 3,
     "ЗАКРЫВАЕТ GAP smart-meter-goodwe-3ph: тайская цена СУЩЕСТВУЕТ — 8,000–10,000 THB. Наши 8,500 попадают ровно в рынок (не OVERPRICED, как считалось при n=0). Но n=1 → confidence low, нужен второй продавец.",
     "low")

part("BOS-DONGLE", "BOS", "Wi-Fi/LAN донгл (Huawei)", "Huawei", "SDongleA-05",
     "Smart Dongle WLAN-FE, до 10 инверторов", "шт", [2180, 2400, 2500, 2550, 2592, 2675],
     "retail_equipment_only", "mixed", "1 шт", 24, "in stock, 6 продавцов", "national",
     "Lewplc; Catalog Huawei; Penguin Fiber; Solar Tech Center; 3E; Thai Solar System",
     ["https://www.lewplc.com/products_detail/view/7762210",
      "https://www.3e-thailand.com/products_detail/view/7689224",
      "https://www.thaisolarsystem.com/product/1717/huawei-smartdongle-wlan-fe-sdonglea-05"],
     "2026-10-23", "6 продавцов + указан в MEA Zero Export List → обязательный аксессуар",
     5, 4, 5, 3,
     "Медиана 2,525. Критично: без донгла нет мониторинга, а клиент считает «система не работает». Часто забывается в BOM → ставим в КП отдельной строкой всегда.",
     "high")

part("BOS-LOGGER", "BOS", "Логгер для C&I", "Huawei", "SmartLogger3000A",
     "до 80 инверторов, RS485/ETH, IEC104/61850", "шт", [17184],
     "retail_equipment_only", "no (×1.07 → 18,387)", "1 шт", 12, "in stock, 1 продавец",
     "national", "Sirichai Electric",
     ["https://shop.sirichaielectric.com/product/HUAWEI-SMART-LOGGER-3000A-GL-WLAN-SMARTLOGGER3000A00GL-%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99-2%E0%B8%9B%E0%B8%B5"],
     "2026-10-23", "1 продавец; нужен для 100 кВт+ и для интеграции с EMS заказчика",
     2, 1, 5, 3,
     "Единственная цена 17,184 (excl VAT → 18,387). Для наших C&I 100 кВт–1 МВт это обязательная строка. Отсутствие логгера в нашем 14.5 THB/Вт Huawei — ещё один признак неполного BOM.",
     "low")

part("BOS-ATS", "BOS", "ATS 100A 4P (переключатель)", "TMDA", "ATS AC 400V 100A 4P",
     "автоматический переключатель источник-сеть", "шт", [910], "retail_equipment_only",
     "not stated", "1 шт", 12, "in stock, 1 продавец", "national", "Thai Solar System",
     ["https://www.thaisolarsystem.com/product/1253/%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%AA%E0%B8%A5%E0%B8%B1%E0%B8%9A%E0%B9%84%E0%B8%9F-ats-ac-400v-100a-4p-tmda"],
     "2026-10-23", "1 продавец; незаменим для схем «генератор + солнце» на островах",
     2, 1, 4, 5,
     "910 THB за 100A 4P — дешёвый вход в сегмент backup/off-grid. Для Ланты/Пхи-Пхи, где сеть падает, связка ATS + гибрид Deye = продукт, которого у нас нет.",
     "low")

part("BOS-OPT-SE", "BOS", "Оптимизатор SolarEdge", "SolarEdge", "P505 / S650B / S1200",
     "оптимизатор 505–1200 Вт, 25 лет", "шт", [2494, 3117, 3815],
     "retail_equipment_only", "not stated", "1 шт", 300, "in stock, 1 продавец", "national",
     "Energy-3E", ["https://www.energy-3e.com/products_detail/view/7772266"],
     "2026-10-23", "1 продавец с тремя моделями; SolarEdge в TH — нишевый, но премиальный сегмент",
     2, 1, 5, 4,
     "ЗАКРЫВАЕТ GAP BOM-solaredge-optimizer частично: P850 в TH по-прежнему НЕТ, но есть P505/S650B/S1200. Для C&I на SolarEdge (наш SKU 100K/200K/500K/1МВт) оптимизаторы — самая большая скрытая строка BOM: 2,500–3,800 × число пар панелей.",
     "medium")

part("BOS-OPT-HW", "BOS", "Оптимизатор Huawei", "Huawei", "SUN2000-600W-P / MERC-1300W-P",
     "1:1 600 Вт и 2:1 1100–1300 Вт", "шт", [1370, 1650, 1797, 2116, 2140, 2276, 2570, 2670, 2740, 2940],
     "retail_equipment_only", "mixed", "1 шт", 300, "in stock, 4 продавца", "national",
     "SmartP; Solar Energy Thailand; Thai Solar System; Selfconcept; Advice",
     ["https://www.smartpstore.com/product/227/huawei-smart-pv-optimizer-sun2000-600w-p",
      "https://solar-energythailand.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C/",
      "https://www.thaisolarsystem.com/product/1041/huawei-smart-pv-optimizer-merc-1300w-p-long-input-cable",
      "https://shop.selfconcept-onlineshop.com/products/optimizer"],
     "2026-10-23", "4 продавца; MERC-1300W-P продаётся и в Advice (national retail)",
     4, 3, 5, 4,
     "1,370–2,940 в зависимости от модели и длины кабеля. КРИТИЧНО для C&I: по ВСт 022013-22 при инверторах ≥200 кВА нужен rapid shutdown → оптимизаторы становятся обязательной строкой (2 шт на панель при 2:1).",
     "high")

part("BOS-OPT-TIGO", "BOS", "Оптимизатор/RSD Tigo", "Tigo", "TS4-A-O (700–725 Вт)",
     "оптимизация + мониторинг + rapid shutdown", "шт", [2020],
     "retail_equipment_only", "not stated", "1 шт", 300, "sold out at time of check", "national",
     "Selfconcept", ["https://shop.selfconcept-onlineshop.com/products/tigo-ts4-a-o-pmax-700w"],
     "2026-10-23", "1 продавец, товар распродан → спрос превышает предложение на локальном рынке",
     3, 1, 3, 4,
     "2,020 THB/шт — единственная тайская цена. Вендор-независимый (ставится на любой стринг) → закрывает требование RSD на объектах, где инвертор не Huawei/SolarEdge. Проблема: нет в наличии; нужен прямой импорт.",
     "low")

# ============================================================ КАБЕЛЬ
part("CAB-PV6", "Кабель", "PV-кабель 6 мм², рулон 100 м", "LINK / LUMIRA", "CB-1060AB / PV1-F 6mm",
     "6 мм², 1500 В DC, 100 м", "рулон 100 м", [2200, 2350, 3100, 3450, 3998, 4684],
     "retail_equipment_only", "mixed", "1 рулон", 0, "in stock, 5 продавцов", "national",
     "R3; LINK/R3; Willpower; Thai Solar System; Dohome; Wanchaikan",
     ["https://r3solarcell.co.th/product/%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%9F-pv-%E0%B8%82%E0%B8%99%E0%B8%B2%E0%B8%94-6-sq-mm-%E0%B8%AA%E0%B8%B5%E0%B8%94%E0%B8%B3-%E0%B8%A2%E0%B8%B2%E0%B8%A7-100-%E0%B9%80%E0%B8%A1%E0%B8%95%E0%B8%A3/",
      "https://www.willpowerinter.com/product/30820-35650/link-cb-1060ar-1-pv-solar-cable-6sqmm-red-100m",
      "https://www.thaisolarsystem.com/product/669/%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%9F-pv-%E0%B8%82%E0%B8%99%E0%B8%B2%E0%B8%94-6-sq-mm-%E0%B8%A2%E0%B8%B5%E0%B9%88%E0%B8%AB%E0%B9%89%E0%B8%AD-link-%E0%B8%AA%E0%B8%B5%E0%B9%81%E0%B8%94%E0%B8%87-%E0%B8%A2%E0%B8%B2%E0%B8%A7-100-%E0%B9%80%E0%B8%A1%E0%B8%95%E0%B8%A3-1-%E0%B8%A1%E0%B9%89%E0%B8%A7%E0%B8%99",
      "https://www.dohome.co.th/th/link-solar-pv-cable-6-mm-x-100-m-cb-1060ab-10378618.html"],
     "2026-10-23", "5 продавцов + Dohome; 22–33 THB/м; обязательный расходник в каждом проекте",
     5, 4, 4, 3,
     "Единица зафиксирована: рулон 100 м. 2,200–4,684 — 113% разброс, потому что часть лотов — остатки/акция. Медиана 3,275. Наш 4-мм кабель 3,500 при медиане 2,787 — переоценён; для 6 мм цена 3,500 была бы в рынке. Проверить, что именно у нас в каталоге.",
     "high")

part("CAB-MC4", "Кабель", "MC4-коннектор (пара)", "LINK / MC4-совместимые", "CB-1006A",
     "IP68, 1000–1500 В, 30 А, пара", "пара", [18, 34, 43, 60, 85],
     "retail_equipment_only", "mixed", "1 пара", 0, "in stock, 5 продавцов", "national",
     "Thai Solar System; Sirichai; Thai Watsadu/LINK; Champ Biz; Sunnergy",
     ["https://www.thaisolarsystem.com/product/41/", "https://shop.sirichaielectric.com/product/",
      "https://www.thaiwatsadu.com/th/product/%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B8%B2%E0%B8%A3%E0%B9%8C-MC4-%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%87-LINK-%E0%B8%A3%E0%B8%B8%E0%B9%99-CB-1006A-%E0%B8%AA%E0%B8%B5%E0%B8%94%E0%B8%B3-60385399"],
     "2026-10-23", "5 продавцов включая Thai Watsadu; 18–85 THB за пару",
     5, 4, 4, 2,
     "ЗАКРЫВАЕТ GAP UNIT_AMBIGUOUS: единица = ПАРА, медиана 43 THB. Наши 500 THB = 11.6× если это пара; если упаковка 10 пар → 50/пара = MARKET. Обе цифры правдоподобны, но каталог обязан писать число пар.",
     "high")

part("CAB-CRIMP", "Кабель", "Инструмент для опрессовки MC4", "LINK / FSE / LY", "CB-1084; FSE-2546B; LY-2546B",
     "кримпер 2.5/4/6 мм²", "шт", [340, 450, 550, 620, 790, 1600, 2130],
     "retail_equipment_only", "not stated", "1 шт", 12, "in stock, 5 продавцов", "national",
     "C-Hamtec; SPE; Champ; DIY Led; Thai Solar System; Thai Watsadu",
     ["https://www.c-hamtec.com/product/362/%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%A2%E0%B9%89%E0%B8%B3%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-%E0%B8%84%E0%B8%B5%E0%B8%A1%E0%B8%A2%E0%B9%89%E0%B8%B3%E0%B8%82%E0%B8%B1%E0%B9%89%E0%B8%A7-mc4-solar-cell-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99%E0%B8%9E%E0%B8%B4%E0%B9%80%E0%B8%A8%E0%B8%A9%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B8%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%97%E0%B8%99%E0%B8%97%E0%B8%B2%E0%B8%99-%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B8%A0%E0%B8%B2%E0%B8%9E",
      "https://www.thaiwatsadu.com/product/%E0%B8%84%E0%B8%B5%E0%B8%A1%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-MC4-LINK-%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99-CB-1084-60345238"],
     "2026-10-23", "5 продавцов; инструмент покупают монтажники — узкая, но лояльная аудитория",
     3, 3, 3, 4,
     "340–2,130 = 6× разброс: от китайского noname до LINK CB-1084 (Thai Watsadu 2,130). Ценность не в марже, а в том, что это товар, который приводит монтажников (B2B-лид) — «инструменты и расходники» как вход в installer-program.",
     "high")

# ============================================================ EV
part("EV-HW-7", "EV-зарядка", "AC 7 кВт, 1 фаза", "Huawei", "SCharger-7KS-S0",
     "7 кВт, 1 фаза, Type 2, 5 лет", "шт", [19900, 27675, 44810],
     "retail_equipment_only", "mixed", "1 шт", 60, "in stock, 4 продавца", "national",
     "EV Charger.co.th; Wallbox.in.th; Energy-3E; Solar Power Solution",
     ["https://www.evcharger.co.th/product-category/ev-charger-station-ac/7-4kw/",
      "https://www.wallbox.in.th/product-category/charging-stations/page/2/",
      "https://www.energy-3e.com/products?cat_main_id=1159879&cat_name=EV+Charger+Huawei"],
     "2026-10-23", "4 продавца; 19,900 (голое устройство) → 41,000 (с монтажом) = монтаж ~21,000",
     4, 3, 5, 4,
     "Голая цена 19,900–27,675; с монтажом 41,000. Наша EV-зарядка 12/25 кВт — DC, а рынок массово покупает AC 7/11/22 кВт. AC 7 кВт за 19,900 — очевидная дырка в нашем каталоге (отель, вилла, офис).",
     "high")

part("EV-HW-22", "EV-зарядка", "AC 22 кВт, 3 фазы", "Huawei", "SCharger-22KT-S0",
     "22 кВт, 3 фазы, Type 2, 5 лет", "шт", [29900, 33780, 36831, 58000],
     "retail_equipment_only", "mixed", "1 шт", 60, "in stock, 4 продавца", "national",
     "Wallbox.in.th; R3; Energy-3E; EV Charger.co.th",
     ["https://www.wallbox.in.th/product-category/charging-stations/page/2/",
      "https://r3solarcell.co.th/product/wall-charge-22kw-huawei-ev-charge-22kw/",
      "https://www.energy-3e.com/products?cat_main_id=1159879&cat_name=EV+Charger+Huawei"],
     "2026-10-23", "4 продавца; 29,900 без монтажа → 55,000 с монтажом",
     4, 3, 5, 5,
     "Наш аналог — Sigen EV DC 25 кВт за 129,000 (OVERPRICED +28.6%). Huawei AC 22 кВт за 33,780 = в 3.8 раза дешевле для той же задачи «зарядить машину за ночь» на отеле. Нужна AC-линейка как entry, DC — как premium.",
     "high")

part("EV-ABB-22", "EV-зарядка", "AC 22 кВт, 3 фазы", "ABB", "Terra AC Wallbox 22kW",
     "22 кВт, 3 фазы, Type 2, 3 года", "шт", [45000, 52000, 55000],
     "retail_equipment_only", "mixed", "1 шт", 36, "in stock, 3 продавца", "national",
     "EV Charger.co.th; Khumwai Solar (installed); 3E",
     ["https://www.evcharger.co.th/product-category/ev-charger-station-ac/22kw/",
      "https://khumwaisolar.com/product/abb-terra-ac-wallbox-22kw/",
      "https://www.energy-3e.com/products?cat_main_id=1159955&cat_name=ABB"],
     "2026-10-23", "3 продавца; ABB — премиум-бренд для курортов 5*, цена с монтажом 52,000",
     3, 2, 4, 3,
     "52,000 с монтажом (Khumwai) — готовый ориентир для «ABB 22 кВт под ключ». Премия к Huawei 22 кВт = +54%. Для 5* отелей, где важен бренд зарядки на парковке, ABB продаётся лучше.",
     "high")

part("EV-SCH-7", "EV-зарядка", "AC 7.4 кВт, 1 фаза", "Schneider", "Charge 7.4kW (EVH5A07N2C5)",
     "7.4 кВт, 1 фаза, Type 2, RDC-DD", "шт", [28900, 32500, 41000],
     "retail_equipment_only", "mixed", "1 шт", 24, "in stock, 3 продавца", "national",
     "EV Charger.co.th; Wallbox.in.th; EV link Home",
     ["https://www.evcharger.co.th/product-category/ev-charger-station-ac/7-4kw/",
      "https://www.wallbox.in.th/"],
     "2026-10-23", "3 продавца; Schneider — самый узнаваемый электротехнический бренд в Таиланде (HomePro/Thai Watsadu)",
     3, 3, 3, 3,
     "28,900–41,000. Ценность — в кроссе с нашими BOS: клиент, которому мы ставим Schneider/ABB-автоматику, ждёт и зарядку того же бренда. Пакетный аргумент, не самостоятельный SKU.",
     "medium")

part("EV-WB-22", "EV-зарядка", "AC 22 кВт, 3 фазы", "Wallbox", "Pulsar Plus 22kW",
     "22 кВт, 3 фазы, WiFi/BT, 5 м кабель", "шт", [35900, 42500, 59000],
     "retail_equipment_only", "mixed", "1 шт", 24, "in stock, 3 продавца", "national",
     "EV Charger.co.th; Wallbox.in.th; EV2car (resale)",
     ["https://www.evcharger.co.th/product-category/ev-charger-station-ac/22kw/",
      "https://www.wallbox.in.th/product-category/charging-stations/page/2/"],
     "2026-10-23", "3 продавца; бренд с сильным маркетингом, популярен у вилл с электромобилем",
     3, 3, 3, 2,
     "35,900–59,000 (разброс из-за 5/7 м кабеля и «с установкой»). Для нас — не приоритет: нет пересечения с нашими брендами и нет сервисной сети в Краби.",
     "medium")

part("EV-AUTEL-7", "EV-зарядка", "AC 7.4 кВт, 1 фаза", "Autel", "MaxiCharger 7.4kW GEN2",
     "7.4 кВт, 1 фаза, Type 2, RFID", "шт", [24000, 26000, 26900],
     "retail_equipment_only", "not stated", "1 шт", 24, "in stock, 3 продавца", "national",
     "Wallbox.in.th; EV Pro Solutions; IBS resellers",
     ["https://www.wallbox.in.th/", "https://www.evprosolutions.co.th/home-ev-charger-7kw-vs-22kw/"],
     "2026-10-23", "3 продавца; 26,000 голое устройство → 39,000–42,000 с монтажом",
     3, 3, 3, 3,
     "Монтаж добавляет 13,000–16,000 THB — это и есть наша маржа в EV-услуге. Продавать зарядку без монтажа бессмысленно: 60% стоимости услуги — работа.",
     "high")

# ============================================================ ПРОЧЕЕ / НИША
part("PMP-750", "Пумпа", "Солнечный насос 750 Вт, комплект", "SUNTECH / Thai-AgroTech", "Submersible 750W 72V",
     "750 Вт, 72 В DC, напор до 56 м, 2\" — с MPPT-контроллером", "комплект", [21500, 23000, 24500, 31900],
     "retail_equipment_only", "not stated", "1 компл.", 36, "in stock, 2 продавца", "national",
     "Thai-AgroTech; Sunnergy",
     ["https://www.thaiagrotech.com/category/4/%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C-solar-cell/%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%B1%E0%B9%8A%E0%B8%A1%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C",
      "https://www.sunnergysolar.com/category/75/%E0%B8%8A%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%B1%E0%B9%8A%E0%B8%A1%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B9%82%E0%B8%8B%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%A5%E0%B8%A5%E0%B9%8C%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%9C%E0%B8%87"],
     "2026-10-23", "2 продавца; в Краби вокруг Ао Лык/Кхлонг Тхом — плантации пальм и каучука, полив критичен",
     3, 2, 2, 4,
     "23,750 за готовый комплект 750 Вт. Сегмент, которого у нас нет: фермеры/сады. Низкий fit с нашим бренд-портфелем, но это единственный продукт, который покупают вне «крыши» и без PEA. Хорош как отдельная лендинг-тема (/solar-pump), не как каталог-позиция.",
     "medium")

print(len(P))
