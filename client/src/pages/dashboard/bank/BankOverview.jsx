import {
  faArrowRight,
  faBoxesStacked,
  faCircleCheck,
  faClock,
  faDroplet,
  faPlus,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import InventoryGrid from '../../../components/blood/InventoryGrid';
import BankRequestActions from '../../../components/requests/BankRequestActions';
import { useBankRequestActions } from '../../../components/requests/useBankRequestActions';
import Alert from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { PageLoader } from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { BLOOD_GROUPS, STOCK_REASONS, URGENCY, stockLevel, totalInventory } from '../../../lib/constants';
import { cn } from '../../../lib/cn';
import { timeAgo } from '../../../lib/format';
import { greeting } from '../greeting';

export default function BankOverview() {
  useDocumentTitle('Dashboard');
  const { data, loading, error, reload } = useApi('/bloodbank/overview');
  const actions = useBankRequestActions(reload);

  if (loading && !data) return <PageLoader />;
  if (error && !data)
    return (
      <Alert tone="error" title="Could not load your dashboard">
        {error}
      </Alert>
    );

  const inventory = data.inventory;
  const totalUnits = totalInventory(inventory);
  const lowGroups = BLOOD_GROUPS.filter((group) => stockLevel(inventory[group]) !== 'ok');

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={data.facility.name}
        description="Today’s picture at your blood bank."
        actions={
          <>
            <Button as={Link} to="/dashboard/bank/donations" variant="outline" icon={faPlus}>
              Record donation
            </Button>
            <Button as={Link} to="/dashboard/bank/inventory" icon={faBoxesStacked}>
              Update stock
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Units in stock"
          value={totalUnits}
          icon={faDroplet}
          hint={`updated ${timeAgo(data.facility.inventoryUpdatedAt)}`}
        />
        <StatCard
          label="Low or out of stock"
          value={lowGroups.length}
          icon={faTriangleExclamation}
          tone="amber"
          hint={lowGroups.length ? lowGroups.join(', ') : 'all groups healthy'}
        />
        <StatCard
          label="Pending requests"
          value={data.counts.pending}
          icon={faClock}
          tone="blue"
          to="/dashboard/bank/requests?status=pending"
        />
        <StatCard
          label="Donations this month"
          value={data.donationsThisMonth.count}
          icon={faCircleCheck}
          tone="green"
          hint={`${data.donationsThisMonth.units} ${data.donationsThisMonth.units === 1 ? 'unit' : 'units'} collected`}
          to="/dashboard/bank/donations"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Requests to review"
            description="Most urgent first"
            action={
              <Link to="/dashboard/bank/requests" className="text-sm font-semibold text-brand-700 hover:underline">
                All requests <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            }
          />
          {data.pendingRequests.length === 0 ? (
            <EmptyState
              icon={faCircleCheck}
              title="You're all caught up"
              description="New requests will appear here as soon as they arrive."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {data.pendingRequests.map((request) => (
                <li
                  key={request._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    to={`/dashboard/requests/${request._id}`}
                    className="flex min-w-0 items-center gap-3 hover:opacity-80"
                  >
                    <BloodGroupBadge group={request.bloodGroup} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                        {request.units} {request.units === 1 ? 'unit' : 'units'} · {request.patientName}
                        {request.urgency !== 'normal' && <StatusBadge map={URGENCY} value={request.urgency} />}
                      </p>
                      <p className="truncate text-sm text-ink-500">
                        {request.code} · {request.hospitalName} · {timeAgo(request.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <BankRequestActions request={request} actions={actions} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Recent stock changes"
            action={
              <Link to="/dashboard/bank/inventory" className="text-sm font-semibold text-brand-700 hover:underline">
                Stock history
              </Link>
            }
          />
          {data.recentMovements.length === 0 ? (
            <EmptyState
              icon={faBoxesStacked}
              title="No stock changes yet"
              description="Add your current stock to get started."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {data.recentMovements.map((movement) => (
                <li key={movement._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {movement.note || STOCK_REASONS[movement.reason]}
                    </p>
                    <p className="text-xs text-ink-500">
                      {STOCK_REASONS[movement.reason]} · {timeAgo(movement.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-lg px-2 py-1 text-sm font-bold tabular-nums',
                      movement.change > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                    )}
                  >
                    {movement.change > 0 ? '+' : '−'}
                    {Math.abs(movement.change)} {movement.bloodGroup}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Current stock</h2>
            <p className="text-sm text-ink-500">This is what the public sees on Find blood.</p>
          </div>
          <Button as={Link} to="/dashboard/bank/inventory" variant="outline" size="sm">
            Manage stock
          </Button>
        </div>
        <InventoryGrid inventory={inventory} />
      </Card>

      {actions.dialog}
    </>
  );
}
