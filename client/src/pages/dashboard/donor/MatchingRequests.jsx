import { faCircleCheck, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Spinner';
import { useAuth } from '../../../context/auth-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { recipientsFor } from '../../../lib/constants';
import { formatDate } from '../../../lib/format';
import MatchingRequestCard from './MatchingRequestCard';

export default function MatchingRequests() {
  useDocumentTitle('Requests near me');
  const { user } = useAuth();
  const { data, loading, error, reload, setData } = useApi('/donor/requests');
  const eligibility = user.eligibility;
  const available = user.donor.isAvailable;
  const canRespond = Boolean(eligibility?.eligible && available);
  const items = data?.items ?? [];

  const updateRequest = (updated) =>
    setData((current) => ({
      ...current,
      items: current.items.map((item) => (item._id === updated._id ? updated : item)),
    }));

  return (
    <>
      <PageHeader
        title="Requests near me"
        description={`Open requests in ${user.city} that ${user.donor.bloodGroup} blood can help (${recipientsFor(user.donor.bloodGroup).join(', ')}).`}
        actions={
          <Button variant="outline" icon={faRotateRight} onClick={reload} loading={loading && Boolean(data)}>
            Refresh
          </Button>
        }
      />

      {!available && (
        <Alert
          tone="warning"
          title="You are marked as unavailable"
          className="mb-5"
          action={
            <Button as={Link} to="/dashboard" size="sm" variant="outline">
              Change on dashboard
            </Button>
          }
        >
          Turn on “Available to donate” to offer help with these requests.
        </Alert>
      )}
      {available && eligibility && !eligibility.eligible && (
        <Alert tone="info" title="You are in your recovery period" className="mb-5">
          {eligibility.nextEligibleDate
            ? `You can offer to help again from ${formatDate(eligibility.nextEligibleDate)}.`
            : eligibility.reasons.join(' ')}
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-56" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={faCircleCheck}
            title="No open requests near you"
            description="Nobody in your city currently needs your blood group. Check back later — new requests appear here automatically."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((request) => (
            <MatchingRequestCard
              key={request._id}
              request={request}
              canRespond={canRespond}
              disabledReason={canRespond ? undefined : 'You cannot offer to help right now'}
              onChange={updateRequest}
            />
          ))}
        </div>
      )}
    </>
  );
}
