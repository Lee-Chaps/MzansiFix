
import React from 'react';
import { LayoutGrid, Plus, BookUser, User, Clock, FileText } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, pendingCount }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
    { id: 'queue', icon: Clock, label: 'History', badge: pendingCount },
    { id: 'directory', icon: BookUser, label: 'Directory' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <div className="flex items-end justify-between px-2">
        {navItems.map((item) => {
           const isActive = currentView === item.id || (item.id === 'queue' && currentView === 'view_report');
           
           return (
             <button
               key={item.id}
               onClick={() => onNavigate(item.id)}
               className={`flex flex-col items-center justify-center py-3 px-2 flex-1 transition-colors relative ${isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <div className="relative">
                 <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                 {item.badge ? (
                   <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                     {item.badge}
                   </span>
                 ) : null}
               </div>
               <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
               {isActive && <div className="absolute bottom-0 w-8 h-1 bg-amber-500 rounded-t-full"></div>}
             </button>
           );
        })}
      </div>
    </div>
  );
};
