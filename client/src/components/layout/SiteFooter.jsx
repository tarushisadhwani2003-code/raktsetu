import { faEnvelope, faLocationDot, faPhone, faTruckMedical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { SITE } from '../../lib/site';
import Logo from './Logo';

const YEAR = new Date().getFullYear();

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/find-blood', label: 'Find blood' },
      { to: '/donate', label: 'Become a donor' },
      { to: '/register?role=bloodbank', label: 'Register a blood bank' },
      { to: '/register?role=hospital', label: 'Register a hospital' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/about', label: 'About RaktSetu' },
      { to: '/faq', label: 'Questions & answers' },
      { to: '/contact', label: 'Contact us' },
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/terms', label: 'Terms of use' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo inverted tagline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{SITE.description}</p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
            <FontAwesomeIcon icon={faTruckMedical} className="text-brand-300" />
            <span>
              <span className="block font-semibold text-white">In an emergency</span>
              {SITE.emergency.map((item, index) => (
                <span key={item.number}>
                  {index > 0 && ' · '}
                  {item.label}{' '}
                  <a href={`tel:${item.number}`} className="font-bold text-white hover:underline">
                    {item.number}
                  </a>
                </span>
              ))}
            </span>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-bold tracking-wide text-white">{column.title}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-sm font-bold tracking-wide text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 w-4 text-ink-400" />
              {SITE.address}
            </li>
            <li className="flex gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="mt-0.5 w-4 text-ink-400" />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <FontAwesomeIcon icon={faPhone} className="mt-0.5 w-4 text-ink-400" />
              <a href={SITE.phoneHref} className="hover:text-white">
                {SITE.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} RaktSetu. Made in India for a healthier tomorrow.</p>
          <p>RaktSetu does not provide medical advice. Always follow your doctor and blood bank.</p>
        </div>
      </div>
    </footer>
  );
}
