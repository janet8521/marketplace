// Returning guests have no account, so we remember the orders placed from THIS
// browser in localStorage. We store only the public lookup code + the checkout
// email — the same two things a customer would type into /track — never the
// order contents. This lets a returning customer re-open an order in one tap
// instead of hunting for the order number they were shown once at checkout.

const KEY = "tbsm.recentOrders";
const MAX = 10;

export type RecentOrder = { code: string; email: string; placedAt: string };

export function getRecentOrders(): RecentOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentOrder[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addRecentOrder(entry: RecentOrder) {
  if (typeof window === "undefined") return;
  try {
    // Newest first; drop any earlier entry for the same code so re-lookups
    // bubble the order back to the top instead of duplicating it.
    const rest = getRecentOrders().filter(
      (o) => o.code.toLowerCase() !== entry.code.toLowerCase(),
    );
    const next = [entry, ...rest].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full — remembering is best-effort.
  }
}
