/**
 * SanchayX Fintech TypeScript Definitions
 */

export interface TickerItem {
  id: string;
  symbol: string;
  label: string;
  price: string;
  change: string;
  isPositive: boolean;
  category: 'equity' | 'commodity' | 'forex' | 'crypto' | 'bond';
}

export interface PersonaDemo {
  id: string;
  name: string;
  tag: string;
  description: string;
  aum: string;
  xirr: string;
  sharpe: string;
  beta: string;
  alpha: string;
  dematCount: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  pillText: string;
  pillVariant: 'success' | 'warning' | 'info' | 'neutral';
  tooltip?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  tag: string;
  tagColor: 'blue' | 'emerald' | 'amber' | 'purple';
}

export interface BacktestPoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  amount: string;
  percentage: string;
  color: string;
}

export interface FastTrackTopic {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  formula?: string;
  highlights: string[];
}
