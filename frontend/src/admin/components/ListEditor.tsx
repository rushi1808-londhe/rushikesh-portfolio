import { useState } from 'react';

interface Props {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
  placeholder?: string;
}

/** Edit an ordered list of strings (bullets, tags, speech lines). */
export default function ListEditor({ label, items, onChange, multiline, placeholder }: Props) {
  const [draft, setDraft] = useState('');

  const update = (i: number, value: string) => onChange(items.map((it, j) => (j === i ? value : it)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  };

  const Field = multiline ? 'textarea' : 'input';

  return (
    <div>
      <span className="label">{label}</span>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <Field
              className={`input ${multiline ? 'min-h-[4.5rem] resize-y' : ''}`}
              value={item}
              onChange={(e: { target: { value: string } }) => update(i, e.target.value)}
              aria-label={`${label} ${i + 1}`}
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="rounded border border-navy-500 px-2 text-xs text-slate-400 hover:text-cyan disabled:opacity-30"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded border border-navy-500 px-2 text-xs text-slate-400 hover:text-cyan disabled:opacity-30"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="rounded border border-rose-500/40 px-2 text-xs text-rose-400 hover:bg-rose-500/10"
                onClick={() => remove(i)}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <Field
          className={`input ${multiline ? 'min-h-[3rem] resize-y' : ''}`}
          value={draft}
          placeholder={placeholder}
          onChange={(e: { target: { value: string } }) => setDraft(e.target.value)}
          onKeyDown={(e: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-outline whitespace-nowrap" onClick={add}>
          + Add
        </button>
      </div>
    </div>
  );
}
