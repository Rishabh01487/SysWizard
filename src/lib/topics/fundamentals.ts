import type { Category } from "./types";

export const FUNDAMENTALS: Category = {
  id: "fundamentals",
  name: "Fundamentals",
  icon: "📘",
  level: "beginner",
  topics: [
    {
      id: "client-server",
      title: "Client-Server Model",
      icon: "🖥️",
      description: "How clients and servers communicate over a network.",
      tags: ["Basics", "Networking"],
      hasAnimation: true,
      content: {
        overview:
          'The Client-Server Model is the foundational architecture of the internet. A <strong>client</strong> (browser, mobile app) sends requests to a <strong>server</strong>, which processes them and returns responses. This request-response cycle is the basis of all web communication.',
        howItWorks: [
          "Client initiates a connection to the server via a network (usually TCP/IP)",
          "Client sends an HTTP request (GET, POST, PUT, DELETE)",
          "Server receives, processes, and generates a response",
          "Server sends the response back (HTML, JSON, etc.)",
          "Connection may be kept alive (HTTP/1.1 keep-alive) or closed",
        ],
        keyConcepts: [
          "<strong>Request-Response Cycle</strong> — Client asks, server answers",
          "<strong>Stateless Protocol</strong> — Each HTTP request is independent",
          "<strong>IP Address & Port</strong> — How clients find servers on the network",
          "<strong>DNS</strong> — Translates domain names to IP addresses",
          "<strong>Client-Side Rendering</strong> — Browser renders UI from server response",
        ],
        realWorld:
          "Every website you visit uses this model. Your browser (client) requests pages from web servers. Mobile apps are clients talking to backend API servers. Email (SMTP) follows client-server too.",
        tradeoffs: {
          pros: ["Simple and well-understood", "Centralized control on server", "Works over any network"],
          cons: ["Server is a single point of failure", "Client must be online", "Server scaling needed for many clients"],
        },
        codeExample: `// Client (browser fetch)
fetch('https://api.example.com/users/42')
  .then(res => res.json())
  .then(user => console.log(user));

// Server (Node.js Express)
app.get('/users/:id', (req, res) => {
  const user = db.find(req.params.id);
  res.json(user);  // Response sent back
});`,
        interviewTips: [
          "Explain the full HTTP request-response cycle",
          "Know the difference between client-side and server-side rendering",
          "Discuss stateless vs stateful protocols",
        ],
      },
    },
    {
      id: "http-rest-apis",
      title: "HTTP & REST APIs",
      icon: "🔗",
      description: "The protocol of the web and the architectural style for designing APIs.",
      tags: ["HTTP", "REST", "API"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>HTTP</strong> is the protocol that powers the web. <strong>REST</strong> (Representational State Transfer) is an architectural style for designing APIs over HTTP, using standard methods (GET, POST, PUT, DELETE) on resources identified by URLs.",
        howItWorks: [
          "Client sends an HTTP request with method, URL, headers, and optional body",
          "Server routes the request to the correct handler based on URL and method",
          "Handler performs the operation (read, create, update, delete)",
          "Server returns an HTTP response with status code and data",
          "REST uses stateless requests — each contains all info needed",
        ],
        keyConcepts: [
          "<strong>HTTP Methods</strong> — GET (read), POST (create), PUT (update), DELETE (remove)",
          "<strong>Status Codes</strong> — 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error",
          "<strong>Resources</strong> — Nouns in URLs (/users, /orders/123), methods are verbs",
          "<strong>Statelessness</strong> — Each request is independent (no server session needed)",
          "<strong>HATEOAS</strong> — Hypermedia links guide API navigation",
        ],
        realWorld:
          "GitHub, Twitter, Stripe all expose REST APIs. Most web apps serve a REST API for their frontend. REST is the default choice for public APIs.",
        tradeoffs: {
          pros: ["Simple and ubiquitous", "Uses standard HTTP", "Easy to cache (GET requests)"],
          cons: ["Over/under-fetching of data", "No built-in schema (unlike GraphQL)", "Multiple round-trips for related data"],
        },
        codeExample: `# REST Endpoints
GET    /api/users          # List users
POST   /api/users          # Create user
GET    /api/users/42       # Get one user
PUT    /api/users/42       # Update user
DELETE /api/users/42       # Delete user

# Response
HTTP/1.1 200 OK
Content-Type: application/json
{ "id": 42, "name": "Jane", "email": "jane@ex.com" }`,
        interviewTips: [
          "Know all HTTP methods and their idempotency",
          "Explain REST constraints (statelessness, uniform interface)",
          "Discuss when REST is better than GraphQL",
        ],
      },
    },
    {
      id: "scaling",
      title: "Vertical vs Horizontal Scaling",
      icon: "📈",
      description: "Scaling up (bigger machine) vs scaling out (more machines).",
      tags: ["Scalability", "Architecture"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Vertical Scaling (Scale Up)</strong> adds more power to a single machine (CPU, RAM). <strong>Horizontal Scaling (Scale Out)</strong> adds more machines. Vertical is simple but has a hard limit; horizontal is complex but theoretically unlimited.",
        howItWorks: [
          "Vertical: Upgrade server — more CPU, RAM, faster disk (e.g., 16GB → 128GB)",
          "Horizontal: Add more servers behind a load balancer",
          "Vertical needs downtime to upgrade hardware",
          "Horizontal can be done live (add servers without stopping)",
          "Databases often scale vertically; stateless apps scale horizontally",
        ],
        keyConcepts: [
          "<strong>Scale Up</strong> — Bigger machine (vertical)",
          "<strong>Scale Out</strong> — More machines (horizontal)",
          "<strong>Stateless Services</strong> — Easy to scale horizontally",
          "<strong>Shared-Nothing</strong> — Each node independent (best for horizontal)",
          "<strong>Auto-Scaling</strong> — Automatically add/remove nodes based on load",
        ],
        realWorld:
          "AWS lets you resize EC2 instances (vertical). Kubernetes scales pods (horizontal). Netflix scales horizontally to thousands of instances. Databases often scale vertically until they must shard.",
        tradeoffs: {
          pros: ["Vertical: Simple, no code changes", "Horizontal: No hard limit, fault tolerant"],
          cons: ["Vertical: Hardware limit, downtime", "Horizontal: Complexity, state management, load balancing"],
        },
        codeExample: `# Vertical Scaling
Small Server (2 vCPU, 4GB) → Medium (4 vCPU, 8GB)
  → Large (8 vCPU, 16GB) → XLarge (16 vCPU, 32GB)
  ...eventually hits hardware limit!

# Horizontal Scaling
1 server → 2 servers → 4 → 8 → 16 → 100...
  Load balancer distributes traffic
  No theoretical limit`,
        interviewTips: [
          "Know when to scale vertically vs horizontally",
          "Explain why databases are hard to scale horizontally",
          "Discuss stateful vs stateless scaling",
        ],
      },
    },
    {
      id: "latency-throughput",
      title: "Latency & Throughput",
      icon: "⏱️",
      description: "The two fundamental performance metrics every engineer must understand.",
      tags: ["Performance", "Metrics"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Latency</strong> is the time taken for a single request to complete (e.g., 50ms). <strong>Throughput</strong> is the number of requests processed per unit time (e.g., 1000 req/s). They are related but distinct — optimizing one may hurt the other.",
        howItWorks: [
          "Latency = time from request sent to response received",
          "Throughput = requests completed per second",
          "High latency can still have high throughput (pipeline many requests)",
          "Percentiles matter: p50, p95, p99 latency (not just average)",
          "Bottleneck analysis: find the slowest component in the path",
        ],
        keyConcepts: [
          "<strong>Latency</strong> — Response time for one request",
          "<strong>Throughput</strong> — Requests per second (RPS)",
          "<strong>p99 Latency</strong> — 99% of requests are faster than this",
          "<strong>Little's Law</strong> — L = λ × W (concurrency = throughput × latency)",
          "<strong>Tail Latency</strong> — The slowest requests matter most for UX",
        ],
        realWorld:
          "Google found that 100ms extra latency = 0.7% fewer searches. Amazon found 100ms = 1% fewer sales. CDNs and caching reduce latency. Sharding and parallelism increase throughput.",
        tradeoffs: {
          pros: ["Measuring both gives full performance picture", "Percentiles reveal tail behavior"],
          cons: ["Optimizing one may hurt the other", "Percentiles are harder to compute than averages", "Distributed systems add latency"],
        },
        codeExample: `# Latency: single request timing
start = now()
response = fetch('/api/data')
latency_ms = now() - start   # e.g., 45ms

# Throughput: requests per second
1000 requests in 2 seconds → 500 req/s

# Percentiles (matters more than average!)
p50 = 20ms (half faster, half slower)
p95 = 80ms (5% slower than this)
p99 = 250ms (1% slower — the painful ones!)`,
        interviewTips: [
          "Explain why p99 matters more than average",
          "Know Little's Law and apply it",
          "Discuss latency vs throughput trade-offs",
        ],
      },
    },
    {
      id: "proxies",
      title: "Proxies (Forward & Reverse)",
      icon: "🔀",
      description: "Intermediaries that forward requests between clients and servers.",
      tags: ["Networking", "Proxy", "Nginx"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>proxy</strong> is an intermediary that forwards requests. A <strong>forward proxy</strong> sits in front of clients (hiding their identity). A <strong>reverse proxy</strong> sits in front of servers (hiding server identity, providing load balancing, caching, SSL).",
        howItWorks: [
          "Forward Proxy: Client → Proxy → Internet → Server (proxy hides client)",
          "Reverse Proxy: Client → Internet → Proxy → Server (proxy hides servers)",
          "Forward proxies are used for anonymity, filtering, caching",
          "Reverse proxies handle load balancing, SSL termination, caching",
          "Both can inspect and modify traffic",
        ],
        keyConcepts: [
          "<strong>Forward Proxy</strong> — Represents the client (e.g., corporate proxy, VPN)",
          "<strong>Reverse Proxy</strong> — Represents the server (e.g., Nginx, HAProxy)",
          "<strong>SSL Termination</strong> — Decrypt HTTPS at proxy, forward HTTP",
          "<strong>Load Balancing</strong> — Distribute traffic across backend servers",
          "<strong>Caching</strong> — Store responses to serve future requests faster",
        ],
        realWorld:
          "Nginx and HAProxy are popular reverse proxies. Squid is a forward proxy. Cloudflare acts as a reverse proxy for millions of sites. Corporate networks use forward proxies for filtering.",
        tradeoffs: {
          pros: ["Security (hide backend/client)", "Caching and compression", "Centralized SSL and logging"],
          cons: ["Added latency (extra hop)", "Single point of failure if not redundant", "Configuration complexity"],
        },
        codeExample: `# Forward Proxy (client-side)
Client → Corporate Proxy → Internet → Server
  (proxy hides client identity)

# Reverse Proxy (server-side) - Nginx
server {
  listen 80;
  location / {
    proxy_pass http://backend;  # forward to app servers
    proxy_set_header X-Real-IP $remote_addr;
  }
}`,
        interviewTips: [
          "Clearly distinguish forward vs reverse proxy",
          "Explain SSL termination benefits",
          "Discuss how reverse proxies enable load balancing",
        ],
      },
    },
    {
      id: "db-indexing",
      title: "Database Indexing",
      icon: "📇",
      description: "Data structures that dramatically speed up database queries.",
      tags: ["Database", "Performance", "B-Tree"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>database index</strong> is a data structure that improves query speed. Without an index, the DB scans every row (O(n)). With an index (usually a B-Tree), it finds rows in O(log n). Indexes trade write speed and storage for read speed.",
        howItWorks: [
          "Index created on a column (e.g., CREATE INDEX ON users(email))",
          "Index stores column values sorted with pointers to rows",
          "Query on indexed column → B-Tree lookup (fast) instead of full scan",
          "Writes must update the index (slower inserts/updates)",
          "Composite indexes cover multiple columns for multi-column queries",
        ],
        keyConcepts: [
          "<strong>B-Tree</strong> — Balanced tree, O(log n) lookups (default for most DBs)",
          "<strong>Hash Index</strong> — O(1) for exact matches only (no range queries)",
          "<strong>Composite Index</strong> — Multiple columns (order matters!)",
          "<strong>Covering Index</strong> — Contains all columns a query needs (no table lookup)",
          "<strong>Partial Index</strong> — Index only rows matching a condition (saves space)",
        ],
        realWorld:
          "Every production database uses indexes. PostgreSQL, MySQL, MongoDB all use B-Tree indexes. Without indexes, queries on millions of rows would take seconds instead of milliseconds.",
        tradeoffs: {
          pros: ["Dramatically faster reads (1000x+)", "Enables fast sorting and joins", "Unique indexes enforce constraints"],
          cons: ["Slower writes (must update index)", "Extra storage space", "Too many indexes hurt write performance"],
        },
        codeExample: `# Create indexes
CREATE INDEX idx_email ON users(email);          # single column
CREATE INDEX idx_name_age ON users(last_name, age);  # composite
CREATE UNIQUE INDEX idx_uniq ON users(email);    # unique

# Query plan: uses index
EXPLAIN SELECT * FROM users WHERE email = 'a@b.com';
# → "Index Scan using idx_email" (fast!)

# Without index:
# → "Seq Scan" (reads every row — slow!)`,
        interviewTips: [
          "Explain B-Tree vs Hash index",
          "Know composite index column ordering (leftmost prefix)",
          "Discuss when NOT to index (small tables, write-heavy)",
        ],
      },
    },
    {
      id: "sql-vs-nosql",
      title: "SQL vs NoSQL",
      icon: "🗃️",
      description: "Relational vs non-relational databases — when to use which.",
      tags: ["Database", "SQL", "NoSQL"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SQL</strong> (relational) databases store structured data in tables with strict schemas (PostgreSQL, MySQL). <strong>NoSQL</strong> databases store flexible, unstructured data (MongoDB documents, Redis key-value, Cassandra wide-column). The choice depends on data structure and scale needs.",
        howItWorks: [
          "SQL: Data in tables with rows/columns, schema enforced, ACID transactions",
          "NoSQL: Various models — document, key-value, column-family, graph",
          "SQL uses JOINs to combine related data across tables",
          "NoSQL denormalizes data (embed related data) to avoid joins",
          "SQL scales vertically; many NoSQL DBs scale horizontally (sharding built-in)",
        ],
        keyConcepts: [
          "<strong>ACID</strong> — Atomic, Consistent, Isolated, Durable (SQL guarantee)",
          "<strong>BASE</strong> — Basically Available, Soft state, Eventual consistency (NoSQL)",
          "<strong>Document DB</strong> — MongoDB, CouchDB (JSON-like documents)",
          "<strong>Key-Value DB</strong> — Redis, DynamoDB (simple fast lookups)",
          "<strong>Column-Family</strong> — Cassandra, HBase (wide rows, time-series)",
        ],
        realWorld:
          "PostgreSQL powers Instagram, Apple. MySQL powers Facebook, Twitter. MongoDB powers Uber, eBay. Redis for caching everywhere. Cassandra for Netflix, Apple (time-series at scale).",
        tradeoffs: {
          pros: ["SQL: ACID, mature, expressive queries", "NoSQL: Horizontal scaling, flexible schema, fast for specific patterns"],
          cons: ["SQL: Hard to scale horizontally, rigid schema", "NoSQL: Weaker consistency, less expressive queries, less mature"],
        },
        codeExample: `# SQL (PostgreSQL) - Structured
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE
);
SELECT * FROM users JOIN orders ON users.id = orders.user_id;

# NoSQL (MongoDB) - Flexible document
db.users.insertOne({
  name: "Jane",
  email: "jane@ex.com",
  orders: [                    # embedded (denormalized)
    { item: "Book", price: 20 }
  ]
});
db.users.find({ "orders.item": "Book" });`,
        interviewTips: [
          "Know when to use SQL vs NoSQL",
          "Explain ACID vs BASE trade-offs",
          "Discuss CAP theorem implications for NoSQL",
        ],
      },
    },
    {
      id: "networking-basics",
      title: "Networking Basics (TCP/IP & UDP)",
      icon: "🌐",
      description: "The fundamental protocols that power all internet communication.",
      tags: ["Networking", "TCP", "UDP"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>TCP/IP</strong> is the foundation of the internet. <strong>TCP</strong> provides reliable, ordered, connection-oriented delivery. <strong>UDP</strong> provides fast, connectionless, unreliable delivery. Understanding when to use each is essential for system design.",
        howItWorks: [
          "TCP: 3-way handshake (SYN, SYN-ACK, ACK) establishes connection",
          "TCP guarantees delivery: retransmits lost packets, orders them",
          "UDP: fire-and-forget — no connection, no guarantees, no ordering",
          "TCP used for web (HTTP), email, file transfer (reliability needed)",
          "UDP used for DNS, video streaming, gaming (speed over reliability)",
        ],
        keyConcepts: [
          "<strong>TCP</strong> — Reliable, ordered, connection-oriented",
          "<strong>UDP</strong> — Fast, unreliable, connectionless",
          "<strong>3-Way Handshake</strong> — SYN → SYN-ACK → ACK (TCP setup)",
          "<strong>Flow Control</strong> — TCP adjusts speed to avoid overwhelming receiver",
          "<strong>Port Numbers</strong> — 80 (HTTP), 443 (HTTPS), 53 (DNS), 22 (SSH)",
        ],
        realWorld:
          "HTTP/1.1 and HTTP/2 run over TCP. HTTP/3 uses QUIC (UDP-based). Video calls use UDP (WebRTC). DNS uses UDP. Online games use UDP for low latency.",
        tradeoffs: {
          pros: ["TCP: Reliable, ordered, widely used", "UDP: Low latency, no overhead, good for streaming"],
          cons: ["TCP: Higher latency, overhead from acknowledgments", "UDP: No delivery guarantee, may arrive out of order"],
        },
        codeExample: `# TCP (reliable)
Client → SYN → Server
Server → SYN-ACK → Client
Client → ACK → Server
(Connection established, data flows reliably)

# UDP (fast, unreliable)
Client → DATAGRAM → Server  (no handshake!)
(may or may not arrive)

# Port numbers
HTTP: 80    HTTPS: 443
DNS: 53     SSH: 22
SMTP: 25    MySQL: 3306`,
        interviewTips: [
          "Explain TCP 3-way handshake",
          "Compare TCP vs UDP with real examples",
          "Know why video streaming uses UDP",
        ],
      },
    },
    {
      id: "acid-transactions",
      title: "ACID Transactions",
      icon: "🔒",
      description: "The four guarantees that make database transactions reliable.",
      tags: ["Database", "Transactions", "Reliability"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>ACID</strong> guarantees reliable database transactions: <strong>Atomicity</strong> (all or nothing), <strong>Consistency</strong> (valid state), <strong>Isolation</strong> (concurrent transactions don't interfere), <strong>Durability</strong> (committed data survives crashes).",
        howItWorks: [
          "BEGIN TRANSACTION — start a transaction",
          "Execute multiple operations (reads, writes)",
          "All operations succeed → COMMIT (save all changes)",
          "Any operation fails → ROLLBACK (undo all changes)",
          "Isolation levels control how concurrent transactions interact",
        ],
        keyConcepts: [
          "<strong>Atomicity</strong> — All operations succeed or none do (no partial)",
          "<strong>Consistency</strong> — Transaction brings DB from one valid state to another",
          "<strong>Isolation</strong> — Concurrent transactions appear to execute sequentially",
          "<strong>Durability</strong> — Committed data survives crashes (written to disk)",
          "<strong>Isolation Levels</strong> — Read Uncommitted, Read Committed, Repeatable Read, Serializable",
        ],
        realWorld:
          "Banking: Transfer $100 must debit one account AND credit another atomically. PostgreSQL, MySQL (InnoDB), Oracle all provide ACID. NoSQL databases often sacrifice ACID for performance/scaling.",
        tradeoffs: {
          pros: ["Guaranteed data integrity", "Safe concurrent access", "Crash recovery"],
          cons: ["Locking reduces concurrency", "Performance overhead", "Harder to scale distributed ACID"],
        },
        codeExample: `# Bank Transfer (must be atomic!)
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100
    WHERE id = 1;  -- debit
  UPDATE accounts SET balance = balance + 100
    WHERE id = 2;  -- credit
COMMIT;  -- both succeed or both roll back

# If debit succeeds but credit fails:
ROLLBACK;  -- undo the debit too!
# Money is never lost or created`,
        interviewTips: [
          "Explain each ACID property with examples",
          "Know isolation levels and their trade-offs",
          "Discuss why distributed ACID is hard (2PC)",
        ],
      },
    },
    {
      id: "data-serialization",
      title: "Data Serialization",
      icon: "📦",
      description: "Converting data structures to formats for storage and transmission.",
      tags: ["Data", "Serialization", "JSON"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Serialization</strong> converts in-memory data structures into a format for storage or transmission. <strong>Deserialization</strong> reverses it. Formats trade off human-readability, size, and speed: JSON (readable), Protobuf/Thrift (compact, fast), Avro (schema-evolution friendly).",
        howItWorks: [
          "Object in memory → serialize → bytes (for network or disk)",
          "Receiver deserializes bytes → object in memory",
          "Schema defines the structure (may be explicit or implicit)",
          "Human-readable formats (JSON, XML) are larger but debuggable",
          "Binary formats (Protobuf) are smaller and faster but opaque",
        ],
        keyConcepts: [
          "<strong>JSON</strong> — Human-readable, ubiquitous, larger size",
          "<strong>Protocol Buffers</strong> — Binary, schema-based, compact (Google)",
          "<strong>Apache Avro</strong> — Schema embedded, good for evolution (Kafka)",
          "<strong>MessagePack</strong> — Binary JSON, compact but JSON-compatible",
          "<strong>Schema Evolution</strong> — Adding/removing fields without breaking",
        ],
        realWorld:
          "REST APIs use JSON. gRPC uses Protobuf. Kafka uses Avro/Protobuf. Database BLOBs store serialized objects. Caching (Redis) serializes values.",
        tradeoffs: {
          pros: ["JSON: Universal, debuggable", "Protobuf: 3-10x smaller and faster", "Avro: Great schema evolution"],
          cons: ["JSON: Large, slow to parse", "Protobuf: Not human-readable, needs schema", "Binary: Harder to debug"],
        },
        codeExample: `# JSON (human-readable)
{ "name": "Jane", "age": 30, "city": "NYC" }
# ~35 bytes

# Protocol Buffers (binary)
field1="Jane" field2=30 field3="NYC"
# ~18 bytes (binary, not readable)

# Serialization speed comparison:
JSON:       100ms (parse 1MB)
Protobuf:   15ms  (7x faster!)
MessagePack: 20ms`,
        interviewTips: [
          "Compare JSON vs Protobuf vs Avro",
          "Explain when to use binary formats",
          "Discuss schema evolution strategies",
        ],
      },
    },
  ],
};
