# Product Requirements Document (PRD) - Hivemind Protocol v2

## User Stories
- **As a user**, I want to see specialist prices before dispatching to avoid unexpected costs.
- **As a user**, I want to see specialist reputation/success rates to choose the most reliable agents.
- **As a user**, I want to set a max budget per task to ensure I don't exceed my spending limits.
- **As an agent developer**, I want to register my specialist in the marketplace to monetize my AI agent.

## MVP Features (P0)

### 1. Pricing display in UI before dispatch
**Description:** The Hivemind UI will show a detailed breakdown of the estimated costs for a task before the user confirms the execution.
- **Acceptance Criteria:**
    - The UI must display an "Estimated Cost" section after a prompt is analyzed but before it is dispatched.
    - Each specialist involved in the plan must have their individual cost listed.
    - Total cost must be clearly visible and updated if the plan changes.
    - A "Confirm & Dispatch" button is only enabled after the user acknowledges the price.

### 2. Basic reputation (success rate %)
**Description:** A simple reputation system based on the percentage of successfully completed tasks.
- **Acceptance Criteria:**
    - The `/v1/specialists` API must return a `success_rate` field for every agent.
    - The UI must display the success rate as a percentage (e.g., "94.2% Success") next to agent names in the discovery and plan views.
    - System must automatically increment "success" or "failure" counters upon task completion/error and recalculate the rate.

### 3. Improved routing logic
**Description:** The dispatcher's intelligence is upgraded to select specialists based on economic and performance constraints.
- **Acceptance Criteria:**
    - Routing algorithm must select the agent with the highest reputation among those that satisfy the capability requirement.
    - If `max_spend_usd` is provided, the dispatcher must filter out agents whose total projected cost exceeds the limit.
    - The dispatcher must attempt a fallback to a second-best agent if the primary agent returns a 5xx error or times out.

### 4. skill.md with pricing/reputation fields
**Description:** Standardize the `skill.md` format to include economic and trust metadata.
- **Acceptance Criteria:**
    - The YAML schema for `skill.md` must include a mandatory `pricing` object with `base` and `per_call` fields.
    - The schema must include a `reputation` object with `success_rate` and `avg_latency_ms`.
    - Verification tools must reject any agent registration that lacks these fields.

## V2 Features (P1)

### 1. Agent registry/discovery
**Description:** A centralized or federated registry where developers can list their agents and users can discover them.
- **Acceptance Criteria:**
    - A `/v1/registry/search` endpoint that allows filtering by `capability`, `min_reputation`, and `max_price`.
    - A web-based "Marketplace" UI where agents are displayed with descriptions, tags, and stats.

### 2. On-chain reputation staking
**Description:** Leverage Solana to add a "skin-in-the-game" layer to agent reputation.
- **Acceptance Criteria:**
    - Agents must stake a minimum amount of SOL/USDC to appear as "Verified" in the marketplace.
    - Staked amount is visible in the agent's profile.
    - (Future) Slashing logic implemented in a Solana program for provable failures.

### 3. OpenClaw model integration
**Description:** Allow specialists to use the user's local or preferred model configurations via OpenClaw.
- **Acceptance Criteria:**
    - Dispatcher passes a `X-OpenClaw-Model-Preference` header to specialists.
    - Specialists can optionally use the user's API keys for inference to reduce the x402 cost.
    - Integration with `openclaw.json` for seamless local-first orchestration.

### 4. Dispute resolution
**Description:** A mechanism for users to challenge results and for the protocol to handle refunds or reputation adjustments.
- **Acceptance Criteria:**
    - A `/v1/tasks/:id/dispute` endpoint for users to flag poor quality output.
    - Automated check for technical failures (e.g., invalid JSON) to trigger automatic refunds.
    - Manual review interface for protocol admins (in V2) to resolve subjective disputes.
