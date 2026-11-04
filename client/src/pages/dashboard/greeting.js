/** "Good morning" / "Good afternoon" / "Good evening" for the current time. */
export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export { firstName } from '../../lib/format';
