"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SanchayXThemeProvider, useTheme } from '@/components/sanchayx/ThemeContext';
import { TerminalHeader } from '@/components/sanchayx/TerminalHeader';
import { TerminalTabs } from '@/components/sanchayx/TerminalTabs';
import { KpiRow1, StatRow2 } from '@/components/sanchayx/KpiCard';
import { PerformanceChartCard } from '@/components/sanchayx/ChartCard';
import { AllocationDonutCard } from '@/components/sanchayx/DonutCard';
import { OrderModal } from '@/components/sanchayx/OrderModal';
import { KPI_ROW_1, STAT_ROW_2, PERSONA_DEMOS } from '@/components/sanchayx/mockData';
import { BRAND_CONFIG } from '@/components/sanchayx/theme';
import { KpiMetric, StatItem } from '@/components/sanchayx/types';

function TerminalContent() {
  const searchParams = useSearchParams();
  const personaParam = searchParams.get('persona');
  const { isDark } = useTheme();

  const [activePersona, setActivePersona] = useState('PRIME-9821');
  const [kpiMetrics, setKpiMetrics] = useState<KpiMetric[]>(KPI_ROW_1);
  const [statMetrics, setStatMetrics] = useState<StatItem[]>(STAT_ROW_2);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Update metrics if a specific persona was clicked from the landing page
  useEffect(() => {
    if (personaParam) {
      const match = PERSONA_DEMOS.find((p) => p.id === personaParam);
      if (match) {
        setActivePersona(match.id === 'prime' ? 'PRIME-9821' : match.id === 'hni' ? 'HNI-7412' : 'SANDBOX-001');

        setKpiMetrics([
          {
            ...KPI_ROW_1[0],
            value: match.aum,
            pillText: `XIRR: ${match.xirr}`,
          },
          {
            ...KPI_ROW_1[1],
            value: match.sharpe,
          },
          {
            ...KPI_ROW_1[2],
            value: match.id === 'sandbox' ? '₹24,500.00' : match.id === 'hni' ? '₹68,200.00' : '₹1,34,34,000.00',
          },
          {
            ...KPI_ROW_1[3],
            value: `${match.beta} | ${match.alpha}`,
          },
        ]);

        setStatMetrics([
          {
            ...STAT_ROW_2[0],
            tag: `${match.dematCount} Scrips`,
          },
          STAT_ROW_2[1],
          STAT_ROW_2[2],
          STAT_ROW_2[3],
        ]);
      }
    }
  }, [personaParam]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0B1120]' : 'bg-[#F4F6FA]'}`}>
      {/* 1. Terminal Top Bar (Fixed Dark Navy in BOTH themes) */}
      <TerminalHeader activePersonaId={activePersona} />

      {/* 2. Main and Sub Navigation Bars */}
      <TerminalTabs
        onPlaceOrder={() => setIsOrderModalOpen(true)}
        onOpenOrderBook={() => setIsOrderModalOpen(true)}
      />

      {/* 3. Terminal Content Dashboard Grid */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Row 1: 4 Large KPI Cards */}
        <section aria-label="Key Performance Indicators">
          <KpiRow1 metrics={kpiMetrics} />
        </section>

        {/* Row 2: 4 Smaller Stat Cards */}
        <section aria-label="Account Capital and Margins">
          <StatRow2 stats={statMetrics} />
        </section>

        {/* Row 3: Charts Row (Wide Performance Chart + Donut Chart) */}
        <section aria-label="Visualizations and Analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Wide Area/Line Chart Card (~65% / 8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <PerformanceChartCard />
          </div>

          {/* Right: Asset Allocation Donut Card (~35% / 4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <AllocationDonutCard />
          </div>
        </section>
      </main>

      {/* Order Execution Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* Compact Terminal Footer */}
      <footer
        className={`w-full border-t py-3 px-6 mt-8 transition-colors duration-200 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2 ${
          isDark ? 'bg-[#0B1530] border-[#1F2A44] text-slate-400' : 'bg-white border-[#E5E9F0] text-slate-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            OMNE OMS Co-Location Gateway: CONNECTED (0.42 ms)
          </span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">Feed: TICK-BY-TICK STREAMING</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Server: MUM-BSE-COLO-04</span>
          <span>Session: ECDSA-256</span>
          <span className="font-bold text-blue-500">{BRAND_CONFIG.version}</span>
        </div>
      </footer>
    </div>
  );
}

export default function TerminalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1530] flex items-center justify-center text-white font-mono text-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="uppercase tracking-widest text-slate-400 font-bold">
              Connecting to High-Frequency Terminal...
            </p>
          </div>
        </div>
      }
    >
      <SanchayXThemeProvider>
        <TerminalContent />
      </SanchayXThemeProvider>
    </Suspense>
  );
}
