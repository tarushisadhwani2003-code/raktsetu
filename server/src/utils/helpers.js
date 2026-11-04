/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive exact match, e.g. for city names. */
export const exactInsensitive = (value) => new RegExp(`^${escapeRegex(value.trim())}$`, 'i');

/** Case-insensitive "contains" match for search boxes. */
export const containsInsensitive = (value) => new RegExp(escapeRegex(value.trim()), 'i');

/** "new delhi" -> "New Delhi" */
export const toTitleCase = (value) =>
  String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());

const DAY_MS = 24 * 60 * 60 * 1000;

export const addDays = (date, days) => new Date(new Date(date).getTime() + days * DAY_MS);

export const startOfDay = (date = new Date()) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const ageOn = (dateOfBirth, on = new Date()) => {
  const dob = new Date(dateOfBirth);
  let age = on.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    on.getMonth() < dob.getMonth() || (on.getMonth() === dob.getMonth() && on.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

/** Read page/limit from a query object and return Mongo skip/limit values. */
export function getPagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export const paginated = (items, total, { page, limit }) => ({
  items,
  total,
  page,
  pages: Math.max(1, Math.ceil(total / limit)),
});

/** "+91 98765-43210" -> "9876543210" */
export const normaliseMobile = (value) =>
  String(value)
    .replace(/[\s-]/g, '')
    .replace(/^(\+91|91|0)(?=\d{10}$)/, '');

const IST = 'Asia/Kolkata';

/** Format a date like "12 Jan 2027" (Indian time). */
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: IST });

/**
 * The last `count` calendar months in Indian time, oldest first, e.g. [{ key: '2026-06', label: 'Jun' }, ...],
 * plus the moment the oldest month started.
 */
export function lastMonths(count) {
  const [year, month] = new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number);

  const months = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - 1 - offset, 1));
    months.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
    });
  }

  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const since = new Date(Date.UTC(year, month - count, 1) - IST_OFFSET_MS);
  return { months, since, timezone: IST };
}
