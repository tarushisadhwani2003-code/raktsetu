import { faFloppyDisk, faKey, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import BloodGroupPicker from '../../components/blood/BloodGroupPicker';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Field, PasswordField, SelectField, TextField } from '../../components/ui/Field';
import PageHeader from '../../components/ui/PageHeader';
import Switch from '../../components/ui/Switch';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../lib/api';
import { GENDERS, ROLE_LABELS, VERIFICATION } from '../../lib/constants';
import { todayInput, toDateInput } from '../../lib/format';

function initialProfile(user) {
  const profile = { name: user.name, email: user.email, phone: user.phone, city: user.city, state: user.state ?? '' };
  if (user.donor) {
    Object.assign(profile, {
      bloodGroup: user.donor.bloodGroup,
      gender: user.donor.gender,
      dateOfBirth: toDateInput(user.donor.dateOfBirth),
      weightKg: user.donor.weightKg ?? '',
      lastDonationDate: toDateInput(user.donor.lastDonationDate),
    });
  }
  if (user.facility) {
    Object.assign(profile, {
      facilityName: user.facility.name,
      licenseNumber: user.facility.licenseNumber,
      address: user.facility.address,
      pincode: user.facility.pincode,
      facilityPhone: user.facility.phone,
      openingHours: user.facility.openingHours,
    });
  }
  return profile;
}

function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => initialProfile(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const bind = (key) => ({
    value: form[key] ?? '',
    error: errors[key],
    onChange: (event) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/account', form);
      setUser(data.user);
      setForm(initialProfile(data.user));
      setErrors({});
      toast.success(data.message);
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const facilityLabel = user.role === 'bloodbank' ? 'Blood bank' : 'Hospital';

  return (
    <form onSubmit={submit} noValidate>
      <Card>
        <CardHeader title="Personal details" description="Used to contact you about requests and donations." />
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <TextField label="Full name" autoComplete="name" required {...bind('name')} />
          <TextField label="Email" type="email" autoComplete="email" required {...bind('email')} />
          <TextField label="Mobile number" type="tel" autoComplete="tel" required {...bind('phone')} />
          <TextField label="City" autoComplete="address-level2" required {...bind('city')} />
          <TextField label="State" autoComplete="address-level1" optional {...bind('state')} />
        </div>
      </Card>

      {user.donor && (
        <Card className="mt-6">
          <CardHeader title="Donor details" description="Keep these correct — they decide which requests you see." />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <Field
              id="profile-blood-group"
              label="Blood group"
              error={errors.bloodGroup}
              required
              className="sm:col-span-2"
            >
              <BloodGroupPicker
                value={form.bloodGroup}
                onChange={(value) => setForm((current) => ({ ...current, bloodGroup: value }))}
                className="sm:grid-cols-8"
              />
            </Field>
            <SelectField label="Gender" required {...bind('gender')}>
              {GENDERS.map((gender) => (
                <option key={gender.value} value={gender.value}>
                  {gender.label}
                </option>
              ))}
            </SelectField>
            <TextField label="Date of birth" type="date" max={todayInput()} required {...bind('dateOfBirth')} />
            <TextField
              label="Weight (kg)"
              type="number"
              inputMode="numeric"
              min="45"
              max="250"
              required
              {...bind('weightKg')}
            />
            <TextField
              label="Last donation"
              type="date"
              max={todayInput()}
              hint="Donations recorded by blood banks update this automatically."
              optional
              {...bind('lastDonationDate')}
            />
          </div>
        </Card>
      )}

      {user.facility && (
        <Card className="mt-6">
          <CardHeader
            title={`${facilityLabel} details`}
            description="Changing the name or licence number sends your facility for re-verification."
            action={<StatusBadge map={VERIFICATION} value={user.facility.verification?.status} />}
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <TextField label={`${facilityLabel} name`} required className="sm:col-span-2" {...bind('facilityName')} />
            <TextField label="Licence / registration number" required {...bind('licenseNumber')} />
            <TextField label="Facility phone" type="tel" {...bind('facilityPhone')} />
            <TextField label="Street address" required className="sm:col-span-2" {...bind('address')} />
            <TextField label="PIN code" inputMode="numeric" maxLength={6} required {...bind('pincode')} />
            <TextField label="Opening hours" placeholder="Open 24 hours" {...bind('openingHours')} />
          </div>
        </Card>
      )}

      <div className="mt-4 flex justify-end">
        <Button type="submit" loading={saving} icon={faFloppyDisk}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function AvailabilityCard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const toggle = async (isAvailable) => {
    setSaving(true);
    try {
      const { data } = await api.patch('/account', { isAvailable });
      setUser(data.user);
      toast.success(isAvailable ? 'You are available to donate.' : 'You are now hidden from new requests.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <Switch
        checked={user.donor.isAvailable}
        onChange={toggle}
        disabled={saving}
        label="Available to donate"
        description="Turn this off when you are travelling or unwell. You can switch it back on any time."
      />
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/account/password', form);
      toast.success(data.message);
      setForm({ currentPassword: '', newPassword: '' });
      setErrors({});
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Change password"
        description="You will stay signed in on this device. Other devices are signed out."
      />
      <form onSubmit={submit} noValidate className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <PasswordField
          label="Current password"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
          error={errors.currentPassword}
          autoComplete="current-password"
          required
        />
        <PasswordField
          label="New password"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
          error={errors.newPassword}
          hint="At least 8 characters, with letters and numbers."
          autoComplete="new-password"
          required
        />
        <div className="sm:col-span-2">
          <Button type="submit" variant="dark" loading={saving} icon={faKey}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DeleteAccountCard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete('/account', { data: { password } });
      toast.success(data.message);
      setUser(null);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getFieldErrors(requestError).password ?? getErrorMessage(requestError));
      setBusy(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader title="Delete account" description="Permanently remove your account and personal details." />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-ink-600">
          {user.facility
            ? 'Your facility will be removed from RaktSetu and pending requests will be declined.'
            : 'Your open requests will be cancelled. This cannot be undone.'}
        </p>
        <Button variant="danger" icon={faTrash} onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setPassword('');
          setError('');
        }}
        onConfirm={confirm}
        busy={busy}
        title="Delete your account?"
        description="This permanently deletes your RaktSetu account. Enter your password to confirm."
        confirmLabel="Delete permanently"
      >
        <PasswordField
          label="Password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          error={error}
          autoComplete="current-password"
          required
        />
      </ConfirmDialog>
    </Card>
  );
}

export default function Profile() {
  useDocumentTitle('Profile & settings');
  const { user } = useAuth();
  return (
    <>
      <PageHeader
        title="Profile & settings"
        description={`Signed in as ${user.email} · ${ROLE_LABELS[user.role]} account`}
      />
      <div className="space-y-6">
        {user.donor && <AvailabilityCard />}
        <ProfileForm />
        <PasswordCard />
        <DeleteAccountCard />
      </div>
    </>
  );
}
