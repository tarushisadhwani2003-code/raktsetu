import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '../../lib/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700 active:bg-brand-800',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  outline: 'border border-ink-200 bg-white text-ink-800 shadow-xs hover:border-ink-300 hover:bg-ink-50',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-ink-700 hover:bg-ink-100/70',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  white: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50',
};

const SIZES = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
};

/**
 * <Button>Save</Button>
 * <Button as={Link} to="/register" variant="outline">Register</Button>
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled,
  className,
  children,
  type,
  ...props
}) {
  const isButton = Component === 'button';
  return (
    <Component
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...(isButton && { type: type ?? 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon && <FontAwesomeIcon icon={icon} />}
      {children}
      {iconRight && !loading && <FontAwesomeIcon icon={iconRight} />}
    </Component>
  );
}
