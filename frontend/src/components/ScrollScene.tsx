import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export type SceneVariant = 'tilt' | 'left' | 'right' | 'rise' | 'zoom';

interface Props {
  children: ReactNode;
  variant?: SceneVariant;
  className?: string;
  /** Where the motion finishes, relative to the viewport (default: element centre hits viewport centre). */
  end?: 'center' | 'start';
}

/**
 * Scroll-linked entrance (like the tech-stack keyboard): the element's pose is driven by its scroll
 * position, so it moves as you scroll and reverses when you scroll back up.
 */
export default function ScrollScene({ children, variant = 'rise', className = '', end = 'center' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', end === 'center' ? 'center center' : 'start 35%'] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });

  const opacity = useTransform(p, [0, 0.55], [0, 1]);
  const x = useTransform(p, [0, 1], variant === 'left' ? [-160, 0] : variant === 'right' ? [160, 0] : [0, 0]);
  const y = useTransform(p, [0, 1], variant === 'rise' ? [120, 0] : variant === 'tilt' ? [80, 0] : [40, 0]);
  const rotateX = useTransform(p, [0, 1], variant === 'tilt' ? [28, 0] : [0, 0]);
  const rotateY = useTransform(p, [0, 1], variant === 'left' ? [22, 0] : variant === 'right' ? [-22, 0] : [0, 0]);
  const scale = useTransform(p, [0, 1], variant === 'zoom' ? [0.75, 1] : variant === 'tilt' ? [0.88, 1] : [0.94, 1]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div className="h-full" style={{ opacity, x, y, rotateX, rotateY, scale, transformOrigin: variant === 'tilt' ? '50% 100%' : '50% 50%' }}>
        {children}
      </motion.div>
    </div>
  );
}
