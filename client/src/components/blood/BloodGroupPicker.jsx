import { BLOOD_GROUPS } from '../../lib/constants';
import { cn } from '../../lib/cn';

/** Toggle buttons for choosing a blood group. Pass allowAny to add an "Any" option (value ''). */
export default function BloodGroupPicker({
  value,
  onChange,
  label = 'Blood group',
  allowAny = false,
  columns = 'grid-cols-4',
  className,
  invalid,
}) {
  const options = allowAny ? ['', ...BLOOD_GROUPS] : BLOOD_GROUPS;
  return (
    <div role="group" aria-label={label} className={cn('grid gap-2', columns, className)}>
      {options.map((group) => {
        const selected = value === group;
        return (
          <button
            key={group || 'any'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(group)}
            className={cn(
              'h-11 rounded-xl border text-sm font-bold transition',
              selected
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-900/10'
                : cn(
                    'bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
                    invalid ? 'border-brand-400' : 'border-ink-200',
                  ),
            )}
          >
            {group || 'Any'}
          </button>
        );
      })}
    </div>
  );
}
