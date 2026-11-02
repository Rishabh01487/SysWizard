/**
 * Generic Animation Generator — v2 (Multi-Stage Pipelines)
 *
 * Each topic now resolves to a PIPELINE: an explicit ordered list of 5-9
 * intermediate entities (DNS, TCP, TLS, LB, Gateway, Service, Cache, DB, ...)
 * that data really flows through. The animation then:
 *
 *   • Renders every intermediate node — not just start/end.
 *   • Walks the howItWorks[] narrative one stage at a time.
 *   • Highlights the active stage and the path leading to it.
 *   • Sends data packets that traverse the chain hop-by-hop so learners
 *     literally SEE the request ripple through every intermediate process.
 *
 * Topics without an explicit pipeline get a sensible default derived from
 * their howItWorks narrative.
 */
import {
  ServerNode, ClientNode, DatabaseNode, CacheNode, LoadBalancerNode, GatewayNode,
  ArrowConnection, DataPacket, TextLabel, COLORS, Entity, createEntity,
} from "./entities";
import type { AnimationEngine, AnimationStep } from "./AnimationEngine";
import type { FlatTopic } from "../topics/types";

type NodeKind =
  | "client" | "server" | "database" | "cache" | "loadbalancer" | "gateway";

interface PipelineNode {
  icon: NodeKind;
  label: string;
  /** Short role hint shown beneath the label, e.g. "TLS terminator" */
  role?: string;
}

type Layout =
  | "linear"        // horizontal left→right chain
  | "linear-bi"     // horizontal chain with return arrows
  | "tree"          // hub + leaves
  | "ring"          // circular
  | "compare"       // two sides
  | "triangle"      // three corners
  | "chain-vert"    // top→bottom vertical chain
  | "mesh";         // hub + leaves + peer links

interface Pipeline {
  layout: Layout;
  nodes: PipelineNode[];
  /** Optional labels for the connections between nodes (e.g. "publish", "ACK") */
  edgeLabels?: string[];
}

const N = (icon: NodeKind, label: string, role?: string): PipelineNode => ({ icon, label, role });

/* ------------------------------------------------------------------ */
/*  Per-topic explicit pipelines                                       */
/*  Each pipeline lists EVERY intermediate process in the real flow.   */
/* ------------------------------------------------------------------ */

