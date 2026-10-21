import { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SiGmail } from 'react-icons/si';
import { HiOutlineDownload, HiOutlineMail, HiArrowRight } from 'react-icons/hi';
import type { Experience, Profile, Skill, SocialLink } from '../../types';
import Particles from '../../components/Particles';
import SocialIcon from '../../components/SocialIcon';
import CodeEditor from './CodeEditor';
import { generateSnippet, tokenize } from '../../utils/heroSnippet';
import { useTypewriterLoop } from '../../hooks/useTypewriter';
import { scrollToSection } from '../../utils/scroll';
import { useCompact } from '../../hooks/useCompact';
import './hero.css';

interface Props {
  profile: Profile;
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  hasProjects: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ profile, socialLinks, skills, experiences, hasProjects }: Props) {
  const roles = profile.speechLines.length > 0 ? profile.speechLines : [profile.title];
  const { text: role } = useTypewriterLoop(roles, { enabled: true, typeDelay: 65, deleteDelay: 32, holdDelay: 1600 });
  // Admin-configured editor text, or a snippet generated from live data when none is set.
  const snippet = useMemo(
    () => tokenize(profile.heroCode?.trim() ? profile.heroCode : generateSnippet(profile, skills, experiences)),
    [profile, skills, experiences],
  );

  // Scroll-linked parallax: copy drifts up and fades, the editor lags behind and tilts away.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const editorY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const editorRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const editorScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  // Parallax only on larger screens; on phones it just pushes the editor out of view.
  const compact = useCompact();

  const [firstName, ...restParts] = profile.name.split(/\s+/);
  const lastName = restParts.join(' ');

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease },
  });

  return (
    <section ref={sectionRef} id="home" className="relative flex min-h-screen items-center overflow-hidden bg-base">
      <div className="hero-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <Particles />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-24">
        {/* LEFT — identity */}
        <motion.div className="text-center lg:text-left" style={compact ? undefined : { y: textY, opacity: textOpacity }}>
          <motion.h1
            {...fadeUp(0.1)}
            className="text-[clamp(2.9rem,11vw,5.25rem)] font-black uppercase leading-[0.92] tracking-tight text-white lg:text-[clamp(3.5rem,6.2vw,5.25rem)]"
          >
            <span className="block">{firstName}</span>
            {lastName && (
              <span className="block bg-gradient-to-r from-cyan via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.35)]">
                {lastName}
              </span>
            )}
          </motion.h1>

          <motion.p {...fadeUp(0.3)} className="mt-6 h-8 font-mono text-lg text-slate-200 sm:text-xl" aria-label={roles.join(', ')}>
            <span className="text-cyan" aria-hidden="true">
              &gt;{' '}
            </span>
            <span aria-hidden="true">{role}</span>
            <span className="type-caret" aria-hidden="true" />
          </motion.p>

          {profile.tagline && (
            <motion.p {...fadeUp(0.45)} className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              {profile.tagline}
            </motion.p>
          )}

          <motion.div {...fadeUp(0.6)} className="hero-ctas mt-9 flex flex-wrap justify-center gap-2.5 lg:justify-start">
            {hasProjects && (
              <button className="btn-primary group" onClick={() => scrollToSection('projects')}>
                View My Work
                <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            )}
            <button className="btn-outline" onClick={() => scrollToSection('contact')}>
              <HiOutlineMail className="h-4 w-4" aria-hidden="true" />
              Contact Me
            </button>
            {profile.resumeUrl && (
              <a
                className="btn border border-white/60 text-white hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                href={profile.resumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <HiOutlineDownload className="h-4 w-4" aria-hidden="true" />
                Download Resume
              </a>
            )}
          </motion.div>

          {(socialLinks.length > 0 || profile.email) && (
            <motion.div {...fadeUp(0.75)} className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              {socialLinks.map((s) => (
                <a
                  key={s.id ?? s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  title={s.platform}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/25 bg-navy-800/60 text-slate-300 transition hover:-translate-y-1 hover:border-cyan hover:text-cyan hover:shadow-glow"
                >
                  <SocialIcon name={s.icon ?? s.platform} className="h-5 w-5" />
                </a>
              ))}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  aria-label={`Email ${profile.email}`}
                  title={profile.email}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/25 bg-navy-800/60 text-slate-300 transition hover:-translate-y-1 hover:border-cyan hover:text-cyan hover:shadow-glow"
                >
                  <SiGmail className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
              <span className="ml-2 hidden h-px w-20 bg-gradient-to-r from-cyan/50 to-transparent sm:block" aria-hidden="true" />
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT — code editor */}
        <motion.div
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.35, ease }}
        >
          <motion.div style={compact ? undefined : { y: editorY, rotateX: editorRotate, scale: editorScale, transformPerspective: 1200 }}>
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-cyan/10 blur-3xl" aria-hidden="true" />
            <CodeEditor fileName="portfolio.ts" tokens={snippet} />
          </motion.div>
        </motion.div>
      </div>

      <button onClick={() => scrollToSection('skills')} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block" aria-label="Scroll down">
        <span className="flex h-10 w-6 justify-center rounded-full border-2 border-cyan/40 pt-2">
          <span className="scroll-cue-dot h-2 w-1 rounded-full bg-cyan" />
        </span>
      </button>
    </section>
  );
}
