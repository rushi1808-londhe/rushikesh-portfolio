import { useRef, useState } from 'react';
import { uploadImage } from '../../api/admin';
import { errorMessage } from '../../api/client';
import type { ProjectImage } from '../../types';

interface Props {
  value: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

const MAX_IMAGES = 20;

/** Manage a project's screenshots: upload several at once (stored as JPG), caption, reorder, remove. */
export default function ProjectImagesEditor({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, MAX_IMAGES - value.length);
    if (list.length === 0) return;
    setError(null);
    const added: ProjectImage[] = [];
    try {
      for (let i = 0; i < list.length; i++) {
        setStatus(`Uploading ${i + 1} of ${list.length}…`);
        const res = await uploadImage(list[i], false);
        added.push({ url: res.url, caption: list[i].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') });
      }
    } catch (e) {
      setError(errorMessage(e, 'Upload failed'));
    } finally {
      if (added.length) onChange([...value, ...added]);
      setStatus(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const update = (i: number, patch: Partial<ProjectImage>) => onChange(value.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <span className="label">Screenshots ({value.length}) — the first one is the cover</span>
      <div className="space-y-3 rounded-lg border border-navy-500 p-4">
        {value.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {value.map((img, i) => (
              <li key={img.url} className="flex gap-3 rounded-lg border border-white/10 bg-navy-900/60 p-2">
                <a href={img.url} target="_blank" rel="noopener noreferrer" className="relative flex-none">
                  <img src={img.url} alt="" className="h-16 w-28 rounded-md object-cover object-top" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-cyan px-1.5 text-[10px] font-bold text-navy-950">COVER</span>}
                </a>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                  <input
                    className="input px-2.5 py-1.5 text-xs"
                    value={img.caption ?? ''}
                    maxLength={160}
                    placeholder="Caption, e.g. Admin dashboard"
                    onChange={(e) => update(i, { caption: e.target.value })}
                    aria-label={`Caption for screenshot ${i + 1}`}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded border border-navy-500 px-2 text-xs text-slate-400 hover:text-cyan disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label="Move earlier"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="rounded border border-navy-500 px-2 text-xs text-slate-400 hover:text-cyan disabled:opacity-30"
                      disabled={i === value.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label="Move later"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className="ml-auto rounded border border-rose-500/40 px-2 text-xs text-rose-400 hover:bg-rose-500/10"
                      onClick={() => remove(i)}
                      aria-label="Remove screenshot"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div
          className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition ${dragging ? 'border-cyan bg-cyan/5' : 'border-navy-500'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void upload(e.dataTransfer.files);
          }}
        >
          {status ? (
            <p className="text-xs text-cyan">{status}</p>
          ) : (
            <button type="button" className="btn-outline px-3 py-2 text-xs" onClick={() => inputRef.current?.click()} disabled={value.length >= MAX_IMAGES}>
              + Add screenshots
            </button>
          )}
          <p className="text-[11px] text-slate-500">Select or drop several images/PDFs at once — each is stored as an optimised JPG.</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={(e) => void upload(e.target.files)}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    </div>
  );
}
