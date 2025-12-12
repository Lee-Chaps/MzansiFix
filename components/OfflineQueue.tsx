
import React from 'react';
import { PendingReport, IssueReport } from '../types';
import { Upload, Trash2, Clock, MapPin, Loader2, WifiOff, CheckCircle, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

interface OfflineQueueProps {
  reports: PendingReport[];
  history?: IssueReport[];
  isOnline: boolean;
  onUpload: (report: PendingReport) => void;
  onDelete: (id: string) => void;
  isProcessingId: string | null;
  onBack: () => void;
  uploadSuccessId?: string | null;
  onViewReport?: (report: IssueReport) => void;
}

export const OfflineQueue: React.FC<OfflineQueueProps> = ({ 
  reports, 
  history,
  isOnline, 
  onUpload, 
  onDelete,
  isProcessingId,
  onBack,
  uploadSuccessId,
  onViewReport
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <Clock className="text-yellow-500" />
           History & Queue
        </h2>
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          Back to Dashboard
        </button>
      </div>

      {/* Offline Queue Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <WifiOff size={14} /> Pending Uploads ({reports.length})
        </h3>
        
        {reports.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
             <p className="text-slate-400 text-sm">No pending offline reports.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isSuccess = uploadSuccessId === report.id;
              return (
                <div key={report.id} className="relative bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {isSuccess && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] z-10 flex items-center justify-center flex-col animate-fade-in">
                       <CheckCircle size={48} className="text-green-600 mb-2 drop-shadow-sm" strokeWidth={3} />
                       <span className="text-green-800 font-bold text-lg">Analysis Complete</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-full sm:w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                       <img src={`data:image/jpeg;base64,${report.image}`} alt="Evidence" className="w-full h-full object-cover" />
                       {report.priorityHint === 'high' && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">URGENT</div>
                       )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">
                        {report.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                        {report.location && (
                           <span className="flex items-center gap-1">
                             <MapPin size={12} />
                             GPS Tagged
                           </span>
                        )}
                        <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {report.priorityHint} Priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                       <button
                         onClick={() => onDelete(report.id)}
                         className="p-2 text-slate-400 hover:text-red-500 transition-colors border border-slate-200 rounded-lg"
                         title="Delete"
                         disabled={!!isProcessingId}
                       >
                         <Trash2 size={18} />
                       </button>
                       
                       <button
                         onClick={() => onUpload(report)}
                         disabled={!isOnline || !!isProcessingId}
                         className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            !isOnline 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : isProcessingId === report.id
                                ? 'bg-yellow-500 text-white cursor-wait'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                         }`}
                       >
                         {isProcessingId === report.id ? (
                           <Loader2 size={16} className="animate-spin" />
                         ) : !isOnline ? (
                           <WifiOff size={16} />
                         ) : (
                           <Upload size={16} />
                         )}
                         {!isOnline ? 'Offline' : 'Upload'}
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submitted History Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle size={14} /> Submitted Reports ({history?.length || 0})
        </h3>

        {!history || history.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
             <p className="text-slate-400">No submitted reports found.</p>
           </div>
        ) : (
           <div className="grid gap-4">
            {history.map((report) => (
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
                {onViewReport && (
                  <button 
                    onClick={() => onViewReport(report)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    View <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ))}
           </div>
        )}
      </div>
    </div>
  );
};
