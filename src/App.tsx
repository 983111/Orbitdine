import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Star } from 'lucide-react';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  prepTime: string;
  rating: number;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy arborio rice, parmesan, wild mushrooms, white truffle drizzle.',
    price: 18.5,
    category: 'Chef Specials',
    prepTime: '18 min',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Citrus Grilled Salmon',
    description: 'Atlantic salmon, herb butter, charred greens, lemon caper glaze.',
    price: 24,
    category: 'Main Course',
    prepTime: '20 min',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Margherita Flatbread',
    description: 'Stone-baked flatbread, buffalo mozzarella, basil, tomato confit.',
    price: 14,
    category: 'Small Plates',
    prepTime: '12 min',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Signature Cold Brew Tiramisu',
    description: 'Espresso-soaked layers, mascarpone cream, cocoa dust.',
    price: 9.5,
    category: 'Desserts',
    prepTime: '8 min',
    rating: 4.9,
  },
  {
    id: 5,
    name: 'Sparkling Berry Cooler',
    description: 'House berry reduction, mint, citrus, sparkling water.',
    price: 6.5,
    category: 'Beverages',
    prepTime: '4 min',
    rating: 4.6,
  },
  {
    id: 6,
    name: 'Smoked Chicken Caesar',
    description: 'Romaine, smoked chicken, aged parmesan, garlic croutons.',
    price: 15,
    category: 'Salads',
    prepTime: '10 min',
    rating: 4.7,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function App() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const addItem = (itemId: number) => {
    setQuantities((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
  };

  const removeItem = (itemId: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      const currentQty = prev[itemId] ?? 0;
      if (currentQty <= 1) {
        delete next[itemId];
      } else {
        next[itemId] = currentQty - 1;
      }
      return next;
    });
  };

  const orderItems = useMemo(
    () =>
      menuItems
        .filter((item) => (quantities[item.id] ?? 0) > 0)
        .map((item) => ({ ...item, quantity: quantities[item.id] })),
    [quantities],
  );

  const subtotal = useMemo(
    () => orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [orderItems],
  );
  const serviceFee = subtotal * 0.08;
  const grandTotal = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">OrbitDine</p>
              <h1 className="mt-2 text-3xl font-bold">Customer Ordering</h1>
              <p className="mt-1 text-slate-600">Curated demo menu ready for ordering.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Table 12 • Open</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {menuItems.map((item) => {
              const quantity = quantities[item.id] ?? 0;
              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{item.category}</span>
                    <span className="font-medium text-slate-500">{item.prepTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                      <p className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="h-3 w-3 fill-current" /> {item.rating.toFixed(1)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={quantity === 0}
                        className="rounded-lg border border-slate-300 p-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => addItem(item.id)}
                        className="rounded-lg bg-slate-900 p-2 text-white"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="sticky top-6 h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-xl font-bold">Current Order</h2>
          </div>

          {orderItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No items selected yet. Add dishes from the menu to begin your order.
            </p>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service fee (8%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            disabled={orderItems.length === 0}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm Order
          </button>
        </aside>
      </div>
    </div>
  );
}
