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
                { highlight: ['client'], title: '1. User Opens App', desc: 'Customer opens the mobile app or website. Static assets (images, JS, CSS) are served via CDN for fast loading. The app shows nearby restaurants based on the user\'s GPS location.', impl: 'React Native / Flutter for mobile, Next.js for web. Use Cloudflare CDN.', algo: 'Geohash algorithm to find nearby restaurants within radius.' },
                { highlight: ['client', 'lb', 'api'], title: '2. API Request Flow', desc: 'User requests hit the Load Balancer which distributes traffic across multiple API Gateway instances using Round Robin. The gateway handles rate limiting, request validation, and routing.', impl: 'Nginx/HAProxy for LB, Express.js or FastAPI for API Gateway.', algo: 'Token Bucket for rate limiting, Consistent Hashing for server selection.' },
                { highlight: ['api', 'auth'], title: '3. Authentication', desc: 'Every request is authenticated via JWT tokens. The Auth Service validates tokens, manages user sessions, and handles OAuth (Google/Phone login).', impl: 'JWT + bcrypt for passwords, OAuth 2.0, Redis for session store.', algo: 'HMAC-SHA256 for JWT signing, bcrypt (salt rounds=12) for password hashing.' },
                { highlight: ['api', 'restaurant', 'geo'], title: '4. Restaurant Discovery', desc: 'Restaurant Service returns menus and listings. Geo Service uses GeoHash to find restaurants within delivery radius, ranked by rating, distance, and delivery time.', impl: 'PostgreSQL + PostGIS for geo queries, Elasticsearch for search.', algo: 'GeoHash + R-Tree for spatial indexing, TF-IDF for menu search.' },
                { highlight: ['order', 'payment'], title: '5. Order & Payment', desc: 'Order Service creates order, calculates pricing (items + taxes + delivery fee), then Payment Service processes the charge via Stripe/Razorpay. Idempotency keys prevent double charges.', impl: 'Saga Pattern for distributed transactions, Stripe SDK.', algo: 'Saga Pattern with compensating transactions, Idempotency via UUID keys.' },
                { highlight: ['delivery', 'geo', 'queue'], title: '6. Real-Time Delivery Tracking', desc: 'Delivery Service assigns nearest available driver using Quadtree spatial indexing. Driver location updates stream via WebSocket every 3 seconds. Message Queue handles async events.', impl: 'Socket.io for WebSocket, RabbitMQ for events, Redis GeoHash.', algo: 'Quadtree for nearest driver, Dijkstra/A* for route optimization.' },
                { highlight: ['notify', 'queue'], title: '7. Notifications', desc: 'Notification Service sends push notifications (order confirmed, driver assigned, delivered) via Firebase Cloud Messaging. The Message Queue ensures reliable delivery with retries.', impl: 'Firebase FCM, RabbitMQ with dead-letter queues for retries.', algo: 'Exponential backoff for retry logic, Fan-out for broadcast.' },
                { highlight: ['db', 'redis'], title: '8. Data Layer', desc: 'PostgreSQL stores orders, users, restaurants with ACID transactions. Redis caches hot data (popular menus, user sessions) reducing DB load by 80%. Read replicas handle read-heavy traffic.', impl: 'PostgreSQL + Read Replicas, Redis Cluster, database sharding by city.', algo: 'LRU eviction for cache, Consistent Hashing for sharding.' },
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
                { highlight: ['client', 'cdn'], title: '1. Storefront Loading', desc: 'User visits the storefront. CDN serves static assets (product images, JS bundles) from edge locations for <100ms load times globally.', impl: 'Next.js with ISR, CloudFront CDN, image optimization with Sharp.', algo: 'Edge caching with TTL-based invalidation.' },
                { highlight: ['catalog', 'search'], title: '2. Product Search & Discovery', desc: 'Elasticsearch powers full-text search with typo tolerance, faceted filtering (price, brand, rating), and real-time indexing. Products are ranked by relevance + popularity.', impl: 'Elasticsearch with custom analyzers, Redis for autocomplete.', algo: 'BM25 for relevance ranking, Inverted Index for full-text search.' },
                { highlight: ['recommend'], title: '3. Personalized Recommendations', desc: 'ML-powered recommendation engine suggests products based on browsing history, purchase patterns, and similar user behavior. "Customers who bought X also bought Y".', impl: 'Collaborative Filtering model, TensorFlow Serving for inference.', algo: 'Collaborative Filtering (User-User & Item-Item), Matrix Factorization.' },
                { highlight: ['cart', 'redis'], title: '4. Shopping Cart', desc: 'Cart Service stores items in Redis for fast access. Cart persists across sessions. Inventory locks are placed when items are added to prevent overselling.', impl: 'Redis Hash for cart data, optimistic locking for inventory.', algo: 'Optimistic Concurrency Control, TTL-based cart expiry.' },
                { highlight: ['order', 'payment'], title: '5. Checkout & Payment', desc: 'Order Service orchestrates checkout: validates inventory, calculates taxes/shipping, processes payment via Stripe. Saga Pattern ensures distributed transaction consistency.', impl: 'Saga Pattern with Kafka events, Stripe API, idempotency keys.', algo: 'Saga with compensating transactions, Idempotency via UUID.' },
                { highlight: ['queue', 'order'], title: '6. Order Processing Pipeline', desc: 'Kafka streams order events to downstream services: inventory update, warehouse notification, shipping label generation, email confirmation. Each step is independently scalable.', impl: 'Apache Kafka with consumer groups, exactly-once semantics.', algo: 'Event Sourcing, CQRS pattern for read/write separation.' },
                { highlight: ['db', 'redis'], title: '7. Data Architecture', desc: 'PostgreSQL for transactional data (orders, users). Redis for caching (product pages, sessions). Database sharding by seller_id for horizontal scaling. Read replicas for catalog queries.', impl: 'PostgreSQL + Citus for sharding, Redis Cluster, connection pooling.', algo: 'Consistent Hashing for sharding, LRU for cache eviction.' },
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
                { highlight: ['client', 'ws'], title: '1. WebSocket Connection', desc: 'Client establishes persistent WebSocket connection. Connection is kept alive with heartbeats every 30s. On reconnect, client syncs missed messages using last-seen timestamp.', impl: 'Socket.io with sticky sessions, connection pooling per server.', algo: 'Long polling fallback, exponential backoff for reconnection.' },
                { highlight: ['auth', 'lb'], title: '2. Authentication & Routing', desc: 'JWT token validates user identity. Load balancer routes to the correct WS server using consistent hashing on user_id, ensuring all messages for a user reach the same server.', impl: 'Nginx with ip_hash, JWT RS256 signing.', algo: 'Consistent Hashing for server affinity, HMAC for token verification.' },
                { highlight: ['msg', 'pubsub'], title: '3. Message Delivery', desc: 'Message Service receives the message, generates a Snowflake ID (time-sortable), stores it, then publishes to Redis Pub/Sub. All WS servers subscribed to that channel relay to connected recipients.', impl: 'Redis Pub/Sub for cross-server fanout, Snowflake ID generator.', algo: 'Snowflake ID (timestamp + machine + sequence), Fan-out on write.' },
                { highlight: ['presence'], title: '4. Online Presence', desc: 'Presence Service tracks online/offline/typing status using Redis with TTL keys. "Last seen" updates on disconnect. Typing indicators use short-lived Redis keys (3s TTL).', impl: 'Redis SET with EXPIRE, WebSocket events for typing.', algo: 'Heartbeat protocol (30s interval), TTL-based presence detection.' },
                { highlight: ['media', 's3'], title: '5. Media Sharing', desc: 'Images/videos are uploaded to Object Storage (S3). Thumbnails are generated server-side. Media URLs are embedded in messages. CDN serves media for fast delivery.', impl: 'AWS S3 + CloudFront, Sharp for image processing, FFmpeg for video.', algo: 'Chunked upload with resumable protocol, progressive image loading.' },
                { highlight: ['db', 'queue'], title: '6. Message Persistence', desc: 'MongoDB stores messages partitioned by conversation_id for fast retrieval. Kafka streams events for analytics, read receipts, and push notifications to offline users.', impl: 'MongoDB with sharding on conversation_id, Kafka consumer groups.', algo: 'Write-ahead logging, eventual consistency with vector clocks.' },
                { highlight: ['notify'], title: '7. Push Notifications', desc: 'When recipient is offline, Kafka triggers Push Notification Service which sends via FCM (Android) / APNs (iOS). Notifications are batched and rate-limited to prevent spam.', impl: 'Firebase FCM, Apple APNs, notification batching (5s window).', algo: 'Token Bucket for rate limiting, exponential backoff for retries.' },
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
                { highlight: ['client', 'cdn'], title: '1. Content Loading', desc: 'App loads with feed pre-cached. Images/videos served from CDN edges. Infinite scroll triggers paginated API calls. Skeleton loading for smooth UX.', impl: 'Next.js + React Query, CloudFront CDN, WebP image format.', algo: 'Cursor-based pagination, lazy loading with Intersection Observer.' },
                { highlight: ['post', 'media', 's3'], title: '2. Creating Posts', desc: 'User creates post with text + images/videos. Media is uploaded to S3 with automatic resizing (thumbnail, medium, full). Post metadata stored in PostgreSQL.', impl: 'Multer for uploads, Sharp for image processing, S3 pre-signed URLs.', algo: 'Content-addressable storage (hash-based dedup), progressive upload.' },
                { highlight: ['feed', 'cache'], title: '3. News Feed Generation', desc: 'Feed Service pre-computes feeds using Fan-out on Write: when a user posts, the post ID is pushed to all followers\' feed caches in Redis. Celebrity posts use Fan-out on Read to avoid write amplification.', impl: 'Redis Sorted Sets (score=timestamp), hybrid fanout strategy.', algo: 'Fan-out on Write (normal users), Fan-out on Read (celebrities 10K+ followers).' },
                { highlight: ['social'], title: '4. Social Graph', desc: 'Follow/unfollow relationships stored in a graph structure. Neo4j or PostgreSQL adjacency list. "People you may know" uses mutual friend counting and interest similarity.', impl: 'PostgreSQL for follows, Neo4j for recommendations.', algo: 'BFS for mutual friends, Jaccard Similarity for suggestions.' },
                { highlight: ['search'], title: '5. Search & Discovery', desc: 'Elasticsearch indexes users, posts, and hashtags. Trending topics computed from hashtag frequency over sliding windows. Explore page uses collaborative filtering.', impl: 'Elasticsearch, Redis for trending counters, ML for Explore.', algo: 'Inverted Index, Sliding Window for trends, EdgeRank for feed scoring.' },
                { highlight: ['notify'], title: '6. Notifications', desc: 'Real-time notifications for likes, comments, follows via WebSocket. Batched push notifications for offline users. Notification deduplication prevents spam.', impl: 'Socket.io, Firebase FCM, Redis for dedup with TTL.', algo: 'Event aggregation (3 people liked your post), rate limiting.' },
                { highlight: ['db', 'cache'], title: '7. Data & Scaling', desc: 'PostgreSQL sharded by user_id. Redis caches feed timelines, session data, and hot posts. Database read replicas handle the 100:1 read/write ratio typical of social platforms.', impl: 'PostgreSQL + Citus, Redis Cluster, PgBouncer for connection pooling.', algo: 'Consistent Hashing for sharding, LRU eviction, Write-behind caching.' },
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

        // Update panel
        const panel = this.container.querySelector('#sdv-step-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="sdv-step-title">${step.title}</div>
                <div class="sdv-step-desc">${step.desc}</div>
                <div class="sdv-step-meta">
                    <div class="sdv-meta-item"><strong>🛠️ Implementation:</strong> ${step.impl}</div>
                    <div class="sdv-meta-item"><strong>🧮 Algorithm:</strong> ${step.algo}</div>
                </div>
            `;
            panel.style.animation = 'none';
            panel.offsetHeight; // trigger reflow
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
