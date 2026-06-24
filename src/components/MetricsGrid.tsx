/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowUpRight, Wallet, TrendingUp, Target, Activity } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export default function MetricsGrid() {
  const { totalBalance, totalProfit, winRate, totalTrades } = useTerminal();

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-2 font-sans select-none">
      
      {/* CARD 1: Total Balance */}
      <div className="glass-panel hover:border-blue-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between h-[125px] group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Balance</span>
            <div className="p-1 rounded-lg bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
              <Wallet className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-1.5">
            <h3 className="font-display font-black text-2xl tracking-tight text-white leading-none">
              {formatMoney(totalBalance)}
            </h3>
            <p className="text-[10px] font-semibold text-emerald-400 flex items-center mt-1.5 leading-none">
              <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0 animate-pulse" />
              <span>+8.42% (24h)</span>
            </p>
          </div>
        </div>

        {/* Sparkline background */}
        <div className="absolute bottom-0 left-0 right-0 h-10 px-1 opacity-90">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grid-grad-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 20 Q 15 8 30 14 T 60 7 T 85 11 T 100 4 L 100 20 Z"
              fill="url(#grid-grad-blue)"
            />
            <path
              d="M 0 18 Q 15 8 30 14 T 60 7 T 85 11 T 100 4"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="4" r="1.2" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* CARD 2: Total Profit */}
      <div className="glass-panel hover:border-purple-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between h-[125px] group">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/20" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Profit</span>
            <div className="p-1 rounded-lg bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-1.5">
            <h3 className="font-display font-black text-2xl tracking-tight text-white leading-none">
              {formatMoney(totalProfit)}
            </h3>
            <p className="text-[10px] font-semibold text-emerald-400 flex items-center mt-1.5 leading-none">
              <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" />
              <span>+12.65% (24h)</span>
            </p>
          </div>
        </div>

        {/* Sparkline background */}
        <div className="absolute bottom-0 left-0 right-0 h-10 px-1 opacity-90">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grid-grad-purple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 20 Q 20 12 40 16 T 70 8 T 90 12 T 100 6 L 100 20 Z"
              fill="url(#grid-grad-purple)"
            />
            <path
              d="M 0 18 Q 20 12 40 16 T 70 8 T 90 12 T 100 6"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="6" r="1.2" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* CARD 3: Win Rate */}
      <div className="glass-panel hover:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between h-[125px] group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Win Rate</span>
            <div className="p-1 rounded-lg bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-1.5">
            <h3 className="font-display font-black text-2xl tracking-tight text-white leading-none">
              {winRate.toFixed(2)}%
            </h3>
            <p className="text-[10px] font-semibold text-emerald-400 flex items-center mt-1.5 leading-none">
              <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" />
              <span>+2.15% (30-day)</span>
            </p>
          </div>
        </div>

        {/* Sparkline background */}
        <div className="absolute bottom-0 left-0 right-0 h-10 px-1 opacity-90">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grid-grad-emerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 20 Q 15 15 35 17 T 65 10 T 85 12 T 100 4 L 100 20 Z"
              fill="url(#grid-grad-emerald)"
            />
            <path
              d="M 0 19 Q 15 15 35 17 T 65 10 T 85 12 T 100 4"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="4" r="1.2" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* CARD 4: Total Trades */}
      <div className="glass-panel hover:border-orange-500/30 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between h-[125px] group">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/20" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Trades</span>
            <div className="p-1 rounded-lg bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors">
              <Activity className="h-4 w-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-1.5">
            <h3 className="font-display font-black text-2xl tracking-tight text-white leading-none">
              {totalTrades.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-orange-400 flex items-center mt-1.5 leading-none">
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-400" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
              </span>
              <span>HFT Handoff Microsecond Sockets Active</span>
            </p>
          </div>
        </div>

        {/* Sparkline background */}
        <div className="absolute bottom-0 left-0 right-0 h-10 px-1 opacity-90">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grid-grad-orange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 20 L 20 18 L 40 15 L 60 16 L 80 13 L 100 10 L 100 20 Z"
              fill="url(#grid-grad-orange)"
            />
            <path
              d="M 0 20 L 20 18 L 40 15 L 60 16 L 80 13 L 100 10"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="10" r="1.2" fill="#ffffff" />
          </svg>
        </div>
      </div>

    </div>
  );
}
