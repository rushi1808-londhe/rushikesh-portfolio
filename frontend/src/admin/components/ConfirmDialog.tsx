import Modal from './Modal';

interface Props {
  open: boolean;
  message: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, message, busy, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title="Please confirm" onClose={onCancel}>
      <p className="text-sm text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn bg-rose-500 text-white hover:bg-rose-400" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
