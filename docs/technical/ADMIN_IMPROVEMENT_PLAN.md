# Tawan Power: Admin & Dashboard Evolution Plan

## 1. Current State Overview
The Tawan Power admin panel is a robust, real-time management system built with Next.js and Supabase.

### Core Features:
- **Emerald Noir Design:** A custom, high-contrast dark theme optimized for visibility.
- **Real-time Leads:** Dashboard updates instantly when new leads arrive.
- **AI Orchestration:** Integrated tools for managing RAG knowledge base and AI behavior.
- **PWA Ready:** Includes service worker support and push notifications.

---

## 2. Priority Task: Lead Deduplication (Lead Enrichment)
**Problem:** Frequent testing and multiple interactions create duplicate lead entries for the same person, cluttering the dashboard and triggering excessive notifications.

### Proposed Strategy:
Instead of a simple "Create" action, implement a **"Upsert/Enrich"** logic:
1. **Identify:** Look for existing leads based on a unique identifier (Phone, Email, or potentially a Session/Device ID).
2. **Merge:** If a lead exists, update the record with new information (e.g., additional chat messages, updated bill amount) instead of creating a new row.
3. **Notify Smartly:** Only trigger a "New Lead" notification if it's a truly new contact. For existing leads, trigger an "Updated Lead" notification if significant new info is added.
4. **Safety:** Ensure no data is lost during merging by appending notes or maintaining a history field.

---

## 3. Future Enhancements
- **CRM Pipeline:** Status transitions (New -> Contacted -> Proposal -> Closed).
- **AI Summaries:** Use AI to summarize chat logs for quick reading in the dashboard.
- **Analytics:** Visual charts for lead trends and product interest.
- **Audit Logs:** Track changes made by administrators.
- **Export:** CSV/Excel export for external processing.
