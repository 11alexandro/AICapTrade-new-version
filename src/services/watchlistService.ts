/**
 * Watchlist Service
 * Handles loading, saving, adding, removing, and favoriting watchlist assets.
 */
import { SupportedAsset } from "../types";

export const DEFAULT_WATCHLIST: string[] = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "AAPL",
  "NVDA",
  "S&P 500"
];

export const SUPPORTED_ASSETS: SupportedAsset[] = [
  { symbol: "BTC/USDT", name: "Bitcoin", type: "CRYPTO" },
  { symbol: "ETH/USDT", name: "Ethereum", type: "CRYPTO" },
  { symbol: "SOL/USDT", name: "Solana", type: "CRYPTO" },
  { symbol: "AAPL", name: "Apple Inc.", type: "STOCK" },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "STOCK" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "STOCK" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "STOCK" },
  { symbol: "S&P 500", name: "S&P 500 Index", type: "INDEX" },
  { symbol: "NASDAQ 100", name: "NASDAQ 100 Index", type: "INDEX" }
];

export const watchlistService = {
  getWatchlist(): string[] {
    const stored = localStorage.getItem("aistudio-watchlist");
    if (!stored) {
      this.saveWatchlist(DEFAULT_WATCHLIST);
      return DEFAULT_WATCHLIST;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure standard core crypto assets exist
        const updated = [...parsed];
        if (!updated.includes("BTC/USDT")) updated.push("BTC/USDT");
        if (!updated.includes("ETH/USDT")) updated.push("ETH/USDT");
        if (!updated.includes("SOL/USDT")) updated.push("SOL/USDT");

        // Automatically migrate old crypto-only watchlists to integrate stock and index catalog assets
        const hasStockOrIndex = updated.some((sym) => {
          const asset = SUPPORTED_ASSETS.find((a) => a.symbol === sym);
          return asset && (asset.type === "STOCK" || asset.type === "INDEX");
        });
        if (!hasStockOrIndex) {
          const merged = Array.from(new Set([...updated, ...DEFAULT_WATCHLIST])).filter(s => s !== "S&P 550");
          this.saveWatchlist(merged);
          return merged;
        }
        this.saveWatchlist(updated);
        return updated;
      }
      return DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  },

  saveWatchlist(watchlist: string[]): void {
    localStorage.setItem("aistudio-watchlist", JSON.stringify(watchlist));
  },

  getFavorites(): string[] {
    const stored = localStorage.getItem("aistudio-favorites");
    if (!stored) {
      const defaultFavs = ["BTC/USDT", "AAPL"];
      this.saveFavorites(defaultFavs);
      return defaultFavs;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveFavorites(favorites: string[]): void {
    localStorage.setItem("aistudio-favorites", JSON.stringify(favorites));
  },

  addToWatchlist(symbol: string): string[] {
    const current = this.getWatchlist();
    if (!current.includes(symbol)) {
      const updated = [...current, symbol];
      this.saveWatchlist(updated);
      return updated;
    }
    return current;
  },

  removeFromWatchlist(symbol: string): string[] {
    const current = this.getWatchlist();
    const updated = current.filter(s => s !== symbol);
    this.saveWatchlist(updated);
    return updated;
  },

  toggleFavorite(symbol: string): string[] {
    const current = this.getFavorites();
    let updated: string[];
    if (current.includes(symbol)) {
      updated = current.filter(s => s !== symbol);
    } else {
      updated = [...current, symbol];
    }
    this.saveFavorites(updated);
    return updated;
  },

  searchAssets(query: string): SupportedAsset[] {
    if (!query) return SUPPORTED_ASSETS;
    const clean = query.toLowerCase().trim();
    return SUPPORTED_ASSETS.filter(
      a => a.symbol.toLowerCase().includes(clean) || a.name.toLowerCase().includes(clean)
    );
  }
};
