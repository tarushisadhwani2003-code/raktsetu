import { useAuth } from '../../context/auth-context';
import AdminOverview from './admin/AdminOverview';
import BankOverview from './bank/BankOverview';
import DonorOverview from './donor/DonorOverview';
import RequesterOverview from './requests/RequesterOverview';

/** The dashboard home page shows a different overview for each kind of account. */
export default function DashboardHome() {
  const { user } = useAuth();
  switch (user.role) {
    case 'donor':
      return <DonorOverview />;
    case 'bloodbank':
      return <BankOverview />;
    case 'admin':
      return <AdminOverview />;
    default:
      return <RequesterOverview />;
  }
}
