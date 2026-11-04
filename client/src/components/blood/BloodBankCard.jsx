import {
  faCircleCheck,
  faClock,
  faDiamondTurnRight,
  faHandHoldingDroplet,
  faLocationDot,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { STOCK_LEVEL, stockLevel } from '../../lib/constants';
import { mapsUrl, telHref, timeAgo } from '../../lib/format';
import { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { InventoryStrip } from './InventoryGrid';

export default function BloodBankCard({ bank, group }) {
  const units = group ? (bank.inventory?.[group] ?? 0) : null;
  const requestLink = `/dashboard/requests/new?bank=${bank._id}${group ? `&group=${encodeURIComponent(group)}` : ''}`;

  return (
    <Card as="article" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-2 text-lg font-bold">
            <Link to={`/blood-banks/${bank._id}`} className="hover:text-brand-700">
              {bank.name}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <FontAwesomeIcon icon={faCircleCheck} /> Verified
            </span>
          </h3>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-500">
            <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-ink-400" />
            <span>
              {bank.address}, {bank.city}
              {bank.pincode && ` – ${bank.pincode}`}
            </span>
          </p>
        </div>

        {group && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl bg-ink-50 px-4 py-2.5 sm:flex-col sm:items-end sm:gap-1 sm:bg-transparent sm:p-0">
            <p className="text-sm font-semibold text-ink-500">{group} in stock</p>
            <p className="text-3xl leading-none font-extrabold text-ink-900">{units}</p>
            <StatusBadge map={STOCK_LEVEL} value={stockLevel(units)} />
          </div>
        )}
      </div>

      <InventoryStrip inventory={bank.inventory} highlight={group} className="mt-5" />

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-500">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-ink-400" /> {bank.openingHours}
        </span>
        <span>Stock updated {timeAgo(bank.inventoryUpdatedAt)}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button as={Link} to={requestLink} icon={faHandHoldingDroplet}>
          Request blood
        </Button>
        <Button as="a" href={telHref(bank.phone)} variant="outline" icon={faPhone}>
          {bank.phone}
        </Button>
        <Button
          as="a"
          href={mapsUrl(bank.name, bank.address, bank.city)}
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          icon={faDiamondTurnRight}
        >
          Directions
        </Button>
      </div>
    </Card>
  );
}
