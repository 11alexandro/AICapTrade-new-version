/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Award, Activity, Sliders, ChevronDown, CheckCircle, 
  Database, Code2, Shield, Settings, Play, Pause, ShieldAlert, AlertCircle,
  ArrowUpRight, ArrowDownRight, Compass, HelpCircle, X, Search, RefreshCw,
  Lock, Key, SlidersHorizontal, CheckSquare, Trash2, Heart, ExternalLink, Sliders as SlidersIcon
} from "lucide-react";

import { TerminalStateProvider, useTerminal, Position } from "./store/TerminalStateContext";
import LeftSidebar from "./components/LeftSidebar";
import HeaderBar from "./components/HeaderBar";
import MetricsGrid from "./components/MetricsGrid";
import TradingChart from "./components/TradingChart";
import SidebarAnalytics from "./components/SidebarAnalytics";
import BottomAnalytics from "./components/BottomAnalytics";
import { WatchlistPanel } from "./components/WatchlistPanel";
import { StrategyScannerPanel } from "./components/StrategyScannerPanel";
import { SimulatorControls } from "./components/SimulatorControls";
import { PortfolioAnalyticsPanel } from "./components/PortfolioAnalyticsPanel";
import { StocksIndexesPanel } from "./components/StocksIndexesPanel";
import DebugPanel from "./components/DebugPanel";

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    btcPrice,
    btcChangePercent,
    ethPrice,
    ethChangePercent,
    solPrice,
    solChangePercent,
    xrpPrice,
    xrpChangePercent,
    totalBalance,
    totalProfit,
    winRate,
    totalTrades,
    activePositions,
    closePosition,
    tradeHistory,
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
    latency,
    apiConnected,
    setApiConnected,
    apiKeyRegistered,
    setApiKeyRegistered,
    apiPublicKey,
    setApiPublicKey,
    apiSecretKey,
    setApiSecretKey,
    addNotification,
    addPosition,
    theme,
    setTheme,
    institutionalEmail,
    setInstitutionalEmail,
    traderAlias,
    setTraderAlias,
    dailyEpochs,
    activeDailyEpoch,
    epochTimeRemaining,
    rebootSystem,
    allocatedCapitalPercent,
    setAllocatedCapitalPercent
  } = useTerminal();

  // Active inputs states for custom sheets or forms
  const [exchangeApiKey, setExchangeApiKey] = useState(apiPublicKey);
  const [exchangeSecretKey, setExchangeSecretKey] = useState(apiSecretKey);
  const [connectionSuccessText, setConnectionSuccessText] = useState("");

  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historySortOrder, setHistorySortOrder] = useState<"desc" | "asc">("desc");

  // Create active positions builder manually inside page
  const [customPositionSymbol, setCustomPositionSymbol] = useState("BTCUSDT");
  const [customPositionSide, setCustomPositionSide] = useState<"LONG" | "SHORT">("LONG");
  const [customPositionLeverage, setCustomPositionLeverage] = useState(10);
  const [customPositionSize, setCustomPositionSize] = useState(0.5);

  const triggerCustomPosition = () => {
    let entryPrice = btcPrice;
    if (customPositionSymbol === "ETHUSDT") entryPrice = ethPrice;
    if (customPositionSymbol === "SOLUSDT") entryPrice = solPrice;
    if (customPositionSymbol === "XRPUSDT") entryPrice = xrpPrice;

    addPosition({
      symbol: customPositionSymbol,
      type: customPositionSide,
      leverage: customPositionLeverage,
      size: customPositionSize,
      entryPrice,
      markPrice: entryPrice,
      duration: "00:00:01"
    });
  };

  const handleExchangeSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiPublicKey(exchangeApiKey);
    setApiSecretKey(exchangeSecretKey);
    setApiKeyRegistered(true);
    setApiConnected(true);
    setConnectionSuccessText("Binance gateway endpoint compiled & synchronized successfully with active latency at 24ms.");
    addNotification("Exchange API Linked", "New secret proxy pathways securely configured and bound.", "success");
    setTimeout(() => {
      setConnectionSuccessText("");
    }, 5000);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatXRPString = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(val);
  };

  return (
    <div className={`min-h-screen ${theme === "light" ? "light-mode-active bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-105"} flex overflow-hidden font-sans relative`}>
      
      {/* Background neon gleres */}
      <div className="absolute top-[-5%] left-[-10%] w-[45vw] h-[45vw] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Left Navigation panels */}
      <LeftSidebar />

      {/* Main deck viewport containers */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        
        {/* Header containing Tickers and Search Command bar */}
        <HeaderBar />

        <main className="flex-1 pb-10">
          
          {/* TAB 1: Live Cockpit Dashboard Layout */}
          {activeTab === "dashboard" && (
            <div className="max-w-7xl mx-auto w-full flex flex-col items-stretch space-y-4">
              
              {/* PRIMARY LEFT SIDE MODULE: Chart, Metrics & Bottom controllers */}
              <div className="flex-1 flex flex-col min-w-0">
                
                {/* 1. TOP ANALYTICS STATS ROW */}
                <MetricsGrid />

                {/* 2. CHANNELS PLOTTED TRADING VIEW CANVAS */}
                <div className="px-6 py-2">
                  <TradingChart />
                </div>

                {/* 3. ROW 4: BOTTOM SLIDERS ACTION METRIC CONTROLLERS */}
                <BottomAnalytics />

                {/* 4. Active positions vault list */}
                <div className="px-6 py-2">
                  <div className="glass-panel rounded-2xl p-5 bg-slate-950/30 border-slate-800/80 shadow-2xl overflow-hidden mt-1">
                    <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3 select-none">
                      <span className="text-xs font-bold text-slate-400 font-sans">Active Exposure Positions ({activePositions.length})</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/25 font-bold uppercase tracking-wide">Dynamic Ledger Logs</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                            <th className="py-2.5">Asset Pair</th>
                            <th className="py-2.5">Type / Leverage</th>
                            <th className="py-2.5">Exposure Size</th>
                            <th className="py-2.5">Entry Price</th>
                            <th className="py-2.5">Mark Price</th>
                            <th className="py-2.5">Liquidation Threshold</th>
                            <th className="py-2.5 text-right">Profit / Loss</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px] text-slate-300">
                          {activePositions.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-500">
                                No active exposure positions. Open a position from the chart buy/sell controls.
                              </td>
                            </tr>
                          ) : (
                            activePositions.map((pos) => {
                              const isPositive = pos.pnl >= 0;
                              return (
                                <tr key={pos.id} className="hover:bg-white/[0.01] transition-colors group">
                                  <td className="py-3 font-sans font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                                    {pos.symbol.replace("USDT", "/USDT")}
                                  </td>
                                  <td className="py-3">
                                    <span className={`text-[9px] font-sans px-2 py-0.5 rounded border font-bold uppercase ${
                                      pos.type === "LONG"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                    }`}>
                                      {pos.type} {pos.leverage}X
                                    </span>
                                  </td>
                                  <td className="py-3">{pos.size} {pos.symbol.replace("USDT", "")}</td>
                                  <td className="py-3 text-slate-400">{pos.symbol === "XRPUSDT" ? formatXRPString(pos.entryPrice) : formatMoney(pos.entryPrice)}</td>
                                  <td className="py-3 text-blue-400">{pos.symbol === "XRPUSDT" ? formatXRPString(pos.markPrice) : formatMoney(pos.markPrice)}</td>
                                  <td className="py-3 text-rose-400">{pos.symbol === "XRPUSDT" ? formatXRPString(pos.liquidationPrice) : formatMoney(pos.liquidationPrice)}</td>
                                  <td className={`py-3 text-right font-black ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                    {isPositive ? "+" : ""}{formatMoney(pos.pnl)} ({isPositive ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => closePosition(pos.id)}
                                      className="px-2.5 py-1 text-[9px] font-sans font-bold bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded border border-rose-500/15 hover:border-transparent transition-all cursor-pointer active:scale-95"
                                    >
                                      CLOSE OUT
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECONDARY RIGHT MODULES DETAILS */}
              <SidebarAnalytics />

            </div>
          )}

          {/* TAB: Stocks & Indexes Desk */}
          {activeTab === "stocks-indexes" && (
            <StocksIndexesPanel />
          )}

          {/* TAB 2: Market Streaming View */}
          {activeTab === "market-streams" && (
            <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h1 className="text-2xl font-display font-black text-white leading-none">Multi-Asset Desk Streams</h1>
                  <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Scanning, Technical Indicators & Watchlist Index</p>
                </div>
                <div className="flex items-center space-x-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping mr-1" />
                  <span className="font-mono font-bold uppercase text-[9px]">L3 Desk Core Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WatchlistPanel />
                <StrategyScannerPanel />
              </div>
            </div>
          )}

          {/* TAB 3: Bot Control panel page */}
          {activeTab === "bot-controls" && (
            <div className="max-w-4xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Automated Bot Engine Center</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase">Regime Tuning, Volatility Buffers & Exposure Limits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Config sliders */}
                <div className="glass-panel rounded-2xl p-5 space-y-4 md:col-span-2">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Parametric Tuning</h3>
                  
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Algorithmic Risk Mode</span>
                        <span className="text-amber-400 font-bold font-mono">{riskLevel} Regime</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
                        {(["Low", "Medium", "High", "Institutional"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRiskLevel(r);
                              addNotification("Engine Update", `Algorithmic safety profile set to ${r}.`, "info");
                            }}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              riskLevel === r
                                ? "bg-blue-600/20 border border-blue-500/30 text-white font-bold"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-medium">Stop Loss Protection</span>
                          <span className="text-rose-400 font-bold font-mono">-{stopLoss.toFixed(2)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-rose-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-medium">Take Profit Target</span>
                          <span className="text-emerald-400 font-bold font-mono">+{takeProfit.toFixed(2)}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={takeProfit}
                          onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-medium">Reserve Capital Factor</span>
                          <span className="text-blue-400 font-bold font-mono">{capitalAllocation}%</span>
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

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-medium">Max Asset Position Size</span>
                          <span className="text-cyan-400 font-bold font-mono">{maxPositionSize} BTC</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={maxPositionSize}
                          onChange={(e) => setMaxPositionSize(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Dashboard controllers */}
                <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5 mb-3">Status Indicator</h3>
                    
                    <div className="flex justify-between items-center py-2 px-3.5 bg-slate-900/60 border border-slate-800 rounded-xl mb-3.5">
                      <span className="text-xs text-slate-400 font-medium">Core AI Status</span>
                      <span className={`text-[10px] uppercase font-mono font-bold ${botRunning ? "text-emerald-400" : "text-rose-405"}`}>
                        {botRunning ? "RUNNING LIVE" : "PAUSED"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      The automated trading module triggers Buy and Sell market actions instantly using micro-correlation models and local spread indexes when market thresholds are crossed.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setBotRunning(!botRunning)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        botRunning 
                          ? "bg-rose-500 hover:bg-rose-600 text-white" 
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      <Pause className="h-4 w-4" />
                      <span>{botRunning ? "Suspend Core AI" : "Activate Core AI"}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* JP Morgan / Goldman Sachs Institutional desk: HFT Daily Epoch & Reboot ledger */}
              <div id="hft-institutional-panel" className="glass-panel rounded-2xl p-6 bg-gradient-to-b from-slate-950/80 to-slate-900 border-slate-800/80 shadow-[0_12px_45px_rgba(0,0,0,0.7)] space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Award className="h-5 w-5 shrink-0" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-100 tracking-tight font-sans">Wall Street HFT Protocol</h2>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">JP Morgan, Goldman Sachs, & Citi Desk Emulation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
                      HFT Tier: Institutional
                    </span>
                    <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Vault Mode
                    </span>
                  </div>
                </div>

                {/* Grid stats overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                  {/* Current Segment */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Epoch</span>
                    <div>
                      <div className="text-base text-white font-black">Day #{activeDailyEpoch.epochNumber}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Allocated {allocatedCapitalPercent}% Vault</div>
                    </div>
                  </div>

                  {/* Micro trades */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Microsecond Scalps</span>
                    <div>
                      <div className="text-base text-amber-400 font-black animate-pulse">
                        {activeDailyEpoch.totalTradesTaken.toLocaleString()}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block uppercase">At ~1,000 trades/min</span>
                    </div>
                  </div>

                  {/* Profit realized */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Realized Daily PnL</span>
                    <div>
                      <div className={`text-base font-black ${activeDailyEpoch.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {activeDailyEpoch.realizedPnL >= 0 ? "+" : ""}{formatMoney(activeDailyEpoch.realizedPnL)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block uppercase">Settling continuous margins</span>
                    </div>
                  </div>

                  {/* Timer / Manual Reset controls */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rollover Countdown</span>
                    <div>
                      <div className="text-sm text-blue-400 font-black">
                        {Math.floor(epochTimeRemaining / 60)}m {epochTimeRemaining % 60}s
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-1.5">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-1000" 
                          style={{ width: `${(epochTimeRemaining / 180) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub configuration options for next rollover allocation pool */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-200 font-sans font-semibold">HFT Allocation Cap for Next Rollover</span>
                      <span className="text-amber-400 font-bold font-mono">{allocatedCapitalPercent}% of Portfolio</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="85"
                      step="5"
                      value={allocatedCapitalPercent}
                      onChange={(e) => {
                        setAllocatedCapitalPercent(parseInt(e.target.value));
                        addNotification("Vault Allocated Limit Modified", `Daily limit allocation bounds adjusted to ${e.target.value}% for the next reboot event.`, "info");
                      }}
                      className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Locks a secure pool component of your total balance into dedicated institutional microsecond high-frequency scalping loops upon daily restarts. Remaining collateral is held in cold reserves.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      id="manual-rollover-btn"
                      onClick={rebootSystem}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-amber-600/20 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-bold hover:text-white rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.05)]"
                    >
                      <RefreshCw className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Execute Manual Reboot & Rollover</span>
                    </button>
                  </div>
                </div>

                {/* Table list of completed archived daily journals */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-sans font-bold uppercase tracking-wider pb-1">
                    <span>Performance Archive Log</span>
                    <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded font-mono text-slate-500 font-normal">Vault History</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px] font-mono whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase text-slate-500 tracking-wider">
                          <th className="py-2">Epoch ID</th>
                          <th className="py-2">Settlement Date</th>
                          <th className="py-2">Starting Resource</th>
                          <th className="py-2">Vault Cap Limit</th>
                          <th className="py-2 text-right">Settled Trades</th>
                          <th className="py-2 text-right">Win Margin</th>
                          <th className="py-2 text-right">Settle PnL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {dailyEpochs.map((ep) => {
                          const hasProfit = ep.realizedPnL >= 0;
                          return (
                            <tr key={ep.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="py-2.5 font-sans font-bold text-slate-200">Day #{ep.epochNumber}</td>
                              <td className="py-2.5 text-slate-400">{ep.dateString}</td>
                              <td className="py-2.5">{formatMoney(ep.startingBalance)}</td>
                              <td className="py-2.5 text-slate-400">{formatMoney(ep.allocatedCapitalLimit)}</td>
                              <td className="py-2.5 text-right font-bold text-white">{ep.totalTradesTaken.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-black text-amber-500/90">{ep.winRate.toFixed(2)}%</td>
                              <td className={`py-2.5 text-right font-bold ${hasProfit ? "text-emerald-400" : "text-rose-400"}`}>
                                <span className={`inline-block px-2 py-0.5 rounded ${hasProfit ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                                  {hasProfit ? "+" : ""}{formatMoney(ep.realizedPnL)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bot Logs telemetry */}
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3 select-none">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">AI Script Execution Logs</h3>
                  <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded uppercase">nominal state</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-400 space-y-1.5 max-h-48 overflow-y-auto">
                  <p className="text-slate-600">[2026-05-30 21:40] INIT neural feed layer... done.</p>
                  <p className="text-slate-500">[2026-05-30 21:41] Proxy paths verified for Binance Spot Nodes.</p>
                  <p className="text-emerald-500">[2026-05-30 21:42] ANALYZER: btc_usd correlator crossed signal variance (+0.83). Signal status: Very Bullish.</p>
                  <p className="text-slate-500">[2026-05-30 21:43] EXECUTED order limit check... secure.</p>
                  <p className="text-slate-500">[2026-05-30 21:44] CHECK: Stop Loss and Take Profit bounds monitored. Latency delay 24ms.</p>
                  <p className="text-blue-400 animate-pulse">[2026-05-30 21:45] SYSTEM: Standby mode active. Continuous stream polling.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Active Exposure Positions ledger */}
          {activeTab === "active-positions" && (
            <div className="max-w-4xl mx-auto p-6 font-sans space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h1 className="text-2xl font-display font-black text-white leading-none">Broker Ledger Positions</h1>
                  <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Manual Margin Order Registry & Settle Ledger</p>
                </div>
                
                <span className="text-xs bg-blue-500/10 text-blue-400 font-mono font-bold px-3 py-1 rounded-xl border border-blue-500/20">
                  Collateral Balanced: {formatMoney(totalBalance)}
                </span>
              </div>

              {/* Positions Form builder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Registrator */}
                <div className="glass-panel rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Order Builder</h3>
                  
                  <div className="space-y-3 pt-1 text-xs">
                    <div>
                      <label className="text-slate-405 block mb-1">Select Ticker Pair</label>
                      <select 
                        value={customPositionSymbol}
                        onChange={(e) => setCustomPositionSymbol(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                      >
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                        <option value="XRPUSDT">XRP/USDT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-405 block mb-1">Order Direction</label>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
                        {(["LONG", "SHORT"] as const).map((side) => (
                          <button
                            key={side}
                            onClick={() => setCustomPositionSide(side)}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              customPositionSide === side
                                ? (side === "LONG" ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20" : "bg-rose-500/15 text-rose-400 font-bold border border-rose-500/20")
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {side}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-405 block mb-1">Margin Leverage</label>
                        <input
                          type="number"
                          min="1"
                          max="125"
                          value={customPositionLeverage}
                          onChange={(e) => setCustomPositionLeverage(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.8 text-slate-200 focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-405 block mb-1">Position Size</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          value={customPositionSize}
                          onChange={(e) => setCustomPositionSize(parseFloat(e.target.value) || 0.05)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.8 text-slate-200 focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={triggerCustomPosition}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                    >
                      EXECUTE ORDER
                    </button>
                  </div>
                </div>

                {/* Main Table details ledger */}
                <div className="glass-panel rounded-2xl p-5 md:col-span-2">
                  <h3 className="font-bold text-white text-sm pb-2.5 border-b border-white/5 mb-3">Live exposure positions</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                          <th className="py-2">Asset</th>
                          <th className="py-2">Leverage Direction</th>
                          <th className="py-2">Exposure Size</th>
                          <th className="py-2">Entry Price</th>
                          <th className="py-2">Mark Price</th>
                          <th className="py-2 text-right">Profit / Loss</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px] text-slate-305">
                        {activePositions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                              No active exposure positions are listed in ledger. Order standard trades from symbol stream pickers.
                            </td>
                          </tr>
                        ) : (
                          activePositions.map((pos) => {
                            const isPositive = pos.pnl >= 0;
                            return (
                              <tr key={pos.id} className="hover:bg-white/[0.01]">
                                <td className="py-3.5 font-bold font-sans text-slate-200">{pos.symbol.slice(0,3)}/{pos.symbol.slice(3)}</td>
                                <td className="py-3.5">
                                  <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded border font-bold uppercase ${
                                    pos.type === "LONG" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  }`}>
                                    {pos.type} {pos.leverage}X
                                  </span>
                                </td>
                                <td className="py-3.5">{pos.size} {pos.symbol.slice(0,3)}</td>
                                <td className="py-3.5">${new Intl.NumberFormat().format(pos.entryPrice)}</td>
                                <td className="py-3.5 text-blue-400">${new Intl.NumberFormat().format(pos.markPrice)}</td>
                                <td className={`py-3.5 text-right font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                  {isPositive ? "+" : ""}{formatMoney(pos.pnl)} ({isPositive ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                                </td>
                                <td className="py-3.5 text-right">
                                  <button
                                    onClick={() => closePosition(pos.id)}
                                    className="px-2 py-0.8 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded font-sans text-[9px] font-bold cursor-pointer active:scale-95"
                                  >
                                    SETTLE
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: Strategy Settings detail analysis */}
          {activeTab === "strategy-settings" && (
            <div className="max-w-4xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Neural Strategy Settings</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Predictive Alpha Parameters & Signal Trigger Indexes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Regime Selection</h3>
                  
                  <div className="space-y-3.5 text-xs text-slate-350">
                    <p className="leading-relaxed">
                      Toggle active algorithmic paradigms directly. Each model tunes signal thresholds depending on localized momentum shifts and order limits.
                    </p>

                    <div className="space-y-2">
                      {[
                        { id: "Mean Reversion", desc: "Monitors delta range variances off SMA channels." },
                        { id: "Scalping", desc: "Executes micro positions inside 1-minute timelines." },
                        { id: "Momentum", desc: "Triggers breakout trend directions following volume spikes." },
                        { id: "Arbitrage", desc: "Maps minor discrepancies across exchange order matrices." }
                      ].map((st) => (
                        <div 
                          key={st.id}
                          onClick={() => {
                            setStrategy(st.id);
                            addNotification("Strategy updated", `Model regime switched to ${st.id} configurations.`, "success");
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            strategy === st.id
                              ? "bg-blue-600/15 border-blue-500/35 text-white"
                              : "bg-slate-900/50 border-slate-900 text-slate-400 hover:text-slate-205"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold">{st.id} Model Selection</span>
                            {strategy === st.id && <span className="text-[8px] bg-blue-500/20 text-blue-400 rounded px-1.5 font-mono">active</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{st.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backtest simulations indicators */}
                <div className="glass-panel rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Backtest Performance Indices</h3>
                  
                  <div className="space-y-4 text-xs font-mono">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-slate-500 text-[10px] uppercase">Alpha Multiplier Coefficient</span>
                      <span className="text-white block text-base font-bold mt-0.5">1.41 alpha index</span>
                    </div>

                    <div className="border-b border-white/5 pb-2">
                      <span className="text-slate-500 text-[10px] uppercase">Sharpe Ratio Metric</span>
                      <span className="text-blue-400 block text-base font-bold mt-0.5">2.84 Sharpe</span>
                    </div>

                    <div className="border-b border-white/5 pb-2">
                      <span className="text-slate-500 text-[10px] uppercase">Standard Drawdown Limit</span>
                      <span className="text-rose-400 block text-base font-bold mt-0.5">3.48% drawdown max</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Telemetry checks</span>
                      <span className="text-emerald-400 block text-base font-bold mt-0.5">Connected</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: Risk Management views */}
          {activeTab === "risk-management" && (
            <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Simulation & Risk Management</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Simulator Controls, Stop-Loss triggers, & Exposure Settling</p>
              </div>

              <SimulatorControls />
            </div>
          )}

          {/* TAB 7: Advanced Analytics View */}
          {activeTab === "analytics" && (
            <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Simulated Portfolio Performance</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Comprehensive Class Performance Index and Win Factors</p>
              </div>

              <PortfolioAnalyticsPanel />
            </div>
          )}

          {/* TAB 8: Trade History dynamic catalog search */}
          {activeTab === "trade-history" && (
            <div className="max-w-5xl mx-auto p-6 font-sans space-y-6">
              <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-display font-black text-white leading-none">Trades History Ledger</h1>
                  <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Settled Broker Executions, Slips & Yields</p>
                </div>

                {/* Filter and Search command layout inside catalog */}
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter pairs, strategies..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/40 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none rounded-xl pl-8.5 pr-3 py-1.8"
                    />
                  </div>

                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-xl px-2 py-1.8 focus:outline-none"
                  >
                    <option value="all">Direction: All</option>
                    <option value="BUY">BUY Spot</option>
                    <option value="SELL">SELL Spot</option>
                  </select>

                  <button
                    onClick={() => setHistorySortOrder(historySortOrder === "desc" ? "asc" : "desc")}
                    className="p-2 border border-slate-800 focus:border-blue-500 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-bold tracking-tight hover:text-white transition-all cursor-pointer"
                  >
                    Sorted: {historySortOrder === "desc" ? "LATEST" : "OLDEST"}
                  </button>
                </div>
              </div>

              {/* Trade records list */}
              <div className="glass-panel rounded-2xl p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                        <th className="py-2.5">Trade Identification</th>
                        <th className="py-2.5">Market Ticker</th>
                        <th className="py-2.5">Executed Direction</th>
                        <th className="py-2.5">Settle entry</th>
                        <th className="py-2.5">Settle exit</th>
                        <th className="py-2.5">Position Size</th>
                        <th className="py-2.5">Applied strategy</th>
                        <th className="py-2.5 text-right">Net Return PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px] text-slate-300">
                      {tradeHistory
                        .filter((item) => {
                          const matchesTxt = item.pair.toLowerCase().includes(historySearchTerm.toLowerCase()) || item.strategyUsed.toLowerCase().includes(historySearchTerm.toLowerCase());
                          const matchesDir = historyStatusFilter === "all" || item.side === historyStatusFilter;
                          return matchesTxt && matchesDir;
                        })
                        .sort((a, b) => {
                          const multiplier = historySortOrder === "desc" ? 1 : -1;
                          return multiplier * (b.id.localeCompare(a.id));
                        })
                        .map((trade) => {
                          const isBuy = trade.side === "BUY";
                          return (
                            <tr key={trade.id} className="hover:bg-white/[0.01]">
                              <td className="py-4 text-slate-500">#{trade.id}</td>
                              <td className="py-4 font-bold text-white font-sans">{trade.pair}</td>
                              <td className="py-4">
                                <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-bold uppercase ${
                                  isBuy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                  {trade.side}
                                </span>
                              </td>
                              <td className="py-4">${new Intl.NumberFormat().format(trade.entry)}</td>
                              <td className="py-4">${new Intl.NumberFormat().format(trade.exit)}</td>
                              <td className="py-4 text-slate-400">{trade.size}</td>
                              <td className="py-4 text-blue-400 font-sans">{trade.strategyUsed}</td>
                              <td className="py-4 text-right font-black text-emerald-400">
                                +${trade.pnl.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: API manager broker keys config */}
          {activeTab === "api-manager" && (
            <div className="max-w-2xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Broker Integration APIs</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Secure Spot Broker Node Registration & Secret Masks</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5 flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span>Exchange gateway tunnel credentials</span>
                </h3>

                <form onSubmit={handleExchangeSave} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-405 block mb-1">Exchange endpoints protocol</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none">
                      <option>Binance Spot Exchange Live (Production node)</option>
                      <option>Binance Sandbox Test Gateway (Simulated accounts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-405 block mb-1">API Public Key identifier</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. binance_live_ak97d26_sys"
                        value={exchangeApiKey}
                        onChange={(e) => setExchangeApiKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-405 block mb-1">API Secret Cryptographic Key block</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="password"
                        placeholder="API Secret Key payload"
                        value={exchangeSecretKey}
                        onChange={(e) => setExchangeSecretKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  {connectionSuccessText && (
                    <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-350 rounded-xl font-mono text-[10px] uppercase tracking-wider">
                      {connectionSuccessText}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  >
                    LINK EXCHANGE GATEWAY
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 10: Client Preferences settings */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto p-6 font-sans space-y-6">
              <div>
                <h1 className="text-2xl font-display font-black text-white leading-none">Terminal Customization</h1>
                <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">Client Alert Protocols, Themes & Sandboxes options</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Local parameters</h3>
                
                <div className="space-y-3.5 text-xs select-none">
                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors">
                    <span>Enable live system diagnostic notifications alerts</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5" />
                  </label>

                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors">
                    <span>Activate trade confirm popups protections</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5" />
                  </label>

                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors">
                    <span>Telemetry fallback simulator protocols active load</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5" />
                  </label>

                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors">
                    <span>Automatic broker execution slippage parameter checks</span>
                    <input type="checkbox" className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5" />
                  </label>
                </div>
              </div>

              {/* Institutional Profiling Section */}
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm pb-2 border-b border-white/5">Institutional Profiling</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider font-bold">Trader Name / Alias</label>
                    <input
                      type="text"
                      value={traderAlias}
                      onChange={(e) => setTraderAlias(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs transition-colors font-semibold"
                      placeholder="e.g. TraderX"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider font-bold">Terminal Account Email</label>
                    <input
                      type="email"
                      value={institutionalEmail}
                      onChange={(e) => setInstitutionalEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs transition-colors font-mono"
                      placeholder="e.g. institutional@prime-node.net"
                    />
                  </div>
                </div>
              </div>

              {/* Developer system panel */}
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-slate-300 text-xs font-mono uppercase tracking-wider">AICAPTRADE METADATA ENDPOINTS</h3>
                <div className="divide-y divide-white/5 space-y-2 pt-1 font-mono text-[10px] text-slate-500">
                  <div className="flex justify-between items-center py-1">
                    <span>CORE REVISION VERSION</span>
                    <span>v5.24.1-spot</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>BROWSER PLATFORM INGRESS</span>
                    <span>Vite Single-Page-App Container</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>LATENCY SECURE GATEWAY</span>
                    <span>Verified connected node #14 nominal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating diagnostics watchdog module */}
      <DebugPanel />

    </div>
  );
}

export default function App() {
  return (
    <TerminalStateProvider>
      <AppContent />
    </TerminalStateProvider>
  );
}
