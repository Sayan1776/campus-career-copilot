'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * ChipInput — tagged measurements. Enter or comma commits a reading,
 * Backspace on an empty draft retires the last one.
 */
export function ChipInput({
  value,
  onChange,
  placeholder,
  id,
  ariaLabel = 'Add a tag',
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const tag = raw.trim().replace(/,+$/, '').trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  return (
    <div
      className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-ink-line-strong bg-white px-2 py-1.5 transition-colors focus-within:border-instrument focus-within:shadow-[0_0_0_3px_rgba(232,80,26,0.16)]"
      onClick={(e) => {
        const input = e.currentTarget.querySelector('input');
        if (input && document.activeElement !== input) input.focus();
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded border border-ink-line-strong bg-sheet-inset py-0.5 pl-2 pr-1 font-mono text-xs font-medium text-ink"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Remove ${tag}`}
            className="flex h-4 w-4 items-center justify-center rounded-[4px] text-ink-faint transition-colors hover:bg-white hover:text-instrument-deep"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit(draft);
          } else if (e.key === 'Backspace' && !draft && value.length > 0) {
            remove(value[value.length - 1]);
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[110px] flex-1 border-none bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink-faint/70"
      />
    </div>
  );
}
