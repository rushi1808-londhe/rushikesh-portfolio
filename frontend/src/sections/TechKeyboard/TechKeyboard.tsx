import { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Skill } from '../../types';
import SectionHeading from '../../components/SectionHeading';
import { useClickSound } from '../../hooks/useClickSound';
import Key from './Key';
import { useCompact } from '../../hooks/useCompact';
import './keyboard.css';

interface Props {
  skills: Skill[];
}

export default function TechKeyboard({ skills }: Props) {
  const playClick = useClickSound();
  const boardRef = useRef<HTMLDivElement>(null);
  // The keyboard tilts back like it's lying on a desk, then rises flat as it scrolls to the centre.
  const { scrollYProgress } = useScroll({ target: boardRef, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.2, 1]);
  // On phones the tilted board is mostly invisible until mid-screen, so it just sits flat.
  const compact = useCompact();

  // One keyboard row per category, in the order categories first appear (driven by display_order).
  const rows = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) map.set(s.category, [...(map.get(s.category) ?? []), s]);
    return Array.from(map.entries());
  }, [skills]);

  return (
    <section id="skills" className="section">
      <SectionHeading index="01" title="Tech Stack" />
      <div ref={boardRef} style={{ perspective: 1400 }}>
        <motion.div className="kb-chassis isolate" style={compact ? undefined : { rotateX, scale, opacity, transformOrigin: '50% 100%' }}>
          {/* Top bezel */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="kb-screw" />
              <span className="ml-2 flex gap-1.5">
                <span className="kb-led" />
                <span className="kb-led opacity-60" />
                <span className="kb-led opacity-30" />
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/60">
              {skills.length} keys · {rows.length} rows
            </span>
            <span className="kb-screw" />
          </div>

          <div className="kb-plate space-y-5 sm:space-y-6">
            {rows.map(([category, list], rowIndex) => (
              <motion.div
                key={category}
                className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.1 + rowIndex * 0.08, duration: 0.5 }}
              >
                <span className="kb-label sm:w-36 sm:flex-none" aria-hidden="true">
                  {category}
                </span>
                <div className="kb-row grid flex-1 grid-cols-3 gap-x-2.5 gap-y-4 sm:flex sm:gap-3" role="list" aria-label={category}>
                  {list.map((skill, i) => (
                    <motion.div
                      key={skill.id ?? skill.name}
                      className="sm:min-w-[5.75rem] sm:flex-1"
                      role="listitem"
                      initial={{ opacity: 0, y: 24, scale: 0.7 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.15 + rowIndex * 0.06 + i * 0.045 }}
                    >
                      <Key skill={skill} onSound={playClick} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom bezel */}
          <div className="mt-4 flex items-center justify-between px-1">
            <span className="kb-screw" />
            <span className="h-1 w-24 rounded-full bg-cyan/30 shadow-glow" />
            <span className="kb-screw" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
