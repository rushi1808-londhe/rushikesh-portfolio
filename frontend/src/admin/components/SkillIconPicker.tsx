import { useEffect, useRef, useState } from 'react';
import type { Skill } from '../../types';
import SkillLogo from '../../components/SkillLogo';
import FileUpload from './FileUpload';
import { fetchIconifyIcon, searchIconify, type IconCandidate } from '../iconify';

interface Props {
  skill: Skill;
  onChange: (patch: Partial<Skill>) => void;
}

type Mode = 'auto' | 'search' | 'upload';

/** Choose a skill logo: automatic (by name), from the official Iconify logo sets, or an uploaded image. */
export default function SkillIconPicker({ skill, onChange }: Props) {
  const [mode, setMode] = useState<Mode>(skill.iconUrl ? 'upload' : skill.iconData ? 'search' : 'auto');
  const [query, setQuery] = useState(skill.name);
  const [results, setResults] = useState<IconCandidate[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searched = useRef('');

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      searched.current = q;
      setResults(await searchIconify(q));
    } catch {
      setError('Logo search is unavailable right now (offline?). You can upload an image instead.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (mode === 'search' && skill.name && searched.current !== skill.name && results.length === 0) {
      setQuery(skill.name);
      void runSearch(skill.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const choose = async (c: IconCandidate) => {
    setBusy(true);
    setError(null);
    try {
      const icon = await fetchIconifyIcon(c.id);
      onChange({ iconData: JSON.stringify(icon), iconUrl: undefined });
    } catch {
      setError('Could not load that logo. Try another one.');
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        if (m === 'auto') onChange({ iconData: undefined, iconUrl: undefined });
      }}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${mode === m ? 'bg-cyan text-navy-950' : 'text-slate-400 hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <span className="label">Logo</span>
      <div className="flex flex-col gap-4 rounded-lg border border-navy-500 p-4 sm:flex-row">
        <div className="flex flex-none flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-[#232c46] to-[#161d31] shadow-glow">
            <SkillLogo skill={skill} className="h-10 w-10" />
          </div>
          <span className="max-w-[6rem] truncate text-center font-mono text-[11px] text-slate-400">{skill.name || 'Preview'}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex gap-1 rounded-lg border border-navy-500 bg-navy-900/60 p-1">
            {tab('auto', 'Auto')}
            {tab('search', 'Search logos')}
            {tab('upload', 'Upload')}
          </div>

          {mode === 'auto' && (
            <p className="text-xs leading-relaxed text-slate-400">
              Uses the built-in logo matching the skill name. If none matches, the best official logo is picked automatically when you save.
            </p>
          )}

          {mode === 'search' && (
            <div>
              <div className="flex gap-2">
                <input
                  className="input py-2"
                  value={query}
                  placeholder="e.g. kubernetes"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void runSearch(query);
                    }
                  }}
                />
                <button type="button" className="btn-outline whitespace-nowrap px-4 py-2" onClick={() => void runSearch(query)} disabled={busy}>
                  {busy ? '…' : 'Search'}
                </button>
              </div>
              {results.length > 0 && (
                <ul className="mt-3 grid max-h-48 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-7">
                  {results.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        title={c.id}
                        onClick={() => void choose(c)}
                        className="flex aspect-square w-full items-center justify-center rounded-lg border border-white/10 bg-[#1b2238] p-2 transition hover:border-cyan hover:shadow-glow"
                      >
                        <img src={c.previewUrl} alt={c.id} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!busy && results.length === 0 && searched.current && !error && (
                <p className="mt-3 text-xs text-slate-500">No logos found. Try a shorter name.</p>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <FileUpload label="Logo image (PNG, JPG, WEBP)" value={skill.iconUrl} onChange={(url) => onChange({ iconUrl: url, iconData: undefined })} />
          )}

          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
