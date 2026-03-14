/**
 * Rishi AI Agent — Expert System Design Architect
 * Creates DETAILED system designs for any application
 * Covers: architecture, flows, algorithms, scaling, databases, caching, monitoring
 */

import { SYSTEM_DESIGN_KB } from '../content/systemDesignKnowledgeBase.js';

export class RishiAIAgent {
  constructor() {
    this.name = 'Rishi';
    this.conversationHistory = [];
    this.knowledge = SYSTEM_DESIGN_KB;
  }

  async askQuestion(question) {
    this.conversationHistory.push({ type: 'user', message: question, timestamp: new Date() });

    const lowerQ = question.toLowerCase();
    let response;

    // Detect intent — code questions take priority
    if (this._isCodeRequest(lowerQ)) {
      response = this._generateCodeAnswer(question, lowerQ);
    } else if (this._isDesignRequest(lowerQ)) {
      response = this._generateFullSystemDesign(question);
    } else if (this._isHowRequest(lowerQ)) {
      response = this._generateHowItWorksAnswer(question);
    } else {
      response = this._generateConceptAnswer(question);
    }

    this.conversationHistory.push({ type: 'assistant', message: response, timestamp: new Date() });
    return { answer: response, sources: [], confidence: 90 };
  }

  _isCodeRequest(q) {
    return /code|implement|boilerplate|starter|framework code|snippet|example code|help me code|show me how to code|write .*(function|class|api|server|endpoint|route)|how (do i|to) (implement|write|build|create)|sample code|basic (code|structure|setup)|coding|step by step (code|implementation)/.test(q);
  }

  _isDesignRequest(q) {
    return /design|architect|system for|app like|clone|platform|service|scalable/.test(q)
      && !/code|implement|snippet|boilerplate/.test(q);
  }

  _isHowRequest(q) {
    return /how does|how do|explain|what is|why does|difference between/.test(q);
  }

