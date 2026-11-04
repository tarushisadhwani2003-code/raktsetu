import {
  faCircleCheck,
  faDroplet,
  faHourglassHalf,
  faMagnifyingGlass,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import BloodGroupPicker from '../../../components/blood/BloodGroupPicker';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Field, Input, SelectField, TextField } from '../../../components/ui/Field';
import FilterTabs from '../../../components/ui/FilterTabs';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../../lib/api';
import { formatDate, todayInput } from '../../../lib/format';

const EMPTY_WALK_IN = { donorName: '', donorPhone: '', bloodGroup: '' };

function DonorLookup({ onFound }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get('/bloodbank/donors/lookup', { params: { q: query } });
      setResult(data.donor);
      onFound(data.donor);
    } catch (requestError) {
      setError(getFieldErrors(requestError).q ?? getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <div className="flex-1">
          <label htmlFor="donor-lookup" className="sr-only">
            Donor mobile number or email
          </label>
          <Input
            id="donor-lookup"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError('');
            }}
            placeholder="Registered mobile number or email"
            invalid={Boolean(error)}
          />
        </div>
        <Button type="submit" variant="dark" icon={faMagnifyingGlass} loading={busy}>
          Find donor
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-brand-700">{error}</p>}

      {result === null && (
        <Alert tone="warning" className="mt-4">
          No registered donor found. Check the number, or record this as a walk-in donation.
        </Alert>
      )}

      {result && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
          <BloodGroupBadge group={result.bloodGroup} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink-900">{result.name}</p>
            <p className="text-sm text-ink-500">
              {result.phone} · {result.city}
            </p>
            {result.eligibility.eligible ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <FontAwesomeIcon icon={faCircleCheck} /> Eligible to donate
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <FontAwesomeIcon icon={faHourglassHalf} />
                {result.eligibility.nextEligibleDate
                  ? `Not eligible until ${formatDate(result.eligibility.nextEligibleDate)}`
                  : 'Not eligible'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BankDonations() {
  useDocumentTitle('Donations');
  const { user } = useAuth();
  const toast = useToast();
  const verified = user.facility?.verification?.status === 'verified';
  const [mode, setMode] = useState('registered');
  const [donor, setDonor] = useState(null);
  const [lookupKey, setLookupKey] = useState(0);
  const [walkIn, setWalkIn] = useState(EMPTY_WALK_IN);
  const [details, setDetails] = useState({ units: '1', donatedAt: todayInput(), notes: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const { data, reload } = useApi('/bloodbank/donations', { params: { page, limit: 10 } });

  const canSubmit = mode === 'registered' ? Boolean(donor?.eligibility?.eligible) : true;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = { ...details, ...(mode === 'registered' ? { donorId: donor?._id } : walkIn) };
    try {
      const { data: result } = await api.post('/bloodbank/donations', payload);
      toast.success(result.message);
      setDonor(null);
      setLookupKey((key) => key + 1);
      setWalkIn(EMPTY_WALK_IN);
      setDetails({ units: '1', donatedAt: todayInput(), notes: '' });
      setPage(1);
      reload();
    } catch (requestError) {
      setErrors(getFieldErrors(requestError));
      toast.error(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Donations"
        description="Record each donation to update your stock and the donor’s history automatically."
      />

      {!verified && (
        <Alert tone="warning" className="mb-6">
          Recording donations opens once your blood bank is verified.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold">Record a donation</h2>
          <FilterTabs
            className="mt-4 w-fit"
            label="Donor type"
            value={mode}
            onChange={(value) => {
              setMode(value);
              setErrors({});
            }}
            items={[
              { value: 'registered', label: 'Registered donor' },
              { value: 'walkin', label: 'Walk-in donor' },
            ]}
          />

          {mode === 'registered' && (
            <div className="mt-5">
              <DonorLookup key={lookupKey} onFound={setDonor} />
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-5 space-y-5">
            {mode === 'walkin' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Donor name"
                  value={walkIn.donorName}
                  onChange={(event) => setWalkIn((current) => ({ ...current, donorName: event.target.value }))}
                  error={errors.donorName}
                  required
                />
                <TextField
                  label="Mobile number"
                  type="tel"
                  value={walkIn.donorPhone}
                  onChange={(event) => setWalkIn((current) => ({ ...current, donorPhone: event.target.value }))}
                  error={errors.donorPhone}
                  optional
                />
                <Field
                  id="walkin-group"
                  label="Blood group"
                  error={errors.bloodGroup}
                  required
                  className="sm:col-span-2"
                >
                  <BloodGroupPicker
                    value={walkIn.bloodGroup}
                    onChange={(value) => setWalkIn((current) => ({ ...current, bloodGroup: value }))}
                    invalid={Boolean(errors.bloodGroup)}
                  />
                </Field>
              </div>
            )}

            <div className="grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-2">
              <SelectField
                label="Units collected"
                value={details.units}
                onChange={(event) => setDetails((current) => ({ ...current, units: event.target.value }))}
                error={errors.units}
              >
                <option value="1">1 unit</option>
                <option value="2">2 units</option>
              </SelectField>
              <TextField
                label="Date"
                type="date"
                max={todayInput()}
                value={details.donatedAt}
                onChange={(event) => setDetails((current) => ({ ...current, donatedAt: event.target.value }))}
                error={errors.donatedAt}
              />
              <TextField
                label="Note"
                value={details.notes}
                onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))}
                error={errors.notes}
                maxLength={300}
                placeholder="e.g. Camp at Rajasthan University"
                optional
                className="sm:col-span-2"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              icon={faUserCheck}
              loading={saving}
              disabled={!verified || !canSubmit}
            >
              Record donation
            </Button>
            {mode === 'registered' && donor && !donor.eligibility.eligible && (
              <p className="text-center text-sm text-amber-700">This donor is still in their recovery period.</p>
            )}
          </form>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Recent donations" description={data ? `${data.total} recorded in total` : undefined} />
          {!data?.items.length ? (
            <EmptyState
              icon={faDroplet}
              title="No donations recorded yet"
              description="Donations you record will appear here."
            />
          ) : (
            <>
              <ul className="divide-y divide-ink-100">
                {data.items.map((donation) => (
                  <li key={donation._id} className="flex items-center gap-3 px-5 py-3.5">
                    <BloodGroupBadge group={donation.bloodGroup} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900">{donation.donorName}</p>
                      <p className="text-sm text-ink-500">
                        {donation.donor ? 'Registered donor' : 'Walk-in'}
                        {donation.notes && ` · ${donation.notes}`}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-ink-900">{formatDate(donation.donatedAt)}</p>
                      <p className="text-ink-500">
                        {donation.units} {donation.units === 1 ? 'unit' : 'units'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
