"use client";

import React from 'react';
import Link from './linkShim';
import { ArrowRight, Briefcase, UserCheck, ShieldAlert, Award } from 'lucide-react';
import { PERSONA_DEMOS } from './mockData';
import { useTheme } from './ThemeContext';

export const PersonaCards: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            One-Click Instant Demo Credentials
          </span>
          <h3 className={`text-sm font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            EXPLORE PRE-CONFIGURED PERSONAS
          </h3>
        </div>
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          No KYC required for sandbox exploration
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {PERSONA_DEMOS.map((persona, index) => {
          const isPrime = index === 0;
          return (
            <Link
              key={persona.id}
              href={`/terminal?persona=${persona.id}`}
              className={`group flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isPrime
                  ? isDark
                    ? 'bg-gradient-to-br from-[#111A2E] to-blue-950/30 border-blue-800/70 hover:border-blue-500 shadow-md shadow-blue-950/40'
                    : 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 hover:border-blue-400 shadow-sm'
                  : isDark
                  ? 'bg-[#111A2E] border-[#1F2A44] hover:border-slate-600'
                  : 'bg-white border-[#E5E9F0] hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {persona.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isPrime
                        ? 'bg-blue-500/15 text-blue-500 border-blue-500/30'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {persona.tag}
                  </span>
                </div>

                <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {persona.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  AUM: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{persona.aum}</strong>
                </span>

                <span className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] dark:text-[#3B82F6] group-hover:translate-x-1 transition-transform duration-150">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