  _generateCodeAnswer(question, lowerQ) {
    // Detect the topic
    const isAuth = /auth|login|jwt|token|signup|register|session/.test(lowerQ);
    const isApi = /rest api|express|node|server|endpoint|route|backend/.test(lowerQ);
    const isWs = /websocket|socket\.io|real.time|chat|live/.test(lowerQ);
    const isDb = /database|postgres|mysql|mongodb|schema|orm|prisma|sequelize/.test(lowerQ);
    const isRateLimit = /rate limit|throttle|token bucket/.test(lowerQ);
    const isQueue = /queue|kafka|rabbitmq|redis|message/.test(lowerQ);
    const isRide = /uber|ride|driver|geolocation|location/.test(lowerQ);
    const isEcom = /ecommerce|e-commerce|shop|cart|product|order/.test(lowerQ);

    let title = 'Framework Code';
    let intro = '';
    let code = '';
    let explanation = '';

    if (isAuth) {
      title = '🔒 Authentication — JWT + Express Boilerplate';
      intro = 'Here is a complete authentication system using JWT tokens and bcrypt for password hashing:';
      code = `// Install: npm install express jsonwebtoken bcryptjs

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const users = []; // Replace with your database

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const hash = await bcrypt.hash(password, 12);
  const user = { id: Date.now().toString(), name, email, password: hash };
  users.push(user);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: user.id, name, email } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email } });
});

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Protected route example
app.get('/api/profile', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.listen(3000, () => console.log('Auth server running on port 3000'));`;
      explanation = `**How it works:**
- **bcrypt** hashes passwords with a cost factor of 12 (secure but fast enough)
- **JWT** tokens expire after 24 hours — refresh tokens can extend sessions
- The \`authenticate\` middleware protects any route by verifying the token
- Replace the \`users\` array with your database (PostgreSQL, MongoDB etc.)`;

    } else if (isWs) {
      title = '🔌 Real-Time Chat — WebSocket + Socket.io Boilerplate';
      intro = 'Here is a real-time chat server using Socket.io:';
      code = `// Install: npm install express socket.io

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = new Map(); // roomId -> Set of users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    socket.data.username = username;
    socket.data.roomId = roomId;

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(username);

    // Notify others in the room
    socket.to(roomId).emit('user-joined', { username, users: [...rooms.get(roomId)] });
    socket.emit('joined', { roomId, users: [...rooms.get(roomId)] });
  });

  // Send message
  socket.on('send-message', ({ roomId, message }) => {
    const payload = {
      id: Date.now(),
      sender: socket.data.username,
      message,
      timestamp: new Date().toISOString()
    };
    // Broadcast to all in the room including sender
    io.to(roomId).emit('new-message', payload);
  });

  // Typing indicator
  socket.on('typing', ({ roomId }) => {
    socket.to(roomId).emit('user-typing', { username: socket.data.username });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const { roomId, username } = socket.data;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(username);
      socket.to(roomId).emit('user-left', { username });
    }
  });
});

server.listen(3000, () => console.log('Chat server running on port 3000'));`;
      explanation = `**Key concepts:**
- **Rooms** — users join channels; messages only go to room members
- **socket.to(room).emit** — broadcast to everyone except the sender
- **io.to(room).emit** — broadcast to everyone including the sender
- Add Redis Pub/Sub to scale across multiple server instances`;

    } else if (isDb) {
      title = '🗄️ Database Setup — PostgreSQL + Prisma ORM';
      intro = 'Here is a database setup with Prisma ORM (works with PostgreSQL, MySQL, SQLite):';
      code = `// Install: npm install @prisma/client prisma
// Run: npx prisma init

// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}

// ─── Usage in your app ───
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create user
async function createUser(name, email, passwordHash) {
  return await prisma.user.create({
    data: { name, email, password: passwordHash }
  });
}

// Find user
async function findUser(email) {
  return await prisma.user.findUnique({ where: { email } });
}

// Get posts with author
async function getPosts() {
  return await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

// Run migrations: npx prisma migrate dev --name init`;
      explanation = `**How it works:**
- Define your schema in \`prisma/schema.prisma\` — Prisma generates type-safe queries
- Run \`npx prisma migrate dev\` to create tables from the schema
- \`include\` does JOIN queries, \`select\` limits returned fields
- Add indexes: \`@@index([authorId])\` for faster foreign key lookups`;

    } else if (isRide || isEcom) {
      title = isRide ? '🚗 Ride-Sharing App — Basic Express Framework' : '🛒 E-Commerce App — Basic Express Framework';
      intro = `Here is the basic framework for a ${isRide ? 'ride-sharing' : 'e-commerce'} backend:`;
      code = isRide ? `// Install: npm install express mongoose socket.io redis

const express = require('express');
const app = express();
app.use(express.json());

// In-memory stores (replace with MongoDB + Redis)
const drivers = new Map();  // driverId -> { location, status, socketId }
const rides = new Map();    // rideId -> ride object

// Driver: update location
app.post('/api/driver/location', (req, res) => {
  const { driverId, lat, lng, status } = req.body;
  drivers.set(driverId, { lat, lng, status, updatedAt: Date.now() });
  res.json({ success: true });
});

// Rider: request a ride
app.post('/api/ride/request', (req, res) => {
  const { riderId, pickupLat, pickupLng, dropLat, dropLng } = req.body;

  // Find nearest available driver (simple distance formula)
  let nearest = null, minDist = Infinity;
  for (const [driverId, driver] of drivers) {
    if (driver.status !== 'available') continue;
    const dist = Math.hypot(driver.lat - pickupLat, driver.lng - pickupLng);
    if (dist < minDist) { minDist = dist; nearest = { driverId, ...driver }; }
  }

  if (!nearest) return res.status(404).json({ error: 'No drivers available' });

  const rideId = \`ride_\${Date.now()}\`;
  const ride = {
    id: rideId, riderId, driverId: nearest.driverId,
    pickup: { lat: pickupLat, lng: pickupLng },
    drop: { lat: dropLat, lng: dropLng },
    status: 'requested', fare: Math.round(minDist * 15 + 30), // simple fare
    createdAt: new Date()
  };
  rides.set(rideId, ride);

  // Mark driver as busy
  drivers.get(nearest.driverId).status = 'busy';

  res.json({ ride, driver: nearest });
});

// Update ride status
app.patch('/api/ride/:rideId/status', (req, res) => {
  const ride = rides.get(req.params.rideId);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = req.body.status; // 'accepted' | 'picked_up' | 'completed' | 'cancelled'
  if (ride.status === 'completed') drivers.get(ride.driverId).status = 'available';
  res.json({ ride });
});

app.listen(3000, () => console.log('Ride server running'));` :
`// Install: npm install express mongoose stripe

const express = require('express');
const app = express();
app.use(express.json());

const products = []; // Replace with MongoDB
const orders = [];

// List products
app.get('/api/products', (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;
  let result = products;
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search));
  if (category) result = result.filter(p => p.category === category);
  if (minPrice) result = result.filter(p => p.price >= +minPrice);
  if (maxPrice) result = result.filter(p => p.price <= +maxPrice);
  res.json({ products: result, total: result.length });
});

// Add to cart & place order
app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body; // items: [{ productId, quantity }]
  let total = 0;
  const orderItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) throw new Error('Out of stock');
    product.stock -= item.quantity;
    const subtotal = product.price * item.quantity;
    total += subtotal;
    return { ...item, price: product.price, subtotal };
  });

  const order = {
    id: \`order_\${Date.now()}\`, userId, items: orderItems,
    total, status: 'pending', createdAt: new Date()
  };
  orders.push(order);
  res.status(201).json({ order });
});

// Get orders for user
app.get('/api/orders/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json({ orders: userOrders });
});

app.listen(3000, () => console.log('E-Commerce server running'));`;
      explanation = `**Next steps to build on this:**
1. Replace in-memory stores with **MongoDB or PostgreSQL**
2. Add **JWT authentication** middleware to protect routes
3. Add **Redis caching** for product listings (cache 5 minutes)
4. Add **Stripe** for payments: \`stripe.paymentIntents.create()\`
5. Add **input validation** with \`express-validator\` or \`zod\``;

    } else {
      // Generic REST API boilerplate
      title = '⚙️ REST API Framework — Express + Node.js Boilerplate';
      intro = 'Here is a clean, production-ready REST API framework to get started:';
      code = `// Install: npm install express cors helmet morgan dotenv

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ─── Middleware ───
app.use(helmet());          // Security headers
app.use(cors());            // Allow cross-origin requests
app.use(morgan('dev'));      // Request logging
app.use(express.json());    // Parse JSON bodies

// ─── Health check ───
app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// ─── Example resource: users ───
const users = [];

app.get('/api/users', (req, res) => {
  res.json({ users, total: users.length });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const user = { id: Date.now().toString(), name, email, createdAt: new Date() };
  users.push(user);
  res.status(201).json({ user });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.json({ user });
});

app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ success: true });
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`;
      explanation = `**What this covers:**
- **helmet** — sets secure HTTP headers automatically
- **cors** — enables Cross-Origin Resource Sharing for frontend apps
- **morgan** — logs every request with method, URL, status, and response time
- **Error middleware** — catches unhandled errors and returns a clean JSON response

**To extend this:**
1. Add \`/api/posts\`, \`/api/products\` etc. following the same CRUD pattern
2. Add JWT auth — copy the authenticate middleware from the auth example
3. Connect to MongoDB with Mongoose or PostgreSQL with Prisma`;
    }

    return `## ${title}

${intro}

\`\`\`javascript
${code}
\`\`\`

${explanation}

---
💡 **Ask me for more:** "show me the auth code", "add rate limiting to this", "how do I connect this to MongoDB", or "design the full architecture for this app"`;
  }



