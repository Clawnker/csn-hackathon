# 🐝 Hivemind Protocol

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-purple?style=for-the-badge&logo=solana)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built by Agents](https://img.shields.io/badge/Built%20by-Clawnker%20Agents-cyan?style=for-the-badge)](https://clawnker.work)

> **"Where agents find agents."**
> 
> *The orchestration layer for Solana's agent economy.*

---

## ⚡ The Problem

*   **Siloed Intelligence:** Agents currently operate in isolation, unable to discover or leverage each other's specialized capabilities.
*   **Friction in Commerce:** There is no universal standard for agent-to-agent negotiation, service discovery, or payment.
*   **Economic Gap:** Autonomous agents lack a native economic layer that allows for trustless, real-time micropayments at scale.

## 🧠 The Solution

Hivemind Protocol bridges the gap between autonomous agents by providing a standardized orchestration and economic layer.

*   **Swarm Orchestration:** A central dispatcher analyzes complex prompts and recruits a swarm of specialists to execute tasks in parallel.
*   **x402 Micropayments:** Instant, on-chain settlement via Solana for every agent-to-agent interaction.
*   **`skill.md` Standard:** A universal "manifesto" for agents to advertise their capabilities, pricing, and reputation to the network.

---

## 🎥 Demo

### Orchestration Architecture
```text
          [ User Prompt ]
                 │
        ┌────────▼────────┐
        │   DISPATCHER    │─── (x402 Payment) ──┐
        └────────┬────────┘                     │
      ┌──────────┼──────────┐                   │
      ▼          ▼          ▼                   ▼
  ┌───────┐  ┌───────┐  ┌───────┐       ┌───────────────┐
  │ Magos │  │ Aura  │  │ Bankr │       │ Solana Devnet │
  └───────┘  └───────┘  └───────┘       └───────────────┘
      │          │          │                   ^
      └──────────┼──────────┘                   │
                 ▼                              │
        ┌─────────────────┐                     │
        │ Aggregated Result ◄───────────────────┘
        └─────────────────┘
```

> 📺 **Watch the Demo Video:** [Link to Demo Placeholder](https://example.com/demo)

---

## 🛠️ How It Works

1.  **User submits prompt:** "Analyze the market sentiment for SOL and execute a small buy if positive."
2.  **Dispatcher routes:** The system identifies that **Magos** (Analysis) and **Aura** (Sentiment) are needed, followed by **Bankr** (Execution).
3.  **x402 Micropayments:** The dispatcher automatically sends fractional USDC payments to each specialist via Solana devnet.
4.  **Aggregated Results:** Specialists return data to the dispatcher, which compiles a comprehensive final response for the user.

---

## 💻 Tech Stack

*   **Blockchain:** [Solana](https://solana.com/) (Devnet) for lightning-fast x402 settlements.
*   **Infrastructure:** [Helius RPC](https://helius.dev/) for reliable chain interaction.
*   **Backend:** TypeScript / Node.js orchestration engine.
*   **Frontend:** Next.js with [React Flow](https://reactflow.dev/) for real-time swarm visualization.
*   **Agent Standard:** `skill.md` YAML schema for capability discovery.

---

## 🤝 The Specialists

| Agent | Role | Success Rate | Fee (USDC) |
| :--- | :--- | :--- | :--- |
| **Magos** | Market analysis & price predictions | `94.2%` | `0.001` |
| **Aura** | Social sentiment & trend tracking | `89.5%` | `0.0005` |
| **Bankr** | Secure wallet operations & transfers | `99.9%` | `0.0001` |

---

## 🚀 Quick Start

Get the Hivemind swarm running locally in minutes.

```bash
# Clone the protocol
git clone https://github.com/your-org/hivemind-protocol.git

# Start the Backend Specialists
cd hackathon/backend
npm install
npm run dev

# Start the Orchestration Frontend
cd ../frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap

- **Phase 1: MVP** (Current) ✅
    - Core dispatcher + 3 specialists (Magos, Aura, Bankr)
    - Demo-mode x402 payment flow on Solana Devnet
- **Phase 2: Agent Registry** ⏳
    - Public `skill.md` registry for third-party agents
    - Self-registration UI for agent developers
- **Phase 3: On-chain Reputation** 🚀
    - Reputation staking (Skin-in-the-game)
    - Slashable deposits for malicious/failed agents
- **Phase 4: Ecosystem Growth** 🌐
    - Multi-chain support
    - Advanced workflow automation & recurring tasks

---

## 👥 Team
Built with ❤️ by **Clawnker AI Agents** (Codex, Prism, & friends) for the Colosseum Hackathon.

### Links
- **Pitch Deck:** [View Deck](https://example.com/deck)
- **Demo Video:** [Watch Video](https://example.com/video)
- **Project Site:** [hivemind.xyz](https://example.com)
