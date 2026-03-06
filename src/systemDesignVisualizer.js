// System Design Visualizer — renders interactive SVG architecture + step walkthrough
export class SystemDesignVisualizer {
    constructor(container) {
        this.container = container;
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
    }

    generate(userIdea) {
        const q = userIdea.toLowerCase();
        const design = this._detectDesign(q, userIdea);
        this.steps = design.steps;
        this.currentStep = 0;
        this._render(design);
        this._highlightStep(0);
    }

    _detectDesign(q, raw) {
        const designs = {
            'food': this._foodDelivery,
            'delivery': this._foodDelivery,
            'swiggy': this._foodDelivery,
            'zomato': this._foodDelivery,
            'e-commerce': this._ecommerce,
            'ecommerce': this._ecommerce,
            'amazon': this._ecommerce,
            'shop': this._ecommerce,
            'chat': this._chatApp,
            'whatsapp': this._chatApp,
            'messag': this._chatApp,
            'social': this._socialMedia,
            'instagram': this._socialMedia,
            'twitter': this._socialMedia,
            'ride': this._rideShare,
            'uber': this._rideShare,
            'ola': this._rideShare,
            'streaming': this._videoStream,
            'netflix': this._videoStream,
            'youtube': this._videoStream,
            'video': this._videoStream,
            'booking': this._booking,
            'hotel': this._booking,
            'travel': this._booking,
        };
        for (const [key, fn] of Object.entries(designs)) {
            if (q.includes(key)) return fn.call(this);
        }
        return this._generic(raw);
    }

    // ─── Component Node Helpers ───
    _node(id, label, icon, x, y, color) {
        return { id, label, icon, x, y, color };
    }

    _conn(from, to, label, dashed) {
        return { from, to, label, dashed: !!dashed };
    }

