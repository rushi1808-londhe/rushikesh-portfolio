import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin cyan bar under the navbar showing how far down the page you are. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-cyan via-cyan-300 to-blue-500 shadow-[0_0_12px_#00d4ff]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
