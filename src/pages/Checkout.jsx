import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import PickupSlotCard, { SlotStatusChip } from '../components/PickupSlotCard';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { getPickupDates } from '../utils/dateUtils';
import { getSlotAvailability } from '../utils/slotUtils';
import { validateCheckoutForm } from '../utils/orderUtils';

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, lines, total, clearCart, removeItem, unavailableLines } = useCart();
  const { slots, orders, student, placeOrder } = useOrders();

  const dates = useMemo(() => getPickupDates(3), []);
  const [form, setForm] = useState({ studentName: student?.name || '', studentId: student?.studentId || '' });
  const [pickupDate, setPickupDate] = useState(dates[0].value);
  const [pickupSlotId, setPickupSlotId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const availability = useMemo(() => getSlotAvailability(slots, orders, pickupDate), [slots, orders, pickupDate]);
  const selectedInfo = availability.find((a) => a.slot.id === pickupSlotId);
  const selectedOk = !!selectedInfo && selectedInfo.status !== 'Full' && selectedInfo.status !== 'Disabled';
  const openSlots = availability.filter((a) => a.status === 'Available' || a.status === 'Almost Full');
  const hasFull = availability.some((a) => a.status === 'Full');

  // If a slot fills up while the student is choosing, clear it.
  useEffect(() => {
    if (pickupSlotId && !selectedOk) setPickupSlotId('');
  }, [pickupSlotId, selectedOk]);

  if (lines.length === 0) {
    return (
      <div className="container page-pad">
        <div className="empty-state">
          <ShoppingCart size={40} />
          <h1>Nothing to check out</h1>
          <p>Your cart is empty. Add items from the menu first.</p>
          <Link to="/menu" className="btn btn-primary">Browse menu</Link>
        </div>
      </div>
    );
  }

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const chooseSlot = (id) => {
    setPickupSlotId(id);
    setErrors((er) => ({ ...er, pickupSlotId: undefined }));
    setSubmitError('');
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError('');
    setSuggestions([]);

    const payload = { ...form, pickupDate, pickupSlotId };
    const found = validateCheckoutForm(payload);
    setErrors(found);
    if (Object.keys(found).length) {
      toast('Please fix the highlighted fields', 'warning');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setTimeout(() => {
      const result = placeOrder(items, payload);
      if (result.ok) {
        clearCart();
        toast(`Order confirmed. Your token is ${result.order.token}`, 'success');
        navigate(`/order-confirmation/${result.order.id}`, { replace: true });
        return;
      }
      if (result.code === 'VALIDATION') setErrors(result.errors || {});
      if (result.code === 'SLOT_FULL') {
        setPickupSlotId('');
        setSuggestions(result.suggestions || []);
      }
      setSubmitError(result.message || 'Something went wrong. Please try again.');
      submittingRef.current = false;
      setSubmitting(false);
    }, 400);
  };

  const blocked = unavailableLines.length > 0;

  return (
    <div className="container page-pad">
      <div className="page-head"><h1>Checkout</h1></div>

      <form className="two-col" onSubmit={handleSubmit} noValidate>
        <div className="stack">
          <section className="card pad">
            <h2>Your details</h2>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="studentName">Name</label>
                <input id="studentName" className={errors.studentName ? 'input-error' : ''} value={form.studentName}
                  onChange={setField('studentName')} placeholder="e.g. Shahina" autoComplete="name" />
                {errors.studentName && <p className="field-error">{errors.studentName}</p>}
              </div>
              <div className="field">
                <label htmlFor="studentId">Student ID</label>
                <input id="studentId" className={errors.studentId ? 'input-error' : ''} value={form.studentId}
                  onChange={setField('studentId')} placeholder="e.g. STU1001" autoComplete="off" />
                {errors.studentId && <p className="field-error">{errors.studentId}</p>}
              </div>
            </div>
          </section>

          <section className="card pad">
            <h2>Pickup date</h2>
            <div className="chip-row" role="group" aria-label="Pickup date">
              {dates.map((d) => (
                <button key={d.value} type="button" className={`filter-chip ${pickupDate === d.value ? 'active' : ''}`}
                  aria-pressed={pickupDate === d.value}
                  onClick={() => { setPickupDate(d.value); setPickupSlotId(''); setSuggestions([]); setSubmitError(''); }}>
                  {d.label} <span className="chip-sub">{d.short}</span>
                </button>
              ))}
            </div>

            <h2 className="mt">Pickup slot</h2>
            <p className="muted">Each slot takes a limited number of orders so the kitchen can keep up.</p>
            <div className="slot-grid">
              {availability.map((info) => (
                <PickupSlotCard key={info.slot.id} info={info} selected={pickupSlotId === info.slot.id} onSelect={chooseSlot} />
              ))}
            </div>
            {errors.pickupSlotId && <p className="field-error">{errors.pickupSlotId}</p>}
            {hasFull && openSlots.length > 0 && (
              <div className="alert alert-info">
                Some slots are full. Open alternatives:
                <span className="alt-slots">
                  {openSlots.slice(0, 3).map((o) => (
                    <button key={o.slot.id} type="button" className="filter-chip" onClick={() => chooseSlot(o.slot.id)}>
                      {o.slot.label}
                    </button>
                  ))}
                </span>
              </div>
            )}
            {openSlots.length === 0 && (
              <p className="alert alert-warning">Every slot on this date is full or switched off. Try another date.</p>
            )}
          </section>
        </div>

        <aside className="card summary">
          <h2>Review order</h2>
          <ul className="review-list">
            {lines.map(({ item, quantity }) => (
              <li key={item.id}>
                <span>{item.name} &times; {quantity}</span>
                <span>{formatINR(item.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary-rows">
            <div className="summary-total"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          {selectedOk && <p className="muted">Pickup: {dates.find((d) => d.value === pickupDate)?.label}, {selectedInfo.slot.label}</p>}

          {blocked && (
            <div className="alert alert-warning">
              <AlertTriangle size={16} /> {unavailableLines.map((l) => l.item.name).join(', ')} no longer available.
              <button type="button" className="text-link" onClick={() => unavailableLines.forEach((l) => removeItem(l.item.id))}>
                Remove unavailable items
              </button>
            </div>
          )}
          {submitError && (
            <div className="alert alert-error" role="alert">
              {submitError}
              {suggestions.length > 0 && (
                <span className="alt-slots">
                  {suggestions.map((s) => (
                    <button key={s.slot.id} type="button" className="filter-chip" onClick={() => chooseSlot(s.slot.id)}>
                      {s.slot.label} <SlotStatusChip status={s.status} />
                    </button>
                  ))}
                </span>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || blocked}>
            {submitting ? 'Placing your order...' : 'Confirm order'}
          </button>
          <Link to="/cart" className="btn btn-secondary btn-block">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}
