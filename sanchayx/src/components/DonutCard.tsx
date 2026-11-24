"use client";

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  ALLOCATIONS_BY_ASSET,
  ALLOCATIONS_BY_GEOGRAPHY,
  ALLOCATIONS_BY_RISK,
} from './mockData';
import { AllocationItem } from './types';
import { useTheme } from './ThemeContext';

type AllocationCategory = 'asset' | 'geography' | 'risk';

export const AllocationDonutCard: React.FC = () => {
  const { isDark } = useTheme();
  const [category, setCategory] = useState<AllocationCategory>('asset');

  const getData = (): AllocationItem[] => {
    switch (category) {
      case 'geography':
        return ALLOCATIONS_BY_GEOGRAPHY;
      case 'risk':
        return ALLOCATIONS_BY_RISK;
      default:
        return ALLOCATIONS_BY_ASSET;
    }
  };

  const currentData = getData();

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between ${
        isDark ? 'bg-[#111A2E] border-[#1F2A44] shadow-none' : 'bg-white border-[#E5E9F0] shadow-sm'
      }`}
    >
      {/* Header and Toggle Tabs */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Multi-Asset Breakdown
          </span>
          <span className="text-[10px] font-mono text-slate-400">Markowitz Weights</span>
        </div>

        <h3 className={`text-base font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          ASSET ALLOCATION BREAKDOWN
        </h3>

        {/* 3 Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-3">
          {[
            { id: 'asset', label: 'By Asset Class' },
            { id: 'geography', label: 'By Geography' },
            { id: 'risk', label: 'By Risk Tier' },
          ].map((tab) => {
            const isActive = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id as AllocationCategory)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer text-center ${
                  isActive
                    ? isDark
                      ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                      : 'bg-white text-[#2563EB] shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Donut Chart Visualization with Center Label */}
      <div className="relative w-full h-[180px] sm:h-[190px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as AllocationItem;
                  return (
                    <div
                      className={`p-2.5 rounded-xl border text-xs shadow-xl font-mono ${
                        isDark ? 'bg-[#0B1530] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center gap-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Weight: <strong className="text-white font-bold">{item.percentage}</strong> ({item.amount})
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {currentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#111A2E' : '#FFFFFF'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Total AUM
          </span>
          <span className={`text-base font-mono font-extrabold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            ₹50.08 Cr
          </span>
          <span className="text-[9px] font-mono text-emerald-500 font-bold">100.0% Deployed</span>
        </div>
      </div>

      {/* Legend List showing colored dots, labels, amounts and percentages */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
        {currentData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-1 rounded transition-colors"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-[11px] font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {item.amount}
              </span>
              <span className="w-12 text-right font-bold text-slate-400">
                {item.percentage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
