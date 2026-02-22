import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  hydrateFromServer: (tableId: string) => Promise<void>;
  addItem: (tableId: string, item: CartItem) => Promise<void>;
  removeItem: (tableId: string, id: number) => Promise<void>;
  updateQuantity: (tableId: string, id: number, delta: number) => Promise<void>;
  clearCart: (tableId: string) => Promise<void>;
  total: () => number;
}

const syncCart = async (tableId: string, items: CartItem[]) => {
  const sessionId = localStorage.getItem('orbitdine_session') || crypto.randomUUID();
  localStorage.setItem('orbitdine_session', sessionId);
  await fetch(`/api/cart/${tableId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
    body: JSON.stringify({ items }),
  });
};

const sessionHeaders = () => {
  const sessionId = localStorage.getItem('orbitdine_session') || crypto.randomUUID();
  localStorage.setItem('orbitdine_session', sessionId);
  return { 'Content-Type': 'application/json', 'x-session-id': sessionId };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrateFromServer: async (tableId) => {
    const res = await fetch(`/api/cart/${tableId}`, { headers: sessionHeaders() });
    const data = await res.json();
    set({ items: data.items ?? [] });
  },
  addItem: async (tableId, item) => {
    const existing = get().items.find((i) => i.id === item.id);
    const nextItems = existing
      ? get().items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...get().items, item];

    set({ items: nextItems });
    await syncCart(tableId, nextItems);
  },
  removeItem: async (tableId, id) => {
    const nextItems = get().items.filter((i) => i.id !== id);
    set({ items: nextItems });
    await syncCart(tableId, nextItems);
  },
  updateQuantity: async (tableId, id, delta) => {
    const nextItems = get().items
      .map((i) => {
        if (i.id !== id) return i;
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      })
      .filter((item): item is CartItem => item !== null);

    set({ items: nextItems });
    await syncCart(tableId, nextItems);
  },
  clearCart: async (tableId) => {
    set({ items: [] });
    await fetch(`/api/cart/${tableId}`, { method: 'DELETE', headers: sessionHeaders() });
  },
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
