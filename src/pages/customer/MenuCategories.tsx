import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Search, AlertTriangle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  items?: { id: number }[];
}

export default function MenuCategories() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/api/menu')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Could not load menu');
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setCategories(data);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load menu right now. Please try again.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.description}`.toLowerCase().includes(q),
    );
  }, [categories, query]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-200">
        Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 p-6 text-rose-100 flex gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Choose a category</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Search category or vibe..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-300 outline-none focus:border-cyan-300"
        />
      </div>

      <div className="grid gap-3">
        {filteredCategories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => navigate(`/table/${tableId}/category/${category.id}`)}
            className="text-left rounded-2xl border border-white/15 bg-white/10 p-4 flex items-center gap-4 hover:bg-white/15 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-300/20 flex items-center justify-center text-2xl">
              {category.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-slate-300">{category.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-300 mb-1">{category.items?.length ?? 0} items</p>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}

        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center text-slate-300">
            No categories match your search.
          </div>
        )}
      </div>
    </div>
  );
}
