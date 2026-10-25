import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  CloudSun,
  Droplets,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import { AuthUser } from '../types';

interface AuthLandingViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthLandingView: React.FC<AuthLandingViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        onLoginSuccess(res.user);
      } else {
        const res = await api.signup({ email, password, display_name: displayName });
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login({
        email: 'rajesh.patel@agrifarm.in',
        password: 'farmer123',
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">AgriGenius AI</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                  Smart Farming Agent
                </span>
              </div>
              <p className="text-xs text-stone-400">Autonomous Agricultural Decision Support Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Groq AI + Supabase Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Landing & Auth Card Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Hero Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Agriculture Assistant for Farmers & Plot Managers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Precision farming intelligence, tailored to <span className="text-emerald-400">your land & crops</span>.
          </h1>

          <p className="text-base text-stone-300 leading-relaxed max-w-xl">
            AgriGenius AI connects soil test records, real-time microclimate weather, crop phenological stages, and ICAR agricultural protocols to provide evidence-aware recommendations.
          </p>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <Droplets className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-white block">Precision Irrigation</strong>
                <p className="text-[11px] text-stone-400">ETo & Kc water deficit modeling</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-white block">Disease Doctor</strong>
                <p className="text-[11px] text-stone-400">Leaf symptoms & bio-control</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <CloudSun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-white block">Agro-Weather Window</strong>
                <p className="text-[11px] text-stone-400">Spray window & fungal alerts</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-white block">Mandi APMC Rates</strong>
                <p className="text-[11px] text-stone-400">Verified regional market prices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card Column */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Farmer Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              New Farmer Registration
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Welcome back, Farmer' : 'Register New Farmer Account'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {mode === 'login'
                ? 'Sign in with your email and password to access your farms.'
                : 'Create your account; we will collect your land details next.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Farmer Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with Database...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Farmer Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Option */}
          <div className="pt-2 border-t border-stone-800 text-center space-y-2">
            <span className="text-xs text-stone-400 block">Want to test immediately?</span>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Instant Demo Farmer Sign In (Rajesh Patel)
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-4 px-6 text-center text-xs text-stone-500">
        AgriGenius AI — Smart Farming Agent • Supabase Auth & PostgreSQL Storage Protected
      </footer>
    </div>
  );
};
