# Hivemind Protocol - QA Query Tests
Date: 2026-02-04

| Query | Specialist | Quality | Critique | Suggestions |
|-------|------------|---------|----------|-------------|
| Check my balance | bankr | ⭐⭐⭐⭐ | Correct specialist, accurate info. Message "balance confirmed" is too terse. | bankr should return a user-friendly summary string as the main content. |
| What's in my wallet? | bankr | ⭐⭐⭐⭐ | Correct specialist. Same terse response issue. | Provide a natural language summary of assets. |
| How much SOL do I have? | bankr | ⭐⭐⭐⭐ | Correct specialist. Accurate SOL balance shown in details. | Specifically highlight the SOL balance in the main response if asked. |
| Send 0.01 SOL to 1111... | bankr | ⭐ | Failed with 500 error. Type was still "balance" (parsing error?). | bankr needs to handle transfer intent and validate addresses/funds properly. |
| Find trending meme coins on X | magos | ⭐⭐⭐⭐⭐ | Excellent routing and detailed structured response with trending tokens. | None. |
| What's the price prediction for BONK? | magos | ⭐⭐⭐⭐⭐ | Accurate routing, specific price target and reasoning provided. | None. |
| Is WIF a good buy right now? | bankr | ⭐ | Incorrect routing to bankr. bankr simulated a SOL/USDC swap instead of analysis. | "Buy" intent for advice should route to magos/aura, not bankr execution. |
| Analyze POPCAT risk | magos | ⭐⭐⭐⭐⭐ | Correct specialist. Detailed risk score and factors provided. | None. |
| What's the sentiment on Solana? | aura | ⭐⭐⭐ | Correct specialist, but topic extracted was "What" instead of "Solana". | Improve NLP topic extraction to ignore question words. |
| Is crypto Twitter bullish or bearish? | aura | ⭐⭐⭐⭐ | Correct specialist. Good market mood analysis. | Confidence score was null in result. |
| What tokens are people talking about? | bankr | ⭐ | Incorrect routing to bankr. Returned user's balance instead of social trends. | Route to aura for social mentions analysis. |
| Hello | general | ⭐⭐ | Correct fallback routing, but response "Task completed" is unhelpful. | general should use an LLM for conversational responses or system info. |
| "" (empty prompt) | N/A | ⭐⭐⭐⭐⭐ | Correct error handling (Prompt is required). | None. |
| asdfghjkl random gibberish | general | ⭐⭐ | Correct fallback, but same "Task completed" issue. | Provide a "Prompt not understood" message instead of running mock analysis. |
