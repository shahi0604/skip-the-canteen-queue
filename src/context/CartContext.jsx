import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { KEYS, readStorage, writeStorage } from '../utils/storage';
import { MAX_QTY_PER_ITEM } from '../utils/orderUtils';
import { useOrders } from './OrderContext';

const CartContext = createContext(null);

function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => l && typeof l.itemId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0)
    .map((l) => ({ itemId: l.itemId, quantity: Math.min(l.quantity, MAX_QTY_PER_ITEM) }));
}

export function CartProvider({ children }) {
  const { menu } = useOrders();
  const [items, setItems] = useState(() => sanitizeCart(readStorage(KEYS.cart, [])));
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    writeStorage(KEYS.cart, items);
  }, [items]);

  useEffect(() => {
    const onReset = () => setItems([]);
    window.addEventListener('scq:reset', onReset);
    return () => window.removeEventListener('scq:reset', onReset);
  }, []);

  // Drop cart entries whose menu item was deleted by staff.
  useEffect(() => {
    const ids = new Set(menu.map((m) => m.id));
    setItems((prev) => {
      const next = prev.filter((i) => ids.has(i.itemId));
      return next.length === prev.length ? prev : next;
    });
  }, [menu]);

  const commitItems = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const addItem = useCallback(
    (itemId) => {
      const item = readStorage(KEYS.menu, []).find((m) => m.id === itemId);
      if (!item) return { ok: false, message: 'This item is no longer on the menu.' };
      if (!item.available) return { ok: false, message: `${item.name} is unavailable right now.` };
      const current = itemsRef.current;
      const existing = current.find((i) => i.itemId === itemId);
      if (existing) {
        if (existing.quantity >= MAX_QTY_PER_ITEM) {
          return { ok: false, message: `You can order up to ${MAX_QTY_PER_ITEM} of each item.` };
        }
        commitItems(current.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i)));
      } else {
        commitItems([...current, { itemId, quantity: 1 }]);
      }
      return { ok: true, message: `${item.name} added to cart` };
    },
    [commitItems]
  );

  const setQuantity = useCallback(
    (itemId, quantity) => {
      const current = itemsRef.current;
      const existing = current.find((i) => i.itemId === itemId);
      if (quantity <= 0) {
        commitItems(current.filter((i) => i.itemId !== itemId));
        return { ok: true };
      }
      const menuItem = readStorage(KEYS.menu, []).find((m) => m.id === itemId);
      if (existing && quantity > existing.quantity) {
        if (!menuItem || !menuItem.available) {
          return { ok: false, message: `${menuItem ? menuItem.name : 'This item'} is unavailable right now.` };
        }
        if (quantity > MAX_QTY_PER_ITEM) {
          return { ok: false, message: `You can order up to ${MAX_QTY_PER_ITEM} of each item.` };
        }
      }
      if (!existing) return { ok: false, message: 'Item is not in your cart.' };
      commitItems(current.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)));
      return { ok: true };
    },
    [commitItems]
  );

  const removeItem = useCallback(
    (itemId) => commitItems(itemsRef.current.filter((i) => i.itemId !== itemId)),
    [commitItems]
  );

  const clearCart = useCallback(() => commitItems([]), [commitItems]);

  const lines = useMemo(
    () =>
      items
        .map((entry) => {
          const item = menu.find((m) => m.id === entry.itemId);
          return item ? { item, quantity: entry.quantity } : null;
        })
        .filter(Boolean),
    [items, menu]
  );

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0), [lines]);
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const unavailableLines = useMemo(() => lines.filter((l) => !l.item.available), [lines]);
  const getQuantity = useCallback(
    (itemId) => items.find((i) => i.itemId === itemId)?.quantity || 0,
    [items]
  );

  const value = useMemo(
    () => ({ items, lines, total, count, unavailableLines, getQuantity, addItem, setQuantity, removeItem, clearCart }),
    [items, lines, total, count, unavailableLines, getQuantity, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
