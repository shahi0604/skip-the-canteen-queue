// Capacity logic lives here and in orderUtils.buildOrder as pure functions
// of (slots, orders). A backend can reuse the same rules inside a transaction.
export const MAX_SLOT_CAPACITY = 100;

export const statusClass = (status) => String(status).toLowerCase().replace(/\s+/g, '-');

const countsTowardCapacity = (order) => order.status !== 'Cancelled';

export function getBookedCount(orders, slotId, date) {
  return orders.filter(
    (o) => o.pickupSlotId === slotId && o.pickupDate === date && countsTowardCapacity(o)
  ).length;
}

// Almost Full starts at 60% of capacity (6 of 10 by default). Full is capacity.
export function almostFullThreshold(capacity) {
  return Math.max(1, Math.ceil(capacity * 0.6));
}

export function getSlotStatus(slot, booked) {
  if (!slot.enabled) return 'Disabled';
  if (booked >= slot.capacity) return 'Full';
  if (booked >= almostFullThreshold(slot.capacity)) return 'Almost Full';
  return 'Available';
}

export function getSlotAvailability(slots, orders, date) {
  return slots.map((slot) => {
    const booked = getBookedCount(orders, slot.id, date);
    return {
      slot,
      booked,
      remaining: Math.max(0, slot.capacity - booked),
      status: getSlotStatus(slot, booked),
    };
  });
}

export function suggestAlternativeSlots(slots, orders, date, excludeSlotId, limit = 3) {
  return getSlotAvailability(slots, orders, date)
    .filter((info) => info.slot.id !== excludeSlotId)
    .filter((info) => info.status === 'Available' || info.status === 'Almost Full')
    .slice(0, limit);
}

// Highest number of active bookings for a slot on any date from `fromDate` onward.
export function getMaxBookedFrom(orders, slotId, fromDate) {
  const perDate = {};
  orders.forEach((o) => {
    if (o.pickupSlotId === slotId && o.pickupDate >= fromDate && countsTowardCapacity(o)) {
      perDate[o.pickupDate] = (perDate[o.pickupDate] || 0) + 1;
    }
  });
  const counts = Object.values(perDate);
  return counts.length ? Math.max(...counts) : 0;
}

export function validateCapacityChange(slot, newCapacity, orders, fromDate) {
  const maxBooked = getMaxBookedFrom(orders, slot.id, fromDate);
  if (newCapacity < maxBooked) {
    return {
      ok: false,
      message: `${slot.label} already has ${maxBooked} orders. Capacity cannot go below ${maxBooked}.`,
    };
  }
  return { ok: true };
}
