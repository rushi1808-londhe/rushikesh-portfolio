import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { HiOutlineExternalLink, HiOutlinePhotograph, HiCheckCircle, HiLockClosed } from 'react-icons/hi';
import type { Project, ProjectImage, Skill } from '../types';
import SectionHeading from '../components/SectionHeading';
import SkillLogo from '../components/SkillLogo';
import ScrollScene from '../components/ScrollScene';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { highlightImpact } from '../utils/highlight';
import { extractMetrics, initials, type Metric } from '../utils/insights';
import './projects.css';

const ease = [0.22, 1, 0.36, 1] as const;
const ACCENTS = ['#00d4ff', '#5b8cff', '#22d3a6'];
const SLIDE_MS = 4500;

/** Screenshots to show: the project's gallery, else its single cover image. */
function imagesOf(project: Project): ProjectImage[] {
  if (project.images && project.images.length > 0) return project.images;
  return project.imageUrl ? [{ url: project.imageUrl }] : [];
}

/* ------------------------------------------------------------------ Screenshot frame */

interface FrameProps {
  project: Project;
  images: ProjectImage[];
  accent: string;
  figures: Metric[];
  index: number;
  onIndexChange: (i: number) => void;
  onOpen: () => void;
}

function ScreenshotFrame({ project, images, accent, figures, index, onIndexChange, onOpen }: FrameProps) {
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // The screenshot drifts inside the frame as the row scrolls past (parallax).
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-3.5%', '3.5%']);
  const url = (project.githubUrl ?? '').replace(/^https?:\/\/(www\.)?/, '') || project.name;
  const current = images[index];

  useEffect(() => {
    if (paused || images.length < 2) return;
    const t = window.setTimeout(() => onIndexChange((index + 1) % images.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, images.length, onIndexChange]);

  return (
    <div ref={ref} className="group relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-60 blur-3xl" style={{ background: `${accent}2e` }} aria-hidden="true" />
      <div className="shot-ring" style={{ ['--ring' as string]: accent }} aria-hidden="true" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1222] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#0f182c] px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto flex min-w-0 max-w-[70%] items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-400">
            <HiLockClosed className="h-3 w-3 flex-none text-emerald-400/80" aria-hidden="true" />
            <span className="truncate">{url}</span>
          </span>
          {images.length > 1 && (
            <span className="font-mono text-[11px] text-slate-500">
              {index + 1}/{images.length}
            </span>
          )}
        </div>

        {/* Screenshot viewport */}
        <button
          type="button"
          onClick={onOpen}
          className="relative block aspect-[16/9.1] w-full overflow-hidden bg-[#070c18]"
          aria-label={`Open ${project.name} screenshots`}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={current.url}
              src={current.url}
              alt={current.caption ?? project.name}
              loading="lazy"
              draggable={false}
              className="absolute inset-x-0 -top-[4%] h-[108%] w-full object-cover object-left-top"
              style={{ y: imageY }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a15]/85 via-transparent to-transparent" />
          {current.caption && (
            <motion.span
              key={`cap-${current.url}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur"
            >
              {current.caption}
            </motion.span>
          )}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <HiOutlinePhotograph className="h-4 w-4" aria-hidden="true" /> View screenshots
            </span>
          </span>
          {images.length > 1 && !paused && (
            <span
              key={`bar-${index}`}
              className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
              style={{ background: accent, animation: `shot-progress ${SLIDE_MS}ms linear forwards` }}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-white/5 bg-[#0b1222] p-3">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Show ${img.caption ?? `screenshot ${i + 1}`}`}
                aria-current={i === index}
                className={`relative h-12 w-20 flex-none overflow-hidden rounded-md border transition sm:h-14 sm:w-24 ${
                  i === index ? 'opacity-100' : 'border-white/10 opacity-50 hover:opacity-90'
                }`}
                style={i === index ? { borderColor: accent, boxShadow: `0 0 12px ${accent}66` } : undefined}
              >
                <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover object-left-top" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating stat badges */}
      {figures[0] && (
        <div className="badge-float pointer-events-none absolute -left-6 top-[18%] z-10 hidden rounded-xl border border-white/10 bg-[#0f182c]/90 px-4 py-3 shadow-2xl backdrop-blur lg:block">
          <p className="font-mono text-2xl font-bold" style={{ color: accent }}>
            {figures[0].value}
          </p>
          <p className="text-[11px] capitalize text-slate-400">{figures[0].label}</p>
        </div>
      )}
      {figures[1] && (
        <div className="badge-float-delayed pointer-events-none absolute -right-6 top-[46%] z-10 hidden rounded-xl border border-white/10 bg-[#0f182c]/90 px-4 py-3 shadow-2xl backdrop-blur lg:block">
          <p className="font-mono text-2xl font-bold" style={{ color: accent }}>
            {figures[1].value}
          </p>
          <p className="text-[11px] capitalize text-slate-400">{figures[1].label}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Fallback preview (no screenshots) */

function MockPreview({ project, accent }: { project: Project; accent: string }) {
  return (
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b1222]">
      <div className="project-grid-bg absolute inset-0" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl" style={{ background: `${accent}33` }} />
      <span className="relative font-mono text-7xl font-black" style={{ color: accent }}>
        {initials(project.name.split(/\s+[–—-]\s+/)[0])}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Row */

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
const item: Variants = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

function ProjectRow({ project, index, total, skills }: { project: Project; index: number; total: number; skills: Skill[] }) {
  const [title, subtitle] = project.name.split(/\s+[–—-]\s+/, 2);
  const accent = ACCENTS[index % ACCENTS.length];
  const reversed = index % 2 === 1;
  const images = useMemo(() => imagesOf(project), [project]);
  const figures = useMemo(
    () => extractMetrics([project.shortDescription, project.fullDescription ?? '', ...project.bullets], 2, { includePlain: true }),
    [project],
  );
  const [shot, setShot] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lightboxItems: LightboxItem[] = images.map((img) => ({ src: img.url, title: img.caption ?? title, subtitle: project.name }));

  return (
    <article className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Screenshot side */}
      <div className={`lg:col-span-7 ${reversed ? 'lg:order-2' : ''}`}>
        <ScrollScene variant={reversed ? 'right' : 'left'}>
          {images.length > 0 ? (
            <ScreenshotFrame
              project={project}
              images={images}
              accent={accent}
              figures={figures}
              index={Math.min(shot, images.length - 1)}
              onIndexChange={setShot}
              onOpen={() => setLightbox(Math.min(shot, images.length - 1))}
            />
          ) : (
            <MockPreview project={project} accent={accent} />
          )}
        </ScrollScene>
      </div>

      {/* Details side */}
      <motion.div
        className={`relative lg:col-span-5 ${reversed ? 'lg:order-1' : ''}`}
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.span
          variants={item}
          className="pointer-events-none absolute -top-16 right-0 select-none font-mono text-[7rem] font-black leading-none text-transparent lg:-top-20 lg:text-[9rem]"
          style={{ WebkitTextStroke: `1.5px ${accent}40` }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>

        <motion.p variants={item} className="relative font-mono text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
          Project {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </motion.p>
        <motion.h3 variants={item} className="relative mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {title}
        </motion.h3>
        {subtitle && (
          <motion.p variants={item} className="relative mt-1 font-mono text-sm text-slate-400">
            {subtitle}
          </motion.p>
        )}

        <motion.p variants={item} className="relative mt-5 text-[15px] leading-relaxed text-slate-300">
          {highlightImpact(project.shortDescription)}
        </motion.p>

        {project.bullets.length > 0 && (
          <motion.ul variants={item} className="relative mt-5 space-y-2.5">
            {project.bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
                <HiCheckCircle className="mt-0.5 h-4 w-4 flex-none" style={{ color: accent }} aria-hidden="true" />
                <span>{highlightImpact(b)}</span>
              </li>
            ))}
          </motion.ul>
        )}

        {project.tags.length > 0 && (
          <motion.ul variants={item} className="relative mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li key={t} className="chip inline-flex items-center gap-1.5">
                <SkillLogo name={t} skills={skills} className="h-3.5 w-3.5" />
                {t}
              </li>
            ))}
          </motion.ul>
        )}

        <motion.div variants={item} className="relative mt-8 flex flex-wrap gap-3">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <FaGithub className="h-4 w-4" aria-hidden="true" />
              View on GitHub
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <HiOutlineExternalLink className="h-4 w-4" aria-hidden="true" />
              Live Demo
            </a>
          )}
          {images.length > 0 && (
            <button type="button" className="btn-ghost border border-white/10" onClick={() => setLightbox(0)}>
              <HiOutlinePhotograph className="h-4 w-4" aria-hidden="true" />
              Screenshots ({images.length})
            </button>
          )}
        </motion.div>
      </motion.div>

      <Lightbox items={lightboxItems} index={lightbox} onClose={() => setLightbox(null)} onIndexChange={setLightbox} />
    </article>
  );
}

export default function Projects({ projects, skills }: { projects: Project[]; skills: Skill[] }) {
  return (
    <section id="projects" className="section">
      <SectionHeading index="03" title="Projects" />
      <div className="space-y-28 lg:space-y-40">
        {projects.map((p, i) => (
          <ProjectRow key={p.id ?? p.name} project={p} index={i} total={projects.length} skills={skills} />
        ))}
      </div>
    </section>
  );
}
