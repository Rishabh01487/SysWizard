// System Design Visualizer — animated data flow + deep-dive architecture walkthrough
export class SystemDesignVisualizer {
    constructor(container) {
        this.container = container;
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.animFrameId = null;
        this.particles = [];
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
        const map = {
            'food': '_foodDelivery', 'delivery': '_foodDelivery', 'swiggy': '_foodDelivery', 'zomato': '_foodDelivery',
            'e-commerce': '_ecommerce', 'ecommerce': '_ecommerce', 'amazon': '_ecommerce', 'shop': '_ecommerce',
            'chat': '_chatApp', 'whatsapp': '_chatApp', 'messag': '_chatApp', 'telegram': '_chatApp',
            'social': '_socialMedia', 'instagram': '_socialMedia', 'twitter': '_socialMedia',
            'ride': '_rideShare', 'uber': '_rideShare', 'ola': '_rideShare', 'cab': '_rideShare',
            'streaming': '_videoStream', 'netflix': '_videoStream', 'youtube': '_videoStream', 'video': '_videoStream',
        };
        for (const [key, fn] of Object.entries(map)) {
            if (q.includes(key)) return this[fn]();
        }
        return this._generic(raw);
    }

    _node(id, label, icon, x, y, color, desc) {
        return { id, label, icon, x, y, color, desc: desc || '' };
    }
    _conn(from, to, label, type) {
        return { from, to, label: label || '', type: type || 'data' }; // type: data | request | response | cache | async
    }

    // ──────────────────────────────────────────────
    // FOOD DELIVERY DESIGN
    // ──────────────────────────────────────────────
    _foodDelivery() {
        const nodes = [
            this._node('user', 'User (Mobile)', '📱', 50, 40, '#a855f7', 'Customer using the mobile app or website to browse restaurants and place orders'),
            this._node('cdn', 'CDN', '🌐', 50, 200, '#06b6d4', 'Content Delivery Network — serves static assets (images, JS, CSS) from edge servers closest to user for <50ms load'),
            this._node('lb', 'Load Balancer', '⚖️', 230, 120, '#f59e0b', 'Distributes incoming requests across multiple API servers using Round Robin / Least Connections to prevent overload'),
            this._node('api', 'API Gateway', '🚪', 420, 120, '#10b981', 'Central entry point — handles authentication, rate limiting (Token Bucket), request routing, and API versioning'),
            this._node('auth', 'Auth Service', '🔒', 420, 10, '#ef4444', 'Manages JWT tokens, OAuth (Google/Phone login), session validation, and password hashing (bcrypt)'),
            this._node('order', 'Order Service', '📦', 620, 40, '#8b5cf6', 'Core business logic — creates orders, calculates pricing (items + tax + delivery fee), manages order state machine'),
            this._node('restaurant', 'Restaurant Svc', '🏪', 620, 130, '#f97316', 'Manages restaurant profiles, menus, availability, operating hours, and accepts/rejects incoming orders'),
            this._node('delivery', 'Delivery Svc', '🚴', 620, 220, '#06b6d4', 'Assigns nearest delivery partner using Quadtree, tracks real-time location via WebSocket every 3 seconds'),
            this._node('payment', 'Payment Svc', '💳', 820, 40, '#ec4899', 'Processes payments via Stripe/Razorpay with idempotency keys to prevent double charges, handles refunds'),
            this._node('notify', 'Notification', '🔔', 820, 130, '#eab308', 'Sends push (FCM/APNs), SMS (Twilio), and email notifications for order status updates in real-time'),
            this._node('queue', 'Message Queue', '📨', 820, 220, '#6366f1', 'RabbitMQ/Kafka — decouples services, ensures reliable async event delivery with retries and dead-letter queues'),
            this._node('db', 'PostgreSQL', '🗄️', 420, 280, '#3b82f6', 'Primary database — ACID transactions for orders, users, restaurants. Sharded by city_id for horizontal scaling'),
            this._node('redis', 'Redis Cache', '⚡', 230, 280, '#ef4444', 'In-memory cache — stores session data, popular menus, geo-indexes. Reduces DB load by 80% with LRU eviction'),
            this._node('geo', 'Geo / Maps', '📍', 230, 10, '#10b981', 'GeoHash + PostGIS — spatial queries for "restaurants within 5km", Haversine distance calc, route optimization'),
        ];
        const connections = [
            this._conn('user', 'cdn', 'Static assets', 'request'),
            this._conn('user', 'lb', 'HTTPS request', 'request'),
            this._conn('lb', 'api', 'Forward request', 'request'),
            this._conn('api', 'auth', 'Validate JWT', 'request'),
            this._conn('auth', 'api', 'Token valid ✓', 'response'),
            this._conn('api', 'geo', 'Find nearby', 'request'),
            this._conn('geo', 'api', 'Restaurant list', 'response'),
            this._conn('api', 'redis', 'Check cache', 'cache'),
            this._conn('redis', 'api', 'Cache hit/miss', 'response'),
            this._conn('api', 'order', 'Place order', 'request'),
            this._conn('api', 'restaurant', 'Get menu', 'request'),
            this._conn('order', 'payment', 'Charge ₹499', 'request'),
            this._conn('payment', 'order', 'Payment OK ✓', 'response'),
            this._conn('order', 'db', 'INSERT order', 'data'),
            this._conn('order', 'queue', 'OrderCreated event', 'async'),
            this._conn('queue', 'delivery', 'Assign driver', 'async'),
            this._conn('queue', 'notify', 'Send push', 'async'),
            this._conn('delivery', 'geo', 'Track location', 'data'),
            this._conn('delivery', 'user', 'WebSocket updates', 'response'),
        ];

        return {
            title: '🍔 Food Delivery Platform',
            subtitle: 'Like Swiggy / Zomato / DoorDash',
            nodes, connections,
            steps: this._foodDeliverySteps(),
            techStack: ['React Native', 'Node.js (Express)', 'PostgreSQL + PostGIS', 'Redis Cluster', 'RabbitMQ', 'Socket.io', 'Nginx', 'Docker + K8s', 'Stripe / Razorpay', 'Firebase FCM', 'Elasticsearch', 'S3 + CloudFront'],
            suggestions: [
                'Start with a monolith, extract microservices as traffic grows past 10K RPM',
                'Shard PostgreSQL by city_id — each city is an independent partition',
                'Use Redis Sorted Sets for restaurant ranking (score = rating × distance⁻¹)',
                'Implement Circuit Breaker (Hystrix) between Order → Payment to handle payment gateway downtime',
                'Cache restaurant menus in Redis with 5-min TTL — menus change rarely but are read 1000x/sec',
                'Use Kafka for order events if you need replay capability; RabbitMQ for simpler cases',
                'Add rate limiting at API Gateway: 100 req/min per user to prevent abuse',
            ]
        };
    }

