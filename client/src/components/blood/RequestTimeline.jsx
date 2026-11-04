import { REQUEST_STATUS } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/format';

const DOT = {
  amber: 'bg-amber-400',
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  gray: 'bg-ink-300',
};

export default function RequestTimeline({ history = [] }) {
  return (
    <ol className="space-y-5">
      {history.map((entry, index) => {
        const status = REQUEST_STATUS[entry.status] ?? { label: entry.status, tone: 'gray' };
        const isLast = index === history.length - 1;
        return (
          <li key={`${entry.status}-${entry.at}`} className="relative flex gap-4">
            {!isLast && (
              <span className="absolute top-6 bottom-[-1.25rem] left-[0.5625rem] w-0.5 bg-ink-100" aria-hidden="true" />
            )}
            <span
              className={cn('relative mt-1 size-5 shrink-0 rounded-full ring-4 ring-white', DOT[status.tone])}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">{status.label}</p>
              <p className="text-sm text-ink-500">
                {formatDateTime(entry.at)}
                {entry.by?.name && ` · ${entry.by.name}`}
              </p>
              {entry.note && <p className="mt-1 text-sm leading-relaxed text-ink-600">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
