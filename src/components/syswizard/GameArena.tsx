"use client";

/**
 * GameArena — SysWizard gamified learning hub.
 *
 * Three self-contained mini-games (all state in React, no external libs):
 *  1. Arrange the Flow      — click steps into the correct architecture order (+25 XP)
 *  2. Architect's Challenge — 8 timed (30s) system-design MCQs (+10 XP per correct)
 *  3. Debug the System      — identify the failing component from live metrics/logs (+15 XP)
 *
 * Persistence (localStorage):
 *  - syswizard_game_xp     → { total, streak, lastPlay }
 *  - syswizard_game_scores → { [gameId]: bestScore }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Bug,
  CheckCircle2,
  Cpu,
  Database,
  Flame,
  Globe,
  GripVertical,
  Layers,
  MemoryStick,
  Play,
  Puzzle,
  RotateCcw,
  Server,
  Shuffle,
  Sparkles,
  Siren,
  Terminal,
  Timer,
  Trophy,
  Undo2,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ══════════════════════════════ Types & storage ══════════════════════════════ */

type GameId = "flow" | "architect" | "debug";

interface XpState {
  total: number;
  streak: number;
  lastPlay: string | null;
}

const XP_KEY = "syswizard_game_xp";
const SCORES_KEY = "syswizard_game_scores";
const DAY_MS = 86_400_000;

const EMPTY_XP: XpState = { total: 0, streak: 0, lastPlay: null };

function loadXp(): XpState {
  if (typeof window === "undefined") return EMPTY_XP;
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (!raw) return EMPTY_XP;
    const parsed = JSON.parse(raw) as Partial<XpState> | null;
    if (!parsed || typeof parsed !== "object") return EMPTY_XP;
    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastPlay: typeof parsed.lastPlay === "string" ? parsed.lastPlay : null,
    };
  } catch {
    return EMPTY_XP;
  }
}

