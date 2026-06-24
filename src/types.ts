/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = "1D" | "7D" | "1M" | "1Y" | "All";

export interface Trade {
  id: string;
  time: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  status: "EXECUTED" | "PENDING" | "TRIGGERED";
  pnl?: number;
  strategy?: string;
}

export interface BotConfig {
  isRunning: boolean;
  strategy: string;
  riskLevel: "Low" | "Medium" | "High" | "Institutional";
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  dailyRewards: number;
  currentTier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

export interface SparklinePoint {
  x: number;
  y: number;
}

export interface MetricData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  points: SparklinePoint[];
  color: "blue" | "red" | "pink" | "orange";
}

export type MarketSessionType = 
  | "BULLISH_TREND" 
  | "BEARISH_TREND" 
  | "SIDEWAYS_RANGE" 
  | "BREAKOUT_EXPANSION" 
  | "HIGH_VOLATILITY" 
  | "LOW_VOLATILITY" 
  | "REVERSAL";

export interface SessionMetrics {
  current: MarketSessionType;
  label: string;
  volatility: number; // multiplier
  trend: number; // direction factor (-1 to +1)
  description: string;
  confidence: number; // AI confidence 0-100
  sentiment: "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONG_BEARISH" | "HIGH_RISK_FLUID";
  riskScore: number; // risk score 0-100
}

export interface DailyEpoch {
  id: string;
  epochNumber: number;
  startingBalance: number;
  endingBalance: number;
  allocatedCapitalLimit: number;
  totalTradesTaken: number;
  realizedPnL: number;
  winRate: number;
  dateString: string;
  status: "COMPLETED" | "ACTIVE";
}

export interface SupportedAsset {
  symbol: string;
  name: string;
  type: "CRYPTO" | "STOCK" | "INDEX";
  favorite?: boolean;
}



