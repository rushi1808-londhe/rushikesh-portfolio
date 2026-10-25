import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { CrudApi } from '../../api/admin';
import { errorMessage } from '../../api/client';
import { notifyPortfolioUpdated } from '../../context/PortfolioContext';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import ListEditor from './ListEditor';
import FileUpload from './FileUpload';
import { useToast } from './Toast';
import type { UploadResponse } from '../../types';

export type FieldType = 'text' | 'textarea' | 'url' | 'number' | 'image' | 'list' | 'list-multiline' | 'datalist' | 'custom';

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  full?: boolean;
  /** For type 'image': accept PDFs too and store everything as JPEG. */
  convertToJpeg?: boolean;
  /** For type 'image' with convertToJpeg: keep the original PDF. */
  keepPdf?: boolean;
  /** For type 'image': extra fields to set after an upload (e.g. link the original PDF). */
  onUpload?: (upload: UploadResponse, item: T) => Partial<T>;
  /** For type 'custom': renders the field with access to the whole item. */
  render?: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
}

interface Props<T extends { id?: number; displayOrder: number }> {
  title: string;
  api: CrudApi<T>;
  fields: FieldDef<T>[];
  empty: () => T;
  summary: (item: T) => { primary: string; secondary?: string; image?: string; visual?: ReactNode };
  groupBy?: (item: T) => string;
  /** Last chance to enrich the item before it is sent (e.g. auto-pick a logo). */
  beforeSave?: (item: T) => Promise<T>;
}

