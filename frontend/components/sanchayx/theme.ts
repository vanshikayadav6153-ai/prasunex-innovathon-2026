/**
 * SanchayX Fintech Design Tokens & Theme Configuration
 * Supports full Light and Dark modes with smooth transitions.
 */

export const THEME_COLORS = {
  light: {
    // Backgrounds
    pageBg: '#F4F6FA',
    cardBg: '#FFFFFF',
    cardBgSubtle: '#F8FAFC',
    terminalHeaderBg: '#0B1530', // Fixed dark navy in BOTH themes
    inputBg: '#FFFFFF',
    tickerBg: '#EDF2F7',

    // Borders & Shadows
    border: '#E5E9F0',
    borderLight: '#EEF2F6',
    borderFocus: '#2563EB',
    cardShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
    radiusCard: '14px',

    // Typography
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Accents
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    secondary: '#F97316',
    secondaryHover: '#EA580C',
    accentPurple: '#7C3AED',

    // Financial Indicators
    positive: '#16A34A', // Green
    positiveBg: '#DCFCE7',
    positiveText: '#15803D',
    negative: '#DC2626', // Red
    negativeBg: '#FEE2E2',
    negativeText: '#B91C1C',

    // Chart Colors
    chartPortfolio: '#F97316',
    chartBenchmark: '#64748B',
    chartFillGradientStart: 'rgba(249, 115, 22, 0.25)',
    chartFillGradientEnd: 'rgba(249, 115, 22, 0.00)',
    chartGrid: '#E2E8F0',
    tooltipBg: '#0F172A',
    tooltipText: '#FFFFFF',
  },
  dark: {
    // Backgrounds
    pageBg: '#0B1120',
    cardBg: '#111A2E',
    cardBgSubtle: '#0F172A',
    terminalHeaderBg: '#0B1530', // Fixed dark navy in BOTH themes
    inputBg: '#0B1120',
    tickerBg: '#0E172B',

    // Borders & Shadows
    border: '#1F2A44',
    borderLight: '#182238',
    borderFocus: '#3B82F6',
    cardShadow: 'none',
    radiusCard: '12px',

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Accents
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#F97316',
    secondaryHover: '#FB923C',
    accentPurple: '#8B5CF6',

    // Financial Indicators
    positive: '#22C55E', // Bright Green
    positiveBg: 'rgba(34, 197, 94, 0.15)',
    positiveText: '#4ADE80',
    negative: '#F43F5E', // Bright Red
    negativeBg: 'rgba(244, 63, 94, 0.15)',
    negativeText: '#FB7185',

    // Chart Colors
    chartPortfolio: '#F97316',
    chartBenchmark: '#475569',
    chartFillGradientStart: 'rgba(249, 115, 22, 0.35)',
    chartFillGradientEnd: 'rgba(249, 115, 22, 0.00)',
    chartGrid: '#1E293B',
    tooltipBg: '#1E293B',
    tooltipText: '#F8FAFC',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export const BRAND_CONFIG = {
  name: 'SanchayX',
  shortCode: 'SX',
  badge: 'DIRECT OS',
  tagline: 'Quant Investing, Simplified',
  subtitle: 'One Engine. Institutional Edge. Better Alpha.',
  sebiRegistration: 'SEBI Reg. INZ000293431 · Member NSE/BSE/MCX · DP: CDSL-IN-DP-582-2021',
  version: 'v2.4.0 (Prod)',
};
