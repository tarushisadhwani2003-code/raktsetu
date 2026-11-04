import { useId } from 'react';
import { cn } from '../../lib/cn';

/** The RaktSetu mark: a blood drop with a bridge ("setu") inside. */
export function LogoMark({ className }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 48 48" className={cn('shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cf4453" />
          <stop offset="1" stopColor="#8c1625" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M24 3.5S8.5 20.5 8.5 30.7C8.5 39.4 15.4 45 24 45s15.5-5.6 15.5-14.3C39.5 20.5 24 3.5 24 3.5Z"
      />
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path strokeWidth="2.6" d="M14.5 33h19" />
        <path strokeWidth="2.4" d="M15.5 33Q24 21.5 32.5 33" />
        <path strokeWidth="1.8" d="M20 28.5V33M24 27.25V33M28 28.5V33" />
      </g>
    </svg>
  );
}

export default function Logo({ inverted = false, tagline = false, className }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="size-9" />
      <span className="leading-none">
        <span className={cn('block text-xl font-extrabold tracking-tight', inverted ? 'text-white' : 'text-ink-900')}>
          Rakt<span className={inverted ? 'text-brand-300' : 'text-brand-600'}>Setu</span>
        </span>
        {tagline && (
          <span
            className={cn(
              'mt-1 block text-[0.6875rem] font-semibold tracking-[0.12em] uppercase',
              inverted ? 'text-ink-300' : 'text-ink-400',
            )}
          >
            Blood bridge
          </span>
        )}
      </span>
    </span>
  );
}
