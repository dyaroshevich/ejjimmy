# -*- coding: utf-8 -*-
import csv, collections

rows = list(csv.DictReader(open("benchmark.csv", encoding="utf-8-sig")))
q = list(csv.DictReader(open("quotes.csv", encoding="utf-8-sig")))

turnkey = [r for r in rows if r["market_scope"] in ("installed_turnkey", "epc_thb_per_w")]
comp = [r for r in rows if r["market_scope"] in ("equipment_only", "unit_only")]
byv = collections.Counter(r["verdict"] for r in rows)

def n(sku):
    return int(next(r["sources_n"] for r in rows if r["sku_id"] == sku))

gaps = [
 dict(sku_id="smart-meter-goodwe-3ph", category="Мониторинг", gap_type="NO_PUBLIC_PRICE_TH",
      missing="Публичная тайская цена GoodWe GM3000 (3 фазы) — нет ни у одного тайского продавца",
      checked="2 поисковых запроса, тайские дилеры GoodWe, Priceza/BigGo/Shopee",
      consequence="Позиция каталога 8,500 THB не с чем сравнить; в бенчмарке NO_DATA",
      next_step="Запросить прайс у дистрибьютора GoodWe TH (вне рамок публичного веб-поиска)"),
 dict(sku_id="sigenergy-10kwh-16kwh-1phase", category="Гибрид 10 кВт / 15 кВт·ч, 1 фаза", gap_type="NO_PACKAGE",
      missing="Готовый пакет 10 кВт 1 фаза + 15 кВт·ч: публичных предложений нет",
      checked="сайты Sigenergy-дилеров (khlangsolar, solartech-center, r3, thaisolarsystem, SKE, comsys)",
      consequence="Позиция каталога 623,000 THB остаётся без рыночного ориентира",
      next_step="Собрать ориентир из модульных цен (EC 10.0 SP 81,600 + 1.5×BAT 10.0) — только как справка, не как рынок"),
 dict(sku_id="sigenergy-25kwh-30kwh-3phase", category="Гибрид 25 кВт / 30 кВт·ч, 3 фазы", gap_type="NO_PACKAGE",
      missing="Готовый пакет 25 кВт 3 фазы + 30 кВт·ч: публичных предложений нет",
      checked="те же дилеры Sigenergy + поиск «SigenStor 25 kW 30 kWh»",
      consequence="Позиция каталога 1,122,000 THB без ориентира",
      next_step="Собрать из EC 25.0 TP (123,500–132,145) + 3×BAT 10.0 (98,910–115,000) как справку"),
 dict(sku_id="BOM-sigen-gateway", category="BOS Sigenergy", gap_type="NO_STANDALONE_PRICE",
      missing="Отдельная публичная цена Sigen Gateway Home (TP 30K / C60)",
      checked="все дилеры Sigenergy; gateway встречается только внутри сетов",
      consequence="Наш BOM не содержит gateway — при сравнении с сетами конкурентов (370,000 THB за сет с gateway) разница занижена",
      next_step="Уточнить у поставщика; в расчётах помечать как «gateway не включён»"),
 dict(sku_id="BOM-goodwe-30kw-inverter", category="Инвертор 30 кВт", gap_type="MODEL_GAP",
      missing="GoodWe GW30K-MT в тайской рознице отсутствует (только ЕС, €968–4,580)",
      checked="тайские дилеры, Priceza, BigGo, Shopee, Lazada",
      consequence="Сравнение ведётся с GW30K-SDT-C30 (EQUIVALENT, другая серия)",
      next_step="Использовать SDT-C30 как референс, разницу серий указать в КП"),
 dict(sku_id="BOM-solaredge-optimizer", category="Оптимизатор", gap_type="MODEL_GAP",
      missing="SolarEdge P850 в Таиланде не публикуется (только ЕС €49–81); P950 — единственная тайская цена 2,750 THB (1 источник)",
      checked="R3 Solar Cell, Super Solar Z, тайские дилеры SolarEdge",
      consequence="Позиция каталога сравнивается с P950 по EQUIVALENT",
      next_step="Запросить прайс на P850 у дистрибьютора SolarEdge TH"),
 dict(sku_id="goodwe-5kw-1phase", category="Система 5 кВт, 1 фаза", gap_type="SOUTH_COVERAGE_WEAK",
      missing="Юг: только 1 южный источник (Hat Yai 149,000 excl VAT); Пхукет даёт лишь 3-фазный пакет 185,000, Крабі — без цен",
      checked="19energy (Krabi/Phuket/Phang Nga), ช่างโซล่าเซลล์ Phuket, kgsolar, ASP Solarcell (Surat Thani), поиск по Транг/Сатун/Накхон-си-тхаммарат",
      consequence="Южная медиана опирается на 1 компанию — риск смещения",
      next_step="Добавить 2–3 южных прайса (Krabi, Surat Thani) при следующем обновлении"),
 dict(sku_id="goodwe-20kw-3phase", category="Система 20 кВт, 3 фазы", gap_type="SOUTH_COVERAGE_NONE",
      missing="Ни одного южного публичного пакета 20 кВт; все 5 цен национальные",
      checked="Hat Yai/Phuket/Krabi/Phang Nga/Surat Thani/Trang/Satun",
      consequence="Южная премия для 20 кВт не измерена",
      next_step="Считать все 20 кВт-цены национальными; не позиционировать как южные"),
 dict(sku_id="goodwe-30kw-3phase", category="Система 30 кВт, 3 фазы", gap_type="SOUTH_COVERAGE_NONE",
      missing="Южных публичных цен 30 кВт нет (все 4 источника национальные)",
      checked="те же регионы + южные EPC-сайты",
      consequence="Сравнение только с национальным рынком",
      next_step="Помечать как национальный уровень; для юга запросить локальные КП"),
 dict(sku_id="ALL-epc-100kw-1mw", category="C&I 100 кВт–1 МВт", gap_type="EXCLUSIONS_UNSTATED",
      missing="Ни один источник не раскрывает, входят ли MV-трансформатор, КТП/switchgear, СМР, земля, grid upgrade",
      checked="saimaisolar, syconnext, siaminnovation, zeta, sgeenergy, capsolar, solarEdge TH, brighten-gen",
      consequence="EPC 18.0–26.3 THB/W (100 кВт–1 МВт); промо 14.9 THB/W (Zeta) относится к SolarEdge 100 кВт и не является EPC-базой",
      next_step="В КП всегда указывать 5 исключений; не использовать 14.9 THB/W (Zeta, SolarEdge) как базу для Huawei"),
 dict(sku_id="ALL-unit-ambiguous", category="BOS: MC4, крюк, крепёж", gap_type="UNIT_AMBIGUOUS",
      missing="Единица нашей позиции не подтверждена: MC4 — пара или упаковка, крюк CPAC — шт или упаковка, MS-L-Feet — комплект, тогда как рынок продаёт рейки",
      checked="PEA guide, Thai Watsadu, Shopee/Lazada, Energy-3E, SunTech, Champ Biz",
      consequence="MC4 (500 THB) и крюк CPAC (1,800 THB) в 10–17 раз выше рыночных 18–90/пара и 87–120/шт → NO_DATA; MS-L-Feet (1,500) — не рейка 490–960/шт → NO_DATA",
      next_step="Зафиксировать единицу: MC4 — пара, крюк — шт, MS-L-Feet — комплект; кабель уже подтверждён как рулон 100 м"),
 dict(sku_id="goodwe-5kw-inverter", category="Инвертор 5 кВт 1 фаза", gap_type="MODEL_GAP",
      missing="GoodWe GW5000-ET (модель из нашего BOM) в 1-фазном исполнении не найдена — серия ET публикуется как 3-фазная",
      checked="каталоги GoodWe, тайские дилеры, Priceza/BigGo",
      consequence="Для 5 кВт 1ф рынок есть только on-grid (GW5000-DNS-30, 15 900–18 000) и гибрид GW5000-ES-20 (32 000) — сравнение с гибридом даёт n=1",
      next_step="Заменить модель в BOM на GW5000-ES-20 или переклассифицировать SKU в on-grid"),
 dict(sku_id="ALL-jinko-model", category="Панели Jinko", gap_type="MODEL_MISMATCH",
      missing="Наши 54HL4R/72HL4 (54/72-cell) против рыночных 66/78-cell той же мощности",
      checked="тайские дилеры Jinko, Shopee/Lazada, Energy-3E",
      consequence="Сравнение по THB/Вт корректно, по модели — EQUIVALENT",
      next_step="Сравнивать в THB/Вт; указывать разницу ячеек в КП"),
 dict(sku_id="ALL-geo-coverage", category="География", gap_type="GEO_MISMATCH",
      missing="Bangkok/Surat Thani/Krabi/Phang Nga/Trang/Satun/Nakhon Si Thammarat не дали ни одной публичной цены пакета",
      checked="19energy (Krabi, Phuket, Phang Nga), ASP Solarcell (Surat Thani), локальные FB/LINE-страницы",
      consequence="Юг представлен 2 компаниями (Hat Yai, Phuket) — этого мало для южной медианы",
      next_step="Южные цены помечены как локальные только там, где компания и монтаж в регионе"),
]

with open("gaps.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["sku_id","category","gap_type","missing","checked","consequence","next_step"])
    w.writeheader()
    for g in gaps: w.writerow(g)
print("gaps.csv:", len(gaps))
