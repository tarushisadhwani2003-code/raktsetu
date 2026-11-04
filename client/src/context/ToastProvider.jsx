import { faCircleCheck, faCircleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { ToastContext } from './toast-context';

const STYLES = {
  success: { icon: faCircleCheck, className: 'text-emerald-600' },
  error: { icon: faCircleExclamation, className: 'text-brand-600' },
  info: { icon: faCircleInfo, className: 'text-chart' },
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const show = useCallback(
    (message, tone) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 4500);
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-5 sm:items-end"
      >
        {toasts.map((item) => {
          const style = STYLES[item.tone] ?? STYLES.info;
          return (
            <div
              key={item.id}
              role={item.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 text-sm text-ink-800 shadow-lg shadow-ink-900/10"
            >
              <FontAwesomeIcon icon={style.icon} className={cn('mt-0.5 text-base', style.className)} />
              <p className="flex-1 leading-relaxed">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-m-1 rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                aria-label="Dismiss notification"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
