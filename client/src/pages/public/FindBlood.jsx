import {
  faHandHoldingHeart,
  faHouseMedical,
  faLightbulb,
  faPhone,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useSearchParams } from 'react-router';
import BloodBankCard from '../../components/blood/BloodBankCard';
import BloodGroupPicker from '../../components/blood/BloodGroupPicker';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { Checkbox, SelectField } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { COMPATIBLE_DONORS } from '../../lib/constants';
import { readBloodGroup } from '../../lib/blood';
import { pluralize } from '../../lib/format';
import { SITE } from '../../lib/site';

export default function FindBlood() {
  useDocumentTitle('Find blood');
  const [params, setParams] = useSearchParams();
  const group = readBloodGroup(params.get('group'));
  const city = params.get('city') ?? '';
  const inStockOnly = params.get('stock') !== 'all';

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const { data: citiesData } = useApi('/public/cities');
  const { data, loading, error, reload } = useApi('/public/blood-banks', {
    params: {
      bloodGroup: group || undefined,
      city: city || undefined,
      inStock: group && inStockOnly ? 'true' : undefined,
    },
  });

  const banks = data?.items ?? [];
  const alternatives = group ? COMPATIBLE_DONORS[group].filter((item) => item !== group) : [];

  return (
    <div className="pb-20">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page py-10 sm:py-12">
          <p className="font-semibold text-brand-600">Find blood</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Blood stock at verified blood banks</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Choose a blood group and city. Stock is updated by the blood banks themselves — call ahead before you
            travel.
          </p>
        </div>
      </section>

      <div className="container-page mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Card className="p-5 sm:p-6">
            <p className="mb-3 text-sm font-bold text-ink-900">Blood group</p>
            <BloodGroupPicker
              value={group}
              onChange={(value) => update({ group: value })}
              allowAny
              label="Blood group"
              columns="grid-cols-3 sm:grid-cols-9"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-end">
              <SelectField label="City" value={city} onChange={(event) => update({ city: event.target.value })}>
                <option value="">All cities</option>
                {(citiesData?.cities ?? []).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </SelectField>
              <Checkbox
                label={group ? `Only blood banks with ${group} in stock` : 'Choose a blood group to filter by stock'}
                checked={Boolean(group) && inStockOnly}
                disabled={!group}
                onChange={(event) => update({ stock: event.target.checked ? '' : 'all' })}
                className="pb-3"
              />
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-between gap-3" aria-live="polite">
            <p className="text-sm font-semibold text-ink-600">
              {loading && !data
                ? 'Searching…'
                : `${pluralize(banks.length, 'blood bank')}${group ? ` for ${group}` : ''}${city ? ` in ${city}` : ''}`}
            </p>
            {loading && data && <span className="text-sm text-ink-400">Updating…</span>}
          </div>

          {error && (
            <Alert
              tone="error"
              title="Could not load blood banks"
              className="mt-4"
              action={
                <Button variant="outline" size="sm" icon={faRotateRight} onClick={reload}>
                  Try again
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <div className="mt-4 space-y-4">
            {loading && !data
              ? [1, 2, 3].map((key) => <Skeleton key={key} className="h-64" />)
              : banks.map((bank) => <BloodBankCard key={bank._id} bank={bank} group={group} />)}
          </div>

          {!loading && !error && banks.length === 0 && (
            <Card className="mt-4">
              <EmptyState
                icon={faHouseMedical}
                title="No blood banks match your search"
                description={
                  group
                    ? `No verified blood bank${city ? ` in ${city}` : ''} has ${group} in stock right now. Try another city, include banks without stock, or post a request so donors can see it.`
                    : 'Try another city.'
                }
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {group && inStockOnly && (
                      <Button variant="outline" onClick={() => update({ stock: 'all' })}>
                        Show all blood banks
                      </Button>
                    )}
                    <Button as={Link} to="/dashboard/requests/new" icon={faHandHoldingHeart}>
                      Post a blood request
                    </Button>
                  </div>
                }
              />
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {group && alternatives.length > 0 && (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" /> Compatible groups
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                A patient with {group} can usually also receive red cells from{' '}
                <strong className="text-ink-900">{alternatives.join(', ')}</strong>. Always confirm with the treating
                doctor.
              </p>
            </Card>
          )}
          <Card className="p-5">
            <h2 className="font-bold">Can&apos;t find the blood you need?</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-600">
              <li>• Post a request — matching donors in your city will see it.</li>
              <li>• Call the blood bank: they may get stock from nearby centres.</li>
              <li>• Ask relatives and friends to donate as replacement donors.</li>
            </ul>
            <Button as={Link} to="/dashboard/requests/new" className="mt-4 w-full">
              Post a blood request
            </Button>
          </Card>
          <div className="rounded-2xl bg-ink-950 p-5 text-sm text-ink-200">
            <p className="font-bold text-white">Medical emergency?</p>
            <p className="mt-1">Call an ambulance first.</p>
            <div className="mt-3 flex gap-2">
              {SITE.emergency.map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 font-bold text-white hover:bg-white/15"
                >
                  <FontAwesomeIcon icon={faPhone} /> {item.number}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
