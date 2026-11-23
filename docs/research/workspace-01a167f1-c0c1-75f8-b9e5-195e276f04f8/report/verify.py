# -*- coding: utf-8 -*-
import csv, os, re, collections

print("=== 1. ФАЙЛЫ НА ДИСКЕ ===")
need = ["REPORT.md", "README.md", "parts_market.csv", "system_expansion.csv",
        "lead_magnets.csv", "seo_pages.csv", "sources.csv"]
for f in need:
    ok = os.path.exists(f)
    size = os.path.getsize(f) if ok else 0
    print("  %s %-24s %7d байт" % ("OK " if ok else "НЕТ", f, size))


def load(f):
    return list(csv.DictReader(open(f, encoding="utf-8-sig")))


print("\n=== 2. КОЛИЧЕСТВО (порог ТЗ) ===")
for f, mn in [("parts_market.csv", 30), ("system_expansion.csv", 10),
              ("lead_magnets.csv", 15), ("seo_pages.csv", 20), ("sources.csv", 1)]:
    r = load(f)
    print("  %-24s %3d / min %-3s %s" % (f, len(r), mn, "OK" if len(r) >= mn else "FAIL"))

print("\n=== 3. ОБЯЗАТЕЛЬНЫЕ ПОЛЯ В КАЖДОЙ СТРОКЕ ===")
p = load("parts_market.csv")
miss = [(x["part_id"], [k for k in ("price_thb_median", "source_urls", "source_date", "unit", "confidence") if not x[k].strip()]) for x in p]
miss = [m for m in miss if m[1]]
print("  parts (цена/URL/дата/единица/confidence):", "все 64 заполнены" if not miss else miss)

s = load("seo_pages.csv")
miss2 = [(x["page_id"], [k for k in ("primary_keyword", "search_intent", "url_slug", "meta_description") if not x[k].strip()]) for x in s]
miss2 = [m for m in miss2 if m[1]]
print("  seo (ключ/интент/slug/meta):", "все 33 заполнены" if not miss2 else miss2)

l = load("lead_magnets.csv")
miss3 = [x["magnet_id"] for x in l if not x["cta"].strip() or not x["target_audience"].strip()]
print("  leads (CTA/аудитория):", "все 22 заполнены" if not miss3 else miss3)

y = load("system_expansion.csv")
miss4 = [x["opp_id"] for x in y if not x["market_evidence"].strip() or not x["bom_cost_thb"].strip()]
print("  systems (обоснование/BOM):", "все 15 заполнены" if not miss4 else miss4)

print("\n=== 4. ДУБЛИ И КАННИБАЛИЗАЦИЯ ===")
for f, key in [("parts_market.csv", "part_id"), ("seo_pages.csv", "url_slug"),
               ("seo_pages.csv", "primary_keyword")]:
    d = [k for k, v in collections.Counter(x[key] for x in load(f)).items() if v > 1]
    print("  %-20s дубли по %-16s: %s" % (f, key, d or "нет"))

print("\n=== 5. ВЫДУМАННЫЕ ОБЪЁМЫ ПОИСКА ===")
vol = collections.Counter(x["volume_th"] for x in s)
print("  volume_th:", dict(vol), "-> все n/a" if set(vol) == {"n/a"} else "-> ЕСТЬ ЧИСЛА")

print("\n=== 6. REPORT.md ===")
t = open("REPORT.md", encoding="utf-8").read()
w = len(re.findall(r"\w+", t))
print("  разделов '## ':", t.count("\n## "))
print("  слов:", w, "(~%d стр. при 450 сл./стр.)" % (w // 450))
print("  раздел 8 «Закрытые пробелы»:", "есть" if "## 8." in t else "НЕТ")
print("  раздел 9 «Непроверенное»:", "есть" if "## 9." in t else "НЕТ")

print("\n=== 7. ЯЗЫКИ SEO ===")
print(" ", dict(collections.Counter(x["lang"] for x in s)))

print("\n=== 8. ИТОГО В ПАПКЕ ===")
print(" ", sorted(f for f in os.listdir(".") if f.endswith((".csv", ".md"))))
