import {
  faArrowLeft,
  faBan,
  faClock,
  faDiamondTurnRight,
  faFileMedical,
  faHandHoldingHeart,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import RequestTimeline from '../../../components/blood/RequestTimeline';
import BankRequestActions from '../../../components/requests/BankRequestActions';
import { useBankRequestActions } from '../../../components/requests/useBankRequestActions';
import Alert from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/Spinner';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage } from '../../../lib/api';
import { REQUEST_STATUS, ROLE_LABELS, URGENCY } from '../../../lib/constants';
import { formatDate, formatDateTime, mapsUrl, telHref } from '../../../lib/format';

function StatusMessage({ request, viewer }) {
  if (!viewer.isRequester) return null;
  const bank = request.bloodBank;
  const lastNote = request.history.at(-1)?.note;

  const messages = {
    pending: {
      tone: 'warning',
      title: `Waiting for ${bank?.name ?? 'the blood bank'} to review your request`,
      body: bank?.phone ? `If it is urgent, call them on ${bank.phone}.` : null,
    },
    approved: {
      tone: 'info',
      title: `Approved — ${request.units} ${request.units === 1 ? 'unit is' : 'units are'} reserved`,
      body: 'Collect the blood from the blood bank with the doctor’s requisition form and the patient’s blood sample.',
    },
    fulfilled: { tone: 'success', title: 'Blood handed over', body: 'We hope the patient recovers soon.' },
    declined: {
      tone: 'error',
      title: 'The blood bank declined this request',
      body: lastNote ? `Reason: ${lastNote}` : 'Try another blood bank.',
      action: (
        <Button
          as={Link}
          to={`/find-blood?group=${encodeURIComponent(request.bloodGroup)}`}
          size="sm"
          variant="outline"
        >
          Find another blood bank
        </Button>
      ),
    },
    cancelled: { tone: 'info', title: 'You cancelled this request', body: null },
  };

  const message = messages[request.status];
  return (
    <Alert tone={message.tone} title={message.title} action={message.action} className="mb-6">
      {message.body}
    </Alert>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-900">{children || '—'}</dd>
    </div>
  );
}

export default function RequestDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/requests/${id}`);
  const bankActions = useBankRequestActions(reload);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const request = data?.request;
  useDocumentTitle(request ? `Request ${request.code}` : 'Request');

  if (loading && !data) return <PageLoader />;
  if (error && !data) {
    return (
      <EmptyState
        icon={faFileMedical}
        title="Request not found"
        description={error}
        action={
          <Button as={Link} to="/dashboard">
            Back to dashboard
          </Button>
        }
      />
    );
  }

  const { viewer } = data;
  const backTo = viewer.isRequester
    ? '/dashboard/requests'
    : viewer.isBank
      ? '/dashboard/bank/requests'
      : '/dashboard/admin/requests';
  const bank = request.bloodBank;

  const cancel = async () => {
    setCancelling(true);
    try {
      const { data: result } = await api.patch(`/requests/${request._id}/cancel`);
      toast.success(result.message);
      setConfirmCancel(false);
      reload();
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Link
        to={backTo}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to requests
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <BloodGroupBadge group={request.bloodGroup} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Request {request.code}</h1>
              <StatusBadge map={REQUEST_STATUS} value={request.status} />
              {request.urgency !== 'normal' && <StatusBadge map={URGENCY} value={request.urgency} />}
            </div>
            <p className="mt-1 text-ink-500">
              {request.units} {request.units === 1 ? 'unit' : 'units'} of {request.bloodGroup} · created{' '}
              {formatDateTime(request.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewer.isBank && <BankRequestActions request={request} actions={bankActions} size="md" />}
          {viewer.isRequester && request.status === 'pending' && (
            <Button variant="outline" icon={faBan} onClick={() => setConfirmCancel(true)}>
              Cancel request
            </Button>
          )}
        </div>
      </div>

      <StatusMessage request={request} viewer={viewer} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Patient details</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Patient">
                {request.patientName}
                {request.patientAge !== undefined && request.patientAge !== null && `, ${request.patientAge} years`}
              </Detail>
              <Detail label="Hospital">
                {request.hospitalName}, {request.city}
              </Detail>
              <Detail label="Contact number">
                <a href={telHref(request.contactPhone)} className="hover:text-brand-700">
                  {request.contactPhone}
                </a>
              </Detail>
              <Detail label="Needed by">
                {request.requiredBy ? formatDate(request.requiredBy) : 'As soon as possible'}
              </Detail>
              {request.requester && (
                <Detail label="Requested by">
                  {request.requester.name}{' '}
                  <span className="font-normal text-ink-500">({ROLE_LABELS[request.requester.role]})</span>
                </Detail>
              )}
              {request.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-ink-500">Notes</dt>
                  <dd className="mt-1 rounded-xl bg-ink-50 p-3 text-ink-700">{request.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title={`Donors who offered to help (${request.donorResponses.length})`}
              description="Compatible donors in the same city can see this request and offer to donate."
            />
            {request.donorResponses.length === 0 ? (
              <EmptyState
                icon={faHandHoldingHeart}
                title="No offers yet"
                description={`Donors in ${request.city} whose blood can help will see this request while it is open.`}
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {request.donorResponses.map((response) => (
                  <li
                    key={response.donor?._id ?? response.respondedAt}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={response.donor?.donor?.bloodGroup ?? '?'} size="sm" />
                      <div>
                        <p className="font-semibold text-ink-900">{response.donor?.name ?? 'Former donor'}</p>
                        <p className="text-sm text-ink-500">
                          {response.donor?.city} · offered {formatDateTime(response.respondedAt)}
                        </p>
                      </div>
                    </div>
                    {response.donor?.phone && (
                      <Button as="a" href={telHref(response.donor.phone)} size="sm" variant="outline" icon={faPhone}>
                        {response.donor.phone}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {bank && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-ink-500">Blood bank</p>
              <p className="mt-1 text-lg font-bold text-ink-900">{bank.name}</p>
              <p className="mt-1 text-sm text-ink-600">
                {bank.address}, {bank.city}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-600">
                <FontAwesomeIcon icon={faClock} className="text-ink-400" /> {bank.openingHours}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button as="a" href={telHref(bank.phone)} size="sm" variant="outline" icon={faPhone}>
                  Call
                </Button>
                <Button
                  as="a"
                  href={mapsUrl(bank.name, bank.address, bank.city)}
                  target="_blank"
                  rel="noreferrer"
                  size="sm"
                  variant="ghost"
                  icon={faDiamondTurnRight}
                >
                  Directions
                </Button>
              </div>
            </Card>
          )}
          <Card className="p-5">
            <h2 className="mb-5 font-bold">Timeline</h2>
            <RequestTimeline history={request.history} />
          </Card>
        </div>
      </div>

      {bankActions.dialog}
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        busy={cancelling}
        title={`Cancel request ${request.code}?`}
        description="The blood bank will no longer see it as pending. You can always create a new request."
        confirmLabel="Cancel request"
      />
    </>
  );
}
