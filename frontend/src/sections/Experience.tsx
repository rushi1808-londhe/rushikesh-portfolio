import { useMemo, useRef } from 'react';
import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineBriefcase } from 'react-icons/hi';
import { HiOutlineMapPin } from 'react-icons/hi2';
import type { Experience as ExperienceItem, Skill } from '../types';
import SectionHeading from '../components/SectionHeading';
import { highlightImpact } from '../utils/highlight';
import { initials, matchSkills } from '../utils/insights';
import SkillLogo from '../components/SkillLogo';
import ScrollScene from '../components/ScrollScene';

interface Props {
  experiences: ExperienceItem[];
  skills: Skill[];
}

const ease = [0.22, 1, 0.36, 1] as const;

function TimelineDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      {active && <span className="absolute inset-0 animate-ping rounded-full bg-cyan/50" />}
      <motion.span
        className="relative h-5 w-5 rounded-full border-[3px] border-base bg-cyan"
        initial={{ scale: 0, boxShadow: '0 0 0 0 rgba(0,212,255,0)' }}
        animate={
          active
            ? {
                scale: [0, 1.5, 1],
                boxShadow: ['0 0 0 0 rgba(0,212,255,0.0)', '0 0 0 10px rgba(0,212,255,0.25)', '0 0 18px 4px rgba(0,212,255,0.6)'],
              }
            : {}
        }
        transition={{ duration: 0.9, ease }}
      />
    </span>
  );
}

function ExperienceEntry({ exp, skills }: { exp: ExperienceItem; skills: Skill[] }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const stack = useMemo(() => matchSkills(exp.bullets, skills, 8), [exp.bullets, skills]);
  const current = /present|current|now/i.test(exp.duration);

  return (
    <li ref={ref} className="relative grid grid-cols-1 gap-5 pl-12 md:grid-cols-[1fr_4rem_1fr] md:gap-0 md:pl-0">
      {/* Timeline dot (mobile: on the left line, desktop: centre column) */}
      <div className="absolute left-[7px] top-8 z-10 md:static md:col-start-2 md:row-start-1 md:flex md:justify-center md:pt-8">
        <TimelineDot active={inView} />
      </div>

      {/* LEFT HALF — company, role, duration, location */}
      <ScrollScene variant="left" className="md:col-start-1 md:row-start-1">
        <article className="card relative flex h-full flex-col justify-center gap-8 overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan/10 blur-3xl" />
          <span
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none font-mono text-[9rem] font-black leading-none text-transparent opacity-80 [-webkit-text-stroke:1.5px_rgba(0,212,255,0.16)] md:text-[13rem]"
          aria-hidden="true"
        >
            {initials(exp.company)}
          </span>
          <div className="relative">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-cyan/40 bg-gradient-to-br from-cyan/20 to-navy-900 font-mono text-lg font-bold text-cyan shadow-glow">
                {initials(exp.company)}
              </span>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{exp.company}</h3>
                <p className="mt-1 flex items-start gap-2 font-medium leading-snug text-cyan">
                  <HiOutlineBriefcase className="mt-[3px] h-4 w-4 flex-none" aria-hidden="true" />
                  {exp.role}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip inline-flex items-center gap-1.5">
                <HiOutlineCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                {exp.duration}
              </span>
              {exp.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {exp.location}
                </span>
              )}
              {current && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Current role
                </span>
              )}
            </div>
          </div>

          {stack.length > 0 && (
            <div className="relative border-t border-white/5 pt-6">
              <p className="label">Stack</p>
              <ul className="flex flex-wrap gap-2">
                {stack.map((s) => (
                  <li
                    key={s.id ?? s.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-navy-900/70 px-2.5 py-1.5 font-mono text-xs text-slate-200"
                  >
                    <SkillLogo skill={s} className="h-4 w-4" />
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </ScrollScene>

      {/* RIGHT HALF — bullet points */}
      <ScrollScene variant="right" className="md:col-start-3 md:row-start-1">
        <article className="card relative h-full p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <p className="label mb-0">Key contributions</p>
            <span className="font-mono text-xs text-slate-500">{String(exp.bullets.length).padStart(2, '0')}</span>
          </div>
          <ul className="space-y-4">
            {exp.bullets.map((b, j) => (
              <motion.li
                key={j}
                className="group flex gap-3.5 text-[14.5px] leading-relaxed text-slate-300"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + j * 0.09, duration: 0.5 }}
              >
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 font-mono text-[11px] text-cyan transition group-hover:shadow-glow">
                  {j + 1}
                </span>
                <span>{highlightImpact(b)}</span>
              </motion.li>
            ))}
          </ul>
        </article>
      </ScrollScene>
    </li>
  );
}

export default function Experience({ experiences, skills }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  // The glowing line "draws" itself as the timeline scrolls through the viewport.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <section id="experience" className="section">
      <SectionHeading index="02" title="Experience" />
      <div ref={listRef} className="relative">
        {/* Track + scroll-driven glowing fill — left on mobile, centred between the halves on desktop */}
        <div className="absolute bottom-0 left-4 top-0 w-0.5 -translate-x-1/2 bg-cyan/10 md:left-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 left-4 top-0 flex w-2 -translate-x-1/2 justify-center md:left-1/2" aria-hidden="true">
          <motion.div className="absolute inset-0 origin-top rounded-full bg-cyan/40 blur-md" style={{ scaleY: fill }} />
          <motion.div
            className="relative h-full w-0.5 origin-top bg-gradient-to-b from-cyan via-cyan to-cyan/40 shadow-[0_0_12px_#00d4ff]"
            style={{ scaleY: fill }}
          />
        </div>

        <ol className="space-y-16">
          {experiences.map((exp, i) => (
            <ExperienceEntry key={exp.id ?? `${exp.company}-${i}`} exp={exp} skills={skills} />
          ))}
        </ol>
      </div>
    </section>
  );
}
