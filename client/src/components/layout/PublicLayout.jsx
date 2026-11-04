import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { PageLoader } from '../ui/Spinner';
import DemoBanner from './DemoBanner';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-700 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <DemoBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
