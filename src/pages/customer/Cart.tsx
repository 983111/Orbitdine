import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

export default function Cart() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, clearCart, hydrateFromServer } = useCartStore();
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const geofenceEnabled = localStorage.getItem('feature_geofence') === 'true';
  const offlineModeEnabled = localStorage.getItem('feature_offline_mode') === 'true';

  useEffect(() => {
    if (!tableId) return;
    hydrateFromServer(tableId).catch(() => pushToast('Unable to sync cart.', 'error'));
  }, [tableId]);

  const cartTotal = total();
  const tax = cartTotal * 0.10;
  const grandTotal = cartTotal + tax;

  const handlePlaceOrder = async () => {
    if (!navigator.onLine && offlineModeEnabled) {
      const queue = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      queue.push({ tableId, items, total: grandTotal, queuedAt: new Date().toISOString() });
      localStorage.setItem('offline_orders', JSON.stringify(queue));
      pushToast('You are offline. Order queued and will be submitted when back online.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      let geofence = { enabled: false, distanceMeters: 0, allowedMeters: 250 };
      if (geofenceEnabled && navigator.geolocation) {
        const distance = await new Promise<number>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const target = { lat: 12.9716, lng: 77.5946 };
              const dLat = (pos.coords.latitude - target.lat) * 111139;
              const dLng = (pos.coords.longitude - target.lng) * 111139;
              resolve(Math.sqrt(dLat * dLat + dLng * dLng));
            },
            () => resolve(99999),
            { timeout: 4000 }
          );
        });
        geofence = { enabled: true, distanceMeters: distance, allowedMeters: 250 };
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items,
          total: grandTotal,
          customerName: "Guest",
          geofence,
        })
      });
      
      const data = await res.json();
      if (data.success) {
        await clearCart(tableId!);
        pushToast('Order placed successfully.', 'success');
        navigate(`/table/${tableId}/track/${data.orderId}`);
      } else {
        pushToast(data.error || 'Unable to place order.', 'error');
      }
    } catch (error) {
      console.error("Order failed", error);
      pushToast('Order failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any cosmic delights yet.</p>
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-32">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4"
          >
            <img src={item.image_url || 'https://placehold.co/160?text=No+Image'} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <button onClick={() => removeItem(tableId!, item.id)} className="text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {item.notes && (
                <p className="text-xs text-gray-500 mb-3 italic">{item.notes}</p>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-blue-900">{formatCurrency(item.price * item.quantity)}</div>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(tableId!, item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(tableId!, item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Taxes (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
