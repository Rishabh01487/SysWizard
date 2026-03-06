/**
 * Category: Real-World System Designs
 * Complete system design case studies for interview preparation.
 */
export const REAL_WORLD = {
    id: 'real-world',
    name: 'Real-World Designs',
    icon: '🏢',
    level: 'advanced',
    topics: [
        {
            id: 'url-shortener', title: 'Design: URL Shortener', icon: '🔗',
            description: 'Design a service like bit.ly that creates short URLs and redirects.',
            tags: ['Interview', 'Classic', 'Hashing'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>URL Shortener</strong> (like bit.ly, tinyurl) generates compact URLs that redirect to original long URLs. Key challenges: generating unique short codes, handling massive read traffic, and analytics.',
                howItWorks: ['User submits a long URL → system generates a unique short code (e.g., abc123)', 'Short code stored in database: abc123 → https://example.com/long-page', 'When user visits short URL → 301/302 redirect to long URL', 'Analytics tracked: click count, referrer, location, time', 'Short codes can be auto-generated (base62) or custom'],
                keyConcepts: ['<strong>Base62 Encoding</strong> — [a-zA-Z0-9] gives 62^7 = 3.5 trillion combinations', '<strong>Counter + Base62</strong> — Auto-increment ID → base62 (simple, no collisions)', '<strong>Hash + Truncate</strong> — MD5/SHA256 of URL → take first 7 chars', '<strong>Read-Heavy</strong> — 100:1 read/write ratio → cache heavily', '<strong>301 vs 302</strong> — 301 permanent (cached), 302 temporary (analytics-friendly)'],
                realWorld: 'bit.ly handles 600M+ clicks/month. TinyURL. Twitter t.co link shortener. YouTube youtu.be.',
                tradeoffs: { pros: ['Simple to implement', 'Useful for sharing, tracking', 'High cache hit rate'], cons: ['Abuse potential (phishing)', 'Custom URLs add complexity', 'Expiry and cleanup management'] },
                codeExample: `# Core Design
API:
  POST /shorten {url: "https://..."} → {short: "abc123"}
  GET  /abc123 → 302 Redirect

Storage:
  Redis Cache: short_code → long_url (hot data)
  PostgreSQL:  short_code, long_url, created_at, clicks

# Base62 encoding
chars = "0-9a-zA-Z"  (62 chars)
id=12345 → base62 → "3d7" → short.url/3d7`,
                interviewTips: ['Estimate: 100M URLs/day, 10B redirects/day', 'Discuss ID generation strategies', 'Explain caching layer for reads']
            }
        },
        {
            id: 'chat-system', title: 'Design: Chat System', icon: '💬',
            description: 'Design a real-time messaging system like WhatsApp or Slack.',
            tags: ['Interview', 'Real-Time', 'WebSocket'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Chat System</strong> delivers messages in real-time between users with features like group chat, read receipts, file sharing, and offline message delivery.',
                howItWorks: ['User connects via WebSocket for real-time messaging', 'Online: message sent directly through WebSocket', 'Offline: message stored in queue, delivered when user reconnects', 'Group messages fanned out to all members', 'Message IDs provide ordering; read receipts track delivery'],
                keyConcepts: ['<strong>WebSocket</strong> — Persistent connection for real-time delivery', '<strong>Message Queue</strong> — Buffer for offline users', '<strong>Fan-Out</strong> — Distribute group messages to all members', '<strong>Message Ordering</strong> — Timestamp + sequence number per conversation', '<strong>Media Storage</strong> — S3 for images/videos, only store URL in message'],
                realWorld: 'WhatsApp: 100B+ messages/day. Slack: channels, threads, rich messages. Discord: voice + text + communities. Signal: end-to-end encrypted.',
                tradeoffs: { pros: ['Real-time UX', 'Rich features (reactions, threads)'], cons: ['Scaling WebSocket connections', 'Group message fan-out cost', 'Offline sync complexity'] },
                codeExample: `# Architecture
WebSocket Gateway → Chat Service → Message Store
                                → Push Notification
                                → Media Service (S3)

# Message Schema
{
  id: "uuid",
  conversation_id: "conv-123",
  sender_id: 42,
  content: "Hello!",
  timestamp: 1700000000,
  status: "delivered"  // sent → delivered → read
}`,
                interviewTips: ['Discuss 1:1 vs group chat differences', 'Explain online/offline delivery', 'Know how to handle message ordering']
            }
        },
        {
            id: 'news-feed', title: 'Design: News Feed', icon: '📰',
            description: 'Design a social media feed like Twitter/Instagram timeline.',
            tags: ['Interview', 'Fan-Out', 'Timeline'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>News Feed</strong> aggregates and ranks posts from people a user follows, displaying them in a personalized timeline. The key challenge is generating feeds for millions of users efficiently.',
                howItWorks: ['User creates a post → stored in Posts DB', 'Fan-out-on-write: push post to all followers\' feed caches', 'Fan-out-on-read: pull posts from all followed users at read time', 'Hybrid: fan-out-on-write for normal users, on-read for celebrities', 'Feed ranked by algorithm (chronological, engagement, ML model)'],
                keyConcepts: ['<strong>Fan-Out-on-Write (Push)</strong> — Write to all followers\' feeds immediately', '<strong>Fan-Out-on-Read (Pull)</strong> — Merge followed users\' posts at read time', '<strong>Hybrid</strong> — Push for normal users, pull for celebrities (millions of followers)', '<strong>Feed Cache</strong> — Redis-based per-user feed cache', '<strong>Ranking</strong> — ML model scores posts for relevance'],
                realWorld: 'Twitter: hybrid feed. Instagram: ML-ranked feed. Facebook: EdgeRank algorithm, now ML-based. LinkedIn: mix of followed content and recommendations.',
                tradeoffs: { pros: ['Push: fast reads, consistent feed', 'Pull: no write amplification'], cons: ['Push: write amplification for celebrities', 'Pull: slow at read time for many follows', 'Ranking adds complexity'] },
                codeExample: `# Fan-Out-on-Write
def create_post(user_id, content):
    post = save_to_db(content)
    followers = get_followers(user_id)  # e.g., 500
    for follower in followers:
        redis.lpush(f"feed:{follower}", post.id)
        redis.ltrim(f"feed:{follower}", 0, 999)

# Celebrity exception (>1M followers): fan-out-on-read
def get_feed(user_id):
    feed = redis.lrange(f"feed:{user_id}", 0, 20)
    celebrity_posts = fetch_recent_from_celebrities()
    return merge_and_rank(feed, celebrity_posts)`,
                interviewTips: ['Explain the celebrity problem with fan-out-on-write', 'Discuss ranking strategies', 'Know the hybrid approach for scale']
            }
        },
        {
            id: 'video-streaming', title: 'Design: Video Streaming', icon: '🎬',
            description: 'Design a video streaming service like YouTube or Netflix.',
            tags: ['Interview', 'CDN', 'Encoding'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Video Streaming</strong> system handles upload, transcoding, storage, and adaptive playback of video content. Netflix serves 250M+ subscribers; YouTube gets 500+ hours of video uploaded per minute.',
                howItWorks: ['User uploads video → stored in object storage (S3)', 'Transcoding service converts to multiple resolutions/codecs', 'Transcoded files distributed to CDN edge servers globally', 'Client player uses adaptive bitrate streaming (ABR)', 'Player switches quality based on network speed (360p → 1080p → 4K)'],
                keyConcepts: ['<strong>Transcoding</strong> — Convert to multiple formats (H.264, VP9, AV1)', '<strong>Adaptive Bitrate (ABR)</strong> — Auto-adjust quality to network speed', '<strong>HLS/DASH</strong> — Streaming protocols that chunk videos into segments', '<strong>CDN</strong> — Serve video from nearest edge (reduces latency)', '<strong>Pre-Signed URLs</strong> — Secure, temporary video access links'],
                realWorld: 'Netflix: 15% of worldwide internet bandwidth. YouTube: 1B+ hours watched/day. Twitch: live streaming with <5s latency.',
                tradeoffs: { pros: ['Global playback with low latency', 'Adaptive quality for all connections'], cons: ['Massive storage costs', 'Transcoding is CPU-intensive', 'CDN bandwidth costs'] },
                codeExample: `# Upload → Transcode → CDN Pipeline
Upload: video.mp4 → S3 (original)
Transcode Queue (Kafka):
  → 240p (200kbps)
  → 480p (800kbps)
  → 720p (2Mbps)
  → 1080p (5Mbps)
  → 4K (15Mbps)
CDN: Push transcoded files to edge servers

# HLS Manifest (m3u8)
#EXT-X-STREAM-INF:BANDWIDTH=800000
/video/480p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000
/video/1080p/index.m3u8`,
                interviewTips: ['Estimate storage: 500hrs/min × 5 resolutions', 'Explain adaptive bitrate streaming', 'Discuss live vs pre-recorded streaming differences']
            }
        },
        {
            id: 'payment-system', title: 'Design: Payment System', icon: '💳',
            description: 'Design a payment processing system like Stripe with idempotency and reconciliation.',
            tags: ['Interview', 'FinTech', 'ACID'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Payment System</strong> processes financial transactions between buyers, merchants, and banks. Key requirements: exactly-once processing, ACID compliance, fraud detection, and regulatory compliance (PCI DSS).',
                howItWorks: ['User initiates payment → Create payment intent with idempotency key', 'Validate payment details, check fraud rules', 'Authorize with card network (Visa/Mastercard)', 'Capture funds and record transaction', 'Settle with merchant bank (typically next business day)'],
                keyConcepts: ['<strong>Idempotency</strong> — Prevent double-charging via unique transaction keys', '<strong>Payment Intent</strong> — Record of payment before processing', '<strong>Authorization vs Capture</strong> — Reserve funds → then charge', '<strong>Reconciliation</strong> — Verify internal records match bank records', '<strong>PCI DSS</strong> — Security standard for handling card data'],
                realWorld: 'Stripe processes billions in payments. PayPal. Square. Razorpay. Adyen. All use ledger-based architectures.',
                tradeoffs: { pros: ['Reliable transactions', 'Fraud protection', 'Regulatory compliance'], cons: ['Extreme complexity', 'Multiple failure modes', 'Long settlement times'] },
                codeExample: `# Payment Flow
1. POST /payments {amount:50, idempotency_key:"ord-123"}
   → status: "created"

2. Authorize with card network
   → status: "authorized" (funds reserved)

3. Capture funds
   → status: "captured" (charged!)

4. Reconciliation (batch, daily)
   → Verify: internal ledger == bank statement

# Double-entry ledger
  Debit:  buyer_account   -$50
  Credit: merchant_account +$50`,
                interviewTips: ['Explain idempotency for payment safety', 'Know the difference between auth and capture', 'Discuss double-entry ledger bookkeeping']
            }
        },
        {
            id: 'notification-system', title: 'Design: Notification System', icon: '🔔',
            description: 'Design a system that delivers push, email, and SMS notifications at scale.',
            tags: ['Interview', 'Push', 'Multi-Channel'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Notification System</strong> sends messages through multiple channels (push, email, SMS, in-app) based on user preferences, priority, and rate limits. It must handle millions of notifications per day reliably.',
                howItWorks: ['Service triggers notification event (e.g., "order shipped")', 'Notification service checks user preferences and channels', 'Message formatted per channel (rich push, HTML email, SMS text)', 'Queued per channel for rate-limited delivery', 'Delivery status tracked (sent, delivered, read, failed)'],
                keyConcepts: ['<strong>Multi-Channel</strong> — Push, Email, SMS, In-App, WebSocket', '<strong>Template Engine</strong> — Reusable message templates with variables', '<strong>Priority Queue</strong> — Critical alerts > marketing > social', '<strong>Rate Limiting</strong> — Don\'t spam users (max 5 push/hour)', '<strong>Delivery Guarantees</strong> — At-least-once with deduplication'],
                realWorld: 'Firebase Cloud Messaging (FCM) for push. AWS SES for email. Twilio for SMS. OneSignal for cross-platform.',
                tradeoffs: { pros: ['User engagement', 'Multi-channel reach', 'Real-time delivery'], cons: ['Notification fatigue', 'Cross-channel coordination', 'Delivery provider dependencies'] },
                codeExample: `# Notification Event
{
  type: "ORDER_SHIPPED",
  user_id: 42,
  data: {order_id: "abc", tracking: "xyz"},
  channels: ["push", "email"]
}

# Pipeline
Event → User Preferences → Template Engine
  → Push Queue → FCM/APNs
  → Email Queue → SendGrid/SES
  → SMS Queue → Twilio`,
                interviewTips: ['Discuss channel preference and fallback logic', 'Explain rate limiting for user experience', 'Know push notification architecture (FCM/APNs)']
            }
        },
        {
            id: 'search-engine', title: 'Design: Search Engine', icon: '🔍',
            description: 'Design a full-text search system like Elasticsearch or Google Search.',
            tags: ['Interview', 'Inverted Index', 'Ranking'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Search Engine</strong> indexes documents and retrieves relevant results for text queries. Core components: web crawling, indexing (inverted index), ranking (TF-IDF, PageRank), and serving results.',
                howItWorks: ['Crawler fetches web pages and extracts text', 'Indexer creates inverted index: word → list of documents', 'Query parser tokenizes and normalizes search query', 'Search finds documents matching all query terms', 'Ranker scores results (TF-IDF, PageRank, ML) and returns top K'],
                keyConcepts: ['<strong>Inverted Index</strong> — Maps words to documents (like a book\'s index)', '<strong>TF-IDF</strong> — Term Frequency × Inverse Document Frequency (relevance scoring)', '<strong>PageRank</strong> — Rank by incoming link quality', '<strong>Tokenization</strong> — Split text into terms, stem, lowercase', '<strong>Sharding</strong> — Partition index across nodes for scale'],
                realWorld: 'Google Search. Elasticsearch powers search at Wikipedia, GitHub, Uber. Apache Solr. Algolia for instant search.',
                tradeoffs: { pros: ['Fast lookups on massive datasets', 'Relevance ranking', 'Full-text capabilities'], cons: ['Index storage overhead', 'Index update latency', 'Ranking quality is complex'] },
                codeExample: `# Inverted Index
"load"     → [doc1, doc5, doc12]
"balancer" → [doc1, doc3, doc12]
"server"   → [doc1, doc2, doc5, doc12]

Query: "load balancer"
→ intersect("load", "balancer") = [doc1, doc12]
→ Rank by TF-IDF score
→ Return: doc1 (score: 0.95), doc12 (score: 0.72)`,
                interviewTips: ['Explain inverted index with example', 'Know TF-IDF scoring formula', 'Discuss real-time indexing challenges']
            }
        },
        {
            id: 'design-process', title: 'System Design Process', icon: '📋',
            description: 'The step-by-step framework for approaching any system design interview question.',
            tags: ['Interview', 'Framework', 'Process'],
            hasAnimation: true,
            content: {
                overview: 'The <strong>System Design Process</strong> is a structured framework for tackling any system design problem. Follow these 4 steps to systematically design scalable systems in interviews and real-world projects.',
                howItWorks: ['Step 1: UNDERSTAND — Clarify requirements, scope, constraints (5 min)', 'Step 2: ESTIMATE — Back-of-envelope calculations for scale (5 min)', 'Step 3: DESIGN — High-level architecture, then deep dive into components (20 min)', 'Step 4: WRAP UP — Discuss trade-offs, bottlenecks, scaling (5 min)', 'Throughout: communicate your thinking, ask questions, acknowledge trade-offs'],
                keyConcepts: ['<strong>Functional Requirements</strong> — What the system DOES (features)', '<strong>Non-Functional Requirements</strong> — Quality attributes (latency, availability, consistency)', '<strong>Back-of-Envelope</strong> — Quick math: QPS, storage, bandwidth estimates', '<strong>High-Level Design</strong> — Box diagram with major components', '<strong>Deep Dive</strong> — Database schema, API design, algorithm choices'],
                realWorld: 'Used in interviews at Google, Meta, Amazon, Netflix, Uber. Same framework applies to real architecture design reviews.',
                tradeoffs: { pros: ['Structured approach prevents getting lost', 'Shows clear thinking to interviewer'], cons: ['Time pressure in interviews', 'Balance breadth vs depth'] },
                codeExample: `# Back-of-Envelope Estimates
Daily Active Users: 100M
Reads/user/day: 20 → QPS = 100M×20/86400 ≈ 23K QPS
Writes/user/day: 2 → QPS = 100M×2/86400 ≈ 2.3K QPS
Storage: 100M users × 1KB = 100GB
Bandwidth: 23K QPS × 10KB = 230 MB/s

# Design Template
1. API Design (endpoints)
2. Data Model (schema)
3. High-Level Architecture (diagram)
4. Deep Dive (scaling, caching, DB choice)`,
                interviewTips: ['Always start by clarifying requirements', 'Show your estimation math', 'Trade-offs are more important than "perfect" answers']
            }
        }
    ]
};
