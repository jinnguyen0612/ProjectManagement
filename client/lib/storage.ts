const isClient = typeof window !== "undefined";

export const storage = {
  get(key: string): string | null {
    if (!isClient) return null;
    return localStorage.getItem(key);
  },

  set(key: string, value: string): void {
    if (!isClient) return;
    localStorage.setItem(key, value);
  },

  remove(key: string): void {
    if (!isClient) return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (!isClient) return;
    localStorage.clear();
  },
};
