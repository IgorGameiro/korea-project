'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { Icon } from './icon';

/**
 * Modal dialog on the native <dialog> element: showModal() gives focus trapping, Escape to close,
 * an inert background and focus restoration for free.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations('modal');
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[var(--radius-card)] p-0 shadow-xl backdrop:bg-navy-900/50"
    >
      <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="-m-1 rounded-full p-1 text-navy-700 hover:bg-navy-50"
        >
          <Icon name="x" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
