/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Stocks & Indexes Desk Panel Component
 */

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, TrendingDown, Landmark, Building2, Apple, ChevronRight, 
  BarChart4, ArrowUpRight, ArrowDownRight, Compass, Key, Play, Eye
} from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export function StocksIndexesPanel() {
  const {
    allQuotes,
    setSelectedAsset,
    setActiveTab,
    manualExecuteSimulatedTrade,
    addNotification,
    theme
  } = useTerminal();

  // Selected Stock or Index symbol in the panel scope
  const [selectedAssetLocal, setSelectedAssetLocal] = useState<string>("AAPL");
  const [manualTradeSize, setManualTradeSize] = useState<number>(10); // Default size shares/contracts

  // Filter keys for local view
  const [activeCategory, setActiveCategory] = useState<"ALL" | "STOCK" | "INDEX">("ALL");

  const supportedList = useMemo(() => {
    return [
      { symbol: "AAPL", name: "Apple Inc.", type: "STOCK", sector: "Technology", exchange: "NASDAQ", pe: "37.42", cap: "$4.41T", dividend: "0.52%", high52: "$299.20", low52: "$169.21", beta: "1.12" },
      { symbol: "NVDA", name: "NVIDIA Corp.", type: "STOCK", sector: "Semiconductors", exchange: "NASDAQ", pe: "49.82", cap: "$4.88T", dividend: "0.03%", high52: "$153.13", low52: "$86.45", beta: "1.85" },
      { symbol: "TSLA", name: "Tesla Inc.", type: "STOCK", sector: "Automotive/Clean Energy", exchange: "NASDAQ", pe: "112.80", cap: "$1.23T", dividend: "N/A", high52: "$488.54", low52: "$138.80", beta: "1.62" },
      { symbol: "MSFT", name: "Microsoft Corp.", type: "STOCK", sector: "Software/Cloud Computing", exchange: "NASDAQ", pe: "35.10", cap: "$2.79T", dividend: "0.72%", high52: "$468.35", low52: "$315.18", beta: "0.95" },
      { symbol: "S&P 500", name: "S&P 500 Index", type: "INDEX", sector: "US Tech/Financials/Health", exchange: "SPX", pe: "24.81", cap: "N/A", dividend: "1.32%", high52: "7,459.12", low52: "4,920.31", beta: "1.00" },
      { symbol: "NASDAQ 100", name: "NASDAQ 100 Index", type: "INDEX", sector: "US Elite Technology", exchange: "NDX", pe: "28.52", cap: "N/A", dividend: "0.85%", high52: "30,204.82", low52: "17,624.13", beta: "1.24" }
    ];
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return supportedList.filter(item => {
      if (activeCategory === "ALL") return true;
      return item.type === activeCategory;
    });
  }, [supportedList, activeCategory]);

  const selectedMeta = useMemo(() => {
    return supportedList.find(item => item.symbol === selectedAssetLocal) || supportedList[0];
  }, [supportedList, selectedAssetLocal]);

  // Live price quote for selection
  const liveQuote = allQuotes[selectedAssetLocal] || {
    price: 0,
    changePercent: 0,
    volume: 0,
    high: 0,
    low: 0
  };

  const handleLoadInChart = () => {
    // Normalise Index name or stock name for main chart
    let rawAsset = selectedAssetLocal;
    if (selectedAssetLocal === "S&P 500") rawAsset = "S&P 500";
    if (selectedAssetLocal === "NASDAQ 100") rawAsset = "NASDAQ 100";
    setSelectedAsset(rawAsset);
    setActiveTab("dashboard");
    addNotification("Graph Loaded", `Switched main chart view to simulated live feeds for ${selectedAssetLocal}.`, "success");
  };

  const handleExecuteTrade = (direction: "BUY" | "SELL") => {
    manualExecuteSimulatedTrade(selectedAssetLocal, direction);
  };

  // Simulated VWAP, RSI and EMA9 calculations
  const simulatedIndicators = useMemo(() => {
    const isUp = liveQuote.changePercent >= 0;
    const baseP = liveQuote.price;
    const rsi = isUp ? 58.2 + (Math.random() * 5) : 42.1 - (Math.random() * 5);
    const vwap = isUp ? baseP * 0.994 : baseP * 1.006;
    const ema9 = isUp ? baseP * 0.9972 : baseP * 1.0028;
    return {
      rsi: parseFloat(rsi.toFixed(1)),
      vwap: parseFloat(vwap.toFixed(2)),
      ema9: parseFloat(ema9.toFixed(2)),
      vwapStatus: isUp ? "BULLISH SUPPORT" : "BEARISH RESISTANCE",
      ema9Status: isUp ? "CROSSOVER HIGHER" : "CROSSOVER LOWER"
    };
  }, [liveQuote.price, liveQuote.changePercent]);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">
      
      {/* Visual Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white leading-none">Stocks & Indexes Desk</h1>
          <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-1.5 uppercase font-bold">
            Simulated Global Equites Feed & Algorithmic Index Analytics
          </p>
        </div>

        {/* Category toggles */}
        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[10px] uppercase font-bold">
          {(["ALL", "STOCK", "INDEX"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.8 rounded-lg transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600/20 text-white font-bold border border-blue-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat === "ALL" ? "All Sectors" : cat === "STOCK" ? "Equities" : "Indexes"}
            </button>
          ))}
        </div>
      </div>
      
      {/* Delayed Quotes Info Banner */}
      <div className="text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800 rounded px-3 py-1.5">
        ℹ Prices shown are end-of-day delayed quotes. Market hours: Mon–Fri 9:30AM–4:00PM ET.
      </div>

      {/* Grid: Tickers Panel (2/3) + Selected Asset Showcase (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Tickers list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/20 border border-slate-800/80">
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider text-slate-400 mb-3 block">
              Continuous Broker Feed
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono uppercase text-slate-500">
                    <th className="py-2">Identifier</th>
                    <th className="py-2">Company/Index Name</th>
                    <th className="py-2">Exchange Class</th>
                    <th className="py-2 text-right">Simulated Price</th>
                    <th className="py-2 text-right">Daily Yield</th>
                    <th className="py-2 text-right">Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] text-slate-300">
                  {filteredList.map((item) => {
                    const quote = allQuotes[item.symbol] || { price: 0, changePercent: 0 };
                    const isPositive = quote.changePercent >= 0;
                    const isSelected = selectedAssetLocal === item.symbol;
                    
                    return (
                      <tr 
                        key={item.symbol}
                        onClick={() => setSelectedAssetLocal(item.symbol)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? "bg-blue-600/5 text-white" : "hover:bg-white/[0.01]"
                        }`}
                      >
                        <td className="py-3 font-bold font-sans">
                          <div className="flex items-center space-x-2">
                            {item.type === "STOCK" ? (
                              <Building2 className={`h-3.5 w-3.5 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                            ) : (
                              <Landmark className={`h-3.5 w-3.5 ${isSelected ? "text-purple-400" : "text-slate-500"}`} />
                            )}
                            <span className={isSelected ? "text-blue-400" : "text-slate-200"}>{item.symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 font-sans text-slate-400">{item.name}</td>
                        <td className="py-3 text-slate-500 uppercase">{item.exchange}</td>
                        <td className={`py-3 text-right font-bold text-white`}>
                          ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(quote.price)}
                        </td>
                        <td className={`py-3 text-right font-black ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "▲ +" : "▼ "}{quote.changePercent.toFixed(2)}%
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center justify-center p-1 rounded-lg bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Sectors Heatmap indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: "tech", label: "US Tech Sector", score: "+1.84%", status: "UP", color: "text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/20" },
              { id: "semi", label: "Global Semiconductor", score: "+3.45%", status: "UP", color: "text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/20" },
              { id: "auto", label: "Clean Mobility/Auto", score: "-1.10%", status: "DOWN", color: "text-rose-400 bg-rose-500/5 hover:border-rose-500/20" },
              { id: "macro", label: "Macro Inflation Index", score: "0.04%", status: "FLAT", color: "text-blue-400 bg-blue-500/5 hover:border-blue-500/20" }
            ].map((sect) => (
              <div 
                key={sect.id}
                className={`glass-panel rounded-xl p-3 bg-slate-950/10 border border-slate-905 transition-colors ${sect.color} select-none`}
              >
                <span className="text-[8.5px] uppercase font-mono tracking-wider block text-slate-500">{sect.label}</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-sm font-black font-mono">{sect.score}</span>
                  <span className="text-[8px] font-bold uppercase">{sect.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed asset statistics desk */}
        <div className="space-y-4">
          
          {/* Main profile card */}
          <div className="glass-panel rounded-2xl p-5 bg-gradient-to-b from-slate-950/80 to-slate-900 border-slate-800/80 space-y-4">
            <div className="pb-3 border-b border-white/5 flex justify-between items-start">
              <div>
                <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                  {selectedMeta.type} Profile
                </span>
                <h2 className="text-lg font-black text-slate-100 mt-1 font-sans tracking-tight">{selectedMeta.symbol}</h2>
                <p className="text-[11px] text-slate-500 leading-tight font-sans mt-0.5">{selectedMeta.name}</p>
              </div>

              {/* Price print */}
              <div className="text-right">
                <span className="text-base font-black font-mono text-white block">
                  ${liveQuote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-mono font-bold ${liveQuote.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {liveQuote.changePercent >= 0 ? "▲ +" : "▼ "}{liveQuote.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Quick Profile Variables */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">Market Capitalization</span>
                <span className="text-slate-205 font-bold block mt-0.5">{selectedMeta.cap}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">PE Valuation Ratio</span>
                <span className="text-slate-205 font-bold block mt-0.5">{selectedMeta.pe}x</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">52-week High Target</span>
                <span className="text-slate-205 font-bold block mt-0.5">${selectedMeta.high52}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">52-week Low Floor</span>
                <span className="text-slate-205 font-bold block mt-0.5">${selectedMeta.low52}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">Equity Beta Metric</span>
                <span className="text-slate-205 font-bold block mt-0.5">{selectedMeta.beta}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-tight block">Dividend Yield</span>
                <span className="text-slate-205 font-bold block mt-0.5">{selectedMeta.dividend}</span>
              </div>
            </div>

            {/* Core Action Button */}
            <div className="pt-2">
              <button
                onClick={handleLoadInChart}
                className="w-full py-2.8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
              >
                <Eye className="h-4 w-4" />
                <span>LOAD IN MAIN GRAPH</span>
              </button>
            </div>
          </div>

          {/* Core Programmed Technical indicators panel - VWAP, RSI, EMA9 */}
          <div className="glass-panel rounded-2xl p-5 bg-slate-950/40 border-slate-800/80 space-y-3.5 select-none font-sans">
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider text-slate-400 pb-2 border-b border-white/5">
              Programmed Algorithmic Indicators
            </h3>

            <div className="space-y-2.5 text-xs">
              
              {/* VWAP */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block leading-none">VWAP (1-Period Avg)</span>
                  <span className="text-purple-400 font-bold block mt-1 font-mono">${simulatedIndicators.vwap}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-purple-400 font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                    {simulatedIndicators.vwapStatus}
                  </span>
                </div>
              </div>

              {/* RSI (14) */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block leading-none">RSI (14-Interval)</span>
                  <span className="text-yellow-400 font-bold block mt-1 font-mono">{simulatedIndicators.rsi}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                    simulatedIndicators.rsi > 70 ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" :
                    simulatedIndicators.rsi < 30 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                    "text-slate-400 bg-slate-500/10 border border-slate-505"
                  }`}>
                    {simulatedIndicators.rsi > 70 ? "OVERBOUGHT" : simulatedIndicators.rsi < 30 ? "OVERSOLD" : "BALANCED RANGE"}
                  </span>
                </div>
              </div>

              {/* EMA9 */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block leading-none">EMA (9-Period Line)</span>
                  <span className="text-emerald-400 font-bold block mt-1 font-mono">${simulatedIndicators.ema9}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {simulatedIndicators.ema9Status}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Trade simulator execution bridge */}
          <div className="glass-panel rounded-2xl p-4.5 bg-slate-950/25 border-slate-800/80 space-y-3 font-sans">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider text-slate-400">
              Execution Bridge
            </h4>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-mono text-[9px] uppercase">Trade Allocation Shares/Capital</label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={manualTradeSize}
                    onChange={(e) => setManualTradeSize(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent text-slate-200 font-bold text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-bold uppercase ml-2 select-none">Shares</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  onClick={() => handleExecuteTrade("BUY")}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all font-black text-white uppercase text-[10px] tracking-wider cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Simulate BUY</span>
                </button>
                <button
                  onClick={() => handleExecuteTrade("SELL")}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 transition-all font-black text-white uppercase text-[10px] tracking-wider cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
                >
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  <span>Simulate SELL</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
