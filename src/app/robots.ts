import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/site-server';

export default function robots(): MetadataRoute.Robots {
  // One robots route, three origins: the hostname decides which origin it advertises.
  const SITE = getSite().url;
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/liff', '/login', '/debug-env'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
