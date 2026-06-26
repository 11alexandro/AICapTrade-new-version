# AICapTrade

A high-performance, real-time cryptocurrency and equity market trading terminal built as an interactive paper trading simulator.

![AICapTrade UI](https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=1200) *(Screenshot coming soon)*

### Live Demo
[Explore AICapTrade Live](https://ais-pre-c5jxkhq2egiumvbak6qp5j-534704829767.us-west2.run.app)

---

## Why I Built This

I designed and built **AICapTrade** as a portfolio centerpiece to showcase my capability in building full-stack, data-intensive fintech dashboards. I wanted to demonstrate how to manage high-frequency data streams, implement algorithmic pattern scanning on live memory buffers, and enforce programmatic risk management parameters. This terminal simulates institutional-grade workflows—such as real-time pricing, technical signal generation, and localized order execution—all within an entirely paper-trading context. 

As a developer who closely follows both finance and software engineering, I wanted this project to reflect how real-world trading desks handle telemetry, state synchronization, and execution logic, while using modern React and Node.js patterns to keep the interface highly responsive.

---

## System Architecture

AICapTrade uses a dual WebSocket architecture to handle high-frequency streams with minimal overhead. The diagram below illustrates how data flows from external public APIs down to the React frontend:

```text
                  +-----------------------------------+
                  |   Binance WebSocket Public API    |
                  |   (wss://stream.binance.com:9443) |
                  +-----------------------------------+
                                    |
                                    | Real-time Trade streams (<100ms)
                                    v
                  +-----------------------------------+
                  |       Node.js Custom Server       |
                  |     - Pre-fetches daily open      |
                  |     - Consolidates pricing data   |
                  +-----------------------------------+
                                    |
                                    | Socket.IO Tunneling
                                    v
                  +-----------------------------------+
                  |      React Frontend State         |
                  |     - TerminalStateContext        |
                  |     - Local sliding buffers       |
                  +-----------------------------------+
                     /              |               \
                    /               |                \
    +-------------------+  +-----------------+  +--------------------+
    | Strategy Scanner  |  |  Risk Console   |  | Portfolio Tracker  |
    | (VWAP, ABCD, etc) |  |  (SL/TP Engine) |  | (Class analytics)  |
    +-------------------+  +-----------------+  +--------------------+
```

1. **Pre-fetching & Seeding:** On server startup, the Node.js backend pre-fetches the current prices and today's open levels from the Binance REST API. This seeds an accurate day-open baseline before the WebSocket connects, completely eliminating the common race condition where incorrect percentage changes appear on the first few ticks.
2. **WebSocket Client (`ws`):** Once seeded, the backend opens a connection to Binance’s public stream for high-frequency pricing (`BTC/USDT`, `ETH/USDT`, `SOL/USDT`, and `XRP/USDT`).
3. **Data Throttling & Volume Decay:** To prevent DOM thrashing and high CPU accumulation in the browser, the server implements a volume decay formula that throttles incoming raw trade streams and aggregates them into consistent state ticks.
4. **Socket.IO Tunneling:** The processed tickers are tunneled immediately to the React frontend over a dedicated, persistent Socket.IO channel.

---

## Core Features

### 1. Live Crypto Price Streaming
* **Real-time Feeds:** Streams high-fidelity prices directly from Binance for core crypto assets.
* **Aggregated Buffers:** The frontend processes incoming socket messages into historical candle aggregates (`1m`, `5m`, `15m`, `1H`, `4H`, `1D` intervals) to render low-latency interactive charts.

### 2. Stocks & Indexes Desk
* **Asset Coverage:** Tracks major equities (`AAPL`, `NVDA`, `TSLA`, `MSFT`) and market indexes (`S&P 500`, `NASDAQ 100`).
* **Micro-Drift Simulation:** Features a real-time drift simulator that mimics realistic fractional price fluctuations between server polling intervals, providing a fluid trading environment.
* **Transparency:** Displays clear "Simulated Data" badges and delayed quotes indicators to remain honest about data origins.

### 3. Algorithmic Strategy Scanner
An in-memory scanner monitors assets and generates live trade suggestions based on four distinct mechanical trading patterns:
* **VWAP Reversal:** Scans for price exhaustion and mean-reversion signals relative to the Volume Weighted Average Price.
* **ABCD Pattern:** Measures geometric harmonic extensions (AB = CD) to pinpoint high-probability pivot zones.
* **Bull Flag / Bear Flag:** Tracks fast expansion poles followed by narrow consolidating channels to catch continuation breakouts.
* **Signal Telemetry:** Every generated signal contains a confidence score, target exit, stop-loss protection, RSI, EMA9, and VWAP status.

### 4. Paper Trading Simulator & Risk Console
* **Automated Momentum Entry:** Simulates a mechanical buy trigger when any tracked asset falls $2\%$ or more within a $10$-minute sliding window (a classic discretionary trading setup looking to capture mean-reversion or oversold bounces).
* **Dynamic Risk Console:** Allows real-time adjustments for:
  * **Stop Loss (SL %):** Instantly liquidates positions if price drops below target.
  * **Take Profit (TP %):** Closes trades upon reaching profit targets.
  * **Position Sizing:** Custom allocation of simulated USDT per trade.
  * **Max Concurrent Positions:** Enforces strict capital risk ceilings.
* **True Ledger Tracking:** Account balances and PnL metrics are strictly derived from the localized simulated trade ledger—ensuring no phantom accumulators or disconnected state values.

### 5. Advanced Portfolio Analytics
* **Asset Allocation:** Visualizes capital breakdown across Crypto, Stocks, and Indexes.
* **Performance Breakdown:** Computes win rates, profit factors, and total realized PnL per strategy.
* **Leaderboard Engine:** Automatically calculates and displays which strategy (e.g., Bull Flag vs. VWAP Reversal) is driving the highest returns based on actual historical outcomes.

### 6. Interactive Command Palette
* **Global Access:** Triggered via `Ctrl+K` or `/`.
* **Utility Search:** Search for tickers, toggle UI modules, jump to different assets, or trigger diagnostic reboots with a keyboard-driven interface.

---

## Tech Stack

| Layer | Technologies | Key Use Case |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, TypeScript, Vite | Ultra-fast build times, strict component interface types |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive layout grids, high-contrast dark theme |
| **State & Motion** | React Context, Motion | Centralized financial state, smooth micro-interactions |
| **Real-time Socket**| Socket.IO Client | Multi-channel, persistent server-sent events |
| **Backend Service**| Node.js, Express | Aggregating market tickers, REST pre-fetching |
| **Socket Server**  | Socket.IO, `ws` | Managing upstream Binance WS, downstream client sockets |

---

## Trading Logic & Financial Engineering Explained

To make the simulation as realistic as possible, I implemented core trading mechanics that mimic real discretionary and systematic workflows:

### The Momentum / Drop Entry Trigger
Instead of random trade execution, the automated paper bot listens to the aggregated ticker queue. It calculates the high-water mark of each asset over a sliding 10-minute historical array. If the current price ticks $2\%$ lower than that recent high-water mark, a long signal is fired. This simulates a common short-term momentum-reversal strategy:
$$\text{Price Drop \%} = \frac{\text{Asset High}_{10m} - \text{Price}_{\text{current}}}{\text{Asset High}_{10m}} \times 100$$
If $\text{Price Drop \%} \ge 2\%$, the risk console verifies that current open positions are below the `Max Concurrent Positions` limit, evaluates the `USDT Position Size`, and commits a market BUY order to the ledger.

### Pattern Detection Buffers
The algorithmic scanner keeps rolling arrays of historical price indicators. 
* **VWAP (Volume Weighted Average Price):** Calculated continuously as:
$$\text{VWAP} = \frac{\sum (\text{Price}_{\text{typical}} \times \text{Volume})}{\sum \text{Volume}}$$
When the current price deviates significantly from the VWAP line and the 14-period RSI crosses below 30 or above 70, the engine issues a mean-reversion signal.
* **ABCD Pattern:** Validates structural legs by verifying that the price ratio of point $C$ to point $D$ mirrors the ratio of point $A$ to point $B$, providing classic harmonic support/resistance zones.

### Risk Management Guardrails
A trade ledger without risk management is a liability. Every simulated trade has active, locked-in triggers. The moment a tick comes across the socket, the frontend iterates through open positions, matching current market values against the position's break-even entry price. If:
$$\text{Current PnL \%} \le -\text{Stop Loss \%} \quad \text{or} \quad \text{Current PnL \%} \ge \text{Take Profit \%}$$
The system triggers an instantaneous simulated liquidation, writes the realized PnL to the balance sheet, and logs the exit reason (*"Stop Loss Hit"* or *"Take Profit Hit"*).

---

## Responsive Design & UI Polish

This terminal is built with a desktop-first layout for maximum terminal density, but adapts seamlessly to smaller screens:
* **Adaptive Panels:** Utilizes custom Tailwind CSS grids with responsive prefixes (`lg:grid-cols-4`, `md:grid-cols-2`, `sm:grid-cols-1`).
* **Drawer Navigation:** When viewed on tablet or mobile, the persistent sidebar collapses into an elegant overlay drawer triggered by a persistent hamburger button (`lg:hidden`).
* **Touch-Optimized Tickers:** The header-ticker uses `touch-pan-x` and hidden native scrollbars, permitting smooth touch-swiping across quotes on mobile screens.
* **Aesthetic Polish:** The interface features a sleek "Cosmic Slate" glassmorphic UI, utilizing subtle neon-amber borders (`border-amber-500/10`), thin container separators, a backdrop-blur filter for floating alerts, and a pulsing live latency status indicator to emphasize active connectivity.

---

## Installation & Running

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Steps
1. **Clone the repository and enter the directory:**
   ```bash
   git clone https://github.com/yourusername/aicaptrade.git
   cd aicaptrade
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The terminal binds to port `3000` and supports immediate hot-reloading.*
4. **Build the application:**
   ```bash
   npm run build
   ```
5. **Run in production mode:**
   ```bash
   npm run start
   ```

Open your browser and navigate to: **`http://localhost:3000`**

---

## Project Status

This is a **portfolio demonstration project** meant to illustrate advanced front-end capabilities, full-stack stream integration, and interactive dashboard design. No real currency is ever traded, and all accounts use mock paper balances. 

---

## Author

**Alex Valmyr**  
Frontend & Full-Stack Developer focused on high-performance fintech dashboards, trading platform interfaces, and Web3 applications.  
* [Portfolio Website](https://yourportfolio.com) (Placeholder)
* [LinkedIn](https://linkedin.com/in/yourprofile) (Placeholder)
