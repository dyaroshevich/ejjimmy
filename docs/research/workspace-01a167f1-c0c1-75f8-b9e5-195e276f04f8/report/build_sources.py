# -*- coding: utf-8 -*-
import csv
from sources_data import S

cols = ["source_id", "workstream", "title", "url", "publisher", "source_type",
        "published_date", "retrieved_date", "language", "quote", "used_for",
        "reliability", "notes"]

with open("sources.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_ALL)
    w.writeheader()
    for r in S:
        w.writerow({k: r.get(k, "") for k in cols})

print("sources:", len(S))
