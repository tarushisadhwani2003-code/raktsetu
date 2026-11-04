import { useEffect } from 'react';

const DEFAULT_TITLE = 'RaktSetu — Donate blood, save lives';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · RaktSetu` : DEFAULT_TITLE;
  }, [title]);
}
