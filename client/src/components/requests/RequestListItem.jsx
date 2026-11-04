import { faChevronRight, faHospital, faHouseMedical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { REQUEST_STATUS, URGENCY } from '../../lib/constants';
import { timeAgo } from '../../lib/format';
import BloodGroupBadge from '../blood/BloodGroupBadge';
import { StatusBadge } from '../ui/Badge';

/** One request in a list; links to the request page. */
export default function RequestListItem({ request }) {
  return (
    <Link
      to={`/dashboard/requests/${request._id}`}
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-ink-50/70"
    >
      <BloodGroupBadge group={request.bloodGroup} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold text-ink-900">
            {request.units} {request.units === 1 ? 'unit' : 'units'} for {request.patientName}
          </p>
          {request.urgency !== 'normal' && <StatusBadge map={URGENCY} value={request.urgency} />}
        </div>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-500">
          <span>{request.code}</span>
          {request.bloodBank?.name && (
            <span>
              <FontAwesomeIcon icon={faHouseMedical} className="mr-1 text-ink-400" />
              {request.bloodBank.name}
            </span>
          )}
          {!request.bloodBank?.name && request.hospitalName && (
            <span>
              <FontAwesomeIcon icon={faHospital} className="mr-1 text-ink-400" />
              {request.hospitalName}
            </span>
          )}
          <span>{timeAgo(request.createdAt)}</span>
        </p>
      </div>
      <StatusBadge map={REQUEST_STATUS} value={request.status} className="hidden sm:inline-flex" />
      <FontAwesomeIcon icon={faChevronRight} className="text-xs text-ink-300" />
    </Link>
  );
}
