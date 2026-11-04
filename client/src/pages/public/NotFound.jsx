import { faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import { LogoMark } from '../../components/layout/Logo';
import Button from '../../components/ui/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <LogoMark className="size-16 opacity-90" />
      <p className="mt-6 text-sm font-bold tracking-[0.2em] text-brand-600 uppercase">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">This page could not be found</h1>
      <p className="mt-3 max-w-md text-ink-600">The link may be broken, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/" variant="outline" icon={faArrowLeft}>
          Back to home
        </Button>
        <Button as={Link} to="/find-blood" icon={faMagnifyingGlass}>
          Find blood
        </Button>
      </div>
    </div>
  );
}
