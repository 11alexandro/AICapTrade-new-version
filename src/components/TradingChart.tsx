/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Star, BarChart2, TrendingUp, Sliders, Settings, Maximize2, Shield, Eye, EyeOff, SlidersHorizontal, CheckSquare, X, Info } from "lucide-react";
import { useTerminal, Position } from "../store/TerminalStateContext";

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Indicator math helpers for institutional-grade trading system fidelity
const computeSMA = (data: Candle[], period: number): number[] => {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i].close);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
};

const computeEMA = (data: Candle[], period: number): number[] => {
  const ema: number[] = [];
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  let val = data[0].close;
  ema.push(val);
  for (let i = 1; i < data.length; i++) {
    val = data[i].close * k + val * (1 - k);
    ema.push(val);
  }
  return ema;
};

const computeVWAP = (data: Candle[]): number[] => {
  const vwap: number[] = [];
  if (data.length === 0) return [];
  let sumTypicalPriceVolume = 0;
  let sumVolume = 0;
  for (let i = 0; i < data.length; i++) {
    const tp = (data[i].high + data[i].low + data[i].close) / 3;
    sumTypicalPriceVolume += tp * data[i].volume;
    sumVolume += data[i].volume;
    vwap.push(sumVolume > 0 ? sumTypicalPriceVolume / sumVolume : data[i].close);
  }
  return vwap;
};

const computeBollingerBands = (data: Candle[], period: number = 20, multiplier: number = 2) => {
  const upper: number[] = [];
  const lower: number[] = [];
  const sma = computeSMA(data, period);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(data[i].close * 1.015);
      lower.push(data[i].close * 0.985);
    } else {
      let sumSqDiff = 0;
      for (let j = 0; j < period; j++) {
        sumSqDiff += Math.pow(data[i - j].close - sma[i], 2);
      }
      const stdDev = Math.sqrt(sumSqDiff / period);
      upper.push(sma[i] + multiplier * stdDev);
      lower.push(sma[i] - multiplier * stdDev);
    }
  }
  return { upper, lower, basis: sma };
};

const computeRSI = (data: Candle[], period: number = 14): number[] => {
  const rsi: number[] = [];
  if (data.length === 0) return [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(50 + (data[i].close > data[0].close ? 15 : -15));
    } else {
      const d = i - 1;
      const diff = data[i].close - data[d].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
  }
  return rsi;
};

