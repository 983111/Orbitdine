import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'motion/react';
import { Printer } from 'lucide-react';
import { cn, formatCurrency, timeAgo } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface Order {
  id: number;
  table_number: number;
  status: string;
  total_amount: number;
  items: any[];
  created_at: string;
}

interface Table {
  id: number;
  number: number;
  status: string;
}

export default function ManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTab, setActiveTab] = useState<'floor' | 'orders'>('floor');
  const { pushToast } = useToast();

  useEffect(() => {
    // Initial Fetch
    fetch('/api/orders/active').then(res => res.json()).then(setOrders).catch(() => pushToast('Failed to fetch active orders.', 'error'));
    fetch('/api/tables').then(res => res.json()).then(setTables).catch(() => pushToast('Failed to fetch table status.', 'error'));

    // Real-time updates
    const socket = io();

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
      // Update table status locally for immediate feedback
      setTables(prev => prev.map(t => 
        t.id === order.tableId ? { ...t, status: 'occupied' } : t
      ));
    });

    socket.on('order_updated', ({ id, status }) => {
      setOrders(prev => prev.map(o => 
        o.id === Number(id) ? { ...o, status } : o
      ));
    });

    socket.on('table_request', ({ tableId, type }) => {
      if (type === 'bill') {
        setTables(prev => prev.map(t => 
          t.id === Number(tableId) ? { ...t, status: 'bill_requested' } : t
        ));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  const printKitchenTicket = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/print`);
      const order = await res.json();
      const win = window.open('', '_blank', 'width=420,height=640');
      if (!win) return;
      const items = order.items.map((item: any) => `<li>${item.quantity} x ${item.name}</li>`).join('');
      win.document.write(`<h2>OrbitDine Kitchen Ticket</h2><p>Order #${order.id} | Table ${order.table_number}</p><ul>${items}</ul>`);
      win.document.close();
      win.print();
      pushToast(`Print queued for order #${orderId}.`, 'success');
    } catch {
      pushToast('Printing failed for this order.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('floor')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial",
              activeTab === 'floor' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Floor Map
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial",
              activeTab === 'orders' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Active Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'floor' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={cn(
                "aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer hover:shadow-md",
                table.status === 'available' && "border-green-200 bg-green-50 text-green-700",
                table.status === 'occupied' && "border-red-200 bg-red-50 text-red-700",
                table.status === 'bill_requested' && "border-yellow-200 bg-yellow-50 text-yellow-700 animate-pulse"
              )}
            >
              <span className="text-3xl font-bold mb-1">{table.number}</span>
              <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                {table.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900">Table {order.table_number}</h3>
                  <p className="text-xs text-gray-500">#{order.id} • {timeAgo(order.created_at)}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold uppercase",
                  order.status === 'new' && "bg-blue-100 text-blue-700",
                  order.status === 'preparing' && "bg-orange-100 text-orange-700",
                  order.status === 'ready' && "bg-green-100 text-green-700"
                )}>
                  {order.status}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex gap-2">
                {order.status === 'new' && (
                  <button
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                  >
                    Accept & Cook
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                  >
                    Complete
                  </button>
                )}
                
                <button onClick={() => printKitchenTicket(order.id)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
