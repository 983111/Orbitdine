import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ChefHat, Bell, Gamepad2, ReceiptText } from 'lucide-react';
import { io } from 'socket.io-client';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const steps = [
  { id: 'new', label: 'Order received', helper: 'Your order has been confirmed.', icon: CheckCircle2, color: 'text-cyan-300' },
  { id: 'preparing', label: 'Kitchen preparing', helper: 'Chef is currently preparing your meal.', icon: ChefHat, color: 'text-amber-300' },
  { id: 'ready', label: 'Ready to serve', helper: 'Your meal is ready and will be served shortly.', icon: Bell, color: 'text-emerald-300' },
  { id: 'completed', label: 'Served', helper: 'Order delivered to your table.', icon: CheckCircle2, color: 'text-slate-200' },
];

export default function OrderTracking() {
  const { tableId, orderId } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [status, setStatus] = useState('new');
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    setLoadingOrder(true);
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unable to load order details.');
        }
        return res.json();
      })
      .then((order) => {
        if (order?.status) {
          setStatus(order.status);
        }
      })
      .catch(() => {
        pushToast('Unable to load current status, listening for live updates.', 'info');
      })
      .finally(() => {
        setLoadingOrder(false);
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
  }, [orderId, pushToast]);

  const currentStepIndex = useMemo(() => {
    const stepIndex = steps.findIndex((s) => s.id === status);
    return stepIndex >= 0 ? stepIndex : 0;
  }, [status]);

  return (
    <div className="px-1 py-4">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 p-5 text-white shadow-lg backdrop-blur-md">
        <div className="mb-4 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20"
          >
            <CheckCircle2 className="h-9 w-9 text-emerald-300" />
          </motion.div>
        </div>
        <h1 className="text-center text-2xl font-bold">Order Tracking</h1>
        <p className="mt-1 text-center text-sm text-slate-200">Order #{orderId} • Table {tableId}</p>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5 text-white shadow-lg">
        <div className="relative space-y-6">
          <div className="absolute bottom-3 left-[1.15rem] top-3 w-px bg-slate-600" />

          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="relative flex items-start gap-3">
                <div
                  className={cn(
                    'z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors',
                    isActive ? 'border-cyan-300 bg-cyan-300/10' : 'border-slate-600 bg-slate-800',
                  )}
                >
                  <step.icon className={cn('h-4.5 w-4.5', isActive ? step.color : 'text-slate-400')} />
                </div>
                <div className="pt-0.5">
                  <h3 className={cn('text-sm font-semibold', isActive ? 'text-white' : 'text-slate-400')}>{step.label}</h3>
                  <p className={cn('text-xs', isActive ? 'text-slate-300' : 'text-slate-500')}>{step.helper}</p>
                  {isCurrent && (
                    <p className="mt-1 text-xs font-medium text-cyan-300 animate-pulse">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {loadingOrder && <p className="mt-5 text-xs text-slate-400">Checking latest order status...</p>}
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-center text-white shadow-lg">
        <Gamepad2 className="mx-auto mb-3 h-10 w-10 opacity-85" />
        <h3 className="text-lg font-bold">Make your wait fun</h3>
        <p className="mb-5 mt-1 text-sm text-violet-100">Play quick games while your order is being prepared.</p>
        <button
          onClick={() => navigate(`/table/${tableId}/games`)}
          className="rounded-xl bg-white px-7 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          Enter Game Zone
        </button>
      </div>

      {status === 'completed' ? (
        <button
          onClick={() => navigate(`/table/${tableId}/feedback`)}
          className="w-full rounded-xl bg-amber-500 py-3.5 font-semibold text-white shadow-md transition hover:bg-amber-600"
        >
          Rate your experience
        </button>
      ) : (
        <button
          onClick={async () => {
            try {
              const response = await fetch(`/api/tables/${tableId}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'bill' }),
              });

              if (!response.ok) {
                throw new Error();
              }

              pushToast('Bill requested! A waiter will be with you shortly.', 'success');
            } catch {
              pushToast('Unable to request bill right now. Please try again.', 'error');
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-500 bg-slate-900/80 py-3.5 font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          <ReceiptText className="h-4 w-4" />
          Request bill
        </button>
      )}
    </div>
  );
}
