import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChefHat, ClipboardList, Clock, PackageCheck, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { SlotStatusChip } from '../components/PickupSlotCard';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { formatDateLabel, formatDateTime, getPickupDates, toISODate } from '../utils/dateUtils';
import { ACTION_LABEL, NEXT_STATUS, STATUS, STATUS_FLOW, isActiveOrder } from '../utils/orderUtils';
import { getSlotAvailability } from '../utils/slotUtils';

export default function StaffDashboard() {
  const { orders, slots, updateOrderStatus } = useOrders();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [slotId, setSlotId] = useState('all');
  const [date, setDate] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('all');

  const stats = useMemo(() => {
    const count = (s) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      pending: count(STATUS.PLACED),
      preparing: count(STATUS.PREPARING),
      ready: count(STATUS.READY),
      completed: count(STATUS.COLLECTED),
    };
  }, [orders]);

  const slotLabel = useMemo(() => Object.fromEntries(slots.map((s) => [s.id, s.label])), [slots]);
  const dateOptions = useMemo(() => getPickupDates(3), []);
  const today = toISODate();
  const todaySlots = useMemo(() => getSlotAvailability(slots, orders, today), [slots, orders, today]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (term && !(o.token.toLowerCase().includes(term) || o.studentName.toLowerCase().includes(term) || String(o.studentId).toLowerCase().includes(term))) return false;
        if (status !== 'all' && o.status !== status) return false;
        if (slotId !== 'all' && o.pickupSlotId !== slotId) return false;
        if (date !== 'all' && o.pickupDate !== date) return false;
        if (view === 'active' && !isActiveOrder(o)) return false;
        if (view === 'completed' && isActiveOrder(o)) return false;
        return true;
      })
      .sort((a, b) => (sort === 'newest' ? 1 : -1) * (new Date(b.createdAt) - new Date(a.createdAt)));
  }, [orders, search, status, slotId, date, sort, view]);

  const advance = (order) => {
    const next = NEXT_STATUS[order.status];
    const result = updateOrderStatus(order.id, next);
    toast(result.ok ? `${order.token} is now ${next}` : result.message, result.ok ? 'success' : 'error');
  };

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setSlotId('all'); setDate('all'); setSort('newest'); setView('all');
  };

  return (
    <div className="staff-page">
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p className="muted">Live view of every order placed in this browser.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={ClipboardList} label="Total orders" value={stats.total} tone="green" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tone="amber" />
        <StatCard icon={ChefHat} label="Preparing" value={stats.preparing} tone="blue" />
        <StatCard icon={PackageCheck} label="Ready for pickup" value={stats.ready} tone="green" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="gray" />
      </div>

      <section className="card pad mt">
        <div className="section-head">
          <h2>Pickup load today</h2>
          <Link to="/staff/slots" className="text-link">Manage slots</Link>
        </div>
        <ul className="load-list">
          {todaySlots.map(({ slot, booked, status: s }) => (
            <li key={slot.id}>
              <span className="load-label">{slot.label}</span>
              <span className="slot-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, (booked / slot.capacity) * 100)}%` }} className={`bar-${s.toLowerCase().replace(/\s+/g, '-')}`} /></span>
              <span className="load-count">{booked}/{slot.capacity}</span>
              <SlotStatusChip status={s} />
            </li>
          ))}
        </ul>
      </section>

      <section className="card pad mt">
        <div className="tabs" role="tablist">
          {['all', 'active', 'completed'].map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {v === 'all' ? 'All orders' : v === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input type="search" placeholder="Search token or student" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search by token or student name" />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)} aria-label="Filter by pickup slot">
            <option value="all">All slots</option>
            {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by pickup date">
            <option value="all">All dates</option>
            {dateOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by placement time">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h2>No orders match</h2>
            <p>Change the filters or clear them to see every order.</p>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th><th>Student</th><th>Items</th><th>Total</th><th>Pickup</th><th>Placed</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td><strong className="order-token small">{o.token}</strong></td>
                    <td>{o.studentName}<span className="cell-sub">{o.studentId}</span></td>
                    <td className="cell-items">{o.items.map((i) => `${i.name} \u00d7 ${i.quantity}`).join(', ')}</td>
                    <td>{formatINR(o.total)}</td>
                    <td>{formatDateLabel(o.pickupDate)}<span className="cell-sub">{slotLabel[o.pickupSlotId] || 'Unknown slot'}</span></td>
                    <td>{formatDateTime(o.createdAt)}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td>
                      {NEXT_STATUS[o.status] ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => advance(o)}>{ACTION_LABEL[o.status]}</button>
                      ) : (
                        <span className="muted">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
