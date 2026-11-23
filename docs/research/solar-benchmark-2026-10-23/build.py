# -*- coding: utf-8 -*-
import csv, statistics, sys
from quotes_data import QUOTES
from bom_quotes import BOM_QUOTES

RETRIEVED = "2026-10-23"

# Явные переопределения включения (класс/дубли) — применяются к копии данных
OVERRIDES = {
 ("goodwe-5kw-inverter", 18000): ("on-grid модель — другой класс (наш SKU гибридный), справочно"),
 ("goodwe-5kw-inverter", 15900): ("on-grid модель — другой класс, справочно"),
 ("goodwe-5kw-inverter", 46500): ("on-grid модель — другой класс, справочно"),
 ("goodwe-5kw-inverter", 36346): ("on-grid модель — другой класс, справочно"),
 ("goodwe-10kw-inverter", 34000): ("on-grid GW10K-SDT-30 — другой класс, справочно"),
 ("combiner-box-dc-2string", 5885): ("AC/DC 3-фазный вариант — другой продукт"),
 ("sigenergy-10kwh-3phase", 450000): ("та же компания (SKE), вариант C60 — не отдельный источник"),
}
QUOTES = [dict(q) for q in QUOTES]
for q in QUOTES:
    o = OVERRIDES.get((q["sku"], int(float(q["price"]))))
    if o:
        q["inc"] = False
        q["notes"] = (q["notes"] + " | " + o).strip(" |")

