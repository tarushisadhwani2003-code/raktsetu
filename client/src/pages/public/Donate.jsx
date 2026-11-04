import {
  faBed,
  faCakeCandles,
  faCalendarCheck,
  faClipboardList,
  faCookieBite,
  faDroplet,
  faGlassWater,
  faHeartPulse,
  faIdCard,
  faStethoscope,
  faSyringe,
  faUserPlus,
  faVial,
  faWeightScale,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link } from 'react-router';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { SelectField, TextField } from '../../components/ui/Field';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { GENDERS } from '../../lib/constants';
import { quickEligibilityCheck } from '../../lib/eligibility';
import { formatDate, todayInput } from '../../lib/format';

const CRITERIA = [
  { icon: faCakeCandles, title: '18 to 65 years old', text: 'First-time donors should be under 60.' },
  { icon: faWeightScale, title: 'At least 45 kg', text: 'Donors over 55 kg can give a larger 450 ml unit.' },
  {
    icon: faVial,
    title: 'Haemoglobin 12.5 g/dL or more',
    text: 'Checked with a quick finger-prick test before you donate.',
  },
  { icon: faCalendarCheck, title: '90 or 120 days apart', text: 'Men can donate every 90 days, women every 120 days.' },
  { icon: faHeartPulse, title: 'Feeling well today', text: 'No fever, cold or infection, and not on antibiotics.' },
  {
    icon: faStethoscope,
    title: 'Recent procedures',
    text: 'Tattoos, piercings, surgery or some vaccines mean waiting — the blood bank will advise you.',
  },
];

const PROCESS = [
  {
    icon: faClipboardList,
    title: 'Registration',
    time: '10 min',
    text: 'Show a photo ID and fill in a short health form.',
  },
  {
    icon: faStethoscope,
    title: 'Mini health check',
    time: '10 min',
    text: 'Haemoglobin, blood pressure, pulse and weight are checked.',
  },
  {
    icon: faSyringe,
    title: 'Donation',
    time: '8–10 min',
    text: 'About 350–450 ml of blood is collected with a sterile, single-use kit.',
  },
  {
    icon: faCookieBite,
    title: 'Rest & refresh',
    time: '15 min',
    text: 'Relax, have a snack and something to drink before you leave.',
  },
];

const TIPS = {
  before: [
    { icon: faCookieBite, text: 'Eat a proper meal 2–3 hours before. Don’t donate on an empty stomach.' },
    { icon: faGlassWater, text: 'Drink plenty of water the day before and on the day.' },
    { icon: faBed, text: 'Sleep well the night before.' },
    { icon: faIdCard, text: 'Carry a government photo ID.' },
  ],
  after: [
    { icon: faBed, text: 'Rest for 10–15 minutes before getting up.' },
    { icon: faGlassWater, text: 'Drink extra fluids for the next 24 hours.' },
    { icon: faHeartPulse, text: 'Avoid heavy exercise and lifting for the rest of the day.' },
    { icon: faDroplet, text: 'Keep the bandage on for a few hours. Feel dizzy? Sit or lie down.' },
  ],
};

