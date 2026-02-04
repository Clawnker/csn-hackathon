# CSN Backend - Blockers & Notes

## Current Status: ✅ Core Implementation Complete

### What's Working
- ✅ Express + WebSocket server
- ✅ Dispatcher with intelligent routing
- ✅ All 3 specialists (Magos, Aura, bankr)
- ✅ Helius RPC integration (devnet + mainnet)
- ✅ AgentWallet API connection
- ✅ x402 payment framework (ready for paid endpoints)
- ✅ TypeScript build passing
- ✅ Connection tests passing

### Blockers / TODO

#### 1. AgentWallet Balance: $0
- **Issue**: The AgentWallet (`5xUugg8ysgqpcGneM6qpM2AZ8ZGuMaH5TnGNWdCQC1Z1`) has 0 SOL/USDC
- **Impact**: Cannot execute real x402 payments
- **Fix**: Fund the wallet with SOL for transaction fees + USDC for payments

#### 2. ClawArena API Integration
- **Issue**: No ClawArena API key configured
- **Impact**: Magos uses mock predictions instead of real ClawArena data
- **Fix**: Get API key, set `CLAWARENA_API_KEY` in `.env`

#### 3. MoltX/Moltbook API Integration  
- **Issue**: No MoltX API key configured
- **Impact**: Aura uses mock sentiment data
- **Fix**: Get API key, set `MOLTX_API_KEY` in `.env`

#### 4. bankr CLI Integration
- **Issue**: bankr CLI not available in this environment
- **Impact**: Trade execution is simulated only
- **Fix**: Install bankr skill or use direct Solana transaction signing

### Nice-to-Have

1. **Redis for Task Store** - Currently in-memory (tasks lost on restart)
2. **Rate Limiting** - No request rate limiting implemented
3. **Authentication** - No API authentication (open endpoints)
4. **Logging** - Basic console logging only
5. **Metrics** - No Prometheus/observability

### Environment Requirements

Required config files (should exist):
- `~/.agentwallet/config.json` ✅
- `~/.config/helius/config.json` ✅

Optional API keys (set in `.env`):
- `CLAWARENA_API_KEY` - For real Magos predictions
- `MOLTX_API_KEY` - For real Aura sentiment

### Testing Checklist

```bash
# Test connections
npm run test:connection

# Test server
npm run dev

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/status
curl -X POST http://localhost:3000/dispatch -H "Content-Type: application/json" -d '{"prompt": "predict SOL 24h"}'
```

---

*Last updated: 2026-02-04*
