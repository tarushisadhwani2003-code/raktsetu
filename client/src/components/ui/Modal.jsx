import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useId, useRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Accessible dialog built on the native <dialog> element
 * (focus trapping, Escape to close and the backdrop come for free).
 */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const ref = useRef(null);
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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-white p-0 text-ink-800 shadow-2xl',
        size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
      )}
    >
      {open && (
        <div className="animate-fade-in">
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm leading-relaxed text-ink-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-ink-100 bg-ink-50/60 px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
