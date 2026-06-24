/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { SessionMetrics, MarketSessionType, DailyEpoch, SupportedAsset } from "../types";
import { watchlistService } from "../services/watchlistService";
import { marketDataService, AssetQuote } from "../services/marketDataService";
import { socketService, ConnectionStatus, SocketDiagnostics } from "../services/socketService";
import { strategyScannerService, ScanSignal } from "../services/strategyScannerService";
import { tradeSimulatorService, SimulatedTrade, RiskSettings, PortfolioAnalytics } from "../services/tradeSimulatorService";
import { indicatorService } from "../services/indicatorService";



export interface Position {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  leverage: number;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  duration: string; // e.g., "01:24:12"
  timestamp: number;
}

export const REGIMES: SessionMetrics[] = [
  {
    current: "BULLISH_TREND",
    label: "Bullish Trend Phase",
    volatility: 1.1,
    trend: 0.38,
    description: "Steady upward grid expansion with deep buy margins support",
    confidence: 88.5,
    sentiment: "BULLISH",
    riskScore: 24
  },
  {
    current: "BEARISH_TREND",
    label: "Bearish Trend Phase",
    volatility: 1.35,
    trend: -0.42,
    description: "Leverage cascading flush out on heavy spot liquidations",
    confidence: 82.0,
    sentiment: "BEARISH",
    riskScore: 38
  },
  {
    current: "SIDEWAYS_RANGE",
    label: "Sideways Consolidation",
    volatility: 0.45,
    trend: 0.01,
    description: "Calm distribution inside established 1H order blocks",
    confidence: 54.0,
    sentiment: "NEUTRAL",
    riskScore: 12
  },
  {
    current: "BREAKOUT_EXPANSION",
    label: "Breakout Expansion",
    volatility: 2.4,
    trend: 0.85,
    description: "Squeezing extreme short structures over heavy beta buying",
    confidence: 94.2,
    sentiment: "STRONG_BULLISH",
    riskScore: 56
  },
  {
    current: "HIGH_VOLATILITY",
    label: "Extreme High Volatility",
    volatility: 2.65,
    trend: -0.05,
    description: "Flash liquidation cascades triggering wide spread slippage",
    confidence: 42.1,
    sentiment: "HIGH_RISK_FLUID",
    riskScore: 89
  },
  {
    current: "LOW_VOLATILITY",
    label: "Low-Volatility Compression",
    volatility: 0.3,
    trend: 0.0,
    description: "Market liquidity pooling inside flat retail ranges",
    confidence: 58.0,
    sentiment: "NEUTRAL",
    riskScore: 8
  },
  {
    current: "REVERSAL",
    label: "Trend Exhaustion Reversal",
    volatility: 1.6,
    trend: -0.55,
    description: "Exhaustion sweep triggering structural pivot shifts",
    confidence: 76.4,
    sentiment: "STRONG_BEARISH",
    riskScore: 45
  }
];


export interface TradeHistoryItem {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  timestamp: string;
  strategyUsed: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

interface TerminalState {
  // Page Routing
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Real-time Crypto Prices
  btcPrice: number;
  btcChangePercent: number;
  ethPrice: number;
  ethChangePercent: number;
  solPrice: number;
  solChangePercent: number;
  xrpPrice: number;
  xrpChangePercent: number;

  // Portfolio Finance
  totalBalance: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;

  // Active Live Positions & Close Logic
  activePositions: Position[];
  setActivePositions: React.Dispatch<React.SetStateAction<Position[]>>;
  closePosition: (id: string) => void;
  addPosition: (pos: Omit<Position, "id" | "pnl" | "pnlPercent" | "timestamp" | "duration">) => void;

  // Trade History
  tradeHistory: TradeHistoryItem[];
  setTradeHistory: React.Dispatch<React.SetStateAction<TradeHistoryItem[]>>;

  // Bot Controller Settings
  botRunning: boolean;
  setBotRunning: (running: boolean) => void;
  strategy: string;
  setStrategy: (strat: string) => void;
  riskLevel: "Low" | "Medium" | "High" | "Institutional";
  setRiskLevel: (level: "Low" | "Medium" | "High" | "Institutional") => void;
  stopLoss: number;
  setStopLoss: (val: number) => void;
  takeProfit: number;
  setTakeProfit: (val: number) => void;
  capitalAllocation: number;
  setCapitalAllocation: (val: number) => void;
  maxPositionSize: number;
  setMaxPositionSize: (val: number) => void;

  // Telemetry API Status
  latency: number;
  apiConnected: boolean;
  setApiConnected: (val: boolean) => void;
  apiKeyRegistered: boolean;
  setApiKeyRegistered: (val: boolean) => void;
  apiPublicKey: string;
  setApiPublicKey: (val: string) => void;
  apiSecretKey: string;
  setApiSecretKey: (val: string) => void;
  binanceConnectionStatus: ConnectionStatus;
  socketDiagnostics: SocketDiagnostics;
  stockSourceStatus: "LIVE" | "SIMULATED";

  // Notifications Alert Node
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  addNotification: (title: string, desc: string, type: "info" | "success" | "warning" | "error") => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Client Dark/Light Mode
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;

  // Selected Asset (globally connected)
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;

  // Watchlist System API
  watchlist: string[];
  setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  allQuotes: Record<string, AssetQuote>;

  // Risk Management
  riskSettings: RiskSettings;
  setRiskSettings: (settings: RiskSettings) => void;

  // Trade Simulator
  simulatedTrades: SimulatedTrade[];
  setSimulatedTrades: React.Dispatch<React.SetStateAction<SimulatedTrade[]>>;
  portfolioAnalytics: PortfolioAnalytics;
  scanSignals: ScanSignal[];
  executeSimulatedTrade: (signal: ScanSignal) => void;
  manualExecuteSimulatedTrade: (symbol: string, direction: "BUY" | "SELL") => void;
  clearTradeHistory: () => void;


