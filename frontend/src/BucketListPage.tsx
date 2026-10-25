import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';
import { fetchBucketList, fetchProfile } from './api/public';
import { errorMessage } from './api/client';
import Loader from './components/Loader';
import type { BucketListItem } from './types';
import './sections/Hero/hero.css';

const ease = [0.22, 1, 0.36, 1] as const;

/** Standalone public page listing the bucket list in the order set in the admin panel. */
export default function BucketListPage() {
  const [items, setItems] = useState<BucketListItem[] | null>(null);
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    fetchBucketList()
      .then(setItems)
      .catch((e) => setError(errorMessage(e, 'Unable to load the bucket list.')));
  };

  useEffect(() => {
    load();
    fetchProfile()
      .then((p) => setName(p.name))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.title = name ? `Bucket List — ${name}` : 'Bucket List';
  }, [name]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-slate-400">{error}</p>
        <button className="btn-outline" onClick={load}>
          Retry
        </button>
      </div>
    );
  }
  if (!items) return <Loader />;

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-base">
      <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[26rem] w-[26rem] rounded-full bg-cyan/10 blur-3xl" aria-hidden="true" />

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan">
          <HiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to portfolio
        </Link>

        <motion.header className="mt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan">{name ? `${name}’s` : 'My'}</p>
          <h1 className="mt-2 text-[clamp(2.5rem,10vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Bucket <span className="bg-gradient-to-r from-cyan to-blue-400 bg-clip-text text-transparent">List</span>
          </h1>

          {items.length > 0 && (
            <div className="mt-8">
              <div className="mb-2 flex items-baseline justify-between font-mono text-xs text-slate-400">
                <span>
                  {done} of {items.length} done
                </span>
                <span className="text-cyan">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-800" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan to-blue-400 shadow-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease }}
                />
              </div>
            </div>
          )}
        </motion.header>

        {items.length === 0 ? (
          <p className="card mt-12 p-10 text-center text-sm text-slate-500">Nothing on the list yet.</p>
        ) : (
          <ol className="mt-12 space-y-4">
            {items.map((item, i) => (
              <motion.li
                key={item.id ?? item.title}
                className={`card flex gap-4 p-5 sm:gap-5 sm:p-6 ${item.done ? 'border-emerald-400/20' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05, ease }}
              >
                <span
                  className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border font-mono text-sm font-semibold ${
                    item.done ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-cyan/30 bg-cyan/10 text-cyan'
                  }`}
                  aria-hidden="true"
                >
                  {item.done ? <HiCheck className="h-5 w-5" /> : String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className={`break-words text-lg font-semibold leading-snug sm:text-xl ${item.done ? 'text-slate-300' : 'text-white'}`}>
                    {item.title}
                    {item.done && <span className="sr-only"> (done)</span>}
                  </h2>
                  {item.done && (
                    <p className="mt-1 font-mono text-xs text-emerald-300">✓ Done{item.completedOn ? ` · ${item.completedOn}` : ''}</p>
                  )}
                  {item.description && <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-400">{item.description}</p>}
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
