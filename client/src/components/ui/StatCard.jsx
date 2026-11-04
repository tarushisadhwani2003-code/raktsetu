import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  blue: 'bg-sky-50 text-sky-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  ink: 'bg-ink-50 text-ink-600',
};

export default function StatCard({ label, value, icon, tone = 'brand', hint, to }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {icon && (
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}
      </div>
      <p className="mt-2 text-[1.75rem] leading-none font-bold tracking-tight text-ink-900">{value}</p>
      {(hint || to) && (
        <p className="mt-2 flex items-center justify-between gap-2 text-sm text-ink-500">
          <span>{hint}</span>
          {to && (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-xs text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
            />
          )}
        </p>
      )}
    </>
  );

  const className = 'group rounded-2xl border border-ink-100 bg-white p-5 shadow-xs';
  return to ? (
    <Link to={to} className={cn(className, 'transition hover:border-ink-200 hover:shadow-md')}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
