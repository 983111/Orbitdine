import React, { useState } from 'react';
import { TABLES, MOCK_ORDERS } from '../mockData';
import { TableStatus, Order } from '../types';
import { Button } from '../components/Button';
import { Printer, X, LayoutGrid, ListFilter, User, Clock, CheckCircle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const handleTableClick = (tableId: number, status: TableStatus) => {
    setSelectedTable(tableId);
    if (status !== TableStatus.AVAILABLE) {
       const mockOrder = MOCK_ORDERS.find(o => o.tableId === tableId) || MOCK_ORDERS[0];
       setActiveOrder(mockOrder);
    } else {
      setActiveOrder(null);
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE: return 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700';
      case TableStatus.DINING: return 'border-teal-900 bg-teal-950/30 text-teal-400 hover:border-teal-700';
      case TableStatus.NEW_ORDER: return 'border-orange-900 bg-orange-950/30 text-orange-500 hover:border-orange-700 animate-pulse';
      case TableStatus.BILL_REQUESTED: return 'border-violet-900 bg-violet-950/30 text-violet-400 hover:border-violet-700';
      default: return 'border-zinc-800 bg-zinc-900';
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-200 font-sans">
      
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-8 gap-6">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-zinc-900 font-black text-lg shadow-lg shadow-teal-500/20">OD</div>
        <div className="h-px w-8 bg-zinc-800 my-2"></div>
        <button className="p-3 text-teal-400 bg-teal-500/10 rounded-xl border border-teal-500/20"><LayoutGrid size={22}/></button>
        <button className="p-3 text-zinc-500 hover:text-zinc-200 transition"><ListFilter size={22}/></button>
        <button className="p-3 text-zinc-500 hover:text-zinc-200 transition"><Clock size={22}/></button>
        <div className="flex-1"></div>
        <button className="p-3 text-zinc-500 hover:text-zinc-200 transition"><User size={22}/></button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950">
          <div>
             <h1 className="text-xl font-bold text-white tracking-tight">Floor Plan</h1>
             <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Level 1 • Main Hall</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Service
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-600"></div> Available</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Dining</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> New Order</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {TABLES.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id, table.status)}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:scale-[1.02] ${getStatusColor(table.status)} ${selectedTable === table.id ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-zinc-950' : ''}`}
              >
                {table.status === TableStatus.NEW_ORDER && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                )}
                <span className="text-3xl font-bold text-inherit tracking-tighter">T-{table.id}</span>
                <span className="text-[10px] uppercase tracking-widest mt-3 font-bold opacity-70">
                  {table.status.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTable && (
        <aside className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col animate-slide-in-right z-20 shadow-2xl">
          <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800">
            <div>
               <h2 className="font-bold text-white text-lg">Table {selectedTable}</h2>
               <p className="text-xs text-zinc-500 font-mono mt-1">{activeOrder ? `Order #${activeOrder.id}` : 'Idle'}</p>
            </div>
            <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeOrder ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                   <Clock size={16} className="text-teal-500"/> 
                   <span className="font-medium">Started: {activeOrder.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <div className="space-y-1">
                   {activeOrder.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between py-4 border-b border-zinc-800/50 last:border-0">
                        <div className="flex gap-4">
                           <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800 text-xs font-bold text-zinc-300">
                              {item.quantity}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-zinc-200">{item.name}</p>
                              {item.modifiers && <p className="text-xs text-zinc-500 mt-1">{item.modifiers.join(', ')}</p>}
                           </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-300">₹{item.price * item.quantity}</span>
                     </div>
                   ))}
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-zinc-800">
                  <span className="text-sm text-zinc-400 font-medium">Total Due</span>
                  <span className="text-2xl font-bold text-white">₹{activeOrder.total}</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <p className="font-medium">Table is currently empty.</p>
                <Button variant="outline" size="sm" className="mt-4">Assign Walk-in</Button>
              </div>
            )}
          </div>

          {activeOrder && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" className="gap-2 text-xs">
                    <Printer size={14} /> KOT
                 </Button>
                 <Button variant="secondary" className="gap-2 text-xs">
                    <Printer size={14} /> Receipt
                 </Button>
               </div>
               <Button fullWidth variant="primary" className="font-bold">
                  <CheckCircle size={18} className="mr-2"/> Settle & Clear
               </Button>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};