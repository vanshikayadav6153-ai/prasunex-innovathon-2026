import { TickerItem, PersonaDemo, KpiMetric, StatItem, BacktestPoint, AllocationItem, FastTrackTopic } from './types';

export const INITIAL_TICKERS: TickerItem[] = [
  { id: '1', symbol: 'SILVER 1KG', label: 'SILVER 1KG', price: '₹84,200.00', change: '+0.74%', isPositive: true, category: 'commodity' },
  { id: '2', symbol: 'CRUDE OIL', label: 'CRUDE OIL BBL', price: '₹6,420.00', change: '-0.45%', isPositive: false, category: 'commodity' },
  { id: '3', symbol: 'USD/INR', label: 'USD/INR SPOT', price: '₹83.92', change: '+0.05%', isPositive: true, category: 'forex' },
  { id: '4', symbol: 'SGB-GOLD', label: 'SGB 2031-IX', price: '₹7,654.00', change: '+0.85%', isPositive: true, category: 'bond' },
  { id: '5', symbol: 'IN10Y', label: 'GOI 10Y BENCHMARK', price: '6.98%', change: '-0.02%', isPositive: true, category: 'bond' },
  { id: '6', symbol: 'NIFTY 50', label: 'NIFTY 50 INDEX', price: '24,148.20', change: '+0.42%', isPositive: true, category: 'equity' },
  { id: '7', symbol: 'SENSEX', label: 'BSE SENSEX 30', price: '79,402.29', change: '+0.38%', isPositive: true, category: 'equity' },
  { id: '8', symbol: 'BTC/USD', label: 'BITCOIN SPOT', price: '$98,420.00', change: '+2.15%', isPositive: true, category: 'crypto' },
  { id: '9', symbol: 'BANKNIFTY', label: 'NIFTY BANK', price: '52,180.40', change: '+0.61%', isPositive: true, category: 'equity' },
  { id: '10', symbol: 'NASDAQ 100', label: 'US TECH 100', price: '20,890.15', change: '+1.12%', isPositive: true, category: 'equity' },
];

export const ASSET_CATEGORIES = [
  { id: 'all', label: 'All Assets', count: '1,420' },
  { id: 'stocks', label: 'Stocks & ETFs', count: '520' },
  { id: 'fno', label: 'Futures & Options', count: '280' },
  { id: 'mutual_funds', label: 'Direct Mutual Funds', count: '310' },
  { id: 'money_market', label: 'Money Market & T-Bills', count: '145' },
  { id: 'sgb', label: 'Sovereign Gold SGB', count: '48' },
  { id: 'corporate_fd', label: 'Corporate FDs', count: '117' },
];

export const FAST_TRACK_TOPICS: FastTrackTopic[] = [
  {
    id: 'mpt',
    tabLabel: '1. MPT Theory',
    title: 'Nobel Prize Winning Markowitz Modern Portfolio Theory',
    description:
      'MPT mathematically solves for the optimal asset allocation on the Efficient Frontier, maximizing expected portfolio return E(R) for a given target level of risk covariance matrix Σ.',
    formula: 'max wᵀμ - (λ/2) wᵀΣw  subject to  ∑wᵢ = 1, wᵢ ≥ 0',
    highlights: [
      'Eliminates unsystematic risk via low-correlation asset pairing',
      'Continuous quadratic optimizer re-calibrated every 15 minutes',
      'Multi-asset hedging across Equities, Sovereign Gold, and T-Bills',
    ],
  },
  {
    id: 'safe',
    tabLabel: '2. 100% Safe Shield',
    title: 'Zero-Credit-Risk Sovereign Capital Preservation',
    description:
      'Direct primary custody in Reserve Bank of India (RBI) Treasury Bills, Sovereign Gold Bonds, and Scheduled Commercial Bank Sweep FDs with full DICGC coverage.',
    formula: 'Shield_Coverage = 100% Sovereign (RBI) + Scheduled Bank Sweeps',
    highlights: [
      'Auto-sweep liquidity earning up to 7.10% p.a. without lock-ins',
      'Sovereign Gold Bonds with 2.50% semi-annual interest payout',
      'Zero counterparty default risk on unencumbered margin capital',
    ],
  },
  {
    id: 'backtest',
    tabLabel: '3. F&O Backtest',
    title: 'Algorithmic Options & Volatility Hedge Engine',
    description:
      'Execute institutional delta-neutral iron condors, calendar spreads, and dynamic gamma scalping with sub-millisecond execution rules and real-time Greeks audit.',
    formula: 'Δ_net = ∑ (wᵢ · Δᵢ) ≈ 0.00,  Sharpe = (Rₚ - R_f) / σₚ ≥ 1.0',
    highlights: [
      'Flat ₹20 per executed F&O order with zero hidden platform charges',
      'Live Greeks display (Delta, Gamma, Theta, Vega) per option strike',
      'Automated stop-loss triggers backed by exchange co-located feeds',
    ],
  },
];

