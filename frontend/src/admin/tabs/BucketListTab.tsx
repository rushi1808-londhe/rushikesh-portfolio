import CrudTab from '../components/CrudTab';
import { bucketListApi } from '../../api/admin';
import type { BucketListItem } from '../../types';

export default function BucketListTab() {
  return (
    <div>
      <p className="mb-6 text-sm text-slate-400">
        Shown on its own page at{' '}
        <a href="/bucketlist" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
          /bucketlist ↗
        </a>
        . Use ▲ ▼ to arrange the order.
      </p>
      <CrudTab<BucketListItem>
        title="Bucket List"
        api={bucketListApi}
        empty={() => ({ title: '', description: '', done: false, completedOn: '', displayOrder: 0 })}
        summary={(b) => ({
          primary: b.title,
          secondary: b.done ? `✓ Done${b.completedOn ? ` · ${b.completedOn}` : ''}` : 'Not yet',
        })}
        fields={[
          { key: 'title', label: 'Title', type: 'text', required: true, full: true, placeholder: 'e.g. See the northern lights' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Why it matters, or the story once it’s done…' },
          {
            key: 'done',
            label: 'Done',
            type: 'custom',
            render: (item, set) => (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-cyan"
                    checked={item.done}
                    onChange={(e) => set({ done: e.target.checked })}
                  />
                  Done ✓
                </label>
                {item.done && (
                  <div>
                    <label htmlFor="f-completedOn" className="label">
                      Completed on
                    </label>
                    <input
                      id="f-completedOn"
                      className="input"
                      value={item.completedOn ?? ''}
                      placeholder="e.g. March 2026"
                      onChange={(e) => set({ completedOn: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