  // Institutional Profiling
  institutionalEmail: string;
  setInstitutionalEmail: (email: string) => void;
  traderAlias: string;
  setTraderAlias: (alias: string) => void;

  // Real-time Market Session Engine 
  session: SessionMetrics;
  setSession: React.Dispatch<React.SetStateAction<SessionMetrics>>;
  sessionTicksRemaining: number;
  setSessionTicksRemaining: React.Dispatch<React.SetStateAction<number>>;

  // HFT Daily Epoch Reboot System properties
  dailyEpochs: DailyEpoch[];
  activeDailyEpoch: DailyEpoch;
  epochTimeRemaining: number;
  rebootSystem: () => void;
  allocatedCapitalPercent: number;
  setAllocatedCapitalPercent: (val: number) => void;
}

const TerminalContext = createContext<TerminalState | undefined>(undefined);

export function TerminalStateProvider({ children }: { children: React.ReactNode }) {
  // Navigation Router
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local Storage Dark/Light theme configuration support
  const [theme, setThemeState] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("aistudio-theme");
    return (saved as "dark" | "light") || "dark";
  });

  // Institutional Profiling Configuration (replaces personal email block)
  const [institutionalEmail, setInstitutionalEmailState] = useState<string>(() => {
    return localStorage.getItem("aistudio-institutional-email") || "institutional-desk@capitalholdings.co";
  });

  const setInstitutionalEmail = (email: string) => {
    setInstitutionalEmailState(email);
    localStorage.setItem("aistudio-institutional-email", email);
  };

  const [traderAlias, setTraderAliasState] = useState<string>(() => {
    return localStorage.getItem("aistudio-trader-alias") || "TraderX";
  });

  const setTraderAlias = (alias: string) => {
    setTraderAliasState(alias);
    localStorage.setItem("aistudio-trader-alias", alias);
  };

  const setTheme = (t: "dark" | "light") => {
    setThemeState(t);
    localStorage.setItem("aistudio-theme", t);
    if (t === "light") {
      document.documentElement.classList.add("light-mode-active");
    } else {
      document.documentElement.classList.remove("light-mode-active");
    }
  };

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode-active");
    } else {
      document.documentElement.classList.remove("light-mode-active");
    }
  }, [theme]);

  // Selected Asset (linked globally)
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");

  // Multi-asset Terminal State
  const [watchlist, setWatchlist] = useState<string[]>(() => watchlistService.getWatchlist());
  const [favorites, setFavorites] = useState<string[]>(() => watchlistService.getFavorites());
  const [allQuotes, setAllQuotes] = useState<Record<string, AssetQuote>>(() => marketDataService.getAllQuotes());
  const [riskSettings, setRiskSettingsState] = useState<RiskSettings>(() => tradeSimulatorService.loadRiskSettings());
  const [simulatedTrades, setSimulatedTrades] = useState<SimulatedTrade[]>(() => tradeSimulatorService.loadTrades());
  const [scanSignals, setScanSignals] = useState<ScanSignal[]>([]);
  const [totalSignalsCount, setTotalSignalsCount] = useState<number>(12); // start with a few simulated counts for realism


  // Pricing State Indices (highly aligned to reference designs)
  const [btcPrice, setBtcPrice] = useState(0);
  const [btcChangePercent, setBtcChangePercent] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [ethChangePercent, setEthChangePercent] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [solChangePercent, setSolChangePercent] = useState(0);
  const [xrpPrice, setXrpPrice] = useState(0);
  const [xrpChangePercent, setXrpChangePercent] = useState(0);

  // Capital Finance
  const [totalBalance, setTotalBalance] = useState(25000.00);
  const [totalProfit, setTotalProfit] = useState(0);
  const [winRate, setWinRate] = useState(78.63);
  const [totalTrades, setTotalTrades] = useState(342);
  const [realizedPnLOffset, setRealizedPnLOffset] = useState(0);

  // HFT Daily Epoch Reboot System State
  const [allocatedCapitalPercent, setAllocatedCapitalPercent] = useState<number>(35); // 35% default
  const [epochTimeRemaining, setEpochTimeRemaining] = useState<number>(180); // 180 seconds countdown
  const [dailyEpochs, setDailyEpochs] = useState<DailyEpoch[]>([
    {
      id: "ep-105",
      epochNumber: 105,
      startingBalance: 24200.00,
      endingBalance: 24590.20,
      allocatedCapitalLimit: 8470.00,
      totalTradesTaken: 14258,
      realizedPnL: 390.20,
      winRate: 79.24,
      dateString: "2026-06-15",
      status: "COMPLETED"
    },
    {
      id: "ep-106",
      epochNumber: 106,
      startingBalance: 24590.20,
      endingBalance: 24760.80,
      allocatedCapitalLimit: 8606.57,
      totalTradesTaken: 15940,
      realizedPnL: 170.60,
      winRate: 78.12,
      dateString: "2026-06-16",
      status: "COMPLETED"
    },
    {
      id: "ep-107",
      epochNumber: 107,
      startingBalance: 24760.80,
      endingBalance: 25000.00,
      allocatedCapitalLimit: 8666.28,
      totalTradesTaken: 17804,
      realizedPnL: 239.20,
      winRate: 80.05,
      dateString: "2026-06-17",
      status: "COMPLETED"
    }
  ]);

  const [activeDailyEpoch, setActiveDailyEpoch] = useState<DailyEpoch>({
    id: "ep-108",
    epochNumber: 108,
    startingBalance: 25000.00,
    endingBalance: 25000.00,
    allocatedCapitalLimit: 8750.00, // 35% of startingBalance
    totalTradesTaken: 2548,
    realizedPnL: 0,
    winRate: 78.63,
    dateString: "2026-06-18",
    status: "ACTIVE"
  });

  // Bot Parameter Configurations
  const [botRunning, setBotRunning] = useState(true);
  const [strategy, setStrategy] = useState("Mean Reversion");
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High" | "Institutional" >("Medium");
  const [stopLoss, setStopLoss] = useState(2.00);
  const [takeProfit, setTakeProfit] = useState(4.50);
  const [capitalAllocation, setCapitalAllocation] = useState(75);
  const [maxPositionSize, setMaxPositionSize] = useState(2.5);

  // Real-time market session engine state
  const [session, setSession] = useState<SessionMetrics>({
    current: "BULLISH_TREND",
    label: "Bullish Trend Phase",
    volatility: 1.1,
    trend: 0.38,
    description: "Steady upward grid expansion with deep buy margins support",
    confidence: 88.5,
    sentiment: "BULLISH",
    riskScore: 24
  });

  const [sessionTicksRemaining, setSessionTicksRemaining] = useState<number>(18);


  // Exchange integration details
  const [latency, setLatency] = useState(23);
  const [apiConnected, setApiConnected] = useState(true);
  const [binanceConnectionStatus, setBinanceConnectionStatus] = useState<ConnectionStatus>("SIMULATED");
  const [socketDiagnostics, setSocketDiagnostics] = useState<SocketDiagnostics>(() => socketService.getDiagnostics());
  const [stockSourceStatus, setStockSourceStatus] = useState<"LIVE" | "SIMULATED">("LIVE");

  useEffect(() => {
    const unsubscribeStatus = socketService.subscribeStatus((status) => {
      setBinanceConnectionStatus(status);
      setApiConnected(status === "CONNECTED");
    });
    const unsubscribeDiagnostics = socketService.subscribeDiagnostics((diag) => {
      setSocketDiagnostics(diag);
    });
    return () => {
      unsubscribeStatus();
      unsubscribeDiagnostics();
    };
  }, []);
  const [apiKeyRegistered, setApiKeyRegistered] = useState(true);
  const [apiPublicKey, setApiPublicKey] = useState("binance_live_ak97d26_sys");
  const [apiSecretKey, setApiSecretKey] = useState("••••••••••••••••••••••••••••••••");

  // Notifications Storage
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "AICapTrade Guard Live",
      description: "Secure gateway tunnels bound to Binance spot nodes.",
      time: "Just now",
      type: "success",
      read: false
    },
    {
      id: "n-2",
      title: "Websocket Handshake Complete",
      description: "Latency metrics nominal at 23ms.",
      time: "2m ago",
      type: "info",
      read: false
    },
    {
      id: "n-3",
      title: "Volatility Alert",
      description: "XRP trading volume spiked +12% over 5-minute aggregation.",
      time: "15m ago",
      type: "warning",
      read: true
    }
  ]);

  const addNotification = (title: string, desc: string, type: "info" | "success" | "warning" | "error") => {
    const newItem: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      description: desc,
      time: "Just now",
      type,
      read: false
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Open Positions ledger list
  const [activePositions, setActivePositions] = useState<Position[]>([
    {
      id: "pos-1",
      symbol: "BTCUSDT",
      type: "LONG",
      leverage: 10,
      size: 0.35,
      entryPrice: 106700.0,
      markPrice: 107000.00,
      pnl: 121.70,
      pnlPercent: 5.18,
      liquidationPrice: 96000.00,
      duration: "02:18:45",
      timestamp: Date.now() - (138 * 60 * 1000)
    },
    {
      id: "pos-2",
      symbol: "ETHUSDT",
      type: "SHORT",
      leverage: 20,
      size: 2.45,
      entryPrice: 2540.00,
      markPrice: 2520.00,
      pnl: 597.80,
      pnlPercent: 7.03,
      liquidationPrice: 2680.00,
      duration: "00:41:10",
      timestamp: Date.now() - (41 * 60 * 1000)
    }
  ]);

  const addPosition = (pos: Omit<Position, "id" | "pnl" | "pnlPercent" | "timestamp" | "duration">) => {
    const newPos: Position = {
      ...pos,
      id: `pos-${Date.now()}`,
      pnl: 0,
      pnlPercent: 0,
      duration: "00:00:01",
      timestamp: Date.now()
    };
    setActivePositions((prev) => [newPos, ...prev]);
    addNotification(`Position Opened`, `${pos.type} position initiated for ${pos.symbol} at $${pos.entryPrice}`, "success");
  };

  // Complete logs matching dashboard requirements
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([
    {
      id: "t-101",
      pair: "BTC/USDT",
      side: "BUY",
      entry: 65910.40,
      exit: 66254.12,
      size: 0.28,
      pnl: 96.24,
      timestamp: "2026-05-30 18:24",
      strategyUsed: "Mean Reversion"
    },
    {
      id: "t-102",
      pair: "ETH/USDT",
      side: "SELL",
      entry: 3385.20,
      exit: 3341.60,
      size: 1.50,
      pnl: 65.40,
      timestamp: "2026-05-30 15:40",
      strategyUsed: "Scalping"
    },
    {
      id: "t-103",
      pair: "SOL/USDT",
      side: "BUY",
      entry: 154.20,
      exit: 158.45,
      size: 12.00,
      pnl: 51.00,
      timestamp: "2026-05-30 12:15",
      strategyUsed: "Momentum"
    },
    {
      id: "t-104",
      pair: "XRP/USDT",
      side: "BUY",
      entry: 0.5612,
      exit: 0.5891,
      size: 800.00,
      pnl: 22.32,
      timestamp: "2026-05-29 21:05",
      strategyUsed: "Arbitrage"
    },
    {
      id: "t-105",
      pair: "SOL/USDT",
      side: "SELL",
      entry: 161.40,
      exit: 159.20,
      size: 8.50,
      pnl: 18.70,
      timestamp: "2026-05-29 17:33",
      strategyUsed: "Mean Reversion"
    }
  ]);

  const closePosition = (id: string) => {
    let closedTarget: Position | undefined;
    setActivePositions((prev) => {
      const target = prev.find((p) => p.id === id);
      closedTarget = target;
      return prev.filter((p) => p.id !== id);
    });

    if (closedTarget) {
      const target = closedTarget;
      // Append log to trade history
      const newHist: TradeHistoryItem = {
        id: `t-${Date.now()}`,
        pair: target.symbol.replace("USDT", "/USDT"),
        side: target.type === "LONG" ? "BUY" : "SELL",
        entry: target.entryPrice,
        exit: target.markPrice,
        size: target.size,
        pnl: target.pnl,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        strategyUsed: strategy
      };
      setTradeHistory((hist) => [newHist, ...hist]);
      
      const isProfit = target.pnl >= 0;
      addNotification(
        isProfit ? "Target Profit Settled" : "Stop Loss Guard Filled",
        `Closed manual ${target.symbol} ${target.type} at $${target.markPrice}. Realized: $${target.pnl.toFixed(2)} (${target.pnlPercent > 0 ? "+" : ""}${target.pnlPercent.toFixed(2)}%)`,
        isProfit ? "success" : "warning"
      );

      setTotalTrades((t) => {
        const nextTrades = t + 1;
        setWinRate((rate) => {
          const currentWins = Math.round(t * (rate / 100));
          const nextWins = target.pnl > 0 ? currentWins + 1 : currentWins;
          return parseFloat(((nextWins / nextTrades) * 100).toFixed(2));
        });
        return nextTrades;
      });

      // Add to offset!
      setRealizedPnLOffset((offset) => offset + target.pnl);

      // Append to simulatedTrades as closed trade
      const newSimulatedClosedTrade: SimulatedTrade = {
        id: `tr-manual-${Date.now()}`,
        symbol: target.symbol.replace("USDT", "/USDT"),
        strategy: strategy,
        direction: target.type === "LONG" ? "BUY" : "SELL",
        entryPrice: target.entryPrice,
        stopLoss: parseFloat((target.entryPrice * 0.98).toFixed(2)),
        target: parseFloat((target.entryPrice * 1.05).toFixed(2)),
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19).replace(/\.\d+/, ""),
        status: target.pnl >= 0 ? "WIN" : "LOSS",
        pnl: parseFloat(target.pnl.toFixed(2)),
        assetType: "CRYPTO",
        size: target.size,
        riskAmount: 0
      };
      
      const currentTrades = tradeSimulatorService.loadTrades();
      const nextTrades = [newSimulatedClosedTrade, ...currentTrades];
      tradeSimulatorService.saveTrades(nextTrades);
      setSimulatedTrades(nextTrades);
    }
  };

  const hasInitializedPositions = useRef(false);
  const lastWsMsgTimestamp = useRef<number>(0);

  // Helper to adjust initial active positions to match actual market entry prices cleanly on first fetch
  const adjustInitialPositions = (fetchedBtcPrice: number, fetchedEthPrice: number) => {
    if (!hasInitializedPositions.current) {
      hasInitializedPositions.current = true;
      setActivePositions([
        {
          id: "pos-1",
          symbol: "BTCUSDT",
          type: "LONG",
          leverage: 10,
          size: 0.35,
          entryPrice: parseFloat((fetchedBtcPrice * 0.995).toFixed(2)),
          markPrice: fetchedBtcPrice,
          pnl: 0,
          pnlPercent: 0,
          liquidationPrice: parseFloat((fetchedBtcPrice * 0.91).toFixed(2)),
          duration: "02:18:45",
          timestamp: Date.now() - (138 * 60 * 1000)
        },
        {
          id: "pos-2",
          symbol: "ETHUSDT",
          type: "SHORT",
          leverage: 20,
          size: 2.45,
          entryPrice: parseFloat((fetchedEthPrice * 1.008).toFixed(2)),
          markPrice: fetchedEthPrice,
          pnl: 0,
          pnlPercent: 0,
          liquidationPrice: parseFloat((fetchedEthPrice * 1.045).toFixed(2)),
          duration: "00:41:10",
          timestamp: Date.now() - (41 * 60 * 1000)
        }
      ]);
    }
  };

  // Real-time market feed data syncing is handled dynamically below via unified subscription to marketDataService

  // Synchronized simulation state engine with session dynamics and micro-fluctuating ticks
  useEffect(() => {
    let priceInterval: NodeJS.Timeout | null = null;

    priceInterval = setInterval(() => {
      setSessionTicksRemaining((prevTicks) => {
        const nextTicks = prevTicks - 1;
        
        if (nextTicks <= 0) {
          // Choose a new random regime different from current
          const currentRegimeIdx = REGIMES.findIndex(r => r.current === session.current);
          const availableRegimes = REGIMES.filter((_, idx) => idx !== currentRegimeIdx);
          const randomRegime = availableRegimes[Math.floor(Math.random() * availableRegimes.length)];
          
          setSession(randomRegime);
          
          // Generate realistic regime shift notification
          addNotification(
            "Regime Shift Detected",
            `AI Core triggered automatic transition to ${randomRegime.label}: ${randomRegime.description}. Volatility scaled to ${randomRegime.volatility}x.`,
            "warning"
          );
          
          // Reset ticks remaining between 12 and 22 cycles
          return Math.floor(Math.random() * 11) + 12;
        }
        return nextTicks;
      });

      // Price Ticks computation - micro-vibrations for interactive ticker feedback
      // Only apply if the high-frequency live WebSocket is not active
      const isWsActive = Date.now() - lastWsMsgTimestamp.current < 10000;
      if (!isWsActive) {
        const riskMult = riskLevel === "Low" ? 0.75 : riskLevel === "Medium" ? 1.0 : riskLevel === "High" ? 1.35 : 1.65;
        const vol = session.volatility * riskMult;

        setBtcPrice((p) => {
          const btcNoise = (Math.random() - 0.5) * 0.00010 * vol;
          return parseFloat((p + p * btcNoise).toFixed(2));
        });
        
        setEthPrice((p) => {
          const ethNoise = (Math.random() - 0.5) * 0.00015 * vol;
          return parseFloat((p + p * ethNoise).toFixed(2));
        });

        setSolPrice((p) => {
          const solNoise = (Math.random() - 0.5) * 0.00022 * vol;
          return parseFloat((p + p * solNoise).toFixed(2));
        });

        setXrpPrice((p) => {
          const xrpNoise = (Math.random() - 0.5) * 0.00028 * vol;
          return parseFloat((p + p * xrpNoise).toFixed(4));
        });
      }

    }, 1500);

    // Refresh telemetry latency indicators
    const latencyInterval = setInterval(() => {
      setLatency((lat) => {
        const delta = Math.floor((Math.random() - 0.5) * 8);
        return Math.max(11, Math.min(48, lat + delta));
      });
    }, 6000);

    return () => {
      if (priceInterval) clearInterval(priceInterval);
      clearInterval(latencyInterval);
    };
  }, [session, riskLevel]);


  // Update positions statistics dynamic tracking
  useEffect(() => {
    setActivePositions((prev) => {
      if (prev.length === 0) return prev;
      
      let changed = false;
      const nextPositions = prev.map((pos) => {
        let markPrice = pos.markPrice;
        if (pos.symbol === "BTCUSDT") markPrice = btcPrice;
        if (pos.symbol === "ETHUSDT") markPrice = ethPrice;
        if (pos.symbol === "SOLUSDT") markPrice = solPrice;
        if (pos.symbol === "XRPUSDT") markPrice = xrpPrice;

        const isLong = pos.type === "LONG";
        const priceDiff = isLong ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
        const pnl = parseFloat((priceDiff * pos.size * pos.leverage).toFixed(2));
        const pnlPercent = parseFloat(((priceDiff / pos.entryPrice) * 100 * pos.leverage).toFixed(2));

        // Auto liquidation threshold triggers
        const liquidThreshold = parseFloat((isLong 
          ? pos.entryPrice * (1 - 0.9 / pos.leverage)
          : pos.entryPrice * (1 + 0.9 / pos.leverage)).toFixed(pos.symbol === "XRPUSDT" ? 4 : 2));

        if (
          pos.markPrice !== markPrice || 
          pos.pnl !== pnl || 
          pos.pnlPercent !== pnlPercent || 
          pos.liquidationPrice !== liquidThreshold
        ) {
          changed = true;
          return {
            ...pos,
            markPrice,
            pnl,
            pnlPercent,
            liquidationPrice: liquidThreshold
          };
        }
        return pos;
      });

      return changed ? nextPositions : prev;
    });
  }, [btcPrice, ethPrice, solPrice, xrpPrice]);

  const startingBalance = 25000.00;

  // Recalculate portfolio total values dynamically based exclusively on simulatedTrades and activePositions
  useEffect(() => {
    const realizedPnL = simulatedTrades
      .filter((t) => t.status !== "OPEN")
      .reduce((sum, t) => sum + t.pnl, 0);
    const unrealizedPnL = activePositions.reduce((sum, p) => sum + p.pnl, 0);
    setTotalProfit(parseFloat((realizedPnL + unrealizedPnL).toFixed(2)));
    setTotalBalance(parseFloat((startingBalance + realizedPnL + unrealizedPnL).toFixed(2)));
  }, [activePositions, simulatedTrades]);

  // Derive activeDailyEpoch's realizedPnL and endingBalance from actual closed trades within today's epoch
  useEffect(() => {
    const todayStr = activeDailyEpoch.dateString; // e.g. "2026-06-18"
    const closedTodayPnL = simulatedTrades
      .filter((t) => t.status !== "OPEN" && t.timestamp.includes(todayStr))
      .reduce((sum, t) => sum + t.pnl, 0);
    
    setActiveDailyEpoch((curr) => {
      const nextPnL = parseFloat(closedTodayPnL.toFixed(2));
      const endingBalance = parseFloat((curr.startingBalance + nextPnL).toFixed(2));
      if (curr.realizedPnL === nextPnL && curr.endingBalance === endingBalance) {
        return curr;
      }
      return {
        ...curr,
        realizedPnL: nextPnL,
        endingBalance
      };
    });
  }, [simulatedTrades, activeDailyEpoch.dateString]);

  // 3. Automated Algorithmic Trade Execution Bot Loop
  useEffect(() => {
    if (!botRunning) return;

    const botInterval = setInterval(() => {
      let hasClosedAny = false;

      // PART A: Evaluate Trailing targets & active Stop-Loss/Take-Profit triggers
      setActivePositions((prevPositions) => {
        const positionsToClose = prevPositions.filter((pos) => {
          // If a position hits Take Profit percent or drops to Stop Loss percent, we execute trigger
          return pos.pnlPercent >= takeProfit || pos.pnlPercent <= -stopLoss;
        });

        if (positionsToClose.length > 0) {
          hasClosedAny = true;
          
          positionsToClose.forEach((target) => {
            const isTp = target.pnlPercent >= takeProfit;
            const newHist: TradeHistoryItem = {
              id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              pair: target.symbol.replace("USDT", "/USDT"),
              side: target.type === "LONG" ? "BUY" : "SELL",
              entry: target.entryPrice,
              exit: target.markPrice,
              size: target.size,
              pnl: target.pnl,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
              strategyUsed: strategy
            };

            setTradeHistory((hist) => [newHist, ...hist]);
            setTotalTrades((t) => {
              const nextTrades = t + 1;
              setWinRate((rate) => {
                const currentWins = Math.round(t * (rate / 100));
                const nextWins = target.pnl > 0 ? currentWins + 1 : currentWins;
                return parseFloat(((nextWins / nextTrades) * 100).toFixed(2));
              });
              return nextTrades;
            });
            setRealizedPnLOffset((offset) => offset + target.pnl);

            // Append to simulatedTrades as closed trade
            setTimeout(() => {
              const newSimulatedClosedTrade: SimulatedTrade = {
                id: `tr-bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                symbol: target.symbol.replace("USDT", "/USDT"),
                strategy: strategy,
                direction: target.type === "LONG" ? "BUY" : "SELL",
                entryPrice: target.entryPrice,
                stopLoss: parseFloat((target.entryPrice * 0.98).toFixed(2)),
                target: parseFloat((target.entryPrice * 1.05).toFixed(2)),
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19).replace(/\.\d+/, ""),
                status: target.pnl >= 0 ? "WIN" : "LOSS",
                pnl: parseFloat(target.pnl.toFixed(2)),
                assetType: target.symbol.includes("USDT") ? "CRYPTO" : "STOCK",
                size: target.size,
                riskAmount: 0
              };
              const currentTrades = tradeSimulatorService.loadTrades();
              const nextTrades = [newSimulatedClosedTrade, ...currentTrades];
              tradeSimulatorService.saveTrades(nextTrades);
              setSimulatedTrades(nextTrades);
            }, 0);

            addNotification(
              isTp ? "Bot Take-Profit Executed" : "Bot Stop-Loss Saved Position",
              `Closed ${target.symbol} ${target.type} at $${target.markPrice}. Realized: $${target.pnl.toFixed(2)} (${target.pnlPercent > 0 ? "+" : ""}${target.pnlPercent.toFixed(2)}%) via strategy [${strategy}].`,
              isTp ? "success" : "warning"
            );
          });

          const closingIds = new Set(positionsToClose.map((p) => p.id));
          return prevPositions.filter((p) => !closingIds.has(p.id));
        }

        return prevPositions;
      });

      // Avoid opening new positions on the exact same tick we close old triggers to respect queue throughput
      if (hasClosedAny) return;

      // PART B: Scalping entry queue or cycle consolidation
      setActivePositions((prevPositions) => {
        if (prevPositions.length >= maxPositionSize) {
          // 15% chance to close the oldest position to simulate algorithmic pipeline exit cycling
          if (Math.random() < 0.15 && prevPositions.length > 0) {
            const oldestIndex = prevPositions.length - 1;
            const target = prevPositions[oldestIndex];

            const newHist: TradeHistoryItem = {
              id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              pair: target.symbol.replace("USDT", "/USDT"),
              side: target.type === "LONG" ? "BUY" : "SELL",
              entry: target.entryPrice,
              exit: target.markPrice,
              size: target.size,
              pnl: target.pnl,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
              strategyUsed: strategy
            };

            setTradeHistory((hist) => [newHist, ...hist]);
            setTotalTrades((t) => {
              const nextTrades = t + 1;
              setWinRate((rate) => {
                const currentWins = Math.round(t * (rate / 100));
                const nextWins = target.pnl > 0 ? currentWins + 1 : currentWins;
                return parseFloat(((nextWins / nextTrades) * 100).toFixed(2));
              });
              return nextTrades;
            });
            setRealizedPnLOffset((offset) => offset + target.pnl);

            // Append to simulatedTrades as closed trade
            setTimeout(() => {
              const newSimulatedClosedTrade: SimulatedTrade = {
                id: `tr-bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                symbol: target.symbol.replace("USDT", "/USDT"),
                strategy: strategy,
                direction: target.type === "LONG" ? "BUY" : "SELL",
                entryPrice: target.entryPrice,
                stopLoss: parseFloat((target.entryPrice * 0.98).toFixed(2)),
                target: parseFloat((target.entryPrice * 1.05).toFixed(2)),
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19).replace(/\.\d+/, ""),
                status: target.pnl >= 0 ? "WIN" : "LOSS",
                pnl: parseFloat(target.pnl.toFixed(2)),
                assetType: target.symbol.includes("USDT") ? "CRYPTO" : "STOCK",
                size: target.size,
                riskAmount: 0
              };
              const currentTrades = tradeSimulatorService.loadTrades();
              const nextTrades = [newSimulatedClosedTrade, ...currentTrades];
              tradeSimulatorService.saveTrades(nextTrades);
              setSimulatedTrades(nextTrades);
            }, 0);

            addNotification(
              "Bot Strategy Settle",
              `Closed ${target.symbol} ${target.type} at $${target.markPrice} as strategy turn completed. Realized: $${target.pnl.toFixed(2)} (${target.pnlPercent > 0 ? "+" : ""}${target.pnlPercent.toFixed(2)}%).`,
              "info"
            );

            return prevPositions.filter((_, idx) => idx !== oldestIndex);
          }
          return prevPositions;
        }

        // 35% chance to fill a new simulated strategy order on an asset
        if (Math.random() < 0.35) {
          const symbolOptions = [
            { sym: "BTCUSDT", price: btcPrice, sizeBase: 0.15, levBase: 10 },
            { sym: "ETHUSDT", price: ethPrice, sizeBase: 1.25, levBase: 25 },
            { sym: "SOLUSDT", price: solPrice, sizeBase: 15, levBase: 15 },
            { sym: "XRPUSDT", price: xrpPrice, sizeBase: 400, levBase: 20 },
          ];

          const choice = symbolOptions[Math.floor(Math.random() * symbolOptions.length)];
          const type: "LONG" | "SHORT" = Math.random() < 0.52 ? "LONG" : "SHORT";

          let levIdx = choice.levBase;
          if (riskLevel === "Low") levIdx = Math.round(choice.levBase * 0.6);
          else if (riskLevel === "High") levIdx = Math.round(choice.levBase * 1.5);
          else if (riskLevel === "Institutional") levIdx = Math.round(choice.levBase * 2.5);

          const sizeMult = capitalAllocation / 75;
          const finalSize = parseFloat(
            (choice.sizeBase * sizeMult).toFixed(
              choice.sym === "BTCUSDT" ? 2 : choice.sym === "ETHUSDT" ? 2 : choice.sym === "SOLUSDT" ? 1 : 0
            )
          );

          if (finalSize <= 0) return prevPositions;

          const liquidThreshold = type === "LONG"
            ? choice.price * (1 - 0.9 / levIdx)
            : choice.price * (1 + 0.9 / levIdx);

          const newPos: Position = {
            id: `pos-bot-${Date.now()}`,
            symbol: choice.sym,
            type,
            leverage: levIdx,
            size: finalSize,
            entryPrice: choice.price,
            markPrice: choice.price,
            pnl: 0,
            pnlPercent: 0,
            liquidationPrice: parseFloat(liquidThreshold.toFixed(choice.sym === "XRPUSDT" ? 4 : 2)),
            duration: "00:00:01",
            timestamp: Date.now()
          };

          addNotification(
            "Bot Entry Order Filled",
            `Filled ${strategy} ${type} on ${choice.sym} x${levIdx} leverage. Entry Price: $${choice.price}.`,
            "success"
          );

          return [newPos, ...prevPositions];
        }

        return prevPositions;
      });

    }, 3500);

    return () => clearInterval(botInterval);
  }, [
    botRunning,
    strategy,
    riskLevel,
    stopLoss,
    takeProfit,
    capitalAllocation,
    maxPositionSize,
    btcPrice,
    ethPrice,
    solPrice,
    xrpPrice
  ]);

  // 4. High-Frequency Trading (HFT) Microsecond Scalper Simulation
  useEffect(() => {
    if (!botRunning) return;

    // Create rapid-firing transaction loops to simulate high-frequency trading at JPM/Goldman microsecond scales
    const hftInterval = setInterval(() => {
      // 1. Increment total Trades taken in real-time by a random microsecond chunk
      const incomingBatchCount = Math.floor(Math.random() * 5) + 3; // 3 to 7 trades per tick
      
      setTotalTrades((prev) => prev + incomingBatchCount);
      
      // Update the active daily epoch trade counts
      setActiveDailyEpoch((curr) => ({
        ...curr,
        totalTradesTaken: curr.totalTradesTaken + incomingBatchCount,
      }));
    }, 380); // Fast ticks every 380ms! That's ~1,000 trades per minute, looking incredibly professional!

    return () => clearInterval(hftInterval);
  }, [botRunning, riskLevel]);

  // Daily Reboot system logic definition
  const rebootSystem = () => {
    addNotification(
      "Goldman / JP Morgan Terminal Restart",
      "Terminating active trading pipeline session, matching outstanding ledger settlements, and clearing transaction buffers...",
      "info"
    );

    // Simulate brief suspend then resume
    const wasRunning = botRunning;
    setBotRunning(false);

    setTimeout(() => {
      setActiveDailyEpoch((curr) => {
        const completedDay: DailyEpoch = {
          ...curr,
          endingBalance: totalBalance,
          realizedPnL: parseFloat((totalBalance - curr.startingBalance).toFixed(2)),
          status: "COMPLETED"
        };

        setDailyEpochs((history) => [completedDay, ...history].slice(0, 10)); // keep last 10 days of ledger logs

        const nextDayNum = curr.epochNumber + 1;
        const nextStartingBalance = totalBalance;
        const nextAllocatedLimit = parseFloat((nextStartingBalance * (allocatedCapitalPercent / 100)).toFixed(2));

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (nextDayNum - 108));
        const nextDateString = nextDate.toISOString().split("T")[0];

        const newDay: DailyEpoch = {
          id: `ep-${nextDayNum}`,
          epochNumber: nextDayNum,
          startingBalance: nextStartingBalance,
          endingBalance: nextStartingBalance,
          allocatedCapitalLimit: nextAllocatedLimit,
          totalTradesTaken: 0,
          realizedPnL: 0,
          winRate: winRate,
          dateString: nextDateString,
          status: "ACTIVE"
        };

        addNotification(
          "HFT Engine Sockets Rebooted",
          `Day #${nextDayNum} successfully initialized. Bound $${nextAllocatedLimit.toLocaleString()} to microsecond high-speed execution pool.`,
          "success"
        );

        return newDay;
      });

      setEpochTimeRemaining(180); // Reset timer
      
      if (wasRunning) {
        setBotRunning(true);
      }
    }, 1200);
  };

  // 5. Daily Session Countdown / Automated Epoch Reboot
  useEffect(() => {
    if (!botRunning) return;

    const timer = setInterval(() => {
      setEpochTimeRemaining((prev) => {
        if (prev <= 1) {
          // Automatic rollover completed!
          setTimeout(() => {
            rebootSystem();
          }, 0);
          return 180; // Reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [botRunning, totalBalance, totalProfit, winRate, allocatedCapitalPercent]);

  // Multi-Asset Trading Terminal Core Integrators
  const setRiskSettings = (settings: RiskSettings) => {
    setRiskSettingsState(settings);
    tradeSimulatorService.saveRiskSettings(settings);
  };

  const portfolioAnalytics = useMemo(() => {
    return tradeSimulatorService.calculateAnalytics(totalSignalsCount);
  }, [simulatedTrades, totalSignalsCount]);

  const executeSimulatedTrade = (signal: ScanSignal) => {
    const res = tradeSimulatorService.executeTradeFromSignal(signal, riskSettings, totalBalance);
    if (res.success && res.trade) {
      setSimulatedTrades(tradeSimulatorService.loadTrades());
      addNotification(
        "Simulated Order Created",
        `Simulated ${res.trade.direction} entry for ${res.trade.symbol} filled at $${res.trade.entryPrice.toLocaleString()} (Stop: $${res.trade.stopLoss.toLocaleString()}, Target: $${res.trade.target.toLocaleString()}).`,
        "success"
      );
    }
  };

  const manualExecuteSimulatedTrade = (symbol: string, direction: "BUY" | "SELL") => {
    const quote = allQuotes[symbol];
    if (!quote) return;

    const candleList = strategyScannerService.getCandles(symbol);
    const closes = candleList.map(c => c.close);
    const vwap = indicatorService.calculateVWAP(candleList);
    const rsi = indicatorService.calculateRSI(closes, 14);
    const ema9 = indicatorService.calculateEMA(closes, 9);

    const dummySignal: ScanSignal = {
      id: `man-${Date.now()}-${symbol}`,
      symbol,
      assetType: quote.type,
      patternName: "ABCD Pattern",
      direction,
      confidenceScore: 92,
      indicators: {
        vwap,
        rsi,
        ema9,
        price: quote.price,
        volume: quote.volume,
        vwapStatus: quote.price > vwap ? "Bullish" : "Bearish",
        ema9Status: quote.price > ema9 ? "Bullish" : "Bearish"
      },
      triggerPrice: quote.price,
      stopPrice: direction === "BUY" ? quote.price * 0.98 : quote.price * 1.02,
      targetPrice: direction === "BUY" ? quote.price * 1.05 : quote.price * 0.95,
      timestamp: new Date().toISOString(),
      suggestedAction: direction,
      description: "Manual workspace trigger completed."
    };

    executeSimulatedTrade(dummySignal);
  };

  const clearTradeHistory = () => {
    tradeSimulatorService.clearTradeHistory();
    setSimulatedTrades([]);
    addNotification("Ledger Cleared", "Successfully cleared simulated trading account histories.", "info");
  };

  // Continuous market data quotes ticks hook
  useEffect(() => {
    const unsubscribe = marketDataService.subscribe((quotes) => {
      setAllQuotes(quotes);
      setStockSourceStatus(marketDataService.getStockSourceStatus());

      // Feed scanner updates
      Object.entries(quotes).forEach(([sym, q]) => {
        strategyScannerService.updatePriceTick(sym, q.price);
      });

      // Keep legacy prices state indices populated for backward compatibility with existing components
      if (quotes["BTC/USDT"]) {
        setBtcPrice(quotes["BTC/USDT"].price);
        setBtcChangePercent(quotes["BTC/USDT"].changePercent);
      }
      if (quotes["ETH/USDT"]) {
        setEthPrice(quotes["ETH/USDT"].price);
        setEthChangePercent(quotes["ETH/USDT"].changePercent);
      }
      if (quotes["SOL/USDT"]) {
        setSolPrice(quotes["SOL/USDT"].price);
        setSolChangePercent(quotes["SOL/USDT"].changePercent);
      }
      if (quotes["XRP/USDT"]) {
        setXrpPrice(quotes["XRP/USDT"].price);
        setXrpChangePercent(quotes["XRP/USDT"].changePercent);
      }

      // Initialize trading positions dynamically based on real-time prices on launch
      if (quotes["BTC/USDT"] && quotes["ETH/USDT"]) {
        adjustInitialPositions(quotes["BTC/USDT"].price, quotes["ETH/USDT"].price);
      }

      // Live evaluate Stop-Loss & Take-Profit targets on Simulated Positions
      const { closedTrades } = tradeSimulatorService.tickOpenTrades(quotes);
      if (closedTrades.length > 0) {
        setSimulatedTrades(tradeSimulatorService.loadTrades());
        closedTrades.forEach(trade => {
          const isWin = trade.status === "WIN";
          addNotification(
            isWin ? "Simulated Trade Profit Hit" : "Simulated Trade Stop Loss Hit",
            `${trade.symbol} ${trade.direction} simulated position successfully settled. PnL: ${isWin ? "+" : ""}$${trade.pnl.toLocaleString()}`,
            isWin ? "success" : "warning"
          );

          // Update aggregated balance and profit figures
          setTotalBalance(prev => parseFloat((prev + trade.pnl).toFixed(2)));
          setTotalProfit(prev => parseFloat((prev + trade.pnl).toFixed(2)));
        });
      }
    });

    return () => unsubscribe();
  }, [riskSettings]);

  // Periodic Strategy Scanner Engine Hook
  useEffect(() => {
    if (!botRunning) return;

    const scanInterval = setInterval(() => {
      watchlist.forEach(symbol => {
        const signal = strategyScannerService.scanAsset(symbol);
        if (signal) {
          setScanSignals(prev => {
            const hasDuplicate = prev.some(s => s.symbol === signal.symbol && s.patternName === signal.patternName && (Date.now() - new Date(s.timestamp).getTime() < 30000));
            if (hasDuplicate) return prev;

            addNotification(
              "Strategy Triggered",
              `Scanner detected ${signal.patternName} (${signal.direction}) on ${signal.symbol} holding ${signal.confidenceScore}% confidence.`,
              signal.direction === "BUY" ? "success" : "warning"
            );

            setTotalSignalsCount(c => c + 1);
            executeSimulatedTrade(signal);

            return [signal, ...prev].slice(0, 30);
          });
        }
      });
    }, 5000);

    return () => clearInterval(scanInterval);
  }, [botRunning, watchlist, riskSettings, totalBalance]);

  return (
    <TerminalContext.Provider
      value={{
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
        setActivePositions,
        closePosition,
        addPosition,
        tradeHistory,
        setTradeHistory,
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
        binanceConnectionStatus,
        socketDiagnostics,
        stockSourceStatus,
        apiKeyRegistered,
        setApiKeyRegistered,
        apiPublicKey,
        setApiPublicKey,
        apiSecretKey,
        setApiSecretKey,
        notifications,
        setNotifications,
        addNotification,
        markAllNotificationsAsRead,
        clearAllNotifications,
        theme,
        setTheme,
        selectedAsset,
        setSelectedAsset,
        watchlist,
        setWatchlist,
        favorites,
        setFavorites,
        allQuotes,
        riskSettings,
        setRiskSettings,
        simulatedTrades,
        setSimulatedTrades,
        portfolioAnalytics,
        scanSignals,
        executeSimulatedTrade,
        manualExecuteSimulatedTrade,
        clearTradeHistory,
        institutionalEmail,
        setInstitutionalEmail,
        traderAlias,
        setTraderAlias,
        session,
        setSession,
        sessionTicksRemaining,
        setSessionTicksRemaining,
        dailyEpochs,
        activeDailyEpoch,
        epochTimeRemaining,
        rebootSystem,
        allocatedCapitalPercent,
        setAllocatedCapitalPercent
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within TerminalStateProvider");
  }
  return context;
}
