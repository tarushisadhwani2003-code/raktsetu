import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../lib/api';

/**
 * Load data from a GET endpoint.
 *   const { data, loading, error, reload, setData } = useApi('/donor/overview');
 * While new data loads, the previous data stays visible (no flicker).
 */
export function useApi(path, { params, enabled = true } = {}) {
  const paramsKey = JSON.stringify(params ?? {});
  const [version, setVersion] = useState(0);
  const requestKey = `${path}|${paramsKey}|${version}`;
  const [result, setResult] = useState({ key: null, data: undefined, error: null });
  const active = enabled && Boolean(path);

  useEffect(() => {
    if (!active) return undefined;
    const controller = new AbortController();
    api
      .get(path, { params: JSON.parse(paramsKey), signal: controller.signal })
      .then((response) => setResult({ key: requestKey, data: response.data, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({ key: requestKey, data: previous.data, error: getErrorMessage(error) }));
      });
    return () => controller.abort();
  }, [active, path, paramsKey, requestKey]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const setData = useCallback(
    (updater) =>
      setResult((previous) => ({
        ...previous,
        data: typeof updater === 'function' ? updater(previous.data) : updater,
      })),
    [],
  );

  return {
    data: result.data,
    error: result.key === requestKey ? result.error : null,
    loading: active && result.key !== requestKey,
    reload,
    setData,
  };
}
