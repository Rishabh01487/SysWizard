/**
 * Comprehensive Topic Visualizations — Detailed visual designs for all topics
 * Shows ALL flows, sub-flows, data movements, and internal processes
 */

export const TOPIC_VISUALIZATIONS = {
  // ─── FOOD DELIVERY SYSTEM ───
  foodDelivery: {
    title: 'Food Delivery Platform (Swiggy/Zomato/DoorDash)',
    description: 'Complete end-to-end food delivery system',
    mainFlows: [
      {
        name: 'User Discovery & Search Flow',
        description: 'How users find restaurants',
        stages: [
          {
            stage: 'Location Input',
            description: 'Capture user location with high accuracy',
            actors: ['Mobile App', 'Geo Service'],
            process: [
              'User enables GPS location permission',
              'Device sends: {latitude, longitude, accuracy_meters}',
              'App converts to geohash for faster spatial queries',
              'App caches location for 5 minutes (reduces redundant requests)'
            ],
            dataStructure: 'Location = {lat: 12.9716, lng: 77.5946, accuracy: 20}',
            cacheOp: 'LocalStorage set: last_location, TTL: 5 minutes',
            output: 'User coordinates + accuracy radius validated',
            timing: '500-1000ms total (including GPS acquisition)',
            metrics: 'Battery usage: ~30-50mA for GPS; Data: 0KB'
          },
          {
            stage: 'Geohash Encoding',
            description: 'Convert coordinates to geohash for spatial indexing',
            actors: ['Mobile App', 'Geo Service'],
            process: [
              'Algorithm: Interleave latitude & longitude bits',
              'Example: (12.9716, 77.5946) → Geohash "tzkz..."',
              'Precision levels: 6=~2.4km, 7=~152m, 8=~38m area',
              'Geohash becomes cache key and database index key',
              'Used in query: WHERE geohash LIKE \'${geohash_prefix}%\''
            ],
            dataStructure: 'Geohash = "tzkz1x2q" (String, 8 chars)',
            output: 'Geohash string ready for spatial lookup',
            timing: '1-2ms (computation is fast)',
            metrics: 'CPU: minimal; Precision: 152m × 152m area'
          },
          {
            stage: 'Cache Lookup',
            description: 'Check Redis for cached restaurant list',
            actors: ['API Gateway', 'Redis Cache'],
            process: [
              'Key structure: "restaurants:geohash:{geohash}:{filter_hash}"',
              'Example query: redis.get("restaurants:tzkz1x2q:rating_3.5+")',
              'Cache hit returns: [Restaurant{id, name, rating, delivery_time}]',
              'Cache miss returns: nil → trigger database query',
              'Hit rate in popular areas: 70-80%; Off-peak: 30-40%'
            ],
            dataStructure: 'Value = JSON array of ~50 restaurants, ~30KB per entry',
            cacheOp: 'GET restaurants:geohash:{geohash} | TTL=5min | Hit Rate=70%',
            output: 'Restaurant list from cache OR cache miss signal',
            timing: '1-2ms (hit) | 0ms (redis network roundtrip only)',
            metrics: 'Latency: 1-2ms; Network: 30KB per hit'
          },
          {
            stage: 'Database Query (if cache miss)',
            description: 'Query PostgreSQL with geospatial index',
            actors: ['Restaurant Service', 'PostgreSQL Database'],
            process: [
              'Query: SELECT * FROM restaurants WHERE gist_index <-> geohash LIMIT 50',
              'Uses GiST index: Generalized Search Tree for spatial queries',
              'Filters: filter {rating >= 3.5, is_open = true, serves_area = true}',
              'Sorting: closest distance first, then by rating desc, delivery_time asc',
              'Result: 50 nearest restaurants with full metadata'
            ],
            dbOperation: 'SELECT id,name,rating FROM restaurants WHERE geohash @> \'tzkz1x2\' | No. of Rows: 50',
            dataStructure: 'Each row: {id:int, name:str, rating:float, lat:float, lng:float, delivery_time:int, is_open:bool}',
            output: '50 nearby restaurants with full details from database',
            timing: '20-50ms (depends on index efficiency and DB load)',
            metrics: 'Rows scanned: ~200; Rows returned: 50; Index: GIST (spatial)'
          },
          {
            stage: 'Data Enrichment',
            description: 'Parallel fetch of dynamic and static data for each restaurant',
            actors: ['Restaurant Service', 'Redis Cache', 'S3 CDN', 'Menu Service'],
            process: [
              'For each of 50 restaurants in parallel, fetch:',
              '  1. Menu images: From S3/CDN (cached URLs)',
              '  2. Live active orders: redis.hget("restaurant:{id}:active_orders")',
              '  3. Current offers: redis.get("restaurant:{id}:promotions")',
              '  4. Estimated delivery: ETAssignmentService.estimate(distance, queue_size)',
              '  5. Availability status: Real-time from restaurant backend'
            ],
            dataStructure: 'EnrichedRestaurant = {id, name, rating, images[], active_orders: 12, offers: [{code, discount}], eta: 28}',
            cacheOp: 'MGET restaurant:{id}:active_orders | MGET restaurant:{id}:promotions | Parallel calls',
            output: 'Enriched restaurant objects with dynamic data',
            timing: '200-500ms (parallel fetches, slowest determines total)',
            metrics: 'Network calls: 50 parallel requests; Data: ~150KB total'
          },
          {
            stage: 'Response Compression & Send',
            description: 'Serialize, compress, and send over HTTP/2',
            actors: ['API Gateway', 'Network Stack'],
            process: [
              'Serialize: 50 restaurants as JSON = ~80KB uncompressed',
              'Add metadata: total_count, next_page_token, timestamp',
              'Compression: gzip algorithm reduces to ~15KB (82% reduction!)',
              'HTTP Headers: Cache-Control: max-age=300, ETag: hash',
              'Protocol: HTTP/2 with multiplexing (multiple requests on 1 connection)'
            ],
            dataStructure: 'HTTP Response = {status: 200, body: gzipped JSON, headers: {ETag, Cache-Control}}',
            cacheOp: 'Set Cache-Control header so client caches for 5 minutes',
            output: 'Gzipped JSON response sent to client',
            timing: '12ms transmission (15KB ÷ 10Mbps network) + 50-200ms latency',
            metrics: 'Uncompressed: 80KB; Compressed: 15KB; Reduction: 82%; Latency: 50-200ms'
          }
        ]
      },

      {
        name: 'Order Placement Flow',
        description: 'Complete order from selection to confirmation',
        stages: [
          {
            stage: 'Cart Management',
            actors: ['Mobile App', 'Local Storage'],
            process: [
              'User adds dishes to cart',
              'App stores locally: {restaurant_id, items[], total}',
              'App updates: taxes, delivery fee, total',
              'User can edit/remove before checkout'
            ],
            output: 'Order object ready for submission',
            timing: 'Instant (client-side)'
          },
          {
            stage: 'Order Submission',
            actors: ['Mobile App', 'API Gateway'],
            process: [
              'Send POST /orders/create with:',
              '  {restaurant_id, items, delivery_addr, payment_method}',
              'API validates: all mandatory fields present',
              'API checks: user authentication valid'
            ],
            output: 'Order submission accepted',
            timing: '10-20ms validation'
          },
          {
            stage: 'Inventory Verification',
            description: 'Check restaurant inventory and reserve items',
            actors: ['Order Service', 'Redis Cache', 'Restaurant Service'],
            process: [
              'For each item in order, fetch from cache:',
              '  Key: "menu:{restaurant_id}:{dish_id}"',
              '  Check: availability flag = true',
              '  Check: quantity_available >= order_quantity',
              'Create reservation: Temporarily block order_quantity for 5 minutes',
              'If any item unavailable: Reject entire order'
            ],
            dataStructure: 'MenuItem = {id, name, price, available: true, quantity_available: 45}',
            cacheOp: 'MGET menu:{rest_id}:* | TTL=10min | Create temp reservation key',
            output: 'Inventory verified or order rejected',
            timing: '20-50ms (parallel cache lookups)',
            metrics: 'Cache hit rate: 95%; Data: ~5KB per menu item'
          },
          {
            stage: 'Price Calculation & Validation',
            description: 'Calculate total with taxes, discounts, and fees',
            actors: ['Order Service', 'Pricing Engine'],
            process: [
              'Step 1: Get prices from cache: {item_id → price}',
              'Step 2: Calculate subtotal = Σ(item.price × qty)',
              'Step 3: Apply restaurant offers (15% off) + promo codes',
              'Step 4: Calculate taxes: subtotal × 0.05 (5% tax rate)',
              'Step 5: Get delivery fee from distance: 50 to 500 INR',
              'Step 6: Calculate service fee: 5% of subtotal',
              'Step 7: Validate: user_balance >= total OR payment_method exists'
            ],
            dataStructure: 'PriceBreakdown = {subtotal: 450, tax: 22.5, delivery: 50, service: 22.5, total: 545}',
            cacheOp: 'GET prices:{rest_id} | GET promos:{code} | GET delivery_rate',
            output: 'Final order total = 545 INR (validated)',
            timing: '10-30ms (arithmetic + cache lookups)',
            metrics: 'Calculations: <1ms; Cache: 10-20ms'
          },
          {
            stage: 'Database Transaction Begin',
            description: 'ACID transaction ensuring consistency',
            actors: ['Order Service', 'PostgreSQL Database'],
            process: [
              'Execute: BEGIN TRANSACTION; ISOLATION LEVEL SERIALIZABLE',
              'INSERT into orders table: {user_id, restaurant_id, total, status, created_at}',
              'INSERT into order_items (batch): {order_id, dish_id, qty, price_at_order, notes}',
              'INSERT into order_timeline: {order_id, event: "order_created", ts}',
              'Generate order_id (UUID) from database sequence',
              'Lock: orders.id in database for consistency'
            ],
            dbOperation: 'BEGIN; INSERT orders (user_id, restaurant_id, total, status) VALUES (...); INSERT order_items (order_id, dish_id, qty) VALUES (...) x N;',
            dataStructure: 'Order = {id: UUID, user_id, restaurant_id, total: 545, status: "pending", items: [{dish_id, qty, price}], timestamps}',
            output: 'Order persisted in DB with id=12345-uuid; Transaction pending payment',
            timing: '20-50ms (DB write + locking)',
            metrics: 'Rows inserted: N+3 (N items + 1 order + 1 timeline); Lock time: <10ms'
          },
          {
            stage: 'Payment Processing',
            description: 'Process payment through Stripe/Razorpay gateway',
            actors: ['Payment Service', 'Stripe/Razorpay API', 'Queue', 'Database'],
            process: [
              'Create payment intent: {order_id, amount: 545, currency: INR}',
              'Send to payment gateway with retry logic (3 attempts)',
              'Gateway validates: card/wallet, sufficient balance',
              'Timeout: 30 seconds (if exceeded, webhook will handle)',
              'If payment success: commit DB transaction → order confirmed',
              'If payment failure: rollback transaction → order cancelled',
              'Store receipt: {transaction_id, status, timestamp, gateway_response}'
            ],
            dataStructure: 'Payment = {order_id, amount: 545, gateway: "stripe", transaction_id, status: "pending"}',
            dbOperation: 'UPDATE orders SET status = "confirmed" WHERE id = order_id; [If payment succeeds]',
            cacheOp: 'SET payment:{order_id} with timeout for retry handling',
            output: 'Payment confirmed or failed; Order status updated',
            timing: '500-2000ms (depends on payment gateway + network)',
            metrics: 'Success rate: 97%; Failure handling: queue-based retry'
          },
          {
            stage: 'Event Publishing',
            description: 'Publish domain events to message queue for downstream consumers',
            actors: ['Order Service', 'Kafka Broker', 'Message Queue'],
            process: [
              'Publish events to Kafka topics (distributed message queue):',
              '  1. Topic: order.created → {order_id, user_id, restaurant_id, total}',
              '  2. Topic: order.payment_confirmed → {order_id, transaction_id, amount}',
              '  3. Topic: restaurant.new_order → {order_id, items, delivery_addr}',
              'Replication factor: 3 (message persisted in 3 brokers)',
              'Retention: 7 days (allows event replay if subscriber fails)',
              'Subscribers receive notifications asynchronously'
            ],
            dataStructure: 'KafkaEvent = {topic: "order.created", key: order_id, value: {order_id, user_id, timestamp}, partition: 5}',
            cacheOp: 'Set event cache: event:{order_id} for deduplication',
            output: 'Events persisted in Kafka; Multiple services subscribed',
            timing: '10-30ms (queue append)',
            metrics: 'Throughput: 100k events/sec per broker; Subscribers: 5+ services'
          },
          {
            stage: 'Restaurant Notification',
            description: 'Push notification to restaurant app about new order',
            actors: ['Notification Service', 'Firebase Cloud Messaging', 'Restaurant App'],
            process: [
              'Consume event: order.restaurant.new_order',
              'Build notification: "New Order #12345: 2x Butter Chicken (545 INR)"',
              'Send to Firebase Cloud Messaging (FCM) API',
              'FCM routes to restaurant device via push token',
              'Restaurant app receives and displays alert sound + vibration',
              'Restaurant can see full order details: items, address, special requests',
              'Timeout: 2 minutes to accept/reject (auto-assign if timeout)',
              'Restaurant responds: {order_id, action: "accept/reject"}'
            ],
            dataStructure: 'Notification = {order_id, restaurant_id, title: "New Order", body: "2x Butter Chicken - 545 INR", data: {order_details}}',
            output: 'Restaurant receives notification and accepts/rejects within 2 min',
            timing: '3-5 seconds (FCM delivery)',
            metrics: 'Delivery rate: 98-99%; Delivery latency: 2-5 seconds'
          },
          {
            stage: 'Confirmation to User',
            actors: ['Order Service', 'Mobile App'],
            process: [
              'User receives order confirmation:',
              '  {order_id, track_order_url, eta}',
              'Order status: "restaurant_confirmed"',
              'WebSocket connection established for live updates',
              'User can track in real-time'
            ],
            output: 'User sees confirmation screen',
            timing: '200-500ms total'
          }
        ]
      },

      {
        name: 'Real-Time Order Tracking Flow',
        description: 'Live updates from restaurant to delivery to user',
        stages: [
          {
            stage: 'WebSocket Connection',
            actors: ['Mobile App', 'WebSocket Gateway'],
            process: [
              'App opens WebSocket: /ws/order/{order_id}',
              'Connection authentication: JWT token',
              'Server maintains connection in Redis: Set',
              'Heartbeat every 30 seconds to detect disconnects'
            ],
            output: 'Live connection established',
            timing: '100-500ms handshake'
          },
          {
            stage: 'Restaurant Cooking',
            actors: ['Restaurant App', 'Order Service'],
            process: [
              'Restaurant staff marks: "making_order"',
              'Cooking timer started',
              'Real-time ETA calculated based on queue',
              'Update sent via message queue'
            ],
            output: 'Users see: "Preparing your order... 12 mins"',
            timing: '100-200ms from restaurant to user (WebSocket push)'
          },
          {
            stage: 'Restaurant Order Ready',
            actors: ['Restaurant', 'Order Service', 'Delivery Service'],
            process: [
              'Restaurant marks: "ready_for_pickup"',
              'Event published: order.ready_for_delivery',
              'Delivery assignment algorithm triggered:',
              '  - Find nearest available delivery partner',
              '  - Check: partner has capacity, vehicle type',
              '  - Check: delivery zone coverage',
              'Send assignment to delivery app'
            ],
            output: 'Delivery partner assigned & notified',
            timing: '2-5 seconds (delivery assignment)'
          },
          {
            stage: 'Delivery Partner Pickup',
            actors: ['Delivery App', 'Geo Service'],
            process: [
              'Delivery partner sees order in app',
              'Accepts delivery assignment',
              'Navigates to restaurant location',
              'GPS tracking: Restaurant → User location',
              'Location updates sent every 5 seconds to user'
            ],
            output: 'User sees delivery partner approaching restaurant',
            timing: 'Real-time location stream'
          },
          {
            stage: 'Order in Transit',
            actors: ['Delivery App', 'Geo Service', 'WebSocket'],
            process: [
              'Delivery partner picks up order from restaurant',
              'Status: "in_delivery"',
              'Live location pinned on user map',
              'ETA calculated from GPS + traffic API',
              'User can see: delivery partner photo, rating, vehicle'
            ],
            output: 'User sees: "Delivery partner is 4 mins away"',
            timing: 'Live updates every 5 seconds'
          },
          {
            stage: 'Delivery Completed',
            actors: ['Delivery App', 'Order Service'],
            process: [
              'Delivery partner reaches user location',
              'Marks: "delivered", takes photo proof',
              'Order status: "completed"',
              'Event published: order.delivered',
              'Payment finalized, tips collected'
            ],
            output: 'Order marked complete',
            timing: '30-60 seconds for photo verification'
          },
          {
            stage: 'Post-Delivery Actions',
            actors: ['Order Service', 'Analytics', 'Notifications'],
            process: [
              'User can rate restaurant & delivery',
              'Analytics processed for insights',
              'Email receipt sent to user',
              'Restaurant receives payment settlement',
              'Delivery partner receives payout',
              'Data logged for ML model training'
            ],
            output: 'Complete delivery cycle archived',
            timing: 'Background processing, async'
          }
        ]
      },

      {
        name: 'Backend Service Interactions',
        description: 'How internal services communicate',
        stages: [
          {
            stage: 'API Gateway to Services',
            actors: ['API Gateway', 'Service Mesh (Istio)'],
            process: [
              'Request routing by URL path pattern:',
              '  /restaurants/* → Restaurant Service',
              '  /orders/* → Order Service',
              '  /payments/* → Payment Service',
              '  /deliveries/* → Delivery Service',
              'Circuit breaker: Stop requests if service down',
              'Retry logic: 3 retries with exponential backoff'
            ],
            output: 'Request routed to correct service',
            timing: '5-10ms routing'
          },
          {
            stage: 'Service-to-Service gRPC',
            actors: ['Order Service', 'Restaurant Service', 'Geo Service'],
            process: [
              'Inter-service calls use gRPC (not REST)',
              'Binary protocol: 10× faster than JSON',
              'Example: Order Service calls Restaurant Service',
              '  OrderService.getRestaurantDetails(restaurant_id)',
              'Connection pooling: Reuse TCP connections',
              'Timeout: 5 seconds per call'
            ],
            output: 'Service data retrieved',
            timing: '5-20ms per gRPC call'
          },
          {
            stage: 'Database Connection Pooling',
            actors: ['Services', 'PostgreSQL'],
            process: [
              'Connection pool size: 50 per service',
              'Each service maintains idle connections',
              'Query comes in: Take from pool, execute, return',
              'Pool prevents: Creating new connection per query',
              'Without pool: 1s per query (connection overhead)',
              'With pool: 20-50ms per query (reused connection)'
            ],
            output: 'Efficient DB access',
            timing: '20-50ms vs 1000ms without pool'
          },
          {
            stage: 'Cache Layer Coordination',
            actors: ['Services', 'Redis Cluster'],
            process: [
              'Redis runs in cluster mode: 6 nodes',
              'Sharding by item type: restaurants:*, orders:*, etc.',
              'All services read from same Redis',
              'Cache invalidation: Multi-channel pub/sub',
              '  Instance A updates restaurant → publishes event',
              '  Instances B,C,D receive event, invalidate cache'
            ],
            output: 'Consistent caching across services',
            timing: '1-2ms Redis access'
          },
          {
            stage: 'Async Task Processing',
            actors: ['Service', 'Message Queue', 'Workers'],
            process: [
              'Slow operations published to queue:',
              '  - SendEmail: order.order_placed event',
              '  - GenerateReceipt: order.completed event',
              '  - UpdateAnalytics: any event',
              '  - SendSMS: order status changes',
              'Workers (10-100 instances) consume from queue',
              'Retry failed jobs up to 3 times'
            ],
            output: 'Async tasks completed in background',
            timing: 'Queue latency: 100-500ms (eventually consistent)'
          }
        ]
      },

      {
        name: 'Data Storage & Persistence',
        description: 'Where and how data is stored',
        stages: [
          {
            stage: 'Long-Term Storage (PostgreSQL)',
            actors: ['PostgreSQL Primary + 2 Read Replicas'],
            process: [
              'Tables:',
              '  - users: {id, email, phone, addresses}',
              '  - restaurants: {id, name, location, menu}',
              '  - orders: {id, user_id, restaurant_id, total, status}',
              '  - order_items: {order_id, dish_id, quantity}',
              '  - payments: {id, order_id, amount, status, receipt}',
              'Replication: Primary writes, replicas read-only',
              'Backup: Daily snapshots to S3'
            ],
            output: 'Durable data storage',
            timing: '20-50ms write (primary sync), 10-30ms read (replica)'
          },
          {
            stage: 'Hot Data Cache (Redis)',
            actors: ['Redis Cluster (6 nodes)'],
            process: [
              'Cache data (with TTL):',
              '  - restaurants:{geohash}: 5 min',
              '  - restaurant:{id}:menu: 30 min',
              '  - user:{id}:addresses: 24 hours',
              '  - order:{id}:status: 10 min',
              '  - active_deliveries: 1 min',
              'Eviction policy: LRU (least recently used)'
            ],
            output: 'Fast access to frequently needed data',
            timing: '1-2ms per access'
          },
          {
            stage: 'Search Index (Elasticsearch)',
            actors: ['Elasticsearch Cluster (3 nodes)'],
            process: [
              'Full-text search index for:',
              '  - Restaurants: name, cuisine, dishes',
              '  - Dishes: name, description, tags',
              'Inverted index: word → document mapping',
              'Sharding: 5 shards × 3 replicas = 15 copies',
              'Reindexing: Run nightly at 2 AM'
            ],
            output: 'Fast full-text search',
            timing: '50-200ms search query'
          },
          {
            stage: 'Image & Media Storage (S3)',
            actors: ['S3 Bucket', 'CloudFront CDN'],
            process: [
              'Upload images to S3:',
              '  - Restaurant logos: 200KB each',
              '  - Dish pictures: 500KB each',
              '  - User avatars: 50KB each',
              'Serve through CloudFront CDN:',
              '  - 300+ edge locations worldwide',
              '  - Caches for 1 year: url includes content hash'
            ],
            output: 'Global fast image delivery',
            timing: '50-200ms (first time), 10-30ms (cached)'
          },
          {
            stage: 'Real-Time Data (Redis Streams)',
            actors: ['Redis Streams', 'Consumers'],
            process: [
              'Streaming data for analytics:',
              '  - User actions: click, view, search',
              '  - Order events: created, confirmed, delivered',
              '  - Delivery tracking: GPS updates',
              'Data retention: 24 hours rolling window',
              'Multiple consumer groups: Analytics, ML, Real-time dashboard'
            ],
            output: 'Real-time data available for analysis',
            timing: 'Millisecond-level timestamps'
          }
        ]
      }
    ],

    // Complete system flows showing how everything interacts
    systemFlows: [
      {
        name: 'Complete Order Cycle (User Discovery → Delivery)',
        steps: [
          'User opens app → Location loaded from GPS',
          'API Gateway → Load balancer → Geo Service',
          'Geo converts location → Geohash lookup',
          'Redis cache hit (70% of time) → return restaurants',
          'If miss (30%) → PostgreSQL query → Redis cache for next time',
          'User scrolls → Images lazy load from CDN',
          'User clicks restaurant → Load menu from cache/DB',
          'User adds dishes → Cart stored locally',
          'User clicks "Order" → Order Service validates inventory',
          'Payment processing → Stripe gateway (2 sec timeout)',
          'Transaction committed → Order created with ID',
          'Event published → Restaurant app notified via FCM',
          'WebSocket established → User sees live tracking',
          'Restaurant accepts → Status updated via queue',
          'Order cooking → ETA calculated from queue length',
          'Delivery assigned → Algorithm finds nearest partner',
          'Delivery partner picks up → GPS tracking starts',
          'Location updates every 5 sec → Sent to user via WebSocket',
          'Delivered → Photo proof captured',
          'Order complete → Payout + ratings recorded'
        ]
      }
    ],

    // Metrics and performance data
    metrics: {
      peakThroughput: '50,000 orders per minute',
      concurrentUsers: '2 million active users',
      avgOrderTime: '45 minutes',
      responseTime99thPercentile: '500ms',
      systemUptime: '99.99% (four nines)',
      dataRetention: '2 years in PostgreSQL, 7 days in Kafka'
    }
  },

  // ─── E-COMMERCE SYSTEM ───
  ecommerce: {
    title: 'E-Commerce Platform (Amazon/Flipkart)',
    description: 'Complete e-commerce system for product discovery and purchasing',
    mainFlows: [
      {
        name: 'Product Search & Discovery',
        description: 'How users find products',
        stages: [
          {
            stage: 'Search Query Input',
            actors: ['Web App / Mobile App'],
            process: [
              'User types: "running shoes"',
              'Debounced: sent after 500ms no typing',
              'Query: {q: "running shoes", filters: {price, rating, brand}}'
            ],
            output: 'Search request prepared',
            timing: '500-1000ms (debounce wait)'
          },
          {
            stage: 'Elasticsearch Full-Text Search',
            actors: ['Search Service', 'Elasticsearch Cluster'],
            process: [
              'Query parsed: (running shoe) OR (running sneaker)',
              'Executed on 5 shards in parallel',
              'TF-IDF scoring: Relevance ranking',
              'Boost factors applied:',
              '  - Verified seller: +50%',
              '  - Prime eligible: +30%',
              '  - Reviews count > 100: +20%',
              'Top 100 results returned'
            ],
            output: '100 matching products with scores',
            timing: '50-150ms'
          },
          {
            stage: 'Fetch Product Details',
            actors: ['Search Service', 'Product DB', 'Redis'],
            process: [
              'For top 20 results:',
              '  - Get from cache (hit rate: 90%)',
              '  - If miss: Query PostgreSQL',
              '  - Cache for 1 hour',
              'Details: price, stock, ratings, images'
            ],
            output: 'Rich product objects',
            timing: '10-30ms (cached), 50-100ms (DB)'
          },
          {
            stage: 'Apply Filters & Sorting',
            actors: ['Search Service', 'Elasticsearch'],
            process: [
              'User filters: {price: 2000-5000, rating: 4+, inStock: true}',
              'Aggregations: Compute facets',
              '  - Brands: Nike (234), Adidas (189), ...',
              '  - Prices: 2000-3000 (145), 3000-4000 (198), ...',
              'Sort: By relevance / price / rating'
            ],
            output: 'Filtered & sorted results',
            timing: '20-50ms'
          }
        ]
      },

      {
        name: 'Product Page & Inventory',
        description: 'Displaying product details and availability',
        stages: [
          {
            stage: 'Product Detail Load',
            actors: ['Product Service', 'Cache', 'Database'],
            process: [
              'Load: {name, description, images, specs, price}',
              'Check inventory:',
              '  - Direct stock: warehouse inventory',
              '  - Seller listed: fulfilled by marketplace',
              '  - Express delivery availability by pincode',
              'Fetch related products: "Customers also bought"'
            ],
            output: 'Complete product page data',
            timing: '100-300ms'
          },
          {
            stage: 'Dynamic Pricing',
            actors: ['Pricing Service', 'Cache', 'ML Model'],
            process: [
              'ML model predicts: demand, seasonality, competition',
              'Determine: best price for maximum profit',
              'Consider: seller rank, inventory levels',
              'Apply: discounts, offers, coupons (real-time)'
            ],
            output: 'Optimal price & discounts',
            timing: '50-200ms (ML inference)'
          }
        ]
      },

      {
        name: 'Shopping Cart & Checkout',
        description: 'Adding items and paying',
        stages: [
          {
            stage: 'Add to Cart',
            actors: ['Cart Service', 'Redis', 'Inventory'],
            process: [
              'Create/Update cart in Redis: user_{id}:cart',
              'Items stored: [{sku, qty, price_at_add}]',
              'Reserve inventory for 15 minutes',
              'Calculate: subtotal, taxes, delivery'
            ],
            output: 'Cart updated',
            timing: '50-100ms'
          },
          {
            stage: 'Checkout Page',
            actors: ['Checkout Service', 'Address Service'],
            process: [
              'Fetch: saved addresses, payment methods',
              'Calculate: delivery options & costs by pincode',
              'Show: coupon discounts in real-time',
              'Display: final payable amount'
            ],
            output: 'Checkout UI rendered',
            timing: '200-500ms'
          },
          {
            stage: 'Order Creation',
            actors: ['Order Service', 'Database', 'Payment Service'],
            process: [
              'Validate: address, payment method',
              'Reserve inventory: inventory lock acquired',
              'INSERT order into database with status: pending_payment',
              'Create payment intent: Stripe/Razorpay'
            ],
            output: 'Order created, awaiting payment',
            timing: '100-300ms'
          },
          {
            stage: 'Payment Processing',
            actors: ['Payment Service', 'Payment Gateway'],
            process: [
              '3D Secure authentication (if needed)',
              'Process transaction: 5-30 seconds',
              'Webhook callback: payment success/fail',
              'Update order status: paid vs failed',
              'If failed: Release inventory reservation'
            ],
            output: 'Payment confirmed or failed',
            timing: '5-30 seconds'
          }
        ]
      },

      {
        name: 'Fulfillment & Delivery',
        description: 'Warehouse to customer delivery',
        stages: [
          {
            stage: 'Order Confirmation & Packing',
            actors: ['Warehouse', 'Inventory System'],
            process: [
              'Warehouse receives event: order.paid',
              'Pick items from shelves',
              'Quality check & packing',
              'Generate shipping label',
              'Status: "packed_ready_to_ship"'
            ],
            output: 'Package ready for pickup',
            timing: '1-2 hours'
          },
          {
            stage: 'Shipping',
            actors: ['Logistics Partner', 'Tracking System'],
            process: [
              'FDK/Bluedart/Ecom Express picks up',
              'Scans barcode: enters tracking system',
              'Journey: origin → sorting → transit → delivery',
              'Updates sent every 4-6 hours',
              'User sees: "Order in transit in Mumbai"'
            ],
            output: 'Package in delivery network',
            timing: '1-7 days (standard delivery)'
          },
          {
            stage: 'Delivery & Returns',
            actors: ['Delivery Partner', 'Customer'],
            process: [
              'Final mile delivery: neighborhood',
              'Delivery attempts: 3 attempts before return',
              'Customer can return within 30 days',
              'Refund processed: 5-7 business days'
            ],
            output: 'Package delivered or returned',
            timing: 'Same day (premium) to 7 days (standard)'
          }
        ]
      }
    ],

    systemFlows: [
      {
        name: 'Complete E-Commerce Journey',
        steps: [
          'User arrives → CDN serves homepage',
          'User searches "shoes" → Elasticsearch index hit',
          'Results page with 100 products → Images lazy load',
          'User filters by price → Real-time facet aggregation',
          'Clicks product → Details loaded from cache',
          'Adds to cart → Quantity reserved for 15 min',
          'Reviews & ratings shown → Aggregations from cache',
          'Clicks "Buy Now" → Checkout page loads addresses',
          'Selects address → Delivery cost calculated',
          'Applies coupon → Discount applied real-time',
          'Reviews total price → All taxes included',
          'Clicks "Pay" → Payment gateway opens',
          'Payment successful → Order created in DB',
          'Confirmation email sent → Warehouse notified',
          'Order appears in "My Orders" → WebSocket update',
          'Warehouse packs item → Status updated',
          'Shipping partner picks up → Tracking starts',
          'Package in transit → Delivery updates every 6h',
          'Package delivered → Signature captured',
          'User rates & reviews → Feeds back to system'
        ]
      }
    ],

    metrics: {
      peakThroughput: '100,000 orders per minute',
      concurrentUsers: '5 million active users',
      productCatalog: '200 million products',
      responseTime99thPercentile: '800ms',
      systemUptime: '99.95%'
    }
  },

  // ─── CHAT APPLICATION ───
  chat: {
    title: 'Real-Time Chat Application (WhatsApp/Telegram)',
    description: 'Messaging with real-time delivery and read receipts',
    mainFlows: [
      {
        name: 'Message Send & Delivery',
        description: 'From sending message to delivery confirmation',
        stages: [
          {
            stage: 'User Types Message',
            actors: ['Message Editor', 'Local Device'],
            process: [
              'Message composed locally',
              'Stored in device SQLite/Realm',
              'Status: "pending" (unsent)',
              'UI shows: sending indicator (⏳)'
            ],
            output: 'Draft message ready',
            timing: 'Instant (local)'
          },
          {
            stage: 'Network Transmission',
            actors: ['Messaging Service', 'API Gateway'],
            process: [
              'App opens persistent WebSocket',
              'Message sent: {to, text, timestamp, message_id}',
              'Encryption: End-to-end encryption (Signal protocol)',
              'Received at server: stored & acknowledged'
            ],
            output: 'Message received by server',
            timing: '100-500ms'
          },
          {
            stage: 'Message Storage',
            actors: ['Message Service', 'Database', 'Cache'],
            process: [
              'INSERT into messages table:',
              '{from_user_id, to_user_id, text, timestamp, status}',
              'Index by: (to_user_id, timestamp) for retrieval',
              'Cache in Redis: recent 1000 messages',
              'Replicate to secondary DB: for backup'
            ],
            output: 'Message persisted',
            timing: '20-50ms (DB write)'
          },
          {
            stage: 'Delivery to Recipient',
            actors: ['WebSocket Hub', 'Recipient Device'],
            process: [
              'Check: Is recipient online?',
              'If yes:',
              '  - Send via open WebSocket (instant)',
              '  - Mark in DB: "delivered"',
              'If no:',
              '  - Store in queue: deliver when online',
              '  - Send offline notification'
            ],
            output: 'Message delivered or queued',
            timing: '10-100ms (if online), stored if offline'
          },
          {
            stage: 'Read Receipts',
            actors: ['Recipient Device', 'Message Service'],
            process: [
              'User opens message → Client sends: "read" event',
              'Server updates: message status = "read"',
              'Timestamp recorded: when read',
              'Sender sees: "read at 10:35 AM"'
            ],
            output: 'Read status synchronized',
            timing: '200-500ms'
          }
        ]
      },

      {
        name: 'Chat History & Message Retrieval',
        description: 'Loading past messages efficiently',
        stages: [
          {
            stage: 'Pagination Load',
            actors: ['Message Service', 'Cache', 'Database'],
            process: [
              'Load latest 50 messages first (fast)',
              'User scrolls up: load next 50 (pagination)',
              'Query: SELECT * FROM messages WHERE to = ? ORDER BY timestamp DESC LIMIT 50',
              'Use index: (to_user_id, timestamp)',
              'Cache recent messages in Redis'
            ],
            output: 'Messages loaded in chunks',
            timing: '20-50ms per 50-message batch'
          },
          {
            stage: 'Search in Chat',
            actors: ['Search Service', 'Elasticsearch'],
            process: [
              'Full-text search: within single chat',
              'Example: Search "pizza" in chat with friend',
              'Returns: All messages containing "pizza"',
              '  with context (previous/next message)'
            ],
            output: 'Search results with context',
            timing: '100-300ms'
          }
        ]
      },

      {
        name: 'Group Chat & Notifications',
        description: 'Multi-user messaging and alerting',
        stages: [
          {
            stage: 'Group Message Fanout',
            actors: ['Message Service', 'Message Queue'],
            process: [
              'User sends message to group (50 members)',
              'Message stored once in DB',
              'Message ID enqueued 50 times (one per member)',
              'Workers process queue: deliver to each member',
              'Fanout parallelized: handled by 50 different servers'
            ],
            output: 'Message delivered to all members',
            timing: 'Stored immediately (100ms), delivery within 5 sec'
          },
          {
            stage: 'Push Notifications',
            actors: ['Notification Service', 'Firebase Cloud Messaging'],
            process: [
              'If user offline: send push notification',
              'Batch notifications: (avoiding spam)',
              'Deliver via: FCM (Android), APNs (iOS)',
              'Includes: Sender name, message preview'
            ],
            output: 'User receives notification',
            timing: '3-10 seconds'
          }
        ]
      }
    ],

    systemFlows: [
      {
        name: 'Complete Message Lifecycle',
        steps: [
          'User types message → Stored locally with status "pending"',
          'User hits "Send" → WebSocket sends encrypted message',
          'Server receives → Stores in PostgreSQL',
          'Recipient online? → WebSocket sends instantly',
          'Recipient offline? → Stored in delivery queue',
          'Recipient comes online → Holds delivery from queue',
          'Recipient opens message → Marked as "delivered"',
          'Recipient reads → "read" status sent back',
          'Sender sees: ✓ Sent, ✓✓ Delivered, ✓✓ Read (as time progresses)',
          'User scrolls back → Older messages paginated from DB'
        ]
      }
    ],

    metrics: {
      peakMessagesPerSecond: '1 million messages/sec',
      concurrentUsers: '100 million active users',
      avgMessageLatency: '50-200ms end-to-end',
      responseTime99thPercentile: '500ms',
      dataRetention: '7 years (encrypted on servers)'
    }
  },

  // ─── VIDEO STREAMING ───
  videoStreaming: {
    title: 'Video Streaming Platform (Netflix/YouTube)',
    description: 'On-demand video delivery at scale',
    mainFlows: [
      {
        name: 'Content Discovery & Recommendation',
        description: 'Finding videos to watch',
        stages: [
          {
            stage: 'Homepage Personalization',
            actors: ['Recommendation Engine', 'User DB', 'ML Model'],
            process: [
              'ML model trained on:',
              '  - Watch history',
              '  - Ratings given',
              '  - Time of day',
              '  - Device type',
              '  - Country/region',
              'Model predicts: Videos user likely interested in',
              'Score each video: 0-1.0 relevance'
            ],
            output: 'Personalized video recommendations',
            timing: '50-200ms (ML inference)'
          },
          {
            stage: 'Search & Filter',
            actors: ['Search Service', 'Elasticsearch'],
            process: [
              'Full-text search: on titles, descriptions, tags',
              'Facets: Genre, Release Year, Rating, Duration',
              'Sorting: Trending, Most Watched, New Releases'
            ],
            output: 'Search results with filters',
            timing: '100-300ms'
          }
        ]
      },

      {
        name: 'Video Playback & Streaming',
        description: 'Delivering video to viewers',
        stages: [
          {
            stage: 'Video Selection & Metadata',
            actors: ['Playback Service', 'Content DB'],
            process: [
              'Get video metadata:',
              '  - Duration, resolution options (480p to 4K)',
              '  - Available subtitles',
              '  - Licensing info (region-locked?)',
              'Check user subscription: has access?'
            ],
            output: 'Playback authorized, metadata loaded',
            timing: '50-100ms'
          },
          {
            stage: 'Media Manifest Generation',
            actors: ['Transcoding Service', 'Manifest Generator'],
            process: [
              'HLS/DASH protocol: breaks video into segments',
              'Typically 10-second segments',
              'Generate manifest: lists all segments + qualities',
              'Example manifest:',
              '  - 480p: segment1.ts, segment2.ts, ...',
              '  - 720p: segment1.ts, segment2.ts, ...',
              '  - 1080p: segment1.ts, segment2.ts, ...'
            ],
            output: 'HLS/DASH manifest',
            timing: 'Pre-computed (stored in DB)'
          },
          {
            stage: 'Adaptive Bitrate Selection',
            actors: ['Client Device', 'Network Monitor'],
            process: [
              'Client measures: current bandwidth',
              'Device specs: screen resolution, available RAM',
              'Selects quality: matching available bandwidth',
              'Example: 5Mbps network → request 720p',
              'Auto-adjust: as bandwidth changes'
            ],
            output: 'Optimal quality selected',
            timing: 'Continuous (every 2-3 segments)'
          },
          {
            stage: 'CDN Delivery',
            actors: ['Content Delivery Network', '300+ edge locations'],
            process: [
              'Request segment from nearest CDN edge',
              'Edge checks local cache:',
              '  - Cache hit: return immediately',
              '  - Cache miss: fetch from origin, cache, return',
              'Cache duration: 30 days (popular content stays cached)'
            ],
            output: 'Video segment delivered',
            timing: '10-50ms (cached), 200-500ms (first access)'
          },
          {
            stage: 'Buffer Management',
            actors: ['Player', 'Adaptive Algorithm'],
            process: [
              'Buffer strategy: Keep 5-30 seconds ahead',
              'Too full: Upgrade quality',
              '  Low: Downgrade quality',
              'Stall avoidance: Switch to lower quality proactively'
            ],
            output: 'Smooth playback without buffering',
            timing: 'Real-time buffering decisions'
          }
        ]
      },

      {
        name: 'Transcoding Pipeline',
        description: 'Converting content to multiple qualities',
        stages: [
          {
            stage: 'Upload & Ingestion',
            actors: ['Content Creator', 'Upload Service', 'S3'],
            process: [
              'Creator uploads video (any format)',
              'Stored in S3: raw video',
              'Job enqueued: transcode to multiple formats'
            ],
            output: 'Raw video uploaded',
            timing: '5-60 minutes depending on size'
          },
          {
            stage: 'Transcoding Processing',
            actors: ['Transcoding Service', 'EC2 Clusters'],
            process: [
              'Parallel transcoding: 10-50 compute nodes',
              'Generate outputs:',
              '  - 480p (2Mbps): ~1GB',
              '  - 720p (4Mbps): ~2GB',
              '  - 1080p (8Mbps): ~4GB',
              '  - 4K (20Mbps): ~10GB',
              '- Create segments: 10-second chunks'
            ],
            output: 'Transcoded video in multiple qualities',
            timing: '1-6 hours for 2-hour movie'
          },
          {
            stage: 'Manifest Creation & Publishing',
            actors: ['Manifest Generator', 'CDN'],
            process: [
              'Generate HLS/DASH manifest files',
              'Upload to S3',
              'Replicate to CDN (300+ edge locations)',
              'Video now available for playback'
            ],
            output: 'Video published and available',
            timing: '5-30 minutes for global propagation'
          }
        ]
      }
    ],

    systemFlows: [
      {
        name: 'Complete Video Watch Journey',
        steps: [
          'User opens Netflix → Homepage loads from cache',
          'ML model generates recommendations → In real-time',
          'User scrolls → More recommendations loaded (infinite scroll)',
          'User clicks video → Details page loads',
          'Description, trailers, subtitles shown → From DB cache',
          'User clicks "Play" → Video metadata fetched',
          'Client measures bandwidth → Selects 720p',
          'HLS manifest requested → Lists all 720p segments',
          'First segment requested → CDN delivers from cache',
          'Buffer accumulates → 5-10 segments ahead',
          'Playback starts → Watching begins',
          'Network speed increases → Upgrade to 1080p',
          'Continue fetching segments → While watching',
          'User pauses → Stop fetching',
          'User resumes → Resume from current position',
          'Video finishes → Mark as watched in DB',
          'Show recommendations → Based on watch history'
        ]
      }
    ],

    metrics: {
      concurrentViewers: '10 million simultaneously',
      contentLibrary: '50,000+ titles',
      transcodeOutputs: '4-6 per video per quality level',
      avgBitratePerViewer: '3-8 Mbps',
      peakBandwidth: '10 Petabits per second'
    }
  }
};

export default TOPIC_VISUALIZATIONS;
