import { useMemo, useState } from 'react';
import type { Skill } from '../../types';
import SkillLogo from '../../components/SkillLogo';

interface Props {
  label: string;
  value: string[];
  skills: Skill[];
  onChange: (tags: string[]) => void;
}

/** Pick a project's tech tags from your skills (with logos), or add custom ones. Order is preserved. */
export default function SkillTagPicker({ label, value, skills, onChange }: Props) {
  const [custom, setCustom] = useState('');
  const selected = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value]);

  const categories = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) map.set(s.category, [...(map.get(s.category) ?? []), s]);
    return Array.from(map.entries());
  }, [skills]);

  const toggle = (name: string) =>
    selected.has(name.toLowerCase()) ? onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase())) : onChange([...value, name]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addCustom = () => {
    const tag = custom.trim().slice(0, 80);
    if (tag && !selected.has(tag.toLowerCase())) onChange([...value, tag]);
    setCustom('');
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-4 rounded-lg border border-navy-500 p-4">
        {/* Selected, in display order */}
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Shown on the card ({value.length})</p>
          {value.length === 0 ? (
            <p className="text-xs text-slate-500">No tags yet. Pick skills below or add a custom tag.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {value.map((tag, i) => (
                <li key={tag} className="chip inline-flex items-center gap-1.5 py-1 pl-2 pr-1">
                  <SkillLogo name={tag} skills={skills} className="h-3.5 w-3.5" />
                  {tag}
                  <span className="ml-1 flex items-center">
                    <button
                      type="button"
                      className="px-1 text-slate-400 hover:text-white disabled:opacity-30"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${tag} left`}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="px-1 text-slate-400 hover:text-white disabled:opacity-30"
                      onClick={() => move(i, 1)}
                      disabled={i === value.length - 1}
                      aria-label={`Move ${tag} right`}
                    >
                      ›
                    </button>
                    <button type="button" className="px-1 text-rose-400 hover:text-rose-300" onClick={() => toggle(tag)} aria-label={`Remove ${tag}`}>
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* All skills, grouped like the keyboard */}
        <div className="max-h-56 space-y-3 overflow-y-auto border-t border-white/5 pt-3 pr-1">
          {categories.map(([category, list]) => (
            <div key={category}>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan/80">{category}</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((s) => {
                  const on = selected.has(s.name.toLowerCase());
                  return (
                    <button
                      key={s.id ?? s.name}
                      type="button"
                      onClick={() => toggle(s.name)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                        on ? 'border-cyan bg-cyan/15 text-white shadow-glow' : 'border-white/10 bg-navy-900/60 text-slate-300 hover:border-cyan/50'
                      }`}
                    >
                      <SkillLogo skill={s} className="h-4 w-4" />
                      {s.name}
                      {on && <span className="text-cyan">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom tag */}
        <div className="flex gap-2 border-t border-white/5 pt-3">
          <input
            className="input py-2"
            value={custom}
            maxLength={80}
            placeholder="Custom tag, e.g. Multi-tenant"
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <button type="button" className="btn-outline whitespace-nowrap px-4 py-2" onClick={addCustom}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
