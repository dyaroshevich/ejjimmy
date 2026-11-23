/**
 * Retry a call that talks to a rate-limited API.
 *
 * The embedding functions run from a database trigger (`pg_net`), fire-and-forget: a 429 from
 * Google's quota or a 503 while the model is redeploying is not seen by anyone and the row simply
 * stays without an embedding — the chat then answers from less context, silently. Three retries with
 * doubling delay cover the transient half of that; the permanent half (bad key, malformed input) is
 * not retried, because four attempts at a request that can never succeed only delays the log line.
 */

const PERMANENT = /API key|permission|INVALID_ARGUMENT|invalid argument|\b400\b|not found/i;

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 4,
  baseMs = 600,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts || PERMANENT.test(message)) break;

      const wait = baseMs * 2 ** (attempt - 1);
      console.warn(`[retry] ${label} failed (${message}); attempt ${attempt}/${attempts}, waiting ${wait}ms`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  throw lastError;
}
