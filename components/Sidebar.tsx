
import React from 'react';
import { X, LayoutGrid, Plus, BookUser, User as UserIcon, LogOut, Clock, ShieldAlert, Settings } from 'lucide-react';
import { User, AppView } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  currentView: string;
  pendingCount: number;
  t?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onNavigate, 
  onLogout, 
  currentView,
  pendingCount,
  t
}) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  const navItems: { id: AppView; icon: any; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: LayoutGrid, label: t?.nav?.dashboard || 'Dashboard' },
    { id: 'queue', icon: Clock, label: t?.nav?.history || 'History / Queue', badge: pendingCount },
    { id: 'directory', icon: BookUser, label: t?.nav?.directory || 'Directory' },
    { id: 'settings', icon: Settings, label: t?.nav?.settings || 'Settings' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">MzansiFix</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Summary */}
        {user && (
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-amber-400/50 overflow-hidden">
                {user.avatar ? (
                   <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                   user.name.charAt(0)
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'queue' && currentView === 'view_report');
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group relative ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-500'} />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
          >
            <LogOut size={20} />
            {t?.nav?.signOut || "Sign Out"}
          </button>
          <p className="text-center text-[10px] text-slate-300 mt-4 uppercase font-bold tracking-widest">
            Version 1.2.0
          </p>
        </div>
      </aside>
    </>
  );
};
