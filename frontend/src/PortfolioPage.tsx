import { useEffect } from 'react';
import { usePortfolio } from './context/PortfolioContext';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import CursorTrail from './components/CursorTrail';
import ScrollProgress from './components/ScrollProgress';
import Footer from './components/Footer';
import Hero from './sections/Hero/Hero';
import TechKeyboard from './sections/TechKeyboard/TechKeyboard';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';
import { SECTIONS, type SectionId } from './constants/sections';

export default function PortfolioPage() {
  const { data, loading, error, reload } = usePortfolio();

  useEffect(() => {
    if (data?.profile) {
      document.title = `${data.profile.name} — ${data.profile.title}`;
      const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(document.createElement('meta'));
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', data.profile.tagline ?? data.profile.title);
    }
  }, [data?.profile]);

  if (loading && !data) return <Loader />;

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-slate-400">{error}</p>
        <button className="btn-outline" onClick={() => void reload()}>
          Retry
        </button>
      </div>
    );
  }

  const available: Record<SectionId, boolean> = {
    home: true,
    skills: data.skills.length > 0,
    experience: data.experiences.length > 0,
    projects: data.projects.length > 0,
    gallery: data.certificates.length + data.extracurriculars.length > 0,
    contact: true,
  };
  const sections = SECTIONS.filter((s) => available[s.id]);

  return (
    <>
      <ScrollProgress />
      <CursorTrail />
      <Navbar sections={sections} brand={data.profile.name} />
      <main className="overflow-x-clip">
        <Hero profile={data.profile} socialLinks={data.socialLinks} skills={data.skills} experiences={data.experiences} hasProjects={available.projects} />
        {available.skills && <TechKeyboard skills={data.skills} />}
        {available.experience && <Experience experiences={data.experiences} skills={data.skills} />}
        {available.projects && <Projects projects={data.projects} skills={data.skills} />}
        {available.gallery && <Gallery certificates={data.certificates} extracurriculars={data.extracurriculars} />}
        <Contact profile={data.profile} socialLinks={data.socialLinks} />
      </main>
      <Footer profile={data.profile} socialLinks={data.socialLinks} />
    </>
  );
}
