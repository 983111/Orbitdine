import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CustomerLayout() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#070b18] text-white pb-24">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,#243b7a_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#5b2a7a_0%,transparent_35%),linear-gradient(180deg,#070b18_0%,#0d1020_100%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090f24]/85 backdrop-blur-xl px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">OrbitDine</p>
            <p className="text-sm font-semibold">Table #{tableId}</p>
          </div>

          <button
            onClick={() => navigate(`/table/${tableId}/cart`)}
            className="relative h-10 w-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center hover:bg-white/10"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-cyan-400 text-[#042033] text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {location.pathname.endsWith(`/table/${tableId}`) && (
          <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <p className="text-sm text-cyan-100">Scan, order, and track your food in real-time.</p>
            <UtensilsCrossed className="w-5 h-5 text-cyan-200 ml-auto" />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