  _generateFullSystemDesign(question) {
    // Extract the app type from the question
    const appType = this._extractAppType(question);

    return this._buildSystemDesignDocument(appType, question);
  }

  _extractAppType(question) {
    const patterns = [
      { pattern: /uber|ride.sharing|taxi|cab/, name: 'Ride-Sharing App (Uber-style)' },
      { pattern: /instagram|photo|image sharing/, name: 'Photo Sharing Platform (Instagram-style)' },
      { pattern: /twitter|x\.com|social media|tweet/, name: 'Social Media Feed (Twitter-style)' },
      { pattern: /netflix|video stream|streaming/, name: 'Video Streaming Platform (Netflix-style)' },
      { pattern: /whatsapp|chat|messaging|real.time/, name: 'Real-Time Chat Application (WhatsApp-style)' },
      { pattern: /amazon|e.?commerce|shopping/, name: 'E-Commerce Platform (Amazon-style)' },
      { pattern: /youtube|video|upload/, name: 'Video Platform (YouTube-style)' },
      { pattern: /swiggy|zomato|food delivery|doordash/, name: 'Food Delivery Platform (Swiggy-style)' },
      { pattern: /google|search engine/, name: 'Search Engine (Google-style)' },
      { pattern: /url shortener|bit\.ly|tinyurl/, name: 'URL Shortener' },
      { pattern: /pastebin|code share/, name: 'Code/Text Sharing Service' },
      { pattern: /dropbox|google drive|file storage/, name: 'Cloud File Storage (Dropbox-style)' },
      { pattern: /tinder|dating|match/, name: 'Dating App (Tinder-style)' },
      { pattern: /zoom|video call|conference/, name: 'Video Conferencing (Zoom-style)' },
      { pattern: /notification|push alert/, name: 'Notification System' },
      { pattern: /rate limiter/, name: 'Rate Limiter System' },
      { pattern: /ticket|booking|reservation/, name: 'Ticket Booking System (BookMyShow-style)' },
    ];

    for (const { pattern, name } of patterns) {
      if (pattern.test(question.toLowerCase())) return name;
    }

    // Extract noun from question
    const words = question.replace(/design|architect|build|create|system|app|platform/gi, '').trim();
    return words.length > 3 ? `${words} System` : 'Distributed System';
  }

