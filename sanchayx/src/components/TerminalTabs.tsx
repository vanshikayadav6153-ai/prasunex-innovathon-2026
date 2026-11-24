"use client";

import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  ShieldCheck,
  Zap,
  Repeat,
  Globe,
  PlusCircle,
  BookOpen,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface TerminalTabsProps {
  onPlaceOrder?: () => void;
  onOpenOrderBook?: () => void;
}

export const TerminalTabs: React.FC<TerminalTabsProps> = ({
  onPlaceOrder,
  onOpenOrderBook,
}) => {
  const { isDark } = useTheme();

  const [activeMainTab, setActiveMainTab] = useState('portfolio');
  const [activeSubTab, setActiveSubTab] = useState('console');

  return (
    <div
      className={`w-full border-b transition-colors duration-200 select-none ${
        isDark ? 'bg-[#0E172B] border-[#1F2A44]' : 'bg-white border-[#E5E9F0]'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6">
        {/* Row 1: Primary Main Tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none pt-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {/* Portfolio (Active with Orange Underline) */}
            <button
              type="button"
              onClick={() => setActiveMainTab('portfolio')}
              className={`relative px-3.5 py-2.5 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'portfolio'
                  ? 'text-[#F97316] font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Portfolio</span>
              {activeMainTab === 'portfolio' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>

            {/* Stocks & Allocation */}
            <button
              type="button"
              onClick={() => setActiveMainTab('stocks')}
              className={`relative px-3.5 py-2.5 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'stocks'
                  ? 'text-[#F97316] font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stocks & Allocation</span>
              {activeMainTab === 'stocks' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>

            {/* Highlighted Gradient Orange Pill Button: Smart Investment Option */}
            <button
              type="button"
              onClick={() => setActiveMainTab('smart')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-105 active:scale-95 transition-all shadow-sm shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-white" />
              <span>Smart Investment Option</span>
            </button>

            {/* Highlighted Green Pill Button: 100% Safe Investment */}
            <button
              type="button"
              onClick={() => setActiveMainTab('safe')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Safe Investment</span>
            </button>

            {/* Mutual Funds & MPT */}
            <button
              type="button"
              onClick={() => setActiveMainTab('mf')}
              className={`relative px-3.5 py-2.5 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'mf'
                  ? 'text-[#F97316] font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mutual Funds & MPT</span>
              {activeMainTab === 'mf' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>

            {/* Rebalance & Backtest */}
            <button
              type="button"
              onClick={() => setActiveMainTab('rebalance')}
              className={`relative px-3.5 py-2.5 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'rebalance'
                  ? 'text-[#F97316] font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Rebalance & Backtest</span>
              {activeMainTab === 'rebalance' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>

            {/* Indian Markets */}
            <button
              type="button"
              onClick={() => setActiveMainTab('markets')}
              className={`relative px-3.5 py-2.5 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'markets'
                  ? 'text-[#F97316] font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Indian Markets</span>
              {activeMainTab === 'markets' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Navigation Bar */}
        <div className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-800/80">
          {/* Left Segmented Sub Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
            {[
              { id: 'console', label: 'Trading Console' },
              { id: 'debt_demat', label: 'Debt & Demat' },
              { id: 'primary', label: 'Primary Markets' },
              { id: 'reports', label: 'Taxation & Reports' },
            ].map((sub) => {
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Right Grouped Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* + Place Order Solid Blue Button */}
            <button
              type="button"
              onClick={onPlaceOrder}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 transition-all shadow-sm shadow-blue-500/25 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Place Order</span>
            </button>

            {/* Order Book */}
            <button
              type="button"
              onClick={onOpenOrderBook}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Order Book (3)</span>
            </button>

            {/* Trade Book */}
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Trade Book</span>
            </button>

            {/* Open Positions */}
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700/80 text-emerald-400 border-emerald-900/60 hover:bg-emerald-950/20'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Open Positions (5)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
