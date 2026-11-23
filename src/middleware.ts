import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/supabase'
import { splitLocale, DEFAULT_LOCALE, LOCALES } from './lib/locale-path'
import { HERO_COOKIE, activeHeroVariant, pickHeroVariant } from './lib/hero-variants'
import { resolveAccess } from './lib/access'

export async function middleware(req: NextRequest) {
  // `/en/blog/x` is served by `/blog/x`; the prefix decides the language, so it wins over the cookie.
  const { locale, path } = splitLocale(req.nextUrl.pathname)
  // `/th/...` is the same page as `/...`; one 308 keeps the default prefix out of the index.
  if (locale === DEFAULT_LOCALE) {
    return NextResponse.redirect(new URL(path + req.nextUrl.search, req.url), 308)
  }
  // An unprefixed path is Thai for every visitor (one URL, one language for the index); only the
  // root honours the cookie, so a returning English visitor still lands on `/en`.
  if (!locale && path === '/') {
    const preferred = req.cookies.get('NEXT_LOCALE')?.value
    if (preferred && preferred !== DEFAULT_LOCALE && LOCALES.includes(preferred)) {
      return NextResponse.redirect(new URL(`/${preferred}${req.nextUrl.search}`, req.url), 307)
    }
  }

  // A/B hero: one variant per visitor. Assigning it here (not in the page) lets the same request
  // render it on the server, so the headline never swaps after hydration.
  const heroCookie = req.cookies.get(HERO_COOKIE)?.value
  const heroId = activeHeroVariant(heroCookie) ?? pickHeroVariant()

  try {
    // One deployment serves both the storefront and the staff shell. `/admin` used to be a 404 here in
    // PUBLIC mode because it lived on a second Vercel project; the split is gone, and the session check
    // below is what protects the path — not the absence of a route. Do not reintroduce a second project:
    // it splits the cookie domain, the sitemap and the brand config in three places.
    const cookieHeader = req.headers.get('cookie') || ''

    const getCookie = (name: string) => {
      const nextCookie = req.cookies.get(name)?.value
      if (nextCookie) return nextCookie
      const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'))
      if (match) return match[2]
      return undefined
    }

    // 3. Create response — forward request headers so downstream handlers see cookies
    const headers = new Headers(req.headers)
    // No prefix means Thai: the URL decides the language, never the browser's header list.
    headers.set('x-locale', locale || DEFAULT_LOCALE)
    if (locale) {
      const existing = headers.get('cookie')
      headers.set('cookie', `${existing ? existing + '; ' : ''}NEXT_LOCALE=${locale}`)
    }
    headers.set('x-pathname', path)
    if (heroId !== heroCookie) {
      const cookie = headers.get('cookie')
      headers.set('cookie', `${cookie ? cookie + '; ' : ''}${HERO_COOKIE}=${heroId}`)
    }

    const res = locale
      ? NextResponse.rewrite(new URL(path + req.nextUrl.search, req.url), { request: { headers } })
      : NextResponse.next({ request: { headers } })
    if (locale) {
      res.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000, sameSite: 'lax' })
    }
    if (heroId !== heroCookie) {
      res.cookies.set(HERO_COOKIE, heroId, { path: '/', maxAge: 31536000, sameSite: 'lax' })
    }

    // Create Supabase client
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return getCookie(name)
          },
          set(name: string, value: string, options: CookieOptions) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            res.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Both staff areas ask `resolveAccess` the same question, so the middleware can no longer allow
    // something `/login` would not send the user to (or deny something it would).
    if (path.startsWith('/admin') || path.startsWith('/partner')) {
      const { data: { user } } = await supabase.auth.getUser()
      const decision = resolveAccess(path, user?.app_metadata?.role)

      if (decision.action !== 'allow') {
        const target = decision.action === 'redirect' ? decision.to : '/login'
        const redirectRes = NextResponse.redirect(new URL(target, req.url))
        // Carry the refreshed session cookies onto the redirect, or the browser keeps the stale token
        // and the next request re-runs the same denial.
        res.cookies.getAll().forEach(c => {
          redirectRes.cookies.set(c)
        })
        return redirectRes
      }
    }

    return res
  } catch (err) {
    // On auth error, deny access instead of silently passing through
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (path.startsWith('/partner') || path.startsWith('/api/partner')) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/api/admin/:path*',
    '/api/partner/:path*'
  ]
}