export const PERSONA_DEMOS: PersonaDemo[] = [
  {
    id: 'prime',
    name: 'Institutional Prime',
    tag: 'AUM ₹50 Cr+',
    description: 'Pre-loaded multi-asset quant portfolio, algorithmic hedges, sovereign sweeps & Markowitz weights.',
    aum: '₹50,08,42,150.00',
    xirr: '+16.8%',
    sharpe: '1.04',
    beta: '0.02',
    alpha: '+11.61%',
    dematCount: 42,
  },
  {
    id: 'hni',
    name: 'Retail HNI Investor',
    tag: 'AUM ₹25 L',
    description: 'Active swing trading setup, auto-sweep FD optimization, SGB bond ladder, and equity delivery.',
    aum: '₹25,40,000.00',
    xirr: '+14.2%',
    sharpe: '0.94',
    beta: '0.68',
    alpha: '+4.20%',
    dematCount: 18,
  },
  {
    id: 'sandbox',
    name: 'Beginner Sandbox',
    tag: 'Paper ₹10 L',
    description: 'Risk-free simulated virtual capital environment to test strategies against live tick feeds.',
    aum: '₹10,00,000.00',
    xirr: '+8.4%',
    sharpe: '0.78',
    beta: '1.00',
    alpha: '+0.50%',
    dematCount: 5,
  },
];

export const KPI_ROW_1: KpiMetric[] = [
  {
    id: 'net_worth',
    label: 'DYNAMIC NET WORTH (INR)',
    value: '₹50,08,42,150.00',
    subValue: '+₹1,42,800.00 (+0.28% today)',
    isPositive: true,
    pillText: 'XIRR: +16.8%',
    pillVariant: 'success',
    tooltip: 'Total mark-to-market value of Demat holdings, Margin cash, Sovereign bonds and Auto-sweep FDs.',
  },
  {
    id: 'sharpe',
    label: 'SHARPE RATIO (ANNUALIZED)',
    value: '1.04',
    subValue: 'Benchmark: NIFTY 50 TR',
    isPositive: true,
    pillText: 'High Efficiency',
    pillVariant: 'success',
    tooltip: 'Risk-adjusted return measured against the 91-day Government of India T-Bill rate (6.80%).',
  },
  {
    id: 'var',
    label: 'VALUE AT RISK (VaR 99% 1D)',
    value: '₹1,34,34,000.00',
    subValue: '2.68% of Portfolio AUM',
    isPositive: false,
    pillText: 'Within Limit',
    pillVariant: 'info',
    tooltip: 'Maximum projected loss over a 1-day horizon with 99% statistical confidence.',
  },
  {
    id: 'beta_alpha',
    label: 'PORTFOLIO BETA & ALPHA',
    value: '0.02 | +11.61%',
    subValue: 'Beta 0.02 · Alpha +11.61%',
    isPositive: true,
    pillText: 'Market Neutral',
    pillVariant: 'warning',
    tooltip: 'Beta measures market correlation (0.02 = uncorrelated). Alpha represents pure excess return.',
  },
];

export const STAT_ROW_2: StatItem[] = [
  {
    id: 'holdings',
    label: 'DEMAT HOLDINGS',
    value: '₹32,05,420.00',
    tag: '42 Scrips',
    tagColor: 'blue',
  },
  {
    id: 'margin',
    label: 'AVAILABLE MARGIN',
    value: '₹49,73,86,730.00',
    tag: 'Unencumbered',
    tagColor: 'emerald',
  },
  {
    id: 'sweep',
    label: 'AUTO-SWEEP FD',
    value: '₹2,50,00,000.00',
    tag: '7.10% p.a.',
    tagColor: 'amber',
  },
  {
    id: 'pledged',
    label: 'PLEDGED COLLATERAL',
    value: '₹15,20,000.00',
    tag: 'Haircut 12%',
    tagColor: 'purple',
  },
];

