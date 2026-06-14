/** Simple in-browser TTL cache using a Map. 5-minute TTL. */
const store = new Map();
const TTL = 5 * 60 * 1000;

export function getCached(key) {
  const entry = store.get(key.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    store.delete(key.toLowerCase());
    return null;
  }
  return entry.value;
}

export function setCached(key, value) {
  store.set(key.toLowerCase(), { value, ts: Date.now() });
}
