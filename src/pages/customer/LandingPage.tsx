import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight, UtensilsCrossed } from 'lucide-react';

export default function LandingPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-cyan-300/20 text-cyan-100 flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-cyan-200/80">Welcome onboard</p>
        <h1 className="text-3xl font-bold mt-2">A new dining UI, built for speed.</h1>
        <p className="text-slate-200/80 mt-3">
          Browse curated categories, place orders instantly, and track status live from your table.
        </p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/table/${tableId}/menu`)}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#021322] font-bold py-4 flex items-center justify-center gap-2"
      >
        Start Ordering <ChevronRight className="w-5 h-5" />
      </motion.button>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <p className="text-xs text-slate-300">Current table</p>
          <p className="text-2xl font-bold mt-1">#{tableId}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <p className="text-xs text-slate-300">Live status</p>
          <p className="text-2xl font-bold mt-1 text-emerald-300">Online</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/manager')}
        className="w-full text-sm text-slate-300 hover:text-white flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> Staff Access
      </button>
    </div>
  );
}
