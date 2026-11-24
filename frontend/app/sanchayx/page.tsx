"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { SanchayXThemeProvider, useTheme } from '@/components/sanchayx/ThemeContext';
import { Navbar } from '@/components/sanchayx/Navbar';
import { TickerStrip } from '@/components/sanchayx/Ticker';
import { CategoryChips } from '@/components/sanchayx/CategoryChips';
import { FastTrackGuide } from '@/components/sanchayx/FastTrackGuide';
import { PersonaCards } from '@/components/sanchayx/PersonaCards';
import { LoginCard } from '@/components/sanchayx/LoginCard';
import { BRAND_CONFIG } from '@/components/sanchayx/theme';

function LandingPageContent() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0B1120]' : 'bg-[#F4F6FA]'}`}>
      {/* 1. Top Navbar */}
      <Navbar />

      {/* 2. Live Ticker Strip */}
      <TickerStrip />

      {/* 3. Category Filter Chips */}
      <CategoryChips />

      {/* 4. Two-Column Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (~60% / 7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all shadow-sm bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Zero Brokerage • Institutional MPT Engine • 100% Safe Sovereign Shield</span>
            </div>

            {/* Huge 2-Line Heading with Blue-to-Orange Gradient on 2nd Line */}
            <div className="space-y-1">
              <h1
                className={`text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.1] ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                Invest in everything.
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F97316] bg-clip-text text-transparent pb-1">
                Trade with mathematical edge.
              </h2>
            </div>

            {/* Short Description */}
            <p
              className={`text-sm sm:text-base leading-relaxed max-w-2xl font-normal ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Online multi-asset platform to invest in Indian Equities, US Tech Stocks, F&O Options,
              Direct Mutual Funds, Sovereign Gold Bonds, and Money Market Instruments with
              Nobel-prize winning Markowitz optimization.
            </p>

            {/* 3 Small Stat Boxes */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isDark ? 'bg-[#111A2E] border-[#1F2A44]' : 'bg-white border-[#E5E9F0] shadow-sm'
                }`}
              >
                <span className={`block text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  EQUITY DELIVERY
                </span>
                <span className="text-base sm:text-xl font-mono font-extrabold text-[#2563EB] dark:text-[#3B82F6]">
                  ₹0 Free
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isDark ? 'bg-[#111A2E] border-[#1F2A44]' : 'bg-white border-[#E5E9F0] shadow-sm'
                }`}
              >
                <span className={`block text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  F&O DERIVATIVES
                </span>
                <span className={`text-base sm:text-xl font-mono font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Flat ₹20
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isDark ? 'bg-[#111A2E] border-[#1F2A44]' : 'bg-white border-[#E5E9F0] shadow-sm'
                }`}
              >
                <span className={`block text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  VIRTUAL SANDBOX
                </span>
                <span className="text-base sm:text-xl font-mono font-extrabold text-[#F97316]">
                  ₹10,00,000
                </span>
              </div>
            </div>

            {/* Fast Track Guide Card */}
            <FastTrackGuide />

            {/* 3 Persona Cards */}
            <PersonaCards />
          </div>

          {/* Right Column (~40% / 5 cols) - Floating Login Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <LoginCard />

            {/* Quick Feature Checklist below card */}
            <div
              className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
                isDark ? 'bg-[#111A2E]/60 border-[#1F2A44] text-slate-300' : 'bg-white border-[#E5E9F0] text-slate-600 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>SEBI Regulated & Bank-Grade Security</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 pl-5.5">
                Funds are held in segregated client trust accounts with Scheduled Commercial Banks. 100% CDSL Demat custody with zero re-hypothecation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-6 px-4 sm:px-8 mt-12 transition-colors duration-200 ${
          isDark ? 'bg-[#0B1530] border-[#1F2A44] text-slate-400' : 'bg-white border-[#E5E9F0] text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold font-sans text-slate-800 dark:text-white">
              {BRAND_CONFIG.name}
            </span>
            <span>·</span>
            <span>{BRAND_CONFIG.sebiRegistration}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/terminal" className="text-[#2563EB] hover:underline font-semibold">
              Live Terminal Console →
            </Link>
            <span className="font-mono text-[11px]">{BRAND_CONFIG.version}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SanchayXLandingPage() {
  return (
    <SanchayXThemeProvider>
      <LandingPageContent />
    </SanchayXThemeProvider>
  );
}
