import {
  faArrowRight,
  faBell,
  faCircleCheck,
  faDroplet,
  faHandHoldingDroplet,
  faHandHoldingHeart,
  faHospital,
  faHouseMedical,
  faMagnifyingGlass,
  faPhone,
  faShieldHeart,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import BloodGroupPicker from '../../components/blood/BloodGroupPicker';
import CompatibilityExplorer from '../../components/blood/CompatibilityExplorer';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BLOOD_GROUPS, stockLevel } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { formatNumber, timeAgo } from '../../lib/format';

const LEVEL_BAR = { ok: 'bg-emerald-500', low: 'bg-amber-500', out: 'bg-red-500' };
const LEVEL_TEXT = { ok: 'Available', low: 'Running low', out: 'Out of stock' };

function SearchCard({ cities }) {
  const navigate = useNavigate();
  const [group, setGroup] = useState('');
  const [city, setCity] = useState('');

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (group) params.set('group', group);
    if (city) params.set('city', city);
    navigate(`/find-blood${params.size ? `?${params}` : ''}`);
  };

  return (
    <form
      onSubmit={search}
      className="mt-8 rounded-3xl border border-ink-100 bg-white p-5 shadow-xl shadow-ink-900/5 sm:p-6"
    >
      <p className="mb-3 text-sm font-bold text-ink-900">Which blood group do you need?</p>
      <BloodGroupPicker
        value={group}
        onChange={(value) => setGroup(value === group ? '' : value)}
        label="Blood group needed"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="home-city" className="sr-only">
            City
          </label>
          <Select id="home-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="">All cities</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="lg" icon={faMagnifyingGlass} className="sm:w-auto">
          Find blood
        </Button>
      </div>
    </form>
  );
}

