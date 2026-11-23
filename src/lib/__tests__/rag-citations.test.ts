import { citationsFrom, formatCitations } from '../rag-citations';

describe('rag citations', () => {
  it('reads the columns hybrid_search returns', () => {
    const [c] = citationsFrom([
      { id: 12, content: 'x', similarity: 0.834, metadata: { title: 'ราคาโซล่าเซลล์', chunk_index: 3 } },
    ]);
    expect(c).toEqual({ id: 12, title: 'ราคาโซล่าเซลล์', chunkIndex: 3, similarity: 0.834 });
  });

  it('survives rows without metadata or similarity', () => {
    expect(citationsFrom([{ id: 'abc' }, {}])).toEqual([
      { id: 'abc', title: null, chunkIndex: null, similarity: null },
      { id: null, title: null, chunkIndex: null, similarity: null },
    ]);
    expect(citationsFrom(undefined)).toEqual([]);
  });

  it('formats one log line, and nothing at all for no citations', () => {
    const c = citationsFrom([
      { id: 12, similarity: 0.834 },
      { id: 41, similarity: 0.7 },
      { id: 9 },
    ]);
    expect(formatCitations(c)).toBe('12@0.83 · 41@0.70 · 9');
    expect(formatCitations([])).toBe('');
  });
});
