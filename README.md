# AICapTrade
A full-stack real-time crypto and stock trading terminal built for paper trading simulation featuring live price streaming, algorithmic signal detection, and institutional-style risk management.

## Live Demo
🔗 [aicaptrade.vercel.app](aicaptrade.vercel.app)
No sign-in required.

## Why I Built This
I built this project to demonstrate that I understand both the financial concepts and the complex technical architecture required to build real-time trading tools. While most portfolio projects showcase basic CRUD operations with static databases, I wanted to build something that reflects real trading workflows like live streaming order books, low-latency market analysis, and real-time state synchronization. Creating a paper trading simulator allows me to demonstrate this entire full-stack system end-to-end without requiring real capital or brokerage exchange integrations.

## Features

AICapTrade implements high-fidelity real-time simulation, algorithmic monitoring, and deep performance metrics in a fully interactive, production-grade terminal dashboard.

**Live Crypto Price Streaming**
Connects to the Binance public WebSocket (wss://stream.binance.com:9443) for real-time BTC/USDT, ETH/USDT, SOL/USDT and XRP/USDT price feeds. Prices are seeded from the Binance REST API on startup to establish accurate day-open baselines before the WebSocket connects eliminating the race condition where stale percentage-change values appear on first tick. A volume decay formula prevents accumulation artifacts from the high-frequency trade stream.

**Stocks & Indexes Desk**
Tracks AAPL, NVDA, TSLA, MSFT, the S&P 500 and NASDAQ 100 with real-time drift simulation keeping prices visibly moving between polling intervals. A clearly visible "SIMULATED DATA · PAPER TRADING ONLY" badge in the header makes the data sourcing transparent.

**Algorithmic Strategy Scanner**
Detects four real technical patterns in real time: VWAP Reversal, ABCD Pattern, Bull Flag, and Bear Flag. Each signal includes a confidence score, entry price, stop price, target price, RSI reading, EMA9 value, and VWAP status the same fields a discretionary trader would check before entering a position.

**Paper Trading Simulator & Risk Console**
Automatically simulates BUY orders when a monitored asset drops 2% or more within a 10-minute sliding window a classic momentum entry trigger used in short-term discretionary trading. Stop Loss %, Take Profit %, position size (USDT), and maximum concurrent open positions are all configurable from the risk console. The trade history ledger shows WIN/LOSS status and PnL per trade, and the account balance is driven exclusively by the actual trade ledger.

**Portfolio Analytics**
Breaks down performance by asset class (Crypto, Equity, Indexes) and by strategy, showing win rate, profit factor, and realized PnL per strategy. Identifies the leading strategy based on actual closed trade data.

**Watchlist & Notifications**
Custom watchlist with price alerts and a notification system with mark-all-read and clear-all actions.

**Responsive Design**
Full responsive layout for desktop, tablet and mobile. On mobile, the sidebar collapses into a touch-friendly drawer triggered by a hamburger menu. All panels use Tailwind responsive prefixes (sm:, md:, lg:) and horizontal scrollers use touch-pan-x for smooth mobile navigation.

**Market Regime Simulation**
Simulates realistic market conditions by cycling through volatility regimes (trending, mean-reverting, high-volatility). ETH price is correlated to BTC with a 1.15 beta coefficient reflecting the real-world relationship between the two assets.

## Architecture

Data Flow:

Binance WebSocket (wss://)
        │
        ▼
  Node.js Backend
  (Socket.IO Server)
        │
        ▼
  React Frontend
  (TerminalStateContext)
        │
   ┌────┴────┐
   ▼         ▼
TradingChart  SidebarAnalytics
MetricsGrid   BottomAnalytics

The frontend subscribes to Socket.IO which proxies the Binance stream, and TerminalStateContext is the single source of truth for all price state, positions, and trade history.

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | React 18 + TypeScript | Component architecture and type safety |
| Styling | Tailwind CSS | Utility-first responsive design |
| Animations | Framer Motion | Micro-animations and transitions |
| Icons | Lucide React | SVG icon library |
| Build Tool | Vite | Fast HMR and optimized production builds |
| Backend | Node.js + Socket.IO | WebSocket proxy server |
| Data | Binance Public WebSocket API | Real-time crypto price stream |
| Deployment | Vercel | Production hosting |

## Trading Logic Explained

I designed the core entry trigger around a momentum-reversal concept, where the bot monitors for a 2% price drop within any 10-minute rolling window. This is a classic momentum entry technique; when a liquid asset drops sharply in a short window, it often signals temporary institutional selling pressure or a news catalyst, which can quickly lead to a mean-reversion bounce or a strong breakout trade. I chose 2%/10min as the threshold because it filters out normal intraday noise while reliably catching genuine momentum moves.

To manage risk, I built parameters into the risk console that ensure every simulated trade uses configurable stop-loss and take-profit percentages. On real trading desks, these guardrails are not optional they define the risk-reward ratio and capital preservation rules before a position is even opened. For example, setting a 2% stop-loss with a 4.5% take-profit provides a clear 1:2.25 risk-to-reward ratio, which is standard practice for short-term momentum strategies to remain profitable over time.

For pattern detection, I implemented a strategy scanner that evaluates historical price state buffers in memory. The scanner looks for VWAP Reversals, which occur when the price crosses back above or below the Volume Weighted Average Price a key intraday benchmark used by institutions paired with RSI extremes. It also detects ABCD harmonic patterns to identify geometric support and resistance pivots, alongside Bull and Bear Flag continuation patterns that signal when consolidations are about to break out in the direction of the trend. These are the exact technical indicators that any professional trader on a proprietary desk would expect to check.

The entire system is structured on a paper trading rationale where all trades are executed using simulated capital. This mirrors the industry-standard practice of backtesting or paper testing automated strategies to validate core logic, ledger persistence, and risk rule execution before committing real funds. I initialized the default account balance at $25,000 to represent a realistic, standard starting allocation for a professional prop-trading evaluation.

## Installation

```bash
git clone https://github.com/11alexandro/aicaptrade.git
cd aicaptrade
npm install
npm run dev
```
Open [aicaptrade.vercel.app](aicaptrade.vercel.app)

## Project Status
This is a portfolio project built to demonstrate full-stack fintech development skills. All trades are paper trades no real funds are used or at risk. Price data for stocks and indexes is simulated; crypto prices stream live from the Binance public API.

The architecture diagram reflects the full-stack design pattern this project is built around a Node.js + Socket.IO backend proxying the Binance WebSocket stream to the React frontend. The current Vercel deployment runs the frontend layer independently, with the Binance WebSocket connecting directly from the client. A production deployment would include the Node.js server on a platform like Railway or Render to handle authentication, rate limiting, and server-side data aggregation.

## Author
**Alex Valmyr** Full-Stack Developer focused on fintech, trading platforms, and Web3 applications.
GitHub: [11alexandro](https://github.com/11alexandro)
