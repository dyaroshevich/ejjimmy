import Hashids from 'hashids';

/**
 * Hashids utility for encoding/decoding proposal IDs
 * 
 * Creates non-guessable URLs: 377 → "jR3kD9"
 * Reversible: "jR3kD9" → 377
 * No database changes needed
 */
const SALT = process.env.HASHIDS_SALT || 'ejjimmy-fallback-salt-change-me';
const FALLBACK_SALT = 'ejjimmy-fallback-salt-change-me';

if (SALT === FALLBACK_SALT && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn('SECURITY WARNING: Using default Hashids salt in production. Set HASHIDS_SALT environment variable.');
}

const hasher = new Hashids(SALT, 10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
const fallbackHasher = new Hashids(FALLBACK_SALT, 10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');

/**
 * Encodes a numeric ID to a short, non-guessable hash
 * @param id - Numeric ID to encode
 * @returns Hash string (e.g., "jR3kD9")
 */
export function encodeId(id: number | string): string {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) return hasher.encode(parsed);
    // If it's already a hash or non-numeric string, we can't easily re-encode it
    // but for now we'll just return it as is or try to encode it as a string
    return hasher.encode(id);
  }
  return hasher.encode(id);
}

/**
 * Decodes a hash back to the numeric ID
 * @param hash - Hash string (e.g., "jR3kD9")
 * @returns Decoded numeric ID or null if invalid
 */
export function decodeId(hash: string): number | null {
  if (!hash) return null;
  
  try {
    // 1. Try with primary salt
    let decoded = hasher.decode(hash);
    if (decoded.length > 0) {
      return decoded[0] as number;
    }

    // 2. Try with fallback salt if primary failed
    if (SALT !== FALLBACK_SALT) {
      decoded = fallbackHasher.decode(hash);
      if (decoded.length > 0) {
        return decoded[0] as number;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validates if a hash is valid
 * @param hash - Hash string to validate
 * @returns True if valid, false otherwise
 */
export function isValidHash(hash: string): boolean {
  return decodeId(hash) !== null;
}
