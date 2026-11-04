import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { ROLE_LABELS } from '../../lib/constants';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export default function RequireRole({ roles }) {
  const { user } = useAuth();
  if (roles.includes(user?.role)) return <Outlet />;
  return (
    <EmptyState
      icon={faLock}
      title="This page isn't available for your account"
      description={`You're signed in as a ${ROLE_LABELS[user?.role]?.toLowerCase() ?? 'user'}. This section is for ${roles
        .map((role) => ROLE_LABELS[role]?.toLowerCase())
        .join(' or ')} accounts.`}
      action={
        <Button as={Link} to="/dashboard">
          Go to my dashboard
        </Button>
      }
    />
  );
}
