import { BarChart3, TrendingUp, Users, DollarSign, Settings, Store, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const stats = [
    { label: "Today's Revenue", value: "₹45,320", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Active Orders", value: "47", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Customers", value: "128", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Avg. Rating", value: "4.8", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Owner Overview</h1>
              <p className="text-gray-500">Real-time insights for The Spice Room</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/manager/dashboard" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Store className="w-4 h-4" /> Floor View
              </Link>
              <Link to="/manager/kitchen" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100">
                <UtensilsCrossed className="w-4 h-4" /> Kitchen
              </Link>
              <Link to="/manager/settings" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                  +12% <TrendingUp className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trends</h3>
            <div className="h-52 md:h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs md:text-sm text-gray-400 overflow-x-auto">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Items</h3>
            <div className="space-y-6">
              {[
                { name: 'Legendary Burger', sales: 145, color: 'bg-orange-500' },
                { name: 'Spicy Wings', sales: 98, color: 'bg-red-500' },
                { name: 'Galaxy Cake', sales: 76, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-500">{item.sales} sold</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color}`} 
                      style={{ width: `${(item.sales / 150) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
