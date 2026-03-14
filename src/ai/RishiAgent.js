/**
 * Rishi AI Agent — Expert System Design Architect
 * Creates DETAILED system designs for any application
 * Covers: architecture, flows, algorithms, scaling, databases, caching, monitoring
 */

import { SYSTEM_DESIGN_KB } from '../content/systemDesignKnowledgeBase.js';

export class RishiAIAgent {
  constructor() {
    this.name = 'Rishi';
    this.conversationHistory = [];
    this.knowledge = SYSTEM_DESIGN_KB;
  }

  async askQuestion(question) {
    this.conversationHistory.push({ type: 'user', message: question, timestamp: new Date() });

    const lowerQ = question.toLowerCase();
    let response;

    // Detect intent
    if (this._isDesignRequest(lowerQ)) {
      response = this._generateFullSystemDesign(question);
    } else if (this._isHowRequest(lowerQ)) {
      response = this._generateHowItWorksAnswer(question);
    } else {
      response = this._generateConceptAnswer(question);
    }

    this.conversationHistory.push({ type: 'assistant', message: response, timestamp: new Date() });
    return { answer: response, sources: [], confidence: 90 };
  }

  _isDesignRequest(q) {
    return /design|architect|build|create|system for|app like|clone|platform|service|scalable/.test(q);
  }

  _isHowRequest(q) {
    return /how does|how do|explain|what is|why does|difference between/.test(q);
  }

  _generateFullSystemDesign(question) {
    // Extract the app type from the question
    const appType = this._extractAppType(question);

    return this._buildSystemDesignDocument(appType, question);
  }

  _extractAppType(question) {
    const patterns = [
      { pattern: /uber|ride.sharing|taxi|cab/, name: 'Ride-Sharing App (Uber-style)' },
      { pattern: /instagram|photo|image sharing/, name: 'Photo Sharing Platform (Instagram-style)' },
      { pattern: /twitter|x\.com|social media|tweet/, name: 'Social Media Feed (Twitter-style)' },
      { pattern: /netflix|video stream|streaming/, name: 'Video Streaming Platform (Netflix-style)' },
      { pattern: /whatsapp|chat|messaging|real.time/, name: 'Real-Time Chat Application (WhatsApp-style)' },
      { pattern: /amazon|e.?commerce|shopping/, name: 'E-Commerce Platform (Amazon-style)' },
      { pattern: /youtube|video|upload/, name: 'Video Platform (YouTube-style)' },
      { pattern: /swiggy|zomato|food delivery|doordash/, name: 'Food Delivery Platform (Swiggy-style)' },
      { pattern: /google|search engine/, name: 'Search Engine (Google-style)' },
      { pattern: /url shortener|bit\.ly|tinyurl/, name: 'URL Shortener' },
      { pattern: /pastebin|code share/, name: 'Code/Text Sharing Service' },
      { pattern: /dropbox|google drive|file storage/, name: 'Cloud File Storage (Dropbox-style)' },
      { pattern: /tinder|dating|match/, name: 'Dating App (Tinder-style)' },
      { pattern: /zoom|video call|conference/, name: 'Video Conferencing (Zoom-style)' },
      { pattern: /notification|push alert/, name: 'Notification System' },
      { pattern: /rate limiter/, name: 'Rate Limiter System' },
      { pattern: /ticket|booking|reservation/, name: 'Ticket Booking System (BookMyShow-style)' },
    ];

    for (const { pattern, name } of patterns) {
      if (pattern.test(question.toLowerCase())) return name;
    }

    // Extract noun from question
    const words = question.replace(/design|architect|build|create|system|app|platform/gi, '').trim();
    return words.length > 3 ? `${words} System` : 'Distributed System';
  }

