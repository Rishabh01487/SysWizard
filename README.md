# 🧙‍♂️ SysWizard — Master System Design Visually

> An interactive, animated learning platform for **system design, full-stack web development, and software engineering** — with 200+ topics, step-by-step canvas animations, and an AI tutor powered by GLM-4-Plus.

![Topics](https://img.shields.io/badge/Topics-221-purple) ![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![AI](https://img.shields.io/badge/AI-GLM--4--Plus-orange)

---

## ✨ What's New (v2 — Major Rewrite)

This is a complete rewrite of the original Vite + Vanilla JS project as a production-grade **Next.js 16 + TypeScript** application.

### 1. Multi-stage animated visualizations
Every topic now resolves to an **explicit pipeline of 5–9 real intermediate entities** (Browser → DNS → TCP/TLS → Load Balancer → API Gateway → Service → Cache → DB) — not just two boxes. Each step sends data packets that **ripple through every hop** in the chain so learners literally see the request flow.

### 2. Comprehensive topic coverage (96 → 221 topics)
- **Fundamentals** (10) · **Core Infrastructure** (10) · **Communication** (5) · **Security & Reliability** (4)
- **Distributed Systems** (10) · **Design Patterns** (9) · **Data Storage** (7) · **Performance** (4)
- **Real-World Systems** (11) · **Algorithms & Data Structures** (10)
- **Advanced & Expanded System Design** (44) — Paxos, BFT, 2PC/3PC, distributed locks, MVCC, B+ trees, HyperLogLog, HTTP/2·3/QUIC, mTLS, event sourcing, outbox pattern, service mesh, cell-based architecture, multi-region DR, vector/columnar/graph/time-series DBs
- **Full-Stack Web Development** (45) — React/RSC, virtual DOM, hydration, SSR/CSR/SSG/ISR, Next.js architecture, state management, Core Web Vitals, Web Workers, Service Workers, WASM, Web Components, micro-frontends, PWA, Web Storage, SSE, long polling, WebRTC, WebTransport, image/font optimization, frontend testing/accessibility/i18n/SEO/security, BFF, JWT/session/OAuth
- **Software Engineering & DevOps** (45) — SDLC, Agile/Scrum/Kanban/XP, TDD/BDD, DDD, clean architecture, SOLID, GoF patterns, DI, refactoring, tech debt, GitFlow, code review, SemVer, testing pyramid, contract testing, load testing, CI/CD, Docker, Kubernetes, IaC, feature flags, deployment strategies, observability, SRE (SLI/SLO/SLA/error budgets), incident management, chaos engineering, OpenAPI, Twelve-Factor App, Backstage, API versioning, error handling, concurrency patterns

### 3. Rishi AI tutor — upgraded to GLM-4-Plus
- Powered by **GLM-4-Plus** (Zhipu AI's flagship model — the gateway aliases all `glm-4.x` model names to this strongest backend)
- **Chain-of-thought reasoning** auto-enabled for complex architectural/design questions, disabled for quick factual answers (low latency)
- 16-message multi-turn context
- Senior-engineer persona with structured design-interview framework, explicit trade-off requirements, and visual-thinking directives
- Topic-aware context injection

---

## 🧱 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **AI**: `z-ai-web-dev-sdk` → GLM-4-Plus
- **Canvas animation engine**: custom TypeScript engine (`src/lib/engine/`)
- **State**: React `useSyncExternalStore` + localStorage-backed auth/progress
- **Icons**: Lucide

---

## 🚀 Getting Started

```bash
bun install
bun run dev
# Open http://localhost:3000
```

### Environment

The AI tutor uses the `z-ai-web-dev-sdk`. Create a `.z-ai-config` file in one of these locations:
- `./.z-ai-config` (project root)
- `~/.z-ai-config` (home directory)

```json
{
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "YOUR_API_KEY"
}
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/ai/route.ts        # Rishi AI backend (GLM-4-Plus, thinking-aware)
│   └── page.tsx               # Main app shell (auth → home → topic detail)
├── components/
│   ├── syswizard/
│   │   ├── AuthScreen.tsx · Sidebar.tsx · HomeView.tsx
│   │   ├── TopicDetail.tsx     # 10-step animation + 6 content tabs
│   │   ├── AIPanel.tsx · GameArena.tsx · DesignGenerator.tsx
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── engine/                 # Canvas animation engine
│   │   ├── AnimationEngine.ts  # step-based renderer + RAF loop
│   │   ├── entities.ts         # Server/Client/DB/Cache/LB/Gateway nodes
│   │   └── genericAnimation.ts # per-topic 5–9 node pipelines + multi-hop packets
│   └── topics/                 # 221 topics across 13 categories
│       ├── fundamentals.ts · coreInfra.ts · distributed.ts · communication.ts
│       ├── dataStorage.ts · patterns.ts · securityPerformance.ts · realWorld.ts
│       ├── algorithms.ts · expanded.ts
│       ├── fullstack.ts        # 45 full-stack topics (NEW)
│       ├── softwareEng.ts      # 45 software-engineering topics (NEW)
│       └── index.ts            # registry
└── hooks/
```

---

## 🤖 Which LLM powers Rishi?

**GLM-4-Plus** — Zhipu AI's flagship large language model.

The API route (`src/app/api/ai/route.ts`) requests `model: "glm-4.6"` from the `z-ai-web-dev-sdk`. The gateway aliases all `glm-4.x` model names to the strongest backend it has available, which is **`glm-4-plus`**. You can verify this in the `model` field of the API response:

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What model are you?"}],"fast":true}'

# → {"response":"I am the GLM (General Language Model) developed by Zhipu AI...",
#    "model":"glm-4-plus","thinking":false}
```

**Adaptive reasoning:**
- Quick factual questions (< 60 chars, greetings, "yes/no") → thinking **disabled** for low latency
- Architectural / design / compare / "explain" / long questions → thinking **enabled** for chain-of-thought reasoning
- The `thinking: true/false` flag is returned in every API response so the UI can show when Rishi is reasoning step-by-step

---

## 🎨 Features

- **Animated canvas engine** with 5–9 intermediate entities per topic, multi-hop data packets, request/response flow, ambient pulses
- **10-step narrative animation** per topic: Overview → How It Works (per step) → Key Concepts → Trade-offs → Real-World → Summary
- **6 content tabs** per topic: Learn · Request Flow · Data Flow · Caching · Deep Analysis · Interview Prep
- **Auth + progress tracking** (localStorage-backed)
- **Search + filter** by category and difficulty level
- **Game Arena** with 3 mini-games
- **Design Generator** for interactive system-design walkthroughs
- **Dark, glassmorphic UI** with purple/orange gradient system
- **Responsive** mobile-first layout with sticky footer

---

## 📜 License

ISC — fork it, learn from it, build with it.

---

## 🙏 Acknowledgements

- Original SysWizard concept by [Rishabh Kumar](https://github.com/Rishabh01487)
- AI powered by [Zhipu AI](https://z.ai/) GLM-4-Plus
- UI components from [shadcn/ui](https://ui.shadcn.com/)
