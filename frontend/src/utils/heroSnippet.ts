import type { Experience, Profile, Skill } from '../types';

export type TokenKind = 'kw' | 'id' | 'key' | 'str' | 'num' | 'comment' | 'pun' | 'plain';
export interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'export',
  'default',
  'import',
  'from',
  'as',
  'interface',
  'type',
  'class',
  'extends',
  'implements',
  'new',
  'if',
  'else',
  'for',
  'while',
  'of',
  'in',
  'async',
  'await',
  'public',
  'private',
  'static',
  'readonly',
  'enum',
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'void',
  'try',
  'catch',
  'throw',
]);

/** Generated default: a `developer` object built from live portfolio data. */
export function generateSnippet(profile: Profile, skills: Skill[], experiences: Experience[]): string {
  // One headline skill per keyboard row (the first skill of each category), max four.
  const stack: string[] = [];
  const seen = new Set<string>();
  for (const s of skills) {
    if (stack.length >= 4) break;
    if (!seen.has(s.category)) {
      seen.add(s.category);
      stack.push(s.name);
    }
  }
  const q = (v: string) => JSON.stringify(v);
  const fields: string[] = [`name: ${q(profile.name)}`, `role: ${q(profile.title)}`];
  if (profile.location) fields.push(`location: ${q(profile.location)}`);
  if (stack.length) fields.push(`stack: [${stack.map(q).join(', ')}]`);
  if (experiences[0]) fields.push(`experience: ${q(experiences[0].company)}`);
  if (profile.tagline) fields.push(`passion: ${q(profile.tagline)}`);
  fields.push(`openTo: ${q('Full Time Opportunities')}`);
  return `const developer = {\n${fields.map((f) => `  ${f}`).join(',\n')}\n};`;
}

/** Small TypeScript-ish highlighter: comments, strings, numbers, keywords, object keys, identifiers. */
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*:(?!:))|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"'`/]+|\/)/g;
  let m: RegExpExecArray | null;
  let prevSignificant = '';
  while ((m = re.exec(code))) {
    const [text, comment, str, num, key, ident, ws] = m;
    let kind: TokenKind;
    if (comment) kind = 'comment';
    else if (str) kind = 'str';
    else if (num) kind = 'num';
    else if (key) kind = KEYWORDS.has(key) ? 'kw' : 'key';
    else if (ident)
      kind = KEYWORDS.has(ident)
        ? 'kw'
        : prevSignificant === 'const' || prevSignificant === 'let' || prevSignificant === 'function' || prevSignificant === 'class'
          ? 'id'
          : 'plain';
    else if (ws) kind = 'plain';
    else kind = 'pun';
    tokens.push({ text, kind });
    if (!ws) prevSignificant = text;
  }
  return tokens;
}
