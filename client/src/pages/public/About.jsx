import {
  faEye,
  faHandHoldingHeart,
  faHeart,
  faHospital,
  faIndianRupeeSign,
  faLock,
  faMagnifyingGlass,
  faPeopleGroup,
  faShieldHeart,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import Button from '../../components/ui/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const PILLARS = [
  {
    icon: faUsers,
    title: 'Connects donors',
    text: 'Brings together willing donors and the people who need them, close to home.',
  },
  {
    icon: faHospital,
    title: 'Supports hospitals',
    text: 'Helps hospitals and blood banks coordinate requests without endless phone calls.',
  },
  {
    icon: faPeopleGroup,
    title: 'Builds stronger communities',
    text: 'Encourages a culture of regular, voluntary blood donation.',
  },
];

const REASONS = [
  { icon: faMagnifyingGlass, title: 'Easy search', text: 'Find blood banks with the group you need in a few taps.' },
  {
    icon: faHandHoldingHeart,
    title: 'Community support',
    text: 'Donors nearby can see your request and offer to help.',
  },
  { icon: faHospital, title: 'Healthcare network', text: 'Hospitals and blood banks work together in one place.' },
  {
    icon: faShieldHeart,
    title: 'Trust and safety',
    text: 'Every blood bank and hospital is checked before it goes live.',
  },
];

const PRINCIPLES = [
  {
    icon: faLock,
    title: 'Privacy first',
    text: 'Donor phone numbers are never public. They are shared only when a donor chooses to help.',
  },
  {
    icon: faShieldHeart,
    title: 'Verified network',
    text: 'Licences are checked by our team before a facility can appear or receive requests.',
  },
  {
    icon: faIndianRupeeSign,
    title: 'Free to use',
    text: 'RaktSetu never charges donors, patients or families. Blood banks may charge their standard processing fees.',
  },
];

export default function About() {
  useDocumentTitle('About us');
  return (
    <>
      <section className="bg-linear-to-b from-brand-50/70 to-paper">
        <div className="container-page py-16 text-center sm:py-24">
          <p className="font-semibold text-brand-600">About RaktSetu</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Connecting hearts, <span className="text-brand-600">saving lives</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
            “Rakt” means blood and “Setu” means bridge. RaktSetu is that bridge — between donors, blood banks, hospitals
            and the families waiting for blood.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold text-brand-600">Who we are</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">More than just a platform</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-600">
              When someone needs blood, families often spend hours calling blood banks and asking friends for donors.
              RaktSetu puts live blood stock, verified blood banks and willing donors in one place, so that time is
              spent on the patient instead.
            </p>
            <p className="mt-4 leading-relaxed text-ink-600">
              Our goal is to make finding and donating blood simple, safe and accessible for everyone.
            </p>
          </div>
          <ul className="space-y-4">
            {PILLARS.map((item) => (
              <li key={item.title} className="flex gap-5 rounded-3xl border border-ink-100 bg-white p-6">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-xl text-white">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 leading-relaxed text-ink-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink-950 py-16 text-ink-200 sm:py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {[
            {
              icon: faHeart,
              title: 'Our mission',
              text: 'To make it easier for people to access blood-related services and support those in need when they need it most.',
            },
            {
              icon: faEye,
              title: 'Our vision',
              text: 'A connected community where access to blood is faster, easier and more reliable for everyone.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="font-semibold text-brand-600">Why RaktSetu</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">What makes us different</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-ink-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-lg text-brand-600">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <h3 className="mt-5 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 rounded-[2rem] border border-ink-100 bg-white p-8 sm:p-10 lg:grid-cols-3">
            {PRINCIPLES.map((item) => (
              <div key={item.title}>
                <FontAwesomeIcon icon={item.icon} className="text-xl text-brand-600" />
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-linear-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Join our mission</h2>
            <p className="mt-2 text-brand-100">Be part of RaktSetu. Your small step can make a big difference.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/register?role=donor" variant="white" size="lg" icon={faUserPlus}>
              Become a donor
            </Button>
            <Button as={Link} to="/contact" size="lg" className="bg-white/10 ring-1 ring-white/30 hover:bg-white/20">
              Partner with us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
