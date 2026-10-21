import { statusClass } from '../utils/slotUtils';

export default function OrderStatusBadge({ status }) {
  return <span className={`badge badge-${statusClass(status)}`}>{status}</span>;
}
