import { faChevronDown, faGauge, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROLE_LABELS } from '../../lib/constants';
import { firstName, initials } from '../../lib/format';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pr-3 pl-1 transition hover:border-ink-300"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-semibold text-ink-800 sm:block">
          {firstName(user.name)}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="text-[0.625rem] text-ink-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 animate-fade-in rounded-2xl border border-ink-100 bg-white p-2 shadow-xl shadow-ink-900/10"
        >
          <div className="border-b border-ink-100 px-3 pt-1 pb-3">
            <p className="truncate font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-sm text-ink-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="pt-2">
            <Link role="menuitem" to="/dashboard" className={itemClass} onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faGauge} className="w-4 text-ink-400" /> Dashboard
            </Link>
            <Link role="menuitem" to="/dashboard/profile" className={itemClass} onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faUser} className="w-4 text-ink-400" /> Profile
            </Link>
            <button role="menuitem" type="button" className={itemClass} onClick={handleLogout}>
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-ink-400" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