function persistXp(state: XpState) {
  try {
    localStorage.setItem(XP_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Merge an XP award into the state, maintaining the daily play streak. */
function computeNextXp(prev: XpState, amount: number): XpState {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - DAY_MS).toDateString();
  let streak = prev.streak;
  if (prev.lastPlay !== today) {
    streak = prev.lastPlay === yesterday ? prev.streak + 1 : 1;
  }
  return { total: prev.total + amount, streak: Math.max(streak, 1), lastPlay: today };
}

function loadScores(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function persistScores(scores: Record<string, number>) {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    /* storage unavailable — ignore */
  }
}

/* ══════════════════════════════ Generic helpers ══════════════════════════════ */

/** Fisher–Yates shuffle using Math.random (no seed library needed). */
function shuffleArray<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

/* ══════════════════════════════ Shared UI pieces ══════════════════════════════ */

interface GameViewProps {
  onAwardXp: (amount: number) => void;
  onSaveScore: (score: number) => void;
  onExit: () => void;
  highScore: number;
}

function StatChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
      {icon}
      <span className="hidden text-xs text-zinc-400 sm:inline">{label}</span>
      <span className="text-sm font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

function ResultStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xl font-black tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}

function GameShell({
  emoji,
  title,
  color,
  onExit,
  stats,
  children,
}: {
  emoji: string;
  title: string;
  color: string;
  onExit: () => void;
  stats?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sw-fade-up">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Arena
        </Button>
        <h2 className="text-lg font-black text-white sm:text-xl">
          {emoji} <span style={{ color }}>{title}</span>
        </h2>
        <div className="ml-auto flex flex-wrap items-center gap-2">{stats}</div>
      </div>
      {children}
    </div>
  );
}

function IntroPanel({
  emoji,
  color,
  title,
  tagline,
  rules,
  onStart,
  startLabel,
}: {
  emoji: string;
  color: string;
  title: string;
  tagline: string;
  rules: string[];
  onStart: () => void;
  startLabel: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <div
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
        style={{ background: `${color}1f`, border: `1px solid ${color}55` }}
      >
        {emoji}
      </div>
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{tagline}</p>
      <ul className="mt-5 space-y-2 text-left text-sm text-zinc-300">
        {rules.map((r) => (
          <li key={r} className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0" style={{ color }} />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onStart}
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-7 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: color, boxShadow: `0 8px 24px -8px ${color}` }}
      >
        <Play className="size-4 fill-current" />
        {startLabel}
      </button>
    </div>
  );
}

/* ══════════════════════════════ Game 1 · Arrange the Flow ══════════════════════════════ */

interface FlowScenario {
  title: string;
  emoji: string;
  correctOrder: string[];
}

const FLOW_SCENARIOS: FlowScenario[] = [
  {
    title: "Web Request Flow",
    emoji: "🌐",
    correctOrder: [
      "Browser resolves DNS",
      "TCP + TLS handshake",
      "HTTP request to server",
      "Server queries database",
      "Response rendered by browser",
    ],
  },
  {
    title: "Cache Read Path",
    emoji: "⚡",
    correctOrder: [
      "App receives request",
      "Check Redis cache",
      "Cache HIT → return",
      "Cache MISS → query DB",
      "Store result in cache",
    ],
  },
  {
    title: "Load Balanced Request",
    emoji: "🔀",
    correctOrder: [
      "Client sends request",
      "Load balancer receives",
      "Pick server via algorithm",
      "Server processes request",
      "Response through LB",
    ],
  },
  {
    title: "Message Queue Flow",
    emoji: "📮",
    correctOrder: [
      "Producer emits message",
      "Queue stores durably",
      "Consumer pulls message",
      "Process the message",
      "Consumer sends ACK",
    ],
  },
  {
    title: "Database Failover",
    emoji: "🛢️",
    correctOrder: [
      "Primary DB goes down",
      "Health check detects failure",
      "Replica promoted to primary",
      "Connection string updated",
      "Traffic resumes on new primary",
    ],
  },
  {
    title: "CDN Delivery",
    emoji: "🌍",
    correctOrder: [
      "User requests image",
      "DNS routes to edge PoP",
      "Edge checks its cache",
      "HIT → serve from edge",
      "MISS → fetch from origin",
    ],
  },
  {
    title: "Video Upload Pipeline",
    emoji: "🎥",
    correctOrder: [
      "Client requests upload URL",
      "API issues presigned URL",
      "Client uploads to object storage",
      "Storage event triggers transcoder",
      "Renditions saved + CDN purge",
    ],
  },
  {
    title: "Payment Processing",
    emoji: "💳",
    correctOrder: [
      "Client submits payment",
      "API validates the request",
      "Charge sent to payment gateway",
      "Gateway confirms via webhook",
      "Order marked as paid",
    ],
  },
];

const FLOW_COLOR = "#a855f7";
const FLOW_XP = 25;

function FlowGame({ onAwardXp, onSaveScore, onExit, highScore }: GameViewProps) {
  const [scenario, setScenario] = useState<FlowScenario | null>(null);
  const [pool, setPool] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongSlots, setWrongSlots] = useState<number[] | null>(null);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const loadScenario = useCallback(() => {
    const s = pickRandom(FLOW_SCENARIOS);
    setScenario(s);
    setPool(shuffleArray(s.correctOrder));
    setPlaced([]);
    setWrongSlots(null);
    setSolved(false);
    setAttempts(0);
  }, []);

  // Pick + shuffle after mount (keeps SSR output stable — Math.random runs client-side only).
  // Deferred one tick so we don't setState synchronously inside the effect body.
  useEffect(() => {
    const id = setTimeout(loadScenario, 0);
    return () => clearTimeout(id);
  }, [loadScenario]);

  if (!scenario) {
    return (
      <GameShell emoji="🧩" title="Arrange the Flow" color={FLOW_COLOR} onExit={onExit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </GameShell>
    );
  }

  const totalSteps = scenario.correctOrder.length;

  const placeStep = (step: string) => {
    if (solved || wrongSlots !== null) return;
    if (!pool.includes(step) || placed.includes(step)) return;
    const nextPlaced = [...placed, step];
    setPlaced(nextPlaced);
    setPool(pool.filter((s) => s !== step));
    if (nextPlaced.length === totalSteps) {
      setAttempts((a) => a + 1);
      const wrong: number[] = [];
      nextPlaced.forEach((s, i) => {
        if (s !== scenario.correctOrder[i]) wrong.push(i);
      });
      if (wrong.length === 0) {
        setSolved(true);
        setXpEarned((x) => x + FLOW_XP);
        onAwardXp(FLOW_XP);
        const nextSession = sessionSolved + 1;
        setSessionSolved(nextSession);
        onSaveScore(nextSession);
      } else {
        setWrongSlots(wrong);
      }
    }
  };

  const undo = () => {
    if (placed.length === 0 || solved) return;
    const last = placed[placed.length - 1];
    setPlaced(placed.slice(0, -1));
    setPool([...pool, last]);
    setWrongSlots(null);
  };

  const reset = () => {
    if (solved) return;
    setPool(shuffleArray(scenario.correctOrder));
    setPlaced([]);
    setWrongSlots(null);
  };

  return (
    <GameShell
      emoji="🧩"
      title="Arrange the Flow"
      color={FLOW_COLOR}
      onExit={onExit}
      stats={
        <>
          <StatChip icon={<Sparkles className="size-3.5 text-purple-300" />} label="Session" value={`${sessionSolved}`} />
          <StatChip icon={<Trophy className="size-3.5 text-amber-300" />} label="Best" value={`${highScore}`} />
        </>
      }
    >
      {/* Scenario banner */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-purple-400/25 bg-purple-400/[0.07] p-4 sm:p-5">
        <div className="text-4xl" aria-hidden>
          {scenario.emoji}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Scenario · order the flow
          </div>
          <div className="text-lg font-bold text-white">{scenario.title}</div>
          <div className="text-sm text-zinc-400">
            Click the steps in the correct order — {totalSteps} steps, client to database.
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Step pool */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Step pool</span>
            <span className="text-xs text-zinc-500">{pool.length} left · click to place</span>
          </div>
          <div className="space-y-2">
            {pool.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
                All steps placed
              </div>
            )}
            {pool.map((step) => (
              <button
                key={step}
                onClick={() => placeStep(step)}
                disabled={solved || wrongSlots !== null}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-purple-400/60 hover:bg-purple-400/10 hover:text-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                <GripVertical className="size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-purple-300" />
                <span>{step}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ordered architecture */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your architecture</span>
            <span className="text-xs text-zinc-500">
              {placed.length}/{totalSteps} placed
            </span>
          </div>
          <div className="space-y-2">
            {scenario.correctOrder.map((_, i) => {
              const step = placed[i];
              const isWrong = wrongSlots?.includes(i) ?? false;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
                    !step && "border-dashed border-white/10 text-zinc-600",
                    step && !isWrong && !solved && "border-white/15 bg-white/[0.06] text-zinc-100",
                    isWrong && "border-red-400/70 bg-red-400/10 text-red-100",
                    solved && "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black",
                      isWrong
                        ? "bg-red-400/20 text-red-300"
                        : solved
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-white/10 text-zinc-400"
                    )}
                  >
                    {i + 1}
                  </span>
                  {step ? <span>{step}</span> : <span>Step {i + 1}</span>}
                  {isWrong && <XCircle className="ml-auto size-4 shrink-0 text-red-300" />}
                  {solved && <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={placed.length === 0 || solved}
          className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
        >
          <Undo2 className="size-4" />
          Undo last
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={placed.length === 0 || solved}
          className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <span className="text-xs text-zinc-500">
          Attempt {attempts + (solved ? 0 : 1)} · +{FLOW_XP} XP on completion
        </span>
        <Button
          size="sm"
          onClick={loadScenario}
          className="ml-auto bg-purple-500 font-bold text-white hover:bg-purple-400"
        >
          <Shuffle className="size-4" />
          New scenario
        </Button>
      </div>

      {/* Feedback */}
      {solved ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="font-bold">Perfect flow! +{FLOW_XP} XP</span>
          <span className="text-emerald-200/70">
            solved in {attempts} attempt{attempts === 1 ? "" : "s"} — load another scenario to keep going.
          </span>
        </div>
      ) : wrongSlots ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <XCircle className="size-4 shrink-0" />
          <span className="font-bold">
            Not quite — {wrongSlots.length} position{wrongSlots.length === 1 ? "" : "s"} wrong
          </span>
          <span className="text-red-200/70">(highlighted red). Undo or Reset to rearrange.</span>
        </div>
      ) : null}

      {xpEarned > 0 && (
        <div className="mt-3 text-xs text-zinc-500">
          +{xpEarned} XP earned in this session · high score this session: {sessionSolved}
        </div>
      )}
    </GameShell>
  );
}

/* ══════════════════════════════ Game 2 · Architect's Challenge ══════════════════════════════ */

interface ChallengeQ {
  topic: string;
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

const CHALLENGE_POOL: ChallengeQ[] = [
  {
    topic: "Rate Limiting",
    q: "1M users suddenly hit your API after a viral post. What protects the database first?",
    options: [
      "Adding more app servers",
      "Rate limiting at the API gateway",
      "Increasing the DB connection pool",
      "Enabling response compression",
    ],
    correct: 1,
    explain:
      "Rate limiting throttles excess traffic at the edge, so the surge never reaches your database. Extra servers just spread the flood around.",
  },
  {
    topic: "Caching",
    q: "A read-heavy endpoint runs the same expensive query thousands of times per minute. What's the first fix you reach for?",
    options: [
      "Shard the database by user ID",
      "Add a Redis cache in front of reads",
      "Move to a bigger database instance",
      "Switch the endpoint to WebSockets",
    ],
    correct: 1,
    explain:
      "Repeated identical reads are the textbook cache use case — serve hot results from Redis and let the database breathe.",
  },
  {
    topic: "Load Balancing",
    q: "You run 12 identical stateless app servers. What's the standard way to spread traffic across them?",
    options: [
      "DNS round-robin only",
      "A load balancer with health checks",
      "Consistent hashing on user IDs",
      "Client-side retry logic",
    ],
    correct: 1,
    explain:
      "A load balancer distributes requests and pulls unhealthy servers out of rotation via health checks — DNS alone can do neither well.",
  },
  {
    topic: "Sharding",
    q: "A single Postgres node is write-saturated and the dataset grows unbounded. What delivers horizontal write scale?",
    options: [
      "Adding read replicas",
      "Sharding the data across nodes",
      "Adding a CDN",
      "Tuning indexes",
    ],
    correct: 1,
    explain:
      "Sharding splits writes across nodes. Replicas only spread read load — every write still hits the primary.",
  },
  {
    topic: "Replication",
    q: "You need read scaling plus a hot standby if the primary dies. What do you add?",
    options: ["Read replicas", "A message queue", "A batch ETL job", "More B-tree indexes"],
    correct: 0,
    explain:
      "Primary-replica replication scales reads and gives you a standby you can promote during failover.",
  },
  {
    topic: "Circuit Breaker",
    q: "The payment service is down and your threads hang waiting on it, cascading into a full outage. What stops the bleeding?",
    options: [
      "Retry aggressively with no limit",
      "A circuit breaker that fails fast",
      "Increasing timeouts to 60s",
      "Adding more worker threads",
    ],
    correct: 1,
    explain:
      "A circuit breaker trips after repeated failures and fast-fails requests, giving the downstream service room to recover instead of piling up hung threads.",
  },
  {
    topic: "CDN",
    q: "Global users complain that a 40 MB hero image loads slowly. What serves it from a location near them?",
    options: ["A bigger origin server", "A CDN with edge PoPs", "Database read replicas", "A WebSocket connection"],
    correct: 1,
    explain:
      "CDN edge nodes cache static content close to users, cutting latency and offloading your origin entirely.",
  },
  {
    topic: "Message Queues",
    q: "Sending a welcome email adds 3 seconds to signup. How do you decouple it from the request path?",
    options: [
      "Send the email inline but faster",
      "A message queue with background workers",
      "Store emails in the database",
      "A synchronous HTTP call to the mail API",
    ],
    correct: 1,
    explain:
      "Publish 'user.signedup' to a queue and let workers send emails asynchronously — the API returns instantly and the consumer handles retries.",
  },
  {
    topic: "Consistent Hashing",
    q: "Your cache cluster must add or remove nodes with minimal key remapping. Which technique do you use?",
    options: [
      "Modulo hashing (key % N)",
      "Consistent hashing with virtual nodes",
      "Random node assignment",
      "Round-robin placement",
    ],
    correct: 1,
    explain:
      "With consistent hashing, adding a node only moves ~1/N of keys; modulo hashing remaps nearly everything.",
  },
  {
    topic: "CAP Theorem",
    q: "During a network partition, a CP system sacrifices ______ to guarantee ______.",
    options: [
      "availability; consistency",
      "consistency; availability",
      "durability; latency",
      "latency; throughput",
    ],
    correct: 0,
    explain:
      "CP systems (e.g. ZooKeeper, majority-commit Postgres) refuse writes that would break consistency, giving up availability during the partition.",
  },
  {
    topic: "Autoscaling",
    q: "Traffic swings 10× between night and day and manual scaling keeps failing. What responds automatically?",
    options: [
      "An on-call runbook",
      "Autoscaling on CPU/RPS metrics",
      "Larger fixed instances",
      "A cron job that reboots servers",
    ],
    correct: 1,
    explain:
      "Autoscalers watch metrics (CPU, request rate, queue depth) and add or remove instances to track demand in real time.",
  },
  {
    topic: "Idempotency",
    q: "Mobile clients retry payment requests on flaky networks and users get double-charged. What fixes it?",
    options: [
      "Disabling client retries",
      "Idempotency keys on the payment API",
      "Longer server timeouts",
      "A bigger database",
    ],
    correct: 1,
    explain:
      "An idempotency key lets the server recognize a retried charge and return the original result instead of creating a duplicate payment.",
  },
];

const ARCHITECT_COLOR = "#f47a20";
const Q_COUNT = 8;
const Q_SECONDS = 30;
const ARCHITECT_XP = 10;

function ArchitectGame({ onAwardXp, onSaveScore, onExit, highScore }: GameViewProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [questions, setQuestions] = useState<ChallengeQ[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // -1 = timed out
  const [timeLeft, setTimeLeft] = useState(Q_SECONDS);
  const timeRef = useRef(Q_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBest, setNewBest] = useState(false);

  const armTimer = () => {
    timeRef.current = Q_SECONDS;
    setTimeLeft(Q_SECONDS);
  };

  const start = () => {
    // Shuffle the pool, take 8, then shuffle each question's options (kills position bias).
    const picked: ChallengeQ[] = shuffleArray(CHALLENGE_POOL)
      .slice(0, Q_COUNT)
      .map((q) => {
        const answerText = q.options[q.correct];
        const options = shuffleArray(q.options);
        return { ...q, options, correct: options.indexOf(answerText) };
      });
    setQuestions(picked);
    setQIndex(0);
    setSelected(null);
    armTimer();
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setXpEarned(0);
    setNewBest(false);
    setPhase("playing");
  };

  // Per-question countdown — interval lives only while unanswered.
  // Timeout (= wrong answer) is handled inside the tick callback, not the effect body.
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    const t = setInterval(() => {
      timeRef.current = Math.max(0, timeRef.current - 1);
      setTimeLeft(timeRef.current);
      if (timeRef.current === 0) {
        setSelected(-1);
        setStreak(0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, selected]);

  const answer = (i: number) => {
    if (phase !== "playing" || selected !== null) return;
    setSelected(i);
    const q = questions[qIndex];
    if (i === q.correct) {
      setScore(score + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak(Math.max(bestStreak, nextStreak));
      setXpEarned((x) => x + ARCHITECT_XP);
      onAwardXp(ARCHITECT_XP);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      setNewBest(score > highScore);
      onSaveScore(score);
      setPhase("done");
    } else {
      setQIndex(qIndex + 1);
      setSelected(null);
      armTimer();
    }
  };

  if (phase === "idle") {
    return (
      <GameShell
        emoji="⚡"
        title="Architect's Challenge"
        color={ARCHITECT_COLOR}
        onExit={onExit}
        stats={<StatChip icon={<Trophy className="size-3.5 text-amber-300" />} label="Best" value={`${highScore}/${Q_COUNT}`} />}
      >
        <IntroPanel
          emoji="⚡"
          color={ARCHITECT_COLOR}
          title="Architect's Challenge"
          tagline="Race the clock and pick the right system design solution for production-scale scenarios."
          rules={[
            `${Q_COUNT} rapid-fire questions drawn from a production-scenario pool`,
            `${Q_SECONDS} seconds per question — timeouts count as wrong`,
            `+${ARCHITECT_XP} XP per correct answer`,
            "Chain correct answers to build your streak",
          ]}
          onStart={start}
          startLabel="Start round"
        />
      </GameShell>
    );
  }

  if (phase === "done") {
    return (
      <GameShell
        emoji="⚡"
        title="Architect's Challenge"
        color={ARCHITECT_COLOR}
        onExit={onExit}
        stats={<StatChip icon={<Trophy className="size-3.5 text-amber-300" />} label="Best" value={`${highScore}/${Q_COUNT}`} />}
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/40 bg-amber-400/10">
            <Trophy className="size-10 text-amber-300" />
          </div>
          <h3 className="text-2xl font-black text-white">Round complete!</h3>
          {newBest && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="size-3.5" />
              New personal best!
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultStat label="Score" value={`${score}/${Q_COUNT}`} accent={ARCHITECT_COLOR} />
            <ResultStat
              label="Accuracy"
              value={`${Math.round((score / Math.max(questions.length, 1)) * 100)}%`}
              accent="#a855f7"
            />
            <ResultStat label="XP earned" value={`+${xpEarned}`} accent="#fbbf24" />
            <ResultStat label="Best streak" value={`${bestStreak}`} />
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: ARCHITECT_COLOR, boxShadow: `0 8px 24px -8px ${ARCHITECT_COLOR}` }}
            >
              <RotateCcw className="size-4" />
              Play again
            </button>
            <Button
              variant="outline"
              onClick={onExit}
              className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Arena
            </Button>
          </div>
        </div>
      </GameShell>
    );
  }

  /* ---- playing ---- */
  const q = questions[qIndex];
  const answered = selected !== null;
  const isCorrect = selected === q.correct;
  const timedOut = selected === -1;
  const pct = (timeLeft / Q_SECONDS) * 100;
  const barColor = timeLeft > 15 ? "#a855f7" : timeLeft > 5 ? "#f47a20" : "#f87171";

  const optionClass = (i: number) => {
    const base = "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all";
    if (!answered) {
      return `${base} border-white/10 bg-white/[0.04] text-zinc-200 hover:border-orange-400/60 hover:bg-orange-400/10 hover:text-white`;
    }
    if (i === q.correct) return `${base} border-emerald-400/60 bg-emerald-400/15 text-emerald-100`;
    if (i === selected) return `${base} border-red-400/60 bg-red-400/15 text-red-100`;
    return `${base} border-white/10 bg-white/[0.04] text-zinc-500 opacity-50`;
  };

  return (
    <GameShell
      emoji="⚡"
      title="Architect's Challenge"
      color={ARCHITECT_COLOR}
      onExit={onExit}
      stats={
        <>
          <StatChip
            icon={<CheckCircle2 className="size-3.5 text-emerald-300" />}
            label="Score"
            value={`${score}/${questions.length}`}
          />
          <StatChip
            icon={<Flame className={cn("size-3.5", streak >= 2 ? "text-orange-400" : "text-zinc-600")} />}
            label="Streak"
            value={`${streak}`}
          />
          <StatChip
            icon={<Timer className={cn("size-3.5", timeLeft <= 5 ? "text-red-400" : "text-orange-300")} />}
            label="Time"
            value={`${timeLeft}s`}
          />
        </>
      }
    >
      {/* Countdown bar */}
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          key={qIndex}
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${answered ? pct : pct}%`, background: barColor }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-orange-400/40 bg-orange-400/10 text-orange-300">
            {q.topic}
          </Badge>
          <span className="text-xs text-zinc-500">
            Question {qIndex + 1} of {questions.length}
          </span>
        </div>
        <p className="text-lg font-semibold leading-snug text-white sm:text-xl">{q.q}</p>
      </div>

      {/* Options */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, i) => (
          <button key={opt} onClick={() => answer(i)} disabled={answered} className={optionClass(i)}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-black text-zinc-400">
              {"ABCD"[i]}
            </span>
            <span className="text-sm">{opt}</span>
            {answered && i === q.correct && <CheckCircle2 className="ml-auto size-5 shrink-0 text-emerald-300" />}
            {answered && i === selected && i !== q.correct && (
              <XCircle className="ml-auto size-5 shrink-0 text-red-300" />
            )}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3",
            isCorrect ? "border-emerald-400/40 bg-emerald-400/10" : "border-red-400/40 bg-red-400/10"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-bold",
              isCorrect ? "text-emerald-200" : "text-red-200"
            )}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="size-4" /> Correct! +{ARCHITECT_XP} XP
              </>
            ) : timedOut ? (
              <>
                <Timer className="size-4" /> Time&apos;s up!
              </>
            ) : (
              <>
                <XCircle className="size-4" /> Wrong
              </>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{q.explain}</p>
          <Button
            onClick={next}
            size="sm"
            className="mt-3 bg-orange-500 font-bold text-white hover:bg-orange-400"
          >
            {qIndex + 1 >= questions.length ? "See results" : "Next question"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </GameShell>
  );
}

/* ══════════════════════════════ Game 3 · Debug the System ══════════════════════════════ */

type MetricId = "cpu" | "memory" | "errorRate" | "latency" | "queueDepth" | "dbConn";

interface MetricDef {
  id: MetricId;
  label: string;
  icon: LucideIcon;
  baseline: number;
  jitter: number;
  threshold: number;
  fmt: (v: number) => string;
}

const METRICS: MetricDef[] = [
  { id: "cpu", label: "CPU", icon: Cpu, baseline: 42, jitter: 5, threshold: 85, fmt: (v) => `${Math.round(v)}%` },
  { id: "memory", label: "Memory", icon: MemoryStick, baseline: 45, jitter: 4, threshold: 85, fmt: (v) => `${Math.round(v)}%` },
  {
    id: "errorRate",
    label: "Error Rate",
    icon: AlertTriangle,
    baseline: 0.4,
    jitter: 0.25,
    threshold: 5,
    fmt: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: "latency",
    label: "Latency P99",
    icon: Timer,
    baseline: 128,
    jitter: 14,
    threshold: 800,
    fmt: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`),
  },
  { id: "queueDepth", label: "Queue Depth", icon: Layers, baseline: 2140, jitter: 220, threshold: 50000, fmt: fmtCompact },
  {
    id: "dbConn",
    label: "DB Connections",
    icon: Database,
    baseline: 32,
    jitter: 4,
    threshold: 80,
    fmt: (v) => `${Math.round(v)}/100`,
  },
];

function baselineValues(): Record<MetricId, number> {
  const out = {} as Record<MetricId, number>;
  for (const m of METRICS) out[m.id] = m.baseline;
  return out;
}

type Severity = "normal" | "elevated" | "critical";

function severityOf(def: MetricDef, value: number): Severity {
  if (value >= def.threshold) return "critical";
  if (value >= def.threshold * 0.6) return "elevated";
  return "normal";
}

function severityColor(sev: Severity): string {
  return sev === "critical" ? "#f87171" : sev === "elevated" ? "#fbbf24" : "#34d399";
}

interface DebugScenario {
  id: string;
  alert: string;
  prompt: string;
  metric: MetricId;
  abnormal: number;
  secondary?: Partial<Record<MetricId, number>>;
  components: string[];
  answer: string;
  logs: string[];
  explain: string;
}

const DEBUG_SCENARIOS: DebugScenario[] = [
  {
    id: "bad-deploy",
    alert: "P1 · Checkout errors surging",
    prompt: "Error rate spiked to 15% minutes after a deploy. Which component is failing?",
    metric: "errorRate",
    abnormal: 15.2,
    secondary: { latency: 540 },
    components: ["API Server", "Database", "Cache", "Load Balancer"],
    answer: "API Server",
    logs: [
      "14:02:11  deploy   api v2.4.1 → production (canary 25%)",
      "14:02:39  api-7    ERROR NullPointerException at CheckoutHandler.java:88",
      "14:02:40  api-2    ERROR unhandled exception → HTTP 500 (×1,204)",
      "14:03:02  db       connections healthy · 14 active / 100 max · p99 6ms",
      "14:03:15  cache    redis healthy · hit rate 94% · no evictions",
    ],
    explain:
      "Stack traces point straight at new code in the API layer seconds after the deploy — DB and cache are healthy. Classic bad-release regression: roll back, then fix forward.",
  },
  {
    id: "cpu-fire",
    alert: "P1 · Latency degraded sitewide",
    prompt: "P99 latency jumped 10× and one tier is pegged at 97% CPU. Which component is failing?",
    metric: "cpu",
    abnormal: 97.4,
    secondary: { latency: 620 },
    components: ["API Server", "Database", "Cache", "Message Queue"],
    answer: "API Server",
    logs: [
      "12:41:02  api-3    CPU 97% (limit 100%) · throttling requests",
      "12:41:05  api-1    GC pause 840ms · full-GC loop detected",
      "12:41:30  db       qps normal · p99 8ms · 22 active conns",
      "12:41:44  trace    92% of slow requests spend 1.8s inside api.render()",
    ],
    explain:
      "Database and cache are idle — the API tier itself is CPU-saturated and GC-thrashing. The latency is just the symptom; profiling the app servers points to the hot render path.",
  },
  {
    id: "pool-exhausted",
    alert: "P1 · Requests timing out",
    prompt: "Requests are timing out and DB connections sit at 100/100. Which component is failing?",
    metric: "dbConn",
    abnormal: 100,
    secondary: { latency: 940, errorRate: 4.2 },
    components: ["Database", "Cache", "API Server", "CDN"],
    answer: "Database",
    logs: [
      "09:15:07  db       100/100 connections in use · pool exhausted",
      "09:15:09  api-4    WARN timeout waiting for DB connection (30s)",
      "09:15:12  db       seq-scan on orders · missing index on user_id",
      "09:15:40  queue    consumer lag normal · 1.2k messages",
    ],
    explain:
      "A missing index caused full scans; long queries piled up and exhausted the connection pool. The database is the bottleneck — add the index, tune the pool, set statement timeouts.",
  },
  {
    id: "consumer-crash",
    alert: "P2 · Background jobs hours behind",
    prompt: "Queue depth is growing unbounded and email jobs are hours late. Which component is failing?",
    metric: "queueDepth",
    abnormal: 1_204_551,
    secondary: { latency: 520 },
    components: ["Message Queue consumer", "Load Balancer", "Cache", "API Server"],
    answer: "Message Queue consumer",
    logs: [
      "22:10:00  queue    depth 1,204,551 (baseline ~2k) · growing 8k/s",
      "22:10:03  worker   4/64 consumers alive · rest OOM-killed",
      "22:10:05  producer publishing normal · 8k msg/s",
      "22:10:30  api      enqueue latency normal · no errors",
    ],
    explain:
      "Producers are healthy — the consumers crashed (OOM) so depth grows unbounded. Restart workers with memory limits, add consumer autoscaling, and add a dead-letter queue.",
  },
  {
    id: "redis-oom",
    alert: "P1 · Database under heavy load",
    prompt: "Cache hit rate collapsed and the database is absorbing every read. Which component is failing?",
    metric: "memory",
    abnormal: 96.3,
    secondary: { dbConn: 88, latency: 1150 },
    components: ["Cache", "Database", "API Server", "Message Queue"],
    answer: "Cache",
    logs: [
      "03:22:10  redis-2  memory 96% · maxmemory reached · evicting keys",
      "03:22:12  cache    hit rate 34% (baseline 92%)",
      "03:22:15  db       read qps 12× baseline · absorbing cache misses",
      "03:22:20  api      p99 1.15s on product pages · CPU normal",
    ],
    explain:
      "Redis hit maxmemory and started evicting keys, so misses flooded the DB. The failing component is the cache layer: raise memory, tune TTLs, or scale the cache cluster.",
  },
  {
    id: "lb-retry-storm",
    alert: "P1 · Everything feels slow",
    prompt: "P99 latency is 4.8s across ALL endpoints while CPU and the database look normal. Which component is failing?",
    metric: "latency",
    abnormal: 4800,
    secondary: { errorRate: 2.1 },
    components: ["Load Balancer", "Cache", "Database", "Message Queue"],
    answer: "Load Balancer",
    logs: [
      "11:48:22  lb       3/12 backend targets unhealthy · still routing",
      "11:48:25  lb       retries per request: 6.2 (baseline 0.1)",
      "11:48:30  db       qps normal · p99 9ms · pool 30/100",
      "11:48:44  trace    queue time at LB = 3.9s per request",
    ],
    explain:
      "The load balancer kept routing to unhealthy targets, and client retries amplified the load into a storm. Every request queues at the LB — that's your 4.8s. Fix target health checks.",
  },
];

const DEBUG_COLOR = "#f87171";
const ROUND_CASES = 5;
const CASE_SECONDS = 60;
const DEBUG_XP = 15;

function componentIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("database") || n.includes("db")) return Database;
  if (n.includes("cache") || n.includes("redis")) return Boxes;
  if (n.includes("queue") || n.includes("consumer")) return Layers;
  if (n.includes("cdn")) return Globe;
  if (n.includes("balancer") || n.includes("gateway")) return Shuffle;
  return Server;
}

function MetricTile({
  def,
  value,
  highlighted,
  dim,
}: {
  def: MetricDef;
  value: number;
  highlighted: boolean;
  dim: boolean;
}) {
  const sev = severityOf(def, value);
  const color = severityColor(sev);
  const Icon = def.icon;
  return (
    <div
      className={cn(
        "relative rounded-xl border p-3 transition-all duration-300",
        highlighted ? "border-red-400/80 bg-red-400/10 ring-2 ring-red-400/50" : "border-white/10 bg-white/[0.04]",
        dim && !highlighted && "opacity-45"
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
        <Icon className="size-3.5" style={{ color }} />
        <span className="truncate">{def.label}</span>
        {highlighted && (
          <span className="ml-auto rounded bg-red-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-300">
            bottleneck
          </span>
        )}
      </div>
      <div className="mt-1 text-lg font-black tabular-nums" style={{ color }}>
        {def.fmt(value)}
      </div>
      <div className="text-[10px] text-zinc-500">baseline {def.fmt(def.baseline)}</div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (value / (def.threshold * 1.15)) * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function DebugGame({ onAwardXp, onSaveScore, onExit, highScore }: GameViewProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "reveal" | "done">("idle");
  const [round, setRound] = useState<DebugScenario[]>([]);
  const [sIndex, setSIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // -1 = timed out
  const [timeLeft, setTimeLeft] = useState(CASE_SECONDS);
  const timeRef = useRef(CASE_SECONDS);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [values, setValues] = useState<Record<MetricId, number>>(baselineValues);
  const baseRef = useRef<Record<MetricId, number>>(baselineValues());

  const armTimer = () => {
    timeRef.current = CASE_SECONDS;
    setTimeLeft(CASE_SECONDS);
  };

  /** Point the metric bases at the current incident (bottleneck + secondary symptoms). */
  const applyBases = (s: DebugScenario) => {
    const b = baselineValues();
    b[s.metric] = s.abnormal;
    if (s.secondary) {
      for (const k of Object.keys(s.secondary) as MetricId[]) {
        const v = s.secondary[k];
        if (typeof v === "number") b[k] = v;
      }
    }
    baseRef.current = b;
  };

  const start = () => {
    const picked: DebugScenario[] = shuffleArray(DEBUG_SCENARIOS)
      .slice(0, ROUND_CASES)
      .map((s) => ({ ...s, components: shuffleArray(s.components) }));
    setRound(picked);
    setSIndex(0);
    setScore(0);
    setXpEarned(0);
    setSelected(null);
    setNewBest(false);
    armTimer();
    applyBases(picked[0]);
    setValues({ ...baseRef.current });
    setPhase("playing");
  };

  // Live metric jitter — runs while a case is on screen (playing or reveal).
  useEffect(() => {
    if (phase !== "playing" && phase !== "reveal") return;
    const t = setInterval(() => {
      const next: Record<MetricId, number> = {} as Record<MetricId, number>;
      for (const m of METRICS) {
        const base = baseRef.current[m.id];
        const j = Math.max(m.jitter, base * 0.02);
        next[m.id] = Math.max(0, base + (Math.random() * 2 - 1) * j);
      }
      setValues(next);
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Per-case countdown — interval lives only while unanswered.
  // Soft timer: running out doesn't penalize, the case just scores 0.
  // The timeout transition happens inside the tick callback, not the effect body.
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    const t = setInterval(() => {
      timeRef.current = Math.max(0, timeRef.current - 1);
      setTimeLeft(timeRef.current);
      if (timeRef.current === 0) {
        setSelected(-1);
        setPhase("reveal");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, selected]);

  const choose = (i: number) => {
    if (phase !== "playing" || selected !== null) return;
    setSelected(i);
    setPhase("reveal");
    const sc = round[sIndex];
    if (sc && sc.components[i] === sc.answer) {
      setScore(score + 1);
      setXpEarned((x) => x + DEBUG_XP);
      onAwardXp(DEBUG_XP);
    }
  };

  const nextCase = () => {
    if (sIndex + 1 >= round.length) {
      setNewBest(score > highScore);
      onSaveScore(score);
      setPhase("done");
    } else {
      const nxt = round[sIndex + 1];
      setSIndex(sIndex + 1);
      applyBases(nxt);
      setValues({ ...baseRef.current });
      setSelected(null);
      armTimer();
      setPhase("playing");
    }
  };

  if (phase === "idle") {
    return (
      <GameShell
        emoji="🐛"
        title="Debug the System"
        color={DEBUG_COLOR}
        onExit={onExit}
        stats={<StatChip icon={<Trophy className="size-3.5 text-amber-300" />} label="Best" value={`${highScore}/${ROUND_CASES}`} />}
      >
        <IntroPanel
          emoji="🐛"
          color={DEBUG_COLOR}
          title="Debug the System"
          tagline="A system is failing. Read the live metrics and logs, then name the broken component before time runs out."
          rules={[
            `${ROUND_CASES} incident cases per round, drawn from a scenario pool`,
            `${CASE_SECONDS}s soft timer per case — running out just scores 0, no penalty`,
            `+${DEBUG_XP} XP per solved case`,
            "The bottleneck metric is highlighted after you answer, with an explanation",
          ]}
          onStart={start}
          startLabel="Start round"
        />
      </GameShell>
    );
  }

  if (phase === "done") {
    return (
      <GameShell
        emoji="🐛"
        title="Debug the System"
        color={DEBUG_COLOR}
        onExit={onExit}
        stats={<StatChip icon={<Trophy className="size-3.5 text-amber-300" />} label="Best" value={`${highScore}/${ROUND_CASES}`} />}
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-5xl" aria-hidden>
            {score === ROUND_CASES ? "🏆" : "🐛"}
          </div>
          <h3 className="mt-3 text-2xl font-black text-white">Debug round complete!</h3>
          {newBest && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="size-3.5" />
              New personal best!
            </div>
          )}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <ResultStat label="Solved" value={`${score}/${round.length}`} accent={DEBUG_COLOR} />
            <ResultStat label="XP earned" value={`+${xpEarned}`} accent="#fbbf24" />
            <ResultStat label="Best" value={`${highScore}`} />
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: DEBUG_COLOR, boxShadow: `0 8px 24px -8px ${DEBUG_COLOR}` }}
            >
              <RotateCcw className="size-4" />
              Play again
            </button>
            <Button
              variant="outline"
              onClick={onExit}
              className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Arena
            </Button>
          </div>
        </div>
      </GameShell>
    );
  }

  /* ---- playing / reveal ---- */
  const sc = round[sIndex];
  if (!sc) return null;
  const answered = selected !== null;
  const timedOut = selected === -1;
  const isCorrect = selected !== null && selected >= 0 && sc.components[selected] === sc.answer;
  const pct = (timeLeft / CASE_SECONDS) * 100;

  const optionClass = (i: number) => {
    const base = "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all";
    if (!answered) {
      return `${base} border-white/10 bg-white/[0.04] text-zinc-200 hover:border-red-400/60 hover:bg-red-400/10 hover:text-white`;
    }
    if (sc.components[i] === sc.answer) return `${base} border-emerald-400/60 bg-emerald-400/15 text-emerald-100`;
    if (i === selected) return `${base} border-red-400/60 bg-red-400/15 text-red-100`;
    return `${base} border-white/10 bg-white/[0.04] text-zinc-500 opacity-50`;
  };

  return (
    <GameShell
      emoji="🐛"
      title="Debug the System"
      color={DEBUG_COLOR}
      onExit={onExit}
      stats={
        <>
          <StatChip icon={<Bug className="size-3.5 text-red-300" />} label="Case" value={`${sIndex + 1}/${round.length}`} />
          <StatChip
            icon={<CheckCircle2 className="size-3.5 text-emerald-300" />}
            label="Solved"
            value={`${score}`}
          />
          <StatChip
            icon={<Timer className={cn("size-3.5", timeLeft <= 10 ? "text-red-400" : "text-amber-300")} />}
            label="Time"
            value={`${timeLeft}s`}
          />
        </>
      }
    >
      {/* Incident banner */}
      <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/[0.07] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-md bg-red-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-300">
            <Siren className="size-3.5" />
            {sc.alert}
          </span>
          <span className="text-xs text-zinc-500">
            Case {sIndex + 1} of {round.length} · soft timer
          </span>
        </div>
        <p className="mt-2 text-base font-semibold leading-snug text-white sm:text-lg">{sc.prompt}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Read the live metrics &amp; logs, then pick the failing component.
        </p>
      </div>

      {/* Countdown bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          key={sIndex}
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: timeLeft > 20 ? "#fbbf24" : "#f87171" }}
        />
      </div>

      {/* Metrics + logs */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:col-span-3">
          {METRICS.map((m) => (
            <MetricTile
              key={m.id}
              def={m}
              value={values[m.id]}
              highlighted={answered && m.id === sc.metric}
              dim={answered}
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Live logs</span>
            <Terminal className="ml-auto size-3.5 text-zinc-500" />
          </div>
          <div className="sw-scroll max-h-64 space-y-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
            {sc.logs.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap",
                  line.includes("ERROR") || line.includes("FATAL")
                    ? "text-red-300"
                    : line.includes("WARN")
                      ? "text-amber-300"
                      : "text-zinc-400"
                )}
              >
                <span className="text-zinc-600">$ </span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component options */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {sc.components.map((comp, i) => {
          const Icon = componentIcon(comp);
          return (
            <button key={comp} onClick={() => choose(i)} disabled={answered} className={optionClass(i)}>
              <Icon className="size-5 shrink-0" />
              <span className="text-sm font-semibold">{comp}</span>
              {answered && sc.components[i] === sc.answer && (
                <CheckCircle2 className="ml-auto size-5 shrink-0 text-emerald-300" />
              )}
              {answered && i === selected && sc.components[i] !== sc.answer && (
                <XCircle className="ml-auto size-5 shrink-0 text-red-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal */}
      {answered && (
        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3",
            isCorrect ? "border-emerald-400/40 bg-emerald-400/10" : "border-red-400/40 bg-red-400/10"
          )}
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 text-sm font-bold",
              isCorrect ? "text-emerald-200" : "text-red-200"
            )}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="size-4" /> Solved! +{DEBUG_XP} XP — it was the {sc.answer}
              </>
            ) : timedOut ? (
              <>
                <Timer className="size-4" /> Time&apos;s up! No XP for this case — it was the {sc.answer}
              </>
            ) : (
              <>
                <XCircle className="size-4" /> Missed — the failing component was the {sc.answer}
              </>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{sc.explain}</p>
          <Button onClick={nextCase} size="sm" className="mt-3 bg-red-500 font-bold text-white hover:bg-red-400">
            {sIndex + 1 >= round.length ? "See results" : "Next case"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </GameShell>
  );
}

/* ══════════════════════════════ Hub ══════════════════════════════ */

interface GameMeta {
  id: GameId;
  emoji: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  color: string;
  borderHover: string;
  glowHover: string;
  formatScore: (n: number) => string;
}

const GAMES: GameMeta[] = [
  {
    id: "flow",
    emoji: "🧩",
    icon: Puzzle,
    title: "Arrange the Flow",
    description:
      "Drag system components into the correct order. Build the architecture — from client to database.",
    tags: ["Architecture", "Flow Design"],
    color: "#a855f7",
    borderHover: "hover:border-purple-500/60",
    glowHover: "hover:shadow-[0_20px_50px_-16px_rgba(168,85,247,0.5)]",
    formatScore: (n) => `${n} flow${n === 1 ? "" : "s"}`,
  },
  {
    id: "architect",
    emoji: "⚡",
    icon: Zap,
    title: "Architect's Challenge",
    description:
      "Race against the clock to pick the right system design solution for production-scale scenarios. 30 seconds per question.",
    tags: ["Decision Making", "Timed"],
    color: "#f47a20",
    borderHover: "hover:border-orange-400/60",
    glowHover: "hover:shadow-[0_20px_50px_-16px_rgba(244,122,32,0.5)]",
    formatScore: (n) => `${n}/8`,
  },
  {
    id: "debug",
    emoji: "🐛",
    icon: Bug,
    title: "Debug the System",
    description:
      "A system is failing. Identify the bottleneck or broken component from live metrics before time runs out.",
    tags: ["Debugging", "Bottleneck Analysis"],
    color: "#f87171",
    borderHover: "hover:border-red-400/60",
    glowHover: "hover:shadow-[0_20px_50px_-16px_rgba(248,113,113,0.5)]",
    formatScore: (n) => `${n} case${n === 1 ? "" : "s"}`,
  },
];

function GameCard({ meta, best, onPlay }: { meta: GameMeta; best: number; onPlay: () => void }) {
  const Icon = meta.icon;
  const btnStyle: CSSProperties = {
    background: meta.color,
    boxShadow: `0 4px 16px -6px ${meta.color}`,
  };
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1",
        meta.borderHover,
        meta.glowHover
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: meta.color }}
        aria-hidden
      />
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${meta.color}1f`, borderColor: `${meta.color}55` }}
        >
          <Icon className="size-7" style={{ color: meta.color }} />
        </div>
        <span className="text-3xl opacity-80 transition-transform duration-300 group-hover:scale-125" aria-hidden>
          {meta.emoji}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white">{meta.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{meta.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {meta.tags.map((t) => (
          <Badge key={t} variant="outline" className="border-white/15 bg-white/5 text-zinc-300">
            {t}
          </Badge>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Trophy className="size-3.5 shrink-0 text-amber-300" />
          <span>
            Best: <span className="font-bold text-zinc-200">{meta.formatScore(best)}</span>
          </span>
        </div>
        <button
          onClick={onPlay}
          style={btnStyle}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          <Play className="size-4 fill-current" />
          Play
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════ Main export ══════════════════════════════ */

export function GameArena({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<GameId | null>(null);
  const [xp, setXp] = useState<XpState>(EMPTY_XP);
  const [scores, setScores] = useState<Record<string, number>>({});
  const xpRef = useRef<XpState>(EMPTY_XP);
  const scoresRef = useRef<Record<string, number>>({});

  // Load persisted state after mount (SSR-safe).
  useEffect(() => {
    xpRef.current = loadXp();
    scoresRef.current = loadScores();
    setXp(xpRef.current);
    setScores(scoresRef.current);
  }, []);

  const handleAwardXp = useCallback((amount: number) => {
    const next = computeNextXp(xpRef.current, amount);
    xpRef.current = next;
    persistXp(next);
    setXp(next);
  }, []);

  const handleSaveScore = useCallback((gameId: GameId, score: number) => {
    const best = Math.max(scoresRef.current[gameId] ?? 0, score);
    const next = { ...scoresRef.current, [gameId]: best };
    scoresRef.current = next;
    persistScores(next);
    setScores(next);
  }, []);

  const active = view ? GAMES.find((g) => g.id === view) : undefined;

  return (
    <section
      aria-label="Game Arena"
      className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-[#0d0a1c] p-4 text-zinc-100 sm:p-6 lg:p-8"
    >
      {/* Ambient glows */}
      <div className="sw-glow-pulse pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" aria-hidden />
      <div className="sw-glow-pulse pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" aria-hidden />

      <div className="relative z-10">
        {active ? (
          <>
            {active.id === "flow" && (
              <FlowGame
                key="flow"
                highScore={scores["flow"] ?? 0}
                onAwardXp={handleAwardXp}
                onSaveScore={(s) => handleSaveScore("flow", s)}
                onExit={() => setView(null)}
              />
            )}
            {active.id === "architect" && (
              <ArchitectGame
                key="architect"
                highScore={scores["architect"] ?? 0}
                onAwardXp={handleAwardXp}
                onSaveScore={(s) => handleSaveScore("architect", s)}
                onExit={() => setView(null)}
              />
            )}
            {active.id === "debug" && (
              <DebugGame
                key="debug"
                highScore={scores["debug"] ?? 0}
                onAwardXp={handleAwardXp}
                onSaveScore={(s) => handleSaveScore("debug", s)}
                onExit={() => setView(null)}
              />
            )}
          </>
        ) : (
          <div className="sw-fade-up">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                aria-label="Back to home"
                className="border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  🎮 Game <span className="sw-gradient-text">Arena</span>
                </h2>
                <p className="mt-0.5 text-sm text-zinc-400">
                  Test your knowledge with gamified challenges
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2">
                  <Zap className="size-4 text-amber-300" />
                  <span className="text-base font-black tabular-nums text-amber-200">
                    {xp.total.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-amber-200/60">XP</span>
                </div>
                {xp.streak > 0 && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3.5 py-2">
                    <Flame className="size-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-200">{xp.streak}-day</span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-orange-200/60">
                      streak
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Game cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((g) => (
                <GameCard key={g.id} meta={g} best={scores[g.id] ?? 0} onPlay={() => setView(g.id)} />
              ))}
            </div>

            {/* XP rules */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">Earn XP:</span>
              <span className="rounded-md border border-purple-400/25 bg-purple-400/10 px-2 py-1 font-semibold text-purple-300">
                +25 flow completed
              </span>
              <span className="rounded-md border border-orange-400/25 bg-orange-400/10 px-2 py-1 font-semibold text-orange-300">
                +10 correct answer
              </span>
              <span className="rounded-md border border-red-400/25 bg-red-400/10 px-2 py-1 font-semibold text-red-300">
                +15 debug solved
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
