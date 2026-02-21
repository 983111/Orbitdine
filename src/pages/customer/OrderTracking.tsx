import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ChefHat, Bell, Gamepad2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'new', label: 'Order Received', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'preparing', label: 'Kitchen Preparing', icon: ChefHat, color: 'text-orange-500' },
  { id: 'ready', label: 'Ready to Serve', icon: Bell, color: 'text-green-500' },
  { id: 'completed', label: 'Served', icon: CheckCircle2, color: 'text-gray-400' },
];

export default function OrderTracking() {
  const { tableId, orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('new');

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((order) => {
        if (order?.status) {
          setStatus(order.status);
        }
      })
      .catch(() => {
        // fallback to realtime updates only
      });

    const socket = io();

    socket.on('order_updated', (data) => {
      if (String(data.id) === orderId) {
        setStatus(data.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900">Quest Accepted!</h1>
        <p className="text-gray-500">Order #{orderId} • Table {tableId}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-8 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100" />

          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="relative flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-500",
                  isActive ? "bg-white border-2 border-blue-500" : "bg-gray-100 border-2 border-transparent"
                )}>
                  <step.icon className={cn(
                    "w-6 h-6",
                    isActive ? step.color : "text-gray-400"
                  )} />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold transition-colors duration-300",
                    isActive ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <p className="text-xs text-blue-500 font-medium animate-pulse">
                      In Progress...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg mb-6">
        <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">Bored Waiting?</h3>
        <p className="text-purple-100 mb-6">Play games to win discounts while our chefs prepare your meal!</p>
        <button
          onClick={() => navigate(`/table/${tableId}/games`)}
          className="bg-white text-purple-600 font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-purple-50 transition-colors"
        >
          Enter Game Zone
        </button>
      </div>

      <div className="space-y-4">
        {status === 'completed' ? (
          <button
            onClick={() => navigate(`/table/${tableId}/feedback`)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-md transition-transform active:scale-95"
          >
            Rate Your Experience
          </button>
        ) : (
          <button
            onClick={() => {
              fetch(`/api/tables/${tableId}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'bill' })
              });
              alert('Bill requested! A waiter will be with you shortly.');
            }}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Request Bill
          </button>
        )}
      </div>
    </div>
  );
}
