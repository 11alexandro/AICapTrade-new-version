/**
 * Socket Service
 * Connects to live Binance WebSocket stream for real-time cryptocurrency data
 * Falls back to high-fidelity microsecond mock streams if offline or blocked
 */

export interface TickerUpdate {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  direction: "up" | "down" | "flat";
}

export type ConnectionStatus = "CONNECTED" | "RECONNECTING" | "SIMULATED";

export interface SocketDiagnostics {
  status: ConnectionStatus;
  lastMessageTimestamp: number | null;
  reconnectAttempts: number;
  prices: Record<string, number>;
}

type TickerCallback = (data: TickerUpdate) => void;
type StatusCallback = (status: ConnectionStatus) => void;
type DiagnosticsCallback = (diagnostics: SocketDiagnostics) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private callbacks: Set<TickerCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private diagnosticsCallbacks: Set<DiagnosticsCallback> = new Set();
  
  private reconnectTimeout: any = null;
  private simulatedInterval: any = null;
  private watchdogInterval: any = null;
  private diagTimeout: any = null;
  private pendingDiag = false;
  
  private isSimulatedFallback = false;
  private connectionStatus: ConnectionStatus = "SIMULATED";
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private lastMessageTimestamp: number | null = null;
  private connectStartTime: number | null = null;
  private messageCounter = 0; // Keeping as simple reference without logs

  private preFetchComplete = false;
  private pendingConnect = false;

  // Note: These are baseline hardcoded fallback values for emergency offline use only.
  // The constructor immediately executes preFetchPrices() to fetch real-time REST ticker prices on startup.
  private lastPrices: Record<string, number> = {
    "BTC/USDT": 107000.00,
    "ETH/USDT": 2520.00,
    "SOL/USDT": 148.00,
    "XRP/USDT": 2.28,
  };

  // Note: These are baseline hardcoded fallback values for emergency offline use only.
  // The constructor immediately executes preFetchPrices() to fetch real-time REST ticker prices on startup.
  private cache: Record<string, { price: number; changePercent: number; volume: number }> = {
    "BTC/USDT": { price: 107000.00, changePercent: 2.34, volume: 15420.5 },
    "ETH/USDT": { price: 2520.00, changePercent: 1.23, volume: 84351.2 },
    "SOL/USDT": { price: 148.00, changePercent: -0.85, volume: 142500 },
    "XRP/USDT": { price: 2.28, changePercent: 1.20, volume: 2284100 },
  };

  // Day open prices seeded from REST on startup or fallback baseline
  private dayOpenPrices: Record<string, number> = {
    "BTC/USDT": 105000.00,
    "ETH/USDT": 2500.00,
    "SOL/USDT": 146.00,
    "XRP/USDT": 2.20,
  };

  constructor() {
    this.preFetchPrices();
  }

  /**
   * Pre-fetch current real prices on startup from public Binance REST API
   * to seed lastPrices, cache, and dayOpenPrices before WebSocket starts ticking.
   */
  private async preFetchPrices() {
    try {
      // Seed data from the public REST API on startup before the socket starts
      const symbolsParam = encodeURIComponent('["BTCUSDT","ETHUSDT","SOLUSDT","XRPUSDT"]');
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const binanceToAppSymbol: Record<string, string> = {
            "BTCUSDT": "BTC/USDT",
            "ETHUSDT": "ETH/USDT",
            "SOLUSDT": "SOL/USDT",
            "XRPUSDT": "XRP/USDT"
          };

          data.forEach((item: any) => {
            const appSymbol = binanceToAppSymbol[item.symbol];
            if (appSymbol) {
              const lastPrice = parseFloat(item.lastPrice);
              const openPrice = parseFloat(item.openPrice);
              const priceChangePercent = parseFloat(item.priceChangePercent);
              const volume = parseFloat(item.volume);

              // Seed active pricing, day open parameters and percent metrics from REST response
              if (!isNaN(lastPrice)) {
                this.lastPrices[appSymbol] = lastPrice;
                this.cache[appSymbol].price = lastPrice;
              }
              if (!isNaN(openPrice)) {
                this.dayOpenPrices[appSymbol] = openPrice;
              }
              if (!isNaN(priceChangePercent)) {
                this.cache[appSymbol].changePercent = priceChangePercent;
              }
              if (!isNaN(volume)) {
                this.cache[appSymbol].volume = volume;
              }
            }
          });

          // Trigger early update events with live pre-fetched values
          Object.keys(this.cache).forEach(symbol => {
            const current = this.cache[symbol];
            this.triggerCallbacks({
              symbol,
              price: current.price,
              changePercent: current.changePercent,
              volume: current.volume,
              direction: "flat"
            });
          });
          this.triggerDiagnostics();
        }
      }
      this.preFetchComplete = true;
      if (this.pendingConnect) {
        this.pendingConnect = false;
        this.connect();
      }
    } catch (e) {
      // Keep hardcoded fallback values silently if fetch fails on startup
      this.preFetchComplete = true;
      // Use current lastPrices as dayOpenPrices so changePercent starts at 0% rather than wrong value
      Object.keys(this.lastPrices).forEach(symbol => {
        this.dayOpenPrices[symbol] = this.lastPrices[symbol];
      });
      if (this.pendingConnect) {
        this.pendingConnect = false;
        this.connect();
      }
    }
  }

  public getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public getDiagnostics(): SocketDiagnostics {
    return {
      status: this.connectionStatus,
      lastMessageTimestamp: this.lastMessageTimestamp,
      reconnectAttempts: this.reconnectAttempts,
      prices: { ...this.lastPrices }
    };
  }

  public subscribeStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.connectionStatus);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  public subscribeDiagnostics(callback: DiagnosticsCallback): () => void {
    this.diagnosticsCallbacks.add(callback);
    callback(this.getDiagnostics());
    return () => {
      this.diagnosticsCallbacks.delete(callback);
    };
  }

  private setStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusCallbacks.forEach(cb => {
        try {
          cb(status);
        } catch (err) {
          // silent error handling
        }
      });
      this.triggerDiagnostics();
    }
  }

  private triggerDiagnostics() {
    if (this.diagTimeout) {
      this.pendingDiag = true;
      return;
    }

    const d = this.getDiagnostics();
    this.diagnosticsCallbacks.forEach(cb => {
      try {
        cb(d);
      } catch (err) {
        // silent error handling
      }
    });

    this.diagTimeout = setTimeout(() => {
      this.diagTimeout = null;
      if (this.pendingDiag) {
        this.pendingDiag = false;
        this.triggerDiagnostics();
      }
    }, 300);
  }

  public subscribe(callback: TickerCallback): () => void {
    this.callbacks.add(callback);
    
    // Start socket or simulation if not already running
    if (!this.ws && !this.isSimulatedFallback) {
      if (this.preFetchComplete) {
        this.connect();
      } else {
        this.pendingConnect = true; // wait for pre-fetch before opening socket
      }
    }

    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.disconnect();
      }
    };
  }

  private connect() {
    this.disconnectSimulated();
    this.stopWatchdog();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (err) {}
      this.ws = null;
    }

    this.setStatus("RECONNECTING");
    this.connectStartTime = Date.now();
    this.startWatchdog();

    try {
      // Use Binance combined stream endpoint with trade streams as requested
      const url = `wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade/xrpusdt@trade`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isSimulatedFallback = false;
        this.reconnectAttempts = 0;
        this.setStatus("CONNECTED");
        this.triggerDiagnostics();
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const streamName = raw.stream || "";
          const data = raw.data || raw;

          if (!data) return;

          const binanceSymbol = data.s; // e.g. "BTCUSDT"
          const price = parseFloat(data.p); // trade price
          const quantity = parseFloat(data.q); // trade quantity (volume increment)
          const receiveTimestamp = data.E || Date.now();

          let symbol = "";
          if (binanceSymbol === "BTCUSDT") symbol = "BTC/USDT";
          else if (binanceSymbol === "ETHUSDT") symbol = "ETH/USDT";
          else if (binanceSymbol === "SOLUSDT") symbol = "SOL/USDT";
          else if (binanceSymbol === "XRPUSDT") symbol = "XRP/USDT";

          if (symbol && !isNaN(price)) {
            this.lastMessageTimestamp = Date.now();
            this.lastPrices[symbol] = price;

            const current = this.cache[symbol];
            const previousPrice = current.price;
            const direction = price > previousPrice ? "up" : price < previousPrice ? "down" : "flat";

            // Trade streams do not give 24h change percent directly, so we calculate it using dayOpenPrices
            const openPrice = this.dayOpenPrices[symbol] || 60000;
            const changePercent = parseFloat(((price - openPrice) / openPrice * 100).toFixed(2));
            const volume = current.volume + quantity * 0.001; // dampen accumulation

            // Update cache
            this.cache[symbol] = { price, changePercent, volume };

            const update: TickerUpdate = {
              symbol,
              price,
              changePercent,
              volume,
              direction
            };

            this.triggerCallbacks(update);
            this.triggerDiagnostics();
          }
        } catch (e) {
          // Silent catch
        }
      };

      this.ws.onerror = (err) => {
        // Silent catch
      };

      this.ws.onclose = () => {
        if (this.isSimulatedFallback) {
          return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.setStatus("RECONNECTING");
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, 4000);
        } else {
          this.activateSimulationFallback();
        }
      };

    } catch (e) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.setStatus("RECONNECTING");
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 4000);
      } else {
        this.activateSimulationFallback();
      }
    }
  }

  private startWatchdog() {
    this.stopWatchdog();
    this.watchdogInterval = setInterval(() => {
      if (this.connectionStatus === "CONNECTED" || this.connectionStatus === "RECONNECTING") {
        const now = Date.now();
        const baseTime = this.lastMessageTimestamp || this.connectStartTime || now;
        const inactiveTime = now - baseTime;
        
        if (inactiveTime >= 60000) {
          this.activateSimulationFallback();
        }
      }
    }, 2000);
  }

  private stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  private activateSimulationFallback() {
    this.isSimulatedFallback = true;
    this.setStatus("SIMULATED");
    this.stopWatchdog();

    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.disconnectSimulated();

    // Start robust random walk simulation simulating trade stream
    this.simulatedInterval = setInterval(() => {
      const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT"];
      
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const current = this.cache[symbol];
      
      const volatility = symbol === "BTC/USDT" ? 1.5 : symbol === "ETH/USDT" ? 0.35 : symbol === "SOL/USDT" ? 0.08 : 0.0006;
      const change = (Math.random() - 0.495) * volatility;
      const decimalPlaces = symbol === "XRP/USDT" ? 4 : 2;
      const nextPrice = Math.max(0.0001, parseFloat((current.price + change).toFixed(decimalPlaces)));
      
      this.lastPrices[symbol] = nextPrice;
      const previousPrice = current.price;
      const direction = nextPrice > previousPrice ? "up" : nextPrice < previousPrice ? "down" : "flat";
      
      const nextPercentChange = parseFloat((current.changePercent + (change / current.price) * 100).toFixed(2));
      const nextVolume = current.volume + Math.random() * 5;

      this.cache[symbol] = {
        price: nextPrice,
        changePercent: nextPercentChange,
        volume: nextVolume
      };

      this.triggerCallbacks({
        symbol,
        price: nextPrice,
        changePercent: nextPercentChange,
        volume: nextVolume,
        direction
      });
      this.triggerDiagnostics();
    }, 450);
  }

  private triggerCallbacks(update: TickerUpdate) {
    this.callbacks.forEach(cb => {
      try {
        cb(update);
      } catch (err) {
        // Silent catch
      }
    });
  }

  private disconnect() {
    this.stopWatchdog();
    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (err) {}
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.disconnectSimulated();
    this.isSimulatedFallback = false;
    this.reconnectAttempts = 0;
  }

  private disconnectSimulated() {
    if (this.simulatedInterval) {
      clearInterval(this.simulatedInterval);
      this.simulatedInterval = null;
    }
  }
}

export const socketService = new SocketService();
