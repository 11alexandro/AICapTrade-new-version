/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Cpu, StopCircle, PlayCircle, Layers, TrendingUp, AlertCircle } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

interface FeedTrade {
  id: string;
  type: "BUY" | "SELL" | "ALERT" | "TRIGGER" | "REGIME";
  asset?: "BTC" | "ETH" | "SOL" | "XRP" | "SYS";
  price?: number;
  size?: number | string;
  timeText: string;
  timestamp: number;
  message?: string;
  severity?: "info" | "warning" | "success" | "danger" | "neutral";
}

export default function SidebarAnalytics() {
  const { 
    botRunning, 
    setBotRunning, 
    btcPrice, 
    ethPrice, 
    solPrice, 
    xrpPrice,
    strategy,
    riskLevel,
    addNotification,
    session,
    sessionTicksRemaining
  } = useTerminal();

  const [uptimeSeconds, setUptimeSeconds] = useState(16338); // Standard continuous timing mock
  
  // High-fidelity dynamic machine-learning metrics derived from central session state
  const noiseValue = Math.sin(uptimeSeconds * 0.23) * 0.65;
  const confidenceScore = Math.min(99.6, Math.max(12, session.confidence + noiseValue));
  
  const momentumBullish = Math.floor(Math.min(99, Math.max(5, 50 + (session.trend * 45) + Math.cos(uptimeSeconds * 0.15) * 2.5)));
  
  const marketAlpha = Math.floor(Math.min(99, Math.max(5, 55 + (session.volatility * 12) + (session.trend * 10) + Math.sin(uptimeSeconds * 0.12) * 2)));


  const [feedTrades, setFeedTrades] = useState<FeedTrade[]>([
    { id: "1", type: "BUY", asset: "BTC", price: 107000.00, size: 0.25, timeText: "2s ago", timestamp: Date.now() - 2000 },
    { id: "2", type: "SELL", asset: "ETH", price: 2520.00, size: 1.12, timeText: "8s ago", timestamp: Date.now() - 8000 },
    { id: "3", type: "BUY", asset: "SOL", price: 148.00, size: 15.76, timeText: "15s ago", timestamp: Date.now() - 15000 },
    { id: "4", type: "BUY", asset: "BTC", price: 106950.00, size: 0.18, timeText: "22s ago", timestamp: Date.now() - 22000 },
    { id: "5", type: "SELL", asset: "XRP", price: 2.28, size: 850.00, timeText: "31s ago", timestamp: Date.now() - 31000 }
  ]);

  // Handle uptime chronometer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (botRunning) {
      interval = setInterval(() => {
        setUptimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [botRunning]);

  // Keep contextual data updated for interval use without re-triggering effect
  const contextRef = useRef({ btcPrice, ethPrice, solPrice, xrpPrice, session });
  useEffect(() => {
    contextRef.current = { btcPrice, ethPrice, solPrice, xrpPrice, session };
  });

  // Feed simulation tickers streaming
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const { btcPrice: currentBtc, ethPrice: currentEth, solPrice: currentSol, xrpPrice: currentXrp, session: currentSession } = contextRef.current;
      
      // 35% chance to push a smart contextual system event alert
      const shouldPushAlert = Math.random() < 0.35;
      
      if (shouldPushAlert) {
        const alerts: { msg: string; severity: "info" | "warning" | "success" | "danger" }[] = [];
        
        if (currentSession.current === "BULLISH_TREND") {
          alerts.push(
            { msg: "AI Trigger: Long scalps scaling on bullish grid step", severity: "success" },
            { msg: "Vol Alert: Heavy spot volume absorption active", severity: "info" },
            { msg: "Strategy: Trend continuation bias verified [92.1%]", severity: "success" }
          );
        } else if (currentSession.current === "BEARISH_TREND") {
          alerts.push(
            { msg: "Risk Warning: Cascade leverage flushout of long bids", severity: "danger" },
            { msg: "Strategy: Capital hedge protective short re-hedging loaded", severity: "warning" },
            { msg: "HFT Trigger: Short block scalp target achieved", severity: "success" }
          );
        } else if (currentSession.current === "BREAKOUT_EXPANSION") {
          alerts.push(
            { msg: "Breakout Detected: Upward momentum breaks 1H resistance", severity: "success" },
            { msg: "Alert: Volatility expansion triggered [EMA 20 crossover]", severity: "warning" },
            { msg: "Take-Profit: Tightened trailing stop-loss buffers", severity: "info" }
          );
        } else if (currentSession.current === "HIGH_VOLATILITY") {
          alerts.push(
            { msg: "Risk Critical: Extreme variance spike, slippage risk elevated", severity: "danger" },
            { msg: "Strategy: HFT auto-scalper adjusting parameters actively", severity: "warning" },
            { msg: "Solver Core: SOL delta exposure hedge adjusted", severity: "info" }
          );
        } else if (currentSession.current === "LOW_VOLATILITY") {
          alerts.push(
            { msg: "Market Sync: Sideways range tightening, compression mode active", severity: "info" },
            { msg: "Strategy: Mean Reversion bounds compressed for scalp trades", severity: "success" }
          );
        } else if (currentSession.current === "REVERSAL") {
          alerts.push(
            { msg: "Reversal Detected: Bullish exhaustion triggered on high limits", severity: "warning" },
            { msg: "Strategy: Pivot-point scaling active [Node B]", severity: "info" }
          );
        } else {
          alerts.push(
            { msg: "Strategy Sync: local capital buffer verified with Binance ledger", severity: "success" }
          );
        }
        
        const randomAlertObj = alerts[Math.floor(Math.random() * alerts.length)] || { msg: "Ledger status: green holding bounds secure", severity: "success" };
        
        const newAlertRow: FeedTrade = {
          id: Math.random().toString(),
          type: Math.random() > 0.5 ? "ALERT" : "TRIGGER",
          asset: "SYS",
          timeText: "Just now",
          timestamp: Date.now(),
          message: randomAlertObj.msg,
          severity: randomAlertObj.severity
        };

        setFeedTrades((prev) => [newAlertRow, ...prev].slice(0, 5));
        return;
      }

      // Normal trade row (65% chance)
      const assets: ("BTC" | "ETH" | "SOL" | "XRP")[] = ["BTC", "ETH", "SOL", "XRP"];
      const types: ("BUY" | "SELL")[] = ["BUY", "SELL"];
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];

      let activeAssetPrice = currentBtc;
      let sizeFactor = 0.25;
      if (randomAsset === "ETH") {
        activeAssetPrice = currentEth;
        sizeFactor = 1.45;
      } else if (randomAsset === "SOL") {
        activeAssetPrice = currentSol;
        sizeFactor = 12.8;
      } else if (randomAsset === "XRP") {
        activeAssetPrice = currentXrp;
        sizeFactor = 1205.0;
      }

      const randomSize = parseFloat(((Math.random() * 0.82 + 0.15) * sizeFactor).toFixed(2));
      const precisePrice = parseFloat((activeAssetPrice * (1 + (Math.random() - 0.5) * 0.0004)).toFixed(randomAsset === "XRP" ? 4 : 2));
      
      const newTrade: FeedTrade = {
        id: Math.random().toString(),
        type: randomType,
        asset: randomAsset,
        price: precisePrice,
        size: randomSize,
        timeText: "Just now",
        timestamp: Date.now()
      };

      setFeedTrades((prev) => [newTrade, ...prev].slice(0, 5));
    }, 4500);

    return () => clearInterval(streamInterval);
  }, []);

  const formatUptimeStr = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (v: number) => String(v).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const getRelativeMinutes = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 1000) return "Just now";
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    return `${mins}m ago`;
  };

  const formattedUptimeStr = formatUptimeStr(uptimeSeconds);

  return (
    <div className="w-full font-sans px-6 py-4 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
        {/* SECTION 1: Bot Engine Status widget */}
        <div className="glass-panel rounded-2xl p-4 bg-slate-950/20 border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px] hover:border-slate-700/60 transition-all">
        <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Bot Engine Status
          </span>
          <div className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${botRunning ? "bg-emerald-400 pulsing-ring" : "bg-rose-500"}`} />
            <span className={`text-[9px] font-bold ${botRunning ? "text-emerald-400" : "text-rose-400"}`}>
              {botRunning ? "Running" : "Idle State"}
            </span>
          </div>
        </div>

        {/* Circular Dial neural map logo */}
        <div className="flex justify-center items-center py-4 relative">
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className={`absolute inset-0 rounded-full border border-blue-500/10 ${botRunning ? "animate-pulse glow-blue" : ""}`} />
            
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="ring-glow-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke={botRunning ? "url(#ring-glow-grad)" : "#1e293b"}
                strokeWidth="2.5"
                strokeDasharray={botRunning ? "180 80" : "10 5"}
                fill="transparent"
                className={botRunning ? "animate-[spin_40s_linear_infinite]" : ""}
              />
            </svg>

            <div className="absolute inset-5 bg-slate-900 rounded-full border border-blue-500/20 flex flex-col justify-center items-center shadow-inner group">
              <Cpu className={`h-7 w-7 text-blue-400 ${botRunning ? "animate-pulse" : "text-slate-500"}`} />
            </div>
          </div>
        </div>

        {/* Diagnostics logs details */}
        <div className="space-y-2 mt-3.5 pt-3.5 border-t border-white/5 text-[10px] select-none text-slate-400">
          <div className="flex justify-between items-center">
            <span>Regime Core</span>
            <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase leading-none">
              {strategy}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Risk Limit Parameters</span>
            <span className="text-[9px] font-mono font-bold text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded uppercase leading-none">
              {riskLevel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Start Chrono Timestamp</span>
            <span className="text-slate-300 font-mono font-semibold">Jan 28, 10:15 AM</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Bot Chronometer</span>
            <span className="text-slate-200 font-mono font-bold tracking-tight">
              {botRunning ? formattedUptimeStr : "Secured (00:00:00)"}
            </span>
          </div>
        </div>

        {/* Toggle trigger buttons */}
        <div className="mt-4">
          <button
            onClick={() => {
              if (botRunning) {
                setBotRunning(false);
                addNotification("Bot Suspend", "Secondary bot secure-hold initiated.", "warning");
              } else {
                setBotRunning(true);
                addNotification("Bot Resume", "Dynamic machine-learning trading script rebooted.", "success");
              }
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer transition-all ${
              botRunning 
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.35)] active:scale-95" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] active:scale-95"
            }`}
          >
            <StopCircle className="h-4 w-4 shrink-0 fill-current" />
            <span>{botRunning ? "Stop Bot Service" : "Boot Engine Agent"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Real-time Live Trade Stream Feed */}
      <div className="glass-panel rounded-2xl p-4 bg-slate-950/20 border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px] hover:border-slate-700/60 transition-all">
        <div>
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3 select-none">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">
              Live Trade Ledger Feed
            </span>
            <span className="flex items-center text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase animate-pulse">
              Live Feed
            </span>
          </div>

          <div className="space-y-2.5 max-h-[235px] overflow-y-auto pr-1 scrollbar-none">
            {feedTrades.map((t) => {
              if (t.type === "ALERT" || t.type === "TRIGGER") {
                const borderS = t.severity === "danger" ? "border-rose-500/20 bg-rose-500/5 text-rose-400" :
                                t.severity === "warning" ? "border-amber-500/20 bg-amber-500/5 text-amber-400" :
                                t.severity === "success" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" :
                                "border-cyan-500/20 bg-cyan-500/5 text-cyan-400";
                return (
                  <div 
                    key={t.id} 
                    className={`flex flex-col text-[10px] font-mono p-1.5 rounded border ${borderS} transition-all group select-none relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5 select-none">
                      <span className="flex items-center space-x-1 uppercase text-[8px] tracking-wider">
                        <span className={`w-1 h-1 rounded-full animate-pulse ${
                          t.severity === "danger" ? "bg-rose-400" : t.severity === "warning" ? "bg-amber-400" : "bg-cyan-400"
                        }`} />
                        <span>{t.type}</span>
                      </span>
                      <span className="text-[8px] font-normal text-slate-500">{getRelativeMinutes(t.timestamp)}</span>
                    </div>
                    <div className="text-slate-350 font-sans font-medium leading-relaxed">{t.message}</div>
                  </div>
                );
              }

              const isBuy = t.type === "BUY";
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between text-[11px] font-mono p-1 rounded hover:bg-white/[0.02] transition-colors group select-none"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-1 h-1.5 rounded-full ${isBuy ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <span className={`font-bold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.type}
                    </span>
                    <span className="text-slate-300 font-bold group-hover:text-white transition-colors">{t.asset}/USDT</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-right">
                    <span className="text-slate-400">
                      ${new Intl.NumberFormat("en-US", { maximumFractionDigits: t.asset === "XRP" ? 4 : 2 }).format(t.price || 0)}
                    </span>
                    <span className={`font-bold ${isBuy ? "text-emerald-400" : "text-rose-450"}`}>
                      {isBuy ? "+" : ""}{t.size}
                    </span>
                    <span className="text-[9px] text-slate-500">{getRelativeMinutes(t.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-600 select-none">
          <span>Binance Telemetry #14</span>
          <span className="text-blue-500 font-bold flex items-center space-x-1">
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce mr-0.5" />
            <span>Streaming JSON WebSocket Connection</span>
          </span>
        </div>
      </div>

      {/* SECTION 3: AI Confidence Scores */}
      <div className="glass-panel rounded-2xl p-4 bg-slate-950/20 border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px] hover:border-slate-700/60 transition-all">
        <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-2 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            AI Confidence Score
          </span>
          <span className={`text-[10px] font-black uppercase transition-colors ${confidenceScore >= 85 ? "text-emerald-400" : "text-cyan-400"}`}>
            {confidenceScore >= 85 ? "Strong Buy" : "Consolidating"}
          </span>
        </div>

        {/* Segmented multicolor Speedometer Gauge */}
        <div className="relative flex items-center justify-center h-[90px] mt-2 mb-1">
          <div className="relative w-[130px] h-[75px] overflow-hidden">
            <svg className="w-full h-[130px] absolute top-0 left-0" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="speedo-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M 15 80 A 40 40 0 0 1 85 80"
                fill="none"
                stroke="#111827"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M 15 80 A 40 40 0 0 1 85 80"
                fill="none"
                stroke="url(#speedo-grad)"
                strokeWidth="5.5"
                strokeDasharray="180"
                strokeDashoffset={180 - (confidenceScore / 100) * 180}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              {(() => {
                const angleRad = Math.PI - (confidenceScore / 100) * Math.PI;
                const needleX = 50 + 34 * Math.cos(angleRad);
                const needleY = 80 - 34 * Math.sin(angleRad);
                return (
                  <line
                    x1="50"
                    y1="80"
                    x2={needleX}
                    y2={needleY}
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                );
              })()}
            </svg>

            <div className="absolute top-[35px] left-0 right-0 text-center flex flex-col items-center justify-center leading-none select-none">
              <span className="text-2xl font-display font-black text-white leading-none">
                {confidenceScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Signals Indicators details */}
        <div className="grid grid-cols-3 gap-1 grid-flow-row mt-1 text-center font-mono">
          <div className="p-1 px-1.5 rounded-xl border border-white/5 bg-slate-900/60 select-none">
            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Momentum Score</span>
            <span className="text-emerald-400 text-[10px] font-bold mt-0.5 leading-none">{momentumBullish}% Bullish</span>
          </div>
          <div className="p-1 px-1.5 rounded-xl border border-white/4 bg-slate-900/60 select-none">
            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Spread Index</span>
            <span className="text-blue-400 text-[10px] font-bold mt-0.5 leading-none">Healthy</span>
          </div>
          <div className="p-1 px-1.5 rounded-xl border border-white/5 bg-slate-900/60 select-none">
            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Market strength</span>
            <span className="text-teal-400 text-[10px] font-bold mt-0.5 leading-none">{marketAlpha}% alpha</span>
          </div>
        </div>

      </div>

    </div>
  </div>
  );
}
