/**
 * SysWizard — Main App v3
 * Full-width canvas layout, content drawer, entity-labeled animations, progress ring
 */
import './style.css';
import { AnimationEngine } from './engine/AnimationEngine.js';
import AdvancedFlowVisualizer from './engine/AdvancedFlowVisualizer.js';
import { OllamaService } from './ai/ollamaService.js';
import { VideoRecorder } from './recorder/VideoRecorder.js';
import { CATEGORIES, getAllTopics, searchTopics, getTopicById } from './content/topicRegistry.js';
import { getEnrichment } from './content/enrichment.js';
import { setupGenericAnimation } from './topics/genericAnimation.js';
import { generateTopicDiagram } from './content/topicDiagrams.js';
import { authService } from './auth/authService.js';
import { SystemDesignVisualizer } from './systemDesignVisualizer.js';
import { setupClientServerBespoke } from './topics/bespoke/clientServer.js';
import { setupLoadBalancingBespoke } from './topics/bespoke/loadBalancing.js';
import { setupCachingBespoke } from './topics/bespoke/caching.js';
import { DEEP_ANALYSIS, getDeepAnalysis } from './content/deepAnalysis.js';
import { COMPREHENSIVE_GUIDE } from './content/comprehensiveGuide.js';
import { TOPIC_VISUALIZATIONS } from './content/topicVisualizations.js';
import { SYSTEM_DESIGN_KB } from './content/systemDesignKnowledgeBase.js';
import SystemDesignGenerator from './engine/SystemDesignGenerator.js';
import { KNOWLEDGE_BASE_NOTES } from './content/knowledgeBase.js';
import { ImageGenerator } from './ai/imageGenerator.js';
import { RishiAIAgent, rishiAgent } from './ai/RishiAgent.js';
import { featureIntegration } from './ai/FeatureIntegration.js';

// DOM selections are now consolidated. Using $ helper.
const $ = s => document.querySelector(s);

// Registry & State
const ANIM_MODULES = {
    'client-server': setupClientServerBespoke,
    'load-balancing': setupLoadBalancingBespoke,
    'caching': setupCachingBespoke
};

async function loadAnimModule(name) {
    if (ANIM_MODULES[name]) return ANIM_MODULES[name];
    try { const mod = await import(`./topics/${name}.js`); ANIM_MODULES[name] = mod; return mod; } catch { return null; }
}

// Global DOM
const sidebarNav = $('#sidebar-nav');
const sidebarSearch = $('#sidebar-search');
const homeView = $('#home-view');
const topicView = $('#topic-view');
const topicGrid = $('#topic-grid');
const categoryTabs = $('#category-tabs');
const searchHeader = $('#search-header');
const libraryView = $('#library-view');
const libraryContent = $('#library-content');
const nanoBananaView = $('#nano-banana-view');
const nanoPrompt = $('#nano-prompt');
const nanoGenerateBtn = $('#nano-generate-btn');
const designVisualizer = $('#design-visualizer');
const canvas = $('#main-canvas');
const topicTitle = $('#topic-title');
const stepIndicator = $('#step-indicator');
const stepDescription = $('#step-description');
const contentBody = $('#content-body');
const playBtn = $('#play-btn');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const restartBtn = $('#restart-btn');
const speedSlider = $('#speed-slider');
const speedLabel = $('#speed-label');
const backBtn = $('#back-btn');
const presentationBtn = $('#presentation-btn');
const markCompleteBtn = $('#mark-complete-btn');

// Other View Specifics
const recordBtn = $('#record-btn');
const stopRecordBtn = $('#stop-record-btn');
const recordStatus = $('#record-status');
const progressBadge = $('#progress-badge');
const progressCircle = $('#progress-circle');
const progressPct = $('#progress-pct');
const statTopics = $('#stat-topics');
const statCompleted = $('#stat-completed');
const topicCount = $('#topic-count');
const flowCanvas = $('#flow-canvas');
const flowVisualizationContainer = $('#flow-visualization-container');
const flowTypeSelector = $('#flow-type-selector');
const toggleFlowVizBtn = $('#toggle-flow-viz-btn');
const quizModal = $('#quiz-modal');
const quizBody = $('#quiz-body');
const quizFooter = $('#quiz-footer');
const quizCloseBtn = $('#quiz-close-btn');
const quizModalTitle = $('#quiz-modal-title');
const algoModal = $('#algo-modal');
const algoModalTitle = $('#algo-modal-title');
const algoModalBody = $('#algo-modal-body');
const algoCloseBtn = $('#algo-close-btn');

// AI & Rishi Selections
const aiPanel = $('#ai-panel');
const aiMessages = $('#ai-messages');
const aiInput = $('#ai-input');
const aiSendBtn = $('#ai-send-btn');
const aiCloseBtn = $('#ai-close-btn');
const aiToggleBtn = $('#ai-toggle-btn');
const aiVoiceBtn = $('#ai-voice-btn');
const aiStatusContainer = $('#ai-status-container');

// Auth Form Selections
const loginForm = $('#login-form');
const signupForm = $('#signup-form');
const showSignupLink = $('#show-signup');
const showLoginLink = $('#show-login');
const loginError = $('#login-error');
const signupError = $('#signup-error');

// ─── Core instances (initialized lazily after login) ───
let engine = null;
let flowVisualizer = null;
let recorder = null;
let sdv = null;

// App State
let currentTopic = null;
let currentFilter = 'all';
let currentLevel = 'all';
let activeContentTab = 'learn';
let nanoGenerator = null;

// ─── Progress ───
function updateProgressUI() {
    const done = authService.getCompletedTopics();
    const total = getAllTopics().length;
    const pct = total ? Math.round((done.length / total) * 100) : 0;

    if (progressBadge) progressBadge.textContent = `${done.length} / ${total} done`;
    if (progressPct) progressPct.textContent = `${pct}%`;

    // Progress ring
    if (progressCircle) {
        const circumference = 2 * Math.PI * 17; // r=17
        progressCircle.style.strokeDashoffset = circumference - (pct / 100) * circumference;
    }

    if (statCompleted) statCompleted.textContent = done.length;
    if (statTopics) statTopics.textContent = total;
    if (topicCount) topicCount.textContent = total;

    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('completed', done.includes(el.dataset.topicId)));
    document.querySelectorAll('.topic-card').forEach(el => el.classList.toggle('completed', done.includes(el.dataset.topicId)));

    if (currentTopic) {
        const d = done.includes(currentTopic.id);
        if (markCompleteBtn) {
            markCompleteBtn.textContent = d ? '✓ Completed' : '☐ Mark Complete';
            markCompleteBtn.classList.toggle('completed', d);
        }
    }
}


// ─── Presentaton Mode (Video-like) ───
let isPresentationMode = false;
let presentationTimeout;

