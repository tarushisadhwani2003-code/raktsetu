import {
  faArrowRight,
  faCalendarCheck,
  faCircleCheck,
  faDroplet,
  faHandHoldingHeart,
  faHourglassHalf,
  faHouseMedical,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { PageLoader } from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import Switch from '../../../components/ui/Switch';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage } from '../../../lib/api';
import { daysSince, formatDate } from '../../../lib/format';
import { firstName, greeting } from '../greeting';
import MatchingRequestCard from './MatchingRequestCard';

function EligibilityCard({ eligibility, city }) {
  if (eligibility.eligible) {
    return (
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
            <FontAwesomeIcon icon={faCircleCheck} />
          </span>
          <div>
            <h2 className="text-xl font-bold">You can donate today</h2>
            <p className="mt-1 text-ink-600">
              Visit any verified blood bank with a photo ID. Eat well and drink water before you go.
            </p>
          </div>
        </div>
        <Button
          as={Link}
          to={`/find-blood?city=${encodeURIComponent(city)}`}
          variant="outline"
          icon={faHouseMedical}
          className="w-fit"
        >
          Blood banks in {city}
        </Button>
      </div>
    );
  }

  const done = Math.max(0, eligibility.intervalDays - eligibility.daysRemaining);
  const percent = Math.round((done / eligibility.intervalDays) * 100);
  return (
    <div className="flex gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600">
        <FontAwesomeIcon icon={faHourglassHalf} />
      </span>
      <div className="flex-1">
        <h2 className="text-xl font-bold">
          {eligibility.nextEligibleDate
            ? `You can donate again from ${formatDate(eligibility.nextEligibleDate)}`
            : 'Not eligible right now'}
        </h2>
        {eligibility.nextEligibleDate ? (
          <>
            <p className="mt-1 text-ink-600">
              Your body is recovering — {eligibility.daysRemaining} {eligibility.daysRemaining === 1 ? 'day' : 'days'}{' '}
              to go.
            </p>
            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-amber-100"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Recovery period completed"
            >
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              {percent}% of the {eligibility.intervalDays}-day gap completed
            </p>
          </>
        ) : (
          <ul className="mt-1 list-disc pl-5 text-ink-600">
            {eligibility.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function DonorOverview() {
  useDocumentTitle('Dashboard');
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useApi('/donor/overview');
  const [saving, setSaving] = useState(false);

  const toggleAvailability = async (isAvailable) => {
    setSaving(true);
    try {
      const { data: result } = await api.patch('/account', { isAvailable });
      setUser(result.user);
      setData((current) => ({ ...current, isAvailable }));
      toast.success(
        isAvailable ? 'You will now see requests and can offer to help.' : 'You are now hidden from new requests.',
      );
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <PageLoader />;
  if (error && !data)
    return (
      <Alert
        tone="error"
        title="Could not load your dashboard"
        action={
          <Button size="sm" variant="outline" onClick={reload}>
            Try again
          </Button>
        }
      >
        {error}
      </Alert>
    );

  const canRespond = data.eligibility.eligible && data.isAvailable;
  const updateRequest = (updated) =>
    setData((current) => ({
      ...current,
      matchingRequests: current.matchingRequests.map((item) => (item._id === updated._id ? updated : item)),
    }));

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`Hello, ${firstName(user.name)}`}
        description="Thank you for being a blood donor. Here is what is happening near you."
        actions={
          <Button as={Link} to="/dashboard/donor/requests" icon={faHandHoldingHeart}>
            Requests near me
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white shadow-lg shadow-brand-900/20">
          <FontAwesomeIcon
            icon={faDroplet}
            className="absolute -right-6 -bottom-8 text-[9rem] text-white/10"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-brand-100">Donor card</p>
          <p className="mt-4 text-5xl font-extrabold tracking-tight">{user.donor.bloodGroup}</p>
          <p className="mt-4 font-semibold">{user.name}</p>
          <p className="flex items-center gap-2 text-sm text-brand-100">
            <FontAwesomeIcon icon={faLocationDot} /> {user.city}
          </p>
          <p className="mt-4 text-xs text-brand-200">Donor since {formatDate(user.createdAt, { day: undefined })}</p>
        </div>

        <Card className="flex flex-col gap-6 p-6 lg:col-span-2">
          <EligibilityCard eligibility={data.eligibility} city={user.city} />
          <div className="border-t border-ink-100 pt-5">
            <Switch
              checked={data.isAvailable}
              onChange={toggleAvailability}
              disabled={saving}
              label="Available to donate"
              description="When this is on, you can offer to help with matching requests in your city."
            />
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <StatCard label="Donations" value={data.stats.donations} icon={faDroplet} hint="recorded on RaktSetu" />
        <StatCard
          label="Units donated"
          value={data.stats.units}
          icon={faHandHoldingHeart}
          tone="green"
          hint="each can help up to 3 patients"
        />
        <StatCard
          label="Last donation"
          value={data.stats.lastDonationDate ? formatDate(data.stats.lastDonationDate) : '—'}
          icon={faCalendarCheck}
          tone="blue"
          hint={data.stats.lastDonationDate ? `${daysSince(data.stats.lastDonationDate)} days ago` : 'not yet recorded'}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Requests you can help with</h2>
            <p className="text-sm text-ink-500">
              Patients in {user.city} who can receive {user.donor.bloodGroup} blood
            </p>
          </div>
          {data.matchingCount > data.matchingRequests.length && (
            <Link to="/dashboard/donor/requests" className="text-sm font-semibold text-brand-700 hover:underline">
              See all {data.matchingCount} <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          )}
        </div>
        {!canRespond && data.matchingRequests.length > 0 && (
          <Alert tone="info" className="mb-4">
            {data.isAvailable
              ? 'You can see these requests, but you can offer to help again once your recovery period is over.'
              : 'Turn on “Available to donate” to offer help.'}
          </Alert>
        )}
        {data.matchingRequests.length === 0 ? (
          <Card>
            <EmptyState
              icon={faCircleCheck}
              title="No open requests near you"
              description="Great news — nobody in your city currently needs your blood group. We'll show new requests here."
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.matchingRequests.map((request) => (
              <MatchingRequestCard
                key={request._id}
                request={request}
                canRespond={canRespond}
                disabledReason={canRespond ? undefined : 'You cannot offer to help right now'}
                onChange={updateRequest}
              />
            ))}
          </div>
        )}
      </section>

      <Card className="mt-8">
        <CardHeader
          title="Recent donations"
          action={
            <Link to="/dashboard/donor/donations" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          }
        />
        {data.recentDonations.length === 0 ? (
          <EmptyState
            icon={faDroplet}
            title="No donations recorded yet"
            description="When you donate at a blood bank on RaktSetu, they record it here for you."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {data.recentDonations.map((donation) => (
              <li key={donation._id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-ink-900">{donation.bloodBank?.name ?? 'Blood bank'}</p>
                  <p className="text-sm text-ink-500">{donation.bloodBank?.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">{formatDate(donation.donatedAt)}</p>
                  <p className="text-sm text-ink-500">
                    {donation.units} {donation.units === 1 ? 'unit' : 'units'} · {donation.bloodGroup}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
