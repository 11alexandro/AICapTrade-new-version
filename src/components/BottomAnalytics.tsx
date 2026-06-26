/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Play, Pause, AlertOctagon, Sliders, ChevronDown, 
  ShieldAlert, Activity, ArrowUpRight, ArrowDownRight, Compass
} from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export default function BottomAnalytics() {
  const {
    botRunning,
    setBotRunning,
    strategy,
    setStrategy,
    riskLevel,
    setRiskLevel,
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    capitalAllocation,
    setCapitalAllocation,
    maxPositionSize,
    setMaxPositionSize,
    addNotification,
    session,
    sessionTicksRemaining
  } = useTerminal();

  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [livePnLVal, setLivePnLVal] = useState(1498.75);

  // Deriving metrics dynamically from central session parameters & capital setups
  const varVal = 420 + (session.riskScore * 13.8) + (Math.sin(livePnLVal * 0.08) * 8.5);
  const exposureVal = parseFloat(((capitalAllocation * 0.45) + (session.volatility * 11.2) + (Math.cos(livePnLVal * 0.04) * 1.6)).toFixed(1));

  useEffect(() => {
    if (!botRunning) return; // Freeze PnL ticks if trading bot service is suspended

    const pnlInterval = setInterval(() => {
      setLivePnLVal((prev) => {
        // PnL drifts based on current session trend vector
        const sessionTrend = session.trend; // -1 to +1
        const runBias = sessionTrend * 0.85;
        const delta = (Math.random() - 0.5) * 1.85 + runBias;
        return parseFloat((prev + delta).toFixed(2));
      });
    }, 3100);

    return () => clearInterval(pnlInterval);
  }, [botRunning, session]);

  const startAutomatedBot = () => {
    setBotRunning(true);
    addNotification("Bot Core Activated", "Automated neural parameters and broker gateway tunnels running live.", "success");
  };

  const stopAutomatedBot = () => {
    setBotRunning(false);
    addNotification("Bot Core Suspended", "Neural loop execution parameters paused. Open exposures secured.", "warning");
  };

  const stratsList = [
    "Mean Reversion",
    "Scalping",
    "Momentum",
    "Arbitrage"
  ];

  const handleStrategyChange = (st: string) => {
    setStrategy(st);
    setShowStrategyDropdown(false);
    addNotification("Strategy Index Updated", `Dynamic execution algorithm set to ${st} regimes.`, "info");
  };

  const rRadius = 24;
  const rCircumference = 2 * Math.PI * rRadius;
  // Dynamic risk percentage offset for visual indicator
  const riskPercentVal = riskLevel === "Low" ? 0.25 : riskLevel === "Medium" ? 0.50 : riskLevel === "High" ? 0.75 : 0.95;
  const rStrokeDashoffset = rCircumference - riskPercentVal * rCircumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-3 md:px-6 py-2 pb-6 font-sans select-none">
      
      {/* SECTION 1: Bot Controls Panel */}
      <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/40 border-slate-800/80 hover:border-slate-850 transition-colors flex flex-col justify-between min-h-[225px] lg:h-[225px]">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
            Bot Engine Controls
          </span>
          <div className="space-y-2">
            
            {/* Start Bot */}
            <button
              onClick={startAutomatedBot}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                botRunning
                  ? "bg-slate-900/60 text-slate-500 border border-slate-800/80 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 filter hover:brightness-110 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              }`}
              disabled={botRunning}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Bot</span>
            </button>

            {/* Pause Bot button */}
            <button
              onClick={stopAutomatedBot}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                !botRunning
                  ? "bg-slate-900/40 text-slate-500 border border-slate-800/60 cursor-not-allowed"
                  : "bg-slate-900/95 hover:bg-slate-800/85 hover:text-white border border-slate-700/80 text-slate-200 active:scale-95 shadow-md"
              }`}
              disabled={!botRunning}
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Pause Bot</span>
            </button>
          </div>
        </div>

        {/* Emergency Stop Button */}
        <button
          onClick={stopAutomatedBot}
          className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-500/20 hover:border-rose-400/40 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
          <span>Emergency Stop</span>
        </button>
      </div>

      {/* SECTION 2: Trading Strategy Configurator */}
      <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/40 border-slate-800/80 hover:border-slate-850 transition-colors min-h-[225px] lg:h-[225px] flex flex-col justify-between relative">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Active Neural Strategy
          </span>
          
          {/* Strategy Dropdown trigger selector */}
          <div className="relative mb-2">
            <button 
              onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-100 hover:border-slate-700 transition-colors cursor-pointer font-bold leading-none"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="h-3.5 w-3.5 text-blue-400" />
                <span>{strategy}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {showStrategyDropdown && (
              <div className="absolute top-8 left-0 right-0 py-1.5 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl z-50 text-xs">
                {stratsList.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStrategyChange(st)}
                    className="w-full text-left px-3.5 py-1.8 text-slate-300 hover:bg-blue-600/10 hover:text-white transition-colors cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Capital Allocation Slider */}
            <div>
              <div className="flex justify-between items-center text-[9px] font-mono font-medium text-slate-500 mb-0.5">
                <span>Capital Allocation</span>
                <span className="text-blue-400 font-bold">{capitalAllocation}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={capitalAllocation}
                onChange={(e) => setCapitalAllocation(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Max Position Size Slider */}
            <div>
              <div className="flex justify-between items-center text-[9px] font-mono font-medium text-slate-500 mb-0.5">
                <span>Max Position Exposure</span>
                <span className="text-cyan-405 font-bold">{maxPositionSize} BTC</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={maxPositionSize}
                onChange={(e) => setMaxPositionSize(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Dynamic limits markers */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono mt-1">
          <div className="bg-rose-950/25 border border-rose-900/20 rounded-lg p-1">
            <span className="text-slate-500 block text-[8px] uppercase">Stop Loss limit</span>
            <span className="text-rose-400 font-bold">-{stopLoss.toFixed(2)}%</span>
          </div>
          <div className="bg-emerald-950/25 border border-emerald-900/20 rounded-lg p-1">
            <span className="text-slate-500 block text-[8px] uppercase">Take Profit limit</span>
            <span className="text-emerald-400 font-bold">+{takeProfit.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Risk Overview Widget */}
      <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/40 border-slate-800/80 hover:border-slate-850 transition-colors min-h-[225px] lg:h-[225px] flex items-center justify-between">
        <div className="flex flex-col justify-between h-full w-[45%] shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block leading-none">
            Risk Profile
          </span>
          
          {/* Circular dial gauge */}
          <div className="relative flex items-center justify-center w-[74px] h-[74px] mx-auto my-auto mt-2 leading-none">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="37"
                cy="37"
                r={rRadius}
                stroke="#1e293b"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="37"
                cy="37"
                r={rRadius}
                stroke="url(#risk-timer-grad)"
                strokeWidth="4"
                strokeDasharray={rCircumference}
                strokeDashoffset={rStrokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="risk-timer-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center flex flex-col items-center justify-center leading-none">
              <span className="text-[10px] font-sans font-black text-amber-400 leading-none">{riskLevel}</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 leading-none">Limit</span>
            </div>
          </div>
        </div>

        {/* Risk profile metrics indicators */}
        <div className="w-[50%] h-full flex flex-col justify-end space-y-2 font-mono text-[10px] pb-1.5 shrink-0 pl-1">
          <div className="border-b border-white/5 pb-1 select-none">
            <p className="text-slate-500 text-[8px] uppercase tracking-wider leading-none">VaR (24h)</p>
            <p className="text-white font-bold mt-0.5 leading-none">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(varVal)}
            </p>
          </div>
          <div className="border-b border-white/5 pb-1 select-none">
            <p className="text-slate-500 text-[8px] uppercase tracking-wider leading-none font-bold">Max Drawdown</p>
            <p className="text-rose-400 font-bold mt-0.5 leading-none">8.42%</p>
          </div>
          <div className="border-b border-white/5 pb-1 select-none">
            <p className="text-slate-500 text-[8px] uppercase tracking-wider leading-none">Exposure Factor</p>
            <p className="text-slate-300 font-bold mt-0.5 leading-none">{exposureVal}%</p>
          </div>
          <div className="select-none">
            <p className="text-slate-500 text-[8px] uppercase tracking-wider leading-none font-bold">Safety Margin</p>
            <p className="text-blue-400 font-bold mt-0.5 leading-none">3.1x</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: PnL Performance Chart */}
      <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/40 border-slate-800/80 hover:border-slate-850 transition-colors min-h-[225px] lg:h-[225px] flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              PnL Performance
            </span>
            <div className="flex items-center space-x-1 text-[9px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-lg">
              <span>24 Hours</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-xl font-display font-black text-emerald-400 tracking-tight leading-none">
              +${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(livePnLVal)}
            </span>
            <span className="text-[10px] font-bold text-emerald-400/90 leading-none animate-pulse">
              +{(livePnLVal / 178).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Glow Line chart mini */}
        <div className="h-10 w-full relative mt-2 overflow-hidden px-1 opacity-90">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pnl-wave-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 20 Q 15 14 30 18 T 60 8 T 85 15 T 100 5 L 100 20 Z"
              fill="url(#pnl-wave-grad)"
            />
            <path
              d="M 0 18 Q 15 14 30 18 T 60 8 T 85 15 T 100 5"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="5" r="1.5" fill="#34d399" />
          </svg>
        </div>

        {/* Daily High / Low markers */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 font-mono text-[9px]">
          <div>
            <span className="text-slate-500 uppercase tracking-widest block text-[7px] leading-none">Daily High</span>
            <span className="text-emerald-405 font-bold">+$1,587.32</span>
          </div>
          <div className="border-l border-white/5 pl-2">
            <span className="text-slate-500 uppercase tracking-widest block text-[7px] leading-none">Daily Low</span>
            <span className="text-rose-405 font-bold">-$342.18</span>
          </div>
        </div>
      </div>

    </div>
  );
}
