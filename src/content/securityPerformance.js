/**
 * Category: Security & Reliability
 */
export const SECURITY = {
    id: 'security-reliability',
    name: 'Security & Reliability',
    icon: '🔐',
    level: 'intermediate',
    topics: [
        {
            id: 'auth', title: 'Authentication & Authorization', icon: '🔑',
            description: 'Verify user identity (AuthN) and control access permissions (AuthZ).',
            tags: ['Security', 'OAuth', 'JWT'],
            hasAnimation: true,
            content: {
                overview: '<strong>Authentication (AuthN)</strong> verifies WHO you are. <strong>Authorization (AuthZ)</strong> determines WHAT you can do. Together they protect every system from unauthorized access.',
                howItWorks: ['User submits credentials (password, social login, biometric)', 'Server validates and issues a token (JWT, session ID)', 'Client sends token with every subsequent request', 'Server validates token and checks permissions', 'Token expires → user must re-authenticate'],
                keyConcepts: ['<strong>JWT</strong> — JSON Web Token: self-contained, stateless token', '<strong>OAuth 2.0</strong> — Delegated authorization framework (Login with Google)', '<strong>Session-Based</strong> — Server stores session state (stateful)', '<strong>RBAC</strong> — Role-Based Access Control (admin, editor, viewer)', '<strong>MFA</strong> — Multi-Factor Authentication (password + OTP)'],
                realWorld: 'Google OAuth for "Sign in with Google". JWT used by most modern APIs. AWS IAM for fine-grained permissions. Auth0/Clerk for managed authentication.',
                tradeoffs: { pros: ['JWT: Stateless, scalable', 'OAuth: Delegated auth, no password handling', 'MFA: Much stronger security'], cons: ['JWT: Can\'t revoke until expiry (use short TTL)', 'OAuth: Complex flow', 'Session: Server storage required'] },
                codeExample: `// JWT Token (3 parts: header.payload.signature)
eyJhbGciOiJIUzI1NiJ9.
eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIn0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw

// Decoded payload
{ "user_id": 42, "role": "admin", "exp": 1700000000 }

// Server validates on every request
Authorization: Bearer <jwt_token>`,
                interviewTips: ['Compare JWT vs Session-based auth', 'Explain OAuth 2.0 authorization code flow', 'Know RBAC vs ABAC (Attribute-Based)']
            }
        },
        {
            id: 'ssl-tls', title: 'SSL/TLS & HTTPS', icon: '🔒',
            description: 'Encrypting data in transit between client and server.',
            tags: ['Encryption', 'HTTPS', 'Certificates'],
            hasAnimation: true,
            content: {
                overview: '<strong>TLS (Transport Layer Security)</strong> encrypts communication between client and server. <strong>HTTPS = HTTP + TLS</strong>. It provides confidentiality (encrypted), integrity (not tampered), and authentication (server identity verified).',
                howItWorks: ['Client sends "Client Hello" with supported cipher suites', 'Server responds with certificate and chosen cipher', 'Client verifies server certificate against trusted CAs', 'Key exchange (Diffie-Hellman) establishes shared secret', 'All subsequent data encrypted with the shared key'],
                keyConcepts: ['<strong>TLS Handshake</strong> — Establishes encrypted connection', '<strong>Certificate Authority (CA)</strong> — Trusted entity that issues certificates', '<strong>Public/Private Key</strong> — Asymmetric encryption for key exchange', '<strong>Symmetric Encryption</strong> — AES used for actual data transfer (fast)', '<strong>mTLS</strong> — Mutual TLS: both client AND server present certificates'],
                realWorld: 'Let\'s Encrypt provides free TLS certificates. Every bank, e-commerce site uses HTTPS. mTLS used in service meshes (Istio). TLS 1.3 is current standard.',
                tradeoffs: { pros: ['Data confidentiality', 'Prevents man-in-the-middle attacks', 'Required by browsers for modern APIs'], cons: ['TLS handshake adds latency (1-2 RTTs)', 'Certificate management overhead', 'CPU cost for encryption (minor with modern hardware)'] },
                codeExample: `TLS 1.3 Handshake (1-RTT):
Client → Server: ClientHello + key share
Server → Client: ServerHello + cert + key share
Client → Server: Finished (encrypted!)

Total: 1 round trip (vs 2 RTT in TLS 1.2)

# Let's Encrypt auto-renewal
certbot certonly --nginx -d example.com`,
                interviewTips: ['Explain the TLS handshake steps', 'Know TLS 1.2 vs 1.3 differences', 'Discuss certificate pinning and its trade-offs']
            }
        },
        {
            id: 'idempotency', title: 'Idempotency', icon: '🔁',
            description: 'Ensuring repeated operations produce the same result, critical for payment and retry safety.',
            tags: ['Reliability', 'Retry', 'Payment'],
            hasAnimation: true,
            content: {
                overview: 'An operation is <strong>idempotent</strong> if performing it multiple times produces the same result as performing it once. This is critical for safely retrying operations in distributed systems where networks are unreliable.',
                howItWorks: ['Client generates a unique idempotency key for each operation', 'Sends request with the key in header/body', 'Server checks if key was already processed', 'If yes → return cached result (no duplicate operation)', 'If no → process request, store result with key'],
                keyConcepts: ['<strong>Idempotency Key</strong> — Client-generated unique ID (UUID)', '<strong>Naturally Idempotent</strong> — GET, PUT, DELETE are idempotent; POST is not', '<strong>Exactly-Once Semantics</strong> — Idempotency enables safe retries', '<strong>Deduplication</strong> — Server-side duplicate detection', '<strong>Payment Safety</strong> — Prevents double-charging customers'],
                realWorld: 'Stripe requires idempotency keys for all charge requests. AWS S3 PUT is idempotent. Kafka exactly-once processing uses idempotent producers.',
                tradeoffs: { pros: ['Safe retries', 'Prevents duplicate operations', 'Essential for payment systems'], cons: ['Storage for idempotency key → result mapping', 'TTL management for stored keys', 'Client must generate unique keys'] },
                codeExample: `# Stripe Idempotency
POST /v1/charges
Idempotency-Key: "order-123-attempt-1"
{amount: 5000, currency: "usd"}

# Retry same request → same result, no double charge!
POST /v1/charges
Idempotency-Key: "order-123-attempt-1"  # same key
→ Returns cached 200 OK (not charged again)`,
                interviewTips: ['Give examples of idempotent vs non-idempotent operations', 'Explain how Stripe uses idempotency keys', 'Know the difference between idempotent and safe']
            }
        },
        {
            id: 'fault-tolerance', title: 'Fault Tolerance & Redundancy', icon: '🛡️',
            description: 'Designing systems that continue operating despite component failures.',
            tags: ['Reliability', 'High Availability', 'Redundancy'],
            hasAnimation: true,
            content: {
                overview: '<strong>Fault Tolerance</strong> is a system\'s ability to continue operating when components fail. It\'s achieved through <strong>redundancy</strong> (duplicate components), <strong>failover</strong> (automatic switching), and <strong>graceful degradation</strong>.',
                howItWorks: ['Redundancy: deploy multiple instances of every component', 'Active-Active: all instances handle traffic simultaneously', 'Active-Passive: standby takes over when primary fails', 'Health checks detect failures automatically', 'Traffic rerouted to healthy instances within seconds'],
                keyConcepts: ['<strong>Availability</strong> — Percentage of uptime (99.99% = 52 min downtime/year)', '<strong>Active-Active</strong> — All replicas serve traffic', '<strong>Active-Passive</strong> — Standby waits for failover', '<strong>Graceful Degradation</strong> — Reduced functionality instead of total failure', '<strong>Chaos Engineering</strong> — Deliberately inject failures to test resilience'],
                realWorld: 'Netflix Chaos Monkey kills random servers in production. AWS Multi-AZ for database failover. Google targets 99.999% availability for critical services.',
                tradeoffs: { pros: ['High availability', 'User-transparent failures', 'Business continuity'], cons: ['Cost (2-3x infrastructure)', 'Complexity in testing', 'Data consistency during failover'] },
                codeExample: `Availability Levels:
  99%    → 3.65 days downtime/year
  99.9%  → 8.7 hours/year
  99.99% → 52 minutes/year
  99.999% → 5 minutes/year (five nines)

# Active-Passive Failover
Primary DB ──health check──→ OK
Primary DB ──health check──→ FAIL!
  → Promote Replica to Primary
  → Update DNS/connection string
  → Resume in ~30 seconds`,
                interviewTips: ['Calculate availability from component reliabilities', 'Know active-active vs active-passive', 'Explain chaos engineering principles']
            }
        }
    ]
};

