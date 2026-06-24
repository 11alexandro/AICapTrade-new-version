/**
 * Trade Simulator Service
 * Handles simulated trades only. No real execution.
 * Integrates risk management preferences and tracks detailed analytics
 * separated by Asset Classes: Crypto, Stocks, and Indexes.
 */

import { ScanSignal } from "./strategyScannerService";

export interface SimulatedTrade {
  id: string;
  symbol: string;
  strategy: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  target: number;
  timestamp: string;
  status: "OPEN" | "WIN" | "LOSS";
  pnl: number;
  assetType: "CRYPTO" | "STOCK" | "INDEX";
  size: number;
  riskAmount: number;
}

export interface RiskSettings {
  riskPerTradePercent: number; // e.g. 1%
  stopLossPercent: number;     // e.g. 2%
  takeProfitPercent: number;   // e.g. 5%
  maxOpenTrades: number;       // e.g. 5
  positionSize: number;        // e.g. 1000 USD
}

export interface ClassStats {
  totalSignals: number;
  winRate: number;
  profitFactor: number;
  simulatedPnL: number;
  averageRiskReward: number;
  tradesCount: number;
  winsCount: number;
  lossesCount: number;
}

export interface PortfolioAnalytics {
  overall: ClassStats;
  crypto: ClassStats;
  stocks: ClassStats;
  indexes: ClassStats;
  strategyPerformance: Record<string, { pnl: number; wins: number; total: number }>;
}

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  riskPerTradePercent: 1.5,
  stopLossPercent: 2.0,
  takeProfitPercent: 5.0,
  maxOpenTrades: 5,
  positionSize: 2000 // default $2,000 USD entry sizing
};

