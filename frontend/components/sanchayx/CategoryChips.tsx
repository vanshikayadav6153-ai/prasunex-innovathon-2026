"use client";

import React, { useState } from 'react';
import { Layers, TrendingUp, Zap, PieChart, Landmark, Award, Shield } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Assets', icon: Layers },
  { id: 'stocks', label: 'Stocks & ETFs', icon: TrendingUp },
  { id: 'fno', label: 'Futures & Options', icon: Zap },
  { id: 'mutual_funds', label: 'Direct Mutual Funds', icon: PieChart },
  { id: 'money_market', label: 'Money Market & T-Bills', icon: Landmark },
  { id: 'sgb', label: 'Sovereign Gold SGB', icon: Award },
  { id: 'corporate_fd', label: 'Corporate FDs', icon: Shield },
];

export const CategoryChips: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedId, setSelectedId] = useState('all');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center justify-start md:justify-center gap-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border cursor-pointer select-none ${
                isActive
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : isDark
                  ? 'bg-[#111A2E] border-[#1F2A44] text-[#94A3B8] hover:text-white hover:border-slate-700'
                  : 'bg-white border-[#E5E9F0] text-[#64748B] hover:text-[#0F172A] hover:border-slate-300 shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
