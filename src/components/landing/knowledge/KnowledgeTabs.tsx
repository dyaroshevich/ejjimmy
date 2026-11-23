'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const PANELS = [
  { id: 'savings', tab: 'tabSavings', items: [1, 2, 3, 12] },
  { id: 'tech', tab: 'tabTech', items: [4, 6, 7, 10] },
  { id: 'faq', tab: 'tabFaq', items: [5, 8, 9, 11] },
];

export default function KnowledgeTabs({ labelledBy }: { labelledBy: string }) {
  const t = useTranslations('knowledge');
  const [active, setActive] = useState(PANELS[0].id);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (index: number) => {
    const next = PANELS[(index + PANELS.length) % PANELS.length];
    setActive(next.id);
    tabs.current[next.id]?.focus();
  };

  return (
    <>
      <div className="tabs-wrap">
        <div
          className="tabs"
          role="tablist"
          aria-labelledby={labelledBy}
          onKeyDown={(e) => {
            const i = PANELS.findIndex((p) => p.id === active);
            if (e.key === 'ArrowRight') select(i + 1);
            else if (e.key === 'ArrowLeft') select(i - 1);
            else if (e.key === 'Home') select(0);
            else if (e.key === 'End') select(PANELS.length - 1);
            else return;
            e.preventDefault();
          }}
        >
          {PANELS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`knowledge-tab-${p.id}`}
              data-tab={p.id}
              aria-selected={active === p.id}
              aria-controls={`knowledge-panel-${p.id}`}
              tabIndex={active === p.id ? 0 : -1}
              ref={(el) => {
                tabs.current[p.id] = el;
              }}
              onClick={() => setActive(p.id)}
            >
              {t(p.tab)}
            </button>
          ))}
        </div>
      </div>
      {PANELS.map((p) => (
        <div
          key={p.id}
          className={active === p.id ? 'tabpanel is-active' : 'tabpanel'}
          data-panel={p.id}
          role="tabpanel"
          id={`knowledge-panel-${p.id}`}
          aria-labelledby={`knowledge-tab-${p.id}`}
          tabIndex={0}
        >
          {p.items.map((n) => (
            <div className="card qa" key={n}>
              <h3>{t(`q${n}`)}</h3>
              <p className="dim">{t(`a${n}`)}</p>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