  _buildSystemDesignDocument(appType, originalQuestion) {
    return `# 🏗️ Complete System Design: ${appType}

---

## 1️⃣ Requirements Clarification

### Functional Requirements
${this._getFunctionalRequirements(appType)}

### Non-Functional Requirements
- **Scale**: 100M+ users, 10M+ daily active users
- **Latency**: < 200ms for read operations, < 500ms for writes
- **Availability**: 99.99% uptime (4 nines = ~52 min downtime/year)
- **Consistency**: Eventual consistency acceptable for feeds, strong for payments
- **Durability**: Zero data loss — all data replicated across 3+ data centers

---

## 2️⃣ High-Level Architecture

\`\`\`
[Users/Clients]
      │
      ▼
[DNS + Global Load Balancer (Anycast)]
      │
   ┌──┴──┐
   │ CDN │ ◄─── Static Assets (images, JS, CSS)
   └──┬──┘
      │
[API Gateway / Reverse Proxy]
  ├── Rate Limiting (1000 req/min per user)
  ├── Authentication (JWT token validation)
  ├── Request Routing
  └── SSL Termination
      │
[Microservices Layer]
${this._getMicroservices(appType)}
      │
[Data Layer]
  ├── Primary Database (PostgreSQL / MySQL for transactional data)
  ├── Cache Layer (Redis — TTL 5-60 min)
  ├── Search Engine (Elasticsearch for full-text search)
  ├── Message Queue (Kafka / RabbitMQ for async tasks)
  └── Object Storage (S3 for files, videos, images)
\`\`\`

---

## 3️⃣ Detailed Component Deep-Dive

### 🌐 Load Balancing Layer
${this._getLoadBalancingContent()}

### ⚡ Caching Strategy
${this._getCachingStrategy(appType)}

### 🗄️ Database Design
${this._getDatabaseDesign(appType)}

### 📨 Message Queue & Async Processing
${this._getMessageQueueContent(appType)}

---

## 4️⃣ Key Algorithms & Data Structures

${this._getAlgorithms(appType)}

---

## 5️⃣ Complete Request Flow (Step-by-Step)

${this._getRequestFlow(appType)}

---

## 6️⃣ Scaling Strategy

### Phase 1: 0 → 100K Users
- Single region, single DB
- Redis caching to reduce DB load by 80%
- CDN for static assets
- Basic health monitoring

### Phase 2: 100K → 10M Users
- DB read replicas (1 primary → 5 read replicas)
- Horizontal auto-scaling for API servers (EC2 ASG)
- Multi-AZ deployment for high availability
- Introduce message queues for async processing

### Phase 3: 10M → 100M+ Users
- Database sharding by user ID or geographic region
- Multi-region deployment (US-East, EU-West, AP-Southeast)
- Global Anycast DNS routing
- Dedicated teams per microservice (Conway's Law)

---

## 7️⃣ Failure Handling & Reliability

### Circuit Breaker Pattern
\`\`\`
Request → Circuit Breaker → Downstream Service
              │
     CLOSED (normal) → OPEN (failures ≥ threshold) → HALF-OPEN (probe)
\`\`\`
- Open circuit after 5 failures in 30 seconds
- Retry with exponential backoff (1s → 2s → 4s → 8s)
- Fallback: serve from cache or return graceful degraded response

### Data Replication
- **Primary-Replica**: Write to primary, async replicate to 3 replicas
- **Cross-Region**: Active-Active or Active-Passive for disaster recovery
- **RPO**: < 1 second (Recovery Point Objective)
- **RTO**: < 30 seconds (Recovery Time Objective)

---

## 8️⃣ Monitoring & Observability

### The 3 Pillars
| Pillar | Tool | What to Monitor |
|--------|------|----------------|
| **Metrics** | Prometheus + Grafana | CPU, memory, request rate, error rate, latency |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Application logs, error traces |
| **Tracing** | Jaeger / Zipkin | End-to-end request traces across microservices |

### Key Alerts
- Error rate > 1% → PagerDuty alert
- P99 latency > 500ms → Auto-scale triggered
- DB connections > 80% pool → Alert on-call
- Cache hit rate < 60% → Investigate cache policy

---

## 9️⃣ Security Considerations

- **Authentication**: JWT tokens + refresh tokens (15min access / 7 day refresh)
- **Authorization**: RBAC (Role-Based Access Control)
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **DDoS Protection**: Cloudflare WAF + rate limiting
- **Input Validation**: Sanitize all inputs (prevent SQL injection, XSS)
- **Secrets Management**: AWS Secrets Manager / HashiCorp Vault

---

## 🎯 Interview Tips for ${appType}

1. **Start with requirements** — Always ask clarifying questions first
2. **Back-of-envelope math**: "100M users × 10 requests/day = 11,500 RPS"
3. **Mention tradeoffs** — "We chose eventual consistency here because..."
4. **Scale progressively** — Don't over-engineer from day 1
5. **Identify bottlenecks** — "The DB will be our first bottleneck, so we add replicas"

> 💡 **Rishi's Tip**: The best system design answers show your thought process, not just the final answer. Interviewers want to see HOW you think, not just WHAT you know.`;
  }

