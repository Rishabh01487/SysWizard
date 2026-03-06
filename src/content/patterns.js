/**
 * Category: Design Patterns
 * Architectural patterns for building robust distributed systems.
 */
export const PATTERNS = {
    id: 'design-patterns',
    name: 'Design Patterns',
    icon: '🧩',
    level: 'advanced',
    topics: [
        {
            id: 'microservices', title: 'Microservices Architecture', icon: '🧩',
            description: 'Break monolith into independently deployable services communicating via APIs.',
            tags: ['Architecture', 'API', 'Scalability'],
            hasAnimation: true, animationModule: 'microservices',
            content: {
                overview: '<strong>Microservices</strong> decompose a monolithic application into small, independent services. Each service owns its data, is deployed independently, and communicates via APIs.',
                howItWorks: ['Identify bounded contexts (business domains)', 'Each service has its own database (Database-per-Service)', 'Services communicate via REST, gRPC, or message queues', 'API Gateway provides a unified entry point', 'Each service is deployed, scaled, and updated independently'],
                keyConcepts: ['<strong>Bounded Context</strong> — Each service owns a business domain', '<strong>Database-per-Service</strong> — No shared database', '<strong>API Gateway</strong> — Single entry point for clients', '<strong>Service Mesh</strong> — Infrastructure layer for service-to-service communication', '<strong>Strangler Fig</strong> — Incrementally migrate from monolith'],
                realWorld: 'Netflix: 700+ microservices. Amazon: Each team owns a service. Uber: marketplace, trips, payments as separate services.',
                tradeoffs: { pros: ['Independent scaling and deployment', 'Technology diversity', 'Fault isolation'], cons: ['Network complexity', 'Data consistency challenges', 'Operational overhead'] },
                codeExample: `# Service boundaries
User Service     → /api/users (PostgreSQL)
Order Service    → /api/orders (MongoDB)
Payment Service  → /api/payments (PostgreSQL)
Notification Svc → /api/notify (Redis)

# Each service: separate repo, CI/CD, database`,
                interviewTips: ['Know when monolith is better', 'Explain Database-per-Service trade-offs', 'Discuss the Strangler Fig migration pattern']
            }
        },
        {
            id: 'event-driven', title: 'Event-Driven Architecture', icon: '⚡',
            description: 'Systems that produce, detect, and react to events for loose coupling.',
            tags: ['Events', 'Async', 'Decoupling'],
            hasAnimation: true,
            content: {
                overview: '<strong>Event-Driven Architecture (EDA)</strong> is a paradigm where components communicate by producing and consuming events. This enables loose coupling, real-time processing, and scalability.',
                howItWorks: ['A service performs an action and emits an event (e.g., "OrderPlaced")', 'Event is published to an event bus (Kafka, EventBridge)', 'Interested services subscribe and react to the event', 'Each service processes independently (async)', 'Event log provides audit trail and replay capability'],
                keyConcepts: ['<strong>Event</strong> — Immutable fact that something happened', '<strong>Event Bus/Broker</strong> — Kafka, RabbitMQ, AWS EventBridge', '<strong>Event Sourcing</strong> — Store state as a sequence of events', '<strong>Eventually Consistent</strong> — Data converges across services', '<strong>Event Schema Registry</strong> — Manage event format evolution'],
                realWorld: 'Uber: ride events (requested → matched → started → completed). Stripe: payment events trigger webhooks. LinkedIn: Kafka processes billions of events/day.',
                tradeoffs: { pros: ['Loose coupling', 'Scalable', 'Great audit trail'], cons: ['Eventual consistency', 'Hard to debug (event chains)', 'Event ordering challenges'] },
                codeExample: `// Event-Driven Order Flow
OrderService → emit("OrderPlaced", {id:1, items:[...]})

// Subscribers react:
InventoryService → on("OrderPlaced") → reserve items
PaymentService   → on("OrderPlaced") → charge card
NotificationSvc  → on("OrderPlaced") → send email
AnalyticsService → on("OrderPlaced") → track metrics`,
                interviewTips: ['Compare event-driven vs request-driven', 'Explain event sourcing with examples', 'Discuss idempotency in event consumers']
            }
        },
        {
            id: 'cqrs', title: 'CQRS & Event Sourcing', icon: '📖',
            description: 'Separate read and write models for optimized query and command handling.',
            tags: ['Pattern', 'Read/Write', 'Event Store'],
            hasAnimation: true,
            content: {
                overview: '<strong>CQRS</strong> (Command Query Responsibility Segregation) separates read and write operations into different models. Combined with <strong>Event Sourcing</strong> (storing all changes as events), it enables powerful auditing and scalability.',
                howItWorks: ['Commands (writes) go to the Write Model', 'Write Model validates and stores events in Event Store', 'Events are projected to Read Model (optimized views)', 'Queries (reads) go to the Read Model', 'Read and Write models can use different databases'],
                keyConcepts: ['<strong>Command</strong> — Intent to change state (CreateOrder, UpdateProfile)', '<strong>Query</strong> — Read request (GetOrderHistory, SearchProducts)', '<strong>Event Store</strong> — Append-only log of all events', '<strong>Projection</strong> — Transform events into read-optimized views', '<strong>Rebuild</strong> — Replay all events to reconstruct state'],
                realWorld: 'Banking: event sourcing for transaction history. Axon Framework for Java CQRS. EventStoreDB is a dedicated event store database.',
                tradeoffs: { pros: ['Optimized reads AND writes independently', 'Full audit trail', 'Temporal queries (state at any point in time)'], cons: ['Eventual consistency between read/write', 'Increased complexity', 'Event schema evolution challenges'] },
                codeExample: `# Event Sourcing: Bank Account
Events:
  1. AccountOpened(id=A, balance=0)
  2. MoneyDeposited(id=A, amount=100)
  3. MoneyWithdrawn(id=A, amount=30)

Current state = replay events:
  0 → +100 → -30 = $70

# CQRS: Different read models
  Write DB: Event store (append-only)
  Read DB 1: Account balances (materialized)
  Read DB 2: Transaction history (search)`,
                interviewTips: ['Know when CQRS is overkill (most CRUD apps)', 'Explain event replay and reconstruction', 'Discuss event versioning strategies']
            }
        },
        {
            id: 'service-discovery', title: 'Service Discovery', icon: '🔍',
            description: 'How microservices find and communicate with each other dynamically.',
            tags: ['Microservices', 'Registry', 'Consul'],
            hasAnimation: true,
            content: {
                overview: 'In a microservices architecture, services are deployed across many hosts with dynamic IPs. <strong>Service Discovery</strong> enables services to find each other automatically without hardcoded addresses.',
                howItWorks: ['Service starts and registers with Service Registry (self-registration)', 'Registry stores: service name → list of healthy instances + addresses', 'Client-side discovery: client queries registry, picks an instance', 'Server-side discovery: load balancer queries registry and routes', 'Health checks remove unhealthy instances from registry'],
                keyConcepts: ['<strong>Service Registry</strong> — Database of available service instances (Consul, etcd, ZooKeeper)', '<strong>Client-Side Discovery</strong> — Client picks which instance to call (Netflix Eureka)', '<strong>Server-Side Discovery</strong> — Load balancer picks instance (AWS ALB)', '<strong>DNS-Based</strong> — Services resolve via internal DNS', '<strong>Service Mesh</strong> — Sidecar proxy handles discovery (Istio, Linkerd)'],
                realWorld: 'Consul (HashiCorp) for service discovery. Netflix Eureka. Kubernetes built-in DNS service discovery. AWS Cloud Map.',
                tradeoffs: { pros: ['Dynamic scaling (services come and go)', 'No hardcoded addresses', 'Load balancing across instances'], cons: ['Registry is a critical dependency', 'Network overhead for registration', 'Stale entries if health checks lag'] },
                codeExample: `# Consul Service Registration
{
  "service": {
    "name": "user-service",
    "port": 8080,
    "check": {
      "http": "http://localhost:8080/health",
      "interval": "10s"
    }
  }
}

# Discovery: query Consul
GET /v1/health/service/user-service
→ [{address:"10.0.1.5", port:8080}, ...]`,
                interviewTips: ['Compare client-side vs server-side discovery', 'Explain how Kubernetes does service discovery', 'Discuss service mesh vs traditional discovery']
            }
        },
        {
            id: 'circuit-breaker', title: 'Circuit Breaker Pattern', icon: '🔌',
            description: 'Prevent cascading failures by stopping calls to failing services.',
            tags: ['Fault Tolerance', 'Resilience', 'Hystrix'],
            hasAnimation: true,
            content: {
                overview: 'The <strong>Circuit Breaker</strong> pattern prevents cascading failures in distributed systems. Like an electrical circuit breaker, it "trips" when a downstream service is failing, short-circuiting requests to return a fallback instead.',
                howItWorks: ['CLOSED state: requests pass through normally, failures tracked', 'If failure rate exceeds threshold → circuit OPENS', 'OPEN state: requests immediately fail (fast-fail), no calls to downstream', 'After timeout → circuit goes to HALF-OPEN', 'HALF-OPEN: allows a test request — if success → CLOSE, if fail → OPEN again'],
                keyConcepts: ['<strong>Closed</strong> — Normal operation, counting failures', '<strong>Open</strong> — Fast-fail, return fallback response', '<strong>Half-Open</strong> — Testing if service recovered', '<strong>Fallback</strong> — Cached response, default value, or degraded function', '<strong>Bulkhead</strong> — Isolate failures to specific service calls'],
                realWorld: 'Netflix Hystrix (now resilience4j). Polly (.NET). AWS App Mesh circuit breaking. Istio service mesh circuit breakers.',
                tradeoffs: { pros: ['Prevents cascading failures', 'Fast failure (no waiting for timeouts)', 'Auto-recovery'], cons: ['Complexity in configuring thresholds', 'Fallback logic must be designed', 'False positives during transient issues'] },
                codeExample: `// Circuit Breaker States
CLOSED → (5 failures in 10s) → OPEN
OPEN → (wait 30s) → HALF_OPEN
HALF_OPEN → (1 success) → CLOSED
HALF_OPEN → (1 failure) → OPEN

// Resilience4j (Java)
CircuitBreaker cb = CircuitBreaker.of("paymentSvc",
  CircuitBreakerConfig.custom()
    .failureRateThreshold(50)
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .build()
);`,
                interviewTips: ['Draw the state diagram', 'Explain the difference from retry pattern', 'Discuss bulkhead pattern as complement']
            }
        },
        {
            id: 'saga-pattern', title: 'Saga Pattern', icon: '📜',
            description: 'Manage distributed transactions using a sequence of local transactions with compensations.',
            tags: ['Transactions', 'Microservices', 'Compensation'],
            hasAnimation: true,
            content: {
                overview: 'The <strong>Saga Pattern</strong> manages data consistency across microservices without distributed locking. A saga is a sequence of local transactions where each step has a compensating transaction to undo it if a later step fails.',
                howItWorks: ['Define saga as sequence: T1 → T2 → T3', 'Define compensations: C1, C2, C3 (undo each step)', 'Execute steps sequentially or via events', 'If T3 fails → run C2, then C1 (reverse order)', 'Each step is a local ACID transaction'],
                keyConcepts: ['<strong>Choreography</strong> — Services emit events, others react (decentralized)', '<strong>Orchestration</strong> — Central coordinator manages the saga flow', '<strong>Compensating Transaction</strong> — Reverses the effect of a step', '<strong>Pivot Transaction</strong> — Point of no return in a saga', '<strong>Semantic Lock</strong> — Mark data as "in saga" to prevent conflicts'],
                realWorld: 'Uber ride: Reserve driver → Process payment → Start ride. If payment fails, release driver. AWS Step Functions are saga orchestrators.',
                tradeoffs: { pros: ['No distributed locks', 'Each service maintains autonomy', 'Better availability than 2PC'], cons: ['Eventual consistency', 'Complex compensation logic', 'Hard to debug long sagas'] },
                codeExample: `# E-commerce Saga (Orchestration)
saga = Saga([
  Step("reserve_inventory", compensate="release_inventory"),
  Step("process_payment",   compensate="refund_payment"),
  Step("create_shipment",   compensate="cancel_shipment"),
  Step("send_confirmation")
])

# If process_payment fails:
#   → release_inventory (compensation)
#   → Order cancelled`,
                interviewTips: ['Compare choreography vs orchestration', 'Explain a real saga with compensations', 'Know the challenges of saga debugging']
            }
        },
        {
            id: 'sidecar-pattern', title: 'Sidecar & Service Mesh', icon: '🏍️',
            description: 'Deploy helper processes alongside services for observability, security, and networking.',
            tags: ['Infrastructure', 'Istio', 'Envoy'],
            hasAnimation: true,
            content: {
                overview: 'The <strong>Sidecar Pattern</strong> deploys a helper process alongside each service instance to handle cross-cutting concerns. A <strong>Service Mesh</strong> (Istio, Linkerd) deploys sidecars everywhere for consistent networking, security, and observability.',
                howItWorks: ['Sidecar proxy deployed alongside each service (same pod in K8s)', 'All network traffic flows through the sidecar', 'Sidecar handles: mTLS, retries, circuit breaking, tracing', 'Service mesh control plane configures all sidecars centrally', 'Application code doesn\'t need to handle these concerns'],
                keyConcepts: ['<strong>Sidecar Proxy</strong> — Envoy, Linkerd-proxy intercept all traffic', '<strong>Service Mesh</strong> — Infrastructure layer for all service communication', '<strong>mTLS</strong> — Mutual TLS between all services (zero-trust)', '<strong>Observability</strong> — Automatic distributed tracing, metrics', '<strong>Traffic Management</strong> — Canary deploys, traffic splitting, retries'],
                realWorld: 'Istio (Google) with Envoy sidecars. Linkerd by Buoyant. AWS App Mesh. Consul Connect. Used by eBay, Airbnb, Lyft.',
                tradeoffs: { pros: ['Consistent cross-cutting concerns', 'Language-agnostic (works with any service)', 'Zero-trust security'], cons: ['Resource overhead (CPU/memory per sidecar)', 'Added latency per hop', 'Operational complexity'] },
                codeExample: `# Kubernetes Pod with Sidecar
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: my-service
    image: my-app:v1
    ports: [{containerPort: 8080}]
  - name: envoy-sidecar    # ← Sidecar
    image: envoyproxy/envoy
    ports: [{containerPort: 9901}]`,
                interviewTips: ['Explain how service mesh differs from API gateway', 'Know Envoy proxy capabilities', 'Discuss when service mesh is/isn\'t needed']
            }
        },
        {
            id: 'backpressure', title: 'Backpressure & Flow Control', icon: '🚰',
            description: 'Mechanisms to prevent fast producers from overwhelming slow consumers.',
            tags: ['Performance', 'Resilience', 'Streaming'],
            hasAnimation: true,
            content: {
                overview: '<strong>Backpressure</strong> is a mechanism where a slow consumer signals to a fast producer to slow down. Without it, the consumer gets overwhelmed, causing memory exhaustion, crashes, or data loss.',
                howItWorks: ['Producer generates data faster than consumer can process', 'Without backpressure: buffer grows → OOM crash', 'With backpressure: consumer signals "slow down" to producer', 'Producer reduces rate or pauses until consumer catches up', 'Buffers/queues provide temporary elasticity'],
                keyConcepts: ['<strong>Pull-Based</strong> — Consumer requests data when ready (Kafka)', '<strong>Push-Based with Backpressure</strong> — Producer monitors consumer state', '<strong>Buffer/Queue</strong> — Absorb temporary bursts', '<strong>Load Shedding</strong> — Drop low-priority requests when overloaded', '<strong>Reactive Streams</strong> — Specification for async backpressure (RxJava, Reactor)'],
                realWorld: 'TCP flow control (window size). Kafka consumer pull-based model. Reactive Streams (Project Reactor in Spring). Node.js stream backpressure.',
                tradeoffs: { pros: ['Prevents crashes from overload', 'Graceful degradation', 'Efficient resource usage'], cons: ['Added complexity', 'May cause end-to-end latency increase', 'Producer must handle slow-down signals'] },
                codeExample: `// Node.js Stream Backpressure
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();  // Backpressure!
    writable.once('drain', () => {
      readable.resume();  // Consumer ready
    });
  }
});`,
                interviewTips: ['Explain TCP flow control as example', 'Compare pull vs push with backpressure', 'Know how Kafka handles backpressure']
            }
        }
    ]
};
