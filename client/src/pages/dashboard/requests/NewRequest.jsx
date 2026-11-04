import { faHouseMedical, faPaperPlane, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import BloodGroupPicker from '../../../components/blood/BloodGroupPicker';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { Field, Select, TextareaField, TextField } from '../../../components/ui/Field';
import PageHeader from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Spinner';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../../lib/api';
import { STOCK_LEVEL, stockLevel } from '../../../lib/constants';
import { readBloodGroup } from '../../../lib/blood';
import { cn } from '../../../lib/cn';
import { todayInput } from '../../../lib/format';

const URGENCY_OPTIONS = [
  { value: 'normal', label: 'Normal', text: 'Needed in the next few days' },
  { value: 'urgent', label: 'Urgent', text: 'Needed within 24 hours' },
  { value: 'critical', label: 'Critical', text: 'Life-threatening, needed now' },
];

const LEVEL_TEXT = { ok: 'text-emerald-700', low: 'text-amber-700', out: 'text-red-700' };

function Section({ number, title, description, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export default function NewRequest() {
  useDocumentTitle('New blood request');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isHospital = user.role === 'hospital';
  const homeCity = (isHospital ? user.facility?.city : user.city) ?? '';
  const presetBank = params.get('bank') ?? '';

  const [form, setForm] = useState({
    bloodGroup: readBloodGroup(params.get('group')),
    units: '1',
    urgency: 'normal',
    requiredBy: '',
    bloodBank: presetBank,
    patientName: '',
    patientAge: '',
    hospitalName: '',
    city: user.city ?? '',
    contactPhone: isHospital ? (user.facility?.phone ?? user.phone) : user.phone,
    notes: '',
  });
  const [bankCity, setBankCity] = useState(presetBank ? '' : homeCity);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: citiesData } = useApi('/public/cities');
  const { data: banksData, loading: banksLoading } = useApi('/public/blood-banks', {
    params: { city: bankCity || undefined, bloodGroup: form.bloodGroup || undefined },
  });

  const banks = banksData?.items ?? [];
  const selectedBank = banks.find((bank) => bank._id === form.bloodBank);
  const selectedUnits = selectedBank && form.bloodGroup ? (selectedBank.inventory?.[form.bloodGroup] ?? 0) : null;
  const cityOptions = [...new Set([...(citiesData?.cities ?? []), ...(bankCity ? [bankCity] : [])])].sort();

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const bind = (key) => ({
    value: form[key],
    onChange: (event) => update(key, event.target.value),
    error: errors[key],
  });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const payload = { ...form };
    if (isHospital) {
      delete payload.hospitalName;
      delete payload.city;
    }
    try {
      const { data } = await api.post('/requests', payload);
      toast.success(data.message);
      navigate(`/dashboard/requests/${data.request._id}`);
    } catch (error) {
      setErrors(getFieldErrors(error));
      setMessage(getErrorMessage(error));
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageHeader
        title="New blood request"
        description="Send a request to a verified blood bank. They will review it and update you here."
      />

      {message && (
        <Alert tone="error" className="mb-5">
          {message}
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          <Section number="1" title="Blood needed">
            <Field id="request-blood-group" label="Blood group" error={errors.bloodGroup} required>
              <BloodGroupPicker
                value={form.bloodGroup}
                onChange={(value) => update('bloodGroup', value)}
                invalid={Boolean(errors.bloodGroup)}
                className="sm:grid-cols-8"
              />
            </Field>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="Units needed"
                type="number"
                inputMode="numeric"
                min="1"
                max="10"
                required
                {...bind('units')}
              />
              <TextField label="Needed by" type="date" min={todayInput()} optional {...bind('requiredBy')} />
            </div>
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold text-ink-800">How urgent is it?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {URGENCY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-xl border p-3.5 transition',
                      form.urgency === option.value
                        ? 'border-brand-500 bg-brand-50/50 ring-4 ring-brand-100'
                        : 'border-ink-200 hover:border-ink-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={form.urgency === option.value}
                      onChange={() => update('urgency', option.value)}
                      className="mt-1 size-4 accent-brand-600"
                    />
                    <span>
                      <span className="block font-semibold text-ink-900">{option.label}</span>
                      <span className="block text-sm text-ink-500">{option.text}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section
            number="2"
            title="Choose a blood bank"
            description="Only verified blood banks are listed. Stock is shown for the blood group you chose."
          >
            <div className="mb-4 max-w-xs">
              <label htmlFor="bank-city" className="mb-1.5 block text-sm font-semibold text-ink-800">
                City
              </label>
              <Select id="bank-city" value={bankCity} onChange={(event) => setBankCity(event.target.value)}>
                <option value="">All cities</option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            {errors.bloodBank && <p className="mb-3 text-sm text-brand-700">{errors.bloodBank}</p>}

            {banksLoading && !banksData ? (
              <div className="space-y-2">
                {[1, 2].map((key) => (
                  <Skeleton key={key} className="h-20" />
                ))}
              </div>
            ) : banks.length === 0 ? (
              <Alert tone="warning">
                No verified blood banks in {bankCity || 'this area'} yet. Choose “All cities” to see others.
              </Alert>
            ) : (
              <div role="radiogroup" aria-label="Blood bank" className="space-y-2">
                {banks.map((bank) => {
                  const units = form.bloodGroup ? (bank.inventory?.[form.bloodGroup] ?? 0) : null;
                  const level = stockLevel(units ?? 0);
                  const selected = form.bloodBank === bank._id;
                  return (
                    <label
                      key={bank._id}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition',
                        selected
                          ? 'border-brand-500 bg-brand-50/40 ring-4 ring-brand-100'
                          : 'border-ink-200 hover:border-ink-300',
                      )}
                    >
                      <input
                        type="radio"
                        name="bloodBank"
                        value={bank._id}
                        checked={selected}
                        onChange={() => update('bloodBank', bank._id)}
                        className="size-4 shrink-0 accent-brand-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink-900">{bank.name}</span>
                        <span className="block truncate text-sm text-ink-500">
                          {bank.address}, {bank.city}
                        </span>
                      </span>
                      {units !== null && (
                        <span className="shrink-0 text-right">
                          <span className="block text-lg font-bold text-ink-900">{units}</span>
                          <span className={cn('block text-xs font-semibold', LEVEL_TEXT[level])}>
                            {STOCK_LEVEL[level].label}
                          </span>
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {selectedUnits !== null && selectedUnits < Number(form.units || 1) && (
              <Alert tone="warning" className="mt-4">
                {selectedBank.name} has {selectedUnits} {form.bloodGroup} {selectedUnits === 1 ? 'unit' : 'units'} right
                now. You can still send the request — they may arrange more — or call them first on{' '}
                <a href={`tel:${selectedBank.phone}`} className="font-semibold underline">
                  {selectedBank.phone}
                </a>
                .
              </Alert>
            )}
          </Section>

          <Section number="3" title="Patient and contact">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Patient name" required autoComplete="off" {...bind('patientName')} />
              <TextField
                label="Patient age"
                type="number"
                inputMode="numeric"
                min="0"
                max="120"
                optional
                {...bind('patientAge')}
              />
              {!isHospital && (
                <>
                  <TextField label="Hospital where the patient is admitted" required {...bind('hospitalName')} />
                  <TextField label="City" required {...bind('city')} />
                </>
              )}
              <TextField
                label="Contact number"
                type="tel"
                hint="The blood bank and donors who offer to help will call this number."
                required
                {...bind('contactPhone')}
              />
              <TextareaField
                label="Notes for the blood bank"
                rows={3}
                maxLength={500}
                placeholder="e.g. ward number, doctor’s name, component needed"
                optional
                className="sm:col-span-2"
                {...bind('notes')}
              />
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="p-5">
            <h2 className="font-bold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Blood group</dt>
                <dd className="font-semibold text-ink-900">{form.bloodGroup || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Units</dt>
                <dd className="font-semibold text-ink-900">{form.units || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Urgency</dt>
                <dd className="font-semibold text-ink-900 capitalize">{form.urgency}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Blood bank</dt>
                <dd className="text-right font-semibold text-ink-900">{selectedBank?.name ?? '—'}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-6 w-full" loading={busy} icon={faPaperPlane}>
              Send request
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              <FontAwesomeIcon icon={faHouseMedical} className="mr-1" />
              Blood is issued against the doctor’s requisition form and a patient blood sample for cross-matching.
            </p>
          </Card>
          <p className="mt-4 text-center text-sm text-ink-500">
            <FontAwesomeIcon icon={faPhone} className="mr-1.5" />
            Emergency? Call{' '}
            <a href="tel:108" className="font-semibold text-ink-800 underline">
              108
            </a>{' '}
            first.
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/find-blood" className="font-semibold text-brand-700 hover:underline">
              Compare stock first
            </Link>
          </p>
        </aside>
      </form>
    </>
  );
}
