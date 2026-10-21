import { Clock } from 'lucide-react';
import { statusClass } from '../utils/slotUtils';

export function SlotStatusChip({ status }) {
  return <span className={`chip chip-${statusClass(status)}`}>{status}</span>;
}

export default function PickupSlotCard({ info, selected, onSelect }) {
  const { slot, booked, remaining, status } = info;
  const blocked = status === 'Full' || status === 'Disabled';
  const pct = Math.min(100, Math.round((booked / slot.capacity) * 100));

  let footText = `${remaining} of ${slot.capacity} left`;
  if (status === 'Full') footText = 'Slot Full';
  if (status === 'Disabled') footText = 'Not available';

  return (
    <button
      type="button"
      className={`slot-card slot-${statusClass(status)} ${selected ? 'selected' : ''}`}
      disabled={blocked}
      aria-pressed={selected}
      onClick={() => onSelect(slot.id)}
    >
      <span className="slot-time">
        <Clock size={15} /> {slot.label}
      </span>
      <span className="slot-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="slot-foot">
        <span>{footText}</span>
        {status === 'Almost Full' && <SlotStatusChip status={status} />}
      </span>
    </button>
  );
}
