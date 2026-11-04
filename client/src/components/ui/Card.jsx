import { cn } from '../../lib/cn';

export default function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component className={cn('rounded-2xl border border-ink-100 bg-white shadow-xs', className)} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div
      className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4', className)}
    >
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