export default function CrudTab<T extends { id?: number; displayOrder: number }>({ title, api, fields, empty, summary, groupBy, beforeSave }: Props<T>) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [moving, setMoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.list());
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    const next = empty();
    next.displayOrder = items.reduce((m, i) => Math.max(m, i.displayOrder), 0) + 1;
    setEditing(next);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    for (const f of fields) {
      const v = editing[f.key];
      if (f.required && (v === undefined || v === null || String(v).trim() === '')) {
        toast('error', `${f.label} is required`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = beforeSave ? await beforeSave(editing) : editing;
      if (payload.id) await api.update(payload.id, payload);
      else await api.create(payload);
      toast('success', `${title} saved`);
      setEditing(null);
      notifyPortfolioUpdated();
      await load();
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    setBusyDelete(true);
    try {
      await api.remove(deleting.id);
      toast('success', 'Deleted');
      setDeleting(null);
      notifyPortfolioUpdated();
      await load();
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setBusyDelete(false);
    }
  };

  /** Swaps an item with its neighbour and saves the whole order (only for APIs that support it). */
  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (!api.reorder || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const previous = items;
    setItems(next.map((item, i) => ({ ...item, displayOrder: i + 1 })));
    setMoving(true);
    try {
      await api.reorder(next.map((item) => item.id!));
      notifyPortfolioUpdated();
    } catch (err) {
      setItems(previous);
      toast('error', errorMessage(err));
    } finally {
      setMoving(false);
    }
  };

  const set = (key: keyof T, value: unknown) => setEditing((cur) => (cur ? ({ ...cur, [key]: value } as T) : cur));

  const renderField = (f: FieldDef<T>): ReactNode => {
    if (!editing) return null;
    const value = editing[f.key] as unknown;
    const id = `f-${f.key}`;
    const labelEl = (
      <label htmlFor={id} className="label">
        {f.label}
        {f.required && <span className="text-cyan"> *</span>}
      </label>
    );
    switch (f.type) {
      case 'custom':
        return f.render ? f.render(editing, (patch) => setEditing((cur) => (cur ? ({ ...cur, ...patch } as T) : cur))) : null;
      case 'textarea':
        return (
          <div>
            {labelEl}
            <textarea
              id={id}
              rows={4}
              className="input resize-y"
              value={(value as string) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        );
      case 'number':
        return (
          <div>
            {labelEl}
            <input id={id} type="number" className="input" value={Number(value ?? 0)} onChange={(e) => set(f.key, Number(e.target.value))} />
          </div>
        );
      case 'image':
        return (
          <FileUpload
            label={f.label}
            value={(value as string) || undefined}
            convertToJpeg={f.convertToJpeg}
            keepPdf={f.keepPdf}
            onChange={(url, upload) =>
              setEditing((cur) => (cur ? ({ ...cur, [f.key]: url, ...(upload && f.onUpload ? f.onUpload(upload, cur) : {}) } as T) : cur))
            }
          />
        );
      case 'list':
      case 'list-multiline':
        return (
          <ListEditor
            label={f.label}
            items={(value as string[]) ?? []}
            onChange={(next) => set(f.key, next)}
            multiline={f.type === 'list-multiline'}
            placeholder={f.placeholder}
          />
        );
      case 'datalist':
        return (
          <div>
            {labelEl}
            <input
              id={id}
              list={`${id}-opts`}
              className="input"
              value={(value as string) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
            <datalist id={`${id}-opts`}>
              {(f.options ?? []).map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
        );
      default:
        return (
          <div>
            {labelEl}
            <input
              id={id}
              type="text"
              inputMode={f.type === 'url' ? 'url' : undefined}
              spellCheck={f.type === 'url' ? false : undefined}
              className="input"
              value={(value as string) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        );
    }
  };

  const groups = groupBy
    ? Array.from(
        items.reduce((map, item) => {
          const g = groupBy(item);
          map.set(g, [...(map.get(g) ?? []), item]);
          return map;
        }, new Map<string, T[]>()),
      )
    : [['', items] as [string, T[]]];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">
          {title} <span className="ml-1 font-mono text-sm text-slate-500">({items.length})</span>
        </h2>
        <button className="btn-primary" onClick={openNew}>
          + Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">Nothing here yet. Click “Add” to create the first entry.</div>
      ) : (
        <div className="space-y-6">
          {groups.map(([group, list]) => (
            <div key={group}>
              {group && <p className="mb-2 font-mono text-xs uppercase tracking-widest text-cyan">{group}</p>}
              <ul className="divide-y divide-navy-600 overflow-hidden rounded-xl border border-navy-600">
                {list.map((item, index) => {
                  const s = summary(item);
                  return (
                    <li key={item.id} className="flex items-center gap-4 bg-navy-800/60 px-4 py-3">
                      {api.reorder && !groupBy && (
                        <div className="flex flex-none flex-col">
                          <button
                            type="button"
                            className="rounded px-1.5 text-slate-400 hover:text-cyan disabled:opacity-25"
                            onClick={() => void move(index, -1)}
                            disabled={moving || index === 0}
                            aria-label={`Move ${s.primary} up`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="rounded px-1.5 text-slate-400 hover:text-cyan disabled:opacity-25"
                            onClick={() => void move(index, 1)}
                            disabled={moving || index === list.length - 1}
                            aria-label={`Move ${s.primary} down`}
                          >
                            ▼
                          </button>
                        </div>
                      )}
                      {s.visual}
                      {s.image && <img src={s.image} alt="" className="h-12 w-12 flex-none rounded-md object-cover" />}
                      <span className="w-8 flex-none font-mono text-xs text-slate-500">#{item.displayOrder}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-100">{s.primary}</p>
                        {s.secondary && <p className="truncate text-xs text-slate-500">{s.secondary}</p>}
                      </div>
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setEditing(structuredClone(item))}>
                        Edit
                      </button>
                      <button className="btn-ghost px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300" onClick={() => setDeleting(item)}>
                        Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? `Edit ${title}` : `New ${title}`} onClose={() => !saving && setEditing(null)} wide>
        <form onSubmit={save} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.full || ['textarea', 'list', 'list-multiline', 'image', 'custom'].includes(f.type) ? 'sm:col-span-2' : ''}>
                {renderField(f)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-600 pt-5">
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        message={`Delete “${deleting ? summary(deleting).primary : ''}”? This cannot be undone.`}
        busy={busyDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