  _getFunctionalRequirements(appType) {
    const requirements = {
      'Ride-Sharing App': `- User can request a ride from location A to B
- Driver can accept/reject ride requests
- Real-time GPS tracking of driver location
- Fare calculation based on distance and time
- Payment processing (card, wallet, UPI)
- Rating system (passenger rates driver, driver rates passenger)
- Notifications (ride accepted, driver arriving, trip completed)`,
      'Photo Sharing Platform': `- Users can upload photos with captions and hashtags
- Follow/unfollow other users
- Like and comment on photos
- Home feed showing posts from followed users
- Explore page for trending/recommended content
- Direct messaging between users
- Stories (24-hour disappearing content)`,
      'Real-Time Chat Application': `- 1-on-1 messaging with delivery confirmation
- Group chats (up to 256 members)
- Media sharing (images, video, documents)
- Typing indicators and read receipts
- End-to-end encryption
- Message search
- Voice and video calls`,
    };

    // Match app type
    for (const [key, reqs] of Object.entries(requirements)) {
      if (appType.toLowerCase().includes(key.toLowerCase())) return reqs;
    }

    return `- Core CRUD operations (Create, Read, Update, Delete)
- User authentication and authorization
- Real-time updates via WebSockets
- Search and filtering capabilities
- Notifications (push, email, in-app)
- Analytics and reporting
- API for mobile and web clients`;
  }

  _getMicroservices(appType) {
    return `  ├── User Service        (signup, login, profiles)
  ├── Auth Service        (JWT, OAuth, sessions)
  ├── Content Service     (create, read, update, delete)
  ├── Feed Service        (personalized timelines)
  ├── Search Service      (Elasticsearch integration)
  ├── Notification Service (push, email, SMS)
  ├── Media Service       (upload, transcoding, delivery)
  └── Analytics Service  (event tracking, reporting)`;
  }

