import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '../utils/scroll';
import './hackerLoader.css';

/** Set once the boot sequence has played in this page load; a full refresh plays it again. */
let playedThisPageLoad = false;
const BOOT_MS = 3000;
const GLITCH_MS = 650;
const BLACKOUT_MS = 350;
const REVEAL_MS = 600;

const LINES = ['> Initializing system...', '> Loading portfolio...', '> Access granted.', '> Welcome.'];
const START_DELAY_MS = 120;
const CHAR_MS = 28;
const LINE_PAUSE_MS = 200;

const ACCENT = '#00d4ff';
const BACKGROUND = '#0a0f1e';
const RAIN_CHARS =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEF<>/{}[]=+*#$';

type Phase = 'boot' | 'glitch' | 'blackout' | 'reveal' | 'done';

/** Which characters of each line are visible after `t` ms of typing. */
function typed(t: number) {
  const out: string[] = [];
  let cursor = START_DELAY_MS;
  let active = 0;
  for (let i = 0; i < LINES.length; i++) {
    const line = LINES[i];
    const chars = Math.max(0, Math.min(line.length, Math.floor((t - cursor) / CHAR_MS)));
    if (t < cursor) break;
    out.push(line.slice(0, chars));
    active = i;
    cursor += line.length * CHAR_MS + LINE_PAUSE_MS;
  }
  return { lines: out, active };
}

/* ---------------------------------------------------------------- Matrix rain */

function MatrixRain({ intense }: { intense: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intenseRef = useRef(intense);
  intenseRef.current = intense;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = window.innerWidth < 640 ? 14 : 16;
    let width = 0;
    let height = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, width, height);
      const columns = Math.ceil(width / fontSize);
      // Start columns at random heights so the screen is already raining on first frame.
      drops = Array.from({ length: columns }, () => Math.floor((Math.random() * height) / fontSize) - 20);
      speeds = Array.from({ length: columns }, () => 0.6 + Math.random() * 0.8);
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < 33) return; // ~30 fps is plenty for the effect
      last = now;

      ctx.fillStyle = 'rgba(10, 15, 30, 0.1)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * fontSize;
        const x = i * fontSize;
        const char = RAIN_CHARS[(Math.random() * RAIN_CHARS.length) | 0];
        // Bright head, green trail (the trail comes from the translucent fill above).
        ctx.fillStyle = Math.random() > 0.975 ? '#ffffff' : '#c9f6ff';
        ctx.fillText(char, x, y);
        ctx.fillStyle = ACCENT;
        ctx.fillText(RAIN_CHARS[(Math.random() * RAIN_CHARS.length) | 0], x, y - fontSize);

        drops[i] += speeds[i] * (intenseRef.current ? 2.2 : 1);
        if (y > height && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20);
          speeds[i] = 0.6 + Math.random() * 0.8;
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    if (reduced) {
      // Single static frame of characters.
      for (let k = 0; k < 40; k++) draw(k * 40);
      cancelAnimationFrame(frame);
    } else {
      frame = requestAnimationFrame(draw);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}

/* ---------------------------------------------------------------- Static noise */

function StaticNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Low-res noise scaled up with nearest-neighbour looks like analogue static and is cheap.
    const w = Math.ceil(window.innerWidth / 3);
    const h = Math.ceil(window.innerHeight / 3);
    canvas.width = w;
    canvas.height = h;
    const image = ctx.createImageData(w, h);
    const buf = new Uint32Array(image.data.buffer);
    let frame = 0;
    const draw = () => {
      for (let i = 0; i < buf.length; i++) {
        const v = (Math.random() * 255) | 0;
        // ABGR little-endian; cyan-tinted static
        buf[i] = (255 << 24) | (v << 16) | ((v * 0.85) << 8) | (v * 0.35);
      }
      ctx.putImageData(image, 0, 0);
      // Rolling horizontal tear bars
      const bars = 2 + ((Math.random() * 3) | 0);
      for (let b = 0; b < bars; b++) {
        ctx.fillStyle = `rgba(0, 212, 255, ${0.15 + Math.random() * 0.25})`;
        ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 4);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="hl-noise absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ---------------------------------------------------------------- Terminal */

function Terminal({ elapsed }: { elapsed: number }) {
  const { lines, active } = typed(elapsed);
  const progress = Math.min(100, Math.floor((elapsed / BOOT_MS) * 100));
  const typingDone = lines.length === LINES.length && lines[LINES.length - 1].length === LINES[LINES.length - 1].length;

  return (
    <div className="hl-terminal">
      <div className="hl-terminal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <p>root@portfolio:~</p>
      </div>
      <div className="hl-terminal-body">
        {LINES.map((_, i) => {
          const text = lines[i];
          if (text === undefined)
            return (
              <p key={i} className="hl-line hl-line-empty" aria-hidden="true">
                &nbsp;
              </p>
            );
          const isActive = i === active && !typingDone;
          const isLast = i === LINES.length - 1;
          return (
            <p key={i} className={`hl-line ${i === 2 ? 'hl-line-strong' : ''} ${isLast ? 'hl-line-welcome' : ''}`}>
              {text}
              {(isActive || (typingDone && isLast)) && <span className="hl-cursor">_</span>}
            </p>
          );
        })}

        <div className="hl-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Loading progress">
          <div className="hl-progress-track">
            <div className="hl-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="hl-percent">[ {String(progress).padStart(3, ' ')}% ]</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Loader */

interface Props {
  children: ReactNode;
}

/**
 * Full-screen "hacker" boot sequence played on every page load (refresh) before the portfolio.
 * In-app navigation doesn't replay it, and admin routes are never gated by it.
 */
export default function HackerLoader({ children }: Props) {
  const { pathname } = useLocation();
  const skip = pathname.startsWith('/admin');
  const [shown, setShown] = useState<boolean>(() => playedThisPageLoad);
  const [phase, setPhase] = useState<Phase>(() => (playedThisPageLoad ? 'done' : 'boot'));
  const [elapsed, setElapsed] = useState(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const finish = useCallback(() => {
    playedThisPageLoad = true;
    setShown(true);
    setPhase('done');
  }, []);

  useEffect(() => {
    if (shown || skip) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const glitchMs = reduced ? 0 : GLITCH_MS;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      if (t < BOOT_MS) {
        setElapsed(t);
        setPhase('boot');
      } else if (t < BOOT_MS + glitchMs) {
        setElapsed(BOOT_MS);
        setPhase('glitch');
      } else if (t < BOOT_MS + glitchMs + BLACKOUT_MS) {
        setPhase('blackout');
      } else if (t < BOOT_MS + glitchMs + BLACKOUT_MS + REVEAL_MS) {
        setPhase('reveal');
      } else {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
    };
  }, [shown, skip, reduced, finish]);

  if (shown || skip || phase === 'done') return <>{children}</>;

  // Mount the portfolio underneath once the screen has gone black, so its entrance animations play on reveal.
  const mountChildren = phase === 'blackout' || phase === 'reveal';

  return (
    <>
      {mountChildren && children}
      <div className={`hl-root hl-phase-${phase}`} role="status" aria-live="polite" aria-label={phase === 'boot' ? 'Loading portfolio' : 'Portfolio loaded'}>
        <MatrixRain intense={phase === 'glitch'} />
        <div className="hl-vignette" aria-hidden="true" />
        <div className="hl-scanlines" aria-hidden="true" />

        <div className="hl-center">
          <div className="hl-glitch-wrap">
            <Terminal elapsed={elapsed} />
            {phase === 'glitch' && (
              <>
                <div className="hl-slice hl-slice-a" aria-hidden="true">
                  <Terminal elapsed={elapsed} />
                </div>
                <div className="hl-slice hl-slice-b" aria-hidden="true">
                  <Terminal elapsed={elapsed} />
                </div>
              </>
            )}
          </div>
        </div>

        {phase === 'glitch' && <StaticNoise />}
        <div className="hl-blackout" aria-hidden="true" />
      </div>
    </>
  );
}