function togglePresentationMode() {
    if (!currentTopic || !engine) return;
    isPresentationMode = !isPresentationMode;

    if (isPresentationMode) {
        presentationBtn.innerHTML = '🛑 Stop Presenting';
        presentationBtn.classList.add('active');
        document.body.classList.add('presentation-active');
        // Hide sidebar and right panel for full immersion
        $('#sidebar').style.display = 'none';
        if (aiPanel) aiPanel.classList.remove('open');

        // Start from beginning
        engine.goToStep(0);
        runPresentationStep();
    } else {
        presentationBtn.innerHTML = '🎬 Present';
        presentationBtn.classList.remove('active');
        document.body.classList.remove('presentation-active');
        $('#sidebar').style.display = '';
        clearTimeout(presentationTimeout);
        stopRishiVoice();
    }
}

function runPresentationStep() {
    if (!isPresentationMode || !engine || !currentTopic) return;

    updatePlayBtn();
    updateStepUI();
    const currentStepText = stepDescription.textContent;

    // Cinematic Subtitles
    const subtitleEl = document.getElementById('canvas-subtitles');
    if (subtitleEl) {
        subtitleEl.textContent = currentStepText;
        subtitleEl.classList.add('active');
    }

    // Speak the current step text
    speakRishiVoice(currentStepText, () => {
        // When speech finishes, wait 1.5 seconds and go to next step
        presentationTimeout = setTimeout(() => {
            if (isPresentationMode) {
                if (engine.currentStepIdx < engine.steps.length - 1) {
                    if (subtitleEl) subtitleEl.classList.remove('active');
                    engine.nextStep();
                    setTimeout(runPresentationStep, 400); // Small gap between steps
                } else {
                    // Finished
                    if (subtitleEl) subtitleEl.classList.remove('active');
                    togglePresentationMode();
                }
            }
        }, 1500);
    });
}

// ─── AI Chat UI & Voice Info ───
let isVoiceEnabled = false;

if (aiVoiceBtn) {
    aiVoiceBtn.addEventListener('click', () => {
        isVoiceEnabled = !isVoiceEnabled;
        aiVoiceBtn.classList.toggle('active', isVoiceEnabled);
        if (isVoiceEnabled) {
            aiVoiceBtn.innerHTML = '🔊';
            // Pre-warm the speech engine
            speakRishiVoice("Voice activated. I'm ready to help you with System Design.");
        } else {
            aiVoiceBtn.innerHTML = '🔈';
            stopRishiVoice();
        }
    });
}

