import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'ratelimit:chat',
});

export const chatStartRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: 'ratelimit:chat-start',
});

export const leadSubmitRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: 'ratelimit:lead',
});

export const adminAiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:admin-ai',
});

// `isRateLimited()` used to live here: a synchronous helper that always answered `success: true`,
// whatever it was passed, and never consulted Redis. Nothing called it, but it read like a limiter —
// a future route would have used it and believed the endpoint was protected. The real limit is
// `chatRatelimit.limit(ip)` in the routes themselves; the IP comes from `@/lib/client-ip`.

export function createRateLimitResponse(limit: number, window: string, remaining: number, reset: number) {
  const waitSeconds = Math.ceil((reset - Date.now()) / 1000);
  return {
    error: 'เกินขีดจำกัด',
    message: `ส่งข้อความเร็วเกินไป รอประมาณ ${waitSeconds} วินาที แล้วค่อยส่งใหม่นะครับ หรือกรอกแบบฟอร์มด้านล่างเพื่อให้ทีมงานติดต่อกลับ`,
    code: 'RATE_LIMIT_EXCEEDED',
    showContactForm: true,
    limit,
    window,
    remaining,
    reset: new Date(reset).toISOString(),
  };
}