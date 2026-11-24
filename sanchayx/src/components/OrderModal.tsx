"use client";

import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [product, setProduct] = useState<'CNC' | 'MIS'>('CNC');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [quantity, setQuantity] = useState('50');
  const [price, setPrice] = useState('2,940.50');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const estimatedTotal = (
    parseFloat(quantity.replace(/,/g, '') || '0') *
    parseFloat(price.replace(/,/g, '') || '0')
  ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 transition-all shadow-2xl relative ${
          isDark ? 'bg-[#111A2E] border-[#1F2A44] text-white' : 'bg-white border-[#E5E9F0] text-slate-900'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
            QUANT ORDER EXECUTION
          </h3>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <div className="font-bold text-base">Order Routed to Exchange</div>
            <p className="text-xs text-slate-400 font-mono">
              Executed {side} {quantity} {symbol} @ ₹{price} · Ref: #ORD-774921
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecute} className="space-y-4">
            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  side === 'BUY'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  side === 'SELL'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Symbol & Exchange */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Scrip Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Exchange
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {(['NSE', 'BSE'] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setExchange(ex)}
                      className={`py-1 text-xs font-mono font-bold rounded-lg ${
                        exchange === ex ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Quantity (Lots)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Limit Price (₹)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Product CNC / MIS */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono">
              <span className="text-slate-400 font-medium">Estimated Margin:</span>
              <span className="font-bold text-sm">₹{estimatedTotal}</span>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs text-white transition-all shadow-md cursor-pointer ${
                side === 'BUY'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
              }`}
            >
              EXECUTE {side} ORDER
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
