import React, { useState } from "react";
import { Terminal, Clock, Wifi, WifiOff, X, Cpu, RefreshCw } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { socketDiagnostics, binanceConnectionStatus, theme } = useTerminal();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "RECONNECTING":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse";
      default:
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return "No messages received";
    const date = new Date(ts);
    return date.toLocaleTimeString() + "." + String(date.getMilliseconds()).padStart(3, "0");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-2 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            binanceConnectionStatus === "CONNECTED"
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/80"
              : binanceConnectionStatus === "RECONNECTING"
              ? "bg-amber-950/80 border-amber-500/30 text-amber-400 hover:bg-amber-900/80 animate-pulse"
              : "bg-slate-900/95 border-slate-700/50 text-cyan-400 hover:bg-slate-800"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
            Diagnostics Engine
          </span>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              binanceConnectionStatus === "CONNECTED" ? "bg-emerald-400" : binanceConnectionStatus === "RECONNECTING" ? "bg-amber-450" : "bg-cyan-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              binanceConnectionStatus === "CONNECTED" ? "bg-emerald-500" : binanceConnectionStatus === "RECONNECTING" ? "bg-amber-500" : "bg-cyan-500"
            }`} />
          </span>
        </button>
      )}

      {/* Expanded Diagnostics Drawer Panel */}
      {isOpen && (
        <div className="w-80 p-5 rounded-2xl border border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col space-y-4">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-white font-mono tracking-wide uppercase">
                Terminal Diagnostics Node
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Connection Overview */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Binance WS Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${getStatusColor(socketDiagnostics.status)}`}>
                {socketDiagnostics.status}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Data Source Status</span>
              <span className={`font-mono font-black ${
                socketDiagnostics.status === "CONNECTED" ? "text-emerald-400 animate-pulse" : "text-amber-400"
              }`}>
                {socketDiagnostics.status === "CONNECTED" ? "LIVE BINANCE" : "SIMULATED DATA"}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Reconnection Try</span>
              <span className="font-mono text-slate-300">
                {socketDiagnostics.reconnectAttempts} / 5 Attempts
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center space-x-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>Last payload time</span>
              </span>
              <span className="font-mono text-[10px] text-slate-300">
                {formatTime(socketDiagnostics.lastMessageTimestamp)}
              </span>
            </div>
          </div>

          {/* Real-time price cache verification */}
          <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Live Decoded Ticker Cache
            </h4>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-slate-450">BTC/USDT</span>
                <span className="text-emerald-450 font-bold">
                  ${socketDiagnostics.prices["BTC/USDT"]?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-slate-450">ETH/USDT</span>
                <span className="text-emerald-450 font-bold">
                  ${socketDiagnostics.prices["ETH/USDT"]?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-slate-450">SOL/USDT</span>
                <span className="text-emerald-450 font-bold">
                  ${socketDiagnostics.prices["SOL/USDT"]?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Watchdog status indicator */}
          <div className="flex items-center space-x-1 px-1.5 text-[9px] font-mono text-slate-500 uppercase">
            <RefreshCw className="h-2.5 w-2.5 animate-spin text-blue-500" />
            <span>60-sec auto silence rescue active</span>
          </div>

        </div>
      )}
    </div>
  );
}
