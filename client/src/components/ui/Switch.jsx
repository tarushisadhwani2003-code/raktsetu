import { useId } from 'react';
import { cn } from '../../lib/cn';

export default function Switch({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p id={`${id}-label`} className="font-semibold text-ink-900">
          {label}
        </p>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-sm text-ink-500">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-emerald-500' : 'bg-ink-200',
        )}
      >
        <span
          className={cn(
            'inline-block size-6 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
