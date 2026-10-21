// Single place for all localStorage access. Every read is safe against
// missing, malformed or blocked storage. Swap this module for API calls
// when a backend is added.
export const PREFIX = 'scq:';

export const KEYS = {
  menu: 'menu',
  slots: 'slots',
  orders: 'orders',
  cart: 'cart',
  student: 'student',
  tokenCounter: 'tokenCounter',
};

function hasStorage() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readStorage(key, fallback = null) {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === undefined || parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// Seeds sample data only when nothing valid exists. Existing data is never overwritten.
export function ensureSeeded(key, createSeed, isValid = () => true) {
  const existing = readStorage(key, null);
  if (existing !== null && isValid(existing)) return existing;
  const seed = createSeed();
  writeStorage(key, seed);
  return seed;
}

export const isArrayOfObjects = (value) =>
  Array.isArray(value) && value.every((v) => v && typeof v === 'object');
