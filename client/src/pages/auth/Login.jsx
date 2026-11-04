import { faArrowRight, faFlask } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { PasswordField, TextField } from '../../components/ui/Field';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { getErrorMessage, getFieldErrors } from '../../lib/api';
import { firstName } from '../../lib/format';

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const config = useSiteConfig();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const signIn = async (identifier, password) => {
    setBusy(true);
    setMessage('');
    try {
      const user = await login(identifier, password);
      toast.success(`Welcome back, ${firstName(user.name)}!`);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setErrors(getFieldErrors(error));
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    signIn(form.identifier, form.password);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-ink-500">Log in to your RaktSetu account.</p>

      {message && (
        <Alert tone="error" className="mt-6">
          {message}
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <TextField
          label="Email or mobile number"
          value={form.identifier}
          onChange={set('identifier')}
          error={errors.identifier}
          autoComplete="username"
          autoFocus
          required
        />
        <div>
          <PasswordField
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} iconRight={faArrowRight}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        New to RaktSetu?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>

      {config.demoMode && config.demoAccounts?.length > 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <FontAwesomeIcon icon={faFlask} className="text-brand-600" /> Try a demo account
          </p>
          <p className="mt-1 text-sm text-ink-500">Sample data only. Password for all: {config.demoPassword}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {config.demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => signIn(account.email, config.demoPassword)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
