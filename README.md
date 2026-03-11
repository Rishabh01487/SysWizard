<div align="center">

# 🧙‍♂️ SysWizard

**Master System Design Visually — Animated · Interactive · AI-Powered**

[![MIT License](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Version](https://img.shields.io/badge/Version-3.0-orange)](https://github.com/Rishabh01487/SysWizard)

*Every system has a story. Let the wizard show you how data flows across the digital world.*

</div>

---

## ✨ What is SysWizard?

**SysWizard** is an interactive, visual learning platform for mastering system design concepts. Instead of dry textbooks, every topic comes alive as a **real-time canvas animation** — you can watch how load balancers distribute traffic, see consistent hashing rings in action, or observe a rate limiter throttling requests, all step by step.

Perfect for engineers preparing for system design interviews or anyone wanting to truly *understand* how large-scale systems are architected.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🎨 **64+ Animated Topics** | Canvas-based, step-by-step animations for every major system design concept |
| 🤖 **AI Tutor (Rishi)** | Ask questions about any topic, get real-time explanations powered by Ollama |
| 🍌 **Nano Banana AI** | Generate stylized architecture blueprints from plain-English descriptions |
| 📚 **Notes Library** | Deep-dive articles on system design theory, ML workflows, and architecture patterns |
| 🎯 **Quiz Mode** | Knowledge-check quizzes at the end of every topic |
| 🧮 **Algorithms** | Detailed algorithm breakdowns with interactive walkthroughs |
| 💻 **Code Examples** | Real code snippets for every concept |
| 🎬 **Interview Prep** | Curated interview questions and model answers for each topic |
| 🔀 **Flow Visualizer** | Advanced request/response cycle, data flow, and caching strategy diagrams |
| ⏺️ **Animation Recording** | Record any animation as a video to revisit or share |
| 🔐 **Auth + Progress Tracking** | Signup/login with per-user progress tracking (64-topic checklist) |
| 🌗 **Dark / Light Mode** | Toggle between dark and light themes |
| 🔍 **Search & Filter** | Instant search and category/level filters across all 64 topics |

---

## 📚 Topics Covered

SysWizard covers **64 system design topics**, organized into categories:

- **Foundations** — Load Balancing, Caching, DNS Resolution, API Gateway, Rate Limiting
- **Databases** — DB Sharding, Consistent Hashing, CAP Theorem, Replication
- **Distributed Systems** — Message Queues, Microservices, Event-Driven Architecture, Service Mesh
- **Scalability** — Horizontal vs Vertical Scaling, CDN, Database Indexing, Connection Pooling
- **Reliability** — Circuit Breakers, Retry Logic, Bulkhead Pattern, Saga Pattern
- **Security** — OAuth 2.0, JWT, API Security, Zero Trust Architecture
- **Real-World Designs** — Designing Twitter, Uber, Netflix, WhatsApp, and more
- **Advanced** — Consensus Algorithms (Raft/Paxos), Distributed Tracing, CQRS, Event Sourcing

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Build Tool** | [Vite](https://vitejs.dev/) 5.x |
| **Language** | Vanilla JavaScript (ES Modules) |
| **Animation Engine** | HTML5 Canvas API (custom built) |
| **Styling** | Vanilla CSS with glassmorphism + gradient design system |
| **Typography** | [Outfit](https://fonts.google.com/specimen/Outfit) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| **AI Backend** | [Ollama](https://ollama.ai/) (local LLM inference) |
| **Auth & Storage** | `localStorage` (client-side) |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- *(Optional)* [Ollama](https://ollama.ai/) for the AI Tutor feature

### 1. Clone the repository

```bash
git clone https://github.com/Rishabh01487/SysWizard.git
cd SysWizard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 4. (Optional) Set up AI Tutor

To use the **Rishi AI Tutor**, install and run [Ollama](https://ollama.ai/) locally:

```bash
# Install a model (e.g., llama3)
ollama pull llama3
ollama serve
```

The app automatically connects to `http://localhost:11434`.

---

## 🏗️ Project Structure

```
SysWizard/
├── index.html                  # App shell (auth screen + main layout)
├── vite.config.js              # Vite configuration
├── package.json
└── src/
    ├── main.js                 # App entry point & router
    ├── style.css               # Global design system & component styles
    ├── auth/                   # Auth screens (login/signup)
    ├── engine/                 # Canvas animation engine
    ├── topics/                 # Topic-specific animation modules (64 topics)
    │   ├── loadBalancing.js
    │   ├── caching.js
    │   ├── rateLimiting.js
    │   └── bespoke/            # Handcrafted topic animations
    ├── content/                # Notes, quiz questions, and code snippets
    ├── ai/                     # AI tutor integration (Ollama)
    ├── ui/                     # Reusable UI components
    ├── recorder/               # Canvas animation recorder
    └── systemDesignVisualizer.js  # Nano Banana AI blueprint generator
```

---

## 🎬 How to Use

1. **Sign up / Log in** — Create an account (stored locally in your browser)
2. **Browse Topics** — Use the sidebar or topic grid to explore all 64 topics
3. **Watch Animations** — Hit ▶ to play step-by-step animated explanations
4. **Learn More** — Browse the **Learn**, **Request Flow**, **Algorithms**, **Code**, and **Interview** tabs below each animation
5. **Test Yourself** — Complete a **Knowledge Check** quiz to lock in your learning
6. **Ask the AI** — Open the **Rishi AI panel** to ask any system design question
7. **Track Progress** — Mark topics complete and watch your progress ring fill up!

---

## 📦 Build for Production

```bash
npm run build
```

Output is placed in the `dist/` directory, ready to serve as a static site.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-topic`
3. Make your changes and commit: `git commit -m 'feat: add Kafka animation'`
4. Push to your branch: `git push origin feature/my-new-topic`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Rishabh](https://github.com/Rishabh01487)

⭐ *If you find SysWizard helpful, please give it a star!* ⭐

</div>