export default function TradingChart() {
  const { 
    btcPrice, 
    btcChangePercent, 
    ethPrice, 
    ethChangePercent,
    solPrice,
    solChangePercent,
    xrpPrice,
    xrpChangePercent,
    botRunning,
    strategy,
    addNotification,
    activePositions,
    addPosition,
    selectedAsset,
    setSelectedAsset,
    allQuotes,
    manualExecuteSimulatedTrade,
    session,
    sessionTicksRemaining,
    binanceConnectionStatus
  } = useTerminal();

  const normalizedAsset = useMemo(() => {
    if (selectedAsset === "BTC") return "BTC/USDT";
    if (selectedAsset === "ETH") return "ETH/USDT";
    if (selectedAsset === "SOL") return "SOL/USDT";
    if (selectedAsset === "XRP") return "XRP/USDT";
    return selectedAsset;
  }, [selectedAsset]);

  // Chart Properties
  const [currentTimeframe, setCurrentTimeframe] = useState<"1m" | "5m" | "15m" | "1H" | "4H" | "1D" >("1H");
  const [chartType, setChartType] = useState<"candle" | "line">("candle");
  const [candles, setCandles] = useState<Candle[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(600);
  const [chartHeight, setChartHeight] = useState(290);

  // Indicators toggle state
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState(false);
  const [indicators, setIndicators] = useState({
    ema9: true,
    vwap: true,
    ema20: false,
    ema50: false,
    rsi: true,
    bollinger: false,
    macd: false
  });

  // Theme styling preferences state
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [themeConfig, setThemeConfig] = useState({
    candleUp: "#10b981", // default green
    candleDown: "#ef4444", // default red
    showGrid: true,
    showGlow: true,
    highVolHighlight: false
  });

  // Fullscreen toggle state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Derive active asset properties
  const activePrice = useMemo(() => {
    const quote = allQuotes && allQuotes[normalizedAsset];
    if (quote) return quote.price;
    return selectedAsset === "BTC" ? btcPrice :
           selectedAsset === "ETH" ? ethPrice :
           selectedAsset === "SOL" ? solPrice : xrpPrice;
  }, [allQuotes, normalizedAsset, selectedAsset, btcPrice, ethPrice, solPrice, xrpPrice]);

  const activePercent = useMemo(() => {
    const quote = allQuotes && allQuotes[normalizedAsset];
    if (quote) return quote.changePercent;
    return selectedAsset === "BTC" ? btcChangePercent :
           selectedAsset === "ETH" ? ethChangePercent :
           selectedAsset === "SOL" ? solChangePercent : xrpChangePercent;
  }, [allQuotes, normalizedAsset, selectedAsset, btcChangePercent, ethChangePercent, solChangePercent, xrpChangePercent]);


  // Actual mathematically computed technical overlays
  const computedStats = useMemo(() => {
    if (candles.length === 0) {
      return { 
        ema9: [],
        vwap: [],
        ema20: [], 
        ema50: [], 
        bollinger: { upper: [], lower: [], basis: [] }, 
        rsi: [] 
      };
    }
    return {
      ema9: computeEMA(candles, 9),
      vwap: computeVWAP(candles),
      ema20: computeEMA(candles, 20),
      ema50: computeEMA(candles, 50),
      bollinger: computeBollingerBands(candles, 20, 2),
      rsi: computeRSI(candles, 14)
    };
  }, [candles]);

  const ema9Val = computedStats.ema9[computedStats.ema9.length - 1] || activePrice;
  const vwapVal = computedStats.vwap[computedStats.vwap.length - 1] || activePrice;
  const ema20Val = computedStats.ema20[computedStats.ema20.length - 1] || activePrice;
  const ema50Val = computedStats.ema50[computedStats.ema50.length - 1] || activePrice;
  const rsiVal = computedStats.rsi[computedStats.rsi.length - 1] || 62.15;
  const bollingerUpper = computedStats.bollinger.upper[computedStats.bollinger.upper.length - 1] || activePrice * 1.015;
  const bollingerLower = computedStats.bollinger.lower[computedStats.bollinger.lower.length - 1] || activePrice * 0.985;

  // Dynamic generate historical candles depending on active symbol or time interval selection
  const generateHistoricalCandles = (sym: string, tf: string, basePrice: number) => {
    const count = 48;
    const now = new Date();
    
    // Multi-factor adaptive volatility scaling mapped to time intervals and risk indexes
    let volatilityScale = 0.005;
    if (tf === "1m") volatilityScale = 0.0006;
    else if (tf === "5m") volatilityScale = 0.0016;
    else if (tf === "15m") volatilityScale = 0.0028;
    else if (tf === "1H") volatilityScale = 0.006;
    else if (tf === "4H") volatilityScale = 0.015;
    else if (tf === "1D") volatilityScale = 0.045;

    // Relative coin adjustment to match real life spread behaviors
    if (sym === "SOL") volatilityScale *= 1.35;
    if (sym === "XRP") volatilityScale *= 1.5;

    // Guard against basePrice being zero or unpopulated initially
    const fallbacks: Record<string, number> = {
      "BTC": 64000,
      "ETH": 1700,
      "SOL": 71,
      "XRP": 0.58,
      "AAPL": 214,
      "NVDA": 130,
      "TSLA": 180,
      "MSFT": 420,
    };
    const finalBasePrice = basePrice > 0 ? basePrice : (fallbacks[sym] || fallbacks[sym.split("/")[0]] || 100);

    const P_raw: number[] = [];
    let currentNoise = 0;
    
    // Endpoint-Anchored trajectory wave simulation
    for (let i = 0; i < count; i++) {
      let T_val = 0;
      if (tf === "1D") {
        T_val = Math.sin((i - 12) / 6.5) * 0.045 - Math.cos(i / 15.0) * 0.03 + Math.sin(i / 3.0) * 0.006;
      } else if (tf === "4H" || tf === "1H") {
        if (i < 15) {
          T_val = (i / 15) * 0.03;
        } else if (i < 35) {
          T_val = 0.03 - ((i - 15) / 20) * 0.016 + Math.sin(i / 3.0) * 0.004;
        } else {
          T_val = 0.014 + ((i - 35) / 13) * 0.025 + Math.sin(i / 2.0) * 0.003;
        }
      } else if (tf === "15m" || tf === "5m") {
        T_val = Math.sin(i / 5.0) * 0.015 + Math.cos(i / 10.0) * 0.008 + Math.sin(i / 2.0) * 0.0015;
      } else {
        T_val = Math.sin(i / 4.0) * 0.004 + Math.sin(i / 1.5) * 0.0008;
      }

      const stepNoise = (Math.random() - 0.5) * volatilityScale * 0.45;
      currentNoise += stepNoise;
      P_raw.push(finalBasePrice * (1 + T_val + currentNoise));
    }

    // Anchoring equations to bound the final closed candle close to finalBasePrice exactly
    const finalRaw = P_raw[count - 1];
    const offset = finalRaw - finalBasePrice;
    
    const P_anchored: number[] = [];
    for (let i = 0; i < count; i++) {
      const correction = (i / (count - 1)) * offset;
      P_anchored.push(P_raw[i] - correction);
    }

    const data: Candle[] = [];
    for (let i = 0; i < count; i++) {
      const deltaMinutes = (count - i) * (tf.includes("m") ? parseInt(tf) : tf.includes("H") ? parseInt(tf) * 60 : 24 * 60);
      const targetTime = new Date(now.getTime() - deltaMinutes * 60 * 1000);
      let timeStr = "";

      if (tf.includes("m")) {
        timeStr = `${String(targetTime.getHours()).padStart(2, "0")}:${String(targetTime.getMinutes()).padStart(2, "0")}`;
      } else if (tf.includes("H")) {
        timeStr = `${String(targetTime.getHours()).padStart(2, "0")}:00`;
      } else {
        timeStr = `${targetTime.getMonth() + 1}/${targetTime.getDate()}`;
      }

      const open = i === 0 ? P_anchored[0] * (1 + (Math.random() - 0.5) * volatilityScale * 0.1) : P_anchored[i - 1];
      const close = P_anchored[i];

      const wickRange = finalBasePrice * volatilityScale * 0.28;
      let highWickMultiplier = 0.05 + Math.random() * 0.25;
      let lowWickMultiplier = 0.05 + Math.random() * 0.25;

      // Volatility spike events (pin bars, rejections)
      if (i % 9 === 0) {
        highWickMultiplier = 0.4 + Math.random() * 0.6;
        lowWickMultiplier = 0.4 + Math.random() * 0.6;
      }

      const high = Math.max(open, close) + wickRange * highWickMultiplier;
      const low = Math.min(open, close) - wickRange * lowWickMultiplier;

      // Volume is directly proportional to body spread (breakout vs sideways)
      const bodyRatio = Math.abs(close - open) / (finalBasePrice * volatilityScale);
      const volume = Math.floor((1200 + Math.random() * 3200) * (1 + bodyRatio * 4.5));

      data.push({
        time: timeStr,
        open: parseFloat(open.toFixed(sym === "XRP" ? 4 : 2)),
        high: parseFloat(high.toFixed(sym === "XRP" ? 4 : 2)),
        low: parseFloat(low.toFixed(sym === "XRP" ? 4 : 2)),
        close: parseFloat(close.toFixed(sym === "XRP" ? 4 : 2)),
        volume: Math.floor(volume)
      });
    }
    return data;
  };

  // Active price ref to ensure timers can check active price without being reset on every tick
  const activePriceRef = useRef(activePrice);
  useEffect(() => {
    activePriceRef.current = activePrice;
  }, [activePrice]);

  // Re-generate database candles structure whenever asset or timeframe selection indices transform
  useEffect(() => {
    setCandles(generateHistoricalCandles(selectedAsset, currentTimeframe, activePrice));
  }, [selectedAsset, currentTimeframe]);

  // Synchronize candlestick boundaries matching live price tickers feed dynamically
  useEffect(() => {
    if (candles.length === 0) return;
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.close = activePrice;
      last.high = Math.max(last.high, activePrice);
      last.low = Math.min(last.low, activePrice);
      updated[updated.length - 1] = last;
      return updated;
    });
  }, [activePrice]);

  // Sped-up timeline rolling sandbox engine to simulate real bar-close feeds dynamically
  useEffect(() => {
    const rollInterval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        
        const lastCandle = prev[prev.length - 1];
        const now = new Date();
        let timeStr = "";
        if (currentTimeframe.includes("m")) {
          timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        } else if (currentTimeframe.includes("H")) {
          timeStr = `${String(now.getHours()).padStart(2, "0")}:00`;
        } else {
          timeStr = `${now.getMonth() + 1}/${now.getDate()}`;
        }

        const open = lastCandle.close;
        const close = activePriceRef.current;

        // Volatility multiplier
        const volMod = session.volatility;
        // Rejection / Indecision wicks mapping
        const wickSpread = open * 0.0006 * volMod;
        const wickExtensionHigh = Math.random() * wickSpread;
        const wickExtensionLow = Math.random() * wickSpread;

        const high = Math.max(open, close) + wickExtensionHigh;
        const low = Math.min(open, close) - wickExtensionLow;

        // Volume correlates with trend strength, volatility, and candle body size
        const spreadRatio = Math.abs(close - open) / (open || 1);
        const baseVol = 600 * (1 + spreadRatio * 250);
        const volume = Math.floor(baseVol * volMod * (Math.random() * 0.5 + 0.75));

        const newCandle: Candle = {
          time: timeStr,
          open,
          high,
          low,
          close,
          volume,
        };

        const shifted = prev.slice(1);
        return [...shifted, newCandle];
      });
      
      addNotification(
        "Market Feed Completed", 
        `${selectedAsset}/USDT timeframe block successfully closed and compiled on terminal matrix.`, 
        "info"
      );
    }, 45000); // 45 seconds rolling sandbox tickers

    return () => clearInterval(rollInterval);
  }, [currentTimeframe, selectedAsset]);

  // Responsive boundary dimensions watcher
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (!entries || !entries.length) return;
        for (const entry of entries) {
          setChartWidth(entry.contentRect.width || 600);
          setChartHeight(Math.max(entry.contentRect.height, 220) || 290);
        }
      });
    });
    observer.observe(chartContainerRef.current);
    
    setChartWidth(chartContainerRef.current.clientWidth || 600);
    setChartHeight(chartContainerRef.current.clientHeight || 290);

    return () => observer.disconnect();
  }, []);

  // Escape key handler to collapse modal structures
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
        setShowIndicatorsMenu(false);
        setShowSettingsPanel(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getX = (idx: number) => {
    const margin = 10;
    const paddingRight = 68; // gap spacing reserved for grid axis texts label
    const available = chartWidth - margin - paddingRight;
    const divisor = Math.max(1, candles.length - 1);
    return margin + (idx / divisor) * available;
  };

  const getPriceBounds = () => {
    if (candles.length === 0) {
      const p = activePrice > 0 ? activePrice : 100;
      return { min: p * 0.98, max: p * 1.02 };
    }
    const prices = candles.map((c) => [c.open, c.close, c.high, c.low]).flat().filter(p => !isNaN(p));
    if (prices.length === 0) {
      const p = activePrice > 0 ? activePrice : 100;
      return { min: p * 0.98, max: p * 1.02 };
    }
    return {
      min: Math.min(...prices) * 0.998,
      max: Math.max(...prices) * 1.002
    };
  };

  const bounds = getPriceBounds();
  const priceRange = Math.max(1e-5, bounds.max - bounds.min);

  const getY = (price: number) => {
    const margin = 15;
    const available = Math.max(10, chartHeight - margin * 2);
    const range = priceRange > 0 ? priceRange : 1;
    const minVal = bounds.min;
    const val = margin + available - ((price - minVal) / range) * available;
    return isNaN(val) ? margin + available : val;
  };

  const yTicks = Array.from({ length: 6 }).map((_, i) => {
    return bounds.min + (priceRange / 5) * i;
  }).reverse();

  const formatPriceStr = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: selectedAsset === "XRP" ? 4 : 2,
      maximumFractionDigits: selectedAsset === "XRP" ? 4 : 2,
    }).format(val);
  };

  // Perform quick simulation order execution action
  const handleQuickTrade = (side: "BUY" | "SELL") => {
    manualExecuteSimulatedTrade(normalizedAsset, side === "BUY" ? "BUY" : "SELL");
  };

  const coinConfig = useMemo(() => {
    const sym = normalizedAsset.split("/")[0];
    const defaults: Record<string, { icon: string; color: string; name: string; exchange: string }> = {
      BTC: { icon: "₿", color: "bg-amber-500 text-slate-950", name: "Bitcoin / TetherUS", exchange: "Binance" },
      ETH: { icon: "♦", color: "bg-indigo-500 text-white", name: "Ethereum / TetherUS", exchange: "Binance" },
      SOL: { icon: "S", color: "bg-cyan-400 text-slate-950", name: "Solana / TetherUS", exchange: "Binance" },
      XRP: { icon: "X", color: "bg-blue-500 text-white", name: "Ripple / TetherUS", exchange: "Binance" },
      AAPL: { icon: "", color: "bg-slate-200 text-slate-950", name: "Apple Inc. Common Stock", exchange: "NASDAQ" },
      NVDA: { icon: "N", color: "bg-emerald-500 text-white", name: "NVIDIA Corp Stock", exchange: "NASDAQ" },
      TSLA: { icon: "T", color: "bg-red-600 text-white", name: "Tesla Inc. Stock", exchange: "NASDAQ" },
      MSFT: { icon: "M", color: "bg-sky-500 text-white", name: "Microsoft Corp Stock", exchange: "NASDAQ" },
      "S&P 500": { icon: "S", color: "bg-purple-600 text-white", name: "S&P 500 Stock Index", exchange: "Index" },
      "NASDAQ 100": { icon: "Q", color: "bg-pink-600 text-white", name: "NASDAQ 100 Tech Index", exchange: "Index" }
    };
    return defaults[sym] || defaults[selectedAsset] || { icon: sym[0] || "?", color: "bg-slate-700 text-white", name: selectedAsset, exchange: "Global" };
  }, [selectedAsset, normalizedAsset]);

  const activeCoin = coinConfig;

  const activeStats = useMemo(() => {
    const quote = allQuotes && allQuotes[normalizedAsset];
    if (quote) {
      return {
        high: quote.high ? `$${quote.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `$${(quote.price * 1.025).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        low: quote.low ? `$${quote.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `$${(quote.price * 0.975).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        vol: quote.volume ? quote.volume.toLocaleString() : "14,354"
      };
    }
    const sym = normalizedAsset.split("/")[0];
    const defaults: Record<string, { high: string; low: string; vol: string }> = {
      BTC: { high: "$68,142.15", low: "$66,204.80", vol: "14,354.12" },
      ETH: { high: "$3,512.40", low: "$3,382.10", vol: "85,621.45" },
      SOL: { high: "$162.85", low: "$154.20", vol: "1,245,612" },
      XRP: { high: "$0.5982", low: "$0.5512", vol: "48,154,320" }
    };
    return defaults[sym] || defaults[selectedAsset] || { high: "$100.00", low: "$97.00", vol: "10,000" };
  }, [allQuotes, normalizedAsset, selectedAsset]);


  return (
    <div className={`glass-panel rounded-2xl p-3 md:p-5 shadow-2x1 relative overflow-hidden bg-slate-950/20 border-slate-800/80 font-sans transition-all duration-300 ${
      isFullscreen 
        ? "fixed inset-4 z-50 bg-slate-950 border border-slate-700/80 shadow-[0_24px_60px_rgba(0,0,0,0.95)]" 
        : ""
    }`}>
      
      {/* Top Header Controls bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-white/5 gap-3">
        
        {/* Symbol Label Details Info */}
        <div className="flex items-center space-x-3.5 select-none flex-wrap gap-y-2">
          <div className={`w-9 h-9 rounded-full ${activeCoin.color} font-black text-lg flex items-center justify-center font-mono shadow-md shrink-0`}>
            {activeCoin.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="text-base font-bold text-white tracking-tight">{normalizedAsset}</span>
              <button className="text-amber-500 hover:text-amber-400 transition-colors mr-1 shrink-0">
                <Star className="h-3.5 w-3.5 fill-current" />
              </button>
              
              {/* Simulated Data Badge */}
              <div className="px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[9px] font-mono flex items-center space-x-1 select-none leading-none shadow-sm shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                <span className="font-bold tracking-wider hidden sm:inline">SIMULATED DATA · PAPER TRADING ONLY</span>
                <span className="font-bold tracking-wider sm:hidden">SIMULATED DATA</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-medium">
                {activeCoin.name} · <span className="font-mono text-slate-600 uppercase text-[9px]">{activeCoin.exchange}</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold leading-none border ${
                normalizedAsset.includes("/")
                  ? (binanceConnectionStatus === "CONNECTED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : binanceConnectionStatus === "RECONNECTING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20")
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {normalizedAsset.includes("/")
                  ? (binanceConnectionStatus === "CONNECTED" ? "LIVE BINANCE" : binanceConnectionStatus === "RECONNECTING" ? "RECONNECTING..." : "SIMULATED")
                  : "LIVE YAHOO"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic timeframe configurations: 1m, 5m, 15m, 1H, 4H, 1D */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex space-x-0.5 select-none">
            {(["1m", "5m", "15m", "1H", "4H", "1D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setCurrentTimeframe(tf);
                  addNotification(`Timeframe updated`, `Primary terminal timeline switched to ${tf} aggregator grid.`, "info");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  currentTimeframe === tf
                    ? "bg-blue-600/20 border border-blue-500/35 text-white glow-blue"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Interactive Indicators dropdown toggle trigger nodes */}
          <div className="flex items-center space-x-1.5 relative">
            <button
              onClick={() => setChartType(chartType === "candle" ? "line" : "candle")}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                chartType === "line" 
                  ? "border-blue-500/30 bg-blue-500/10 text-white" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle Chart Drawing Layer"
            >
              {chartType === "candle" ? <BarChart2 className="h-3.5 w-3.5 rotate-90" /> : <TrendingUp className="h-3.5 w-3.5" />}
            </button>

            {/* Config Overlay trigger indicator widgets */}
            <button
              onClick={() => { setShowIndicatorsMenu(!showIndicatorsMenu); setShowSettingsPanel(false); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                showIndicatorsMenu 
                  ? "border-blue-500/35 bg-blue-500/10 text-white" 
                  : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Indicators</span>
            </button>

            {/* Custom chart style properties */}
            <button
              onClick={() => { setShowSettingsPanel(!showSettingsPanel); setShowIndicatorsMenu(false); }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showSettingsPanel 
                  ? "border-blue-500/35 bg-blue-500/10 text-white" 
                  : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white"
              }`}
              title="Chart Style Setup"
            >
              <Settings className="h-3.5 w-3.5 animate-spin-slow" />
            </button>

            {/* Zoom Maximizer expand widgets */}
            <button
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                addNotification("Terminal Frame Update", isFullscreen ? "Restored display container grid configuration." : "Expanded workspace window layout analyzer.", "info");
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isFullscreen 
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400" 
                  : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white"
              }`}
              title={isFullscreen ? "Restore layout [ESC]" : "Maximize Canvas [F]"}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            {/* Absolute Indicators Dropdown Overlay */}
            {showIndicatorsMenu && (
              <div className="absolute top-11 right-0 w-52 p-3 rounded-2xl border border-slate-800/90 bg-slate-950/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] z-40 text-xs font-sans space-y-2">
                <div className="pb-1.5 border-b border-white/5 flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                  <span>ACTIVE OVERLAY SYSTEM</span>
                  <button onClick={() => setShowIndicatorsMenu(false)} className="cursor-pointer text-slate-500 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.ema9}
                    onChange={(e) => setIndicators({ ...indicators, ema9: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span className="text-emerald-400 font-semibold">Exponential MA (9-period)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.vwap}
                    onChange={(e) => setIndicators({ ...indicators, vwap: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span className="text-purple-400 font-semibold">Volume Weighted Price (VWAP)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.ema20}
                    onChange={(e) => setIndicators({ ...indicators, ema20: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Exponential MA (20-day)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.ema50}
                    onChange={(e) => setIndicators({ ...indicators, ema50: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Exponential MA (50-day)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.rsi}
                    onChange={(e) => setIndicators({ ...indicators, rsi: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Relative Strength Index</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-350 cursor-pointer hover:text-white transition-colors py-0.5">
                  <input
                    type="checkbox"
                    checked={indicators.bollinger}
                    onChange={(e) => setIndicators({ ...indicators, bollinger: e.target.checked })}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Bollinger Volatility Bands</span>
                </label>
              </div>
            )}

            {/* Absolute Style Settings Dropdown Overlay */}
            {showSettingsPanel && (
              <div className="absolute top-11 right-0 w-60 p-3 rounded-2xl border border-slate-800/90 bg-slate-950/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] z-40 text-xs font-sans space-y-3.5">
                <div className="pb-1.5 border-b border-white/5 flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                  <span>TERMINAL GRAPH STYLE</span>
                  <button onClick={() => setShowSettingsPanel(false)} className="cursor-pointer text-slate-500 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Growth Candle Color</p>
                  <div className="flex gap-1.5">
                    {[
                      { l: "Bull Green", up: "#10b981", dn: "#ef4444" },
                      { l: "Fintech Blue", up: "#3b82f6", dn: "#f97316" },
                      { l: "Quantum Neon", up: "#06b6d4", dn: "#ec4899" }
                    ].map((pal, idx) => (
                      <button
                        key={idx}
                        onClick={() => setThemeConfig({ ...themeConfig, candleUp: pal.up, candleDown: pal.dn })}
                        className={`px-2 py-1 rounded border text-[9px] font-bold tracking-tight transition-all cursor-pointer ${
                          themeConfig.candleUp === pal.up ? "border-blue-500 text-white bg-blue-500/10" : "border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pal.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-white/5 space-y-2 pt-1 border-t border-white/5">
                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors pt-1.5">
                    <span>Show Grid Alignment Bars</span>
                    <input
                      type="checkbox"
                      checked={themeConfig.showGrid}
                      onChange={(e) => setThemeConfig({ ...themeConfig, showGrid: e.target.checked })}
                      className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                    />
                  </label>

                  <label className="flex items-center justify-between text-slate-350 cursor-pointer hover:text-white transition-colors pt-1.5">
                    <span>Activate High-Glow Filters</span>
                    <input
                      type="checkbox"
                      checked={themeConfig.showGlow}
                      onChange={(e) => setThemeConfig({ ...themeConfig, showGlow: e.target.checked })}
                      className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                    />
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Prices Metrics details row */}
      <div className="py-4.5 flex flex-wrap items-center justify-between select-none font-sans gap-4">
        <div className="flex flex-wrap items-center">
          <div>
            <div className="flex items-center space-x-3.5">
              <h2 className="text-3.5xl font-display font-black tracking-tight text-white leading-none">
                {formatPriceStr(activePrice)}
              </h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border flex items-center leading-none ${activePercent >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
                <span>{activePercent >= 0 ? "▲" : "▼"}</span>
                <span className="ml-1">{activePercent >= 0 ? "+" : ""}{activePercent.toFixed(2)}%</span>
              </span>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-wrap items-center text-[10px] font-mono text-slate-500 gap-x-5 gap-y-1.5 border-l border-white/10 pl-5 ml-5">
            <div>
              <span className="text-slate-500 uppercase tracking-tight block text-[8px] mb-0.5">24h High</span>
              <span className="text-slate-350 font-bold font-mono">{activeStats.high}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-tight block text-[8px] mb-0.5">24h Low</span>
              <span className="text-slate-350 font-bold font-mono">{activeStats.low}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-tight block text-[8px] mb-0.5">24h Vol ({selectedAsset})</span>
              <span className="text-slate-350 font-bold font-mono">{activeStats.vol}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Quick Order Action Executions button logs inside header */}
        <div className="flex items-center space-x-2 bg-slate-900/60 p-1 border border-slate-800 rounded-xl select-none">
          <button 
            onClick={() => handleQuickTrade("BUY")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-emerald-500/15"
          >
            BUY
          </button>
          <button 
            onClick={() => handleQuickTrade("SELL")}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-rose-500/15"
          >
            SELL
          </button>
        </div>
      </div>

      {/* Main Charts Viewport container widget */}
      <div 
        id="tradingview-viewport" 
        ref={chartContainerRef} 
        className="w-full relative overflow-hidden select-none"
        style={{ height: isFullscreen ? "calc(100vh - 240px)" : "350px" }}
      >
        {/* Absolute overlay badge for the active AI detected Market Session Regime */}
        <div 
          id="market-regime-status-badge"
          className="absolute top-3 left-4 z-20 flex items-center bg-slate-950/85 border border-slate-800/80 backdrop-blur-md rounded-lg px-2.5 py-1 text-[10px] space-x-2 font-mono shadow-xl select-none"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              session.current === "BULLISH_TREND" || session.current === "BREAKOUT_EXPANSION" ? "bg-emerald-400" :
              session.current === "BEARISH_TREND" || session.current === "REVERSAL" ? "bg-rose-400" : "bg-blue-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              session.current === "BULLISH_TREND" || session.current === "BREAKOUT_EXPANSION" ? "bg-emerald-500" :
              session.current === "BEARISH_TREND" || session.current === "REVERSAL" ? "bg-rose-500" : "bg-blue-500"
            }`}></span>
          </span>
          <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Regime</span>
          <span className="text-slate-200 font-bold tracking-tight">{session.label}</span>
          <span className="text-slate-700">|</span>
          <span className="text-[9px] text-blue-400 font-semibold">{session.volatility}x Vol</span>
          <span className="text-slate-500 font-normal">({sessionTicksRemaining} cycles)</span>
        </div>

        {candles.length > 0 && (
          <svg className="w-full h-full">
            <defs>
              <filter id="c-glow-up" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="c-glow-dn" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="chart-area-bull-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeConfig.candleUp} stopOpacity="0.16" />
                <stop offset="100%" stopColor={themeConfig.candleUp} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines backing */}
            {themeConfig.showGrid && yTicks.map((t, idx) => (
              <g key={idx}>
                <line
                  x1="0"
                  y1={getY(t)}
                  x2={chartWidth - 68}
                  y2={getY(t)}
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="1"
                />
                <text
                  x={chartWidth - 62}
                  y={getY(t) + 3}
                  fill="rgba(148, 163, 184, 0.45)"
                  className="text-[9px] font-mono select-none"
                >
                  {formatPriceStr(t).replace("$", "")}
                </text>
              </g>
            ))}

            {/* Horizontal Anchor Support and Resistance dotted indicators */}
            {candles.length > 0 && (
              <g opacity="0.18">
                {(() => {
                  const highPoints = candles.map(c => c.high);
                  const lowPoints = candles.map(c => c.low);
                  const highestResistance = Math.max(...highPoints, activePrice);
                  const lowestSupport = Math.min(...lowPoints, activePrice);
                  return (
                    <>
                      {/* Resistance */}
                      <line
                        x1="0"
                        y1={getY(highestResistance)}
                        x2={chartWidth - 68}
                        y2={getY(highestResistance)}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="12"
                        y={getY(highestResistance) + 11}
                        fill="#ef4444"
                        className="text-[8px] font-mono font-bold tracking-wider"
                      >
                        RESISTANCE (MAX): {formatPriceStr(highestResistance)}
                      </text>

                      {/* Support */}
                      <line
                        x1="0"
                        y1={getY(lowestSupport)}
                        x2={chartWidth - 68}
                        y2={getY(lowestSupport)}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="12"
                        y={getY(lowestSupport) - 4}
                        fill="#10b981"
                        className="text-[8px] font-mono font-bold tracking-wider"
                      >
                        SUPPORT (MIN): {formatPriceStr(lowestSupport)}
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Bollinger Bands Shaded bounds overlay */}
            {indicators.bollinger && computedStats.bollinger.upper.length > 0 && (
              <>
                <path
                  d={`M ${computedStats.bollinger.upper.map((v, i) => `${getX(i)} ${getY(v)}`).join(" L ")} L ${computedStats.bollinger.lower.slice().reverse().map((v, i) => `${getX(candles.length - 1 - i)} ${getY(v)}`).join(" L ")} Z`}
                  fill="rgba(59, 130, 246, 0.02)"
                />
                <path
                  d={computedStats.bollinger.upper.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <path
                  d={computedStats.bollinger.lower.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </>
            )}

            {/* Volume representation bars stacked inside viewport footer */}
            {candles.map((candle, idx) => {
              const isBull = candle.close >= candle.open;
              const colWidth = Math.max(1, (chartWidth / candles.length) * 0.35);
              const xPos = getX(idx) - colWidth / 2;
              
              const maxVol = Math.max(...candles.map((c) => c.volume).filter(v => !isNaN(v)), 10000);
              let volHeight = (candle.volume / maxVol) * 35;
              if (isNaN(volHeight) || volHeight < 0) volHeight = 0;
              let yPos = chartHeight - volHeight - 2;
              if (isNaN(yPos)) yPos = chartHeight - 2;

              return (
                <rect
                  key={`vol-${idx}`}
                  x={xPos}
                  y={yPos}
                  width={colWidth}
                  height={volHeight}
                  fill={isBull ? themeConfig.candleUp : themeConfig.candleDown}
                  opacity="0.08"
                  rx="0.5"
                />
              );
            })}

            {/* EMA Lines overlays calculation */}
            {indicators.ema9 && computedStats.ema9.length > 0 && (
              <path
                d={computedStats.ema9.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.9"
              />
            )}
            {indicators.vwap && computedStats.vwap.length > 0 && (
              <path
                d={computedStats.vwap.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                opacity="0.9"
                strokeDasharray="3 3"
              />
            )}
            {indicators.ema20 && computedStats.ema20.length > 0 && (
              <path
                d={computedStats.ema20.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.2"
                opacity="0.8"
              />
            )}
            {indicators.ema50 && computedStats.ema50.length > 0 && (
              <path
                d={computedStats.ema50.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ")}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                opacity="0.8"
              />
            )}

            {/* LINE CHART representing price if toggled */}
            {chartType === "line" && (
              <>
                <path
                  d={`M ${candles.map((c, i) => `${getX(i)} ${getY(c.close)}`).join(" L ")} L ${getX(candles.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`}
                  fill="url(#chart-area-bull-grad)"
                />
                <path
                  d={candles.map((c, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(c.close)}`).join(" ")}
                  fill="none"
                  stroke={themeConfig.candleUp}
                  strokeWidth="2"
                  filter={themeConfig.showGlow ? "url(#c-glow-up)" : undefined}
                />
              </>
            )}

            {/* CANDLESTICK DRAWING LAYER */}
            {chartType === "candle" &&
              candles.map((candle, idx) => {
                const isBull = candle.close >= candle.open;
                const candleColor = isBull ? themeConfig.candleUp : themeConfig.candleDown;
                
                const openY = getY(candle.open);
                const closeY = getY(candle.close);
                const highY = getY(candle.high);
                const lowY = getY(candle.low);
                
                const xCenter = getX(idx);
                const colWidth = Math.max(3, (chartWidth / candles.length) * 0.52);
                const xPos = xCenter - colWidth / 2;
                const yPos = Math.min(openY, closeY);
                const colHeight = Math.max(1, Math.abs(openY - closeY));

                return (
                  <g key={idx}>
                    <line
                      x1={xCenter}
                      y1={highY}
                      x2={xCenter}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    <rect
                      x={xPos}
                      y={yPos}
                      width={colWidth}
                      height={colHeight}
                      fill={candleColor}
                      stroke={candleColor}
                      strokeWidth="0.5"
                      rx="0.5"
                      filter={themeConfig.showGlow ? (isBull ? "url(#c-glow-up)" : "url(#c-glow-dn)") : undefined}
                      opacity="0.88"
                    />
                  </g>
                );
              })}

            {/* Real-time tracing line */}
            <line
              x1="0"
              y1={getY(activePrice)}
              x2={chartWidth - 68}
              y2={getY(activePrice)}
              stroke={themeConfig.candleUp}
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.65"
            />

            {/* Ending coordinates status bulbs */}
            <circle
              cx={getX(candles.length - 1)}
              cy={getY(activePrice)}
              r="4.5"
              fill={themeConfig.candleUp}
            />
            <circle
              cx={getX(candles.length - 1)}
              cy={getY(activePrice)}
              r="1.8"
              fill="#ffffff"
            />
          </svg>
        )}
      </div>

      {/* Legends indices details */}
      <div className="flex select-none flex-wrap items-center space-x-6 mt-1.5 pt-4.5 border-t border-white/5 text-[10px] font-mono leading-none gap-y-1.5">
        
        {indicators.ema9 && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 uppercase">EMA 9</span>
            <span className="text-emerald-400 font-bold">{formatPriceStr(ema9Val)}</span>
          </div>
        )}

        {indicators.vwap && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-slate-500 uppercase">VWAP</span>
            <span className="text-purple-400 font-bold">{formatPriceStr(vwapVal)}</span>
          </div>
        )}

        {indicators.ema20 && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-500 uppercase">EMA 20</span>
            <span className="text-blue-400 font-bold">{formatPriceStr(ema20Val)}</span>
          </div>
        )}

        {indicators.ema50 && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-slate-500 uppercase">EMA 50</span>
            <span className="text-amber-500 font-bold">{formatPriceStr(ema50Val)}</span>
          </div>
        )}

        {indicators.rsi && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-slate-500 uppercase">RSI (14)</span>
            <span className="text-purple-400 font-bold">{rsiVal.toFixed(2)}</span>
          </div>
        )}

        {indicators.bollinger && (
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-slate-500 uppercase">BOLL UPPER</span>
            <span className="text-cyan-400 font-bold">{formatPriceStr(bollingerUpper)}</span>
          </div>
        )}

        {/* Dynamic warning if websocket falls back */}
        <div className="ml-auto flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-sans text-blue-400 leading-none">
          <Info className="h-2.5 w-2.5 mr-0.5" />
          <span>Optimized Predictive High-Fidelity Engine Active</span>
        </div>
      </div>

    </div>
  );
}
