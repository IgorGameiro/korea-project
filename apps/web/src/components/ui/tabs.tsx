'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/**
 * WAI-ARIA tabs: one tab stop for the whole list, arrow keys / Home / End move between tabs,
 * the selected tab controls its panel. (City sections are separate pages and use links instead.)
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focus = (index: number) => {
    const next = (index + items.length) % items.length;
    setSelected(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: selected + 1,
      ArrowLeft: selected - 1,
      Home: 0,
      End: items.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    focus(target);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 border-b border-navy-100"
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={index === selected}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              index === selected
                ? 'border-coral-500 text-navy-900'
                : 'border-transparent text-navy-700 hover:text-navy-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={index !== selected}
          tabIndex={0}
          className="py-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
