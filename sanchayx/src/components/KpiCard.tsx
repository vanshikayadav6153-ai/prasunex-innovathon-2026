"use client";

import React from 'react';
import {
  Wallet,
  TrendingUp,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Info,
  Layers,
  DollarSign,
  Landmark,
  Lock,
} from 'lucide-react';
import { KpiMetric, StatItem } from './types';
import { useTheme } from './ThemeContext';

interface KpiRowProps {
  metrics: KpiMetric[];
}

export const KpiRow1: React.FC<KpiRowProps> = ({ metrics }) => {
  const { isDark } = useTheme();

  const getIcon = (id: string) => {
    switch (id) {
      case 'net_worth':
        return <Wallet className="w-4 h-4 text-blue-500" />;
      case 'sharpe':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'var':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'beta_alpha':
        return <Percent className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPillClasses = (variant: KpiMetric['pillVariant']) => {
    switch (variant) {
      case 'success':
        return isDark
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return isDark
          ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return isDark
          ? 'bg-blue-950/60 text-blue-400 border-blue-800/80'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return isDark
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map((kpi) => (
        <div
          key={kpi.id}
          className={`rounded-2xl border p-4.5 sm:p-5 transition-all duration-200 ${
            isDark
              ? 'bg-[#111A2E] border-[#1F2A44] shadow-none hover:border-slate-700'
              : 'bg-white border-[#E5E9F0] shadow-sm hover:border-slate-300'
          }`}
        >
          {/* Header Label with Icon */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              {getIcon(kpi.id)}
              <span className={`text-[11px] font-mono font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {kpi.label}
              </span>
            </div>

            <div
              title={kpi.tooltip}
              className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Big Monospace Number */}
          <div className="my-1.5">
            <div
              className={`text-xl sm:text-2xl font-mono font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              {kpi.value}
            </div>
          </div>

          {/* Footer Line with Status Pill */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <span className={`text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {kpi.subValue}
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${getPillClasses(
                kpi.pillVariant
              )}`}
            >
              {kpi.pillText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface StatRowProps {
  stats: StatItem[];
}

export const StatRow2: React.FC<StatRowProps> = ({ stats }) => {
  const { isDark } = useTheme();

  const getTagColor = (color: StatItem['tagColor']) => {
    switch (color) {
      case 'blue':
        return isDark
          ? 'bg-blue-950/60 text-blue-400 border-blue-800'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'emerald':
        return isDark
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return isDark
          ? 'bg-amber-950/60 text-amber-400 border-amber-800'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'purple':
        return isDark
          ? 'bg-purple-950/60 text-purple-400 border-purple-800'
          : 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatIcon = (id: string) => {
    switch (id) {
      case 'holdings':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'margin':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'sweep':
        return <Landmark className="w-3.5 h-3.5 text-amber-500" />;
      case 'pledged':
        return <Lock className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`rounded-xl border p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 ${
            isDark
              ? 'bg-[#111A2E] border-[#1F2A44] shadow-none hover:border-slate-700'
              : 'bg-white border-[#E5E9F0] shadow-sm hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {getStatIcon(stat.id)}
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {stat.label}
              </span>
            </div>

            <div className={`text-base sm:text-lg font-mono font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              {stat.value}
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${getTagColor(
              stat.tagColor
            )}`}
          >
            {stat.tag}
          </span>
        </div>
      ))}
    </div>
  );
};
