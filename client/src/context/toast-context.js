import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/** toast.success('Saved'), toast.error('Could not save'), toast.info('Heads up') */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
