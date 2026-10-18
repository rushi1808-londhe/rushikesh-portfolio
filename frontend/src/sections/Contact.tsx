import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Profile, SocialLink } from '../types';
import SectionHeading from '../components/SectionHeading';
import { SiGmail } from 'react-icons/si';
import SocialIcon from '../components/SocialIcon';
import ScrollScene from '../components/ScrollScene';
import { sendContact } from '../api/public';
import { errorMessage } from '../api/client';

interface Props {
  profile: Profile;
  socialLinks: SocialLink[];
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact({ profile, socialLinks }: Props) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email';
    if (form.message.trim().length < 5) next.message = 'Message should be at least 5 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus({ kind: 'sending' });
    try {
      await sendContact({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim(), website: honeypot });
      setStatus({ kind: 'success' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ kind: 'error', message: errorMessage(err) });
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: { target: { value: string } }) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
    'aria-invalid': !!errors[key],
  });

  return (
    <section id="contact" className="section">
      <SectionHeading index="05" title="Contact" />
      <div className="grid gap-10 md:grid-cols-5">
        <ScrollScene variant="left" className="md:col-span-2">
          <div>
            {profile.tagline && <p className="text-2xl font-bold leading-snug text-white">{profile.tagline}</p>}
            <dl className="mt-8 space-y-4 text-sm">
              {profile.email && (
                <div>
                  <dt className="label">Email</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`} className="text-slate-200 transition hover:text-cyan">
                      {profile.email}
                    </a>
                  </dd>
                </div>
              )}
              {profile.phone && (
                <div>
                  <dt className="label">Phone</dt>
                  <dd>
                    <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} className="text-slate-200 transition hover:text-cyan">
                      {profile.phone}
                    </a>
                  </dd>
                </div>
              )}
              {profile.location && (
                <div>
                  <dt className="label">Location</dt>
                  <dd className="text-slate-200">{profile.location}</dd>
                </div>
              )}
            </dl>
            {(socialLinks.length > 0 || profile.email) && (
              <div className="mt-8 flex gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.id ?? s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    title={s.platform}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/30 text-slate-300 transition hover:-translate-y-1 hover:border-cyan hover:text-cyan hover:shadow-glow"
                  >
                    <SocialIcon name={s.icon ?? s.platform} className="h-5 w-5" />
                  </a>
                ))}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    aria-label={`Email ${profile.email}`}
                    title={profile.email}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/30 text-slate-300 transition hover:-translate-y-1 hover:border-cyan hover:text-cyan hover:shadow-glow"
                  >
                    <SiGmail className="h-5 w-5" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
        </ScrollScene>

        <ScrollScene variant="right" className="md:col-span-3">
          <motion.form noValidate onSubmit={onSubmit} className="card relative space-y-5 p-6 sm:p-8">
            {/* Honeypot: invisible to people, tempting to bots */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="c-website">Website</label>
              <input id="c-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="label">
                  Name
                </label>
                <input id="c-name" className="input" autoComplete="name" maxLength={120} {...field('name')} />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="c-email" className="label">
                  Email
                </label>
                <input id="c-email" type="email" className="input" autoComplete="email" maxLength={160} {...field('email')} />
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="c-message" className="label">
                Message
              </label>
              <textarea id="c-message" rows={6} className="input resize-y" maxLength={5000} {...field('message')} />
              {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn-primary" disabled={status.kind === 'sending'}>
                {status.kind === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
              <AnimatePresence mode="wait">
                {status.kind === 'success' && (
                  <motion.p key="ok" className="text-sm text-emerald-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status">
                    Thanks! Your message has been sent.
                  </motion.p>
                )}
                {status.kind === 'error' && (
                  <motion.p key="err" className="text-sm text-rose-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert">
                    {status.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </ScrollScene>
      </div>
    </section>
  );
}