    _foodDeliverySteps() {
        return [
            {
                highlight: ['user', 'cdn'],
                flowPath: ['user', 'cdn'],
                flowColor: '#06b6d4',
                title: '1️⃣ User Opens App — Static Assets Load',
                desc: `When the user opens the app, the browser/app sends requests for static assets (JavaScript bundles, CSS, images, fonts). These are NOT served from your main servers — they come from a CDN (Content Delivery Network) with 200+ edge servers worldwide.

The CDN caches your assets close to the user. A user in Mumbai gets assets from Mumbai's edge server (~20ms), not from your origin server in US-East (~200ms). This is a 10x latency improvement.

📊 Performance Impact:
• Without CDN: ~2-4 seconds page load
• With CDN: ~200-400ms page load
• Cache Hit Ratio: 95%+ for static assets`,
                impl: `• React Native + Expo for iOS/Android
• Next.js with ISR (Incremental Static Regeneration) for web
• CloudFront CDN with automatic WebP/AVIF image conversion
• Service Worker for offline menu caching
• Code splitting — lazy load restaurant pages, only load what's visible`,
                algo: `• Cache Invalidation: TTL-based (images: 30 days, JS: content-hash based)
• Image Optimization: Sharp library resizes to 3 sizes (thumbnail 150px, medium 400px, full 1200px)
• Lazy Loading: Intersection Observer API loads images only when scrolling into view`,
                dataFlow: 'User 📱 → CDN 🌐 → Returns cached JS/CSS/images → App renders skeleton UI'
            },
            {
                highlight: ['user', 'lb', 'api'],
                flowPath: ['user', 'lb', 'api'],
                flowColor: '#f59e0b',
                title: '2️⃣ API Request — Load Balancing & Routing',
                desc: `User taps "Search restaurants near me". The app sends an HTTPS request with the user's GPS coordinates and JWT token in the Authorization header.

This request hits the Load Balancer first (Nginx/HAProxy), which distributes traffic across 5-10 API Gateway instances using Least Connections algorithm (sends to the server handling fewest active requests).

The API Gateway then:
1. Validates the JWT token (checks signature + expiry)
2. Applies rate limiting (Token Bucket: 100 requests/min per user)
3. Logs the request for analytics
4. Routes to the correct microservice based on URL path

📊 Scale Numbers:
• Load Balancer: handles 50,000+ concurrent connections
• API Gateway: each instance handles ~2,000 req/sec
• Rate Limit: 100 req/min per user, 10,000 req/min globally`,
                impl: `• Nginx with upstream configuration for load balancing
• Express.js API Gateway with helmet (security headers) + cors
• JWT RS256 signing (asymmetric) — public key for verification, private for signing
• express-rate-limit middleware: { windowMs: 60000, max: 100 }
• Request ID (UUID v4) injected for distributed tracing`,
                algo: `• Load Balancing: Least Connections (not Round Robin — prevents slow-server pile-up)
• Rate Limiting: Token Bucket algorithm — tokens refill at 100/min, each request costs 1 token
• JWT Verification: HMAC-SHA256 signature verification (O(1) — no database lookup needed)
• Health Checks: L7 health checks every 5 seconds, unhealthy servers removed from pool`,
                dataFlow: 'User 📱 →[HTTPS + JWT]→ Load Balancer ⚖️ →[Least Conn]→ API Gateway 🚪 →[Validate + Rate Limit]→ Route to service'
            },
            {
                highlight: ['api', 'auth', 'geo', 'redis'],
                flowPath: ['api', 'auth', 'api', 'redis', 'api', 'geo'],
                flowColor: '#10b981',
                title: '3️⃣ Authentication + Geo Query — Finding Nearby Restaurants',
                desc: `The API Gateway first validates the JWT with the Auth Service. The Auth Service checks:
• Is the token expired? (exp claim)
• Is the signature valid? (RS256 verification)
• Is the user's session still active in Redis?

Once authenticated, the API checks Redis cache for "restaurants near [lat,lon]":
• Cache HIT (95% of time): Returns cached list instantly (~1ms)
• Cache MISS (5%): Queries Geo Service which uses PostGIS spatial index

The Geo Service uses GeoHash to find restaurants within the delivery radius (typically 5-10km). GeoHash converts 2D coordinates into a 1D string — nearby locations share a common prefix, making range queries extremely fast.

📊 Performance:
• Auth check: ~2ms (Redis session lookup)
• Cache hit: ~1ms
• Geo query (cache miss): ~15ms with PostGIS spatial index
• Without spatial index: ~500ms (full table scan)`,
                impl: `• Auth: JWT RS256 + Redis session store (EXPIRE 24h)
• Geo: PostGIS extension for PostgreSQL
• Cache: Redis GeoHash (GEOADD, GEORADIUS commands)
• Search: Elasticsearch for menu full-text search with fuzzy matching`,
                algo: `• GeoHash: Encodes lat/lon into base-32 string (e.g., "tdr1w" = Mumbai area)
• Haversine Formula: Calculates great-circle distance between two GPS points
• R-Tree Index: PostGIS uses R-Tree for O(log N) spatial range queries
• Cache Strategy: Read-through cache with 5-min TTL for restaurant lists`,
                dataFlow: 'API 🚪 →[JWT]→ Auth 🔒 →[Valid ✓]→ API 🚪 →[Check cache]→ Redis ⚡ →[MISS]→ Geo 📍 →[GeoHash query]→ Restaurant list returned'
            },
            {
                highlight: ['api', 'restaurant', 'order'],
                flowPath: ['api', 'restaurant', 'api', 'order'],
                flowColor: '#8b5cf6',
                title: '4️⃣ Menu Display & Order Creation',
                desc: `User selects a restaurant. The Restaurant Service returns the full menu with:
• Categories (Starters, Mains, Desserts)
• Items with prices, images, descriptions
• Availability status (some items may be "sold out")
• Estimated preparation time (15-30 min)

When the user places an order, the Order Service:
1. Validates items are still available (optimistic locking)
2. Calculates total: base price + GST (18%) + delivery fee + platform fee
3. Applies coupons/discounts if any (COUPON20 → 20% off, max ₹100)
4. Creates order with status: PENDING
5. Reserves the items in inventory (TTL lock for 10 minutes)

The Order entity follows a State Machine:
PENDING → CONFIRMED → PREPARING → READY → PICKED_UP → DELIVERED

📊 Business Rules:
• Minimum order: ₹99
• Max delivery distance: 10km
• Surge pricing: 1.2x during peak hours (12-2pm, 7-9pm)
• Free delivery above ₹199`,
                impl: `• Restaurant Service: Node.js + PostgreSQL with item availability tracking
• Order Service: Express.js with Saga pattern for distributed transactions
• Pricing Engine: Separate module with configurable rules (surge, coupons, delivery fees)
• State Machine: xstate library for order lifecycle management`,
                algo: `• Optimistic Locking: Version numbers on items prevent overselling
• Saga Pattern: Order → Payment → Confirm (with compensating rollback on failure)
• State Machine: Finite-state machine ensures valid order transitions only
• Pricing: Rule engine evaluates conditions in priority order (coupons, surge, base)`,
                dataFlow: 'API 🚪 →[GET /menu]→ Restaurant 🏪 →[Menu JSON]→ API 🚪 →[Display]→ User taps "Place Order" →[POST /order]→ Order 📦 creates order (PENDING)'
            },
            {
                highlight: ['order', 'payment', 'db'],
                flowPath: ['order', 'payment', 'order', 'db'],
                flowColor: '#ec4899',
                title: '5️⃣ Payment Processing & Database Write',
                desc: `The Order Service calls Payment Service with the order amount. Here's what happens:

1. Payment Service generates an idempotency key (UUID) to prevent double charges
2. Calls Stripe/Razorpay API to create a payment intent
3. User sees the payment sheet (UPI / Card / Wallet)
4. On success, payment gateway sends webhook confirmation
5. Payment Service updates order status: PENDING → CONFIRMED

The order is then written to PostgreSQL with ACID guarantees:
• BEGIN TRANSACTION
• INSERT into orders table
• UPDATE restaurant_items (decrement stock)
• INSERT into payments table
• COMMIT

If payment fails → compensating transaction: release inventory lock, cancel order.

📊 Reliability:
• Idempotency keys prevent duplicate payments (stored in Redis for 24h)
• Webhook retries: Stripe retries 3 times over 24 hours
• Transaction isolation: SERIALIZABLE for inventory, READ COMMITTED for reads`,
                impl: `• Stripe SDK with PaymentIntents API (PCI-compliant)
• PostgreSQL transaction with SERIALIZABLE isolation for inventory
• Redis: stores idempotency keys with 24h TTL
• Webhook: Express endpoint with signature verification (Stripe-Signature header)`,
                algo: `• Idempotency: UUID v4 key per order attempt — reject duplicates within 24h
• Saga Pattern: Order→Payment→Confirm with rollback on any step failure
• Two-Phase Commit: simplified via Saga with compensating transactions
• Dead Letter Queue: Failed payments retry 3x, then move to DLQ for manual review`,
                dataFlow: 'Order 📦 →[₹499 charge]→ Payment 💳 →[Stripe API]→ Stripe ✓ →[Webhook]→ Payment 💳 →[Confirmed]→ Order 📦 →[INSERT]→ PostgreSQL 🗄️'
            },
            {
                highlight: ['order', 'queue', 'delivery', 'notify', 'geo'],
                flowPath: ['order', 'queue', 'delivery', 'queue', 'notify'],
                flowColor: '#6366f1',
                title: '6️⃣ Async Event Processing — Driver Assignment & Notifications',
                desc: `After payment confirmation, the Order Service publishes an "OrderConfirmed" event to the Message Queue (RabbitMQ/Kafka). This triggers two parallel workflows:

WORKFLOW 1 — Driver Assignment:
• Delivery Service receives the event
• Queries Geo Service for nearby available drivers using Quadtree spatial index
• Ranks drivers by: distance (40%) + rating (30%) + acceptance rate (30%)
• Sends assignment request to top driver
• If driver doesn't accept in 30 seconds → reassign to next driver
• Once accepted: order status → PREPARING

WORKFLOW 2 — Notifications:
• Notification Service receives the same event
• Sends push notification to user: "Order confirmed! 🎉"
• Sends push to restaurant: "New order #1234 — accept within 2 min"
• Sends SMS to user (backup if push fails)

📊 Why Message Queue?
• Decoupling: Order Service doesn't wait for driver assignment (could take 30-90s)
• Reliability: Messages persist even if Delivery Service is temporarily down
• Scalability: Multiple consumers can process events in parallel`,
                impl: `• RabbitMQ with durable queues and manual acknowledgment
• Redis GeoHash (GEORADIUSBYMEMBER) for nearby driver lookup
• Firebase FCM for Android/iOS push notifications
• Twilio for SMS fallback
• Dead Letter Queue for failed deliveries after 3 retries`,
                algo: `• Quadtree: Spatial index for O(log N) nearest-neighbor driver search
• Priority Queue: Rank drivers by weighted score (distance + rating + acceptance)
• Fan-out: Single event triggers multiple consumers (driver + notification + analytics)
• Exponential Backoff: Retry notification delivery at 1s, 2s, 4s, 8s intervals`,
                dataFlow: 'Order 📦 →[EVENT: OrderConfirmed]→ Queue 📨 →[Fan-out]→ Delivery 🚴 (find driver) + Notification 🔔 (push to user & restaurant)'
            },
            {
                highlight: ['delivery', 'geo', 'user'],
                flowPath: ['delivery', 'geo', 'delivery', 'user'],
                flowColor: '#06b6d4',
                title: '7️⃣ Real-Time Delivery Tracking — WebSocket Live Updates',
                desc: `Once the driver picks up the order, real-time tracking begins:

DRIVER'S APP (every 3 seconds):
• Sends GPS coordinates to Delivery Service via WebSocket
• Delivery Service updates Redis GeoHash with new position
• Calculates ETA using Dijkstra's algorithm on road graph

USER'S APP (real-time):
• WebSocket connection receives driver's location updates
• Map renders driver's moving position with smooth interpolation
• ETA countdown updates in real-time
• Status bar: "Driver is 2.3km away • ETA: 8 minutes"

The connection flow:
User 📱 ←→ WebSocket Server ←→ Redis Pub/Sub ←→ Delivery Service ←→ Driver 📱

Redis Pub/Sub enables cross-server messaging: if the user and driver connect to different WebSocket servers, Pub/Sub relays messages between them.

📊 Scale:
• WebSocket: 10,000 concurrent connections per server
• Location updates: 3-second intervals (not 1s — battery optimization)
• Redis Pub/Sub: handles 100K+ messages/second
• Map rendering: requestAnimationFrame for smooth 60fps updates`,
                impl: `• Socket.io with Redis adapter for multi-server support
• Redis Pub/Sub for cross-server message relay
• Google Maps / Mapbox GL JS for map rendering
• GPS optimization: Kalman Filter to smooth noisy GPS readings`,
                algo: `• Dijkstra's Algorithm: Shortest path on road network graph for ETA
• Kalman Filter: Smooths GPS readings (removes jitter from tunnels/buildings)
• Linear Interpolation: Smooth map animation between 3-second GPS updates
• Connection Pooling: Reuse WebSocket connections, heartbeat every 30s`,
                dataFlow: 'Driver 📱 →[GPS every 3s]→ Delivery 🚴 →[Update]→ Redis/Geo 📍 →[Pub/Sub]→ WebSocket →[Real-time]→ User 📱 sees driver moving on map'
            },
            {
                highlight: ['user', 'db', 'redis', 'notify'],
                flowPath: ['notify', 'user', 'db', 'redis'],
                flowColor: '#10b981',
                title: '8️⃣ Order Delivered — Final Response & Data Persistence',
                desc: `When the driver marks "Delivered":

1. Delivery Service updates order status → DELIVERED
2. Database writes:
   • UPDATE orders SET status='DELIVERED', delivered_at=NOW()
   • INSERT into delivery_logs (route, time, distance, driver_rating)
   • UPDATE driver SET total_deliveries += 1, available = true

3. Cache updates:
   • Redis: increment restaurant's order_count (for trending ranking)
   • Redis: update driver's availability in GeoHash index
   • Invalidate cache for this order's status

4. Final notifications:
   • Push to user: "Order delivered! 🎉 Rate your experience"
   • Push to restaurant: "Order #1234 completed"

5. User sees:
   • Delivery confirmation screen
   • Rating prompt (1-5 stars for food + delivery)
   • Option to tip the driver

📊 Post-Delivery Analytics:
• Average delivery time tracked per restaurant per hour
• Driver performance metrics (on-time %, rating, acceptance rate)
• Revenue per order calculated and stored for dashboards`,
                impl: `• PostgreSQL: batch UPDATE with returning clause for efficiency
• Redis: ZADD for restaurant trending scores, DEL for order cache
• Analytics: events streamed to Kafka → consumed by analytics pipeline
• Rating: separate microservice with aggregation (rolling average)`,
                algo: `• Write-Behind Cache: Update Redis immediately, batch-write to DB every 5 seconds
• Moving Average: Restaurant rating = (old × count + new) / (count + 1)
• Cache Invalidation: Event-driven — OrderDelivered event triggers cache clear
• Data Retention: Archive orders > 90 days to cold storage (S3 + Athena)`,
                dataFlow: 'Driver marks delivered → DB 🗄️ (UPDATE status) + Redis ⚡ (invalidate cache + update rankings) + Notification 🔔 → User 📱 sees "Delivered! Rate us ⭐"'
            },
        ];
    }

