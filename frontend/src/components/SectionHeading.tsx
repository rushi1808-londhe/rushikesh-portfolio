import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';

interface Props {
  index: string;
  title: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const word: Variants = {
  hidden: { y: '110%', rotate: 5, opacity: 0 },
  show: { y: '0%', rotate: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

/**
 * Section title that reveals word-by-word as it scrolls into view, with a large outlined echo of the
 * title drifting horizontally behind it (scroll-linked parallax).
 *
 * The reveal is triggered by the heading container, not the individual words: the words start clipped
 * by their mask, and a clipped element never counts as "in view".
 */
export default function SectionHeading({ index, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['8%', '-24%']);
  const echoOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const words = title.split(/\s+/);

  return (
    <div ref={ref} className="relative mb-16 pt-6">
      <motion.span
        style={{ x, opacity: echoOpacity }}
        className="pointer-events-none absolute -top-6 left-0 select-none whitespace-nowrap text-[clamp(4.5rem,14vw,11rem)] font-black uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(0,212,255,0.22)]"
        aria-hidden="true"
      >
        {title}
      </motion.span>

      <motion.div className="relative flex items-center gap-4" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={container}>
        <motion.span
          className="rounded-md border border-cyan/40 bg-cyan/10 px-2 py-1 font-mono text-sm font-semibold text-cyan shadow-glow"
          variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } } }}
        >
          {index}
        </motion.span>
        <h2
          className="flex flex-wrap gap-x-3 text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(0,212,255,0.25)] sm:text-5xl"
          aria-label={title}
        >
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2" aria-hidden="true">
              <motion.span
                className={`inline-block ${i === words.length - 1 ? 'bg-gradient-to-r from-white to-cyan bg-clip-text text-transparent' : ''}`}
                variants={word}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h2>
        <motion.span
          className="h-px flex-1 origin-left bg-gradient-to-r from-cyan via-cyan/40 to-transparent shadow-[0_0_8px_#00d4ff]"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease } } }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
