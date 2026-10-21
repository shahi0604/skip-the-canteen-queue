import { Minus, Plus } from 'lucide-react';

export default function QtyStepper({ value, onChange, label = 'item' }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>
        <Minus size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}
