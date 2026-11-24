"use client";

import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { FAST_TRACK_TOPICS } from './mockData';
import { useTheme } from './ThemeContext';

export const FastTrackGuide: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState(FAST_TRACK_TOPICS[0].id);

  const current = FAST_TRACK_TOPICS.find((t) => t.id === activeTab) || FAST_TRACK_TOPICS[0];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 shadow-sm ${
        isDark
          ? 'bg-[#111A2E] border-[#1F2A44] shadow-none'
          : 'bg-white border-[#E5E9F0] shadow-sm'
      }`}
    >
      {/* Header and Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Institutional Knowledge Base
              </span>
            </div>
            <h3 className={`text-sm font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              NEW TO QUANT TRADING? FAST TRACK GUIDE
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click a module below to inspect algorithmic mechanics & risk management
            </p>
          </div>
        </div>

        {/* 3 Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
          {FAST_TRACK_TOPICS.map((topic) => {
            const isSelected = activeTab === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTab(topic.id)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-white text-[#2563EB] shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {topic.tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description Content */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {current.title}
          </h4>
          {current.formula && (
            <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 overflow-x-auto">
              <code>{current.formula}</code>
            </div>
          )}
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {current.description}
        </p>

        {/* Highlights List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {current.highlights.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[11px] font-medium leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