export const BACKTEST_DATA: Record<'1M' | '6M' | '1Y' | '5Y' | 'Max', BacktestPoint[]> = {
  '1M': [
    { date: 'Oct 24', portfolio: 98.2, benchmark: 98.5 },
    { date: 'Oct 28', portfolio: 99.1, benchmark: 98.8 },
    { date: 'Nov 02', portfolio: 100.4, benchmark: 99.2 },
    { date: 'Nov 08', portfolio: 101.6, benchmark: 99.9 },
    { date: 'Nov 14', portfolio: 102.8, benchmark: 100.2 },
    { date: 'Nov 20', portfolio: 103.5, benchmark: 100.8 },
    { date: 'Nov 24', portfolio: 104.2, benchmark: 101.1 },
  ],
  '6M': [
    { date: 'May 2026', portfolio: 92.0, benchmark: 91.5 },
    { date: 'Jun 2026', portfolio: 94.6, benchmark: 93.0 },
    { date: 'Jul 2026', portfolio: 98.4, benchmark: 95.8 },
    { date: 'Aug 2026', portfolio: 101.2, benchmark: 97.4 },
    { date: 'Sep 2026', portfolio: 104.8, benchmark: 98.2 },
    { date: 'Oct 2026', portfolio: 108.3, benchmark: 99.7 },
    { date: 'Nov 2026', portfolio: 111.9, benchmark: 101.4 },
  ],
  '1Y': [
    { date: 'Nov 2025', portfolio: 88.0, benchmark: 89.2 },
    { date: 'Jan 2026', portfolio: 91.4, benchmark: 90.8 },
    { date: 'Mar 2026', portfolio: 95.2, benchmark: 92.4 },
    { date: 'May 2026', portfolio: 99.8, benchmark: 94.1 },
    { date: 'Jul 2026', portfolio: 104.6, benchmark: 96.5 },
    { date: 'Sep 2026', portfolio: 109.2, benchmark: 98.0 },
    { date: 'Nov 2026', portfolio: 114.8, benchmark: 101.4 },
  ],
  '5Y': [
    { date: '2021', portfolio: 54.0, benchmark: 58.0 },
    { date: '2022', portfolio: 68.2, benchmark: 66.4 },
    { date: '2023', portfolio: 82.5, benchmark: 75.8 },
    { date: '2024', portfolio: 96.0, benchmark: 86.2 },
    { date: '2025', portfolio: 105.4, benchmark: 93.0 },
    { date: '2026', portfolio: 114.8, benchmark: 101.4 },
  ],
  'Max': [
    { date: '2019', portfolio: 38.0, benchmark: 42.0 },
    { date: '2020', portfolio: 44.5, benchmark: 48.0 },
    { date: '2021', portfolio: 58.2, benchmark: 60.1 },
    { date: '2022', portfolio: 72.0, benchmark: 68.4 },
    { date: '2023', portfolio: 86.4, benchmark: 77.2 },
    { date: '2024', portfolio: 98.9, benchmark: 88.5 },
    { date: '2025', portfolio: 106.8, benchmark: 94.1 },
    { date: '2026', portfolio: 114.8, benchmark: 101.4 },
  ],
};

export const ALLOCATIONS_BY_ASSET: AllocationItem[] = [
  { name: 'Cash & Auto-Sweep FD', value: 62.4, amount: '₹31.25 Cr', percentage: '62.4%', color: '#2563EB' },
  { name: 'Sovereign Gold (SGB)', value: 14.8, amount: '₹7.41 Cr', percentage: '14.8%', color: '#F97316' },
  { name: 'Equities & ETFs', value: 12.3, amount: '₹6.16 Cr', percentage: '12.3%', color: '#16A34A' },
  { name: 'US Tech Stocks', value: 6.5, amount: '₹3.25 Cr', percentage: '6.5%', color: '#7C3AED' },
  { name: 'Corporate Bonds & T-Bills', value: 4.0, amount: '₹2.01 Cr', percentage: '4.0%', color: '#E11D48' },
];

export const ALLOCATIONS_BY_GEOGRAPHY: AllocationItem[] = [
  { name: 'India (NSE / BSE / RBI)', value: 78.5, amount: '₹39.31 Cr', percentage: '78.5%', color: '#2563EB' },
  { name: 'United States (NYSE/NASDAQ)', value: 14.2, amount: '₹7.11 Cr', percentage: '14.2%', color: '#7C3AED' },
  { name: 'Global Commodities (MCX/Gold)', value: 7.3, amount: '₹3.66 Cr', percentage: '7.3%', color: '#F97316' },
];

export const ALLOCATIONS_BY_RISK: AllocationItem[] = [
  { name: 'Ultra-Safe Sovereign (0% Credit Risk)', value: 71.2, amount: '₹35.66 Cr', percentage: '71.2%', color: '#16A34A' },
  { name: 'Moderate Growth (Blue Chip & Index)', value: 21.3, amount: '₹10.67 Cr', percentage: '21.3%', color: '#2563EB' },
  { name: 'Alpha Opportunities (F&O / US Tech)', value: 7.5, amount: '₹3.75 Cr', percentage: '7.5%', color: '#F97316' },
];
