import type { Metadata, Viewport } from "next";
import { Manrope, Prompt } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// Brand tokens (palette + type pair) from brand.json. Imported after globals on purpose: it
// overrides the approved sheet's values, so changing a colour is a config edit, not a CSS edit.
import "./brand.generated.css";
import PWAUpdateHandler from "@/components/PWAUpdateHandler";
import LineStyleAdapter from "@/components/LineStyleAdapter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { Toaster } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { ogLocaleFor } from '@/i18n';
import { localeHref, languageAlternates } from '@/lib/locale-path';
import { themeCss } from '@/lib/site.config';
import { getSite } from '@/lib/site-server';
import { SiteProvider } from '@/lib/site-context';
import { headers } from 'next/headers';
// Pair 08 (Manrope + Prompt): Manrope draws Latin, Latin-Ext, Cyrillic and Vietnamese
// (geometric grotesque, 200-800); Prompt draws Thai (loopless, geometric, up to 900 so Thai
// headings keep their weight). CJK still resolves through system-ui, so each OS picks its
// locale-correct face.
const text = Manrope({ subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "vietnamese"], weight: ["400", "500", "600", "700", "800"], variable: "--font-text", display: "swap" });
const thai = Prompt({ subsets: ["latin", "thai"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-thai", display: "swap" });
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export async function generateMetadata(): Promise<Metadata> {
  // The admin shell has its own metadata in `app/admin/layout.tsx` (Thai-first, `noindex`, its own
  // manifest), so this function describes the storefront only — it used to branch on NEXT_PUBLIC_APP_MODE,
  // which is what forced the second Vercel project.
  const t = await getTranslations('meta');
  const locale = await getLocale();
  // Canonical, OG and the brand all follow the hostname: three storefronts, one deployment.
  const site = getSite();
  // The middleware rewrote a prefixed URL back to its real path; canonical and hreflang need both.
  const path = headers().get('x-pathname') || '/';
  return {
    metadataBase: new URL(site.url),
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: localeHref(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleFor(locale),
      url: localeHref(locale, path),
      siteName: site.brand.name,
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: site.brand.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: site.brand.social.twitter,
      creator: site.brand.social.twitter,
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF7ED" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const tBrand = await getTranslations('header');
  const site = getSite();
  const appName = `${tBrand('brandTop')} (${site.brand.name})`;
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* The site's own brand variables, after `brand.generated.css`. `html:root` / `html.dark`
            outrank the generated sheet on specificity, so load order never decides a colour. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss(site) }} />
        <meta name="application-name" content={appName} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${text.variable} ${thai.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LineStyleAdapter />
          <JsonLd />
          <Toaster position="top-center" richColors closeButton />
          <NextIntlClientProvider messages={messages}>
            <SiteProvider site={site}>
              <PWAUpdateHandler />
              <AppShell>{children}</AppShell>
            </SiteProvider>
          </NextIntlClientProvider>
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
