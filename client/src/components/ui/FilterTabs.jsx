import { cn } from '../../lib/cn';

/** Segmented filter buttons: items = [{ value, label, count? }] */
export default function FilterTabs({ items, value, onChange, label, className }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex max-w-full gap-1 overflow-x-auto rounded-xl bg-ink-100/70 p-1', className)}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              selected ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  selected ? 'bg-brand-50 text-brand-700' : 'bg-ink-200/60 text-ink-600',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