  _getLoadBalancingContent() {
    return `**Algorithm**: Least Connections (routes to least busy server)
**Health Checks**: Every 5 seconds (HTTP /health endpoint)
**Failover**: Remove unhealthy server in < 30 seconds
**SSL Termination**: At load balancer (reduces server CPU load)
**Session Persistence**: Use token-based auth (stateless servers)

\`\`\`
Round-Robin:     [S1, S2, S3, S1, S2, S3...]
Least Conn:      [S1=10, S2=15, S3=5] → route to S3
Weighted:        S1=50%, S2=30%, S3=20% (based on capacity)
IP Hash:         hash(IP) % num_servers → sticky sessions
\`\`\``;
  }

  _getCachingStrategy(appType) {
    return `**Cache Layer**: Redis Cluster (3 master + 3 replica nodes)

| Data Type | TTL | Cache Key Pattern |
|-----------|-----|------------------|
| User Profile | 1 hour | \`user:{userId}:profile\` |
| Feed/Timeline | 5 min | \`feed:{userId}:page:{n}\` |
| Session Tokens | 15 min | \`session:{token}\` |
| Config/Settings | 24 hours | \`config:{key}\` |
| Search Results | 2 min | \`search:{query}:hash\` |

**Cache Strategies**:
- **Cache Aside**: App checks cache first, on miss → DB → populate cache
- **Write-Through**: Write to cache + DB simultaneously (strong consistency)
- **Eviction Policy**: LRU (Least Recently Used) with max-memory-policy

**Hit Rate Target**: > 80% (reduces DB load by 80%)`;
  }

  _getDatabaseDesign(appType) {
    return `**Primary DB**: PostgreSQL (ACID transactions, complex queries)
**Sharding Key**: User ID (consistent hashing across 16 shards)
**Replication**: 1 Primary → 3 Read Replicas (async replication)

**Connection Pooling**: PgBouncer (100 real connections serve 10,000 app connections)

**Key Tables**:
\`\`\`sql
-- Users Table
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email); -- Fast login lookup

-- Content Table
CREATE TABLE content (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id),
  body        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_content_user_id ON content(user_id); -- Fast user feed
CREATE INDEX idx_content_created_at ON content(created_at DESC); -- Latest first
\`\`\`

**NoSQL (for high-throughput)**: DynamoDB or Cassandra for:
- Activity feeds (write-heavy, time-series)
- Session storage
- Event logs`;
  }

  _getMessageQueueContent(appType) {
    return `**Technology**: Apache Kafka (10M+ messages/sec)
**Partitioning**: By user_id for ordered delivery

**Topics & Consumers**:
\`\`\`
user.signup    → [Email Service, Analytics, Notification]
content.create → [Feed Fanout Service, Search Indexer, CDN Warmup]
user.action    → [Analytics, Recommendation Engine]
payment.event  → [Ledger, Email, Notification, Audit Log]
\`\`\`

**Benefits**:
- Decouples producers from consumers
- Handles traffic spikes (buffer during peak load)
- Replay events for debugging or new consumers
- Guaranteed delivery with consumer offsets`;
  }

  _getAlgorithms(appType) {
    return `### Consistent Hashing (for DB/Cache Sharding)
\`\`\`
Hash ring with 2^32 positions
Server nodes: S1, S2, S3 placed at hash(serverIP) positions
Data key: placed at hash(key) position → routed to nearest clockwise server
Adding/removing servers: only ~1/N keys need to be moved (vs. ALL keys with modulo)
\`\`\`

### Rate Limiting — Token Bucket Algorithm
\`\`\`
bucket_capacity = 100 requests
refill_rate = 10 requests/second
On each request:
  if tokens > 0: allow request, tokens -= 1
  else: reject with 429 Too Many Requests
  Every second: tokens = min(capacity, tokens + refill_rate)
\`\`\`

### Feed Ranking (for social platforms)
\`\`\`
score = (likes × 3) + (comments × 5) + (shares × 7) + recency_weight
recency_weight = 1 / (1 + hours_since_posted)
top_k_posts = sort_by_score(candidate_posts).take(20)
\`\`\`

### Geospatial Indexing (for location-based apps)
\`\`\`
Geohash: encode (lat, lng) → compact string (e.g., "tzkz1x2q")
Grid search: find all geohashes within radius using prefix matching
QuadTree: spatial partitioning for dense city areas
\`\`\``;
  }