    // ──────────────────────────────────────────────
    // E-COMMERCE
    // ──────────────────────────────────────────────
    _ecommerce() {
        const nodes = [
            this._node('user', 'User (Browser)', '🖥️', 50, 120, '#a855f7', 'Customer browsing the e-commerce website or mobile app'),
            this._node('cdn', 'CDN', '🌐', 50, 280, '#06b6d4', 'Serves product images, JS/CSS from 200+ edge locations'),
            this._node('lb', 'Load Balancer', '⚖️', 230, 120, '#f59e0b', 'Distributes traffic across API servers'),
            this._node('api', 'API Gateway', '🚪', 420, 120, '#10b981', 'Auth, rate limiting, routing'),
            this._node('auth', 'Auth Service', '🔒', 420, 10, '#ef4444', 'JWT, OAuth, sessions'),
            this._node('catalog', 'Product Catalog', '📋', 620, 10, '#8b5cf6', 'Product CRUD, categories, inventory'),
            this._node('search', 'Search Engine', '🔍', 820, 10, '#eab308', 'Elasticsearch — full-text search, filters, facets'),
            this._node('cart', 'Cart Service', '🛒', 620, 120, '#f97316', 'Shopping cart (Redis-backed), inventory reservation'),
            this._node('recommend', 'Recommender', '🤖', 820, 120, '#10b981', 'ML — collaborative filtering, "bought together"'),
            this._node('order', 'Order Service', '📦', 620, 230, '#3b82f6', 'Checkout, pricing, order management'),
            this._node('payment', 'Payment Svc', '💳', 820, 230, '#ec4899', 'Stripe, PayPal, UPI processing'),
            this._node('queue', 'Kafka', '📨', 620, 330, '#6366f1', 'Event streaming for async processing'),
            this._node('db', 'PostgreSQL', '🗄️', 420, 280, '#3b82f6', 'ACID transactions, orders, users'),
            this._node('redis', 'Redis Cache', '⚡', 230, 280, '#ef4444', 'Session, cart, product cache'),
        ];
        const connections = [
            this._conn('user', 'cdn', 'Images', 'request'), this._conn('user', 'lb', 'HTTPS', 'request'),
            this._conn('lb', 'api', 'Route', 'request'), this._conn('api', 'auth', 'JWT', 'request'),
            this._conn('auth', 'api', 'Valid ✓', 'response'), this._conn('api', 'redis', 'Cache', 'cache'),
            this._conn('api', 'catalog', 'Products', 'request'), this._conn('catalog', 'search', 'Index', 'data'),
            this._conn('catalog', 'db', 'Read', 'data'), this._conn('api', 'cart', 'Cart ops', 'request'),
            this._conn('cart', 'redis', 'Store cart', 'cache'), this._conn('cart', 'recommend', 'Suggest', 'request'),
            this._conn('api', 'order', 'Checkout', 'request'), this._conn('order', 'payment', 'Charge', 'request'),
            this._conn('payment', 'order', 'OK ✓', 'response'), this._conn('order', 'db', 'Write', 'data'),
            this._conn('order', 'queue', 'Events', 'async'),
        ];
        return {
            title: '🛒 E-Commerce Marketplace', subtitle: 'Like Amazon / Flipkart / Shopify',
            nodes, connections,
            steps: [
                { highlight: ['user', 'cdn', 'lb', 'api'], flowPath: ['user', 'lb', 'api'], flowColor: '#f59e0b', title: '1️⃣ User Visits Store — Page Load & CDN', desc: 'User opens the storefront. CDN serves static assets from edge. Load Balancer routes API calls. API Gateway authenticates via JWT.\n\n📊 Target: First Contentful Paint < 1.5s, Time to Interactive < 3s', impl: 'Next.js with ISR, CloudFront CDN, image optimization (WebP/AVIF)', algo: 'Edge caching (TTL), code splitting, prefetch on hover', dataFlow: 'User 🖥️ → CDN 🌐 (static) + LB ⚖️ → API 🚪 (dynamic data)' },
                { highlight: ['api', 'catalog', 'search', 'redis'], flowPath: ['api', 'redis', 'api', 'catalog', 'search'], flowColor: '#eab308', title: '2️⃣ Product Search & Discovery', desc: 'User searches "wireless headphones". API checks Redis cache first. On miss, queries Elasticsearch with fuzzy matching, filters (price, brand, rating), and BM25 relevance scoring.\n\nElasticsearch processes:\n1. Tokenize query → ["wireless", "headphones"]\n2. Fuzzy match (handles typos: "headpones" → "headphones")\n3. Apply filters (price: ₹500-₹5000, rating: 4+)\n4. Score results by BM25 (term frequency × inverse doc frequency)\n5. Return top 20 results sorted by relevance', impl: 'Elasticsearch with custom analyzers, Redis for autocomplete (Trie data structure)', algo: 'BM25 scoring, Inverted Index, Trie for autocomplete, Fuzzy matching (Levenshtein distance ≤ 2)', dataFlow: 'API 🚪 →[Check]→ Redis ⚡ →[MISS]→ Catalog 📋 →[Query]→ Search 🔍 →[BM25 scored results]→ User sees product grid' },
                { highlight: ['cart', 'redis', 'recommend'], flowPath: ['api', 'cart', 'redis', 'cart', 'recommend'], flowColor: '#f97316', title: '3️⃣ Shopping Cart & Recommendations', desc: 'User adds items to cart. Cart stored in Redis Hash (fast, persists across sessions). Inventory is soft-reserved (10-min TTL lock).\n\nRecommendation engine uses Collaborative Filtering:\n• User-User: "Users similar to you also bought X"\n• Item-Item: "Frequently bought together: case + screen guard"\n• Matrix Factorization: Decomposes user-item matrix for latent features', impl: 'Redis Hash for cart, TensorFlow for ML recommendations, A/B testing for recommendation quality', algo: 'Collaborative Filtering, Matrix Factorization (SVD), Optimistic Concurrency Control for inventory', dataFlow: 'User adds item → Cart 🛒 → Redis ⚡ (HSET cart:user123) + Recommender 🤖 (suggest related items)' },
                { highlight: ['order', 'payment', 'db', 'queue'], flowPath: ['api', 'order', 'payment', 'order', 'db', 'order', 'queue'], flowColor: '#3b82f6', title: '4️⃣ Checkout, Payment & Order Events', desc: 'Full checkout flow:\n1. Validate cart items still available\n2. Calculate: subtotal + tax + shipping\n3. Apply coupon codes (validate, deduct)\n4. Create PaymentIntent via Stripe\n5. Process payment (3D Secure if needed)\n6. On success: INSERT order into PostgreSQL (ACID)\n7. Publish OrderCreated event to Kafka\n\nKafka consumers handle:\n• Inventory deduction\n• Warehouse notification\n• Email confirmation\n• Analytics tracking', impl: 'Saga Pattern via Kafka, Stripe PaymentIntents, PostgreSQL SERIALIZABLE transactions', algo: 'Saga with compensating transactions, Event Sourcing, CQRS (separate read/write models)', dataFlow: 'Order 📦 →[Charge]→ Payment 💳 →[OK]→ DB 🗄️ (INSERT) →[EVENT]→ Kafka 📨 → Warehouse + Email + Analytics' },
            ],
            techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Kafka', 'Stripe', 'TensorFlow', 'Docker', 'K8s'],
            suggestions: [
                'Use CQRS: write to PostgreSQL, read from Elasticsearch for product queries',
                'Implement inventory reservation with 10-min TTL to prevent overselling',
                'A/B test recommendation algorithms — collaborative vs content-based',
                'Shard database by seller_id for multi-tenant scaling',
                'Use Redis Streams for real-time order status tracking',
            ]
        };
    }

