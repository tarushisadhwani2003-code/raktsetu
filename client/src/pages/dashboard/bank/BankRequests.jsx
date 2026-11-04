import { faDownload, faInbox, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import BankRequestActions from '../../../components/requests/BankRequestActions';
import { useBankRequestActions } from '../../../components/requests/useBankRequestActions';
import Alert from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Field';
import FilterTabs from '../../../components/ui/FilterTabs';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Spinner';
import { useApi } from '../../../hooks/useApi';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { downloadCsv } from '../../../lib/csv';
import { REQUEST_STATUS, URGENCY } from '../../../lib/constants';
import { formatDate, formatDateTime } from '../../../lib/format';

export default function BankRequests() {
  useDocumentTitle('Blood requests');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());

  const { data, loading, error, reload } = useApi('/bloodbank/requests', {
    params: { status: status || undefined, search: query || undefined, page, limit: 15 },
  });
  const actions = useBankRequestActions(reload);

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const items = data?.items ?? [];
  const tabs = [
    { value: '', label: 'All', count: data?.counts?.all },
    ...Object.entries(REQUEST_STATUS).map(([value, item]) => ({
      value,
      label: item.label,
      count: data?.counts?.[value],
    })),
  ];

  const exportRows = () =>
    downloadCsv(
      `blood-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Request', 'Created', 'Patient', 'Hospital', 'Blood group', 'Units', 'Urgency', 'Status', 'Contact'],
      items.map((item) => [
        item.code,
        formatDateTime(item.createdAt),
        item.patientName,
        item.hospitalName,
        item.bloodGroup,
        item.units,
        URGENCY[item.urgency].label,
        REQUEST_STATUS[item.status].label,
        item.contactPhone,
      ]),
    );

  return (
    <>
      <PageHeader
        title="Blood requests"
        description="Approve requests to reserve stock, then mark them as handed over when collected."
        actions={
          <Button variant="outline" icon={faDownload} onClick={exportRows} disabled={!items.length}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          items={tabs}
          value={status}
          onChange={(value) => setFilter({ status: value, page: '' })}
          label="Filter by status"
        />
        <div className="relative lg:w-72">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setFilter({ page: '' });
            }}
            placeholder="Search patient, hospital or ID"
            aria-label="Search requests"
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="overflow-hidden">
        {loading && !data ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-14" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={faInbox}
            title="No requests here"
            description="Requests sent to your blood bank will appear in this list."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="bg-ink-50/70 text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Request</th>
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Blood</th>
                    <th className="px-5 py-3 font-semibold">Needed by</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={loading ? 'divide-y divide-ink-100 opacity-60' : 'divide-y divide-ink-100'}>
                  {items.map((request) => (
                    <tr key={request._id} className="align-middle">
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/dashboard/requests/${request._id}`}
                          className="font-semibold text-ink-900 hover:text-brand-700"
                        >
                          {request.code}
                        </Link>
                        <span className="block text-ink-500">{formatDateTime(request.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-ink-900">{request.patientName}</span>
                        <span className="block text-ink-500">{request.hospitalName}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <BloodGroupBadge group={request.bloodGroup} size="sm" />
                          <span className="font-semibold whitespace-nowrap">× {request.units}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {request.requiredBy ? formatDate(request.requiredBy) : 'ASAP'}
                        {request.urgency !== 'normal' && (
                          <StatusBadge map={URGENCY} value={request.urgency} className="mt-1 flex w-fit" />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge map={REQUEST_STATUS} value={request.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <BankRequestActions request={request} actions={actions} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(value) => setFilter({ page: String(value) })} />
          </>
        )}
      </Card>

      {actions.dialog}
    </>
  );
}
