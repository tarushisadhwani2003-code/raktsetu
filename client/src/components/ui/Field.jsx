import { faChevronDown, faCircleExclamation, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useId, useState } from 'react';
import { cn } from '../../lib/cn';

const CONTROL =
  'block w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.9375rem] text-ink-900 shadow-xs transition ' +
  'focus:border-ink-500 focus:ring-4 focus:ring-ink-500/15 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400';
const INVALID = 'border-brand-500 focus:border-brand-500 focus:ring-brand-500/15';

export function Input({ className, invalid, ...props }) {
  return (
    <input
      className={cn(CONTROL, 'h-11', invalid && INVALID, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(CONTROL, 'h-11 appearance-none pr-10', invalid && INVALID, className)}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-ink-400"
      />
    </div>
  );
}

export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      className={cn(CONTROL, 'min-h-28 py-2.5 leading-relaxed', invalid && INVALID, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ id, label, hint, error, required, optional, children, className }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-800">
          {label}
          {required && (
            <span className="text-brand-600" aria-hidden="true">
              {' *'}
            </span>
          )}
          {optional && <span className="font-normal text-ink-400"> (optional)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-brand-700">
          <FontAwesomeIcon icon={faCircleExclamation} className="mt-[0.2rem] text-xs" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function useFieldIds(id, error, hint) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return { fieldId, describedBy };
}

export function TextField({ id, label, hint, error, required, optional, className, ...props }) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <Input id={fieldId} invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props} />
    </Field>
  );
}

export function SelectField({ id, label, hint, error, required, optional, className, children, ...props }) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <Select id={fieldId} invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props}>
        {children}
      </Select>
    </Field>
  );
}

export function TextareaField({ id, label, hint, error, required, optional, className, ...props }) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);
  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <Textarea id={fieldId} invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props} />
    </Field>
  );
}

export function PasswordField({ id, label = 'Password', hint, error, required, className, ...props }) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);
  const [visible, setVisible] = useState(false);
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          invalid={Boolean(error)}
          aria-describedby={describedBy}
          required={required}
          className="pr-12"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-400 hover:text-ink-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
        </button>
      </div>
    </Field>
  );
}

export function Checkbox({ id, label, error, className, ...props }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="flex cursor-pointer items-start gap-3">
        <input
          id={fieldId}
          type="checkbox"
          className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer accent-brand-600"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        <span className="text-sm leading-relaxed text-ink-700">{label}</span>
      </label>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 ml-7 text-sm text-brand-700">
          {error}
        </p>
      )}
    </div>
  );
}