/**
 * Category: Performance & Monitoring 
 */
export const PERFORMANCE = {
    id: 'performance',
    name: 'Performance & Monitoring',
    icon: '📊',
    level: 'intermediate',
    topics: [
        {
            id: 'distributed-tracing', title: 'Distributed Tracing', icon: '🔎',
            description: 'Track requests as they flow through multiple microservices.',
            tags: ['Observability', 'Tracing', 'Jaeger'],
            hasAnimation: true,
            content: {
                overview: '<strong>Distributed Tracing</strong> tracks a request as it travels through multiple microservices. Each service adds a span to the trace, creating a complete picture of the request\'s journey — latency, errors, and dependencies.',
                howItWorks: ['Request enters system → unique Trace ID generated', 'Each service creates a Span (operation + timing)', 'Span includes: service name, operation, start/end time, metadata', 'Context propagated via headers to downstream services', 'All spans collected and visualized as a trace timeline'],
                keyConcepts: ['<strong>Trace</strong> — Full journey of a request through the system', '<strong>Span</strong> — Single operation within a trace (e.g., DB query)', '<strong>Context Propagation</strong> — Passing trace ID between services', '<strong>Sampling</strong> — Trace a percentage of requests (1-10%) to reduce overhead', '<strong>OpenTelemetry</strong> — Open standard for traces, metrics, logs'],
                realWorld: 'Jaeger (Uber). Zipkin (Twitter). AWS X-Ray. Google Cloud Trace. Datadog APM. All use OpenTelemetry.',
                tradeoffs: { pros: ['Root cause analysis for latency', 'Dependency visualization', 'Performance bottleneck detection'], cons: ['Storage overhead', 'Sampling may miss issues', 'Instrumentation effort'] },
                codeExample: `Trace: "GET /api/order/123"
├── [API Gateway]     2ms
├── [Order Service]   15ms
│   ├── [Redis Cache] 1ms (MISS)
│   ├── [PostgreSQL]  8ms
│   └── [User Service] 5ms
│       └── [Cache]   1ms (HIT)
└── Total: 17ms

Header: traceparent: 00-trace_id-span_id-01`,
                interviewTips: ['Know OpenTelemetry and its three signals', 'Explain sampling strategies', 'Compare traces vs metrics vs logs']
            }
        },
        {
            id: 'autoscaling', title: 'Autoscaling', icon: '📈',
            description: 'Automatically adjust compute resources based on current demand.',
            tags: ['Cloud', 'Scaling', 'Cost Optimization'],
            hasAnimation: true,
            content: {
                overview: '<strong>Autoscaling</strong> automatically adjusts the number of server instances based on current demand. Scale up during traffic spikes, scale down during quiet periods to save costs.',
                howItWorks: ['Define scaling policies (CPU > 70% → add instance)', 'Monitoring system tracks metrics (CPU, memory, request rate)', 'When threshold exceeded → launch new instances', 'Load balancer adds new instances to pool', 'When load decreases → terminate excess instances (cool-down period)'],
                keyConcepts: ['<strong>Horizontal Autoscaling</strong> — Add/remove instances (most common)', '<strong>Vertical Autoscaling</strong> — Resize instance (limited)', '<strong>Scaling Policy</strong> — Rules for when to scale (target tracking, step)', '<strong>Cool-Down Period</strong> — Prevents rapid scale oscillation', '<strong>Predictive Scaling</strong> — ML-based, anticipates load patterns'],
                realWorld: 'AWS Auto Scaling Groups. Kubernetes HPA (Horizontal Pod Autoscaler). Netflix scales based on streaming demand patterns. Black Friday scaling for e-commerce.',
                tradeoffs: { pros: ['Cost optimization (pay for what you use)', 'Handle traffic spikes', 'No manual intervention'], cons: ['Cold start latency for new instances', 'Over/under-provisioning during transitions', 'Complex tuning of thresholds'] },
                codeExample: `# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    name: my-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`,
                interviewTips: ['Know reactive vs predictive scaling', 'Explain the cold start problem', 'Discuss scale-to-zero for serverless']
            }
        },
        {
            id: 'pagination', title: 'Pagination Strategies', icon: '📄',
            description: 'Efficiently retrieve large datasets in manageable chunks.',
            tags: ['API', 'Performance', 'Database'],
            hasAnimation: true,
            content: {
                overview: '<strong>Pagination</strong> divides large result sets into smaller pages for efficient retrieval. <strong>Offset-based</strong> uses page numbers. <strong>Cursor-based</strong> uses a pointer for consistent results.',
                howItWorks: ['Offset: SELECT * FROM posts LIMIT 20 OFFSET 40 (page 3)', 'Cursor: SELECT * FROM posts WHERE id > last_seen_id LIMIT 20', 'Keyset: Like cursor but uses indexed columns', 'API returns page data + next page token/cursor', 'Client sends token to fetch next page'],
                keyConcepts: ['<strong>Offset</strong> — Simple but slow for deep pages (scans skipped rows)', '<strong>Cursor</strong> — Consistent, handles real-time inserts/deletes', '<strong>Keyset</strong> — Uses indexed column for efficient deep pagination', '<strong>Total Count</strong> — COUNT(*) can be expensive, consider estimates', '<strong>Page Size</strong> — Balance between too many requests and too much data'],
                realWorld: 'Twitter timeline uses cursor-based. Shopify API uses cursor. Slack messages use cursor. Traditional forums use offset pagination.',
                tradeoffs: { pros: ['Offset: Simple, supports "jump to page N"', 'Cursor: Consistent, performant at any depth'], cons: ['Offset: Slow for deep pages, inconsistent with updates', 'Cursor: Can\'t jump to arbitrary page'] },
                codeExample: `# Offset (page 100 of 20 items)
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 1980;
-- DB scans and skips 1980 rows... slow!

# Cursor-based (fast at any depth!)
SELECT * FROM posts WHERE id > 1980
ORDER BY id LIMIT 20;
-- Uses index, instant!

# API Response
{ "data": [...], "next_cursor": "abc123" }`,
                interviewTips: ['Know when cursor beats offset', 'Explain the performance difference', 'Discuss total count estimation strategies']
            }
        }
    ]
};
