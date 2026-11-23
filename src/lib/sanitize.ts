/**
 * PII Sanitization Utility
 * Masks personally identifiable information before logging to DB
 */

export function sanitizePII(text: string, maxLength = 500): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, '[EMAIL]')
    .replace(/0[6-9]\d{1}[-\s]?\d{3}[-\s]?\d{4}/g, '[PHONE]')
    .replace(/[A-Za-z0-9_]{4,}(?:@line\.me)?/gi, (match) => {
      if (match.toLowerCase().includes('line') || /^[A-Za-z][A-Za-z0-9_]{3,19}$/.test(match)) {
        return '[LINE_ID]';
      }
      return match;
    })
    .replace(/(?:bearer|token|key|secret|password|passwd)["\s:=]+[^\s,"]+/gi, '[REDACTED]')
    .replace(/\d{16}[\d\s]*/g, '[CARD]')
    .replace(/(https?:\/\/[^\s]*[?&](?:token|key|session|auth)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
    .slice(0, maxLength);
}

export function sanitizeObject(obj: Record<string, any>, maxLength = 500): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizePII(value, maxLength);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map(v => typeof v === 'string' ? sanitizePII(v, maxLength) : v);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, any>, maxLength);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}