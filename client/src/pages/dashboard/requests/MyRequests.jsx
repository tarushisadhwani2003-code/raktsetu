import { faFileMedical, faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import RequestListItem from '../../../components/requests/RequestListItem';
import Alert from '../../../components/ui/Alert';
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
import { REQUEST_STATUS } from '../../../lib/constants';

export default function MyRequests() {
  useDocumentTitle('My requests');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());

  const { data, loading, error } = useApi('/requests/mine', {
    params: { status: status || undefined, search: query || undefined, page, limit: 10 },
  });

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const tabs = [
    { value: '', label: 'All', count: data?.counts?.all },
    ...Object.entries(REQUEST_STATUS).map(([value, item]) => ({
      value,
      label: item.label,
      count: data?.counts?.[value],
    })),
  ];

  return (
    <>
      <PageHeader
        title="My requests"
        description="Every blood request you have sent, with its latest status."
        actions={
          <Button as={Link} to="/dashboard/requests/new" icon={faPlus}>
            New request
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
            placeholder="Search by patient or ID"
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
        ) : data?.items.length ? (
          <>
            <div
              className={
                loading ? 'divide-y divide-ink-100 opacity-60 transition' : 'divide-y divide-ink-100 transition'
              }
            >
              {data.items.map((request) => (
                <RequestListItem key={request._id} request={request} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(value) => setFilter({ page: String(value) })} />
          </>
        ) : (
          <EmptyState
            icon={faFileMedical}
            title={status || search ? 'No requests match these filters' : 'You have not made any requests yet'}
            description={
              status || search
                ? 'Try another status or search term.'
                : 'Check stock and send your first request in two minutes.'
            }
            action={
              !status &&
              !search && (
                <Button as={Link} to="/dashboard/requests/new" icon={faPlus}>
                  New request
                </Button>
              )
            }
          />
        )}
      </Card>
    </>
  );
}
