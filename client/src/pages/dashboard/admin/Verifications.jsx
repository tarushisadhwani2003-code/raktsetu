import {
  faBan,
  faCheck,
  faEnvelope,
  faIdCard,
  faLocationDot,
  faPhone,
  faShieldHalved,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../../components/ui/Alert';
import Badge, { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/ui/EmptyState';
import { Select, TextareaField } from '../../../components/ui/Field';
import FilterTabs from '../../../components/ui/FilterTabs';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Spinner';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage } from '../../../lib/api';
import { VERIFICATION } from '../../../lib/constants';
import { formatDate, telHref } from '../../../lib/format';

export default function Verifications() {
  useDocumentTitle('Verifications');
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'pending';
  const type = params.get('type') ?? '';
  const page = Number(params.get('page')) || 1;
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const { data, loading, error, reload } = useApi('/admin/facilities', {
    params: { status: status === 'all' ? undefined : status, type: type || undefined, page, limit: 10 },
  });

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const review = async (facility, nextStatus, note = '') => {
    setBusyId(facility._id);
    try {
      const { data: result } = await api.patch(`/admin/facilities/${facility._id}/review`, {
        status: nextStatus,
        note,
      });
      toast.success(result.message);
      setRejecting(null);
      reload();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = () => {
    if (reason.trim().length < 3) {
      setReasonError('Tell the facility why, so they can fix it.');
      return;
    }
    review(rejecting, 'rejected', reason.trim());
  };

  const tabs = [
    { value: 'pending', label: 'Waiting', count: data?.counts?.pending },
    { value: 'verified', label: 'Verified', count: data?.counts?.verified },
    { value: 'rejected', label: 'Rejected', count: data?.counts?.rejected },
    { value: 'all', label: 'All', count: data?.counts?.all },
  ];
  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Verifications"
        description="Check each licence or registration number before approving. Approved blood banks appear in public search."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          items={tabs}
          value={status}
          onChange={(value) => setFilter({ status: value === 'pending' ? '' : value, page: '' })}
          label="Filter by status"
        />
        <div className="sm:w-64">
          <Select
            value={type}
            onChange={(event) => setFilter({ type: event.target.value, page: '' })}
            aria-label="Filter by type"
          >
            <option value="">Hospitals & blood banks</option>
            <option value="bloodbank">Blood banks</option>
            <option value="hospital">Hospitals</option>
          </Select>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((key) => (
            <Skeleton key={key} className="h-64" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={faShieldHalved}
            title={status === 'pending' ? 'Nothing waiting for review' : 'No facilities here'}
            description="New hospital and blood bank registrations will appear in the “Waiting” tab."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((facility) => (
              <Card key={facility._id} as="article" className="flex flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge tone={facility.type === 'bloodbank' ? 'brand' : 'blue'}>
                      {facility.type === 'bloodbank' ? 'Blood bank' : 'Hospital'}
                    </Badge>
                    <h2 className="mt-2 text-lg font-bold">{facility.name}</h2>
                    <p className="text-sm text-ink-500">Registered {formatDate(facility.createdAt)}</p>
                  </div>
                  <StatusBadge map={VERIFICATION} value={facility.verification.status} />
                </div>

                <dl className="mt-5 grid flex-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex gap-2.5">
                    <FontAwesomeIcon icon={faIdCard} className="mt-0.5 w-4 text-ink-400" />
                    <div>
                      <dt className="text-ink-500">Licence / registration</dt>
                      <dd className="font-semibold text-ink-900">{facility.licenseNumber}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 w-4 text-ink-400" />
                    <div>
                      <dt className="text-ink-500">Address</dt>
                      <dd className="font-semibold text-ink-900">
                        {facility.address}, {facility.city} {facility.pincode}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <FontAwesomeIcon icon={faPhone} className="mt-0.5 w-4 text-ink-400" />
                    <div>
                      <dt className="text-ink-500">Facility phone</dt>
                      <dd>
                        <a href={telHref(facility.phone)} className="font-semibold text-ink-900 hover:text-brand-700">
                          {facility.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                  {facility.owner && (
                    <div className="flex gap-2.5">
                      <FontAwesomeIcon icon={faUser} className="mt-0.5 w-4 text-ink-400" />
                      <div className="min-w-0">
                        <dt className="text-ink-500">Contact person</dt>
                        <dd className="font-semibold text-ink-900">{facility.owner.name}</dd>
                        <dd className="truncate text-ink-500">
                          <a href={`mailto:${facility.owner.email}`} className="hover:text-brand-700">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
                            {facility.owner.email}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>

                {facility.verification.note && (
                  <p className="mt-4 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
                    Note: {facility.verification.note}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  {facility.verification.status !== 'verified' && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={faCheck}
                      loading={busyId === facility._id && !rejecting}
                      onClick={() => review(facility, 'verified', 'Licence checked')}
                    >
                      Approve
                    </Button>
                  )}
                  {facility.verification.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={faBan}
                      onClick={() => {
                        setRejecting(facility);
                        setReason('');
                        setReasonError('');
                      }}
                    >
                      {facility.verification.status === 'verified' ? 'Revoke verification' : 'Reject'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {data.pages > 1 && (
            <Card className="mt-4">
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={(value) => setFilter({ page: String(value) })}
              />
            </Card>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        onConfirm={confirmReject}
        busy={Boolean(rejecting) && busyId === rejecting._id}
        title={`${rejecting?.verification?.status === 'verified' ? 'Revoke' : 'Reject'} ${rejecting?.name ?? ''}?`}
        description="The facility will be hidden from search and their pending requests declined. They will see your reason."
        confirmLabel={rejecting?.verification?.status === 'verified' ? 'Revoke' : 'Reject'}
      >
        <TextareaField
          label="Reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError('');
          }}
          error={reasonError}
          rows={3}
          maxLength={300}
          placeholder="e.g. The licence number could not be found in the state register."
          required
        />
      </ConfirmDialog>
    </>
  );
}
