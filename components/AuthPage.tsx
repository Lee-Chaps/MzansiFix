import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/firebase';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("All fields are required.");
        }
        
        // Register via Firebase
        const user = await registerUser(formData.name, formData.email, formData.password);
        onSuccess(user);
        
      } else {
        if (!formData.email || !formData.password) {
          throw new Error("Please enter email and password.");
        }

        // Login via Firebase
        const user = await loginUser(formData.email, formData.password);
        onSuccess(user);
      }
    } catch (err: any) {
      // Firebase config warning check
      if (err.message && err.message.includes("configuration")) {
         setError("Firebase not configured. Please add your API keys in services/firebase.ts");
      } else {
         setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden animate-fade-in">
      {/* Background Blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-300 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* Nav */}
      <div className="p-6 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500">
              {mode === 'login' 
                ? 'Enter your credentials to access your reports.' 
                : 'Join the community improving South Africa.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                    placeholder="e.g. Thabo Molefe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  placeholder="name@example.co.za"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Log In' : 'Sign Up'}
                  <ArrowRight size={18} className="text-yellow-500" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="font-bold text-slate-900 hover:text-yellow-600 transition-colors underline decoration-yellow-500 underline-offset-2"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
