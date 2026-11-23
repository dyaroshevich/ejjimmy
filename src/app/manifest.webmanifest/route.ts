import { getSite } from '@/lib/site-server';
import { publicManifest } from '@/lib/manifest';

// The host decides the brand, so this cannot be prerendered once for the whole deployment.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(publicManifest(getSite()), {
    headers: { 'content-type': 'application/manifest+json' },
  });
}