  _buildSystemDesignDocument(appType, originalQuestion) {
    return `# 🏗️ Complete System Design: ${appType}

---

## 1️⃣ Requirements Clarification

### Functional Requirements
${this._getFunctionalRequirements(appType)}

### Non-Functional Requirements
- **Scale**: 100M+ users, 10M+ daily active users
- **Latency**: < 200ms for read operations, < 500ms for writes
- **Availability**: 99.99% uptime (4 nines = ~52 min downtime/year)
- **Consistency**: Eventual consistency acceptable for feeds, strong for payments
- **Durability**: Zero data loss — all data replicated across 3+ data centers

---

## 2️⃣ High-Level Architecture

\`\`\`
[Users/Clients]
      │
      ▼
[DNS + Global Load Balancer (Anycast)]
      │
   ┌──┴──┐
   │ CDN │ ◄─── Static Assets (images, JS, CSS)
   └──┬──┘
      │
[API Gateway / Reverse Proxy]
  ├── Rate Limiting (1000 req/min per user)
  ├── Authentication (JWT token validation)
  ├── Request Routing
  └── SSL Termination
      │
[Microservices Layer]
${this._getMicroservices(appType)}
      │
[Data Layer]
  ├── Primary Database (PostgreSQL / MySQL for transactional data)
  ├── Cache Layer (Redis — TTL 5-60 min)
  ├── Search Engine (Elasticsearch for full-text search)
  ├── Message Queue (Kafka / RabbitMQ for async tasks)
  └── Object Storage (S3 for files, videos, images)
\`\`\`

---

## 3️⃣ Detailed Component Deep-Dive

### 🌐 Load Balancing Layer
${this._getLoadBalancingContent()}

### ⚡ Caching Strategy
${this._getCachingStrategy(appType)}

### 🗄️ Database Design
${this._getDatabaseDesign(appType)}

### 📨 Message Queue & Async Processing
${this._getMessageQueueContent(appType)}

---

## 4️⃣ Key Algorithms & Data Structures

${this._getAlgorithms(appType)}

---

## 5️⃣ Complete Request Flow (Step-by-Step)

${this._getRequestFlow(appType)}

---

## 6️⃣ Scaling Strategy

### Phase 1: 0 → 100K Users
- Single region, single DB
- Redis caching to reduce DB load by 80%
- CDN for static assets
- Basic health monitoring

### Phase 2: 100K → 10M Users
- DB read replicas (1 primary → 5 read replicas)
- Horizontal auto-scaling for API servers (EC2 ASG)
- Multi-AZ deployment for high availability
- Introduce message queues for async processing

### Phase 3: 10M → 100M+ Users
- Database sharding by user ID or geographic region
- Multi-region deployment (US-East, EU-West, AP-Southeast)
- Global Anycast DNS routing
- Dedicated teams per microservice (Conway's Law)

---

## 7️⃣ Failure Handling & Reliability

### Circuit Breaker Pattern
\`\`\`
Request → Circuit Breaker → Downstream Service
              │
     CLOSED (normal) → OPEN (failures ≥ threshold) → HALF-OPEN (probe)
\`\`\`
- Open circuit after 5 failures in 30 seconds
- Retry with exponential backoff (1s → 2s → 4s → 8s)
- Fallback: serve from cache or return graceful degraded response

### Data Replication
- **Primary-Replica**: Write to primary, async replicate to 3 replicas
- **Cross-Region**: Active-Active or Active-Passive for disaster recovery
- **RPO**: < 1 second (Recovery Point Objective)
- **RTO**: < 30 seconds (Recovery Time Objective)

---

## 8️⃣ Monitoring & Observability

### The 3 Pillars
| Pillar | Tool | What to Monitor |
|--------|------|----------------|
| **Metrics** | Prometheus + Grafana | CPU, memory, request rate, error rate, latency |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Application logs, error traces |
| **Tracing** | Jaeger / Zipkin | End-to-end request traces across microservices |

### Key Alerts
- Error rate > 1% → PagerDuty alert
- P99 latency > 500ms → Auto-scale triggered
- DB connections > 80% pool → Alert on-call
- Cache hit rate < 60% → Investigate cache policy

---

## 9️⃣ Security Considerations

- **Authentication**: JWT tokens + refresh tokens (15min access / 7 day refresh)
- **Authorization**: RBAC (Role-Based Access Control)
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **DDoS Protection**: Cloudflare WAF + rate limiting
- **Input Validation**: Sanitize all inputs (prevent SQL injection, XSS)
- **Secrets Management**: AWS Secrets Manager / HashiCorp Vault

---

## 🎯 Interview Tips for ${appType}

1. **Start with requirements** — Always ask clarifying questions first
2. **Back-of-envelope math**: "100M users × 10 requests/day = 11,500 RPS"
3. **Mention tradeoffs** — "We chose eventual consistency here because..."
4. **Scale progressively** — Don't over-engineer from day 1
5. **Identify bottlenecks** — "The DB will be our first bottleneck, so we add replicas"

> 💡 **Rishi's Tip**: The best system design answers show your thought process, not just the final answer. Interviewers want to see HOW you think, not just WHAT you know.`;
  }

