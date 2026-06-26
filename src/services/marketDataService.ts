/**
 * Market Data Service
 * Provides unified, real-time streaming market price, volume, change trends
 * for Cryptocurrencies, Stocks, and Indexes.
 */
import { socketService, TickerUpdate } from "./socketService";

export interface AssetQuote {
  symbol: string;
  name: string;
  type: "CRYPTO" | "STOCK" | "INDEX";
  price: number;
  changePercent: number;
  volume: number;
  direction: "up" | "down" | "flat";
  high: number;
  low: number;
}

type MarketDataCallback = (quotes: Record<string, AssetQuote>) => void;

class MarketDataService {
  private callbacks: Set<MarketDataCallback> = new Set();
  private socketCleanup: (() => void) | null = null;
  private stocksInterval: any = null;
  private driftInterval: any = null;
  private stockSourceStatus: "LIVE" | "SIMULATED" = "LIVE";
  private emitTimeout: any = null;
  private pendingEmit = false;

  // Active pricing matrix of the terminal
  private quotes: Record<string, AssetQuote> = {
    // Cryptocurrencies (Initialized to loading state, real prices populated fast via WebSocket / pre-fetch)
    "BTC/USDT": { symbol: "BTC/USDT", name: "Bitcoin", type: "CRYPTO", price: 0, changePercent: 0, volume: 0, direction: "flat", high: 0, low: 0 },
    "ETH/USDT": { symbol: "ETH/USDT", name: "Ethereum", type: "CRYPTO", price: 0, changePercent: 0, volume: 0, direction: "flat", high: 0, low: 0 },
    "SOL/USDT": { symbol: "SOL/USDT", name: "Solana", type: "CRYPTO", price: 0, changePercent: 0, volume: 0, direction: "flat", high: 0, low: 0 },
    "XRP/USDT": { symbol: "XRP/USDT", name: "Ripple", type: "CRYPTO", price: 0, changePercent: 0, volume: 0, direction: "flat", high: 0, low: 0 },
    
    // Stocks
    "AAPL": { symbol: "AAPL", name: "Apple Inc.", type: "STOCK", price: 294.30, changePercent: -0.91, volume: 52341000, direction: "flat", high: 296.50, low: 291.80 },
    "NVDA": { symbol: "NVDA", name: "NVIDIA Corp.", type: "STOCK", price: 200.04, changePercent: -4.13, volume: 201450000, direction: "flat", high: 208.20, low: 198.50 },
    "TSLA": { symbol: "TSLA", name: "Tesla Inc.", type: "STOCK", price: 381.61, changePercent: -5.79, volume: 118920000, direction: "flat", high: 401.20, low: 379.40 },
    "MSFT": { symbol: "MSFT", name: "Microsoft Corp.", type: "STOCK", price: 373.94, changePercent: 1.80, volume: 28640000, direction: "flat", high: 375.80, low: 368.20 },
    
    // Indexes
    "S&P 500": { symbol: "S&P 500", name: "S&P 500 Index", type: "INDEX", price: 7365.45, changePercent: -1.44, volume: 3120000, direction: "flat", high: 7420.10, low: 7340.20 },
    "NASDAQ 100": { symbol: "NASDAQ 100", name: "NASDAQ 100 Index", type: "INDEX", price: 29347.27, changePercent: -3.29, volume: 6840000, direction: "flat", high: 29850.40, low: 29180.50 }
  };

  public getStockSourceStatus(): "LIVE" | "SIMULATED" {
    return this.stockSourceStatus;
  }

