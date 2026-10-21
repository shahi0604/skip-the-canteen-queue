import { toISODate } from '../utils/dateUtils';

const NAMES = ['Shahina', 'Arjun', 'Meera', 'Rahul', 'Divya', 'Karthik', 'Anitha', 'Vikram', 'Priya', 'Sanjay', 'Lakshmi', 'Naveen'];
const COMBOS = [[0, 1], [2], [3, 4], [5, 6], [7, 8], [1, 4], [0, 9], [2, 4], [6, 8], [3, 9]];

const P = 'Order Placed';
const PREP = 'Preparing';
const READY = 'Ready for Pickup';
const DONE = 'Collected';

// Slot 12:30 PM is seeded full (10 of 10) and 10:40 AM is almost full (7 of 10) for today.
const PLAN = [
  { slotId: 'slot-1030', statuses: [DONE, DONE, READY, PREP] },
  { slotId: 'slot-1040', statuses: [PREP, PREP, P, P, P, P, P] },
  { slotId: 'slot-1050', statuses: [P, P] },
  { slotId: 'slot-1100', statuses: [P] },
  { slotId: 'slot-1230', statuses: [PREP, PREP, P, P, P, P, P, P, P, P] },
];

export function buildSeedOrders(menu) {
  const today = toISODate();
  const total = PLAN.reduce((n, p) => n + p.statuses.length, 0);
  const orders = [];
  let index = 0;
  PLAN.forEach(({ slotId, statuses }) => {
    statuses.forEach((status) => {
      const items = COMBOS[index % COMBOS.length]
        .map((i) => menu[i])
        .filter(Boolean)
        .map((m) => ({ itemId: m.id, name: m.name, price: m.price, quantity: index % 3 === 0 ? 2 : 1 }));
      orders.push({
        id: `seed-order-${index + 1}`,
        token: `A${101 + index}`,
        studentName: NAMES[index % NAMES.length],
        studentId: `STU${1001 + (index % NAMES.length)}`,
        items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
        pickupDate: today,
        pickupSlotId: slotId,
        status,
        createdAt: new Date(Date.now() - (total - index) * 7 * 60000).toISOString(),
      });
      index += 1;
    });
  });
  return orders;
}
