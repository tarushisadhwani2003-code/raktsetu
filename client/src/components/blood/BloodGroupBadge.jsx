import { cn } from '../../lib/cn';

const SIZES = {
  sm: 'h-7 min-w-9 rounded-lg px-1.5 text-xs',
  md: 'h-9 min-w-11 rounded-xl px-2 text-sm',
  lg: 'size-14 rounded-2xl text-xl',
};

export default function BloodGroupBadge({ group, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-brand-50 font-extrabold text-brand-700 ring-1 ring-brand-100 ring-inset',
        SIZES[size],
        className,
      )}
    >
      <span className="sr-only">Blood group </span>
      {group}
    </span>
  );
}
