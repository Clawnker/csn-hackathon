# CSN Command Center Frontend

A stunning, demo-ready frontend for the Clawnker Specialist Network (CSN) - the orchestration layer for Solana's agent economy.

## 🚀 Features

- **TaskInput** - Natural language prompt input with suggested prompts
- **SwarmGraph** - Real-time agent visualization using React Flow
- **WalletPanel** - AgentWallet balance display (SOL + USDC)
- **PaymentFeed** - Live x402 payment activity stream
- **MessageLog** - Expandable inter-agent message viewer
- **ResultDisplay** - Task completion results

## 🎨 Design

- **Dark Theme** - Deep navy/black background
- **Neon Accents** - Cyan/purple glows for active elements
- **Glassmorphism** - Subtle blur effects on panels
- **Micro-animations** - Framer Motion for smooth transitions
- **Responsive** - Optimized for 1920x1080 demo displays

## 📦 Tech Stack

```json
{
  "next": "^16.1.0",
  "react": "^19.0.0",
  "@xyflow/react": "^12.0.0",
  "lucide-react": "^0.312.0",
  "framer-motion": "^10.18.0",
  "socket.io-client": "^4.7.4",
  "tailwindcss": "^4.0.0"
}
```

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001) (or next available port).

## 🔧 Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000    # Backend API
NEXT_PUBLIC_WS_URL=http://localhost:3000     # WebSocket server
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Design system & animations
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main Command Center page
├── components/
│   ├── TaskInput.tsx    # Prompt input with suggestions
│   ├── SwarmGraph.tsx   # React Flow agent visualization
│   ├── WalletPanel.tsx  # Wallet balance display
│   ├── PaymentFeed.tsx  # x402 payment activity
│   ├── MessageLog.tsx   # Agent message viewer
│   └── ResultDisplay.tsx # Task results
├── hooks/
│   └── useWebSocket.ts  # WebSocket connection hook
└── types/
    └── index.ts         # TypeScript definitions
```

## 🔌 WebSocket Events

The frontend listens for these events from the backend:

```typescript
{ type: 'task:status', taskId, status, step? }
{ type: 'agent:message', taskId, from, to, payload, timestamp }
{ type: 'payment', taskId, from, to, amount, token, txSignature }
{ type: 'task:complete', taskId, result }
```

## 🎬 Demo Flow

1. User types a natural language prompt in TaskInput
2. SwarmGraph animates as Dispatcher routes to specialists
3. Payments appear in PaymentFeed in real-time
4. Agent messages stream into MessageLog
5. Final results display when task completes

## 🏆 Hackathon

Part of the **Colosseum Agent Hackathon** - $100k USDC prize pool.

---

Built with 💜 by the Clawnker Team
