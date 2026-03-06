/**
 * Category: Core Infrastructure
 * Essential infrastructure components for building scalable systems.
 */
export const CORE_INFRA = {
    id: 'core-infrastructure',
    name: 'Core Infrastructure',
    icon: '🏗️',
    level: 'intermediate',
    topics: [
        {
            id: 'load-balancing', title: 'Load Balancing', icon: '⚖️',
            description: 'Distributes incoming traffic across multiple servers to ensure no single server is overwhelmed.',
            tags: ['Scalability', 'High Availability', 'Round Robin'],
            hasAnimation: true, animationModule: 'loadBalancing',
            content: {
                overview: '<strong>Load Balancing</strong> distributes incoming network traffic across multiple servers. This ensures no single server bears too much load, improving reliability, performance, and availability.',
                howItWorks: ['Clients send requests to the load balancer IP', 'Load balancer selects a backend server using an algorithm', 'Request is forwarded to the chosen server', 'Response is sent back through the load balancer', 'Health checks detect and remove unhealthy servers'],
                keyConcepts: ['<strong>Round Robin</strong> — Cycle through servers sequentially', '<strong>Least Connections</strong> — Send to server with fewest active connections', '<strong>IP Hash</strong> — Consistent routing based on client IP', '<strong>Weighted</strong> — More powerful servers get more traffic', '<strong>Layer 4 vs Layer 7</strong> — TCP-level vs HTTP-level load balancing'],
                realWorld: 'AWS ELB, Nginx, HAProxy, Google Cloud Load Balancer. Netflix uses multiple layers of load balancing. Any high-traffic website uses this.',
                tradeoffs: { pros: ['Improved availability', 'Horizontal scalability', 'Fault tolerance'], cons: ['Single point of failure (LB itself)', 'Added latency', 'Session persistence challenges'] },
                codeExample: `# Nginx Load Balancer Config
upstream backend {
    server 10.0.0.1:8080 weight=3;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}
server {
    location / {
        proxy_pass http://backend;
    }
}`,
                interviewTips: ['Know all LB algorithms and when to use each', 'Explain L4 vs L7 load balancing', 'Discuss sticky sessions and their problems']
            }
        },
        {
            id: 'caching', title: 'Caching', icon: '⚡',
            description: 'Store frequently accessed data in fast storage to reduce latency and database load.',
            tags: ['Performance', 'Redis', 'CDN', 'TTL'],
            hasAnimation: true, animationModule: 'caching',
            content: {
                overview: '<strong>Caching</strong> stores copies of frequently accessed data in faster storage so future requests are served faster. It is the single most impactful technique for improving system performance.',
                howItWorks: ['Application checks cache for requested data', 'Cache Hit: Data found → return immediately (~1ms)', 'Cache Miss: Data not found → query database (~100ms)', 'After DB fetch, store result in cache for future requests', 'TTL (Time To Live) controls when cached data expires'],
                keyConcepts: ['<strong>Cache-Aside</strong> — App manages cache reads/writes', '<strong>Write-Through</strong> — Write to cache and DB simultaneously', '<strong>Write-Behind</strong> — Write to cache, async write to DB', '<strong>Cache Invalidation</strong> — Hardest problem in CS!', '<strong>Eviction Policies</strong> — LRU, LFU, FIFO, Random'],
                realWorld: 'Redis caches Twitter timelines. Memcached powers Facebook. CDNs (CloudFlare) cache static assets globally. Browser caches reduce repeated requests.',
                tradeoffs: { pros: ['Dramatically reduces latency', 'Reduces DB load', 'Improves throughput'], cons: ['Data staleness (consistency)', 'Cache invalidation complexity', 'Memory cost'] },
                codeExample: `# Cache-Aside Pattern (Redis)
def get_user(user_id):
    # 1. Check cache
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)  # HIT

    # 2. Cache miss → query DB
    user = db.query("SELECT * FROM users WHERE id=?", user_id)

    # 3. Store in cache (TTL = 5 min)
    redis.setex(f"user:{user_id}", 300, json.dumps(user))
    return user`,
                interviewTips: ['Explain cache invalidation strategies', 'Know when to use each caching pattern', 'Discuss thundering herd problem and cache stampede']
            }
        },
        {
            id: 'cdn', title: 'Content Delivery Network (CDN)', icon: '🌍',
            description: 'Globally distributed network of servers that cache content close to users for faster delivery.',
            tags: ['Performance', 'Edge', 'Static Content'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>CDN</strong> is a geographically distributed network of proxy servers that cache content (images, videos, CSS, JS) at edge locations close to users. This dramatically reduces latency by serving content from the nearest server.',
                howItWorks: ['User requests a resource (e.g., image.jpg)', 'DNS resolves to the nearest CDN edge server', 'Edge server checks its cache for the resource', 'If cached (HIT) → serve directly from edge (~20ms)', 'If not cached (MISS) → fetch from origin server, cache at edge, then serve'],
                keyConcepts: ['<strong>Edge Server</strong> — CDN server closest to user', '<strong>Origin Server</strong> — Your actual server where content lives', '<strong>PoP (Point of Presence)</strong> — Physical CDN location', '<strong>Cache Invalidation</strong> — Purging outdated content from CDN', '<strong>Pull vs Push CDN</strong> — On-demand caching vs pre-loading content'],
                realWorld: 'CloudFlare has 300+ PoPs worldwide. Netflix uses its own CDN (Open Connect). YouTube serves videos from edge servers. Amazon CloudFront caches AWS content globally.',
                tradeoffs: { pros: ['Reduced latency globally', 'Lower origin server load', 'DDoS protection'], cons: ['Cache invalidation challenges', 'Cost for high bandwidth', 'Stale content risk'] },
                codeExample: `# CDN Cache Headers
Cache-Control: public, max-age=86400
# Cache for 24 hours at CDN edge

# Versioned URLs for cache busting
<link href="/styles.abc123.css">
<script src="/app.def456.js">

# Purge CDN cache via API
curl -X POST "https://api.cloudflare.com/purge_cache"`,
                interviewTips: ['Know Pull CDN vs Push CDN differences', 'Explain how CDN works with DNS', 'Discuss cache busting strategies']
            }
        },
        {
            id: 'dns-resolution', title: 'DNS Resolution', icon: '🌐',
            description: 'How domain names are translated into IP addresses through the DNS hierarchy.',
            tags: ['Networking', 'Internet', 'Domain Names'],
            hasAnimation: true, animationModule: 'dnsResolution',
            content: {
                overview: '<strong>DNS (Domain Name System)</strong> is the internet\'s phone book. It translates human-readable domain names (www.google.com) into IP addresses (142.250.80.4) that computers use to identify each other on the network.',
                howItWorks: ['Browser checks its local DNS cache', 'If not cached → query DNS Resolver (ISP)', 'Resolver queries Root DNS Server (13 worldwide)', 'Root directs to TLD server (.com, .org, .net)', 'TLD directs to Authoritative Nameserver', 'Authoritative returns the actual IP address'],
                keyConcepts: ['<strong>DNS Records</strong> — A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameserver)', '<strong>TTL</strong> — How long DNS records are cached', '<strong>DNS Caching</strong> — Browser → OS → ISP Resolver cache hierarchy', '<strong>Recursive vs Iterative</strong> — Resolver does full lookup vs referring to next server', '<strong>GeoDNS</strong> — Returns different IPs based on user location'],
                realWorld: 'CloudFlare DNS (1.1.1.1) and Google DNS (8.8.8.8) are popular resolvers. Route 53 is AWS DNS. DNS is used for load balancing (multiple A records) and failover (DNS health checks).',
                tradeoffs: { pros: ['Human-readable addresses', 'Load distribution via multiple records', 'Global routing with GeoDNS'], cons: ['DNS propagation delays (TTL)', 'DDoS target (Dyn attack 2016)', 'Single point of failure if resolver goes down'] },
                codeExample: `# DNS Lookup
$ nslookup google.com
Server:  8.8.8.8
Address: 142.250.80.4

# DNS Record Types
A     google.com → 142.250.80.4     (IPv4)
AAAA  google.com → 2607:f8b0::200e  (IPv6)
CNAME www.example.com → example.com  (Alias)
MX    example.com → mail.example.com (Email)`,
                interviewTips: ['Walk through the full DNS resolution process', 'Know all DNS record types', 'Explain how DNS enables CDN and load balancing']
            }
        },
        {
            id: 'api-gateway', title: 'API Gateway', icon: '🛡️',
            description: 'A single entry point that handles routing, authentication, rate limiting, and more for microservices.',
            tags: ['Architecture', 'Security', 'Routing'],
            hasAnimation: true, animationModule: 'apiGateway',
            content: {
                overview: 'An <strong>API Gateway</strong> is a single entry point for all API requests. It handles cross-cutting concerns like authentication, rate limiting, routing, logging, and request transformation — so individual services don\'t have to.',
                howItWorks: ['Client sends request to API Gateway', 'Gateway authenticates the request (JWT/OAuth)', 'Rate limiter checks if client is within limits', 'Request is routed to the appropriate microservice', 'Response may be transformed/aggregated before returning'],
                keyConcepts: ['<strong>Request Routing</strong> — /users → User Service, /orders → Order Service', '<strong>Authentication</strong> — Centralized JWT/OAuth validation', '<strong>Rate Limiting</strong> — Prevent abuse, enforce quotas', '<strong>Request Aggregation</strong> — Combine multiple service calls into one response', '<strong>Circuit Breaking</strong> — Stop forwarding to failing services'],
                realWorld: 'Kong, AWS API Gateway, Nginx, Zuul (Netflix). Amazon API Gateway handles billions of API calls. Stripe uses API Gateway for all payment API access.',
                tradeoffs: { pros: ['Centralized cross-cutting concerns', 'Simplified client interface', 'Security at the edge'], cons: ['Single point of failure', 'Added latency', 'Can become a bottleneck'] },
                codeExample: `# Kong API Gateway Config
services:
  - name: user-service
    url: http://user-svc:3000
    routes:
      - paths: ["/api/users"]
    plugins:
      - name: rate-limiting
        config: { minute: 100 }
      - name: jwt
      - name: cors`,
                interviewTips: ['Explain the difference between API Gateway and Load Balancer', 'Know BFF (Backend for Frontend) pattern', 'Discuss API Gateway vs Service Mesh']
            }
        },
        {
            id: 'rate-limiting', title: 'Rate Limiting', icon: '🚦',
            description: 'Control the rate of requests to protect services from overload and abuse.',
            tags: ['Security', 'Performance', 'Token Bucket'],
            hasAnimation: true, animationModule: 'rateLimiting',
            content: {
                overview: '<strong>Rate Limiting</strong> controls how many requests a client can make in a given time window. It prevents abuse, DDoS attacks, and ensures fair resource usage across all clients.',
                howItWorks: ['Define limits (e.g., 100 requests per minute per user)', 'Track request count per client (by IP, API key, or user ID)', 'If under limit → allow request', 'If over limit → reject with 429 Too Many Requests', 'Limits reset after the time window'],
                keyConcepts: ['<strong>Token Bucket</strong> — Tokens fill at fixed rate, each request takes a token', '<strong>Sliding Window</strong> — Tracks requests in a rolling time window', '<strong>Fixed Window</strong> — Simple counter that resets at interval boundaries', '<strong>Leaky Bucket</strong> — Processes requests at a constant rate', '<strong>Distributed Rate Limiting</strong> — Redis-based centralized counting'],
                realWorld: 'GitHub API: 5000 requests/hour. Twitter API: 300 tweets/3 hours. Stripe: 100 requests/second. AWS API Gateway has built-in rate limiting.',
                tradeoffs: { pros: ['Prevents abuse and DDoS', 'Ensures fair usage', 'Protects backend services'], cons: ['Can block legitimate burst traffic', 'Distributed rate limiting adds complexity', 'Clock synchronization issues'] },
                codeExample: `# Token Bucket (Redis)
def is_allowed(user_id, limit=100, window=60):
    key = f"rate:{user_id}"
    current = redis.incr(key)
    if current == 1:
        redis.expire(key, window)
    return current <= limit

# Response Headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1640000000`,
                interviewTips: ['Compare all 4 rate limiting algorithms', 'Know how to implement with Redis', 'Discuss distributed rate limiting challenges']
            }
        },
        {
            id: 'db-sharding', title: 'Database Sharding', icon: '🗄️',
            description: 'Partition data across multiple databases for horizontal scaling.',
            tags: ['Database', 'Horizontal Scaling', 'Partitioning'],
            hasAnimation: true, animationModule: 'dbSharding',
            content: {
                overview: '<strong>Database Sharding</strong> horizontally partitions data across multiple database servers. Each shard holds a subset of the data. This enables handling datasets too large for a single server.',
                howItWorks: ['Choose a shard key (e.g., user_id)', 'Apply shard function: shard_number = hash(user_id) % num_shards', 'Route queries to the correct shard', 'Each shard operates independently', 'Cross-shard queries require scatter-gather pattern'],
                keyConcepts: ['<strong>Shard Key</strong> — Column used to determine data placement', '<strong>Hash-Based Sharding</strong> — Even distribution via hashing', '<strong>Range-Based Sharding</strong> — Split by value ranges (A-M, N-Z)', '<strong>Consistent Hashing</strong> — Minimize rebalancing when adding shards', '<strong>Hotspot</strong> — When one shard gets disproportionate traffic'],
                realWorld: 'Instagram shards on user_id. MongoDB has built-in sharding. YouTube shards video metadata. Vitess adds sharding to MySQL (used by Slack, Square).',
                tradeoffs: { pros: ['Horizontal scaling for databases', 'Better performance for large datasets', 'Geographic data locality'], cons: ['Complex cross-shard queries', 'Rebalancing difficulty', 'Operational complexity'] },
                codeExample: `# Shard selection
def get_shard(user_id, num_shards=4):
    return hash(user_id) % num_shards

# user_id=100 → shard 0
# user_id=101 → shard 1
# user_id=102 → shard 2

# Cross-shard query (expensive!)
# SELECT * FROM orders WHERE total > 1000
# Must query ALL shards and merge results`,
                interviewTips: ['Know hash vs range sharding trade-offs', 'Explain the hotspot problem and solutions', 'Discuss resharding strategies']
            }
        },
        {
            id: 'db-replication', title: 'Database Replication', icon: '📋',
            description: 'Copy data across multiple database servers for fault tolerance and read scalability.',
            tags: ['Database', 'High Availability', 'Replication'],
            hasAnimation: true,
            content: {
                overview: '<strong>Database Replication</strong> maintains copies of data on multiple servers. A <strong>primary</strong> handles writes and <strong>replicas</strong> handle reads. This provides fault tolerance and read scalability.',
                howItWorks: ['Primary (master) server handles all write operations', 'Changes are replicated to one or more replica (slave) servers', 'Read queries are distributed across replicas', 'If primary fails, a replica is promoted (failover)', 'Replication can be synchronous or asynchronous'],
                keyConcepts: ['<strong>Primary-Replica</strong> — One writer, multiple readers', '<strong>Synchronous Replication</strong> — Wait for replica ACK before commit (consistent but slow)', '<strong>Asynchronous Replication</strong> — Don\'t wait for replica (fast but may lose data)', '<strong>Replication Lag</strong> — Delay between primary write and replica update', '<strong>Failover</strong> — Promoting replica to primary when primary fails'],
                realWorld: 'PostgreSQL streaming replication. MySQL master-slave. AWS RDS Multi-AZ. Redis Sentinel for automatic failover. Most production databases use replication.',
                tradeoffs: { pros: ['High availability (failover)', 'Read scalability (distribute reads)', 'Data redundancy'], cons: ['Replication lag (stale reads)', 'Write bottleneck (single primary)', 'Complexity of failover'] },
                codeExample: `# PostgreSQL Streaming Replication
# Primary (postgresql.conf)
wal_level = replica
max_wal_senders = 3

# Replica (recovery.conf)
primary_conninfo = 'host=primary_ip port=5432'
standby_mode = on

# Read from replica, write to primary
app.read_db = replica_pool
app.write_db = primary_pool`,
                interviewTips: ['Explain sync vs async replication trade-offs', 'Know how failover and leader election work', 'Discuss replication lag and read-your-own-writes consistency']
            }
        },
        {
            id: 'message-queues', title: 'Message Queues', icon: '📨',
            description: 'Decouple services with asynchronous communication using message queues.',
            tags: ['Async', 'Kafka', 'RabbitMQ', 'Pub/Sub'],
            hasAnimation: true, animationModule: 'messageQueues',
            content: {
                overview: 'A <strong>Message Queue</strong> is middleware that enables asynchronous communication between services. Producers send messages to the queue, and consumers process them independently. This decouples services and handles traffic spikes.',
                howItWorks: ['Producer publishes a message to the queue', 'Queue stores the message durably', 'Consumer pulls and processes the message', 'After processing, consumer acknowledges (ACK)', 'If processing fails, message is requeued (retry)'],
                keyConcepts: ['<strong>Point-to-Point</strong> — One message consumed by one consumer', '<strong>Pub/Sub</strong> — One message delivered to all subscribers', '<strong>Dead Letter Queue</strong> — Where failed messages go after max retries', '<strong>At-Least-Once vs Exactly-Once</strong> — Delivery guarantees', '<strong>Message Ordering</strong> — FIFO vs partitioned ordering'],
                realWorld: 'Kafka processes trillions of messages/day at LinkedIn. RabbitMQ is used for task queues. Amazon SQS is fully managed. Uber uses Kafka for ride event processing.',
                tradeoffs: { pros: ['Decouples services', 'Handles traffic spikes (buffering)', 'Retry and fault tolerance'], cons: ['Added latency (async)', 'Message ordering challenges', 'Operational complexity'] },
                codeExample: `# Kafka Producer (Python)
producer.send('orders', {
    'order_id': 123,
    'user_id': 42,
    'total': 99.99
})

# Kafka Consumer
for message in consumer:
    process_order(message.value)
    consumer.commit()  # ACK`,
                interviewTips: ['Compare Kafka vs RabbitMQ vs SQS', 'Explain delivery guarantees', 'Know how to handle duplicate messages (idempotency)']
            }
        },
        {
            id: 'reverse-proxy', title: 'Reverse Proxy & Web Servers', icon: '🔄',
            description: 'How Nginx and similar tools serve as the front door to your application.',
            tags: ['Infrastructure', 'Nginx', 'Web Server'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>reverse proxy</strong> sits in front of backend servers and forwards client requests to them. <strong>Web servers</strong> like Nginx serve static files and proxy dynamic requests. They handle SSL, compression, caching, and load balancing.',
                howItWorks: ['Client connects to the reverse proxy (Nginx)', 'Nginx handles SSL/TLS termination', 'Static files served directly from disk/cache', 'Dynamic requests proxied to backend application servers', 'Response compressed (gzip/brotli) and sent to client'],
                keyConcepts: ['<strong>SSL Termination</strong> — HTTPS handled at proxy, HTTP internally', '<strong>Static File Serving</strong> — Nginx serves CSS/JS/images efficiently', '<strong>Connection Pooling</strong> — Reuse connections to backends', '<strong>Request Buffering</strong> — Proxy absorbs slow clients', '<strong>URL Rewriting</strong> — Transform URLs before proxying'],
                realWorld: 'Nginx serves 30%+ of the internet. Apache was the original web server. Caddy offers automatic HTTPS. Cloudflare Workers run at the edge.',
                tradeoffs: { pros: ['Security (hide backend details)', 'Performance (caching, compression)', 'Flexibility (routing rules)'], cons: ['Additional infrastructure to manage', 'Configuration complexity', 'Potential SPOF if not redundant'] },
                codeExample: `# Nginx Full Config
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/ssl/cert.pem;

    # Static files
    location /static/ {
        root /var/www;
        expires 30d;
    }
    # Proxy to app
    location /api/ {
        proxy_pass http://app:3000;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`,
                interviewTips: ['Know Nginx vs Apache vs Caddy trade-offs', 'Explain SSL termination benefits', 'Discuss how reverse proxy enables zero-downtime deploys']
            }
        }
    ]
};
