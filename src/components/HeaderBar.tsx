/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Sun, Moon, ChevronDown, Star, Command, Sparkles, X, CheckSquare, Trash2, ArrowUpRight, Menu } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";

export default function HeaderBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
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
    notifications,
    markAllNotificationsAsRead,
    clearAllNotifications,
    theme,
    setTheme,
    selectedAsset,
    setSelectedAsset,
    institutionalEmail,
    traderAlias,
    allQuotes,
    binanceConnectionStatus,
    stockSourceStatus
  } = useTerminal();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCompactSearch, setIsCompactSearch] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompactSearch(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Command/Suggestions entries database
  const searchSuggestions = [
    { type: "pair", label: "BTC/USDT Trading Pair", targetTab: "dashboard", val: "BTC" },
    { type: "pair", label: "ETH/USDT Trading Pair", targetTab: "dashboard", val: "ETH" },
    { type: "pair", label: "SOL/USDT Trading Pair", targetTab: "dashboard", val: "SOL" },
    { type: "pair", label: "XRP/USDT Trading Pair", targetTab: "dashboard", val: "XRP" },
    { type: "strategy", label: "Mean Reversion Bot Settings", targetTab: "strategy-settings", val: "Mean Reversion" },
    { type: "strategy", label: "Scalping Algorithm Configuration", targetTab: "strategy-settings", val: "Scalping" },
    { type: "strategy", label: "Momentum Momentum Run", targetTab: "strategy-settings", val: "Momentum" },
    { type: "strategy", label: "Arbitrage Spread Matrix", targetTab: "strategy-settings", val: "Arbitrage" },
    { type: "page", label: "Risk Management Stress Tests", targetTab: "risk-management", val: "Risk" },
    { type: "page", label: "Trade History Ledger Logs", targetTab: "trade-history", val: "History" },
    { type: "page", label: "API Keys Broker Manager", targetTab: "api-manager", val: "API" },
    { type: "page", label: "Terminal System Settings", targetTab: "settings", val: "Settings" }
  ];

  // Filtering suggestions
  const filteredSuggestions = searchTerm 
    ? searchSuggestions.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.val.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : searchSuggestions.slice(0, 5); // Show first 5 by default

  // Hotkey hooks (Pressing '/' or 'Ctrl+K' focuses the search container)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        // Prevent default browser search behavior
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      } else if (e.key === "Escape") {
        setShowSearchDropdown(false);
        setShowNotificationDropdown(false);
        setShowProfileDropdown(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to collapse modules
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCryptoPrice = (val: number, isXrp = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: isXrp ? 4 : 2,
      maximumFractionDigits: isXrp ? 4 : 2,
    }).format(val);
  };

  const handleSuggestionClick = (item: typeof searchSuggestions[0]) => {
    setActiveTab(item.targetTab);
    if (item.type === "pair" && (item.val === "BTC" || item.val === "ETH" || item.val === "SOL" || item.val === "XRP")) {
      setSelectedAsset(item.val);
    }
    setSearchTerm("");
    setShowSearchDropdown(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className={`w-full h-18 px-3 md:px-6 flex items-center justify-between border-b ${theme === "light" ? "bg-white border-slate-200 text-slate-800" : "border-slate-800/60 bg-slate-950/20 text-white"} backdrop-blur-md sticky top-0 z-40 font-sans`}>
      
      {/* Mobile Menu Toggle Button */}
      {onMenuToggle && (
        <button 
          onClick={onMenuToggle}
          className="lg:hidden mr-3 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-white/5 transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Tickers Feed Panel */}
      <div className="flex items-center flex-nowrap space-x-2.5 overflow-x-auto scrollbar-none select-none flex-1 min-w-0 pr-2 md:pr-4 py-1 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button className="p-1.5 md:p-2 rounded-xl text-slate-500 hover:text-amber-400 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer shrink-0">
          <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current text-slate-500 hover:text-amber-400" />
        </button>

        {/* BTC/USDT Ticker */}
        <div 
          onClick={() => { setActiveTab("dashboard"); setSelectedAsset("BTC"); }} 
          className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <div className="w-4 md:w-4.5 h-4 md:h-4.5 rounded-full bg-amber-500 text-[9px] md:text-[10px] text-slate-950 font-black flex items-center justify-center font-mono">
            ₿
          </div>
          <div>
            <div className="flex items-center space-x-1 leading-none">
              <span className="text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase">BTC</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5 leading-none">
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-200">
                {formatCryptoPrice(btcPrice)}
              </span>
              <span className={`text-[8px] md:text-[9px] font-mono font-bold ${btcChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {btcChangePercent >= 0 ? "▲ +" : "▼ "}{btcChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* ETH/USDT Ticker */}
        <div 
          onClick={() => { setActiveTab("dashboard"); setSelectedAsset("ETH"); }}
          className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <div className="w-4 md:w-4.5 h-4 md:h-4.5 rounded-full bg-indigo-500 text-[9px] md:text-[10px] text-white font-bold flex items-center justify-center font-mono select-none">
            ♦
          </div>
          <div>
            <div className="flex items-center space-x-1 leading-none">
              <span className="text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase">ETH</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5 leading-none">
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-200">
                {formatCryptoPrice(ethPrice)}
              </span>
              <span className={`text-[8px] md:text-[9px] font-mono font-bold ${ethChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {ethChangePercent >= 0 ? "▲ +" : "▼ "}{ethChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* SOL/USDT Ticker */}
        <div 
          onClick={() => { setActiveTab("dashboard"); setSelectedAsset("SOL"); }}
          className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <div className="w-4 md:w-4.5 h-4 md:h-4.5 rounded-full bg-cyan-400 text-[8px] md:text-[9px] text-slate-950 font-black flex items-center justify-center font-mono select-none">
            S
          </div>
          <div>
            <div className="flex items-center space-x-1 leading-none">
              <span className="text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase">SOL</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5 leading-none">
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-200">
                {formatCryptoPrice(solPrice)}
              </span>
              <span className={`text-[8px] md:text-[9px] font-mono font-bold ${solChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {solChangePercent >= 0 ? "▲ +" : "▼ "}{solChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* AAPL Ticker */}
        {allQuotes?.["AAPL"] && (
          <div 
            onClick={() => { setActiveTab("stocks-indexes"); }}
            className="flex px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all items-center space-x-2 cursor-pointer shrink-0"
          >
            <div className="w-4 md:w-4.5 h-4 md:h-4.5 rounded-full bg-sky-500 text-[8px] md:text-[9px] text-white font-bold flex items-center justify-center font-mono select-none">
              
            </div>
            <div>
              <div className="flex items-center space-x-1 leading-none">
                <span className="text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase">AAPL</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5 leading-none">
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-200">
                  ${allQuotes["AAPL"].price.toFixed(2)}
                </span>
                <span className={`text-[8px] md:text-[9px] font-mono font-bold ${allQuotes["AAPL"].changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {allQuotes["AAPL"].changePercent >= 0 ? "▲ +" : "▼ "}{allQuotes["AAPL"].changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* S&P 500 Ticker */}
        {allQuotes?.["S&P 500"] && (
          <div 
            onClick={() => { setActiveTab("stocks-indexes"); }}
            className="flex px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-blue-500/20 hover:bg-slate-900/60 transition-all items-center space-x-2 cursor-pointer shrink-0"
          >
            <div className="w-4 md:w-4.5 h-4 md:h-4.5 rounded-full bg-purple-500 text-[7px] md:text-[7.5px] text-white font-black flex items-center justify-center font-mono select-none">
              SPX
            </div>
            <div>
              <div className="flex items-center space-x-1 leading-none">
                <span className="text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase">S&P 500</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5 leading-none">
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-200">
                  {allQuotes["S&P 500"].price.toFixed(1)}
                </span>
                <span className={`text-[8px] md:text-[9px] font-mono font-bold ${allQuotes["S&P 500"].changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {allQuotes["S&P 500"].changePercent >= 0 ? "▲ +" : "▼ "}{allQuotes["S&P 500"].changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER INTUITIVE COMMAND SUGGESTIONS SEARCH */}
      <div id="header-search-container" ref={searchContainerRef} className="hidden md:block relative max-w-[150px] lg:max-w-[220px] xl:max-w-[280px] w-full mx-2 lg:mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            id="header-search-input"
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isCompactSearch ? "Search... [/]" : "Search markets, pairs, bots... [/]"}
            className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-xl pl-8.5 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-sans"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 opacity-60 text-[9px] font-mono bg-slate-950 border border-white/5 rounded px-1.5 py-0.5">
            <Command className="h-2.5 w-2.5 text-slate-400" />
            <span>K</span>
          </div>
        </div>

        {/* Suggestion Dropdown panel */}
        {showSearchDropdown && (
          <div className="absolute top-13 left-0 right-0 py-2 rounded-2xl border border-slate-800/90 bg-slate-950/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50">
            <div className="px-3 pb-1 border-b border-white/5 flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
              <span>COMMAND & SEARCH INDEX SUGGESTIONS</span>
              <span>ESC TO CLOSE</span>
            </div>
            
            <div className="mt-1.5 max-h-64 overflow-y-auto space-y-0.5 px-2">
              {filteredSuggestions.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-500 font-sans">
                  No assets or channels match "{searchTerm}"
                </div>
              ) : (
                filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-600/15 border border-transparent hover:border-blue-500/10 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 opacity-60 group-hover:opacity-100" />
                      <span className="text-slate-300 group-hover:text-white font-medium transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-slate-900 border border-white/5 rounded px-1.5 py-0.2 group-hover:bg-blue-950">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Market Source Status Indicators */}
      <div className="hidden xl:flex items-center space-x-2 text-xs select-none">
        {/* Binance Source Indicator */}
        <div className={`px-2.5 py-1 rounded-xl border font-mono flex items-center space-x-1.5 ${
          binanceConnectionStatus === "CONNECTED"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
            : binanceConnectionStatus === "RECONNECTING"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/15 animate-pulse"
            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/15"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            binanceConnectionStatus === "CONNECTED" ? "bg-emerald-400 animate-pulse" : binanceConnectionStatus === "RECONNECTING" ? "bg-amber-450 animate-ping" : "bg-cyan-400"
          }`} />
          <span className="font-bold tracking-tight uppercase">
            {binanceConnectionStatus === "CONNECTED" ? "LIVE BINANCE" : binanceConnectionStatus === "RECONNECTING" ? "RECONNECTING..." : "SIMULATED"}
          </span>
        </div>

        {/* Stocks Source Indicator */}
        <div className={`px-2.5 py-1 rounded-xl border font-mono flex items-center space-x-1.5 ${
          stockSourceStatus === "LIVE"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/15"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            stockSourceStatus === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
          }`} />
          <span className="font-bold tracking-tight uppercase">
            STOCKS: {stockSourceStatus}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE UTILITIES */}
      <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
        
        {/* NOTIFICATIONS CENTER DROP-DOWN */}
        <div ref={notificationContainerRef} className="relative">
          <button 
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className={`relative p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer ${showNotificationDropdown ? "border-blue-500/45 text-white glow-blue" : ""}`}
            title="Notification Center"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-[9px] text-white font-black font-sans rounded-full flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute top-12 -right-28 sm:right-0 mr-[-20px] w-[calc(100vw-32px)] sm:w-80 max-w-sm sm:max-w-none py-2 rounded-2xl border border-slate-800/90 bg-slate-950/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50">
              <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Alert Notifications ({unreadCount} new)
                </span>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={clearAllNotifications}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                    title="Clear history"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 px-2 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No active notifications logs.
                  </div>
                ) : (
                  notifications.map((not) => (
                    <div 
                      key={not.id} 
                      className={`p-3 rounded-xl transition-all ${
                        not.read ? "opacity-60 hover:opacity-90" : "bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          not.type === "success" ? "text-emerald-400" :
                          not.type === "warning" ? "text-amber-500" :
                          not.type === "error" ? "text-rose-500" : "text-blue-400"
                        }`}>
                          {not.title}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">{not.time}</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        {not.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PERSISTENT LIGHT & DARK THEME TOGGLE */}
        <div className="p-0.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center">
          <button
            onClick={() => setTheme("light")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              theme === "light" 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/25 shadow-inner" 
                : "text-slate-500 hover:text-slate-350"
            }`}
            title="Light Theme"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              theme === "dark" 
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                : "text-slate-500 hover:text-slate-350"
            }`}
            title="Dark Terminal Mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* PROFILE/ACCOUNT CONTROL PANEL */}
        <div ref={profileContainerRef} className="relative">
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`flex items-center space-x-2.5 px-2 py-1 hover:bg-white/5 border border-transparent rounded-xl transition-all cursor-pointer select-none group ${showProfileDropdown ? "border-slate-800/60 bg-white/5" : ""}`}
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-blue-500/40 shadow-lg bg-slate-800 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=256"
                  alt="Trader Avatar"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            
            <div className="hidden sm:block text-left font-sans">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                  {traderAlias}
                </span>
                <span className="text-[8px] font-sans font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1 py-0.2 rounded leading-none">
                  Pro
                </span>
              </div>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-500 group-hover:text-slate-400 transition-colors" />
          </div>

          {showProfileDropdown && (
            <div className="absolute top-12 right-0 w-48 py-2 rounded-2xl border border-slate-800/90 bg-slate-950/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50 text-xs">
              <div className="px-4 py-2 border-b border-white/5 select-none text-slate-400 font-sans">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Institutional Account</p>
                <p className="font-bold text-white mt-1 leading-none break-all">{institutionalEmail}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button 
                  onClick={() => { setActiveTab("settings"); setShowProfileDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer flex justify-between"
                >
                  <span>Preferences</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </button>
                <button 
                  onClick={() => { setActiveTab("api-manager"); setShowProfileDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer flex justify-between"
                >
                  <span>API Integration</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </button>
                <button 
                  onClick={() => { setActiveTab("risk-management"); setShowProfileDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer flex justify-between"
                >
                  <span>Margin Account</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
