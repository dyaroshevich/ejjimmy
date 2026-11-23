/**
 * What the chat answered *from*.
 *
 * `getContext()` fetches up to twelve knowledge chunks and hands four of them to the model. Until now
 * the four were a string: once joined, nothing said which rows produced an answer, so "why did Tan
 * claim ฿120 000" was unanswerable after the fact. These helpers keep the handle on the rows — id,
 * title, chunk index, similarity — and give the log one compact line.
 *
 * Shape-defensive on purpose: `hybrid_search` and `match_knowledge` return different columns, and a
 * chunk's metadata is free-form, so every field is optional.
 */
export type Citation = {
  id: string | number | null;
  title: string | null;
  chunkIndex: number | null;
  similarity: number | null;
};

type Match = {
  id?: string | number | null;
  content?: unknown;
  similarity?: number | null;
  rank?: number | null;
  metadata?: { title?: unknown; chunk_index?: unknown; chunkIndex?: unknown } | null;
};

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const number = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function citationsFrom(matches: Match[] | null | undefined): Citation[] {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    id: m?.id ?? null,
    title: text(m?.metadata?.title),
    chunkIndex: number(m?.metadata?.chunk_index) ?? number(m?.metadata?.chunkIndex),
    similarity: number(m?.similarity) ?? number(m?.rank),
  }));
}

/** `12@0.83 · 41@0.71` — one line, safe to put in a log column. */
export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) return '';
  return citations
    .map((c) => {
      const id = c.id === null ? '?' : String(c.id);
      return c.similarity === null ? id : `${id}@${c.similarity.toFixed(2)}`;
    })
    .join(' · ');
}
