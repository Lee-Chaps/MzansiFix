
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { IssueForm } from './components/IssueForm';
import { ReportView } from './components/ReportView';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { OfflineQueue } from './components/OfflineQueue';
import { UserProfile } from './components/UserProfile';
import { Dashboard } from './components/Dashboard';
import { DepartmentDirectory } from './components/DepartmentDirectory';
import { ChatBot } from './components/ChatBot';
import { Sidebar } from './components/Sidebar';
import { SettingsPage } from './components/SettingsPage';
import { analyzeIssue } from './services/geminiService';
import { auth, db, logoutUser, saveReport, fetchUserReports } from './services/firebase'; // Import Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { IssueReport, LocationData, User, PendingReport, PriorityHint, AppView, UserSettings } from './types';
import { getTranslations } from './utils/translations';

// Default Settings
const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  defaultAnonymous: false,
  dataSaver: false,
  notifications: {
    email: true,
    sms: false
  }
};

export default function App() {
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing'); 
  const [appView, setAppView] = useState<AppView>('dashboard');
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // New state to prevent flicker

  // App Logic State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<IssueReport | null>(null);
  const [reportHistory, setReportHistory] = useState<IssueReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Offline / Queue State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  // Translations
  const t = getTranslations(settings.language);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch details from Firestore
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          } else {
             // Fallback
             setUser({
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
             });
          }
          
          // Load User Reports from Firestore
          const dbReports = await fetchUserReports(firebaseUser.uid);
          setReportHistory(dbReports);
          
          setAuthView('landing');
        } catch (e) {
          console.error("Error fetching user profile/reports", e);
        }
      } else {
        // User is signed out
        setUser(null);
        setReportHistory([]); // Clear reports on logout
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedReports = localStorage.getItem('mzansi_pending_reports');
    if (savedReports) {
      setPendingReports(JSON.parse(savedReports));
    }

    // Only load from localStorage if user is NOT logged in or as a fallback
    // The Auth listener handles the primary loading now.
    if (!user) {
        const savedHistory = localStorage.getItem('mzansi_report_history');
        if (savedHistory) {
        setReportHistory(JSON.parse(savedHistory));
        }
    }

    const savedSettings = localStorage.getItem('mzansi_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mzansi_pending_reports', JSON.stringify(pendingReports));
  }, [pendingReports]);

  useEffect(() => {
    // We still keep a local backup, but Firestore is source of truth when logged in
    localStorage.setItem('mzansi_report_history', JSON.stringify(reportHistory));
  }, [reportHistory]);
  
  useEffect(() => {
    localStorage.setItem('mzansi_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    // Note: onAuthStateChanged handles the state update, but we can set view here
    setAuthView('landing'); 
    setAppView('dashboard'); 
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setReport(null);
    setAuthView('landing');
    setIsSidebarOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    // In a full implementation, update Firestore here
    setUser(updatedUser);
    localStorage.setItem('mzansi_current_user', JSON.stringify(updatedUser)); // Keep for cache
    setSuccessMessage("Profile updated (Local Cache)");
  };

  const handleClearData = () => {
    setReportHistory([]);
    setPendingReports([]);
    setReport(null);
    localStorage.removeItem('mzansi_report_history');
    localStorage.removeItem('mzansi_pending_reports');
    setSuccessMessage("Local data cleared successfully");
  };

  const handleUpdateStatus = (reportId: string, newStatus: 'submitted' | 'in_progress' | 'resolved') => {
    const updatedHistory = reportHistory.map(r => 
      r.report_id === reportId ? { ...r, status: newStatus } : r
    );
    setReportHistory(updatedHistory);
    
    // Also update current report if it matches
    if (report && report.report_id === reportId) {
      setReport({ ...report, status: newStatus });
    }
    
    setSuccessMessage(`Report marked as ${newStatus.replace('_', ' ')}`);
  };

  const handleAnalyze = async (image: string, description: string, location: LocationData | null, priority: PriorityHint, isAnonymous: boolean, language: string) => {
    setError(null);
    setIsAnalyzing(true);

    if (!isOnline) {
      const newPendingReport: PendingReport = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        image,
        description,
        location,
        priorityHint: priority,
        isAnonymous
      };
      
      setPendingReports(prev => [newPendingReport, ...prev]);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setSuccessMessage("Saved to Offline Queue");
        setAppView('queue'); 
      }, 600);
      return;
    }
    
    await performAnalysis(image, description, location, priority, isAnonymous, language);
  };

  const performAnalysis = async (image: string, description: string, location: LocationData | null, priority: PriorityHint, isAnonymous: boolean, language: string) => {
    try {
      const result = await analyzeIssue(image, description, location, priority, language);
      
      const completeReport: IssueReport = {
        ...result,
        coords: location || undefined,
        image: image,
        createdAt: Date.now(),
        status: 'submitted',
        isAnonymous: isAnonymous
      };
      
      // Save to Firestore if user is logged in
      if (auth.currentUser) {
        await saveReport(auth.currentUser.uid, completeReport);
      }

      setReport(completeReport);
      setReportHistory(prev => [completeReport, ...prev]);
      setAppView('view_report');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the issue. Please check your internet connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadPending = async (pendingReport: PendingReport) => {
    if (!isOnline) return;
    setIsProcessingId(pendingReport.id);
    
    try {
      const result = await analyzeIssue(
        pendingReport.image, 
        pendingReport.description, 
        pendingReport.location, 
        pendingReport.priorityHint,
        settings.language 
      );
      
      const completeReport: IssueReport = {
        ...result,
        coords: pendingReport.location || undefined,
        image: pendingReport.image,
        createdAt: Date.now(),
        status: 'submitted',
        isAnonymous: pendingReport.isAnonymous
      };

      // Save to Firestore if user is logged in
      if (auth.currentUser) {
        await saveReport(auth.currentUser.uid, completeReport);
      }

      setUploadSuccessId(pendingReport.id);

      setTimeout(() => {
        setReport(completeReport);
        setReportHistory(prev => [completeReport, ...prev]);
        setPendingReports(prev => prev.filter(r => r.id !== pendingReport.id));
        setUploadSuccessId(null);
        setAppView('view_report');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Failed to upload report. Please try again.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleDeletePending = (id: string) => {
    if (confirm("Are you sure you want to delete this saved report?")) {
      setPendingReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleViewChange = (view: AppView) => {
    if (view === 'create') {
      setReport(null);
      setError(null);
    }
    setAppView(view);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Initializing MzansiFix...</p>
         </div>
      </div>
    );
  }

  // --- Render Logic ---

  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage 
          onLogin={() => {
            setAuthMode('login');
            setAuthView('auth');
          }} 
          onSignup={() => {
            setAuthMode('signup');
            setAuthView('auth');
          }} 
        />
      );
    } else {
      return (
        <AuthPage 
          initialMode={authMode} 
          onSuccess={handleAuthSuccess}
          onBack={() => setAuthView('landing')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        isOnline={isOnline}
        onDashboard={() => setAppView('dashboard')}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        t={t}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onNavigate={handleViewChange}
        onLogout={handleLogout}
        currentView={appView}
        pendingCount={pendingReports.length}
        t={t}
      />
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-slide-up border border-slate-700">
           <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
           <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-28 md:pb-12 max-w-5xl animate-fade-in transition-all">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="font-bold p-1 hover:bg-red-100 rounded">&times;</button>
          </div>
        )}

        {appView === 'dashboard' && (
          <Dashboard 
            user={user}
            reports={reportHistory}
            pendingCount={pendingReports.length}
            onNavigate={(view, r) => {
              if (view === 'view_report' && r) setReport(r);
              setAppView(view as AppView);
            }}
            t={t}
          />
        )}

        {appView === 'create' && (
          <div className="max-w-2xl mx-auto">
             <div className="mb-6 flex items-center justify-between">
               <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.nav.newReport}</h2>
               <button onClick={() => setAppView('dashboard')} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-colors">Cancel</button>
             </div>
             <IssueForm 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                isOnline={isOnline}
                settings={settings}
                t={t}
             />
          </div>
        )}

        {appView === 'view_report' && report && (
          <div className="max-w-3xl mx-auto">
             <button onClick={() => setAppView('dashboard')} className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
               &larr; Back to Dashboard
             </button>
             <ReportView 
               report={report} 
               onReset={() => {
                 setReport(null);
                 setAppView('create');
               }} 
               onUpdateStatus={handleUpdateStatus}
             />
          </div>
        )}

        {appView === 'queue' && (
          <div className="max-w-3xl mx-auto">
            <OfflineQueue 
              reports={pendingReports}
              history={reportHistory}
              isOnline={isOnline}
              onUpload={handleUploadPending}
              onDelete={handleDeletePending}
              isProcessingId={isProcessingId}
              onBack={() => setAppView('dashboard')}
              uploadSuccessId={uploadSuccessId}
              onViewReport={(r) => {
                setReport(r);
                setAppView('view_report');
              }}
            />
          </div>
        )}

        {appView === 'profile' && (
          <div className="max-w-3xl mx-auto">
            <UserProfile 
              user={user}
              reports={reportHistory}
              onBack={() => setAppView('dashboard')}
              onViewReport={(r) => {
                setReport(r);
                setAppView('view_report');
              }}
            />
          </div>
        )}

        {appView === 'directory' && (
          <div className="max-w-5xl mx-auto">
             <DepartmentDirectory 
               onBack={() => setAppView('dashboard')}
             />
          </div>
        )}

        {appView === 'settings' && (
          <div className="max-w-3xl mx-auto">
             <SettingsPage 
               settings={settings}
               user={user}
               onUpdate={setSettings}
               onUpdateUser={handleUpdateUser}
               onClearData={handleClearData}
               onBack={() => setAppView('dashboard')}
             />
          </div>
        )}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        currentView={appView}
        onNavigate={handleViewChange}
        pendingCount={pendingReports.length}
      />

      <ChatBot />
    </div>
  );
}
