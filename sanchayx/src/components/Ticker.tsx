"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { INITIAL_TICKERS } from './mockData';
import { TickerItem } from './types';
import { useTheme } from './ThemeContext';

export const TickerStrip: React.FC = () => {
  const { isDark } = useTheme();
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [isRotating, setIsRotating] = useState(false);

  // Simulate live price ticks every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), 600);

      setTickers((prev) =>
        prev.map((item) => {
          // 40% chance of ticking this item
          if (Math.random() > 0.4) return item;

          const rawNumber = parseFloat(item.price.replace(/[^0-9.-]/g, ''));
          const deltaPercent = (Math.random() * 0.16 - 0.08); // small fluctuation
          const newNumber = rawNumber * (1 + deltaPercent / 100);
          const isUp = deltaPercent >= 0;

          let formattedPrice = item.price;
          if (item.price.startsWith('₹')) {
            formattedPrice = `₹${newNumber.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          } else if (item.price.startsWith('$')) {
            formattedPrice = `$${newNumber.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          } else if (item.price.endsWith('%')) {
            formattedPrice = `${newNumber.toFixed(2)}%`;
          }

          const rawChange = parseFloat(item.change.replace(/[^0-9.-]/g, ''));
          const newChangeVal = rawChange + (isUp ? 0.02 : -0.02);
          const formattedChange = `${newChangeVal >= 0 ? '+' : ''}${newChangeVal.toFixed(2)}%`;

          return {
            ...item,
            price: formattedPrice,
            change: formattedChange,
            isPositive: newChangeVal >= 0,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full border-b py-2.5 px-4 overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-[#0E172B] border-[#1F2A44]' : 'bg-[#EDF2F7] border-[#E5E9F0]'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Left Fixed Status Pills */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-300 dark:border-slate-800">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>NSE/BSE: CLOSED</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>NYSE: CLOSED</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>CRYPTO 24/7</span>
          </div>

          <button
            type="button"
            title="Live Tick Synchronized"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>

        {/* Marquee Ticker Container */}
        <div className="relative flex-1 overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)]">
          <div className="flex items-center gap-3 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
            {tickers.concat(tickers).map((ticker, index) => (
              <div
                key={`${ticker.id}-${index}`}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all duration-200 shadow-sm shrink-0 ${
                  isDark
                    ? 'bg-[#111A2E] border-[#1F2A44] hover:border-slate-700'
                    : 'bg-white border-[#E5E9F0] hover:border-slate-300'
                }`}
              >
                <span className={`text-[11px] font-bold tracking-tight font-sans ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  {ticker.symbol}
                </span>

                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {ticker.price}
                </span>

                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    ticker.isPositive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {ticker.isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  {ticker.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
