import { getPickupDates } from './dateUtils';
import { getBookedCount, suggestAlternativeSlots } from './slotUtils';

export const MAX_QTY_PER_ITEM = 10;

export const STATUS = {
  PLACED: 'Order Placed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  COLLECTED: 'Collected',
};

export const STATUS_FLOW = [STATUS.PLACED, STATUS.PREPARING, STATUS.READY, STATUS.COLLECTED];

export const NEXT_STATUS = {
  [STATUS.PLACED]: STATUS.PREPARING,
  [STATUS.PREPARING]: STATUS.READY,
  [STATUS.READY]: STATUS.COLLECTED,
};

export const ACTION_LABEL = {
  [STATUS.PLACED]: 'Start preparing',
  [STATUS.PREPARING]: 'Mark ready',
  [STATUS.READY]: 'Mark collected',
};

export const canTransition = (from, to) => NEXT_STATUS[from] === to;

export const isActiveOrder = (order) =>
  order.status !== STATUS.COLLECTED && order.status !== 'Cancelled';

export function generateOrderId(orders) {
  const used = new Set(orders.map((o) => o.id));
  let id;
  do {
    id = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  } while (used.has(id));
  return id;
}

// Tokens run A101..A999, then B100.. and so on. Collisions are skipped.
export function nextToken(orders, counter) {
  const used = new Set(orders.map((o) => o.token));
  let n = Number.isFinite(counter) ? counter : 100;
  let token;
  do {
    n += 1;
    const idx = Math.max(0, n - 100);
    const letter = String.fromCharCode(65 + (Math.floor(idx / 900) % 26));
    token = `${letter}${100 + (idx % 900)}`;
  } while (used.has(token));
  return { token, counter: n };
}

export function validateCheckoutForm({ studentName, studentId, pickupDate, pickupSlotId }) {
  const errors = {};
  const name = (studentName || '').trim();
  if (!name) errors.studentName = 'Enter your name.';
  else if (name.length < 2 || name.length > 40) errors.studentName = 'Name must be 2 to 40 characters.';
  else if (!/^[\p{L}][\p{L} .'-]*$/u.test(name)) errors.studentName = 'Use letters and spaces only.';

  const id = (studentId || '').trim();
  if (!id) errors.studentId = 'Enter your student ID.';
  else if (!/^[A-Za-z0-9-]{4,15}$/.test(id)) errors.studentId = 'Use 4 to 15 letters or digits, for example STU1001.';

  if (!pickupDate) errors.pickupDate = 'Choose a pickup date.';
  if (!pickupSlotId) errors.pickupSlotId = 'Choose a pickup slot.';
  return errors;
}

// Pure order builder. Re-validates everything against the latest menu, slots and orders
// and recomputes prices from the menu, ignoring any client-side prices.
export function buildOrder({ cart, menu, slots, orders, form, tokenCounter, now = new Date() }) {
  const errors = validateCheckoutForm(form);
  if (Object.keys(errors).length) {
    return { ok: false, code: 'VALIDATION', errors, message: 'Fix the highlighted fields.' };
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, code: 'EMPTY_CART', message: 'Your cart is empty.' };
  }
  if (!getPickupDates(3).some((d) => d.value === form.pickupDate)) {
    return { ok: false, code: 'VALIDATION', errors: { pickupDate: 'Choose today or one of the next two days.' }, message: 'Pick a valid date.' };
  }

  const unavailable = [];
  const items = [];
  for (const line of cart) {
    const menuItem = menu.find((m) => m.id === line.itemId);
    const qty = Number(line.quantity);
    if (!menuItem) {
      unavailable.push('An item that was removed from the menu');
      continue;
    }
    if (!menuItem.available) {
      unavailable.push(menuItem.name);
      continue;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return { ok: false, code: 'BAD_QUANTITY', message: `Quantity for ${menuItem.name} must be 1 to ${MAX_QTY_PER_ITEM}.` };
    }
    items.push({ itemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: qty });
  }
  if (unavailable.length) {
    return {
      ok: false,
      code: 'ITEMS_UNAVAILABLE',
      unavailable,
      message: `No longer available: ${unavailable.join(', ')}. Remove them to continue.`,
    };
  }

  const slot = slots.find((s) => s.id === form.pickupSlotId);
  if (!slot || !slot.enabled) {
    return { ok: false, code: 'SLOT_UNAVAILABLE', message: 'That pickup slot is not available. Choose another one.' };
  }
  const booked = getBookedCount(orders, slot.id, form.pickupDate);
  if (booked >= slot.capacity) {
    const suggestions = suggestAlternativeSlots(slots, orders, form.pickupDate, slot.id);
    return {
      ok: false,
      code: 'SLOT_FULL',
      suggestions,
      message: `${slot.label} just filled up (${slot.capacity} of ${slot.capacity} orders). Pick another slot.`,
    };
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { token, counter } = nextToken(orders, tokenCounter);
  const order = {
    id: generateOrderId(orders),
    token,
    studentName: form.studentName.trim(),
    studentId: form.studentId.trim().toUpperCase(),
    items,
    total,
    pickupDate: form.pickupDate,
    pickupSlotId: slot.id,
    status: STATUS.PLACED,
    createdAt: now.toISOString(),
  };
  return { ok: true, order, tokenCounter: counter };
}
