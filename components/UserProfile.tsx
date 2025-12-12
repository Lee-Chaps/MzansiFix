
import React from 'react';
import { User, IssueReport } from '../types';
import { User as UserIcon, Mail, Calendar, MapPin, ArrowRight, Clock, Phone } from 'lucide-react';

interface UserProfileProps {
  user: User;
  reports: IssueReport[];
  onBack: () => void;
  onViewReport: (report: IssueReport) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, reports, onBack, onViewReport }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          Back to Dashboard
        </button>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-yellow-500/20 z-10 overflow-hidden">
          {user.avatar ? (
             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
             user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2 z-10">
          <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-slate-500 justify-center sm:justify-start">
             <div className="flex items-center gap-1.5">
               <Mail size={14} />
               {user.email}
             </div>
             {user.phone && (
               <div className="flex items-center gap-1.5">
                 <Phone size={14} />
                 {user.phone}
               </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-slate-500 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5">
              <UserIcon size={14} />
              Citizen Reporter
            </div>
             {user.region && (
               <div className="flex items-center gap-1.5">
                 <MapPin size={14} />
                 {user.region}
               </div>
             )}
          </div>
          
          <div className="pt-2">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wide">
                {reports.length} Reports Submitted
             </span>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="text-yellow-500" size={20} />
          Report History
        </h3>

        {reports.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <p>You haven't submitted any reports yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div 
                key={report.report_id} 
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-center"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {report.image && (
                    <img 
                      src={`data:image/jpeg;base64,${report.image.includes('data:image') ? report.image.split(',')[1] : report.image}`}
                      alt="Thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border w-fit mx-auto sm:mx-0 ${
                      report.priority === 'Immediate' ? 'bg-red-100 text-red-700 border-red-200' :
                      report.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      report.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      {report.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{report.report_id}</span>
                  </div>
                  
                  <h4 className="font-bold text-slate-800">{report.primary_category}</h4>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </span>
                    {report.coords && (
                       <span className="flex items-center gap-1">
                         <MapPin size={12} />
                         {report.coords.latitude.toFixed(3)}, {report.coords.longitude.toFixed(3)}
                       </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => onViewReport(report)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  View Report <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
