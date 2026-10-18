import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Skill } from '../../types';
import SkillLogo from '../../components/SkillLogo';

interface Props {
  skill: Skill;
  onSound: () => void;
}

export default function Key({ skill, onSound }: Props) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const press = () => {
    onSound();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 150);
  };

  return (
    <div className="relative h-full min-w-0" onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        className="kb-key"
        data-pressed={pressed}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            setHover(true);
            onSound();
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') setHover(true);
          press();
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== 'mouse') window.setTimeout(() => setHover(false), 1000);
        }}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={(e) => {
          if (e.detail === 0) press(); // keyboard activation
        }}
        aria-label={`${skill.name} (${skill.category})`}
      >
        <SkillLogo skill={skill} className="kb-key-icon" />
        <span className="kb-key-name">{skill.name}</span>
      </button>

      <AnimatePresence>
        {hover && (
          <motion.div
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[14rem] -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <motion.div
              className="rounded-lg border border-cyan/40 bg-navy-900/95 px-3 py-2 text-center shadow-glow backdrop-blur"
              initial={{ y: 6, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 6, scale: 0.95 }}
              transition={{ duration: 0.14 }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">{skill.category}</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{skill.name}</p>
            </motion.div>
            <span className="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-cyan/40 bg-navy-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
