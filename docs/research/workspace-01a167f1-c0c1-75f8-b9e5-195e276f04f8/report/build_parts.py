# -*- coding: utf-8 -*-
"""Собирает report/parts_market.csv (25 колонок, UTF-8, QUOTE_ALL)."""
import csv
import importlib
import sys

import parts_data

importlib.reload(parts_data)

COLS = [
    "part_id", "category", "brand", "model", "spec", "unit",
    "price_thb_min", "price_thb_median", "price_thb_max",
    "price_type", "vat_included", "moq", "warranty_months",
    "availability", "supplier", "source_count", "source_urls", "source_date",
    "demand_signal", "demand_score_1_5", "competition_score_1_5",
    "fit_score_1_5", "priority", "notes", "confidence",
]

rows = []
for p in parts_data.P:
    rows.append({c: p[c] for c in COLS})

# порядок: сначала по категории (как в таксономии), внутри — по приоритету
CAT_ORDER = ["Панель", "Инвертор", "Батарея", "BOS", "Крепёж", "Кабель", "EV-зарядка", "Пумпа"]
rows.sort(key=lambda r: (CAT_ORDER.index(r["category"]), -r["priority"]))

with open("parts_market.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=COLS, quoting=csv.QUOTE_ALL)
    w.writeheader()
    w.writerows(rows)

print("parts_market.csv rows:", len(rows))
from collections import Counter
print(Counter(r["category"] for r in rows))
print("confidence:", Counter(r["confidence"] for r in rows))
