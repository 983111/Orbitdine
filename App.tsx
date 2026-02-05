import React, { useState } from 'react';
import { UserRole } from './types';
import { CustomerView } from './screens/CustomerView';
import { ManagerDashboard } from './screens/ManagerDashboard';
import { OwnerDashboard } from './screens/OwnerDashboard';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);

  // Development Toolbar to switch views
  // POSITIONS:
  // Mobile: Top Right (top-24) to avoid bottom cart bar and header.
  // Desktop: Bottom Left (left-72) to sit next to the left sidebar, avoiding the right sidebar's "Place Order" button.
  const DevToolbar = () => (
    <div className="fixed z-50 transition-all duration-300 ease-in-out
      top-24 right-4 
      md:top-auto md:bottom-6 md:right-auto md:left-72
    ">
      <div className="bg-zinc-900/90 backdrop-blur-md text-white p-1.5 rounded-lg border border-zinc-700/50 shadow-2xl flex gap-1 text-[10px] font-mono opacity-80 hover:opacity-100 ring-1 ring-black/20 transform hover:scale-105 transition-all">
        <div className="flex items-center gap-1 px-2 border-r border-zinc-700/50">
          <span className="text-teal-500 font-bold tracking-wider">DEV</span>
        </div>
        {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((role) => (
          <button
            key={role}
            onClick={() => setCurrentRole(UserRole[role])}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${currentRole === UserRole[role] ? 'bg-teal-500 text-zinc-950 shadow-sm' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {role.substring(0, 1) + role.substring(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden bg-zinc-950 relative">
      {currentRole === UserRole.CUSTOMER && <CustomerView />}
      {currentRole === UserRole.MANAGER && <ManagerDashboard />}
      {currentRole === UserRole.OWNER && <OwnerDashboard />}
      <DevToolbar />
    </div>
  );
};

export default App;
