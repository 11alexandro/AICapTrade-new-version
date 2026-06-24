import React, { useState } from "react";
import { Sliders, Shield, History, Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, Layers, CheckSquare, XSquare } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export function SimulatorControls() {
  const {
    riskSettings,
    setRiskSettings,
    simulatedTrades,
    setSimulatedTrades,
    clearTradeHistory,
    allQuotes
  } = useTerminal();

  const [activeSubTab, setActiveSubTab] = useState<"settings" | "open" | "history">("open");

  // Filter open simulated trades
  const openTrades = simulatedTrades.filter((t) => t.status === "OPEN");

  // Filter completed simulated trades
  const completedHistory = simulatedTrades.filter((t) => t.status === "WIN" || t.status === "LOSS");

  const handleUpdateRisk = (key: keyof typeof riskSettings, val: number) => {
    setRiskSettings({
      ...riskSettings,
      [key]: val
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border border-slate-800/80 font-sans shadow-2xl relative select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span>Simulator & Risk Console</span>
          </h2>
          <p className="text-[10px] text-slate-500">Practice order executions securely with zero capital risk</p>
        </div>

        {/* Console layout tabs selection */}
        <div className="flex space-x-1 bg-slate-900/50 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setActiveSubTab("open")}
            className={`px-2.5 py-1 text-[10.5px] font-bold tracking-tight rounded-md transition-all ${
              activeSubTab === "open"
                ? "bg-amber-500/10 text-amber-400 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Open ({openTrades.length})
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-2.5 py-1 text-[10.5px] font-bold tracking-tight rounded-md transition-all ${
              activeSubTab === "history"
                ? "bg-amber-500/10 text-amber-400 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Ledger ({completedHistory.length})
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-2.5 py-1 text-[10.5px] font-bold tracking-tight rounded-md transition-all ${
              activeSubTab === "settings"
                ? "bg-amber-500/10 text-amber-400 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Risk Rules
          </button>
        </div>
      </div>

      {activeSubTab === "settings" && (
        <div className="pt-4 space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Active Risk Safeguards</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk per trade */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk Per Trade (%)</span>
                <span className="text-white font-mono font-bold">{riskSettings.riskPerTradePercent.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={riskSettings.riskPerTradePercent}
                onChange={(e) => handleUpdateRisk("riskPerTradePercent", parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[9px] text-slate-500">Calculates allocation sizes dynamically matched to equity limits.</p>
            </div>

            {/* Stop loss */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Stop Loss (%)</span>
                <span className="text-red-400 font-mono font-bold">-{riskSettings.stopLossPercent.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={riskSettings.stopLossPercent}
                onChange={(e) => handleUpdateRisk("stopLossPercent", parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
              <p className="text-[9px] text-slate-500">Target price offset triggering auto liquidation guard.</p>
            </div>

            {/* Take profit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Take Profit (%)</span>
                <span className="text-emerald-400 font-mono font-bold">+{riskSettings.takeProfitPercent.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.2"
                value={riskSettings.takeProfitPercent}
                onChange={(e) => handleUpdateRisk("takeProfitPercent", parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-[9px] text-slate-500">Profit goal boundary automatically releasing order shares.</p>
            </div>

            {/* Max open trades */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Max Open Trades</span>
                <span className="text-white font-mono font-bold">{riskSettings.maxOpenTrades} Positions</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={riskSettings.maxOpenTrades}
                onChange={(e) => handleUpdateRisk("maxOpenTrades", parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[9px] text-slate-500">Locks entry queue when parallel matching trades reach limit.</p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "open" && (
        <div className="pt-4 overflow-x-auto">
          {openTrades.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-5">
              <Layers className="h-7 w-7 text-slate-600 mb-2.5" />
              <p className="text-xs font-bold text-slate-400">No active simulated trades found.</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                Open trades are generated automatically on algorithmic pattern detection. Or place quick orders from chart buttons!
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Entry</th>
                  <th className="pb-2 text-right">Current</th>
                  <th className="pb-2 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {openTrades.map((t) => {
                  const quote = allQuotes[t.symbol];
                  const currentPrice = quote ? quote.price : t.entryPrice;
                  
                  // Calculate raw price delta mapped to direction
                  const diff = t.direction === "BUY" ? (currentPrice - t.entryPrice) : (t.entryPrice - currentPrice);
                  const pnl = parseFloat((t.size * diff).toFixed(2));
                  const pnlPct = parseFloat(((diff / t.entryPrice) * 100).toFixed(2));

                  return (
                    <tr key={t.id} className="hover:bg-white/3 font-mono">
                      <td className="py-2.5 font-bold text-white">{t.symbol}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            t.direction === "BUY"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {t.direction === "BUY" ? "LONG" : "SHORT"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold">${t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-right font-semibold">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`py-2.5 text-right font-bold ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        ${pnl >= 0 ? "+" : ""}{pnl.toLocaleString()} ({pnlPct >= 0 ? "+" : ""}{pnlPct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeSubTab === "history" && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Executed Settlements Roll</span>
            <button
              onClick={clearTradeHistory}
              className="text-[10px] text-slate-500 hover:text-red-400 transition-colors cursor-pointer border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900"
            >
              Clear Ledger History
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {completedHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                Historical records is empty.
              </div>
            ) : (
              completedHistory.map((t) => {
                const dateObj = new Date(t.timestamp);
                const isWin = t.status === "WIN";

                return (
                  <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl hover:border-slate-800 transition-all font-mono">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-white">{t.symbol}</span>
                        <span
                          className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${
                            t.direction === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {t.direction}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-slate-500 mt-1">
                        Entry: ${t.entryPrice.toLocaleString()} · Target: ${t.target.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-[11px] font-bold ${isWin ? "text-emerald-500" : "text-red-500"}`}>
                        {isWin ? "+" : ""}${t.pnl.toLocaleString()}
                      </div>
                      <div className="text-[8.5px] text-slate-500 mt-1">
                        Settled: <span className="uppercase text-slate-400">{t.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
