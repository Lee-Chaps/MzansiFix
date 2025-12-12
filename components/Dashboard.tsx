
import React from 'react';
import { IssueReport, User } from '../types';
import { Plus, AlertTriangle, CheckCircle, Clock, BarChart3, ArrowRight, FileText, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface DashboardProps {
  user: User;
  reports: IssueReport[];
  pendingCount: number;
  onNavigate: (view: 'create' | 'view_report' | 'queue', report?: IssueReport) => void;
  t?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, reports, pendingCount, onNavigate, t }) => {
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.priority === 'High' || r.priority === 'Immediate').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  
  // Chart Data
  const categoryCount: Record<string, number> = {};
  reports.forEach(r => {
    const cat = r.primary_category || 'Other';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  
  const categoryData = Object.keys(categoryCount)
    .map(key => {
        // Create a display name that is short for the Axis
        let displayName = key;
        if (key.toLowerCase().includes('road')) displayName = 'Roads';
        else if (key.toLowerCase().includes('water') || key.toLowerCase().includes('pipe')) displayName = 'Water';
        else if (key.toLowerCase().includes('power') || key.toLowerCase().includes('electri')) displayName = 'Power';
        else if (key.toLowerCase().includes('waste') || key.toLowerCase().includes('dump')) displayName = 'Waste';
        else if (key.toLowerCase().includes('safety') || key.toLowerCase().includes('police')) displayName = 'Safety';
        else if (key.toLowerCase().includes('hous')) displayName = 'Housing';
        else if (key.toLowerCase().includes('park') || key.toLowerCase().includes('tree')) displayName = 'Parks';
        else displayName = key.split(' ')[0]; // Fallback

        return { 
            name: displayName, 
            fullName: key,
            count: categoryCount[key] 
        };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
          <p className="font-bold text-slate-800 text-sm mb-1">{payload[0].payload.fullName}</p>
          <p className="text-amber-600 font-bold text-xs">
            {payload[0].value} Report{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Mobile Greeting Card */}
      <div className="md:hidden bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500 rounded-full blur-[60px] opacity-20 transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-1">MzansiFix</p>
          <h2 className="text-2xl font-bold mb-1">{t?.dashboard?.greeting || "Hello"}, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-400 text-sm mb-5">{t?.dashboard?.subtitle || "Let's fix our city together."}</p>
          
          <button 
             onClick={() => onNavigate('create')}
             className="w-full bg-white text-slate-900 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="bg-amber-500 rounded-full p-0.5 text-white">
              <Plus size={16} /> 
            </div>
            {t?.nav?.newReport || "Report New Issue"}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t?.nav?.dashboard || "Dashboard"}</h2>
          <p className="text-slate-500 text-sm">{t?.dashboard?.overview || "Overview of municipal reports"}</p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus size={20} />
          {t?.nav?.newReport || "Report Issue"}
        </button>
      </div>

      {/* KPI Grid - Compact on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard 
          title={t?.dashboard?.totalReports || "Total Reports"} 
          value={totalReports} 
          icon={<FileText size={18} />} 
          color="slate"
        />
        <KpiCard 
          title={t?.dashboard?.queue || "Queue"} 
          value={pendingCount} 
          icon={<Clock size={18} />} 
          color="amber"
          onClick={() => onNavigate('queue')}
          clickable
        />
        <KpiCard 
          title={t?.dashboard?.critical || "Critical"} 
          value={criticalCount} 
          icon={<AlertTriangle size={18} />} 
          color="red"
        />
        <KpiCard 
          title={t?.dashboard?.fixed || "Fixed"} 
          value={resolvedCount} 
          icon={<CheckCircle size={18} />} 
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 h-8">
            <h3 className="font-bold text-slate-800 text-lg">{t?.dashboard?.recentReports || "Recent Reports"}</h3>
            {reports.length > 0 && <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">{reports.length} Items</span>}
          </div>
          
          <div className="space-y-3">
             {reports.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center">
                 <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-400">
                    <Zap size={24} />
                 </div>
                 <p className="text-slate-500 font-medium mb-2">{t?.dashboard?.noActivity || "No activity yet"}</p>
                 <button onClick={() => onNavigate('create')} className="text-amber-600 font-bold text-sm hover:underline">{t?.dashboard?.submitFirst || "Submit your first report"}</button>
               </div>
             ) : (
               reports.slice(0, 5).map((report) => (
                 <div 
                   key={report.report_id} 
                   onClick={() => onNavigate('view_report', report)}
                   className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group flex items-center gap-4"
                 >
                   <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-100">
                      {report.image ? (
                        <img 
                          src={`data:image/jpeg;base64,${report.image.includes('data:image') ? report.image.split(',')[1] : report.image}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt="Evidence"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={20}/></div>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0 py-1">
                     <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                           report.priority === 'Immediate' ? 'bg-red-50 text-red-700 border border-red-100' :
                           report.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                           report.priority === 'Medium' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
                           'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {report.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">#{report.report_id.slice(-4)}</span>
                     </div>
                     <h4 className="text-sm font-bold text-slate-900 truncate">{report.primary_category}</h4>
                     <p className="text-xs text-slate-500 truncate mt-0.5">{new Date(report.createdAt || Date.now()).toLocaleDateString()}</p>
                   </div>
                   
                   <div className="pr-2 text-slate-300 group-hover:text-amber-500 transition-colors">
                     <ArrowRight size={18} />
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Top Issues Chart */}
        {reports.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 h-8">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {t?.dashboard?.topIssues || "Top Issues"}
              </h3>
            </div>
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 h-[380px] flex flex-col w-full">
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#1e293b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, onClick, clickable }: any) => {
  const colors: any = {
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-24 md:h-28 ${clickable ? 'cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group' : ''}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]} mb-2`}>
        {icon}
      </div>
      <div>
        <span className="text-xl md:text-2xl font-extrabold text-slate-800 block leading-none mb-1 group-hover:text-amber-600 transition-colors">{value}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
      </div>
    </div>
  );
};
