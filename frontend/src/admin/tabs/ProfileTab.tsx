import { useEffect, useState, type FormEvent } from 'react';
import { api, errorMessage } from '../../api/client';
import { updateProfile } from '../../api/admin';
import { notifyPortfolioUpdated } from '../../context/PortfolioContext';
import type { Portfolio, Profile } from '../../types';
import { generateSnippet } from '../../utils/heroSnippet';
import ListEditor from '../components/ListEditor';
import FileUpload from '../components/FileUpload';
import { useToast } from '../components/Toast';

const TEXT_FIELDS: { key: keyof Profile; label: string; required?: boolean; type?: string }[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'title', label: 'Title', required: true },
  { key: 'tagline', label: 'Tagline' },
  { key: 'location', label: 'Location' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
];

export default function ProfileTab() {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<Profile>('/profile')
      .then((r) => setProfile(r.data))
      .catch((e) => toast('error', errorMessage(e)));
  }, [toast]);

  if (!profile) return <p className="text-sm text-slate-500">Loading…</p>;

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => (p ? { ...p, [key]: value } : p));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setProfile(await updateProfile(profile));
      notifyPortfolioUpdated();
      toast('success', 'Profile saved');
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`p-${f.key}`} className="label">
              {f.label}
              {f.required && <span className="text-cyan"> *</span>}
            </label>
            <input
              id={`p-${f.key}`}
              type={f.type ?? 'text'}
              required={f.required}
              className="input"
              value={(profile[f.key] as string) ?? ''}
              onChange={(e) => set(f.key, e.target.value as never)}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="p-summary" className="label">
            Summary
          </label>
          <textarea id="p-summary" rows={6} className="input resize-y" value={profile.summary ?? ''} onChange={(e) => set('summary', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <ListEditor
            label="Hero typewriter roles (typed, erased and cycled under your name)"
            items={profile.speechLines ?? []}
            onChange={(lines) => set('speechLines', lines)}
            placeholder="Add a line…"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="p-hero-code" className="label mb-0">
              Hero code editor text (leave empty to auto-generate from your data)
            </label>
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-xs"
              onClick={async () => {
                try {
                  const { data } = await api.get<Portfolio>('/portfolio');
                  set('heroCode', generateSnippet({ ...data.profile, ...profile }, data.skills, data.experiences));
                } catch (e) {
                  toast('error', errorMessage(e));
                }
              }}
            >
              Insert generated snippet
            </button>
          </div>
          <textarea
            id="p-hero-code"
            rows={11}
            maxLength={6000}
            spellCheck={false}
            className="input resize-y font-mono text-[13px] leading-relaxed"
            placeholder={'const developer = {\n  name: "…",\n};'}
            value={profile.heroCode ?? ''}
            onChange={(e) => set('heroCode', e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-500">Typed out in the hero with TypeScript syntax highlighting. {(profile.heroCode ?? '').length}/6000</p>
        </div>
        <FileUpload label="Resume (PDF)" kind="file" accept="application/pdf" value={profile.resumeUrl} onChange={(url) => set('resumeUrl', url)} />
        <FileUpload label="Avatar (fallback if character image is missing)" value={profile.avatarUrl} onChange={(url) => set('avatarUrl', url)} />
      </div>
    </form>
  );
}
