import { siteUrl } from './site.config';

const THB_VIP = 100_000;   // ≥100k THB budget or ≥30 kW — flag as VIP
const KW_VIP = 30;

export function formatLead(lead: any): string {
  const vip =
    (lead.bill_amount ?? 0) >= THB_VIP || (lead.system_size ?? 0) >= KW_VIP
      ? `💼 <b>VIP LEAD</b>\n`
      : '';
  // One project serves both surfaces, so the link is the site's own origin. `ADMIN_SITE_URL` stays as an
  // escape hatch for a deployment that still splits them; without it the link no longer points at a
  // second domain that a franchisee does not own.
  const adminUrl = process.env.ADMIN_SITE_URL || siteUrl;
  return (
    `🆕 <b>New Lead</b>\n` +
    vip +
    `👤 ${lead.name || '—'}\n` +
    `📞 ${lead.phone || '—'}\n` +
    `📍 ${lead.location || '—'}\n` +
    `⚡ ${lead.system_size ? `${lead.system_size}kW` : 'Unknown'}\n` +
    `💰 ${lead.bill_amount ? `${lead.bill_amount} THB/mo` : '—'}\n` +
    `📦 ${lead.source || 'web'}\n` +
    `<a href="${adminUrl}/admin/leads/${lead.id}">Open in Admin</a>`
  );
}

export async function sendTelegramLead(lead: any) {
  await sendTelegram(formatLead(lead));
}

export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[TELEGRAM] env missing, skip: token=%s chatId=%s', Boolean(token), Boolean(chatId));
    return;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    if (!r.ok) console.error('[TELEGRAM] API %s: %s', r.status, (await r.text()).slice(0, 200));
  } catch (e) {
    console.error('[TELEGRAM] fetch error:', e);
  }
}