    // ──────────────────────────────────────────────
    // CHAT APP
    // ──────────────────────────────────────────────
    _chatApp() {
        const nodes = [
            this._node('user', 'Sender', '📱', 50, 120, '#a855f7', 'User sending a message'),
            this._node('receiver', 'Receiver', '📱', 50, 280, '#a855f7', 'User receiving the message'),
            this._node('ws', 'WebSocket Srv', '🔌', 230, 120, '#10b981', 'Persistent bidirectional connection'),
            this._node('lb', 'Load Balancer', '⚖️', 230, 10, '#f59e0b', 'Sticky sessions for WS affinity'),
            this._node('msg', 'Message Svc', '💬', 420, 120, '#3b82f6', 'Message processing and routing'),
            this._node('presence', 'Presence Svc', '🟢', 420, 280, '#10b981', 'Online/offline/typing status'),
            this._node('pubsub', 'Redis Pub/Sub', '📡', 620, 120, '#ef4444', 'Cross-server message relay'),
            this._node('media', 'Media Svc', '🖼️', 620, 10, '#f97316', 'Image/video upload & processing'),
            this._node('db', 'MongoDB', '🗄️', 820, 40, '#10b981', 'Message persistence, sharded by conversation'),
            this._node('s3', 'Object Store', '📁', 820, 140, '#f59e0b', 'Media file storage'),
            this._node('queue', 'Kafka', '📨', 620, 280, '#6366f1', 'Offline push notification queue'),
            this._node('notify', 'Push Svc', '🔔', 820, 280, '#eab308', 'FCM/APNs push notifications'),
        ];
        const connections = [
            this._conn('user', 'ws', 'WS connect', 'request'), this._conn('ws', 'msg', 'Relay msg', 'request'),
            this._conn('msg', 'pubsub', 'Publish', 'data'), this._conn('pubsub', 'ws', 'Deliver', 'response'),
            this._conn('ws', 'receiver', 'WS push', 'response'), this._conn('msg', 'db', 'Persist', 'data'),
            this._conn('msg', 'media', 'Attachments', 'request'), this._conn('media', 's3', 'Store file', 'data'),
            this._conn('msg', 'presence', 'Check online', 'request'), this._conn('presence', 'queue', 'Offline?', 'async'),
            this._conn('queue', 'notify', 'Push notif', 'async'), this._conn('user', 'lb', 'HTTPS', 'request'),
        ];
        return {
            title: '💬 Real-Time Chat Platform', subtitle: 'Like WhatsApp / Telegram / Slack',
            nodes, connections,
            steps: [
                { highlight: ['user', 'ws', 'lb'], flowPath: ['user', 'lb', 'user', 'ws'], flowColor: '#10b981', title: '1️⃣ WebSocket Connection Established', desc: 'User opens the chat app. A persistent WebSocket connection is established through the Load Balancer (sticky sessions ensure the same server handles all user messages).\n\nConnection lifecycle:\n1. HTTP Upgrade request (101 Switching Protocols)\n2. WebSocket handshake with JWT authentication\n3. Heartbeat ping/pong every 30 seconds\n4. On disconnect: exponential backoff reconnect (1s, 2s, 4s, 8s)\n\nEach WS server handles ~10,000 concurrent connections.', impl: 'Socket.io with Redis adapter, Nginx sticky sessions (ip_hash), connection pooling', algo: 'Consistent Hashing for server affinity, Exponential Backoff for reconnection, Heartbeat protocol (30s)', dataFlow: 'User 📱 →[HTTP Upgrade]→ LB ⚖️ →[Sticky]→ WebSocket 🔌 (persistent bidirectional connection)' },
                { highlight: ['user', 'ws', 'msg', 'db'], flowPath: ['user', 'ws', 'msg', 'db'], flowColor: '#3b82f6', title: '2️⃣ Message Sent — Processing & Storage', desc: 'User types and sends a message. Here\'s the pipeline:\n\n1. Client generates a local message ID (UUID v4)\n2. Message sent via WebSocket to Message Service\n3. Server generates Snowflake ID (time-sortable, globally unique)\n4. Message stored in MongoDB (sharded by conversation_id)\n5. Client receives "sent ✓" acknowledgment\n\nSnowflake ID structure (64 bits):\n• Timestamp (41 bits) — millisecond precision\n• Machine ID (10 bits) — which server generated it\n• Sequence (12 bits) — counter for same-millisecond messages\n\nThis ensures messages are always time-ordered across all servers.', impl: 'MongoDB with sharding on conversation_id, Snowflake ID generator, Write Concern: majority', algo: 'Snowflake ID for globally unique time-sortable IDs, Write-Ahead Log in MongoDB, Sharding by conversation_id', dataFlow: 'User 📱 →[WS message]→ WebSocket 🔌 →[Process]→ Message 💬 →[Snowflake ID + INSERT]→ MongoDB 🗄️ →[ACK "sent ✓"]→ User' },
                { highlight: ['msg', 'pubsub', 'ws', 'receiver', 'presence'], flowPath: ['msg', 'presence', 'msg', 'pubsub', 'ws', 'receiver'], flowColor: '#ef4444', title: '3️⃣ Message Delivery — Pub/Sub Fan-out', desc: 'After storing, the message needs to reach the recipient:\n\n1. Message Service checks Presence Service: is recipient online?\n2. If ONLINE: publish to Redis Pub/Sub channel "user:{recipient_id}"\n3. All WebSocket servers subscribe to Pub/Sub channels\n4. The WS server holding recipient\'s connection receives the message\n5. Delivers to recipient\'s app via WebSocket\n6. Recipient\'s app sends "delivered ✓✓" acknowledgment\n\nRed Pub/Sub handles cross-server routing:\n• User A connected to Server 1\n• User B connected to Server 3\n• Pub/Sub relays message from Server 1 → Server 3', impl: 'Redis Pub/Sub with channels per user, Socket.io rooms for group chats', algo: 'Fan-out on Write, Redis Pub/Sub O(N) delivery to N subscribers, Read Receipt protocol (sent→delivered→read)', dataFlow: 'Message 💬 →[Check]→ Presence 🟢 (online!) →[PUBLISH]→ Redis 📡 →[Subscribe]→ WS 🔌 →[Push]→ Receiver 📱 →[ACK "delivered ✓✓"]' },
                { highlight: ['msg', 'presence', 'queue', 'notify'], flowPath: ['msg', 'presence', 'queue', 'notify'], flowColor: '#6366f1', title: '4️⃣ Offline Delivery — Push Notifications', desc: 'If the recipient is OFFLINE:\n\n1. Presence Service reports user offline (last seen: 2 hours ago)\n2. Message queued in Kafka for guaranteed delivery\n3. Push Notification Service sends via:\n   • FCM (Android) — Firebase Cloud Messaging\n   • APNs (iOS) — Apple Push Notification Service\n4. Notification shows: "Rishi: Hey, are you free tonight?"\n5. When recipient opens app → WebSocket reconnects → fetch all missed messages since last_seen_timestamp\n\nOffline message sync uses cursor-based pagination:\n• Client sends: GET /messages?since=1709825400\n• Server returns all messages after that timestamp', impl: 'Kafka for reliable message queuing, FCM + APNs for push, cursor-based sync on reconnect', algo: 'Exactly-once delivery via Kafka consumer offsets, Cursor pagination for offline sync, Token Bucket for push rate limiting', dataFlow: 'Message 💬 →[Check]→ Presence 🟢 (OFFLINE) →[Queue]→ Kafka 📨 →[Push]→ Notify 🔔 →[FCM/APNs]→ Receiver 📱 (notification banner)' },
            ],
            techStack: ['React Native', 'Node.js', 'MongoDB', 'Redis', 'Kafka', 'Socket.io', 'S3', 'Firebase FCM', 'Docker'],
            suggestions: [
                'Use Signal Protocol for end-to-end encryption',
                'Shard MongoDB by conversation_id for linear scaling',
                'Implement message queuing for guaranteed offline delivery',
                'Use Redis Cluster for Pub/Sub across multiple servers',
                'Add 3-state read receipts: sent ✓ → delivered ✓✓ → read (blue ✓✓)',
            ]
        };
    }

