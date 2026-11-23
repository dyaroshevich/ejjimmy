import type { SeoBlock, SeoPage } from '@/lib/seo-pages';

import { InlineMarkup } from './InlineMarkup';

/**
 * The one renderer for every page in `content/pages`.
 *
 * The classes are the ones the twelve hand-written pages already used, moved out of their JSX and
 * into four constants: the prose article, the orange overline, the bordered CTA card, and the two
 * table skins. They are here rather than in the data on purpose — a content file says *what* the
 * page says, `globals.css` and Tailwind say how a paragraph looks, and a client changing the wording
 * should not be able to break the type scale.
 */

const ARTICLE =
  'prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-black prose-headings:tracking-tight prose-a:text-orange-600 dark:prose-a:text-orange-400';
const KICKER = 'not-prose text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-3';
const CALLOUT = 'not-prose mt-10 rounded-xl border border-slate-200 p-6 dark:border-slate-800';

function Cells({ row, head }: { row: string[]; head?: boolean }) {
  return (
    <>
      {row.map((cell, i) =>
        head ? (
          <th key={i}>
            <InlineMarkup text={cell} />
          </th>
        ) : (
          <td key={i}>
            <InlineMarkup text={cell} />
          </td>
        ),
      )}
    </>
  );
}

/**
 * The bordered skin: `w-full text-sm` inside a `not-prose` scroll box, every column but the last
 * carrying `pr-4`, the first body cell in semibold, and a row that ends a block set in black.
 */
function CardTable({ block }: { block: Extract<SeoBlock, { t: 'table' }> }) {
  const { head, rows, strong = [], edge = [] } = block;
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {head.map((row, r) => (
            <tr key={r} className="border-b border-slate-300 text-left dark:border-slate-700">
              {row.map((cell, i) => (
                <th key={i} className={`py-2${i === row.length - 1 ? '' : ' pr-4'}`}>
                  <InlineMarkup text={cell} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row, r) => {
            const rule = edge[r] ?? (r === rows.length - 1 ? 'none' : 'soft');
            const rowClass = [
              rule === 'strong'
                ? 'border-b border-slate-300 dark:border-slate-700'
                : rule === 'soft'
                  ? 'border-b border-slate-200 dark:border-slate-800'
                  : '',
              strong[r] ? 'font-black' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <tr key={r} className={rowClass || undefined}>
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`py-2${i === row.length - 1 ? '' : ' pr-4'}${
                      i === 0 && !strong[r] ? ' font-semibold' : ''
                    }`}
                  >
                    <InlineMarkup text={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The plain skin: a bare `<table>` that the prose rule styles. */
function ProseTable({ block }: { block: Extract<SeoBlock, { t: 'table' }> }) {
  return (
    <table>
      {block.head.length > 0 && (
        <thead>
          {block.head.map((row, r) => (
            <tr key={r}>
              <Cells row={row} head />
            </tr>
          ))}
        </thead>
      )}
      <tbody>
        {block.rows.map((row, r) => (
          <tr key={r}>
            <Cells row={row} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Block({ block }: { block: SeoBlock }) {
  switch (block.t) {
    case 'kicker':
      return (
        <p className={KICKER}>
          <InlineMarkup text={block.v} />
        </p>
      );
    case 'callout':
      return (
        <p className={CALLOUT}>
          <InlineMarkup text={block.v} />
        </p>
      );
    case 'h1':
      return (
        <h1>
          <InlineMarkup text={block.v} />
        </h1>
      );
    case 'h2':
      return (
        <h2>
          <InlineMarkup text={block.v} />
        </h2>
      );
    case 'h3':
      return (
        <h3>
          <InlineMarkup text={block.v} />
        </h3>
      );
    case 'h4':
      return (
        <h4>
          <InlineMarkup text={block.v} />
        </h4>
      );
    case 'p':
      return (
        <p>
          <InlineMarkup text={block.v} />
        </p>
      );
    case 'ul':
      return (
        <ul>
          {block.v.map((item, i) => (
            <li key={i}>
              <InlineMarkup text={item} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol>
          {block.v.map((item, i) => (
            <li key={i}>
              <InlineMarkup text={item} />
            </li>
          ))}
        </ol>
      );
    case 'table':
      return block.v === 'card' ? <CardTable block={block} /> : <ProseTable block={block} />;
    case 'section':
      return (
        <section lang={block.lang}>
          {block.blocks.map((inner, i) => (
            <Block key={i} block={inner} />
          ))}
        </section>
      );
    case 'hr':
      return <hr />;
  }
}

export function SeoArticle({ page }: { page: SeoPage }) {
  const body = (
    <article lang={page.lang} className={page.frame === 'padded' ? `${ARTICLE} px-6 pb-24 pt-32` : ARTICLE}>
      {page.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </article>
  );

  // `padded` is the original page: the gutter and the vertical rhythm sit on the article, and the
  // page paints nothing of its own. `wrapped` adds the white box the other six opened with.
  if (page.frame === 'padded') return body;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="pt-32 pb-24 px-6">{body}</div>
    </div>
  );
}
