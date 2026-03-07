/**
 * System Design Knowledge Base — Comprehensive training data for Rishi AI Agent
 * Covers all system design topics, patterns, and best practices
 */

export const SYSTEM_DESIGN_KB = {
  // ─── FUNDAMENTAL CONCEPTS ───
  fundamentals: [
    {
      topic: 'What is System Design?',
      answer: `System Design involves architecting software to solve problems at scale. It covers:
- How data flows through the system
- How different components communicate
- How the system handles failures
- How performance scales with users
- How to store and retrieve data efficiently
Key is understanding tradeoffs: consistency vs availability, latency vs throughput.`
    },
    {
      topic: 'What is Scalability?',
      answer: `Scalability means the system can handle increased load:
1. Vertical Scaling (Scale Up): More resources per machine (RAM, CPU)
   - Pro: Simple
   - Con: Hardware limit, single point of failure

2. Horizontal Scaling (Scale Out): More machines in cluster
   - Pro: Unlimited growth, fault tolerance
   - Con: Complexity, network calls overhead
   - Used in real systems: Microservices, databases sharding`
    },
    {
      topic: 'What is Load Balancing?',
      answer: `Distributes incoming requests across multiple servers:
- Round-robin: Each server gets same number of requests
- Least connections: Route to server with fewest active requests
- IP hash: Same client always routed to same server
- Weighted: Different servers get different loads
- Health checks: Remove unhealthy servers automatically

Prevents any single server from overloading.`
    },
    {
      topic: 'What is a Database Index?',
      answer: `Index speeds up query lookups by pre-sorting data:
- Without index: Full table scan O(n)
- With B-Tree index: O(log n) lookup
- Trade: Faster reads, slower writes (index must be updated)

Example: SELECT * FROM users WHERE email = 'user@example.com'
- Without index on email: Scan all 10M users (10 sec)
- With index on email: Direct lookup (0.1 ms)`
    },
    {
      topic: 'What is Caching?',
      answer: `Store frequently accessed data in fast memory to avoid slow lookups:
- In-memory cache (Redis): 1-2ms access time
- Database query: 20-50ms access time
- Disk/SSD: 1-10ms access time

Cache invalidation strategies:
1. TTL: Expire after time period (5 min, 1 hour)
2. LRU: Remove least recently used when full
3. Event-driven: Invalidate on data change
4. Write-through: Update cache on write
5. Write-behind: Lazy cache update

Challenge: "Cache invalidation is hardest problem in CS" - Phil Karlton`
    },
    {
      topic: 'How do distributed systems communicate?',
      answer: `Three main patterns:
1. REST/HTTP: Simple, human-readable, slow
   - Overhead: Headers, text encoding
   - Latency: 50-200ms per call

2. gRPC: Binary protocol, fast
   - Uses Protocol Buffers: compact binary format
   - Latency: 5-20ms per call (10× faster than REST)
   - Used between internal services

3. Message Queues: Async, decoupled
   - Producer publishes message
   - Consumer consumes asynchronously
   - Decouples services, enables reliability
   - Latency: 100-500ms (not real-time)`
    },
    {
      topic: 'What is ACID?',
      answer: `Database transaction guarantees:
A - Atomicity: All or nothing (no partial writes)
C - Consistency: Data stays valid (foreign keys, constraints maintained)
I - Isolation: Concurrent transactions don't interfere
D - Durability: Data survives crashes

Traditional: SQL databases guarantee ACID
Modern trend: NoSQL sacrifices ACID for speed/scale

Tradeoff: ACID = slower, but guaranteed correctness`
    },
    {
      topic: 'What is the CAP Theorem?',
      answer: `Any distributed system can guarantee only 2 of 3:
1. Consistency: All nodes see the same data
2. Availability: System always responds
3. Partition tolerance: System works despite network splits

Real systems must choose:
- CP (Consistency + Partition): Favor correctness
  Used for: Banking, stock trading
  Example: PostgreSQL replicas
  Downside: Slower, may be unavailable

- AP (Availability + Partition): Favor availability
  Used for: Social media, search
  Example: Cassandra, DynamoDB
  Downside: Eventual consistency (may see stale data)`
    },
    {
      topic: 'What is eventual consistency?',
      answer: `Data may be inconsistent briefly, but eventually becomes consistent:
- Write to primary: Returns success immediately
- Replicate to secondaries: Happens asynchronously (100ms-1s)
- If read secondary before replication: See old data
- After replication: All nodes consistent

Tradeoff: Fast writes, but may see stale data

Real examples:
- Social media: Post visible to you instantly, shows to followers after 1s
- Cache: May serve old data until invalidated
- Email: Sent immediately, delivered eventually`
    }
  ],

  // ─── DATABASE PATTERNS ───
  databases: [
    {
      topic: 'How to choose between SQL and NoSQL?',
      answer: `SQL (PostgreSQL, MySQL):
- Structured data with defined schema
- ACID guarantees critical
- Complex queries needed
- Examples: Banking, inventory

NoSQL (MongoDB, Cassandra, DynamoDB):
- Unstructured or flexible data
- Need horizontal scalability
- Eventual consistency acceptable
- Examples: Social feeds, analytics

Hybrid approach: SQL for core data, NoSQL for scale`
    },
    {
      topic: 'What is Database Sharding?',
      answer: `Split data horizontally across multiple databases:
- Each shard (database) holds subset of data
- Example: Users table sharded by user_id
  - Shard 1: user_id 1-1M
  - Shard 2: user_id 1M-2M
  - Shard 3: user_id 2M-3M

Pros: Unlimited data size, parallel throughput
Cons: Complex queries (need to hit all shards), managing shards

Sharding key matters: Choose field that distributes evenly
- Good: user_id (1M users distributed)
- Bad: country (100M in USA, 1M in Iceland, unbalanced)`
    },
    {
      topic: 'What is Database Replication?',
      answer: `Copy data across multiple databases for reliability:
1. Single-Leader Replication:
   - One primary (master) for writes
   - Multiple replicas (slaves) for reads
   - Primary replicates to replicas
   - Replicas read-only

2. Multi-Leader Replication:
   - Multiple primaries, each can write
   - Changes replicate to other primaries
   - Complex: conflict resolution needed

3. Leaderless Replication:
   - All nodes equal, can read/write
   - Quorum: Write to 2/3 nodes, read from 2/3 nodes

Trade: More replicas = better availability but lower consistency`
    },
    {
      topic: 'What is Database Connection Pooling?',
      answer: `Reuse database connections instead of creating new ones:
Without pooling:
- Each request creates connection (300ms)
- Execute query (20ms)
- Close connection (50ms)
- Total per request: 370ms

With connection pooling (50 pre-opened connections):
- Take from pool (1ms)
- Execute query (20ms)
- Return to pool (1ms)
- Total per request: 22ms

Result: 17× faster! Pooling is essential for performance.`
    }
  ],

  // ─── CACHING STRATEGIES ───
  caching: [
    {
      topic: 'What are Caching Layers?',
      answer: `Multi-level caching for performance:

Layer 1 - CDN Cache (Edge):
- Closest to user (10-30ms latency)
- Caches static content: HTML, CSS, JS, images
- Geographic distribution: 300+ locations worldwide

Layer 2 - API Response Cache (Redis):
- In-memory cache in data center
- Caches API responses: 1-2ms access
- Popular queries cached

Layer 3 - Database Query Cache:
- Cache inside database (InnoDB buffer pool)
- Frequently accessed rows stay in memory

Layer 4 - Client Cache (Browser):
- User's browser memory
- Cache static assets, user data

Each layer dramatically reduces latency.`
    },
    {
      topic: 'Cache Invalidation Strategies',
      answer: `How to keep cache fresh:

1. TTL (Time To Live):
   - Cache expires after X minutes
   - Simple but may serve stale data
   - Example: Restaurant menu cached 30 min

2. Event-Driven Invalidation:
   - When data changes, invalidate cache
   - Example: Add dish to menu → invalidate cache immediately
   - Keeps data fresh, more complex

3. LRU (Least Recently Used):
   - Remove oldest access when cache full
   - Redis default eviction policy

4. Write-Through:
   - On write: Update DB and cache
   - Ensures cache always valid
   - Slower writes

5. Write-Behind (Write-Back):
   - On write: Update cache immediately
   - Write to DB asynchronously
   - Faster writes, risk of data loss

Choose based on consistency requirements.`
    },
    {
      topic: 'How to handle Cache Stampede?',
      answer: `Problem: Popular cache key expires, all requests hit database:
- 1000 concurrent requests for same key
- Key expired → Database gets 1000 simultaneous hits
- Database overloads, slow down

Solutions:
1. Cache Warming: Proactively refresh before expiry
2. Probabilistic Early Expiry: Refresh at 80% TTL
3. Mutex/Lock: First request refreshes, others wait
4. Refresh on demand: Lazy refresh when hit

Real trigger: A/C malfunction in data center = 1000 servers cache expired = stampede`
    }
  ],

  // ─── MESSAGE QUEUES ───
  messageQueues: [
    {
      topic: 'What is a Message Queue?',
      answer: `Asynchronous communication between services:
- Producer: Sends message to queue
- Queue: Stores message (disk + memory)
- Consumer: Processes message

Advantages:
- Decoupling: Producer doesn't wait for consumer
- Buffering: Handle traffic spikes (queue absorbs)
- Reliability: Message persisted, retries on failure
- Scalability: Run more consumers for more throughput

Popular: Kafka, RabbitMQ, AWS SQS, Azure Service Bus`
    },
    {
      topic: 'Kafka vs RabbitMQ?',
      answer: `Kafka:
- Distributed streaming platform
- Partition-based: messagesplit across partitions
- High throughput: 1M+ messages/sec
- Retention: Keep data 7-30 days (for replay)
- Use: Analytics, event streaming, real-time processing

RabbitMQ:
- Traditional message broker
- Queue-based: FIFO ordering
- Medium throughput: 100k messages/sec
- Retention: Usually deleted after consumed
- Use: Task queues, job processing

Kafka more modern, suited for big data and streaming.`
    },
    {
      topic: 'Guaranteed Message Delivery?',
      answer: `How to ensure message not lost:

At-Least-Once:
- Message may be delivered multiple times
- Consumer must be idempotent (same msg twice = same effect)
- Implemented by: Acknowledgments + retry

Exactly-Once:
- Harder to achieve
- Requires: Distributed transactions
- Trade: Complexity, performance cost

Practical: Use at-least-once + idempotent consumers
Example: Order creation - use order_id as idempotent key
If duplicate message: Check if order_id exists, skip if yes`
    }
  ],

  // ─── API DESIGN ───
  api: [
    {
      topic: 'REST vs GraphQL?',
      answer: `REST:
- Simple, well-understood
- HTTP methods: GET, POST, PUT, DELETE
- Multiple endpoints needed: /users, /users/{id}, /users/{id}/orders
- Over-fetching: Get more data than needed
- Under-fetching: Multiple requests for related data
- Caching: Easy (HTTP caching works)

GraphQL:
- Single endpoint: /graphql
- Query language: Request exactly fields needed
- No over/under-fetching
- Single request for complex data
- Caching: More complex (not HTTP caching)
- Learning curve: Steeper

REST: Good for simple APIs, mobile
GraphQL: Good for complex, rapidly changing APIs`
    },
    {
      topic: 'API Rate Limiting Strategy?',
      answer: `Prevent abuse, protect system:

Strategies:
1. Token Bucket: Give fixed tokens/sec, requests consume tokens
2. Sliding Window: Count requests in rolling time window
3. Leaky Bucket: Fixed request rate, queue overflow

Implementation:
- Per-user: 100 requests/min
- Per-IP: 1000 requests/min
- Per-API-key: 10k requests/min

Enforcement:
- Redis Counter: O(1) lookup
- Increment on each request
- Check limit before processing
- Return 429 Too Many Requests if exceeded

Graceful degradation:
- Critical endpoints: High limits
- Non-critical: Lower limits`
    },
    {
      topic: 'API Versioning Strategy?',
      answer: `How to evolve API without breaking clients:

1. URL Path Versioning:
   - /v1/users
   - /v2/users (breaking change)
   - Multiple versions live simultaneously

2. Query Parameter Versioning:
   - /users?api_version=2

3. Header Versioning:
   - Header: API-Version: 2

Best practice: URL path is clearest
- Support old versions for 6-12 months
- Communicate deprecation 3+ months ahead
- Provide migration guide`
    }
  ],

  // ─── DISTRIBUTED SYSTEMS ───
  distributedSystems: [
    {
      topic: 'How to handle Service Failures?',
      answer: `Failure scenarios:
1. Partial Failure: Some services down, others up
2. Cascading Failure: One service down causes others to fail
3. Network Partition: Services can't communicate

Solutions:
1. Circuit Breaker:
   - Monitor service failures
   - If failure rate > threshold: Open circuit (reject requests)
   - After cooldown: Half-open (test request)
   - If succeeds: Close circuit (normal)
   - Prevents cascade: Fail fast, don't hammer dead service

2. Timeout:
   - Every request has timeout
   - Default: 30 seconds
   - Kill slow requests, free resources

3. Retries with Exponential Backoff:
   - Retry failed request
   - Wait: 1s, 2s, 4s, 8s before retries
   - Stop after 3-5 retries
   - Gives transient failures time to recover

4. Fallback / Degradation:
   - Return cached data instead of error
   - Or simpler response (less data but functional)`
    },
    {
      topic: 'How to debug distributed systems?',
      answer: `Challenges: No single log file, multiple servers

Solutions:
1. Centralized Logging:
   - All services send logs to central system (ELK, Splunk)
   - Search logs across all servers
   - Filter by service, level, timerange

2. Distributed Tracing:
   - Each request gets unique ID (trace_id)
   - Every service logs with trace_id
   - Follow request path through system
   - Tool: Jaeger, Zipkin

3. Metrics:
   - CPU, memory, latency, throughput
   - Visualize trends
   - Tool: Prometheus, Grafana

4. Health Checks:
   - Service must expose /health endpoint
   - Returns: healthy or error
   - Load balancer removes unhealthy instances

5. Alerts:
   - Monitor metrics
   - Alert when threshold exceeded
   - Team responds to alerts`
    },
    {
      topic: 'How to rollout new versions without downtime?',
      answer: `Blue-Green Deployment:
- Blue: Current version running
- Green: New version deployed (not receiving traffic)
- Switch: Route 100% traffic to green
- Advantage: Instant rollback (switch back to blue)
- Risk: Database schema changes need backward compat

Canary Deployment:
- Route 5% traffic to new version
- Monitor: Errors, latency, exceptions
- If good: Route 25%, 50%, 100%
- If bad: Rollback to old version
- Advantage: Gradual, low risk
- Disadvantage: Takes longer

Feature Flags:
- Deploy code but toggle feature off
- Gradually enable feature for users
- Can disable instantly if buggy

Best practice: Canary deployment with feature flags`
    }
  ],

  // ─── SEARCH & ANALYTICS ───
  search: [
    {
      topic: 'Full-Text Search Implementation?',
      answer: `How to search millions of documents:

Without Full-Text Search:
- Query: SELECT * FROM products WHERE name LIKE %shoes%
- Scans all rows: 10M products = 10 seconds
- Slow!

With Elasticsearch:
- Inverted Index: word → documents containing word
  Example: "running" → [doc1, doc5, doc23, ...]
- Lookup: "running" → 1000 docs (1ms)
- Filter: shoes → running shoes (50ms aggregate)
- Score: Rank by relevance (TF-IDF algorithm)
- Result: 50ms vs 10 seconds

Sharding:
- Index split across 5 shards (servers)
- Query each shard in parallel
- Merge results

Tradeoff: RAM heavy (keeps index in memory)`
    },
    {
      topic: 'How to build Analytics?',
      answer: `Capture user behavior and analyze:

Data Collection:
1. Event Streaming: User clicks, views, searches
   - Send to Kafka (1M events/sec)
   - Events: {user_id, event_type, timestamp, details}

2. Batch Processing (Nightly):
   - Run Spark job on Kafka data
   - Compute: DAU, MAU, conversion rates, retention
   - Output to Data Warehouse (Snowflake, BigQuery)

3. Real-time Analytics:
   - Stream processing: Kafka → Spark Streaming
   - Update dashboards in real-time
   - Latency: <1 second

Tools: Kafka, Spark, Airflow, Snowflake, Tableau`
    }
  ],

  // ─── SECURITY ───
  security: [
    {
      topic: 'How to secure API communication?',
      answer: `Prevent unauthorized access and data theft:

1. HTTPS/TLS:
   - Encrypt data in transit
   - All APIs must use HTTPS
   - Certificate from Certificate Authority

2. Authentication:
   - JWT (JSON Web Token)
   - Token contains: user_id, expiry
   - Sent in Authorization header
   - Server verifies signature

3. Authorization:
   - Check user has permission
   - Role-Based Access Control (RBAC)
   - Example: User can see own orders only

4. Rate Limiting:
   - Prevent brute force attacks
   - Example: 5 failed logins → IP blocked

5. SQL Injection Prevention:
   - Use parameterized queries
   - Bad: "SELECT * FROM users WHERE email = '" + email + "'"
   - Good: "SELECT * FROM users WHERE email = ?" with [email]

6. Secrets Management:
   - Store API keys in vault (HashiCorp)
   - Don't hardcode secrets in code
   - Rotate regularly`
    },
    {
      topic: 'End-to-End Encryption in Chat?',
      answer: `User messages stay private:

How It Works:
1. User A generates key pair: private_key_A, public_key_A
2. User B generates key pair: private_key_B, public_key_B
3. User A encrypts message: encrypt(message, public_key_B)
4. Send to server (server can't decrypt, only B can)
5. User B decrypts: decrypt(encrypted_message, private_key_B)

Advantage: Server never sees plaintext message
Used by: WhatsApp, Signal, Telegram

Tradeoff: Can't access old messages after losing phone
(Private key lost = messages lost forever)`
    }
  ],

  // ─── PERFORMANCE ───
  performance: [
    {
      topic: 'How to optimize for latency?',
      answer: `Make systems respond faster:

1. Caching:
   - Avoid repeated expensive operations
   - Redis: 1-2ms vs Database: 20-50ms
   - 25× faster!

2. Content Delivery Network (CDN):
   - Serve content from edges near users
   - US user → CDN in US (10ms) vs origin in Asia (100ms)
   - 10× faster!

3. Connection Pooling:
   - Reuse connections
   - Avoid creating new connection per request

4. Async Processing:
   - Don't wait for slow operations
   - Queue work, return immediately
   - Example: Email sending (slow) done async

5. Compression:
   - Gzip response JSON: 80KB → 15KB (82% reduction)
   - Transmission time: 8KB/Mbps
   - 64MB link: 64ms vs 8ms = 8ms

6. Database Optimization:
   - Index frequently queried columns
   - Denormalize for fast reads (trade consistency)
   - Shard large tables

Measure: 99th percentile latency (p99)`
    },
    {
      topic: 'How to optimize for throughput?',
      answer: `Process more requests per second:

1. Load Balancing:
   - Distribute across machines
   - 1 server: 100 req/sec
   - 10 servers: 1000 req/sec

2. Asynchronous Processing:
   - Queue jobs, return immediately
   - Process in background
   - Let request finish faster

3. Database Optimization:
   - Connection pooling
   - Read replicas: Distribute reads
   - Master: 100 writes/sec
   - Master + 2 read replicas: 100 writes, 600 reads

4. Batch Processing:
   - Combine multiple small queries into one big query
   - Insert 1000 rows: slow in loop, fast in batch

5. Caching:
   - Cache hits bypass expensive operations
   - Reduce database load

6. Optimize Algorithms:
   - O(n²) → O(n log n)
   - Example: Sorting 1M items: 1000s → 20ms`
    },
    {
      topic: 'How to measure and monitor performance?',
      answer: `Know where time is spent:

Metrics:
1. Response Time: How long request takes
   - Measure: p50, p95, p99 (percentiles)
   - p99 important: Worst case for users
   - Goal: p99 < 500ms

2. Throughput: Requests per second
   - Goal: Scale to 100k+ req/sec

3. CPU/Memory Usage:
   - CPU: Keep < 70% (headroom for spikes)
   - Memory: Monitor for leaks

4. Error Rate:
   - Track failures, timeouts
   - Alert if > 0.1%

Tools:
- APM: DataDog, New Relic (app performance)
- Metrics: Prometheus (time series data)
- Dashboards: Grafana (visualization)
- Alerts: PagerDuty (on-call notifications)`
    }
  ],

  // ─── SCALING PATTERNS ───
  scaling: [
    {
      topic: 'How to scale a monolith?',
      answer: `Starting architecture is usually monolith (single codebase):

Phase 1 - Single Server:
- Server: 1-4 CPU cores, 8-16GB RAM
- Database: Running on same server
- Users: 100-1000 concurrent

Phase 2 - Separate Database:
- App server: 1 machine
- Database: 1 machine
- Users: 1000-10k concurrent

Phase 3 - Read Replicas:
- App server: 1 machine
- Database master: 1 machine (writes)
- Database replicas: 2-3 machines (reads)
- Users: 10k-100k concurrent

Phase 4 - Load Balancing:
- App servers: 5-20 machines
- Database: Master + replicas
- Load balancer: Distributes traffic
- Users: 100k-500k concurrent

Phase 5 - Microservices (if needed):
- Split monolith into services
- Service A (Auth), Service B (Orders), Service C (Payments)
- Each can scale independently
- Users: 500k+ concurrent

Each phase adds complexity but enables more scale.`
    },
    {
      topic: 'When to migrate to Microservices?',
      answer: `Microservices are more complex, use only if needed:

Monolith is good when:
- Single team (<10 engineers)
- Simpler codebase to understand
- Easier debugging (single process)
- Faster development (no coordination)

Migrate to Microservices when:
- Team larger (>20 engineers, hard to coordinate)
- Different services scale differently
  (Orders scale 10×, Payments only 2×)
- Want independent deployment
- Different tech stacks per service (Python, Node, Go)

Cost: Microservices introduce complexity
- Network calls (latency, failures)
- Distributed data (consistency harder)
- Operational overhead (monitoring, deployment)
- More machines needed (overhead per service)

Rule: Start monolith, migrate to microservices only when monolith becomes bottleneck.`
    }
  ],

  // ─── REAL-WORLD EXAMPLES ───
  realWorld: [
    {
      topic: 'How does Netflix handle 10M concurrent viewers?',
      answer: `Netflix architecture:

1. Content Distribution:
   - Transcoding Farm: 1000s of servers
   - Encodes video to 4K, 1080p, 720p, 480p (takes 6 hours)
   - Segments: 10-second chunks for adaptive streaming

2. Global CDN:
   - Open Connect: Netflix owns CDN
   - 300+ edge locations
   - 99% of traffic from CDN (not origin)
   - Origin is just backup

3. Microservices Architecture:
   - Recommendations: ML model (personalized for each user)
   - Playback: Adaptive bitrate selection
   - Search: Elasticsearch index
   - Metadata: Movie details, subtitles

4. Data Pipeline:
   - Kafka: Event streaming (watch events)
   - Spark: Batch processing (recommendations training)
   - Data Warehouse: Analytics

5. Failure Handling:
   - Chaos Monkey: Randomly kill instances (test resilience)
   - Auto-scaling: Add instances on high CPU
   - Multi-region: If US goes down, users go to EU

Lesson: Scale content distribution separate from application logic.`
    },
    {
      topic: 'How does Uber handle surge pricing?',
      answer: `Uber system architecture:

1. Real-Time Location Tracking:
   - Driver phones send GPS every 5 seconds
   - Kafka streams: 1M GPS updates/second
   - Redis: Store active driver locations

2. Matching Algorithm:
   - User requests ride → Find nearest drivers
   - Geohashing: Divide city into grids
   - Query Redis: Drivers in grid cells around user
   - Rank by distance, rating, ETA

3. Surge Pricing:
   - During high demand:
     - More requests than drivers
     - Increase prices: Incentive more drivers
     - Algorithm: demand_ratio → price_multiplier
     - Rider sees price immediately
   - Data: Prices calculated every 1-2 minutes

4. Payment:
   - User provides payment method (card)
   - Charge after ride
   - Settlement: Driver gets 75%, Uber gets 25%

5. Scaling:
   - Monolith initially
   - Now: Service-oriented (Matching, Payments, Billing, Support)
   - Operates in 70+ countries

Lesson: Real-time data + dynamic pricing = complex algorithm.`
    }
  ],

  // ─── TRADEOFFS ───
  tradeoffs: [
    {
      topic: 'Latency vs Throughput',
      answer: `Two different goals:
- Latency: How fast single request is processed (p99 < 500ms)
- Throughput: How many requests per second (>100k req/sec)

Tradeoff:
- Batch processing: Lower latency individually, higher throughput overall
- Async processing: Higher latency (queued), higher throughput

Example: Payment processing:
- Sync: 1 request = 500ms (slow but immediate)
- Async: 1 request = 10ms response + processed in background = 500ms total
  But can process 1000s concurrently

Choose based on use case:
- Real-time (trading): Need latency
- Analytics: Can sacrifice latency for throughput`
    },
    {
      topic: 'Consistency vs Availability',
      answer: `CAP Theorem tradeoff:

Consistency (C):
- All nodes always have latest data
- Requires: Coordination (slow)
- Cost: Higher latency, lower availability

Availability (A):
- System always responds
- Data may be stale
- Eventually consistent

Examples:
- Banking: Consistency (must see latest balance)
  Trade: Might be unavailable during maintenance

- Social Media: Availability (post might take 1 sec to propagate)
  Trade: May see slightly old version briefly

Choose consistency for money, availability for user experience.`
    },
    {
      topic: 'Strong Consistency vs Eventual Consistency',
      answer: `Strong Consistency:
- Write to database → Read immediately sees change
- All replicas synchronized before write returns
- Implementation: Two-phase commit
- Latency: 100ms+ (wait for all replicas)

Eventual Consistency:
- Write to primary → Returns immediately
- Replicates to other nodes asynchronously
- Read may see stale data briefly
- Latency: 10ms (primary only)

Use:
- Strong: Banking (can't lose money)
- Eventual: Social media (ok to see old post briefly)`
    }
  ]
};

export default SYSTEM_DESIGN_KB;
