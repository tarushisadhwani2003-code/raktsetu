import { faArrowLeft, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { PageLoader } from '../ui/Spinner';
import Logo, { LogoMark } from './Logo';

const POINTS = [
  'Live blood stock from verified blood banks',
  'Requests go straight to the blood bank, with status updates',
  'Donors are matched by blood group and city — contact details stay private',
];

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Signed-in users go back to where they were heading (or their dashboard).
  if (!loading && user) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'} replace />;
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
      <aside className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between">
        <LogoMark className="pointer-events-none absolute -right-48 -bottom-32 size-[28rem] opacity-[0.07]" />
        <Link to="/" className="relative w-fit">
          <Logo inverted tagline />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-bold text-white">
            Every donor is a bridge between hope and a hospital bed.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-ink-200">
                <FontAwesomeIcon icon={faCircleCheck} className="mt-1 text-brand-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-ink-400">In a medical emergency, call 108 or 112 first.</p>
      </aside>

      <main className="flex flex-col bg-paper px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden" aria-label="RaktSetu home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="ml-auto flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to website
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
          <Suspense fallback={<PageLoader />}>{loading ? <PageLoader /> : <Outlet />}</Suspense>
        </div>
      </main>
    </div>
  );
}
