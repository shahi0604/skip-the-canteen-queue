import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  KEYS,
  PREFIX,
  ensureSeeded,
  isArrayOfObjects,
  readStorage,
  removeStorage,
  writeStorage,
} from '../utils/storage';
import { getInitialMenu } from '../data/initialMenu';
import { getInitialSlots } from '../data/initialSlots';
import { buildSeedOrders } from '../data/initialOrders';
import { buildOrder, canTransition } from '../utils/orderUtils';
import { MAX_SLOT_CAPACITY, validateCapacityChange } from '../utils/slotUtils';
import { toISODate } from '../utils/dateUtils';

const OrderContext = createContext(null);

const STORAGE_ERROR = { ok: false, message: 'Could not save. Browser storage may be full or blocked.' };

function loadAll() {
  const menu = ensureSeeded(KEYS.menu, getInitialMenu, isArrayOfObjects);
  const slots = ensureSeeded(KEYS.slots, getInitialSlots, isArrayOfObjects);
  const orders = ensureSeeded(KEYS.orders, () => buildSeedOrders(menu), isArrayOfObjects);
  ensureSeeded(KEYS.tokenCounter, () => 100 + orders.length, Number.isFinite);
  const student = readStorage(KEYS.student, null);
  return {
    menu,
    slots,
    orders,
    student: student && typeof student === 'object' && student.studentId ? student : null,
  };
}

export function OrderProvider({ children }) {
  const [state, setState] = useState(loadAll);

  const refresh = useCallback(() => setState(loadAll()), []);

  // Other tabs in the same browser write to localStorage, so keep this tab in sync.
  // This does not sync across different devices or browsers.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key.startsWith(PREFIX)) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const commit = useCallback((key, next) => {
    if (!writeStorage(KEYS[key], next)) return false;
    setState((prev) => ({ ...prev, [key]: next }));
    return true;
  }, []);

  /* ---------- student ---------- */
  const setStudent = useCallback(
    (profile) => {
      if (!profile) {
        removeStorage(KEYS.student);
        setState((prev) => ({ ...prev, student: null }));
        return;
      }
      commit('student', profile);
    },
    [commit]
  );

  /* ---------- orders ---------- */
  const placeOrder = useCallback(
    (cart, form) => {
      // Always validate against the latest stored data, not React state.
      const menu = readStorage(KEYS.menu, []);
      const slots = readStorage(KEYS.slots, []);
      const orders = readStorage(KEYS.orders, []);
      const tokenCounter = readStorage(KEYS.tokenCounter, 100 + orders.length);
      const result = buildOrder({ cart, menu, slots, orders, form, tokenCounter });
      if (!result.ok) {
        refresh();
        return result;
      }
      const saved =
        writeStorage(KEYS.orders, [...orders, result.order]) &&
        writeStorage(KEYS.tokenCounter, result.tokenCounter);
      if (!saved) return { ...STORAGE_ERROR, code: 'STORAGE' };
      writeStorage(KEYS.student, { name: result.order.studentName, studentId: result.order.studentId });
      refresh();
      return result;
    },
    [refresh]
  );

  const updateOrderStatus = useCallback(
    (orderId, nextStatus) => {
      const orders = readStorage(KEYS.orders, []);
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { ok: false, message: 'Order not found.' };
      if (!canTransition(order.status, nextStatus)) {
        return { ok: false, message: `Cannot move an order from "${order.status}" to "${nextStatus}".` };
      }
      const next = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
      return commit('orders', next) ? { ok: true, order: { ...order, status: nextStatus } } : STORAGE_ERROR;
    },
    [commit]
  );

  /* ---------- menu ---------- */
  const addMenuItem = useCallback(
    (data) => {
      const menu = readStorage(KEYS.menu, []);
      const item = {
        id: `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category.trim(),
        image: (data.image || '').trim(),
        veg: !!data.veg,
        popular: false,
        recommended: false,
        available: data.available !== false,
      };
      return commit('menu', [...menu, item]) ? { ok: true, item } : STORAGE_ERROR;
    },
    [commit]
  );

  const updateMenuItem = useCallback(
    (id, patch) => {
      const menu = readStorage(KEYS.menu, []);
      const next = menu.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,
              name: (patch.name ?? m.name).trim(),
              description: (patch.description ?? m.description).trim(),
              category: (patch.category ?? m.category).trim(),
              image: (patch.image ?? m.image ?? '').trim(),
              price: Number(patch.price ?? m.price),
            }
          : m
      );
      return commit('menu', next) ? { ok: true } : STORAGE_ERROR;
    },
    [commit]
  );

  const setItemAvailability = useCallback(
    (id, available) => updateMenuItem(id, { available: !!available }),
    [updateMenuItem]
  );

  const deleteMenuItem = useCallback(
    (id) => {
      const menu = readStorage(KEYS.menu, []);
      return commit('menu', menu.filter((m) => m.id !== id)) ? { ok: true } : STORAGE_ERROR;
    },
    [commit]
  );

  /* ---------- slots ---------- */
  const parseCapacity = (value) => {
    const cap = Number(value);
    if (!Number.isInteger(cap) || cap < 1 || cap > MAX_SLOT_CAPACITY) {
      return { ok: false, message: `Capacity must be a whole number from 1 to ${MAX_SLOT_CAPACITY}.` };
    }
    return { ok: true, cap };
  };

  const updateSlotCapacity = useCallback(
    (slotId, value) => {
      const parsed = parseCapacity(value);
      if (!parsed.ok) return parsed;
      const slots = readStorage(KEYS.slots, []);
      const orders = readStorage(KEYS.orders, []);
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return { ok: false, message: 'Slot not found.' };
      const check = validateCapacityChange(slot, parsed.cap, orders, toISODate());
      if (!check.ok) return check;
      const next = slots.map((s) => (s.id === slotId ? { ...s, capacity: parsed.cap } : s));
      return commit('slots', next) ? { ok: true } : STORAGE_ERROR;
    },
    [commit]
  );

  const applyCapacityToAll = useCallback(
    (value) => {
      const parsed = parseCapacity(value);
      if (!parsed.ok) return parsed;
      const slots = readStorage(KEYS.slots, []);
      const orders = readStorage(KEYS.orders, []);
      for (const slot of slots) {
        const check = validateCapacityChange(slot, parsed.cap, orders, toISODate());
        if (!check.ok) return check;
      }
      return commit('slots', slots.map((s) => ({ ...s, capacity: parsed.cap }))) ? { ok: true } : STORAGE_ERROR;
    },
    [commit]
  );

  const toggleSlot = useCallback(
    (slotId) => {
      const slots = readStorage(KEYS.slots, []);
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return { ok: false, message: 'Slot not found.' };
      const next = slots.map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s));
      return commit('slots', next) ? { ok: true, enabled: !slot.enabled } : STORAGE_ERROR;
    },
    [commit]
  );

  /* ---------- demo ---------- */
  const resetDemo = useCallback(() => {
    Object.values(KEYS).forEach(removeStorage);
    window.dispatchEvent(new Event('scq:reset'));
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state,
      setStudent,
      placeOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      setItemAvailability,
      deleteMenuItem,
      updateSlotCapacity,
      applyCapacityToAll,
      toggleSlot,
      resetDemo,
    }),
    [
      state,
      setStudent,
      placeOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      setItemAvailability,
      deleteMenuItem,
      updateSlotCapacity,
      applyCapacityToAll,
      toggleSlot,
      resetDemo,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