function LiveStockCard({ stats }) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-linear-to-br from-brand-100 via-white to-ink-100 blur-2xl"
        aria-hidden="true"
      />
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-2xl shadow-ink-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              Live blood stock
            </p>
            <h2 className="mt-1 text-xl font-bold">Available right now</h2>
          </div>
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <FontAwesomeIcon icon={faDroplet} className="text-lg" />
          </span>
        </div>

        <ul className="mt-5 grid grid-cols-4 gap-2.5">
          {BLOOD_GROUPS.map((group) => {
            const units = stats?.stockByGroup?.[group];
            const level = stockLevel(units);
            return (
              <li key={group}>
                <Link
                  to={`/find-blood?group=${encodeURIComponent(group)}`}
                  className="block rounded-2xl border border-ink-100 p-3 text-center transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <span className="block text-sm font-extrabold text-ink-900">{group}</span>
                  {stats ? (
                    <span className="mt-1 block text-xl font-bold text-ink-900">{formatNumber(units)}</span>
                  ) : (
                    <Skeleton className="mx-auto mt-1.5 h-6 w-10" />
                  )}
                  <span
                    className={cn('mx-auto mt-2 block h-1 w-8 rounded-full', stats ? LEVEL_BAR[level] : 'bg-ink-100')}
                  />
                  <span className="sr-only">{stats ? LEVEL_TEXT[level] : 'Loading'}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4 text-sm text-ink-500">
          <span>
            {stats
              ? `${formatNumber(stats.unitsAvailable)} units at ${stats.bloodBanks} verified blood banks`
              : 'Loading stock…'}
          </span>
          {stats?.stockUpdatedAt && <span>Updated {timeAgo(stats.stockUpdatedAt)}</span>}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-emerald-500" /> 10+ units
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-amber-500" /> Running low
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-red-500" /> Out of stock
          </li>
        </ul>
      </div>

      {stats && (
        <div className="absolute -right-4 -bottom-8 hidden items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-xl shadow-ink-900/10 sm:flex">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">{formatNumber(stats.availableDonors)} donors ready</p>
            <p className="text-xs text-ink-500">to help in an emergency</p>
          </div>
        </div>
      )}
    </div>
  );
}

const JOURNEYS = {
  need: {
    label: 'I need blood',
    steps: [
      {
        icon: faMagnifyingGlass,
        title: 'Check stock',
        text: 'See which verified blood banks near you have the blood group you need, right now.',
      },
      {
        icon: faHandHoldingDroplet,
        title: 'Send a request',
        text: 'Request units for your patient in two minutes. The blood bank sees it immediately.',
      },
      {
        icon: faBell,
        title: 'Track and connect',
        text: 'Follow every status update, and get calls from willing donors in your city.',
      },
    ],
  },
  give: {
    label: 'I want to donate',
    steps: [
      {
        icon: faUserPlus,
        title: 'Register as a donor',
        text: 'Tell us your blood group and city. Your number is never shown publicly.',
      },
      {
        icon: faBell,
        title: 'See who needs you',
        text: 'We show requests your blood group can help with, close to where you live.',
      },
      {
        icon: faHandHoldingHeart,
        title: 'Donate and save lives',
        text: 'Offer to help with one tap, then donate at the blood bank. We remind you when you can give again.',
      },
    ],
  },
};

function HowItWorks() {
  const [journey, setJourney] = useState('need');
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-semibold text-brand-600">How RaktSetu works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple steps, whichever side you are on
            </h2>
          </div>
          <div role="group" aria-label="Choose a journey" className="flex rounded-xl bg-ink-100/70 p-1">
            {Object.entries(JOURNEYS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                aria-pressed={journey === key}
                onClick={() => setJourney(key)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition',
                  journey === key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <ol key={journey} className="mt-12 grid animate-fade-in gap-6 md:grid-cols-3">
          {JOURNEYS[journey].steps.map((step, index) => (
            <li key={step.title} className="relative rounded-3xl border border-ink-100 bg-white p-7 shadow-xs">
              <span
                className="absolute top-7 right-7 text-5xl leading-none font-extrabold text-ink-100"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-lg text-white shadow-lg shadow-brand-600/25">
                <FontAwesomeIcon icon={step.icon} />
              </span>
              <h3 className="mt-6 text-lg font-bold">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-ink-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const AUDIENCES = [
  {
    icon: faHandHoldingHeart,
    title: 'Donors',
    text: 'Get matched with requests your blood can help, track your donations and know when you can give again.',
    cta: 'Register as a donor',
    to: '/register?role=donor',
  },
  {
    icon: faUsers,
    title: 'Patients & families',
    text: 'Find stock in minutes, request blood from a verified blood bank and hear from donors who can help.',
    cta: 'Request blood',
    to: '/register?role=seeker',
  },
  {
    icon: faHospital,
    title: 'Hospitals',
    text: 'Send requests for admitted patients and follow every request in one dashboard.',
    cta: 'Register a hospital',
    to: '/register?role=hospital',
  },
  {
    icon: faHouseMedical,
    title: 'Blood banks',
    text: 'Publish live stock, process requests, record donations and keep a full stock history.',
    cta: 'Register a blood bank',
    to: '/register?role=bloodbank',
  },
];

const FAQ_PREVIEW = [
  {
    q: 'Who can donate blood?',
    a: 'Most healthy people aged 18–65 who weigh at least 45 kg can donate. The blood bank does a quick health check before every donation.',
  },
  {
    q: 'Is my phone number public?',
    a: 'No. Donor details are never listed publicly. A family only sees your name and number after you offer to help with their request.',
  },
  {
    q: 'How are blood banks verified?',
    a: 'Our team checks every blood bank’s licence before it appears in search results or can receive requests.',
  },
];

export default function Home() {
  useDocumentTitle();
  const { data: stats } = useApi('/public/stats');
  const { data: citiesData } = useApi('/public/cities');

  const highlights = [
    { label: 'Registered donors', value: stats?.donors, icon: faUsers },
    { label: 'Verified blood banks', value: stats?.bloodBanks, icon: faShieldHeart },
    { label: 'Units in stock today', value: stats?.unitsAvailable, icon: faDroplet },
    { label: 'Requests fulfilled', value: stats?.requestsFulfilled, icon: faCircleCheck },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50/70 via-paper to-paper">
        <div
          className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative container-page grid items-center gap-14 pt-12 pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-20 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-700 shadow-xs">
              <FontAwesomeIcon icon={faShieldHeart} /> Verified blood banks · Live stock
            </p>
            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Every drop counts.
              <br />
              Every life <span className="text-brand-600">matters.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              RaktSetu is a bridge between blood donors, verified blood banks, hospitals and families — so the right
              blood reaches the right patient, faster.
            </p>
            <SearchCard cities={citiesData?.cities ?? []} />
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
              <Link to="/register?role=donor" className="flex items-center gap-2 text-brand-700 hover:text-brand-800">
                Become a donor <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <a href="tel:108" className="flex items-center gap-2 text-ink-500 hover:text-ink-800">
                <FontAwesomeIcon icon={faPhone} /> Medical emergency? Call 108
              </a>
            </div>
          </div>
          <LiveStockCard stats={stats} />
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-ink-100 bg-white">
        <dl className="container-page grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-2 sm:px-4">
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-ink-50 text-ink-500 sm:flex">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <div className="flex flex-col-reverse">
                <dt className="mt-0.5 text-sm text-ink-500">{item.label}</dt>
                <dd className="text-3xl font-extrabold tracking-tight text-ink-900">
                  {item.value === undefined ? <Skeleton className="h-8 w-16" /> : formatNumber(item.value)}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <HowItWorks />

      {/* Audiences */}
      <section className="bg-ink-950 py-20 text-ink-200 sm:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="font-semibold text-brand-300">One network</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for everyone in the chain
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-300">
              Blood moves through many hands before it reaches a patient. RaktSetu gives each of them the tools they
              need.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/[0.08]"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-lg text-white">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-300">{item.text}</p>
                <Link
                  to={item.to}
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-200"
                >
                  {item.cta} <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="font-semibold text-brand-600">Blood group compatibility</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Who can give to whom?</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-600">
              Pick a blood group to see which groups it can donate to and receive from.
            </p>
          </div>
          <CompatibilityExplorer />
        </div>
      </section>

      {/* Donor call to action */}
      <section className="container-page pb-20 sm:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-12 text-white sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute -right-10 -bottom-24 size-80 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                One donation can help up to three patients
              </h2>
              <p className="mt-3 text-lg text-brand-100">
                It takes about an hour of your time. Register once, and we will tell you when someone nearby needs your
                blood group.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/register?role=donor" variant="white" size="lg" icon={faUserPlus}>
                Register as a donor
              </Button>
              <Button as={Link} to="/donate" size="lg" className="bg-white/10 ring-1 ring-white/30 hover:bg-white/20">
                Can I donate?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="border-t border-ink-100 bg-white py-20 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-semibold text-brand-600">Questions</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Good to know</h2>
            <p className="mt-4 text-ink-600">Short answers to what people ask us most.</p>
            <Button as={Link} to="/faq" variant="outline" className="mt-6" iconRight={faArrowRight}>
              All questions
            </Button>
          </div>
          <div className="divide-y divide-ink-100 rounded-3xl border border-ink-100">
            {FAQ_PREVIEW.map((item) => (
              <div key={item.q} className="p-6">
                <h3 className="font-bold">{item.q}</h3>
                <p className="mt-2 leading-relaxed text-ink-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