const PIPELINES: Record<string, Pipeline> = {
  /* ---------- Fundamentals ---------- */
  "client-server": {
    layout: "linear-bi",
    nodes: [
      N("client", "Browser", "user agent"),
      N("loadbalancer", "DNS", "name lookup"),
      N("loadbalancer", "TCP/TLS", "handshake"),
      N("server", "Web Server", "accepts request"),
    ],
    edgeLabels: ["resolve", "connect", "send"],
  },
  "http-rest-apis": {
    layout: "linear",
    nodes: [
      N("client", "Client App", "calls endpoint"),
      N("loadbalancer", "DNS", "resolves host"),
      N("gateway", "API Gateway", "route + auth"),
      N("server", "Controller", "parses body"),
      N("server", "Service Layer", "business logic"),
      N("database", "Database", "persists"),
      N("cache", "Cache", "fast read"),
    ],
    edgeLabels: ["GET", "route", "validate", "process", "query", "lookup"],
  },
  "scaling": {
    layout: "tree",
    nodes: [
      N("loadbalancer", "Load Balancer", "distributes"),
      N("server", "Server 1", "instance"),
      N("server", "Server 2", "instance"),
      N("server", "Server 3", "instance"),
      N("server", "Server N", "auto-scaled"),
    ],
  },
  "latency-throughput": {
    layout: "linear",
    nodes: [
      N("client", "User", "perceives latency"),
      N("loadbalancer", "Network", "RTT"),
      N("gateway", "Gateway", "queue time"),
      N("server", "Service", "process time"),
      N("database", "Database", "query time"),
    ],
    edgeLabels: ["p50", "p95", "p99", "tail"],
  },
  "proxies": {
    layout: "linear",
    nodes: [
      N("client", "Client", "initiator"),
      N("loadbalancer", "Forward Proxy", "egress"),
      N("loadbalancer", "Firewall", "filters"),
      N("loadbalancer", "Reverse Proxy", "ingress"),
      N("server", "Origin Server", "responds"),
    ],
    edgeLabels: ["request", "filter", "route", "serve"],
  },
  "db-indexing": {
    layout: "chain-vert",
    nodes: [
      N("client", "Query", "SELECT ... WHERE"),
      N("loadbalancer", "Query Planner", "chooses plan"),
      N("server", "B-Tree Index", "lookup key"),
      N("database", "Data Pages", "fetch rows"),
      N("server", "Result Set", "assembled"),
    ],
    edgeLabels: ["parse", "seek", "fetch", "return"],
  },
  "sql-vs-nosql": {
    layout: "compare",
    nodes: [
      N("database", "SQL DB", "ACID · schema"),
      N("database", "NoSQL DB", "flexible · scale"),
    ],
  },
  "networking-basics": {
    layout: "linear",
    nodes: [
      N("client", "Source", "sender"),
      N("loadbalancer", "App Layer", "HTTP"),
      N("loadbalancer", "Transport", "TCP/UDP"),
      N("loadbalancer", "Network", "IP routing"),
      N("loadbalancer", "Link", "MAC/ethernet"),
      N("server", "Destination", "receiver"),
    ],
    edgeLabels: ["L7", "L4", "L3", "L2"],
  },
  "acid-transactions": {
    layout: "chain-vert",
    nodes: [
      N("client", "BEGIN", "start txn"),
      N("server", "Lock Manager", "row locks"),
      N("database", "Undo Log", "rollback info"),
      N("database", "Buffer Pool", "dirty pages"),
      N("server", "Redo Log (WAL)", "durable"),
      N("client", "COMMIT", "finalize"),
    ],
    edgeLabels: ["acquire", "write", "flush", "commit"],
  },
  "data-serialization": {
    layout: "linear",
    nodes: [
      N("client", "Producer", "in-memory obj"),
      N("server", "Serializer", "encode"),
      N("loadbalancer", "Wire Format", "JSON/Protobuf"),
      N("server", "Deserializer", "decode"),
      N("client", "Consumer", "in-memory obj"),
    ],
    edgeLabels: ["encode", "transmit", "decode"],
  },

  /* ---------- Core Infrastructure ---------- */
  "load-balancing": {
    layout: "tree",
    nodes: [
      N("client", "Clients", "incoming"),
      N("loadbalancer", "LB", "round-robin"),
      N("server", "Server A", "active"),
      N("server", "Server B", "active"),
      N("server", "Server C", "draining"),
      N("database", "Shared DB", "state"),
    ],
  },
  "caching": {
    layout: "linear",
    nodes: [
      N("client", "Client", "GET /x"),
      N("gateway", "CDN Edge", "edge cache"),
      N("cache", "App Cache", "in-memory"),
      N("cache", "Redis", "shared cache"),
      N("server", "Service", "compute"),
      N("database", "Database", "source of truth"),
    ],
    edgeLabels: ["edge", "L1", "L2", "miss", "fetch"],
  },
  "cdn": {
    layout: "tree",
    nodes: [
      N("client", "Viewers", "global"),
      N("cache", "Edge POP", "near user"),
      N("cache", "Regional Cache", "shield"),
      N("loadbalancer", "CDN Origin Shield", "protect"),
      N("server", "Origin", "source"),
    ],
  },
  "dns-resolution": {
    layout: "chain-vert",
    nodes: [
      N("client", "Browser", "needs IP"),
      N("loadbalancer", "Resolver", "stub"),
      N("loadbalancer", "Root", "root NS"),
      N("loadbalancer", "TLD", ".com NS"),
      N("loadbalancer", "Authoritative", "zone"),
      N("server", "IP Address", "resolved"),
    ],
    edgeLabels: ["ask", "referral", "referral", "answer"],
  },
  "api-gateway": {
    layout: "linear",
    nodes: [
      N("client", "Mobile App", "request"),
      N("gateway", "API Gateway", "entry"),
      N("gateway", "Auth & Rate Limit", "validate"),
      N("gateway", "Router", "dispatch"),
      N("server", "Service A", "orders"),
      N("server", "Service B", "billing"),
    ],
    edgeLabels: ["verify", "throttle", "route", "fan-out"],
  },
  "rate-limiting": {
    layout: "linear",
    nodes: [
      N("client", "Client", "bursty traffic"),
      N("gateway", "API Gateway", "front door"),
      N("cache", "Token Bucket", "Redis counter"),
      N("loadbalancer", "Limiter", "allow/deny"),
      N("server", "Backend", "protected"),
    ],
    edgeLabels: ["check", "consume", "decision"],
  },
  "db-sharding": {
    layout: "tree",
    nodes: [
      N("client", "Query", "sharded"),
      N("loadbalancer", "Shard Router", "hash(key)"),
      N("database", "Shard 1", "A-M"),
      N("database", "Shard 2", "N-Z"),
      N("database", "Shard 3", "overflow"),
    ],
  },
  "db-replication": {
    layout: "tree",
    nodes: [
      N("client", "Writes", "primary"),
      N("database", "Primary", "WAL"),
      N("database", "Replica 1", "sync"),
      N("database", "Replica 2", "async"),
      N("database", "Replica 3", "async"),
    ],
    edgeLabels: ["stream", "stream", "stream"],
  },
  "message-queues": {
    layout: "linear",
    nodes: [
      N("client", "Producer", "publish"),
      N("loadbalancer", "Broker", "topic"),
      N("cache", "Queue", "FIFO buffer"),
      N("server", "Consumer 1", "worker"),
      N("server", "Consumer 2", "worker"),
      N("database", "DLQ", "failures"),
    ],
    edgeLabels: ["enqueue", "dequeue", "ack", "dead"],
  },
  "reverse-proxy": {
    layout: "linear",
    nodes: [
      N("client", "Client", "request"),
      N("loadbalancer", "Reverse Proxy", "ingress"),
      N("loadbalancer", "TLS Termination", "decrypt"),
      N("loadbalancer", "Router", "path-based"),
      N("server", "Backend A", "served"),
      N("server", "Backend B", "served"),
    ],
    edgeLabels: ["TLS", "route", "proxy"],
  },

  /* ---------- Distributed Systems ---------- */
  "cap-theorem": {
    layout: "triangle",
    nodes: [
      N("server", "Consistency", "C"),
      N("server", "Availability", "A"),
      N("server", "Partition Tol.", "P"),
    ],
  },
  "consistent-hashing": {
    layout: "ring",
    nodes: [
      N("server", "Node A", "0°-120°"),
      N("server", "Node B", "120°-240°"),
      N("server", "Node C", "240°-360°"),
      N("server", "Node D", "replica"),
      N("server", "Node E", "replica"),
    ],
  },
  "consensus-raft": {
    layout: "ring",
    nodes: [
      N("server", "Leader", "term 5"),
      N("server", "Follower 1", "committed"),
      N("server", "Follower 2", "committed"),
      N("server", "Follower 3", "lagging"),
      N("server", "Candidate", "election"),
    ],
  },
  "leader-election": {
    layout: "ring",
    nodes: [
      N("server", "Node 1", "candidate"),
      N("server", "Node 2", "follower"),
      N("server", "Node 3", "leader"),
      N("server", "Node 4", "follower"),
      N("server", "Node 5", "candidate"),
    ],
  },
  "gossip-protocol": {
    layout: "ring",
    nodes: [
      N("server", "Node A", "seed"),
      N("server", "Node B", "peer"),
      N("server", "Node C", "peer"),
      N("server", "Node D", "peer"),
      N("server", "Node E", "peer"),
    ],
  },
  "vector-clocks": {
    layout: "ring",
    nodes: [
      N("server", "Node A", "[1,0,0]"),
      N("server", "Node B", "[0,1,0]"),
      N("server", "Node C", "[0,0,1]"),
    ],
  },
  "distributed-txn": {
    layout: "tree",
    nodes: [
      N("server", "Coordinator", "2PC"),
      N("database", "Service A", "prepare"),
      N("database", "Service B", "prepare"),
      N("database", "Service C", "prepare"),
    ],
    edgeLabels: ["prepare", "prepare", "prepare"],
  },
  "quorum": {
    layout: "ring",
    nodes: [
      N("server", "Node 1", "vote"),
      N("server", "Node 2", "vote"),
      N("server", "Node 3", "vote"),
      N("server", "Node 4", "vote"),
      N("server", "Node 5", "vote"),
    ],
  },
  "split-brain": {
    layout: "ring",
    nodes: [
      N("server", "Partition A", "leader"),
      N("server", "Node A2", "follower"),
      N("server", "Node A3", "follower"),
      N("server", "Partition B", "leader"),
      N("server", "Node B2", "follower"),
    ],
  },
  "heartbeat": {
    layout: "tree",
    nodes: [
      N("server", "Leader", "ping"),
      N("server", "Follower 1", "ack"),
      N("server", "Follower 2", "ack"),
      N("server", "Follower 3", "timeout"),
      N("cache", "Monitor", "alert"),
    ],
  },

  /* ---------- Communication ---------- */
  "websockets": {
    layout: "linear-bi",
    nodes: [
      N("client", "Browser", "client"),
      N("loadbalancer", "HTTP Upgrade", "101"),
      N("server", "WS Server", "persistent"),
      N("cache", "Pub/Sub", "broadcast"),
      N("server", "Other Client", "peer"),
    ],
    edgeLabels: ["upgrade", "frame", "push"],
  },
  "grpc": {
    layout: "linear-bi",
    nodes: [
      N("client", "gRPC Client", "stub"),
      N("loadbalancer", "HTTP/2", "multiplexed"),
      N("server", "gRPC Server", "service"),
      N("server", "Interceptor", "auth/log"),
      N("database", "Backend", "data"),
    ],
    edgeLabels: ["call", "respond", "stream"],
  },
  "graphql": {
    layout: "linear",
    nodes: [
      N("client", "Client", "query"),
      N("gateway", "GraphQL Server", "parse"),
      N("server", "Resolvers", "per field"),
      N("server", "DataLoader", "batch"),
      N("database", "DB A", "data"),
      N("database", "DB B", "data"),
      N("server", "API C", "external"),
    ],
    edgeLabels: ["validate", "resolve", "batch", "fetch"],
  },
  "api-design": {
    layout: "linear",
    nodes: [
      N("client", "Consumer", "request"),
      N("gateway", "Versioning", "/v1"),
      N("gateway", "Auth", "Bearer"),
      N("server", "Handler", "logic"),
      N("database", "Store", "persist"),
      N("client", "Response", "JSON"),
    ],
    edgeLabels: ["route", "authn", "exec", "respond"],
  },
  "pubsub": {
    layout: "linear",
    nodes: [
      N("server", "Publisher", "emit"),
      N("loadbalancer", "Topic", "channel"),
      N("cache", "Message Log", "durable"),
      N("server", "Subscriber A", "react"),
      N("server", "Subscriber B", "react"),
      N("server", "Subscriber C", "react"),
    ],
    edgeLabels: ["publish", "store", "fan-out"],
  },

  /* ---------- Data Storage ---------- */
  "bloom-filters": {
    layout: "chain-vert",
    nodes: [
      N("client", "Item", "to check"),
      N("server", "Hash Fns", "k hashes"),
      N("cache", "Bit Array", "m bits"),
      N("server", "Maybe / No", "decision"),
      N("database", "Real Store", "lookup"),
    ],
    edgeLabels: ["hash", "probe", "filter"],
  },
  "lsm-trees": {
    layout: "chain-vert",
    nodes: [
      N("client", "Write", "incoming"),
      N("cache", "MemTable", "in-memory"),
      N("cache", "WAL", "durable"),
      N("server", "SSTable L0", "flushed"),
      N("server", "SSTable L1", "compacted"),
      N("server", "SSTable L2", "compacted"),
    ],
    edgeLabels: ["insert", "log", "flush", "compact"],
  },
  "mapreduce": {
    layout: "tree",
    nodes: [
      N("database", "Input", "HDFS split"),
      N("server", "Mapper 1", "map"),
      N("server", "Mapper 2", "map"),
      N("server", "Mapper 3", "map"),
      N("cache", "Shuffle", "by key"),
      N("server", "Reducer", "aggregate"),
      N("database", "Output", "HDFS"),
    ],
  },
  "wal": {
    layout: "chain-vert",
    nodes: [
      N("client", "Write", "incoming"),
      N("cache", "WAL Buffer", "in-mem"),
      N("database", "WAL Log", "fsync'd"),
      N("cache", "Buffer Pool", "dirty"),
      N("database", "Data Page", "checkpoint"),
    ],
    edgeLabels: ["append", "fsync", "apply", "flush"],
  },
  "object-storage": {
    layout: "linear",
    nodes: [
      N("client", "App", "PUT object"),
      N("gateway", "S3 API", "REST"),
      N("loadbalancer", "Auth", "Sig v4"),
      N("server", "Object Store", "metadata"),
      N("database", "Placement DB", "where"),
      N("server", "Erasure Nodes", "data"),
    ],
    edgeLabels: ["auth", "metadata", "place", "replicate"],
  },
  "data-partitioning": {
    layout: "tree",
    nodes: [
      N("client", "Query", "routed"),
      N("loadbalancer", "Partitioner", "key→P"),
      N("database", "P1", "range A"),
      N("database", "P2", "range B"),
      N("database", "P3", "range C"),
    ],
  },

  /* ---------- Patterns ---------- */
  "microservices": {
    layout: "tree",
    nodes: [
      N("gateway", "API Gateway", "entry"),
      N("server", "Orders Svc", "domain"),
      N("server", "Billing Svc", "domain"),
      N("server", "Inventory Svc", "domain"),
      N("server", "Notify Svc", "domain"),
      N("cache", "Service Mesh", "sidecars"),
    ],
  },
  "event-driven": {
    layout: "linear",
    nodes: [
      N("server", "Event Source", "emit"),
      N("loadbalancer", "Event Bus", "Kafka"),
      N("cache", "Event Store", "log"),
      N("server", "Processor 1", "react"),
      N("server", "Processor 2", "react"),
      N("database", "Projection", "read model"),
    ],
    edgeLabels: ["produce", "persist", "consume", "project"],
  },
  "cqrs": {
    layout: "linear",
    nodes: [
      N("client", "Command", "write"),
      N("server", "Write Model", "validate"),
      N("database", "Write DB", "normalized"),
      N("cache", "Event Bus", "sync"),
      N("server", "Read Model", "denormalized"),
      N("database", "Read DB", "optimized"),
      N("client", "Query", "read"),
    ],
    edgeLabels: ["write", "emit", "sync", "project", "read"],
  },
  "service-discovery": {
    layout: "ring",
    nodes: [
      N("server", "Service A", "register"),
      N("server", "Service B", "register"),
      N("cache", "Registry", "Consul"),
      N("client", "Consumer", "lookup"),
      N("loadbalancer", "Load Balancer", "subscribe"),
    ],
  },
  "circuit-breaker": {
    layout: "linear",
    nodes: [
      N("client", "Client", "call"),
      N("loadbalancer", "Circuit Breaker", "guard"),
      N("cache", "Failure Counter", "state"),
      N("server", "Service", "may fail"),
      N("cache", "Fallback", "cache/graceful"),
    ],
    edgeLabels: ["check", "call", "fallback"],
  },
  "saga-pattern": {
    layout: "linear",
    nodes: [
      N("server", "Step 1", "create order"),
      N("server", "Step 2", "charge payment"),
      N("server", "Step 3", "reserve stock"),
      N("server", "Step 4", "ship"),
      N("cache", "Compensations", "rollback"),
    ],
    edgeLabels: ["success", "success", "success", "success"],
  },
  "sidecar-pattern": {
    layout: "mesh",
    nodes: [
      N("server", "Service A", "logic"),
      N("cache", "Sidecar A", "proxy"),
      N("cache", "Sidecar B", "proxy"),
      N("server", "Service B", "logic"),
    ],
  },
  "backpressure": {
    layout: "linear",
    nodes: [
      N("client", "Producer", "fast"),
      N("loadbalancer", "Flow Control", "rate"),
      N("cache", "Buffer", "bounded queue"),
      N("server", "Consumer", "slow"),
    ],
    edgeLabels: ["emit", "queue", "drain"],
  },

  /* ---------- Security / Performance ---------- */
  "auth": {
    layout: "linear",
    nodes: [
      N("client", "User", "login"),
      N("gateway", "Auth Service", "verify"),
      N("cache", "Session Store", "Redis"),
      N("server", "Resource API", "guarded"),
      N("database", "User DB", "credentials"),
    ],
    edgeLabels: ["login", "issue token", "verify", "fetch"],
  },
  "ssl-tls": {
    layout: "linear-bi",
    nodes: [
      N("client", "Client", "hello"),
      N("loadbalancer", "TLS Handshake", "negotiate"),
      N("loadbalancer", "Cert Exchange", "X.509"),
      N("loadbalancer", "Key Derivation", "ECDHE"),
      N("server", "Server", "encrypted"),
    ],
    edgeLabels: ["ClientHello", "ServerHello", "Finished", "App Data"],
  },
  "idempotency": {
    layout: "linear",
    nodes: [
      N("client", "Client", "retry"),
      N("gateway", "API", "idempotency-key"),
      N("cache", "Idempotency Store", "Redis"),
      N("server", "Handler", "check"),
      N("database", "Effect DB", "applied"),
    ],
    edgeLabels: ["header", "lookup", "execute", "store"],
  },
  "fault-tolerance": {
    layout: "tree",
    nodes: [
      N("loadbalancer", "LB", "health-check"),
      N("server", "Primary", "active"),
      N("server", "Replica", "hot-standby"),
      N("cache", "Circuit Breaker", "guard"),
      N("server", "Fallback", "degraded"),
    ],
  },
  "distributed-tracing": {
    layout: "linear",
    nodes: [
      N("client", "Client", "trace-id"),
      N("gateway", "API Gateway", "span 1"),
      N("server", "Service A", "span 2"),
      N("server", "Service B", "span 3"),
      N("database", "DB Call", "span 4"),
      N("cache", "Collector", "Jaeger"),
    ],
    edgeLabels: ["inject", "span", "span", "span", "report"],
  },
  "autoscaling": {
    layout: "tree",
    nodes: [
      N("cache", "Metrics", "CPU/QPS"),
      N("loadbalancer", "Autoscaler", "decide"),
      N("server", "Instance 1", "running"),
      N("server", "Instance 2", "running"),
      N("server", "Instance 3", "scaling up"),
    ],
  },
  "pagination": {
    layout: "linear",
    nodes: [
      N("client", "Client", "?page=2"),
      N("gateway", "API", "validate"),
      N("server", "Service", "compute offset"),
      N("database", "DB", "LIMIT/OFFSET"),
      N("cache", "Cursor", "keyset"),
      N("client", "Response", "page"),
    ],
    edgeLabels: ["parse", "build query", "execute", "encode"],
  },

  /* ---------- Real-World Systems ---------- */
  "url-shortener": {
    layout: "linear",
    nodes: [
      N("client", "User", "shorten"),
      N("gateway", "API", "validate URL"),
      N("server", "Hash Gen", "base62"),
      N("cache", "Cache", "lookup"),
      N("database", "KV Store", "persist"),
      N("server", "Redirect", "301"),
    ],
    edgeLabels: ["encode", "check", "store", "redirect"],
  },
  "chat-system": {
    layout: "linear-bi",
    nodes: [
      N("client", "User A", "send"),
      N("server", "Chat Svc", "route"),
      N("cache", "Presence", "online"),
      N("cache", "Message Queue", "deliver"),
      N("server", "Push Svc", "notify"),
      N("client", "User B", "receive"),
    ],
    edgeLabels: ["send", "store", "deliver", "push"],
  },
  "news-feed": {
    layout: "linear",
    nodes: [
      N("client", "User", "post"),
      N("server", "Post Svc", "store"),
      N("cache", "Fanout Worker", "write to timelines"),
      N("cache", "Timeline Cache", "Redis"),
      N("server", "Ranking", "score"),
      N("client", "Feed", "rendered"),
    ],
    edgeLabels: ["ingest", "fan-out", "rank", "serve"],
  },
  "video-streaming": {
    layout: "tree",
    nodes: [
      N("client", "Viewer", "play"),
      N("cache", "CDN Edge", "HLS chunk"),
      N("server", "Transcoder", "ABR ladders"),
      N("database", "Origin Storage", "master"),
      N("server", "Ad Insert", "midroll"),
    ],
  },
  "payment-system": {
    layout: "linear",
    nodes: [
      N("client", "Buyer", "checkout"),
      N("gateway", "Merchant API", "create intent"),
      N("server", "Payment Svc", "validate"),
      N("server", "Gateway Bank", "route"),
      N("database", "Ledger", "double-entry"),
      N("cache", "Webhook", "notify"),
    ],
    edgeLabels: ["intent", "auth", "capture", "ledger"],
  },
  "notification-system": {
    layout: "linear",
    nodes: [
      N("server", "Event Source", "trigger"),
      N("server", "Notify Svc", "render"),
      N("cache", "Channel Queue", "priority"),
      N("server", "Push Gateway", "APNs/FCM"),
      N("server", "Email Gateway", "SES"),
      N("client", "Device", "deliver"),
    ],
    edgeLabels: ["enqueue", "dispatch", "deliver"],
  },
  "search-engine": {
    layout: "linear",
    nodes: [
      N("client", "Query", "search"),
      N("gateway", "API", "parse"),
      N("server", "Tokenizer", "analyze"),
      N("cache", "Inverted Index", "postings"),
      N("server", "Ranker", "BM25"),
      N("client", "Results", "ranked"),
    ],
    edgeLabels: ["analyze", "lookup", "score", "render"],
  },
  "design-process": {
    layout: "linear",
    nodes: [
      N("client", "Requirements", "clarify"),
      N("server", "Capacity", "estimate"),
      N("server", "High-Level", "diagram"),
      N("server", "Deep Dive", "components"),
      N("server", "Bottlenecks", "trade-offs"),
      N("client", "Final Design", "deliver"),
    ],
    edgeLabels: ["define", "estimate", "draft", "refine"],
  },

  /* ---------- Algorithms ---------- */
  "binary-search": {
    layout: "chain-vert",
    nodes: [
      N("client", "Sorted Array", "input"),
      N("server", "Low Ptr", "0"),
      N("server", "Mid", "(low+high)/2"),
      N("server", "High Ptr", "n-1"),
      N("cache", "Compare", "arr[mid] vs x"),
      N("client", "Found", "index"),
    ],
    edgeLabels: ["init", "compute", "compare", "narrow"],
  },
  "sorting-algorithms": {
    layout: "chain-vert",
    nodes: [
      N("client", "Unsorted", "input"),
      N("server", "Choose Pivot", "partition"),
      N("server", "Partition", "< pivot | > pivot"),
      N("server", "Recurse", "sub-arrays"),
      N("server", "Merge", "combine"),
      N("client", "Sorted", "output"),
    ],
    edgeLabels: ["pick", "split", "recurse", "merge"],
  },
  "graph-algorithms": {
    layout: "ring",
    nodes: [
      N("server", "Start Node", "source"),
      N("server", "Neighbor 1", "edge"),
      N("server", "Neighbor 2", "edge"),
      N("server", "Visited", "set"),
      N("server", "Queue/Stack", "frontier"),
      N("server", "Target", "found"),
    ],
  },
  "hash-tables": {
    layout: "chain-vert",
    nodes: [
      N("client", "Key", "input"),
      N("server", "Hash Function", "h(k)"),
      N("cache", "Bucket Array", "slots"),
      N("server", "Collision Chain", "linked list"),
      N("client", "Value", "found"),
    ],
    edgeLabels: ["hash", "index", "resolve"],
  },
  "trees": {
    layout: "tree",
    nodes: [
      N("server", "Root", "top"),
      N("server", "Left Child", "L"),
      N("server", "Right Child", "R"),
      N("server", "Leaf A", "terminal"),
      N("server", "Leaf B", "terminal"),
    ],
  },
  "dynamic-programming": {
    layout: "chain-vert",
    nodes: [
      N("client", "Problem", "decompose"),
      N("server", "Sub-problem", "smaller"),
      N("cache", "Memo Table", "store"),
      N("server", "Recurrence", "optimal"),
      N("client", "Solution", "combine"),
    ],
    edgeLabels: ["break", "memoize", "recur", "build"],
  },
  "two-pointers": {
    layout: "linear",
    nodes: [
      N("server", "Left Ptr", "i=0"),
      N("server", "Window", "expand/contract"),
      N("server", "Right Ptr", "j=n-1"),
      N("client", "Optimal Pair", "found"),
    ],
    edgeLabels: ["advance", "shrink", "check"],
  },
  "recursion-backtracking": {
    layout: "tree",
    nodes: [
      N("server", "Choice", "try"),
      N("server", "Explore", "recurse"),
      N("server", "Constraint", "valid?"),
      N("server", "Backtrack", "undo"),
      N("client", "Solution", "found"),
    ],
  },
  "bit-manipulation": {
    layout: "chain-vert",
    nodes: [
      N("client", "Input Bits", "0011"),
      N("server", "Mask", "0100"),
      N("server", "AND/OR/XOR", "operate"),
      N("server", "Shift", "<< / >>"),
      N("client", "Result Bits", "0111"),
    ],
    edgeLabels: ["mask", "op", "shift"],
  },
  "concurrency": {
    layout: "mesh",
    nodes: [
      N("server", "Thread A", "producer"),
      N("cache", "Lock", "mutex"),
      N("server", "Thread B", "consumer"),
      N("cache", "Condition Var", "signal"),
    ],
  },

  /* ---------- Expanded design topics ---------- */
  "connection-pooling": {
    layout: "linear",
    nodes: [
      N("client", "App", "needs DB"),
      N("cache", "Pool", "borrow"),
      N("cache", "Idle Conn", "reuse"),
      N("loadbalancer", "Max Limit", "gate"),
      N("database", "Database", "TCP conn"),
    ],
    edgeLabels: ["acquire", "reuse", "throttle", "execute"],
  },
  "webhooks": {
    layout: "linear-bi",
    nodes: [
      N("server", "Service", "event"),
      N("loadbalancer", "Webhook URL", "POST"),
      N("gateway", "Your API", "receiver"),
      N("cache", "Verify Sig", "HMAC"),
      N("server", "Handler", "process"),
      N("cache", "Retry Queue", "backoff"),
    ],
    edgeLabels: ["trigger", "deliver", "verify", "ack"],
  },
  "cdc": {
    layout: "linear",
    nodes: [
      N("database", "DB Log", "WAL/binlog"),
      N("server", "CDC Connector", "Debezium"),
      N("cache", "Kafka Topic", "stream"),
      N("server", "Consumer 1", "search index"),
      N("server", "Consumer 2", "cache"),
      N("server", "Consumer 3", "warehouse"),
    ],
    edgeLabels: ["tail", "publish", "consume", "sync"],
  },
  "stream-processing": {
    layout: "linear",
    nodes: [
      N("server", "Source", "events"),
      N("cache", "Stream Buffer", "Kafka"),
      N("server", "Operator: map", "transform"),
      N("server", "Operator: filter", "select"),
      N("server", "Window", "aggregation"),
      N("server", "Sink", "output"),
    ],
    edgeLabels: ["ingest", "transform", "filter", "aggregate", "emit"],
  },
  "zero-trust": {
    layout: "linear",
    nodes: [
      N("client", "User", "request"),
      N("loadbalancer", "Identity", "verify"),
      N("loadbalancer", "Device Posture", "check"),
      N("gateway", "Policy Engine", "decide"),
      N("server", "Service", "least-privilege"),
      N("cache", "Audit Log", "logged"),
    ],
    edgeLabels: ["authN", "device", "authZ", "audit"],
  },
  "data-warehouse": {
    layout: "linear",
    nodes: [
      N("database", "Sources", "OLTP"),
      N("server", "ETL", "extract"),
      N("server", "Staging", "clean"),
      N("database", "Warehouse", "columnar"),
      N("server", "Cube / OLAP", "model"),
      N("client", "BI Dashboard", "query"),
    ],
    edgeLabels: ["extract", "transform", "load", "model", "query"],
  },
  "oauth-flows": {
    layout: "linear",
    nodes: [
      N("client", "Client App", "request"),
      N("server", "Auth Server", "authorize"),
      N("cache", "Auth Code", "short-lived"),
      N("server", "Token Endpoint", "exchange"),
      N("cache", "Access Token", "JWT"),
      N("server", "Resource API", "call"),
    ],
    edgeLabels: ["redirect", "code", "exchange", "call"],
  },
  "ml-systems": {
    layout: "linear",
    nodes: [
      N("database", "Raw Data", "warehouse"),
      N("server", "Feature Store", "featurize"),
      N("server", "Training", "fit model"),
      N("cache", "Model Registry", "versioned"),
      N("server", "Inference Svc", "online"),
      N("client", "Prediction", "serve"),
    ],
    edgeLabels: ["featurize", "train", "register", "deploy", "predict"],
  },
  "paxos": {
    layout: "ring",
    nodes: [
      N("server", "Proposer", "propose"),
      N("server", "Acceptor 1", "promise"),
      N("server", "Acceptor 2", "promise"),
      N("server", "Acceptor 3", "accept"),
      N("server", "Learner", "decide"),
    ],
  },
  "byzantine-fault-tolerance": {
    layout: "ring",
    nodes: [
      N("server", "Node 1", "honest"),
      N("server", "Node 2", "honest"),
      N("server", "Node 3", "byzantine"),
      N("server", "Node 4", "honest"),
      N("server", "Node 5", "honest"),
    ],
  },
  "two-phase-commit": {
    layout: "tree",
    nodes: [
      N("server", "Coordinator", "2PC"),
      N("database", "Participant 1", "prepare"),
      N("database", "Participant 2", "prepare"),
      N("database", "Participant 3", "prepare"),
    ],
    edgeLabels: ["prepare", "prepare", "prepare"],
  },
  "three-phase-commit": {
    layout: "tree",
    nodes: [
      N("server", "Coordinator", "3PC"),
      N("database", "Participant 1", "canCommit"),
      N("database", "Participant 2", "preCommit"),
      N("database", "Participant 3", "doCommit"),
    ],
  },
  "distributed-locks": {
    layout: "ring",
    nodes: [
      N("server", "Client 1", "acquire"),
      N("server", "Client 2", "wait"),
      N("cache", "Lock Svc", "Redlock"),
      N("server", "Client 3", "wait"),
      N("server", "Client 4", "fence"),
    ],
  },
  "mvcc-multi-version-concurrency": {
    layout: "chain-vert",
    nodes: [
      N("client", "Txn T1", "snapshot"),
      N("database", "Version Chain", "v1→v2→v3"),
      N("cache", "Snapshot ID", "xmin/xmax"),
      N("server", "Visibility", "check"),
      N("client", "Consistent Read", "no lock"),
    ],
    edgeLabels: ["snapshot", "chain", "visible"],
  },
  "bplus-trees": {
    layout: "chain-vert",
    nodes: [
      N("client", "Query", "key=x"),
      N("server", "Root", "internal"),
      N("server", "Internal Node", "guide"),
      N("server", "Leaf Page", "data"),
      N("database", "Linked Leaves", "range scan"),
    ],
    edgeLabels: ["descend", "descend", "find", "scan"],
  },
  "skip-lists": {
    layout: "chain-vert",
    nodes: [
      N("client", "Lookup", "key"),
      N("server", "Top Level", "sparse"),
      N("server", "Mid Level", "skip"),
      N("server", "Bottom Level", "full"),
      N("client", "Found", "node"),
    ],
    edgeLabels: ["skip", "skip", "land"],
  },
  "trie-radix-tree": {
    layout: "tree",
    nodes: [
      N("server", "Root", "ε"),
      N("server", "Node 'a'", "child"),
      N("server", "Node 'ap'", "child"),
      N("server", "Node 'app'", "child"),
      N("server", "Leaf 'apple'", "word"),
    ],
  },
  "hyperloglog": {
    layout: "chain-vert",
    nodes: [
      N("client", "Stream", "events"),
      N("server", "Hash", "h(x)"),
      N("cache", "Registers", "m buckets"),
      N("server", "Leading Zeros", "rank"),
      N("client", "Cardinality", "~estimate"),
    ],
    edgeLabels: ["hash", "register", "rank", "harmonic"],
  },
  "count-min-sketch": {
    layout: "chain-vert",
    nodes: [
      N("client", "Item", "stream"),
      N("server", "k Hash Fns", "h1..hk"),
      N("cache", "Counters", "k × m"),
      N("server", "Min Estimate", "frequency"),
      N("client", "Heavy Hitter", "top-k"),
    ],
    edgeLabels: ["hash", "increment", "min"],
  },
  "sstable-lsm-compaction": {
    layout: "chain-vert",
    nodes: [
      N("cache", "MemTable", "in-mem"),
      N("server", "SSTable L0", "flushed"),
      N("server", "L1", "size-tiered"),
      N("server", "L2", "leveled"),
      N("server", "L3", "compacted"),
    ],
    edgeLabels: ["flush", "compact", "compact", "compact"],
  },
  "cache-strategies": {
    layout: "compare",
    nodes: [
      N("cache", "Write-Through", "sync"),
      N("cache", "Write-Back", "async"),
    ],
  },
  "cache-invalidation": {
    layout: "linear",
    nodes: [
      N("client", "Write", "to DB"),
      N("server", "Invalidate Event", "publish"),
      N("cache", "Cache", "evict"),
      N("server", "Read", "miss"),
      N("database", "Refresh", "from DB"),
    ],
    edgeLabels: ["event", "evict", "miss", "refresh"],
  },
  "cache-stampede-thundering-herd": {
    layout: "linear",
    nodes: [
      N("client", "Many Clients", "miss"),
      N("cache", "Cache", "expired"),
      N("server", "Singleflight", "coalesce"),
      N("database", "DB", "1 query"),
      N("cache", "Refill", "all served"),
    ],
    edgeLabels: ["miss", "coalesce", "fetch", "refill"],
  },
  "hot-keys-hot-partitions": {
    layout: "linear",
    nodes: [
      N("client", "Hot Key", "skewed"),
      N("loadbalancer", "Detector", "monitor"),
      N("cache", "Replicate Hot", "fan-out"),
      N("server", "Shard A", "overloaded"),
      N("server", "Shard B", "underused"),
    ],
    edgeLabels: ["detect", "replicate", "redirect"],
  },
  "read-repair-hinted-handoff": {
    layout: "ring",
    nodes: [
      N("database", "Node A", "up"),
      N("database", "Node B", "down"),
      N("database", "Node C", "up"),
      N("cache", "Hint Store", "for B"),
      N("server", "Read Repair", "sync"),
    ],
  },
  "memcached-vs-redis": {
    layout: "compare",
    nodes: [
      N("cache", "Memcached", "simple/LRU"),
      N("cache", "Redis", "rich/persistent"),
    ],
  },
  "http2-multiplexing": {
    layout: "linear",
    nodes: [
      N("client", "Browser", "many reqs"),
      N("loadbalancer", "HTTP/2 Conn", "1 TCP"),
      N("server", "Streams", "multiplexed"),
      N("server", "HPACK", "headers"),
      N("server", "Server Push", "anticipate"),
    ],
    edgeLabels: ["frames", "streams", "push"],
  },
  "http3-quic": {
    layout: "linear",
    nodes: [
      N("client", "Browser", "request"),
      N("loadbalancer", "QUIC", "UDP"),
      N("loadbalancer", "TLS 1.3", "0-RTT"),
      N("server", "Streams", "no HOL blocking"),
      N("server", "Connection Migration", "IP change"),
    ],
    edgeLabels: ["UDP", "encrypt", "stream", "migrate"],
  },
  "mtls": {
    layout: "linear-bi",
    nodes: [
      N("client", "Client", "cert"),
      N("loadbalancer", "mTLS Handshake", "verify both"),
      N("gateway", "Cert Authority", "internal CA"),
      N("server", "Server", "cert"),
      N("cache", "Cert Rotation", "auto"),
    ],
    edgeLabels: ["present", "verify", "trust", "rotate"],
  },
  "ddos-protection-waf": {
    layout: "linear",
    nodes: [
      N("client", "Attacker", "flood"),
      N("gateway", "CDN Edge", "absorb"),
      N("loadbalancer", "WAF", "rules"),
      N("cache", "Rate Limit", "per IP"),
      N("loadbalancer", "Geo Block", "deny"),
      N("server", "Origin", "protected"),
    ],
    edgeLabels: ["scrub", "filter", "throttle", "block"],
  },
  "event-sourcing": {
    layout: "chain-vert",
    nodes: [
      N("client", "Command", "intent"),
      N("server", "Validate", "domain"),
      N("database", "Event Store", "append-only"),
      N("server", "Projector", "build view"),
      N("cache", "Read Model", "snapshot"),
      N("client", "Query", "served"),
    ],
    edgeLabels: ["append", "replay", "project", "snapshot"],
  },
  "outbox-pattern": {
    layout: "linear",
    nodes: [
      N("server", "Service", "tx"),
      N("database", "DB Txn", "ACID"),
      N("database", "Outbox Table", "same txn"),
      N("server", "CDC Publisher", "tail"),
      N("cache", "Message Bus", "Kafka"),
      N("server", "Consumers", "at-least-once"),
    ],
    edgeLabels: ["insert+outbox", "tail", "publish", "consume"],
  },
  "bff-backend-for-frontend": {
    layout: "linear",
    nodes: [
      N("client", "Mobile UI", "tailored"),
      N("server", "BFF", "mobile"),
      N("server", "Aggregator", "fan-out"),
      N("server", "Service A", "domain"),
      N("server", "Service B", "domain"),
      N("database", "DBs", "shared"),
    ],
    edgeLabels: ["request", "fan-out", "aggregate", "respond"],
  },
  "strangler-fig-pattern": {
    layout: "linear",
    nodes: [
      N("client", "Traffic", "users"),
      N("loadbalancer", "Router", "feature flag"),
      N("server", "New Service", "strangler"),
      N("server", "Old Monolith", "legacy"),
      N("gateway", "Anti-Corruption", "adapter"),
    ],
    edgeLabels: ["route", "new", "old", "migrate"],
  },
  "service-mesh": {
    layout: "mesh",
    nodes: [
      N("server", "Service A", "logic"),
      N("cache", "Sidecar A", "Envoy"),
      N("cache", "Control Plane", "Istio"),
      N("cache", "Sidecar B", "Envoy"),
      N("server", "Service B", "logic"),
    ],
  },
  "cell-based-architecture": {
    layout: "tree",
    nodes: [
      N("loadbalancer", "Cell Router", "sticky"),
      N("server", "Cell 1", "self-contained"),
      N("server", "Cell 2", "self-contained"),
      N("server", "Cell 3", "self-contained"),
      N("cache", "Global Services", "shared"),
    ],
  },
  "multi-region-deployment": {
    layout: "tree",
    nodes: [
      N("loadbalancer", "Global LB", "geo-DNS"),
      N("server", "Region US", "active"),
      N("server", "Region EU", "active"),
      N("server", "Region APAC", "active"),
      N("database", "Replication", "async/sync"),
    ],
  },
  "disaster-recovery": {
    layout: "linear",
    nodes: [
      N("server", "Primary Site", "live"),
      N("cache", "Backup", "scheduled"),
      N("server", "Pilot Light", "warm"),
      N("server", "Warm Standby", "scaled-down"),
      N("server", "Multi-Site", "active-active"),
      N("client", "RTO/RPO", "objective"),
    ],
    edgeLabels: ["backup", "restore", "scale", "failover"],
  },
  "serverless-architecture": {
    layout: "linear",
    nodes: [
      N("client", "Client", "request"),
      N("gateway", "API GW", "trigger"),
      N("server", "Function", "FaaS"),
      N("cache", "Cold Start", "first ms"),
      N("server", "BaaS", "managed"),
      N("database", "DB", "state"),
    ],
    edgeLabels: ["invoke", "spawn", "call", "respond"],
  },
  "vector-databases": {
    layout: "linear",
    nodes: [
      N("client", "Query Vector", "embedding"),
      N("server", "Index", "HNSW/IVF"),
      N("database", "Vector Store", "high-dim"),
      N("server", "ANN Search", "approx"),
      N("client", "Top-K", "matches"),
    ],
    edgeLabels: ["embed", "search", "rank", "return"],
  },
  "timeseries-databases": {
    layout: "linear",
    nodes: [
      N("server", "Ingest", "high-rate"),
      N("database", "TSDB", "columnar"),
      N("cache", "Downsample", "rollups"),
      N("server", "Retention", "expire"),
      N("client", "Query", "range/agg"),
    ],
    edgeLabels: ["write", "compress", "downsample", "query"],
  },
  "graph-databases": {
    layout: "mesh",
    nodes: [
      N("server", "Node A", "vertex"),
      N("server", "Node B", "vertex"),
      N("server", "Node C", "vertex"),
      N("cache", "Edge AB", "relationship"),
      N("cache", "Edge BC", "relationship"),
    ],
  },
  "columnar-databases": {
    layout: "chain-vert",
    nodes: [
      N("client", "OLAP Query", "aggregate"),
      N("server", "Planner", "vectorized"),
      N("database", "Column Store", "compressed"),
      N("cache", "Vectorized Exec", "SIMD"),
      N("client", "Result", "fast scan"),
    ],
    edgeLabels: ["plan", "scan", "exec", "return"],
  },

  /* ---------- Full-stack topics ---------- */
  "react-fundamentals": {
    layout: "tree",
    nodes: [
      N("client", "App Root", "<App>"),
      N("client", "Component A", "props/state"),
      N("client", "Component B", "hooks"),
      N("client", "Virtual DOM", "diff"),
      N("client", "DOM", "real"),
    ],
  },
  "react-server-components": {
    layout: "linear",
    nodes: [
      N("server", "Server", "DB access"),
      N("server", "RSC Payload", "streamed"),
      N("client", "Client Component", "interactive"),
      N("client", "Browser", "hydrate"),
    ],
    edgeLabels: ["render", "stream", "hydrate"],
  },
  "virtual-dom": {
    layout: "chain-vert",
    nodes: [
      N("client", "State Change", "trigger"),
      N("client", "New VDOM", "render"),
      N("client", "Diff", "reconcile"),
      N("client", "Patches", "minimal"),
      N("client", "Real DOM", "updated"),
    ],
    edgeLabels: ["render", "diff", "patch"],
  },
  "hydration": {
    layout: "linear",
    nodes: [
      N("server", "Server Render", "HTML"),
      N("client", "Browser", "paint"),
      N("client", "JS Bundle", "download"),
      N("client", "Hydrate", "attach handlers"),
      N("client", "Interactive", "ready"),
    ],
    edgeLabels: ["SSR", "ship", "hydrate", "ready"],
  },
  "ssr-csr-ssg-isr": {
    layout: "compare",
    nodes: [
      N("server", "SSR/ISR", "server-rendered"),
      N("client", "CSR", "client-rendered"),
    ],
  },
  "nextjs-architecture": {
    layout: "tree",
    nodes: [
      N("server", "App Router", "file-based"),
      N("server", "Layout", "shared"),
      N("server", "Page", "route"),
      N("server", "Route Handler", "/api"),
      N("server", "Middleware", "edge"),
      N("server", "Server Action", "mutation"),
    ],
  },
  "state-management": {
    layout: "tree",
    nodes: [
      N("client", "Store", "single source"),
      N("client", "Reducer", "pure"),
      N("client", "Actions", "dispatch"),
      N("client", "Selectors", "memoized"),
      N("client", "Components", "subscribed"),
    ],
  },
  "react-query-swr": {
    layout: "linear",
    nodes: [
      N("client", "Component", "useQuery"),
      N("cache", "Query Cache", "dedup"),
      N("server", "Fetcher", "API"),
      N("client", "Stale-While-Revalidate", "SWR"),
      N("client", "UI", "fresh data"),
    ],
    edgeLabels: ["subscribe", "fetch", "cache", "render"],
  },
  "suspense-concurrent": {
    layout: "chain-vert",
    nodes: [
      N("client", "useTransition", "pending"),
      N("client", "Suspense Boundary", "fallback"),
      N("server", "Async Resource", "load"),
      N("client", "Concurrent Render", "interruptible"),
      N("client", "Commit", "when ready"),
    ],
    edgeLabels: ["suspend", "load", "resume", "commit"],
  },
  "forms-validation": {
    layout: "linear",
    nodes: [
      N("client", "User Input", "field"),
      N("client", "Form State", "controlled"),
      N("server", "Schema", "Zod/Yup"),
      N("client", "Errors", "messages"),
      N("server", "Submit", "API"),
    ],
    edgeLabels: ["input", "validate", "error", "submit"],
  },
  "css-architecture": {
    layout: "compare",
    nodes: [
      N("client", "BEM/CSS Modules", "scoped"),
      N("client", "Tailwind", "utility"),
    ],
  },
  "css-grid-flexbox": {
    layout: "compare",
    nodes: [
      N("client", "Grid", "2D layout"),
      N("client", "Flexbox", "1D layout"),
    ],
  },
  "css-animations": {
    layout: "chain-vert",
    nodes: [
      N("client", "Trigger", "hover/click"),
      N("client", "Transition", "property"),
      N("client", "Transform", "GPU"),
      N("client", "Composite", "60fps"),
      N("client", "Paint", "screen"),
    ],
    edgeLabels: ["trigger", "animate", "composite"],
  },
  "design-systems": {
    layout: "tree",
    nodes: [
      N("client", "Design Tokens", "foundation"),
      N("client", "Theme", "light/dark"),
      N("client", "Components", "library"),
      N("client", "Patterns", "composition"),
      N("client", "Apps", "consistent"),
    ],
  },
  "web-workers": {
    layout: "linear-bi",
    nodes: [
      N("client", "Main Thread", "UI"),
      N("client", "postMessage", "serialize"),
      N("server", "Worker Thread", "compute"),
      N("server", "Offscreen Canvas", "render"),
      N("client", "Result", "back"),
    ],
    edgeLabels: ["post", "compute", "return"],
  },
  "service-workers": {
    layout: "linear",
    nodes: [
      N("client", "Page", "fetch"),
      N("server", "Service Worker", "intercept"),
      N("cache", "Cache API", "store"),
      N("server", "Network", "fallback"),
      N("client", "Response", "served"),
    ],
    edgeLabels: ["intercept", "cache", "network", "respond"],
  },
  "webassembly": {
    layout: "linear",
    nodes: [
      N("server", "Rust/C++", "source"),
      N("server", "Compiler", "wasm"),
      N("client", "Browser", "load .wasm"),
      N("client", "WASM Runtime", "near-native"),
      N("client", "DOM Bridge", "JS interop"),
    ],
    edgeLabels: ["compile", "fetch", "instantiate", "call"],
  },
  "web-components": {
    layout: "tree",
    nodes: [
      N("client", "Custom Element", "<my-card>"),
      N("client", "Shadow DOM", "encapsulated"),
      N("client", "HTML Template", "<template>"),
      N("client", "Slots", "projected"),
      N("client", "Page", "used"),
    ],
  },
  "micro-frontends": {
    layout: "tree",
    nodes: [
      N("client", "Shell App", "host"),
      N("client", "MFE Catalog", "remote"),
      N("client", "MFE Cart", "remote"),
      N("client", "MFE Account", "remote"),
      N("client", "Module Federation", "runtime"),
    ],
  },
  "progressive-web-apps": {
    layout: "linear",
    nodes: [
      N("client", "Browser", "visit"),
      N("server", "Service Worker", "register"),
      N("cache", "Manifest", "installable"),
      N("cache", "Offline Cache", "PWA"),
      N("client", "Home Screen", "launch"),
    ],
    edgeLabels: ["register", "install", "cache", "launch"],
  },
  "web-storage": {
    layout: "tree",
    nodes: [
      N("client", "Origin", "scoped"),
      N("cache", "localStorage", "5MB sync"),
      N("cache", "sessionStorage", "tab"),
      N("database", "IndexedDB", "async large"),
      N("cache", "Cookies", "HTTP"),
    ],
  },
  "server-sent-events": {
    layout: "linear",
    nodes: [
      N("server", "Server", "events"),
      N("server", "SSE Stream", "text/event-stream"),
      N("client", "EventSource", "auto-reconnect"),
      N("client", "Listener", "onmessage"),
      N("client", "UI", "update"),
    ],
    edgeLabels: ["open", "push", "deliver"],
  },
  "long-polling": {
    layout: "linear-bi",
    nodes: [
      N("client", "Client", "request"),
      N("server", "Server Hold", "pending"),
      N("server", "Event Available", "release"),
      N("client", "Response", "data"),
      N("client", "Re-poll", "loop"),
    ],
    edgeLabels: ["hold", "release", "respond", "re-poll"],
  },
  "webrtc": {
    layout: "mesh",
    nodes: [
      N("client", "Peer A", "media"),
      N("server", "Signaling", "exchange"),
      N("server", "STUN/TURN", "NAT"),
      N("client", "Peer B", "media"),
      N("cache", "Data Channel", "P2P"),
    ],
  },
  "webtransport-http3": {
    layout: "linear-bi",
    nodes: [
      N("client", "Browser", "WebTransport"),
      N("loadbalancer", "QUIC", "UDP"),
      N("server", "Server", "sessions"),
      N("cache", "Datagrams", "unreliable"),
      N("cache", "Streams", "reliable"),
    ],
    edgeLabels: ["connect", "session", "datagram", "stream"],
  },
  "core-web-vitals": {
    layout: "linear",
    nodes: [
      N("client", "User", "load"),
      N("client", "LCP", "largest paint"),
      N("client", "INP", "interaction"),
      N("client", "CLS", "layout shift"),
      N("server", "Search Rank", "Google"),
    ],
    edgeLabels: ["measure", "measure", "measure", "rank"],
  },
  "bundle-size-tree-shaking": {
    layout: "linear",
    nodes: [
      N("server", "Source", "modules"),
      N("server", "Bundler", "webpack/vite"),
      N("server", "Tree Shaking", "ESM static"),
      N("server", "Code Split", "chunks"),
      N("client", "Browser", "smaller"),
    ],
    edgeLabels: ["bundle", "shake", "split", "ship"],
  },
  "lazy-loading-code-splitting": {
    layout: "linear",
    nodes: [
      N("client", "Route", "navigate"),
      N("client", "React.lazy", "import()"),
      N("client", "Suspense", "fallback"),
      N("server", "Fetch Chunk", "dynamic"),
      N("client", "Render", "ready"),
    ],
    edgeLabels: ["lazy", "suspend", "fetch", "render"],
  },
  "image-optimization": {
    layout: "linear",
    nodes: [
      N("server", "Source Image", "raw"),
      N("server", "Encoder", "WebP/AVIF"),
      N("server", "Responsive", "srcset"),
      N("cache", "CDN", "transform"),
      N("client", "Browser", "lazy"),
    ],
    edgeLabels: ["encode", "resize", "serve", "decode"],
  },
  "font-optimization": {
    layout: "chain-vert",
    nodes: [
      N("server", "Font File", "woff2"),
      N("client", "preload", "hint"),
      N("client", "font-display", "swap"),
      N("client", "FOUT/FOIT", "fallback"),
      N("client", "Variable Font", "one file"),
    ],
    edgeLabels: ["preload", "swap", "render"],
  },
  "critical-rendering-path": {
    layout: "chain-vert",
    nodes: [
      N("server", "HTML", "bytes"),
      N("client", "DOM", "parsed"),
      N("server", "CSS", "bytes"),
      N("client", "CSSOM", "parsed"),
      N("client", "Render Tree", "visible"),
      N("client", "Layout→Paint→Comp", "pixels"),
    ],
    edgeLabels: ["parse", "parse", "merge", "render"],
  },
  "rendering-performance": {
    layout: "chain-vert",
    nodes: [
      N("client", "JS", "rAF"),
      N("client", "Style", "recalc"),
      N("client", "Layout", "reflow"),
      N("client", "Paint", "repaint"),
      N("client", "Composite", "GPU"),
      N("client", "Screen", "60fps"),
    ],
    edgeLabels: ["style", "layout", "paint", "composite"],
  },
  "frontend-testing": {
    layout: "tree",
    nodes: [
      N("server", "Test Suite", "CI"),
      N("server", "Unit (Jest)", "functions"),
      N("server", "Integration (RTL)", "components"),
      N("server", "E2E (Playwright)", "flows"),
      N("server", "Visual", "snapshots"),
    ],
  },
  "frontend-accessibility": {
    layout: "linear",
    nodes: [
      N("client", "Semantic HTML", "structure"),
      N("client", "ARIA", "labels"),
      N("client", "Keyboard", "tab order"),
      N("client", "Focus Mgmt", "visible"),
      N("client", "Screen Reader", "announce"),
    ],
    edgeLabels: ["semantics", "aria", "keyboard", "announce"],
  },
  "internationalization-i18n": {
    layout: "linear",
    nodes: [
      N("client", "User Locale", "navigator"),
      N("client", "i18n Lib", "i18next"),
      N("cache", "Translation Files", "JSON"),
      N("client", "Formatter", "date/num"),
      N("client", "RTL/LTR", "direction"),
    ],
    edgeLabels: ["detect", "load", "format", "render"],
  },
  "seo-essentials": {
    layout: "linear",
    nodes: [
      N("server", "Meta Tags", "title/desc"),
      N("server", "Structured Data", "schema.org"),
      N("server", "Sitemap", "XML"),
      N("server", "Robots.txt", "crawl"),
      N("server", "SSR", "crawlable"),
      N("server", "Search Engine", "indexed"),
    ],
    edgeLabels: ["meta", "schema", "crawl", "index"],
  },
  "frontend-security": {
    layout: "linear",
    nodes: [
      N("client", "User Input", "untrusted"),
      N("gateway", "CSP", "policy"),
      N("gateway", "SRI", "integrity"),
      N("server", "Sanitize", "escape"),
      N("server", "Trusted Types", " enforced"),
    ],
    edgeLabels: ["CSP", "SRI", "sanitize", "trust"],
  },
  "bff-pattern": {
    layout: "linear",
    nodes: [
      N("client", "Mobile UI", "tailored"),
      N("server", "BFF", "mobile"),
      N("server", "Aggregator", "fan-out"),
      N("server", "Service A", "domain"),
      N("server", "Service B", "domain"),
    ],
    edgeLabels: ["request", "fan-out", "aggregate", "respond"],
  },
  "api-clients": {
    layout: "linear",
    nodes: [
      N("client", "App", "call"),
      N("client", "Client Lib", "fetch/axios"),
      N("client", "Interceptor", "auth/retry"),
      N("server", "API", "endpoint"),
      N("client", "Response", "typed"),
    ],
    edgeLabels: ["build", "intercept", "send", "parse"],
  },
  "webhooks-vs-api": {
    layout: "compare",
    nodes: [
      N("server", "Webhooks", "push"),
      N("client", "API Polling", "pull"),
    ],
  },
  "serverless-faas": {
    layout: "linear",
    nodes: [
      N("client", "Event", "trigger"),
      N("gateway", "API GW", "route"),
      N("server", "Function", "spawn"),
      N("cache", "Cold Start", "ms"),
      N("database", "BaaS", "state"),
      N("client", "Response", "return"),
    ],
    edgeLabels: ["trigger", "spawn", "run", "respond"],
  },
  "edge-computing": {
    layout: "tree",
    nodes: [
      N("client", "Users", "global"),
      N("server", "Edge POP", "near"),
      N("server", "Edge Function", "V8 isolate"),
      N("cache", "Edge Cache", "KV"),
      N("server", "Origin", "fallback"),
    ],
  },
  "jwt-auth": {
    layout: "linear",
    nodes: [
      N("client", "Client", "login"),
      N("server", "Auth Server", "verify"),
      N("cache", "JWT", "header.payload.sig"),
      N("client", "Store", "cookie/localStorage"),
      N("server", "API", "verify sig"),
      N("server", "Resource", "allow"),
    ],
    edgeLabels: ["issue", "store", "send", "verify"],
  },
  "session-cookies": {
    layout: "linear",
    nodes: [
      N("client", "Browser", "login"),
      N("server", "Auth Service", "validate"),
      N("cache", "Session Store", "server-side"),
      N("client", "Set-Cookie", "HttpOnly"),
      N("server", "Subsequent Req", "cookie"),
    ],
    edgeLabels: ["login", "create", "set", "verify"],
  },
  "oauth-oidc": {
    layout: "linear",
    nodes: [
      N("client", "App", "redirect"),
      N("server", "Auth Server", "OAuth2"),
      N("server", "IDP", "OIDC"),
      N("cache", "ID Token", "identity"),
      N("cache", "Access Token", "API"),
      N("server", "Resource", "call"),
    ],
    edgeLabels: ["auth", "consent", "tokens", "call"],
  },

  /* ---------- Software Engineering topics ---------- */
  "sdlc": {
    layout: "linear",
    nodes: [
      N("client", "Requirements", "gather"),
      N("server", "Design", "architecture"),
      N("server", "Implementation", "code"),
      N("server", "Testing", "QA"),
      N("server", "Deployment", "ship"),
      N("server", "Maintenance", "operate"),
    ],
    edgeLabels: ["plan", "build", "test", "ship", "run"],
  },
  "agile-scrum": {
    layout: "linear",
    nodes: [
      N("client", "Backlog", "stories"),
      N("server", "Sprint Plan", "commit"),
      N("server", "Sprint", "2 weeks"),
      N("server", "Daily Standup", "sync"),
      N("server", "Review", "demo"),
      N("server", "Retrospective", "improve"),
    ],
    edgeLabels: ["plan", "execute", "sync", "demo", "reflect"],
  },
  "kanban": {
    layout: "linear",
    nodes: [
      N("client", "Backlog", "queue"),
      N("server", "To Do", "WIP"),
      N("server", "In Progress", "WIP"),
      N("server", "Review", "WIP"),
      N("server", "Done", "flow"),
    ],
    edgeLabels: ["pull", "pull", "pull", "pull"],
  },
  "extreme-programming": {
    layout: "ring",
    nodes: [
      N("server", "TDD", "test-first"),
      N("server", "Pair Prog", "2 devs"),
      N("server", "CI", "integrate"),
      N("server", "Refactor", "improve"),
      N("server", "Simple Design", "YAGNI"),
    ],
  },
  "waterfall-vs-agile": {
    layout: "compare",
    nodes: [
      N("server", "Waterfall", "sequential"),
      N("server", "Agile", "iterative"),
    ],
  },
  "tdd-bdd": {
    layout: "linear",
    nodes: [
      N("server", "Red", "write test fail"),
      N("server", "Green", "make pass"),
      N("server", "Refactor", "clean"),
      N("server", "Behavior", "Given-When-Then"),
      N("server", "Living Docs", "spec"),
    ],
    edgeLabels: ["red", "green", "refactor", "spec"],
  },
  "ddd-domain-driven-design": {
    layout: "tree",
    nodes: [
      N("server", "Bounded Context", "boundary"),
      N("server", "Aggregate", "consistency"),
      N("server", "Entity", "identity"),
      N("server", "Value Object", "immutable"),
      N("server", "Domain Event", "fact"),
    ],
  },
  "clean-architecture": {
    layout: "ring",
    nodes: [
      N("server", "Entities", "core"),
      N("server", "Use Cases", "application"),
      N("server", "Controllers", "interface"),
      N("server", "Frameworks", "outer"),
      N("cache", "Dependency Rule", "inward"),
    ],
  },
  "solid-principles": {
    layout: "ring",
    nodes: [
      N("server", "SRP", "single resp"),
      N("server", "OCP", "open/closed"),
      N("server", "LSP", "Liskov"),
      N("server", "ISP", "interface seg"),
      N("server", "DIP", "dependency inv"),
    ],
  },
  "dry-kiss-yagni": {
    layout: "ring",
    nodes: [
      N("server", "DRY", "no repeat"),
      N("server", "KISS", "simple"),
      N("server", "YAGNI", "no future"),
      N("server", "AHA", "optimize"),
    ],
  },
  "creational-patterns": {
    layout: "tree",
    nodes: [
      N("server", "Creational", "group"),
      N("server", "Singleton", "1 instance"),
      N("server", "Factory", "create"),
      N("server", "Builder", "step"),
      N("server", "Prototype", "clone"),
    ],
  },
  "structural-patterns": {
    layout: "tree",
    nodes: [
      N("server", "Structural", "group"),
      N("server", "Adapter", "convert"),
      N("server", "Decorator", "wrap"),
      N("server", "Facade", "simplify"),
      N("server", "Proxy", "control"),
    ],
  },
  "behavioral-patterns": {
    layout: "tree",
    nodes: [
      N("server", "Behavioral", "group"),
      N("server", "Strategy", "swap"),
      N("server", "Observer", "subscribe"),
      N("server", "Command", "encapsulate"),
      N("server", "State", "transition"),
    ],
  },
  "dependency-injection": {
    layout: "linear",
    nodes: [
      N("server", "Container", "IoC"),
      N("server", "Bind Interface", "to impl"),
      N("server", "Resolve", "inject"),
      N("server", "Service", "uses"),
      N("server", "Lifetime", "scoped"),
    ],
    edgeLabels: ["bind", "resolve", "inject", "use"],
  },
  "refactoring-code-smells": {
    layout: "linear",
    nodes: [
      N("server", "Code Smell", "detected"),
      N("server", "Long Method", "extract"),
      N("server", "God Class", "split"),
      N("server", "Shotgun Surgery", "consolidate"),
      N("server", "Refactored", "clean"),
    ],
    edgeLabels: ["detect", "smell", "refactor", "clean"],
  },
  "technical-debt": {
    layout: "linear",
    nodes: [
      N("server", "Pressure", "ship fast"),
      N("server", "Shortcut", "taken"),
      N("cache", "Debt Accrued", "interest"),
      N("server", "Refactor Sprint", "pay down"),
      N("server", "Healthy Code", "sustained"),
    ],
    edgeLabels: ["shortcut", "accrue", "pay", "sustain"],
  },
  "git-workflow-gitflow": {
    layout: "tree",
    nodes: [
      N("server", "main", "release"),
      N("server", "develop", "integration"),
      N("server", "feature/*", "branch"),
      N("server", "release/*", "stabilize"),
      N("server", "hotfix/*", "patch"),
    ],
  },
  "code-review": {
    layout: "linear",
    nodes: [
      N("server", "Author", "PR"),
      N("server", "CI Checks", "auto"),
      N("server", "Reviewer", "comments"),
      N("server", "Address", "iterate"),
      N("server", "Merge", "ship"),
    ],
    edgeLabels: ["open", "lint", "review", "merge"],
  },
  "pair-programming": {
    layout: "linear-bi",
    nodes: [
      N("server", "Driver", "types"),
      N("server", "Navigator", "reviews"),
      N("server", "Swap", "rotate"),
      N("server", "Mob", "team"),
    ],
    edgeLabels: ["drive", "navigate", "swap"],
  },
  "semantic-versioning": {
    layout: "linear",
    nodes: [
      N("server", "MAJOR", "breaking"),
      N("server", "MINOR", "feature"),
      N("server", "PATCH", "fix"),
      N("server", "Pre-release", "alpha"),
      N("server", "Build", "meta"),
    ],
    edgeLabels: ["bump", "bump", "bump", "tag"],
  },
  "release-management": {
    layout: "linear",
    nodes: [
      N("server", "Release Train", "scheduled"),
      N("server", "Feature Freeze", "stabilize"),
      N("server", "RC", "candidate"),
      N("server", "Canary", "subset"),
      N("server", "GA", "all users"),
    ],
    edgeLabels: ["freeze", "RC", "canary", "GA"],
  },
  "testing-pyramid": {
    layout: "triangle",
    nodes: [
      N("server", "Unit (many)", "fast"),
      N("server", "Integration (some)", "medium"),
      N("server", "E2E (few)", "slow"),
    ],
  },
  "contract-testing": {
    layout: "linear",
    nodes: [
      N("server", "Consumer", "expectations"),
      N("server", "Contract", "Pact"),
      N("server", "Broker", "shared"),
      N("server", "Provider", "verify"),
      N("server", "Compatible", "deploy"),
    ],
    edgeLabels: ["generate", "publish", "verify", "deploy"],
  },
  "mocking-stubbing": {
    layout: "tree",
    nodes: [
      N("server", "Test Double", "fake"),
      N("server", "Dummy", "placeholder"),
      N("server", "Stub", "canned"),
      N("server", "Spy", "record"),
      N("server", "Mock", "expectations"),
    ],
  },
  "load-testing": {
    layout: "linear",
    nodes: [
      N("client", "Load Generator", "k6/JMeter"),
      N("server", "Target API", "under test"),
      N("cache", "Metrics", "latency"),
      N("server", "Stress", "beyond capacity"),
      N("server", "Soak", "long-run"),
      N("server", "Spike", "burst"),
    ],
    edgeLabels: ["ramp", "measure", "stress", "soak", "spike"],
  },
  "ci-cd-pipelines": {
    layout: "linear",
    nodes: [
      N("server", "Push", "git"),
      N("server", "Build", "compile"),
      N("server", "Test", "auto"),
      N("server", "Package", "image"),
      N("server", "Deploy Staging", "preview"),
      N("server", "Deploy Prod", "ship"),
    ],
    edgeLabels: ["build", "test", "package", "stage", "prod"],
  },
  "containerization-docker": {
    layout: "chain-vert",
    nodes: [
      N("server", "Dockerfile", "recipe"),
      N("server", "Build Context", "files"),
      N("server", "Image Layers", "cached"),
      N("server", "Registry", "push"),
      N("server", "Container", "running"),
    ],
    edgeLabels: ["build", "layer", "push", "run"],
  },
  "kubernetes-orchestration": {
    layout: "tree",
    nodes: [
      N("server", "Control Plane", "API"),
      N("server", "Deployment", "desired"),
      N("server", "Pod", "container"),
      N("server", "Service", "network"),
      N("server", "Ingress", "expose"),
    ],
  },
  "infrastructure-as-code": {
    layout: "linear",
    nodes: [
      N("server", "Terraform HCL", "declarative"),
      N("server", "Plan", "preview"),
      N("server", "Apply", "provision"),
      N("cache", "State File", "drift"),
      N("server", "Cloud Resources", "managed"),
    ],
    edgeLabels: ["plan", "apply", "track", "manage"],
  },
  "feature-flags": {
    layout: "linear",
    nodes: [
      N("client", "User", "request"),
      N("server", "App", "check flag"),
      N("cache", "Flag Service", "LaunchDarkly"),
      N("server", "Variant", "on/off"),
      N("client", "Experience", "A/B"),
    ],
    edgeLabels: ["check", "evaluate", "serve", "track"],
  },
  "deployment-strategies": {
    layout: "linear",
    nodes: [
      N("server", "Blue", "old"),
      N("server", "Green", "new"),
      N("loadbalancer", "Switch", "router"),
      N("server", "Canary", "10%"),
      N("server", "Rolling", "batch"),
      N("server", "Shadow", "mirror"),
    ],
    edgeLabels: ["deploy", "switch", "canary", "roll", "mirror"],
  },
  "observability-three-pillars": {
    layout: "ring",
    nodes: [
      N("server", "Logs", "events"),
      N("server", "Metrics", "numbers"),
      N("server", "Traces", "spans"),
      N("cache", "Context", "correlation"),
    ],
  },
  "monitoring-metrics": {
    layout: "linear",
    nodes: [
      N("server", "App", "instrumented"),
      N("server", "Exporter", "scrape"),
      N("cache", "Prometheus", "TSDB"),
      N("server", "Grafana", "dashboard"),
      N("server", "Alert", "PagerDuty"),
    ],
    edgeLabels: ["emit", "scrape", "store", "alert"],
  },
  "structured-logging": {
    layout: "linear",
    nodes: [
      N("server", "App", "log JSON"),
      N("server", "Shipper", "Fluentd"),
      N("cache", "Loki/ES", "store"),
      N("server", "Query", "Kibana"),
      N("cache", "Correlation ID", "trace"),
    ],
    edgeLabels: ["ship", "store", "query", "trace"],
  },
  "sre-sli-slo-sla": {
    layout: "linear",
    nodes: [
      N("server", "SLI", "indicator"),
      N("server", "SLO", "objective"),
      N("server", "Error Budget", "remaining"),
      N("server", "SLA", "contract"),
      N("server", "Penalty", "if breached"),
    ],
    edgeLabels: ["measure", "target", "budget", "contract"],
  },
  "incident-management": {
    layout: "linear",
    nodes: [
      N("cache", "Alert", "fired"),
      N("server", "On-Call", "respond"),
      N("server", "Severity", "classify"),
      N("server", "Mitigate", "stabilize"),
      N("server", "Resolve", "fix"),
      N("server", "Postmortem", "blameless"),
    ],
    edgeLabels: ["alert", "respond", "classify", "fix", "learn"],
  },
  "chaos-engineering": {
    layout: "linear",
    nodes: [
      N("server", "Steady State", "baseline"),
      N("server", "Hypothesis", "expect"),
      N("server", "Inject Fault", "Gremlin"),
      N("server", "Observe", "behavior"),
      N("server", "Improve", "resilience"),
    ],
    edgeLabels: ["baseline", "hypothesis", "inject", "learn"],
  },
  "api-documentation-openapi": {
    layout: "linear",
    nodes: [
      N("server", "Spec", "OpenAPI YAML"),
      N("server", "Lint", "spectral"),
      N("server", "Codegen", "clients"),
      N("server", "Swagger UI", "docs"),
      N("server", "Mock Server", "dev"),
    ],
    edgeLabels: ["spec", "lint", "codegen", "serve"],
  },
  "technical-documentation": {
    layout: "tree",
    nodes: [
      N("server", "Diátaxis", "framework"),
      N("server", "Tutorials", "learning"),
      N("server", "How-To", "goals"),
      N("server", "Reference", "info"),
      N("server", "Explanation", "understanding"),
    ],
  },
  "twelve-factor-app": {
    layout: "tree",
    nodes: [
      N("server", "Codebase", "1 repo"),
      N("server", "Dependencies", "explicit"),
      N("server", "Config", "env vars"),
      N("server", "Backing Services", "disposable"),
      N("server", "Processes", "stateless"),
      N("server", "Disposability", "fast"),
    ],
  },
  "developer-portals-backstage": {
    layout: "tree",
    nodes: [
      N("server", "Backstage", "portal"),
      N("server", "Software Catalog", "registry"),
      N("server", "Templates", "golden path"),
      N("server", "Plugins", "extensible"),
      N("server", "Docs", "TechDocs"),
    ],
  },
  "api-versioning": {
    layout: "linear",
    nodes: [
      N("server", "v1 API", "old"),
      N("server", "Deprecation", "notice"),
      N("server", "Sunset Header", "date"),
      N("server", "v2 API", "new"),
      N("server", "Migration", "guide"),
    ],
    edgeLabels: ["deprecate", "sunset", "migrate", "retire"],
  },
  "error-handling-resilience": {
    layout: "linear",
    nodes: [
      N("client", "Request", "call"),
      N("server", "Timeout", "deadline"),
      N("server", "Retry", "backoff"),
      N("server", "Jitter", "spread"),
      N("server", "Circuit Breaker", "fail fast"),
      N("server", "Bulkhead", "isolate"),
    ],
    edgeLabels: ["timeout", "retry", "jitter", "break", "isolate"],
  },
  "concurrency-patterns": {
    layout: "mesh",
    nodes: [
      N("server", "Producer", "queue"),
      N("cache", "Channel", "buffered"),
      N("server", "Worker Pool", "N goroutines"),
      N("server", "Fan-Out", "parallel"),
      N("server", "Fan-In", "merge"),
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Default pipeline generator                                         */
/*  For topics without an explicit pipeline, derive a 6-stage          */
/*  chain from the howItWorks narrative.                               */
/* ------------------------------------------------------------------ */

const DEFAULT_NODE_ICONS: NodeKind[] = [
  "client", "loadbalancer", "gateway", "server", "cache", "database",
];

function deriveDefaultPipeline(topic: FlatTopic): Pipeline {
  const stages = (topic.content?.howItWorks || []).slice(0, 6);
  const n = Math.max(5, Math.min(stages.length + 1, 7));
  const nodes: PipelineNode[] = [];
  for (let i = 0; i < n; i++) {
    const icon = DEFAULT_NODE_ICONS[Math.min(i, DEFAULT_NODE_ICONS.length - 1)];
    let label = `Stage ${i + 1}`;
    let role: string | undefined;
    if (i === 0) { label = "Input"; role = "source"; }
    else if (i === n - 1) { label = "Output"; role = "result"; }
    else if (stages[i - 1]) {
      const txt = stages[i - 1].replace(/<[^>]+>/g, "").trim();
      label = deriveShortLabel(txt);
      role = `step ${i}`;
    }
    nodes.push(N(icon, label, role));
  }
  return { layout: "linear", nodes };
}

function deriveShortLabel(text: string): string {
  const firstClause = text.split(/[,:;.(\-]/)[0].trim();
  if (!firstClause) return "Step";
  if (firstClause.length <= 22) return firstClause;
  const words = firstClause.split(/\s+/).slice(0, 3).join(" ");
  return words.length <= 22 ? words : firstClause.slice(0, 20).trim() + "…";
}

/* ------------------------------------------------------------------ */
/*  Layout computation                                                 */
/* ------------------------------------------------------------------ */

interface BuiltNode { entity: Entity; index: number; }

function buildPipeline(
  engine: AnimationEngine,
  pipeline: Pipeline,
  cx: number,
  cy: number,
): { nodes: BuiltNode[]; connections: ArrowConnection[] } {
  const built: BuiltNode[] = [];
  const connections: ArrowConnection[] = [];
  const { layout, nodes } = pipeline;
  const W = engine.width;
  const H = engine.height;
  const nodeCount = nodes.length;

  const place = (icon: NodeKind, x: number, y: number, label: string, role?: string) => {
    const e = createEntity(icon, x, y, label);
    if (role) (e as Entity & { description?: string }).description = role;
    engine.addEntity(e);
    built.push({ entity: e, index: built.length });
    return e;
  };

  const link = (from: Entity, to: Entity, opts: Partial<{ color: string; activeColor: string; label: string; bidirectional: boolean }> = {}) => {
    const conn = new ArrowConnection(from, to, {
      color: opts.color || "rgba(168,85,247,0.18)",
      activeColor: opts.activeColor || COLORS.accent,
      label: opts.label,
      bidirectional: opts.bidirectional,
    });
    engine.addConnection(conn);
    connections.push(conn);
    return conn;
  };

  if (layout === "linear" || layout === "linear-bi") {
    const padX = 90;
    const usable = Math.max(400, W - padX * 2);
    const spacing = nodeCount > 1 ? Math.min(180, usable / (nodeCount - 1)) : 0;
    const startX = cx - ((nodeCount - 1) * spacing) / 2;
    nodes.forEach((n, i) => place(n.icon, startX + i * spacing, cy, n.label, n.role));
    for (let i = 0; i < built.length - 1; i++) {
      const elabel = pipeline.edgeLabels?.[i] || "";
      link(built[i].entity, built[i + 1].entity, { label: elabel });
      if (layout === "linear-bi") {
        link(built[i + 1].entity, built[i].entity, {
          color: "rgba(34,211,238,0.12)", activeColor: COLORS.client, label: "",
        });
      }
    }
  } else if (layout === "chain-vert") {
    const padY = 60;
    const usable = Math.max(300, H - padY * 2);
    const spacing = nodeCount > 1 ? Math.min(120, usable / (nodeCount - 1)) : 0;
    const startY = cy - ((nodeCount - 1) * spacing) / 2;
    nodes.forEach((n, i) => place(n.icon, cx, startY + i * spacing, n.label, n.role));
    for (let i = 0; i < built.length - 1; i++) {
      const elabel = pipeline.edgeLabels?.[i] || "";
      link(built[i].entity, built[i + 1].entity, {
        color: "rgba(245,158,11,0.18)", activeColor: COLORS.warning, label: elabel,
      });
    }
  } else if (layout === "tree") {
    const hub = nodes[0];
    const hubE = place(hub.icon, cx, cy - 60, hub.label, hub.role);
    const radius = Math.min(220, W / 4);
    for (let i = 1; i < nodeCount; i++) {
      const n = nodes[i];
      const angle = ((i - 1) / Math.max(1, nodeCount - 1)) * Math.PI - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy - 60 + Math.sin(angle) * radius * 0.85;
      const e = place(n.icon, x, y, n.label, n.role);
      link(hubE, e);
    }
  } else if (layout === "mesh") {
    const count = nodeCount;
    const radius = Math.min(180, W / 5);
    nodes.forEach((n, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      place(n.icon, x, y, n.label, n.role);
    });
    for (let i = 0; i < built.length; i++) {
      for (let j = i + 1; j < built.length; j++) {
        if (Math.abs(i - j) === 1 || Math.abs(i - j) === built.length - 1) {
          link(built[i].entity, built[j].entity);
        }
      }
    }
  } else if (layout === "ring") {
    const radius = Math.min(170, W / 5);
    nodes.forEach((n, i) => {
      const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      place(n.icon, x, y, n.label, n.role);
    });
    for (let i = 0; i < built.length; i++) {
      const next = (i + 1) % built.length;
      link(built[i].entity, built[next].entity);
    }
  } else if (layout === "compare") {
    const left = nodes[0];
    const right = nodes[1] || nodes[0];
    place(left.icon, cx - 180, cy, left.label, left.role);
    place(right.icon, cx + 180, cy, right.label, right.role);
  } else if (layout === "triangle") {
    const radius = Math.min(140, W / 6);
    const pts = [
      { x: cx, y: cy - radius, n: nodes[0] },
      { x: cx - radius, y: cy + radius * 0.6, n: nodes[1] || nodes[0] },
      { x: cx + radius, y: cy + radius * 0.6, n: nodes[2] || nodes[0] },
    ];
    pts.forEach((p) => place(p.n.icon, p.x, p.y, p.n.label, p.n.role));
    for (let i = 0; i < 3; i++) {
      link(built[i].entity, built[(i + 1) % 3].entity);
    }
  }

  return { nodes: built, connections };
}

/* ------------------------------------------------------------------ */
/*  Step helpers                                                       */
/* ------------------------------------------------------------------ */

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

function deriveStepTitle(text: string): string {
  const clean = stripHtml(text).trim();
  const firstClause = clean.split(/[,:;.()]/)[0].trim();
  return firstClause.length > 0 && firstClause.length <= 48
    ? firstClause
    : clean.slice(0, 42).trim();
}

/**
 * Sends a packet that traverses the chain hop-by-hop from `fromIdx` to `toIdx`.
 * Each intermediate hop is animated sequentially so the viewer sees the
 * packet ripple through every entity, not just start→end.
 */
function sendMultiHopPacket(
  engine: AnimationEngine,
  nodes: BuiltNode[],
  fromIdx: number,
  toIdx: number,
  opts: Partial<{ color: string; label: string; speed: number }> = {},
) {
  if (nodes.length < 2) return;
  const lo = Math.min(fromIdx, toIdx);
  const hi = Math.max(fromIdx, toIdx);
  if (lo === hi) return;
  const color = opts.color || COLORS.accent;
  let current = lo;
  const speed = opts.speed || 0.0016;

  const sendNext = () => {
    if (current >= hi) return;
    const from = nodes[current].entity;
    const to = nodes[current + 1].entity;
    const isFirst = current === lo;
    const packet = new DataPacket(from, to, {
      speed,
      color,
      label: isFirst ? (opts.label || "") : "",
    });
    packet.onArrive = () => {
      current++;
      if (current < hi) sendNext();
    };
    engine.addParticle(packet);
  };
  sendNext();
}

/* ------------------------------------------------------------------ */
/*  Main entry                                                         */
/* ------------------------------------------------------------------ */

export function setupGenericAnimation(engine: AnimationEngine, topic: FlatTopic) {
  engine.clear();
  const cx = engine.width / 2;
  const cy = engine.height / 2;
  const content = topic.content || {
    overview: "", howItWorks: [] as string[], keyConcepts: [] as string[],
    realWorld: "", tradeoffs: { pros: [] as string[], cons: [] as string[] },
    codeExample: "", interviewTips: [] as string[],
  };
  const howItWorks = content.howItWorks || [];
  const keyConcepts = content.keyConcepts || [];

  /* Resolve pipeline (explicit or derived) */
  const pipeline = PIPELINES[topic.id] || deriveDefaultPipeline(topic);
  const { nodes, connections } = buildPipeline(engine, pipeline, cx, cy);

  /* Title label */
  const titleLabel = new TextLabel(cx, 28, `${topic.icon} ${topic.title}`, {
    fontSize: 15, color: "#f4f0ff", bg: "rgba(168,85,247,0.14)",
    borderColor: "rgba(168,85,247,0.35)",
  });
  engine.addEntity(titleLabel);

  /* Helper: highlight a subset of nodes by index range and activate path */
  const highlightPath = (startIdx: number, endIdx: number) => {
    nodes.forEach((b, i) => {
      b.entity.highlight = i <= endIdx && i >= Math.min(0, startIdx);
    });
    connections.forEach((c) => { c.active = false; });
  };

  /* Helper: highlight a single node + its neighbors */
  const highlightNode = (idx: number) => {
    nodes.forEach((b, i) => {
      b.entity.highlight = Math.abs(i - idx) <= 1;
    });
    connections.forEach((c) => { c.active = false; });
  };

  /* ------------------------------------------------------------- */
  /*  Build steps                                                   */
  /* ------------------------------------------------------------- */
  const steps: AnimationStep[] = [];

  /* Step 0 — Overview: reveal every intermediate entity at once */
  steps.push({
    title: "Overview",
    description: content.overview || topic.description || "Loading…",
    duration: 6500,
    setup: () => {
      nodes.forEach((b) => { b.entity.highlight = true; });
      connections.forEach((c) => { c.active = true; });
    },
    update: (eng, stepTime) => {
      /* gentle ambient packet along the full chain at ~1.2s in */
      if (nodes.length >= 2 && stepTime > 1200 && stepTime < 1250) {
        sendMultiHopPacket(eng, nodes, 0, nodes.length - 1, {
          color: COLORS.violet, speed: 0.0012,
        });
      }
    },
  });

  /* Steps from howItWorks — one per stage, multi-hop packets */
  howItWorks.forEach((stepText, i) => {
    const targetIdx = Math.min(i, nodes.length - 1);
    steps.push({
      title: `Step ${i + 1}: ${deriveStepTitle(stepText)}`,
      description: stepText,
      duration: 6200,
      setup: () => {
        /* Highlight the path from start → current stage */
        highlightPath(0, targetIdx);
        if (nodes[targetIdx]) nodes[targetIdx].entity.highlight = true;
      },
      update: (eng, stepTime) => {
        /* Packet 1 — request flowing from start through every hop to target */
        if (stepTime > 400 && stepTime < 410) {
          sendMultiHopPacket(eng, nodes, 0, targetIdx, {
            color: COLORS.accent, label: `${i + 1}`,
          });
        }
        /* Packet 2 — response rippling back from target to start */
        if (stepTime > 3200 && stepTime < 3210 && targetIdx > 0) {
          sendMultiHopPacket(eng, nodes, targetIdx, 0, {
            color: COLORS.client, speed: 0.0018,
          });
        }
      },
    });
  });

  /* Key Concepts step — full flow highlighted, ambient packet */
  if (keyConcepts.length > 0) {
    steps.push({
      title: "Key Concepts",
      description: keyConcepts.map((k, i) => `${i + 1}. ${stripHtml(k)}`).join("\n"),
      duration: 7200,
      setup: () => {
        nodes.forEach((b) => { b.entity.highlight = true; });
        connections.forEach((c) => { c.active = true; });
      },
      update: (eng, stepTime) => {
        if (nodes.length >= 2 && stepTime > 1500 && stepTime < 1510) {
          sendMultiHopPacket(eng, nodes, 0, nodes.length - 1, {
            color: COLORS.cache, speed: 0.0014,
          });
        }
      },
    });
  }

  /* Trade-offs step — alternating highlight */
  if (content.tradeoffs) {
    const pros = (content.tradeoffs.pros || []).slice(0, 3).map((p) => `✅ ${stripHtml(p)}`).join("\n");
    const cons = (content.tradeoffs.cons || []).slice(0, 3).map((c) => `❌ ${stripHtml(c)}`).join("\n");
    steps.push({
      title: "Trade-offs",
      description: `${pros}\n\n${cons}`,
      duration: 6500,
      setup: () => {
        nodes.forEach((b, i) => { b.entity.highlight = i % 2 === 0; });
        connections.forEach((c) => { c.active = false; });
      },
    });
  }

  /* Real-World step — full flow + multi-hop packet */
  steps.push({
    title: "Real-World Usage",
    description: content.realWorld || topic.description,
    duration: 6500,
    setup: () => {
      nodes.forEach((b) => { b.entity.highlight = true; });
      connections.forEach((c) => { c.active = true; });
    },
    update: (eng, stepTime) => {
      if (nodes.length >= 2 && stepTime > 800 && stepTime < 810) {
        sendMultiHopPacket(eng, nodes, 0, nodes.length - 1, {
          color: COLORS.warning, speed: 0.0013,
        });
      }
      if (nodes.length >= 2 && stepTime > 3800 && stepTime < 3810) {
        sendMultiHopPacket(eng, nodes, nodes.length - 1, 0, {
          color: COLORS.success, speed: 0.0016,
        });
      }
    },
  });

  /* Summary step */
  steps.push({
    title: "Summary",
    description: `You've explored ${topic.title}. ${stripHtml(content.overview || topic.description).slice(0, 200)}… Review the notes tabs below for algorithms, code examples, and interview tips to deepen your understanding.`,
    duration: 5500,
    setup: () => {
      nodes.forEach((b) => { b.entity.highlight = true; });
      connections.forEach((c) => { c.active = true; });
    },
  });

  engine.setSteps(steps);
}
