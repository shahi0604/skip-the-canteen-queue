import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderProgress from '../components/OrderProgress';
import { useOrders } from '../context/OrderContext';
import { formatINR } from '../utils/currency';
import { formatDateLabel, formatDateTime } from '../utils/dateUtils';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { orders, slots } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="container page-pad">
        <div className="empty-state">
          <h1>Order not found</h1>
          <p>We could not find that order in this browser.</p>
          <Link to="/my-orders" className="btn btn-primary">View my orders</Link>
        </div>
      </div>
    );
  }

  const slot = slots.find((s) => s.id === order.pickupSlotId);

  return (
    <div className="container page-pad narrow">
      <div className="confirm-head">
        <CheckCircle2 size={36} />
        <h1>Order Confirmed!</h1>
        <p className="muted">Show this token at the canteen counter when your order is ready.</p>
      </div>

      <div className="ticket">
        <div className="ticket-top">
          <span>Your token</span>
          <strong className="ticket-token big">{order.token}</strong>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="ticket-cut" />
        <div className="ticket-bottom">
          <div><span className="muted">Student</span><strong>{order.studentName} ({order.studentId})</strong></div>
          <div>
            <span className="muted">Items</span>
            <strong>{order.items.map((i) => `${i.name} \u00d7 ${i.quantity}`).join(', ')}</strong>
          </div>
          <div><span className="muted">Pickup</span><strong>{formatDateLabel(order.pickupDate)}, {slot ? slot.label : 'Slot unavailable'}</strong></div>
          <div><span className="muted">Total</span><strong>{formatINR(order.total)}</strong></div>
          <div><span className="muted">Placed at</span><strong>{formatDateTime(order.createdAt)}</strong></div>
        </div>
      </div>

      <div className="card pad mt"><OrderProgress status={order.status} /></div>

      <div className="confirm-actions">
        <Link to="/my-orders" className="btn btn-primary">View my orders</Link>
        <Link to="/menu" className="btn btn-secondary">Back to menu</Link>
      </div>
    </div>
  );
}