export const tradeSimulatorService = {
  loadRiskSettings(): RiskSettings {
    const stored = localStorage.getItem("aistudio-risk-settings");
    if (!stored) {
      this.saveRiskSettings(DEFAULT_RISK_SETTINGS);
      return DEFAULT_RISK_SETTINGS;
    }
    try {
      return { ...DEFAULT_RISK_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_RISK_SETTINGS;
    }
  },

  saveRiskSettings(settings: RiskSettings): void {
    localStorage.setItem("aistudio-risk-settings", JSON.stringify(settings));
  },

  loadTrades(): SimulatedTrade[] {
    const stored = localStorage.getItem("aistudio-simulated-trades");
    if (!stored) {
      const defaultTrades: SimulatedTrade[] = [
        {
          id: "tr-1",
          symbol: "BTC/USDT",
          strategy: "Bull Flag",
          direction: "BUY",
          entryPrice: 62450.00,
          stopLoss: 61200.00,
          target: 65500.00,
          timestamp: "2026-06-18 10:14:02",
          status: "WIN",
          pnl: 285.50,
          assetType: "CRYPTO",
          size: 0.1,
          riskAmount: 125
        },
        {
          id: "tr-2",
          symbol: "AAPL",
          strategy: "VWAP Reversal",
          direction: "SELL",
          entryPrice: 215.10,
          stopLoss: 217.30,
          target: 209.80,
          timestamp: "2026-06-18 14:45:12",
          status: "WIN",
          pnl: 140.20,
          assetType: "STOCK",
          size: 28,
          riskAmount: 61.6
        },
        {
          id: "tr-3",
          symbol: "NVDA",
          strategy: "ABCD Pattern",
          direction: "BUY",
          entryPrice: 125.80,
          stopLoss: 122.90,
          target: 131.50,
          timestamp: "2026-06-18 15:22:18",
          status: "LOSS",
          pnl: -85.00,
          assetType: "STOCK",
          size: 30,
          riskAmount: 87
        }
      ];
      this.saveTrades(defaultTrades);
      return defaultTrades;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveTrades(trades: SimulatedTrade[]): void {
    localStorage.setItem("aistudio-simulated-trades", JSON.stringify(trades));
  },

  /**
   * Spawns a clean simulated trade from an active Scan Signal
   */
  executeTradeFromSignal(signal: ScanSignal, settings: RiskSettings, accountBalance: number): { success: boolean; error?: string; trade?: SimulatedTrade } {
    const trades = this.loadTrades();
    const openTrades = trades.filter(t => t.status === "OPEN");

    if (openTrades.length >= settings.maxOpenTrades) {
      return { success: false, error: `Maximum open trades (${settings.maxOpenTrades}) limit reached.` };
    }

    if (openTrades.some(t => t.symbol === signal.symbol)) {
      return { success: false, error: `Active open position already exists for ${signal.symbol}.` };
    }

    // Determine capital allocation dollars
    // Size = positionSize or based on risk percent
    const riskDollars = accountBalance * (settings.riskPerTradePercent / 100);
    const entryPrice = signal.triggerPrice;
    
    // Exact stop loss & take profit prices scaled according to settings
    const isBuy = signal.direction === "BUY";
    const percentStop = settings.stopLossPercent / 100;
    const percentTarget = settings.takeProfitPercent / 100;

    const stopPrice = isBuy 
      ? entryPrice * (1 - percentStop)
      : entryPrice * (1 + percentStop);

    const targetPrice = isBuy
      ? entryPrice * (1 + percentTarget)
      : entryPrice * (1 - percentTarget);

    const priceDiff = Math.abs(entryPrice - stopPrice);
    
    // Position sizing = Capital / Entry price or Risk dollars / priceDiff
    let finalTradeSize = settings.positionSize / entryPrice;
    if (priceDiff > 0) {
      const riskBasedSize = riskDollars / priceDiff;
      // Cap at double of target setting size
      finalTradeSize = Math.min(riskBasedSize, (settings.positionSize * 2.5) / entryPrice);
    }

    // Format trade sizes nicely
    if (signal.assetType === "CRYPTO") {
      finalTradeSize = parseFloat(finalTradeSize.toFixed(4));
    } else {
      finalTradeSize = Math.max(1, Math.round(finalTradeSize));
    }

    const newTrade: SimulatedTrade = {
      id: `tr-${Date.now()}-${signal.symbol}-${Math.floor(Math.random() * 1000)}`,
      symbol: signal.symbol,
      strategy: signal.patternName,
      direction: signal.direction,
      entryPrice,
      stopLoss: parseFloat(stopPrice.toFixed(2)),
      target: parseFloat(targetPrice.toFixed(2)),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      status: "OPEN",
      pnl: 0,
      assetType: signal.assetType,
      size: finalTradeSize,
      riskAmount: parseFloat((priceDiff * finalTradeSize).toFixed(2))
    };

    const updated = [newTrade, ...trades];
    this.saveTrades(updated);

    return { success: true, trade: newTrade };
  },

  /**
   * Monitor open positions against new price tick
   */
  tickOpenTrades(quotes: Record<string, { price: number }>): { closedTrades: SimulatedTrade[] } {
    const trades = this.loadTrades();
    let hasChanges = false;
    const closedTrades: SimulatedTrade[] = [];

    const updatedTrades = trades.map(t => {
      if (t.status !== "OPEN") return t;

      const quote = quotes[t.symbol];
      if (!quote) return t;

      const currentPrice = quote.price;
      const isBuy = t.direction === "BUY";

      let finalStatus: "WIN" | "LOSS" | null = null;
      let finalPnL = 0;

      if (isBuy) {
        if (currentPrice >= t.target) {
          finalStatus = "WIN";
          finalPnL = parseFloat(((t.target - t.entryPrice) * t.size).toFixed(2));
        } else if (currentPrice <= t.stopLoss) {
          finalStatus = "LOSS";
          finalPnL = parseFloat(((t.stopLoss - t.entryPrice) * t.size).toFixed(2));
        }
      } else { // SELL short
        if (currentPrice <= t.target) {
          finalStatus = "WIN";
          finalPnL = parseFloat(((t.entryPrice - t.target) * t.size).toFixed(2));
        } else if (currentPrice >= t.stopLoss) {
          finalStatus = "LOSS";
          finalPnL = parseFloat(((t.entryPrice - t.stopLoss) * t.size).toFixed(2));
        }
      }

      if (finalStatus) {
        hasChanges = true;
        const finalized: SimulatedTrade = {
          ...t,
          status: finalStatus,
          pnl: finalPnL
        };
        closedTrades.push(finalized);
        return finalized;
      }

      // Update transient paper PnL for visual aids
      const currentPnL = isBuy
        ? parseFloat(((currentPrice - t.entryPrice) * t.size).toFixed(2))
        : parseFloat(((t.entryPrice - currentPrice) * t.size).toFixed(2));
      
      if (Math.abs(t.pnl - currentPnL) > 0.01) {
        hasChanges = true;
        return {
          ...t,
          pnl: currentPnL
        };
      }

      return t;
    });

    if (hasChanges) {
      this.saveTrades(updatedTrades);
    }

    return { closedTrades };
  },

  /**
   * Manually delete trades
   */
  clearTradeHistory(): void {
    this.saveTrades([]);
  },

  /**
   * Compiles modular statistical analytics of the portfolio
   */
  calculateAnalytics(totalSignalsCount = 0): PortfolioAnalytics {
    const trades = this.loadTrades();
    
    // Helper default factories
    const initClassStats = (sigCount = 0): ClassStats => ({
      totalSignals: sigCount,
      winRate: 0,
      profitFactor: 1,
      simulatedPnL: 0,
      averageRiskReward: 0,
      tradesCount: 0,
      winsCount: 0,
      lossesCount: 0
    });

    const overall = initClassStats(totalSignalsCount);
    const crypto = initClassStats();
    const stocks = initClassStats();
    const indexes = initClassStats();

    // Strategy performances matrix map
    const strategyPerf: Record<string, { pnl: number; wins: number; total: number }> = {};

    let overallGrossProfits = 0;
    let overallGrossLosses = 0;
    let overallTotalRRRatioAccum = 0;
    let overallClosedRRCount = 0;

    let crGrossProf = 0, crGrossLoss = 0, crRRAccum = 0, crRRCount = 0;
    let stGrossProf = 0, stGrossLoss = 0, stRRAccum = 0, stRRCount = 0;
    let ixGrossProf = 0, ixGrossLoss = 0, ixRRAccum = 0, ixRRCount = 0;

    for (const t of trades) {
      const isCompleted = t.status !== "OPEN";
      const isWin = t.status === "WIN";
      const isLoss = t.status === "LOSS";

      // Strategy aggregation
      if (!strategyPerf[t.strategy]) {
        strategyPerf[t.strategy] = { pnl: 0, wins: 0, total: 0 };
      }
      strategyPerf[t.strategy].pnl += t.pnl;
      strategyPerf[t.strategy].total += 1;
      if (isWin) strategyPerf[t.strategy].wins += 1;

      // Group totals
      const dest = t.assetType === "CRYPTO" ? crypto : t.assetType === "STOCK" ? stocks : indexes;
      
      dest.tradesCount += 1;
      overall.tradesCount += 1;

      if (isCompleted) {
        dest.simulatedPnL += t.pnl;
        overall.simulatedPnL += t.pnl;

        if (isWin) {
          dest.winsCount += 1;
          overall.winsCount += 1;

          if (t.assetType === "CRYPTO") crGrossProf += t.pnl;
          else if (t.assetType === "STOCK") stGrossProf += t.pnl;
          else ixGrossProf += t.pnl;

          overallGrossProfits += t.pnl;
        } else if (isLoss) {
          dest.lossesCount += 1;
          overall.lossesCount += 1;

          const absPnL = Math.abs(t.pnl);
          if (t.assetType === "CRYPTO") crGrossLoss += absPnL;
          else if (t.assetType === "STOCK") stGrossLoss += absPnL;
          else ixGrossLoss += absPnL;

          overallGrossLosses += absPnL;
        }

        // Calculate trade risk/reward design ratio
        const entryToTarget = Math.abs(t.target - t.entryPrice);
        const entryToStop = Math.abs(t.entryPrice - t.stopLoss);
        if (entryToStop > 0) {
          const rr = entryToTarget / entryToStop;
          overallTotalRRRatioAccum += rr;
          overallClosedRRCount += 1;

          if (t.assetType === "CRYPTO") {
            crRRAccum += rr;
            crRRCount += 1;
          } else if (t.assetType === "STOCK") {
            stRRAccum += rr;
            stRRCount += 1;
          } else {
            ixRRAccum += rr;
            ixRRCount += 1;
          }
        }
      }
    }

    // Process Win Rates
    const compileFinalStats = (s: ClassStats, grProfText: number, grLossText: number, rrAccum: number, rrCount: number) => {
      const closedTradesCount = s.winsCount + s.lossesCount;
      s.winRate = closedTradesCount > 0 ? (s.winsCount / closedTradesCount) * 100 : 0;
      s.profitFactor = grLossText > 0 ? parseFloat((grProfText / grLossText).toFixed(2)) : grProfText > 0 ? 99 : 1;
      s.averageRiskReward = rrCount > 0 ? parseFloat((rrAccum / rrCount).toFixed(2)) : 0;
      s.simulatedPnL = parseFloat(s.simulatedPnL.toFixed(2));
    };

    compileFinalStats(overall, overallGrossProfits, overallGrossLosses, overallTotalRRRatioAccum, overallClosedRRCount);
    compileFinalStats(crypto, crGrossProf, crGrossLoss, crRRAccum, crRRCount);
    compileFinalStats(stocks, stGrossProf, stGrossLoss, stRRAccum, stRRCount);
    compileFinalStats(indexes, ixGrossProf, ixGrossLoss, ixRRAccum, ixRRCount);

    // Dynamic signal counts split estimates
    crypto.totalSignals = Math.max(0, Math.round(totalSignalsCount * 0.4));
    stocks.totalSignals = Math.max(0, Math.round(totalSignalsCount * 0.35));
    indexes.totalSignals = Math.max(0, Math.round(totalSignalsCount * 0.25));

    return {
      overall,
      crypto,
      stocks,
      indexes,
      strategyPerformance: strategyPerf
    };
  }
};
