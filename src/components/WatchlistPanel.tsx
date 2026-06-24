import React, { useState, useMemo } from "react";
import { Star, Search, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useTerminal } from "../store/TerminalStateContext";
import { watchlistService, SUPPORTED_ASSETS } from "../services/watchlistService";
import { SupportedAsset } from "../types";

export function WatchlistPanel() {
  const {
    watchlist,
    setWatchlist,
    favorites,
    setFavorites,
    allQuotes,
    selectedAsset,
    setSelectedAsset
  } = useTerminal();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | "CRYPTO" | "STOCK" | "INDEX">("ALL");

  // Restore the full list of multi-asset defaults to watchlist
  const handleRestoreDefaults = () => {
    const defaults = ["BTC/USDT", "ETH/USDT", "AAPL", "NVDA", "S&P 500"];
    watchlistService.saveWatchlist(defaults);
    setWatchlist(defaults);
  };

  // Toggle favorite trigger
  const handleToggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = watchlistService.toggleFavorite(symbol);
    setFavorites(updated);
  };

  // Remove asset from watchlist
  const handleRemoveAsset = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = watchlistService.removeFromWatchlist(symbol);
    setWatchlist(updated);
  };

  // Add asset to watchlist
  const handleAddAsset = (symbol: string) => {
    const updated = watchlistService.addToWatchlist(symbol);
    setWatchlist(updated);
    setShowAddMenu(false);
  };

  // Filter and match supported assets not in current watchlist
  const addableAssets = useMemo(() => {
    return SUPPORTED_ASSETS.filter(
      (asset) => !watchlist.includes(asset.symbol)
    );
  }, [watchlist]);

  // Handle asset matching for the table display
  const items = useMemo(() => {
    return watchlist
      .map((sym) => {
        const config = SUPPORTED_ASSETS.find((a) => a.symbol === sym) || {
          symbol: sym,
          name: sym,
          type: "CRYPTO" as const
        };
        const quote = allQuotes[sym] || {
          price: 0,
          changePercent: 0,
          volume: 0,
          direction: "UP" as const
        };
        const isFav = favorites.includes(sym);
        return {
          ...config,
          ...quote,
          isFavorite: isFav
        };
      })
      .filter((item) => {
        const matchesQuery =
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "ALL" || item.type === activeCategory;
        if (filterFavorites) {
          return matchesQuery && item.isFavorite && matchesCategory;
        }
        return matchesQuery && matchesCategory;
      });
  }, [watchlist, favorites, allQuotes, searchQuery, filterFavorites, activeCategory]);

  return (
    <div className="glass-panel rounded-2xl p-5 bg-slate-950/20 border border-slate-800/80 font-sans shadow-2xl relative select-none">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Asset Watchlist</h2>
          <p className="text-[10px] text-slate-500">Live prices globally synced across networks</p>
        </div>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[11px] font-bold tracking-tight border border-amber-500/15 transition-all cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Add Asset dropdown selection modal */}
      {showAddMenu && (
        <div className="absolute top-16 right-5 left-5 z-20 bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl max-h-60 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase pb-2 mb-2 border-b border-slate-800 tracking-wider">
            Supported Assets Catalog
          </div>
          {addableAssets.length === 0 ? (
            <div className="text-[11px] text-slate-500 py-2.5 text-center">
              All supported assets are added in your watchlist.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {addableAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleAddAsset(asset.symbol)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-500">{asset.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                      {asset.type}
                    </span>
                    <Plus className="h-3.5 w-3.5 text-slate-400 hover:text-amber-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search and Favorite Filters bar */}
      <div className="flex items-center space-x-2.5 py-3.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search terminal assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-slate-800 focus:border-amber-500/40 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
          />
        </div>
        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`px-3 py-2 rounded-xl border text-xs font-medium tracking-tight transition-all flex items-center space-x-1 ${
            filterFavorites
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-slate-900/40 text-slate-500 border-slate-800 hover:text-slate-300"
          }`}
        >
          <Star className={`h-3 w-3 ${filterFavorites ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">Favs Only</span>
        </button>
      </div>

      {/* Category Tabs & Data Reset Index */}
      <div className="flex items-center space-x-1.5 pb-3 overflow-x-auto scrollbar-none border-b border-white/5 mb-3">
        {(["ALL", "CRYPTO", "STOCK", "INDEX"] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const label = cat === "ALL" ? "All Assets" : cat === "CRYPTO" ? "Crypto" : cat === "STOCK" ? "Stocks" : "Indexes";
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-blue-600/20 border-blue-500/35 text-white glow-blue"
                  : "bg-slate-900/40 text-slate-500 border-slate-800 hover:text-slate-350"
              }`}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={handleRestoreDefaults}
          className="ml-auto px-2 py-1 text-[9px] font-mono font-bold text-slate-500 hover:text-amber-400 border border-slate-800 hover:border-amber-500/25 bg-slate-900/40 rounded transition-all cursor-pointer shrink-0"
          title="Reset your watchlist to standard multi-asset defaults"
        >
          Reset Catalog
        </button>
      </div>

      {/* Watchlist table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
              <th className="pb-2.5 font-semibold">Symbol</th>
              <th className="pb-2.5 font-semibold text-right">Price</th>
              <th className="pb-2.5 font-semibold text-right">Change 24H</th>
              <th className="pb-2.5 font-semibold text-right">Volume</th>
              <th className="pb-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No assets found matching current criteria.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedAsset === item.symbol || selectedAsset === item.symbol.split("/")[0];
                const cleanSymbol = item.symbol.endsWith("/USDT") ? item.symbol : `${item.symbol}/USDT`;
                const displayPrice = item.price.toLocaleString(undefined, {
                  minimumFractionDigits: item.symbol === "XRP" || item.symbol === "XRP/USDT" ? 4 : 2,
                  maximumFractionDigits: item.symbol === "XRP" || item.symbol === "XRP/USDT" ? 4 : 2
                });

                return (
                  <tr
                    key={item.symbol}
                    onClick={() => setSelectedAsset(item.symbol)}
                    className={`group hover:bg-white/3 transition-all cursor-pointer ${
                      isSelected ? "bg-amber-500/5 hover:bg-amber-500/8" : ""
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleToggleFavorite(item.symbol, e)}
                          className="text-slate-600 hover:text-amber-500 transition-colors"
                        >
                          <Star
                            className={`h-3 w-3 ${
                              item.isFavorite ? "text-amber-500 fill-current" : ""
                            }`}
                          />
                        </button>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white font-mono tracking-tight">
                              {item.symbol}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 truncate max-w-28">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right text-xs font-bold text-slate-100 font-mono">
                      ${displayPrice}
                    </td>

                    <td className="py-3 text-right">
                      <div
                        className={`inline-flex items-center text-[11px] font-bold font-mono space-x-0.5 ${
                          item.changePercent >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {item.changePercent >= 0 ? (
                          <TrendingUp className="h-2.5 w-2.5" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5" />
                        )}
                        <span>{item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%</span>
                      </div>
                    </td>

                    <td className="py-3 text-right text-[10px] text-slate-500 font-mono">
                      {item.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>

                    <td className="py-3 text-right pr-1">
                      <button
                        onClick={(e) => handleRemoveAsset(item.symbol, e)}
                        className="p-1 text-slate-600 hover:text-red-500 transition-colors rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
