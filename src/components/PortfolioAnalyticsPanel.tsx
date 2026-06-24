import React, { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Layers, ShieldCheck, Activity, Award } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export function PortfolioAnalyticsPanel() {
  const { portfolioAnalytics } = useTerminal();

  // Create standard mapping array
  const assetClasses = useMemo(() => {
    if (!portfolioAnalytics) return [];
    const defaultStats = {
      simulatedPnL: 0,
      winRate: 0,
      profitFactor: 1,
      winsCount: 0,
      lossesCount: 0
    };
    return [
      { name: "Crypto assets", stats: portfolioAnalytics.crypto || defaultStats, color: "border-amber-500/30 text-amber-500 bg-amber-500/5", badge: "CRYPTO" },
      { name: "Equity Stocks", stats: portfolioAnalytics.stocks || defaultStats, color: "border-sky-500/30 text-sky-500 bg-sky-500/5", badge: "STOCKS" },
      { name: "Market Indexes", stats: portfolioAnalytics.indexes || defaultStats, color: "border-purple-500/30 text-purple-400 bg-purple-500/5", badge: "INDEXES" }
    ];
  }, [portfolioAnalytics]);

  const leadingStrategy = useMemo(() => {
    if (!portfolioAnalytics?.strategyPerformance) return "Bull Flag Breakouts";
    let bestStrategy = "Bull Flag Breakouts";
    let bestPnL = -Infinity;
    const entries = Object.entries(portfolioAnalytics.strategyPerformance);
    if (entries.length === 0) return "Bull Flag Breakouts";
    
    entries.forEach(([strat, data]) => {
      const typedData = data as { pnl: number; wins: number; total: number };
      if (typedData && typedData.pnl > bestPnL) {
        bestPnL = typedData.pnl;
        bestStrategy = strat;
      }
    });
    return bestStrategy || "Bull Flag Breakouts";
  }, [portfolioAnalytics]);

  if (!portfolioAnalytics) {
    return (
      <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border border-slate-800/80 font-sans shadow-2xl text-center py-12">
        <p className="text-sm text-slate-400 font-mono">LOADING_PORTFOLIO_METRIC_NODES...</p>
      </div>
    );
  }

  const overall = portfolioAnalytics.overall || {
    simulatedPnL: 0,
    winRate: 0,
    profitFactor: 1,
    tradesCount: 0,
    winsCount: 0,
    lossesCount: 0
  };

  return (
    <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border border-slate-800/80 font-sans shadow-2xl relative select-none">
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <span>Simulated Portfolio Analytics</span>
        </h2>
        <p className="text-[10px] text-slate-500">Multiclass asset performance metrics for desk review</p>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4.5 border-b border-white/5">
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
          <span className="text-[8.5px] text-slate-500 uppercase tracking-wider font-mono block">Simulated PnL</span>
          <span className={`text-base font-black font-mono block mt-1.5 ${overall.simulatedPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            ${overall.simulatedPnL >= 0 ? "+" : ""}{overall.simulatedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
          <span className="text-[8.5px] text-slate-500 uppercase tracking-wider font-mono block">Win Rate</span>
          <span className="text-base font-black font-mono text-white block mt-1.5">
            {overall.winRate.toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
          <span className="text-[8.5px] text-slate-500 uppercase tracking-wider font-mono block">Profit Factor</span>
          <span className="text-base font-black font-mono text-amber-400 block mt-1.5">
            {overall.profitFactor.toFixed(2)}x
          </span>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
          <span className="text-[8.5px] text-slate-500 uppercase tracking-wider font-mono block">Completed Trades</span>
          <span className="text-base font-black font-mono text-slate-200 block mt-1.5">
            {overall.tradesCount} ({overall.winsCount}W / {overall.lossesCount}L)
          </span>
        </div>
      </div>

      {/* Compartmental asset classes review */}
      <div className="pt-4.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3.5">
          Class-Specific Sub-Ledgers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assetClasses.map((cl) => {
            const profit = cl.stats.simulatedPnL >= 0;
            return (
              <div
                key={cl.name}
                className="bg-slate-900/20 border border-slate-850 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-white tracking-tight">{cl.name}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold border ${cl.color}`}>
                      {cl.badge}
                    </span>
                  </div>

                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Class PnL</span>
                      <span className={`font-bold ${profit ? "text-emerald-500" : "text-red-500"}`}>
                        ${profit ? "+" : ""}{cl.stats.simulatedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Win Rate</span>
                      <span className="text-slate-300 font-bold">{cl.stats.winRate.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Profit Factor</span>
                      <span className="text-slate-300 font-bold">{cl.stats.profitFactor.toFixed(1)}x</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Trades Count</span>
                      <span className="text-slate-300 font-bold">
                        {cl.stats.winsCount + cl.stats.lossesCount} ({cl.stats.winsCount}W / {cl.stats.lossesCount}L)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center space-x-1.5 text-[10px] text-slate-500">
                  <Activity className="h-3 w-3 text-slate-600" />
                  <span>Real-time WS tracking enabled</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategy performance comparisons bar */}
      <div className="pt-5.5 mt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Algosign Strategy Benchmarks
          </span>
          <span className="text-[9px] font-mono text-purple-400 flex items-center">
            <Award className="h-3 w-3 mr-1" />
            Leading: {leadingStrategy}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
            <div className="flex justify-between text-[10.5px] mb-1 font-mono">
              <span className="text-slate-300 font-bold">VWAP Reversal Tracker</span>
              <span className="text-emerald-400 font-bold">2.41 PF</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>

          <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
            <div className="flex justify-between text-[10.5px] mb-1 font-mono">
              <span className="text-slate-300 font-bold">ABCD Pattern Tracker</span>
              <span className="text-emerald-400 font-bold">1.82 PF</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "55%" }}></div>
            </div>
          </div>

          <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
            <div className="flex justify-between text-[10.5px] mb-1 font-mono">
              <span className="text-slate-300 font-bold">Bull Flag Breakouts</span>
              <span className="text-emerald-400 font-bold">3.10 PF</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: "90%" }}></div>
            </div>
          </div>

          <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
            <div className="flex justify-between text-[10.5px] mb-1 font-mono">
              <span className="text-slate-300 font-bold">Bear Flag Breaks</span>
              <span className="text-emerald-400 font-bold">1.55 PF</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Disclaimer */}
      <div className="text-[9px] text-slate-600 mt-3 text-center">
        * All PnL figures reflect simulated paper trades. No real capital is at risk.
      </div>
    </div>
  );
}
