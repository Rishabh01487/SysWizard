/**
 * Enhanced UI Components for System Design Visualizer
 * Rishi Chat, System Design Generator, Visual Displays
 */

export function setupRishiChatPanel() {
  const chatPanelHTML = `
    <div id="rishi-chat-panel" class="rishi-chat-panel">
      <div class="rishi-header">
        <span class="rishi-title">💡 Rishi AI - System Design Guide</span>
        <button id="close-rishi-btn" class="btn-close">&times;</button>
      </div>
      
      <div id="rishi-messages" class="rishi-messages">
        <div class="rishi-message rishi-welcome">
          <strong>Rishi:</strong> Hello! I'm Rishi, your system design expert. Ask me anything about:
          <ul>
            <li>Scalability & Load Balancing</li>
            <li>Databases & Caching</li>
            <li>Microservices & APIs</li>
            <li>Message Queues & Events</li>
            <li>System Design Patterns</li>
            <li>Real-time systems & WebSockets</li>
            <li>Monitoring & Debugging</li>
          </ul>
          What would you like to know?
        </div>
      </div>
      
      <div class="rishi-input-area">
        <input 
          id="rishi-question" 
          type="text" 
          placeholder="Ask me about system design..."
          class="rishi-input"
        />
        <button id="rishi-send-btn" class="btn btn-primary">Send</button>
      </div>
      
      <div id="rishi-suggestions" class="rishi-suggestions">
        <button class="suggestion-btn" data-q="How do I scale a system for 1 million users?">Scale to 1M users</button>
        <button class="suggestion-btn" data-q="What is database sharding and when to use it?">Database Sharding</button>
        <button class="suggestion-btn" data-q="How do I handle real-time updates efficiently?">Real-time Updates</button>
      </div>
    </div>
  `;

  return chatPanelHTML;
}

export function setupDesignGeneratorPanel() {
  const generatorHTML = `
    <div id="design-generator-panel" class="design-generator-panel">
      <div class="generator-header">
        <span class="generator-title">🏗️ System Design Generator</span>
        <button id="close-generator-btn" class="btn-close">&times;</button>
      </div>
      
      <div class="generator-form">
        <div class="form-group">
          <label for="app-description">What is your application?</label>
          <textarea 
            id="app-description" 
            placeholder="E.g., A ride-sharing app like Uber, or a real-time chat application..."
            rows="4"
            class="form-control"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="expected-users">Expected Concurrent Users</label>
            <select id="expected-users" class="form-control">
              <option value="1000">1,000 users</option>
              <option value="10000" selected>10,000 users</option>
              <option value="100000">100,000 users</option>
              <option value="1000000">1,000,000 users</option>
              <option value="10000000">10,000,000 users</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="app-type">Application Type</label>
            <select id="app-type" class="form-control">
              <option value="generic" selected>Auto-detect</option>
              <option value="marketplace">Marketplace</option>
              <option value="social">Social Media</option>
              <option value="messaging">Messaging</option>
              <option value="video">Video Streaming</option>
              <option value="search">Search Engine</option>
            </select>
          </div>
        </div>
        
        <button id="generate-design-btn" class="btn btn-primary btn-lg btn-block">
          Generate Design
        </button>
      </div>
      
      <div id="generated-design-output" class="generated-design-output">
        <!-- Canvas for architecture visualization -->
        <canvas id="architecture-canvas" width="1200" height="700" style="border: 1px solid #475569; border-radius: 8px; margin: 20px 0; display: block; background: #0f172a;"></canvas>
        
        <!-- Text-based architecture details -->
        <div id="design-details" style="margin-top: 20px;"></div>
      </div>
    </div>
  `;

  return generatorHTML;
}

