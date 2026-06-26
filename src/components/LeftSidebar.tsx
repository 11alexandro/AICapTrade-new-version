/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  TrendingUp, Cpu, Play, ArrowUpRight, Sliders, Shield, 
  BarChart2, History, Database, Settings, Activity, X
} from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export default function LeftSidebar({ onClose }: { onClose?: () => void }) {
  const { 
    activeTab, 
    setActiveTab, 
    latency, 
    botRunning,
    apiConnected,
    theme,
    binanceConnectionStatus
  } = useTerminal();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "stocks-indexes", label: "Stocks & Indexes Desk", icon: Activity },
    { id: "market-streams", label: "Market Streams", icon: Cpu },
    { id: "bot-controls", label: "Bot Controls", icon: Play },
    { id: "active-positions", label: "Active Positions", icon: ArrowUpRight },
    { id: "strategy-settings", label: "Strategy Settings", icon: Sliders },
    { id: "risk-management", label: "Risk Management", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "trade-history", label: "Trade History", icon: History },
    { id: "api-manager", label: "API Provider Status", icon: Database },
    { id: "settings", label: "Preferences & System", icon: Settings },
  ];

  return (
    <aside className={`w-full h-full flex flex-col justify-between p-4 ${theme === "light" ? "bg-white border-r border-slate-200 text-slate-800" : "bg-slate-950 border-r border-slate-800/80 text-white"} font-sans select-none overflow-y-auto overflow-x-hidden scrollbar-none`}>
      <div className="flex flex-col space-y-4">
        {/* Logo and Brand Banner */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              setActiveTab("dashboard");
              if (onClose) onClose();
            }} 
            className="flex items-center space-x-2 px-2 py-1 cursor-pointer group flex-1"
          >
            <div className="flex items-center justify-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 glow-blue group-hover:scale-105 transition-transform">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <span className={`font-display font-black text-lg tracking-tight ${theme === "light" ? "text-slate-900" : "bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent"}`}>
                AICapTrade
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest leading-none mt-0.5">
                AI Trading Terminal
              </span>
            </div>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5 lg:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`relative w-full px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-3 cursor-pointer group ${
                  isActive
                    ? "text-white bg-blue-600/20 border border-blue-500/35 glow-blue shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-bold"
                    : `${theme === "light" ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"} border border-transparent`
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-blue-400 rounded-r-md glow-blue-strong" />
                )}
                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                  isActive ? "text-blue-400 font-bold" : "text-slate-400 group-hover:text-slate-300"
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Connection Status Telemetry Card */}
      <div className={`flex flex-col space-y-3 pt-4 border-t ${theme === "light" ? "border-slate-200" : "border-white/5"}`}>
        <div className={`p-4 rounded-2xl ${theme === "light" ? "bg-slate-100/60 border-slate-200 shadow-sm shadow-slate-200/50" : "bg-gradient-to-br from-slate-900/80 to-slate-950 border-slate-800/80 hover:border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"} border transition-all`}>
          <div className={`flex flex-col space-y-2 pb-2 border-b ${theme === "light" ? "border-slate-200" : "border-white/10"} mb-3`}>
            <span className={`text-[10px] font-bold ${theme === "light" ? "text-slate-600" : "text-slate-300"} uppercase tracking-wider`}>
              Connection Status
            </span>
            <span className={`flex items-center text-[9px] font-mono font-bold px-2 py-1 rounded border gap-1.5 self-start ${
              binanceConnectionStatus === "CONNECTED"
                ? `${theme === "light" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`
                : binanceConnectionStatus === "RECONNECTING"
                ? `${theme === "light" ? "text-amber-700 bg-amber-50 border-amber-200 animate-pulse" : "text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse"}`
                : `${theme === "light" ? "text-cyan-700 bg-cyan-50 border-cyan-200" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"}`
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  binanceConnectionStatus === "CONNECTED" ? "bg-emerald-400" : binanceConnectionStatus === "RECONNECTING" ? "bg-amber-400" : "bg-cyan-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  binanceConnectionStatus === "CONNECTED" ? "bg-emerald-500" : binanceConnectionStatus === "RECONNECTING" ? "bg-amber-500" : "bg-cyan-500"
                }`} />
              </span>
              <span>
                {binanceConnectionStatus === "CONNECTED"
                  ? "Connected to Binance"
                  : binanceConnectionStatus === "RECONNECTING"
                  ? "Reconnecting"
                  : "Simulated Data Mode"}
              </span>
            </span>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center">
              <span className={`flex items-center gap-1.5 ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                <Database className={`h-3 w-3 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`} />
                <span>Binance API</span>
              </span>
              <span className={`font-bold ${
                binanceConnectionStatus === "CONNECTED"
                  ? (theme === "light" ? "text-emerald-600" : "text-emerald-400")
                  : binanceConnectionStatus === "RECONNECTING"
                  ? (theme === "light" ? "text-amber-600" : "text-amber-400")
                  : (theme === "light" ? "text-cyan-600" : "text-cyan-400")
              }`}>
                {binanceConnectionStatus === "CONNECTED"
                  ? "Connected"
                  : binanceConnectionStatus === "RECONNECTING"
                  ? "Reconnecting"
                  : "Simulated"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={theme === "light" ? "text-slate-600" : "text-slate-300"}>Latency</span>
              <span className={`${
                binanceConnectionStatus === "CONNECTED"
                  ? (theme === "light" ? "text-emerald-600" : "text-emerald-400")
                  : (theme === "light" ? "text-slate-500" : "text-slate-500")
              } font-bold`}>
                {binanceConnectionStatus === "CONNECTED" ? `${latency} ms` : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={theme === "light" ? "text-slate-600" : "text-slate-300"}>Uptime</span>
              <span className={`${theme === "light" ? "text-emerald-600" : "text-emerald-400"} font-bold`}>{botRunning ? "99.98%" : "100.00%"}</span>
            </div>
          </div>

          {/* Sparkline live status graph in connection panel */}
          <div className="h-6 w-full mt-3.5 flex items-end justify-between px-0.5 gap-0.5 opacity-60">
            {Array.from({ length: 16 }).map((_, i) => {
              const h = Math.floor(Math.random() * 12) + 4;
              return (
                <div 
                  key={i} 
                  className="w-1 rounded-t bg-blue-500/50 hover:bg-blue-400 transition-colors"
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* View System Health Action button */}
        <button 
          onClick={() => setActiveTab("analytics")} 
          className="w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-400/40 text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5 group cursor-pointer shadow-[0_2px_12px_rgba(59,130,246,0.1)] active:scale-95"
        >
          <Activity className="h-3.5 w-3.5 animate-pulse text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>View System Health</span>
        </button>
      </div>
    </aside>
  );
}
