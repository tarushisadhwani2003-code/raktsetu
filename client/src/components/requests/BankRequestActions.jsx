import { faBan, faCheck, faHandHoldingDroplet } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

/** Buttons a blood bank sees for one request, depending on its status. */
export default function BankRequestActions({ request, actions, size = 'sm' }) {
  const busy = actions.busyId === request._id;

  if (request.status === 'pending') {
    return (
      <div className="flex shrink-0 gap-2">
        <Button size={size} variant="success" icon={faCheck} loading={busy} onClick={() => actions.approve(request)}>
          Approve
        </Button>
        <Button
          size={size}
          variant="outline"
          icon={faBan}
          disabled={busy}
          onClick={() => actions.startDecline(request)}
        >
          Decline
        </Button>
      </div>
    );
  }

  if (request.status === 'approved') {
    return (
      <div className="flex shrink-0 gap-2">
        <Button size={size} icon={faHandHoldingDroplet} loading={busy} onClick={() => actions.fulfill(request)}>
          Mark handed over
        </Button>
        <Button size={size} variant="ghost" disabled={busy} onClick={() => actions.startDecline(request)}>
          Decline
        </Button>
      </div>
    );
  }

  return null;
}