function speakRishiVoice(text, onEnd) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech

    // Strip emojis and formatting for cleaner speech
    let cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
    cleanText = cleanText.replace(/[*_`#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
}

function stopRishiVoice() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// ─── Sidebar ───
function renderSidebar() {
    sidebarNav.innerHTML = '';
    for (const cat of CATEGORIES) {
        const div = document.createElement('div');
        div.className = 'nav-category';
        div.innerHTML = `<div class="nav-cat-label" data-cat="${cat.id}">${cat.icon} ${cat.name}</div><div class="nav-cat-items" data-cat="${cat.id}"></div>`;
        const items = div.querySelector('.nav-cat-items');
        for (const topic of cat.topics) {
            const item = document.createElement('div');
            item.className = 'nav-item';
            item.dataset.topicId = topic.id;
            item.innerHTML = `<span class="nav-item-icon">${topic.icon}</span><span>${topic.title}</span><span class="nav-check">✓</span>`;
            item.addEventListener('click', () => openTopic(topic.id));
            items.appendChild(item);
        }
        div.querySelector('.nav-cat-label').addEventListener('click', () => items.classList.toggle('collapsed'));
        sidebarNav.appendChild(div);
    }
}

// ─── Category Tabs ───
function renderCategoryTabs() {
    categoryTabs.innerHTML = '<button class="cat-tab active" data-filter="all">✨ All</button>';
    for (const cat of CATEGORIES) {
        const btn = document.createElement('button');
        btn.className = 'cat-tab';
        btn.dataset.filter = cat.id;
        btn.textContent = `${cat.icon} ${cat.name}`;
        categoryTabs.appendChild(btn);
    }
    categoryTabs.addEventListener('click', e => {
        const btn = e.target.closest('.cat-tab');
        if (!btn) return;
        currentFilter = btn.dataset.filter;
        categoryTabs.querySelectorAll('.cat-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderGrid();
    });
}

// Level Filters
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentLevel = btn.dataset.level;
        document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderGrid();
    });
});

// Search
if (sidebarSearch) sidebarSearch.addEventListener('input', () => { if (!currentTopic) renderGrid(sidebarSearch.value.trim()); });

// ─── Grid ───
function renderGrid(q) {
    let topics;
    if (q) {
        topics = searchTopics(q);
        searchHeader.style.display = '';
        searchHeader.innerHTML = `Found <strong>${topics.length}</strong> topics for "<strong>${q}</strong>"`;
    } else {
        searchHeader.style.display = 'none';
        topics = getAllTopics();
        if (currentFilter !== 'all') topics = topics.filter(t => t.category === currentFilter);
    }
    if (currentLevel !== 'all') topics = topics.filter(t => t.level === currentLevel);

    topicGrid.innerHTML = '';
    for (const topic of topics) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.dataset.topicId = topic.id;
        card.innerHTML = `
      <span class="topic-card-check">✓</span>
      <div class="topic-card-top">
        <span class="topic-card-icon">${topic.icon}</span>
        <span class="topic-level ${topic.level}">${topic.level}</span>
      </div>
      <h3 class="topic-card-title">${topic.title}</h3>
      <p class="topic-card-desc">${topic.description}</p>
      <div class="topic-card-tags">${topic.tags.map(t => `<span class="topic-tag">${t}</span>`).join('')}</div>
      <div class="topic-card-cat">${topic.categoryIcon} ${topic.categoryName}</div>`;
        card.addEventListener('click', () => openTopic(topic.id));
        topicGrid.appendChild(card);
    }
    updateProgressUI();
}

// ─── Open Topic ───
async function openTopic(topicId) {
    currentTopic = getTopicById(topicId);
    if (!currentTopic) return;
    homeView.style.display = 'none';
    topicView.style.display = 'flex';
    topicTitle.textContent = `${currentTopic.icon} ${currentTopic.title}`;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.topicId === topicId));
    renderContent('learn');
    updateProgressUI();

    // First try our statically mapped bespoke modules by topic ID
    if (ANIM_MODULES[topicId]) {
        engine._resize();
        ANIM_MODULES[topicId](engine);
        engine.goToStep(0);
        engine.play();
        updatePlayBtn();
        updateStepUI();
    } else {
        // Fallback to dynamic load or generic animation
        const animName = currentTopic.animationModule;
        if (animName) {
            const mod = await loadAnimModule(animName);
            if (mod && mod.setup) {
                engine._resize();
                mod.setup(engine);
                engine.goToStep(0);
                engine.play();
                updatePlayBtn();
                updateStepUI();
            } else {
                engine._resize();
                setupGenericAnimation(engine, currentTopic);
                engine.goToStep(0);
                engine.play();
                updatePlayBtn();
                updateStepUI();
            }
        } else {
            engine._resize();
            setupGenericAnimation(engine, currentTopic);
            engine.goToStep(0);
            engine.play();
            updatePlayBtn();
            updateStepUI();
        }
    }
}

function drawPlaceholder() {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    // Background
    ctx.fillStyle = '#0f0b1e';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(168,85,247,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Central glow
    const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 200);
    grd.addColorStop(0, 'rgba(168,85,247,0.12)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Icon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '72px sans-serif';
    ctx.fillText(currentTopic.icon, w / 2, h / 2 - 40);

    // Title
    ctx.font = '700 22px Outfit, sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.fillText(currentTopic.title, w / 2, h / 2 + 25);

    // Subtitle
    ctx.font = '400 14px Outfit, sans-serif';
    ctx.fillStyle = '#7b6f99';
    ctx.fillText('Read the detailed content below ↓', w / 2, h / 2 + 55);

    stepIndicator.textContent = '';
    stepDescription.innerHTML = currentTopic.content.overview;
}

function goHome() {
    engine.pause();
    engine.clear();
    currentTopic = null;
    homeView.style.display = '';
    topicView.style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    renderGrid();
}

// ─── Content Panel ───
function renderContent(tab) {
    activeContentTab = tab;
    document.querySelectorAll('.content-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (!currentTopic?.content) { contentBody.innerHTML = '<p>No content available.</p>'; return; }
    const c = currentTopic.content;

    if (tab === 'learn') {
        contentBody.className = 'content-body';
        const diagramSvg = generateTopicDiagram(currentTopic.id, currentTopic.title);
        contentBody.innerHTML = `
      <div class="content-section diagram-section">
        <div class="content-section-title">📊 Architecture Diagram</div>
        <div class="topic-diagram">${diagramSvg}</div>
      </div>
      <div class="content-section">
        <div class="content-section-title">📌 Overview</div>
        <p>${c.overview}</p>
      </div>
      <div class="content-section">
        <div class="content-section-title">⚙️ How It Works</div>
        <ol class="how-it-works-list">${(c.howItWorks || []).map((s, i) => `<li><span class="step-num">${i + 1}</span>${s}</li>`).join('')}</ol>
      </div>
      <div class="content-section">
        <div class="content-section-title">🔑 Key Concepts</div>
        <div class="concepts-grid">${(c.keyConcepts || []).map(s => `<div class="concept-card">${s}</div>`).join('')}</div>
      </div>
      <div class="content-section">
        <div class="content-section-title">🌍 Real-World Examples</div>
        <p>${c.realWorld || ''}</p>
        <div class="tradeoff-grid" style="margin-top:12px">
          <div class="tradeoff-box pros"><h4>✅ Advantages</h4><ul>${(c.tradeoffs?.pros || []).map(s => `<li>${s}</li>`).join('')}</ul></div>
          <div class="tradeoff-box cons"><h4>❌ Disadvantages</h4><ul>${(c.tradeoffs?.cons || []).map(s => `<li>${s}</li>`).join('')}</ul></div>
        </div>
      </div>`;
    } else if (tab === 'request-flow') {
        contentBody.className = 'content-body single-col';
        const analysis = getDeepAnalysis(currentTopic.id.includes('food') ? 'foodDelivery' : currentTopic.id.includes('ecommerce') ? 'ecommerce' : 'generic');
        const flow = analysis.requestFlow || analysis.flowStages;
        if (flow && flow.steps) {
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">${flow.title}</div>
                <div class="flow-timeline">
                    ${flow.steps.map((s, i) => `
                        <div class="flow-step">
                            <div class="flow-step-number">${i + 1}</div>
                            <div class="flow-step-content">
                                <h4>${s.name || s.stage}</h4>
                                <p>${s.description || s.process?.join(' → ') || ''}</p>
                                ${s.timing ? `<div class="flow-timing">⏱️ ${s.timing}</div>` : ''}
                                ${s.cache ? `<div class="flow-cache">💾 ${s.cache}</div>` : ''}
                                ${s.details ? `<ul class="flow-details">${s.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        } else {
            contentBody.innerHTML = `<div class="content-section"><p>No detailed flow information available for this topic.</p></div>`;
        }
    } else if (tab === 'data-flow') {
        contentBody.className = 'content-body single-col';
        const analysis = getDeepAnalysis(currentTopic.id.includes('food') ? 'foodDelivery' : 'generic');
        const flow = analysis.dataFlowVisualization || analysis.dataFlowDiagram;
        if (flow) {
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">${flow.title}</div>
                ${flow.flowChart ? `<pre class="flow-chart">${flow.flowChart}</pre>` : ''}
                ${flow.components ? `
                    <div class="data-flow-components">
                        ${flow.components.map((c, i) => `
                            <div class="data-flow-component">
                                <h4>${c.name}</h4>
                                <p><strong>Flow:</strong> ${c.flow}</p>
                                <p><strong>Size:</strong> ${c.size}</p>
                                <p><strong>Example:</strong> <code>${c.example}</code></p>
                                ${c.frequency ? `<p><strong>Frequency:</strong> ${c.frequency}</p>` : ''}
                                ${c.strategy ? `<p><strong>Strategy:</strong> ${c.strategy}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>`;
        }
    } else if (tab === 'caching') {
        contentBody.className = 'content-body single-col';
        const analysis = getDeepAnalysis(currentTopic.id.includes('food') ? 'foodDelivery' : 'generic');
        const caching = analysis.cachingStrategy;
        if (caching) {
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">${caching.title}</div>
                <div class="caching-layers">
                    ${caching.layers.map((layer, i) => `
                        <div class="caching-layer">
                            <div class="cache-layer-header">
                                <h4>${layer.layer}. ${layer.layer}</h4>
                                <span class="cache-ttl">TTL: ${layer.ttl}</span>
                            </div>
                            <p><strong>Strategy:</strong> ${layer.strategy}</p>
                            <p><strong>Contents:</strong> ${layer.contents}</p>
                            <div class="cache-details" style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
                                Typical hit time: varies based on layer
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }
    } else if (tab === 'deep-analysis') {
        contentBody.className = 'content-body single-col';
        const analysis = getDeepAnalysis(currentTopic.id.includes('food') ? 'foodDelivery' : currentTopic.id.includes('ecommerce') ? 'ecommerce' : 'generic');
        if (analysis.architecture) {
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">${analysis.architecture.title}</div>
                <pre class="deep-analysis-content">${analysis.architecture.content}</pre>
            </div>
            ${analysis.scalability ? `
                <div class="content-section">
                    <div class="content-section-title">${analysis.scalability.title}</div>
                    <div class="scalability-challenges">
                        ${analysis.scalability.challenges.map(c => `
                            <div class="challenge-card">
                                <h4>🎯 ${c.challenge}</h4>
                                <p><strong>Problem:</strong> ${c.problem}</p>
                                <p><strong>Solution:</strong> ${c.solution}</p>
                                <p><strong>Bottleneck:</strong> ${c.bottleneck}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}`;
        }
    } else if (tab === 'algorithms') {
        contentBody.className = 'content-body single-col';
        const enrichment = getEnrichment(currentTopic.id);
        const algos = enrichment.algorithms || [];
        if (algos.length === 0) {
            contentBody.innerHTML = `<div class="algo-empty"><div class="algo-empty-icon">🧮</div><div class="algo-empty-text">No specific algorithms for this topic.<br>Check the Learn tab for detailed concepts.</div></div>`;
        } else {
            contentBody.innerHTML = `<div class="content-section"><div class="content-section-title">🧮 Algorithms Used</div><div class="algo-grid">${algos.map((a, i) => `
              <div class="algo-chip" data-algo-idx="${i}">
                <div class="algo-chip-header">
                  <span class="algo-chip-name">${a.name}</span>
                  <span class="algo-chip-badge">${a.type}</span>
                </div>
                <div class="algo-chip-desc">${a.description}</div>
                <div class="algo-chip-complexity">Complexity: ${a.complexity}</div>
              </div>`).join('')}</div></div>`;
            contentBody.querySelectorAll('.algo-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const idx = parseInt(chip.dataset.algoIdx);
                    openAlgoModal(algos[idx]);
                });
            });
        }
    } else if (tab === 'code') {
        contentBody.className = 'content-body single-col';
        contentBody.innerHTML = `<div class="content-section"><div class="content-section-title">💻 Code Example</div><div class="content-code">${escapeHtml(c.codeExample || 'No code example available.')}</div></div>`;
    } else if (tab === 'interview') {
        contentBody.className = 'content-body single-col';
        contentBody.innerHTML = `<div class="content-section"><div class="content-section-title">🎯 Interview Tips</div>${(c.interviewTips || []).map(t => `<div class="interview-tip">${t}</div>`).join('')}</div>`;
    }
}
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
document.querySelectorAll('.content-tab').forEach(t => t.addEventListener('click', () => renderContent(t.dataset.tab)));

// ─── Playback ───
function updateStepUI() {
    const step = engine.getCurrentStepData();
    if (!step) return;
    if (stepIndicator) stepIndicator.textContent = `Step ${engine.currentStep + 1} / ${engine.steps.length}`;
    if (stepDescription) stepDescription.innerHTML = step.description || '';
}
function updatePlayBtn() { if (playBtn) playBtn.textContent = engine.isPlaying ? '⏸' : '▶'; }

function initAppListeners() {
    if (!engine) return;
    engine.onStepChange = () => updateStepUI();
    engine.onComplete = () => { engine.pause(); updatePlayBtn(); };
    if (playBtn) playBtn.addEventListener('click', () => { engine.togglePlay(); updatePlayBtn(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { engine.prevStep(); updateStepUI(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { engine.nextStep(); updateStepUI(); });
    if (restartBtn) restartBtn.addEventListener('click', () => { engine.restart(); engine.play(); updatePlayBtn(); updateStepUI(); });
    if (speedSlider) speedSlider.addEventListener('input', () => { engine.setSpeed(parseFloat(speedSlider.value)); if (speedLabel) speedLabel.textContent = `${speedSlider.value}x`; });
    if (backBtn) backBtn.addEventListener('click', goHome);
    if (markCompleteBtn) markCompleteBtn.addEventListener('click', () => {
        if (!currentTopic) return;
        const done = authService.getCompletedTopics();
        if (done.includes(currentTopic.id)) return;
        openQuizModal();
    });
    if (recordBtn) recordBtn.addEventListener('click', () => {
        if (!recorder) return;
        recorder.start();
        recordBtn.style.display = 'none';
        if (stopRecordBtn) stopRecordBtn.style.display = '';
        if (recordStatus) recordStatus.textContent = '● REC';
        const iv = setInterval(() => {
            if (!recorder.isRecording) { clearInterval(iv); return; }
            const s = Math.floor(recorder.getElapsed() / 1000);
            if (recordStatus) recordStatus.textContent = `● REC ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        }, 500);
    });
    if (stopRecordBtn) stopRecordBtn.addEventListener('click', () => {
        if (!recorder) return;
        recorder.stop();
        stopRecordBtn.style.display = 'none';
        if (recordBtn) recordBtn.style.display = '';
        if (recordStatus) recordStatus.textContent = '';
    });
    if (toggleFlowVizBtn) {
        toggleFlowVizBtn.addEventListener('click', () => {
            if (!flowVisualizer || !flowVisualizationContainer) return;
            const isVisible = flowVisualizationContainer.style.display !== 'none';
            if (isVisible) {
                flowVisualizationContainer.style.display = 'none';
                if (canvas) canvas.style.display = 'block';
                flowVisualizer.stopAnimation();
            } else {
                if (canvas) canvas.style.display = 'none';
                flowVisualizationContainer.style.display = 'block';
                const topic = currentTopic?.id || 'generic';
                const flowType = flowTypeSelector?.value || 'request-response';
                if (flowType === 'request-response') flowVisualizer.generateRequestResponseCycle(topic);
                else if (flowType === 'data-flow') flowVisualizer.generateDataFlowDiagram();
                else if (flowType === 'caching') flowVisualizer.generateCachingVisualization();
            }
        });
    }
    if (flowTypeSelector) {
        flowTypeSelector.addEventListener('change', () => {
            if (!flowVisualizer || flowVisualizationContainer?.style.display === 'none') return;
            const flowType = flowTypeSelector.value;
            const topic = currentTopic?.id || 'generic';
            if (flowType === 'request-response') flowVisualizer.generateRequestResponseCycle(topic);
            else if (flowType === 'data-flow') flowVisualizer.generateDataFlowDiagram();
            else if (flowType === 'caching') flowVisualizer.generateCachingVisualization();
        });
    }
    if (presentationBtn) presentationBtn.addEventListener('click', togglePresentationMode);
}

