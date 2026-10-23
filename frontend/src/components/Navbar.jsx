import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-500">Welcome back,</span>
        <span className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-700">
          <UserIcon className="w-3.5 h-3.5 text-gray-500" />
          <span className="capitalize">{user?.role || 'admin'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
