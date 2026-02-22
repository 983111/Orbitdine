import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, Star, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function ItemDetail() {
  const { tableId, itemId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { pushToast } = useToast();
  
  const [item, setItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(3);

  useEffect(() => {
    // In a real app, fetch single item. Here we scan the full menu for simplicity
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
        for (const cat of data) {
          const found = cat.items.find((i: any) => i.id === Number(itemId));
          if (found) {
            setItem(found);
            break;
          }
        }
      });
  }, [itemId]);

  if (!item) return <div className="p-8 text-center">Loading...</div>;

  const handleAddToCart = () => {
    addItem(tableId!, {
      ...item,
      quantity,
      notes: `Spice: ${spiceLevel}/5. ${notes}`
    })
      .then(() => {
        pushToast(`${item.name} added to cart.`, 'success');
        navigate(-1);
      })
      .catch(() => pushToast('Could not update cart.', 'error'));
  };

  return (
    <div className="pb-24">
      <div
        className="h-64 bg-gray-200 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${item.image_url || 'https://placehold.co/800x500?text=OrbitDine'})` }}
      />
      
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            {item.name}
            {item.is_spicy && <Flame className="w-5 h-5 text-orange-500 fill-current" />}
          </h1>
          {item.is_top_quest && (
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold mb-2">
              <Star className="w-3 h-3 fill-current" /> Top Quest
            </div>
          )}
          <p className="text-gray-500">{item.description}</p>
        </div>

        {/* Customization */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Customize</h3>
          
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Spice Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSpiceLevel(level)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
                    spiceLevel >= level 
                      ? "bg-orange-500 text-white" 
                      : "bg-gray-200 text-gray-400"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Special Request</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. No onions, extra sauce..."
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-center gap-6 py-4">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(item.price * quantity)}
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
