import { formatNumber } from '../../lib/format';

/** Round the axis up to a clean number: 0 / 5 / 10 / 15 / 20 … */
function niceScale(maxValue, tickCount = 4) {
  if (maxValue <= 0) return { max: tickCount, step: 1 };
  const rough = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const step = Math.max(1, (residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1) * magnitude);
  return { max: Math.ceil(maxValue / step) * step, step };
}

/**
 * Single-series column chart.
 * - one colour, thin columns with rounded tops, hairline grid
 * - hover or keyboard focus on a column shows its value
 * - only the highlighted column (default: the last one) carries a direct label
 * - "View as table" gives every value without hovering
 */
export default function BarChart({ data, unit, label, highlight = data.length - 1, height = 168 }) {
  const { max, step } = niceScale(Math.max(0, ...data.map((item) => item.value)));
  const ticks = [];
  for (let tick = 0; tick <= max; tick += step) ticks.push(tick);
  const percent = (value) => (value / max) * 100;

  return (
    <figure aria-label={label}>
      <div className="flex gap-2">
        <div
          className="relative w-7 shrink-0 text-right text-xs text-ink-400 tabular-nums"
          style={{ height }}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${percent(tick)}%` }}
            >
              {formatNumber(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height }}>
            {ticks.map((tick) => (
              <div
                key={tick}
                className={tick === 0 ? 'absolute inset-x-0 h-px bg-ink-200' : 'absolute inset-x-0 h-px bg-ink-100'}
                style={{ bottom: `${percent(tick)}%` }}
                aria-hidden="true"
              />
            ))}

            <ul className="absolute inset-0 flex items-end">
              {data.map((item, index) => {
                const barHeight = percent(item.value);
                return (
                  <li key={item.label} className="group relative flex h-full flex-1 justify-center">
                    <div
                      tabIndex={0}
                      aria-label={`${item.label}: ${formatNumber(item.value)} ${unit}`}
                      className="relative flex h-full w-full max-w-14 items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div
                        className="w-full max-w-6 rounded-t-[4px] bg-chart transition-[filter] group-hover:brightness-110"
                        style={{ height: `${barHeight}%`, minHeight: item.value > 0 ? 2 : 0 }}
                      />
                      {index === highlight && (
                        <span
                          className="absolute text-xs font-semibold text-ink-700 transition-opacity group-focus-within:opacity-0 group-hover:opacity-0"
                          style={{ bottom: `calc(${barHeight}% + 4px)` }}
                          aria-hidden="true"
                        >
                          {formatNumber(item.value)}
                        </span>
                      )}
                      <div
                        className="pointer-events-none absolute z-10 rounded-lg bg-ink-900 px-2.5 py-1.5 text-center whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                        style={{ bottom: `calc(${barHeight}% + 6px)` }}
                        aria-hidden="true"
                      >
                        <span className="block text-sm font-bold">{formatNumber(item.value)}</span>
                        <span className="block text-xs text-ink-300">
                          {item.label} · {unit}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="mt-2 flex text-xs text-ink-500" aria-hidden="true">
            {data.map((item) => (
              <li key={item.label} className="flex-1 truncate text-center">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-500 select-none hover:text-ink-800">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-ink-500">
              <th className="py-1.5 font-medium">{label}</th>
              <th className="py-1.5 text-right font-medium capitalize">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label} className="border-b border-ink-50">
                <td className="py-1.5">{item.label}</td>
                <td className="py-1.5 text-right tabular-nums">{formatNumber(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
