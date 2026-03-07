/**
 * Comprehensive System Design Guide
 * Deep-dive explanations for every aspect of system design
 */

export const COMPREHENSIVE_GUIDE = {
    sections: [
        {
            id: 'request-lifecycle',
            title: '🔄 Complete Request Lifecycle',
            description: 'From user action to response displayed on screen - every millisecond counts',
            subsections: [
                {
                    title: '1. CLIENT REQUEST INITIATION (0-50ms)',
                    content: `
## User Action → Network Request

### What Happens:
1. User clicks "Search" button or submits form
2. JavaScript event handler captures the action
3. Application validates client-side (fast feedback to user)
4. Request payload constructed:
   \`\`\`json
   {
     "method": "GET",
     "url": "https://api.example.com/restaurants?lat=12.97&lng=77.59",
     "headers": {
       "Authorization": "Bearer eyJhbGc...",
       "Content-Type": "application/json",
       "X-Request-ID": "550e8400-e29b-41d4-a716-446655440000"
     }
   }
   \`\`\`
5. Browser establishes HTTPS connection (if new):
   - DNS lookup: 50-100ms (or cached: <1ms)
   - TCP handshake: 50-150ms
   - TLS handshake: 50-200ms
   - Total: ~300ms for new connection

### Performance Tips:
- Use HTTP/2 multiplexing to reuse connections
- Enable DNS prefetching: \`<link rel="dns-prefetch" href="//api.example.com">\`
- Use connection keep-alive to avoid repeated handshakes
- Implement request batching to reduce number of requests
                    `
                },
                {
                    title: '2. LOAD BALANCER ROUTING (5-10ms)',
                    content: `
## Traffic Distributed Across Servers

### How Load Balancers Work:

**Layer 7 (Application) Load Balancing:**
- Examines HTTP headers, URLs, cookies
- Route by path: /restaurants → Server A, /users → Server B
- Route by hostname: api.v1.example.com → Cluster 1, api.v2.example.com → Cluster 2

**Layer 4 (Transport) Load Balancing:**
- Distributes TCP/UDP connections
- Fastest but less intelligent
- Used for extreme scale

### Algorithms:
1. **Round Robin**
   - Send to servers in rotation: Server 1, 2, 3, 1, 2, 3...
   - Fair but ignores server load

2. **Least Connections**
   - Send to server with fewest active connections
   - Better for long-lived connections

3. **IP Hash / Session Affinity**
   - Hash client IP to same server
   - Ensures same user always hits same server
   - Benefits: Local cache hit rate increases

4. **Weighted Round Robin**
   - Give more traffic to powerful servers
   - Server A (8-core): 50%, Server B (4-core): 25%, Server C (4-core): 25%

### Example:
\`\`\`javascript
// Load balancer receives request
const healthyServers = [
  { ip: '10.0.1.1', connections: 150 },
  { ip: '10.0.1.2', connections: 120 }, // ← Chosen (least connections)
  { ip: '10.0.1.3', connections: 180 }
];

const chosen = healthyServers.reduce((prev, curr) => 
  prev.connections < curr.connections ? prev : curr
);
// Forward to 10.0.1.2
\`\`\`

### Health Checks:
- LB pings each server every 5-10 seconds
- Example: HEAD /health returns 200 OK
- Server is marked DOWN if 2-3 consecutive checks fail
- Requests stop going to DOWN servers immediately
                    `
                },
                {
                    title: '3. API GATEWAY VALIDATION (10-20ms)',
                    content: `
## Central Request Processing

### Responsibilities:

**1. Rate Limiting**
- Implement Token Bucket Algorithm
- User quota: 1,000 requests/minute
- Check: Current tokens >= 1?
  - YES: Decrement token, allow request → continue
  - NO: Return 429 Too Many Requests → client backs off

\`\`\`javascript
class RateLimiter {
  constructor(maxTokens, refillRate) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = refillRate; // tokens per second
  }
  
  isAllowed() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
    
    if (this.tokens >= 1) {
      this.tokens--;
      return true;
    }
    return false;
  }
}
\`\`\`

**2. Authentication**
- Validate JWT token signature
- Check expiration: exp < now? → reject
- Extract user ID from claims

\`\`\`javascript
// JWT structure
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiI1MDAxMDAwMiIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNjE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

// Decoded:
{
  "alg": "HS256",
  "sub": "5001000002",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1616239022 // Must be > now
}
\`\`\`

**3. Request Validation**
- JSON schema validation
- Example schema:
\`\`\`json
{
  "type": "object",
  "properties": {
    "lat": { "type": "number", "minimum": -90, "maximum": 90 },
    "lng": { "type": "number", "minimum": -180, "maximum": 180 },
    "radius": { "type": "integer", "minimum": 1, "maximum": 50 }
  },
  "required": ["lat", "lng"]
}
\`\`\`

**4. Request ID Generation**
- UUID or Snowflake ID for distributed tracing
- Passes through all services for debugging
- Example log: req_id=550e8400-e29b-41d4-a716-446655440000
                    `
                },
                {
                    title: '4. SERVICE LAYER EXECUTION (50-200ms)',
                    content: `
## Business Logic Execution

### Example: Geo Service Finding Restaurants

\`\`\`javascript
async function searchRestaurants(lat, lng, radius, userId) {
  // 1. Check permissions (already done in auth service)
  
  // 2. Convert lat/lng to geohash
  const geohash = encodeGeohash(lat, lng, precision=7);
  // Result: "wxyz123" (represents 100m x 100m area)
  
  // 3. Check cache
  const cacheKey = \`restaurants:\${geohash}\`;
  let restaurants = await redis.get(cacheKey);
  
  if (restaurants) {
    console.log('CACHE HIT: 1-2ms');
    return JSON.parse(restaurants);
  }
  
  // 4. Cache miss → Query database
  console.log('CACHE MISS: Query DB');
  restaurants = await db.query(\`
    SELECT id, name, rating, delivery_time, image_url
    FROM restaurants
    WHERE geohash LIKE \${geohash}%  -- Index scan
    ORDER BY rating DESC
    LIMIT 50
  \`);
  
  // 5. Enrich with real-time data
  restaurants = await Promise.all(
    restaurants.map(async (r) => ({
      ...r,
      current_orders: await redis.get(\`restaurant:\${r.id}:orders\`),
      is_open: isRestaurantOpen(r.id)
    }))
  );
  
  // 6. Store in cache with TTL
  await redis.setex(cacheKey, 300, JSON.stringify(restaurants)); // 5 min TTL
  
  return restaurants;
}
\`\`\`

### Parallel Service Calls:
- Geo Service: 20-30ms
- Auth Service: 2-5ms
- These run in parallel, total = max(30ms) = 30ms
- Sequential would be 32-35ms

\`\`\`javascript
// Bad: Sequential (35ms)
const user = await authService.validate(token);
const restaurants = await geoService.search(lat, lng);

// Good: Parallel (30ms)
const [user, restaurants] = await Promise.all([
  authService.validate(token),
  geoService.search(lat, lng)
]);
\`\`\`
                    `
                },
                {
                    title: '5. DATABASE LAYER (20-100ms)',
                    content: `
## Data Retrieval & Caching

### Query Execution:

\`\`\`sql
-- WITHOUT index (table scan): 500ms+ for 1M rows
SELECT * FROM restaurants WHERE geohash LIKE 'wxyz%';

-- WITH geohash index: 20-30ms for 1M rows
CREATE INDEX idx_restaurants_geohash 
ON restaurants (geohash);

-- Query plan (EXPLAIN):
   → Index Scan using idx_restaurants_geohash
     → Filter: geohash LIKE 'wxyz%'
     → Rows: 50 (cache results)
     → Time: 20-30ms
\`\`\`

### Index Types:

**B-Tree Index** (most common):
- Ordered structure: 0 < 10 < 20 < 30
- Perfect for: range queries, sorting
- Example: WHERE id > 100 AND id < 200

**Hash Index**:
- Lightning fast for exact matches
- Useless for ranges
- Example: WHERE user_id = 12345

**Geospatial Index** (R-Tree):
- Indexes 2D coordinates
- Example: WHERE distance(loc, point) < 5km
- Used in spatial databases like PostGIS

**Full-Text Index** (Inverted):
- Indexes words in text
- Used by Elasticsearch
- Example: WHERE text CONTAINS 'pizza'

### Cache Invalidation:

\`\`\`javascript
// Pattern 1: Time-based invalidation
await redis.setex('restaurants:geohash', 300, data); // 5 min TTL
// After 5 min, key expires automatically

// Pattern 2: Event-based invalidation
async function updateRestaurant(id, data) {
  await db.update('restaurants', id, data);
  // Immediately invalidate cache
  await redis.del(\`restaurants:geohash:*\`); // Clear all geohash caches
  await pubsub.publish('restaurant.updated', { id });
}

// Pattern 3: Cache-aside (most common)
async function getData(key) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await db.query(...);
  await redis.set(key, JSON.stringify(data), 'EX', 300);
  return data;
}
\`\`\`
                    `
                },
                {
                    title: '6. RESPONSE COMPILATION (3-5ms)',
                    content: `
## Building Response

### JSON Serialization:

\`\`\`json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": 12345,
        "name": "Pizza Palace",
        "rating": 4.5,
        "delivery_time": "25-30 minutes",
        "price_range": "$ $",
        "image_url": "https://cdn.example.com/restaurant-12345.jpg"
      },
      // ... 49 more restaurants
    ],
    "pagination": {
      "total": 2450,
      "page": 1,
      "per_page": 50
    }
  },
  "timestamp": "2024-03-07T10:30:45Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

### Response Headers:

\`\`\`
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Encoding: gzip
Cache-Control: public, max-age=300  // Cache for 5 minutes
ETag: "550e8400-e29b-41d4"          // For cache validation
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Response-Time: 125ms
Vary: Accept-Encoding                // Varies by compression
Content-Length: 15234                // After gzip compression
\`\`\`

### Compression:

\`\`\`
Original JSON: 80KB
Gzip compressed: 15KB (82% reduction!)
Brotli compressed: 12KB (85% reduction)

Network transmission time:
- Uncompressed: 80KB / 10Mbps = 64ms
- Compressed: 15KB / 10Mbps = 12ms
- Savings: 52ms!
\`\`\`
                    `
                },
                {
                    title: '7. NETWORK TRANSMISSION (50-200ms)',
                    content: `
## Data Over the Wire

### Factors Affecting Latency:

1. **Geography**
   - Local: 10-20ms
   - Same continent: 50-100ms
   - Opposite side of globe: 200-400ms

2. **Network Quality**
   - 5G: 20-30ms latency, low packet loss
   - 4G: 50-100ms latency
   - WiFi: 20-50ms latency
   - 3G: 200-300ms latency

3. **Packet Loss & Retransmission**
   - If 1% packet loss on slow network: +50-100ms
   - TCP retransmits lost packets automatically (slower)

4. **Congestion**
   - During peak hours: +50-200ms
   - At 3 AM: -100ms

### HTTP/2 Features Improving Speed:

\`\`\`
HTTP/1.1: 6 parallel connections per domain
GET /api/restaurants (wait...)
GET /api/users (blocked)
GET /cdn/image1.jpg (blocked)

HTTP/2: Multiplexing over single connection
GET /api/restaurants
GET /api/users         (simultaneous)
GET /cdn/image1.jpg
All 3 requests in parallel via single TCP connection!
Result: ~50% faster loading
\`\`\`
                    `
                },
                {
                    title: '8. CLIENT RENDERING (100-300ms)',
                    content: `
## Display on User Device

### React Rendering Process:

\`\`\`javascript
// 1. Receive response
fetch('https://api.example.com/restaurants?lat=12.97&lng=77.59')
  .then(r => r.json())
  .then(data => {
    // 2. Update Redux store
    dispatch(setRestaurants(data.restaurants));
    
    // 3. React re-renders
    // This triggers:
    // - Virtual DOM reconciliation (1-5ms)
    // - Diff calculation (5-10ms)
    // - DOM mutations (10-20ms)
    // - Browser paints (10-20ms)
    
    // 4. Images lazy load as user scrolls
    // IntersectionObserver detects visible images
    imageElements.forEach(img => {
      observer.observe(img);
    });
  });

// VirtualList optimization:
// Instead of rendering 2450 restaurants:
function RestaurantList({ restaurants }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={restaurants.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <RestaurantItem
          style={style}
          restaurant={restaurants[index]}
        />
      )}
    </FixedSizeList>
  );
  // Only rendered items visible in viewport!
  // 6 items visible → render 6 items
  // Renders thousands instantly!
}
\`\`\`

### Browser Rendering Timeline:

\`\`\`
Parse HTML (1ms)
  ↓
Load CSS & JS (10-50ms)
  ↓
Execute JavaScript (20-100ms)
  ↓
Build DOM Tree (5-10ms)
  ↓
Build CSSOM (5-10ms)
  ↓
Create Render Tree (10-20ms)
  ↓
Layout (10-30ms) - Calculate element positions
  ↓
Paint (20-50ms) - Draw pixels
  ↓
Composite (5-10ms) - Layer composition
  ↓
User sees content!
Total: 100-300ms (or less with optimizations)
\`\`\`
                    `
                }
            ]
        },
        {
            id: 'distributed-systems',
            title: '🌍 Distributed Systems Concepts',
            description: 'How multiple servers work together reliably',
            subsections: [
                {
                    title: 'Consistency, Availability, Partition Tolerance (CAP)',
                    content: `
## You Can Only Pick 2 of 3:

**Consistency (C)**: All reads get latest data
**Availability (A)**: System always responds
**Partition Tolerance (P)**: Works despite network splits

### Scenarios:

**E-Commerce: CA (Consistency + Availability, sacrifice P)**
- During payment: Must be consistent (no double charges!)
- Uses single database or strong consistency
- If network splits: Returns error instead of stale data

**Social Media: AP (Availability + Partition, sacrifice C)**
- Like counts can be eventual consistent
- User feed loaded even if database region is down
- Data eventually syncs (seconds to minutes)

**Banking: CP (Consistency + Partition, sacrifice A)**
- Transfer must be consistent
- If network splits: System waits/down rather than lose money

### Example:

\`\`\`
Network partition occurs:
USA servers ≠ India servers (30s of no communication)

Choice 1: CONSISTENCY
- India server blocks writes
- Error: "Cannot connect to validation servers"
- Data stays consistent
- User experience: degraded

Choice 2: AVAILABILITY
- India server accepts writes locally
- Syncs later with USA
- User sees success
- Temporary inconsistency (might see stale data)

Banks choose Choice 1 (consistency)
Social media chooses Choice 2 (availability)
\`\`\`
                    `
                },
                {
                    title: 'Database Replication & Sharding',
                    content: `
## Handling Data at Scale

### Replication (Multiple Copies):

\`\`\`
Primary DB (USA)          Secondary DB (India) 
    |                              ↑
    |---[write: INSERT]--------→ [read-only copy]
    |    (1 write)
    |
Write goes to primary, replicates to secondary (async, ~500ms delay)

Advantages:
- Reads can come from both (USA & India users)
- High availability (if primary dies, promote secondary)

Disadvantages:
- Eventual consistency (India might be 500ms behind)
- Write bottleneck (all writes to single primary)
\`\`\`

### Sharding (Split Data):

\`\`\`
Single large database: 500 billion restaurants
Cannot fit in one server's RAM!

Solution: Shard by restaurant_id

Shard 1 (USA-1): Restaurants 1-125 billion
Shard 2 (USA-2): Restaurants 125-250 billion
Shard 3 (India):  Restaurants 250-375 billion
Shard 4 (India):  Restaurants 375-500 billion

Sharding formula:
restaurant_id % 4 → determines which shard

Advantages:
- Each shard: 125 billion records → fits in RAM/SSD
- Scale writes: 4 shards × 5k writes/sec each = 20k writes/sec!

Disadvantages:
- Cross-shard queries expensive
- Rebalancing shards when adding new shard (big pain!)
- Hot shards (celebrity restaurants in Shard 1 get 10× traffic)
\`\`\`
                    `
                }
            ]
        },
        {
            id: 'performance-optimization',
            title: '⚡ Performance Optimization Techniques',
            description: 'Making systems faster and more efficient',
            subsections: [
                {
                    title: 'Caching Strategies',
                    content: `
## Multi-Layer Caching

### Layer 1: Browser Cache (Static Assets)
\`\`\`
When user loads website:
- First visit: Download JS (10MB) → 5 seconds
- Second visit: Load from browser cache → 0 seconds (instant!)

How to implement:
<script src="/js/app-v1.2.3.js"></script>
<!-- Version in filename ensures cache-busting -->
<!-- Set header: Cache-Control: max-age=31536000 (1 year) -->
\`\`\`

### Layer 2: CDN Cache (Geographic Distribution)
\`\`\`
User in Mumbai loads image:
Without CDN:
  Mumbai user → [Network 200ms] → USA Server → download image (0.5s)
  
With CDN:
  Mumbai user → CDN in Mumbai → download image (50ms)
  CDN automatically syncs from USA server (background)
  
  Speed improvement: 10× faster!
\`\`\`

### Layer 3: Redis Cache (Hot Data)
\`\`\`
Restaurant list by geohash (changes every 5 minutes):

Without cache:
  Request → PostgreSQL query (50ms) → respond
  1000 concurrent users → 1000 × 50ms DB hits = overload!
  
With cache:
  Request → Redis (1-2ms) → respond
  1000 concurrent users → 1000 × 1ms = manageable!
  
When restaurant opens/closes → Redis key expires OR event-based invalidation
\`\`\`

### Cache Invalidation Patterns:

**1. Time-based (TTL)**
\`\`\`javascript
redis.setex('restaurants:geohash', 300, data); // 5 min TTL
// After 5 min, automatically deleted
\`\`\`

**2. Event-based**
\`\`\`javascript
// On restaurant update:
pubsub.publish('restaurant.updated', { id, restaurantId });
// Subscriber deletes: redis.del(\`restaurants:*\`);
\`\`\`

**3. Cache-aside**
\`\`\`javascript
// Check cache → miss → fetch → update cache
const data = await redis.get(key);
if (!data) {
  data = await db.fetch();
  redis.set(key, data);
}
\`\`\`

**4. Write-through**
\`\`\`javascript
// Update cache and DB together
await db.update(data);
await redis.set(key, data); // Guaranteed in sync
\`\`\`
                    `
                },
                {
                    title: 'Database Query Optimization',
                    content: `
## Making Queries Fast

### Index Creation:

\`\`\`sql
-- Problem: 1M restaurants
SELECT * FROM restaurants 
WHERE geohash LIKE 'wxyz%';
-- Time: 500ms (full table scan)

-- Solution: Add index
CREATE INDEX idx_restaurants_geohash 
ON restaurants (geohash);
-- Time: 20ms (index scan)
-- Speedup: 25×
\`\`\`

### Query Optimization:

\`\`\`sql
-- Bad: N+1 query problem
SELECT * FROM restaurants; -- 1000 rows
for each restaurant:
  SELECT * FROM reviews WHERE restaurant_id = X; -- 1000 queries!
-- Total: 1 + 1000 = 1001 queries!

-- Good: JOIN or batch query
SELECT r.*, 
       COUNT(rw.id) as review_count
FROM restaurants r
LEFT JOIN reviews rw ON r.id = rw.restaurant_id
GROUP BY r.id;
-- Total: 1 query!

-- Or batch:
SELECT * FROM reviews 
WHERE restaurant_id IN (1, 2, 3, ..., 1000);
-- Total: 2 queries (much better!)
\`\`\`

### Explain Plans:

\`\`\`
EXPLAIN SELECT * FROM restaurants WHERE geohash LIKE 'wxyz%';

Seq Scan on restaurants  (cost=0.00..35000.00)
  Filter: (geohash ~~ 'wxyz%'::text)
  
Meaning: Scanning entire table (expensive!)

After adding index:
Index Scan using idx_restaurants_geohash  (cost=0.42..25.00)
  Index Cond: ((geohash ~~ 'wxyz%'::text))
  
25× faster! (35000 cost → 25 cost)
\`\`\`
                    `
                }
            ]
        },
        {
            id: 'scalability-patterns',
            title: '📈 Scalability Patterns',
            description: 'How to handle 10× more users tomorrow',
            subsections: [
                {
                    title: 'Horizontal vs Vertical Scaling',
                    content: `
## Adding Capacity

### Vertical Scaling (Bigger Machine):
\`\`\`
Current: 1 server with 8 CPU, 16GB RAM, 1TB SSD
Problem: App needs 2× capacity

Solution: Upgrade to 16 CPU, 32GB RAM, 2TB SSD
Cost: $10,000 (expensive!)
Downtime: ~1 hour for migration
Limited: Physics limit ~512 CPU cores per machine

Suitable for: Database servers (hard to shard)
\`\`\`

### Horizontal Scaling (More Machines):
\`\`\`
Current: 10 servers, handling 100k users
Problem: App needs 20× users = 2 million users

Solution: Add 190 more servers (total 200)
Cost: $200,000 (same budget, 20× capacity!)
Downtime: 0 (add gradually)
Unlimited: Can add 1000+ servers

Suitable for: API servers, worker processes
\`\`\`

### Hybrid Approach:
\`\`\`
- API Servers: Horizontal (scale to 1000s)
- Databases: Vertical (upgrade 1 big server) + Replication
- Cache Layer: Horizontal with consistent hashing
\`\`\`
                    `
                },
                {
                    title: 'Queue-Based Processing for Async Tasks',
                    content: `
## Not Everything Needs Instant Response

### Problem: Slow Operations Block User

\`\`\`
User places order:
1. Validate order (50ms)
2. Process payment (2000ms) ← SLOW!
3. Send notification (500ms) ← SLOW!
4. Return response (100ms)
Total: 2650ms (2.6 seconds) - User sees loading spinner!

If 1000 users place orders simultaneously:
  2.6s × 1000 = 2600 seconds = 43 minutes to process all!
\`\`\`

### Solution: Queue-Based Processing

\`\`\`
User places order:
1. Validate order (50ms)
2. Save to database (30ms)
3. Enqueue: "ProcessPayment" event to RabbitMQ (10ms)
4. Enqueue: "SendNotification" event (10ms)
5. Return order confirmation to user (100ms)
Total: 200ms - Instant response!

Background workers:
- Worker 1 processes payment asynchronously
- Worker 2 sends notifications asynchronously
- Order status updated via WebSocket when complete
\`\`\`

### RabbitMQ / Kafka Architecture:

\`\`\`
API Server → [Enqueue Event] → Message Queue
                                      ↓
                    [Worker Process 1] - Processing payment
                    [Worker Process 2] - Sending SMS
                    [Worker Process 3] - Logging analytics
                                      ↓
                            Database updated
                                      ↓
                    WebSocket → Send update to user
\`\`\`

### Benefits:
- API responds in 200ms instead of 2600ms
- Workers process at their own pace (scale independently)
- If payment service is down, queue absorbs messages (resilience)
- Easy to add new processors later
                    `
                }
            ]
        }
    ]
};

export default COMPREHENSIVE_GUIDE;
