import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, X, ChevronRight, Clock, Receipt, UtensilsCrossed, Info, Flame, ChevronLeft } from 'lucide-react';
import { CATEGORIES, MENU_ITEMS } from '../mockData';
import { MenuItem, CartItem } from '../types';
import { Button } from '../components/Button';

export const CustomerView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'MENU' | 'ORDER_STATUS'>('MENU');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Cart Logic
  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      updateQuantity(existing.cartId, 1);
    } else {
      const newItem: CartItem = {
        ...item,
        cartId: Math.random().toString(36).substr(2, 9),
        quantity: 1,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const handlePlaceOrder = () => {
    setIsMobileCartOpen(false);
    setView('ORDER_STATUS');
  };

  // --- SUB COMPONENTS ---

  const OrderStatusView = () => (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="flex items-center p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => setView('MENU')} className="mr-2">
           <ChevronLeft size={20} />
        </Button>
        <div>
           <h2 className="text-lg font-bold text-white">Order #1247</h2>
           <p className="text-zinc-400 text-xs">Table 5 • Live Status</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl mb-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <Flame className="text-orange-500 animate-pulse" size={20} /> Kitchen Status
            </h3>
            <div className="relative pl-2">
              <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-zinc-800"></div>
              <div className="space-y-8">
                {[
                  { title: 'Order Received', time: '12:30 PM', active: true, done: true },
                  { title: 'Sent to Kitchen', time: '12:31 PM', active: true, done: true },
                  { title: 'Chefs are Cooking', time: 'Now', active: true, done: false },
                  { title: 'Quality Check', time: '-', active: false, done: false },
                  { title: 'Served at Table', time: '-', active: false, done: false },
                ].map((step, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center z-10 transition-colors shadow-lg ${
                      step.done ? 'bg-teal-500 border-teal-500 text-zinc-900' : 
                      step.active ? 'bg-zinc-900 border-teal-500 text-teal-500' : 'bg-zinc-900 border-zinc-700 text-zinc-700'
                    }`}>
                      {step.done ? <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"/> : <div className={`w-2.5 h-2.5 rounded-full ${step.active ? 'bg-teal-500 animate-pulse' : 'bg-zinc-700'}`}/>}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${step.active || step.done ? 'text-white' : 'text-zinc-500'}`}>{step.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
             <span className="text-zinc-400 text-sm">Need help?</span>
             <Button variant="outline" size="sm" className="text-xs h-8">Call Waiter</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const CartContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900 ${isMobile ? 'h-16' : 'h-20'}`}>
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="p-2 bg-zinc-800 rounded-lg text-teal-500">
            <Receipt size={20} />
          </div>
          <span>Your Order</span>
        </div>
        {isMobile && (
          <Button variant="ghost" onClick={() => setIsMobileCartOpen(false)}><X size={24}/></Button>
        )}
        {!isMobile && (
          <span className="text-xs font-bold bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full border border-teal-500/20">Table 5</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <ShoppingCart size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">Your cart is empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.cartId} className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
              <div className="flex flex-col items-center gap-1 bg-zinc-900 rounded-lg p-1 h-fit border border-zinc-800">
                  <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 text-zinc-400 hover:text-teal-400 hover:bg-zinc-800 rounded"><Plus size={14}/></button>
                  <span className="font-mono font-bold text-white text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded"><Minus size={14}/></button>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-200 font-semibold text-sm">{item.name}</span>
                  <span className="text-zinc-100 font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
                {item.modifiers && <p className="text-xs text-zinc-500 mt-1">{item.modifiers.join(', ')}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-zinc-900 border-t border-zinc-800 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Tax (5%)</span>
            <span>{formatPrice(cartTotal * 0.05)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-zinc-800 mt-2">
            <span>Total</span>
            <span className="text-teal-400">{formatPrice(cartTotal * 1.05)}</span>
          </div>
        </div>
        <Button 
          fullWidth 
          size="lg" 
          disabled={cart.length === 0} 
          onClick={handlePlaceOrder} 
          className="font-bold h-12 text-base"
        >
          Place Order
        </Button>
      </div>
    </div>
  );

  if (view === 'ORDER_STATUS') return <OrderStatusView />;

  return (
    <div className="flex h-[100dvh] w-full bg-zinc-950 overflow-hidden text-zinc-200 font-sans relative">
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800">
          <span className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-zinc-900">
               <UtensilsCrossed size={18} />
            </div>
            OrbitDine
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Menu</h3>
          </div>
          <nav className="space-y-1 px-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{cat.name}</span>
                </div>
                {activeCategory === cat.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={() => setView('ORDER_STATUS')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 hover:border-zinc-700"
          >
            <Clock size={18} className="text-teal-500" />
            <span>Order Status</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-20">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center text-zinc-900">
                <span className="font-bold text-sm">T5</span>
             </div>
             <div>
               <h1 className="font-bold text-white leading-tight">Table 5</h1>
               <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Ordering Menu</p>
             </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setView('ORDER_STATUS')} className="text-zinc-400">
            <Clock size={20} />
          </Button>
        </header>

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {CATEGORIES.find(c => c.id === activeCategory)?.name}
            </h1>
            <p className="text-sm text-zinc-500">Select items to add to your table</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none placeholder-zinc-600 transition-all"
            />
          </div>
        </header>

        {/* MOBILE CATEGORY SCROLLER */}
        <div className="md:hidden px-4 py-3 bg-zinc-950 overflow-x-auto no-scrollbar flex gap-2 sticky top-16 z-10 border-b border-zinc-800/50">
           {CATEGORIES.map(cat => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                 activeCategory === cat.id
                  ? 'bg-teal-500 text-zinc-900 border-teal-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
               }`}
             >
               {cat.icon} {cat.name}
             </button>
           ))}
        </div>

        {/* MENU GRID */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <h2 className="md:hidden text-lg font-bold text-white mb-4">{CATEGORIES.find(c => c.id === activeCategory)?.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {MENU_ITEMS.filter(i => i.category === activeCategory).map(item => (
              <div key={item.id} className="flex md:flex-col bg-zinc-900 border border-zinc-800/50 rounded-xl overflow-hidden md:rounded-2xl hover:border-teal-500/30 transition-all group">
                {/* Image */}
                <div className="w-24 h-24 md:w-full md:aspect-[4/3] md:h-auto bg-zinc-800 relative flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-1 right-1 md:top-3 md:right-3 z-20 bg-zinc-950/80 backdrop-blur text-teal-400 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full border border-zinc-800">
                    {item.rating} ★
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-base md:text-lg mb-1">{item.name}</h3>
                    <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 mb-2 md:mb-6">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-lg text-white">{formatPrice(item.price)}</span>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => addToCart(item)}
                      className="h-8 px-3 md:h-10 md:px-5"
                    >
                      <Plus size={16} className="md:mr-1"/> <span className="hidden md:inline">Add</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE FLOATING CART BAR */}
        {cart.length > 0 && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-30">
            <button 
              onClick={() => setIsMobileCartOpen(true)}
              className="w-full bg-teal-500 text-zinc-900 rounded-xl p-4 shadow-lg shadow-teal-500/20 flex items-center justify-between animate-slide-up"
            >
              <div className="flex items-center gap-3">
                 <div className="bg-zinc-900/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-zinc-900/10">
                   {cartItemCount}
                 </div>
                 <div className="flex flex-col items-start">
                   <span className="text-xs font-semibold opacity-80">Total</span>
                   <span className="font-bold text-lg leading-none">{formatPrice(cartTotal)}</span>
                 </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-sm">
                View Cart <ChevronRight size={16}/>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* 3. DESKTOP RIGHT PANEL - Cart (Hidden on Mobile) */}
      <aside className="hidden md:flex w-96 bg-zinc-900 border-l border-zinc-800 flex-col flex-shrink-0 shadow-2xl z-20">
        <CartContent />
      </aside>

      {/* 4. MOBILE CART OVERLAY (Full Screen Modal) */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-slide-up">
           <CartContent isMobile={true} />
        </div>
      )}
    </div>
  );
};
