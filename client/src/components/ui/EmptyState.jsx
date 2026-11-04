import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '../../lib/cn';

export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-ink-50 text-xl text-ink-400">
          <FontAwesomeIcon icon={icon} />
        </div>
      )}
      <h3 className="text-base font-bold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
