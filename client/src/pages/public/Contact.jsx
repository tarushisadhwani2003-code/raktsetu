import {
  faCircleCheck,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faPhone,
  faTruckMedical,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { SelectField, TextareaField, TextField } from '../../components/ui/Field';
import { useToast } from '../../context/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../lib/api';
import { SITE } from '../../lib/site';

const SUBJECTS = [
  'General question',
  'Help with a blood request',
  'Partner as a blood bank or hospital',
  'Organise a donation camp',
  'Report a problem',
];

const EMPTY = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

export default function Contact() {
  useDocumentTitle('Contact us');
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await api.post('/public/contact', form);
      setSent(true);
      setForm(EMPTY);
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pb-20">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page py-12 sm:py-16">
          <p className="font-semibold text-brand-600">Contact us</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">We’re here to help</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Questions about a request, partnering as a blood bank, or organising a donation camp — send us a message.
          </p>
        </div>
      </section>

      <div className="container-page mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
                <FontAwesomeIcon icon={faCircleCheck} />
              </span>
              <h2 className="mt-5 text-2xl font-bold">Message sent</h2>
              <p className="mx-auto mt-2 max-w-sm text-ink-600">
                Thank you for writing to us. We usually reply within one working day.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Your name"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
                required
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
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
                optional
              />
              <SelectField
                label="Subject"
                value={form.subject}
                onChange={set('subject')}
                error={errors.subject}
                required
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </SelectField>
              <TextareaField
                label="Message"
                value={form.message}
                onChange={set('message')}
                error={errors.message}
                rows={6}
                maxLength={2000}
                className="sm:col-span-2"
                required
              />
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-500">Please don’t share medical reports or ID numbers here.</p>
                <Button type="submit" loading={sending} icon={faPaperPlane}>
                  Send message
                </Button>
              </div>
            </form>
          )}
        </Card>

        <aside className="space-y-4">
          <Alert tone="error" title="Need blood urgently?">
            Call an ambulance on{' '}
            <a href="tel:108" className="font-bold underline">
              108
            </a>{' '}
            and use{' '}
            <Link to="/find-blood" className="font-bold underline">
              Find blood
            </Link>{' '}
            to check stock right away.
          </Alert>
          <Card className="divide-y divide-ink-100">
            {[
              { icon: faEnvelope, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
              { icon: faPhone, label: 'Phone', value: SITE.phone, href: SITE.phoneHref },
              { icon: faLocationDot, label: 'Office', value: SITE.address },
              {
                icon: faTruckMedical,
                label: 'Emergency',
                value: SITE.emergency.map((item) => `${item.label} ${item.number}`).join(' · '),
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink-500">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-semibold break-words text-ink-900 hover:text-brand-700">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-ink-900">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
