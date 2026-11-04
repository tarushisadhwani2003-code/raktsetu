import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/Field';
import { useToast } from '../../context/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../lib/api';

export default function ResetPassword() {
  useDocumentTitle('Choose a new password');
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setErrors({ confirm: 'The two passwords do not match.' });
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      toast.success(data.message);
      navigate('/login', { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setMessage(getErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-ink-500">Use at least 8 characters, with letters and numbers.</p>

      {message && (
        <Alert
          tone="error"
          className="mt-6"
          action={
            <Link to="/forgot-password" className="font-semibold underline">
              Get a new link
            </Link>
          }
        >
          {message}
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <PasswordField
          label="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          autoComplete="new-password"
          required
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Save new password
        </Button>
      </form>
    </div>
  );
}
