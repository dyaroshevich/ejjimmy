# 🚀 AI Implementation Transfer: Tawan Power Experience

This document consolidates the best practices, patterns, and technical configurations from the Tawan Power project for use in other AI-driven platforms.

---

## 🛠️ 1. Infrastructure & Providers

### Multi-Provider Fallback Strategy
**Why?** Ensures reliability when specific APIs go down or hit rate limits.
- **Priority 1: Groq** (`llama-3.3-70b-versatile`) — Ultra-low latency (TTFT < 200ms). Great for Thai language and complex reasoning.
- **Priority 2: Google Gemini** (`gemini-2.0-flash`) — Robust, large context, very smart for tool-augmented tasks.
- **Priority 3: OpenRouter** (`gpt-oss-120b:free` or similar) — Cost-effective fallback.
- **Priority 4: Z.AI** — Emerging providers for localized needs.

### Runtime Configuration
- **Environment:** Vercel Edge Runtime.
- **Max Duration:** 30-60 seconds (for long generation/PDF creation).
- **SDK:** `ai` (Vercel AI SDK) for unified interface across providers.

---

## 🧠 2. Prompting & Logic Patterns

### Dynamic System Prompt
The prompt is constructed dynamically by joining several modules:
1.  **Base Identity:** "Tan" (แทน), a friendly solar expert from Krabi.
2.  **RAG Context:** Relevant snippets from the technical knowledge base.
3.  **User History Context:** Information about existing leads or proposals.

### Hidden Instruction Tags (The "Invisible Hand")
Use hidden tags in AI responses to communicate with the frontend or backend without showing raw JSON to the user.

| Tag Format | Purpose | Example |
| :--- | :--- | :--- |
| `[AI_LEAD:key=value]` | **Extraction:** Save lead data (power, location, bill). | `[AI_LEAD:power=5,location=AoNang]` |
| `[SUGGEST:Label|Query]` | **UI Chips:** Generate interactive buttons for the user. | `[SUGGEST:Calculate Savings|Calculate]` |
| `[PRODUCT_ID:id]` | **Linking:** Tag specific products from the catalog. | `[PRODUCT_ID:goodwe-5kw-1phase]` |
| `[ACTION:NAME]` | **Triggers:** Request backend actions (e.g., Generate PDF). | `[ACTION:GENERATE_PDF]` |

### Rule-Based Thinking (Strict Rules)
- **Zero-Guessing:** Do not invent data. If unsure, ask.
- **Contextual Pricing:** Never give a price without mentioning it's an estimate.
- **Conversion Goal:** Always move towards a specific goal (e.g., asking for LINE ID/Phone).

---

## 📚 3. RAG & Vector Search

### Technical Stack
- **Embeddings:** `gemini-embedding-001` (Google).
- **Storage:** Supabase (PostgreSQL) with `pgvector` extension.
- **Search:** Custom RPC `match_knowledge` with a cosine similarity threshold (default 0.5).

### Retrieval Flow
1.  User sends message.
2.  Generate embedding for the *last* user message.
3.  Query Supabase for top 3 matching chunks.
4.  Inject results into the system prompt before calling the LLM.

---

## 🎨 4. UI/UX Design for AI Chat

### Immersive Mobile UX
- **Dynamic Height:** Use `100dvh` to handle mobile browser toolbars correctly.
- **Safe Areas:** Apply `padding-bottom: env(safe-area-inset-bottom)` to keep the input field above the iOS/Android home bar.
- **Markdown Sanitization:** A custom `cleanMessageContent()` function to remove raw tags (`[AI_LEAD:...]`) before rendering text to the user.

### State Management
- **Silent Restoration:** Store the last 5-10 messages in `localStorage`. Restore them instantly when the page reloads to maintain the "chatting" feeling without waiting for the server.
- **Streaming UI:** Real-time character rendering for higher perceived speed.

---

## 🛡️ 5. Security & Operations

### Secret Management
- **No Client Keys:** All API calls go through `/api/chat` (Edge route).
- **Sanitization:** All environment variables are sanitized to remove hidden characters or quotes that break Vercel deployments.
- **Rate Limiting:** IP-based rate limiting via `@upstash/ratelimit` to prevent API bill spikes.

### Monitoring & Logging
- **Success Log:** Record model used, duration, and message count in `line_actions_log`.
- **Error Log:** Catch and sanitize PII in error stacks before saving to `api_errors_log`.

---

## 📝 6. Implementation Template (Edge Route)

```typescript
// /api/chat/route.ts pattern
export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMsg = messages[messages.length - 1].content;

  // 1. RAG
  const context = await getContext(lastMsg);
  
  // 2. Fallback Loop
  for (const provider of providers) {
    try {
      const result = await streamText({
        model: provider.model,
        system: `${BASE_PROMPT}\n${context}`,
        messages: convertToCoreMessages(messages),
        onFinish: ({ text }) => {
          // 3. Extraction & Background Tasks
          processBackgroundTasks(text);
        }
      });
      return result.toAIStreamResponse();
    } catch (e) {
      continue; // Try next provider
    }
  }
}
```

---
*Created by Gemini CLI based on Tawan Power (V8.9 Pro) experience.*
