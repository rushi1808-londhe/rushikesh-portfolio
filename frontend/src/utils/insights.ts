import type { Skill } from '../types';

export interface Metric {
  value: string;
  label: string;
}

const STOP = new Set(['and', 'or', 'within', 'covering', 'with', 'in', 'by', 'for', 'to', 'across', 'from', 'on', 'at', 'via', 'through']);
const LEAD_SKIP = new Set(['of', 'the', 'a', 'an']);
const METRIC = /(~?\d[\d,.]*\+|~?\d[\d,.]*%)\s+([^;.():,\d]+)/g;
// Also accepts plain counts ("8 database tables"), skipping version numbers like ".NET 8".
// Plain counts: integers only, and not right after a capitalised product name — skips versions like
// "Spring Boot 3.2", "React 18" or ".NET 8" while keeping counts like "with 5 dashboards".
const FIGURE = /(?<![A-Z][\w.#+]*\s)(?<![\d.])(~?\d+(?:,\d{3})*\+?%?)(?![.\d])\s+([A-Za-z][^;.():,\d]*)/g;

/** Pulls headline numbers ("30+ APIs", "~20% new customers") out of free text. Data-driven, nothing hardcoded. */
export function extractMetrics(texts: string[], limit = 4, { includePlain = false }: { includePlain?: boolean } = {}): Metric[] {
  const out: Metric[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    for (const m of text.matchAll(includePlain ? FIGURE : METRIC)) {
      const words = m[2].trim().split(/\s+/);
      while (words.length && LEAD_SKIP.has(words[0].toLowerCase())) words.shift();
      const label: string[] = [];
      for (const w of words) {
        if (STOP.has(w.toLowerCase().replace(/[^a-z]/gi, '')) || label.length === 2) break;
        label.push(w.replace(/[,:]$/, ''));
      }
      if (label.length === 0) continue;
      // "50+ REST APIs" and "50+ REST API endpoints" describe the same thing.
      const key = `${m[1]} ${label[0].toLowerCase().replace(/s$/, '')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ value: m[1], label: label.join(' ') });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function aliases(name: string): string[] {
  const list = new Set<string>([name]);
  const noJs = name.replace(/\.js$/i, '');
  list.add(noJs);
  const parts = name.split(/\s+/);
  // "Apache Kafka" -> "Kafka"; "Microsoft SQL Server" -> "SQL Server"
  if (parts.length > 1 && /^(apache|microsoft)$/i.test(parts[0])) list.add(parts.slice(1).join(' '));
  return [...list].filter((a) => a.length >= 2);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Skills (from the skills API) that are mentioned in the given text, in skill display order. */
export function matchSkills(texts: string[], skills: Skill[], limit = 8): Skill[] {
  const haystack = texts.join(' \n ');
  return skills
    .filter((s) => aliases(s.name).some((a) => new RegExp(`(^|[^A-Za-z0-9])${escape(a)}(?![A-Za-z0-9])`, a === a.toUpperCase() ? '' : 'i').test(haystack)))
    .slice(0, limit);
}

export function initials(text: string, max = 2): string {
  return text
    .split(/[\s–—-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, max)
    .toUpperCase();
}
