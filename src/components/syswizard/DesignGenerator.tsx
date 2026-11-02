"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, ArrowLeft } from "lucide-react";

interface DesignGeneratorProps {
  onBack: () => void;
  onAskAI: (prompt: string) => void;
}

interface Blueprint {
  name: string;
  components: { icon: string; name: string; desc: string }[];
  flow: string[];
  db: string;
  queue: string;
  cdn: boolean;
  realtime: boolean;
  geo: boolean;
}

const ARCHETYPES: { keys: string[]; bp: Blueprint }[] = [
  {
    keys: ["chat", "message", "whatsapp", "slack", "discord"],
    bp: {
      name: "Real-Time Chat System",
      components: [
        { icon: "📱", name: "Client Apps", desc: "Web + mobile clients" },
        { icon: "🔌", name: "WebSocket Gateway", desc: "Persistent connections" },
        { icon: "💬", name: "Chat Service", desc: "Message routing + ordering" },
        { icon: "📨", name: "Message Queue", desc: "Offline delivery buffer" },
        { icon: "🗄️", name: "Message Store", desc: "Sharded by conversation" },
        { icon: "🔔", name: "Push Service", desc: "APNs / FCM notifications" },
      ],
      flow: ["Client connects via WebSocket", "Message sent → Chat Service", "Persist to Message Store", "Fan-out to online recipients", "Queue for offline users", "Push notification if away"],
      db: "Cassandra (messages) + Redis (presence)",
      queue: "Kafka",
      cdn: false, realtime: true, geo: true,
    },
  },
  {
    keys: ["video", "youtube", "netflix", "stream", "twitch"],
    bp: {
      name: "Video Streaming Platform",
      components: [
        { icon: "📤", name: "Upload Service", desc: "Chunked resumable uploads" },
        { icon: "🎬", name: "Transcoder", desc: "H.264/VP9 ladder 240p→4K" },
        { icon: "📦", name: "Object Storage", desc: "Original + transcoded assets" },
        { icon: "🌍", name: "CDN", desc: "Global edge delivery" },
        { icon: "🔍", name: "Search/Index", desc: "Elasticsearch metadata" },
        { icon: "📊", name: "Analytics", desc: "Watch-time + QoE metrics" },
      ],
      flow: ["Upload to S3", "Queue transcode jobs", "Generate HLS/DASH renditions", "Push to CDN edges", "Player streams adaptive bitrate", "Log QoE analytics"],
      db: "PostgreSQL (metadata) + Elasticsearch",
      queue: "Kafka (transcode events)",
      cdn: true, realtime: false, geo: true,
    },
  },
  {
    keys: ["ride", "uber", "taxi", "cab", "delivery", "food", "swiggy", "zomato"],
    bp: {
      name: "Ride-Hailing / Delivery Platform",
      components: [
        { icon: "📍", name: "Geo Service", desc: "Geospatial index (S2/H3)" },
        { icon: "🚗", name: "Matching Engine", desc: "Driver-rider assignment" },
        { icon: "💳", name: "Payment Service", desc: "Idempotent charges" },
        { icon: "📡", name: "Tracking Service", desc: "Real-time location via WebSocket" },
        { icon: "🔔", name: "Notification Svc", desc: "Trip updates" },
        { icon: "📊", name: "Surge Engine", desc: "Dynamic pricing" },
      ],
      flow: ["Rider requests ride", "Geo service finds nearby drivers", "Matching engine assigns", "Drivers ping location every 4s", "Trip events → Kafka", "Payment captured at completion"],
      db: "PostGIS + Redis geosets",
      queue: "Kafka (trip events)",
      cdn: false, realtime: true, geo: true,
    },
  },
  {
    keys: ["feed", "social", "twitter", "instagram", "facebook"],
    bp: {
      name: "Social Feed Platform",
      components: [
        { icon: "📝", name: "Post Service", desc: "Create + fetch posts" },
        { icon: "📰", name: "Feed Service", desc: "Fan-out hybrid timeline" },
        { icon: "⚡", name: "Feed Cache", desc: "Redis per-user timelines" },
        { icon: "🗄️", name: "Post Store", desc: "Sharded by post ID" },
        { icon: "🧮", name: "Ranking Service", desc: "ML relevance scoring" },
        { icon: "👥", name: "Social Graph", desc: "Follow relationships" },
      ],
      flow: ["User creates post", "Fan-out to followers' caches", "Celebrities: fan-out-on-read", "Feed merges + ranks", "Serve paginated timeline", "Track engagement"],
      db: "Cassandra + Redis",
      queue: "Kafka (fan-out workers)",
      cdn: true, realtime: true, geo: false,
    },
  },
  {
    keys: ["url", "shortener", "short", "bitly"],
    bp: {
      name: "URL Shortener",
      components: [
        { icon: "🔗", name: "Shortener API", desc: "Base62 code generation" },
        { icon: "⚡", name: "Redirect Cache", desc: "Hot code → URL map" },
        { icon: "🗄️", name: "URL Store", desc: "code, url, clicks" },
        { icon: "📊", name: "Analytics", desc: "Click tracking stream" },
        { icon: "🚦", name: "Rate Limiter", desc: "Abuse prevention" },
      ],
      flow: ["POST /shorten → generate code", "Store mapping", "GET /:code → check cache", "Cache hit → 302 redirect", "Log click event", "Analytics aggregation"],
      db: "PostgreSQL + Redis",
      queue: "Kafka (click events)",
      cdn: true, realtime: false, geo: true,
    },
  },
  {
    keys: ["payment", "stripe", "billing", "fintech", "bank"],
    bp: {
      name: "Payment Processing System",
      components: [
        { icon: "💳", name: "Payment API", desc: "Idempotency keys" },
        { icon: "🏦", name: "Ledger", desc: "Double-entry bookkeeping" },
        { icon: "🛡️", name: "Fraud Engine", desc: "ML risk scoring" },
        { icon: "🔄", name: "Reconciliation", desc: "Daily bank matching" },
        { icon: "📨", name: "Event Stream", desc: "Payment lifecycle events" },
      ],
      flow: ["Create payment intent", "Validate + fraud check", "Authorize with network", "Capture funds", "Write to ledger", "Reconcile with bank"],
      db: "PostgreSQL (ACID ledger)",
      queue: "Kafka",
      cdn: false, realtime: false, geo: false,
    },
  },
  {
    keys: ["search", "elasticsearch", "engine"],
    bp: {
      name: "Search System",
      components: [
        { icon: "🕷️", name: "Crawler", desc: "Fetch + extract content" },
        { icon: "📇", name: "Indexer", desc: "Inverted index builder" },
        { icon: "🔍", name: "Query Service", desc: "Parse + execute queries" },
        { icon: "🧮", name: "Ranker", desc: "TF-IDF / ML scoring" },
        { icon: "⚡", name: "Suggest Cache", desc: "Autocomplete trie" },
      ],
      flow: ["Crawl documents", "Tokenize + build index", "Shard index across nodes", "Query → fan-out to shards", "Merge + rank results", "Serve top-K"],
      db: "Elasticsearch + Redis",
      queue: "Kafka (crawl pipeline)",
      cdn: false, realtime: false, geo: false,
    },
  },
  {
    keys: ["game", "multiplayer", "gaming"],
    bp: {
      name: "Online Gaming Platform",
      components: [
        { icon: "🎮", name: "Game Servers", desc: "Authoritative state sims" },
        { icon: "🔌", name: "Gateway (UDP/WS)", desc: "Low-latency sessions" },
        { icon: "🏆", name: "Matchmaking", desc: "Skill-based pairing" },
        { icon: "⚡", name: "State Cache", desc: "Redis cluster" },
        { icon: "📊", name: "Leaderboards", desc: "Sorted sets" },
        { icon: "🛡️", name: "Anti-Cheat", desc: "Behavioral analytics" },
      ],
      flow: ["Client connects to gateway", "Matchmaking pairs players", "Game server runs authoritative sim", "State snapshots to cache", "Results to leaderboard", "Telemetry → analytics"],
      db: "MongoDB + Redis",
      queue: "Redis Pub/Sub",
      cdn: true, realtime: true, geo: true,
    },
  },
];