// Keyboard
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (quizModal && quizModal.style.display !== 'none' || algoModal && algoModal.style.display !== 'none') {
        if (e.key === 'Escape') { if (quizModal) quizModal.style.display = 'none'; if (algoModal) algoModal.style.display = 'none'; }
        return;
    }
    if (!engine) return;
    switch (e.key) {
        case ' ': e.preventDefault(); engine.togglePlay(); updatePlayBtn(); break;
        case 'ArrowRight': engine.nextStep(); updateStepUI(); break;
        case 'ArrowLeft': engine.prevStep(); updateStepUI(); break;
        case 'r': engine.restart(); engine.play(); updatePlayBtn(); updateStepUI(); break;
        case 'Escape': if (currentTopic) goHome(); break;
    }
});

// ─── Algorithm Modal ───
function openAlgoModal(algo) {
    algoModalTitle.textContent = `🧮 ${algo.name}`;
    algoModalBody.innerHTML = `
      <div class="algo-detail-name">${algo.name}</div>
      <div class="algo-detail-type">${algo.type}</div>
      <div class="algo-detail-desc">${algo.description}</div>
      <div class="algo-detail-complexity">
        <span class="algo-detail-complexity-label">Time Complexity</span>
        <span class="algo-detail-complexity-value">${algo.complexity}</span>
      </div>`;
    algoModal.style.display = '';
}
if (algoCloseBtn) algoCloseBtn.addEventListener('click', () => { algoModal.style.display = 'none'; });
if (algoModal) algoModal.addEventListener('click', e => { if (e.target === algoModal) algoModal.style.display = 'none'; });

