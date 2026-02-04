# Clawnker Specialist Network (CSN) - Backend

> Multi-agent orchestration layer for Solana AI agents

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Test connections
npm run test:connection

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CSN Dispatcher                        │
│  Routes prompts → Specialists → Aggregates responses    │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
    ┌──────────▼──────────┐    ┌───────────▼───────────┐
    │   x402 Payment      │    │    Helius RPC         │
    │   (AgentWallet)     │    │    (Solana)           │
    └─────────────────────┘    └───────────────────────┘
               │
    ┌──────────▼──────────────────────────────────────────┐
    │                   Specialists                        │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
    │  │ Magos   │  │  Aura   │  │  bankr  │             │
    │  │(predict)│  │(social) │  │ (trade) │             │
    │  └─────────┘  └─────────┘  └─────────┘             │
    └─────────────────────────────────────────────────────┘
```

## API Endpoints

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | System status with balances |
| POST | `/dispatch` | Submit a task |
| GET | `/status/:taskId` | Get task status |
| GET | `/tasks` | List recent tasks |

### Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/balances` | Get AgentWallet balances |
| GET | `/wallet/transactions` | Get transaction log |

### Solana

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/solana/balance/:address` | Get SOL balance |
| GET | `/solana/transactions/:address` | Get recent transactions |

### Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/test/:specialist` | Test a specialist directly |

## WebSocket

Connect to `ws://localhost:3000/ws`

### Messages

```javascript
// Subscribe to task updates
{ "type": "subscribe", "taskId": "uuid" }

// Dispatch a task
{ "type": "dispatch", "prompt": "...", "userId": "..." }

// Ping
{ "type": "ping" }
```

## Specialists

### Magos 🔮
- Price predictions
- Risk analysis
- Technical analysis

```bash
curl -X POST http://localhost:3000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Predict SOL price for 24h"}'
```

### Aura ✨
- Social sentiment
- Trending topics
- Alpha detection

```bash
curl -X POST http://localhost:3000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the sentiment on BONK?"}'
```

### bankr 💰
- Wallet balances
- Swap simulation
- DCA setup
- Transaction monitoring

```bash
curl -X POST http://localhost:3000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Check my wallet balance"}'
```

## Configuration

Configuration is loaded from:
1. `~/.agentwallet/config.json` - AgentWallet credentials
2. `~/.config/helius/config.json` - Helius RPC endpoints
3. `.env` - Local overrides

## Development

```bash
# Run with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Project Structure

```
src/
├── server.ts           # Express + WebSocket server
├── dispatcher.ts       # Task routing and orchestration
├── config.ts           # Configuration loader
├── types.ts            # TypeScript types
├── x402.ts             # x402 payment integration
├── solana.ts           # Helius RPC integration
└── specialists/
    ├── index.ts        # Specialist exports
    ├── magos.ts        # Predictions specialist
    ├── aura.ts         # Sentiment specialist
    └── bankr.ts        # Trading specialist
```

## x402 Payment Flow

The x402 protocol enables pay-per-call API access:

1. Dispatcher checks if specialist requires payment
2. Verifies AgentWallet balance
3. Calls `x402/fetch` endpoint with request
4. AgentWallet handles payment negotiation
5. Result returned to user

## Hackathon Notes

- **Helius RPC**: Configured with 1M credits
- **AgentWallet**: Username `claw` with Solana + EVM wallets
- **Devnet**: Use `?network=devnet` for testing
- **Dry Run**: Pass `dryRun: true` to simulate without payments