  _getFunctionalRequirements(appType) {
    const requirements = {
      'Ride-Sharing App': `- User can request a ride from location A to B
- Driver can accept/reject ride requests
- Real-time GPS tracking of driver location
- Fare calculation based on distance and time
- Payment processing (card, wallet, UPI)
- Rating system (passenger rates driver, driver rates passenger)
- Notifications (ride accepted, driver arriving, trip completed)`,
      'Photo Sharing Platform': `- Users can upload photos with captions and hashtags
- Follow/unfollow other users
- Like and comment on photos
- Home feed showing posts from followed users
- Explore page for trending/recommended content
- Direct messaging between users
- Stories (24-hour disappearing content)`,
      'Real-Time Chat Application': `- 1-on-1 messaging with delivery confirmation
- Group chats (up to 256 members)
- Media sharing (images, video, documents)
- Typing indicators and read receipts
- End-to-end encryption
- Message search
- Voice and video calls`,
    };

    // Match app type
    for (const [key, reqs] of Object.entries(requirements)) {
      if (appType.toLowerCase().includes(key.toLowerCase())) return reqs;
    }

    return `- Core CRUD operations (Create, Read, Update, Delete)
- User authentication and authorization
- Real-time updates via WebSockets
- Search and filtering capabilities
- Notifications (push, email, in-app)
- Analytics and reporting
- API for mobile and web clients`;
  }

  _getMicroservices(appType) {
    return `  ├── User Service        (signup, login, profiles)
  ├── Auth Service        (JWT, OAuth, sessions)
  ├── Content Service     (create, read, update, delete)
  ├── Feed Service        (personalized timelines)
  ├── Search Service      (Elasticsearch integration)
  ├── Notification Service (push, email, SMS)
  ├── Media Service       (upload, transcoding, delivery)
  └── Analytics Service  (event tracking, reporting)`;
  }

  _getLoadBalancingContent() {
    return `**Algorithm**: Least Connections (routes to least busy server)
**Health Checks**: Every 5 seconds (HTTP /health endpoint)
**Failover**: Remove unhealthy server in < 30 seconds
**SSL Termination**: At load balancer (reduces server CPU load)
**Session Persistence**: Use token-based auth (stateless servers)

\`\`\`
Round-Robin:     [S1, S2, S3, S1, S2, S3...]
Least Conn:      [S1=10, S2=15, S3=5] → route to S3
Weighted:        S1=50%, S2=30%, S3=20% (based on capacity)
IP Hash:         hash(IP) % num_servers → sticky sessions
\`\`\``;
  }

  _getCachingStrategy(appType) {
    return `**Cache Layer**: Redis Cluster (3 master + 3 replica nodes)

| Data Type | TTL | Cache Key Pattern |
|-----------|-----|------------------|
| User Profile | 1 hour | \`user:{userId}:profile\` |
| Feed/Timeline | 5 min | \`feed:{userId}:page:{n}\` |
| Session Tokens | 15 min | \`session:{token}\` |
| Config/Settings | 24 hours | \`config:{key}\` |
| Search Results | 2 min | \`search:{query}:hash\` |

**Cache Strategies**:
- **Cache Aside**: App checks cache first, on miss → DB → populate cache
- **Write-Through**: Write to cache + DB simultaneously (strong consistency)
- **Eviction Policy**: LRU (Least Recently Used) with max-memory-policy

**Hit Rate Target**: > 80% (reduces DB load by 80%)`;
  }

  _getDatabaseDesign(appType) {
    return `**Primary DB**: PostgreSQL (ACID transactions, complex queries)
**Sharding Key**: User ID (consistent hashing across 16 shards)
**Replication**: 1 Primary → 3 Read Replicas (async replication)

**Connection Pooling**: PgBouncer (100 real connections serve 10,000 app connections)

**Key Tables**:
\`\`\`sql
-- Users Table
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email); -- Fast login lookup

-- Content Table
CREATE TABLE content (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id),
  body        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_content_user_id ON content(user_id); -- Fast user feed
CREATE INDEX idx_content_created_at ON content(created_at DESC); -- Latest first
\`\`\`

**NoSQL (for high-throughput)**: DynamoDB or Cassandra for:
- Activity feeds (write-heavy, time-series)
- Session storage
- Event logs`;
  }

  _getMessageQueueContent(appType) {
    return `**Technology**: Apache Kafka (10M+ messages/sec)
**Partitioning**: By user_id for ordered delivery

**Topics & Consumers**:
\`\`\`
user.signup    → [Email Service, Analytics, Notification]
content.create → [Feed Fanout Service, Search Indexer, CDN Warmup]
user.action    → [Analytics, Recommendation Engine]
payment.event  → [Ledger, Email, Notification, Audit Log]
\`\`\`

**Benefits**:
- Decouples producers from consumers
- Handles traffic spikes (buffer during peak load)
- Replay events for debugging or new consumers
- Guaranteed delivery with consumer offsets`;
  }

