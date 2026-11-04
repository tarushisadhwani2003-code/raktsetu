import { faDownload, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import BloodGroupPicker from '../../../components/blood/BloodGroupPicker';
import InventoryGrid from '../../../components/blood/InventoryGrid';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Field, SelectField, TextField } from '../../../components/ui/Field';
import PageHeader from '../../../components/ui/PageHeader';
import { PageLoader } from '../../../components/ui/Spinner';
import { useToast } from '../../../context/toast-context';
import { useApi } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { api, getErrorMessage, getFieldErrors } from '../../../lib/api';
import { BLOOD_GROUPS, STOCK_LEVEL, STOCK_REASONS, stockLevel } from '../../../lib/constants';
import { cn } from '../../../lib/cn';
import { downloadCsv } from '../../../lib/csv';
import { formatDateTime, timeAgo } from '../../../lib/format';

const REASONS = {
  add: [
    { value: 'received', label: 'Received (camp or transfer)' },
    { value: 'adjustment', label: 'Correction after stock count' },
  ],
  remove: [
    { value: 'expired', label: 'Expired or discarded' },
    { value: 'adjustment', label: 'Correction after stock count' },
  ],
};

export default function Inventory() {
  useDocumentTitle('Stock');
  const toast = useToast();
  const { data, loading, error, setData } = useApi('/bloodbank/inventory');
  const [form, setForm] = useState({ bloodGroup: 'O+', direction: 'add', units: '', reason: 'received', note: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, change: undefined }));
  };

  const setDirection = (direction) => {
    setForm((current) => ({ ...current, direction, reason: REASONS[direction][0].value }));
    setErrors({});
  };

  const submit = async (event) => {
    event.preventDefault();
    const units = Number(form.units);
    if (!Number.isInteger(units) || units <= 0) {
      setErrors({ units: 'Enter a whole number of units, e.g. 5.' });
      return;
    }
    setSaving(true);
    try {
      const { data: result } = await api.post('/bloodbank/inventory/adjust', {
        bloodGroup: form.bloodGroup,
        change: form.direction === 'add' ? units : -units,
        reason: form.reason,
        note: form.note,
      });
      toast.success(result.message);
      setData((current) => ({
        ...current,
        inventory: result.inventory,
        inventoryUpdatedAt: result.inventoryUpdatedAt,
        movements: [{ ...result.movement, by: { name: 'You' } }, ...current.movements],
      }));
      setForm((current) => ({ ...current, units: '', note: '' }));
    } catch (requestError) {
      const fieldErrors = getFieldErrors(requestError);
      setErrors({ ...fieldErrors, units: fieldErrors.change });
      toast.error(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <PageLoader />;
  if (error && !data) return <Alert tone="error">{error}</Alert>;

  const available = data.inventory[form.bloodGroup] ?? 0;

  const exportStock = () =>
    downloadCsv(
      `blood-stock-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Blood group', 'Units', 'Status'],
      BLOOD_GROUPS.map((group) => [
        group,
        data.inventory[group] ?? 0,
        STOCK_LEVEL[stockLevel(data.inventory[group])].label,
      ]),
    );

  return (
    <>
      <PageHeader
        title="Blood stock"
        description={`Last updated ${timeAgo(data.inventoryUpdatedAt)}. Donations and approved requests update stock automatically.`}
        actions={
          <Button variant="outline" icon={faDownload} onClick={exportStock}>
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-5 sm:p-6">
          <p className="mb-4 text-sm text-ink-500">Select a group to adjust it.</p>
          <InventoryGrid
            inventory={data.inventory}
            highlight={form.bloodGroup}
            onSelect={(group) => update('bloodGroup', group)}
          />
        </Card>

        <Card className="p-5 sm:p-6 xl:row-span-2 xl:self-start">
          <h2 className="text-lg font-bold">Adjust stock</h2>
          <p className="mt-1 text-sm text-ink-500">For stock received, expired units or corrections.</p>
          <form onSubmit={submit} noValidate className="mt-5 space-y-5">
            <Field id="adjust-group" label="Blood group" required>
              <BloodGroupPicker value={form.bloodGroup} onChange={(value) => update('bloodGroup', value)} />
            </Field>
            <div
              role="group"
              aria-label="Add or remove"
              className="grid grid-cols-2 gap-1 rounded-xl bg-ink-100/70 p-1"
            >
              {[
                ['add', 'Add units', faPlus],
                ['remove', 'Remove units', faMinus],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={form.direction === value}
                  onClick={() => setDirection(value)}
                  className={cn(
                    'rounded-lg py-2 text-sm font-semibold transition',
                    form.direction === value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <TextField
              label="Units"
              type="number"
              inputMode="numeric"
              min="1"
              max={form.direction === 'remove' ? available : 500}
              value={form.units}
              onChange={(event) => update('units', event.target.value)}
              error={errors.units}
              hint={`${available} ${form.bloodGroup} ${available === 1 ? 'unit' : 'units'} in stock now`}
              required
            />
            <SelectField
              label="Reason"
              value={form.reason}
              onChange={(event) => update('reason', event.target.value)}
              error={errors.reason}
            >
              {REASONS[form.direction].map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Note"
              value={form.note}
              onChange={(event) => update('note', event.target.value)}
              error={errors.note}
              maxLength={200}
              placeholder="e.g. Batch from Sawai Madhopur camp"
              optional
            />
            <Button
              type="submit"
              className="w-full"
              loading={saving}
              icon={form.direction === 'add' ? faPlus : faMinus}
            >
              {form.direction === 'add' ? 'Add to stock' : 'Remove from stock'}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Stock history" description="Every change, newest first" />
          {data.movements.length === 0 ? (
            <EmptyState
              title="No changes yet"
              description="Adjustments, donations and issued requests will be listed here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-ink-50/70 text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">When</th>
                    <th className="px-5 py-3 font-semibold">Change</th>
                    <th className="px-5 py-3 font-semibold">Reason</th>
                    <th className="px-5 py-3 text-right font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.movements.map((movement) => (
                    <tr key={movement._id}>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {formatDateTime(movement.createdAt)}
                        <span className="block text-ink-500">{movement.by?.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-1 font-bold tabular-nums',
                            movement.change > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                          )}
                        >
                          {movement.change > 0 ? '+' : '−'}
                          {Math.abs(movement.change)} {movement.bloodGroup}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {STOCK_REASONS[movement.reason]}
                        {movement.note && <span className="block text-ink-500">{movement.note}</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {movement.balanceAfter} {movement.bloodGroup}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
