import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Printer, CheckCircle2 } from 'lucide-react';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<any[]>([]);

  const updateStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  useEffect(() => {
    fetch('/api/orders/active').then(res => res.json()).then(data => {
      // Filter for kitchen relevant statuses
      setOrders(data.filter((o: any) => ['new', 'preparing'].includes(o.status)));
    });

    const socket = io();
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });
    socket.on('order_updated', ({ id, status }) => {
      setOrders(prev => {
        if (status === 'ready' || status === 'completed') {
          return prev.filter(o => o.id !== Number(id));
        }
        return prev.map(o => o.id === Number(id) ? { ...o, status } : o);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Printer className="w-8 h-8" /> Kitchen Display System
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-xl">Table {order.table_number}</span>
              <span className="text-sm bg-gray-700 px-2 py-1 rounded">#{order.id}</span>
            </div>
            
            <div className="p-4 space-y-4">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                  <div>
                    <span className="font-bold text-lg">{item.quantity}x</span> {item.name}
                    {item.notes && (
                      <p className="text-red-500 font-bold text-sm mt-1">⚠️ {item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => updateStatus(order.id, 'ready')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Mark Ready
              </button>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            <h2 className="text-xl font-bold">No Active Orders</h2>
            <p>The kitchen is quiet...</p>
          </div>
        )}
      </div>
    </div>
  );
}
