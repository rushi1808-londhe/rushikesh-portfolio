import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../utils/scroll';

const DOTS = 12;

/** Cyan dot trail that follows the pointer. Disabled on touch devices and for reduced motion. */
export default function CursorTrail() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const points = Array.from({ length: DOTS }, () => ({ ...mouse }));
    let visible = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        refs.current.forEach((el) => el && (el.style.opacity = '1'));
      }
    };
    const onLeave = () => {
      visible = false;
      refs.current.forEach((el) => el && (el.style.opacity = '0'));
    };

    const tick = () => {
      let x = mouse.x;
      let y = mouse.y;
      points.forEach((p, i) => {
        p.x += (x - p.x) * 0.38;
        p.y += (y - p.y) * 0.38;
        const el = refs.current[i];
        if (el) {
          const scale = 1 - i / DOTS;
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        }
        x = p.x;
        y = p.y;
      });
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block" aria-hidden="true">
      {Array.from({ length: DOTS }, (_, i) => (
        <div
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="absolute left-0 top-0 rounded-full bg-cyan opacity-0 transition-opacity duration-300"
          style={{
            width: 10,
            height: 10,
            boxShadow: `0 0 ${12 - i}px rgba(0,212,255,${0.9 - i * 0.06})`,
            filter: i === 0 ? 'none' : `blur(${i * 0.15}px)`,
            mixBlendMode: 'screen',
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
