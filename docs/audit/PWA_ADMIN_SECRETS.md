# PWA Admin Secrets

Add these to your `.env.production` and local `.env.local` on Vercel:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMOvp5mdoVJtKnCBcFX72VO23TXLM0xGIltKi5GTjEh8jDS7TLPxxgW9Ba6hjr27K5jVhLYgJz7cJl8R_c4ZBMo
VAPID_PRIVATE_KEY=CtWECd4rBXDsF9SZO8meTaI17cu5nim7JVDxfgk5zCo
VAPID_SUBJECT=mailto:violstam23@gmail.com
```

**Status**:
- [x] Branch `feat/pwa-admin-evolution` created.
- [x] DB Migration applied (Leads updated, Push table created, RLS enabled).
- [x] Dependencies installed (web-push, supabase/ssr).
- [x] Middleware created for /admin protection.
