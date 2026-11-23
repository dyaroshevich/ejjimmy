import { submitLead } from './lead-manager';
import { sendTelegramLead } from './telegram';

export async function extractAndEnrichLead(text: string, sessionId?: string, lineId?: string) {
  const extractRegex = /\[AI_LEAD:([\s\S]*?)\]/g;
  const match = extractRegex.exec(text);
  
  if (!match) return text.replace(extractRegex, '').replace(/\[ACTION:GENERATE_PDF\]/g, '').trim();

  const metadataStr = match[1];
  const cleanedText = text.replace(extractRegex, '').trim();
  
  const updates: any = {};

  metadataStr.split(',').forEach(part => {
    const [key, value] = part.split('=').map(s => s.trim());
    if (!key || !value) return;

    switch (key.toLowerCase()) {
      case 'power':
        updates.system_size = parseFloat(value);
        break;
      case 'location':
        updates.location = value;
        break;
      case 'bill':
        updates.bill_amount = parseFloat(value);
        break;
      case 'type':
        updates.equipment_tier = value;
        break;
    }
  });

  if (Object.keys(updates).length > 0) {
    try {
      // Use the unified lead manager for upsert/enrichment
      const result = await submitLead({
        ...updates,
        line_id: lineId || null,
        notes: `AI Auto-Enrichment from Chat`,
        source: lineId ? 'line' : 'chat',
        status: 'New (AI)'
      });

      // notifyAdminNewLead uses a relative fetch, which silently dies when called
      // server-side (this module only runs in /api/chat*), so chat leads never
      // reached any admin channel. New leads get Telegram directly.
      if (result?.lead && result.isNew) {
        await sendTelegramLead(result.lead);
      }

      console.log(`[LeadEnrich] Enriched lead via submitLead for ${lineId || sessionId} (isNew=${result?.isNew})`);
    } catch (err) {
      console.error('[LeadEnrich] Enrichment failed:', err);
    }
  }

  return cleanedText.replace(/\[ACTION:GENERATE_PDF\]/g, '').trim();
}
