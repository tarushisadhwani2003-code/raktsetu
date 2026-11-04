import {
  faArrowLeft,
  faArrowRight,
  faCircleCheck,
  faHandHoldingHeart,
  faHospital,
  faHouseMedical,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import BloodGroupPicker from '../../components/blood/BloodGroupPicker';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { Checkbox, Field, PasswordField, SelectField, TextField } from '../../components/ui/Field';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage, getFieldErrors } from '../../lib/api';
import { cn } from '../../lib/cn';
import { DONOR_AGE, GENDERS } from '../../lib/constants';
import { firstName, todayInput, toDateInput } from '../../lib/format';

const ROLES = [
  {
    value: 'donor',
    icon: faHandHoldingHeart,
    title: 'Blood donor',
    text: 'See requests your blood group can help with, close to home.',
  },
  {
    value: 'seeker',
    icon: faUsers,
    title: 'Patient or family',
    text: 'Find blood and send requests for someone you care for.',
  },
  {
    value: 'hospital',
    icon: faHospital,
    title: 'Hospital',
    text: 'Request blood for admitted patients and track every request.',
  },
  {
    value: 'bloodbank',
    icon: faHouseMedical,
    title: 'Blood bank',
    text: 'Publish your stock, handle requests and record donations.',
  },
];

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  password: '',
  city: '',
  state: '',
  bloodGroup: '',
  gender: '',
  dateOfBirth: '',
  weightKg: '',
  lastDonationDate: '',
  facilityName: '',
  licenseNumber: '',
  address: '',
  pincode: '',
  facilityPhone: '',
  openingHours: '',
};

const DONOR_FIELDS = ['bloodGroup', 'gender', 'dateOfBirth', 'weightKg', 'lastDonationDate'];
const FACILITY_FIELDS = ['facilityName', 'licenseNumber', 'address', 'pincode', 'facilityPhone', 'openingHours'];

/** Latest birth date for an 18-year-old today. */
function maxBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - DONOR_AGE.min);
  return toDateInput(date);
}

