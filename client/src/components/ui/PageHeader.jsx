export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
