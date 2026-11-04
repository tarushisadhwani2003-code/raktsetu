import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-3" aria-label="Pagination">
      <Button variant="outline" size="sm" icon={faChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-ink-500">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        iconRight={faChevronRight}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
