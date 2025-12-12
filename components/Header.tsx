
import React from 'react';
import { ShieldAlert, Wifi, WifiOff, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isOnline: boolean;
  onDashboard?: () => void;
  onToggleSidebar: () => void;
  t?: any;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  isOnline, 
  onDashboard,
  onToggleSidebar,
  t
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          )}

          <div className="flex items-center gap-2 cursor-pointer group" onClick={onDashboard}>
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">MzansiFix</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden xs:block">MUNICIPAL REPORTER</p>
            </div>
          </div>
        </div>
        
        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Network Status - Always Visible */}
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="hidden xs:inline">{isOnline ? (t?.header?.online || 'ONLINE') : (t?.header?.offline || 'OFFLINE')}</span>
           </div>
        </div>
      </div>
      
      {/* Offline Banner (Global) */}
      {!isOnline && (
        <div className="absolute top-full left-0 right-0 bg-red-600 text-white text-[10px] uppercase tracking-wider text-center py-1 font-bold shadow-md z-30">
          {t?.header?.saving || "No Internet Connection • Saving to Offline Queue"}
        </div>
      )}
    </header>
  );
};
