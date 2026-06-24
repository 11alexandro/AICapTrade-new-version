/**
 * Indicator Service
 * Computes standard VWAP, RSI (14), and EMA (9) on historical data
 */
import { Candle } from "../types";

export const indicatorService = {
  /**
   * Calculates VWAP on an array of Candlesticks
   * Formula: Sum(TypicalPrice * Volume) / Sum(Volume)
   */
  calculateVWAP(candles: Candle[]): number {
    if (candles.length === 0) return 0;
    
    let totalTypicalPriceVolume = 0;
    let totalVolume = 0;

    for (const c of candles) {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      totalTypicalPriceVolume += typicalPrice * c.volume;
      totalVolume += c.volume;
    }

    if (totalVolume === 0) return candles[candles.length - 1].close;
    return parseFloat((totalTypicalPriceVolume / totalVolume).toFixed(4));
  },

  /**
   * Calculates RSI (14) using exponential smoothing (Wilder's smoothing)
   */
  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length <= period) return 50; // default neutral representation

    let gains = 0;
    let losses = 0;

    // First RSI step: Initial simple average
    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) {
        gains += diff;
      } else {
        losses -= diff;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Subsequent wilder's smoothing steps
    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    return parseFloat(rsi.toFixed(2));
  },

  /**
   * Calculates Exponential Moving Average (EMA)
   */
  calculateEMA(prices: number[], period: number = 9): number {
    if (prices.length === 0) return 0;
    if (prices.length <= period) {
      // Return simple SMA as fallback representational start
      const sum = prices.reduce((a, b) => a + b, 0);
      return parseFloat((sum / prices.length).toFixed(4));
    }

    // Alpha weighting multiplier multiplier
    const k = 2 / (period + 1);
    
    // Starting value is SMA of first segment
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate dynamic EMA sequence
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }

    return parseFloat(ema.toFixed(4));
  }
};
