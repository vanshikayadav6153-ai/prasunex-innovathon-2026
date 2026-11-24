"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BRAND_CONFIG } from './theme';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  onLoginClick?: () => void;
  onSandboxClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onSandboxClick }) => {
  const { isDark } = useTheme();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b backdrop-blur-md ${
        isDark ? 'bg-[#0B1120]/90 border-[#1F2A44]' : 'bg-white/95 border-[#E5E9F0]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <Link href="/sanchayx" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] via-[#6366F1] to-[#7C3AED] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-serif italic font-extrabold text-xl tracking-tight">SX</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {BRAND_CONFIG.name}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wider ${
                  isDark
                    ? 'bg-blue-950/60 text-blue-400 border-blue-800/80'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }`}
              >
                {BRAND_CONFIG.badge}
              </span>
            </div>
            <span className={`text-[11px] font-medium leading-none ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {BRAND_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {['Sign Up', 'About', 'Products', 'Pricing', 'Support & FAQs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/[^a-z]/g, '')}`}
              className={`text-xs font-semibold tracking-wide transition-colors duration-150 ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {/* Instant Sandbox Outlined Button */}
          <Link
            href="/terminal"
            onClick={onSandboxClick}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm ${
              isDark
                ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50 hover:border-purple-600'
                : 'bg-purple-50/80 border-purple-200 text-[#7C3AED] hover:bg-purple-100 hover:border-purple-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin-slow" />
            <span>Instant Sandbox</span>
          </Link>

          {/* Solid Blue Client Login Button */}
          <Link
            href="/terminal"
            onClick={onLoginClick}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 transition-all duration-150 shadow-md shadow-blue-500/25"
          >
            <User className="w-3.5 h-3.5" />
            <span>Client Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