# ---------------- benchmark configuration ----------------
# our  = our catalogue price expressed in `unit` (THB/system, THB/W, THB/panel, ...)
CFG = [
 dict(sku="goodwe-5kw-1phase", cat="On-grid (без АКБ) 5 кВт, 1 фаза", scope="installed_turnkey",
      loc="Hat Yai (Юг) + национальные", unit="system", our=120000, match="equivalent",
      conf="medium", nodata=False, inst="yes", permit="yes",
      note="Наш BOM: GoodWe 5 кВт on-grid + 8×715 Вт + combiner/zero export. Рынок — on-grid пакеты без АКБ (Solis/Huawei, 9–10 панелей)."),
 dict(sku="goodwe-10kw-3phase", cat="On-grid (без АКБ) 10 кВт, 3 фазы", scope="installed_turnkey",
      loc="Hat Yai (Юг) + национальные", unit="system", our=228000, match="equivalent",
      conf="medium", nodata=False, inst="yes", permit="yes",
      note="Южный прайс (Hat Yai) не указывает фазу — EQUIVALENT. Национальные 3-фазные пакеты 9.45–10 кВт; наш BOM — GoodWe 10 кВт on-grid + 16×715 Вт."),
 dict(sku="goodwe-20kw-3phase", cat="On-grid 20 кВт, 3 фазы", scope="installed_turnkey",
      loc="национальные (Юг — нет публичной цены)", unit="system", our=443000, match="equivalent",
      conf="low", nodata=False, inst="yes", permit="yes",
      note="Наш BOM = 2× GoodWe 10 кВт on-grid + 32×715 Вт; рынок — on-grid пакеты с 1 инвертором 20 кВт. Разброс 350–514 тыс."),
 dict(sku="goodwe-30kw-3phase", cat="On-grid 30 кВт, 3 фазы", scope="installed_turnkey",
      loc="национальные (Юг — нет публичной цены)", unit="system", our=601000, match="equivalent",
      conf="low", nodata=False, inst="yes", permit="yes",
      note="Два кластера: EPC-ставки 520–588 тыс. и full-service 835–875 тыс. Медиана между кластерами — низкая уверенность; при сравнении только с EPC-кластером наша цена MARKET."),
 dict(sku="solaredge-100kw", cat="C&I 100 кВт, SolarEdge + оптимизаторы", scope="epc_thb_per_w", div=100000,
      loc="национальные EPC-ставки", unit="W", our=2350000/100000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial",
      note="Прямых цен на SolarEdge-проекты нет: сравнение с общими EPC-ставками (без SolarEdge/оптимизаторов), match_type=EQUIVALENT — ориентир, не прямой аналог."),
 dict(sku="solaredge-200kw", cat="C&I 200 кВт, SolarEdge + оптимизаторы", scope="epc_thb_per_w", div=200000,
      loc="национальные EPC-ставки", unit="W", our=4600000/200000, match="equivalent",
      conf="low", nodata=True, inst="partial", permit="partial",
      note="Только 1–2 публичные ставки для 200 кВт; SolarEdge-специфика не покрыта."),
 dict(sku="solaredge-500kw", cat="C&I 500 кВт, SolarEdge + оптимизаторы", scope="epc_thb_per_w", div=500000,
      loc="национальные EPC-ставки", unit="W", our=11250000/500000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial",
      note="EPC-ставки 18–22 THB/W (общий рынок, без SolarEdge); исключения: MV-трансформатор, КТП, СМР, земля — источники не раскрывают."),
 dict(sku="solaredge-1mw", cat="Utility 1 МВт, SolarEdge + оптимизаторы", scope="epc_thb_per_w", div=1000000,
      loc="национальные EPC-ставки", unit="W", our=22000000/1000000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial",
      note="16–22 THB/W по рынку (общий EPC, без SolarEdge); MV/земля/СМР/грид-апгрейд источниками не раскрыты."),
 dict(sku="huawei-100kw", cat="C&I 100 кВт, Huawei", scope="epc_thb_per_w", div=100000,
      loc="национальные EPC-ставки", unit="W", our=1450000/100000, match="equivalent",
      conf="medium", nodata=False, inst="partial", permit="partial",
      note="14.5 THB/W — ниже всех 4 EPC-ставок; Zeta 14.9 относится к solaredge-100kw и исключена из медианы. Проверить полноту BOM (MDB, СМР)."),
 dict(sku="huawei-200kw", cat="C&I 200 кВт, Huawei 150+50", scope="epc_thb_per_w", div=200000,
      loc="национальные EPC-ставки", unit="W", our=4200000/200000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial",
      note="Единственная чистая ставка 18.5 THB/W (Saimai); второй ориентир — floor 22.5."),
 dict(sku="huawei-500kw", cat="C&I 500 кВт, Huawei 150×3+50", scope="epc_thb_per_w", div=500000,
      loc="национальные EPC-ставки", unit="W", our=10250000/500000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial", note="18–20 THB/W."),
 dict(sku="huawei-1mw", cat="Utility 1 МВт, Huawei", scope="epc_thb_per_w", div=1000000,
      loc="национальные EPC-ставки", unit="W", our=20000000/1000000, match="equivalent",
      conf="low", nodata=False, inst="partial", permit="partial", note="19–22 THB/W."),
 dict(sku="sigenergy-5kwh-1phase", cat="Гибрид 5 кВт + 6 кВт·ч, 1 фаза", scope="installed_turnkey",
      loc="национальные пакеты Sigenergy", unit="system", our=375000, match="equivalent",
      conf="medium", nodata=False, inst="yes", permit="partial",
      note="Наш BOM: EC 5.0 SP + BAT 6.0 + 12×630 Вт (7.56 кВт) + gateway. Рынок: 229 тыс. (6 кВт + 7.5 кВт·ч + 9 панелей) и 250,4 тыс. (5 кВт + BAT 6) — у конкурентов меньше панелей; разница частично объяснима, но не полностью."),
 dict(sku="sigenergy-5kwh-10kwh-1phase", cat="Гибрид 5 кВт + 10 кВт·ч, 1 фаза", scope="installed_turnkey",
      loc="национальные пакеты Sigenergy", unit="system", our=415000, match="equivalent",
      conf="medium", nodata=False, inst="yes", permit="partial",
      note="Сравнение с пакетами 5 кВт + 10 кВт·ч (Sigen и SKE)."),
 dict(sku="sigenergy-10kwh-1phase", cat="Гибрид 10 кВт + 10 кВт·ч, 1 фаза", scope="installed_turnkey",
      loc="национальные пакеты Sigenergy", unit="system", our=553000, match="equivalent",
      conf="low", nodata=False, inst="yes", permit="partial",
      note="Единственный публичный пакет 10 кВт 1ph не указывает ёмкость АКБ — EQUIVALENT, low."),
 dict(sku="sigenergy-10kwh-16kwh-1phase", cat="Гибрид 10 кВт + 15 кВт·ч, 1 фаза", scope="installed_turnkey",
      loc="—", unit="system", our=623000, match="no_data",
      conf="none", nodata=True, inst="unknown", permit="unknown",
      note="Публичного пакета 1 фаза / 15 кВт·ч нет. Не экстраполируем."),
 dict(sku="sigenergy-10kwh-3phase", cat="Гибрид 10 кВт + 10 кВт·ч, 3 фазы", scope="installed_turnkey",
      loc="национальные пакеты Sigenergy", unit="system", our=555000, match="equivalent",
      conf="low", nodata=False, inst="yes", permit="partial",
      note="Единственный публичный пакет: SKE 10 кВт 3ph + 10 кВт·ч (TP30) 425 000; вариант C60 (450 000) — та же компания. Пакет включает Gateway; наш BOM — без gateway."),
 dict(sku="sigenergy-25kwh-3phase", cat="Гибрид 25 кВт + 15 кВт·ч, 3 фазы", scope="installed_turnkey",
      loc="национальные пакеты Sigenergy", unit="system", our=928000, match="equivalent",
      conf="low", nodata=False, inst="yes", permit="partial",
      note="Единственный источник: Sunnergy 25 кВт 3ph 879 000; ёмкость АКБ в карточке не указана — пакет может быть без АКБ."),
 dict(sku="sigenergy-25kwh-30kwh-3phase", cat="Гибрид 25 кВт + 30 кВт·ч, 3 фазы", scope="installed_turnkey",
      loc="—", unit="system", our=1122000, match="no_data",
      conf="none", nodata=True, inst="unknown", permit="unknown",
      note="Публичного пакета 30 кВт·ч нет; сборка из модулей — не рыночная цена."),
 # components
 dict(sku="ev-charger-12kw", cat="EV-зарядка DC 12 кВт CCS2", scope="equipment_only",
      loc="национальные", unit="unit", our=98000, match="exact", conf="high", nodata=False,
      inst="no", permit="no", note="Sigen EV DC Charging Module 12 кВт, CCS2; сравнение 10-м кабеля."),
 dict(sku="ev-charger-25kw", cat="EV-зарядка DC 25 кВт CCS2", scope="equipment_only",
      loc="национальные", unit="unit", our=129000, match="exact", conf="high", nodata=False,
      inst="no", permit="no", note="Sigen EV DC Charging Module 25 кВт, CCS2 10 м."),
 dict(sku="mounting-metal-sheet", cat="Крепёж: комплект для metal sheet (MS-L-Feet)", scope="unit_only",
      loc="национальные", unit="piece", our=1500, match="no_data", conf="none", nodata=True,
      inst="unknown", permit="unknown", note="Наш SKU — комплект крепления MS-L-Feet для metal sheet; рынок — алюминиевые рейки 3.2–4.8 м (490–960 THB/шт). Разные товары и единицы — NO_DATA."),
 dict(sku="mounting-cpac", cat="Крепёж: крюк CPAC", scope="unit_only", guard=True,
      loc="национальные", unit="piece", our=1800, match="equivalent", conf="low", nodata=False,
      inst="no", permit="no", note="Наша единица не подтверждена. Рынок — 87–120 THB/крюк (280 THB — старая цена 2015)."),
 dict(sku="combiner-box-dc-2string", cat="BOS: DC combiner 2 string", scope="unit_only",
      loc="национальные", unit="unit", our=4500, match="equivalent", conf="medium", nodata=False,
      inst="no", permit="no", note="Сравнение с DC/AC-DC 2-string боксами 2,580–5,885 THB."),
 dict(sku="smart-meter-huawei-1ph", cat="Мониторинг: Huawei 1 фаза (DDSU666-H)", scope="unit_only",
      loc="национальные", unit="unit", our=4900, match="exact", conf="high", nodata=False,
      inst="no", permit="no", note="Модель подтверждена — DDSU666-H. Рынок 1,814–4,100 THB."),
 dict(sku="smart-meter-goodwe-3ph", cat="Мониторинг: GoodWe 3 фазы (GM3000)", scope="unit_only",
      loc="—", unit="unit", our=8500, match="no_data", conf="none", nodata=True,
      inst="no", permit="no", note="Тайской публичной цены нет; только ЕС (€97–230) — иностранное, исключено."),
 dict(sku="solar-cable-4mm", cat="Кабель PV 4 мм²", scope="unit_only",
      loc="национальные", unit="roll", our=3500, match="equivalent", conf="low", nodata=False,
      inst="no", permit="no", note="Наш каталог — рулон 100 м; рынок — рулоны 100 м (LINK/BCC 2 190–2 600). 3 500 THB/рулон = +26%."),
 dict(sku="mc4-connector-set", cat="Коннекторы MC4 IP68", scope="unit_only", guard=True,
      loc="национальные", unit="set", our=500, match="equivalent", conf="low", nodata=False,
      inst="no", permit="no", note="Если 500 THB = 1 пара — завышение ~10×; если упаковка 10 пар — ≈50 THB/пара, т.е. MARKET."),
 dict(sku="jinko-715w-panel", cat="Панель Jinko 715 Вт N-type", scope="equipment_only",
      loc="национальные", unit="panel", our=4900, match="equivalent", conf="medium", nodata=False,
      inst="no", permit="no", note="Наша модель 54HL4R-V; на рынке 715 Вт — 66-cell (JKM715N-66HL5-BDV). 4,900 THB = 6.85 THB/Вт."),
 dict(sku="jinko-635w-panel", cat="Панель Jinko 635 Вт N-type", scope="equipment_only",
      loc="национальные", unit="panel", our=4200, match="equivalent", conf="medium", nodata=False,
      inst="no", permit="no", note="Наша 72HL4; рынок — 635 Вт 66/78-cell. 4,200 THB = 6.61 THB/Вт."),
 dict(sku="jinko-630w-panel", cat="Панель Jinko 630 Вт N-type", scope="equipment_only",
      loc="национальные", unit="panel", our=4100, match="equivalent", conf="medium", nodata=False,
      inst="no", permit="no", note="Наша 54HL4R; на рынке 630 Вт — 78-cell (JKM630N-78HL4-BDV). 4,100 THB = 6.51 THB/Вт."),
 dict(sku="goodwe-5kw-inverter", cat="Инвертор GoodWe 5 кВт 1 фаза", scope="equipment_only",
      loc="национальные", unit="unit", our=18000, match="equivalent", conf="low", nodata=False,
      inst="no", permit="no", note="GW5000-ET в 1-фазном исполнении не существует: ET — 3-фазная серия. Сравнение с GW5000-DNS-30 (on-grid, 15.9–18 тыс.) и GW5000-ES-20 (гибрид, 32 тыс.)."),
 dict(sku="goodwe-10kw-inverter", cat="Инвертор GoodWe 10 кВт 3 фазы", scope="equipment_only",
      loc="национальные", unit="unit", our=32000, match="equivalent", conf="low", nodata=False,
      inst="no", permit="no", note="Наша цена совпадает с on-grid GW10K-SDT-30 (34 тыс.), а не с гибридным GW10K-ET-20 (64 тыс.)."),
 dict(sku="huawei-100kw-inverter", cat="Инвертор Huawei 100 кВт", scope="equipment_only",
      loc="национальные", unit="unit", our=185000, match="exact", conf="high", nodata=False,
      inst="no", permit="no", note="SUN2000-100KTL-M1/M2: 160–241 тыс.; M1 — 199–241 тыс."),
 dict(sku="solaredge-100kw-inverter", cat="Инвертор SolarEdge SE100K", scope="equipment_only",
      loc="национальные", unit="unit", our=195000, match="exact", conf="high", nodata=False,
      inst="no", permit="no", note="Две тайские цены: 229,000 и 250,500."),
]

def norm(q):
    p = float(q["price"])
    if q["vat"] == "no":
        return p * 1.07
    return p

def median_for(sku, div=1):
    vals, used = [], []
    for q in QUOTES:
        if q["sku"] == sku and q.get("inc"):
            vals.append(norm(q)/div); used.append(q)
    if not vals:
        return None, [], 0
    return statistics.median(vals), used, len(vals)

rows = []
detail = []
for c in CFG:
    med, used, n = median_for(c["sku"], c.get("div",1))
    if med is None:
        lo = hi = medv = None
        pct = None
        verdict = "NO_DATA"
        if not c["nodata"]:
            c["nodata"] = True
    else:
        vals = sorted(norm(q)/c.get("div",1) for q in QUOTES if q["sku"] == c["sku"] and q.get("inc"))
        lo, hi, medv = vals[0], vals[-1], med
        pct = round((float(c["our"]) - med) / med * 100, 1)
        if c["nodata"] or c.get("guard") or n < 2:
            verdict = "NO_DATA"
        elif abs(pct) <= 15:
            verdict = "MARKET"
        elif pct > 15:
            verdict = "OVERPRICED"
        else:
            verdict = "UNDERPRICED"
    south = sum(1 for q in used if any(t in q["loc"] for t in ("Hat Yai","Phuket","Krabi","Surat","Trang","Satun","Nakhon","Songkhla")))
    detail.append((c["sku"], c["our"], medv, pct, verdict, n, c["conf"]))

    dec = 1 if c["unit"] == "W" else 0
    def fmt(x):
        return "" if x is None else f"{x:.{dec}f}"

    rows.append(dict(
        sku_id=c["sku"], category=c["cat"], market_scope=c["scope"], location=c["loc"],
        price_thb_low=fmt(lo), price_thb_median=fmt(medv), price_thb_high=fmt(hi),
        unit=c["unit"], vat_included="нормализовано к 7%" if med is not None else "",
        install_included=c["inst"], permit_included=c["permit"],
        match_type=c["match"], confidence=c["conf"],
        sources_n=n, sources_south=south,
        our_price_thb=fmt(float(c["our"])), our_vs_median_pct="" if pct is None else f"{pct:+.1f}",
        verdict=verdict, notes=c["note"],
    ))

# ---------------- write benchmark.csv ----------------
cols = ["sku_id","category","market_scope","location","price_thb_low","price_thb_median","price_thb_high",
        "unit","vat_included","install_included","permit_included","match_type","confidence",
        "our_price_thb","our_vs_median_pct","verdict","sources_n","sources_south","notes"]
with open("benchmark.csv","w",newline="",encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader()
    for r in rows: w.writerow(r)

# ---------------- write quotes.csv ----------------
qcols = ["sku_id","source_tier","source_name","source_url","source_date","retrieved_at","price_thb",
         "price_text","scope","location","vat_included","install_included","permit_included","warranty",
         "included_in_median","notes"]
with open("quotes.csv","w",newline="",encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=qcols); w.writeheader()
    for q in QUOTES + BOM_QUOTES:
        w.writerow(dict(sku_id=q["sku"], source_tier=q["tier"], source_name=q["name"], source_url=q["url"],
                        source_date=q["date"], retrieved_at=RETRIEVED, price_thb=q["price"],
                        price_text=q["text"], scope=q["scope"], location=q["loc"],
                        vat_included=q["vat"], install_included=q["inst"], permit_included=q["permit"],
                        warranty=q["warranty"], included_in_median=("yes" if q["inc"] else "no"),
                        notes=q["notes"]))

print(f"benchmark rows: {len(rows)} | quotes rows: {len(QUOTES)+len(BOM_QUOTES)}")
print(f"{'sku':34s}{'our':>12s}{'median':>12s}{'%':>8s}  {'verdict':12s} n conf")
for d in detail:
    sku, our, med, pct, v, n, conf = d
    print(f"{sku:34s}{our:12,.0f}{(med if med else 0):12,.1f}{(pct if pct is not None else 0):8.1f}  {v:12s} {n} {conf}")
