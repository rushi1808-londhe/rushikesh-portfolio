import { useEffect, useMemo, useState } from 'react';
import { VscFiles, VscSearch, VscSourceControl, VscExtensions, VscDebugAlt, VscClose, VscError, VscWarning, VscChevronRight } from 'react-icons/vsc';
import { prefersReducedMotion } from '../../utils/scroll';

import type { Token, TokenKind } from '../../utils/heroSnippet';

interface Props {
  fileName: string;
  tokens: Token[];
  charDelay?: number;
  startDelay?: number;
}

const COLORS: Record<TokenKind, string> = {
  kw: 'text-cyan', // keywords — cyan
  id: 'text-[#e8eef5] font-semibold',
  key: 'text-[#9cdcfe]',
  str: 'text-[#ce9178]', // strings — orange
  num: 'text-[#b5cea8]',
  comment: 'text-[#6a9955] italic',
  pun: 'text-[#d4d4d4]',
  plain: 'text-white', // values — white
};

/** Splits the visible prefix of the token stream into lines of (possibly partial) tokens. */
function visibleLines(tokens: Token[], count: number): Token[][] {
  const lines: Token[][] = [[]];
  let remaining = count;
  for (const token of tokens) {
    if (remaining <= 0) break;
    const text = token.text.slice(0, remaining);
    remaining -= text.length;
    const parts = text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind });
    });
  }
  return lines;
}

/** A VS Code–style editor window that types its contents out. */
export default function CodeEditor({ fileName, tokens, charDelay = 18, startDelay = 700 }: Props) {
  const total = useMemo(() => tokens.reduce((n, t) => n + t.text.length, 0), [tokens]);
  const totalLines = useMemo(() => tokens.reduce((n, t) => n + (t.text.match(/\n/g)?.length ?? 0), 0) + 1, [tokens]);
  const [count, setCount] = useState(() => (prefersReducedMotion() ? total : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(total);
      return;
    }
    setCount(0);
    let timer = window.setTimeout(function step() {
      setCount((c) => {
        if (c >= total) return c;
        const next = c + 1;
        return next;
      });
      timer = window.setTimeout(step, charDelay);
    }, startDelay);
    return () => window.clearTimeout(timer);
  }, [total, charDelay, startDelay]);

  const symbol = useMemo(() => tokens.find((t) => t.kind === 'id')?.text, [tokens]);
  const lines = visibleLines(tokens, count);
  const done = count >= total;
  const cursorLine = lines.length;
  const cursorCol = (lines[lines.length - 1] ?? []).reduce((n, t) => n + t.text.length, 0) + 1;

  return (
    <div className="editor-float w-full">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(0,212,255,0.35)]">
        {/* Title bar */}
        <div className="relative flex items-center bg-[#323233] px-4 py-2.5">
          <span className="flex gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <p className="absolute left-1/2 -translate-x-1/2 truncate text-xs text-[#cccccc]">{fileName} — portfolio</p>
        </div>

        <div className="flex">
          {/* Activity bar */}
          <div className="hidden w-12 flex-none flex-col items-center gap-5 bg-[#333333] py-4 text-[#858585] sm:flex lg:hidden xl:flex" aria-hidden="true">
            <VscFiles className="h-6 w-6 text-white" />
            <VscSearch className="h-5 w-5" />
            <VscSourceControl className="h-5 w-5" />
            <VscDebugAlt className="h-5 w-5" />
            <VscExtensions className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Tabs */}
            <div className="flex bg-[#252526]" aria-hidden="true">
              <div className="flex items-center gap-2 border-t-2 border-cyan bg-[#1e1e1e] px-4 py-2 text-[13px] text-white">
                <span className="rounded-sm bg-[#3178c6] px-1 font-mono text-[9px] font-bold leading-4 text-white">TS</span>
                {fileName}
                <VscClose className="ml-2 h-3.5 w-3.5 text-[#cccccc]" />
              </div>
            </div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 px-4 py-1.5 text-[12px] text-[#a9a9a9]" aria-hidden="true">
              src <VscChevronRight className="h-3 w-3" /> <span className="text-[#cccccc]">{fileName}</span>
              {symbol && (
                <>
                  <VscChevronRight className="h-3 w-3" /> <span className="text-cyan/80">{symbol}</span>
                </>
              )}
            </div>

            {/* Code */}
            <div
              className="flex overflow-x-auto pb-4 pt-1 font-mono text-[12px] leading-[1.7] sm:text-[13.5px] lg:text-[12.5px] xl:text-[13px]"
              role="img"
              aria-label={tokens.map((t) => t.text).join('')}
            >
              <div className="flex-none select-none pl-4 pr-5 text-right text-[#6e7681]" aria-hidden="true">
                {Array.from({ length: Math.max(totalLines, lines.length) }, (_, i) => (
                  <div key={i} className={i + 1 === cursorLine ? 'text-[#c6c6c6]' : ''}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <pre className="min-w-0 flex-1 pr-6" aria-hidden="true">
                {lines.map((line, i) => (
                  <div key={i} className={`-ml-2 whitespace-pre pl-2 ${i + 1 === cursorLine ? 'bg-white/[0.04]' : ''}`}>
                    {line.map((t, j) => (
                      <span key={j} className={COLORS[t.kind]}>
                        {t.text}
                      </span>
                    ))}
                    {i + 1 === cursorLine && <span className={`editor-cursor ${done ? 'editor-cursor-idle' : ''}`} />}
                    {line.length === 0 && i + 1 !== cursorLine && '​'}
                  </div>
                ))}
                {Array.from({ length: Math.max(0, totalLines - lines.length) }, (_, i) => (
                  <div key={`pad-${i}`}>{'​'}</div>
                ))}
              </pre>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between gap-3 bg-[#007acc] px-3 py-1 text-[11px] text-white" aria-hidden="true">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <VscSourceControl className="h-3.5 w-3.5" /> main
            </span>
            <span className="flex items-center gap-1">
              <VscError className="h-3.5 w-3.5" /> 0 <VscWarning className="ml-1 h-3.5 w-3.5" /> 0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Ln {cursorLine}, Col {cursorCol}
            </span>
            <span className="hidden sm:inline">UTF-8</span>
            <span>TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}
