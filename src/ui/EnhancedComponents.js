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
        <span id="viz-title" class="viz-title">🎨 Topic Visualizations</span>
        <button id="close-viz-btn" class="btn-close">&times;</button>
      </div>
      
      <div class="viz-container">
        <!-- Canvas for flow visualization - Increased height for detailed flows -->
        <canvas id="flow-visualization-canvas" width="1200" height="1200" style="border: 1px solid #475569; border-radius: 8px; margin: 10px 0; display: block; background: #0f172a; width: 100%; height: auto;"></canvas>
        
        <!-- Topic selector buttons -->
        <div id="topic-selector" style="margin: 15px 0; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="topic-selector-btn" data-topic="foodDelivery" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: rgba(107,29,110,0.2); color: #e2e8f0; cursor: pointer; font-weight: 500;">🍔 Food Delivery</button>
          <button class="topic-selector-btn" data-topic="ecommerce" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: rgba(107,29,110,0.2); color: #e2e8f0; cursor: pointer; font-weight: 500;">🛒 E-Commerce</button>
          <button class="topic-selector-btn" data-topic="chat" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: rgba(107,29,110,0.2); color: #e2e8f0; cursor: pointer; font-weight: 500;">💬 Chat System</button>
          <button class="topic-selector-btn" data-topic="videoStreaming" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: rgba(107,29,110,0.2); color: #e2e8f0; cursor: pointer; font-weight: 500;">🎬 Video Streaming</button>
        </div>
        
        <!-- Text details -->
        <div id="viz-details" style="margin-top: 15px;"></div>
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
  const messagesDiv = document.querySelector('#rishi-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = isUser ? 'rishi-message user-message' : 'rishi-message ai-message';
  
  if (isUser) {
    messageDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(question)}`;
  } else {
    messageDiv.innerHTML = `<strong>Rishi:</strong> ${question}`;
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function showLoadingIndicator(message = 'Thinking...') {
  const messagesDiv = document.querySelector('#rishi-messages');
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'rishi-loading';
  loadingDiv.className = 'rishi-message ai-message loading';
  loadingDiv.innerHTML = `<strong>Rishi:</strong> <span class="typing-indicator">${message}</span>`;
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
