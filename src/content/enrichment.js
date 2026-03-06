/**
 * Enrichment data: algorithms + quiz questions for each topic.
 * Keyed by topic id.
 */
export const ENRICHMENT = {
  'client-server': {
    algorithms: [
      { name: 'Request-Response', description: 'Client sends request, server returns response in a synchronous cycle.', complexity: 'O(1)', type: 'Communication' },
      { name: 'DNS Lookup', description: 'Resolves domain names to IP addresses before connection.', complexity: 'O(log n)', type: 'Resolution' }
    ],
    quizQuestions: [
      { question: 'What does a client do in the client-server model?', options: ['Stores all data', 'Sends requests to the server', 'Manages the database', 'Runs background jobs'], correct: 1 },
      { question: 'HTTP is considered a _____ protocol.', options: ['Stateful', 'Stateless', 'Encrypted', 'Binary'], correct: 1 },
      { question: 'What translates domain names to IP addresses?', options: ['HTTP', 'FTP', 'DNS', 'TCP'], correct: 2 },
      { question: 'Which is NOT a common HTTP method?', options: ['GET', 'POST', 'SEND', 'DELETE'], correct: 2 },
      { question: 'What is a "thick client"?', options: ['A client with slow internet', 'A client that runs significant logic locally', 'A server pretending to be a client', 'A client with large screen'], correct: 1 }
    ]
  },
  'http-rest-apis': {
    algorithms: [
      { name: 'REST Constraints', description: 'Stateless, Uniform Interface, Client-Server, Cacheable, Layered System.', complexity: 'N/A', type: 'Architecture' },
      { name: 'Content Negotiation', description: 'Client and server agree on response format via Accept headers.', complexity: 'O(1)', type: 'Protocol' }
    ],
    quizQuestions: [
      { question: 'Which HTTP method is used to create a resource?', options: ['GET', 'POST', 'PUT', 'PATCH'], correct: 1 },
      { question: 'Which status code means "Not Found"?', options: ['200', '301', '404', '500'], correct: 2 },
      { question: 'What does idempotent mean?', options: ['Fast response', 'Same result on repeated calls', 'Encrypted', 'Stateful'], correct: 1 },
      { question: 'Which method is NOT idempotent?', options: ['GET', 'PUT', 'DELETE', 'POST'], correct: 3 },
      { question: 'REST stands for?', options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Request State Transmission', 'Resource State Transfer'], correct: 1 }
    ]
  },
  'scaling': {
    algorithms: [
      { name: 'Auto-Scaling', description: 'Dynamically adjust number of instances based on metrics like CPU or request count.', complexity: 'O(1)', type: 'Scaling' },
      { name: 'Shared Nothing', description: 'Each node is independent with no shared state, enabling linear horizontal scaling.', complexity: 'O(n)', type: 'Architecture' }
    ],
    quizQuestions: [
      { question: 'What is vertical scaling?', options: ['Adding more machines', 'Upgrading existing machine', 'Adding a load balancer', 'Using a CDN'], correct: 1 },
      { question: 'Which scaling type has a hardware ceiling?', options: ['Horizontal', 'Vertical', 'Both', 'Neither'], correct: 1 },
      { question: 'Horizontal scaling requires what kind of design?', options: ['Monolithic', 'Stateless', 'Single-threaded', 'Synchronous'], correct: 1 },
      { question: 'What is elasticity?', options: ['Server flexibility', 'Auto-scaling based on demand', 'Database replication', 'Memory management'], correct: 1 },
      { question: 'Which is harder to scale horizontally?', options: ['App servers', 'Databases', 'CDN nodes', 'Load balancers'], correct: 1 }
    ]
  },
  'latency-throughput': {
    algorithms: [
      { name: 'Percentile Measurement', description: 'Measure P50/P95/P99 latency to understand performance distribution.', complexity: 'O(n log n)', type: 'Measurement' },
      { name: 'Little\'s Law', description: 'L = λ × W — concurrent requests equals arrival rate times avg latency.', complexity: 'O(1)', type: 'Theory' }
    ],
    quizQuestions: [
      { question: 'What does latency measure?', options: ['Requests per second', 'Time for a single request', 'Server CPU usage', 'Network bandwidth'], correct: 1 },
      { question: 'What does P99 latency mean?', options: ['99% of requests are faster than this', '99% server uptime', '99 ms response time', '99 requests/second'], correct: 0 },
      { question: 'Which is faster: L1 cache or SSD?', options: ['SSD', 'L1 cache', 'They are equal', 'Depends on data size'], correct: 1 },
      { question: 'QPS stands for?', options: ['Quality Per Service', 'Queries Per Second', 'Queue Processing Speed', 'Quick Protocol Standard'], correct: 1 },
      { question: 'High throughput always means low latency.', options: ['True', 'False', 'Only for reads', 'Only for writes'], correct: 1 }
    ]
  },
  'proxies': {
    algorithms: [
      { name: 'Forward Proxy', description: 'Acts on behalf of clients, hiding their identity from the internet.', complexity: 'O(1)', type: 'Routing' },
      { name: 'Reverse Proxy', description: 'Acts on behalf of servers, handling SSL, caching, and load balancing.', complexity: 'O(1)', type: 'Routing' }
    ],
    quizQuestions: [
      { question: 'A forward proxy hides the identity of?', options: ['Server', 'Client', 'Database', 'Load balancer'], correct: 1 },
      { question: 'Nginx is commonly used as a?', options: ['Forward proxy', 'Reverse proxy', 'Database', 'Message queue'], correct: 1 },
      { question: 'What is SSL termination?', options: ['Ending a server', 'Proxy handles HTTPS, backend uses HTTP', 'Removing SSL certificates', 'Browser security feature'], correct: 1 },
      { question: 'An API Gateway is a specialized type of?', options: ['Forward proxy', 'Reverse proxy', 'Database', 'Cache'], correct: 1 },
      { question: 'Which adds latency?', options: ['Direct connection only', 'Proxy (extra network hop)', 'Neither', 'DNS only'], correct: 1 }
    ]
  },
  'db-indexing': {
    algorithms: [
      { name: 'B-Tree', description: 'Self-balancing tree providing O(log n) lookups, supports range queries. Default index type.', complexity: 'O(log n)', type: 'Data Structure' },
      { name: 'Hash Index', description: 'Hash table for O(1) equality lookups, cannot do range queries.', complexity: 'O(1)', type: 'Data Structure' }
    ],
    quizQuestions: [
      { question: 'What is a full table scan?', options: ['Reading every row', 'Reading the index', 'Joining two tables', 'Deleting all rows'], correct: 0 },
      { question: 'B-Tree index lookup complexity?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 2 },
      { question: 'Hash indexes support range queries.', options: ['True', 'False'], correct: 1 },
      { question: 'What is a composite index?', options: ['Index on one column', 'Index on multiple columns', 'Index on all columns', 'No index'], correct: 1 },
      { question: 'Adding indexes slows down which operations?', options: ['SELECT', 'INSERT/UPDATE/DELETE', 'Neither', 'Both'], correct: 1 }
    ]
  },
  'sql-vs-nosql': {
    algorithms: [
      { name: 'ACID Transactions', description: 'Atomicity, Consistency, Isolation, Durability — SQL guarantees.', complexity: 'N/A', type: 'Guarantee' },
      { name: 'BASE', description: 'Basically Available, Soft state, Eventually consistent — NoSQL trade-off.', complexity: 'N/A', type: 'Guarantee' }
    ],
    quizQuestions: [
      { question: 'Which provides ACID guarantees?', options: ['MongoDB', 'Redis', 'PostgreSQL', 'Cassandra'], correct: 2 },
      { question: 'NoSQL databases are designed for?', options: ['Complex joins', 'Horizontal scaling', 'Strict schemas', 'ACID always'], correct: 1 },
      { question: 'Which is a key-value store?', options: ['PostgreSQL', 'MongoDB', 'Redis', 'Neo4j'], correct: 2 },
      { question: 'What is polyglot persistence?', options: ['Using one DB for everything', 'Using multiple DB types', 'DB migration', 'Schema versioning'], correct: 1 },
      { question: 'Which NoSQL type is best for relationship queries?', options: ['Document', 'Key-Value', 'Column-Family', 'Graph'], correct: 3 }
    ]
  },
  'networking-basics': {
    algorithms: [
      { name: 'TCP 3-Way Handshake', description: 'SYN → SYN-ACK → ACK to establish reliable connection.', complexity: 'O(1)', type: 'Protocol' },
      { name: 'Congestion Control', description: 'TCP adjusts sending rate to prevent network congestion (slow start, AIMD).', complexity: 'O(1)', type: 'Flow Control' }
    ],
    quizQuestions: [
      { question: 'TCP guarantees?', options: ['Speed', 'Reliable ordered delivery', 'Minimum latency', 'Encryption'], correct: 1 },
      { question: 'UDP is used for?', options: ['Banking', 'Email', 'Video streaming', 'File download'], correct: 2 },
      { question: 'The TCP handshake has how many steps?', options: ['1', '2', '3', '4'], correct: 2 },
      { question: 'HTTP runs on top of?', options: ['UDP', 'TCP', 'ICMP', 'FTP'], correct: 1 },
      { question: 'Which port does HTTPS use?', options: ['80', '443', '22', '53'], correct: 1 }
    ]
  },
  'acid-transactions': {
    algorithms: [
      { name: '2-Phase Commit (2PC)', description: 'Distributed transaction protocol: prepare phase then commit/abort phase.', complexity: 'O(n)', type: 'Distributed' },
      { name: 'MVCC', description: 'Multi-Version Concurrency Control — readers don\'t block writers.', complexity: 'O(1)', type: 'Concurrency' }
    ],
    quizQuestions: [
      { question: 'What does the A in ACID stand for?', options: ['Availability', 'Atomicity', 'Authentication', 'Authorization'], correct: 1 },
      { question: 'If a transaction partially fails, what happens?', options: ['Partial commit', 'Full rollback', 'Retry once', 'Ignore error'], correct: 1 },
      { question: 'WAL stands for?', options: ['Web Application Layer', 'Write-Ahead Log', 'Wide Area Link', 'Workflow Audit Log'], correct: 1 },
      { question: 'Which isolation level is strictest?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correct: 3 },
      { question: 'Durability means data survives?', options: ['Network failure', 'Server crashes', 'Schema changes', 'API updates'], correct: 1 }
    ]
  },
  'data-serialization': {
    algorithms: [
      { name: 'Protocol Buffers', description: 'Google\'s binary serialization — 3-10x smaller than JSON.', complexity: 'O(n)', type: 'Serialization' },
      { name: 'Schema Evolution', description: 'Adding/removing fields while maintaining backward compatibility.', complexity: 'N/A', type: 'Versioning' }
    ],
    quizQuestions: [
      { question: 'Which format is human-readable?', options: ['Protobuf', 'JSON', 'Avro', 'MessagePack'], correct: 1 },
      { question: 'Protobuf is how much smaller than JSON?', options: ['Same size', '2x', '3-10x', '100x'], correct: 2 },
      { question: 'gRPC uses which serialization?', options: ['JSON', 'XML', 'Protobuf', 'YAML'], correct: 2 },
      { question: 'Schema evolution allows?', options: ['Changing data format without breaking consumers', 'Deleting all data', 'Faster queries', 'Better encryption'], correct: 0 },
      { question: 'Which is used with Apache Kafka?', options: ['Only JSON', 'Only Protobuf', 'JSON, Avro, or Protobuf', 'XML only'], correct: 2 }
    ]
  },
  'load-balancing': {
    algorithms: [
      { name: 'Round Robin', description: 'Cycles through servers sequentially, sending each request to the next in line.', complexity: 'O(1)', type: 'Distribution' },
      { name: 'Least Connections', description: 'Routes to the server with fewest active connections.', complexity: 'O(n)', type: 'Distribution' },
      { name: 'IP Hash', description: 'Hashes client IP for consistent routing to the same server.', complexity: 'O(1)', type: 'Distribution' },
      { name: 'Weighted Round Robin', description: 'Assigns more traffic to powerful servers based on weight configuration.', complexity: 'O(1)', type: 'Distribution' }
    ],
    quizQuestions: [
      { question: 'Round Robin distributes requests how?', options: ['Randomly', 'Sequentially to each server', 'To fastest server', 'To nearest server'], correct: 1 },
      { question: 'What detects unhealthy servers?', options: ['DNS', 'Health checks', 'Clients', 'CDN'], correct: 1 },
      { question: 'Layer 4 LB operates at which level?', options: ['Application', 'Transport (TCP)', 'Physical', 'Session'], correct: 1 },
      { question: 'Sticky sessions ensure?', options: ['Faster responses', 'Same client goes to same server', 'Encrypted traffic', 'Compressed data'], correct: 1 },
      { question: 'Which is a popular load balancer?', options: ['Redis', 'MongoDB', 'Nginx', 'Kafka'], correct: 2 }
    ]
  },
  'caching': {
    algorithms: [
      { name: 'LRU (Least Recently Used)', description: 'Evicts the least recently accessed item when cache is full.', complexity: 'O(1)', type: 'Eviction' },
      { name: 'LFU (Least Frequently Used)', description: 'Evicts the least frequently accessed item.', complexity: 'O(log n)', type: 'Eviction' },
      { name: 'Cache-Aside', description: 'App checks cache first, fetches from DB on miss, stores in cache.', complexity: 'O(1)', type: 'Pattern' },
      { name: 'Write-Through', description: 'Write to cache and database simultaneously.', complexity: 'O(1)', type: 'Pattern' }
    ],
    quizQuestions: [
      { question: 'What is a cache hit?', options: ['Data not found', 'Data found in cache', 'Cache is full', 'Cache cleared'], correct: 1 },
      { question: 'TTL stands for?', options: ['Time to Live', 'Transfer to Load', 'Total Traffic Limit', 'Throughput Tracking Log'], correct: 0 },
      { question: 'The hardest problem in CS related to caching?', options: ['Naming things', 'Cache invalidation', 'Sorting', 'Searching'], correct: 1 },
      { question: 'LRU evicts which item?', options: ['Most recently used', 'Least recently used', 'Largest item', 'Oldest item'], correct: 1 },
      { question: 'Redis is commonly used as a?', options: ['Web server', 'Cache', 'DNS server', 'Proxy'], correct: 1 }
    ]
  },
  'cdn': {
    algorithms: [
      { name: 'Pull CDN', description: 'Content cached on first request — lazy loading at the edge.', complexity: 'O(1)', type: 'Distribution' },
      { name: 'Push CDN', description: 'Content pre-loaded to edge servers proactively.', complexity: 'O(n)', type: 'Distribution' }
    ],
    quizQuestions: [
      { question: 'CDN stands for?', options: ['Central Data Network', 'Content Delivery Network', 'Cloud DNS Node', 'Cached Data Nexus'], correct: 1 },
      { question: 'An edge server is?', options: ['Origin server', 'Closest CDN server to user', 'Database server', 'Load balancer'], correct: 1 },
      { question: 'What is PoP?', options: ['Point of Presence', 'Power of Processing', 'Protocol of Proxy', 'Port of Priority'], correct: 0 },
      { question: 'Cache busting is done by?', options: ['Deleting the CDN', 'Versioned file URLs', 'Restarting servers', 'Changing DNS'], correct: 1 },
      { question: 'CloudFlare provides CDN and?', options: ['Database hosting', 'DDoS protection', 'Email service', 'Code hosting'], correct: 1 }
    ]
  },
  'dns-resolution': {
    algorithms: [
      { name: 'Recursive Resolution', description: 'DNS resolver performs full lookup on behalf of client.', complexity: 'O(k)', type: 'Resolution' },
      { name: 'Iterative Resolution', description: 'Each DNS server refers client to the next server in chain.', complexity: 'O(k)', type: 'Resolution' }
    ],
    quizQuestions: [
      { question: 'DNS translates domain names to?', options: ['MAC addresses', 'IP addresses', 'Port numbers', 'URLs'], correct: 1 },
      { question: 'How many root DNS servers exist worldwide?', options: ['1', '7', '13', '100'], correct: 2 },
      { question: 'A record maps to?', options: ['IPv6 address', 'IPv4 address', 'Mail server', 'Alias'], correct: 1 },
      { question: 'What is GeoDNS?', options: ['Geographic routing based on location', 'Encrypted DNS', 'DNS for gaming', 'Google DNS'], correct: 0 },
      { question: 'TTL in DNS controls?', options: ['Speed of lookup', 'How long records are cached', 'Number of hops', 'Encryption level'], correct: 1 }
    ]
  },
  'api-gateway': {
    algorithms: [
      { name: 'Request Routing', description: 'Routes API calls to appropriate microservices based on URL path.', complexity: 'O(1)', type: 'Routing' },
      { name: 'Circuit Breaker', description: 'Stops forwarding to failing services, allows recovery time.', complexity: 'O(1)', type: 'Resilience' }
    ],
    quizQuestions: [
      { question: 'An API Gateway provides?', options: ['Database storage', 'Single entry point for APIs', 'File hosting', 'DNS resolution'], correct: 1 },
      { question: 'Which is NOT an API Gateway function?', options: ['Rate limiting', 'Authentication', 'Data storage', 'Request routing'], correct: 2 },
      { question: 'BFF pattern stands for?', options: ['Backend for Frontend', 'Buffer for Failover', 'Balanced File Format', 'Binary Fast Forward'], correct: 0 },
      { question: 'Circuit breaker prevents?', options: ['Cache misses', 'Cascading failures', 'DNS errors', 'SSL expiry'], correct: 1 },
      { question: 'Kong is a popular?', options: ['Database', 'API Gateway', 'CDN', 'Message Queue'], correct: 1 }
    ]
  },
  'rate-limiting': {
    algorithms: [
      { name: 'Token Bucket', description: 'Tokens added at fixed rate; each request consumes a token. Allows bursts.', complexity: 'O(1)', type: 'Rate Limiting' },
      { name: 'Sliding Window', description: 'Tracks requests in a rolling time window for smoother limiting.', complexity: 'O(1)', type: 'Rate Limiting' },
      { name: 'Leaky Bucket', description: 'Processes requests at a constant rate, smoothing out bursts.', complexity: 'O(1)', type: 'Rate Limiting' },
      { name: 'Fixed Window', description: 'Simple counter that resets at interval boundaries.', complexity: 'O(1)', type: 'Rate Limiting' }
    ],
    quizQuestions: [
      { question: 'HTTP 429 means?', options: ['Not Found', 'Server Error', 'Too Many Requests', 'Unauthorized'], correct: 2 },
      { question: 'Token bucket allows?', options: ['Unlimited requests', 'Burst traffic up to bucket size', 'Only 1 request/second', 'No bursts'], correct: 1 },
      { question: 'Which algorithm smooths bursts to constant rate?', options: ['Token Bucket', 'Leaky Bucket', 'Fixed Window', 'Round Robin'], correct: 1 },
      { question: 'Distributed rate limiting typically uses?', options: ['Local memory', 'Redis', 'Files', 'DNS'], correct: 1 },
      { question: 'GitHub API allows how many requests/hour?', options: ['100', '1000', '5000', '10000'], correct: 2 }
    ]
  },
  'db-sharding': {
    algorithms: [
      { name: 'Hash-Based Sharding', description: 'hash(key) % num_shards — even distribution across shards.', complexity: 'O(1)', type: 'Partitioning' },
      { name: 'Range-Based Sharding', description: 'Split data by value ranges (e.g., A-M shard 1, N-Z shard 2).', complexity: 'O(1)', type: 'Partitioning' },
      { name: 'Consistent Hashing', description: 'Minimizes data movement when adding/removing shards.', complexity: 'O(log n)', type: 'Partitioning' }
    ],
    quizQuestions: [
      { question: 'Sharding partitions data?', options: ['Vertically', 'Horizontally across servers', 'Into memory only', 'By file type'], correct: 1 },
      { question: 'A shard key determines?', options: ['Encryption', 'Which shard stores the data', 'Backup schedule', 'Index type'], correct: 1 },
      { question: 'What is a hotspot?', options: ['Fast server', 'One shard getting disproportionate traffic', 'Cache hit', 'Network peak'], correct: 1 },
      { question: 'Cross-shard queries require?', options: ['Simple lookup', 'Scatter-gather pattern', 'DNS resolution', 'Load balancing'], correct: 1 },
      { question: 'Vitess adds sharding to?', options: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'], correct: 2 }
    ]
  },
  'db-replication': {
    algorithms: [
      { name: 'Primary-Replica', description: 'One primary handles writes; replicas handle reads and provide failover.', complexity: 'O(1)', type: 'Replication' },
      { name: 'Synchronous Replication', description: 'Wait for replica ACK before committing — consistent but slower.', complexity: 'O(n)', type: 'Replication' },
      { name: 'Async Replication', description: 'Don\'t wait for replica — faster but may lose recent writes on failure.', complexity: 'O(1)', type: 'Replication' }
    ],
    quizQuestions: [
      { question: 'Primary server handles?', options: ['Only reads', 'Only writes', 'Writes and replication', 'Nothing'], correct: 2 },
      { question: 'Replication lag is?', options: ['Network speed', 'Delay between primary write and replica update', 'Server restart time', 'Query execution time'], correct: 1 },
      { question: 'Failover promotes?', options: ['Client to server', 'Replica to primary', 'Cache to database', 'CDN to origin'], correct: 1 },
      { question: 'Sync replication trades what for consistency?', options: ['Security', 'Speed', 'Storage', 'Availability'], correct: 1 },
      { question: 'Redis Sentinel provides?', options: ['Caching', 'Automatic failover', 'Sharding', 'Encryption'], correct: 1 }
    ]
  },
  'message-queues': {
    algorithms: [
      { name: 'Point-to-Point', description: 'One message consumed by exactly one consumer from the queue.', complexity: 'O(1)', type: 'Messaging' },
      { name: 'Pub/Sub', description: 'One message delivered to all subscribers of a topic.', complexity: 'O(n)', type: 'Messaging' },
      { name: 'Dead Letter Queue', description: 'Failed messages moved to a separate queue after max retries.', complexity: 'O(1)', type: 'Error Handling' }
    ],
    quizQuestions: [
      { question: 'Message queues enable what communication?', options: ['Synchronous', 'Asynchronous', 'Encrypted', 'Compressed'], correct: 1 },
      { question: 'ACK in messaging means?', options: ['Failure notice', 'Message confirmed processed', 'Queue is full', 'Consumer disconnected'], correct: 1 },
      { question: 'Kafka was created by?', options: ['Google', 'Facebook', 'LinkedIn', 'Amazon'], correct: 2 },
      { question: 'Dead letter queue holds?', options: ['Old messages', 'Failed messages', 'Encrypted messages', 'Priority messages'], correct: 1 },
      { question: 'At-least-once delivery means?', options: ['Message may be lost', 'Message delivered one or more times', 'Exactly one delivery', 'No guarantees'], correct: 1 }
    ]
  },
  'reverse-proxy': {
    algorithms: [
      { name: 'SSL Termination', description: 'Proxy handles HTTPS encryption, forwarding plain HTTP to backends.', complexity: 'O(1)', type: 'Security' },
      { name: 'URL Rewriting', description: 'Transform request URLs before proxying to backend services.', complexity: 'O(1)', type: 'Routing' }
    ],
    quizQuestions: [
      { question: 'A reverse proxy sits where?', options: ['After the database', 'In front of backend servers', 'Inside the browser', 'At the ISP'], correct: 1 },
      { question: 'Nginx serves what percentage of the internet?', options: ['5%', '15%', '30%+', '80%'], correct: 2 },
      { question: 'Connection pooling does what?', options: ['Creates new connections each time', 'Reuses connections to backends', 'Closes all connections', 'Encrypts connections'], correct: 1 },
      { question: 'Caddy offers automatic?', options: ['Scaling', 'HTTPS', 'Sharding', 'Caching'], correct: 1 },
      { question: 'Request buffering helps with?', options: ['Slow clients', 'Fast databases', 'DNS resolution', 'File uploads only'], correct: 0 }
    ]
  },
  'cap-theorem': {
    algorithms: [
      { name: 'CP Systems', description: 'Prioritize Consistency + Partition tolerance (e.g., MongoDB with majority reads).', complexity: 'N/A', type: 'Trade-off' },
      { name: 'AP Systems', description: 'Prioritize Availability + Partition tolerance (e.g., Cassandra, DynamoDB).', complexity: 'N/A', type: 'Trade-off' }
    ],
    quizQuestions: [
      { question: 'CAP stands for?', options: ['Cache, API, Protocol', 'Consistency, Availability, Partition Tolerance', 'Compute, Access, Performance', 'Client, Auth, Proxy'], correct: 1 },
      { question: 'During a network partition you must choose between?', options: ['Speed and cost', 'Consistency and availability', 'Storage and compute', 'Read and write'], correct: 1 },
      { question: 'Cassandra is typically classified as?', options: ['CP', 'AP', 'CA', 'None'], correct: 1 },
      { question: 'PACELC extends CAP with?', options: ['Performance metrics', 'Latency vs consistency when no partition', 'Security guarantees', 'Cost analysis'], correct: 1 },
      { question: 'Can a system guarantee all three CAP properties?', options: ['Yes always', 'Only in the cloud', 'No, must sacrifice one during partition', 'Only with replication'], correct: 2 }
    ]
  },
  'consistent-hashing': {
    algorithms: [
      { name: 'Hash Ring', description: 'Data keys and nodes mapped to positions on a circular hash space.', complexity: 'O(log n)', type: 'Distribution' },
      { name: 'Virtual Nodes', description: 'Each physical node gets multiple positions on the ring for even distribution.', complexity: 'O(v log n)', type: 'Distribution' }
    ],
    quizQuestions: [
      { question: 'In consistent hashing, data is assigned to?', options: ['Random servers', 'First node clockwise on ring', 'All nodes equally', 'Nearest IP address'], correct: 1 },
      { question: 'When a node is added, how many keys move?', options: ['All keys', 'None', 'Only ~1/N of keys', 'Half the keys'], correct: 2 },
      { question: 'Virtual nodes solve?', options: ['Security issues', 'Uneven distribution', 'Latency', 'Authentication'], correct: 1 },
      { question: 'Simple modulo hashing causes issues when?', options: ['Data is small', 'Nodes are added/removed', 'Network is fast', 'Cache is full'], correct: 1 },
      { question: 'DynamoDB uses consistent hashing?', options: ['No', 'Yes', 'Only for reads', 'Only for writes'], correct: 1 }
    ]
  },
  // Default fallback for topics without specific enrichment
  '_default': {
    algorithms: [],
    quizQuestions: [
      { question: 'Which is a key principle of system design?', options: ['Single responsibility', 'Write everything in one file', 'Avoid caching', 'Use one server always'], correct: 0 },
      { question: 'Scalability means?', options: ['Code readability', 'Ability to handle growing load', 'Server location', 'Programming language'], correct: 1 },
      { question: 'High availability targets what percentage uptime?', options: ['50%', '90%', '99.99%+', '100% always'], correct: 2 },
      { question: 'Trade-offs in system design are?', options: ['Avoidable', 'Inevitable', 'Only for large systems', 'Only theoretical'], correct: 1 },
      { question: 'Which is NOT a system design concern?', options: ['Scalability', 'Reliability', 'Font choice', 'Performance'], correct: 2 }
    ]
  }
};

/** Get enrichment for a topic, falling back to defaults */
export function getEnrichment(topicId) {
  return ENRICHMENT[topicId] || ENRICHMENT['_default'];
}
