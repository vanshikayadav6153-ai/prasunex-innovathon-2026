"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'navbar' | 'terminal';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'navbar' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'terminal') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme mode"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
        isDark
          ? 'bg-[#111A2E] border-[#1F2A44] text-[#E2E8F0] hover:border-slate-600 hover:bg-[#18233C]'
          : 'bg-white border-[#E5E9F0] text-[#0F172A] hover:border-slate-300 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-slate-200">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px] font-semibold text-slate-700">Dark</span>
        </>
      )}
    </button>
  );
};