    // ─── FOOD DELIVERY ───
    _foodDelivery() {
        return {
            title: '🍔 Food Delivery Platform',
            subtitle: 'Like Swiggy / Zomato / DoorDash',
            nodes: [
                this._node('client', 'Mobile App', '📱', 80, 100, '#a855f7'),
                this._node('cdn', 'CDN', '🌐', 80, 280, '#06b6d4'),
                this._node('lb', 'Load Balancer', '⚖️', 280, 190, '#f59e0b'),
                this._node('api', 'API Gateway', '🚪', 480, 190, '#10b981'),
                this._node('auth', 'Auth Service', '🔒', 480, 60, '#ef4444'),
                this._node('order', 'Order Service', '📦', 680, 100, '#8b5cf6'),
                this._node('restaurant', 'Restaurant Svc', '🏪', 680, 190, '#f97316'),
                this._node('delivery', 'Delivery Svc', '🚴', 680, 280, '#06b6d4'),
                this._node('payment', 'Payment Svc', '💳', 880, 100, '#ec4899'),
                this._node('notify', 'Notification', '🔔', 880, 190, '#eab308'),
                this._node('queue', 'Message Queue', '📨', 880, 280, '#6366f1'),
                this._node('db', 'PostgreSQL', '🗄️', 480, 340, '#3b82f6'),
                this._node('redis', 'Redis Cache', '⚡', 280, 340, '#ef4444'),
                this._node('geo', 'Geo Service', '📍', 280, 60, '#10b981'),
            ],
            connections: [
                this._conn('client', 'cdn', 'Static'),
                this._conn('client', 'lb', 'HTTPS'),
                this._conn('lb', 'api', 'Route'),
                this._conn('api', 'auth', 'JWT'),
                this._conn('api', 'order', 'REST'),
                this._conn('api', 'restaurant', 'REST'),
                this._conn('api', 'delivery', 'REST'),
                this._conn('order', 'payment', 'Charge'),
                this._conn('order', 'notify', 'Push'),
                this._conn('delivery', 'queue', 'Events'),
                this._conn('order', 'db', 'Write'),
                this._conn('api', 'redis', 'Cache'),
                this._conn('api', 'geo', 'Location'),
                this._conn('delivery', 'geo', 'Track', true),
            ],
            steps: [
                {
                    highlight: ['client'], title: '1. User Opens App', desc: 'Customer opens the mobile app or website. Static assets (images, JS, CSS) are served via CDN for fast loading. The app fetches the user\'s GPS coordinates and shows nearby restaurants within a configurable radius (default 5km). The home screen displays personalized restaurant cards sorted by rating, estimated delivery time, and promotional offers.',
                    impl: 'React Native / Flutter for cross-platform mobile. Next.js for web with SSR. Cloudflare CDN for 200+ edge locations. GPS via navigator.geolocation API.',
                    algo: 'Geohash algorithm converts lat/lng into a string prefix — restaurants sharing the same prefix are nearby. Precision level 6 gives ~1.2km accuracy.',
                    requirements: ['GPS permission handling with graceful fallback to IP-based location', 'Offline-first with cached restaurant data (last 50 results)', 'Progressive image loading: blur placeholder → thumbnail → full image', 'App size < 15MB for emerging markets with slow networks'],
                    dataFlow: 'User opens app → GPS coordinates acquired → API call: GET /restaurants?lat=X&lng=Y&radius=5km → CDN serves cached response if <5min old → Else, API Gateway routes to Restaurant Service → GeoHash query on PostgreSQL → Results cached in Redis (TTL=5min) → Response with restaurant cards + estimated delivery times',
                    tradeoffs: ['React Native vs Flutter: RN has bigger ecosystem, Flutter has better performance and single codebase', 'GPS vs IP geolocation: GPS is accurate (5m) but needs permission; IP is inaccurate (1-50km) but works without permission', 'SSR vs CSR: SSR gives faster first paint and SEO, but higher server load'],
                    challenges: ['GPS permission denied → Fall back to IP geolocation, then let user manually enter address', 'Slow 3G networks → Implement skeleton loading, compress images to WebP, use HTTP/2 multiplexing', 'Battery drain from GPS → Use coarse location updates, batch location requests every 30s'],
                    codeSnippet: `// Geohash-based restaurant query\nconst geohash = Geohash.encode(lat, lng, 6);\nconst nearby = await db.query(\n  'SELECT * FROM restaurants\\n   WHERE geohash LIKE $1\\n   AND is_open = true\\n   ORDER BY rating DESC, delivery_time ASC\\n   LIMIT 50',\n  [geohash.slice(0,5) + '%']\n);`
                },
                {
                    highlight: ['client', 'lb', 'api'], title: '2. API Request Flow', desc: 'Every user request travels through a Load Balancer which distributes traffic across multiple API Gateway instances. The LB uses Round Robin for stateless requests and Least Connections for long-lived ones. The API Gateway handles authentication, rate limiting (100 req/min per user), request validation, API versioning, and routes to the correct microservice.',
                    impl: 'Nginx/HAProxy for L7 load balancing with health checks every 10s. Kong or Express.js API Gateway with middleware pipeline. Docker containers with auto-scaling based on CPU >70%.',
                    algo: 'Token Bucket for rate limiting: each user gets 100 tokens/min, each request costs 1 token. Consistent Hashing for session-sticky routing when needed.',
                    requirements: ['Health check endpoint on each service (/health returning 200)', 'Circuit breaker pattern: open circuit after 5 consecutive failures, retry after 30s', 'Request timeout: 5s for synchronous calls, 30s for file uploads', 'API versioning via URL path (/v1/, /v2/) for backward compatibility'],
                    dataFlow: 'Client HTTPS request → DNS resolves to LB IP → LB selects healthy API instance (Round Robin) → API Gateway middleware chain: [CORS → Rate Limit → Auth JWT → Validate Body → Route] → Microservice processes request → Response flows back through same chain',
                    tradeoffs: ['Nginx vs HAProxy: Nginx handles static files + reverse proxy; HAProxy is pure LB with better connection handling', 'API Gateway as single entry vs service mesh (Istio): Gateway is simpler but single point of failure; Mesh distributes logic but adds complexity', 'Synchronous REST vs async message queue: REST is simpler for CRUD; queues better for long operations like payment processing'],
                    challenges: ['Thundering herd (flash sales) → Implement request queuing with priority lanes, pre-warm instances before peak hours', 'Cascading failures → Circuit breaker (Hystrix pattern) isolates failing services, returns cached/default response', 'API versioning headaches → Use URL-based versioning, maintain max 2 versions, auto-deprecation warnings in response headers']
                },
                {
                    highlight: ['api', 'auth'], title: '3. Authentication & Authorization', desc: 'Every API request includes a JWT token in the Authorization header. The Auth Service validates the token\'s signature (RS256), checks expiration, and extracts user claims (user_id, role). For login, it supports email/password, Google OAuth, and phone OTP. Passwords are hashed with bcrypt (12 salt rounds). Sessions are stored in Redis with a 7-day TTL.',
                    impl: 'JWT with RS256 (asymmetric keys — public key for verification, private for signing). bcrypt for passwords. Redis for session/refresh token store. Twilio for OTP. Google OAuth 2.0.',
                    algo: 'HMAC-SHA256 / RS256 for JWT tokens. bcrypt with cost factor 12 (~250ms to hash). TOTP (RFC 6238) for 2FA.',
                    requirements: ['Refresh token rotation: issue new refresh token on every use, invalidate old one', 'Rate limit login attempts: 5 failed attempts → 15min lockout', 'Role-based access: customer, restaurant_owner, delivery_partner, admin', 'Token expiry: access token = 15min, refresh token = 7 days'],
                    dataFlow: 'Login: Email+Password → Auth Service → bcrypt.compare(password, hash) → Generate JWT (access + refresh tokens) → Store refresh token in Redis → Return tokens to client. API call: Request + JWT → API Gateway extracts token → Verify signature with public key → Check expiry → Extract user_id from payload → Attach to request context → Forward to microservice',
                    tradeoffs: ['JWT vs Session cookies: JWT is stateless and scalable but cannot be revoked instantly; sessions need server storage but offer instant revocation', 'bcrypt vs Argon2: bcrypt is battle-tested; Argon2 won the Password Hashing Competition and is newer/stronger', 'OAuth vs custom auth: OAuth reduces friction but adds dependency on third-party providers'],
                    challenges: ['Token theft → Short-lived access tokens (15min) + refresh token rotation + store device fingerprint', 'Brute force attacks → Rate limiting by IP + CAPTCHA after 3 failures + account lockout after 5', 'OAuth provider downtime → Graceful fallback to email/password, queue OAuth token refreshes'],
                    codeSnippet: `// JWT authentication middleware\nconst authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, PUBLIC_KEY, {\n      algorithms: ['RS256']\n    });\n    req.user = { id: decoded.sub, role: decoded.role };\n    next();\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n};`
                },
                {
                    highlight: ['api', 'restaurant', 'geo'], title: '4. Restaurant Discovery & Menu', desc: 'The Restaurant Service manages restaurant profiles, menus, ratings, and availability. Geo Service handles spatial queries — finding restaurants within delivery radius using PostGIS. Search supports full-text menu search with typo tolerance via Elasticsearch. Results are ranked by a composite score: 0.4×rating + 0.3×proximity + 0.2×delivery_speed + 0.1×promotions.',
                    impl: 'PostgreSQL + PostGIS for geo queries with R-Tree index. Elasticsearch for menu search with custom analyzers (synonyms: "burger"="hamburger"). Redis Sorted Sets for ranking.',
                    algo: 'GeoHash + R-Tree for O(log n) spatial queries. TF-IDF with BM25 for menu search relevance. Haversine formula for exact distance calculation between user and restaurant.',
                    requirements: ['Restaurant online/offline toggle with real-time status updates via WebSocket', 'Menu versioning: support scheduled menu changes (lunch vs dinner)', 'Image optimization: serve restaurant photos in WebP format, 3 sizes (thumb/medium/full)', 'Search autocomplete with <100ms response time using Redis prefix matching'],
                    dataFlow: 'Search query → API Gateway → Elasticsearch (full-text search with fuzzy matching) → Returns restaurant_ids → Geo Service filters by distance (PostGIS ST_DWithin) → Restaurant Service fetches full profiles → Ranking algorithm scores and sorts → Redis caches top results (TTL=5min) → Response with paginated restaurant cards',
                    tradeoffs: ['PostGIS vs Redis GEO: PostGIS is more powerful (polygon queries, complex spatial ops) but slower; Redis GEO is fast but limited to point-radius queries', 'Elasticsearch vs PostgreSQL full-text: ES is purpose-built with better relevance scoring; PG FTS is simpler but less feature-rich', 'Pre-computed rankings vs live computation: Pre-computed is fast but stale; live is fresh but expensive at scale'],
                    challenges: ['Stale menu data → Event-driven updates: restaurant updates menu → Kafka event → Elasticsearch re-indexes → Redis cache invalidated', 'Search relevance → A/B test ranking weights, collect click-through data to train personalized ranking', 'Restaurant overload → Implement order throttling: max N concurrent orders per restaurant, show "busy" status']
                },
                {
                    highlight: ['order', 'payment'], title: '5. Order & Payment Processing', desc: 'Order Service orchestrates the entire checkout flow: validates cart items against current menu/prices, checks restaurant availability, calculates total (items + taxes + delivery fee + discounts), reserves inventory, then initiates payment via Stripe/Razorpay. Uses the Saga Pattern for distributed transactions — if payment fails, the inventory reservation is rolled back automatically.',
                    impl: 'Saga Pattern with choreography (Kafka events between services). Stripe SDK with idempotency keys (UUID per order). PostgreSQL for order storage with row-level locking for inventory.',
                    algo: 'Saga Pattern: Order Created → Inventory Reserved → Payment Charged → Order Confirmed. Compensating transactions: Payment Failed → Release Inventory → Cancel Order. Idempotency via UUIDv4 keys.',
                    requirements: ['Idempotent payment processing: same order_id must never be charged twice', 'Price locking: capture menu prices at order creation time, not at payment time', 'Delivery fee calculation based on distance (base_fee + per_km_rate)', 'Support for split payments, wallet balance, and promo codes/coupons'],
                    dataFlow: 'User clicks "Place Order" → Cart validated against live menu → Price calculated (items + tax + delivery_fee - discount) → Inventory temporarily reserved (5min TTL) → Payment intent created with Stripe → User completes payment → Webhook confirms payment → Order status: CONFIRMED → Kafka event triggers: restaurant notification + delivery assignment + email receipt',
                    tradeoffs: ['Saga (choreography) vs 2-Phase Commit: Saga is eventually consistent but resilient; 2PC guarantees immediate consistency but blocks on failures', 'Stripe vs in-house payment: Stripe charges 2.9% but handles PCI compliance; in-house saves fees but requires PCI-DSS certification', 'Synchronous checkout vs async: Sync gives instant feedback; async handles payment failures gracefully with retry logic'],
                    challenges: ['Double payment → Idempotency keys: store payment_intent_id, reject duplicate requests with same key', 'Price changed mid-checkout → Lock prices at cart creation, validate again at payment, show price change dialog if different', 'Payment succeeds but order service is down → Stripe webhooks retry up to 3 days; reconciliation job at midnight catches missed orders'],
                    codeSnippet: `// Saga: Order creation with compensating transactions\nasync function createOrder(cart, userId) {\n  const order = await orderDB.create({ ...cart, status: 'PENDING' });\n  try {\n    await inventoryService.reserve(order.items); // Step 1\n    await paymentService.charge(order.total, order.id); // Step 2\n    await orderDB.update(order.id, { status: 'CONFIRMED' });\n    await kafka.publish('order.confirmed', order);\n  } catch (err) {\n    // Compensating transactions\n    await inventoryService.release(order.items);\n    await orderDB.update(order.id, { status: 'FAILED' });\n    throw err;\n  }\n}`
                },
                {
                    highlight: ['delivery', 'geo', 'queue'], title: '6. Real-Time Delivery Tracking', desc: 'Delivery Service assigns the nearest available driver using Quadtree spatial indexing on driver locations. Once assigned, the driver\'s GPS coordinates are streamed to the customer via WebSocket every 3 seconds. ETA is recalculated using A* algorithm with live traffic data. The Message Queue handles async events: driver assigned, picked up, on the way, delivered.',
                    impl: 'Socket.io for bi-directional WebSocket. RabbitMQ for event streaming. Redis GEO for driver location storage (GEOADD/GEORADIUS). Google Maps API for route + ETA.',
                    algo: 'Quadtree for O(log n) nearest-driver search. A* with traffic-weighted edges for route optimization. Haversine for distance calculation. ETA = distance / avg_speed × traffic_factor.',
                    requirements: ['Driver location updates every 3 seconds via WebSocket', 'ETA accuracy within ±2 minutes using live traffic data', 'Automatic driver reassignment if no response within 60 seconds', 'Order status transitions: CONFIRMED → PREPARING → PICKED_UP → ON_THE_WAY → DELIVERED'],
                    dataFlow: 'Order confirmed → Kafka event → Delivery Service queries Redis GEO: GEORADIUS(order_lat, order_lng, 5km) → Filter available drivers → Sort by distance → Send push notification to nearest driver → Driver accepts (60s timeout, else next driver) → WebSocket channel created for order_id → Driver app sends GPS every 3s → Redis GEOADD updates location → Customer app receives location via WebSocket → ETA recalculated with A*',
                    tradeoffs: ['WebSocket vs Server-Sent Events: WebSocket is bi-directional (driver sends location + receives orders); SSE is simpler but one-directional', 'Quadtree vs R-Tree: Quadtree is simpler for point queries; R-Tree handles range queries better for polygon-based zones', '3s vs 10s location updates: 3s gives smoother tracking but 3× more data; 10s saves bandwidth but looks jumpy on map'],
                    challenges: ['Driver GPS goes offline → Show last known location with "Location updating..." message, estimate position using last speed + direction', 'Too many concurrent WebSocket connections → Use connection pooling, limit to 1 connection per user, horizontal scaling with Redis adapter for Socket.io', 'Driver fraud (fake location) → Validate GPS speed (max 120km/h), detect teleportation (>5km jump in 3s), cross-reference with Google Roads API']
                },
                {
                    highlight: ['notify', 'queue'], title: '7. Notification System', desc: 'The Notification Service handles multi-channel alerts: push notifications (Firebase FCM / Apple APNs), SMS (Twilio), email (SendGrid), and in-app WebSocket messages. It consumes events from RabbitMQ and routes to the appropriate channel based on user preferences and message priority. Critical alerts (order status) use push + in-app; promotional messages are email-only.',
                    impl: 'Firebase FCM for Android/iOS push. Twilio for SMS. SendGrid for email. RabbitMQ with dead-letter queues for failed delivery retries. Template engine for notification content.',
                    algo: 'Exponential backoff for retries: delays of 1s, 2s, 4s, 8s, max 5 attempts. Fan-out pattern for broadcast notifications. Priority queue: critical > transactional > promotional.',
                    requirements: ['Multi-channel delivery: push, SMS, email, in-app based on user preference', 'Notification batching: group multiple events into single notification (e.g., "3 new offers")', 'Rate limiting: max 5 push notifications per hour per user to prevent spam', 'Template system with i18n support for 10+ languages'],
                    dataFlow: 'Kafka event (e.g., order.picked_up) → Notification Service consumes → Lookup user preferences (push + in-app) → Render template with context data → Push: Firebase FCM API call with device token → In-app: WebSocket emit to user channel → If FCM fails: retry with exponential backoff → After 5 failures: move to dead-letter queue → Daily reconciliation job processes dead letters',
                    tradeoffs: ['Firebase FCM vs OneSignal: FCM is free and Google-native; OneSignal has better analytics and segmentation tools', 'Push vs SMS for critical alerts: Push is free but user can disable; SMS costs $0.01/msg but reaches everyone', 'Real-time vs batched notifications: Real-time is immediate but can overwhelm users; batching reduces noise but delays information'],
                    challenges: ['Push notification delivery failures → Implement fallback chain: push → SMS → email. Track delivery receipts from FCM', 'User unsubscribed from notifications → Respect user preferences, provide granular controls (order updates YES, promotions NO)', 'Notification spam → Rate limiter per user per hour, group rapid-fire events into summary, honor quiet hours (10PM-8AM)']
                },
                {
                    highlight: ['db', 'redis'], title: '8. Data Layer & Scaling', desc: 'PostgreSQL is the primary database with ACID transactions for orders, users, and restaurants. Redis caches hot data (popular restaurant menus, user sessions, geo queries) reducing database load by 80%. As traffic grows: read replicas handle read-heavy queries, database sharding by city_id partitions data for horizontal scaling, and connection pooling (PgBouncer) manages thousands of concurrent connections efficiently.',
                    impl: 'PostgreSQL with Read Replicas (1 primary, 3 replicas). Redis Cluster (6 nodes). PgBouncer for connection pooling. Database sharding by city_id using Citus. Daily backups to S3.',
                    algo: 'LRU eviction for Redis cache (maxmemory-policy: allkeys-lru). Consistent Hashing for shard key distribution. Write-Ahead Logging (WAL) for crash recovery. B-Tree indexes for primary queries.',
                    requirements: ['99.99% database uptime with automatic failover (promote replica to primary in <30s)', 'Point-in-time recovery: WAL archiving to S3 for up to 30 days of history', 'Connection pooling: PgBouncer limiting 5000 application connections to 100 database connections', 'Cache invalidation strategy: write-through for critical data, TTL-based for non-critical'],
                    dataFlow: 'Write path: App → PgBouncer → Primary PostgreSQL → WAL replication → Read Replicas + S3 backup. Read path: App → Redis cache check → Cache HIT: return cached data → Cache MISS: PgBouncer → Read Replica → Cache result in Redis (TTL=5min) → Return data. Sharding: orders table sharded by city_id → Citus coordinator routes query to correct shard → Each shard is an independent PostgreSQL instance',
                    tradeoffs: ['PostgreSQL vs MongoDB: PG gives ACID + SQL + PostGIS; MongoDB gives flexible schema + easy sharding but weaker transactions', 'Redis vs Memcached: Redis has data structures (sorted sets, hashes) + persistence; Memcached is simpler + slightly faster for simple key-value', 'Sharding by city_id vs user_id: city_id keeps related orders together (good for restaurant queries); user_id distributes evenly (good for user queries)'],
                    challenges: ['Cache stampede (many misses at once) → Use cache-aside with mutex lock: first miss acquires lock, others wait for cache fill', 'Replication lag → Use read-your-writes consistency: after write, read from primary for 5s, then switch to replica', 'Schema migrations on sharded DB → Use online DDL tools (pg_repack), run migrations shard-by-shard with canary validation'],
                    codeSnippet: `// Cache-aside pattern with stampede protection\nasync function getRestaurantMenu(restaurantId) {\n  const cacheKey = \`menu:\${restaurantId}\`;\n  let menu = await redis.get(cacheKey);\n  if (menu) return JSON.parse(menu); // Cache HIT\n\n  // Acquire lock to prevent stampede\n  const lock = await redis.set(\n    \`lock:\${cacheKey}\`, 1, 'NX', 'EX', 5\n  );\n  if (!lock) { // Another process is filling cache\n    await sleep(100);\n    return getRestaurantMenu(restaurantId); // Retry\n  }\n  menu = await db.query('SELECT * FROM menus WHERE restaurant_id=$1', [restaurantId]);\n  await redis.setex(cacheKey, 300, JSON.stringify(menu));\n  return menu;\n}`
                },
            ],
            techStack: ['React Native', 'Node.js', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Socket.io', 'Nginx', 'Docker', 'Kubernetes'],
            suggestions: [
                'Start with a monolith, then extract microservices as you scale',
                'Use database sharding by city/region for horizontal scaling',
                'Implement circuit breakers between services (Hystrix pattern)',
                'Add Elasticsearch for fast menu/restaurant search',
                'Use Redis Sorted Sets for restaurant ranking by distance',
            ]
        };
    }

    _ecommerce() {
        return {
            title: '🛒 E-Commerce Marketplace',
            subtitle: 'Like Amazon / Flipkart / Shopify',
            nodes: [
                this._node('client', 'Web/Mobile', '📱', 80, 190, '#a855f7'),
                this._node('cdn', 'CDN', '🌐', 80, 60, '#06b6d4'),
                this._node('lb', 'Load Balancer', '⚖️', 280, 190, '#f59e0b'),
                this._node('api', 'API Gateway', '🚪', 480, 190, '#10b981'),
                this._node('auth', 'Auth Service', '🔒', 480, 60, '#ef4444'),
                this._node('catalog', 'Product Catalog', '📋', 680, 60, '#8b5cf6'),
                this._node('cart', 'Cart Service', '🛒', 680, 150, '#f97316'),
                this._node('order', 'Order Service', '📦', 680, 240, '#3b82f6'),
                this._node('payment', 'Payment Svc', '💳', 680, 330, '#ec4899'),
                this._node('search', 'Search Engine', '🔍', 880, 60, '#eab308'),
                this._node('recommend', 'Recommender', '🤖', 880, 150, '#10b981'),
                this._node('queue', 'Kafka', '📨', 880, 240, '#6366f1'),
                this._node('db', 'PostgreSQL', '🗄️', 480, 340, '#3b82f6'),
                this._node('redis', 'Redis Cache', '⚡', 280, 340, '#ef4444'),
            ],
            connections: [
                this._conn('client', 'cdn', 'Assets'), this._conn('client', 'lb', 'HTTPS'),
                this._conn('lb', 'api', 'Route'), this._conn('api', 'auth', 'JWT'),
                this._conn('api', 'catalog', 'REST'), this._conn('api', 'cart', 'REST'),
                this._conn('api', 'order', 'REST'), this._conn('order', 'payment', 'Charge'),
                this._conn('catalog', 'search', 'Index'), this._conn('catalog', 'recommend', 'ML'),
                this._conn('order', 'queue', 'Events'), this._conn('api', 'redis', 'Cache'),
                this._conn('order', 'db', 'Write'), this._conn('catalog', 'db', 'Read'),
            ],
            steps: [
                {
                    highlight: ['client', 'cdn'], title: '1. Storefront Loading', desc: 'User visits the storefront. CDN serves static assets (product images, JS bundles) from edge locations for <100ms load times globally. Dynamic data like personalized carousels are fetched asynchronously.',
                    impl: 'Next.js with Incremental Static Regeneration (ISR). CloudFront CDN. Sharp for on-the-fly image optimization (WebP/AVIF).',
                    algo: 'Edge caching with TTL-based invalidation. Lazy loading algorithm with Intersection Observer for images below the fold.',
                    requirements: ['Time to Interactive (TTI) < 2 seconds globally', 'SEO optimization with SSR/SSG for product pages', 'Responsive images serving different resolutions based on device pixel ratio'],
                    dataFlow: 'Client request → Route 53 DNS → CloudFront Edge location → Cache HIT? Return asset → Cache MISS? Forward to Next.js server → Fetch data → Render HTML → Store in Edge Cache → Return response',
                    tradeoffs: ['ISR vs pure SSR: ISR is much faster and cheaper but data can be slightly stale until regeneration; pure SSR is always fresh but slow and expensive', 'SPA vs MPA: MPA/SSR (Next.js) is essential for e-commerce SEO; pure SPA (React) is bad for SEO without pre-rendering'],
                    challenges: ['Cache invalidation when prices change → Use tag-based CDN invalidation, or configure short TTL (1min) for price components', 'Large JS bundles → Implement code splitting by route and component, defer non-critical scripts']
                },
                {
                    highlight: ['catalog', 'search'], title: '2. Product Search & Discovery', desc: 'Elasticsearch powers full-text search with typo tolerance, faceted filtering (price, brand, rating), and real-time indexing. Products are ranked by a mix of relevance, popularity, and margin.',
                    impl: 'Elasticsearch clusters with dedicated master and data nodes. Redis for search autocomplete prefix matching. Logstash for data ingestion.',
                    algo: 'BM25 for relevance ranking. Inverted Index for lightning-fast full-text search. Levenshtein distance for fuzzy matching (typo tolerance).',
                    requirements: ['Sub-50ms latency for search autocomplete', 'Faceted search with aggregations (e.g., specific brand counts)', 'Support for synonyms (sneakers = running shoes)', 'Real-time price updates reflected in search indexes within seconds'],
                    dataFlow: 'User types "lapto" → API Gateway → Redis retrieves autocomplete suggestions ("laptop", "laptop stand") → User hits enter → API Gateway → Elasticsearch query with filters and sorting → ES returns ranked product IDs and facet aggregations → Catalog service hydrates full product details → Response',
                    tradeoffs: ['Elasticsearch vs Algolia: ES is self-hosted/managed and cheaper at massive scale; Algolia is SaaS, easier to use, but expensive at scale', 'Re-index on every change vs batching: Batched indexing saves DB load but search results are temporarily stale; live indexing is fresh but resource-intensive'],
                    challenges: ['Search index mapping explosion → Use dynamic templates strictly, avoid mapping distinct user attributes as unique fields', 'Slow deep pagination (page 1000+) → Use cursor-based pagination (search_after API) instead of offset-based', 'Multi-language support → Create separate ES indices per language with language-specific analyzers']
                },
                {
                    highlight: ['recommend'], title: '3. Personalized Recommendations', desc: 'ML-powered recommendation engine suggests products based on browsing history, purchase patterns, and item similarity. "Customers who bought X also bought Y".',
                    impl: 'TensorFlow Serving for real-time inference. Apache Spark for offline batch training. Redis for storing pre-computed user embeddings.',
                    algo: 'Collaborative Filtering (Matrix Factorization). Content-based filtering using Term Frequency. Two-tower neural network for large-scale retrieval.',
                    requirements: ['Real-time context updates: recommendations should adapt immediately if user clicks a new category', 'A/B testing framework to compare different recommendation algorithms', 'Cold start handling for new users without history'],
                    dataFlow: 'User views product → Clickstream event sent to Kafka → Real-time stream processing updates user profile vector in Redis → API requests recommendations → ML Service retrieves user vector and item vectors → Computes cosine similarity scores (Dot Product) → Returns top N items',
                    tradeoffs: ['Real-time vs Batch recommendations: Real-time responds to immediate intent but requires complex stream processing; Batch is easy to compute offline (Hadoop/Spark) but ignores current session behavior'],
                    challenges: ['Cold start problem → Show trending or location-based popular items until the new user generates enough click data', 'Filter bubble → Inject a percentage of random/exploratory items (epsilon-greedy algorithm) to discover new user interests']
                },
                {
                    highlight: ['cart', 'redis'], title: '4. Shopping Cart Management', desc: 'Cart Service manages user shopping carts. Carts are stored in Redis for lightning-fast reads/writes and persist across sessions. Inventory is checked, but not hard-locked until checkout begins to prevent locking trolling.',
                    impl: 'Redis Hash data structure (key: cart:{user_id}, fields: product_id, value: quantity). JWT for identifying guest carts.',
                    algo: 'Optimistic Concurrency Control during add-to-cart. TTL-based expiry for guest carts.',
                    requirements: ['Guest cart merging: when a guest logs in, merge their temporary cart with their saved account cart', 'Cross-device sync: cart updates on mobile should reflect instantly on web snippet', 'Stock validation: warn user if added quantity exceeds available stock'],
                    dataFlow: 'Add to cart → API Gateway → Cart Service → Validate product exists in Catalog → Update Redis Hash: HINCRBY cart:123 item:456 1 → Publish cart_updated event to Kafka (for analytics/abandoned cart emails) → Return updated cart sum',
                    tradeoffs: ['Redis vs Relational DB for cart: Redis is vastly faster and handles high write-throughput perfectly; DB provides easier relational queries but scales poorly for cart writes', 'Client-side vs Server-side cart: Client (localStorage) is fast but doesn\'t sync across devices; Server-side allows cross-device and better analytics'],
                    challenges: ['Abandoned carts → Consume Kafka events, if cart inactive for 24h, trigger email service to send a reminder with a discount code', 'Concurrent updates (multiple browser tabs) → Use HINCRBY in Redis which is atomic, preventing race conditions']
                },
                {
                    highlight: ['order', 'payment'], title: '5. Checkout & Payment Processing', desc: 'Order Service orchestrates checkout: validates final pricing, applies coupons, reserves inventory, and processes payment via Stripe. Uses the Saga Pattern to maintain distributed data consistency.',
                    impl: 'Saga Pattern via Kafka events (choreography). Stripe API for payments. PostgreSQL for order state machine.',
                    algo: 'Saga with compensating transactions. Distributed Idempotency via UUID keys to prevent double-charging.',
                    requirements: ['Strict Idempotency: network retry must not charge the card twice', 'Inventory locking: reserve inventory for 15 minutes during the checkout process', 'Support for multiple payment methods (Credit Card, PayPal, Affirm, Wallet)'],
                    dataFlow: 'Initiate Checkout → Order Service creates PENDING order → Inventory Service hard-locks stock (TTL 15min) → Stripe PaymentIntent created → User completes 3D Secure → Webhook hits Payment Svc → Payment Svc emits payment_success event → Order Svc updates to CONFIRMED',
                    tradeoffs: ['Saga Choreography vs Orchestration: Choreography (events) is decentralized and scalable but hard to trace; Orchestration (central controller) is easier to monitor but creates a single point of failure'],
                    challenges: ['Inventory overselling during flash sales → Use Redis Lua scripts for atomic stock decrement: if stock >= req then stock = stock - req else fail', 'Payment webhook failures → Stripe automatically retries over 3 days, plus implement a reconciliation cron job pulling missing statuses from Stripe API'],
                    codeSnippet: `// Redis Lua script for atomic inventory deduction\nconst script = \`\n  local stock = tonumber(redis.call('get', KEYS[1]))\n  if stock >= tonumber(ARGV[1]) then\n    redis.call('decrby', KEYS[1], ARGV[1])\n    return 1 -- Success\n  else\n    return 0 -- Insufficient stock\n  end\n\`;\nconst result = await redis.eval(script, 1, \`inventory:\${itemId}\`, qty);`
                },
                {
                    highlight: ['queue', 'order'], title: '6. Async Order Processing Pipeline', desc: 'Once payment succeeds, Kafka streams order events to downstream services: warehouse fulfillment, shipping label generation, invoice PDF generation, and email confirmation. Each step is independently scalable.',
                    impl: 'Apache Kafka with consumer groups for Pub/Sub. Exact-once semantics. Node.js stream processing for PDF generation.',
                    algo: 'Event Sourcing logic. Exponential backoff for 3rd party shipping APIs (FedEx/UPS).',
                    requirements: ['Guaranteed at-least-once delivery for all order events', 'Order tracking state machine (Processing → Packed → Shipped → Delivered)', 'Invoice generation as downloadable PDF stored in S3'],
                    dataFlow: 'Order CONFIRMED event published to Kafka ➔ Consumer 1 (Email Svc): sends receipt. ➔ Consumer 2 (Invoice Svc): generates PDF, uploads to S3. ➔ Consumer 3 (Fulfillment Svc): assigns to warehouse, generates picking list. ➔ Consumer 4 (Shipping Svc): requests tracking number from FedEx API',
                    tradeoffs: ['Kafka vs RabbitMQ: Kafka provides event replay and massive throughput via partition scaling; RabbitMQ has better complex routing and priority queues but less throughput'],
                    challenges: ['Out-of-order events → Use Kafka partition keys based on order_id to guarantee ordering for a specific order', 'Poison pill messages (bad data crashing consumer) → Wrap consumer logic in try-catch and route unprocessable messages to a Dead Letter Topic for manual review']
                },
                {
                    highlight: ['db', 'redis'], title: '7. Data Architecture & Scaling', desc: 'PostgreSQL for core transactional data (orders, users). Redis for caching and session state. Database sharding by seller_id/tenant to support millions of merchants. Read replicas for heavy reporting queries.',
                    impl: 'PostgreSQL + Citus for horizontal sharding. PgBouncer for connection pooling. Redis Cluster. AWS Aurora for managed scaling.',
                    algo: 'Consistent Hashing for shard distribution. Write-Behind caching for non-critical analytics. Read-Through caching for catalog.',
                    requirements: ['ACID compliance for all financial and inventory transactions', 'Horizontal scaling capability for the database as data volume crosses 10TB', 'Point-in-time recovery for disaster recovery'],
                    dataFlow: 'Write operation → PgBouncer → Primary DB Node → WAL (Write-Ahead Log) replicated to 3 Read Replicas. Heavy Read operation (e.g. merchant dashboard) → PgBouncer → Read Replica. Cache layer intercepts 90% of catalog/product read queries.',
                    tradeoffs: ['Relational (PostgreSQL) vs NoSQL (DynamoDB): Relational gives complex joins and strict ACID but is hard to shard; NoSQL scales infinitely horizontally but requires denormalized data modeling'],
                    challenges: ['Cross-shard joins in sharded DB → Denormalize data or use Citus reference tables for small, frequently joined tables (like categories)', 'Replica lag causing stale reads → Implement "Read-Your-Writes" consistency routing users to primary DB for 5 seconds after they make a write'],
                    codeSnippet: `// Example: Check replica lag before querying\nasync function queryReadReplica() {\n  // Check if user recently wrote data (stored in Redis/JWT)\n  const recentWrite = await redis.get(\`recent_write:\${userId}\`);\n  \n  if (recentWrite) {\n    // Route to primary to avoid stale data from replication lag\n    return db.primary.query('SELECT * FROM orders WHERE ...');\n  } else {\n    // Safe to read from replica\n    return db.replica.query('SELECT * FROM orders WHERE ...');\n  }\n}`
                },
            ],
            techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Kafka', 'Stripe', 'Docker', 'K8s'],
            suggestions: [
                'Use CQRS to separate read (catalog) and write (orders) paths',
                'Implement inventory reservations with TTL to prevent overselling',
                'Use Elasticsearch for product search, not SQL LIKE queries',
                'Add A/B testing for recommendation algorithms',
                'Shard database by seller_id for multi-tenant scaling',
            ]
        };
    }

    _chatApp() {
        return {
            title: '💬 Real-Time Chat Platform',
            subtitle: 'Like WhatsApp / Telegram / Slack',
            nodes: [
                this._node('client', 'Mobile/Web', '📱', 80, 190, '#a855f7'),
                this._node('ws', 'WebSocket Server', '🔌', 280, 190, '#10b981'),
                this._node('lb', 'Load Balancer', '⚖️', 280, 60, '#f59e0b'),
                this._node('auth', 'Auth Service', '🔒', 480, 60, '#ef4444'),
                this._node('msg', 'Message Service', '💬', 480, 190, '#3b82f6'),
                this._node('presence', 'Presence Svc', '🟢', 480, 310, '#10b981'),
                this._node('media', 'Media Service', '🖼️', 680, 60, '#f97316'),
                this._node('notify', 'Push Notify', '🔔', 680, 310, '#eab308'),
                this._node('pubsub', 'Redis Pub/Sub', '📡', 680, 190, '#ef4444'),
                this._node('db', 'MongoDB', '🗄️', 880, 100, '#10b981'),
                this._node('s3', 'Object Storage', '📁', 880, 210, '#f59e0b'),
                this._node('queue', 'Kafka', '📨', 880, 310, '#6366f1'),
            ],
            connections: [
                this._conn('client', 'ws', 'WS'), this._conn('client', 'lb', 'HTTPS'),
                this._conn('lb', 'auth', 'JWT'), this._conn('ws', 'msg', 'Relay'),
                this._conn('ws', 'presence', 'Status'), this._conn('msg', 'pubsub', 'Fanout'),
                this._conn('pubsub', 'ws', 'Deliver', true), this._conn('msg', 'db', 'Store'),
                this._conn('media', 's3', 'Upload'), this._conn('msg', 'queue', 'Events'),
                this._conn('queue', 'notify', 'Push'), this._conn('msg', 'media', 'Attach'),
            ],
            steps: [
                {
                    highlight: ['client', 'ws'], title: '1. WebSocket Connection', desc: 'Client establishes a persistent WebSocket connection for real-time bi-directional communication. Connection is kept alive with heartbeats (ping/pong) every 30s. On reconnect, the client syncs missed messages using its last-seen timestamp.',
                    impl: 'Socket.io or raw WebSockets with sticky sessions logic. Connection pooling per server (usually ~10k-50k concurrent connection limit per Node VM).',
                    algo: 'Long polling fallback for legacy networks. Exponential backoff for reconnection strategy (1s, 2s, 4s, 8s...) to prevent thundering herds on server restart.',
                    requirements: ['Handle 100K+ concurrent connections per server', 'Detect dead connections quickly (zombie connections kill RAM)', 'Graceful reconnection without message loss or duplicate messages'],
                    dataFlow: 'Client sends HTTP Upgrade Request → LB routes to WS Server → WS handshake completes → Bi-directional channel opens → Client sends PING every 30s → Server responds PONG',
                    tradeoffs: ['WebSockets vs Server-Sent Events (SSE): WebSockets are strictly bi-directional but harder to load balance; SSE is simpler (runs over HTTP/2) but only server-to-client', 'Socket.io vs raw WebSockets: Socket.io handles fallbacks, namespaces, and auto-reconnect, but adds overhead; raw WS is faster but requires writing boilerplate'],
                    challenges: ['Connection drops during mobile network handoffs (3G to WiFi) → Buffer messages locally and sync on reconnect using a client-side last_message_id watermark', 'NAT timeouts closing idle connections → Implement application-level ping/pong heartbeats']
                },
                {
                    highlight: ['auth', 'lb'], title: '2. Authentication & Routing', desc: 'JWT token validates user identity during the initial WebSocket handshake. Load balancer routes to the correct WS server using consistent hashing on user_id or sticky sessions, ensuring session persistence if necessary.',
                    impl: 'Nginx/HAProxy with ip_hash or cookie-based sticky sessions. JWT RS256 signing for secure, stateless Auth.',
                    algo: 'Consistent Hashing for server affinity. HMAC for fast token verification.',
                    requirements: ['Validate WS tokens efficiently without blocking the event loop', 'Reject unauthorized connections before WS upgrade completes', 'Encrypt all data in transit via WSS (TLS)'],
                    dataFlow: 'Client sends Auth token in WS handshake headers → Nginx terminates TLS → Nginx checks token or forwards to Auth Svc → Valid? Nginx upgrades connection and pins client to a specific WS server',
                    tradeoffs: ['Pass token in URL query vs Headers: Headers are more secure (URLs logged in proxies); however, native browser WS API only allowed passing tokens via query strings until recently', 'Consistent Hashing vs Sticky Sessions: Consistent hashing doesn\'t require state on the LB; Sticky cookies are easier to configure but LB needs to track them'],
                    challenges: ['Load balancing long-lived connections → A WS server might fill up; new connections must be correctly routed to less loaded servers (Least Connections load balancing)']
                },
                {
                    highlight: ['msg', 'pubsub'], title: '3. Message Delivery & Routing', desc: 'Message Service receives the message, generates a Snowflake ID (time-sortable), stores it, then publishes to Redis Pub/Sub. All WS servers explicitly subscribed to that chat channel relay the message to connected recipients.',
                    impl: 'Redis Pub/Sub (or Redis Streams) for cross-server fanout. Snowflake ID generator (Twitter logic).',
                    algo: 'Snowflake ID (64-bit: 41-bit timestamp, 10-bit machine id, 12-bit sequence). Fan-out strictly on write to connected clients.',
                    requirements: ['End-to-end delivery latency < 200ms globally', 'Messages within a chat must be strictly ordered', 'Guaranteed exactly-once or at-least-once delivery'],
                    dataFlow: 'User A sends msg to WS Server 1 → WS Server 1 forwards to Message Svc → Message Svc generates ID + saves to DB → Message Svc publishes to Redis channel `chat:123` → WS Server 2 (holding User B\'s connection) receives from Redis → WS Server 2 pushes msg to User B',
                    tradeoffs: ['Redis Pub/Sub vs Kafka/RabbitMQ: Redis Pub/Sub is incredibly fast/lightweight but messages are lost if a consumer is offline; Kafka persists events but is heavier', 'Global counter vs Snowflake ID: Global DB counter is a huge bottleneck; Snowflake generates unique sortable IDs completely independently across servers'],
                    challenges: ['Message ordering → Rely on the temporal aspect of Snowflake IDs; client sorts primarily by ID, not just local timestamp', 'Chat rooms with 10k+ users → Fan-out becomes a massive spike. Throttle/batch updates for massive rooms (like Twitch chat limits)'],
                    codeSnippet: `// Publishing a message to Redis Pub/Sub\nasync function sendMessage(chatId, senderId, text) {\n  const messageId = generateSnowflakeId();\n  const message = { id: messageId, chatId, senderId, text, timestamp: Date.now() };\n  \n  // 1. Save to DB asynchronously\n  db.messages.insert(message);\n  \n  // 2. Broadcast immediately to anyone connected to this chat\n  await redis.publish(\`chat:\${chatId}\`, JSON.stringify(message));\n  \n  return messageId;\n}`
                },
                {
                    highlight: ['presence'], title: '4. Online Presence & Typing Indicators', desc: 'Presence Service tracks online/offline/typing status using Redis with TTL keys. "Last seen" updates on disconnect. Typing indicators use ephemeral, short-lived Redis keys (e.g., 3s TTL).',
                    impl: 'Redis SETs and Hashes with EXPIRE commands. WebSocket broadcast events.',
                    algo: 'Heartbeat protocol (30s interval). TTL-based presence detection (mark offline if no heartbeat for 45s).',
                    requirements: ['Instantly show "User is typing..." to the other person', 'Accurately show "Last seen at X"', 'Support presence broadly across devices (User online on Web but offline on Mobile)'],
                    dataFlow: 'Client sends heartbeat or typing event → WS Server routes to Presence Svc → Updates Redis `user_status:userId` TTL to 45s → In chat view, clients subscribe to presence updates for active friends',
                    tradeoffs: ['Push vs Pull for presence: Pushing every status change to everyone is O(N^2) traffic; Pulling (client fetches status when viewing a profile) scales better for large friend lists'],
                    challenges: ['False disconnects (flaky networks) → Delay marking as "offline" by 10-15 seconds to allow quick reconnections without flickering presence indicators']
                },
                {
                    highlight: ['media', 's3'], title: '5. Media Sharing (Images/Video)', desc: 'Images/videos are uploaded directly from client to Object Storage (S3) using pre-signed URLs. Thumbnails are generated. Media URLs are then embedded in the actual text messages.',
                    impl: 'AWS S3 + CloudFront CDN. AWS Lambda or Sharp for background image processing. Chunked uploads for large video files.',
                    algo: 'Chunked upload with resumable protocol. Content-addressable storage (SHA-256 hash as filename) to deduplicate shared memes.',
                    requirements: ['Fast image loading in chat feeds (progressive JPEGs)', 'Secure uploads (users cannot upload executable files)', 'Upload resuming if connection drops at 90%'],
                    dataFlow: 'Client requests upload URL → API Svc generates S3 Pre-signed URL → Client directly PUTs file to S3 → S3 triggers Lambda to generate thumbnail → Client sends chat message containing the S3 URL',
                    tradeoffs: ['Direct S3 upload vs proxy through backend: Proxying consumes heavy backend bandwidth/CPU; Direct upload offloads bandwidth entirely to S3, but requires secure pre-signed URLs'],
                    challenges: ['Malicious file uploads → S3 bucket policies restrict content-type; background virus scanning via Lambda before making the file readable']
                },
                {
                    highlight: ['db', 'queue'], title: '6. Message Persistence & Sync', desc: 'Messages are stored partitioned by conversation_id for fast historical retrieval. Kafka streams events for analytics, read receipts (sent/delivered/read), and updating offline users.',
                    impl: 'Apache Cassandra or MongoDB with sharding on conversation_id. Kafka consumer groups.',
                    algo: 'Write-ahead logging in DB. Vector clocks or High-Water Marks for syncing offline messages (give me all messages ID > X).',
                    requirements: ['Infinite scroll for chat history', 'Read receipts tracking (ticks: ✓, ✓✓, 🔵✓✓)', 'Ability to search locally and via server'],
                    dataFlow: 'User reconnects after 2 hours → Client sends last_received_msg_id → DB queried: SELECT * FROM messages WHERE chat_id=Y AND id > last_received_msg_id → Bulk sync payload sent to client',
                    tradeoffs: ['Cassandra vs MongoDB for chat: Cassandra is the industry standard (used by Discord/Apple) for insane write-heavy time-series data; MongoDB is easier to query/setup but requires careful sharding'],
                    challenges: ['Read receipt storms → A message to a 50-person group generates 50 "delivered" and 50 "read" events. Batch these state updates in memory before saving to DB.', 'Database size explosion → Move older messages (e.g. > 1 year) to cold storage (S3) and only query if user scrolls that far back']
                },
                {
                    highlight: ['notify'], title: '7. Push Notifications (Offline Users)', desc: 'When the recipient is not actively connected via WebSocket, Kafka triggers the Push Notification Service which sends the message via FCM (Android) or APNs (iOS). Notifications are deduplicated and rate-limited.',
                    impl: 'Firebase Cloud Messaging (FCM), Apple Push Notification service (APNs). Notification batching (e.g., 5s window).',
                    algo: 'Token Bucket for rate limiting. Exponential backoff for retries. Payload encryption.',
                    requirements: ['Deliver push within 2 seconds of message receipt for offline users', 'Do not send push if the user has the app open on Web', 'Group notifications ("3 new messages from John")'],
                    dataFlow: 'Message arrives → Presence checks Redis → User is offline? → Publish to Kafka `push_topic` → Push Svc consumes → Checks user notification settings → Calls FCM/APNs API → User phone wakes up',
                    tradeoffs: ['Including message content in Push vs Wake-Up only: Payload push shows message instantly but risks privacy on lock screen; Wake-Up push (Data payload) wakes the app to fetch the message securely but is slower'],
                    challenges: ['Waking up battery-optimized devices (Doze mode) → High-priority FCM messages traverse Doze mode, but Google restricts how many high-priority messages you can send per day'],
                    codeSnippet: `// Sending Push Notification via Firebase (FCM)\nasync function sendPush(userId, title, body, data) {\n  const tokens = await db.deviceTokens.find({ userId });\n  if (tokens.length === 0) return;\n\n  const message = {\n    notification: { title, body },\n    data: data, // Hidden payload for app to process\n    tokens: tokens.map(t => t.token)\n  };\n  \n  // Send multicast to all user's devices\n  const response = await admin.messaging().sendMulticast(message);\n  \n  // Cleanup dead tokens\n  response.responses.forEach((res, idx) => {\n    if (!res.success && res.error.code === 'messaging/registration-token-not-registered') {\n      db.deviceTokens.delete(tokens[idx]);\n    }\n  });\n}`
                },
            ],
            techStack: ['React Native', 'Node.js', 'MongoDB', 'Redis', 'Kafka', 'Socket.io', 'S3', 'Docker'],
            suggestions: [
                'Use end-to-end encryption (Signal Protocol) for security',
                'Implement message queuing for offline delivery guarantee',
                'Shard MongoDB by conversation_id for horizontal scaling',
                'Use Redis Cluster for Pub/Sub across multiple servers',
                'Add read receipts with 3-state tracking (sent/delivered/read)',
            ]
        };
    }

    _socialMedia() {
        return {
            title: '📸 Social Media Platform',
            subtitle: 'Like Instagram / Twitter / Facebook',
            nodes: [
                this._node('client', 'Mobile/Web', '📱', 80, 190, '#a855f7'),
                this._node('cdn', 'CDN', '🌐', 80, 60, '#06b6d4'),
                this._node('lb', 'Load Balancer', '⚖️', 280, 190, '#f59e0b'),
                this._node('api', 'API Gateway', '🚪', 480, 190, '#10b981'),
                this._node('auth', 'Auth Service', '🔒', 280, 60, '#ef4444'),
                this._node('post', 'Post Service', '📝', 680, 60, '#8b5cf6'),
                this._node('feed', 'Feed Service', '📰', 680, 150, '#3b82f6'),
                this._node('social', 'Social Graph', '🤝', 680, 240, '#f97316'),
                this._node('media', 'Media Service', '🖼️', 680, 330, '#ec4899'),
                this._node('search', 'Search', '🔍', 880, 60, '#eab308'),
                this._node('notify', 'Notifications', '🔔', 880, 150, '#10b981'),
                this._node('cache', 'Redis Cache', '⚡', 880, 240, '#ef4444'),
                this._node('db', 'PostgreSQL', '🗄️', 480, 340, '#3b82f6'),
                this._node('s3', 'Object Store', '📁', 880, 330, '#f59e0b'),
            ],
            connections: [
                this._conn('client', 'cdn', 'Media'), this._conn('client', 'lb', 'HTTPS'),
                this._conn('lb', 'api', 'Route'), this._conn('api', 'auth', 'JWT'),
                this._conn('api', 'post', 'CRUD'), this._conn('api', 'feed', 'Read'),
                this._conn('api', 'social', 'Follow'), this._conn('post', 'feed', 'Fanout'),
                this._conn('post', 'search', 'Index'), this._conn('social', 'notify', 'Events'),
                this._conn('feed', 'cache', 'Pre-compute'), this._conn('post', 'db', 'Store'),
                this._conn('media', 's3', 'Upload'), this._conn('api', 'media', 'Files'),
            ],
            steps: [
                {
                    highlight: ['client', 'cdn'], title: '1. App Load & Media Delivery', desc: 'The mobile app initializes and immediately requests the user\'s feed. Static assets, images, and short videos are served directly from a global CDN for low latency.',
                    impl: 'React Native / Swift / Kotlin. CloudFront/Akamai CDN. Adaptive Bitrate Streaming (HLS) for video.',
                    algo: 'Video encoding into multiple resolutions (1080p, 720p, 360p). Geo-DNS routing to nearest CDN edge.',
                    requirements: ['First byte time < 50ms', 'Smooth video playback regardless of network conditions', 'Infinite scroll with optimistic UI rendering'],
                    dataFlow: 'App launch → Client fetches feed JSON from API → Client parses JSON to find media URLs → Client requests media from CDN → Video player uses Adaptive Bitrate Streaming to adjust quality dynamically based on current bandwidth',
                    tradeoffs: ['HLS vs MP4 for video: HLS (HTTP Live Streaming) adapts to network speed preventing buffering, but is harder to implement; MP4 is simple but buffers heavily on slow networks'],
                    challenges: ['CDN bill shock → Use aggressive caching headers (Cache-Control: immutable) for user uploads since they never change, only get deleted']
                },
                {
                    highlight: ['lb', 'api'], title: '2. API Gateway & Auth', desc: 'API Gateway authenticates the request using JWT, limits rate to prevent scraping/abuse, and routes the request to the Feed Service.',
                    impl: 'Envoy or Nginx API Gateway. Redis for distributed rate limiting. OAuth 2.0 / OIDC.',
                    algo: 'Token Bucket rate limiting (e.g., 50 feed requests / min). OAuth 2.0 PKCE flow for mobile apps.',
                    requirements: ['Prevent bot scraping of public profiles', 'Stateless authentication scaling to 10M+ DAU', 'API versioning for backward compatibility with old app versions'],
                    dataFlow: 'Client HTTP request → WAF (Web Application Firewall) checks for malicious payload → API Gateway → Validates JWT → Checks Rate Limiter → Forwards to internal microservice',
                    tradeoffs: ['GraphQL vs REST: GraphQL is ideal for social media to avoid over-fetching (e.g., fetching a post + its 3 top comments + author info in one query); REST is simpler but requires multiple round-trips or bloated endpoints'],
                    challenges: ['Throttling legitimate users on shared IP (NAT) → Use a combination of IP address and user_id for rate limiting instead of IP alone']
                },
                {
                    highlight: ['graph'], title: '3. Follower Graph', desc: 'Graph Database maintains relationships (who follows whom, block lists, close friends). This is queried heavily during feed generation to know whose posts to fetch.',
                    impl: 'Neo4j, Amazon Neptune, or a highly optimized relational schema (PostgreSQL) for relationships. Redis for caching mutual friends.',
                    algo: 'Breadth-First Search (BFS) for "mutual friends" or "suggested followers". Adjacency List representation.',
                    requirements: ['O(1) lookup for "does User A follow User B"', 'Fast retrieval of all followers for a user (can be millions for celebrities)', 'Bi-directional relationship support'],
                    dataFlow: 'User A clicks "Follow" User B → API Gateway → Graph Service → Inserts edge (A \'-FOLLOWS->\' B) → Background job updates cached follower counts for B and following counts for A',
                    tradeoffs: ['Graph DB vs Relational DB for social graph: Graph DBs (Neo4j) excel at deep traversals ("friends of friends"); Relational DBs are fine for shallow 1-degree lookups (followers/following) and are easier to operate at scale'],
                    challenges: ['Celebrity accounts (Justin Bieber effect) → A user with 100M followers causes a massive hotspot. Fan-out architectures must treat these accounts differently (Fan-out-on-Read instead of Fan-out-on-Write)']
                },
                {
                    highlight: ['feed', 'redis'], title: '4. Feed Generation', desc: 'Feed generation uses a hybrid Fan-out approach. For normal users, Fan-out-on-Write pushes new posts to followers\' Redis feeds. For celebrities, Fan-out-on-Read pulls their posts dynamically at feed load time.',
                    impl: 'Redis Lists or Sorted Sets for materialized feed generation. Go/Rust for high-throughput feed service.',
                    algo: 'Hybrid Fan-out (Push/Pull model). Time-decay ranking combined with ML engagement prediction.',
                    requirements: ['Feed load time < 200ms', 'Chronological or algorithmic sorting support', 'Pagination using cursors, not offsets'],
                    dataFlow: 'Client requests feed → Feed Svc fetches user\'s materialized Redis feed (up to 500 post_ids) → Feed Svc concurrently fetches recent posts from followed celebrities (Pull model) → Merges lists → Ranks items → Hydrates post details from Post Service → Returns JSON',
                    tradeoffs: ['Fan-out-on-Write (Push) vs Fan-out-on-Read (Pull): Push is very fast for reading but writes are slow/expensive (O(N) where N=followers); Pull is fast to write but slow to read (must query all followed users)'],
                    challenges: ['Zombie users → Don\'t fan-out-on-write to users who haven\'t logged in for 30 days. Generate their feed on-the-fly if they return'],
                    codeSnippet: `// Hybrid Feed Generation (Push + Pull)\nasync function getFeed(userId) {\n  // 1. Get pre-computed feed (Push model for normal followed users)\n  const pushFeedIds = await redis.zrevrange(\`feed:\${userId}\`, 0, 50);\n  \n  // 2. Get celebrity posts (Pull model)\n  const celebsFollowing = await graph.getCelebsFollowedBy(userId);\n  const pullFeedIds = await postDb.getRecentPosts(celebsFollowing, 24 * 60 * 60);\n  \n  // 3. Merge, rank, and hydrate\n  const mergedIds = mergeAndRank(pushFeedIds, pullFeedIds);\n  return hydratePosts(mergedIds);\n}`
                },
                {
                    highlight: ['ml'], title: '5. Feed Ranking (ML)', desc: 'Instead of purely chronological, an ML model ranks the feed based on affinity (relationship strength), weight (post type - video > photo > text), and time decay.',
                    impl: 'TensorFlow/PyTorch models served via TF Serving. Feature store (e.g., Feast) for real-time user features.',
                    algo: 'EdgeRank algorithm or Deep Neural Networks predicting click-through rate (pCTR) and engagement probability (pLike, pComment).',
                    requirements: ['Ranking must execute in < 50ms for thousands of candidate posts', 'Continuous model training based on real-time engagement telemetry', 'Avoid echo chambers by injecting serendipitous content'],
                    dataFlow: 'Feed Svc gets 500 candidate post IDs → Calls ML Ranking Svc → ML Svc fetches features for (User, Post) pairs from Feature Store → Model predicts probability of engagement → Sorts descending by score → Returns top 20 to user',
                    tradeoffs: ['Heavy Ranking vs Lightweight Ranking: Heavy NN ranking is accurate but slow/expensive, requires two-pass ranking (Lightweight L1 ranker filters 10k → 500, Heavy L2 ranker scores the 500)'],
                    challenges: ['Feature staleness → If user just liked 3 cat videos, the feature store must update within seconds so the next feed refresh shows more cats']
                },
                {
                    highlight: ['queue', 'post'], title: '6. Post Creation & Media Processing', desc: 'When a user posts a photo/video, it goes to Object Storage. A message is sent to Kafka for async processing: video transcoding, AI content moderation (NSFW detection), and feed fan-out.',
                    impl: 'Apache Kafka. AWS MediaConvert for transcoding. AWS Rekognition / Custom CNNs for NSFW image detection.',
                    algo: 'Queue-based asynchronous processing. CNN (Convolutional Neural Networks) for image classification.',
                    requirements: ['Non-blocking UI: show the post locally immediately while it uploads in background', 'Strict NSFW filtering before it reaches any follower feeds', 'Generate thumbnails and multiple resolutions'],
                    dataFlow: 'Client uploads video to S3 → Client sends Post metadata to API → Post Svc creates DB record (status: processing) → Publishes to Kafka → S3 triggers Transcoding Lambda → Transcoding finishes → Moderation Svc scans video → If clean, triggers Fan-out Svc to push to followers\' Redis feeds',
                    tradeoffs: ['Synchronous vs Asynchronous posting: Sync makes sure the post is 100% processed before returning success, but takes too long for video (minutes); Async returns instantly, processes in background, but might fail later'],
                    challenges: ['Upload failures on mobile → Implement background upload tasks in iOS/Android that survive app suspension']
                },
                {
                    highlight: ['db', 'post'], title: '7. Data Storage & Archiving', desc: 'Post metadata and comments are stored in a distributed NoSQL database (Cassandra) for high write throughput. Old posts are moved to cold storage (S3) to save costs.',
                    impl: 'Apache Cassandra for posts/comments. S3 for media and cold storage. Elasticsearch for hashtag search.',
                    algo: 'Cassandra Wide-Column data modeling (partition key: user_id, clustering key: post_id DESC). compaction strategies.',
                    requirements: ['Massive write throughput (thousands of posts/comments per second)', 'High availability (eventual consistency is acceptable for likes/comments)', 'Cost-efficient storage for billions of old photos'],
                    dataFlow: 'App writes comment → API → Post Svc → Writes to Cassandra (Consistency Level: LOCAL_QUORUM) → Async counter increment for total_comments in Redis → Returns success',
                    tradeoffs: ['Cassandra vs Relational for feeds: Cassandra excels at time-series append-only data with massive writes; Relational struggles with the sheer volume of writes without complex sharding'],
                    challenges: ['Cassandra tombstones → Deleting massive amounts of data (e.g. user deletes account) creates tombstones which slow down reads. Require careful compaction tuning.'],
                    codeSnippet: `// Cassandra Table Schema for Posts\nCREATE TABLE posts (\n  user_id UUID,\n  post_id TIMEUUID,\n  content TEXT,\n  media_urls LIST<TEXT>,\n  created_at TIMESTAMP,\n  PRIMARY KEY (user_id, post_id)\n) WITH CLUSTERING ORDER BY (post_id DESC);`
                },
            ],
            techStack: ['React Native', 'Node.js', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Kafka', 'Neo4j', 'S3'],
            suggestions: [
                'Use hybrid Fan-out (write for normal, read for celebrities)',
                'Implement content moderation with ML image classification',
                'Cache feed timelines in Redis Sorted Sets for O(log N) inserts',
                'Use graph database for friend-of-friend recommendations',
                'Implement rate limiting per user to prevent spam/bots',
            ]
        };
    }

    _rideShare() { return this._foodDelivery(); /* similar architecture */ }
    _videoStream() { return this._ecommerce(); /* similar to catalog model */ }
    _booking() { return this._ecommerce(); }

    _generic(raw) {
        const name = raw.replace(/^(i want to |design |build |create |make |develop )/i, '').replace(/ (app|application|system|platform|website|service)$/i, '').trim();
        const d = this._ecommerce();
        d.title = `🏗️ ${name.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')} Platform`;
        d.subtitle = 'Custom System Architecture';
        return d;
    }

    // ─── RENDER ───
    _render(design) {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        // Header
        const header = document.createElement('div');
        header.className = 'sdv-header';
        header.innerHTML = `<h2>${design.title}</h2><p>${design.subtitle}</p>`;
        this.container.appendChild(header);

        // SVG Diagram
        const svgWrap = document.createElement('div');
        svgWrap.className = 'sdv-diagram';
        const svg = this._buildSVG(design.nodes, design.connections);
        svgWrap.appendChild(svg);
        this.container.appendChild(svgWrap);

        // Step Controls
        const controls = document.createElement('div');
        controls.className = 'sdv-controls';
        controls.innerHTML = `
            <button class="sdv-btn" id="sdv-prev">⏮ Prev</button>
            <button class="sdv-btn sdv-play" id="sdv-play">▶ Play Walkthrough</button>
            <button class="sdv-btn" id="sdv-next">Next ⏭</button>
            <span class="sdv-step-count" id="sdv-step-count">Step 1 / ${design.steps.length}</span>
        `;
        this.container.appendChild(controls);

        // Step Detail Panel
        const panel = document.createElement('div');
        panel.className = 'sdv-step-panel';
        panel.id = 'sdv-step-panel';
        this.container.appendChild(panel);

        // Implementation Plan
        const implPlan = document.createElement('div');
        implPlan.className = 'sdv-section';
        implPlan.innerHTML = `
            <h3>🛠️ Tech Stack</h3>
            <div class="sdv-tags">${design.techStack.map(t => `<span class="sdv-tag">${t}</span>`).join('')}</div>
            <h3>💡 Architecture Suggestions</h3>
            <ul class="sdv-suggestions">${design.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        this.container.appendChild(implPlan);

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'sdv-back-btn';
        backBtn.textContent = '← Back to Topics';
        backBtn.onclick = () => { this.container.style.display = 'none'; this.stop(); };
        this.container.prepend(backBtn);

        // Wire controls
        this.container.querySelector('#sdv-prev').onclick = () => this.prevStep();
        this.container.querySelector('#sdv-next').onclick = () => this.nextStep();
        this.container.querySelector('#sdv-play').onclick = () => this.togglePlay();

        this._svgEl = svg;
        this._design = design;
    }

    _buildSVG(nodes, connections) {
        const W = 1020, H = 420;
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('width', '100%');
        svg.style.maxHeight = '420px';

        // Defs for arrow
        const defs = document.createElementNS(ns, 'defs');
        defs.innerHTML = `<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#888"/></marker>`;
        svg.appendChild(defs);

        // Draw connections
        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n; });

        connections.forEach(c => {
            const from = nodeMap[c.from], to = nodeMap[c.to];
            if (!from || !to) return;
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', from.x + 55); line.setAttribute('y1', from.y + 25);
            line.setAttribute('x2', to.x + 55); line.setAttribute('y2', to.y + 25);
            line.setAttribute('stroke', '#555');
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('marker-end', 'url(#arrow)');
            line.setAttribute('data-from', c.from);
            line.setAttribute('data-to', c.to);
            line.classList.add('sdv-line');
            if (c.dashed) line.setAttribute('stroke-dasharray', '6,4');
            svg.appendChild(line);

            // Label
            const mx = (from.x + to.x) / 2 + 55, my = (from.y + to.y) / 2 + 20;
            const label = document.createElementNS(ns, 'text');
            label.setAttribute('x', mx); label.setAttribute('y', my);
            label.setAttribute('fill', '#999'); label.setAttribute('font-size', '9');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = c.label || '';
            svg.appendChild(label);
        });

        // Draw nodes
        nodes.forEach(n => {
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('data-node-id', n.id);
            g.classList.add('sdv-node');

            const rect = document.createElementNS(ns, 'rect');
            rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
            rect.setAttribute('width', 110); rect.setAttribute('height', 50);
            rect.setAttribute('rx', 10);
            rect.setAttribute('fill', n.color + '18');
            rect.setAttribute('stroke', n.color);
            rect.setAttribute('stroke-width', '1.5');
            g.appendChild(rect);

            const icon = document.createElementNS(ns, 'text');
            icon.setAttribute('x', n.x + 12); icon.setAttribute('y', n.y + 22);
            icon.setAttribute('font-size', '14');
            icon.textContent = n.icon;
            g.appendChild(icon);

            const text = document.createElementNS(ns, 'text');
            text.setAttribute('x', n.x + 30); text.setAttribute('y', n.y + 22);
            text.setAttribute('fill', '#e0e0e0'); text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', '600');
            text.textContent = n.label.length > 14 ? n.label.slice(0, 13) + '…' : n.label;
            g.appendChild(text);

            const sub = document.createElementNS(ns, 'text');
            sub.setAttribute('x', n.x + 55); sub.setAttribute('y', n.y + 40);
            sub.setAttribute('fill', '#999'); sub.setAttribute('font-size', '8');
            sub.setAttribute('text-anchor', 'middle');
            g.appendChild(sub);

            svg.appendChild(g);
        });

        return svg;
    }

