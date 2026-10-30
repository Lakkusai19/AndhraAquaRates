import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { AnimatedPrawnsBackground } from '../components/ui/AnimatedPrawnsBackground';
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Waves,
  Sparkles,
  KeyRound,
  ShieldAlert,
  RotateCcw,
  X
} from 'lucide-react';

export const BuyerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setAuthSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password 6-digit verification flow
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: 6-Digit Code + New Pass, 3: Success
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [devOtpBadge, setDevOtpBadge] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login({ email, password });
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request 6-digit code to email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    try {
      const res = await authApi.requestPasswordResetCode(resetEmail);
      if (res.data.dev_code) {
        setDevOtpBadge(res.data.dev_code);
        setResetCode(res.data.dev_code); // Pre-fill in dev mode for convenience
      }
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Failed to dispatch verification code. Please check email address.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify 6-digit code and reset password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.');
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      setResetLoading(false);
      return;
    }

    try {
      const res = await authApi.verifyPasswordResetCode({
        email: resetEmail,
        code: resetCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Automatically authenticate session
      if (res.data.access && res.data.user) {
        setAuthSession(res.data.user, res.data.access, res.data.refresh);
      }

      setResetStep(3);
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Invalid or expired 6-digit verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AnimatedPrawnsBackground intensity="vibrant">
      <div className="flex-1 py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full backdrop-blur-2xl bg-slate-900/85 rounded-3xl border border-white/20 shadow-2xl shadow-sky-950/80 overflow-hidden relative z-20">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sky-900/60 via-slate-900/80 to-teal-900/60 p-6 sm:p-8 text-white text-center border-b border-white/10 relative">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-xl shadow-sky-500/30 mx-auto mb-3.5 hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/logo.png"
                alt="ANDHRA AQUA RATES Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              Buyer Portal Login
            </h1>
            <p className="text-xs text-sky-200/80 mt-1">
              Sign in to manage and publish your daily purchasing prices
            </p>

            {/* Quick Admin Portal Switch Link */}
            <div className="mt-3 inline-block">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-200 text-[11px] font-bold hover:bg-purple-900/90 transition-all hover:scale-105"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                Are you an Admin? Admin Portal Login →
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/70 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-200">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setResetStep(1);
                    setResetError(null);
                    setShowResetModal(true);
                  }}
                  className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-sky-400" />
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/70 text-white pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
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
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              Don't have a buyer account?{' '}
              <Link to="/register" className="font-bold text-sky-400 hover:underline">
                Register as a Buyer
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Forgot Password 6-Digit Code Verification Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-white/20 relative animate-in fade-in text-white">
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetError(null);
                setDevOtpBadge(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step 1: Request 6-Digit Code */}
            {resetStep === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Forgot Password?</h3>
                    <p className="text-[11px] text-slate-400">Step 1 of 2: Request 6-digit verification code</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered buyer email address. We will dispatch a <strong>6-digit verification code</strong> directly to your email.
                </p>

                {resetError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="buyer@domain.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 text-xs font-black hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {resetLoading ? 'Sending Code...' : 'Send 6-Digit Code'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Enter 6-Digit Code + New Password */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Verify 6-Digit Code</h3>
                    <p className="text-[11px] text-slate-400">Step 2 of 2: Enter code sent to {resetEmail}</p>
                  </div>
                </div>

                {devOtpBadge && (
                  <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-400/40 text-sky-200 text-[11px] flex items-center justify-between">
                    <span>⚡ Demo Test Code: <strong className="font-mono text-xs text-sky-300 tracking-wider">{devOtpBadge}</strong></span>
                    <span className="text-[10px] text-slate-400">(Auto-filled)</span>
                  </div>
                )}

                {resetError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{resetError}</span>
                  </div>
                )}

                {/* 6-Digit OTP Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-teal-500/40 bg-slate-950/90 text-teal-300 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Check your email inbox or spam</span>
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Resend Code
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || resetCode.length !== 6}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-xs font-black hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                  >
                    {resetLoading ? 'Verifying...' : 'Reset & Sign In'}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {resetStep === 3 && (
              <div className="text-center py-5 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Password Reset Successful!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your password has been securely updated. You are now logged in and can proceed to your buyer dashboard.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    navigate('/buyer/dashboard');
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black rounded-xl text-xs hover:brightness-110 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  Go to Buyer Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </AnimatedPrawnsBackground>
  );
};

