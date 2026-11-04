import {
  faChevronRight,
  faCircleCheck,
  faClock,
  faDiamondTurnRight,
  faEnvelope,
  faHandHoldingDroplet,
  faHouseMedical,
  faLocationDot,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useParams, useSearchParams } from 'react-router';
import InventoryGrid from '../../components/blood/InventoryGrid';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { totalInventory } from '../../lib/constants';
import { formatNumber, mapsUrl, telHref, timeAgo } from '../../lib/format';

export default function BloodBankDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data, loading, error } = useApi(`/public/blood-banks/${id}`);
  const bank = data?.bank;
  useDocumentTitle(bank?.name ?? 'Blood bank');

  if (loading && !bank) return <PageLoader />;

  if (error || !bank) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={faHouseMedical}
          title="Blood bank not found"
          description={error ?? 'This blood bank does not exist or is not verified yet.'}
          action={
            <Button as={Link} to="/find-blood">
              Back to search
            </Button>
          }
        />
      </div>
    );
  }

  const highlight = (params.get('group') ?? '').replace(/ $/, '+');
  const total = totalInventory(bank.inventory);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-ink-500">
        <Link to="/find-blood" className="hover:text-ink-900">
          Find blood
        </Link>
        <FontAwesomeIcon icon={faChevronRight} className="text-[0.625rem]" />
        <span className="truncate text-ink-800">{bank.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <FontAwesomeIcon icon={faCircleCheck} /> Verified blood bank
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{bank.name}</h1>
            <p className="mt-2 flex items-start gap-2 text-ink-600">
              <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-ink-400" />
              {bank.address}, {bank.city}
              {bank.state && `, ${bank.state}`} {bank.pincode}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                as={Link}
                to={`/dashboard/requests/new?bank=${bank._id}${highlight ? `&group=${encodeURIComponent(highlight)}` : ''}`}
                icon={faHandHoldingDroplet}
              >
                Request blood
              </Button>
              <Button as="a" href={telHref(bank.phone)} variant="outline" icon={faPhone}>
                Call
              </Button>
              <Button
                as="a"
                href={mapsUrl(bank.name, bank.address, bank.city)}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                icon={faDiamondTurnRight}
              >
                Directions
              </Button>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Blood stock</h2>
                <p className="mt-1 text-sm text-ink-500">
                  {formatNumber(total)} units in total · updated {timeAgo(bank.inventoryUpdatedAt)}
                </p>
              </div>
            </div>
            <InventoryGrid inventory={bank.inventory} highlight={highlight} />
            <Alert tone="info" className="mt-6">
              Stock changes quickly. Please call the blood bank to confirm before travelling, and carry the
              doctor&apos;s requisition form.
            </Alert>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="divide-y divide-ink-100">
            <div className="flex gap-3 p-5">
              <FontAwesomeIcon icon={faClock} className="mt-1 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-500">Opening hours</p>
                <p className="font-semibold text-ink-900">{bank.openingHours}</p>
              </div>
            </div>
            <div className="flex gap-3 p-5">
              <FontAwesomeIcon icon={faPhone} className="mt-1 text-ink-400" />
              <div>
                <p className="text-sm font-semibold text-ink-500">Phone</p>
                <a href={telHref(bank.phone)} className="font-semibold text-ink-900 hover:text-brand-700">
                  {bank.phone}
                </a>
              </div>
            </div>
            {bank.email && (
              <div className="flex gap-3 p-5">
                <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-ink-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-500">Email</p>
                  <a
                    href={`mailto:${bank.email}`}
                    className="block truncate font-semibold text-ink-900 hover:text-brand-700"
                  >
                    {bank.email}
                  </a>
                </div>
              </div>
            )}
          </Card>
          <Card className="p-5 text-sm leading-relaxed text-ink-600">
            <p className="font-bold text-ink-900">Want to donate here?</p>
            <p className="mt-1">
              Walk in during opening hours with a photo ID. Registered donors get their donations recorded
              automatically.
            </p>
            <Link to="/donate" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">
              Check if you can donate →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
