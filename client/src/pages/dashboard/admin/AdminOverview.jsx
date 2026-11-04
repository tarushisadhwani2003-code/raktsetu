import {
  faArrowRight,
  faClock,
  faDroplet,
  faEnvelope,
  faHandHoldingDroplet,
  faHandHoldingHeart,
  faHouseMedical,
  faShieldHalved,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import BarChart from '../../../components/charts/BarChart';
import Alert from '../../../components/ui/Alert';
import Badge, { StatusBadge } from '../../../components/ui/Badge';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { PageLoader } from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { BLOOD_GROUPS, REQUEST_STATUS, totalInventory } from '../../../lib/constants';
import { formatNumber, timeAgo } from '../../../lib/format';

function ChartCard({ title, description, children }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export default function AdminOverview() {
  useDocumentTitle('Admin overview');
  const { data, loading, error } = useApi('/admin/overview');

  if (loading && !data) return <PageLoader />;
  if (error && !data)
    return (
      <Alert tone="error" title="Could not load the overview">
        {error}
      </Alert>
    );

  const pendingVerifications = data.facilities.bloodbank.pending + data.facilities.hospital.pending;
  const openRequests = data.requests.pending + data.requests.approved;
  const unitsInStock = totalInventory(data.stockByGroup);

  return (
    <>
      <PageHeader title="Admin overview" description="Activity across the RaktSetu network." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Donors"
          value={formatNumber(data.users.donor)}
          icon={faHandHoldingHeart}
          to="/dashboard/admin/users?role=donor"
        />
        <StatCard
          label="Patients & families"
          value={formatNumber(data.users.seeker)}
          icon={faUsers}
          tone="ink"
          to="/dashboard/admin/users?role=seeker"
        />
        <StatCard
          label="Verified blood banks"
          value={data.facilities.bloodbank.verified}
          icon={faHouseMedical}
          tone="green"
          hint={`${data.facilities.hospital.verified} verified hospitals`}
        />
        <StatCard
          label="Waiting for verification"
          value={pendingVerifications}
          icon={faShieldHalved}
          tone="amber"
          to="/dashboard/admin/verifications"
        />
        <StatCard
          label="Open requests"
          value={openRequests}
          icon={faClock}
          tone="blue"
          hint={`${data.requests.all} in total`}
          to="/dashboard/admin/requests"
        />
        <StatCard
          label="Units in stock"
          value={formatNumber(unitsInStock)}
          icon={faDroplet}
          hint="at verified blood banks"
        />
        <StatCard
          label="Units donated"
          value={formatNumber(data.donations.units)}
          icon={faHandHoldingDroplet}
          tone="green"
          hint={`${formatNumber(data.donations.count)} donations recorded`}
        />
        <StatCard
          label="New messages"
          value={data.newMessages}
          icon={faEnvelope}
          tone="ink"
          to="/dashboard/admin/messages"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Blood requests per month" description="Requests created in the last 6 months">
          <BarChart
            label="Month"
            unit="requests"
            data={data.monthly.map((item) => ({ label: item.month, value: item.requests }))}
          />
        </ChartCard>
        <ChartCard title="Units donated per month" description="Donations recorded by blood banks">
          <BarChart
            label="Month"
            unit="units"
            data={data.monthly.map((item) => ({ label: item.month, value: item.donatedUnits }))}
          />
        </ChartCard>
        <ChartCard title="Stock by blood group" description="Units at verified blood banks right now">
          <BarChart
            label="Blood group"
            unit="units"
            highlight={-1}
            data={BLOOD_GROUPS.map((group) => ({ label: group, value: data.stockByGroup[group] }))}
          />
        </ChartCard>
        <ChartCard title="Donors by blood group" description="Registered donor accounts">
          <BarChart
            label="Blood group"
            unit="donors"
            highlight={-1}
            data={BLOOD_GROUPS.map((group) => ({ label: group, value: data.donorsByGroup[group] }))}
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title="Waiting for verification"
            action={
              <Link
                to="/dashboard/admin/verifications"
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Review <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            }
          />
          {data.pendingFacilities.length === 0 ? (
            <EmptyState
              icon={faShieldHalved}
              title="Nothing to review"
              description="New hospitals and blood banks will appear here."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {data.pendingFacilities.map((facility) => (
                <li key={facility._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{facility.name}</p>
                    <p className="text-sm text-ink-500">
                      {facility.city} · registered {timeAgo(facility.createdAt)}
                    </p>
                  </div>
                  <Badge tone={facility.type === 'bloodbank' ? 'brand' : 'blue'}>
                    {facility.type === 'bloodbank' ? 'Blood bank' : 'Hospital'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Latest requests"
            action={
              <Link to="/dashboard/admin/requests" className="text-sm font-semibold text-brand-700 hover:underline">
                All requests <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            }
          />
          <ul className="divide-y divide-ink-100">
            {data.recentRequests.map((request) => (
              <li key={request._id}>
                <Link
                  to={`/dashboard/requests/${request._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50/70"
                >
                  <BloodGroupBadge group={request.bloodGroup} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">
                      {request.code} · {request.units} {request.units === 1 ? 'unit' : 'units'}
                    </p>
                    <p className="truncate text-sm text-ink-500">
                      {request.bloodBank?.name} · {timeAgo(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge map={REQUEST_STATUS} value={request.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