function RoleChooser({ value, onChoose }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-ink-500">How will you use RaktSetu?</p>
      <div role="radiogroup" aria-label="Account type" className="mt-8 grid gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={value === role.value}
            onClick={() => onChoose(role.value)}
            className={cn(
              'group flex flex-col rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg',
              value === role.value ? 'border-brand-500 ring-4 ring-brand-100' : 'border-ink-100 hover:border-ink-200',
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <FontAwesomeIcon icon={role.icon} />
            </span>
            <span className="mt-4 font-bold text-ink-900">{role.title}</span>
            <span className="mt-1 text-sm leading-relaxed text-ink-500">{role.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  useDocumentTitle('Create an account');
  const { register } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [params] = useSearchParams();
  const presetRole = ROLES.some((role) => role.value === params.get('role')) ? params.get('role') : '';

  const [role, setRole] = useState(presetRole);
  const [step, setStep] = useState(presetRole ? 2 : 1);
  const [form, setForm] = useState(INITIAL);
  const [agreed, setAgreed] = useState(false);
  const [donorConsent, setDonorConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const isDonor = role === 'donor';
  const isFacility = role === 'hospital' || role === 'bloodbank';
  const roleInfo = ROLES.find((item) => item.value === role);

  const set = (key) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const localErrors = {};
    if (!agreed) localErrors.agreed = 'Please accept the terms to continue.';
    if (isDonor && !donorConsent) localErrors.donorConsent = 'Donors need to agree to be contacted about requests.';
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      return;
    }

    const skip = new Set([...(isDonor ? [] : DONOR_FIELDS), ...(isFacility ? [] : FACILITY_FIELDS)]);
    const payload = { role, ...Object.fromEntries(Object.entries(form).filter(([key]) => !skip.has(key))) };

    setBusy(true);
    setMessage('');
    try {
      const user = await register(payload);
      toast.success(`Welcome to RaktSetu, ${firstName(user.name)}!`);
    } catch (error) {
      setErrors(getFieldErrors(error));
      setMessage(getErrorMessage(error));
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (step === 1) {
    return (
      <>
        <RoleChooser
          value={role}
          onChoose={(value) => {
            setRole(value);
            setStep(2);
          }}
        />
        <p className="mt-8 text-center text-sm text-ink-600">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Change account type
      </button>
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg text-white">
          <FontAwesomeIcon icon={roleInfo.icon} />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Register as a {roleInfo.title.toLowerCase()}
          </h1>
          <p className="text-ink-500">{roleInfo.text}</p>
        </div>
      </div>

      {message && (
        <Alert tone="error" className="mt-6">
          {message}
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="mt-8 space-y-8">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-bold tracking-wide text-ink-400 uppercase">
            {isFacility ? 'Contact person' : 'Your details'}
          </legend>
          <TextField
            label="Full name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            autoComplete="name"
            required
            className="sm:col-span-2"
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            required
          />
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            autoComplete="tel"
            placeholder="98765 43210"
            required
          />
          <TextField
            label="City"
            value={form.city}
            onChange={set('city')}
            error={errors.city}
            autoComplete="address-level2"
            required
          />
          <TextField
            label="State"
            value={form.state}
            onChange={set('state')}
            error={errors.state}
            autoComplete="address-level1"
            optional
          />
          <PasswordField
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint="At least 8 characters, with letters and numbers."
            autoComplete="new-password"
            required
            className="sm:col-span-2"
          />
        </fieldset>

        {isDonor && (
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 text-sm font-bold tracking-wide text-ink-400 uppercase">Donor details</legend>
            <Field
              id="register-blood-group"
              label="Blood group"
              error={errors.bloodGroup}
              required
              className="sm:col-span-2"
            >
              <BloodGroupPicker
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
                invalid={Boolean(errors.bloodGroup)}
              />
            </Field>
            <SelectField label="Gender" value={form.gender} onChange={set('gender')} error={errors.gender} required>
              <option value="">Choose…</option>
              {GENDERS.map((gender) => (
                <option key={gender.value} value={gender.value}>
                  {gender.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Date of birth"
              type="date"
              max={maxBirthDate()}
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              error={errors.dateOfBirth}
              autoComplete="bday"
              required
            />
            <TextField
              label="Weight (kg)"
              type="number"
              inputMode="numeric"
              min="45"
              max="250"
              value={form.weightKg}
              onChange={set('weightKg')}
              error={errors.weightKg}
              required
            />
            <TextField
              label="Last donation"
              type="date"
              max={todayInput()}
              value={form.lastDonationDate}
              onChange={set('lastDonationDate')}
              error={errors.lastDonationDate}
              hint="Leave empty if you have never donated."
              optional
            />
          </fieldset>
        )}

        {isFacility && (
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 text-sm font-bold tracking-wide text-ink-400 uppercase">
              {role === 'bloodbank' ? 'Blood bank' : 'Hospital'} details
            </legend>
            <TextField
              label={role === 'bloodbank' ? 'Blood bank name' : 'Hospital name'}
              value={form.facilityName}
              onChange={set('facilityName')}
              error={errors.facilityName}
              required
              className="sm:col-span-2"
            />
            <TextField
              label="Licence / registration number"
              value={form.licenseNumber}
              onChange={set('licenseNumber')}
              error={errors.licenseNumber}
              hint="We check this before your facility goes live."
              required
            />
            <TextField
              label="Facility phone"
              type="tel"
              value={form.facilityPhone}
              onChange={set('facilityPhone')}
              error={errors.facilityPhone}
              placeholder="0141-2345678"
              optional
            />
            <TextField
              label="Street address"
              value={form.address}
              onChange={set('address')}
              error={errors.address}
              autoComplete="street-address"
              required
              className="sm:col-span-2"
            />
            <TextField
              label="PIN code"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={set('pincode')}
              error={errors.pincode}
              autoComplete="postal-code"
              required
            />
            <TextField
              label="Opening hours"
              value={form.openingHours}
              onChange={set('openingHours')}
              error={errors.openingHours}
              placeholder="Open 24 hours"
              optional
            />
          </fieldset>
        )}

        <div className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5">
          {isDonor && (
            <Checkbox
              checked={donorConsent}
              onChange={(event) => {
                setDonorConsent(event.target.checked);
                setErrors((current) => ({ ...current, donorConsent: undefined }));
              }}
              error={errors.donorConsent}
              label="I agree that people who need my blood group can see my name and number when I offer to help them."
            />
          )}
          <Checkbox
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked);
              setErrors((current) => ({ ...current, agreed: undefined }));
            }}
            error={errors.agreed}
            label={
              <>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-semibold text-brand-700 underline">
                  Terms of use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="font-semibold text-brand-700 underline">
                  Privacy policy
                </Link>
                .
              </>
            }
          />
        </div>

        {isFacility && (
          <p className="flex items-start gap-2 text-sm text-ink-500">
            <FontAwesomeIcon icon={faCircleCheck} className="mt-1 text-emerald-600" />
            Your {role === 'bloodbank' ? 'blood bank' : 'hospital'} will be reviewed by the RaktSetu team. You can use
            your dashboard in the meantime.
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={busy} iconRight={faArrowRight}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
