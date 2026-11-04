import {
  faArrowRight,
  faCircleCheck,
  faClock,
  faFileMedical,
  faHandHoldingDroplet,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import BloodGroupPicker from '../../../components/blood/BloodGroupPicker';
import RequestListItem from '../../../components/requests/RequestListItem';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import { useAuth } from '../../../context/auth-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { firstName, greeting } from '../greeting';

const STEPS = [
  'Choose a verified blood bank that has the blood group in stock.',
  'The blood bank approves your request and reserves the units.',
  'Collect the blood with the doctor’s requisition form and patient sample.',
];

export default function RequesterOverview() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState('');
  const { data, loading } = useApi('/requests/mine', { params: { limit: 5 } });
  const counts = data?.counts;
  const city = user.facility?.city ?? user.city;

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`Hello, ${firstName(user.name)}`}
        description={
          user.role === 'hospital'
            ? `Manage blood requests for patients at ${user.facility?.name ?? 'your hospital'}.`
            : 'Find blood quickly and follow your requests here.'
        }
        actions={
          <Button as={Link} to="/dashboard/requests/new" icon={faPlus}>
            New blood request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Waiting for blood bank"
          value={counts?.pending ?? '–'}
          icon={faClock}
          tone="amber"
          to="/dashboard/requests?status=pending"
        />
        <StatCard
          label="Approved — ready"
          value={counts?.approved ?? '–'}
          icon={faHandHoldingDroplet}
          tone="blue"
          to="/dashboard/requests?status=approved"
        />
        <StatCard
          label="Handed over"
          value={counts?.fulfilled ?? '–'}
          icon={faCircleCheck}
          tone="green"
          to="/dashboard/requests?status=fulfilled"
        />
        <StatCard
          label="All requests"
          value={counts?.all ?? '–'}
          icon={faFileMedical}
          tone="ink"
          to="/dashboard/requests"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Recent requests"
            action={
              <Link to="/dashboard/requests" className="text-sm font-semibold text-brand-700 hover:underline">
                View all <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            }
          />
          {loading && !data ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((key) => (
                <Skeleton key={key} className="h-14" />
              ))}
            </div>
          ) : data?.items.length ? (
            <div className="divide-y divide-ink-100">
              {data.items.map((request) => (
                <RequestListItem key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={faFileMedical}
              title="No requests yet"
              description="When you request blood from a blood bank, you can follow its progress here."
              action={
                <Button as={Link} to="/dashboard/requests/new" icon={faPlus}>
                  Create your first request
                </Button>
              }
            />
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Check blood stock</h2>
            <p className="mt-1 text-sm text-ink-500">Blood banks in {city}</p>
            <BloodGroupPicker value={group} onChange={setGroup} className="mt-4" />
            <Button
              className="mt-4 w-full"
              icon={faMagnifyingGlass}
              onClick={() => navigate(`/find-blood?${new URLSearchParams({ ...(group && { group }), city })}`)}
            >
              Search
            </Button>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">How requests work</h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-ink-600">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
