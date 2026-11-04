import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import Logo from './Logo';
import UserMenu from './UserMenu';

const LINKS = [
  { to: '/find-blood', label: 'Find blood' },
  { to: '/donate', label: 'Donate' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="RaktSetu home" onClick={closeMenu}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <>
                <Button as={Link} to="/dashboard" variant="outline" size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
                <UserMenu />
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button as={Link} to="/register" size="sm">
                  Register
                </Button>
              </div>
            ))}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-50 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="text-lg" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-ink-100 bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 font-semibold',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4 sm:hidden">
                <Button as={Link} to="/login" variant="outline" onClick={closeMenu}>
                  Log in
                </Button>
                <Button as={Link} to="/register" onClick={closeMenu}>
                  Register
                </Button>
              </div>
            )}
            {user && (
              <Button as={Link} to="/dashboard" variant="outline" className="mt-3 sm:hidden" onClick={closeMenu}>
                Go to dashboard
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
