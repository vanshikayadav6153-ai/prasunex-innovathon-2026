"use client";

import React, { useState } from 'react';
import Link from './linkShim';
import {
  Search,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  User,
  Bell,
  Command,
  ArrowLeft,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BRAND_CONFIG } from './theme';

interface TerminalHeaderProps {
  onSearch?: (query: string) => void;
  activePersonaId?: string;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  onSearch,
  activePersonaId = 'PRIME-9821',
}) => {
  const [currency, setCurrency] = useState('INR (₹)');
  const [benchmark, setBenchmark] = useState('NIFTY 50');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full bg-[#0B1530] text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand + Terminal Badge + Quick Return */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/sanchayx"
            className="flex items-center gap-2 group pr-2 border-r border-slate-800"
            title="Return to Landing Page"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-md">
              <span className="text-white font-serif italic font-extrabold text-sm">SX</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  {BRAND_CONFIG.name}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider">
                  TERMINAL
                </span>
              </div>
            </div>
          </Link>

          {/* Two Live Index Mini-Cards */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-300">NIFTY 50</span>
              <span className="font-mono font-bold text-white text-xs">24,148.20</span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                <TrendingUp className="w-2.5 h-2.5" />
                +0.47%
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-300">SENSEX</span>
              <span className="font-mono font-bold text-white text-xs">79,402.29</span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                <TrendingUp className="w-2.5 h-2.5" />
                +0.42%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar with '/' Shortcut */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search contracts, equities, options, T-Bills, SGB (e.g. RELIANCE, NIFTY 24500 CE)..."
              className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-sans"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls: Dropdowns + Theme Toggle + User Avatar Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Currency Dropdown */}
          <div className="hidden md:flex items-center">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-900/90 text-slate-200 text-xs font-mono font-semibold py-1.5 px-2.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="INR (₹)">INR (₹)</option>
              <option value="USD ($)">USD ($)</option>
            </select>
          </div>

          {/* Benchmark Dropdown */}
          <div className="hidden lg:flex items-center">
            <select
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value)}
              className="bg-slate-900/90 text-slate-200 text-xs font-mono font-semibold py-1.5 px-2.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="NIFTY 50">BM: NIFTY 50</option>
              <option value="SENSEX">BM: SENSEX</option>
              <option value="BANKNIFTY">BM: BANKNIFTY</option>
            </select>
          </div>

          {/* Theme Toggle (supports Light/Dark mode with toggle) */}
          <ThemeToggle variant="terminal" />

          {/* Help Button */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="System Documentation & Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-slate-200 text-[11px]">
                {activePersonaId}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
