import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '../../lib/cn';

const TONES = {
  info: { icon: faCircleInfo, className: 'border-sky-200 bg-sky-50 text-sky-900', iconClass: 'text-sky-600' },
  warning: {
    icon: faTriangleExclamation,
    className: 'border-amber-200 bg-amber-50 text-amber-900',
    iconClass: 'text-amber-600',
  },
  error: {
    icon: faCircleExclamation,
    className: 'border-brand-200 bg-brand-50 text-brand-900',
    iconClass: 'text-brand-600',
  },
  success: {
    icon: faCircleCheck,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
};

export default function Alert({ tone = 'info', title, children, action, className }) {
  const style = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center',
        style.className,
        className,
      )}
    >
      <div className="flex flex-1 gap-3">
        <FontAwesomeIcon icon={style.icon} className={cn('mt-0.5 text-base', style.iconClass)} />
        <div className="leading-relaxed">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-7 sm:pl-0">{action}</div>}
    </div>
  );
}
