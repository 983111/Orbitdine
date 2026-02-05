import React, { useState } from 'react';
import { UserRole } from './types';
import { CustomerView } from './screens/CustomerView';
import { ManagerDashboard } from './screens/ManagerDashboard';
import { OwnerDashboard } from './screens/OwnerDashboard';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);

  // Development Toolbar to switch views
  const DevToolbar = () => (
    <div className="fixed bottom-6 right-6 bg-zinc-900 text-white p-2 rounded-xl border border-zinc-800 shadow-2xl z-50 flex gap-2 text-xs font-mono">
      <div className="flex items-center gap-2 px-3 border-r border-zinc-700">
        <span className="text-zinc-500 font-bold tracking-wider">VIEW</span>
      </div>
      {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((role) => (
        <button
          key={role}
          onClick={() => setCurrentRole(UserRole[role])}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${currentRole === UserRole[role] ? 'bg-teal-500 text-zinc-950 shadow-lg shadow-teal-500/20' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          {role}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-950">
      {currentRole === UserRole.CUSTOMER && <CustomerView />}
      {currentRole === UserRole.MANAGER && <ManagerDashboard />}
      {currentRole === UserRole.OWNER && <OwnerDashboard />}
      <DevToolbar />
    </div>
  );
};

export default App;