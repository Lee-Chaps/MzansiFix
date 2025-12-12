
import React from 'react';
import { Camera, Mic, MapPin, ShieldAlert, ArrowRight, CheckCircle, Building2, Zap, Users } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-400 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black rounded-full blur-[100px] opacity-5 pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in z-10 max-w-4xl mx-auto w-full">
        
        {/* Brand Icon */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300 ring-4 ring-yellow-500/20">
           <ShieldAlert size={56} className="text-yellow-500" strokeWidth={2} />
        </div>

        {/* Title & Slogan */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          Mzansi<span className="text-yellow-600">Fix</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 font-bold italic mb-8 max-w-lg leading-relaxed">
          "Your Voice. Your Community. <span className="text-yellow-600 border-b-4 border-yellow-200">Fixed.</span>"
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4 mb-12 animate-slide-up">
          <button 
            onClick={onSignup}
            className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] group"
          >
            Get Started
            <ArrowRight size={20} className="text-yellow-500 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={onLogin}
            className="w-full py-4 bg-white text-slate-800 font-bold text-lg rounded-2xl border-2 border-slate-100 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all transform active:scale-[0.98]"
          >
            Log In
          </button>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-blue-600">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Snap & Solve</h3>
            <p className="text-sm text-slate-500 mt-1">Take a photo, and our AI identifies the issue instantly.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-green-600">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Direct Routing</h3>
            <p className="text-sm text-slate-500 mt-1">We send reports to Eskom, JRA, or Joburg Water automatically.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-purple-600">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Community Power</h3>
            <p className="text-sm text-slate-500 mt-1">Track progress and help improve your local ward together.</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 text-center mt-auto bg-white/60 backdrop-blur-md border-t border-slate-200 z-10">
        <p className="text-xs md:text-sm text-slate-600 font-medium italic mb-2">
          "Empowering South Africans to improve service delivery."
        </p>
        <div className="flex items-center justify-center gap-2 opacity-60">
           <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Powered by AI • Developed in South Africa
          </span>
        </div>
      </div>
    </div>
  );
};
