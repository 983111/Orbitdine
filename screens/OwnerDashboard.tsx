import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Download, Calendar, Filter, PieChart } from 'lucide-react';
import { Button } from '../components/Button';

const DATA_REVENUE = [
  { name: '10am', value: 4000 },
  { name: '12pm', value: 12000 },
  { name: '2pm', value: 18000 },
  { name: '4pm', value: 9000 },
  { name: '6pm', value: 24000 },
  { name: '8pm', value: 35000 },
];

const DATA_ITEMS = [
  { name: 'Burgers', sales: 120 },
  { name: 'Wings', sales: 98 },
  { name: 'Drinks', sales: 150 },
  { name: 'Dessert', sales: 45 },
];

export const OwnerDashboard: React.FC = () => {
  return (
    <div className="h-full bg-zinc-950 overflow-y-auto text-zinc-200 font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-zinc-800 bg-zinc-900 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <div className="bg-teal-500/10 p-2 rounded-lg text-teal-500 border border-teal-500/20">
              <PieChart size={20} />
           </div>
           <h1 className="font-bold text-white text-lg tracking-tight">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-zinc-700 bg-zinc-800/50">
            <Calendar size={14} /> Oct 24, 2023
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download size={14} /> Export Report
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: '₹1,02,450', change: '+12.5%', isPos: true },
            { label: 'Total Orders', value: '148', change: '+5.2%', isPos: true },
            { label: 'Avg Order Value', value: '₹692', change: '-2.1%', isPos: false },
            { label: 'Occupancy Rate', value: '64%', change: 'Normal', isNeutral: true },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-colors">
              <p className="text-sm text-zinc-500 font-medium mb-3">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center border ${
                  stat.isNeutral ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 
                  stat.isPos ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {!stat.isNeutral && (stat.isPos ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>)}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Revenue Chart */}
           <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-white text-lg">Revenue Trend</h3>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                   <button className="text-xs font-bold text-zinc-950 bg-teal-500 px-3 py-1.5 rounded-md shadow">Hourly</button>
                   <button className="text-xs font-bold text-zinc-500 hover:text-white px-3 py-1.5 transition">Daily</button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DATA_REVENUE}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                      itemStyle={{ color: '#2dd4bf' }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                      formatter={(value: number) => [`₹${value}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#14b8a6', strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Popular Items */}
           <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
              <h3 className="font-bold text-white text-lg mb-8">Sales by Category</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DATA_ITEMS} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 13, fontWeight: 500}} />
                    <Tooltip 
                      cursor={{fill: '#27272a'}} 
                      contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="sales" fill="#14b8a6" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Data Table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
            <Button variant="ghost" size="sm" className="text-xs text-teal-500 hover:text-teal-400">View All</Button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-8 py-4 font-semibold">Order ID</th>
                <th className="px-8 py-4 font-semibold">Table</th>
                <th className="px-8 py-4 font-semibold">Status</th>
                <th className="px-8 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[1247, 1246, 1245, 1244].map((id) => (
                <tr key={id} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-8 py-5 text-zinc-300 font-mono">#{id}</td>
                  <td className="px-8 py-5 text-zinc-400">Table {id % 10}</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Completed
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-white font-medium">₹{Math.floor(Math.random() * 2000) + 500}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};