export function createInflightRequestStore() {
  const inflight = new Map();

  return {
    async run(key, factory) {
      if (inflight.has(key)) {
        return inflight.get(key);
      }

      const promise = Promise.resolve()
        .then(factory)
        .finally(() => {
          inflight.delete(key);
        });

      inflight.set(key, promise);
      return promise;
    },
    size() {
      return inflight.size;
    }
  };
}