function EligibilityCheck() {
  const [form, setForm] = useState({ age: '', weight: '', gender: '', lastDonation: '' });
  const [result, setResult] = useState(null);
  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setResult(null);
  };

  const check = (event) => {
    event.preventDefault();
    setResult(quickEligibilityCheck(form));
  };

  return (
    <Card className="p-6 sm:p-8 lg:self-start">
      <h3 className="text-xl font-bold">Quick check: can I donate?</h3>
      <p className="mt-1 text-sm text-ink-500">Nothing you enter here is saved.</p>
      <form onSubmit={check} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <TextField
          label="Age"
          type="number"
          inputMode="numeric"
          min="1"
          max="120"
          value={form.age}
          onChange={set('age')}
          required
        />
        <TextField
          label="Weight (kg)"
          type="number"
          inputMode="numeric"
          min="1"
          max="300"
          value={form.weight}
          onChange={set('weight')}
          required
        />
        <SelectField label="Gender" value={form.gender} onChange={set('gender')} required>
          <option value="">Choose…</option>
          {GENDERS.map((gender) => (
            <option key={gender.value} value={gender.value}>
              {gender.label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Last donation"
          type="date"
          max={todayInput()}
          value={form.lastDonation}
          onChange={set('lastDonation')}
          hint="Leave empty if you have never donated."
        />
        <div className="sm:col-span-2">
          <Button type="submit" className="w-full sm:w-auto">
            Check my eligibility
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {result &&
          (result.eligible ? (
            <Alert
              tone="success"
              title="You can most likely donate"
              className="mt-6"
              action={
                <Button as={Link} to="/register?role=donor" size="sm" variant="success">
                  Register as a donor
                </Button>
              }
            >
              The blood bank will do a short health check before your donation.
            </Alert>
          ) : (
            <Alert tone="warning" title="You may not be able to donate right now" className="mt-6">
              <ul className="list-disc space-y-1 pl-5">
                {result.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
              {result.waitUntil && <p className="mt-2">You can donate again from {formatDate(result.waitUntil)}.</p>}
            </Alert>
          ))}
      </div>
    </Card>
  );
}

export default function Donate() {
  useDocumentTitle('Donate blood');
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-brand-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative container-page py-16 sm:py-24">
          <p className="font-semibold text-brand-300">Become a blood donor</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One hour of your time. Up to three lives helped.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-300">
            Blood can’t be manufactured — it only comes from people like you. Here is everything you need to know before
            your first (or fiftieth) donation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to="/register?role=donor" size="lg" icon={faUserPlus}>
              Register as a donor
            </Button>
            <Button as="a" href="#eligibility" size="lg" className="bg-white/10 ring-1 ring-white/25 hover:bg-white/15">
              Check if I can donate
            </Button>
          </div>
        </div>
      </section>

      <section id="eligibility" className="scroll-mt-20 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="font-semibold text-brand-600">Who can donate</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">The basics</h2>
            <p className="mt-3 text-lg text-ink-600">
              Based on the National Blood Transfusion Council guidelines. The blood bank’s medical team makes the final
              decision.
            </p>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <ul className="grid gap-4 sm:grid-cols-2">
              {CRITERIA.map((item) => (
                <li key={item.title} className="rounded-2xl border border-ink-100 bg-white p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <h3 className="mt-4 font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.text}</p>
                </li>
              ))}
            </ul>
            <EligibilityCheck />
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-white py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="font-semibold text-brand-600">On the day</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What happens when you donate</h2>
            <p className="mt-3 text-lg text-ink-600">The whole visit takes about 45 minutes to an hour.</p>
          </div>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, index) => (
              <li key={step.title} className="rounded-3xl bg-paper p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-ink-900 text-white">
                    <FontAwesomeIcon icon={step.icon} />
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-600 ring-1 ring-ink-100">
                    {step.time}
                  </span>
                </div>
                <h3 className="mt-5 font-bold">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {[
            ['Before you donate', TIPS.before],
            ['After you donate', TIPS.after],
          ].map(([title, tips]) => (
            <Card key={title} className="p-6 sm:p-8">
              <h2 className="text-xl font-bold">{title}</h2>
              <ul className="mt-5 space-y-4">
                {tips.map((tip) => (
                  <li key={tip.text} className="flex gap-3 text-ink-600">
                    <FontAwesomeIcon icon={tip.icon} className="mt-1 w-4 text-brand-600" />
                    {tip.text}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-brand-50 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to be someone’s bridge?</h2>
            <p className="mt-2 text-ink-600">Register once. We’ll show you requests your blood group can help with.</p>
          </div>
          <Button as={Link} to="/register?role=donor" size="lg" icon={faUserPlus}>
            Register as a donor
          </Button>
        </div>
      </section>
    </>
  );
}
