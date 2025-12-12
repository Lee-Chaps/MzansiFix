
import React, { useState, useEffect } from 'react';
import { IssueReport } from '../types';
import { AlertTriangle, CheckCircle, Copy, Share2, FileText, Building2, MapPin, Clock, ArrowRight, Mail, Phone, Twitter, Facebook, Instagram, Globe, Siren, Target, Zap, CircleDashed, Shield, Download, MessageCircle, MessageSquare, X } from 'lucide-react';
import { MiniMap } from './MiniMap';
import { jsPDF } from 'jspdf';

interface ReportViewProps {
  report: IssueReport;
  onReset: () => void;
  onUpdateStatus?: (reportId: string, status: 'submitted' | 'in_progress' | 'resolved') => void;
}

interface DepartmentContact {
  keywords: string[];
  aliases?: string[];
  name: string;
  email: string;
  phone: string;
  sms?: string;
  website?: string;
  social: { 
    twitter?: string; 
    facebook?: string;
    instagram?: string;
  };
}

// Database of SA Municipal Contacts
const DEPARTMENT_CONTACTS: DepartmentContact[] = [
  {
    keywords: ['road', 'pothole', 'traffic', 'transport', 'sign', 'street', 'asphalt', 'stormwater', 'bridge'],
    aliases: ['jra', 'sanral', 'roads agency'],
    name: 'Johannesburg Roads Agency (JRA)',
    email: 'hotline@jra.org.za',
    phone: '0860 562 874',
    website: 'https://www.jra.org.za',
    social: { 
      twitter: '@MyJRA', 
      facebook: 'https://www.facebook.com/JohannesburgRoadsAgency/'
    }
  },
  {
    keywords: ['water', 'sewage', 'leak', 'burst', 'sanitation', 'pipe', 'meter', 'drain', 'reservoir'],
    aliases: ['joburg water', 'jw', 'sewer'],
    name: 'Joburg Water',
    email: 'waterCalls@jwater.co.za',
    phone: '0800 000 004',
    sms: '082 653 2143',
    website: 'https://www.johannesburgwater.co.za',
    social: { 
      twitter: '@JHBWater', 
      facebook: 'Johannesburg Water',
      instagram: '@joburgwater'
    }
  },
  {
    keywords: ['power', 'electricity', 'light', 'outage', 'cable', 'energy', 'load shedding', 'substation', 'fuse'],
    aliases: ['city power'],
    name: 'City Power Johannesburg',
    email: 'estimations@citypower.co.za', 
    phone: '011 490 7484',
    sms: '083 579 9847',
    website: 'https://www.citypower.co.za',
    social: { 
      twitter: '@CityPowerJhb',
      facebook: 'City Power Johannesburg'
    }
  },
  {
    keywords: ['eskom'],
    aliases: ['eskom'],
    name: 'Eskom',
    email: 'customerservices@eskom.co.za',
    phone: '08600 37566',
    sms: '084 655 1111',
    website: 'https://www.eskom.co.za',
    social: {
       twitter: '@Eskom_SA'
    }
  },
  {
    keywords: ['waste', 'rubbish', 'refuse', 'dumping', 'trash', 'bin', 'garbage', 'clean', 'litter'],
    aliases: ['pikitup'],
    name: 'Pikitup – Johannesburg Waste Management',
    email: 'call.centre@pikitup.co.za',
    phone: '0800 742 786',
    website: 'https://www.pikitup.co.za',
    social: { 
      twitter: '@CleanerJoburg',
      facebook: 'Pikitup Johannesburg'
    }
  },
  {
    keywords: ['police', 'safety', 'crime', 'accident', 'law', 'bylaw', 'security', 'traffic violation', 'saps', 'jmpd'],
    aliases: ['jmpd', 'saps'],
    name: 'JMPD – Johannesburg Metropolitan Police Department',
    email: 'complaints@jmpd.org.za',
    phone: '011 758 9650', // Hotline
    website: 'https://www.joburg.org.za',
    social: { 
      twitter: '@JoburgMPD',
      facebook: 'Joburg Metropolitan Police Department'
    }
  },
  {
    keywords: ['park', 'tree', 'grass', 'zoo', 'vegetation', 'garden', 'cemetery'],
    aliases: ['city parks', 'jcpz'],
    name: 'Johannesburg City Parks & Zoo (JCPZ)',
    email: 'trees@jhbcityparks.com',
    phone: '011 712 6600',
    website: 'https://www.jhbcityparksandzoo.com',
    social: { 
      twitter: '@JoburgParksZoo',
      instagram: '@joburgparkszoo',
      facebook: 'Johannesburg City Parks and Zoo'
    }
  },
  {
    keywords: ['housing', 'rdp', 'settlement', 'building'],
    aliases: ['housing department'],
    name: 'City of Johannesburg Housing Department',
    email: 'info@joburg.org.za',
    phone: '011 358 3400',
    website: 'https://www.joburg.org.za',
    social: {}
  },
  {
    keywords: ['environmental', 'health', 'pest', 'hazardous'],
    aliases: ['environmental health'],
    name: 'City of Johannesburg Environmental Health',
    email: 'info@joburg.org.za',
    phone: '011 407 7523',
    website: 'https://www.joburg.org.za',
    social: {}
  },
  {
    keywords: ['general', 'municipal', 'city', 'council', 'ward', 'finance', 'billing'],
    aliases: ['coj', 'municipality'],
    name: 'City of Johannesburg (General)',
    email: 'info@joburg.org.za',
    phone: '0860 562 874',
    website: 'https://www.joburg.org.za',
    social: {
      twitter: '@CityofJoburgZA',
      facebook: 'City of Johannesburg'
    }
  }
];

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset, onUpdateStatus }) => {
  const [copied, setCopied] = useState(false);
  const [matchedDept, setMatchedDept] = useState<DepartmentContact | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!report) return;

    // Report gives an array of suggested departments. We check if any match our DB.
    const suggestedDepts = report.suggested_department.map(d => d.toLowerCase().trim());
    const primaryCategory = report.primary_category.toLowerCase().trim();

    let match = DEPARTMENT_CONTACTS.find(dept => {
      // Check exact alias matches against any of the suggestions
      return dept.aliases?.some(alias => suggestedDepts.some(s => s.includes(alias))) || 
             suggestedDepts.some(s => s.includes(dept.name.toLowerCase().split('(')[0].trim()));
    });

    // Fallback: Keyword match on Primary Category
    if (!match) {
        match = DEPARTMENT_CONTACTS.find(dept => 
          dept.keywords.some(k => primaryCategory.includes(k))
        );
    }

    // Final Fallback
    if (!match) {
        match = DEPARTMENT_CONTACTS.find(dept => dept.name.includes('General'));
    }

    if (match) {
      setMatchedDept(match);
    }
  }, [report]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'immediate': return 'bg-red-600 text-white animate-pulse shadow-red-500/50 shadow-lg border-transparent';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getFormattedReport = () => {
    let deptDetails = `REPORTED DEPT: ${report.suggested_department.join(', ')}`;
    
    if (matchedDept && !report.contact_details?.saps_station && !report.contact_details?.jmpd_region) {
        deptDetails += `\nCONTACT ENTITY: ${matchedDept.name}`;
        deptDetails += `\nEMAIL: ${matchedDept.email}`;
        deptDetails += `\nPHONE: ${matchedDept.phone}`;
        if (matchedDept.sms) deptDetails += `\nSMS: ${matchedDept.sms}`;
    }

    // Append SAPS/JMPD details if available
    if (report.contact_details) {
      if (report.contact_details.saps_station) {
        deptDetails += `\nSAPS STATION: ${report.contact_details.saps_station}`;
        if (report.contact_details.saps_emergency) deptDetails += `\nSAPS EMERGENCY: ${report.contact_details.saps_emergency}`;
      }
      if (report.contact_details.jmpd_region) {
        deptDetails += `\nJMPD REGION: ${report.contact_details.jmpd_region}`;
        if (report.contact_details.jmpd_contact_centre) deptDetails += `\nJMPD CONTACT: ${report.contact_details.jmpd_contact_centre}`;
      }
    }

    return `MZANSIFIX MUNICIPAL REPORT (#${report.report_id})
-----------------------
ISSUE TYPE: ${report.primary_category} ${report.secondary_category ? `(${report.secondary_category})` : ''}
DATE: ${new Date().toLocaleString()}
SEVERITY: ${report.severity_score > 0.7 ? 'High' : report.severity_score > 0.4 ? 'Medium' : 'Low'} (${report.priority})
URGENCY: ${report.priority}

LOCATION:
${report.coords ? `${report.coords.latitude.toFixed(6)}, ${report.coords.longitude.toFixed(6)}` : 'Not provided'}

DESCRIPTION:
${report.human_summary}

DETECTED EVIDENCE:
${report.detected_objects.join(', ')}

-----------------------
${deptDetails}
-----------------------
RECOMMENDED ACTION:
${report.dispatch_recommendation || 'Assess and repair'}

Generated by MzansiFix`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReportImageFile = () => {
    if (!report.image) return null;
    try {
      const isDataUri = report.image.includes('data:image');
      const base64Content = isDataUri ? report.image.split(',')[1] : report.image;
      if (!base64Content) return null;
      const mime = isDataUri ? report.image.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg' : 'image/jpeg';
      const bstr = atob(base64Content);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], `mzansifix_${report.report_id}.jpg`, { type: mime });
    } catch (e) {
      console.error("Image conversion failed", e);
      return null;
    }
  };

  const handleNativeShare = async () => {
    const file = getReportImageFile();
    const shareData: any = {
      title: `MzansiFix Report #${report.report_id}`,
      text: getFormattedReport(),
    };
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
        alert('Report text copied to clipboard. Share feature not supported on this device.');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
    setShowShareMenu(false);
  };

  const handleGeneratePDF = () => {
    setIsGeneratingPdf(true);
    // Slight delay to allow UI to update
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = 20;

        // Branding
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("MzansiFix Report", margin, yPos);
        
        // Status Badge (Draw rectangle)
        doc.setFillColor(245, 158, 11); // amber-500
        doc.rect(pageWidth - margin - 30, yPos - 8, 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("OFFICIAL", pageWidth - margin - 25, yPos - 2);

        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
        yPos += 6;
        doc.text(`Report ID: ${report.report_id}`, margin, yPos);
        yPos += 15;

        // Image
        if (report.image) {
          const imgData = report.image.includes('data:image') ? report.image : `data:image/jpeg;base64,${report.image}`;
          try {
            const imgProps = doc.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pageWidth - 2 * margin)) / imgProps.width;
            
            // Limit image height if it takes too much space
            const finalH = Math.min(imgHeight, 100);
            
            doc.addImage(imgData, 'JPEG', margin, yPos, pageWidth - 2 * margin, finalH);
            yPos += finalH + 15;
          } catch (e) {
            console.error("PDF Image Error", e);
          }
        }

        // Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(report.primary_category, margin, yPos);
        yPos += 8;

        // Separator
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Body Text
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        const reportText = getFormattedReport().replace(/MzansiFix Municipal Report.*?\n-+/is, '').trim(); // Remove header from text body since we drew it
        
        const splitText = doc.splitTextToSize(reportText, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPos);

        doc.save(`mzansifix_report_${report.report_id}.pdf`);
      } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Could not generate PDF.");
      }
      setIsGeneratingPdf(false);
      setShowShareMenu(false);
    }, 100);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`*MzansiFix Report #${report.report_id}*\n\n${report.primary_category}\n\n${report.human_summary}\n\n_Sent via MzansiFix_`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`MzansiFix Report: ${report.primary_category}`);
    const body = encodeURIComponent(getFormattedReport());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const handleSmsShare = () => {
    const body = encodeURIComponent(`MzansiFix Report: ${report.primary_category} - ${report.human_summary?.slice(0, 100)}...`);
    window.location.href = `sms:?body=${body}`;
    setShowShareMenu(false);
  };

  const getMailtoUrl = () => {
    if (!matchedDept) return '#';
    const subject = encodeURIComponent(`Issue Report #${report.report_id}: ${report.primary_category}`);
    const reportText = getFormattedReport();
    const body = encodeURIComponent(reportText + "\r\n\r\n(Please attach photo evidence manually if needed)");
    return `mailto:${matchedDept.email}?subject=${subject}&body=${body}`;
  };

  const handleEmailButton = () => {
    if (matchedDept) {
      window.location.href = getMailtoUrl();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8 relative">
      
      {/* Share Menu Modal/Overlay */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div 
             className="bg-white w-full max-w-sm rounded-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Share2 size={18} className="text-amber-500" />
                  Share Report
                </h3>
                <button 
                  onClick={() => setShowShareMenu(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                 {/* Featured Option: WhatsApp */}
                 <button 
                   onClick={handleWhatsAppShare}
                   className="w-full flex items-center justify-center gap-3 p-4 bg-[#25D366] text-white rounded-xl shadow-lg shadow-green-500/20 hover:bg-[#20bd5a] transition-all transform active:scale-[0.98] group"
                 >
                   <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                   <span className="font-bold text-lg">Share on WhatsApp</span>
                 </button>

                 {/* Grid Options */}
                 <div className="grid grid-cols-2 gap-4">
                    {/* PDF Export */}
                    <button 
                      onClick={handleGeneratePDF}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-200 transition-colors group text-center"
                    >
                      <div className="bg-white p-3 rounded-full shadow-sm text-slate-400 group-hover:text-red-500 transition-colors">
                        <Download size={24} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-700 group-hover:text-red-700">{isGeneratingPdf ? 'Saving...' : 'Save PDF'}</span>
                        <span className="text-[10px] text-slate-400">Official Document</span>
                      </div>
                    </button>

                    {/* Native Share */}
                    <button 
                      onClick={handleNativeShare}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-colors group text-center"
                    >
                      <div className="bg-white p-3 rounded-full shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Share2 size={24} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-700 group-hover:text-blue-700">More Apps</span>
                        <span className="text-[10px] text-slate-400">System Share</span>
                      </div>
                    </button>

                    {/* Email */}
                    <button 
                      onClick={handleEmailShare}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-colors group"
                    >
                       <Mail size={20} className="text-slate-400 group-hover:text-purple-600" />
                       <span className="text-xs font-bold text-slate-600 group-hover:text-purple-700">Email</span>
                    </button>

                    {/* SMS */}
                    <button 
                      onClick={handleSmsShare}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-yellow-50 border border-slate-100 hover:border-yellow-200 transition-colors group"
                    >
                       <MessageSquare size={20} className="text-slate-400 group-hover:text-yellow-600" />
                       <span className="text-xs font-bold text-slate-600 group-hover:text-yellow-700">SMS</span>
                    </button>
                 </div>
              </div>
           </div>
           
           {/* Click outside to close */}
           <div className="absolute inset-0 -z-10" onClick={() => setShowShareMenu(false)}></div>
        </div>
      )}

      {/* Status Bar for History View */}
      {onUpdateStatus && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${report.status === 'resolved' ? 'bg-green-100 text-green-600' : report.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
               {report.status === 'resolved' ? <CheckCircle size={20} /> : report.status === 'in_progress' ? <CircleDashed size={20} className="animate-spin-slow" /> : <AlertTriangle size={20} />}
             </div>
             <div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Status</p>
               <p className="text-sm font-bold text-slate-800 capitalize">{report.status?.replace('_', ' ') || 'Submitted'}</p>
             </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => onUpdateStatus(report.report_id, 'submitted')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!report.status || report.status === 'submitted' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Open
             </button>
             <button 
               onClick={() => onUpdateStatus(report.report_id, 'in_progress')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${report.status === 'in_progress' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               In Progress
             </button>
             <button 
               onClick={() => onUpdateStatus(report.report_id, 'resolved')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${report.status === 'resolved' ? 'bg-white shadow text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Resolved
             </button>
          </div>
        </div>
      )}

      {/* Emergency Banner */}
      {report.emergency && (
        <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-3 animate-pulse">
           <Siren size={32} className="flex-shrink-0" />
           <div>
             <h2 className="font-bold text-lg uppercase tracking-wider">Emergency Detected</h2>
             <p className="text-sm opacity-90">{report.dispatch_recommendation || "Immediate threat to life or property. Escalate now."}</p>
           </div>
        </div>
      )}

      {/* Top Summary Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
        <div className="p-6 pb-0">
          {/* Header Section */}
          <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getPriorityColor(report.priority)}`}>
                  {report.priority} Priority
                </span>
                {report.sla_tier && (
                  <span className="text-slate-600 text-xs font-medium flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                    <Clock size={12} />
                    Target: {report.sla_tier}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {report.primary_category}
              </h2>
              {report.secondary_category && (
                <p className="text-slate-500 font-medium text-lg">{report.secondary_category}</p>
              )}
          </div>

          {/* Map Section - FULL WIDTH EDGE-TO-EDGE */}
          {report.coords && (
            <div className="mb-6 -mx-6 w-[calc(100%+3rem)]">
                <div className="flex items-center gap-2 mb-2 px-6">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incident Location</span>
                    <span className="text-xs font-mono text-slate-400">
                        {report.coords.latitude.toFixed(6)}, {report.coords.longitude.toFixed(6)}
                    </span>
                </div>
                <div className="w-full h-72 md:h-96 bg-slate-100 border-t border-b border-slate-200 relative shadow-inner">
                    <MiniMap latitude={report.coords.latitude} longitude={report.coords.longitude} />
                </div>
            </div>
          )}
          
          {/* Detected Objects Tags */}
          {report.detected_objects.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-6">
                {report.detected_objects.map((obj, i) => (
                   <span key={i} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {obj}
                   </span>
                ))}
             </div>
          )}

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-2 text-sm">
                <FileText size={16} className="text-blue-500" />
                Summary
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{report.human_summary}</p>
          </div>
        </div>
          
        <div className="p-6 pt-0">
          {/* Smart Routing Card */}
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={100} className="text-purple-600" />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-purple-700 font-bold uppercase text-xs tracking-wider mb-2">
                  <Target size={14} />
                  Suggested Routing
               </div>
               
               <h3 className="text-lg font-bold text-purple-900 mb-1">
                  {report.suggested_department.join(', ')}
               </h3>
               
               {report.dispatch_recommendation && (
                 <p className="text-sm text-purple-800/80 mb-4 bg-purple-100/50 p-2 rounded-lg border border-purple-100">
                    <span className="font-bold">Action:</span> {report.dispatch_recommendation}
                 </p>
               )}

               {/* SAPS / JMPD Specific Card */}
               {(report.contact_details?.saps_station || report.contact_details?.jmpd_region) && (
                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-blue-600" />
                      <span className="font-bold text-blue-900 text-sm">Public Safety & Enforcement</span>
                    </div>
                    <div className="space-y-2 text-sm text-blue-800">
                       {report.contact_details.saps_station && (
                         <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="block font-bold">SAPS Station: {report.contact_details.saps_station}</span>
                            {report.contact_details.saps_emergency && (
                              <a href={`tel:${report.contact_details.saps_emergency.replace(/\s/g, '')}`} className="block text-blue-600 underline">Emergency: {report.contact_details.saps_emergency}</a>
                            )}
                            {report.contact_details.saps_station_line && (
                              <a href={`tel:${report.contact_details.saps_station_line.replace(/\s/g, '')}`} className="block text-slate-600">Station Line: {report.contact_details.saps_station_line}</a>
                            )}
                         </div>
                       )}
                       {report.contact_details.jmpd_region && (
                         <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="block font-bold">JMPD Region: {report.contact_details.jmpd_region}</span>
                             {report.contact_details.jmpd_contact_centre && (
                              <a href={`tel:${report.contact_details.jmpd_contact_centre.replace(/\s/g, '')}`} className="block text-slate-600">Contact Centre: {report.contact_details.jmpd_contact_centre}</a>
                            )}
                         </div>
                       )}
                    </div>
                 </div>
               )}

               {/* Standard Department Contacts (Only if NOT a purely SAPS/JMPD issue or if we fallback) */}
               {matchedDept && !report.contact_details?.saps_station && !report.contact_details?.jmpd_region ? (
                 <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
                   <div className="bg-purple-100 px-4 py-2 border-b border-purple-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-700 uppercase">Contact Details</span>
                      <span className="text-[10px] text-purple-600 font-mono">{matchedDept.aliases?.[0]?.toUpperCase()}</span>
                   </div>
                   
                   <div className="p-4">
                     <p className="font-bold text-slate-800 text-sm mb-3">{matchedDept.name}</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <a 
                          href={getMailtoUrl()} 
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-colors group cursor-pointer"
                        >
                          <div className="p-2 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-purple-600">
                            <Mail size={16} />
                          </div>
                          <span className="text-sm truncate font-medium">{matchedDept.email}</span>
                        </a>
                        
                        <a 
                          href={`tel:${matchedDept.phone.replace(/[^\d+]/g, '')}`}
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-colors group cursor-pointer"
                        >
                          <div className="p-2 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-purple-600">
                            <Phone size={16} />
                          </div>
                          <span className="text-sm font-medium">{matchedDept.phone}</span>
                        </a>
                     </div>

                     {/* Social & Web Links */}
                     <div className="flex flex-wrap gap-2 text-sm">
                        {matchedDept.website && (
                           <a href={matchedDept.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-md transition-colors">
                             <Globe size={16} />
                           </a>
                        )}
                        {matchedDept.social.twitter && (
                          <a href={`https://twitter.com/${matchedDept.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-500 rounded-md transition-colors">
                            <Twitter size={16} />
                          </a>
                        )}
                        {matchedDept.social.facebook && (
                           <a href={matchedDept.social.facebook.startsWith('http') ? matchedDept.social.facebook : `https://facebook.com/search/top?q=${encodeURIComponent(matchedDept.name)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded-md transition-colors">
                             <Facebook size={16} />
                           </a>
                        )}
                         {matchedDept.social.instagram && (
                           <a href={`https://instagram.com/${matchedDept.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-600 rounded-md transition-colors">
                             <Instagram size={16} />
                           </a>
                        )}
                     </div>
                     
                     <button 
                        onClick={handleEmailButton}
                        className="mt-4 w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                     >
                       <Zap size={14} />
                       Draft Email to Department
                     </button>
                   </div>
                 </div>
               ) : null}
               
               {!matchedDept && !report.contact_details?.saps_station && !report.contact_details?.jmpd_region && (
                 <div className="text-xs text-purple-600/70 italic mt-2 p-3 bg-purple-100/50 rounded-lg">
                   Automated contact matching unavailable. Please refer to general municipal channels.
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Official Report Text Block */}
      <div className="bg-slate-800 rounded-xl shadow-lg text-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
            <FileText size={18} className="text-yellow-500" />
            Official Report Format
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium bg-slate-800 border border-slate-600"
            >
              {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
              onClick={() => setShowShareMenu(true)}
              className="px-4 py-2 hover:bg-yellow-600 bg-yellow-500 text-slate-900 rounded-lg transition-colors text-xs font-bold border border-yellow-600 flex items-center gap-2"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row">
            {report.image && (
              <div className="w-full md:w-48 bg-black/40 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-700 p-4 flex flex-col justify-center">
                 <img 
                   src={`data:image/jpeg;base64,${report.image.includes('data:image') ? report.image.split(',')[1] : report.image}`} 
                   className="rounded-lg border border-slate-600 w-full mb-2" 
                   alt="Evidence" 
                 />
                 <span className="text-[10px] text-slate-500 text-center">ID: {report.report_id}</span>
              </div>
            )}
            <div className="p-6 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap bg-slate-800/50 text-slate-300 flex-grow">
              {getFormattedReport()}
            </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 text-slate-500 font-medium hover:text-slate-800 transition-colors text-sm"
      >
        Report Another Issue
      </button>
    </div>
  );
};
