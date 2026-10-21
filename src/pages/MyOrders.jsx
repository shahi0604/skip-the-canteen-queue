import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import OrderProgress from '../components/OrderProgress';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useOrders } from '../context/OrderContext';
import useLoading from '../hooks/useLoading';
import { formatINR } from '../utils/currency';
import { formatDateLabel, formatDateTime } from '../utils/dateUtils';
import { isActiveOrder } from '../utils/orderUtils';

export default function MyOrders() {
  const { orders, slots, student, setStudent } = useOrders();
  const loading = useLoading(300);
  const [tab, setTab] = useState('active');
  const [lookup, setLookup] = useState('');
  const [lookupError, setLookupError] = useState('');

  const mine = useMemo(() => {
    if (!student) return [];
    const id = student.studentId.toUpperCase();
    return orders
      .filter((o) => String(o.studentId).toUpperCase() === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, student]);

  const active = mine.filter(isActiveOrder);
  const done = mine.filter((o) => !isActiveOrder(o));
  const shown = tab === 'active' ? active : done;

  const onLookup = (e) => {
    e.preventDefault();
    const id = lookup.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,15}$/.test(id)) {
      setLookupError('Enter a valid student ID, for example STU1001.');
      return;
    }
    const known = orders.find((o) => String(o.studentId).toUpperCase() === id);
    setStudent({ name: known ? known.studentName : '', studentId: id });
    setLookupError('');
  };

  if (!student) {
    return (
      <div className="container page-pad narrow">
        <div className="card pad">
          <h1>My orders</h1>
          <p className="muted">Enter your student ID to see your orders. Demo tip: STU1001 has sample orders.</p>
          <form onSubmit={onLookup} noValidate>
            <div className="field">
              <label htmlFor="lookup">Student ID</label>
              <input id="lookup" className={lookupError ? 'input-error' : ''} value={lookup}
                onChange={(e) => setLookup(e.target.value)} placeholder="e.g. STU1001" />
              {lookupError && <p className="field-error">{lookupError}</p>}
            </div>
            <button type="submit" className="btn btn-primary">Show my orders</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-pad">
      <div className="page-head">
        <div>
          <h1>My orders</h1>
          <p className="muted">
            Showing orders for {student.name ? `${student.name}, ` : ''}{student.studentId}.{' '}
            <button type="button" className="text-link" onClick={() => setStudent(null)}>Switch student</button>
          </p>
        </div>
        <Link to="/menu" className="btn btn-primary">Order food</Link>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'active'} className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>
          Active ({active.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'active' : ''} onClick={() => setTab('done')}>
          Completed ({done.length})
        </button>
      </div>

      {loading ? (
        <div className="stack" aria-busy="true">
          <div className="skeleton skeleton-order" />
          <div className="skeleton skeleton-order" />
        </div>
      ) : shown.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} />
          <h2>{tab === 'active' ? 'No active orders' : 'No completed orders yet'}</h2>
          <p>{tab === 'active' ? 'Place an order and it will show up here with live progress.' : 'Orders you have collected will appear here.'}</p>
          {tab === 'active' && <Link to="/menu" className="btn btn-primary">Browse menu</Link>}
        </div>
      ) : (
        <div className="stack">
          {shown.map((o) => {
            const slot = slots.find((s) => s.id === o.pickupSlotId);
            return (
              <article key={o.id} className="card pad order-card">
                <header className="order-head">
                  <div>
                    <span className="muted">Token</span>
                    <strong className="order-token">{o.token}</strong>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </header>
                <ul className="order-items">
                  {o.items.map((i) => (
                    <li key={i.itemId}><span>{i.name} &times; {i.quantity}</span><span>{formatINR(i.price * i.quantity)}</span></li>
                  ))}
                </ul>
                <div className="order-meta">
                  <span><span className="muted">Total</span> <strong>{formatINR(o.total)}</strong></span>
                  <span><span className="muted">Pickup</span> <strong>{formatDateLabel(o.pickupDate)}, {slot ? slot.label : 'Slot unavailable'}</strong></span>
                  <span><span className="muted">Placed</span> <strong>{formatDateTime(o.createdAt)}</strong></span>
                </div>
                <OrderProgress status={o.status} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
