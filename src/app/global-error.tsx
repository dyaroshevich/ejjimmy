'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    } else {
      console.error('[GlobalError] Sentry not initialized:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  );
}
