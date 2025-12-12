
import React, { useState, useRef } from 'react';
import { UserSettings, User } from '../types';
import { Settings, Bell, Shield, Smartphone, Globe, Save, Trash2, Check, User as UserIcon, Mail, Phone, MapPin, AlertTriangle, ChevronRight, Camera } from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  user?: User;
  onUpdate: (newSettings: UserSettings) => void;
  onUpdateUser?: (updatedUser: User) => void;
  onClearData?: () => void;
  onBack: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'st', label: 'Sesotho' },
  { code: 'tn', label: 'Setswana' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'ts', label: 'Xitsonga' },
  { code: 'ss', label: 'siSwati' },
  { code: 've', label: 'Tshivenda' },
  { code: 'nr', label: 'isiNdebele' }
];

const METROS = [
  "City of Johannesburg",
  "City of Tshwane",
  "City of Ekurhuleni",
  "City of Cape Town",
  "eThekwini Municipality",
  "Nelson Mandela Bay",
  "Mangaung Municipality",
  "Buffalo City"
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  settings, 
  user,
  onUpdate, 
  onUpdateUser,
  onClearData,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'app' | 'data'>('app');
  
  // App Settings State
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  
  // Profile Settings State
  const [profileForm, setProfileForm] = useState<User>(user || { name: '', email: '' });
  
  // UI State
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for App Settings ---
  const handleAppChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleNotificationChange = (key: 'email' | 'sms', value: boolean) => {
    const newSettings = {
      ...localSettings,
      notifications: { ...localSettings.notifications, [key]: value }
    };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  // --- Handlers for Profile Settings ---
  const handleProfileChange = (key: keyof User, value: any) => {
    setProfileForm(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
          alert("File is too large. Please choose an image under 10MB.");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = (e) => {
        const img = new Image();
        img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_SIZE = 300; // Resize to max 300px for avatar
             let width = img.width;
             let height = img.height;
             
             if (width > height) {
                 if (width > MAX_SIZE) {
                     height *= MAX_SIZE / width;
                     width = MAX_SIZE;
                 }
             } else {
                 if (height > MAX_SIZE) {
                     width *= MAX_SIZE / height;
                     height = MAX_SIZE;
                 }
             }
             
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, width, height);
             // Compress to JPEG 0.7 quality to save space in localStorage
             const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
             handleProfileChange('avatar', compressedBase64);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Common Save ---
  const handleSave = () => {
    // Save App Settings
    onUpdate(localSettings);
    
    // Save Profile Settings (if handler provided)
    if (onUpdateUser) {
      onUpdateUser(profileForm);
    }

    setHasChanges(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // --- Views ---

  const renderProfileTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center gap-4">
        <div 
          className="relative group cursor-pointer"
          onClick={handleAvatarClick}
        >
           <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-amber-400/20 group-hover:ring-amber-500 transition-all overflow-hidden">
             {profileForm.avatar ? (
               <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               profileForm.name.charAt(0).toUpperCase()
             )}
           </div>
           <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Camera className="text-white" size={24} />
           </div>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*" 
             className="hidden" 
           />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800">Profile Picture</h3>
          <p className="text-xs text-slate-400">Tap to update</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <UserIcon size={18} className="text-slate-500" />
          <h3 className="font-bold text-slate-800">Personal Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input 
                type="text" 
                value={profileForm.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
             <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input 
                type="email" 
                value={profileForm.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-slate-50"
                placeholder="name@example.com"
                readOnly // Simulating readonly for primary ID
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
             <div className="relative">
              <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input 
                type="tel" 
                value={profileForm.phone || ''}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="+27 82 123 4567"
              />
            </div>
          </div>

           <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Region / Municipality</label>
             <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <select 
                value={profileForm.region || ''}
                onChange={(e) => handleProfileChange('region', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white appearance-none"
              >
                <option value="">Select your region</option>
                {METROS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-3.5 text-slate-400 rotate-90" size={16}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppTab = () => (
    <div className="space-y-6 animate-fade-in">
       {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Globe size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Language & Region</h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">App Language</label>
            <select
              value={localSettings.language}
              onChange={(e) => handleAppChange('language', e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2">Changes the AI response language for reports.</p>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Shield size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Privacy & Safety</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
             <div>
               <span className="block font-medium text-slate-900">Default to Anonymous</span>
               <span className="text-sm text-slate-500">Hide my name on all new reports automatically.</span>
             </div>
             <button 
               onClick={() => handleAppChange('defaultAnonymous', !localSettings.defaultAnonymous)}
               className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${localSettings.defaultAnonymous ? 'bg-amber-500' : 'bg-slate-200'}`}
             >
               <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.defaultAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Bell size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between">
               <div>
                 <span className="block font-medium text-slate-900">Email Alerts</span>
                 <span className="text-sm text-slate-500">Receive status updates via email.</span>
               </div>
               <button 
                 onClick={() => handleNotificationChange('email', !localSettings.notifications.email)}
                 className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${localSettings.notifications.email ? 'bg-blue-500' : 'bg-slate-200'}`}
               >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
             </div>
             <div className="flex items-center justify-between border-t border-slate-100 pt-4">
               <div>
                 <span className="block font-medium text-slate-900">SMS Alerts</span>
                 <span className="text-sm text-slate-500">Receive urgent updates via SMS.</span>
               </div>
               <button 
                 onClick={() => handleNotificationChange('sms', !localSettings.notifications.sms)}
                 className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${localSettings.notifications.sms ? 'bg-blue-500' : 'bg-slate-200'}`}
               >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.notifications.sms ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
             </div>
          </div>
        </div>

        {/* Data Saver */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Smartphone size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Data Usage</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
             <div>
               <span className="block font-medium text-slate-900">Data Saver Mode</span>
               <span className="text-sm text-slate-500">Reduce image quality to save mobile data.</span>
             </div>
             <button 
               onClick={() => handleAppChange('dataSaver', !localSettings.dataSaver)}
               className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${localSettings.dataSaver ? 'bg-green-500' : 'bg-slate-200'}`}
             >
               <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${localSettings.dataSaver ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden">
           <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Clear Local Data
                </h3>
                <p className="text-sm text-red-700 mt-1 max-w-sm">
                  This will permanently delete all report history, cached data, and pending uploads stored on this device.
                </p>
              </div>
              <button 
                onClick={() => setShowClearModal(true)}
                className="w-full md:w-auto px-4 py-3 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete All Data
              </button>
           </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">MzansiFix Storage</p>
          <p className="text-slate-500 text-sm mt-1">Using 1.2 MB of Local Storage</p>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-40 md:pb-20 max-w-2xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500 text-sm">Manage preferences and profile</p>
        </div>
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('app')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'app' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          App Prefs
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          My Profile
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'data' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Data & Privacy
        </button>
      </div>

      {activeTab === 'app' && renderAppTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'data' && renderDataTab()}

      {/* Floating Save Button - Only for Profile and App tabs */}
      {/* Position Update: Left aligned on mobile to avoid Chatbot (right), Centered on Desktop */}
      {activeTab !== 'data' && (
        <div className={`fixed bottom-24 left-4 right-auto md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:right-auto z-40 transition-transform duration-300 transform ${hasChanges ? 'translate-y-0' : 'translate-y-48'}`}>
           <button
             onClick={handleSave}
             className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-colors"
           >
             <Save size={20} />
             Save Changes
           </button>
        </div>
      )}

      {/* Clear Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Clear all data?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure? This will remove all your reports, settings, and pending uploads from this device. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowClearModal(false)}
                   className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                     if (onClearData) onClearData();
                     setShowClearModal(false);
                   }}
                   className="flex-1 py-3 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                 >
                   Yes, Clear
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Toast */}
      {showSavedToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in z-50">
          <Check size={18} />
          <span className="font-bold text-sm">Settings Saved</span>
        </div>
      )}
    </div>
  );
};
