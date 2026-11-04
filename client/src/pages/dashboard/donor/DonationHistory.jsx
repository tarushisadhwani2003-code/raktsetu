import { faDroplet, faHandHoldingHeart, faHouseMedical } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { PageLoader } from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import { useAuth } from '../../../context/auth-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { formatDate } from '../../../lib/format';

export default function DonationHistory() {
  useDocumentTitle('My donations');
  const { user } = useAuth();
  const { data, loading } = useApi('/donor/donations');
  const items = data?.items ?? [];
  const units = items.reduce((sum, item) => sum + item.units, 0);

  if (loading && !data) return <PageLoader />;

  return (
    <>
      <PageHeader title="My donations" description="Donations recorded by blood banks on RaktSetu." />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Donations" value={items.length} icon={faDroplet} />
        <StatCard label="Units donated" value={units} icon={faHandHoldingHeart} tone="green" />
        <StatCard
          label="Next donation"
          value={user.eligibility?.eligible ? 'Today' : formatDate(user.eligibility?.nextEligibleDate)}
          icon={faHouseMedical}
          tone="blue"
          hint={user.eligibility?.eligible ? 'you are eligible' : 'earliest date'}
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon={faDroplet}
            title="No donations recorded yet"
            description="Donate at any verified blood bank on RaktSetu and share your registered mobile number — they will record it here."
            action={
              <Button as={Link} to="/find-blood">
                Find a blood bank
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-ink-50/70 text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Blood bank</th>
                  <th className="px-5 py-3 font-semibold">Blood group</th>
                  <th className="px-5 py-3 text-right font-semibold">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((donation) => (
                  <tr key={donation._id}>
                    <td className="px-5 py-3.5 font-semibold text-ink-900">{formatDate(donation.donatedAt)}</td>
                    <td className="px-5 py-3.5">
                      {donation.bloodBank?.name ?? '—'}
                      <span className="block text-ink-500">{donation.bloodBank?.city}</span>
                    </td>
                    <td className="px-5 py-3.5">{donation.bloodGroup}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{donation.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
