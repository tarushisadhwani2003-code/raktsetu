import { faCheck, faEnvelope, faEnvelopeOpen, faReply, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/ui/EmptyState';
import FilterTabs from '../../../components/ui/FilterTabs';
import PageHeader from '../../../components/ui/PageHeader';
import Pagination from '../../../components/ui/Pagination';
import { Skeleton } from '../../../components/ui/Spinner';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage } from '../../../lib/api';
import { MESSAGE_STATUS } from '../../../lib/constants';
import { cn } from '../../../lib/cn';
import { formatDateTime, telHref } from '../../../lib/format';

export default function Messages() {
  useDocumentTitle('Messages');
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const page = Number(params.get('page')) || 1;
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data, loading, error, reload } = useApi('/admin/messages', {
    params: { status: status || undefined, page, limit: 10 },
  });

  const setFilter = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const setStatus = async (message, nextStatus) => {
    setBusyId(message._id);
    try {
      const { data: result } = await api.patch(`/admin/messages/${message._id}`, { status: nextStatus });
      toast.success(result.message);
      reload();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setBusyId(deleting._id);
    try {
      const { data: result } = await api.delete(`/admin/messages/${deleting._id}`);
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
  const tabs = [
    { value: '', label: 'All', count: data?.counts?.all },
    ...Object.entries(MESSAGE_STATUS).map(([value, item]) => ({
      value,
      label: item.label,
      count: data?.counts?.[value],
    })),
  ];

  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the contact form." />
      <FilterTabs
        items={tabs}
        value={status}
        onChange={(value) => setFilter({ status: value, page: '' })}
        label="Filter messages"
        className="mb-4"
      />

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <div className="space-y-3">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={faEnvelope}
            title="No messages"
            description="Messages from the contact form will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((message) => (
            <Card
              key={message._id}
              as="article"
              className={cn('p-5', message.status === 'new' && 'border-brand-200 ring-4 ring-brand-50')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">{message.subject}</h2>
                    <StatusBadge map={MESSAGE_STATUS} value={message.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {message.name} ·{' '}
                    <a href={`mailto:${message.email}`} className="hover:text-brand-700">
                      {message.email}
                    </a>
                    {message.phone && (
                      <>
                        {' '}
                        ·{' '}
                        <a href={telHref(message.phone)} className="hover:text-brand-700">
                          {message.phone}
                        </a>
                      </>
                    )}{' '}
                    · {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-700">{message.message}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                <Button
                  as="a"
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                  size="sm"
                  variant="outline"
                  icon={faReply}
                >
                  Reply by email
                </Button>
                {message.status === 'new' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={faEnvelopeOpen}
                    loading={busyId === message._id}
                    onClick={() => setStatus(message, 'read')}
                  >
                    Mark as read
                  </Button>
                )}
                {message.status !== 'resolved' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={faCheck}
                    disabled={busyId === message._id}
                    onClick={() => setStatus(message, 'resolved')}
                  >
                    Mark resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={faTrash}
                  className="ml-auto text-red-600 hover:bg-red-50"
                  onClick={() => setDeleting(message)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
          {data.pages > 1 && (
            <Card>
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={(value) => setFilter({ page: String(value) })}
              />
            </Card>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={Boolean(deleting) && busyId === deleting._id}
        title="Delete this message?"
        description="It will be removed permanently."
        confirmLabel="Delete"
      />
    </>
  );
}
