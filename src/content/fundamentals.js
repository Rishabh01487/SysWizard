/**
 * Category: Fundamentals (Beginner)
 * Core concepts every system design learner must know first.
 */
export const FUNDAMENTALS = {
    id: 'fundamentals',
    name: 'Fundamentals',
    icon: '📘',
    level: 'beginner',
    topics: [
        {
            id: 'client-server',
            title: 'Client-Server Model',
            icon: '🖥️',
            description: 'How clients and servers communicate over a network.',
            tags: ['Basics', 'Networking'],
            hasAnimation: true,
            content: {
                overview: 'The Client-Server Model is the foundational architecture of the internet. A <strong>client</strong> (browser, mobile app) sends requests to a <strong>server</strong>, which processes them and returns responses. This request-response cycle is the basis of all web communication.',
                howItWorks: [
                    'Client initiates a connection to the server via a network (usually TCP/IP)',
                    'Client sends an HTTP request (GET, POST, PUT, DELETE)',
                    'Server receives, processes, and generates a response',
                    'Server sends the response back (HTML, JSON, etc.)',
                    'Connection may be kept alive (HTTP/1.1 keep-alive) or closed'
                ],
                keyConcepts: [
                    '<strong>Request-Response Cycle</strong> — Client asks, server answers',
                    '<strong>Stateless Protocol</strong> — Each HTTP request is independent',
                    '<strong>IP Address & Port</strong> — How clients find servers on the network',
                    '<strong>DNS</strong> — Translates domain names to IP addresses',
                    '<strong>Thick vs Thin Client</strong> — How much logic runs client-side'
                ],
                realWorld: 'When you open google.com, your browser (client) sends an HTTP GET request to Google\'s server. The server processes your request, queries its databases, and returns the HTML page you see. Netflix, Amazon, and every website follows this pattern.',
                tradeoffs: {
                    pros: ['Simple and well-understood', 'Centralized data management', 'Easy to secure at server level'],
                    cons: ['Single point of failure (server)', 'Server can become bottleneck', 'Network latency affects performance']
                },
                codeExample: `// Simple HTTP Request (Client)
fetch('https://api.example.com/users/1')
  .then(response => response.json())
  .then(data => console.log(data));

// Server Response
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}`,
                interviewTips: [
                    'Explain the difference between client-server and peer-to-peer',
                    'Discuss stateless vs stateful protocol implications',
                    'Know when to use WebSockets vs REST for real-time needs'
                ]
            }
        },
        {
            id: 'http-rest-apis',
            title: 'HTTP & REST APIs',
            icon: '🔗',
            description: 'The request-response protocol and RESTful API design principles.',
            tags: ['API', 'Protocol', 'HTTP'],
            hasAnimation: true,
            content: {
                overview: '<strong>HTTP</strong> (HyperText Transfer Protocol) is the foundation of data communication on the web. <strong>REST</strong> (Representational State Transfer) is an architectural style for designing APIs that uses HTTP methods to perform CRUD operations on resources.',
                howItWorks: [
                    'Client sends HTTP request with a method (GET/POST/PUT/DELETE), URL, headers, and optional body',
                    'Server routes the request to the appropriate handler',
                    'Handler processes the request (queries DB, computes results)',
                    'Server returns HTTP response with status code, headers, and body',
                    'Common status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error'
                ],
                keyConcepts: [
                    '<strong>HTTP Methods</strong> — GET (read), POST (create), PUT (update), DELETE (remove), PATCH (partial update)',
                    '<strong>Status Codes</strong> — 2xx success, 3xx redirect, 4xx client error, 5xx server error',
                    '<strong>Headers</strong> — Content-Type, Authorization, Cache-Control, Accept',
                    '<strong>REST Constraints</strong> — Stateless, Uniform Interface, Client-Server, Cacheable, Layered',
                    '<strong>Idempotency</strong> — GET, PUT, DELETE are idempotent; POST is not'
                ],
                realWorld: 'Twitter\'s REST API: GET /tweets/123 fetches a tweet, POST /tweets creates a new tweet, DELETE /tweets/123 removes a tweet. Stripe, GitHub, and most SaaS products expose REST APIs.',
                tradeoffs: {
                    pros: ['Simple and standardized', 'Cacheable (GET requests)', 'Stateless — easy to scale horizontally'],
                    cons: ['Over-fetching or under-fetching data', 'Multiple round trips for related data', 'No built-in real-time support']
                },
                codeExample: `// REST API Examples
GET    /api/users          → List all users
GET    /api/users/42       → Get user #42
POST   /api/users          → Create new user
PUT    /api/users/42       → Update user #42
DELETE /api/users/42       → Delete user #42

// Response
HTTP/1.1 200 OK
Content-Type: application/json
{ "id": 42, "name": "Jane" }`,
                interviewTips: [
                    'Know all HTTP methods and when to use each',
                    'Explain idempotency and why it matters',
                    'Compare REST vs GraphQL vs gRPC'
                ]
            }
        },
        {
            id: 'scaling',
            title: 'Vertical vs Horizontal Scaling',
            icon: '📈',
            description: 'Scale up (bigger machine) vs scale out (more machines) strategies.',
            tags: ['Scalability', 'Infrastructure'],
            hasAnimation: true,
            content: {
                overview: 'When your system can\'t handle the load, you have two options: <strong>Vertical Scaling</strong> (scale up) means getting a more powerful machine. <strong>Horizontal Scaling</strong> (scale out) means adding more machines. Understanding this trade-off is fundamental to system design.',
                howItWorks: [
                    'Vertical: Upgrade CPU, RAM, SSD of existing server (e.g., 8GB → 64GB RAM)',
                    'Horizontal: Add more server instances behind a load balancer',
                    'Vertical has a hardware ceiling; Horizontal is theoretically unlimited',
                    'Horizontal requires data partitioning and stateless application design',
                    'Most production systems use a combination of both'
                ],
                keyConcepts: [
                    '<strong>Vertical Scaling</strong> — Bigger machine, simpler but limited',
                    '<strong>Horizontal Scaling</strong> — More machines, complex but unlimited',
                    '<strong>Elasticity</strong> — Auto-scaling based on demand',
                    '<strong>Stateless Services</strong> — Required for horizontal scaling',
                    '<strong>Shared Nothing Architecture</strong> — Each node is independent'
                ],
                realWorld: 'YouTube started on a single server, then scaled vertically, then horizontally to thousands of servers. AWS EC2 lets you scale vertically (bigger instance) or horizontally (more instances + load balancer).',
                tradeoffs: {
                    pros: ['Vertical: Simple, no code changes needed', 'Horizontal: No hardware limit, fault tolerant'],
                    cons: ['Vertical: Hardware ceiling, single point of failure', 'Horizontal: Complex, needs load balancing & data partitioning']
                },
                codeExample: `# Vertical Scaling
Server A: 4 CPU, 8GB RAM → 16 CPU, 64GB RAM
Cost: $100/mo → $800/mo (8x cost for 4x power)

# Horizontal Scaling
Server A: 4 CPU, 8GB RAM
Server B: 4 CPU, 8GB RAM  (add more!)
Server C: 4 CPU, 8GB RAM
Load Balancer → distributes traffic
Cost: $100/mo × 3 = $300/mo (linear scaling)`,
                interviewTips: [
                    'Always discuss both options and when each is appropriate',
                    'Mention that horizontal scaling requires stateless design',
                    'Know that databases are harder to scale horizontally than app servers'
                ]
            }
        },
        {
            id: 'latency-throughput',
            title: 'Latency & Throughput',
            icon: '⏱️',
            description: 'Understanding the two most critical performance metrics.',
            tags: ['Performance', 'Metrics'],
            hasAnimation: true,
            content: {
                overview: '<strong>Latency</strong> is the time it takes for a single request to travel from client to server and back. <strong>Throughput</strong> is the number of requests a system can handle per unit of time. These are the two most important performance metrics in system design.',
                howItWorks: [
                    'Latency = Time for a single operation (measured in ms or μs)',
                    'Throughput = Operations per second (measured in req/s, QPS, TPS)',
                    'Network latency: time for data to travel across the network',
                    'Processing latency: time for server to compute the response',
                    'High throughput doesn\'t mean low latency (batch processing has high throughput but high latency)'
                ],
                keyConcepts: [
                    '<strong>P50/P95/P99 Latency</strong> — Percentile-based latency measurements',
                    '<strong>QPS</strong> — Queries Per Second (throughput measure)',
                    '<strong>Bandwidth</strong> — Maximum data transfer rate of a link',
                    '<strong>Tail Latency</strong> — Worst-case latencies (P99, P99.9)',
                    '<strong>Latency Numbers</strong> — L1 cache: 0.5ns, RAM: 100ns, SSD: 150μs, Network: 150ms'
                ],
                realWorld: 'Google targets <200ms search latency. Amazon found that every 100ms of latency costs 1% of sales. Discord handles 25 million QPS. High-frequency trading systems optimize for microsecond latency.',
                tradeoffs: {
                    pros: ['Low latency = better user experience', 'High throughput = handle more users'],
                    cons: ['Optimizing for one may hurt the other', 'Caching reduces latency but adds complexity', 'Geographic distribution reduces latency but increases consistency challenges']
                },
                codeExample: `Latency Numbers Every Programmer Should Know:
─────────────────────────────────────────
L1 cache reference:           0.5 ns
L2 cache reference:             7 ns
Main memory (RAM):            100 ns
SSD random read:          150,000 ns  (150 μs)
HDD seek:              10,000,000 ns  (10 ms)
Same datacenter round trip:  500,000 ns  (0.5 ms)
California → Netherlands: 150,000,000 ns (150 ms)`,
                interviewTips: [
                    'Memorize the latency numbers table',
                    'Discuss P50 vs P99 latency and why tail latency matters',
                    'Explain how caching, CDNs, and data locality reduce latency'
                ]
            }
        },
        {
            id: 'proxies',
            title: 'Proxies (Forward & Reverse)',
            icon: '🔀',
            description: 'Intermediaries that sit between clients and servers.',
            tags: ['Networking', 'Security'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>proxy</strong> is an intermediary server between clients and backend servers. A <strong>forward proxy</strong> acts on behalf of clients (hiding their identity). A <strong>reverse proxy</strong> acts on behalf of servers (hiding server details, load balancing).',
                howItWorks: [
                    'Forward Proxy: Client → Proxy → Internet (client identity hidden)',
                    'Reverse Proxy: Internet → Proxy → Backend Servers (server identity hidden)',
                    'Reverse proxies handle SSL termination, caching, compression',
                    'Can route requests to different backend services based on URL paths',
                    'Provide an additional layer of security and abstraction'
                ],
                keyConcepts: [
                    '<strong>Forward Proxy</strong> — Hides client IP, used for anonymity/filtering (VPN, corporate firewall)',
                    '<strong>Reverse Proxy</strong> — Hides server details, used for load balancing/SSL (Nginx, HAProxy)',
                    '<strong>SSL Termination</strong> — Proxy handles HTTPS, backend uses plain HTTP',
                    '<strong>Caching Proxy</strong> — Caches responses to reduce backend load',
                    '<strong>API Gateway</strong> — Specialized reverse proxy for microservices'
                ],
                realWorld: 'Nginx serves as a reverse proxy for millions of websites. Cloudflare acts as a reverse proxy providing DDoS protection and CDN. Corporate networks use forward proxies to filter employee internet access.',
                tradeoffs: {
                    pros: ['Security (hides internal architecture)', 'Performance (caching, compression)', 'Flexibility (routing, A/B testing)'],
                    cons: ['Single point of failure if not redundant', 'Adds latency (extra network hop)', 'Increased complexity in debugging']
                },
                codeExample: `# Nginx Reverse Proxy Config
server {
    listen 80;
    server_name api.example.com;

    location /users {
        proxy_pass http://user-service:3000;
    }
    location /orders {
        proxy_pass http://order-service:3001;
    }
}`,
                interviewTips: [
                    'Know the difference between forward and reverse proxy',
                    'Explain how reverse proxies enable zero-downtime deployments',
                    'Discuss Nginx vs HAProxy vs cloud load balancers'
                ]
            }
        },
        {
            id: 'db-indexing',
            title: 'Database Indexing',
            icon: '📇',
            description: 'How indexes dramatically speed up database queries using B-Trees and Hash indexes.',
            tags: ['Database', 'Performance', 'B-Tree'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>database index</strong> is a data structure that improves the speed of data retrieval. Without an index, the database must scan every row (full table scan). With an index, it can jump directly to the relevant rows, like a book\'s index helps you find pages.',
                howItWorks: [
                    'An index creates a separate data structure (B-Tree or Hash) pointing to table rows',
                    'B-Tree index: sorted tree structure, supports range queries (>, <, BETWEEN)',
                    'Hash index: hash table, only supports exact equality lookups (=)',
                    'When you query with WHERE clause, the DB optimizer checks if an index exists',
                    'Composite indexes cover multiple columns (e.g., INDEX(city, age))'
                ],
                keyConcepts: [
                    '<strong>B-Tree Index</strong> — Default index type, balanced tree, O(log n) lookup',
                    '<strong>Hash Index</strong> — O(1) for equality, no range queries',
                    '<strong>Composite Index</strong> — Multi-column index, leftmost prefix rule applies',
                    '<strong>Covering Index</strong> — Index contains all queried columns, no table lookup needed',
                    '<strong>Full Table Scan</strong> — Reading every row, O(n), what happens without indexes'
                ],
                realWorld: 'An e-commerce database with 10 million products: without an index on "category", searching for "Electronics" scans all 10M rows (~10 seconds). With an index, it takes ~10 milliseconds. Amazon indexes product tables on multiple columns.',
                tradeoffs: {
                    pros: ['Dramatically faster reads (O(log n) vs O(n))', 'Essential for large datasets', 'Support efficient sorting and range queries'],
                    cons: ['Slower writes (index must be updated on INSERT/UPDATE/DELETE)', 'Uses additional disk space', 'Too many indexes can hurt write performance']
                },
                codeExample: `-- Without index: Full table scan (slow!)
SELECT * FROM users WHERE email = 'john@example.com';
-- Scans 10,000,000 rows → 8 seconds

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- With index: B-Tree lookup (fast!)
SELECT * FROM users WHERE email = 'john@example.com';
-- B-Tree traversal → 2 milliseconds

-- Composite index for common queries
CREATE INDEX idx_orders_user_date
  ON orders(user_id, created_at);`,
                interviewTips: [
                    'Know when to use B-Tree vs Hash indexes',
                    'Explain the write penalty of too many indexes',
                    'Discuss composite index column ordering'
                ]
            }
        },
        {
            id: 'sql-vs-nosql',
            title: 'SQL vs NoSQL',
            icon: '🗃️',
            description: 'Relational databases vs document, key-value, column, and graph stores.',
            tags: ['Database', 'Storage', 'Comparison'],
            hasAnimation: true,
            content: {
                overview: '<strong>SQL databases</strong> (PostgreSQL, MySQL) store data in structured tables with relationships and enforce schemas. <strong>NoSQL databases</strong> (MongoDB, Redis, Cassandra) offer flexible schemas and different data models optimized for specific use cases.',
                howItWorks: [
                    'SQL: Data stored in tables with rows and columns, related via foreign keys',
                    'NoSQL Document (MongoDB): Data stored as JSON-like documents, flexible schema',
                    'NoSQL Key-Value (Redis): Simple key→value pairs, blazing fast reads',
                    'NoSQL Column-Family (Cassandra): Data stored by columns, great for analytics',
                    'NoSQL Graph (Neo4j): Nodes and edges, optimized for relationship queries'
                ],
                keyConcepts: [
                    '<strong>ACID</strong> — Atomicity, Consistency, Isolation, Durability (SQL guarantees)',
                    '<strong>BASE</strong> — Basically Available, Soft state, Eventually consistent (NoSQL trade-off)',
                    '<strong>Schema-on-Write</strong> (SQL) vs <strong>Schema-on-Read</strong> (NoSQL)',
                    '<strong>Joins</strong> — SQL supports complex joins; NoSQL typically doesn\'t',
                    '<strong>Horizontal Scaling</strong> — NoSQL designed for it; SQL is harder to shard'
                ],
                realWorld: 'Banks use PostgreSQL (ACID transactions for money). Instagram uses PostgreSQL + Cassandra. Redis is used by Twitter for caching timelines. Neo4j powers LinkedIn\'s connection graph. MongoDB is popular for content management.',
                tradeoffs: {
                    pros: ['SQL: Strong consistency, complex queries, mature tooling', 'NoSQL: Flexible schema, horizontal scaling, high performance for specific patterns'],
                    cons: ['SQL: Hard to scale horizontally, rigid schema', 'NoSQL: Limited joins, eventual consistency, less standardized']
                },
                codeExample: `-- SQL (PostgreSQL)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE
);
SELECT u.name, o.total
FROM users u JOIN orders o ON u.id = o.user_id;

// NoSQL (MongoDB)
db.users.insertOne({
  name: "John",
  email: "john@example.com",
  orders: [{ total: 99.99 }]  // embedded!
});`,
                interviewTips: [
                    'Know when to choose SQL vs NoSQL (use case dependent)',
                    'Explain ACID vs BASE trade-offs',
                    'Discuss that many systems use BOTH (polyglot persistence)'
                ]
            }
        },
        {
            id: 'networking-basics',
            title: 'Networking Basics (TCP/IP & UDP)',
            icon: '🌐',
            description: 'How data travels across the internet — TCP reliability vs UDP speed.',
            tags: ['Networking', 'Protocol', 'TCP'],
            hasAnimation: true,
            content: {
                overview: '<strong>TCP/IP</strong> is the backbone of internet communication. <strong>TCP</strong> provides reliable, ordered delivery of data (used for web, email, file transfer). <strong>UDP</strong> provides fast, unreliable delivery (used for video streaming, gaming, DNS).',
                howItWorks: [
                    'TCP: 3-way handshake (SYN → SYN-ACK → ACK) establishes connection',
                    'TCP guarantees delivery via acknowledgments and retransmission',
                    'TCP provides flow control and congestion control',
                    'UDP: No handshake, just sends packets (datagrams) — fire and forget',
                    'IP layer handles addressing and routing of packets across networks'
                ],
                keyConcepts: [
                    '<strong>TCP 3-Way Handshake</strong> — SYN, SYN-ACK, ACK to establish connection',
                    '<strong>Reliable Delivery</strong> — TCP retransmits lost packets, guarantees order',
                    '<strong>UDP</strong> — No connection setup, no guarantees, but very fast',
                    '<strong>OSI Model</strong> — 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application',
                    '<strong>Ports</strong> — HTTP(80), HTTPS(443), DNS(53), SSH(22)'
                ],
                realWorld: 'Netflix uses TCP for browsing the catalog (reliability matters) but UDP for video streaming (speed matters, a few dropped frames are fine). Online games use UDP for player positions but TCP for chat messages.',
                tradeoffs: {
                    pros: ['TCP: Reliable, ordered delivery', 'UDP: Low latency, no connection overhead'],
                    cons: ['TCP: Higher latency due to handshake and acks', 'UDP: Packets can be lost, duplicated, or arrive out of order']
                },
                codeExample: `TCP Connection (Reliable):
  Client    Server
    |--SYN--->|
    |<-SYN/ACK|
    |---ACK-->|    (connected!)
    |--DATA-->|
    |<--ACK---|    (confirmed!)

UDP Connection (Fast):
  Client    Server
    |--DATA-->|    (sent, hope it arrives!)
    |--DATA-->|    (no confirmation needed)`,
                interviewTips: [
                    'Explain the TCP 3-way handshake',
                    'Know when to use TCP vs UDP',
                    'Understand how HTTP is built on top of TCP'
                ]
            }
        },
        {
            id: 'acid-transactions',
            title: 'ACID Transactions',
            icon: '🔒',
            description: 'Guarantees that database transactions are processed reliably.',
            tags: ['Database', 'Reliability', 'Transactions'],
            hasAnimation: true,
            content: {
                overview: '<strong>ACID</strong> is a set of properties that guarantee database transactions are processed reliably. Every banking system, e-commerce checkout, and critical data operation relies on ACID guarantees to prevent data corruption.',
                howItWorks: [
                    'Atomicity: All operations in a transaction succeed, or all fail (no partial updates)',
                    'Consistency: Transaction brings the database from one valid state to another',
                    'Isolation: Concurrent transactions don\'t interfere with each other',
                    'Durability: Once committed, data survives crashes (written to disk, WAL)',
                    'Databases use locks, MVCC, or optimistic concurrency for isolation'
                ],
                keyConcepts: [
                    '<strong>Atomicity</strong> — All or nothing. Transfer $100: debit AND credit must both succeed.',
                    '<strong>Consistency</strong> — Data constraints are always maintained (e.g., balance >= 0)',
                    '<strong>Isolation Levels</strong> — Read Uncommitted, Read Committed, Repeatable Read, Serializable',
                    '<strong>Durability</strong> — Write-Ahead Log (WAL) ensures data survives crashes',
                    '<strong>Distributed Transactions</strong> — 2-Phase Commit (2PC) across multiple databases'
                ],
                realWorld: 'A bank transfer: debit $100 from Account A and credit $100 to Account B. Without atomicity, a crash after debit but before credit loses $100. PostgreSQL provides full ACID. MongoDB added multi-document ACID in v4.0.',
                tradeoffs: {
                    pros: ['Data integrity guaranteed', 'Prevents corruption from concurrent access', 'Essential for financial systems'],
                    cons: ['Performance overhead from locking', 'Harder to scale across distributed systems', 'Stricter isolation = lower throughput']
                },
                codeExample: `-- Bank Transfer Transaction
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100
    WHERE id = 'A';  -- Debit
  UPDATE accounts SET balance = balance + 100
    WHERE id = 'B';  -- Credit
COMMIT;  -- Both succeed, or both rollback

-- If either UPDATE fails → ROLLBACK
-- Money is never lost or created`,
                interviewTips: [
                    'Explain each ACID property with a bank example',
                    'Know isolation levels and their trade-offs',
                    'Discuss why NoSQL often relaxes ACID for performance'
                ]
            }
        },
        {
            id: 'data-serialization',
            title: 'Data Serialization',
            icon: '📦',
            description: 'Converting data structures to bytes for storage and transmission (JSON, Protobuf, Avro).',
            tags: ['Data', 'Protocol', 'Encoding'],
            hasAnimation: true,
            content: {
                overview: '<strong>Serialization</strong> is the process of converting in-memory data structures into a format that can be stored or transmitted, then reconstructing it later (deserialization). The choice of format affects performance, bandwidth, and developer experience.',
                howItWorks: [
                    'JSON: Human-readable text format, widely used in REST APIs',
                    'Protocol Buffers (Protobuf): Binary format by Google, very compact and fast',
                    'Avro: Binary format with schema evolution support, popular in Kafka',
                    'MessagePack: Binary format similar to JSON but more compact',
                    'Each format trades off readability, size, speed, and schema support'
                ],
                keyConcepts: [
                    '<strong>JSON</strong> — Text-based, human readable, universally supported, but verbose',
                    '<strong>Protocol Buffers</strong> — Binary, 3-10x smaller than JSON, requires .proto schema',
                    '<strong>Schema Evolution</strong> — Ability to change data format without breaking existing consumers',
                    '<strong>Backward/Forward Compatibility</strong> — Old readers handle new data and vice versa',
                    '<strong>Compression</strong> — gzip/zstd can reduce JSON by 70-90%'
                ],
                realWorld: 'Google uses Protobuf internally for all service communication. LinkedIn uses Avro for Kafka event streaming. Most public REST APIs use JSON. gRPC requires Protobuf. Apache Kafka supports JSON, Avro, and Protobuf.',
                tradeoffs: {
                    pros: ['JSON: Easy to debug, universal support', 'Protobuf: Fast, compact, strongly typed'],
                    cons: ['JSON: Verbose, slow to parse at scale', 'Protobuf: Not human-readable, requires code generation']
                },
                codeExample: `// JSON (48 bytes, human-readable)
{"name":"John","age":30,"active":true}

// Protobuf Schema (.proto)
message User {
  string name = 1;
  int32 age = 2;
  bool active = 3;
}
// Protobuf Binary (~15 bytes, 3x smaller!)`,
                interviewTips: [
                    'Compare JSON vs Protobuf for internal vs external APIs',
                    'Explain schema evolution and why it matters in production',
                    'Know that gRPC uses Protobuf under the hood'
                ]
            }
        }
    ]
};
