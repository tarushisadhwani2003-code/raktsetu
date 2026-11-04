import { faMagnifyingGlass, faTrash, faUserCheck, faUserSlash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../../components/ui/Alert';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/ui/EmptyState';
import { Input, Select } from '../../../components/ui/Field';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Spinner';
import { useAuth } from '../../../context/auth-context';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage } from '../../../lib/api';
import { ROLE_LABELS } from '../../../lib/constants';
import { formatDate } from '../../../lib/format';

const ROLE_TONES = { donor: 'brand', seeker: 'gray', hospital: 'blue', bloodbank: 'green', admin: 'amber' };

export default function Users() {
  useDocumentTitle('Users');
  const { user: me } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') ?? '';
  const status = params.get('status') ?? '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data, loading, error, reload, setData } = useApi('/admin/users', {
    params: { role: role || undefined, status: status || undefined, search: query || undefined, page, limit: 15 },
  });

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const toggleActive = async (user) => {
    setBusyId(user._id);
    try {
      const { data: result } = await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(result.message);
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item._id === user._id ? { ...item, isActive: result.user.isActive } : item,
        ),
      }));
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setBusyId(deleting._id);
    try {
      const { data: result } = await api.delete(`/admin/users/${deleting._id}`);
      toast.success(result.message);
      setDeleting(null);
      reload();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Users"
        description={data ? `${data.total} accounts match your filters.` : 'All accounts on RaktSetu.'}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
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
            placeholder="Search name, email, phone or city"
            aria-label="Search users"
            className="pl-10"
          />
        </div>
        <Select
          value={role}
          onChange={(event) => setFilter({ role: event.target.value, page: '' })}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => setFilter({ status: event.target.value, page: '' })}
          aria-label="Filter by status"
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
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
          <EmptyState icon={faUsers} title="No users found" description="Try a different search or filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[54rem] text-left text-sm">
                <thead className="bg-ink-50/70 text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={loading ? 'divide-y divide-ink-100 opacity-60' : 'divide-y divide-ink-100'}>
                  {items.map((user) => {
                    const manageable = user.role !== 'admin' && user._id !== me._id;
                    return (
                      <tr key={user._id}>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-ink-900">{user.name}</span>
                          <span className="block text-ink-500">
                            {user.facility?.name ?? user.city}
                            {user.donor?.bloodGroup && ` · ${user.donor.bloodGroup}`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <a href={`mailto:${user.email}`} className="text-ink-800 hover:text-brand-700">
                            {user.email}
                          </a>
                          <span className="block text-ink-500">{user.phone}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <Badge tone={user.isActive ? 'green' : 'red'} dot>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {manageable && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={user.isActive ? faUserSlash : faUserCheck}
                                loading={busyId === user._id && !deleting}
                                onClick={() => toggleActive(user)}
                              >
                                {user.isActive ? 'Suspend' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={faTrash}
                                onClick={() => setDeleting(user)}
                                aria-label={`Delete ${user.name}`}
                              >
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(value) => setFilter({ page: String(value) })} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={Boolean(deleting) && busyId === deleting._id}
        title={`Delete ${deleting?.name ?? 'this user'}?`}
        description="This permanently removes the account. Their pending requests are cancelled. This cannot be undone — consider suspending instead."
        confirmLabel="Delete account"
      />
    </>
  );
}