// ─── Quiz Modal ───
let quizAnswers = [];
let quizQuestions = [];

function openQuizModal() {
    if (!currentTopic) return;
    const enrichment = getEnrichment(currentTopic.id);
    quizQuestions = enrichment.quizQuestions || [];
    if (quizQuestions.length === 0) {
        // No quiz available — allow direct completion
        toggleComplete(currentTopic.id);
        return;
    }
    quizAnswers = new Array(quizQuestions.length).fill(-1);
    quizModalTitle.textContent = `📝 ${currentTopic.title} — Knowledge Check`;
    renderQuiz();
    quizModal.style.display = '';
}

function renderQuiz() {
    const letters = ['A', 'B', 'C', 'D'];
    quizBody.innerHTML = quizQuestions.map((q, qi) => `
      <div class="quiz-question" data-qi="${qi}">
        <div class="quiz-q-text"><span class="quiz-q-num">Q${qi + 1}.</span> ${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, oi) => `
            <button class="quiz-option${quizAnswers[qi] === oi ? ' selected' : ''}" data-qi="${qi}" data-oi="${oi}">
              <span class="opt-letter">${letters[oi]}</span>
              ${opt}
            </button>`).join('')}
        </div>
      </div>`).join('') +
        `<div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(quizAnswers.filter(a => a >= 0).length / quizQuestions.length) * 100}%"></div></div>`;

    quizBody.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const qi = parseInt(btn.dataset.qi);
            const oi = parseInt(btn.dataset.oi);
            quizAnswers[qi] = oi;
            // Update selection UI
            btn.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            // Update progress bar
            const filled = quizAnswers.filter(a => a >= 0).length;
            quizBody.querySelector('.quiz-progress-fill').style.width = `${(filled / quizQuestions.length) * 100}%`;
            updateQuizFooter();
        });
    });
    updateQuizFooter();
}

function updateQuizFooter() {
    const answered = quizAnswers.filter(a => a >= 0).length;
    const total = quizQuestions.length;
    if (answered < total) {
        quizFooter.innerHTML = `<span class="quiz-score">${answered}/${total} answered</span><button class="quiz-btn" disabled style="opacity:0.5;cursor:default">✅ Submit</button>`;
    } else {
        quizFooter.innerHTML = `<span class="quiz-score">${answered}/${total} answered</span><button class="quiz-btn" id="quiz-submit-btn">✅ Submit</button>`;
        document.getElementById('quiz-submit-btn').addEventListener('click', submitQuiz);
    }
}

function submitQuiz() {
    let correct = 0;
    quizQuestions.forEach((q, qi) => {
        const qEl = quizBody.querySelector(`.quiz-question[data-qi="${qi}"]`);
        const options = qEl.querySelectorAll('.quiz-option');
        options.forEach((btn, oi) => {
            btn.classList.add('disabled');
            if (oi === q.correct) btn.classList.add('correct');
            else if (quizAnswers[qi] === oi) btn.classList.add('wrong');
        });
        if (quizAnswers[qi] === q.correct) correct++;
    });

    const passed = correct >= 3;
    if (passed) {
        quizFooter.innerHTML = `<span class="quiz-score pass">✅ ${correct}/${quizQuestions.length} correct — Passed!</span><button class="quiz-btn" id="quiz-done-btn">🎉 Complete Topic</button>`;
        document.getElementById('quiz-done-btn').addEventListener('click', () => {
            toggleComplete(currentTopic.id);
            quizModal.style.display = 'none';
        });
    } else {
        quizFooter.innerHTML = `<span class="quiz-score fail">❌ ${correct}/${quizQuestions.length} correct — Need 3 to pass</span><button class="quiz-btn retry" id="quiz-retry-btn">🔄 Try Again</button>`;
        document.getElementById('quiz-retry-btn').addEventListener('click', () => {
            quizAnswers = new Array(quizQuestions.length).fill(-1);
            renderQuiz();
        });
    }
}

if (quizCloseBtn) quizCloseBtn.addEventListener('click', () => { quizModal.style.display = 'none'; });
if (quizModal) quizModal.addEventListener('click', e => { if (e.target === quizModal) quizModal.style.display = 'none'; });

// ─── Toggle Complete ───
function toggleComplete(topicId) {
    const done = authService.getCompletedTopics();
    if (done.includes(topicId)) {
        authService.markTopicIncomplete(topicId);
    } else {
        authService.markTopicComplete(topicId);
    }
    updateProgressUI();
}

