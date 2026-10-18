import type { ReactNode } from 'react';

// Numbers, ranges ("30–40") and figures with + / % / ~ ("30+", "~20%").
const NUMBER = /~?\d[\d,.]*(?:[–-]\d[\d,.]*)?\+?%?/g;

/**
 * Is this number an impact figure? Figures with + / % / ~ always are. Plain numbers are, unless they're
 * a version right after a product name ("React 18", "Spring Boot 3.2", ".NET 8") or part of a word ("H2").
 */
function isImpact(figure: string, before: string): boolean {
  if (/[+%~]/.test(figure)) return true;
  if (/[A-Za-z.]$/.test(before)) return false; // glued to a word: H2, .NET8
  if (/[A-Z][\w.#+]*\s$/.test(before)) return false; // version after a capitalised product name
  return !/\d\.\d/.test(figure); // decimals in prose are almost always versions
}

/** Wraps numeric impact figures in a cyan highlight span. */
export function highlightImpact(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(NUMBER)) {
    const start = m.index ?? 0;
    const figure = m[0].replace(/[.,]+$/, ''); // leave trailing punctuation unstyled
    if (!isImpact(figure, text.slice(Math.max(0, start - 24), start))) continue;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <span key={start} className="font-semibold text-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
        {figure}
      </span>,
    );
    last = start + figure.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
