import type { Category } from "./types";

/**
 * Expanded System Design Topics
 * Additional concepts beyond the original 64 to ensure comprehensive coverage.
 */
export const EXPANDED: Category = {
  id: "expanded-design",
  name: "Advanced & Expanded",
  icon: "🚀",
  level: "advanced",
  topics: [
    {
      id: "connection-pooling",
      title: "Connection Pooling",
      icon: "🔗",
      description: "Reuse database/HTTP connections to avoid expensive handshake overhead.",
      tags: ["Performance", "Database", "Networking"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Connection Pooling</strong> maintains a pool of open connections reused across requests, avoiding the expensive TCP/TLS handshake on every query. Critical for high-throughput database and HTTP clients.",
        howItWorks: [
          "Pool created with min/max connection limits at startup",
          "Request needs connection → borrow from pool (if available)",
          "If pool empty and under max → create new connection",
          "If at max → wait (or fail fast) until one is returned",
          "Connection returned to pool after use (not closed)",
        ],
        keyConcepts: [
          "<strong>Pool Size</strong> — Too small = starvation; too large = DB overload",
          "<strong>Max Lifetime</strong> — Recycle connections to prevent stale/broken ones",
          "<strong>Idle Timeout</strong> — Close idle connections to save resources",
          "<strong>Health Checks</strong> — Validate connection before lending",
          "<strong>HikariCP</strong> — Fastest Java DB pool; pgBouncer for Postgres",
        ],
        realWorld:
          "HikariCP (Java). pgBouncer (Postgres proxy). Apache DBCP. Node.js mysql2 pool. All production DBs use pooling.",
        tradeoffs: {
          pros: ["Eliminates handshake overhead (~50ms saved)", "Controls max DB connections", "Faster request handling"],
          cons: ["Pool can exhaust under load", "Stale connections need validation", "Memory for idle connections"],
        },
        codeExample: `# HikariCP (Java)
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://db:5432/app");
config.setMaximumPoolSize(20);      # max connections
config.setMinimumIdle(5);           # keep 5 warm
config.setMaxLifetime(1800000);     # recycle after 30 min
config.setIdleTimeout(600000);      # close idle after 10 min
HikariDataSource ds = new HikariDataSource(config);

# Node.js
const pool = mysql.createPool({
  host: 'db', connectionLimit: 20, waitForConnections: true
});`,
        interviewTips: [
          "Explain why connections are expensive (TCP + auth + TLS)",
          "Know ideal pool size formula (connections ~ cores × 2)",
          "Discuss pgBouncer as a connection pooler proxy",
        ],
      },
    },
    {
      id: "webhooks",
      title: "Webhooks & Event Callbacks",
      icon: "🪝",
      description: "Reverse API calls — server-to-server notifications when events happen.",
      tags: ["Integration", "Events", "API"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Webhooks</strong> are HTTP callbacks: instead of polling for changes, you register a URL and the service calls you when an event happens. They enable real-time integration between systems without polling overhead.",
        howItWorks: [
          "You register a webhook URL with the service (e.g., Stripe)",
          "When event occurs (payment received), service POSTs to your URL",
          "Your endpoint receives JSON payload + signature header",
          "Verify signature (HMAC) to ensure authenticity",
          "Return 200 OK quickly; process async to avoid timeouts",
        ],
        keyConcepts: [
          "<strong>Push vs Pull</strong> — Webhook = push (no polling needed)",
          "<strong>Signature Verification</strong> — HMAC-SHA256 to verify sender",
          "<strong>Idempotency</strong> — Handle duplicate deliveries safely (event IDs)",
          "<strong>Retry Policy</strong> — Service retries on non-2xx responses (exponential backoff)",
          "<strong>Webhook Signing Secret</strong> — Shared secret for HMAC verification",
        ],
        realWorld:
          "Stripe payment webhooks. GitHub push/PR webhooks. Slack incoming webhooks. Twilio SMS status. CI/CD triggers.",
        tradeoffs: {
          pros: ["Real-time updates (no polling)", "Lower bandwidth (only on events)", "Simple to consume"],
          cons: ["Need public endpoint (or tunnel like ngrok)", "Must handle retries/duplicates", "Firewall/NAT challenges"],
        },
        codeExample: `# Stripe webhook handler (Express)
app.post('/webhook/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // Verify signature (prevent spoofing)
    event = stripe.webhooks.constructEvent(
      req.rawBody, sig, WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send('Invalid signature');
  }

  // Handle event (idempotently!)
  if (event.type === 'payment_intent.succeeded') {
    fulfillOrder(event.data.object.id); // use event ID to dedupe
  }
  res.json({received: true}); // respond FAST, process async
});`,
        interviewTips: [
          "Always verify webhook signatures",
          "Handle duplicates with idempotency keys",
          "Respond 200 fast, process heavy work async",
        ],
      },
    },
    {
      id: "cdc",
      title: "Change Data Capture (CDC)",
      icon: "📡",
      description: "Stream database changes in real-time to downstream systems.",
      tags: ["Data", "Streaming", "Replication"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Change Data Capture (CDC)</strong> streams every insert/update/delete from a database to downstream systems in real-time by reading the transaction log (WAL/binlog). It enables event-driven architectures without modifying applications.",
        howItWorks: [
          "CDC tool reads database transaction log (Postgres WAL, MySQL binlog)",
          "Each row change becomes an event (before/after values)",
          "Events published to Kafka/streaming platform",
          "Downstream consumers: search index, cache, data warehouse, analytics",
          "Exactly-once semantics via log position + idempotent consumers",
        ],
        keyConcepts: [
          "<strong>Transaction Log</strong> — WAL (Postgres), binlog (MySQL) — source of truth",
          "<strong>Debezium</strong> — Popular open-source CDC connector (Kafka Connect)",
          "<strong>Log-based vs Query-based</strong> — Log is non-invasive, low-latency",
          "<strong>Event Schema</strong> — Before/after snapshots, op type (I/U/D)",
          "<strong>Outbox Pattern</strong> — Reliable event publishing with DB transaction",
        ],
        realWorld:
          "Debezium + Kafka at LinkedIn, Uber. AWS DMS for migration. Materialize for streaming SQL. CDC keeps Elasticsearch/Redis in sync with Postgres.",
        tradeoffs: {
          pros: ["Real-time data sync", "No app changes needed", "Decouples producers/consumers"],
          cons: ["Transaction log management", "Schema evolution complexity", "Ordering guarantees tricky"],
        },
        codeExample: `# Debezium Postgres connector config
{
  "name": "pg-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.dbname": "shop",
    "table.include.list": "public.orders",
    "plugin.name": "pgoutput"
  }
}

# Output event (Kafka topic: postgres.public.orders)
{
  "op": "u",                    // update
  "before": {"id": 1, "status": "pending"},
  "after":  {"id": 1, "status": "paid"},
  "source": {"lsn": 12345678}   // log position
}`,
        interviewTips: [
          "Explain log-based CDC vs query-based",
          "Know the Outbox pattern for reliable events",
          "Discuss CDC use cases: cache invalidation, search sync",
        ],
      },
    },
    {
      id: "stream-processing",
      title: "Stream Processing",
      icon: "🌊",
      description: "Process continuous data streams in real-time with Kafka, Flink, Spark.",
      tags: ["Streaming", "Kafka", "Flink", "Real-Time"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Stream Processing</strong> handles unbounded, continuous data streams in real-time, unlike batch processing. Tools like Kafka Streams, Apache Flink, and Spark Streaming process events as they arrive, enabling fraud detection, real-time analytics, and live dashboards.",
        howItWorks: [
          "Data sources produce events to a stream (Kafka topic)",
          "Stream processor consumes events continuously",
          "Stateful operations: windowing, joins, aggregations over time windows",
          "Results written to sinks (database, dashboard, alert)",
          "Handle late/out-of-order events with watermarks",
        ],
        keyConcepts: [
          "<strong>Windowing</strong> — Group events by time (tumbling, sliding, session)",
          "<strong>Watermark</strong> — Threshold for considering events \"late\"",
          "<strong>Stateful Processing</strong> — Maintain state across events (aggregations)",
          "<strong>Exactly-Once</strong> — Kafka transactions + idempotent consumers",
          "<strong>Backpressure</strong> — Slow consumer signals producer to slow down",
        ],
        realWorld:
          "Uber real-time surge pricing (Flink). Netflix viewing analytics. Fraud detection (real-time scoring). IoT sensor aggregation. Live dashboards.",
        tradeoffs: {
          pros: ["Real-time insights (< 1s latency)", "Continuous value extraction", "Reacts to events instantly"],
          cons: ["Complex state management", "Hard to debug/replay", "Resource-intensive (always running)"],
        },
        codeExample: `# Kafka Streams (Java) - word count over windows
StreamsBuilder builder = new StreamsBuilder();
KStream<String, String> text = builder.stream("input-text");

text.flatMapValues(v -> Arrays.asList(v.toLowerCase().split(" ")))
    .groupBy((k, w) -> w)
    .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))
    .count()
    .toStream()
    .to("word-counts");

# Flink (Python) - tumbling window aggregation
env = StreamExecutionEnvironment.get_execution_environment()
events = env.from_source(kafka_source, WatermarkStrategy.for_bounded_out_of_orderness(...))
events.key_by(lambda e: e.user) \
      .window(TumblingEventTimeWindows.of(Time.minutes(1))) \
      .aggregate(SumAggregator()) \
      .sink_to(postgres_sink)`,
        interviewTips: [
          "Compare stream vs batch processing",
          "Know windowing types (tumbling, sliding, session)",
          "Explain watermarks for late events",
        ],
      },
    },
    {
      id: "zero-trust",
      title: "Zero Trust Architecture",
      icon: "🛡️",
      description: "Never trust, always verify — security model for modern distributed systems.",
      tags: ["Security", "Architecture", "mTLS"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Zero Trust</strong> is a security model that assumes no implicit trust based on network location. Every request is authenticated, authorized, and encrypted — even inside the corporate network. \"Never trust, always verify.\"",
        howItWorks: [
          "Identity-first: every user and service must authenticate",
          "mTLS: mutual TLS between all services (encrypt + verify both sides)",
          "Least privilege: grant minimum permissions needed (just-in-time)",
          "Microsegmentation: fine-grained network policies per service",
          "Continuous verification: re-authenticate, log, monitor everything",
        ],
        keyConcepts: [
          "<strong>Identity-Aware Proxy</strong> — Auth at the edge, not just network",
          "<strong>mTLS everywhere</strong> — All service-to-service encrypted + verified",
          "<strong>Policy Engine (OPA)</strong> — Centralized authorization decisions",
          "<strong>BeyondCorp</strong> — Google's zero-trust implementation",
          "<strong>SPIFFE/SPIRE</strong> — Identity framework for services",
        ],
        realWorld:
          "Google BeyondCorp. Netflix internal mTLS. Istio service mesh enforces mTLS. Cloudflare Access. Gov't mandates zero trust.",
        tradeoffs: {
          pros: ["Strong security (no lateral movement)", "Works for cloud/remote/hybrid", "Fine-grained access control"],
          cons: ["High implementation complexity", "Latency from auth checks", "Certificate management overhead"],
        },
        codeExample: `# Istio mTLS policy (enforce zero-trust)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT   # all traffic must use mTLS

# Authorization policy (least privilege)
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
spec:
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/prod/sa/frontend"]
    to:
    - operation:
        methods: ["GET"]
        paths: [/api/users/*]`,
        interviewTips: [
          "Contrast zero trust vs perimeter (castle) security",
          "Explain mTLS role in zero trust",
          "Discuss OPA for policy as code",
        ],
      },
    },
    {
      id: "data-warehouse",
      title: "Data Warehouse & ETL",
      icon: "🏭",
      description: "Centralized analytics storage with ETL pipelines for business intelligence.",
      tags: ["Analytics", "ETL", "BigQuery", "OLAP"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>Data Warehouse</strong> is a centralized store optimized for analytics (OLAP), fed by <strong>ETL</strong> (Extract, Transform, Load) pipelines. It separates analytical workloads from transactional (OLTP) databases, enabling fast queries on huge datasets.",
        howItWorks: [
          "<strong>Extract</strong>: Pull data from sources (DBs, APIs, logs, files)",
          "<strong>Transform</strong>: Clean, join, aggregate into star/snowflake schema",
          "<strong>Load</strong>: Write to warehouse (BigQuery, Redshift, Snowflake)",
          "Analysts query with SQL; BI tools (Tableau, Looker) visualize",
          "Modern ELT: load raw first, transform in-warehouse (dbt)",
        ],
        keyConcepts: [
          "<strong>OLAP vs OLTP</strong> — Analytics (reads, aggregates) vs transactions (writes)",
          "<strong>Star Schema</strong> — Fact table (events) + dimension tables (entities)",
          "<strong>Columnar Storage</strong> — Store by column (fast aggregations)",
          "<strong>dbt</strong> — SQL-based transformation framework (ELT)",
          "<strong>Data Lake</strong> — Raw, unstructured storage (S3) vs structured warehouse",
        ],
        realWorld:
          "BigQuery (Google), Redshift (AWS), Snowflake, Databricks. Netflix, Uber use them for analytics. dbt for transforms. Airflow for pipeline orchestration.",
        tradeoffs: {
          pros: ["Fast analytics on TBs/PBs", "Separates analytics from OLTP", "Single source of truth"],
          cons: ["Expensive (storage + compute)", "ETL latency (hours, not real-time)", "Schema design upfront"],
        },
        codeExample: `# ETL Pipeline (Airflow + dbt)
# Extract: pull from Postgres
extract_task = PostgresToS3Operator(
  task_id="extract_orders",
  sql="SELECT * FROM orders WHERE created_at > '{{ds}}'"
)

# Load: copy S3 to Redshift
load_task = S3ToRedshiftOperator(...)

# Transform: dbt model
# models/order_summary.sql
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(*) AS orders,
  SUM(total) AS revenue
FROM {{ ref('orders') }}
GROUP BY 1

# Schedule: daily at 2 AM`,
        interviewTips: [
          "Explain OLAP vs OLTP and why separate them",
          "Know star schema (fact + dimension tables)",
          "Discuss ETL vs ELT and when dbt fits",
        ],
      },
    },
    {
      id: "oauth-flows",
      title: "OAuth 2.0 Flows",
      icon: "🎟️",
      description: "Authorization Code, PKCE, Client Credentials, and when to use each grant.",
      tags: ["Security", "OAuth", "Auth"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>OAuth 2.0</strong> defines multiple \"grant types\" (flows) for obtaining access tokens. Choosing the right flow depends on the client type (web app, SPA, mobile, server). Using the wrong flow is a common security vulnerability.",
        howItWorks: [
          "<strong>Authorization Code</strong>: Redirect user to auth server → get code → exchange for token (server-side apps)",
          "<strong>Auth Code + PKCE</strong>: Same but with code challenge (SPAs, mobile — no client secret)",
          "<strong>Client Credentials</strong>: Service-to-service (no user) — direct token for own identity",
          "<strong>Device Code</strong>: Smart TVs, IoT — user authorizes on another device",
          "Implicit flow is DEPRECATED — use Auth Code + PKCE instead",
        ],
        keyConcepts: [
          "<strong>Authorization Code</strong> — Most secure for server apps (secret kept server-side)",
          "<strong>PKCE</strong> — Prevents code interception (SPAs/mobile can't keep secrets)",
          "<strong>Refresh Token</strong> — Get new access token without re-login",
          "<strong>Scope</strong> — Limits what token can access (read:profile, write:posts)",
          "<strong>OpenID Connect</strong> — OAuth + identity layer (authentication)",
        ],
        realWorld:
          "Sign in with Google/GitHub uses Auth Code + PKCE. Stripe API uses Client Credentials for server-to-server. Spotify SDK for TVs uses Device Code.",
        tradeoffs: {
          pros: ["Standardized, interoperable", "No password sharing with apps", "Scoped, revocable tokens"],
          cons: ["Complex to implement correctly", "Token management overhead", "Easy to pick wrong flow"],
        },
        codeExample: `# Auth Code + PKCE (SPA / Mobile)
1. Generate code_verifier (random) + code_challenge (SHA256 hash)
2. Redirect:
   GET /authorize?
     response_type=code&
     client_id=APP_ID&
     redirect_uri=https://app/cb&
     code_challenge=HASH&
     code_challenge_method=S256&
     scope=read:profile

3. User logs in → redirect back with ?code=ABC

4. Exchange code for token:
   POST /token
     grant_type=authorization_code
     code=ABC
     code_verifier=ORIGINAL_RANDOM  # proves same client
     client_id=APP_ID  # NO secret!

# Client Credentials (server-to-server)
POST /token
  grant_type=client_credentials
  client_id=SVC_ID
  client_secret=SECRET
  scope=write:orders`,
        interviewTips: [
          "Know which flow for which client type",
          "Explain why PKCE is needed for SPAs/mobile",
          "Discuss why Implicit flow is deprecated",
        ],
      },
    },
    {
      id: "ml-systems",
      title: "ML Systems & MLOps",
      icon: "🤖",
      description: "Designing machine learning systems: training, serving, feature stores, monitoring.",
      tags: ["ML", "MLOps", "Inference", "Feature Store"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>ML Systems</strong> differ from traditional software — they learn from data. <strong>MLOps</strong> manages the ML lifecycle: data prep, training, deployment, monitoring, and retraining. Key challenges: feature consistency, model drift, and reproducibility.",
        howItWorks: [
          "<strong>Data</strong>: Collect, clean, label training data (feature engineering)",
          "<strong>Train</strong>: Train model on GPU clusters, validate on holdout set",
          "<strong>Deploy</strong>: Serve model via API (batch or real-time inference)",
          "<strong>Monitor</strong>: Track predictions, data drift, model performance",
          "<strong>Retrain</strong>: Periodically retrain as data/concepts drift",
        ],
        keyConcepts: [
          "<strong>Feature Store</strong> — Centralized features for training + serving (consistency)",
          "<strong>Online vs Batch Inference</strong> — Real-time (<100ms) vs overnight bulk",
          "<strong>Model Drift</strong> — Performance degrades as data changes over time",
          "<strong>Data Drift</strong> — Input distribution shifts (needs retraining)",
          "<strong>Shadow Deployment</strong> — Run new model alongside, compare before cutover",
        ],
        realWorld:
          "Netflix recommendations. Uber ETA. Google Search ranking. Fraud detection. Feasts (feature store). MLflow (experiment tracking). Kubeflow (orchestration).",
        tradeoffs: {
          pros: ["Automated decisions at scale", "Personalization", "Handles complex patterns humans can't"],
          cons: ["Data quality dependent", "Drift requires monitoring/retraining", "Hard to debug (black box)"],
        },
        codeExample: `# Feature Store (Feast)
user_features = FeatureStore.get_online_features(
  features=["user:avg_spend", "user:login_count"],
  entity_rows=[{"user_id": 42}]
).to_dict()

# Real-time Inference (FastAPI)
@app.post("/predict")
def predict(request: Request):
  features = extract_features(request)
  features = enrich_from_feature_store(features)  # consistent!
  score = model.predict(features)
  log_prediction(features, score)  # for monitoring
  return {"score": float(score)}

# Monitoring: detect drift
if kl_divergence(current_input_dist, training_dist) > 0.1:
  trigger_retraining()  # concept/data drift detected`,
        interviewTips: [
          "Explain training/serving skew and feature stores",
          "Discuss online vs batch inference trade-offs",
          "Know model monitoring (drift, performance, bias)",
        ],
      },
    },
    {
      id: "paxos",
      title: "Paxos Consensus Algorithm",
      icon: "🗳️",
      description: "Consensus protocol that lets a cluster agree on a value despite failures.",
      tags: ["Consensus", "Distributed Systems", "Algorithms"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Paxos</strong> is a consensus algorithm that lets a distributed cluster agree on a single value despite message loss, reordering, or node crashes. It uses three roles — <strong>Proposers</strong>, <strong>Acceptors</strong>, and <strong>Learners</strong> — and proceeds in Prepare and Accept phases requiring a majority quorum to guarantee safety.",
        howItWorks: [
          "Proposer picks a unique ballot number N and sends Prepare(N) to a quorum of acceptors",
          "Acceptors promise not to accept any proposal numbered < N; if they previously accepted a value, they return it",
          "Proposer picks the value from the highest-numbered promise (or its own) and sends Accept(N, value)",
          "Acceptors accept unless they already promised a higher ballot; they broadcast Accepted(N, value) to learners",
          "Learners adopt the chosen value once a majority of acceptors accepted it",
        ],
        keyConcepts: [
          "<strong>Quorum</strong> — Majority of acceptors; any two quorums overlap so conflicting values cannot both be chosen",
          "<strong>Ballot Number</strong> — Monotonically increasing identifier that orders competing proposals",
          "<strong>Prepare / Accept</strong> — Two-phase handshake; Prepare blocks older ballots, Accept commits the value",
          "<strong>Multi-Paxos</strong> — Stable leader optimization that skips Prepare for successive rounds",
          "<strong>FLP Impossibility</strong> — True async consensus is impossible with even 1 crash; Paxos assumes partial synchrony",
        ],
        realWorld:
          "Google Chubby lock service, Spanner Paxos groups per shard, Cassandra Lightweight Transactions (Paxos-backed), ZooKeeper ZAB (a Paxos variant).",
        tradeoffs: {
          pros: ["Mathematically proven safety", "Tolerates crashes and message loss", "Foundation for many production consensus systems"],
          cons: ["Notoriously hard to implement correctly", "Liveness not guaranteed under pure asynchrony", "Multiple round-trips per consensus decision"],
        },
        codeExample: `# Paxos pseudocode — Proposer side
def propose(value):
    n = next_ballot_number()
    # Phase 1: Prepare
    promises = broadcast_prepare(n)
    if len(promises) < majority:
        return None  # retry later
    # Adopt highest-numbered previously accepted value
    best = max(promises, key=lambda p: p.accepted_n)
    if best.value is not None:
        value = best.value
    # Phase 2: Accept
    accepted = broadcast_accept(n, value)
    if len(accepted) >= majority:
        broadcast_chosen(value)  # notify learners
        return value
    return None`,
        interviewTips: [
          "Explain Proposer / Acceptor / Learner roles and why majority quorum matters",
          "Compare Paxos vs Raft — Raft is leader-based and easier to reason about",
          "Mention Multi-Paxos optimization for a stable leader skipping Prepare",
        ],
      },
    },
    {
      id: "byzantine-fault-tolerance",
      title: "Byzantine Fault Tolerance",
      icon: "🏰",
      description: "Consensus when nodes can lie — PBFT, Tendermint, and 3f+1 replicas.",
      tags: ["Consensus", "Distributed Systems", "Security"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Byzantine Fault Tolerance (BFT)</strong> solves the Byzantine Generals Problem — achieving consensus when some nodes may act maliciously or arbitrarily (not just crash). Classic BFT protocols like <strong>PBFT</strong> and <strong>Tendermint</strong> tolerate up to f Byzantine nodes out of 3f+1 total replicas, using signed messages and multi-phase voting.",
        howItWorks: [
          "Client sends request to the primary replica",
          "Primary broadcasts a PRE-PREPARE message with sequence number to all replicas",
          "Replicas exchange PREPARE messages — each validates and signs, building a quorum certificate (QC)",
          "Replicas broadcast COMMIT messages; once 2f+1 commits are seen, the request is executed",
          "Result is sent to the client; view-change protocol replaces a faulty primary",
        ],
        keyConcepts: [
          "<strong>3f+1 Replicas</strong> — Need this many to tolerate f Byzantine (lying) nodes",
          "<strong>Quorum Certificate (QC)</strong> — Aggregated signatures proving 2f+1 agreement",
          "<strong>Pre-Prepare / Prepare / Commit</strong> — Three voting phases ensuring safety and liveness",
          "<strong>View Change</strong> — Detects faulty primary and elects a new one",
          "<strong>Tendermint</strong> — BFT + Proof-of-Stake finality used by Cosmos chains",
        ],
        realWorld:
          "Hyperledger Fabric (PBFT). Cosmos / Tendermint Core. Ethereum 2.0 consensus (Casper FFG). libra/libraBFT. Early PBFT paper by Castro-Liskov.",
        tradeoffs: {
          pros: ["Tolerates malicious nodes, not just crashes", "Deterministic finality (no forks)", "Strong safety guarantees"],
          cons: ["O(n^2) message complexity — doesn't scale to thousands of nodes", "Higher latency than crash-consensus (Raft)", "Requires signatures / extra crypto"],
        },
        codeExample: `# Tendermint-style BFT voting (simplified)
def handle_proposal(prop):
    if not validate(prop):
        return
    vote = sign(VOTE_PREVOTE, prop.hash, prop.round)
    broadcast(vote)

def collect_prevotes(round):
    while True:
        v = recv_vote()
        prevotes.add(v)
        if prevotes.count_for(prop.hash) >= 2 * f + 1:
            # quorum reached -> precommit
            broadcast(sign(VOTE_PRECOMMIT, prop.hash, round))

def collect_precommits(round):
    if precommits.count_for(prop.hash) >= 2 * f + 1:
        # QC formed -> commit block
        commit_block(prop)
        advance_round()`,
        interviewTips: [
          "Explain why 3f+1 replicas are needed (overlap argument)",
          "Contrast crash-fault (Raft) vs Byzantine-fault (PBFT) consensus",
          "Mention Tendermint as BFT used in production blockchains",
        ],
      },
    },
    {
      id: "two-phase-commit",
      title: "Two-Phase Commit (2PC)",
      icon: "🤝",
      description: "Atomic distributed transactions across multiple resources via a coordinator.",
      tags: ["Transactions", "Distributed Systems", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Two-Phase Commit (2PC)</strong> is a distributed transaction protocol that ensures all participants either commit or abort atomically. A <strong>coordinator</strong> runs a Prepare phase (asking each participant to promise) and a Commit/Abort phase (final decision). Used in XA transactions, databases, and legacy distributed transaction managers.",
        howItWorks: [
          "Coordinator sends PREPARE to all participants; each participant locks resources and writes a prepare log",
          "Participant replies YES (can commit) or NO (must abort) — once YES, it is obligated",
          "If all participants say YES, coordinator writes COMMIT to its log and sends COMMIT to all",
          "If any participant says NO (or times out), coordinator sends ABORT to all",
          "Participants ack; coordinator completes the transaction and releases locks",
        ],
        keyConcepts: [
          "<strong>Coordinator</strong> — Central decision-maker; single point of failure if not replicated",
          "<strong>Prepare Phase</strong> — Participants lock and promise to commit or abort",
          "<strong>Commit/Abort Phase</strong> — Coordinator broadcasts final decision",
          "<strong>Blocking</strong> — If coordinator fails after Prepare, participants hold locks indefinitely",
          "<strong>XA Standard</strong> — X/Open XA implements 2PC for resources like DBs and queues",
        ],
        realWorld:
          "MySQL/XtraDB XA transactions. Java JTA (UserTransaction). Oracle DB links. Spring Transactions across multiple DataSources.",
        tradeoffs: {
          pros: ["Atomicity across multiple resources", "Standardized (XA, JTA)", "Simple to reason about"],
          cons: ["Blocking — coordinator failure stalls participants", "Locks held during prepare reduce throughput", "Not partition-tolerant (fails on network split)"],
        },
        codeExample: `-- Coordinator pseudocode for 2PC
function commit_transaction(participants, tx):
    -- Phase 1: Prepare
    for p in participants:
        if not p.prepare(tx):       -- write prepare log, lock rows
            for q in participants:
                q.abort(tx)
            return ABORTED

    -- All prepared -> Phase 2: Commit
    write_commit_log(tx)
    for p in participants:
        p.commit(tx)                -- release locks, apply
        wait_for_ack(p)
    return COMMITTED

-- Recovery: on restart, coordinator reads its log
-- and replays COMMIT/ABORT to participants who ask.`,
        interviewTips: [
          "Explain the Prepare + Commit phases and why locks are held",
          "Discuss the blocking failure mode if the coordinator dies",
          "Compare 2PC vs Saga pattern for distributed transactions",
        ],
      },
    },
    {
      id: "three-phase-commit",
      title: "Three-Phase Commit (3PC)",
      icon: "🔀",
      description: "Non-blocking variant of 2PC adding a CanCommit phase.",
      tags: ["Transactions", "Distributed Systems", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Three-Phase Commit (3PC)</strong> adds a <strong>CanCommit</strong> pre-vote phase before Prepare to remove the blocking failure mode of 2PC. By ensuring participants know the outcome before locking, 3PC can recover without holding resources indefinitely — but it assumes synchronous failure detection and adds latency.",
        howItWorks: [
          "Coordinator sends CanCommit to participants — they check feasibility without locking",
          "Participants reply YES/NO based on whether they could commit; no resources locked yet",
          "Coordinator sends PreCommit if all said YES — participants write prepare log and lock",
          "Participants ack PreCommit; coordinator sends DoCommit (final commit instruction)",
          "If coordinator fails after PreCommit, participants can safely commit on their own (pre-voted)",
        ],
        keyConcepts: [
          "<strong>CanCommit</strong> — Feasibility check phase, no locks held yet",
          "<strong>PreCommit</strong> — Promise phase; participants prepare but don't finalize",
          "<strong>DoCommit</strong> — Final commit instruction; idempotent",
          "<strong>Non-blocking</strong> — Recovery proceeds without holding locks forever",
          "<strong>Failure Detector Assumption</strong> — 3PC requires bounded message delay (synchrony)",
        ],
        realWorld:
          "Rarely used directly in production (assumes synchrony which is hard to guarantee). Conceptual basis for Paxos Commit and modern consensus-based transaction protocols.",
        tradeoffs: {
          pros: ["Removes 2PC's blocking failure", "Participants can recover autonomously", "Cleaner failure semantics"],
          cons: ["Extra round-trip adds latency", "Assumes synchronous failure detection (unrealistic)", "Still fails on network partitions"],
        },
        codeExample: `# 3PC coordinator pseudocode
def three_phase_commit(participants, tx):
    # Phase 1: CanCommit (no locks)
    if not all(p.can_commit(tx) for p in participants):
        for p in participants: p.abort(tx)
        return ABORTED

    # Phase 2: PreCommit (lock + write prepare log)
    for p in participants:
        p.pre_commit(tx)
    wait_for_acks()

    # Phase 3: DoCommit
    write_commit_log(tx)
    for p in participants:
        p.do_commit(tx)   # idempotent; safe to retry
    return COMMITTED

# Participant recovery:
# If timed out after PreCommit but no DoCommit -> commit anyway (pre-voted)`,
        interviewTips: [
          "Explain how 3PC removes 2PC blocking via the CanCommit phase",
          "Mention the synchrony assumption that limits real-world adoption",
          "Note that modern systems use Paxos-based commit instead",
        ],
      },
    },
    {
      id: "distributed-locks",
      title: "Distributed Locks",
      icon: "🔒",
      description: "Mutex across nodes — Redis Redlock, ZooKeeper, etcd, fencing tokens.",
      tags: ["Coordination", "Redis", "ZooKeeper", "etcd"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Distributed locks</strong> provide mutual exclusion across processes on different machines. Implementations include <strong>Redis Redlock</strong> (quorum across N Redis nodes), <strong>ZooKeeper</strong> ephemeral nodes, and <strong>etcd</strong> leases. Crucial correctness detail: locks must use <strong>fencing tokens</strong> to guard against paused processes holding stale locks.",
        howItWorks: [
          "Client requests lock with a unique token + short TTL across N independent Redis nodes (Redlock) or a ZooKeeper ephemeral znode",
          "Lock is acquired if majority (quorum) of nodes grant it within the TTL",
          "Client performs the critical section, then releases the lock by deleting the key/znode",
          "If the client pauses (GC pause, process freeze), TTL may expire while client thinks it still holds the lock",
          "Fencing token (monotonic lock ID) is checked by the resource so a stale holder cannot overwrite newer writes",
        ],
        keyConcepts: [
          "<strong>Redlock</strong> — Redis quorum-based lock across N independent nodes",
          "<strong>Ephemeral Nodes</strong> — ZooKeeper znodes that auto-delete when session ends",
          "<strong>Lease/TTL</strong> — Lock auto-expires to release dead holders",
          "<strong>Fencing Token</strong> — Monotonic token stored with writes to reject stale lock holders",
          "<strong>Linearizability</strong> — Strong guarantee; Redis lacks it, etcd/ZK provide it via consensus",
        ],
        realWorld:
          "Redisson (Java Redis client). ZooKeeper distributed locks (Kafka, HBase). etcd leases (Kubernetes leader election). Stripe billing dedup locks.",
        tradeoffs: {
          pros: ["Enables coordination across nodes", "Auto-release via TTL on crashes", "Foundation for leader election"],
          cons: ["Redlock correctness debated (Martin Kleppmann critique)", "Fencing tokens required for true safety", "Network partitions break quorum-based locks"],
        },
        codeExample: `# Redis Redlock acquire (Python redis-py)
rl = Redlock([{"host": "r1"}, {"host": "r2"}, {"host": "r3"}, {"host": "r4"}, {"host": "r5"}])
token = str(uuid.uuid4())
lock = rl.lock("order:42", ttl_ms=10000)
if not lock:
    raise BusyError()
try:
    # Pass fencing token to DB; DB rejects writes with stale token
    db.execute(
        "UPDATE orders SET status='paid' WHERE id=42 AND lock_token < %s",
        (lock.validity_time,)
    )
finally:
    rl.unlock(lock)

# etcd alternative (linearizable)
txn = client.transaction(
    compare=[client.txn.compare.version('/lock/order42') == 0],
    success=[client.txn.put('/lock/order42', my_id, lease=lease_id)],
    failure=[]
)
if txn.succeeded: enter_critical_section()`,
        interviewTips: [
          "Explain why fencing tokens matter (paused process holding stale lock)",
          "Compare Redis Redlock vs ZooKeeper/etcd on correctness",
          "Discuss the Kleppmann critique of Redlock on GC pauses",
        ],
      },
    },
    {
      id: "mvcc-multi-version-concurrency",
      title: "MVCC: Multi-Version Concurrency",
      icon: "📚",
      description: "Snapshot isolation via version chains — readers never block writers.",
      tags: ["Databases", "Concurrency", "Transactions"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Multi-Version Concurrency Control (MVCC)</strong> keeps multiple versions of each row so readers see a consistent snapshot without blocking writers. Each transaction observes data as of its start time (snapshot isolation). <strong>Version chains</strong> link old and new versions; <strong>vacuuming</strong> reclaims space from versions no longer visible to any active transaction.",
        howItWorks: [
          "On BEGIN, transaction T records a snapshot timestamp and the list of active transactions",
          "Reads return the latest version visible to T (i.e., committed before T's snapshot and not from a newer txn)",
          "Writes create a new version linked into the version chain; old version remains for in-flight readers",
          "Commit appends to WAL and marks the version as committed at the commit timestamp",
          "Background vacuum/GC deletes versions older than the oldest active transaction's snapshot",
        ],
        keyConcepts: [
          "<strong>Snapshot Isolation</strong> — Each txn sees a consistent point-in-time view",
          "<strong>Version Chain</strong> — Linked list of row versions ordered by txn ID",
          "<strong>xmin/xmax (Postgres)</strong> — Txn IDs that created/deleted each version",
          "<strong>Vacuum</strong> — Reclaims dead tuples (Postgres autovacuum)",
          "<strong>Write Skew</strong> — Snapshot isolation anomaly prevented by SERIALIZABLE (SSI)",
        ],
        realWorld:
          "PostgreSQL (xmin/xmax + Hint Bits). MySQL InnoDB (undo logs). Oracle (SCN). SQL Server SI. CockroachDB / Spanner (timestamp-ordered MVCC).",
        tradeoffs: {
          pros: ["Readers never block writers (high concurrency)", "No read locks needed", "Long-running analytics don't stall OLTP"],
          cons: ["Storage overhead for versions", "Vacuum/bloat management required", "Write skew anomaly under plain snapshot isolation"],
        },
        codeExample: `-- Postgres MVCC internals
SELECT xmin, xmax, * FROM orders WHERE id = 42;
-- xmin = txn that created this version
-- xmax = txn that deleted (or 0 if alive)

-- Long-running query keeps old versions alive:
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM orders;   -- sees snapshot at this moment
-- Another txn updates an order; old version retained
COMMIT;

-- Vacuum reclaims dead tuples
VACUUM (VERBOSE, ANALYZE) orders;
-- autovacuum runs periodically based on thresholds:
-- autovacuum_vacuum_threshold = 50
-- autovacuum_vacuum_scale_factor = 0.2`,
        interviewTips: [
          "Explain how MVCC achieves snapshot isolation without read locks",
          "Mention Postgres xmin/xmax and the role of vacuum",
          "Discuss write skew and SSI for true serializability",
        ],
      },
    },
    {
      id: "bplus-trees",
      title: "B+ Trees",
      icon: "🌳",
      description: "Disk-optimized balanced trees — backbone of MySQL/Postgres indexes.",
      tags: ["Data Structures", "Databases", "Storage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>B+ Trees</strong> are balanced, disk-optimized search trees where only <strong>leaf nodes</strong> store data, linked via a sorted linked list for fast range scans. Interior nodes contain only routing keys. Fanout is large (hundreds of keys per node), keeping tree height low (3-4 levels for billions of rows) and minimizing disk I/O — the dominant cost in databases.",
        howItWorks: [
          "Tree root and interior nodes contain routing keys + child pointers (no data)",
          "Leaf nodes store (key, value) pairs sorted; each leaf links to its successor via a next-pointer",
          "Point lookup descends from root to a leaf in O(log_f N) page reads where f = fanout",
          "Range scans find the start leaf, then walk the leaf linked list sequentially",
          "Inserts may split a full leaf and propagate splits upward; deletes may merge siblings",
        ],
        keyConcepts: [
          "<strong>Fanout</strong> — Number of children per interior node (100s); reduces height",
          "<strong>Leaf Linked List</strong> — Enables O(k) range scans instead of tree traversal per row",
          "<strong>Page (Block)</strong> — Unit of disk I/O (typically 4-16 KB); one node per page",
          "<strong>Clustered vs Secondary</strong> — Clustered = leaf stores rows; secondary = leaf stores PK pointer",
          "<strong>Buffer Pool</strong> — Cache of hot pages in RAM avoids disk reads",
        ],
        realWorld:
          "MySQL InnoDB (clustered B+ tree on PK + secondary indexes). PostgreSQL (B-tree index). Oracle B-tree. SQL Server. Almost every relational DB index.",
        tradeoffs: {
          pros: ["O(log N) lookups with minimal disk I/O", "Excellent for range scans (leaf list)", "Self-balancing"],
          cons: ["Write amplification on random inserts (page splits)", "Tree maintenance overhead on deletes", "Less ideal for write-heavy LSM workloads"],
        },
        codeExample: `# B+ tree lookup (pseudocode)
def bplus_lookup(root_page, key):
    node = read_page(root_page)
    while not node.is_leaf:
        # binary search interior keys for child
        i = bisect_right(node.keys, key)
        node = read_page(node.child_ptrs[i])
    # at leaf — binary search for key
    i = bisect_left(node.keys, key)
    if i < len(node.keys) and node.keys[i] == key:
        return node.values[i]
    return None

# Range scan — find start leaf, walk linked list
def bplus_range(root, lo, hi):
    leaf = descend_to_leaf(root, lo)
    out = []
    while leaf is not None:
        for k, v in zip(leaf.keys, leaf.values):
            if lo <= k <= hi: out.append(v)
            elif k > hi: return out
        leaf = read_page(leaf.next_leaf_ptr)
    return out`,
        interviewTips: [
          "Explain why only leaves hold data and the linked list enables range scans",
          "Discuss fanout and why height stays low (3-4 levels for billions of rows)",
          "Compare B+ tree vs LSM tree for write-heavy workloads",
        ],
      },
    },
    {
      id: "skip-lists",
      title: "Skip Lists",
      icon: "🪜",
      description: "Probabilistic ordered map with O(log N) search via layered forward pointers.",
      tags: ["Data Structures", "Probabilistic", "Storage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Skip Lists</strong> are probabilistic data structures that maintain an ordered set of elements with multiple layers of forward pointers, achieving expected O(log N) search, insert, and delete — comparable to balanced trees but simpler to implement in concurrent settings. Used in <strong>Redis sorted sets</strong> and <strong>LevelDB/RocksDB MemTables</strong>.",
        howItWorks: [
          "Bottom layer is a sorted linked list of all elements",
          "Each element is promoted to a higher layer with probability p (e.g., 1/2)",
          "Search starts at top layer, moving right then dropping down when overshooting the target",
          "Insert: find position at each layer (with random promotion), splice in new node",
          "Delete: remove node from every layer it appears in",
        ],
        keyConcepts: [
          "<strong>Probabilistic Levels</strong> — Random promotion gives expected O(log N) height",
          "<strong>Forward Pointers</strong> — Multiple per node, one per layer",
          "<strong>Concurrent Friendliness</strong> — Localized pointer updates; no rebalancing",
          "<strong>Redis ZSET</strong> — Uses skip list + hash for O(log N) rank queries",
          "<strong>LevelDB MemTable</strong> — In-memory skip list for sorted key-value writes",
        ],
        realWorld:
          "Redis ZSET (ZADD/ZRANGE). LevelDB and RocksDB MemTable. ConcurrentSkipListMap in Java. Lucene segment term dictionary.",
        tradeoffs: {
          pros: ["Simple to implement vs balanced trees", "Lock-free concurrent variants exist", "O(log N) operations with low constant"],
          cons: ["Probabilistic bounds (not worst-case)", "Higher memory overhead (multiple pointers per node)", "Cache-unfriendly pointer chasing"],
        },
        codeExample: `# Skip list search (pseudocode)
def search(head, key):
    node = head
    level = MAX_LEVEL
    while level >= 0:
        while node.forward[level] and node.forward[level].key < key:
            node = node.forward[level]
        level -= 1
    # node.forward[0] is candidate
    cand = node.forward[0]
    return cand.value if cand and cand.key == key else None

def insert(head, key, value):
    update = [None] * (MAX_LEVEL + 1)
    node = head
    for lvl in range(MAX_LEVEL, -1, -1):
        while node.forward[lvl] and node.forward[lvl].key < key:
            node = node.forward[lvl]
        update[lvl] = node
    new = Node(key, value, random_level())  # geometric
    for lvl in range(new.height + 1):
        new.forward[lvl] = update[lvl].forward[lvl]
        update[lvl].forward[lvl] = new`,
        interviewTips: [
          "Explain the layered forward pointers and probabilistic promotion",
          "Mention Redis ZSET and LevelDB MemTable as canonical uses",
          "Discuss why skip lists are easier to make concurrent than red-black trees",
        ],
      },
    },
    {
      id: "trie-radix-tree",
      title: "Tries & Radix Trees",
      icon: "🔤",
      description: "Prefix-optimized trees for routing, autocomplete, and IP lookups.",
      tags: ["Data Structures", "Routing", "Storage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Tries</strong> store strings character-by-character down a tree, enabling efficient <strong>prefix queries</strong> (autocomplete, routing). A <strong>Radix Tree (Patricia Trie)</strong> compresses single-child chains into edges labeled with substrings, reducing memory. Used for IP routing tables, URL routers (Express, Gin), and dictionary lookups.",
        howItWorks: [
          "Root represents the empty string; each edge is labeled with one character (trie) or a substring (radix)",
          "To search for a key, walk from root matching edge labels left-to-right",
          "Insert splits an edge when the new key shares only a partial prefix",
          "A terminal marker / value is stored at the node representing the full key",
          "Prefix queries (find all keys starting with X) descend to the prefix node and collect subtree",
        ],
        keyConcepts: [
          "<strong>Prefix Matching</strong> — Native operation impossible with hash tables",
          "<strong>Radix Compression</strong> — Single-child paths merged to save space",
          "<strong>Longest Prefix Match</strong> — Used in IP routing tables (CIDR)",
          "<strong>Autocomplete</strong> — DFS from prefix node returns completions sorted",
          "<strong>Wildcard Routing</strong> — Web frameworks map /users/:id via trie",
        ],
        realWorld:
          "Linux kernel IP routing table (fib_trie). Nginx location matching. Express/Gin route dispatch. DNS suffix search. Elastic autocomplete suggestions.",
        tradeoffs: {
          pros: ["O(L) lookup where L = key length (independent of dataset size)", "Native prefix queries", "Compressed radix forms save memory"],
          cons: ["Memory overhead vs hash tables (pointers per char)", "Cache-inefficient pointer chasing", "More complex than a dict for exact lookups"],
        },
        codeExample: `// Trie node (TypeScript)
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  value?: any;
  isEnd = false;
}

class Trie {
  root = new TrieNode();
  insert(word: string, value?: any) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true; node.value = value;
  }
  // Autocomplete: collect all words starting with prefix
  startsWith(prefix: string): string[] {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    return this.collect(node, prefix);
  }
  private collect(node: TrieNode, prefix: string): string[] {
    const out: string[] = [];
    if (node.isEnd) out.push(prefix);
    for (const [ch, child] of node.children) {
      out.push(...this.collect(child, prefix + ch));
    }
    return out;
  }
}`,
        interviewTips: [
          "Explain why tries beat hash tables for prefix queries",
          "Mention radix tree compression for memory savings",
          "Cite IP routing tables and web framework routers as real uses",
        ],
      },
    },
    {
      id: "hyperloglog",
      title: "HyperLogLog",
      icon: "📊",
      description: "Cardinality estimation of huge sets in ~12 KB with ~0.81% error.",
      tags: ["Data Structures", "Probabilistic", "Streaming"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>HyperLogLog (HLL)</strong> is a probabilistic algorithm that estimates the number of distinct elements (cardinality) in a stream using sublinear memory — ~12 KB gives ~0.81% error on billions of items. It hashes each element and uses the position of the leftmost 1-bit as an indicator of rarity, combining many such indicators via stochastic averaging.",
        howItWorks: [
          "Each incoming element is hashed to a uniform bit string",
          "The hash is split into a bucket index (high bits) and a value part (low bits)",
          "For each bucket, track the maximum position of the leftmost 1-bit seen (rho)",
          "Cardinality estimate per bucket is 2^rho; combine across m buckets via harmonic mean",
          "Apply bias corrections for small/large cardinalities to get the final estimate",
        ],
        keyConcepts: [
          "<strong>Cardinality Estimation</strong> — Counting distinct items approximately",
          "<strong>Leftmost 1-bit</strong> — Indicator of how rare a hash pattern is",
          "<strong>Buckets (m)</strong> — 2^b buckets trade memory for accuracy",
          "<strong>Stochastic Averaging</strong> — Combining independent estimators reduces variance",
          "<strong>PFCOUNT</strong> — Redis command returning HLL cardinality; mergeable via PFMERGE",
        ],
        realWorld:
          "Redis PFCOUNT/PFADD. Google BigQuery APPROX_COUNT_DISTINCT. Spark approx_count_distinct. ClickHouse uniqHLL12. Reddit/Stack Overflow unique-viewer counts.",
        tradeoffs: {
          pros: ["Constant ~12 KB memory regardless of cardinality", "Mergeable across nodes (HLL unions)", "Fast — O(1) per insert"],
          cons: ["Approximate (~0.81% error)", "Not suitable when exact counts required", "Hash collisions on small cardinalities need correction"],
        },
        codeExample: `# HyperLogLog simplified (Python)
import hashlib

class HyperLogLog:
    def __init__(self, b=14):           # 2^14 = 16384 buckets, ~12 KB
        self.b = b
        self.m = 1 << b
        self.registers = [0] * self.m

    def add(self, item):
        h = int.from_bytes(hashlib.sha256(str(item).encode()).digest()[:8], 'big')
        idx = h >> (64 - self.b)        # high b bits = bucket
        rest = (h << self.b) & ((1 << 64) - 1)
        rho = 64 - self.b - rest.bit_length() + 1
        if rho > self.registers[idx]:
            self.registers[idx] = rho

    def estimate(self):
        alpha = 0.7213 / (1 + 1.079 / self.m)
        sum_inv = sum(2 ** -r for r in self.registers)
        E = alpha * self.m * self.m / sum_inv
        # small/large range corrections omitted for brevity
        return E`,
        interviewTips: [
          "Explain the leftmost-1-bit intuition and stochastic averaging",
          "Mention Redis PFCOUNT and BigQuery APPROX_COUNT_DISTINCT",
          "Highlight mergeability — HLL registers can be unioned across nodes",
        ],
      },
    },
    {
      id: "count-min-sketch",
      title: "Count-Min Sketch",
      icon: "🪣",
      description: "Sublinear space frequency estimation — heavy hitters in streams.",
      tags: ["Data Structures", "Probabilistic", "Streaming"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Count-Min Sketch (CMS)</strong> is a probabilistic data structure that estimates the frequency of items in a stream using sublinear space. It maintains d independent hash tables of width w; each item increments d counters. Query returns the minimum across the d hashed counters — an over-estimate bounded by epsilon. Ideal for <strong>heavy hitters</strong> and top-k detection.",
        howItWorks: [
          "Initialize d arrays of width w, all zeros (d = depth, w = width)",
          "On insert(item), compute d independent hashes and increment each corresponding counter",
          "To estimate(item), return min of the d hashed counters (min reduces over-estimation)",
          "Error bound: with d = ceil(ln(1/delta)), w = ceil(e/eps), estimate error <= eps*N with prob 1-delta",
          "Heavy-hitters: items whose estimated count exceeds threshold * total stream size",
        ],
        keyConcepts: [
          "<strong>Sublinear Space</strong> — Uses O(d*w) memory vs O(N) for exact counts",
          "<strong>Overestimate Only</strong> — CMS never underestimates (hash collisions add counts)",
          "<strong>Min Aggregation</strong> — Returning min reduces over-estimation error",
          "<strong>Heavy Hitters</strong> — Top-k frequent items detected via threshold",
          "<strong>Non-Mergeable in Some Variants</strong> — Standard CMS supports merge if same hash seeds",
        ],
        realWorld:
          "Twitter's streaming algorithms. Hive COUNT-MIN sketch UDAF. ClickHouse topK. CDN hot-content detection. Network traffic monitoring (heavy flows).",
        tradeoffs: {
          pros: ["Constant memory regardless of item count", "O(d) insert and query — very fast", "Supports merge across multiple sketches"],
          cons: ["Overestimates only (no negative errors)", "Cannot delete items (counting-Bloom variant fixes this)", "Approximate — not for exact billing"],
        },
        codeExample: `# Count-Min Sketch (Python)
import mmh3

class CountMinSketch:
    def __init__(self, width=1024, depth=5):
        self.w = width
        self.d = depth
        self.table = [[0] * width for _ in range(depth)]
        self.seeds = [i * 31 + 17 for i in range(depth)]

    def add(self, item, count=1):
        for i in range(self.d):
            j = mmh3.hash(str(item), self.seeds[i]) % self.w
            self.table[i][j] += count

    def estimate(self, item):
        return min(
            self.table[i][mmh3.hash(str(item), self.seeds[i]) % self.w]
            for i in range(self.d)
        )

# Heavy hitters: track all items whose estimate > threshold * N
N = total_stream_size
heavy = [item for item in seen if cms.estimate(item) > 0.01 * N]`,
        interviewTips: [
          "Explain the min-of-counters trick and why CMS only overestimates",
          "Derive error bounds (eps*N with probability 1-delta)",
          "Mention heavy-hitters detection and real uses (Twitter, ClickHouse)",
        ],
      },
    },
    {
      id: "sstable-lsm-compaction",
      title: "SSTables & LSM Compaction",
      icon: "🗂️",
      description: "LSM-tree storage with size-tiered, leveled, and time-window compaction.",
      tags: ["Storage", "Databases", "LSM"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SSTables (Sorted String Tables)</strong> are immutable, sorted on-disk files written by LSM-trees (Cassandra, RocksDB, LevelDB). Compaction merges SSTables in the background to bound read amplification and reclaim space. Strategies — <strong>size-tiered</strong>, <strong>leveled</strong>, and <strong>time-window</strong> — trade write amplification, read amplification, and temporary space.",
        howItWorks: [
          "Writes go to an in-memory MemTable (skip list) + append to a Write-Ahead Log",
          "When MemTable fills, it is flushed to disk as an immutable SSTable in L0",
          "Reads merge MemTable + all SSTables via a Bloom filter + sorted merge",
          "Background compaction picks SSTables, merges them, and writes new sorted SSTables",
          "Compaction strategy decides which SSTables to merge and into which level",
        ],
        keyConcepts: [
          "<strong>Write Amplification (WAMP)</strong> — Bytes written to disk per byte written by user",
          "<strong>Read Amplification (RAMP)</strong> — Number of SSTables inspected per read",
          "<strong>Space Amplification</strong> — Temporarily duplicated data during compaction",
          "<strong>Size-tiered</strong> — Merge similarly-sized SSTables; low WAMP, higher RAMP",
          "<strong>Leveled</strong> — L1..Ln with non-overlapping ranges; low RAMP, higher WAMP",
        ],
        realWorld:
          "Cassandra (size-tiered / leveled / STCS / LCS / TWCS). RocksDB (Leveled compaction). LevelDB. HBase. ScyllaDB. RocksDB is used inside MySQL/MyRocks, TiKV, CockroachDB.",
        tradeoffs: {
          pros: ["Excellent write throughput (sequential appends)", "Immutable files simplify concurrency", "Tunable read/write/space amplification"],
          cons: ["Compaction I/O spikes", "Read requires merging multiple files (Bloom mitigates)", "Tombstones need GC during compaction"],
        },
        codeExample: `# RocksDB options (Python)
opts = rocksdb.Options()
opts.create_if_missing = True
opts.write_buffer_size = 64 * 1024 * 1024   # MemTable size before flush
opts.max_write_buffer_number = 3             # MemTables in memory
opts.level0_file_num_compaction_trigger = 4  # L0 -> L1 trigger
opts.target_file_size_base = 64 * 1024 * 1024
opts.max_bytes_for_level_base = 256 * 1024 * 1024

# Cassandra table compaction strategy (CQL)
CREATE TABLE events (
  id uuid, ts timestamp, payload text, PRIMARY KEY (id, ts)
) WITH compaction = {
  'class': 'LeveledCompactionStrategy',
  'sstable_size_in_mb': 160
};

# Time-window compaction for time-series
WITH compaction = {
  'class': 'TimeWindowCompactionStrategy',
  'compaction_window_unit': 'DAYS',
  'compaction_window_size': '1'
};`,
        interviewTips: [
          "Explain write/read/space amplification trade-offs",
          "Compare size-tiered vs leveled compaction strategies",
          "Mention Bloom filters as the key read optimization",
        ],
      },
    },
    {
      id: "cache-strategies",
      title: "Cache Write Strategies",
      icon: "📝",
      description: "Write-through vs write-back vs write-around vs cache-aside — when to use each.",
      tags: ["Caching", "Performance", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "Cache <strong>write strategies</strong> determine when the cache and the backing store are updated on writes. <strong>Write-through</strong> writes cache + store synchronously; <strong>write-back (write-behind)</strong> writes cache first and async flushes; <strong>write-around</strong> bypasses cache on writes; <strong>cache-aside</strong> lets the application lazy-load. Choice impacts consistency, latency, and cache hit rate.",
        howItWorks: [
          "Write-through: on write, update cache and DB in same path; cache always consistent",
          "Write-back: write only to cache, return immediately; async writer flushes to DB later",
          "Write-around: write directly to DB, skip cache; cache populated on next read (avoid cache pollution by write-once data)",
          "Cache-aside: app reads cache; on miss, reads DB and populates cache; on write, update DB and invalidate cache",
          "Trade-offs balance write latency, consistency, and hit rate per workload",
        ],
        keyConcepts: [
          "<strong>Write-Through</strong> — Strong consistency at cost of write latency",
          "<strong>Write-Back</strong> — Lowest write latency; risk of data loss on cache crash",
          "<strong>Write-Around</strong> — Avoids cache thrash for write-once/rarely-read data",
          "<strong>Cache-Aside (Lazy Loading)</strong> — Most common; simple, but stampede risk",
          "<strong>Invalidation vs Update</strong> — Invalidate on write avoids concurrent-update races",
        ],
        realWorld:
          "Redis + Postgres cache-aside is the most common web pattern. CPU L1/L2 caches use write-back. CDN origin-shield often uses write-through. DB write buffers use write-back.",
        tradeoffs: {
          pros: ["Cache-aside: simple and widely applicable", "Write-back: lowest write latency", "Write-through: strong cache/store consistency"],
          cons: ["Write-through: high write latency", "Write-back: data loss risk on cache failure", "Cache-aside: stampede / extra DB load on miss"],
        },
        codeExample: `// Cache-aside pattern (TypeScript)
async function getUser(id: string): Promise<User> {
  const cached = await redis.get('user:' + id);
  if (cached) return JSON.parse(cached);
  const user = await db.users.findOne({ id });
  if (user) await redis.set('user:' + id, JSON.stringify(user), 'EX', 300);
  return user;
}

async function updateUser(id: string, patch: Partial<User>) {
  await db.users.update({ id }, patch);
  // Invalidate (not update) to avoid races with concurrent reads
  await redis.del('user:' + id);
}

// Write-through variant (rare; only if cache must stay in sync)
async function updateUserWriteThrough(id, patch) {
  await db.users.update({ id }, patch);
  const fresh = await db.users.findOne({ id });
  await redis.set('user:' + id, JSON.stringify(fresh), 'EX', 300);
}`,
        interviewTips: [
          "Compare write-through vs write-back vs cache-aside on consistency and latency",
          "Explain why invalidation (delete) is safer than update on writes",
          "Know cache-aside is the default for application caches",
        ],
      },
    },
    {
      id: "cache-invalidation",
      title: "Cache Invalidation",
      icon: "🧹",
      description: "TTL, event-driven, write-through invalidation, LRU/LFU eviction.",
      tags: ["Caching", "Performance", "Consistency"],
      hasAnimation: true,
      content: {
        overview:
          "Cache invalidation decides when cached data is removed or refreshed. Strategies include <strong>TTL expiration</strong>, <strong>event-driven invalidation</strong> (CDC or pubsub), <strong>explicit invalidation on writes</strong>, and <strong>eviction policies</strong> (LRU, LFU, ARC, FIFO) when capacity is reached. The classic quote — \"There are only two hard problems in CS: cache invalidation and naming things.\"",
        howItWorks: [
          "TTL: each key has an expiration; Redis evicts lazily on read or actively via active expiry cycle",
          "Event-driven: on DB update, publish a CDC event; cache subscribers delete affected keys",
          "Explicit: application code deletes/updates cache keys when writes occur (cache-aside pattern)",
          "Capacity eviction: when cache is full, evict per policy (LRU least-recently-used, LFU least-frequently-used)",
          "Tombstones and versioned keys prevent stale reads during in-flight invalidation",
        ],
        keyConcepts: [
          "<strong>TTL</strong> — Self-expiring keys; simple but allows stale reads until expiry",
          "<strong>Event-Driven Invalidation</strong> — CDC or pubsub triggers precise key deletes",
          "<strong>Versioned Keys</strong> — Include version in key (user:42:v3) to avoid stale reads",
          "<strong>LRU</strong> — Evict least-recently-used; default in Redis (approximated)",
          "<strong>LFU</strong> — Evict least-frequently-used; better for skewed access patterns",
        ],
        realWorld:
          "Redis maxmemory-policy=allkeys-lru. Memcached LRU. CDN cache purge APIs (Cloudflare, Fastly). Netflix EVCache event-driven invalidation. Varnish purge/ban.",
        tradeoffs: {
          pros: ["TTL is simple and self-healing", "Event-driven gives precise invalidation", "LFU handles skewed access better than LRU"],
          cons: ["TTL allows stale reads within TTL window", "Event-driven adds infra complexity (pubsub)", "Eviction policies may evict hot items under scan patterns"],
        },
        codeExample: `# Redis eviction policy
config set maxmemory 2gb
config set maxmemory-policy allkeys-lfu   # or allkeys-lru, volatile-ttl

# Event-driven invalidation via CDC (Debezium + Kafka)
def on_cdc_event(event):
    if event['op'] in ('u', 'd'):
        key = 'user:' + event['after']['id']
        redis.delete(key)
        # If using versioned keys, bump version to invalidate old reads
        redis.incr('user:' + id + ':version')

# Explicit invalidation (cache-aside)
def update_user(id, patch):
    db.users.update(id, patch)
    redis.delete('user:' + id)   # invalidate

# Versioned key lookup (avoid stampede + stale)
def get_user(id):
    v = redis.get('user:' + id + ':version') or '0'
    cached = redis.get('user:' + id + ':v' + v)
    if cached: return cached
    user = db.users.find(id)
    redis.set('user:' + id + ':v' + v, user, ex=300)
    return user`,
        interviewTips: [
          "Compare TTL vs event-driven vs explicit invalidation",
          "Explain LRU vs LFU and when each is better",
          "Mention versioned keys as a stampede + staleness solution",
        ],
      },
    },
    {
      id: "cache-stampede-thundering-herd",
      title: "Cache Stampede & Thundering Herd",
      icon: "🐂",
      description: "Thundering herd on cache miss — singleflight, request coalescing, early refresh.",
      tags: ["Caching", "Performance", "Reliability"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>cache stampede</strong> (thundering herd) occurs when a hot cache key expires and many concurrent requests simultaneously miss the cache and hammer the backing store. Mitigations include <strong>singleflight / request coalescing</strong> (one in-flight fetch serves all waiters), <strong>probabilistic early expiration</strong> (XFetch), and <strong>lock-based regeneration</strong> with a single worker rebuilding the cache.",
        howItWorks: [
          "Hot key expires (TTL elapsed) or is invalidated",
          "Hundreds of concurrent requests see cache miss and all query the DB",
          "DB overloaded, latency spikes, cascading timeouts and retries amplify load",
          "Mitigation: only ONE request fetches; others wait on a shared promise (singleflight)",
          "Alternatively, refresh proactively before expiry (XFetch) so misses are rare",
        ],
        keyConcepts: [
          "<strong>Thundering Herd</strong> — Many concurrent requests overwhelming the origin",
          "<strong>Singleflight</strong> — Coalesce duplicate in-flight calls into one (Go x/sync/singleflight)",
          "<strong>Request Coalescing</strong> — Same idea at proxy/CDN layer (e.g., Varnish coalescing)",
          "<strong>XFetch / Probabilistic Early Refresh</strong> — Refresh slightly before TTL based on request rate",
          "<strong>Lock + Stale-If-Error</strong> — One worker rebuilds; others serve stale until ready",
        ],
        realWorld:
          "Go x/sync/singleflight. Twitter's cache stampede mitigation. Netflix EVCache request coalescing. Varnish request coalescing. Cloudflare cache lock feature.",
        tradeoffs: {
          pros: ["Dramatically reduces origin load on hot-key expiry", "Smooths latency for end users", "Prevents cascading failure"],
          cons: ["Single point of failure if the one in-flight fetch fails", "Adds latency for waiters (coalesce timeout)", "XFetch adds complexity"],
        },
        codeExample: `// Go singleflight (de-duplicates concurrent calls)
import "golang.org/x/sync/singleflight"

var g singleflight.Group

func GetUser(id string) (*User, error) {
    v, err, _ := g.Do("user:"+id, func() (interface{}, error) {
        // Only one goroutine runs this; others wait
        return db.Users.Find(id)
    })
    if err != nil { return nil, err }
    return v.(*User), nil
}

// XFetch — probabilistic early refresh (Redis Lua)
-- beta = 1, ttl = 300s, current = 200s, request rate ~10/s
local xfetch = beta * ttl * (-math.log(-math.log(math.random())))
if current + xfetch > ttl then return REFRESH end

// Stale-while-revalidate pattern
async function getOrRebuild(key) {
  const v = await redis.get(key);
  if (v) {
    if (await redis.get(key + ':stale')) return v;          // serve stale
    if (await redis.set(key + ':lock', 1, 'NX', 'EX', 30)) {
      rebuild(key);                                          // async
    }
    return v;
  }
  return await rebuildAndCache(key);                        // cold miss
}`,
        interviewTips: [
          "Explain stampede and why naive cache-aside suffers from it",
          "Mention singleflight / request coalescing as the standard fix",
          "Discuss probabilistic early refresh (XFetch) for hot keys",
        ],
      },
    },
    {
      id: "hot-keys-hot-partitions",
      title: "Hot Keys & Hot Partitions",
      icon: "🔥",
      description: "Detecting and mitigating skewed load on a single key or partition.",
      tags: ["Caching", "Scaling", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>hot key</strong> or <strong>hot partition</strong> receives disproportionate traffic, exhausting the CPU/IO of the single node that owns it. Mitigations include <strong>replication</strong> (read replicas for the hot key), <strong>client-side scattering</strong> (split one logical key into N physical sub-keys), <strong>request coalescing</strong>, and <strong>adaptive partitioning</strong>.",
        howItWorks: [
          "Monitor per-key/per-partition metrics (QPS, bytes, latency) to identify skew",
          "For hot read key: replicate it to multiple replicas and have clients randomly pick",
          "For hot write key: split into N sub-keys (counter_42_0..N-1) and aggregate on read",
          "Apply rate limiting / shedding to protect the overloaded node",
          "Rebalance partitions or migrate the hot shard to a bigger instance",
        ],
        keyConcepts: [
          "<strong>Skew Detection</strong> — Per-key metrics, top-k dashboards",
          "<strong>Key Replication</strong> — Multiple replicas of a hot read key",
          "<strong>Sub-Key Splitting</strong> — Writes spread across N physical keys for one logical key",
          "<strong>Adaptive Partitioning</strong> — Dynamically split hot partitions (Cassandra)",
          "<strong>Load Shedding</strong> — Drop or queue overflow traffic to keep node alive",
        ],
        realWorld:
          "Redis cluster hot keys (redis-cli --hotkeys). Cassandra hot partitions. DynamoDB adaptive capacity. Twitter fanout-on-write for celebrity timelines. CDN hot object detection.",
        tradeoffs: {
          pros: ["Survives sudden popularity spikes (viral content)", "Prevents cascading overload", "Read replication is cheap and effective"],
          cons: ["Hard to predict hot keys in advance", "Sub-key splitting complicates reads (aggregation)", "Replication adds consistency complexity for writes"],
        },
        codeExample: `# Hot-key detection in Redis
redis-cli --bigkeys --hotkeys

# Counter with sub-key splitting (avoids single-shard write hotspot)
INCR counter:42:0   # client picks sub-key by hash(self) % 16
INCR counter:42:7

# Read: aggregate all sub-keys
def get_counter(id):
    keys = [f'counter:{id}:{i}' for i in range(16)]
    return sum(int(v) for v in redis.mget(keys))

# Cassandra — avoid hot partition by byte-ordered prefix:
# Bad: time series with timestamp as clustering key -> one node
# Good: prepend bucket id (1..N) so writes scatter across nodes
INSERT INTO events (bucket, ts, payload) VALUES (
  (now() % 100), toTimestamp(now()), ?
);

# DynamoDB adaptive capacity auto-allocates throughput to hot partitions
# (no app code)`,
        interviewTips: [
          "Explain sub-key splitting for write-heavy hot keys (counters)",
          "Mention read replicas for hot read keys",
          "Discuss DynamoDB adaptive capacity and Cassandra bucketing",
        ],
      },
    },
    {
      id: "read-repair-hinted-handoff",
      title: "Read Repair & Hinted Handoff",
      icon: "🛠️",
      description: "Dynamo-style anti-entropy — read repair, hinted handoff, Merkle trees.",
      tags: ["Replication", "Distributed Systems", "Cassandra"],
      hasAnimation: true,
      content: {
        overview:
          "Dynamo-style systems (Cassandra, Riak, DynamoDB) use <strong>read repair</strong>, <strong>hinted handoff</strong>, and <strong>anti-entropy</strong> to keep replicas consistent despite failures. Read repair fixes divergent replicas during reads; hinted handoff stores writes destined for a down node and replays them when it recovers; anti-entropy uses <strong>Merkle trees</strong> for periodic full reconciliation.",
        howItWorks: [
          "Write goes to N replicas; coordinator waits for W acks (write quorum)",
          "If a replica is down, coordinator stores a 'hint' locally for later delivery (hinted handoff)",
          "On read, coordinator reads from R replicas (read quorum); compares digests",
          "If replicas disagree, coordinator sends the latest value to stale replicas (read repair)",
          "Anti-entropy: periodically compare Merkle trees of replica ranges to find and sync divergent data",
        ],
        keyConcepts: [
          "<strong>Read Repair</strong> — Lazy fix on read when replicas disagree",
          "<strong>Hinted Handoff</strong> — Buffer writes for a temporarily-down replica",
          "<strong>Anti-Entropy</strong> — Background Merkle-tree comparison and sync",
          "<strong>Merkle Tree</strong> — Hash tree enabling O(log N) divergence detection per range",
          "<strong>W + R > N</strong> — Quorum intersection guarantees strong consistency if configured",
        ],
        realWorld:
          "Cassandra (read repair + hinted handoff + Merkle anti-entropy). Riak. Amazon DynamoDB. Voldemort. ScyllaDB.",
        tradeoffs: {
          pros: ["Self-healing without manual intervention", "Eventually consistent even with node outages", "Merkle trees minimize sync bandwidth"],
          cons: ["Eventual consistency (read may see stale data)", "Hinted handoff buffers can grow large", "Anti-entropy scans are expensive on huge ranges"],
        },
        codeExample: `# Cassandra config (cassandra.yaml)
read_repair: BLOCKING   # or NONE / BACKGROUND
hinted_handoff_enabled: true
max_hint_window_in_ms: 10800000   # 3 hours
hinted_handoff_throttle_in_kb: 1024

# Anti-entropy via Merkle trees — nodetool repair
# Compares Merkle trees of replica ranges and streams divergent partitions:
$ nodetool repair -pr my_keyspace   # primary range repair

# Read path quorum (CQL)
CONSISTENCY QUORUM;
SELECT * FROM orders WHERE id = 42;
# Coordinator reads from R replicas, compares digests,
# and if any differ, triggers read repair with the newest timestamp

# W + R > N => strong consistency (N=3, W=2, R=2)
# R=1, W=1 => eventual consistency (lower latency)`,
        interviewTips: [
          "Explain read repair as lazy, on-read consistency fix",
          "Mention hinted handoff for temporarily-down replicas",
          "Discuss Merkle trees in anti-entropy repair",
        ],
      },
    },
    {
      id: "memcached-vs-redis",
      title: "Memcached vs Redis",
      icon: "⚡",
      description: "Two dominant caches — features, eviction, persistence, clustering.",
      tags: ["Caching", "Redis", "Memcached"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Memcached</strong> and <strong>Redis</strong> are the two dominant in-memory caches. Memcached is intentionally simple: multi-threaded, LRU-only, volatile, no persistence. Redis is single-threaded (mostly), supports rich data types (lists, sets, sorted sets, streams), persistence (RDB + AOF), pubsub, and clustering. Choice depends on whether you need simplicity or richer semantics.",
        howItWorks: [
          "Memcached: slab allocator with size classes; strict LRU eviction per slab; multi-threaded workers",
          "Redis: single-threaded event loop (Redis 6+ I/O threading); per-key TTL + LRU/LFU eviction",
          "Memcached has no persistence — restart loses everything; Redis supports RDB snapshots + AOF replay",
          "Redis supports data structures (lists, sets, hashes, sorted sets, streams) and Lua scripts",
          "Redis Cluster shards across nodes with 16384 slots; Memcached requires client-side sharding (consistent hashing)",
        ],
        keyConcepts: [
          "<strong>Slab Allocator</strong> — Memcached chunks memory by size class",
          "<strong>Single-threaded</strong> — Redis serializes commands; no locks but one core",
          "<strong>Persistence</strong> — Redis RDB (snapshot) + AOF (append log); Memcached: none",
          "<strong>Eviction</strong> — Memcached strict LRU; Redis LRU/LFU/random/TTL policies",
          "<strong>Cluster Mode</strong> — Redis Cluster (built-in); Memcached (client-side hashing)",
        ],
        realWorld:
          "Memcached at Facebook (TAO cache). Redis at GitHub, Stack Overflow, Twitter. AWS ElastiCache offers both. Redis used as primary DB in some workloads.",
        tradeoffs: {
          pros: ["Memcached: dead simple, multi-threaded, very fast for get/set", "Redis: rich data types, persistence, clustering, Lua", "Redis: broader ecosystem (pubsub, streams, modules)"],
          cons: ["Memcached: no persistence, no complex types", "Redis: single-threaded limits throughput on one instance", "Redis: persistence + clustering add complexity"],
        },
        codeExample: `# Memcached usage (Python pymemcache)
from pymemcache.client.base import Client
mc = Client(('memcached', 11211), timeout=1)
mc.set('user:42', json.dumps({'name': 'Ada'}), expire=300)
val = mc.get('user:42')

# Client-side consistent hashing across multiple memcached nodes
from pymemcache.client.hash import HashClient
mc = HashClient([('m1', 11211), ('m2', 11211), ('m3', 11211)])

# Redis usage (Python redis-py)
import redis
r = redis.Redis(host='redis', port=6379, decode_responses=True)
r.setex('user:42', 300, json.dumps({'name': 'Ada'}))

# Redis rich data structure
r.zadd('leaderboard', {'alice': 100, 'bob': 85})
r.zrevrange('leaderboard', 0, 9, withscores=True)  # top 10
r.lpush('queue:emails', json.dumps({'to': 'x@y.com'}))
r.brpop('queue:emails', timeout=10)   # blocking pop

# Redis persistence config
SAVE 900 1       # RDB snapshot if >= 1 key changed in 15 min
APPENDONLY yes   # AOF enabled`,
        interviewTips: [
          "Highlight Memcached's simplicity vs Redis's feature richness",
          "Mention persistence and clustering as Redis's key advantages",
          "Note Memcached is multi-threaded while Redis is mostly single-threaded",
        ],
      },
    },
    {
      id: "http2-multiplexing",
      title: "HTTP/2 Multiplexing",
      icon: "🌐",
      description: "Multiple concurrent streams over one TCP connection with HPACK headers.",
      tags: ["Networking", "HTTP", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>HTTP/2</strong> multiplexes many concurrent request/response streams over a single TCP connection, eliminating HTTP/1.1 head-of-line blocking at the HTTP layer. It introduces <strong>binary framing</strong>, <strong>HPACK header compression</strong>, <strong>server push</strong>, stream prioritization, and per-stream flow control.",
        howItWorks: [
          "Client opens one TLS TCP connection to the server (connection reuse)",
          "Each request/response becomes a stream with a unique ID, divided into binary frames",
          "Frames from multiple streams are interleaved on the same connection — no HOL blocking",
          "Headers compressed via HPACK (static + dynamic Huffman tables) — major bandwidth saving",
          "Server push lets the server proactively send resources (e.g., CSS alongside HTML)",
        ],
        keyConcepts: [
          "<strong>Streams</strong> — Bidirectional logical channels within one TCP connection",
          "<strong>Binary Frames</strong> — Smallest unit; HEADERS, DATA, RST_STREAM, etc.",
          "<strong>HPACK</strong> — Header compression via static + dynamic tables + Huffman",
          "<strong>Server Push</strong> — Server sends resources before client asks (deprecated in Chrome)",
          "<strong>Head-of-Line Blocking (HTTP)</strong> — Solved at HTTP layer; still at TCP layer",
        ],
        realWorld:
          "Used by every major CDN, gRPC (HTTP/2-based), all modern browsers, Kubernetes API server, Envoy proxy.",
        tradeoffs: {
          pros: ["One TCP connection per host (less memory, no slow-start per request)", "Parallel requests without HTTP/1 pipelining issues", "HPACK dramatically reduces header bytes"],
          cons: ["TCP-level HOL blocking still applies (lost packet stalls all streams)", "Server push largely abandoned by browsers", "More complex debugging vs HTTP/1 plaintext"],
        },
        codeExample: `# Enable HTTP/2 in nginx
server {
    listen 443 ssl http2;
    ssl_certificate     /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;
}

# gRPC client/server uses HTTP/2 streams under the hood (Python)
import grpc
channel = grpc.insecure_channel('api:50051')
stub = greeter_pb2_grpc.GreeterStub(channel)
# Each RPC = one HTTP/2 stream; many concurrent on one TCP conn
response = stub.SayHello(greeter_pb2.HelloRequest(name='Ada'))

# Curl HTTP/2 test
# curl -v --http2 https://example.com/
# * ALPN: server accepted h2
# < HTTP/2 200

# Inspect streams with Wireshark: HTTP2 > HEADERS frame (type=0x1),
# DATA frame (type=0x0), SETTINGS (type=0x4)`,
        interviewTips: [
          "Explain multiplexing and how it solves HTTP/1.1 HOL blocking",
          "Mention HPACK header compression and why it matters",
          "Note that TCP-level HOL still exists — fixed only in HTTP/3",
        ],
      },
    },
    {
      id: "http3-quic",
      title: "HTTP/3 over QUIC",
      icon: "🚀",
      description: "HTTP/3 runs over QUIC (UDP) — 0-RTT, no head-of-line blocking, faster handshakes.",
      tags: ["Networking", "HTTP", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>HTTP/3</strong> runs over <strong>QUIC</strong>, a UDP-based transport built directly on TLS 1.3. QUIC eliminates TCP head-of-line blocking (per-stream loss recovery), enables <strong>0-RTT connection setup</strong>, supports connection migration (IP changes don't break the connection), and combines transport + crypto into one handshake.",
        howItWorks: [
          "Client resolves DNS, finds HTTP/3 hint (alt-svc header or DNS HTTPS record)",
          "UDP packet to QUIC port (443); QUIC handshake combines TLS 1.3 crypto + transport setup",
          "First connection: 1-RTT; returning connection uses 0-RTT (cached keys) — data sent immediately",
          "Each stream has independent loss recovery — one lost packet stalls only that stream",
          "Connection ID lets client IP change (mobile -> wifi) without breaking the connection",
        ],
        keyConcepts: [
          "<strong>QUIC</strong> — UDP-based transport built into user-space, by Google",
          "<strong>0-RTT</strong> — Send data on first packet for returning clients (anti-replay guarded)",
          "<strong>Per-Stream Loss Recovery</strong> — No HOL blocking across streams",
          "<strong>Connection Migration</strong> — Connection ID survives IP changes",
          "<strong>TLS 1.3 Integrated</strong> — Crypto and transport handshake combined",
        ],
        realWorld:
          "Google services, Cloudflare (HTTP/3 by default), Facebook, fastly. Browsers (Chrome, Firefox, Safari). gRPC over HTTP/3 (experimental).",
        tradeoffs: {
          pros: ["Faster handshakes (0-RTT)", "No TCP HOL blocking", "Connection migration across networks"],
          cons: ["UDP often throttled/blocked by middleboxes", "Higher CPU on server (user-space crypto)", "Connection tracking complexity"],
        },
        codeExample: `# Cloudflare / nginx HTTP/3 enable (nginx 1.25+)
server {
    listen 443 quic reuseport;
    listen 443 ssl;
    http2 on;
    http3 on;
    ssl_protocols TLSv1.3;
    add_header Alt-Svc 'h3=":443"; ma=86400';
}

# Curl HTTP/3 test
# curl -v --http3 https://cloudflare.com/
# * Connected to cloudflare.com port 443 (#0)
# * h3 version: 0-RTT enabled

# DNS HTTPS record advertising HTTP/3
_example.com.   IN HTTPS  1 . alpn=h3,h2 port=443

# QUIC packet structure (simplified)
# [Header (1 byte)] [Version (4)] [DCID] [SCID] [TLS frames...]
# Per-stream packets share the connection; loss in one doesn't block others.`,
        interviewTips: [
          "Explain QUIC runs over UDP and why (kernel bypass, faster iteration)",
          "Mention 0-RTT for returning clients and per-stream loss recovery",
          "Note connection migration surviving IP changes (mobile to wifi)",
        ],
      },
    },
    {
      id: "mtls",
      title: "Mutual TLS (mTLS)",
      icon: "🔐",
      description: "Mutual TLS authentication — both client and server present certificates.",
      tags: ["Security", "Networking", "mTLS"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Mutual TLS (mTLS)</strong> extends TLS so that both parties authenticate each other via X.509 certificates — not just server-to-client. Used in <strong>zero-trust</strong> networks and service meshes to prove service identity without IP-based trust. Requires <strong>certificate authority (CA)</strong>, cert issuance, and <strong>rotation</strong>.",
        howItWorks: [
          "An internal CA (or SPIFFE trust domain) issues short-lived certs to each service",
          "TLS handshake: server presents its cert as usual; server also requests a client cert",
          "Client presents its cert + proves possession of private key via TLS CertificateVerify",
          "Both sides validate the other cert against the trusted CA",
          "Certs are short-lived (hours) and auto-rotated by agents (envoy sidecar, SPIRE, cert-manager)",
        ],
        keyConcepts: [
          "<strong>Two-Way Auth</strong> — Both server and client certs validated",
          "<strong>SPIFFE/SPIRE</strong> — Standard for workload identity in dynamic environments",
          "<strong>Cert Rotation</strong> — Short-lived certs require automated rotation",
          "<strong>Trust Domain</strong> — Boundary of cert validity (e.g., cluster.local)",
          "<strong>Pinned Certs</strong> — Optionally pin fingerprints to prevent CA compromise",
        ],
        realWorld:
          "Istio / Linkerd enforce mTLS by default. Google ALTS. Cloudflare Access. AWS App Mesh. Kubernetes API server <-> kubelet mTLS.",
        tradeoffs: {
          pros: ["Strong cryptographic service identity", "No IP-based trust (works in dynamic cloud)", "Encrypts traffic at the same time"],
          cons: ["Certificate management complexity", "Latency from TLS handshake (mitigated with session resumption)", "CA is a critical trust anchor"],
        },
        codeExample: `# nginx mTLS configuration
server {
    listen 443 ssl;
    ssl_certificate      /etc/ssl/server.crt;
    ssl_certificate_key  /etc/ssl/server.key;
    ssl_client_certificate /etc/ssl/ca.crt;       # trust the client CA
    ssl_verify_client on;                          # REQUIRE client cert
    ssl_verify_depth 2;
    location / {
        proxy_pass http://backend;
        proxy_set_header X-Client-CN $ssl_client_s_dn_cn;
    }
}

# cert-manager (Kubernetes) — issue short-lived certs
apiVersion: cert-manager.io/v1
kind: Certificate
metadata: { name: api-cert }
spec:
  secretName: api-tls
  duration: 24h
  renewBefore: 8h
  dnsNames: [api.svc.cluster.local]
  issuerRef: { name: internal-ca, kind: ClusterIssuer }

# Verify with openssl
# openssl s_client -connect api:443 -cert client.crt -key client.key -CAfile ca.crt`,
        interviewTips: [
          "Explain how mTLS differs from one-way TLS (both parties authenticate)",
          "Mention short-lived certs and automated rotation (cert-manager, SPIRE)",
          "Discuss SPIFFE as a standard for workload identity",
        ],
      },
    },
    {
      id: "ddos-protection-waf",
      title: "DDoS Protection & WAF",
      icon: "🛡️",
      description: "Mitigate volumetric and application-layer attacks — Cloudflare, AWS Shield, WAF rules.",
      tags: ["Security", "Reliability", "Networking"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>DDoS mitigation</strong> absorbs volumetric floods (L3/L4) and application-layer (L7) attacks via anycast edge networks (Cloudflare, AWS Shield, Akamai). A <strong>Web Application Firewall (WAF)</strong> inspects HTTP traffic for SQLi, XSS, and rule-based anomalies. Combined with rate limiting, geo-blocking, and bot management, they form the front line of availability.",
        howItWorks: [
          "DNS routes traffic through an anycast edge network with terabits of capacity",
          "L3/L4 attacks (SYN floods, UDP amplification) absorbed at edge via scrubbing centers",
          "L7 attacks (HTTP floods, slowloris) inspected by WAF rules and rate limits",
          "WAF applies OWASP CRS rules — block SQLi, XSS, path traversal, known bot signatures",
          "Geo-blocking, CAPTCHA, and bot challenge pages filter suspicious clients",
        ],
        keyConcepts: [
          "<strong>Volumetric Attack</strong> — Bandwidth saturation (L3/L4); absorbed at edge",
          "<strong>Application Attack</strong> — HTTP floods, slowloris (L7); WAF mitigates",
          "<strong>OWASP CRS</strong> — Open-source rule set for ModSecurity / Coraza",
          "<strong>Anycast</strong> — Same IP advertised from many POPs; traffic就近 absorbed",
          "<strong>Rate Limiting</strong> — Per-IP / per-token request quotas",
        ],
        realWorld:
          "Cloudflare (largest L3/L4 capacity). AWS Shield + WAF. Akamai Kona. Google Cloud Armor. Imperva. Fastly.",
        tradeoffs: {
          pros: ["Edge absorbs volumetric floods far bigger than origin", "WAF blocks common app attacks (SQLi, XSS)", "Anycast keeps latency low"],
          cons: ["False positives can block legitimate users", "Costly for high-bandwidth traffic", "TLS termination at edge requires cert delegation"],
        },
        codeExample: `# AWS WAF rule — block SQL injection (managed rule group)
resource "aws_wafv2_web_acl" "app" {
  name  = "app-waf"
  scope = "REGIONAL"
  default_action { allow {} }
  rule {
    name     = "aws-managed-sqli"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "sqli"
      sampled_requests_enabled   = true
    }
  }
  # Rate limit per IP: 2000 req / 5 min
  rule {
    name     = "rate-limit"
    priority = 2
    action { block {} }
    statement {
      rate_based_statement { limit = 2000; aggregate_key_type = "IP" }
    }
    visibility_config { ... }
  }
}

# Cloudflare WAF custom rule (expression language)
(http.request.uri.path contains "/admin") and
(not cf.bot_management.verified_bot) and
(ip.geoip.country ne "US") -> Block`,
        interviewTips: [
          "Distinguish L3/L4 (volumetric) vs L7 (application) attacks and their mitigations",
          "Mention OWASP CRS and managed rule groups for common attacks",
          "Discuss anycast edge networks absorbing floods near the source",
        ],
      },
    },
    {
      id: "event-sourcing",
      title: "Event Sourcing",
      icon: "📜",
      description: "Append-only event log as source of truth; state is materialized via projections.",
      tags: ["Architecture", "Events", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Event Sourcing</strong> stores every state change as an immutable append-only event in a log; current state is derived by replaying events. <strong>Projections</strong> materialize read models from the log; <strong>snapshots</strong> periodically cache aggregate state to skip replay; pairs naturally with <strong>CQRS</strong> (separate read/write models).",
        howItWorks: [
          "Each command produces events validated against the aggregate's current state",
          "Events are appended to an immutable log (Kafka, EventStoreDB, Postgres event table)",
          "Aggregate state is rebuilt by replaying its events (or loaded from a snapshot + tail)",
          "Projections consume events and update read models (Elasticsearch, materialized views)",
          "Replaying the log from scratch rebuilds the entire system state — auditability and time-travel",
        ],
        keyConcepts: [
          "<strong>Event Log</strong> — Append-only source of truth",
          "<strong>Aggregate</strong> — Domain entity that consumes commands and emits events",
          "<strong>Projection</strong> — Read model derived from events (denormalized views)",
          "<strong>Snapshot</strong> — Periodic full-state cache to skip long replays",
          "<strong>CQRS</strong> — Separate command (write) and query (read) sides",
        ],
        realWorld:
          "EventStoreDB. Kafka + ksqlDB projections. Axon Framework (Java). LMAX Disruptor. Walmart, Cisco order systems. Materialize.",
        tradeoffs: {
          pros: ["Perfect auditability and time-travel", "Decoupled write and read models", "Event replays enable new projections on existing data"],
          cons: ["Storage grows unbounded (snapshots/snapshotting help)", "Event schema evolution is hard", "Eventually consistent reads"],
        },
        codeExample: `// Event sourcing aggregate (TypeScript)
type Event = { type: string; data: any; version: number };

class OrderAggregate {
  private id: string;
  private status: 'pending' | 'paid' | 'shipped' = 'pending';
  private total = 0;
  private version = 0;

  // Apply events to rebuild state
  apply(e: Event) {
    switch (e.type) {
      case 'OrderCreated':
        this.id = e.data.id; this.total = e.data.total; break;
      case 'OrderPaid':
        if (this.status !== 'pending') throw new Error('invalid');
        this.status = 'paid'; break;
      case 'OrderShipped':
        if (this.status !== 'paid') throw new Error('invalid');
        this.status = 'shipped'; break;
    }
    this.version = e.version;
  }

  // Commands produce events (not state changes)
  markPaid(): Event {
    if (this.status !== 'pending') throw new Error('cannot pay');
    return { type: 'OrderPaid', data: { id: this.id }, version: this.version + 1 };
  }
}

// Save events (immutable log) + publish for projections
await eventStore.append('order-42', [newEvent]);
await projections.update('order_summary', newEvent);`,
        interviewTips: [
          "Explain that events are the source of truth; state is derived",
          "Mention snapshots to avoid full replay on every load",
          "Discuss event sourcing + CQRS pairing and the read/write separation",
        ],
      },
    },
    {
      id: "outbox-pattern",
      title: "Transactional Outbox Pattern",
      icon: "📦",
      description: "Reliably publish events from a DB transaction without dual-write inconsistency.",
      tags: ["Architecture", "Events", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Transactional Outbox</strong> pattern solves the dual-write problem: writing to a DB and publishing to a message broker cannot be in one atomic transaction. Instead, the application writes its business data and an <strong>outbox row</strong> in the same DB transaction. A separate <strong>relay/CDC</strong> process reads the outbox table and publishes events to the broker, guaranteeing at-least-once delivery.",
        howItWorks: [
          "Application begins a DB transaction",
          "Writes business rows AND an event row to the outbox table in the same transaction",
          "Transaction commits atomically — outbox row exists iff business data was saved",
          "A relay (poller or CDC like Debezium) reads new outbox rows and publishes to Kafka",
          "Consumers must be idempotent (event ID dedup) because the relay may redeliver",
        ],
        keyConcepts: [
          "<strong>Dual-Write Problem</strong> — DB commit + broker publish cannot be atomic",
          "<strong>Outbox Table</strong> — Same-transaction staging table for events",
          "<strong>Relay / Publisher</strong> — Reads outbox, publishes to broker (CDC or poll)",
          "<strong>At-Least-Once</strong> — Relay may redeliver; consumers dedup by event ID",
          "<strong>CDC-Based Outbox</strong> — Debezium reads outbox changes via WAL",
        ],
        realWorld:
          "Debezium outbox event router. LinkedIn, Uber, Shopify use variants. Pattern documented in Microservices book (Richardson).",
        tradeoffs: {
          pros: ["No dual-write inconsistency", "Reuses DB transaction guarantees", "Survives broker outages (events buffered in DB)"],
          cons: ["Extra DB writes (outbox table grows)", "CDC setup complexity or polling overhead", "Requires idempotent consumers"],
        },
        codeExample: `-- Postgres outbox table
CREATE TABLE outbox (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate   TEXT NOT NULL,
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  processed   BOOLEAN DEFAULT FALSE
);

-- Application: one transaction
BEGIN;
INSERT INTO orders (id, total) VALUES (42, 100);
INSERT INTO outbox (aggregate, type, payload)
  VALUES ('order', 'OrderCreated', '{"id":42,"total":100}');
COMMIT;

-- Relay (poller) — periodic sweep
SELECT id, aggregate, type, payload FROM outbox
WHERE processed = FALSE ORDER BY created_at LIMIT 100;

-- Publish to Kafka, then mark processed (idempotent)
UPDATE outbox SET processed = TRUE WHERE id = ANY(?);

-- CDC variant: Debezium outbox event router
-- Streams INSERT events on outbox table directly to Kafka
-- (no polling)`,
        interviewTips: [
          "Explain the dual-write problem and why naive DB+publish is unsafe",
          "Describe the relay (poller or CDC) publishing from outbox",
          "Mention idempotent consumers to handle at-least-once delivery",
        ],
      },
    },
    {
      id: "bff-backend-for-frontend",
      title: "Backend For Frontend (BFF)",
      icon: "🪟",
      description: "Dedicated API per client type — tailored aggregations and formats.",
      tags: ["Architecture", "Microservices", "API"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Backend For Frontend (BFF)</strong> pattern introduces a dedicated service per client (web, mobile, partner) that aggregates downstream microservices and shapes responses for that client. Instead of one generic API over-fetching/under-fetching for all clients, each BFF exposes a client-specific contract, reducing round-trips and simplifying clients.",
        howItWorks: [
          "Identify distinct clients (web SPA, iOS, Android, partner API)",
          "Each client gets its own BFF service exposing its ideal API shape",
          "BFF calls downstream microservices (often via gRPC) and aggregates responses",
          "BFF applies client-specific shaping: pagination, fields, format, N+1 elimination",
          "BFFs may be implemented in lightweight frameworks (Node, Go) and owned by the client team",
        ],
        keyConcepts: [
          "<strong>One BFF per Client</strong> — Tailored APIs; no over-fetching",
          "<strong>Aggregation</strong> — BFF combines multiple service calls",
          "<strong>GraphQL at BFF</strong> — Often pairs with GraphQL for client-driven queries",
          "<strong>Team Ownership</strong> — BFF owned by the client's team (Conway's Law)",
          "<strong>Anti-Corruption Layer</strong> — BFF shields clients from internal service churn",
        ],
        realWorld:
          "SoundCloud (originated pattern). Spotify, Amazon, Netflix. GraphQL gateways are typically BFFs. Apollo Federation as a distributed BFF.",
        tradeoffs: {
          pros: ["Optimized payloads per client (fewer round-trips)", "Decouples clients from internal service changes", "Each client team owns its BFF"],
          cons: ["More services to operate", "Risk of duplicating logic across BFFs", "BFF can become a god-service if not careful"],
        },
        codeExample: `// Mobile BFF (Node/TypeScript) — aggregates downstream services
import { grpc } from '@grpc/grpc-js';

app.get('/mobile/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  // Fan-out to multiple internal gRPC services in parallel
  const [order, tracking, recommendations] = await Promise.all([
    orderClient.get({ id: orderId }),
    trackingClient.get({ orderId }),
    recoClient.list({ userId: req.user.id, limit: 3 })
  ]);
  // Shape response for mobile: minimal fields, nested structure
  res.json({
    id: order.id,
    status: order.status,
    total: order.total,
    eta: tracking.eta,
    suggested: recommendations.map(r => ({ id: r.id, name: r.name }))
  });
});

// Web BFF for same data might return more fields, include reviews
app.get('/web/orders/:id', async (req, res) => {
  const [order, tracking, reviews] = await Promise.all([...]);
  res.json({ ...order, tracking, reviews });  // richer for desktop
});`,
        interviewTips: [
          "Explain why one generic API fails (over-fetching / under-fetching)",
          "Mention that each BFF is owned by its client's team",
          "Discuss GraphQL as a natural BFF technology choice",
        ],
      },
    },
    {
      id: "strangler-fig-pattern",
      title: "Strangler Fig Pattern",
      icon: "🌱",
      description: "Incrementally migrate a monolith by strangling functionality piece-by-piece.",
      tags: ["Architecture", "Migration", "Microservices"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Strangler Fig</strong> pattern incrementally migrates a legacy monolith to a new architecture by routing individual endpoints or features to new services while leaving the rest on the legacy system. An <strong>anti-corruption layer</strong> translates between new and old domains. Over time, the new services \"strangle\" the monolith until it can be retired.",
        howItWorks: [
          "Put a routing facade (API gateway / load balancer) in front of the monolith",
          "Identify a bounded context or endpoint to extract (e.g., billing)",
          "Build the new service for that context with an anti-corruption layer (ACL)",
          "Update the facade to route matching requests to the new service; rest still hits monolith",
          "Repeat for each context until the monolith has no remaining functionality — retire it",
        ],
        keyConcepts: [
          "<strong>Facade / Router</strong> — API gateway that splits traffic by feature",
          "<strong>Anti-Corruption Layer (ACL)</strong> — Translates between old and new domain models",
          "<strong>Bounded Context</strong> — Choose one domain at a time to extract",
          "<strong>Incremental Cutover</strong> — Avoids risky big-bang rewrite",
          "<strong>Event Interop</strong> — New and old systems may share events during migration",
        ],
        realWorld:
          "Documented by Martin Fowler. Used by Amazon, Netflix, ThoughtWorks migrations. Common monolith-to-microservices transition.",
        tradeoffs: {
          pros: ["Low-risk incremental migration (reversible)", "No big-bang rewrite", "Value delivered continuously"],
          cons: ["Temporary dual-system complexity", "ACL adds latency and maintenance", "Data must be migrated/synced between old and new"],
        },
        codeExample: `# nginx routing — split traffic by URL prefix
upstream legacy { server monolith:8080; }
upstream new_billing { server billing-svc:8081; }
upstream new_users   { server users-svc:8082; }

server {
    listen 80;
    location /api/billing/ { proxy_pass http://new_billing; }
    location /api/users/   { proxy_pass http://new_users;   }
    location /             { proxy_pass http://legacy;       }  # rest still legacy
}

# API Gateway (e.g., Kong) — route by header
- routes:
  - paths: [/billing]
    service: billing-svc
    strip_path: true
  - paths: [/]
    service: legacy-monolith

# Anti-corruption layer translates legacy "customer_no" -> new "userId"
class CustomerAcl {
  toLegacy(user: User) { return { customer_no: user.legacyId }; }
  fromLegacy(row) { return new User({ id: row.id, legacyId: row.customer_no }); }
}`,
        interviewTips: [
          "Explain the facade routes traffic between old and new services",
          "Mention the anti-corruption layer to translate domain models",
          "Discuss why incremental cutover beats big-bang rewrite",
        ],
      },
    },
    {
      id: "service-mesh",
      title: "Service Mesh",
      icon: "🕸️",
      description: "Istio/Linkerd sidecar proxies handle mTLS, traffic control, observability.",
      tags: ["Architecture", "Microservices", "Networking"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>service mesh</strong> inserts a <strong>sidecar proxy</strong> (Envoy, Linkerd) next to every service instance, offloading cross-cutting concerns: <strong>mTLS</strong>, traffic routing, retries, circuit breaking, timeout enforcement, and telemetry. The <strong>control plane</strong> (Istio, Linkerd) configures sidecars; the <strong>data plane</strong> (proxies) handles traffic.",
        howItWorks: [
          "Each pod gets a sidecar proxy injected by the control plane",
          "All inbound and outbound traffic flows through the sidecar (transparent interception)",
          "Control plane (Istiod) pushes routing, policy, and security configs to sidecars",
          "Sidecars enforce mTLS, retries, timeouts, traffic splitting (canary), circuit breaking",
          "Sidecars emit telemetry (metrics, traces, access logs) to observability backends",
        ],
        keyConcepts: [
          "<strong>Data Plane</strong> — Sidecar proxies (Envoy in Istio) handling traffic",
          "<strong>Control Plane</strong> — Istiod, Linkerd controller managing sidecars",
          "<strong>mTLS by Default</strong> — All service-to-service encrypted + authenticated",
          "<strong>VirtualService + DestinationRule</strong> — Istio routing + policy CRDs",
          "<strong>Canary via Traffic Split</strong> — Route 5% to new version, observe, ramp up",
        ],
        realWorld:
          "Istio (Google/IBM), Linkerd (Buoyant), Consul Connect, AWS App Mesh. Used by major enterprises running Kubernetes at scale.",
        tradeoffs: {
          pros: ["Offload cross-cutting concerns from app code", "Uniform mTLS and observability across services", "Traffic control for canary / blue-green deploys"],
          cons: ["Sidecar adds latency (~1-3ms) and resource overhead", "Operational complexity of control plane", "Steep learning curve (CRDs, debugging)"],
        },
        codeExample: `# Istio VirtualService — canary deployment (95% v1, 5% v2)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata: { name: reviews }
spec:
  hosts: [reviews]
  http:
  - route:
    - destination: { host: reviews, subset: v1 }
      weight: 95
    - destination: { host: reviews, subset: v2 }
      weight: 5
    retries: { attempts: 3, perTryTimeout: 2s }
    timeout: 5s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata: { name: reviews }
spec:
  host: reviews
  subsets:
  - name: v1
    labels: { version: v1 }
  - name: v2
    labels: { version: v2 }
  trafficPolicy:
    connectionPool:
      tcp: { maxConnections: 100 }
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      ejectionTime: 60s    # circuit breaker`,
        interviewTips: [
          "Explain data plane (sidecars) vs control plane (Istiod) split",
          "Mention mTLS, retries, traffic splitting as core mesh features",
          "Discuss sidecar latency overhead and operational complexity",
        ],
      },
    },
    {
      id: "cell-based-architecture",
      title: "Cell-Based Architecture",
      icon: "🧫",
      description: "Blast-radius isolation by routing tenants into independent cells (Stripe, Square).",
      tags: ["Architecture", "Reliability", "Scaling"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Cell-based architecture</strong> partitions a system into self-contained <strong>cells</strong>, each running the full stack (app + DB + cache) for a subset of tenants or traffic. Failures are isolated to one cell — no single outage affects all users. A <strong>routing layer</strong> maps requests to the correct cell; deployment rolls out cell-by-cell, limiting blast radius.",
        howItWorks: [
          "Provision N identical cells, each with app servers, DB, cache, queues",
          "A routing layer (API gateway / router) maps tenant/request to a specific cell",
          "Each cell handles only its assigned tenants; no cross-cell traffic at runtime",
          "Deployments roll out cell-by-cell (canary on cell-1, then propagate)",
          "A cell failure affects only that cell's tenants; capacity is sized per cell",
        ],
        keyConcepts: [
          "<strong>Blast Radius</strong> — Maximum impact of a single failure",
          "<strong>Cell</strong> — Self-contained deployment unit (full stack)",
          "<strong>Router / Cell Gateway</strong> — Maps requests to cells",
          "<strong>Tenant Affinity</strong> — A tenant lives in exactly one cell",
          "<strong>Cell Rollout</strong> — Deploy to one cell, observe, propagate",
        ],
        realWorld:
          "Stripe (cell-based payments). Square. AWS service cells. ROSS architecture pattern (Resilience-Oriented Service Architecture).",
        tradeoffs: {
          pros: ["Blast-radius isolation — failures contained", "Independent scaling and deployment", "Noisy-neighbor problems eliminated"],
          cons: ["Resource overhead — each cell needs full stack", "Cross-cell features hard (admin, analytics)", "Operational complexity of many cells"],
        },
        codeExample: `# Routing layer maps tenant -> cell (Envoy + Lua or API gateway)
function pickCell(tenantId) {
  // Consistent hash on tenant ID -> cell index
  const cell = consistentHash(tenantId, ['cell-1', 'cell-2', 'cell-3', 'cell-4']);
  return cell;  // e.g., 'cell-3'
}

# nginx routing
map $http_x_tenant_id $cell {
  default   cell-1;
  ~^cust_a cell-2;
  ~^cust_b cell-3;
}
upstream cell-1 { server cell1-svc:8080; }
upstream cell-2 { server cell2-svc:8080; }
server {
  location / {
    proxy_pass http://$cell;
  }
}

# Each cell is a full Kubernetes namespace with own DB
apiVersion: v1
kind: Namespace
metadata: { name: cell-3 }
# Deploy app + postgres + redis in cell-3 namespace
# Cell failure = only tenants in cell-3 affected, rest still served.`,
        interviewTips: [
          "Explain that each cell runs the full stack for a subset of tenants",
          "Discuss blast-radius isolation as the primary benefit",
          "Mention the routing layer mapping tenants to cells",
        ],
      },
    },
    {
      id: "multi-region-deployment",
      title: "Multi-Region Deployment",
      icon: "🌍",
      description: "Active-active vs active-passive across regions; RPO/RTO, data residency.",
      tags: ["Reliability", "Scaling", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Multi-region deployment</strong> runs a service in multiple geographic regions for disaster resilience and lower latency. <strong>Active-active</strong> serves traffic from all regions simultaneously; <strong>active-passive</strong> has a hot or warm standby that takes over on failure. Trade-offs involve replication latency, <strong>conflict resolution</strong>, data residency, and the <strong>RPO/RTO</strong> objectives.",
        howItWorks: [
          "DNS / global load balancer (Route 53, Cloudflare) routes users to nearest healthy region",
          "Database replication: async (active-passive) or multi-master (active-active)",
          "Writes in active-active require conflict resolution (last-write-wins, CRDTs, app logic)",
          "Cross-region replication adds latency (10-100ms+); apps must tolerate eventual consistency",
          "Data residency: PII may be restricted to specific regions (GDPR, data sovereignty)",
        ],
        keyConcepts: [
          "<strong>RPO (Recovery Point Objective)</strong> — Max acceptable data loss (time)",
          "<strong>RTO (Recovery Time Objective)</strong> — Max acceptable downtime",
          "<strong>Active-Active</strong> — All regions serve traffic; hardest consistency",
          "<strong>Active-Passive</strong> — One primary, others standby; simpler failover",
          "<strong>Spanner / CockroachDB</strong> — Globally consistent multi-region DBs",
        ],
        realWorld:
          "Google Spanner (active-active multi-region). DynamoDB Global Tables. CockroachDB. Netflix active-active on AWS regions. Cloudflare global anycast.",
        tradeoffs: {
          pros: ["Lower latency for global users", "Survives region-wide outages", "Load distribution across regions"],
          cons: ["Replication costs (cross-region bandwidth)", "Conflict resolution complexity", "Data residency compliance burden"],
        },
        codeExample: `# Route 53 latency-based + health-check routing
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"
  set_identifier = "us-east"
  latency_routing_policy { region = "us-east-1" }
  health_check_id = aws_route53_health_check.us.id
  records         = [aws_eip.us.public_ip]
}
# Same for eu-west, ap-southeast; Route 53 fails over on health check failure

# Spanner multi-region instance — active-active
resource "google_spanner_instance" "main" {
  config       = "nam-eur-asia1"   # multi-region, 3 continents
  display_name = "global-db"
  num_nodes    = 3
}
# Writes from any region commit with TrueTime-bounded staleness

# Application: write to nearest region; reads prefer local replica
const db = spanner.instance('global').database('orders');
await db.runTransactionAsync(async (tx) => {
  await tx.insert('orders', { id, total, region: 'us-east' });
  await tx.commit();   # synchronous cross-region commit
});`,
        interviewTips: [
          "Distinguish active-active vs active-passive and their trade-offs",
          "Define RPO and RTO and how they drive architecture choices",
          "Mention Spanner / CockroachDB for globally consistent multi-region DBs",
        ],
      },
    },
    {
      id: "disaster-recovery",
      title: "Disaster Recovery (DR)",
      icon: "🚨",
      description: "Backup/restore, pilot light, warm standby, multi-site — RPO/RTO trade-offs.",
      tags: ["Reliability", "Operations", "Databases"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Disaster Recovery (DR)</strong> strategies restore service after major failures. Four tiers exist: <strong>backup-restore</strong> (cheapest, slowest), <strong>pilot light</strong> (minimal core always-on), <strong>warm standby</strong> (scaled-down replica), and <strong>multi-site active-active</strong> (most expensive, fastest). Choice is driven by <strong>RPO</strong> (data loss tolerance) and <strong>RTO</strong> (downtime tolerance).",
        howItWorks: [
          "Backups taken periodically (snapshots, WAL archives) and tested by restore drills",
          "Pilot light: core services (DB) replicated; scale up app tier only on failover",
          "Warm standby: scaled-down full stack running in DR region; scale up on failover",
          "Multi-site: full active-active or hot standby; traffic shifts via DNS on failure",
          "Failover runbook automates DNS switch, app scaling, and data promotion",
        ],
        keyConcepts: [
          "<strong>RPO</strong> — Recovery Point Objective (max data loss, time)",
          "<strong>RTO</strong> — Recovery Time Objective (max downtime)",
          "<strong>Pilot Light</strong> — Minimal core running; rest scaled at failover",
          "<strong>Warm Standby</strong> — Scaled-down replica always running",
          "<strong>Multi-Site</strong> — Active-active across regions; near-zero RTO",
        ],
        realWorld:
          "AWS DR patterns (backup-restore, pilot light, warm standby, multi-site). Netflix Chaos Monkey for DR testing. PostgreSQL WAL archiving to S3. RDS multi-AZ.",
        tradeoffs: {
          pros: ["Survives region / datacenter failures", "Meets business continuity SLAs", "Backup/restore is cheap baseline"],
          cons: ["Cost grows with RTO/RPO strictness", "Failover complexity and drill burden", "Cross-region replication bandwidth"],
        },
        codeExample: `# AWS RDS automated backups + multi-AZ (pilot-light DR)
resource "aws_db_instance" "primary" {
  identifier           = "orders"
  engine               = "postgres"
  allocated_storage    = 200
  backup_retention_period = 7       # PITR for 7 days
  multi_az             = true       # synchronous standby in another AZ
  storage_encrypted    = true
}

# Cross-region read replica (warm standby)
resource "aws_db_instance" "replica" {
  identifier            = "orders-replica"
  replicate_source_db   = aws_db_instance.primary.arn
  region                = "us-west-2"
  backup_retention_period = 7
}

# Promote replica to primary on DR (runbook)
# aws rds promote-read-replica --db-instance-identifier orders-replica
# Update Route 53 to point at the DR region

# Restore from snapshot (backup-restore tier, RTO = hours)
# aws rds restore-db-instance-from-db-snapshot \\
#   --db-instance-identifier orders-restored \\
#   --db-snapshot-identifier orders-2024-01-15`,
        interviewTips: [
          "List the four DR tiers and their RPO/RTO trade-offs",
          "Explain the difference between RPO and RTO",
          "Mention that DR plans must be tested (Netflix Simian Army, chaos engineering)",
        ],
      },
    },
    {
      id: "serverless-architecture",
      title: "Serverless Architecture",
      icon: "☁️",
      description: "FaaS + BaaS — scale-to-zero, event-driven, cold starts, pay-per-use.",
      tags: ["Architecture", "Cloud", "Scaling"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Serverless</strong> applications combine <strong>Function-as-a-Service (FaaS)</strong> (AWS Lambda, Cloud Functions) with <strong>Backend-as-a-Service (BaaS)</strong> (managed DBs, auth, storage). No server management, automatic scaling to zero, and per-invocation billing. Trade-offs include <strong>cold starts</strong>, vendor lock-in, and limits on execution time and state.",
        howItWorks: [
          "Developer deploys functions (zip / container) triggered by HTTP, queue, schedule, or event",
          "On first invocation, provider provisions a container (cold start ~100ms-1s)",
          "Subsequent invocations reuse warm instances (~ms latency)",
          "Function runs to completion (max 15min on Lambda), state stored externally (DB, S3)",
          "Provider handles scaling, OS, capacity planning; billing per invocation + GB-seconds",
        ],
        keyConcepts: [
          "<strong>FaaS</strong> — Event-driven functions that scale per-request",
          "<strong>BaaS</strong> — Managed services (DynamoDB, Auth0, S3, Firebase)",
          "<strong>Cold Start</strong> — Latency penalty on first invocation per container",
          "<strong>Pay-per-Use</strong> — Billing by invocations and execution time",
          "<strong>Event-Driven</strong> — Functions triggered by events (S3 put, SQS, schedule)",
        ],
        realWorld:
          "AWS Lambda + API Gateway + DynamoDB. Google Cloud Functions/Firestore. Azure Functions. Netlify/Vercel for frontend. Serverless stack at Coca-Cola, iRobot, Nordstrom.",
        tradeoffs: {
          pros: ["No server management", "Automatic scaling (incl. to zero)", "Pay only for actual usage"],
          cons: ["Cold start latency (problematic for low-traffic APIs)", "Vendor lock-in to provider APIs", "Hard to debug / local dev / observability"],
        },
        codeExample: `// AWS Lambda handler (TypeScript) — HTTP API
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer!.claims.sub;
  // Reuse DB client across warm invocations (avoid cold-start cost)
  const result = await db.get({
    TableName: 'Users',
    Key: { id: userId }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
};

// SAM template (serverless deployment)
Resources:
  GetUser:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs20.x
      MemorySize: 512         # affects CPU + cold start
      Timeout: 10
      Events:
        Api:
          Type: Api
          Properties: { Path: /me, Method: GET }
      Environment:
        Variables: { TABLE_NAME: Users }
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrentExecutions: 5   # eliminate cold starts`,
        interviewTips: [
          "Explain FaaS + BaaS and the scale-to-zero property",
          "Discuss cold starts and mitigations (provisioned concurrency, smaller packages)",
          "Mention vendor lock-in and observability challenges",
        ],
      },
    },
    {
      id: "vector-databases",
      title: "Vector Databases",
      icon: "🧬",
      description: "Embeddings + ANN search — Pinecone, Milvus, pgvector with HNSW / IVF.",
      tags: ["AI", "Databases", "Search"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Vector databases</strong> store high-dimensional <strong>embeddings</strong> (from ML models) and answer <strong>approximate nearest neighbor (ANN)</strong> queries — \"find similar items to this vector.\" Indexes like <strong>HNSW</strong> (Hierarchical Navigable Small World) and <strong>IVF</strong> (Inverted File) trade recall for speed. Powering semantic search, RAG, and recommendation systems.",
        howItWorks: [
          "Embed source data (text, images) into fixed-dim vectors via ML model (e.g., 1536-dim)",
          "Insert vectors into the DB with metadata; index built (HNSW graph or IVF clusters)",
          "Query: embed the query vector, then ANN search returns top-k nearest by cosine distance",
          "HNSW: navigable small-world graph traversal — fast but memory-heavy",
          "IVF: k-means clustering of vectors; search only top-N nearest clusters — lower memory",
        ],
        keyConcepts: [
          "<strong>Embedding</strong> — Vector representation of content from an ML model",
          "<strong>ANN (Approximate Nearest Neighbor)</strong> — Approximate top-k similarity search",
          "<strong>HNSW</strong> — Graph-based ANN; fast, high recall, memory-heavy",
          "<strong>IVF</strong> — Cluster-based ANN; lower memory, tunable recall via nprobe",
          "<strong>Cosine Similarity</strong> — Common distance metric for normalized embeddings",
        ],
        realWorld:
          "Pinecone, Milvus, Weaviate, Qdrant. pgvector Postgres extension. Elasticsearch dense_vector. Chroma for local. Used by ChatGPT plugins and RAG systems.",
        tradeoffs: {
          pros: ["Semantic search beyond keyword matching", "Foundation for RAG and recommendations", "pgvector reuses Postgres"],
          cons: ["Memory-heavy (high-dim vectors)", "Approximate results (recall < 100%)", "Re-embedding cost when models change"],
        },
        codeExample: `# pgvector — Postgres extension
CREATE EXTENSION vector;
CREATE TABLE docs (
  id    BIGSERIAL PRIMARY KEY,
  text  TEXT,
  embedding VECTOR(1536)
);

-- HNSW index for fast ANN
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Semantic search: embed query, then ANN
SELECT id, text, 1 - (embedding <=> '[0.1,0.2,...]') AS similarity
FROM docs
ORDER BY embedding <=> '[0.1,0.2,...]'   -- cosine distance
LIMIT 10;

# Python with OpenAI embeddings + pgvector
import openai, psycopg
emb = openai.embeddings.create(model='text-embedding-3-small',
                               input='how do I deploy Next.js').data[0].embedding
cur.execute('SELECT id, text FROM docs ORDER BY embedding <=> %s LIMIT 5',
            (emb,))`,
        interviewTips: [
          "Explain embeddings and ANN similarity search",
          "Compare HNSW (graph, fast, memory-heavy) vs IVF (clustered, lower memory)",
          "Mention pgvector for reusing Postgres and RAG use cases",
        ],
      },
    },
    {
      id: "timeseries-databases",
      title: "Time-Series Databases",
      icon: "📈",
      description: "TSDBs like InfluxDB, TimescaleDB, Prometheus — columnar, downsampling, retention.",
      tags: ["Databases", "Observability", "Storage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Time-Series Databases (TSDBs)</strong> are optimized for append-mostly, time-stamped data — metrics, sensor readings, stock ticks, logs. They use columnar storage, automatic <strong>downsampling</strong> (rollups), and time-bucketed <strong>retention policies</strong> to manage growth. Examples: InfluxDB, TimescaleDB, Prometheus, M3DB.",
        howItWorks: [
          "Writes are append-mostly with a timestamp, tags (indexed), and numeric fields",
          "Storage organized by time chunks (e.g., per-day partitions) — old chunks compressed or dropped",
          "Downsampling: continuous queries / materialized views aggregate raw data into coarser buckets",
          "Retention policy: automatically drop or archive chunks older than a threshold",
          "Queries filter by time range + tag; aggregations (avg, p99) common over windows",
        ],
        keyConcepts: [
          "<strong>Time Bucket</strong> — Partition by time interval (1m, 1h, 1d)",
          "<strong>Downsampling</strong> — Aggregate raw data into coarser granularity",
          "<strong>Retention Policy</strong> — Auto-expire old data",
          "<strong>Tags vs Fields</strong> — Tags indexed (labels); fields are numeric values",
          "<strong>Compression</strong> — Gorilla encoding, delta-of-delta for timestamps",
        ],
        realWorld:
          "Prometheus (metrics). InfluxDB. TimescaleDB (Postgres extension). OpenTSDB. M3DB (Uber). ClickHouse for logs/metrics. Grafana queries them all.",
        tradeoffs: {
          pros: ["High write throughput for time-stamped data", "Efficient time-range queries + aggregations", "Automatic retention and downsampling"],
          cons: ["Not general-purpose (no joins beyond time)", "Schema rigidity for tags", "Storage grows fast without downsampling"],
        },
        codeExample: `# Prometheus metric (counter / gauge / histogram)
http_requests_total{method="GET", status="200"} 12345
http_request_duration_seconds_bucket{le="0.1"} 9800

# PromQL query — p99 latency over 5m
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# TimescaleDB (Postgres extension)
CREATE TABLE metrics (
  time    TIMESTAMPTZ NOT NULL,
  host    TEXT NOT NULL,
  cpu     DOUBLE PRECISION
);
SELECT create_hypertable('metrics', 'time');

-- Continuous aggregate (downsampling)
CREATE MATERIALIZED VIEW metrics_1h
WITH (timescaledb.continuous) AS
SELECT host, time_bucket('1 hour', time) AS bucket,
       avg(cpu) AS avg_cpu, max(cpu) AS max_cpu
FROM metrics GROUP BY host, bucket;

-- Retention: drop data older than 30 days
SELECT add_retention_policy('metrics', INTERVAL '30 days');

# InfluxDB Flux query
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 5m, fn: mean)`,
        interviewTips: [
          "Explain downsampling and retention as core TSDB features",
          "Compare Prometheus (metrics, pull) vs InfluxDB (push, general TSDB)",
          "Mention TimescaleDB as a Postgres extension reusing SQL",
        ],
      },
    },
    {
      id: "graph-databases",
      title: "Graph Databases",
      icon: "🕸️",
      description: "Neo4j, JanusGraph, Dgraph — nodes, edges, Cypher, Gremlin for relationship queries.",
      tags: ["Databases", "Graphs", "Storage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Graph databases</strong> store data as <strong>nodes</strong> (entities) and <strong>edges</strong> (relationships with direction and properties), optimizing for queries that traverse relationships (friend-of-friend, fraud rings, recommendations). Query languages include <strong>Cypher</strong> (Neo4j) and <strong>Gremlin</strong> (TinkerPop). Unlike relational JOINs, graph traversal is constant-time per hop.",
        howItWorks: [
          "Nodes represent entities (User, Product) with labels and properties",
          "Edges represent typed relationships (KNOWS, PURCHASED) with direction and properties",
          "Adjacency is physically stored — each node points directly to its neighbors",
          "Traversal follows edges hop-by-hop without expensive JOINs (O(1) per hop)",
          "Queries use pattern matching (Cypher) or traversal steps (Gremlin)",
        ],
        keyConcepts: [
          "<strong>Node</strong> — Entity with labels (type) and properties",
          "<strong>Edge / Relationship</strong> — Typed, directed, with properties",
          "<strong>Cypher</strong> — Neo4j's declarative pattern-matching query language",
          "<strong>Gremlin</strong> — TinkerPop's traversal language (imperative steps)",
          "<strong>Index-free Adjacency</strong> — Edges physically stored with nodes for O(1) hops",
        ],
        realWorld:
          "Neo4j (most popular). JanusGraph (Amazon, distributed). Dgraph. Amazon Neptune. ArangoDB. Used for fraud detection, social networks, recommendations, knowledge graphs.",
        tradeoffs: {
          pros: ["Excellent for multi-hop relationship queries", "Schema-flexible (properties on nodes/edges)", "Intuitive modeling of connected data"],
          cons: ["Poor fit for non-graph workloads", "Sharding is hard (graph partition problem)", "Less mature ecosystem than SQL DBs"],
        },
        codeExample: `# Cypher (Neo4j) — create nodes and relationships
CREATE (alice:User {name: 'Alice'}),
       (bob:User {name: 'Bob'}),
       (alice)-[:KNOWS {since: 2020}]->(bob);

# Friend-of-friend recommendation
MATCH (me:User {name: 'Alice'})-[:KNOWS]->()-[:KNOWS]->(fof)
WHERE NOT (me)-[:KNOWS]->(fof) AND me <> fof
RETURN fof.name, count(*) AS mutualFriends
ORDER BY mutualFriends DESC LIMIT 5;

# Gremlin (TinkerPop) — equivalent traversal
g.V().has('User','name','Alice')
  .out('KNOWS').out('KNOWS')
  .where(not(out('KNOWS').has('name','Alice')))
  .dedup().groupCount().order(local).by(values,desc)

# Neo4j data model: nodes physically store adjacency pointers
# Traversal cost ~ O(branching_factor) per hop, NOT O(table scan) like SQL JOINs.`,
        interviewTips: [
          "Explain that adjacency is physically stored for O(1) hops",
          "Contrast with SQL JOINs which scan entire tables",
          "Mention Cypher (Neo4j) vs Gremlin (TinkerPop) query languages",
        ],
      },
    },
    {
      id: "columnar-databases",
      title: "Columnar OLAP Databases",
      icon: "📊",
      description: "ClickHouse, BigQuery, Redshift — column storage, vectorized execution for analytics.",
      tags: ["Databases", "Analytics", "OLAP"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Columnar databases</strong> store data by column rather than by row, enabling <strong>vectorized execution</strong> and extreme compression — ideal for analytical (OLAP) workloads that scan many rows but few columns. Examples: <strong>ClickHouse</strong>, <strong>BigQuery</strong>, <strong>Redshift</strong>, Snowflake, Druid. Contrast with row-oriented OLTP (Postgres, MySQL).",
        howItWorks: [
          "Each column is stored separately, often in compressed blocks (run-length, dictionary)",
          "Queries scanning SELECT col1, col2 only read those column blocks (no row scan)",
          "Vectorized execution processes batches of values (e.g., 1024) through the CPU pipeline",
          "Aggregations (SUM, AVG) vectorize extremely well — columnar SIMD-friendly",
          "Column blocks include min/max statistics for zone-map pruning (skip whole blocks)",
        ],
        keyConcepts: [
          "<strong>Column Storage</strong> — Values from one column stored contiguously",
          "<strong>Vectorized Execution</strong> — Process batches of values through CPU",
          "<strong>Zone Maps</strong> — Per-block min/max lets queries skip irrelevant blocks",
          "<strong>Compression</strong> — Run-length, dictionary, delta encoding per column",
          "<strong>OLAP vs OLTP</strong> — Columnar for scans/aggregates; row for point writes",
        ],
        realWorld:
          "ClickHouse (high-performance open source). Google BigQuery (serverless). AWS Redshift. Snowflake. Apache Druid (real-time). Used by Uber, Cloudflare, Bloomberg.",
        tradeoffs: {
          pros: ["Fast scans and aggregations on large datasets", "Excellent compression (10x+)", "Only reads columns the query needs"],
          cons: ["Slow point updates / deletes (rewrite column blocks)", "Poor for transactional (OLTP) workloads", "Single-row inserts are expensive (batched instead)"],
        },
        codeExample: `# ClickHouse table — MergeTree columnar engine
CREATE TABLE events (
  ts        DateTime,
  user_id   UInt64,
  event     LowCardinality(String),
  country   LowCardinality(String),
  amount    Decimal(18,2)
) ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (event, user_id, ts);

-- Aggregation over billions of rows in < 1s
SELECT country, sum(amount) AS revenue, count() AS cnt
FROM events
WHERE ts >= now() - INTERVAL 7 DAY
GROUP BY country
ORDER BY revenue DESC
LIMIT 10;

-- Zone map skips partition blocks where ts out of range
-- LowCardinality encodes strings as dictionary indices (huge compression)

# BigQuery — serverless columnar
SELECT country, SUM(amount) AS revenue
FROM analytics.events
WHERE DATE(ts) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY country
ORDER BY revenue DESC;
-- Cost billed per byte scanned (only the columns in SELECT + WHERE)`,
        interviewTips: [
          "Explain why columnar storage wins for scans/aggregations",
          "Discuss compression (run-length, dictionary) and zone maps",
          "Contrast OLAP columnar vs OLTP row stores",
        ],
      },
    },
  ],
};
