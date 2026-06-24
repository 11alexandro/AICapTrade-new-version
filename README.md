# AICapTrade

AICapTrade is a full-stack real-time crypto trading terminal built to simulate highly responsive trading and programmatic risk management. The terminal utilizes real-time market data directly streamed from Binance servers and connects a simulated automated trading service over robust WebSocket channels.

> **Disclaimer:** Trades are simulated for educational and portfolio purposes. No real funds are involved or traded.

---

## Architecture Overview

The system utilizes a dual WebSocket architecture to deliver ultra-low latency, real-time updates without polling or reloading the page:

```
Binance WebSockets (Public API)
             ↓
Node.js Full-Stack Backend
             ↓
Socket.IO (Server Transport Hub)
             ↓
React Frontend Dashboard
```

1. **Binance WebSocket Integration**: A direct server-side connection to the public Binance stream retrieves high-frequency, authentic price updates for **BTC/USDT**, **ETH/USDT**, and **SOL/USDT**.
2. **In-Memory State Engine**: The Node.js service maintains the latest market values, manages simulated positions, and triggers trading algorithms.
3. **Socket.IO Tunneling**: Delivers immediate price actions, bot state toggles, and risk parameter synchronizations back to the React UI instantly.

---

## Core Features

* **Real Live Binance Market Data**: Displays streaming prices for BTC/USDT, ETH/USDT, and SOL/USDT.
* **Simulated Algorithmic Bot Engine**:
  * Easily toggle the bot between **Running** and **Stopped** states.
  * Real-time automated triggers scan a sliding 10-minute historical price window for asset drops.
* **Algorithmic Trading Strategy**:
  * **Buy Signal**: Triggers a simulated BUY order (Long Position) if any monitored asset drops **2% or more within 10 minutes** from its peak.
  * Automatically stores the timestamp, symbol, purchase entry price, quantity, and reason: *"Price dropped 2% in 10 minutes"*.
* **Real-time Risk Management Controls**:
  * **Stop Loss (SL)** and **Take Profit (TP)** parameters check active holdings with every incoming price tick and liquidate positions instantly when breached.
  * Adjust **Trade Size (USDT Allocation)** and **Maximum Open Positions** directly. Alterations update the active trading bot parameters on the backend immediately.
* **Live Trade History Ledger**:
  * High-contrast ledger pane shows Time, Symbol, Action (BUY/SELL), Entry Price, Quantity, and Execution Status.
  * Ordered newest-first with live status labels.
* **Dynamic Portfolio Metrics**:
  * Live-aggregating tracker displays Total Trades, Winning/Losing Trades count, overall Win Rate (%), Total PnL ($), and count of active Open Positions.

---

## Tech Stack

### Backend
* **Node.js** & **Express** Custom Server
* **Socket.IO** (Real-time TCP Server Transport)
* **ws** (High-Performance WebSocket Client)
* **TypeScript** Type-Safety

### Frontend
* **React**
* **Socket.IO Client**
* **Tailwind CSS** (Utility-first fluid styling)
* **Lucide React** (Consistent icons library)
* **Motion** (Smooth micro-animations and transition queues)

---

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs with automatic TypeScript hot-reloading):
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Run production instance:
   ```bash
   npm run start
   ```

Open your browser at:
```
http://localhost:3000
```

---

## Author

**Alex Valmyr**  
Frontend & Full-Stack Developer  
*Focused on fintech, trading platforms, and Web3 applications.*
