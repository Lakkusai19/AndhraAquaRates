import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedPrawnsBackground } from '../components/ui/AnimatedPrawnsBackground';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN' || (user as any).is_staff) {
        navigate('/admin');
      } else {
        setError('Access denied. This account does not possess administrator credentials.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Authentication failed. Invalid administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPrawnsBackground intensity="vibrant">
      <div className="flex-1 py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full backdrop-blur-2xl bg-slate-950/90 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-950/80 overflow-hidden relative z-20">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 sm:p-8 text-white text-center border-b border-purple-500/20 relative">
            <Link
              to="/"
              className="absolute left-4 top-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-3 mx-auto mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 to-teal-300 shadow-xl shadow-sky-500/25 shrink-0">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30 shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold tracking-wide uppercase mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Restricted Operations
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              Admin Master Portal
            </h1>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xs mx-auto">
              Superuser access to manage all buyers, price sheets, password resets, and system security
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-purple-500/30 bg-slate-900/90 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Admin Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-purple-500/30 bg-slate-900/90 text-white pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white font-black rounded-xl text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying Superuser...' : 'Authenticate & Enter Admin Console'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center flex items-center justify-between text-xs text-slate-400">
              <Link to="/login" className="text-sky-400 hover:underline">
                ← Buyer Login
              </Link>
              <Link to="/" className="text-slate-400 hover:text-white">
                Public Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AnimatedPrawnsBackground>
  );
};
