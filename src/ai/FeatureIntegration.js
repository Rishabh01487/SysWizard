/**
 * Feature Integration Module - Connects Rishi, Design Generator, and Visualizations
 * Handles all event listeners and UI interactions
 */

import {
  setupRishiChatPanel, setupDesignGeneratorPanel, setupTopicVisualizationPanel,
  addChatMessage, showLoadingIndicator, removeLoadingIndicator
} from '../ui/EnhancedComponents.js';
import { rishiAgent } from './RishiAgent.js';
import SystemDesignGenerator from '../engine/SystemDesignGenerator.js';
import ArchitectureVisualizer from '../engine/ArchitectureVisualizer.js';
import FlowVisualizer from '../engine/FlowVisualizer.js';
import DetailedFlowVisualizer from '../engine/DetailedFlowVisualizer.js';
import { TOPIC_VISUALIZATIONS } from '../content/topicVisualizations.js';

export class FeatureIntegration {
  constructor() {
    this.rishiPanel = null;
    this.generatorPanel = null;
    this.vizPanel = null;
    this.isInitialized = false;
  }

  /**
   * Initialize all enhanced features
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.setupUI();
      this.attachEventListeners();
      this.isInitialized = true;
      console.log('✅ Enhanced features initialized: Rishi AI, Design Generator, Topic Visualizations');
    } catch (error) {
      console.error('❌ Error initializing features:', error);
    }
  }

  /**
   * Setup UI panels
   */
  setupUI() {
    // Create feature buttons bar (attach to main content area)
    const main = document.querySelector('#main');
    if (main) {
      const btnBar = document.createElement('div');
      btnBar.className = 'feature-btn-group';
      btnBar.id = 'feature-buttons-bar';
      btnBar.style.cssText = `
        display: flex;
        gap: 10px;
        padding: 12px;
        background: rgba(107,29,110,0.1);
        border-bottom: 1px solid rgba(148,163,184,0.2);
        flex-wrap: wrap;
        align-items: center;
      `;
      btnBar.innerHTML = `
        <button id="btn-rishi" class="feature-btn" title="Ask Rishi AI" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(148,163,184,0.3); background: rgba(107,29,110,0.3); color: #e2e8f0; cursor: pointer; font-weight: 500;">
          🤖 Rishi AI
        </button>
        <button id="btn-generator" class="feature-btn" title="Generate System Design" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(148,163,184,0.3); background: rgba(107,29,110,0.3); color: #e2e8f0; cursor: pointer; font-weight: 500;">
          🏗️ Design Generator
        </button>
        <button id="btn-topic-viz" class="feature-btn" title="Topic Visualization" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(148,163,184,0.3); background: rgba(107,29,110,0.3); color: #e2e8f0; cursor: pointer; font-weight: 500;">
          🎨 Visualizations
        </button>
        <button id="btn-syswizard-visual" class="feature-btn sw-nav-visual-btn" title="SysWizard Visual — Generate Architecture Diagrams" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(168,85,247,0.5); background: linear-gradient(135deg,rgba(107,29,110,0.4),rgba(124,58,237,0.3)); color: #e9d5ff; cursor: pointer; font-weight: 600; animation: swNavGlow 3s ease-in-out infinite;">
          🎨 Manah Patal
        </button>
        <button id="btn-top-game-arena" class="feature-btn" title="Play System Design Games" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(168,85,247,0.8); background: rgba(168,85,247,0.15); color: #d8b4fe; cursor: pointer; font-weight: bold; box-shadow: 0 0 10px rgba(168,85,247,0.2);">
          🎮 Game Arena
        </button>
      `;
      main.insertBefore(btnBar, main.firstChild);
    }

    // Create panels container
    const container = document.createElement('div');
    container.id = 'feature-panels-container';
    // Remove setupRishiChatPanel() as we'll use the one in index.html
    container.innerHTML = setupDesignGeneratorPanel() + setupTopicVisualizationPanel();
    document.body.appendChild(container);

    // Store panel references
    setTimeout(() => {
      this.rishiPanel = document.querySelector('#ai-panel');
      this.generatorPanel = document.querySelector('#design-generator-panel');
      this.vizPanel = document.querySelector('#topic-viz-panel');

      // Ensure the existing Rishi panel from main.js is synchronized
      if (this.rishiPanel) {
        this.rishiPanel.classList.remove('open');
      }
      this.hideAllPanels();
    }, 50);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Wait for panels to be available, then attach listeners
    const attachWithDelay = () => {
      // Rishi Chat Events — both sidebar and top bar buttons
      const sidebarRishiBtn = document.querySelector('#ai-toggle-btn');
      const topBarRishiBtn = document.querySelector('#btn-rishi');
      const closeRishi = document.querySelector('#ai-close-btn');

      if (sidebarRishiBtn) sidebarRishiBtn.onclick = () => this.togglePanel('rishi');
      if (topBarRishiBtn) topBarRishiBtn.onclick = () => this.togglePanel('rishi');
      if (closeRishi) closeRishi.onclick = () => this.hideAllPanels();

      // We'll let main.js handle the send button for the existing panel 
      // but we link it here if needed for suggestions
      const suggestions = document.querySelectorAll('.suggestion-btn');

      suggestions.forEach(btn => {
        btn.onclick = (e) => {
          const q = e.target.dataset.q;
          const input = document.querySelector('#ai-input');
          if (input) input.value = q;
          // Trigger main.js dispatch or same logic
          document.querySelector('#ai-send-btn')?.click();
        };
      });

      // Design Generator Events
      const btnGenerator = document.querySelector('#btn-generator');
      const closeGenerator = document.querySelector('#close-generator-btn');
      const generateBtn = document.querySelector('#generate-design-btn');

      if (btnGenerator) btnGenerator.addEventListener('click', () => this.togglePanel('generator'));
      if (closeGenerator) closeGenerator.addEventListener('click', () => this.hideAllPanels());
      if (generateBtn) generateBtn.addEventListener('click', () => this.generateSystemDesign());

      // Topic Visualization Events
      const btnViz = document.querySelector('#btn-topic-viz');
      const closeViz = document.querySelector('#close-viz-btn');

      if (btnViz) btnViz.addEventListener('click', () => this.togglePanel('viz'));
      if (closeViz) closeViz.addEventListener('click', () => this.hideAllPanels());

      // SysWizard Visual Events
      const btnSWVisual = document.querySelector('#btn-syswizard-visual');
      if (btnSWVisual) {
        btnSWVisual.addEventListener('click', () => {
          import('/src/napkinVisual.js').then(m => m.showVisualDescriptionPanel(null, ''));
        });
      }

      // Top bar Game Arena Button
      const btnTopGameArena = document.querySelector('#btn-top-game-arena');
      if (btnTopGameArena) {
        btnTopGameArena.addEventListener('click', () => {
          this.hideAllPanels();
          window.location.hash = '#game-arena';
        });
      }

      // Topic selector buttons
      const topicButtons = document.querySelectorAll('.topic-selector-btn');
      topicButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const topic = e.target.dataset.topic;
          if (topic) this.showTopicVisualization(topic);
        });
      });

      // If not all loaded yet, try again
      if (!btnGenerator || !btnViz) {
        setTimeout(attachWithDelay, 200);
      } else {
        console.log('✅ Feature integration event listeners attached');
      }

    };

    attachWithDelay();
  }

  /**
   * Send question to Rishi AI
   */
  async sendRishiQuestion() {
    const inputEl = document.querySelector('#ai-input') || document.querySelector('#rishi-question');
    const question = inputEl?.value?.trim();

    if (!question) return;

    // Add user question to chat
    addChatMessage(question, true);
    inputEl.value = '';

    // Show loading
    showLoadingIndicator('Rishi is thinking...');

    try {
      // Get response from Rishi
      const result = await rishiAgent.askQuestion(question);

      // Remove loading and add answer
      removeLoadingIndicator();
      addChatMessage(result.answer, false);

      // Show confidence
      if (result.confidence < 50) {
        addChatMessage(
          `📌 Note: I'm ${result.confidence}% confident in this answer. ` +
          `Consider asking about specific topics like "database sharding" or "load balancing".`,
          false
        );
      }
    } catch (error) {
      removeLoadingIndicator();
      addChatMessage('Sorry, I encountered an error. Please try again.', false);
      console.error('Rishi error:', error);
    }
  }

  /**
   * Generate system design from app description
   */
  async generateSystemDesign() {
    const descEl = document.querySelector('#app-description');
    const usersEl = document.querySelector('#expected-users');
    const typeEl = document.querySelector('#app-type');

    const description = descEl?.value?.trim();
    const users = parseInt(usersEl?.value || '10000');
    const type = typeEl?.value || 'generic';

    if (!description) {
      alert('Please describe your application');
      return;
    }

    // Show generating message
    const outputEl = document.querySelector('#generated-design-output');
    const detailsEl = document.querySelector('#design-details');
    if (detailsEl) detailsEl.innerHTML = '<div class="loading" style="color: #e2e8f0; padding: 20px;">🏗️ Generating system design...</div>';

    try {
      // Generate design
      const design = SystemDesignGenerator.generateDesign(description, type, users);

      // Wait for canvas to be visible
      await new Promise(resolve => setTimeout(resolve, 100));

      // Draw architecture diagram
      const canvas = document.getElementById('architecture-canvas');
      if (canvas) {
        const visualizer = new ArchitectureVisualizer('architecture-canvas');
        visualizer.drawArchitecture(design);

        // Also show topology view
        const topologyCanvas = document.createElement('canvas');
        topologyCanvas.width = 1000;
        topologyCanvas.height = 500;
        topologyCanvas.style.cssText = 'border: 1px solid #475569; border-radius: 8px; margin: 20px 0; display: block; background: #0f172a; width: 100%; height: auto;';

        const topologyViz = new ArchitectureVisualizer(topologyCanvas.id);
        topologyViz.ctx = topologyCanvas.getContext('2d');
        topologyViz.width = topologyCanvas.width;
        topologyViz.height = topologyCanvas.height;
        topologyViz.drawTopology(design);

        outputEl.appendChild(topologyCanvas);
      }

      // Render text details
      if (detailsEl) {
        let html = `
          <div style="color: #e2e8f0;">
            <h3 style="color: #60a5fa; margin: 20px 0 15px 0;">📋 Architecture Summary</h3>
            
            <h4 style="color: #10b981; margin: 15px 0 10px 0;">Frontend Platforms</h4>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              ${design.architecture.frontend.platforms.map(p => `<li>${p}</li>`).join('')}
            </ul>
            
            <h4 style="color: #f97316; margin: 15px 0 10px 0;">🔧 Microservices (${design.architecture.services.length})</h4>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              ${design.architecture.services.slice(0, 6).map(s => `
                <li><strong>${s.name}</strong> - ${s.responsibility} (${s.technologies})</li>
              `).join('')}
              ${design.architecture.services.length > 6 ? `<li>+${design.architecture.services.length - 6} more services</li>` : ''}
            </ul>
            
            <h4 style="color: #ec4899; margin: 15px 0 10px 0;">💾 Data Layer</h4>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              ${design.architecture.databases.map(d => `
                <li><strong>${d.name}</strong> - ${d.purpose || d.type}</li>
              `).join('')}
            </ul>
            
            <h4 style="color: #06b6d4; margin: 15px 0 10px 0;">⚙️ Infrastructure</h4>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              <li><strong>Cache:</strong> ${design.architecture.cache.provider} (${design.architecture.cache.nodes} nodes)</li>
              <li><strong>CDN:</strong> ${design.architecture.cdn.provider}</li>
              <li><strong>Message Queue:</strong> ${design.architecture.messageQueue.provider || 'Optional'}</li>
            </ul>
            
            <h4 style="color: #10b981; margin: 15px 0 10px 0;">📊 Scaling Strategy</h4>
            <p style="color: #cbd5e1;"><strong>Current Tier:</strong> ${design.scalingStrategy.currentTier}</p>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              ${Object.entries(design.scalingStrategy.scaling).map(([method, desc]) => `
                <li><strong>${method}:</strong> ${desc}</li>
              `).join('')}
            </ul>
            
            <h4 style="color: #f59e0b; margin: 15px 0 10px 0;">📈 Estimated Metrics</h4>
            <ul style="margin-left: 20px; color: #cbd5e1;">
              ${Object.entries(design.estimatedMetrics).map(([metric, value]) => `
                <li><strong>${metric.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</li>
              `).join('')}
            </ul>
          </div>
        `;
        detailsEl.innerHTML = html;
      }

      // Store design for potential export
      window.lastGeneratedDesign = design;

      // Show success message
      console.log('✅ Design generated and visualized:', design);
    } catch (error) {
      if (detailsEl) detailsEl.innerHTML = '<div class="error" style="color: #ff6b6b; padding: 20px;">❌ Error generating design. Please try again.</div>';
      console.error('Design generation error:', error);
    }
  }

  /**
   * Show topic visualization with detailed backend flows
   */
  showTopicVisualization(topicKey) {
    const viz = TOPIC_VISUALIZATIONS[topicKey];
    if (!viz) {
      alert('Visualization not available for this topic');
      return;
    }

    this.togglePanel('viz');

    // Update title
    const titleEl = document.querySelector('#viz-title');
    if (titleEl) titleEl.textContent = viz.title;

    // Clear details section
    const detailsEl = document.querySelector('#viz-details');
    if (detailsEl) detailsEl.innerHTML = '<div class="loading" style="color: #e2e8f0;">Loading detailed visualization...</div>';

    // Wait for canvas to be visible, then draw
    setTimeout(() => {
      const canvas = document.getElementById('flow-visualization-canvas');
      if (canvas && viz.mainFlows && viz.mainFlows.length > 0) {
        // Use DetailedFlowVisualizer for comprehensive backend view
        const detailedViz = new DetailedFlowVisualizer('flow-visualization-canvas');
        // Draw the first flow with all details (data structures, DB ops, cache ops)
        detailedViz.drawDetailedFlow(viz.mainFlows[0]);
      }

      // Show comprehensive text details
      if (detailsEl) {
        let html = `
          <div style="color: #e2e8f0; max-height: 500px; overflow-y: auto;">
            <h3 style="color: #60a5fa; margin: 20px 0 15px 0;">📋 ${viz.title} Overview</h3>
            <p style="color: #cbd5e1; margin-bottom: 20px; line-height: 1.6;">${viz.description || ''}</p>
            
            <h4 style="color: #10b981; margin: 20px 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #475569;">🔄 Available Flows & Stages (${viz.mainFlows?.length || 0} main flows)</h4>
            <div style="margin-left: 0;">
              ${(viz.mainFlows || []).map((flow, idx) => `
                <div style="margin-bottom: 18px; padding: 12px; background: rgba(107,29,110,0.2); border-left: 3px solid #8b5cf6; border-radius: 4px;">
                  <strong style="color: #60a5fa; font-size: 14px;">${idx + 1}. ${flow.name}</strong>
                  <p style="color: #cbd5e1; margin: 5px 0; font-size: 12px;">${flow.description || ''}</p>
                  <div style="color: #94a3b8; font-size: 11px;">
                    📊 ${flow.stages?.length || 0} detailed stages
                    ${flow.stages ? flow.stages.map((s, i) => `${i > 0 ? ' → ' : ''}${s.stage.split(' ')[0]}`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${viz.mainFlows && viz.mainFlows[0]?.stages ? `
              <h4 style="color: #f97316; margin: 20px 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #475569;">⚡ First Flow Detailed Breakdown</h4>
              <div style="margin-left: 0; font-size: 12px;">
                ${viz.mainFlows[0].stages.slice(0, 3).map(stage => `
                  <div style="margin-bottom: 14px; padding: 10px; background: rgba(15,23,42,0.5); border-radius: 4px; border: 1px solid #1e293b;">
                    <strong style="color: #60a5fa;">${stage.stage}</strong>
                    ${stage.description ? `<p style="color: #cbd5e1; margin: 3px 0; font-size: 11px;">💡 ${stage.description}</p>` : ''}
                    ${stage.dataStructure ? `<p style="color: #06b6d4; margin: 3px 0; font-size: 10px;">💾 Data: ${stage.dataStructure}</p>` : ''}
                    ${stage.dbOperation ? `<p style="color: #f59e0b; margin: 3px 0; font-size: 10px;">🗄️ DB: ${stage.dbOperation}</p>` : ''}
                    ${stage.cacheOp ? `<p style="color: #ec4899; margin: 3px 0; font-size: 10px;">⚡ Cache: ${stage.cacheOp}</p>` : ''}
                    ${stage.timing ? `<p style="color: #a78bfa; margin: 3px 0; font-size: 10px;">⏱️ ${stage.timing}</p>` : ''}
                    ${stage.metrics ? `<p style="color: #34d399; margin: 3px 0; font-size: 10px;">📈 ${stage.metrics}</p>` : ''}
                  </div>
                `).join('')}
                <p style="color: #94a3b8; font-size: 11px; margin-top: 15px; padding-top: 10px; border-top: 1px solid #475569;">
                  👀 See the detailed visualization above for all ${viz.mainFlows[0].stages?.length || 0} stages with backend operations
                </p>
              </div>
            ` : ''}
            
            ${viz.systemFlows && viz.systemFlows.length > 0 ? `
              <h4 style="color: #34d399; margin: 20px 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #475569;">⚙️ System Flows (${viz.systemFlows.length})</h4>
              <ul style="margin-left: 20px; color: #cbd5e1; font-size: 12px;">
                ${viz.systemFlows.slice(0, 5).map(flow => `
                  <li><strong>${flow.name}</strong> - ${flow.steps?.length || 0} steps</li>
                `).join('')}
              </ul>
            ` : ''}
            
            <div style="color: #94a3b8; font-size: 11px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #475569; background: rgba(107,29,110,0.1); padding: 12px; border-radius: 4px;">
              <strong>💡 Learning Tips:</strong>
              <ul style="margin: 5px 0 0 15px;">
                <li>Each stage shows: actors involved, process steps, data structures</li>
                <li>💾 Data: Shows what data is being passed between systems</li>
                <li>🗄️ DB: Shows database queries and operations</li>
                <li>⚡ Cache: Shows Redis caching strategies and hit rates</li>
                <li>📈 Metrics: Shows performance numbers and scalability info</li>
                <li>⏱️ Timing: Shows latency for each stage</li>
              </ul>
            </div>
          </div>
        `;
        detailsEl.innerHTML = html;
      }

      console.log('✅ Detailed visualization displayed:', topicKey);
    }, 100);
  }

  /**
   * Toggle panel visibility
   */
  togglePanel(panelName) {
    // We don't hide everything if we want to toggle. Just handle specific one.
    if (panelName === 'rishi') {
      const isOpen = this.rishiPanel?.classList.contains('open');
      this.hideAllPanels(); // Close others first
      if (!isOpen) {
        this.rishiPanel?.classList.add('open');
        // Show welcome message on first open
        const messagesDiv = document.querySelector('#ai-messages');
        if (messagesDiv && messagesDiv.children.length === 0) {
          const welcomeDiv = document.createElement('div');
          welcomeDiv.className = 'ai-msg ai-msg-assistant';
          welcomeDiv.textContent = '🧙‍♂️ Hi! I\'m Rishi — your System Design AI. Ask me anything about system design — I\'ll explain concepts, algorithms, trade-offs, and more! You can also describe an app idea and I\'ll generate a visual architecture for you.';
          messagesDiv.appendChild(welcomeDiv);
        }
        const input = document.querySelector('#ai-input') || document.querySelector('#rishi-question');
        input?.focus();
      }
    } else if (panelName === 'generator') {
      const isOpen = this.generatorPanel?.style.display === 'flex';
      this.hideAllPanels();
      if (!isOpen && this.generatorPanel) {
        this.generatorPanel.style.display = 'flex';
        document.querySelector('#app-description')?.focus();
      }
    } else if (panelName === 'viz') {
      const isOpen = this.vizPanel?.style.display === 'flex';
      this.hideAllPanels();
      if (!isOpen && this.vizPanel) {
        this.vizPanel.style.display = 'flex';
      }
    }
  }

  /**
   * Hide all panels
   */
  hideAllPanels() {
    this.rishiPanel?.classList.remove('open');
    if (this.generatorPanel) this.generatorPanel.style.display = 'none';
    if (this.vizPanel) this.vizPanel.style.display = 'none';
  }

  /**
   * Export design as JSON
   */
  exportDesign() {
    if (!window.lastGeneratedDesign) {
      alert('No design to export. Generate a design first.');
      return;
    }

    const json = JSON.stringify(window.lastGeneratedDesign, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-design-${Date.now()}.json`;
    a.click();
  }
}

// Export singleton
export const featureIntegration = new FeatureIntegration();

export default featureIntegration;
