import React, { useMemo } from "react";
import { Cpu, Zap, Activity, Clock, ShieldCheck, Play, Power, Compass } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export function StrategyScannerPanel() {
  const {
    scanSignals,
    allQuotes,
    watchlist,
    botRunning,
    setBotRunning,
    riskSettings
  } = useTerminal();

  // Create representational active running status
  const totalWatchlistsCount = watchlist.length;

  return (
    <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border border-slate-800/80 font-sans shadow-2xl relative select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
        <div>
          <div className="flex items-center space-x-1.5">
            <Cpu className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Algosign Scanner</h2>
          </div>
          <p className="text-[10px] text-slate-500">Continuous pattern scanning over {totalWatchlistsCount} assets</p>
        </div>
        
        {/* Toggle scanning engine state */}
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2 w-2 relative">
            {botRunning ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
            )}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {botRunning ? "SCANNING_PIPELINE_ACTIVE" : "ENGINE_STANDBY"}
          </span>
          <button
            onClick={() => setBotRunning(!botRunning)}
            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              botRunning
                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
            title={botRunning ? "Stop Scanning Engine" : "Start Scanning Engine"}
          >
            {botRunning ? <Power className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* Grid of indicators / metadata statuses */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-white/5">
        <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Target Assets</span>
          <span className="text-xs font-bold text-white font-mono">{watchlist.length} Monitored</span>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Active Rulesets</span>
          <span className="text-xs font-bold text-pink-400 font-mono">4 Patterns Live</span>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Min. Confidence</span>
          <span className="text-xs font-bold text-amber-400 font-mono">{riskSettings.maxOpenTrades > 4 ? "80%" : "85%"}</span>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Tick Cadence</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">400ms Ultra-Hz</span>
        </div>
      </div>

      {/* Signals table log view */}
      <div className="pt-4">
        <div className="flex items-center justify-between pb-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Real-time Detections Audit Log
          </div>
          <div className="text-[9px] font-mono text-slate-500">
            AUTO-ORDER: EXECUTION={botRunning ? "ALWAYS_ENABLED" : "PAUSED"}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {scanSignals.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-5">
              <Zap className="h-7 w-7 text-slate-600 mb-2.5 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Waiting for pattern matches...</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                Patterns (VWAP Reversals, ABCD, Flag setups) are continuously evaluated over active candles. Ensure you have symbols in your watchlist.
              </p>
            </div>
          ) : (
            scanSignals.map((signal) => {
              const isBuy = signal.direction === "BUY";
              const dateObj = new Date(signal.timestamp);
              const timeStr = `${String(dateObj.getHours()).padStart(2, "0")}:${String(
                dateObj.getMinutes()
              ).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(2, "0")}`;

              return (
                <div
                  key={signal.id}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-800/85 hover:border-slate-700/60 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-mono uppercase tracking-tight">
                          {signal.symbol}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono font-bold uppercase tracking-wider">
                          {signal.patternName}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {signal.assetType}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
                        {signal.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded text-[10.5px] font-bold font-mono space-x-1 ${
                          isBuy
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            : "bg-red-500/10 text-red-500 border border-red-500/15"
                        }`}
                      >
                        <span>{signal.direction}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-1.5 flex items-center justify-end space-x-1">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicator parameters detailed block */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 rounded-lg p-2.5 mt-3 border border-slate-850">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-mono block">Trigger Price</span>
                      <span className="text-[10px] font-bold text-slate-300 font-mono">
                        ${signal.triggerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-mono block">RSI (14)</span>
                      <span className="text-[10px] font-bold text-slate-300 font-mono">
                        {signal.indicators.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-mono block">VWAP Alignment</span>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          signal.indicators.vwapStatus === "Bullish"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {signal.indicators.vwapStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-mono block">Confidence</span>
                      <span className="text-[10px] font-bold font-mono text-purple-400">
                        {signal.confidenceScore}% Acc
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
