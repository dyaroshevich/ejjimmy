# Admin audit — 2026-11-10

## Scope
`/admin` shell + `/admin/content` (TawanPost) factory. Goal: keep full admin on
Solar 1 Krabi, minimum on Tawan Power, mini/simplified interface in the template.

## Real vs mock (measured by `/api/` + `supabase` usage per page)

### Real (data-backed) — keep
- `/admin` dashboard — leads from Supabase `leads`
- `/admin/leads`, `/admin/leads/[id]` — Supabase `leads`
- `/admin/products`, `/admin/products/[id]`, `/edit`, `/new` — Supabase `solar_products`
- `/admin/content/posts` (+ new/edit) — `/api/blog`
- `/admin/super` — AI config, knowledge, chat hub, health, notifications, quiz (dynamic tabs)

### Mock (hardcoded data, no backend) — simplified out of nav
- `/admin/content` overview — fake stats/activity/top posts
- `/admin/content/calendar`, `/pipeline`, `/research` — no API
- `/admin/content/generator`, `/library` — no API
- `/admin/content/publishing`, `/analytics`, `/distribution` — no API
- `/admin/content/franchises`, `/settings` — no API

## Changes made (template)
- `ContentClientLayout`: nav collapsed from 5 groups/10 entries to Overview + Posts.
  Removed franchise dropdown (hardcoded 3 franchises) and mock notification bell.
- `AdminClientLayout`: "TawanPost" → "Content".
- Mock pages left in place (routes still resolve) — functionality preserved, interface simplified.

## Recommendation
- Template: keep this mini nav. Full content factory lives on Solar 1 Krabi deployment.
- Tawan Power: same minimal nav; the mock pages can be deleted once Solar 1 Krabi's full admin is confirmed the source of truth.
- Next: wire `/admin/content/posts` to a real editor flow; delete mock pages if unused for 1 release cycle.