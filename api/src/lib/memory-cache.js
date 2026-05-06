export function createMemoryCache({ ttlMs, maxEntries }) {
  const store = new Map();

  function clearExpired() {
    const now = Date.now();

    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt <= now) {
        store.delete(key);
      }
    }
  }

  function evictIfNeeded() {
    while (store.size > maxEntries) {
      const oldestKey = store.keys().next().value;

      if (!oldestKey) {
        break;
      }

      store.delete(oldestKey);
    }
  }

  return {
    get(key) {
      const entry = store.get(key);

      if (!entry) {
        return null;
      }

      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
      }

      return entry.value;
    },
    set(key, value) {
      clearExpired();
      store.delete(key);
      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
      });
      evictIfNeeded();
      return value;
    },
    clearExpired,
    size() {
      clearExpired();
      return store.size;
    }
  };
}

