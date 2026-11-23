import { getSite } from '@/lib/site-server';
import { adminManifest } from '@/lib/manifest';

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(adminManifest(getSite()), {
    headers: { 'content-type': 'application/manifest+json' },
  });
}
