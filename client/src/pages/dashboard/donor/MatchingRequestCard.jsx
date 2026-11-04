import {
  faCalendarDay,
  faHandHoldingHeart,
  faHospital,
  faHouseMedical,
  faPhone,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/toast-context';
import { api, getErrorMessage } from '../../../lib/api';
import { URGENCY } from '../../../lib/constants';
import { cn } from '../../../lib/cn';
import { formatDate, telHref, timeAgo } from '../../../lib/format';

/** A request a donor can help with. Contact details appear after the donor offers to help. */
export default function MatchingRequestCard({ request, canRespond, disabledReason, onChange }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const url = `/donor/requests/${request._id}/respond`;
      const { data } = request.responded ? await api.delete(url) : await api.post(url);
      toast.success(data.message);
      onChange(data.request);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-5 transition',
        request.responded ? 'border-emerald-200 ring-4 ring-emerald-50' : 'border-ink-100',
      )}
    >
      <div className="flex items-start gap-4">
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink-900">
              {request.units} {request.units === 1 ? 'unit' : 'units'} of {request.bloodGroup} needed
            </h3>
            <StatusBadge map={URGENCY} value={request.urgency} />
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink-600">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHospital} className="w-4 text-ink-400" />
              {request.hospitalName}, {request.city}
            </li>
            {request.bloodBank?.name && (
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHouseMedical} className="w-4 text-ink-400" />
                Donate at {request.bloodBank.name}
              </li>
            )}
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDay} className="w-4 text-ink-400" />
              {request.requiredBy
                ? `Needed by ${formatDate(request.requiredBy)}`
                : `Posted ${timeAgo(request.createdAt)}`}
            </li>
            {request.respondersCount > 0 && (
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="w-4 text-ink-400" />
                {request.respondersCount} {request.respondersCount === 1 ? 'donor has' : 'donors have'} offered to help
              </li>
            )}
          </ul>
        </div>
      </div>

      {request.responded && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Thank you for offering to help {request.patientName}.</p>
          <p className="mt-1">Call the family to arrange your donation at the blood bank.</p>
          {request.notes && <p className="mt-2 italic">“{request.notes}”</p>}
          <Button
            as="a"
            href={telHref(request.contactPhone)}
            size="sm"
            variant="success"
            icon={faPhone}
            className="mt-3"
          >
            Call {request.contactPhone}
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <p className="text-xs text-ink-400">{request.code}</p>
        {request.responded ? (
          <Button size="sm" variant="ghost" loading={busy} onClick={toggle}>
            Withdraw my offer
          </Button>
        ) : (
          <Button
            size="sm"
            icon={faHandHoldingHeart}
            loading={busy}
            disabled={!canRespond}
            onClick={toggle}
            title={disabledReason}
          >
            I can donate
          </Button>
        )}
      </div>
    </article>
  );
}