    _socialMedia() { const d = this._ecommerce(); d.title = '📸 Social Media Platform'; d.subtitle = 'Like Instagram / Twitter'; return d; }
    _rideShare() { const d = this._foodDelivery(); d.title = '🚗 Ride-Sharing Platform'; d.subtitle = 'Like Uber / Ola / Lyft'; return d; }
    _videoStream() { const d = this._ecommerce(); d.title = '🎬 Video Streaming Platform'; d.subtitle = 'Like Netflix / YouTube'; return d; }
    _generic(raw) {
        const d = this._ecommerce();
        const name = raw.replace(/^(i want to |design |build |create |make |develop )/i, '').replace(/ (app|application|system|platform|website|service)$/i, '').trim();
        d.title = `🏗️ ${name.charAt(0).toUpperCase() + name.slice(1)} Platform`;
        d.subtitle = 'Custom Architecture';
        return d;
    }

    // ──────────────────────────────────────────────
    // RENDERING
    // ──────────────────────────────────────────────
    _render(design) {
        this.container.innerHTML = '';
        this.container.style.display = 'block';
        this.stop();

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'sdv-back-btn';
        backBtn.textContent = '← Back to Topics';
        backBtn.onclick = () => { this.container.style.display = 'none'; this.stop(); };
        this.container.appendChild(backBtn);

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

        // Data Flow Indicator
        const flowBar = document.createElement('div');
        flowBar.className = 'sdv-flow-bar';
        flowBar.id = 'sdv-flow-bar';
        this.container.appendChild(flowBar);

        // Controls
        const controls = document.createElement('div');
        controls.className = 'sdv-controls';
        controls.innerHTML = `
            <button class="sdv-btn" id="sdv-prev">⏮ Prev</button>
            <button class="sdv-btn sdv-play" id="sdv-play">▶ Play Walkthrough</button>
            <button class="sdv-btn" id="sdv-next">Next ⏭</button>
            <span class="sdv-step-count" id="sdv-step-count">Step 1 / ${design.steps.length}</span>
        `;
        this.container.appendChild(controls);

        // Step Panel
        const panel = document.createElement('div');
        panel.className = 'sdv-step-panel';
        panel.id = 'sdv-step-panel';
        this.container.appendChild(panel);

        // Tech Stack + Suggestions
        const footer = document.createElement('div');
        footer.className = 'sdv-section';
        footer.innerHTML = `
            <h3>🛠️ Recommended Tech Stack</h3>
            <div class="sdv-tags">${design.techStack.map(t => `<span class="sdv-tag">${t}</span>`).join('')}</div>
            <h3>💡 Architecture Suggestions</h3>
            <ul class="sdv-suggestions">${design.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        this.container.appendChild(footer);

        // Wire
        this.container.querySelector('#sdv-prev').onclick = () => this.prevStep();
        this.container.querySelector('#sdv-next').onclick = () => this.nextStep();
        this.container.querySelector('#sdv-play').onclick = () => this.togglePlay();

        this._svgEl = svg;
        this._design = design;
        this._nodeMap = {};
        design.nodes.forEach(n => { this._nodeMap[n.id] = n; });
    }

    _buildSVG(nodes, connections) {
        const W = 960, H = 380;
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('width', '100%');
        svg.style.maxHeight = '400px';

        // Defs
        const defs = document.createElementNS(ns, 'defs');
        defs.innerHTML = `
            <marker id="sdv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/></marker>
            <filter id="sdv-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        `;
        svg.appendChild(defs);

        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n; });

        // Connection lines
        connections.forEach(c => {
            const from = nodeMap[c.from], to = nodeMap[c.to];
            if (!from || !to) return;
            const nw = 120, nh = 46;
            const x1 = from.x + nw / 2, y1 = from.y + nh / 2;
            const x2 = to.x + nw / 2, y2 = to.y + nh / 2;

            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', x1); line.setAttribute('y1', y1);
            line.setAttribute('x2', x2); line.setAttribute('y2', y2);
            const colors = { request: '#888', response: '#4ade80', cache: '#fbbf24', data: '#60a5fa', async: '#a78bfa' };
            line.setAttribute('stroke', colors[c.type] || '#555');
            line.setAttribute('stroke-width', '1.2');
            line.setAttribute('marker-end', 'url(#sdv-arrow)');
            line.setAttribute('data-from', c.from);
            line.setAttribute('data-to', c.to);
            line.classList.add('sdv-line');
            if (c.type === 'async') line.setAttribute('stroke-dasharray', '5,3');
            svg.appendChild(line);

            // Small label
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 4;
            const label = document.createElementNS(ns, 'text');
            label.setAttribute('x', mx); label.setAttribute('y', my);
            label.setAttribute('fill', '#777'); label.setAttribute('font-size', '7');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = c.label;
            svg.appendChild(label);
        });

        // Nodes
        nodes.forEach(n => {
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('data-node-id', n.id);
            g.classList.add('sdv-node');

            const rect = document.createElementNS(ns, 'rect');
            rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
            rect.setAttribute('width', 120); rect.setAttribute('height', 46);
            rect.setAttribute('rx', 10);
            rect.setAttribute('fill', n.color + '15');
            rect.setAttribute('stroke', n.color);
            rect.setAttribute('stroke-width', '1.5');
            g.appendChild(rect);

            const icon = document.createElementNS(ns, 'text');
            icon.setAttribute('x', n.x + 8); icon.setAttribute('y', n.y + 20);
            icon.setAttribute('font-size', '13');
            icon.textContent = n.icon;
            g.appendChild(icon);

            const text = document.createElementNS(ns, 'text');
            text.setAttribute('x', n.x + 26); text.setAttribute('y', n.y + 19);
            text.setAttribute('fill', '#e0e0e0'); text.setAttribute('font-size', '9');
            text.setAttribute('font-weight', '700');
            text.textContent = n.label.length > 15 ? n.label.slice(0, 14) + '…' : n.label;
            g.appendChild(text);

            const sub = document.createElementNS(ns, 'text');
            sub.setAttribute('x', n.x + 60); sub.setAttribute('y', n.y + 36);
            sub.setAttribute('fill', '#888'); sub.setAttribute('font-size', '6.5');
            sub.setAttribute('text-anchor', 'middle');
            sub.textContent = n.desc.slice(0, 25) + (n.desc.length > 25 ? '…' : '');
            g.appendChild(sub);

            // Particle container (circle for animation)
            const particle = document.createElementNS(ns, 'circle');
            particle.setAttribute('cx', n.x + 60); particle.setAttribute('cy', n.y + 23);
            particle.setAttribute('r', 0);
            particle.setAttribute('fill', n.color);
            particle.classList.add('sdv-particle');
            particle.setAttribute('data-node-id', n.id);
            g.appendChild(particle);

            svg.appendChild(g);
        });

        return svg;
    }

    // ──────────────────────────────────────────────
    // STEP HIGHLIGHTING + ANIMATION
    // ──────────────────────────────────────────────
    _highlightStep(idx) {
        if (!this._design || idx < 0 || idx >= this.steps.length) return;
        this.currentStep = idx;
        const step = this.steps[idx];

        // Reset nodes
        this._svgEl.querySelectorAll('.sdv-node').forEach(n => { n.style.opacity = '0.2'; });
        this._svgEl.querySelectorAll('.sdv-node rect').forEach(r => { r.style.filter = ''; r.style.strokeWidth = '1.5'; });
        this._svgEl.querySelectorAll('.sdv-line').forEach(l => { l.style.opacity = '0.1'; l.style.strokeWidth = '1.2'; });

        // Highlight active
        step.highlight.forEach(id => {
            const g = this._svgEl.querySelector(`[data-node-id="${id}"]`);
            if (g) {
                g.style.opacity = '1';
                const r = g.querySelector('rect');
                if (r) { r.style.filter = 'url(#sdv-glow)'; r.style.strokeWidth = '2.5'; }
            }
        });

        // Highlight connections
        this._svgEl.querySelectorAll('.sdv-line').forEach(l => {
            const from = l.getAttribute('data-from'), to = l.getAttribute('data-to');
            if (step.highlight.includes(from) && step.highlight.includes(to)) {
                l.style.opacity = '1'; l.style.strokeWidth = '2'; l.style.stroke = step.flowColor || '#a855f7';
            }
        });

        // Animate particles along flowPath
        this._animateFlow(step.flowPath, step.flowColor);

        // Update flow bar
        const flowBar = this.container.querySelector('#sdv-flow-bar');
        if (flowBar && step.dataFlow) {
            flowBar.innerHTML = `<span class="sdv-flow-label">📡 Data Flow:</span> <span class="sdv-flow-text">${step.dataFlow}</span>`;
        }

        // Update step panel
        const panel = this.container.querySelector('#sdv-step-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="sdv-step-title">${step.title}</div>
                <div class="sdv-step-desc">${step.desc.replace(/\n/g, '<br>')}</div>
                <div class="sdv-step-meta">
                    <div class="sdv-meta-item"><strong>🛠️ Implementation Details:</strong><br>${step.impl.replace(/\n/g, '<br>')}</div>
                    <div class="sdv-meta-item"><strong>🧮 Algorithms & Data Structures:</strong><br>${step.algo.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            panel.scrollTop = 0;
        }

        // Update counter
        const counter = this.container.querySelector('#sdv-step-count');
        if (counter) counter.textContent = `Step ${idx + 1} / ${this.steps.length}`;
    }

    _animateFlow(flowPath, color) {
        // Cancel previous animation
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        // Remove old particles
        this._svgEl.querySelectorAll('.sdv-flow-dot').forEach(d => d.remove());

        if (!flowPath || flowPath.length < 2) return;

        const ns = 'http://www.w3.org/2000/svg';
        const nw = 120, nh = 46;
        const segments = [];
        for (let i = 0; i < flowPath.length - 1; i++) {
            const from = this._nodeMap[flowPath[i]], to = this._nodeMap[flowPath[i + 1]];
            if (from && to) segments.push({ x1: from.x + nw / 2, y1: from.y + nh / 2, x2: to.x + nw / 2, y2: to.y + nh / 2 });
        }

        const dots = [];
        // Create 3 dots staggered
        for (let d = 0; d < 3; d++) {
            const circle = document.createElementNS(ns, 'circle');
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', color || '#a855f7');
            circle.setAttribute('opacity', '0.9');
            circle.classList.add('sdv-flow-dot');
            this._svgEl.appendChild(circle);
            dots.push({ el: circle, offset: d * 0.2 });
        }

        let t = 0;
        const totalSegments = segments.length;
        const animate = () => {
            t += 0.004;
            if (t > 1.6) t = 0; // loop

            dots.forEach(dot => {
                const progress = ((t + dot.offset) % 1.2);
                if (progress > 1) { dot.el.setAttribute('opacity', '0'); return; }
                dot.el.setAttribute('opacity', '0.85');
                const segIdx = Math.floor(progress * totalSegments);
                const segProgress = (progress * totalSegments) - segIdx;
                if (segIdx >= totalSegments) return;
                const s = segments[segIdx];
                const x = s.x1 + (s.x2 - s.x1) * segProgress;
                const y = s.y1 + (s.y2 - s.y1) * segProgress;
                dot.el.setAttribute('cx', x);
                dot.el.setAttribute('cy', y);
            });

            this.animFrameId = requestAnimationFrame(animate);
        };
        this.animFrameId = requestAnimationFrame(animate);
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) this._highlightStep(this.currentStep + 1);
        else { this.stop(); this._highlightStep(0); }
    }
    prevStep() { if (this.currentStep > 0) this._highlightStep(this.currentStep - 1); }
    togglePlay() { this.isPlaying ? this.stop() : this.play(); }

    play() {
        this.isPlaying = true;
        const btn = this.container.querySelector('#sdv-play');
        if (btn) btn.textContent = '⏸ Pause';
        this.playInterval = setInterval(() => this.nextStep(), 6000);
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.playInterval);
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        const btn = this.container.querySelector('#sdv-play');
        if (btn) btn.textContent = '▶ Play Walkthrough';
    }

    destroy() { this.stop(); if (this.container) this.container.innerHTML = ''; }
}
