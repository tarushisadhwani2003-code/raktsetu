import { useApi } from './useApi';

/** Public site settings from the server, e.g. whether demo accounts are available. */
export function useSiteConfig() {
  const { data } = useApi('/public/config');
  return data ?? { demoMode: false };
}
