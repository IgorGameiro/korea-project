'use client';

import { buttonClasses } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

/** "Delete X?" confirmation, so nothing is removed by a single misclick. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p>{body}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={buttonClasses('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={buttonClasses('primary', 'bg-coral-700 hover:bg-coral-600')}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
