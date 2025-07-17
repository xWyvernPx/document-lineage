import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.attributes?.email || ''}</p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}; 