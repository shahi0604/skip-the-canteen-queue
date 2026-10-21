import { Check } from 'lucide-react';
import { STATUS, STATUS_FLOW } from '../utils/orderUtils';

export default function OrderProgress({ status }) {
  const current = STATUS_FLOW.indexOf(status);
  const finished = status === STATUS.COLLECTED;
  return (
    <ol className="progress" aria-label={`Order progress: ${status}`}>
      {STATUS_FLOW.map((step, i) => {
        const state = i < current || finished ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={step} className={`progress-step ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="progress-dot">{state === 'done' ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span className="progress-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
