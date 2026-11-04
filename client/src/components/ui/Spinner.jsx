import { cn } from '../../lib/cn';

export default function Spinner({ className, label = 'Loading' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
    />
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-500">
      <Spinner className="size-7 text-brand-600" label={label} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-ink-100/80', className)} aria-hidden="true" />;
}
