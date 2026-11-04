import { faArrowLeft, faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../lib/api';

export default function ForgotPassword() {
  useDocumentTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (requestError) {
      setError(getFieldErrors(requestError).email ?? getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          <FontAwesomeIcon icon={faEnvelopeCircleCheck} />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-ink-600">{result.message} The link is valid for 30 minutes.</p>
        {result.devResetUrl && (
          <Alert tone="info" title="Development mode" className="mt-6 text-left">
            Email is not set up on this server, so here is the link:{' '}
            <a href={result.devResetUrl} className="font-semibold break-all underline">
              Reset password
            </a>
          </Alert>
        )}
        <Button as={Link} to="/login" variant="outline" className="mt-8" icon={faArrowLeft}>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-ink-500">
        Enter the email you registered with and we’ll send you a link to choose a new one.
      </p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
          }}
          error={error}
          autoComplete="email"
          autoFocus
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
