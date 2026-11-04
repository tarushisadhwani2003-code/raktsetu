import { cn } from '../../lib/cn';

const TONES = {
  gray: 'bg-ink-50 text-ink-600 ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
};

export default function Badge({ tone = 'gray', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset',
        TONES[tone] ?? TONES.gray,
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Badge for a value from one of the status maps in lib/constants (REQUEST_STATUS, URGENCY…). */
export function StatusBadge({ map, value, className }) {
  const entry = map[value] ?? { label: value, tone: 'gray' };
  return (
    <Badge tone={entry.tone} dot className={className}>
      {entry.label}
    </Badge>
  );
}
