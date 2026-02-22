import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Flame, Star } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_top_quest: boolean;
  is_spicy: boolean;
}

export default function MenuItems() {
  const { tableId, categoryId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { pushToast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then((data: any[]) => {
        const category = data.find(c => c.id === Number(categoryId));
        if (category) {
          setCategoryName(category.name);
          setItems(category.items);
        }
      })
      .catch(() => pushToast('Failed to load menu items.', 'error'));
  }, [categoryId]);

  return (
    <div className="px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
          >
            <div 
              className="h-48 bg-gray-200 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${item.image_url || 'https://placehold.co/800x500?text=OrbitDine'})` }}
              onClick={() => navigate(`/table/${tableId}/item/${item.id}`)}
            >
              {item.is_top_quest && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Top Quest
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  {item.name}
                  {item.is_spicy && <Flame className="w-4 h-4 text-orange-500 fill-current" />}
                </h3>
              </div>
              
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-900">
                  {formatCurrency(item.price)}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(tableId!, { ...item, quantity: 1 })
                      .then(() => pushToast(`${item.name} added to cart.`, 'success'))
                      .catch(() => pushToast('Could not update cart. Please retry.', 'error'));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
