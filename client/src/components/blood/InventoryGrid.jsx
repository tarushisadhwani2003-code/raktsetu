import { BLOOD_GROUPS, STOCK_LEVEL, stockLevel } from '../../lib/constants';
import { cn } from '../../lib/cn';

const LEVEL_STYLES = {
  ok: { text: 'text-emerald-700', track: 'bg-emerald-100', fill: 'bg-emerald-500' },
  low: { text: 'text-amber-700', track: 'bg-amber-100', fill: 'bg-amber-500' },
  out: { text: 'text-red-700', track: 'bg-red-100', fill: 'bg-red-500' },
};

/** Units are drawn against this many units for the little meter under each group. */
const METER_FULL = 40;

/** Stock tiles for the 8 blood groups, with a text status (never colour alone). */
export default function InventoryGrid({ inventory, highlight, onSelect, className }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {BLOOD_GROUPS.map((group) => {
        const units = inventory?.[group] ?? 0;
        const level = stockLevel(units);
        const style = LEVEL_STYLES[level];
        const Tag = onSelect ? 'button' : 'div';
        return (
          <li key={group}>
            <Tag
              {...(onSelect && { type: 'button', onClick: () => onSelect(group) })}
              className={cn(
                'block w-full rounded-xl border bg-white p-3.5 text-left transition',
                highlight === group ? 'border-brand-300 ring-4 ring-brand-100' : 'border-ink-100',
                onSelect && 'hover:border-ink-300',
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-extrabold text-ink-900">{group}</span>
                <span className={cn('text-xs font-semibold', style.text)}>{STOCK_LEVEL[level].label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-ink-900">
                {units}
                <span className="ml-1 text-sm font-medium text-ink-400">{units === 1 ? 'unit' : 'units'}</span>
              </p>
              <div className={cn('mt-2 h-1.5 overflow-hidden rounded-full', style.track)} aria-hidden="true">
                <div
                  className={cn('h-full rounded-full', style.fill)}
                  style={{ width: `${Math.min(100, (units / METER_FULL) * 100)}%` }}
                />
              </div>
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}

/** Compact one-line version used in lists. */
export function InventoryStrip({ inventory, highlight, className }) {
  return (
    <ul className={cn('grid grid-cols-4 gap-1.5 sm:grid-cols-8', className)} aria-label="Units in stock by blood group">
      {BLOOD_GROUPS.map((group) => {
        const units = inventory?.[group] ?? 0;
        return (
          <li
            key={group}
            className={cn(
              'rounded-lg px-2 py-1.5 text-center',
              group === highlight ? 'bg-brand-50 ring-1 ring-brand-200 ring-inset' : 'bg-ink-50',
            )}
          >
            <span className="block text-xs font-bold text-ink-600">{group}</span>
            <span className={cn('block text-sm font-bold tabular-nums', units === 0 ? 'text-ink-300' : 'text-ink-900')}>
              {units}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
