/**
 * Category: Communication Protocols
 * How services and clients communicate in distributed systems.
 */
export const COMMUNICATION = {
    id: 'communication',
    name: 'Communication',
    icon: '📡',
    level: 'intermediate',
    topics: [
        {
            id: 'websockets', title: 'WebSockets & Long Polling', icon: '🔌',
            description: 'Real-time bidirectional communication between client and server.',
            tags: ['Real-Time', 'Bidirectional', 'Chat'],
            hasAnimation: true,
            content: {
                overview: '<strong>WebSockets</strong> provide full-duplex, persistent connections between client and server. Unlike HTTP (request → response), WebSockets allow the server to push data to the client anytime. <strong>Long Polling</strong> is a simpler alternative where the client holds a request open until the server has data.',
                howItWorks: ['WebSocket: HTTP upgrade handshake → persistent TCP connection', 'Both client and server can send messages anytime', 'Long Polling: Client sends request → server holds until data is ready → responds → client immediately re-requests', 'Server-Sent Events (SSE): Server-only push over HTTP', 'WebSocket protocol: ws:// or wss:// (encrypted)'],
                keyConcepts: ['<strong>Full-Duplex</strong> — Both sides send/receive simultaneously', '<strong>Connection Upgrade</strong> — HTTP → WebSocket handshake', '<strong>Long Polling</strong> — Simulated real-time via held HTTP requests', '<strong>SSE</strong> — Server-Sent Events, one-way server→client push', '<strong>Heartbeat/Ping-Pong</strong> — Keep WebSocket connections alive'],
                realWorld: 'Slack/Discord use WebSockets for real-time messages. Stock tickers use WebSockets. Google Docs collaboration. Uber driver location updates.',
                tradeoffs: { pros: ['True real-time communication', 'Low latency (no polling overhead)', 'Bidirectional'], cons: ['Stateful connections (harder to scale)', 'Need sticky sessions or pub/sub', 'Firewalls may block WebSocket'] },
                codeExample: `// Client
const ws = new WebSocket('wss://chat.example.com');
ws.onmessage = (e) => console.log(e.data);
ws.send(JSON.stringify({type:'chat', msg:'Hello!'}));

// Server (Node.js)
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    // Broadcast to all connected clients
    wss.clients.forEach(c => c.send(msg));
  });
});`,
                interviewTips: ['Compare WebSocket vs Long Polling vs SSE', 'Explain how to scale WebSocket servers', 'Know connection limits and heartbeat strategies']
            }
        },
        {
            id: 'grpc', title: 'gRPC & Protocol Buffers', icon: '⚡',
            description: 'High-performance RPC framework using HTTP/2 and binary serialization.',
            tags: ['RPC', 'HTTP/2', 'Binary', 'Protobuf'],
            hasAnimation: true,
            content: {
                overview: '<strong>gRPC</strong> is a high-performance RPC framework by Google that uses <strong>HTTP/2</strong> for transport and <strong>Protocol Buffers</strong> for serialization. It\'s 5-10x faster than REST/JSON and supports streaming.',
                howItWorks: ['Define service and messages in .proto files', 'Generate client/server code from .proto (any language)', 'Client calls server methods as if they were local functions', 'Data serialized as binary Protobuf (compact, fast)', 'HTTP/2 enables multiplexing, streaming, header compression'],
                keyConcepts: ['<strong>Protocol Buffers</strong> — Binary serialization format (3-10x smaller than JSON)', '<strong>HTTP/2</strong> — Multiplexed streams, header compression', '<strong>Unary RPC</strong> — Simple request-response', '<strong>Server Streaming</strong> — Server sends multiple responses', '<strong>Bidirectional Streaming</strong> — Both sides send streams'],
                realWorld: 'Google uses gRPC for all internal services. Netflix, Square, Cisco use gRPC. Kubernetes API server supports gRPC. Microservices communication.',
                tradeoffs: { pros: ['Very fast (binary, HTTP/2)', 'Strongly typed contracts', 'Multi-language support'], cons: ['Not human-readable', 'Browser support limited (needs grpc-web)', 'More complex toolchain'] },
                codeExample: `// user.proto
service UserService {
  rpc GetUser (UserRequest) returns (User);
  rpc ListUsers (Empty) returns (stream User);
}
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

// Client call (looks like local function!)
user = stub.GetUser(UserRequest(id=42))`,
                interviewTips: ['Compare gRPC vs REST for inter-service communication', 'Know the 4 types of gRPC calls', 'Explain when to use REST vs gRPC']
            }
        },
        {
            id: 'graphql', title: 'GraphQL', icon: '◼️',
            description: 'Query language that lets clients request exactly the data they need.',
            tags: ['API', 'Query Language', 'Facebook'],
            hasAnimation: true,
            content: {
                overview: '<strong>GraphQL</strong> is a query language for APIs developed by Facebook. Clients specify exactly what data they need in a single request, solving REST\'s over-fetching and under-fetching problems.',
                howItWorks: ['Define a schema with types, queries, and mutations', 'Client sends a query specifying exactly the fields needed', 'Server resolves the query by calling resolvers', 'Single endpoint handles all queries (unlike REST with many endpoints)', 'Supports real-time with subscriptions'],
                keyConcepts: ['<strong>Schema</strong> — Type definitions describing available data', '<strong>Query</strong> — Read operations (like GET)', '<strong>Mutation</strong> — Write operations (like POST/PUT/DELETE)', '<strong>Resolver</strong> — Functions that fetch data for each field', '<strong>N+1 Problem</strong> — Naive resolvers cause excessive DB queries (use DataLoader)'],
                realWorld: 'Facebook, GitHub, Shopify, Yelp use GraphQL APIs. Apollo is popular client/server framework. Hasura auto-generates GraphQL from PostgreSQL.',
                tradeoffs: { pros: ['No over/under-fetching', 'Single request for complex data', 'Self-documenting schema'], cons: ['Complex caching (no URL-based cache)', 'N+1 query problem', 'Security: malicious deep queries'] },
                codeExample: `# GraphQL Query
query {
  user(id: 42) {
    name
    email
    posts(last: 5) {
      title
      likes
    }
  }
}

# Response: exactly what you asked for
{
  "user": {
    "name": "Jane",
    "email": "jane@ex.com",
    "posts": [{"title":"Hello","likes":10}]
  }
}`,
                interviewTips: ['Compare GraphQL vs REST vs gRPC', 'Explain N+1 problem and DataLoader solution', 'Know query depth limiting for security']
            }
        },
        {
            id: 'api-design', title: 'API Design & Versioning', icon: '📐',
            description: 'Best practices for designing, versioning, and evolving APIs.',
            tags: ['API', 'Best Practices', 'Versioning'],
            hasAnimation: true,
            content: {
                overview: 'Good <strong>API Design</strong> is crucial for developer experience and system evolution. It covers naming conventions, versioning strategies, pagination, error handling, and backward compatibility.',
                howItWorks: ['Design resource-oriented URLs (/users, /orders)', 'Use proper HTTP methods and status codes', 'Version APIs to allow evolution (URL, header, or query param)', 'Implement pagination for large collections (cursor vs offset)', 'Provide clear error messages with error codes'],
                keyConcepts: ['<strong>URL Versioning</strong> — /api/v1/users, /api/v2/users', '<strong>Header Versioning</strong> — Accept: application/vnd.api.v2+json', '<strong>Cursor Pagination</strong> — Efficient for real-time data (vs offset)', '<strong>HATEOAS</strong> — Hyperlinks in responses for discoverability', '<strong>Idempotency Keys</strong> — Client-generated ID to prevent duplicate operations'],
                realWorld: 'Stripe\'s API is considered gold standard for API design. GitHub API has excellent versioning. Twilio: consistent error format across all endpoints.',
                tradeoffs: { pros: ['Good DX attracts developers', 'Versioning enables evolution', 'Consistent patterns reduce support'], cons: ['Maintaining multiple versions', 'Migration burden on consumers', 'Over-engineering for simple APIs'] },
                codeExample: `# Good API Design
GET    /api/v2/users?cursor=abc&limit=20
POST   /api/v2/users
  Idempotency-Key: unique-req-123

# Error Response
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Account balance too low",
    "status": 402
  }
}`,
                interviewTips: ['Know cursor vs offset pagination trade-offs', 'Explain idempotency keys for payment APIs', 'Discuss backward/forward compatibility']
            }
        },
        {
            id: 'pubsub', title: 'Pub/Sub Messaging', icon: '📢',
            description: 'Publishers send messages to topics; subscribers receive messages from topics they subscribe to.',
            tags: ['Messaging', 'Async', 'Topics'],
            hasAnimation: true,
            content: {
                overview: '<strong>Publish-Subscribe (Pub/Sub)</strong> is a messaging pattern where senders (publishers) don\'t send messages directly to receivers. Instead, messages are published to topics, and all subscribers to that topic receive the message.',
                howItWorks: ['Publisher sends message to a named topic', 'Message broker stores and routes the message', 'All subscribers of that topic receive a copy', 'Subscribers can join/leave independently', 'Messages can be persisted for durability and replay'],
                keyConcepts: ['<strong>Topic</strong> — Named channel for publishing messages', '<strong>Fan-Out</strong> — One message delivered to ALL subscribers', '<strong>At-Least-Once</strong> — Message delivered at least once (duplicates possible)', '<strong>Message Ordering</strong> — FIFO within partitions', '<strong>Dead Letter Topic</strong> — Where unprocessable messages go'],
                realWorld: 'Google Cloud Pub/Sub. AWS SNS (Simple Notification Service). Apache Kafka topics. Redis Pub/Sub for real-time features.',
                tradeoffs: { pros: ['Complete decoupling of producer/consumer', 'Easy to add new subscribers', 'Scalable'], cons: ['Delivery guarantees vary', 'Message ordering challenges', 'No request-response semantics'] },
                codeExample: `# Pub/Sub: Order Events
Publisher: OrderService
Topic: "order-events"

Subscribers:
  InventoryService → reserves stock
  NotificationService → sends email
  AnalyticsService → tracks metrics
  BillingService → generates invoice

# All subscribers get EVERY order event`,
                interviewTips: ['Compare Pub/Sub vs Point-to-Point queues', 'Explain fan-out pattern use cases', 'Know how Kafka topics differ from traditional Pub/Sub']
            }
        }
    ]
};
