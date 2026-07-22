export const cache = {
  set(key: string, data: any, ttlMinutes: number) {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    const payload = { data, expiry };
    localStorage.setItem(key, JSON.stringify(payload));
  },
  get(key: string) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  },
  clear(key: string) {
    localStorage.removeItem(key);
  },

  clearAll() {
    localStorage.removeItem("masterData");
  },
};