// Simple but effective Markdown → HTML converter for Rishi's responses
const markdownToHtml = (md) => {
    return md
        // Code blocks (triple backtick)
        .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
        // Headers
        .replace(/^#{3}\s(.+)$/gm, '<h4 class="ai-h4">$1</h4>')
        .replace(/^#{2}\s(.+)$/gm, '<h3 class="ai-h3">$1</h3>')
        .replace(/^#{1}\s(.+)$/gm, '<h2 class="ai-h2">$1</h2>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Horizontal rule
        .replace(/^---+$/gm, '<hr class="ai-hr">')
        // Markdown table (basic)
        .replace(/\|(.+)\|/g, (match) => {
            if (match.includes('---')) return '';
            const cells = match.split('|').filter(c => c.trim());
            const isHeader = false;
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        // Bullet points
        .replace(/^[\-\*]\s(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)\n(?!<li>)/gs, '<ul>$1</ul>')
        // Numbered list
        .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
        // Line breaks (two newlines = paragraph break)
        .replace(/\n\n/g, '</p><p>')
        // Single newline
        .replace(/\n/g, '<br>');
};

const addAiMessage = (role, text) => {
    if (!aiMessages) return;
    const div = document.createElement('div');
    div.className = `ai-msg ai-msg-${role}`;
    if (role === 'assistant') {
        // Render Markdown for Rishi's responses
        div.innerHTML = `<div class="ai-md-content">${markdownToHtml(text)}</div>`;
    } else {
        div.textContent = text;
    }
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

const buildTopicContext = (topic) => {
    if (!topic) return null;
    const c = topic.content || {};
    const enrichment = getEnrichment(topic.id);
    return {
        title: topic.title,
        overview: c.overview || '',
        howItWorks: c.howItWorks || [],
        keyConcepts: c.keyConcepts || [],
        realWorld: c.realWorld || '',
        pros: c.tradeoffs?.pros || [],
        cons: c.tradeoffs?.cons || [],
        algorithms: enrichment.algorithms || [],
        interviewTips: c.interviewTips || []
    };
}

// ─── System Design Generator ───
function generateSystemDesign(userIdea) {
    const q = userIdea.toLowerCase();

    // Detect app type
    const appTypes = {
        'food delivery': { name: 'Food Delivery Platform', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: true, realtime: true, geo: true },
        'delivery': { name: 'Delivery Service', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: false, realtime: true, geo: true },
        'e-commerce': { name: 'E-Commerce Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'ecommerce': { name: 'E-Commerce Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'shop': { name: 'Online Marketplace', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'chat': { name: 'Real-Time Chat Application', db: 'MongoDB + Redis', queue: 'Redis Pub/Sub', cdn: false, realtime: true, geo: false },
        'social media': { name: 'Social Media Platform', db: 'PostgreSQL + Redis + Neo4j', queue: 'Kafka', cdn: true, realtime: true, geo: false },
        'streaming': { name: 'Video Streaming Service', db: 'PostgreSQL + Redis', queue: 'Kafka', cdn: true, realtime: true, geo: true },
        'video': { name: 'Video Platform', db: 'PostgreSQL + Redis + S3', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'ride': { name: 'Ride-Sharing Platform', db: 'PostgreSQL + Redis', queue: 'Kafka', cdn: false, realtime: true, geo: true },
        'uber': { name: 'Ride-Sharing Platform', db: 'PostgreSQL + Redis', queue: 'Kafka', cdn: false, realtime: true, geo: true },
        'booking': { name: 'Booking & Reservation System', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: false, realtime: false, geo: false },
        'hotel': { name: 'Hotel Booking Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'RabbitMQ', cdn: true, realtime: false, geo: true },
        'payment': { name: 'Payment Processing System', db: 'PostgreSQL + Redis', queue: 'Kafka', cdn: false, realtime: false, geo: false },
        'health': { name: 'Healthcare Platform', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: false, realtime: true, geo: false },
        'fitness': { name: 'Fitness & Wellness App', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: true, realtime: false, geo: false },
        'education': { name: 'Ed-Tech Learning Platform', db: 'PostgreSQL + Redis + S3', queue: 'RabbitMQ', cdn: true, realtime: true, geo: false },
        'learning': { name: 'Online Learning Platform', db: 'PostgreSQL + Redis + S3', queue: 'RabbitMQ', cdn: true, realtime: true, geo: false },
        'game': { name: 'Online Gaming Platform', db: 'MongoDB + Redis', queue: 'Redis Pub/Sub', cdn: true, realtime: true, geo: true },
        'music': { name: 'Music Streaming Platform', db: 'PostgreSQL + Redis + S3', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'spotify': { name: 'Music Streaming Platform', db: 'PostgreSQL + Redis + S3', queue: 'Kafka', cdn: true, realtime: false, geo: false },
        'netflix': { name: 'Video Streaming Platform', db: 'PostgreSQL + Redis + S3', queue: 'Kafka', cdn: true, realtime: true, geo: true },
        'whatsapp': { name: 'Messaging Platform', db: 'MongoDB + Redis', queue: 'Kafka', cdn: false, realtime: true, geo: false },
        'instagram': { name: 'Photo-Sharing Social Platform', db: 'PostgreSQL + Redis + S3', queue: 'Kafka', cdn: true, realtime: true, geo: false },
        'twitter': { name: 'Micro-Blogging Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'Kafka', cdn: true, realtime: true, geo: false },
        'amazon': { name: 'E-Commerce Marketplace', db: 'PostgreSQL + DynamoDB + Elasticsearch', queue: 'SQS + Kafka', cdn: true, realtime: false, geo: true },
        'marketplace': { name: 'Online Marketplace', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'RabbitMQ', cdn: true, realtime: false, geo: false },
        'travel': { name: 'Travel Booking Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'RabbitMQ', cdn: true, realtime: false, geo: true },
        'news': { name: 'News Aggregation Platform', db: 'PostgreSQL + Redis + Elasticsearch', queue: 'Kafka', cdn: true, realtime: true, geo: false },
        'blog': { name: 'Content Management Platform', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: true, realtime: false, geo: false },
    };

    let detected = null;
    for (const [key, val] of Object.entries(appTypes)) {
        if (q.includes(key)) { detected = val; break; }
    }

    if (!detected) {
        detected = { name: 'Custom Application', db: 'PostgreSQL + Redis', queue: 'RabbitMQ', cdn: false, realtime: false, geo: false };
        // Try to extract app name from user input
        const nameMatch = userIdea.match(/(?:build|create|design|make|develop)\s+(?:a\s+|an\s+)?(.+?)(?:\s+app|\s+application|\s+system|\s+platform|\s+website|\s+service|$)/i);
        if (nameMatch) detected.name = nameMatch[1].trim().replace(/^(a|an)\s+/i, '').split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ') + ' Platform';
    }

    const components = [
        `🖥️ Frontend: React/Next.js + Responsive UI`,
        `⚙️ Backend: Node.js + Express (Microservices)`,
        `🗄️ Database: ${detected.db}`,
        `🔒 Auth: JWT + OAuth 2.0 (Google, GitHub)`,
        `📨 Message Queue: ${detected.queue}`,
    ];
    if (detected.cdn) components.push(`🌐 CDN: CloudFront / Cloudflare`);
    if (detected.realtime) components.push(`🔌 Real-Time: WebSocket / Socket.io`);
    if (detected.geo) components.push(`📍 Geolocation: Redis GeoHash + Maps API`);

    const apis = generateAPIs(q, detected);
    const algos = generateAlgorithms(q, detected);
    const scaling = generateScaling(detected);
    const dbSchema = generateDBSchema(q, detected);

    return `🏗️ SYSTEM DESIGN: ${detected.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📐 ARCHITECTURE OVERVIEW
${components.join('\n')}

📡 API ENDPOINTS
${apis}

🧮 ALGORITHMS & DATA STRUCTURES
${algos}

🗃️ DATABASE SCHEMA (Key Tables)
${dbSchema}

📈 SCALING STRATEGY
${scaling}

⚡ ESTIMATED COMPLEXITY
• MVP: 2-3 months (1-2 developers)
• Production: 6-9 months (3-5 developers)
• Scale: Horizontal auto-scaling with load balancers

💡 TIP: Click on relevant topics in the sidebar (Load Balancing, Caching, Microservices, etc.) to learn more about each component!`;
}

function generateAPIs(q, detected) {
    const base = [
        'POST /api/auth/register — User registration',
        'POST /api/auth/login — Login + JWT token',
        'GET  /api/users/:id — Get user profile',
    ];

    if (q.includes('food') || q.includes('delivery')) {
        base.push('GET  /api/restaurants — List restaurants nearby',
            'POST /api/orders — Place new order',
            'GET  /api/orders/:id/track — Real-time order tracking',
            'PATCH /api/orders/:id/status — Update delivery status');
    } else if (q.includes('chat') || q.includes('whatsapp') || q.includes('messag')) {
        base.push('GET  /api/conversations — List conversations',
            'POST /api/messages — Send message',
            'WS   /ws/chat/:roomId — Real-time messaging',
            'GET  /api/messages/:convId — Message history');
    } else if (q.includes('ecommerce') || q.includes('e-commerce') || q.includes('shop') || q.includes('amazon')) {
        base.push('GET  /api/products — Search & filter products',
            'POST /api/cart — Add to cart',
            'POST /api/orders — Place order',
            'POST /api/payments — Process payment',
            'GET  /api/orders/:id — Order status');
    } else if (q.includes('social') || q.includes('instagram') || q.includes('twitter')) {
        base.push('POST /api/posts — Create post',
            'GET  /api/feed — Get news feed',
            'POST /api/posts/:id/like — Like a post',
            'POST /api/users/:id/follow — Follow user',
            'GET  /api/search — Search users/posts');
    } else if (q.includes('ride') || q.includes('uber')) {
        base.push('POST /api/rides/request — Request a ride',
            'GET  /api/rides/:id/track — Track rider location',
            'PATCH /api/rides/:id/status — Update ride status',
            'POST /api/payments/charge — Process ride payment');
    } else if (q.includes('streaming') || q.includes('video') || q.includes('netflix') || q.includes('youtube')) {
        base.push('GET  /api/videos — Browse catalog',
            'POST /api/videos/upload — Upload video',
            'GET  /api/videos/:id/stream — Adaptive streaming',
            'POST /api/videos/:id/watch — Track watch history');
    } else if (q.includes('booking') || q.includes('hotel') || q.includes('travel')) {
        base.push('GET  /api/listings — Search available listings',
            'POST /api/bookings — Make a reservation',
            'GET  /api/bookings/:id — Booking details',
            'DELETE /api/bookings/:id — Cancel booking');
    } else {
        base.push('GET  /api/items — List items (paginated)',
            'POST /api/items — Create new item',
            'PUT  /api/items/:id — Update item',
            'DELETE /api/items/:id — Delete item');
    }

    return base.map(a => `• ${a}`).join('\n');
}

function generateAlgorithms(q, detected) {
    const algos = [
        '• Consistent Hashing — Distribute data across shards evenly',
        '• Rate Limiting (Token Bucket) — Prevent API abuse',
        '• JWT + bcrypt — Secure authentication & password hashing',
    ];

    if (detected.realtime) algos.push('• WebSocket Pub/Sub — Real-time message delivery');
    if (detected.geo) algos.push('• GeoHash + R-Tree — Efficient location-based queries');
    if (detected.cdn) algos.push('• LRU Cache Eviction — Optimize CDN & cache performance');

    if (q.includes('feed') || q.includes('social') || q.includes('news')) {
        algos.push('• Fan-out on Write — Pre-compute user feeds for fast reads');
        algos.push('• Ranking Algorithm (EdgeRank) — Score & sort feed items');
    }
    if (q.includes('search') || q.includes('e-commerce') || q.includes('ecommerce')) {
        algos.push('• Inverted Index (Elasticsearch) — Full-text search');
        algos.push('• TF-IDF + BM25 — Relevance ranking for search results');
    }
    if (q.includes('recommendation') || q.includes('streaming') || q.includes('netflix') || q.includes('spotify')) {
        algos.push('• Collaborative Filtering — Recommend based on similar users');
        algos.push('• Content-Based Filtering — Recommend based on item features');
    }
    if (q.includes('payment') || q.includes('order')) {
        algos.push('• Saga Pattern — Distributed transaction management');
        algos.push('• Idempotency Keys — Prevent duplicate payments');
    }
    if (q.includes('chat') || q.includes('messag')) {
        algos.push('• Snowflake ID — Globally unique, time-sortable message IDs');
        algos.push('• Read Receipt Protocol — Track message delivery status');
    }
    if (q.includes('ride') || q.includes('uber') || q.includes('delivery')) {
        algos.push('• Dijkstra / A* — Shortest path for routing');
        algos.push('• Quadtree — Efficient spatial indexing for nearby drivers');
    }

    return algos.join('\n');
}

function generateScaling(detected) {
    const strategies = [
        '• Load Balancer (Nginx/ALB) — Distribute traffic across servers',
        '• Horizontal Scaling — Add more servers behind the load balancer',
        '• Database Read Replicas — Scale read-heavy workloads',
        '• Redis Caching — Reduce database load by 80%',
    ];

    if (detected.cdn) strategies.push('• CDN (CloudFront) — Serve static assets from edge locations');
    if (detected.queue) strategies.push(`• ${detected.queue} — Async processing for background tasks`);
    if (detected.realtime) strategies.push('• WebSocket Connection Pooling — Handle 100K+ concurrent connections');
    if (detected.geo) strategies.push('• Multi-Region Deployment — Low latency globally');

    strategies.push('• Auto-Scaling Groups — Scale based on CPU/memory metrics');
    strategies.push('• Database Sharding — Partition data for unlimited growth');

    return strategies.join('\n');
}

function generateDBSchema(q, detected) {
    let schema = `• users (id, name, email, password_hash, avatar, created_at)
• sessions (id, user_id, token, expires_at)`;

    if (q.includes('ecommerce') || q.includes('e-commerce') || q.includes('shop') || q.includes('amazon')) {
        schema += `\n• products (id, name, description, price, category_id, stock, images)
• orders (id, user_id, total, status, payment_id, created_at)
• order_items (id, order_id, product_id, quantity, price)
• payments (id, order_id, amount, method, status, stripe_id)`;
    } else if (q.includes('chat') || q.includes('messag') || q.includes('whatsapp')) {
        schema += `\n• conversations (id, type, name, created_at)
• participants (conversation_id, user_id, joined_at)
• messages (id, conversation_id, sender_id, content, type, created_at)`;
    } else if (q.includes('social') || q.includes('instagram') || q.includes('twitter')) {
        schema += `\n• posts (id, user_id, content, media_urls, likes_count, created_at)
• follows (follower_id, following_id, created_at)
• likes (user_id, post_id, created_at)
• comments (id, post_id, user_id, content, created_at)`;
    } else if (q.includes('food') || q.includes('delivery')) {
        schema += `\n• restaurants (id, name, location, cuisine, rating, is_open)
• menu_items (id, restaurant_id, name, price, category)
• orders (id, user_id, restaurant_id, status, total, delivery_address)
• drivers (id, user_id, location, is_available, rating)`;
    } else if (q.includes('ride') || q.includes('uber')) {
        schema += `\n• rides (id, rider_id, driver_id, pickup, dropoff, status, fare)
• drivers (id, user_id, vehicle, location, is_available, rating)
• payments (id, ride_id, amount, method, status)`;
    } else if (q.includes('booking') || q.includes('hotel') || q.includes('travel')) {
        schema += `\n• listings (id, host_id, title, description, price, location, rating)
• bookings (id, user_id, listing_id, check_in, check_out, status, total)
• reviews (id, booking_id, user_id, rating, comment)`;
    } else if (q.includes('streaming') || q.includes('video') || q.includes('netflix')) {
        schema += `\n• videos (id, title, description, url, thumbnail, duration, category)
• watch_history (user_id, video_id, progress, watched_at)
• subscriptions (id, user_id, plan, status, expires_at)`;
    } else {
        schema += `\n• items (id, user_id, title, description, status, created_at)
• categories (id, name, parent_id)
• notifications (id, user_id, type, message, read, created_at)`;
    }

    return schema;
}

// RishiAgent handles built-in answers and fallbacks now.

const handleAiSend = async () => {
    const text = aiInput ? aiInput.value.trim() : '';
    if (!text) return;
    aiInput.value = '';
    addAiMessage('user', text);

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'ai-msg ai-msg-assistant ai-thinking';
    thinkingDiv.textContent = '🤖 Rishi is thinking...';
    if (aiMessages) { aiMessages.appendChild(thinkingDiv); aiMessages.scrollTop = aiMessages.scrollHeight; }

    const topicCtx = currentTopic ? buildTopicContext(currentTopic) : null;

    // Check if this is an app idea — if so, use the built-in structured generator immediately
    const q = text.toLowerCase();
    const ideaKeywords = ['build', 'create', 'design', 'make', 'develop', 'app', 'application', 'system', 'platform', 'website', 'service', 'want to', 'idea', 'project', 'startup', 'product', 'need a', 'like uber', 'like netflix', 'like whatsapp', 'like instagram', 'like youtube', 'like twitter', 'like amazon', 'like spotify', 'e-commerce', 'ecommerce', 'chat app', 'social media', 'marketplace', 'booking', 'delivery', 'streaming', 'food', 'ride', 'hotel', 'travel'];
    const isAppIdea = ideaKeywords.some(k => q.includes(k)) && q.length > 15;

    if (isAppIdea) {
        // Show visual system design
        thinkingDiv.textContent = '🏗️ Generating visual architecture... Check the main view!';
        thinkingDiv.classList.remove('ai-thinking');
        // Hide ALL views, show design visualizer full-screen
        const homeView = document.getElementById('home-view');
        const topicView = document.getElementById('topic-view');
        const vizEl = document.getElementById('design-visualizer');
        if (homeView) homeView.style.display = 'none';
        if (topicView) topicView.style.display = 'none';
        if (vizEl) {
            vizEl.style.display = 'block';
            // Recreate instance each time for fresh state
            if (window._sdvInstance) window._sdvInstance.destroy();
            window._sdvInstance = new SystemDesignVisualizer(vizEl);
            // Override back button to restore home view
            const origRender = window._sdvInstance._render.bind(window._sdvInstance);
            window._sdvInstance._render = function (design) {
                origRender(design);
                const backBtn = this.container.querySelector('.sdv-back-btn');
                if (backBtn) backBtn.onclick = () => {
                    this.container.style.display = 'none';
                    this.stop();
                    if (homeView) homeView.style.display = '';
                };
            };
            window._sdvInstance.generate(text);
        }
    } else {
        // Use RishiAgent for high-quality answers
        try {
            const result = await rishiAgent.askQuestion(text);
            thinkingDiv.textContent = result.answer;
            if (isVoiceEnabled) speakRishiVoice(result.answer);
        } catch (e) {
            thinkingDiv.textContent = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }
    thinkingDiv.classList.remove('ai-thinking');
    if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
}

if (aiSendBtn) aiSendBtn.addEventListener('click', handleAiSend);
if (aiInput) aiInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAiSend(); });


// Init — Auth gate & Startup
const authScreen = document.getElementById('auth-screen');
const appEl = document.getElementById('app');
const userAvatarEl = document.getElementById('user-avatar');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

function showApp() {
    console.log('✨ main.js: session detected, launching app');

    // Initialize core engine instances now that DOM is ready
    const canvasEl = document.querySelector('#main-canvas');
    const flowCanvasEl = document.querySelector('#flow-canvas');
    const designVisualizerEl = document.querySelector('#design-visualizer');

    engine = new AnimationEngine(canvasEl);
    recorder = canvasEl ? new VideoRecorder(canvasEl) : null;
    sdv = designVisualizerEl ? new SystemDesignVisualizer(designVisualizerEl) : null;
    flowVisualizer = flowCanvasEl ? new AdvancedFlowVisualizer(flowCanvasEl) : null;

    if (authScreen) {
        authScreen.classList.add('hidden');
        setTimeout(() => { authScreen.style.display = 'none'; }, 600);
    }
    if (appEl) appEl.style.display = 'flex';

    const user = authService.getCurrentUser();
    if (user) {
        if (userAvatarEl) userAvatarEl.textContent = user.avatar || user.name[0];
        if (userNameEl) userNameEl.textContent = user.name;
    }

    renderSidebar();
    renderCategoryTabs();
    renderGrid();
    updateProgressUI();
    initAppListeners();
    switchView('home');
    featureIntegration.initialize();
}

function showAuth() {
    console.log('🔒 main.js: no session, showing auth');
    if (authScreen) {
        authScreen.style.display = 'flex';
        authScreen.classList.remove('hidden');
    }
    if (appEl) appEl.style.display = 'none';
}

function switchView(viewId) {
    const views = {
        'home': homeView,
        'topic': topicView,
        'library': libraryView,
        'nano-banana': nanoBananaView
    };

    Object.keys(views).forEach(key => {
        if (views[key]) views[key].style.display = (key === viewId) ? (viewId === 'topic' ? 'flex' : 'block') : 'none';
    });
}

// ─── Auth Logic (Consolidated from authGate) ───
if (showSignupLink) showSignupLink.onclick = (e) => {
    e.preventDefault();
    loginForm?.classList.remove('active');
    signupForm?.classList.add('active');
    if (loginError) loginError.textContent = '';
};

if (showLoginLink) showLoginLink.onclick = (e) => {
    e.preventDefault();
    signupForm?.classList.remove('active');
    loginForm?.classList.add('active');
    if (signupError) signupError.textContent = '';
};

if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = $('#login-email')?.value || '';
        const password = $('#login-password')?.value || '';
        const result = authService.login(email, password);
        if (result.success) {
            window.location.reload();
        } else {
            if (loginError) loginError.textContent = result.error;
        }
    };
}

if (signupForm) {
    signupForm.onsubmit = (e) => {
        e.preventDefault();
        const name = $('#signup-name')?.value || '';
        const email = $('#signup-email')?.value || '';
        const password = $('#signup-password')?.value || '';
        if (!name || !email || !password) {
            if (signupError) signupError.textContent = "Please fill in all fields.";
            return;
        }
        const result = authService.signup(name, email, password);
        if (result.success) {
            window.location.reload();
        } else {
            if (signupError) signupError.textContent = result.error;
        }
    };
}

// Sidebar Navigation
document.getElementById('nav-home-btn')?.addEventListener('click', () => switchView('home'));
document.getElementById('sidebar-library-btn')?.addEventListener('click', () => switchView('library'));
document.getElementById('sidebar-nano-banana-btn')?.addEventListener('click', () => switchView('nano-banana'));

// Logout
if (logoutBtn) logoutBtn.addEventListener('click', () => {
    console.log('🚪 main.js: logging out');
    authService.logout();
    window.location.reload();
});

// Check session on load
if (authService.isLoggedIn()) {
    showApp();
} else {
    showAuth();
}
