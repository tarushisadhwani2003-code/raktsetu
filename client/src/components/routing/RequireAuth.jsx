import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { PageLoader } from '../ui/Spinner';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
