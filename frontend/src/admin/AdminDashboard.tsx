import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { ToastProvider } from './components/Toast';
import { messagesApi } from '../api/admin';
import ProfileTab from './tabs/ProfileTab';
import ExperienceTab from './tabs/ExperienceTab';
import ProjectsTab from './tabs/ProjectsTab';
import SkillsTab from './tabs/SkillsTab';
import CertificatesTab from './tabs/CertificatesTab';
import ExtracurricularsTab from './tabs/ExtracurricularsTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import BucketListTab from './tabs/BucketListTab';
import MessagesTab from './tabs/MessagesTab';

type TabId = 'profile' | 'experience' | 'projects' | 'skills' | 'certificates' | 'extracurriculars' | 'social' | 'bucketlist' | 'messages';

const TABS: { id: TabId; label: string; Component?: ComponentType }[] = [
  { id: 'profile', label: 'Profile', Component: ProfileTab },
  { id: 'experience', label: 'Experience', Component: ExperienceTab },
  { id: 'projects', label: 'Projects', Component: ProjectsTab },
  { id: 'skills', label: 'Skills', Component: SkillsTab },
  { id: 'certificates', label: 'Certificates', Component: CertificatesTab },
  { id: 'extracurriculars', label: 'Extracurriculars', Component: ExtracurricularsTab },
  { id: 'social', label: 'Social Links', Component: SocialLinksTab },
  { id: 'bucketlist', label: 'Bucket List', Component: BucketListTab },
  { id: 'messages', label: 'Messages' },
];

const TAB_KEY = 'portfolio.admin.tab';

export default function AdminDashboard() {
  const { username, logout } = useAuth();
  const [tab, setTab] = useState<TabId>(() => (sessionStorage.getItem(TAB_KEY) as TabId) || 'profile');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(TAB_KEY, tab);
  }, [tab]);

  useEffect(() => {
    messagesApi
      .list()
      .then((list) => setUnread(list.filter((m) => !m.read).length))
      .catch(() => undefined);
  }, []);

  const onUnreadChange = useCallback((n: number) => setUnread(n), []);
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-base">
        <header className="sticky top-0 z-40 border-b border-cyan/10 bg-base/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan/40 font-mono text-sm font-bold text-cyan">A</span>
              <div>
                <p className="text-sm font-semibold text-white">Portfolio Admin</p>
                <p className="font-mono text-[11px] text-slate-500">{username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-2 text-xs">
                View site ↗
              </a>
              <button className="btn-outline px-3 py-2 text-xs" onClick={() => void logout()}>
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <nav className="-mx-5 mb-8 overflow-x-auto px-5 sm:mx-0 sm:px-0" aria-label="Admin sections">
            <ul className="flex min-w-max gap-1 rounded-xl border border-navy-600 bg-navy-800/60 p-1">
              {TABS.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setTab(t.id)}
                    className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${tab === t.id ? 'text-navy-950' : 'text-slate-400 hover:text-white'}`}
                    aria-current={tab === t.id ? 'page' : undefined}
                  >
                    {tab === t.id && (
                      <motion.span
                        layoutId="admin-tab"
                        className="absolute inset-0 rounded-lg bg-cyan shadow-glow"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      {t.label}
                      {t.id === 'messages' && unread > 0 && (
                        <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? 'bg-navy-950 text-cyan' : 'bg-cyan text-navy-950'}`}>
                          {unread}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {active.id === 'messages' ? <MessagesTab onUnreadChange={onUnreadChange} /> : active.Component && <active.Component />}
          </motion.div>
        </div>
      </div>
    </ToastProvider>
  );
}
