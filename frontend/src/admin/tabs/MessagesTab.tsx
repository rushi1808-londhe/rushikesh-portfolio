import { useCallback, useEffect, useState } from 'react';
import { messagesApi } from '../../api/admin';
import { errorMessage } from '../../api/client';
import type { ContactMessage } from '../../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function MessagesTab({ onUnreadChange }: { onUnreadChange: (n: number) => void }) {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await messagesApi.list();
      setMessages(list);
      onUnreadChange(list.filter((m) => !m.read).length);
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast, onUnreadChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (m: ContactMessage, read = !m.read) => {
    try {
      await messagesApi.setRead(m.id, read);
      await load();
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };

  const open = (m: ContactMessage) => {
    setExpanded((cur) => (cur === m.id ? null : m.id));
    if (!m.read) void toggleRead(m, true);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await messagesApi.remove(deleting.id);
      setDeleting(null);
      toast('success', 'Message deleted');
      await load();
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Messages <span className="ml-1 font-mono text-sm text-slate-500">({messages.length})</span>
        </h2>
        <button className="btn-outline" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">No messages yet.</div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`card overflow-hidden ${m.read ? '' : 'border-cyan/40'}`}>
              <button className="flex w-full items-center gap-4 px-5 py-4 text-left" onClick={() => open(m)} aria-expanded={expanded === m.id}>
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${m.read ? 'bg-navy-500' : 'bg-cyan shadow-glow'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${m.read ? 'text-slate-300' : 'font-semibold text-white'}`}>
                    {m.name} <span className="font-normal text-slate-500">&lt;{m.email}&gt;</span>
                  </p>
                  <p className="truncate text-sm text-slate-500">{m.message}</p>
                </div>
                <time className="flex-none font-mono text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</time>
              </button>
              {expanded === m.id && (
                <div className="border-t border-navy-600 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="btn-primary px-3 py-2 text-xs" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`}>
                      Reply
                    </a>
                    <button className="btn-ghost px-3 py-2 text-xs" onClick={() => void toggleRead(m)}>
                      Mark as {m.read ? 'unread' : 'read'}
                    </button>
                    <button className="btn-ghost px-3 py-2 text-xs text-rose-400" onClick={() => setDeleting(m)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!deleting}
        message={`Delete the message from ${deleting?.name ?? ''}?`}
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
