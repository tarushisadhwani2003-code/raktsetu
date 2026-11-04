import {
  faArrowUpRightFromSquare,
  faBars,
  faBoxesStacked,
  faDroplet,
  faEnvelope,
  faFileMedical,
  faGauge,
  faHandHoldingHeart,
  faInbox,
  faMagnifyingGlass,
  faPlus,
  faRightFromBracket,
  faShieldHalved,
  faUser,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROLE_LABELS } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { initials } from '../../lib/format';
import Alert from '../ui/Alert';
import { PageLoader } from '../ui/Spinner';
import Logo from './Logo';

const OVERVIEW = { to: '/dashboard', label: 'Overview', icon: faGauge, end: true };
const PROFILE = { to: '/dashboard/profile', label: 'Profile & settings', icon: faUser };
const REQUESTER_NAV = [
  OVERVIEW,
  { to: '/dashboard/requests/new', label: 'New blood request', icon: faPlus, end: true },
  { to: '/dashboard/requests', label: 'My requests', icon: faFileMedical, end: true },
  { to: '/find-blood', label: 'Find blood', icon: faMagnifyingGlass },
  PROFILE,
];

const NAVIGATION = {
  seeker: REQUESTER_NAV,
  hospital: REQUESTER_NAV,
  donor: [
    OVERVIEW,
    { to: '/dashboard/donor/requests', label: 'Requests near me', icon: faHandHoldingHeart },
    { to: '/dashboard/donor/donations', label: 'My donations', icon: faDroplet },
    PROFILE,
  ],
  bloodbank: [
    OVERVIEW,
    { to: '/dashboard/bank/requests', label: 'Blood requests', icon: faInbox },
    { to: '/dashboard/bank/inventory', label: 'Stock', icon: faBoxesStacked },
    { to: '/dashboard/bank/donations', label: 'Donations', icon: faDroplet },
    PROFILE,
  ],
  admin: [
    OVERVIEW,
    { to: '/dashboard/admin/verifications', label: 'Verifications', icon: faShieldHalved },
    { to: '/dashboard/admin/users', label: 'Users', icon: faUsers },
    { to: '/dashboard/admin/requests', label: 'Blood requests', icon: faFileMedical },
    { to: '/dashboard/admin/messages', label: 'Messages', icon: faEnvelope },
    PROFILE,
  ],
};

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const items = NAVIGATION[user.role] ?? [OVERVIEW, PROFILE];

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="px-5 pt-6 pb-5" onClick={onNavigate}>
        <Logo inverted />
      </Link>

      <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {initials(user.facility?.name ?? user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user.facility?.name ?? user.name}</p>
          <p className="truncate text-xs text-ink-300">
            {ROLE_LABELS[user.role]}
            {user.donor?.bloodGroup && ` · ${user.donor.bloodGroup}`}
          </p>
        </div>
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-200 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <FontAwesomeIcon icon={item.icon} className={cn('w-4', isActive ? 'text-brand-600' : 'text-ink-400')} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/10 hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4 text-ink-400" /> Visit website
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 hover:bg-white/10 hover:text-white"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-ink-400" /> Log out
        </button>
      </div>
    </div>
  );
}

function VerificationNotice({ facility }) {
  if (!facility || facility.verification?.status === 'verified') return null;
  const kind = facility.type === 'bloodbank' ? 'blood bank' : 'hospital';

  if (facility.verification?.status === 'rejected') {
    return (
      <Alert tone="error" title={`${facility.name} could not be verified`} className="mb-6">
        {facility.verification.note || 'Please check your details.'} Update them on your{' '}
        <Link to="/dashboard/profile" className="font-semibold underline">
          profile page
        </Link>{' '}
        or contact support.
      </Alert>
    );
  }

  return (
    <Alert tone="warning" title={`Your ${kind} is waiting for verification`} className="mb-6">
      Our team checks every licence before a facility goes live.{' '}
      {facility.type === 'bloodbank'
        ? 'You can already set up your stock; you will appear in search results once verified.'
        : 'You can already send blood requests.'}
    </Alert>
  );
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 bg-ink-950 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="-ml-2 flex size-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-50"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
        <Link to="/dashboard" aria-label="Dashboard home">
          <Logo />
        </Link>
        <span
          className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white"
          aria-hidden="true"
        >
          {initials(user.facility?.name ?? user.name)}
        </span>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-ink-950/60"
            onClick={closeDrawer}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-in bg-ink-950 shadow-2xl">
            <button
              type="button"
              onClick={closeDrawer}
              className="absolute top-5 right-3 z-10 flex size-9 items-center justify-center rounded-lg text-ink-300 hover:bg-white/10"
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <SidebarContent onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      <div className="lg:pl-68">
        <main className="container-page max-w-6xl py-6 sm:py-8 lg:py-10">
          <VerificationNotice facility={user.facility} />
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
