/**
 * Deep Analysis Content — Comprehensive system design explanations
 * Shows complete request/response cycles, data flows, caching, and backend processes
 */

export const DEEP_ANALYSIS = {
    // ─── FOOD DELIVERY SYSTEM ───
    foodDelivery: {
        overview: {
            title: '🍔 Food Delivery Platform - Complete Architecture',
            description: 'End-to-end system design for platforms like Swiggy, Zomato, DoorDash showing how users order food, systems validate, process payments, and assign delivery partners.',
        },
        architecture: {
            title: 'System Architecture Overview',
            content: `
## Architecture Layers:

### 1. **Client Layer** 📱
- Mobile App (iOS/Android) using React Native or Flutter
- Web Application using Next.js/React
- Shows restaurants, menu items, filters, user profile
- Real-time order tracking via WebSockets

### 2. **Edge Layer** 🌐
- CDN (Cloudflare, AWS CloudFront) for static assets
- Caches images, JS bundles, CSS files globally
- Reduces latency by serving from nearest edge server
- Cache TTL: 1 year for versioned assets

### 3. **Ingress Layer** ⚖️
- Load Balancer distributes traffic across multiple API servers
- Health checks every 5 seconds
- Weighted routing based on server capacity
- SSL/TLS termination

### 4. **Application Layer** 🚪
- API Gateway: Central entry point for all requests
- Request routing, rate limiting, authentication
- Request validation and transformation
- Database query optimization

### 5. **Service Layer** 🏢
- Auth Service: JWT token validation
- Order Service: Order creation, status updates
- Restaurant Service: Menu management, availability
- Delivery Service: Delivery partner assignment, tracking
- Payment Service: Transaction processing
- Notification Service: Push/Email alerts

### 6. **Data Layer** 🗄️
- PostgreSQL: Transactional data (Orders, Users, Payments)
- Redis Cache: Session data, hot queries, leaderboards
- Elasticsearch: Search indexing for restaurants/dishes
- S3: Image storage for menus and profiles

### 7. **Async Processing** 📨
- Message Queue (RabbitMQ/Kafka): Decouples services
- Event streaming for real-time updates
- Order status propagation
- Notification delivery
            `
        },
        requestFlow: {
            title: 'Complete Request Flow - Ordering a Meal',
            steps: [
                {
                    step: 1,
                    name: '📱 User Opens App',
                    description: 'User launches the app and browses restaurants',
                    details: [
                        'App makes GET request to /restaurants?location=lat,lng&radius=5km',
                        'CDN serves JS bundle (10MB gzip) in ~200ms',
                        'Geolocation request gets user coordinates',
                    ],
                    timing: '200-500ms',
                    cache: 'Static assets cached on device',
                },
                {
                    step: 2,
                    name: '🔍 Request Hits Load Balancer',
                    description: 'Request is distributed to available servers',
                    details: [
                        'Load Balancer receives HTTPS request on port 443',
                        'Health check confirms server availability (RTT < 50ms)',
                        'Request routed to server with lowest connections',
                        'Round-robin or least connections algorithm used',
                    ],
                    timing: '5-10ms',
                    cache: 'Session affinity: Same user → Same server',
                },
                {
                    step: 3,
                    name: '🚪 API Gateway Processes Request',
                    description: 'Central gateway validates and routes request',
                    details: [
                        'Rate limiting check: 1000 req/min per user',
                        'JWT token validation from Authorization header',
                        'Request logging for analytics',
                        'Request ID generated for tracing',
                        'Content type validation (application/json)',
                    ],
                    timing: '10-20ms',
                    cache: 'Token validation cache: Redis (5min TTL)',
                },
                {
                    step: 4,
                    name: '🔒 Auth Service Validates Token',
                    description: 'Verifies user identity and permissions',
                    details: [
                        'JWT token decoded and signature verified',
                        'User ID extracted from token claims',
                        'Permission check: Can user access location?',
                        'Returns user context for downstream services',
                    ],
                    timing: '2-5ms',
                    cache: 'User permissions cached in Redis (1min TTL)',
                },
                {
                    step: 5,
                    name: '📍 Geo Service Processes Location',
                    description: 'Converts coordinates to restaurant list',
                    details: [
                        'Geohash generated from lat/lng (precision 7→100m)',
                        'Query: SELECT * FROM restaurants WHERE geohash LIKE "wxyz%"',
                        'Distance calculated for each restaurant',
                        'Filter restaurants: min_rating >= 3.5, delivery_time < 60min',
                    ],
                    timing: '15-30ms',
                    cache: 'Geo index cached for popular areas',
                },
                {
                    step: 6,
                    name: '⚡ Cache Check - Redis',
                    description: 'Check if restaurant list is cached',
                    details: [
                        'Cache key: "restaurants:geohash:wxyz123"',
                        'If hit: Return 50 restaurants in 1-2ms',
                        'If miss: Query database and populate cache',
                        'Cache TTL: 5 minutes',
                        'Cache invalidation on restaurant update',
                    ],
                    timing: '1-2ms (hit) / 20-30ms (miss)',
                    cache: 'Redis Memory: ~500MB for restaurant data',
                },
                {
                    step: 7,
                    name: '🗄️ Database Query',
                    description: 'Primary data lookup if cache miss',
                    details: [
                        'PostgreSQL query with geospatial index',
                        'Index: CREATE INDEX idx_restaurants_geohash ON restaurants (geohash)',
                        'Query plan: Index scan → memory sort → limit 50',
                        'Fetch restaurant data, ratings, delivery fees',
                    ],
                    timing: '20-50ms',
                    cache: 'Query result caching via Redis or query cache',
                },
                {
                    step: 8,
                    name: '🍽️ Enrich Data - Images & Ratings',
                    description: 'Fetch additional restaurant information',
                    details: [
                        'Parallel requests: images from S3, ratings from Redis',
                        'Image URLs generated with CDN domain',
                        'Recent ratings fetched from cache (1000 latest reviews)',
                        'Cook time for popular dishes added',
                    ],
                    timing: '5-15ms (parallel)',
                    cache: 'S3 image URLs cached, ratings in Redis',
                },
                {
                    step: 9,
                    name: '🔄 Response Compiled',
                    description: 'API Gateway compiles final response',
                    details: [
                        'JSON serialized: {restaurants: [...], total_count: 2450, timestamp}',
                        'Response size: ~80KB gzip',
                        'Add cache-control headers: max-age=300',
                        'Add CORS headers for cross-origin requests',
                    ],
                    timing: '3-5ms',
                    cache: 'Response cached if identical request arrives',
                },
                {
                    step: 10,
                    name: '📡 Network Transmission',
                    description: 'Response sent back to user device',
                    details: [
                        'Response compressed via gzip (80KB → 15KB)',
                        'Sent over HTTPS/TLS 1.3',
                        'Network latency: 50-200ms (typical 4G)',
                        'Packet loss handling via TCP retransmission',
                    ],
                    timing: '50-200ms',
                    cache: 'N/A - Network transmission',
                },
                {
                    step: 11,
                    name: '📱 Device Receives & Renders',
                    description: 'App processes response and displays restaurants',
                    details: [
                        'App decompresses response',
                        'JSON deserialized to objects',
                        'React/Flutter re-renders UI',
                        'Images lazy-loaded as user scrolls',
                        'Restaurants sorted by delivery time (VirtualList)',
                    ],
                    timing: '100-300ms',
                    cache: 'Local device storage via SQLite/Realm',
                },
            ]
        },
        orderingFlow: {
            title: 'Placing Order - Complete Journey',
            steps: [
                {
                    name: 'User Selects Dishes',
                    details: 'Cart populated with items and quantities, total calculated'
                },
                {
                    name: 'POST /orders/create - Request Sent',
                    details: 'Request body: {restaurant_id, items: [{dish_id, qty}], delivery_addr}'
                },
                {
                    name: 'Request Validation',
                    details: 'Schema validation, inventory check, price verification against menu'
                },
                {
                    name: 'Database Transaction Begin',
                    details: 'BEGIN; INSERT orders, INSERT order_items with ACID guarantees'
                },
                {
                    name: 'Payment Processing',
                    details: 'Async call to Payment Service via message queue for idempotency'
                },
                {
                    name: 'Order Confirmation',
                    details: 'Transaction committed if payment success, order_id returned to client'
                },
                {
                    name: 'Event Published to Queue',
                    details: 'Message: {event: "order.created", order_id, restaurant_id, delivery_location}'
                },
                {
                    name: 'Restaurant Gets Notification',
                    details: 'Push notification sent to restaurant app with order details'
                },
                {
                    name: 'Delivery Partner Assignment',
                    details: 'Algorithm finds nearest available driver matching delivery criteria'
                },
                {
                    name: 'Real-time Updates via WebSocket',
                    details: 'Order status changes pushed to client: confirmed → cooking → ready → pickupup → in_delivery → delivered'
                }
            ]
        },
        dataFlowVisualization: {
            title: 'Data Flow Through Backend',
            components: [
                {
                    name: 'Client → API Gateway',
                    flow: 'HTTPS Request (TLS 1.3 encrypted)',
                    size: '2-50KB depending on request type',
                    example: 'GET /restaurants?lat=12.97&lng=77.59'
                },
                {
                    name: 'API Gateway → Service Mesh',
                    flow: 'gRPC or REST calls',
                    size: '1-20KB per service call',
                    example: 'gRPC call to geo.SearchRestaurants()'
                },
                {
                    name: 'Service → Database',
                    flow: 'SQL queries over TCP connection pool',
                    size: '500B - 10KB query + result',
                    example: 'SELECT * FROM restaurants WHERE geohash LIKE ?'
                },
                {
                    name: 'Service → Cache (Redis)',
                    flow: 'In-memory memcached protocol or Redis protocol',
                    size: '100B - 1MB',
                    example: 'GET restaurants:geohash:wxyz123'
                },
                {
                    name: 'Service → Message Queue',
                    flow: 'AMQP (RabbitMQ) or Kafka protocol',
                    size: '1-50KB event payload',
                    example: 'Publish: order.creation_event'
                },
                {
                    name: 'Cache Population',
                    flow: 'Background jobs fill Redis from DB',
                    frequency: 'Every 5-60 minutes depending on TTL',
                    strategy: 'Cache-aside, Write-through, or Write-behind'
                }
            ]
        },
        cachingStrategy: {
            title: 'Caching Architecture',
            layers: [
                {
                    layer: 'Browser Cache',
                    ttl: '1 year for versioned assets',
                    strategy: 'Cache-Control: public, max-age=31536000',
                    contents: 'JS bundles, CSS, images with hash in filename'
                },
                {
                    layer: 'CDN Cache',
                    ttl: '1-24 hours',
                    strategy: 'Origin: Set-Cookie invalidates,Cache-Control directives',
                    contents: 'HTML, static images, JS, CSS'
                },
                {
                    layer: 'Redis Cache Layer 1 (Session)',
                    ttl: '24 hours',
                    strategy: 'Explicit invalidation on logout',
                    contents: 'User authentication tokens, session data, preferences'
                },
                {
                    layer: 'Redis Cache Layer 2 (Hot Data)',
                    ttl: '5-30 minutes',
                    strategy: 'Automatic refresh, cache-aside',
                    contents: 'Restaurant lists, menus, featured dishes, ratings (top 10000)'
                },
                {
                    layer: 'Redis Cache Layer 3 (Geo Index)',
                    ttl: '60 minutes',
                    strategy: 'Background job refresh',
                    contents: 'Geohash indexed restaurants, nearby delivery partners'
                },
                {
                    layer: 'Query Result Cache',
                    ttl: '2-5 minutes',
                    strategy: 'Cache-invalidation on data change',
                    contents: 'Expensive query results (aggregates, joins)'
                },
                {
                    layer: 'Elasticsearch Query Cache',
                    ttl: '1 minute',
                    strategy: 'Automatic (uses field value cache)',
                    contents: 'Search results for "pizza near me", aggregations'
                },
                {
                    layer: 'Database Query Cache',
                    ttl: '1 minute',
                    strategy: 'PostgreSQL built-in query cache',
                    contents: 'Frequent SELECT queries on hot tables'
                }
            ]
        },
        scalability: {
            title: 'Handling Millions of Users',
            challenges: [
                {
                    challenge: 'Concurrent Requests',
                    problem: 'Swiggy has 200k+ concurrent users during peak hours',
                    solution: 'Horizontal scaling: 100+ servers, load balanced with IP hash or connection count',
                    bottleneck: 'Database connections limited to 500 per server × 100 servers = 50k connections max'
                },
                {
                    challenge: 'Database Write Throughput',
                    problem: '10,000 orders/minute → 166 writes/second',
                    solution: 'Database sharding: Partition by restaurant_id or order_id, separate DB for each shard',
                    bottleneck: 'Single shard: PostgreSQL can handle ~20k writes/sec with SSDs'
                },
                {
                    challenge: 'Geo Queries Performance',
                    problem: 'Searching 50,000 restaurants from user location for millions of users',
                    solution: 'Geohash index, Redis geo index, Elasticsearch spatial queries',
                    bottleneck: 'In-memory geo index limited by RAM: 64GB Redis can cache indices for 1M restaurants'
                },
                {
                    challenge: 'Cache Invalidation',
                    problem: 'Restaurant availability changes → cache must update instantly',
                    solution: 'Event-driven invalidation via message queue, short TTLs, cache tags',
                    bottleneck: 'Cache stampede if 10,000 requests arrive for expired key simultaneously'
                },
                {
                    challenge: 'Real-time Order Tracking',
                    problem: 'Millions of users tracking orders simultaneously via WebSocket',
                    solution: 'WebSocket at edge (nginx), Redis pub/sub for updates, scale to 1M connections/server',
                    bottleneck: 'File descriptor limits: ulimit -n → increase to 2M'
                }
            ]
        },
        apiEndpoints: {
            title: 'Key API Endpoints',
            endpoints: [
                {
                    method: 'GET',
                    path: '/restaurants?lat=X&lng=Y&radius=5km',
                    response: 'Array of 50 restaurants with details',
                    latency: '50-100ms',
                    cache: 'Redis: 5min TTL'
                },
                {
                    method: 'GET',
                    path: '/restaurants/{id}/menu',
                    response: 'Menu with ~200 dishes',
                    latency: '20-50ms',
                    cache: 'Redis: 30min TTL, CDN for images'
                },
                {
                    method: 'POST',
                    path: '/orders/create',
                    response: 'Order confirmation with order_id',
                    latency: '200-500ms (payment processing)',
                    cache: 'PostgreSQL write, no cache'
                },
                {
                    method: 'GET',
                    path: '/orders/{id}/status',
                    response: 'Current order status and ETA',
                    latency: '10-30ms',
                    cache: 'Redis: 10sec TTL, WebSocket for real-time'
                },
                {
                    method: 'POST',
                    path: '/payments/charge',
                    response: 'Payment success/failure',
                    latency: '1000-3000ms (external gateway)',
                    cache: 'No cache, logging required for PCI compliance'
                },
                {
                    method: 'WebSocket',
                    path: '/ws/order/{id}',
                    response: 'Real-time updates: status, location',
                    latency: '1-100ms (live)',
                    cache: 'Live stream via Redis pub/sub'
                }
            ]
        }
    },

    // ─── E-COMMERCE SYSTEM ───
    ecommerce: {
        overview: {
            title: '🛒 E-Commerce Platform - Complete Architecture',
            description: 'End-to-end system design for platforms like Amazon, showing product discovery, shopping cart, checkout, payment, and fulfillment.',
        },
        requestFlow: {
            title: 'Complete E-Commerce Request Flow',
            steps: [
                {
                    step: 1,
                    name: '📱 User Searches for Products',
                    description: 'User types "running shoes" in search bar',
                    details: [
                        'Search query sent to Elasticsearch with facets',
                        'Results with filters: brand, price, rating, delivery time',
                    ],
                    timing: '50-200ms',
                    cache: 'Elasticsearch query cache: 1min TTL'
                },
                {
                    step: 2,
                    name: '⚡ Elasticsearch Full-Text Search',
                    description: 'Advanced search with relevance ranking',
                    details: [
                        'Inverted index searched in parallel across shards',
                        'TF-IDF scoring for relevance ranking',
                        'Boost: verified seller +10%, reviews count, ratings',
                    ],
                    timing: '50-100ms',
                    cache: 'Cached query results for popular searches'
                },
                {
                    step: 3,
                    name: '💾 Fetch Product Details from DB',
                    description: 'Get inventory, pricing, ratings',
                    details: [
                        'PostgreSQL query: SELECT * FROM products WHERE id IN (...)',
                        'Join with inventory table to check stock',
                        'Join with ratings to show latest reviews',
                    ],
                    timing: '20-50ms',
                    cache: 'Product data cached in Redis (1-hour TTL)'
                }
            ]
        }
    },

    // ─── CHAT APPLICATION ───
    chatApp: {
        overview: {
            title: '💬 Real-Time Chat Application',
            description: 'Complete system design for WhatsApp-like messaging, featuring real-time delivery, read receipts, and group chats.',
        }
    },

    // ─── GENERIC EXPLANATION ───
    generic: {
        overview: {
            title: '🏗️ Generic System Architecture',
            description: 'Core principles that apply to most scalable systems.',
        },
        flowStages: {
            title: 'Complete Request Journey',
            stages: [
                {
                    stage: 'CLIENT REQUEST',
                    description: 'User initiates action from frontend',
                    process: [
                        'User input captured (click, form submit, search)',
                        'Request payload constructed (JSON)',
                        'HTTPS TLS handshake (if new connection)',
                        'Request sent with Authorization header'
                    ]
                },
                {
                    stage: 'LOAD BALANCER',
                    description: 'Route to healthy backend server',
                    process: [
                        'DNS resolution to LB IP',
                        'TCP 3-way handshake',
                        'Server selection via least connections algorithm',
                        'Request forwarded to chosen server'
                    ]
                },
                {
                    stage: 'API GATEWAY',
                    description: 'Central request processor',
                    process: [
                        'Rate limit check (tokens: 1000 req/min per user)',
                        'JWT token validation',
                        'Request body validation (schema)',
                        'Add request ID for tracing'
                    ]
                },
                {
                    stage: 'BUSINESS LOGIC',
                    description: 'Service implements business rules',
                    process: [
                        'Fetch user context from token',
                        'Execute business logic (order creation, etc)',
                        'Validate inputs against business rules',
                        'Call dependent services (payment, inventory)'
                    ]
                },
                {
                    stage: 'DATA LAYER',
                    description: 'Persist and retrieve data',
                    process: [
                        'Check cache first (Redis) → 1-2ms hit',
                        'If miss, query database (PostgreSQL) → 20-50ms',
                        'Update cache after DB fetch',
                        'Return data to service layer'
                    ]
                },
                {
                    stage: 'RESPONSE COMPILATION',
                    description: 'Prep response for transmission',
                    process: [
                        'Serialize data to JSON',
                        'Compress response (gzip)',
                        'Add cache headers (Cache-Control, ETag)',
                        'Add security headers (HSTS, CSP)'
                    ]
                },
                {
                    stage: 'NETWORK TRANSMISSION',
                    description: 'Send response to client',
                    process: [
                        'Response sent over HTTPS/HTTP2',
                        'TCP flow control handles bandwidth',
                        'Typical latency: 50-200ms depending on geography',
                        'Client receives complete response'
                    ]
                },
                {
                    stage: 'CLIENT RENDERING',
                    description: 'Display result to user',
                    process: [
                        'Decompress response',
                        'Parse JSON',
                        'Update React/Vue component state',
                        'Browser renders new UI (60fps)',
                        'Images lazy-load as user scrolls'
                    ]
                }
            ]
        },
        dataFlowDiagram: {
            title: 'Data Flow Through Layers',
            flowChart: `
User Request
    ↓
[CDN - Static Assets] ← (from S3/Object Storage)
    ↓
[Load Balancer] → Routes to available servers
    ↓
[API Gateway] → Rate limit, Auth, Validation
    ↓
[Service Layer] → Business Logic (Can call multiple services)
    ↓
[Cache Layer] → Check Redis first (< 2ms)
    ↓
[Database Layer] → Query PostgreSQL if cache miss (20-50ms)
    ↓
[Message Queue] → Async events (order placed → send notification)
    ↓
[Background Workers] → Process async tasks
    ↓
[External Services] → Payment gateway, SMS provider
    ↓
[Response Builder] → Compile JSON response
    ↓
[Compression] → gzip response (80KB → 15KB)
    ↓
[Network] → Send over HTTPS (50-200ms latency)
    ↓
[Client] → Decompress, Parse, Render UI (100-300ms)
    ↓
User sees result on screen
            `
        }
    }
};

export function getDeepAnalysis(topic) {
    return DEEP_ANALYSIS[topic] || DEEP_ANALYSIS.generic;
}
