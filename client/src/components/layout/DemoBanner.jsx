import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { useSiteConfig } from '../../hooks/useSiteConfig';

export default function DemoBanner() {
  const { demoMode } = useSiteConfig();
  if (!demoMode) return null;
  return (
    <div className="bg-ink-900 px-4 py-2 text-center text-xs text-ink-200">
      <FontAwesomeIcon icon={faFlask} className="mr-1.5 text-brand-300" />
      Demo mode — blood banks, donors and requests are sample data.{' '}
      <Link to="/login" className="font-semibold text-white underline underline-offset-2">
        Try a demo account
      </Link>
    </div>
  );
}
