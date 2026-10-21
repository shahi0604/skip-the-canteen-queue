import { useMemo, useState } from 'react';
import { SlotStatusChip } from '../components/PickupSlotCard';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { getPickupDates } from '../utils/dateUtils';
import { almostFullThreshold, getSlotAvailability } from '../utils/slotUtils';

function SlotRow({ info, onSave, onToggle }) {
  const { slot, booked, remaining, status } = info;
  const [draft, setDraft] = useState(String(slot.capacity));
  const dirty = draft !== String(slot.capacity);

  return (
    <tr className={status === 'Full' ? 'row-full' : status === 'Almost Full' ? 'row-almost' : ''}>
      <td><strong>{slot.label}</strong></td>
      <td>{booked}</td>
      <td>
        <div className="cap-edit">
          <input type="number" min="1" step="1" inputMode="numeric" value={draft} aria-label={`Capacity for ${slot.label}`}
            onChange={(e) => setDraft(e.target.value)} />
          <button type="button" className="btn btn-secondary btn-sm" disabled={!dirty} onClick={() => onSave(slot.id, draft, () => setDraft(String(slot.capacity)))}>
            Save
          </button>
        </div>
        <span className="cell-sub">Almost full from {almostFullThreshold(slot.capacity)} orders</span>
      </td>
      <td>{remaining}</td>
      <td><SlotStatusChip status={status} /></td>
      <td>
        <button type="button" role="switch" aria-checked={slot.enabled} aria-label={`${slot.label} enabled`}
          className={`switch ${slot.enabled ? 'on' : ''}`} onClick={() => onToggle(slot)}>
          <span className="switch-knob" />
          <span className="switch-text">{slot.enabled ? 'Enabled' : 'Disabled'}</span>
        </button>
      </td>
    </tr>
  );
}

export default function StaffSlotManagement() {
  const { slots, orders, updateSlotCapacity, applyCapacityToAll, toggleSlot } = useOrders();
  const toast = useToast();
  const dates = useMemo(() => getPickupDates(3), []);
  const [date, setDate] = useState(dates[0].value);
  const [bulk, setBulk] = useState('');

  const availability = useMemo(() => getSlotAvailability(slots, orders, date), [slots, orders, date]);
  const counts = {
    full: availability.filter((a) => a.status === 'Full').length,
    almost: availability.filter((a) => a.status === 'Almost Full').length,
    open: availability.filter((a) => a.status === 'Available').length,
  };

  const saveOne = (slotId, value, reset) => {
    const result = updateSlotCapacity(slotId, value);
    if (result.ok) toast('Capacity updated', 'success');
    else {
      toast(result.message, 'error');
      reset();
    }
  };

  const applyAll = (e) => {
    e.preventDefault();
    const result = applyCapacityToAll(bulk);
    if (result.ok) {
      toast(`Every slot now takes ${bulk} orders`, 'success');
      setBulk('');
    } else toast(result.message, 'error');
  };

  const toggle = (slot) => {
    const result = toggleSlot(slot.id);
    toast(result.ok ? `${slot.label} ${result.enabled ? 'enabled' : 'disabled'}` : result.message, result.ok ? 'success' : 'error');
  };

  return (
    <div className="staff-page">
      <div className="page-head">
        <div>
          <h1>Pickup slots</h1>
          <p className="muted">Capacity is counted per slot, per day. Disabling a slot blocks new orders but keeps existing ones.</p>
        </div>
      </div>

      <div className="chip-row" role="group" aria-label="Pickup date">
        {dates.map((d) => (
          <button key={d.value} type="button" className={`filter-chip ${date === d.value ? 'active' : ''}`} aria-pressed={date === d.value} onClick={() => setDate(d.value)}>
            {d.label} <span className="chip-sub">{d.short}</span>
          </button>
        ))}
      </div>

      <div className="stat-grid three mt">
        <div className="stat-card tone-red"><div><div className="stat-value">{counts.full}</div><div className="stat-label">Full slots</div></div></div>
        <div className="stat-card tone-amber"><div><div className="stat-value">{counts.almost}</div><div className="stat-label">Almost full</div></div></div>
        <div className="stat-card tone-green"><div><div className="stat-value">{counts.open}</div><div className="stat-label">Available</div></div></div>
      </div>

      <form className="card pad mt bulk-form" onSubmit={applyAll} noValidate>
        <div className="field">
          <label htmlFor="bulk">Set capacity for all slots</label>
          <input id="bulk" type="number" min="1" step="1" inputMode="numeric" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="e.g. 12" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={bulk === ''}>Apply to all</button>
      </form>

      <div className="card table-wrap mt">
        <table className="table">
          <thead>
            <tr><th>Slot</th><th>Orders</th><th>Max capacity</th><th>Remaining</th><th>Load</th><th>Slot</th></tr>
          </thead>
          <tbody>
            {availability.map((info) => (
              <SlotRow key={`${info.slot.id}-${info.slot.capacity}`} info={info} onSave={saveOne} onToggle={toggle} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
