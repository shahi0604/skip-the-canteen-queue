# Skip the Canteen Queue
**Order Ahead. Skip the Wait.** React + Vite + React Router + localStorage prototype.

## Run it
```bash
npm install
npm run dev        # open the URL Vite prints (usually http://localhost:5173)
npm run build      # production build check
```
Requires Node 18+.

## Architecture
- `utils/storage.js` is the only file that touches localStorage (safe reads, seed-if-missing, namespaced `scq:` keys).
- `utils/orderUtils.js` `buildOrder()` and `utils/slotUtils.js` are pure functions. Checkout re-reads the latest menu, slots and orders from storage, re-validates items, prices and slot capacity, then creates the order. Prices come from the menu, never from the cart. Move these functions into a backend transaction later and the UI will not change.
- `context/OrderContext.jsx` holds menu, slots, orders and the student profile. `CartContext.jsx` holds the cart. `ToastContext.jsx` shows feedback.
- Student pages render inside `StudentLayout`; staff pages inside `StaffLayout` with the sidebar.

## Routes
`/` `/menu` `/cart` `/checkout` `/order-confirmation/:orderId` `/my-orders` `/staff` `/staff/menu` `/staff/slots`

## Limitations (be upfront in the demo)
- localStorage is per browser. Two browsers or devices do not share orders or capacity, so two people can overbook the same slot in different browsers. Tabs in the same browser stay in sync through the `storage` event. A real deployment needs a backend that enforces capacity atomically.
- "Demo: open staff view" is a plain link, not authentication. Anyone can open `/staff`.
- Past time slots are not blocked for today, so the demo works at any hour.
- Slot capacity is counted per slot per day.
- Food photos load from Unsplash. If a URL fails, a green placeholder with the dish name appears.

## Seed data
24 sample orders for today: slot 12:30 PM is **full (10/10)**, 10:40 AM is **almost full (7/10)**. Student `STU1001` (Shahina) has sample orders. Staff sidebar has **Reset demo data**.

## Testing checklist
- [ ] Home: hero, search goes to `/menu?q=`, category chips filter, popular, quick picks, today's menu, how it works, cart badge updates
- [ ] Menu: search, category filter, add to cart, stepper, toast, clear filters on empty result
- [ ] Cart: quantity +/-, remove, totals in INR, empty state, persists after refresh
- [ ] Checkout: empty fields show errors, bad student ID rejected, full slot disabled with "Slot Full", alternatives suggested, remaining capacity shown
- [ ] Confirmation: big token, summary, status, buttons work
- [ ] My Orders: lookup by ID, Active / Completed tabs, progress tracker
- [ ] Staff Orders: stat cards match data, search by token/name, filters, sort, status buttons advance one step only
- [ ] Student view updates after staff changes status (same tab after navigation, or another tab live)
- [ ] Staff Menu: add, edit, change price, toggle availability, delete with confirmation
- [ ] Unavailable item: shows label on menu, cannot be added, a cart copy blocks checkout, old orders keep names and prices
- [ ] Staff Slots: set capacity, cannot go below booked count, bulk apply, enable/disable, Full / Almost Full highlighting
- [ ] Place orders until a slot reaches 10, then confirm the 11th cannot be placed
- [ ] Resize to phone width: no horizontal page scroll

## Common errors
| Problem | Fix |
|---|---|
| `npm install` fails | Use Node 18+, delete `node_modules` and `package-lock.json`, retry |
| Blank page | Open the browser console; check the file path and import names |
| Old data looks wrong | Staff sidebar > Reset demo data, or run `localStorage.clear()` in the console |
| Images missing | Normal when offline or blocked; placeholders appear |
| Port busy | `npm run dev -- --port 3000` |
| Staff page does not update | Refresh once; live sync only works between tabs of the same browser |

## 3-minute presentation script
1. **Problem (20s):** Breaks are short. Queues eat them, and staff cannot see demand coming.
2. **Solution (20s):** Students pre-order, pick a 10-minute slot and get a token. Staff get a dashboard.
3. **Demo (100s):** Add two items, choose a slot, confirm, show the token. Open Staff, search the token, Preparing, Ready. Back to My Orders to show the status. Mark Collected. Try the full 12:30 slot (disabled). Mark Fresh Juice unavailable and show it cannot be added.
4. **Safeguards (20s):** Capacity and availability are re-checked at checkout; prices are recomputed from the menu; orders are snapshots.
5. **Tech and next steps (20s):** React, Vite, Router, Hooks, localStorage behind one storage layer. Next: backend with atomic slot booking, real staff login, notifications.