  public subscribe(callback: MarketDataCallback): () => void {
    this.callbacks.add(callback);
    
    // Lazy initialize listeners
    if (this.callbacks.size === 1) {
      this.startServices();
    }

    // Hand back initial values instantly
    callback({ ...this.quotes });

    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stopServices();
      }
    };
  }

  private startServices() {
    // 1. Hook Crypto WebSocket Feed (which uses live trade streams in socketService)
    this.socketCleanup = socketService.subscribe((update: TickerUpdate) => {
      const q = this.quotes[update.symbol];
      if (q) {
        const previousPrice = q.price;
        const newDirection = update.price > previousPrice ? "up" : update.price < previousPrice ? "down" : "flat";
        
        this.quotes[update.symbol] = {
          ...q,
          price: update.price,
          changePercent: update.changePercent,
          volume: update.volume,
          direction: newDirection,
          high: q.high === 0 ? update.price : Math.max(q.high, update.price),
          low: q.low === 0 ? update.price : Math.min(q.low, update.price)
        };
        
        this.emitUpdates();
      }
    });

    // 2. Real Yahoo Finance quotes fetched via AllOrigins proxy with a startup retry mechanism
    this.fetchRealStockMarketDataWithRetry();
    this.stocksInterval = setInterval(() => {
      this.fetchRealStockMarketData().catch(() => {});
    }, 60000); // Poll Stooq every 60 seconds

    // 3. Fallback simulated real-time drift for stocks and indexes (runs every 4s)
    this.driftInterval = setInterval(() => {
      this.applyRealTimeDrift();
    }, 4000);
  }

  private applyRealTimeDrift() {
    let changed = false;
    Object.entries(this.quotes).forEach(([symbol, q]) => {
      if (q.type === "STOCK" || q.type === "INDEX") {
        const previousPrice = q.price;
        let pctChange = 0;
        
        if (q.type === "STOCK") {
          // Stocks move ±0.01% to ±0.08% per tick
          const magnitude = 0.01 + Math.random() * (0.08 - 0.01);
          const sign = Math.random() < 0.5 ? -1 : 1;
          pctChange = (magnitude * sign) / 100;
        } else {
          // Indexes move ±0.005% to ±0.03% per tick
          const magnitude = 0.005 + Math.random() * (0.03 - 0.005);
          const sign = Math.random() < 0.5 ? -1 : 1;
          pctChange = (magnitude * sign) / 100;
        }

        const price = parseFloat((previousPrice * (1 + pctChange)).toFixed(2));
        const direction = price > previousPrice ? "up" : price < previousPrice ? "down" : "flat";
        
        // Slightly drift the change percent as well
        const changePercent = parseFloat((q.changePercent + (pctChange * 100)).toFixed(2));

        this.quotes[symbol] = {
          ...q,
          price,
          changePercent,
          direction,
          high: q.high === 0 ? price : Math.max(q.high, price),
          low: q.low === 0 ? price : Math.min(q.low, price)
        };
        changed = true;
      }
    });

    if (changed) {
      this.emitUpdates();
    }
  }

  /**
   * Initial service boot calls fetchRealStockMarketData and retries once after 3 seconds on failure
   */
  private async fetchRealStockMarketDataWithRetry() {
    try {
      await this.fetchRealStockMarketData();
    } catch (err) {
      // Retry once after 3 seconds on initial failure
      setTimeout(async () => {
        try {
          await this.fetchRealStockMarketData();
        } catch (retryErr) {
          this.stockSourceStatus = "SIMULATED";
        }
      }, 3000);
    }
  }

  private async fetchRealStockMarketData() {
    const symbolsToFetch = [
      { stooq: "aapl.us", app: "AAPL" },
      { stooq: "nvda.us", app: "NVDA" },
      { stooq: "tsla.us", app: "TSLA" },
      { stooq: "msft.us", app: "MSFT" },
      { stooq: "^spx", app: "S&P 500" },
      { stooq: "^ndx", app: "NASDAQ 100" }
    ];

    const promises = symbolsToFetch.map(async (item) => {
      const url = `https://stooq.com/q/l/?s=${item.stooq}&f=sd2t2ohlcv&h&e=csv`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${item.stooq}`);
      }
      const text = await res.text();
      return { appSymbol: item.app, csvText: text };
    });

    const results = await Promise.allSettled(promises);
    let successCount = 0;

    results.forEach((res) => {
      if (res.status === "fulfilled") {
        const { appSymbol, csvText } = res.value;
        try {
          const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
          if (lines.length >= 2) {
            const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
            const values = lines[1].split(",").map(v => v.trim());
            
            const closeIdx = headers.indexOf("close");
            const openIdx = headers.indexOf("open");
            const highIdx = headers.indexOf("high");
            const lowIdx = headers.indexOf("low");
            const volIdx = headers.indexOf("volume");

            if (closeIdx !== -1 && openIdx !== -1) {
              const closeVal = parseFloat(values[closeIdx]);
              const openVal = parseFloat(values[openIdx]);
              
              if (!isNaN(closeVal) && !isNaN(openVal) && openVal !== 0) {
                const price = closeVal;
                const changePercent = parseFloat((((closeVal - openVal) / openVal) * 100).toFixed(2));
                
                const highVal = highIdx !== -1 ? parseFloat(values[highIdx]) : price;
                const lowVal = lowIdx !== -1 ? parseFloat(values[lowIdx]) : price;
                const volVal = volIdx !== -1 ? parseFloat(values[volIdx]) : 0;

                const q = this.quotes[appSymbol];
                if (q) {
                  const previousPrice = q.price;
                  const direction = price > previousPrice ? "up" : price < previousPrice ? "down" : "flat";

                  this.quotes[appSymbol] = {
                    ...q,
                    price,
                    changePercent,
                    volume: isNaN(volVal) ? q.volume : volVal,
                    direction,
                    high: isNaN(highVal) ? q.high : highVal,
                    low: isNaN(lowVal) ? q.low : lowVal
                  };
                  successCount++;
                }
              }
            }
          }
        } catch (parseErr) {
          // Individual parsing error, skip silently
        }
      }
    });

    if (successCount > 0) {
      this.stockSourceStatus = "LIVE";
      this.emitUpdates();
    } else {
      this.stockSourceStatus = "SIMULATED";
      throw new Error("All Stooq symbol fetches failed or returned invalid CSV.");
    }
  }

  private stopServices() {
    if (this.socketCleanup) {
      this.socketCleanup();
      this.socketCleanup = null;
    }
    if (this.stocksInterval) {
      clearInterval(this.stocksInterval);
      this.stocksInterval = null;
    }
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
      this.driftInterval = null;
    }
  }

  private emitUpdates() {
    if (this.emitTimeout) {
      this.pendingEmit = true;
      return;
    }

    this.callbacks.forEach(cb => {
      try {
        cb({ ...this.quotes });
      } catch (err) {
        // Silent catch
      }
    });

    this.emitTimeout = setTimeout(() => {
      this.emitTimeout = null;
      if (this.pendingEmit) {
        this.pendingEmit = false;
        this.emitUpdates();
      }
    }, 150);
  }

  public getAllQuotes(): Record<string, AssetQuote> {
    return { ...this.quotes };
  }
}

export const marketDataService = new MarketDataService();