  _getRequestFlow(appType) {
    return `**User Action → Server Response** (complete journey):

\`\`\`
1. USER (browser/app)
   → sends HTTPS POST request with JWT token
   
2. DNS → resolves to nearest load balancer (Anycast routing)

3. LOAD BALANCER
   → validates SSL certificate, terminates TLS
   → routes to least-busy API server (health check: /ping)
   
4. API GATEWAY
   → validates JWT token (Redis cache check, 1ms)
   → applies rate limiting (token bucket, Redis)
   → routes to correct microservice
   
5. MICROSERVICE
   → checks Redis cache for response [1-2ms]
   → cache HIT: return immediately (80% of requests)
   → cache MISS: query database
   
6. DATABASE
   → query via connection pool (PgBouncer)
   → return data rows
   
7. MICROSERVICE
   → populate cache for next request (SET key value EX 300)
   → format response JSON
   → publish event to Kafka topic (async, non-blocking)
   
8. RESPONSE
   → compress with gzip (50-70% size reduction)
   → return to client via load balancer
   
⏱️ Total: 50-150ms (cache hit) | 100-300ms (cache miss)
\`\`\``;
  }

  _generateHowItWorksAnswer(question) {
    const relevantAnswers = this._findRelevantAnswers(question);
    const context = relevantAnswers.length > 0
      ? relevantAnswers[0].answer
      : this._getGenericConceptAnswer(question);

    return `## 📚 ${question.charAt(0).toUpperCase() + question.slice(1)}

${context}

---

### 💡 Summary
Understanding this concept deeply will help you apply it in system design interviews. Ask me to "design a system that uses this" or "explain a specific scenario" for more detail.`;
  }

  _generateConceptAnswer(question) {
    const relevant = this._findRelevantAnswers(question);
    if (relevant.length > 0) {
      return `## 🔍 ${question}

${relevant[0].answer}

${relevant.length > 1 ? `\n**Related Concepts**: ${relevant.slice(1).map(r => r.topic).join(', ')}` : ''}`;
    }
    return `## 🤔 Great question about: "${question}"

I can help with any system design topic! Here are some things you can ask me:

- **"Design a [app type]"** — I'll give you a complete architectural breakdown
- **"How does [technology] work?"** — Detailed explanation with examples
- **"What is [concept]?"** — Clear definition with real-world use cases
- **"Scale [system] to 100M users"** — Step-by-step scaling strategy

**Popular topics**: Load Balancing, Caching, Database Sharding, Microservices, CAP Theorem, Message Queues, Consistent Hashing, Rate Limiting`;
  }

  _findRelevantAnswers(question) {
    const keywords = question.toLowerCase().split(/\s+/);
    const matches = [];

    for (const [, entries] of Object.entries(this.knowledge)) {
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          const score = keywords.filter(kw => kw.length > 3 && (entry.topic?.toLowerCase().includes(kw) || entry.answer?.toLowerCase().includes(kw))).length;
          if (score > 0) matches.push({ ...entry, score });
        }
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  _getGenericConceptAnswer(question) {
    return `This is a fundamental system design concept. Let me break it down:

**Core Idea**: ${question}

**How it works**:
1. At its core, this involves distributing load and ensuring reliability
2. The key tradeoff is between consistency and availability (CAP theorem)
3. Real-world systems use a combination of techniques

**Real-world example**: Netflix, Google, and Uber all solve this by using distributed architectures with caching layers (Redis), message queues (Kafka), and database replication.

Ask me to "design a specific system" and I'll show you exactly how this applies!`;
  }

  getSuggestedFollowups() {
    return [
      'How would you scale this for 1 billion users?',
      'What happens when a server fails?',
      'Design the database schema for this',
    ];
  }
}

export const rishiAgent = new RishiAIAgent();
export default rishiAgent;
