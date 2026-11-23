/**
 * LINE Webhook Endpoint
 * Handles: message, postback, follow, unfollow events
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  handleFollow,
  handleUnfollow,
  handlePostback,
  handleTextMessage,
  parseLineLeadData,
  handleLeadSubmission
} from '@/lib/line-handlers';
import { getUserContext } from '@/lib/line-context';
import { siteUrl } from '@/lib/site.config';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';

const processedEvents = new Map<string, number>();

function isEventProcessed(eventId: string): boolean {
  const now = Date.now();
  if (processedEvents.has(eventId)) {
    const timestamp = processedEvents.get(eventId)!;
    if (now - timestamp > 300000) {
      processedEvents.delete(eventId);
      return false;
    }
    return true;
  }
  processedEvents.set(eventId, now);
  if (processedEvents.size > 1000) {
    const cutoff = now - 300000;
    for (const [key, val] of processedEvents) {
      if (val < cutoff) processedEvents.delete(key);
    }
  }
  return false;
}

function verifyLineSignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error('[LINE] CRITICAL: LINE_CHANNEL_SECRET is not set');
    return false;
  }

  if (!signature) {
    console.error('[LINE] No signature found in headers');
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', LINE_CHANNEL_SECRET);
    hmac.update(body, 'utf8');
    const digest = hmac.digest('base64');

    if (signature.length !== digest.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    console.error('[LINE] Signature verification error:', error);
    return false;
  }
}

interface LineEvent {
  type: string;
  mode: string;
  timestamp: number;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  webhookEventId?: string;
  deliveryContext?: { isRedelivery: boolean };
  message?: {
    type: string;
    id: string;
    text?: string;
    content?: string;
  };
  postback?: {
    data: string;
    params?: any;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    console.log('[LINE] ===== INCOMING REQUEST =====');
    console.log('[LINE] Has signature:', !!signature, '| Has body:', body.length > 0);
    console.log('[LINE] Body preview:', body.substring(0, 200));
    console.log('[LINE] ===== END INCOMING =====');

    const events: LineEvent[] = JSON.parse(body).events || [];
    if (events.length === 0) {
      console.log('[LINE] No events in body');
      return NextResponse.json({ success: true });
    }

    const firstEvent = events[0];
    console.log('[LINE] First event type:', firstEvent.type, '| userId:', firstEvent.source?.userId);
    console.log('[LINE] Message text:', firstEvent.message?.text?.substring(0, 100));
    console.log('[LINE] Postback data:', firstEvent.postback?.data);

    if (!LINE_CHANNEL_SECRET) {
      console.error('[LINE] CRITICAL: LINE_CHANNEL_SECRET is not set!');
      return NextResponse.json({ error: 'No secret configured' }, { status: 500 });
    }

    if (!signature) {
      console.error('[LINE] No signature - REJECTING (no bypass in production)');
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    const verifyResult = verifyLineSignature(body, signature);
    console.log('[LINE] Signature verification:', verifyResult);
    if (!verifyResult) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('[LINE] Signature OK - processing events');

    for (const event of events) {
      const userId = event.source?.userId || '';
      const replyToken = event.replyToken || '';
      const eventType = event.type;

      console.log('[LINE] ===== WEBHOOK EVENT =====');
      console.log('[LINE] Type:', eventType, '| User:', userId, '| HasToken:', !!replyToken);
      console.log('[LINE] Message:', event.message?.type, '| Text:', event.message?.text?.substring(0, 50));
      console.log('[LINE] Postback data:', event.postback?.data);
      console.log('[LINE] ===== END EVENT =====');

      if (!userId) continue;
      if (eventType !== 'postback' && !replyToken) continue;

      const webhookEventId = event.webhookEventId;
      if (webhookEventId && isEventProcessed(webhookEventId)) {
        console.log('[LINE] Skipping duplicate event:', webhookEventId);
        continue;
      }

      try {
        switch (event.type) {
          case 'follow':
            await handleFollow(userId, replyToken);
            break;

          case 'unfollow':
            await handleUnfollow(userId);
            break;

case 'postback': {
  const data = event.postback?.data || '';
  const params = event.postback?.params || {};
  await handlePostback(userId, replyToken, data, params);
  break;
}

case 'message': {
  if (event.message?.type === 'text') {
    const text = event.message.text || '';
    const context = await getUserContext(userId);

    if (context?.state === 'lead_form') {
      await handleLeadSubmission(userId, replyToken, text);
    } else {
      await handleTextMessage(userId, replyToken, text);
    }
  } else if (event.message?.type === 'location') {
    const { handleLocationMessage } = await import('@/lib/line-handlers');
    await handleLocationMessage(userId, replyToken, event.message as any);
  } else if (event.message?.type === 'audio' || event.message?.type === 'image') {
    await handleTextMessage(userId, replyToken, 'ส่งรูป/เสียงมาเลยครับ ผมยังไม่เข้าใจ ลองพิมพ์ข้อความแทนนะครับ 🙏');
  }
  break;
}
          default:
            console.log('[LINE] Unknown event type:', event.type);
        }
      } catch (error) {
        console.error(`[LINE] Error handling event ${event.type}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE] Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const LINE_API_BASE = 'https://api.line.me/v2/bot/channel/webhook/endpoint';
  const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const WEBHOOK_URL = `${siteUrl}/api/line-webhook`;

  let currentWebhook = 'unknown';

  try {
    const resp = await fetch(LINE_API_BASE, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${LINE_ACCESS_TOKEN}` }
    });
    const data = await resp.json();
    currentWebhook = data.webhookEndpoint || 'not set in LINE API';
  } catch (e) {
    currentWebhook = 'error: ' + (e as Error).message;
  }

  if (currentWebhook !== WEBHOOK_URL && currentWebhook !== 'not set in LINE API') {
    try {
      const setResp = await fetch(LINE_API_BASE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: WEBHOOK_URL })
      });
      const setData = await setResp.json();
      currentWebhook = `updated to ${WEBHOOK_URL}: ${JSON.stringify(setData)}`;
    } catch (e) {
      currentWebhook = 'update error: ' + (e as Error).message;
    }
  } else if (currentWebhook === 'not set in LINE API') {
    try {
      const setResp = await fetch(LINE_API_BASE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: WEBHOOK_URL })
      });
      const setData = await setResp.json();
      currentWebhook = `set to ${WEBHOOK_URL}: ${setResp.status} ${JSON.stringify(setData)}`;
    } catch (e) {
      currentWebhook = 'set error: ' + (e as Error).message;
    }
  }

  return NextResponse.json({
    status: 'LINE Webhook endpoint',
    currentWebhook,
    targetWebhook: WEBHOOK_URL,
    timestamp: new Date().toISOString()
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const WEBHOOK_URL = `${siteUrl}/api/line-webhook`;
    const LINE_API_BASE = 'https://api.line.me/v2/bot/channel/webhook/endpoint';
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    const response = await fetch(LINE_API_BASE, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint: WEBHOOK_URL })
    });

    const result = await response.text();
    console.log('[LINE] Webhook URL set response:', result);

    return NextResponse.json({ success: true, result: JSON.parse(result) });
  } catch (error: any) {
    console.error('[LINE] Webhook URL set error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}