export function setupTopicVisualizationPanel() {
  const vizHTML = `
    <div id="topic-viz-panel" class="topic-viz-panel">
      <div class="viz-header">
        <span id="viz-title" class="viz-title">🎨 Algorithms &amp; Visualizations</span>
        <button id="close-viz-btn" class="btn-close">&times;</button>
      </div>

      <div class="viz-container" style="overflow-y:auto; height: calc(100% - 56px); padding: 20px;">

        <!-- Big O Complexity Table -->
        <div class="viz-section">
          <h3 class="viz-section-title">⏱️ Big O Complexity Reference</h3>
          <div style="overflow-x:auto;">
            <table class="bigo-table">
              <thead><tr><th>Operation</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th></tr></thead>
              <tbody>
                <tr><td>Array Access</td><td class="bigo-green">O(1)</td><td class="bigo-green">O(1)</td><td class="bigo-green">O(1)</td><td class="bigo-green">O(n)</td></tr>
                <tr><td>Binary Search</td><td class="bigo-green">O(1)</td><td class="bigo-yellow">O(log n)</td><td class="bigo-yellow">O(log n)</td><td class="bigo-green">O(1)</td></tr>
                <tr><td>Hash Table Lookup</td><td class="bigo-green">O(1)</td><td class="bigo-green">O(1)</td><td class="bigo-red">O(n)</td><td class="bigo-yellow">O(n)</td></tr>
                <tr><td>BFS / DFS</td><td class="bigo-yellow">O(1)</td><td class="bigo-orange">O(V+E)</td><td class="bigo-orange">O(V+E)</td><td class="bigo-orange">O(V)</td></tr>
                <tr><td>Merge Sort</td><td class="bigo-yellow">O(n log n)</td><td class="bigo-yellow">O(n log n)</td><td class="bigo-yellow">O(n log n)</td><td class="bigo-yellow">O(n)</td></tr>
                <tr><td>Quick Sort</td><td class="bigo-yellow">O(n log n)</td><td class="bigo-yellow">O(n log n)</td><td class="bigo-red">O(n²)</td><td class="bigo-yellow">O(log n)</td></tr>
                <tr><td>Heap Push/Pop</td><td class="bigo-yellow">O(log n)</td><td class="bigo-yellow">O(log n)</td><td class="bigo-yellow">O(log n)</td><td class="bigo-yellow">O(n)</td></tr>
                <tr><td>Bloom Filter Check</td><td class="bigo-green">O(k)</td><td class="bigo-green">O(k)</td><td class="bigo-green">O(k)</td><td class="bigo-green">O(m)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Algorithm Cards -->
        <div class="viz-section">
          <h3 class="viz-section-title">🧮 Key Algorithms in System Design</h3>
          <div class="viz-algo-grid">

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🔄</div>
              <div class="viz-algo-name">Consistent Hashing</div>
              <div class="viz-algo-complexity">O(log n) lookup · O(k log n) add</div>
              <p class="viz-algo-desc">Distributes load across servers using a virtual ring. Adding/removing servers only remaps <em>k/n</em> keys, minimizing cache misses. Used in DynamoDB, Cassandra, Redis Cluster.</p>
              <div class="viz-algo-tags"><span>Distributed</span><span>Sharding</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🚦</div>
              <div class="viz-algo-name">Token Bucket Rate Limiting</div>
              <div class="viz-algo-complexity">O(1) per request · O(n) storage</div>
              <p class="viz-algo-desc">Tokens refill at a fixed rate. Each request costs 1 token. When empty, requests are rejected. Allows controlled bursts unlike Leaky Bucket. Used by AWS API Gateway and Stripe.</p>
              <div class="viz-algo-tags"><span>Rate Limiting</span><span>API</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">💾</div>
              <div class="viz-algo-name">LRU Cache</div>
              <div class="viz-algo-complexity">O(1) get/put · O(capacity) space</div>
              <p class="viz-algo-desc">Least Recently Used eviction using a HashMap + Doubly Linked List. O(1) for all operations. Foundational for Redis, CPU caches, and CDN edge caches.</p>
              <div class="viz-algo-tags"><span>Cache</span><span>HashMap</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🔍</div>
              <div class="viz-algo-name">Binary Search</div>
              <div class="viz-algo-complexity">O(log n) time · O(1) space</div>
              <p class="viz-algo-desc">Halves the search space each iteration on sorted data. Powers database index range scans (B-Tree), sorted set lookups in Redis, and time-series range queries.</p>
              <div class="viz-algo-tags"><span>Search</span><span>Database</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🌸</div>
              <div class="viz-algo-name">Bloom Filter</div>
              <div class="viz-algo-complexity">O(k) insert/query · O(m) space</div>
              <p class="viz-algo-desc">Probabilistic set membership test — no false negatives, small false positive rate. Used by Cassandra and HBase to avoid disk reads for non-existent rows. Saves massive I/O.</p>
              <div class="viz-algo-tags"><span>Probabilistic</span><span>Cache</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🌊</div>
              <div class="viz-algo-name">BFS / Level Order Search</div>
              <div class="viz-algo-complexity">O(V+E) time · O(V) space</div>
              <p class="viz-algo-desc">Explores nodes level by level. Powers shortest-path in social graphs (LinkedIn connections), friend recommendations, and minimum-hops routing in CDN networks.</p>
              <div class="viz-algo-tags"><span>Graph</span><span>Shortest Path</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">📊</div>
              <div class="viz-algo-name">HyperLogLog</div>
              <div class="viz-algo-complexity">O(1) per element · O(log log n) space</div>
              <p class="viz-algo-desc">Estimates unique element count (cardinality) using hashing with ~2% error margin. Redis uses it for PFCOUNT. Used to count unique DAU without storing every user ID.</p>
              <div class="viz-algo-tags"><span>Cardinality</span><span>Analytics</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🗳️</div>
              <div class="viz-algo-name">Raft / Paxos Consensus</div>
              <div class="viz-algo-complexity">O(n) messages · quorum: (n/2)+1</div>
              <p class="viz-algo-desc">Leader election + log replication ensures all nodes agree on state. Raft is used by etcd (Kubernetes), CockroachDB, and Consul. Paxos underpins Google Spanner and Chubby.</p>
              <div class="viz-algo-tags"><span>Consensus</span><span>Distributed</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">📏</div>
              <div class="viz-algo-name">Geohash / Quad Tree</div>
              <div class="viz-algo-complexity">O(log n) · O(n) space</div>
              <p class="viz-algo-desc">Encodes (lat, lng) as a hierarchical string prefix enabling fast proximity queries. Uber uses quadtrees for driver lookup; Redis supports GEOSEARCH using Geohash internally.</p>
              <div class="viz-algo-tags"><span>Geo</span><span>Location</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🔢</div>
              <div class="viz-algo-name">Snowflake ID Generation</div>
              <div class="viz-algo-complexity">O(1) · Globally unique</div>
              <p class="viz-algo-desc">64-bit IDs: 41 bits timestamp + 10 bits machine ID + 12 bits sequence. Monotonic and sortable. Twitter, Discord, and Instagram use variants for distributed unique ID generation.</p>
              <div class="viz-algo-tags"><span>ID Gen</span><span>Distributed</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">⚡</div>
              <div class="viz-algo-name">Sliding Window Rate Limiter</div>
              <div class="viz-algo-complexity">O(1) amortized · O(window) space</div>
              <p class="viz-algo-desc">Tracks requests in a rolling time window using Redis sorted sets. More accurate than fixed-window counters — prevents double the requests at window boundaries. Used by Cloudflare.</p>
              <div class="viz-algo-tags"><span>Rate Limiting</span><span>Redis</span></div>
            </div>

            <div class="viz-algo-card">
              <div class="viz-algo-icon">🧩</div>
              <div class="viz-algo-name">MapReduce / Aggregation</div>
              <div class="viz-algo-complexity">O(n) map · O(k log k) reduce</div>
              <p class="viz-algo-desc">Splits data into chunks processed in parallel (Map), then combines results (Reduce). Enables petabyte-scale analytics. Powers Hadoop, Spark, Google BigQuery, and data warehouses.</p>
              <div class="viz-algo-tags"><span>Big Data</span><span>Analytics</span></div>
            </div>

          </div>
        </div>

        <!-- System Design Patterns -->
        <div class="viz-section">
          <h3 class="viz-section-title">🏗️ Core Architecture Patterns</h3>
          <div class="viz-pattern-grid">

            <div class="viz-pattern-card">
              <h4>⚖️ Load Balancing Strategies</h4>
              <ul>
                <li><strong>Round Robin</strong> — Requests distributed sequentially across servers</li>
                <li><strong>Least Connections</strong> — Routes to server with fewest active connections</li>
                <li><strong>IP Hash</strong> — Same client → same server (session stickiness)</li>
                <li><strong>Weighted</strong> — Stronger servers get proportionally more traffic</li>
              </ul>
              <div class="viz-pattern-used">Used by: NGINX, HAProxy, AWS ALB</div>
            </div>

            <div class="viz-pattern-card">
              <h4>🔀 Database Sharding</h4>
              <ul>
                <li><strong>Range Sharding</strong> — user_id 1-1M → Shard A, 1M-2M → Shard B</li>
                <li><strong>Hash Sharding</strong> — hash(user_id) % num_shards</li>
                <li><strong>Directory Sharding</strong> — Lookup table maps keys → shards</li>
                <li><strong>Geo Sharding</strong> — Data lives in region closest to user</li>
              </ul>
              <div class="viz-pattern-used">Used by: MongoDB, Cassandra, MySQL Vitess</div>
            </div>

            <div class="viz-pattern-card">
              <h4>📨 Event-Driven Architecture</h4>
              <ul>
                <li><strong>Kafka</strong> — Durable, ordered, replay-able event log</li>
                <li><strong>Pub/Sub</strong> — Publishers and subscribers decoupled</li>
                <li><strong>CQRS</strong> — Separate read and write models</li>
                <li><strong>Event Sourcing</strong> — State = replay of all past events</li>
              </ul>
              <div class="viz-pattern-used">Used by: LinkedIn, Uber, Netflix</div>
            </div>

            <div class="viz-pattern-card">
              <h4>🛡️ Fault Tolerance Patterns</h4>
              <ul>
                <li><strong>Circuit Breaker</strong> — Stop calling failing services automatically</li>
                <li><strong>Bulkhead</strong> — Isolate failures to one component</li>
                <li><strong>Retry + Backoff</strong> — Retry with exponential delay</li>
                <li><strong>Saga Pattern</strong> — Distributed transactions without 2PC</li>
              </ul>
              <div class="viz-pattern-used">Used by: Netflix Hystrix, AWS, Google</div>
            </div>

            <div class="viz-pattern-card">
              <h4>🌐 Caching Strategies</h4>
              <ul>
                <li><strong>Write-Through</strong> — Write to cache and DB simultaneously</li>
                <li><strong>Write-Behind</strong> — Write to cache, async flush to DB</li>
                <li><strong>Cache-Aside</strong> — App checks cache, loads from DB on miss</li>
                <li><strong>Read-Through</strong> — Cache auto-fetches from DB on miss</li>
              </ul>
              <div class="viz-pattern-used">Used by: Redis, Memcached, Varnish</div>
            </div>

            <div class="viz-pattern-card">
              <h4>📐 CAP Theorem</h4>
              <ul>
                <li><strong>CP Systems</strong> — HBase, ZooKeeper, etcd (strong consistency)</li>
                <li><strong>AP Systems</strong> — Cassandra, DynamoDB (high availability)</li>
                <li><strong>CA Systems</strong> — Traditional RDBMS (single node only)</li>
                <li><strong>PACELC</strong> — Extends CAP: Partition vs Else Latency vs Consistency</li>
              </ul>
              <div class="viz-pattern-used">Core trade-off in every distributed system</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  return vizHTML;
}


export function renderVizualizationDetails(topic, data) {
  const mainFlowsHTML = data.mainFlows.map(flow => `
    <div class="flow-card">
      <h4>${flow.name}</h4>
      <p>${flow.description}</p>
      <div class="stages-list">
        ${flow.stages.map(stage => `
          <div class="stage-detail">
            <strong>${stage.stage}</strong>
            <p>Actors: ${stage.actors.join(', ')}</p>
            <ul class="process-list">
              ${stage.process.map(p => `<li>${p}</li>`).join('')}
            </ul>
            <div class="stage-timing">
              Output: ${stage.output} | Time: ${stage.timing}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return mainFlowsHTML;
}

export function renderDesignGeneratorOutput(design) {
  const html = `
    <div class="design-output">
      <h3>${design.title}</h3>
      
      <div class="design-section">
        <h4>Architecture Overview</h4>
        <div class="architecture-grid">
          <div class="arch-card">
            <strong>Frontend</strong>
            <ul>${design.architecture.frontend.platforms.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>
          
          <div class="arch-card">
            <strong>Services</strong>
            <ul>${design.architecture.services.map(s => `
              <li>${s.name} (${s.technologies})</li>
            `).join('')}</ul>
          </div>
          
          <div class="arch-card">
            <strong>Databases</strong>
            <ul>${design.architecture.databases.map(d => `
              <li>${d.name} - ${d.purpose}</li>
            `).join('')}</ul>
          </div>
          
          <div class="arch-card">
            <strong>Infrastructure</strong>
            <ul>
              <li>Cache: ${design.architecture.cache.provider}</li>
              <li>CDN: ${design.architecture.cdn.provider}</li>
              <li>Queue: ${design.architecture.messageQueue.provider || 'Optional'}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="design-section">
        <h4>Data Flows</h4>
        ${design.dataFlow.map(flow => `
          <div class="flow-summary">
            <strong>${flow.name}</strong>
            <ol>${flow.steps.map(step => `<li>${step}</li>`).join('')}</ol>
          </div>
        `).join('')}
      </div>
      
      <div class="design-section">
        <h4>Scaling Strategy</h4>
        <div class="scaling-info">
          <p><strong>Current Tier:</strong> ${design.scalingStrategy.currentTier}</p>
          <div class="scaling-methods">
            ${Object.entries(design.scalingStrategy.scaling).map(([method, description]) => `
              <p><strong>${method}:</strong> ${description}</p>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="design-section">
        <h4>Estimated Metrics</h4>
        <div class="metrics-grid">
          ${Object.entries(design.estimatedMetrics).map(([metric, value]) => `
            <div class="metric-card">
              <span class="metric-label">${metric.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span class="metric-value">${value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return html;
}

export function addChatMessage(question, isUser = true) {
  const messagesDiv = document.querySelector('#ai-messages') || document.querySelector('#rishi-messages');
  if (!messagesDiv) return;
  const messageDiv = document.createElement('div');
  messageDiv.className = isUser ? 'ai-msg ai-msg-user' : 'ai-msg ai-msg-assistant';

  if (isUser) {
    messageDiv.textContent = question;
  } else {
    // Render Markdown for Rishi's responses
    messageDiv.innerHTML = `<div class="ai-md-content">${simpleMarkdownToHtml(question)}</div>`;
  }

  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function simpleMarkdownToHtml(md) {
  return md
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/^#{3}\s(.+)$/gm, '<h4 class="ai-h4">$1</h4>')
    .replace(/^#{2}\s(.+)$/gm, '<h3 class="ai-h3">$1</h3>')
    .replace(/^#{1}\s(.+)$/gm, '<h2 class="ai-h2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---+$/gm, '<hr class="ai-hr">')
    .replace(/^\|(.+)\|$/gm, (match) => {
      if (match.includes('---')) return '';
      const cells = match.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/^[\-\*]\s(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


export function showLoadingIndicator(message = 'Thinking...') {
  const messagesDiv = document.querySelector('#ai-messages') || document.querySelector('#rishi-messages');
  if (!messagesDiv) return;
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'rishi-loading';
  loadingDiv.className = 'ai-msg ai-msg-assistant loading';
  loadingDiv.textContent = `🤖 Rishi is thinking...`;
  messagesDiv.appendChild(loadingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

export function removeLoadingIndicator() {
  const loadingDiv = document.querySelector('#rishi-loading');
  if (loadingDiv) loadingDiv.remove();
}

export default {
  setupRishiChatPanel,
  setupDesignGeneratorPanel,
  setupTopicVisualizationPanel,
  renderVizualizationDetails,
  renderDesignGeneratorOutput,
  addChatMessage,
  showLoadingIndicator,
  removeLoadingIndicator
};