    _highlightStep(idx) {
        if (!this._design || idx < 0 || idx >= this.steps.length) return;
        this.currentStep = idx;
        const step = this.steps[idx];

        // Reset all nodes
        this._svgEl.querySelectorAll('.sdv-node rect').forEach(r => { r.style.filter = ''; r.style.strokeWidth = '1.5'; });
        this._svgEl.querySelectorAll('.sdv-line').forEach(l => { l.style.stroke = '#555'; l.style.strokeWidth = '1.5'; });
        this._svgEl.querySelectorAll('.sdv-node').forEach(n => { n.style.opacity = '0.35'; });

        // Highlight active nodes
        step.highlight.forEach(id => {
            const g = this._svgEl.querySelector(`[data-node-id="${id}"]`);
            if (g) { g.style.opacity = '1'; const r = g.querySelector('rect'); if (r) { r.style.filter = 'drop-shadow(0 0 8px ' + r.getAttribute('stroke') + ')'; r.style.strokeWidth = '2.5'; } }
        });

        // Highlight connections between highlighted nodes
        this._svgEl.querySelectorAll('.sdv-line').forEach(l => {
            const from = l.getAttribute('data-from'), to = l.getAttribute('data-to');
            if (step.highlight.includes(from) && step.highlight.includes(to)) {
                l.style.stroke = '#a855f7'; l.style.strokeWidth = '2.5';
            }
        });

        // Update panel with deep analysis
        const panel = this.container.querySelector('#sdv-step-panel');
        if (panel) {
            const reqs = step.requirements ? `<div class="sdv-deep-section"><div class="sdv-deep-title">📋 Key Requirements</div><ul class="sdv-deep-list">${step.requirements.map(r => `<li>${r}</li>`).join('')}</ul></div>` : '';
            const flow = step.dataFlow ? `<div class="sdv-deep-section"><div class="sdv-deep-title">🔄 Data Flow</div><div class="sdv-deep-text">${step.dataFlow}</div></div>` : '';
            const tradeoffs = step.tradeoffs ? `<div class="sdv-deep-section"><div class="sdv-deep-title">⚖️ Trade-offs & Alternatives</div><ul class="sdv-deep-list">${step.tradeoffs.map(t => `<li>${t}</li>`).join('')}</ul></div>` : '';
            const challenges = step.challenges ? `<div class="sdv-deep-section"><div class="sdv-deep-title">⚠️ Challenges & Solutions</div><ul class="sdv-deep-list">${step.challenges.map(c => `<li>${c}</li>`).join('')}</ul></div>` : '';
            const code = step.codeSnippet ? `<div class="sdv-deep-section"><div class="sdv-deep-title">💻 Code Example</div><pre class="sdv-code">${step.codeSnippet}</pre></div>` : '';
            panel.innerHTML = `
                <div class="sdv-step-title">${step.title}</div>
                <div class="sdv-step-desc">${step.desc}</div>
                ${reqs}${flow}
                <div class="sdv-step-meta">
                    <div class="sdv-meta-item"><strong>🛠️ Implementation:</strong> ${step.impl}</div>
                    <div class="sdv-meta-item"><strong>🧮 Algorithm:</strong> ${step.algo}</div>
                </div>
                ${tradeoffs}${challenges}${code}
            `;
            panel.style.animation = 'none';
            panel.offsetHeight;
            panel.style.animation = 'fadeSlide 0.3s ease';
        }

        // Update counter
        const counter = this.container.querySelector('#sdv-step-count');
        if (counter) counter.textContent = `Step ${idx + 1} / ${this.steps.length}`;
    }

    nextStep() { if (this.currentStep < this.steps.length - 1) this._highlightStep(this.currentStep + 1); else this.stop(); }
    prevStep() { if (this.currentStep > 0) this._highlightStep(this.currentStep - 1); }

    togglePlay() {
        if (this.isPlaying) { this.stop(); } else { this.play(); }
    }

    play() {
        this.isPlaying = true;
        const btn = this.container.querySelector('#sdv-play');
        if (btn) btn.textContent = '⏸ Pause';
        this.playInterval = setInterval(() => { this.nextStep(); }, 4000);
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.playInterval);
        const btn = this.container.querySelector('#sdv-play');
        if (btn) btn.textContent = '▶ Play Walkthrough';
    }

    destroy() { this.stop(); if (this.container) this.container.innerHTML = ''; }
}
