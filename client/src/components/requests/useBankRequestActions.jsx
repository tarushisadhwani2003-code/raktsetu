import { useState } from 'react';
import { useToast } from '../../context/toast-context';
import { api, getErrorMessage } from '../../lib/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import { TextareaField } from '../ui/Field';

/**
 * Approve / decline / hand over actions for blood bank staff.
 * Returns the handlers plus the "decline" dialog element to render once on the page.
 */
export function useBankRequestActions(onUpdated) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const run = async (request, action, extra = {}) => {
    setBusyId(request._id);
    try {
      const { data } = await api.patch(`/bloodbank/requests/${request._id}`, { action, ...extra });
      toast.success(data.message);
      onUpdated?.(data.request);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const startDecline = (request) => {
    setDeclining(request);
    setReason('');
    setReasonError('');
  };

  const confirmDecline = async () => {
    if (reason.trim().length < 3) {
      setReasonError('Please add a short reason for the requester.');
      return;
    }
    if (await run(declining, 'decline', { note: reason.trim() })) setDeclining(null);
  };

  const dialog = (
    <ConfirmDialog
      open={Boolean(declining)}
      onClose={() => setDeclining(null)}
      onConfirm={confirmDecline}
      title={`Decline ${declining?.code ?? 'request'}?`}
      description={
        declining?.status === 'approved'
          ? `The ${declining.units} reserved unit(s) will go back into your stock. The requester will see your reason.`
          : 'The requester will see your reason, so they know what to do next.'
      }
      confirmLabel="Decline request"
      busy={Boolean(declining) && busyId === declining._id}
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
        placeholder="e.g. Not enough O− units. Please contact the state blood bank."
        required
      />
    </ConfirmDialog>
  );

  return {
    busyId,
    approve: (request) => run(request, 'approve'),
    fulfill: (request) => run(request, 'fulfill'),
    startDecline,
    dialog,
  };
}
