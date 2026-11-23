import Link from 'next/link';
import type { ReactNode } from 'react';

import { contact } from '@/lib/site.config';

/**
 * The inline half of the `content/pages` vocabulary — four marks, no HTML in the data:
 *
 *   `**bold**`   `_italic_`   `` `code` ``   `[label](href)`
 *
 * and a bare newline, which renders as `<br />` because the source pages used `<br />` inside their
 * CTA cards. An `href` of `@line` means "the LINE chat", read from `site.config.ts`, so the twelve
 * content files carry neither an account handle nor a URL — and the three LINE anchors that sit
 * inside a `<strong>` on the old pages keep their `!text-inherit` treatment, which is why the link
 * class lives here and not in the content.
 *
 * Nesting works both ways (`**[label](@line)**` is a strong wrapping a link), because each mark
 * re-enters this parser with its inner text. `content/pages/*.json` is data a client may edit, so
 * the parser must not assume anything about the order the marks appear in.
 */

const LINE_CLASS = '!text-inherit font-bold underline';

interface Rule {
  re: RegExp;
  node: (match: RegExpExecArray, key: string) => ReactNode;
}

const RULES: Rule[] = [
  { re: /\*\*([\s\S]+?)\*\*/, node: (m, key) => <strong key={key}>{parse(m[1], key)}</strong> },
  { re: /`([^`]+)`/, node: (m, key) => <code key={key}>{m[1]}</code> },
  { re: /_([^_]+)_/, node: (m, key) => <em key={key}>{parse(m[1], key)}</em> },
  {
    re: /\[([^\]]+)\]\(([^)]*)\)/,
    node: (m, key) => {
      const label = parse(m[1], key);
      const line = m[2] === '@line';
      const href = line ? contact.lineUrl : m[2];
      if (href.startsWith('/')) {
        return (
          <Link key={key} href={href}>
            {label}
          </Link>
        );
      }
      const external = /^[a-z]+:/i.test(href);
      return (
        <a
          key={key}
          href={href}
          className={line ? LINE_CLASS : undefined}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      );
    },
  },
  { re: /\n/, node: (_m, key) => <br key={key} /> },
];

function parse(source: string, keyBase = ''): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = source;
  let n = 0;

  while (rest.length) {
    let best: { rule: Rule; match: RegExpExecArray } | null = null;
    for (const rule of RULES) {
      const match = rule.re.exec(rest);
      if (match && (!best || match.index < best.match.index)) best = { rule, match };
    }
    if (!best) {
      out.push(rest);
      break;
    }
    const { rule, match } = best;
    if (match.index > 0) out.push(rest.slice(0, match.index));
    out.push(rule.node(match, `${keyBase}-${n++}`));
    rest = rest.slice(match.index + match[0].length);
  }

  return out;
}

export function InlineMarkup({ text }: { text: string }) {
  return <>{parse(text)}</>;
}
