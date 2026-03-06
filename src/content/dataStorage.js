/**
 * Category: Data & Storage
 * Data structures, storage systems, and processing patterns.
 */
export const DATA_STORAGE = {
    id: 'data-storage',
    name: 'Data & Storage',
    icon: '💾',
    level: 'advanced',
    topics: [
        {
            id: 'bloom-filters', title: 'Bloom Filters', icon: '🌸',
            description: 'Space-efficient probabilistic data structure for membership testing.',
            tags: ['Data Structure', 'Probabilistic', 'Membership'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Bloom Filter</strong> is a space-efficient probabilistic data structure that tests whether an element is a member of a set. It can give <strong>false positives</strong> (says "maybe in set") but <strong>never false negatives</strong> (says "definitely not in set").',
                howItWorks: ['Initialize a bit array of m bits, all set to 0', 'To ADD: hash element with k hash functions, set those k bit positions to 1', 'To QUERY: hash element, check if ALL k positions are 1', 'All 1s = "probably in set" (may be false positive)', 'Any 0 = "definitely NOT in set" (never false negative)'],
                keyConcepts: ['<strong>False Positive Rate</strong> — Increases as more items are added', '<strong>No False Negatives</strong> — If filter says NO, element is definitely not present', '<strong>No Deletion</strong> — Can\'t remove items (use Counting Bloom Filter)', '<strong>Space Efficient</strong> — Much smaller than storing actual elements', '<strong>Optimal k</strong> — k = (m/n) × ln(2) hash functions for n elements in m bits'],
                realWorld: 'Google Chrome: checks URLs against malware list. Cassandra: avoids disk reads for non-existent keys. Medium: recommends articles you haven\'t read. Akamai: prevents one-hit-wonder caching.',
                tradeoffs: { pros: ['Extremely space-efficient', 'O(k) lookup time', 'Perfect for "definitely not" checks'], cons: ['False positives possible', 'Cannot delete elements', 'Size must be chosen upfront'] },
                codeExample: `Bit array (m=10): [0,0,0,0,0,0,0,0,0,0]

Add "cat": hash1=2, hash2=5, hash3=8
[0,0,1,0,0,1,0,0,1,0]

Add "dog": hash1=1, hash2=5, hash3=7
[0,1,1,0,0,1,0,1,1,0]

Query "cat": positions 2,5,8 → all 1 → "probably yes"
Query "bird": positions 1,3,8 → pos 3 is 0 → "definitely no"`,
                interviewTips: ['Explain false positive math', 'Know real-world applications', 'Discuss Counting Bloom Filter for deletions']
            }
        },
        {
            id: 'lsm-trees', title: 'LSM Trees & SSTables', icon: '🌲',
            description: 'Write-optimized storage engine used by Cassandra, RocksDB, LevelDB.',
            tags: ['Storage Engine', 'Write-Optimized', 'Compaction'],
            hasAnimation: true,
            content: {
                overview: '<strong>LSM Tree</strong> (Log-Structured Merge-Tree) is a write-optimized data structure. Writes go to an in-memory buffer (memtable), then flush to sorted files on disk (SSTables). Background compaction merges SSTables.',
                howItWorks: ['Writes go to in-memory memtable (red-black tree or skip list)', 'When memtable is full → flush to disk as SSTable (sorted)', 'SSTables are immutable, sorted key-value files', 'Reads: check memtable → level 0 SSTables → level 1 → ...', 'Background compaction merges SSTables, removes duplicates/deletions'],
                keyConcepts: ['<strong>Memtable</strong> — In-memory sorted buffer for writes', '<strong>SSTable</strong> — Sorted String Table, immutable on-disk file', '<strong>Write-Ahead Log</strong> — Durability before memtable flush', '<strong>Compaction</strong> — Merge SSTables to reduce read amplification', '<strong>Bloom Filter</strong> — Skip SSTables that don\'t contain a key'],
                realWorld: 'Cassandra, RocksDB, LevelDB, HBase, ScyllaDB all use LSM trees. RocksDB is embedded in many systems (MySQL MyRocks, CockroachDB).',
                tradeoffs: { pros: ['Extremely fast writes (sequential I/O)', 'Good compression', 'Scalable'], cons: ['Read amplification (check multiple SSTables)', 'Write amplification (compaction rewrites data)', 'Space amplification (obsolete data before compaction)'] },
                codeExample: `Write Path:
1. Write to WAL (durability)
2. Insert into Memtable (in-memory)
3. When Memtable full → flush to SSTable (disk)

Read Path:
1. Check Memtable
2. Check Bloom Filters for each SSTable
3. Search matching SSTables (newest first)

Compaction: Merge Level 0 → Level 1 → Level 2...`,
                interviewTips: ['Compare LSM trees vs B-Trees (write vs read optimization)', 'Explain the three amplification factors', 'Know compaction strategies: leveled vs size-tiered']
            }
        },
        {
            id: 'mapreduce', title: 'MapReduce', icon: '🗺️',
            description: 'Programming model for processing large datasets in parallel across clusters.',
            tags: ['Big Data', 'Distributed Processing', 'Hadoop'],
            hasAnimation: true,
            content: {
                overview: '<strong>MapReduce</strong> is a programming model for processing massive datasets across a distributed cluster. The <strong>Map</strong> step processes input in parallel, and the <strong>Reduce</strong> step aggregates the results.',
                howItWorks: ['Input data split into chunks across cluster nodes', 'MAP phase: each node processes its chunk, emits (key, value) pairs', 'SHUFFLE phase: group all values by key across nodes', 'REDUCE phase: aggregate values for each key', 'Output written to distributed storage'],
                keyConcepts: ['<strong>Map</strong> — Transform input into (key, value) pairs', '<strong>Shuffle & Sort</strong> — Group by key, distribute to reducers', '<strong>Reduce</strong> — Aggregate values per key (sum, count, max)', '<strong>Data Locality</strong> — Move computation to where data lives', '<strong>Fault Tolerance</strong> — Re-execute failed tasks on other nodes'],
                realWorld: 'Google invented MapReduce for web indexing. Hadoop MapReduce. Now largely replaced by Spark. Used for log analysis, ETL, data warehousing.',
                tradeoffs: { pros: ['Simple programming model', 'Scalable to petabytes', 'Fault tolerant'], cons: ['High latency (batch processing)', 'Disk-heavy (Spark is faster in-memory)', 'Not suitable for iterative algorithms'] },
                codeExample: `# Word Count Example
Input: "hello world hello"

MAP (per document):
  emit("hello", 1)
  emit("world", 1)
  emit("hello", 1)

SHUFFLE: group by key
  "hello" → [1, 1]
  "world" → [1]

REDUCE: sum values
  "hello" → 2
  "world" → 1`,
                interviewTips: ['Walk through word count example', 'Compare MapReduce vs Spark', 'Know shuffle phase is the bottleneck']
            }
        },
        {
            id: 'wal', title: 'Write-Ahead Log (WAL)', icon: '📝',
            description: 'Durability technique that logs changes before applying them to the database.',
            tags: ['Durability', 'Recovery', 'Database'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Write-Ahead Log (WAL)</strong> records all changes before they are applied to the database. If the system crashes, the WAL can be replayed to recover committed transactions that weren\'t yet flushed to disk.',
                howItWorks: ['Transaction begins → changes written to WAL (sequential write, fast)', 'WAL is fsynced to disk (durable)', 'Changes applied to in-memory data structures', 'Periodically, checkpoint: flush dirty pages to disk', 'On crash recovery: replay WAL from last checkpoint'],
                keyConcepts: ['<strong>Sequential Writes</strong> — WAL writes are sequential (much faster than random writes)', '<strong>Durability</strong> — fsync ensures WAL survives crashes', '<strong>Crash Recovery</strong> — Replay WAL to restore state', '<strong>Checkpoint</strong> — Periodic flush of dirty pages, truncate old WAL', '<strong>Replication</strong> — Ship WAL to replicas for data synchronization'],
                realWorld: 'PostgreSQL WAL. MySQL redo/undo logs. RocksDB WAL. etcd WAL for Raft log. Every serious database uses WAL.',
                tradeoffs: { pros: ['Crash recovery guarantee', 'Fast writes (sequential I/O)', 'Enables replication'], cons: ['Double write (WAL + data pages)', 'Disk space for WAL files', 'Recovery time proportional to WAL size'] },
                codeExample: `Write Path (with WAL):
1. BEGIN TRANSACTION
2. Write change to WAL → fsync (DURABLE!)
3. Update in-memory page cache
4. COMMIT

Crash Recovery:
1. Read WAL from last checkpoint
2. Replay committed transactions
3. Rollback uncommitted transactions
4. Database is consistent again!`,
                interviewTips: ['Explain why sequential writes are fast', 'Know how WAL enables both durability AND replication', 'Discuss checkpoint frequency trade-offs']
            }
        },
        {
            id: 'object-storage', title: 'Object Storage (S3)', icon: '📦',
            description: 'Storing and retrieving unstructured data (files, images, videos) at scale.',
            tags: ['Storage', 'S3', 'Blob', 'Files'],
            hasAnimation: true,
            content: {
                overview: '<strong>Object Storage</strong> stores data as objects (files) with metadata, accessed via HTTP APIs. Unlike file systems (hierarchical) or block storage (low-level), object storage is flat, massively scalable, and ideal for unstructured data.',
                howItWorks: ['Data stored as objects in buckets (flat namespace)', 'Each object has: key (path), data (bytes), metadata', 'Access via HTTP REST API (PUT, GET, DELETE)', 'Objects are immutable (modify = replace)', 'Replicated across data centers for durability (11 nines)'],
                keyConcepts: ['<strong>Bucket</strong> — Container for objects (like a folder)', '<strong>Key</strong> — Unique identifier for an object within a bucket', '<strong>Presigned URL</strong> — Temporary URL for direct upload/download', '<strong>Multi-Part Upload</strong> — Upload large files in parallel chunks', '<strong>Lifecycle Rules</strong> — Auto-archive or delete old objects'],
                realWorld: 'AWS S3 (11 9s durability). Google Cloud Storage. Azure Blob. Used for user uploads, backups, data lakes, static website hosting, ML training data.',
                tradeoffs: { pros: ['Infinite scalability', 'Extreme durability', 'Low cost for large files'], cons: ['Higher latency than local disk', 'Not for small random reads', 'Eventually consistent (in some configs)'] },
                codeExample: `# AWS S3 Operations
# Upload
aws s3 cp image.jpg s3://my-bucket/photos/image.jpg

# Generate presigned URL (temporary access)
url = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket':'my-bucket','Key':'photos/image.jpg'},
    ExpiresIn=3600  # 1 hour
)

# Lifecycle: move to Glacier after 90 days
# Auto-delete after 365 days`,
                interviewTips: ['Know S3 consistency model (strong read-after-write now)', 'Explain presigned URLs for direct uploads', 'Discuss storage classes (Standard, IA, Glacier)']
            }
        },
        {
            id: 'data-partitioning', title: 'Data Partitioning Strategies', icon: '🧮',
            description: 'Techniques for dividing data across multiple databases or tables.',
            tags: ['Scaling', 'Partitioning', 'Sharding'],
            hasAnimation: true,
            content: {
                overview: '<strong>Data Partitioning</strong> divides large datasets into smaller, manageable pieces. <strong>Horizontal partitioning</strong> (sharding) distributes rows across databases. <strong>Vertical partitioning</strong> splits columns. <strong>Functional partitioning</strong> separates by feature.',
                howItWorks: ['Horizontal: rows distributed based on partition key', 'Vertical: split wide tables into narrower tables', 'Functional: different features use different databases', 'Range partitioning: by value ranges (A-M, N-Z)', 'Hash partitioning: partition_id = hash(key) % N'],
                keyConcepts: ['<strong>Horizontal (Sharding)</strong> — Same schema, different rows per partition', '<strong>Vertical</strong> — Split columns (frequently accessed vs rarely accessed)', '<strong>Functional</strong> — Different features use different DBs', '<strong>Hot Partition</strong> — One partition gets disproportionate traffic', '<strong>Rebalancing</strong> — Redistributing data when adding/removing partitions'],
                realWorld: 'Instagram shards user data horizontally. YouTube separates video metadata from comments. Amazon uses all three partitioning strategies.',
                tradeoffs: { pros: ['Enables horizontal scaling', 'Better performance for targeted queries', 'Data locality options'], cons: ['Cross-partition queries are expensive', 'Rebalancing complexity', 'Referential integrity challenges'] },
                codeExample: `# Horizontal: user_id → partition
P0: users 0-999
P1: users 1000-1999  (range-based)
# or: hash(user_id) % 4  (hash-based)

# Vertical: split user table
users_core: id, name, email (fast lookups)
users_profile: id, bio, avatar, settings (large data)

# Functional: separate databases
Auth DB → users, sessions
Product DB → products, categories
Order DB → orders, payments`,
                interviewTips: ['Know horizontal vs vertical vs functional', 'Explain hot partition problem and solutions', 'Discuss rebalancing with consistent hashing']
            }
        }
    ]
};
