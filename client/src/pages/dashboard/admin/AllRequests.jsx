import { faDownload, faFileMedical, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import BloodGroupBadge from '../../../components/blood/BloodGroupBadge';
import Alert from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Input, Select } from '../../../components/ui/Field';
import FilterTabs from '../../../components/ui/FilterTabs';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Spinner';
import { useApi } from '../../../hooks/useApi';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { BLOOD_GROUPS, REQUEST_STATUS, ROLE_LABELS, URGENCY } from '../../../lib/constants';
import { downloadCsv } from '../../../lib/csv';
import { formatDateTime } from '../../../lib/format';

export default function AllRequests() {
  useDocumentTitle('All requests');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const bloodGroup = (params.get('group') ?? '').replace(/ $/, '+');
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());

  const { data, loading, error } = useApi('/admin/requests', {
    params: {
      status: status || undefined,
      bloodGroup: bloodGroup || undefined,
      search: query || undefined,
      page,
      limit: 20,
    },
  });

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
      `raktsetu-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Request',
        'Created',
        'Status',
        'Urgency',
        'Blood group',
        'Units',
        'Patient',
        'Hospital',
        'City',
        'Blood bank',
        'Requested by',
      ],
      items.map((item) => [
        item.code,
        formatDateTime(item.createdAt),
        REQUEST_STATUS[item.status].label,
        URGENCY[item.urgency].label,
        item.bloodGroup,
        item.units,
        item.patientName,
        item.hospitalName,
        item.city,
        item.bloodBank?.name ?? '',
        item.requester ? `${item.requester.name} (${ROLE_LABELS[item.requester.role]})` : '',
      ]),
    );

  return (
    <>
      <PageHeader
        title="Blood requests"
        description="Every request across all blood banks."
        actions={
          <Button variant="outline" icon={faDownload} onClick={exportRows} disabled={!items.length}>
            Export CSV
          </Button>
        }
      />

      <FilterTabs
        items={tabs}
        value={status}
        onChange={(value) => setFilter({ status: value, page: '' })}
        label="Filter by status"
        className="mb-3"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="relative">
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
            placeholder="Search ID, patient, hospital or city"
            aria-label="Search requests"
            className="pl-10"
          />
        </div>
        <Select
          value={bloodGroup}
          onChange={(event) => setFilter({ group: event.target.value, page: '' })}
          aria-label="Filter by blood group"
        >
          <option value="">All blood groups</option>
          {BLOOD_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
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
              <Skeleton key={key} className="h-12" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={faFileMedical} title="No requests found" description="Try a different filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="bg-ink-50/70 text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Request</th>
                    <th className="px-5 py-3 font-semibold">Blood</th>
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Blood bank</th>
                    <th className="px-5 py-3 font-semibold">Requested by</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className={loading ? 'divide-y divide-ink-100 opacity-60' : 'divide-y divide-ink-100'}>
                  {items.map((request) => (
                    <tr key={request._id} className="hover:bg-ink-50/50">
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
                        <div className="flex items-center gap-2">
                          <BloodGroupBadge group={request.bloodGroup} size="sm" />
                          <span className="font-semibold whitespace-nowrap">× {request.units}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-ink-900">{request.patientName}</span>
                        <span className="block text-ink-500">
                          {request.hospitalName}, {request.city}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{request.bloodBank?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        {request.requester?.name ?? 'Deleted account'}
                        {request.requester && (
                          <span className="block text-ink-500">{ROLE_LABELS[request.requester.role]}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge map={REQUEST_STATUS} value={request.status} />
                        {request.urgency !== 'normal' && (
                          <StatusBadge map={URGENCY} value={request.urgency} className="mt-1 flex w-fit" />
                        )}
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
    </>
  );
}
