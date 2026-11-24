"use client";

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Calendar, Info, Layers } from 'lucide-react';
import { BACKTEST_DATA } from './mockData';
import { useTheme } from './ThemeContext';

type TimeRange = '1M' | '6M' | '1Y' | '5Y' | 'Max';

export const PerformanceChartCard: React.FC = () => {
  const { isDark } = useTheme();
  const [range, setRange] = useState<TimeRange>('1Y');

  const data = BACKTEST_DATA[range];

  // Colors from theme
  const portfolioColor = '#F97316'; // Orange
  const benchmarkColor = isDark ? '#64748B' : '#94A3B8'; // Dashed grey
  const gridColor = isDark ? '#1E293B' : '#E2E8F0';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between ${
        isDark ? 'bg-[#111A2E] border-[#1F2A44] shadow-none' : 'bg-white border-[#E5E9F0] shadow-sm'
      }`}
    >
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Deterministic Backtest
            </span>
            <span className="text-[10px] font-mono text-slate-400">Markowitz Efficient Frontier</span>
          </div>
          <h3 className={`text-base font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            PORTFOLIO GROWTH VS BENCHMARK
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Normalized performance index (Base = 100) vs NIFTY 50 Total Return
          </p>
        </div>

        {/* 1M / 6M / 1Y / 5Y / Max Range Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {(['1M', '6M', '1Y', '5Y', 'Max'] as TimeRange[]).map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sanchayxOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={portfolioColor} stopOpacity={isDark ? 0.45 : 0.28} />
                <stop offset="95%" stopColor={portfolioColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="date"
              stroke={isDark ? '#64748B' : '#94A3B8'}
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />

            <YAxis
              stroke={isDark ? '#64748B' : '#94A3B8'}
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(v) => `${v.toFixed(0)}`}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const portVal = payload[0]?.value as number;
                  const benchVal = payload[1]?.value as number;
                  const spread = (portVal - benchVal).toFixed(2);
                  const isOutperforming = portVal >= benchVal;

                  return (
                    <div
                      className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isDark ? 'bg-[#0B1530]/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="font-mono font-bold text-[11px] mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        {label}
                      </div>

                      <div className="space-y-1 font-mono">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                            Portfolio:
                          </span>
                          <span className="font-bold text-[#F97316]">{portVal?.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            NIFTY 50:
                          </span>
                          <span className="font-bold text-slate-400">{benchVal?.toFixed(2)}</span>
                        </div>

                        <div className="pt-1.5 mt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Alpha Spread:</span>
                          <span
                            className={`font-bold ${
                              isOutperforming ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isOutperforming ? `+${spread}` : spread}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Portfolio Area Fill + Solid Orange Line */}
            <Area
              type="monotone"
              dataKey="portfolio"
              name="SanchayX Portfolio"
              stroke={portfolioColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#sanchayxOrangeGrad)"
            />

            {/* Dashed Benchmark Line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              name="NIFTY 50 Benchmark"
              stroke={benchmarkColor}
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats Line */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#F97316] rounded" />
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Quant Portfolio: <strong className="font-mono text-orange-500">+14.8% (1Y)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-slate-400 rounded border-b border-dashed" />
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              NIFTY 50 TR: <strong className="font-mono text-slate-400">+1.4% (1Y)</strong>
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Alpha vs NIFTY: +13.4% Outperformance
        </span>
      </div>
    </div>
  );
};