function pickBlueprint(idea: string): Blueprint {
  const lower = idea.toLowerCase();
  for (const a of ARCHETYPES) {
    if (a.keys.some((k) => lower.includes(k))) return a.bp;
  }
  return {
    name: "Custom Web Application",
    components: [
      { icon: "🌐", name: "Load Balancer", desc: "Traffic distribution" },
      { icon: "🖥️", name: "App Servers", desc: "Stateless API tier" },
      { icon: "⚡", name: "Cache Layer", desc: "Redis hot data" },
      { icon: "🗄️", name: "Primary Database", desc: "PostgreSQL cluster" },
      { icon: "📨", name: "Message Queue", desc: "Async task processing" },
      { icon: "📦", name: "Object Storage", desc: "Files + static assets" },
    ],
    flow: ["Client → Load Balancer", "App servers process request", "Check cache for hot data", "Query database as needed", "Async tasks via queue", "Static assets via CDN"],
    db: "PostgreSQL + Redis",
    queue: "RabbitMQ",
    cdn: true, realtime: false, geo: false,
  };
}

export function DesignGenerator({ onBack, onAskAI }: DesignGeneratorProps) {
  const [idea, setIdea] = useState("");
  const [bp, setBp] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    "A WhatsApp-style chat app",
    "Video streaming like YouTube",
    "Uber for food delivery",
    "A Twitter-style news feed",
    "URL shortener like bit.ly",
    "Online multiplayer game",
  ];

  async function generate(text: string) {
    const trimmed = (text || idea).trim();
    if (!trimmed) return;
    setLoading(true);
    setBp(null);
    // Simulate a brief "designing" moment, then pick archetype blueprint
    await new Promise((r) => setTimeout(r, 600));
    setBp(pickBlueprint(trimmed));
    setLoading(false);
  }

  return (
    <div className="px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-black">🏗️ Design Generator</h2>
          <p className="text-xs text-muted-foreground">Describe an app — get an architecture blueprint</p>
        </div>
      </div>

      <div className="sw-glass rounded-2xl p-5 mb-5">
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="E.g., A global ride-sharing backend with a geo-spatial database and a pub-sub message queue for real-time tracking..."
          className="min-h-[90px] bg-transparent border-border resize-none text-sm mb-3"
        />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {examples.map((ex) => (
            <button key={ex}
              onClick={() => { setIdea(ex); generate(ex); }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent/20 border border-border text-muted-foreground hover:text-foreground transition-colors">
              {ex}
            </button>
          ))}
        </div>
        <Button onClick={() => generate(idea)} disabled={loading || !idea.trim()}
          className="text-white border-0 gap-2" style={{ background: "var(--grad-primary)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? "Designing..." : "Generate Blueprint"}
        </Button>
      </div>

      {loading && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <div className="text-4xl mb-3 sw-float">🧙‍♂️</div>
          The wizard is conjuring your architecture...
        </div>
      )}

      {bp && !loading && (
        <div className="sw-fade-up space-y-4">
          <div className="rounded-xl border border-purple-500/30 bg-[#0f0b1e] p-5">
            <div className="text-purple-300 font-bold mb-4">📐 {bp.name} — Architecture Blueprint</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bp.components.map((comp, i) => (
                <div key={i} className="rounded-lg border border-purple-500/25 bg-[#1a1230] p-3 text-center sw-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="text-2xl mb-1">{comp.icon}</div>
                  <div className="text-xs font-bold text-purple-100">{comp.name}</div>
                  <div className="text-[10px] text-purple-300/70 mt-0.5">{comp.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-bold text-sm mb-2">🔄 Request Flow</h3>
              <ol className="space-y-1.5">
                {bp.flow.map((f, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span> {f}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-bold text-sm mb-2">⚙️ Technology Choices</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Database:</strong> {bp.db}</div>
                <div><strong>Queue:</strong> {bp.queue}</div>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {bp.cdn && <Badge variant="secondary">🌍 CDN</Badge>}
                  {bp.realtime && <Badge variant="secondary">⚡ Real-time</Badge>}
                  {bp.geo && <Badge variant="secondary">🗺️ Geo-aware</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAskAI(`Explain the architecture for: ${bp.name}. Cover the ${bp.components.length} components, data flow, and trade-offs.`)}
                className="mt-3 w-full text-xs">
                🤖 Ask Rishi to explain this design
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