  _getAlgorithms(appType) {
    return `### Consistent Hashing (for DB/Cache Sharding)
\`\`\`
Hash ring with 2^32 positions
Server nodes: S1, S2, S3 placed at hash(serverIP) positions
Data key: placed at hash(key) position → routed to nearest clockwise server
Adding/removing servers: only ~1/N keys need to be moved (vs. ALL keys with modulo)
\`\`\`

### Rate Limiting — Token Bucket Algorithm
\`\`\`
bucket_capacity = 100 requests
refill_rate = 10 requests/second
On each request:
  if tokens > 0: allow request, tokens -= 1
  else: reject with 429 Too Many Requests
  Every second: tokens = min(capacity, tokens + refill_rate)
\`\`\`

### Feed Ranking (for social platforms)
\`\`\`
score = (likes × 3) + (comments × 5) + (shares × 7) + recency_weight
recency_weight = 1 / (1 + hours_since_posted)
top_k_posts = sort_by_score(candidate_posts).take(20)
\`\`\`

### Geospatial Indexing (for location-based apps)
\`\`\`
Geohash: encode (lat, lng) → compact string (e.g., "tzkz1x2q")
Grid search: find all geohashes within radius using prefix matching
QuadTree: spatial partitioning for dense city areas
\`\`\``;
  }

  _getRequestFlow(appType) {
    return `**User Action → Server Response** (complete journey):

\`\`\`
1. USER (browser/app)
   → sends HTTPS POST request with JWT token
   
2. DNS → resolves to nearest load balancer (Anycast routing)

3. LOAD BALANCER
   → validates SSL certificate, terminates TLS
   → routes to least-busy API server (health check: /ping)
   
4. API GATEWAY
   → validates JWT token (Redis cache check, 1ms)
   → applies rate limiting (token bucket, Redis)
   → routes to correct microservice
   
5. MICROSERVICE
   → checks Redis cache for response [1-2ms]
   → cache HIT: return immediately (80% of requests)
   → cache MISS: query database
   
6. DATABASE
   → query via connection pool (PgBouncer)
   → return data rows
   
7. MICROSERVICE
   → populate cache for next request (SET key value EX 300)
   → format response JSON
   → publish event to Kafka topic (async, non-blocking)
   
8. RESPONSE
   → compress with gzip (50-70% size reduction)
   → return to client via load balancer
   
⏱️ Total: 50-150ms (cache hit) | 100-300ms (cache miss)
\`\`\``;
  }

  _generateHowItWorksAnswer(question) {
    const relevantAnswers = this._findRelevantAnswers(question);
    const context = relevantAnswers.length > 0
      ? relevantAnswers[0].answer
      : this._getGenericConceptAnswer(question);

    return `## 📚 ${question.charAt(0).toUpperCase() + question.slice(1)}

${context}

---

### 💡 Summary
Understanding this concept deeply will help you apply it in system design interviews. Ask me to "design a system that uses this" or "explain a specific scenario" for more detail.`;
  }

  _generateConceptAnswer(question) {
    const relevant = this._findRelevantAnswers(question);
    if (relevant.length > 0) {
      return `## 🔍 ${question}

${relevant[0].answer}

${relevant.length > 1 ? `\n**Related Concepts**: ${relevant.slice(1).map(r => r.topic).join(', ')}` : ''}`;
    }
    return `## 🤔 Great question about: "${question}"

I can help with any system design topic! Here are some things you can ask me:

- **"Design a [app type]"** — I'll give you a complete architectural breakdown
- **"How does [technology] work?"** — Detailed explanation with examples
- **"What is [concept]?"** — Clear definition with real-world use cases
- **"Scale [system] to 100M users"** — Step-by-step scaling strategy

**Popular topics**: Load Balancing, Caching, Database Sharding, Microservices, CAP Theorem, Message Queues, Consistent Hashing, Rate Limiting`;
  }

  _findRelevantAnswers(question) {
    const keywords = question.toLowerCase().split(/\s+/);
    const matches = [];

    for (const [, entries] of Object.entries(this.knowledge)) {
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          const score = keywords.filter(kw => kw.length > 3 && (entry.topic?.toLowerCase().includes(kw) || entry.answer?.toLowerCase().includes(kw))).length;
          if (score > 0) matches.push({ ...entry, score });
        }
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  _getGenericConceptAnswer(question) {
    return `This is a fundamental system design concept. Let me break it down:

**Core Idea**: ${question}

**How it works**:
1. At its core, this involves distributing load and ensuring reliability
2. The key tradeoff is between consistency and availability (CAP theorem)
3. Real-world systems use a combination of techniques

**Real-world example**: Netflix, Google, and Uber all solve this by using distributed architectures with caching layers (Redis), message queues (Kafka), and database replication.

Ask me to "design a specific system" and I'll show you exactly how this applies!`;
  }

  getSuggestedFollowups() {
    return [
      'How would you scale this for 1 billion users?',
      'What happens when a server fails?',
      'Design the database schema for this',
    ];
  }
}

export const rishiAgent = new RishiAIAgent();
export default rishiAgent;
