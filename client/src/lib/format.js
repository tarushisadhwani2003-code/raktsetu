const LOCALE = 'en-IN';
const pad = (value) => String(value).padStart(2, '0');

export const formatDate = (value, options = {}) =>
  value
    ? new Date(value).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', ...options })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(LOCALE, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '—';

export const formatNumber = (value) => new Intl.NumberFormat(LOCALE).format(value ?? 0);

export const pluralize = (count, word, plural = `${word}s`) => `${formatNumber(count)} ${count === 1 ? word : plural}`;

/** "just now", "5 min ago", "3 hours ago", "yesterday", "4 days ago", then a date. */
export function timeAgo(value) {
  if (!value) return '—';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

/** Date -> "YYYY-MM-DD" in local time, for <input type="date">. */
export function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayInput = () => toDateInput(new Date());

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const mapsUrl = (...parts) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.filter(Boolean).join(', '))}`;

export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Whole days between a past date and now. */
export const daysSince = (value) => Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));

const HONORIFICS = new Set(['dr', 'mr', 'mrs', 'ms', 'miss', 'shri', 'smt', 'prof']);

/** "Dr. Meera Saxena" -> "Meera" (skips titles so greetings sound natural). */
export function firstName(name = '') {
  const parts = name.trim().split(/\s+/);
  const first = parts.find((part) => !HONORIFICS.has(part.replace(/\.$/, '').toLowerCase()));
  return first ?? parts[0] ?? '';
}
