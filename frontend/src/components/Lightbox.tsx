import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface LightboxItem {
  src: string;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
}

interface Props {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const open = index !== null && items[index] !== undefined;

  const step = useCallback(
    (dir: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, step]);

  const item = open ? items[index!] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <button className="absolute right-4 top-4 rounded-full p-2 text-3xl leading-none text-slate-300 hover:text-cyan" aria-label="Close" onClick={onClose}>
            ×
          </button>
          {items.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-cyan/30 bg-navy-900/80 px-4 py-3 text-xl text-cyan hover:shadow-glow sm:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-cyan/30 bg-navy-900/80 px-4 py-3 text-xl text-cyan hover:shadow-glow sm:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
          <motion.figure
            key={item.src}
            className="flex max-h-full max-w-5xl flex-col items-center"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={item.src} alt={item.title} className="max-h-[75vh] w-auto rounded-xl border border-cyan/20 object-contain shadow-glow-lg" />
            <figcaption className="mt-4 max-w-2xl text-center">
              <p className="text-lg font-semibold text-white">{item.title}</p>
              {item.subtitle && <p className="font-mono text-sm text-cyan">{item.subtitle}</p>}
              {item.description && <p className="mt-2 text-sm text-slate-400">{item.description}</p>}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-cyan underline-offset-4 hover:underline"
                >
                  {/\.pdf($|\?)/i.test(item.link) ? 'View PDF ↗' : 'View credential ↗'}
                </a>
              )}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
