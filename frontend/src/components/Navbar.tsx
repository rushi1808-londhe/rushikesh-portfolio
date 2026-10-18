import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SectionDef } from '../constants/sections';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToSection } from '../utils/scroll';

interface Props {
  sections: SectionDef[];
  brand: string;
}

export default function Navbar({ sections, brand }: Props) {
  const active = useActiveSection(sections.map((s) => s.id));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const initials = brand
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-cyan/10 bg-base/80 shadow-lg shadow-black/20 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Primary">
        <button onClick={() => go('home')} className="group flex items-center gap-2 font-mono text-lg font-bold text-white" aria-label={brand}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan/40 text-cyan transition group-hover:shadow-glow">
            {initials}
          </span>
          <span className="hidden sm:inline">{brand}</span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => go(s.id)}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active === s.id ? 'text-cyan' : 'text-slate-400 hover:text-white'
                }`}
                aria-current={active === s.id ? 'true' : undefined}
              >
                {s.label}
                {active === s.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-cyan shadow-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 bg-cyan transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-cyan transition ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-cyan transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-base/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sections.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => go(s.id)}
                className={`text-2xl font-semibold ${active === s.id ? 'text-cyan' : 'text-slate-300'}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
