"use client";

import React, { useState } from 'react';
const useRouter = () => ({
  push: (url: string) => {
    window.location.hash = url;
  },
});
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';
import { BRAND_CONFIG } from './theme';
import { useTheme } from './ThemeContext';

export const LoginCard: React.FC = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [userId, setUserId] = useState('PRIME-9821');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/terminal');
    }, 450);
  };

  const handleQuickDemo = (demoId: string) => {
    setUserId(demoId);
    setPassword('DemoPass2026!');
  };

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-7 transition-all duration-200 shadow-xl backdrop-blur-md ${
        isDark
          ? 'bg-[#111A2E]/95 border-[#1F2A44] shadow-black/40'
          : 'bg-white border-[#E5E9F0] shadow-slate-200/50'
      }`}
    >
      {/* Sign In / Open Account Tab Switcher */}
      <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('signin')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeTab === 'signin'
              ? isDark
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-white text-[#2563EB] shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('signup')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeTab === 'signup'
              ? isDark
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-white text-[#2563EB] shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Open Account
        </button>
      </div>

      {activeTab === 'signin' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="user-id-input"
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                User ID / Kite ID / PAN
              </label>
              <span className="text-[10px] text-blue-500 font-medium">Auto-detected</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="user-id-input"
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. PRIME-9821 or PAN"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDark
                    ? 'bg-[#0B1120] border-[#1F2A44] text-white placeholder-slate-600 focus:border-blue-500'
                    : 'bg-white border-[#E5E9F0] text-slate-900 placeholder-slate-400 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Password / 2FA Token
              </label>
              <a
                href="#forgot"
                className="text-[11px] font-medium text-[#2563EB] hover:underline"
              >
                Forgot?
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDark
                    ? 'bg-[#0B1120] border-[#1F2A44] text-white placeholder-slate-600 focus:border-blue-500'
                    : 'bg-white border-[#E5E9F0] text-slate-900 placeholder-slate-400 focus:border-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Remember user session
              </span>
            </label>

            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              2FA Biometric Sync
            </span>
          </div>

          {/* Full-width Blue Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Quantum Session...</span>
              </>
            ) : (
              <>
                <span>Login to Trading Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Autofill Helpers */}
          <div className="pt-2">
            <span className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Instant Quick Demo Fill:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Prime 50Cr', id: 'PRIME-9821' },
                { label: 'HNI 25L', id: 'HNI-7412' },
                { label: 'Sandbox 10L', id: 'SANDBOX-001' },
              ].map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickDemo(demo.id)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                    userId === demo.id
                      ? 'bg-blue-500/15 border-blue-500 text-blue-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
            <p className="font-bold mb-1">Instant Paper & Demat Account</p>
            <p className="text-[11px] leading-relaxed">
              Open your zero-brokerage Demat + Trading account in 5 minutes with Aadhaar DigiLocker e-KYC.
            </p>
          </div>

          <div>
            <label
              htmlFor="mobile-number-input"
              className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Mobile Number (Linked with Aadhaar)
            </label>
            <input
              id="mobile-number-input"
              type="tel"
              placeholder="+91 98765 43210"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                isDark
                  ? 'bg-[#0B1120] border-[#1F2A44] text-white placeholder-slate-600'
                  : 'bg-white border-[#E5E9F0] text-slate-900'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => router.push('/terminal')}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <span>Start Fast-Track Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Details */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">{BRAND_CONFIG.sebiRegistration.split('·')[0]}</span>
        </div>
        <span className="font-mono">{BRAND_CONFIG.version}</span>
      </div>
    </div>
  );
};
