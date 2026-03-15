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
import { setupAcidTransactionsBespoke } from './topics/bespoke/acidTransactions.js';
import { DEEP_ANALYSIS, getDeepAnalysis } from './content/deepAnalysis.js';
import { COMPREHENSIVE_GUIDE } from './content/comprehensiveGuide.js';
import { TOPIC_VISUALIZATIONS } from './content/topicVisualizations.js';
import { SYSTEM_DESIGN_KB } from './content/systemDesignKnowledgeBase.js';
import SystemDesignGenerator from './engine/SystemDesignGenerator.js';
import { KNOWLEDGE_BASE_NOTES } from './content/knowledgeBase.js';
import { ImageGenerator } from './ai/imageGenerator.js';
import { RishiAIAgent, rishiAgent } from './ai/RishiAgent.js';
import { featureIntegration } from './ai/FeatureIntegration.js';
import { showVisualDescriptionPanel } from './napkinVisual.js';


// DOM selections are now consolidated. Using $ helper.
const $ = s => document.querySelector(s);

// Registry & State
const ANIM_MODULES = {
    'client-server': setupClientServerBespoke,
    'load-balancing': setupLoadBalancingBespoke,
    'caching': setupCachingBespoke,
    'acid-transactions': setupAcidTransactionsBespoke
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
    window.speechSynthesis.cancel();

    let clean = text
        // Remove separator lines of any kind
        .replace(/[━─=\-]{3,}/g, ' ')
        // Remove all emoji / unicode symbols (broad range)
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
        // Remove HTTP method + path patterns like "POST /api/auth/login"
        .replace(/\b(GET|POST|PUT|PATCH|DELETE|WS)\s+\/[\w\/:\-\.]+/gi, '')
        // Remove bare URL paths like /api/users/:id
        .replace(/\/[\w\/:\-\.\?=&]+/g, '')
        // Remove code comments // ...
        .replace(/\/\/[^\n]*/g, '')
        // Remove block comments /* ... */
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Replace — dash with comma or nothing
        .replace(/—/g, ', ')
        // Replace -> arrow
        .replace(/->/g, ' to ')
        // Replace => fat arrow
        .replace(/=>/g, ' which gives ')
        // Remove asterisks, underscores, backticks, hash, angle brackets
        .replace(/[*_`#<>\[\]{}\(\)]/g, ' ')
        // Remove lines that are entirely non-alphabetic (box-drawing, separators)
        .replace(/^[^a-zA-Z\d]*$/gm, '')
        // Remove leading bullet chars
        .replace(/^[•\-\*\+]\s*/gm, '')
        // Collapse multiple spaces
        .replace(/[ \t]{2,}/g, ' ')
        // Collapse multiple newlines
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ', ')
        // Remove leftover standalone slashes
        .replace(/\s\/\s/g, ', ')
        .replace(/\s\/\/\s/g, ', ')
        .trim();

    if (!clean) { if (onEnd) onEnd(); return; }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang && v.lang.startsWith('en')) ||
        voices[0];
    if (englishVoice) utterance.voice = englishVoice;

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
    const title = currentTopic.title;
    const topicId = currentTopic.id;
    const enrichment = getEnrichment(topicId);

    if (tab === 'learn') {
        contentBody.className = 'content-body';
        const diagramSvg = generateTopicDiagram(topicId, title);
        // Build detailed notes (500-1000 words) from all topic content
        const detailedNotes = _buildDetailedNotes(title, c, enrichment);
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
        <div class="content-section-title">📖 Detailed Study Notes</div>
        <div class="detailed-notes">${detailedNotes}</div>
      </div>
      <div class="content-section">
        <div class="content-section-title">⚙️ How It Works — Step by Step</div>
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
        // Try deep analysis first, fallback to generating from howItWorks
        let analysis = null;
        try { analysis = getDeepAnalysis(topicId.includes('food') ? 'foodDelivery' : topicId.includes('ecommerce') ? 'ecommerce' : topicId); } catch(e) {}
        const flow = analysis?.requestFlow;
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
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        } else {
            // Generate request flow from howItWorks steps
            const steps = c.howItWorks || [];
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">🔄 Request Flow — ${title}</div>
                <p style="margin-bottom:16px;color:var(--text-2)">This is the typical request-response flow when ${title.toLowerCase()} is used in a production system.</p>
                <div class="flow-timeline">
                    ${steps.map((s, i) => `
                        <div class="flow-step">
                            <div class="flow-step-number">${i + 1}</div>
                            <div class="flow-step-content">
                                <h4>Step ${i + 1}</h4>
                                <p>${s}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="content-section">
                <div class="content-section-title">🌍 Where This Flow Appears</div>
                <p>${c.realWorld || 'This pattern is widely used in production systems at companies like Google, Amazon, Netflix, and Meta.'}</p>
            </div>`;
        }
    } else if (tab === 'data-flow') {
        contentBody.className = 'content-body single-col';
        // Generate data flow from topic concepts
        const concepts = c.keyConcepts || [];
        const steps = c.howItWorks || [];
        contentBody.innerHTML = `
        <div class="content-section">
            <div class="content-section-title">📊 Data Flow — ${title}</div>
            <p style="margin-bottom:16px;color:var(--text-2)">How data moves through the system when ${title.toLowerCase()} is in use.</p>
            <pre class="flow-chart">${_generateDataFlowDiagram(title, steps)}</pre>
        </div>
        <div class="content-section">
            <div class="content-section-title">🔑 Data Components</div>
            <div class="data-flow-components">
                ${concepts.map((concept, i) => `
                    <div class="data-flow-component">
                        <h4>Component ${i + 1}</h4>
                        <p>${concept}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="content-section">
            <div class="content-section-title">⚡ Performance Considerations</div>
            <div class="tradeoff-grid">
                <div class="tradeoff-box pros"><h4>✅ Optimizations</h4><ul>${(c.tradeoffs?.pros || []).map(s => `<li>${s}</li>`).join('')}</ul></div>
                <div class="tradeoff-box cons"><h4>⚠️ Bottlenecks</h4><ul>${(c.tradeoffs?.cons || []).map(s => `<li>${s}</li>`).join('')}</ul></div>
            </div>
        </div>`;
    } else if (tab === 'caching') {
        contentBody.className = 'content-body single-col';
        contentBody.innerHTML = `
        <div class="content-section">
            <div class="content-section-title">💾 Caching Strategy for ${title}</div>
            <p style="margin-bottom:16px;color:var(--text-2)">How caching improves performance in the context of ${title.toLowerCase()}.</p>
            <div class="caching-layers">
                <div class="caching-layer">
                    <div class="cache-layer-header"><h4>Layer 1: Client-Side Cache</h4><span class="cache-ttl">TTL: 60s</span></div>
                    <p><strong>Strategy:</strong> Browser cache, localStorage, or in-memory cache on the client</p>
                    <p><strong>What to cache:</strong> Static assets, frequently accessed data, user preferences</p>
                    <p><strong>Benefit:</strong> Eliminates network round-trip entirely for repeated requests</p>
                </div>
                <div class="caching-layer">
                    <div class="cache-layer-header"><h4>Layer 2: CDN / Edge Cache</h4><span class="cache-ttl">TTL: 5m</span></div>
                    <p><strong>Strategy:</strong> Cache at edge locations geographically close to users</p>
                    <p><strong>What to cache:</strong> API responses, images, static files, pre-rendered pages</p>
                    <p><strong>Benefit:</strong> Reduces latency from 200ms to ~20ms for cached content</p>
                </div>
                <div class="caching-layer">
                    <div class="cache-layer-header"><h4>Layer 3: Application Cache (Redis/Memcached)</h4><span class="cache-ttl">TTL: 5-30m</span></div>
                    <p><strong>Strategy:</strong> Cache-aside or Write-through pattern using Redis</p>
                    <p><strong>What to cache:</strong> Database query results, computed aggregations, session data</p>
                    <p><strong>Benefit:</strong> Reduces database load by 80-95% for read-heavy workloads</p>
                </div>
                <div class="caching-layer">
                    <div class="cache-layer-header"><h4>Layer 4: Database Query Cache</h4><span class="cache-ttl">TTL: varies</span></div>
                    <p><strong>Strategy:</strong> Query result caching, materialized views</p>
                    <p><strong>What to cache:</strong> Expensive joins, aggregation queries, search results</p>
                    <p><strong>Benefit:</strong> Avoids repeated computation for identical queries</p>
                </div>
            </div>
        </div>
        <div class="content-section">
            <div class="content-section-title">🔄 Cache Invalidation Strategies</div>
            <div class="concepts-grid">
                <div class="concept-card"><strong>Cache-Aside (Lazy Loading)</strong> — App checks cache first, loads from DB on miss, writes to cache</div>
                <div class="concept-card"><strong>Write-Through</strong> — Every write goes to cache AND database simultaneously</div>
                <div class="concept-card"><strong>Write-Behind (Write-Back)</strong> — Write to cache immediately, async flush to DB</div>
                <div class="concept-card"><strong>TTL-Based Expiry</strong> — Cache entries expire after a set time, ensuring freshness</div>
            </div>
        </div>`;
    } else if (tab === 'deep-analysis') {
        contentBody.className = 'content-body single-col';
        const deepContent = _buildDeepAnalysis(title, c, enrichment);
        contentBody.innerHTML = deepContent;
    } else if (tab === 'algorithms') {
        contentBody.className = 'content-body single-col';
        const algos = enrichment.algorithms || [];
        if (algos.length === 0) {
            // Generate algo cards from topic concepts
            contentBody.innerHTML = `
            <div class="content-section">
                <div class="content-section-title">🧮 Core Algorithms & Data Structures — ${title}</div>
                <div class="algo-grid">
                    ${_generateAlgorithmsFromTopic(title, c).map((a, i) => `
                      <div class="algo-chip" style="cursor:default">
                        <div class="algo-chip-header">
                          <span class="algo-chip-name">${a.name}</span>
                          <span class="algo-chip-badge">${a.type}</span>
                        </div>
                        <div class="algo-chip-desc">${a.description}</div>
                        <div class="algo-chip-complexity">Complexity: ${a.complexity}</div>
                      </div>`).join('')}
                </div>
            </div>`;
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
        contentBody.innerHTML = `<div class="content-section"><div class="content-section-title">💻 Code Example — ${title}</div><pre class="content-code">${escapeHtml(c.codeExample || 'No code example available.')}</pre></div>`;
    } else if (tab === 'interview') {
        contentBody.className = 'content-body single-col';
        const tips = c.interviewTips || [];
        contentBody.innerHTML = `
        <div class="content-section">
            <div class="content-section-title">🎯 Interview Tips — ${title}</div>
            ${tips.map((t, i) => `<div class="interview-tip"><span class="step-num">${i+1}</span> ${t}</div>`).join('')}
        </div>
        <div class="content-section">
            <div class="content-section-title">💡 Common Interview Questions</div>
            <div class="concepts-grid">
                <div class="concept-card">❓ What is ${title} and why is it used?</div>
                <div class="concept-card">❓ How does ${title} work under the hood?</div>
                <div class="concept-card">❓ What are the trade-offs of ${title}?</div>
                <div class="concept-card">❓ When would you NOT use ${title}?</div>
                <div class="concept-card">❓ Compare ${title} with its alternatives</div>
                <div class="concept-card">❓ How do companies like Google/Amazon use ${title}?</div>
            </div>
        </div>`;
    }
}

// ─── Detailed Notes Builder (500-1000 words per topic) ───
function _buildDetailedNotes(title, c, enrichment) {
    const howWorks = (c.howItWorks || []).map((s, i) => `<p><strong>Step ${i+1}:</strong> ${s}</p>`).join('');
    const concepts = (c.keyConcepts || []).map(s => `<p>• ${s}</p>`).join('');
    const pros = (c.tradeoffs?.pros || []).map(s => `<li>${s}</li>`).join('');
    const cons = (c.tradeoffs?.cons || []).map(s => `<li>${s}</li>`).join('');
    const algos = (enrichment.algorithms || []).map(a => `<p><strong>${a.name}</strong> (${a.type}): ${a.description} — Complexity: ${a.complexity}</p>`).join('');
    const tips = (c.interviewTips || []).map(t => `<li>${t}</li>`).join('');

    return `
    <div class="detailed-notes-content">
        <h3>📘 ${title} — Complete Study Guide</h3>
        <h4>1. Introduction & Overview</h4>
        <p>${c.overview}</p>
        <p>Understanding ${title} is essential for any system design interview or real-world engineering project. This concept forms a critical building block in distributed systems, cloud architectures, and scalable application design.</p>

        <h4>2. How ${title} Works — Detailed Breakdown</h4>
        ${howWorks}
        <p>Each of these steps represents a critical phase in the overall process. In production environments at scale (millions of requests per second), every step must be optimized — from connection pooling to async processing — to meet strict SLA requirements (typically P99 latency under 200ms).</p>

        <h4>3. Core Concepts You Must Know</h4>
        ${concepts}
        <p>These concepts are interconnected. For example, in a microservices architecture, you need to understand how ${title} interacts with load balancing, caching, and database replication to build a resilient system.</p>

        <h4>4. Real-World Applications</h4>
        <p>${c.realWorld || ''}</p>
        <p>At companies like Google, Amazon, Netflix, and Meta, ${title} is used at massive scale. For example, Netflix handles over 2 billion API requests daily, and ${title.toLowerCase()} is a key part of their infrastructure that enables this scale.</p>

        <h4>5. Trade-offs & Design Decisions</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">
            <div style="background:rgba(22,163,74,0.1);padding:12px;border-radius:8px"><h5>✅ Advantages</h5><ul>${pros}</ul></div>
            <div style="background:rgba(239,68,68,0.1);padding:12px;border-radius:8px"><h5>❌ Disadvantages</h5><ul>${cons}</ul></div>
        </div>
        <p>The key insight is that there is no perfect solution — every design choice involves trade-offs. The best engineers understand these trade-offs and can articulate WHY they chose a particular approach for a given set of constraints.</p>

        ${algos ? `<h4>6. Key Algorithms & Data Structures</h4>${algos}` : ''}

        <h4>${algos ? '7' : '6'}. Interview Strategy</h4>
        <ul>${tips}</ul>
        <p><strong>Pro Tip:</strong> In interviews, always start by clarifying requirements (functional and non-functional), estimate the scale (QPS, storage, bandwidth), and then propose a high-level design before diving into ${title.toLowerCase()} specifics. Show that you understand WHERE and WHY to use ${title.toLowerCase()}, not just HOW it works.</p>
    </div>`;
}

// ─── Data Flow Diagram Generator ───
function _generateDataFlowDiagram(title, steps) {
    const shortTitle = title.length > 20 ? title.substring(0, 20) : title;
    let diagram = `  ┌─────────────────────────────────────────────┐
  │              ${shortTitle.padEnd(30)}  │
  └─────────────────────┬───────────────────────┘
                        │
    ┌───────────────────▼───────────────────────┐
    │           User / Client Request            │
    └───────────────────┬───────────────────────┘
                        │\n`;
    steps.forEach((step, i) => {
        const label = step.length > 45 ? step.substring(0, 42) + '...' : step;
        diagram += `    ┌───────────────────▼───────────────────────┐
    │  ${(i+1)}. ${label.padEnd(42)} │
    └───────────────────┬───────────────────────┘
                        │\n`;
    });
    diagram += `    ┌───────────────────▼───────────────────────┐
    │            Response to Client               │
    └─────────────────────────────────────────────┘`;
    return diagram;
}

// ─── Deep Analysis Builder ───
function _buildDeepAnalysis(title, c, enrichment) {
    const steps = c.howItWorks || [];
    const concepts = c.keyConcepts || [];
    const algos = enrichment.algorithms || [];
    return `
    <div class="content-section">
        <div class="content-section-title">🔬 Deep Analysis — ${title}</div>
        <div class="deep-analysis-grid">
            <div class="analysis-card">
                <h4>🏗️ Architecture Pattern</h4>
                <p>${c.overview}</p>
                <p>This pattern is typically implemented as part of a larger distributed system where reliability, scalability, and performance are critical requirements.</p>
            </div>
            <div class="analysis-card">
                <h4>📊 Scalability Analysis</h4>
                <ul>
                    ${steps.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                </ul>
                <p><strong>Scaling approach:</strong> Horizontal scaling with stateless services, database sharding, and multi-region deployment. Typical systems handle 10K-1M QPS.</p>
            </div>
            <div class="analysis-card">
                <h4>⚡ Performance Bottlenecks</h4>
                <ul>
                    ${(c.tradeoffs?.cons || []).map(s => `<li>🎯 ${s}</li>`).join('')}
                </ul>
                <p><strong>Mitigation:</strong> Use caching (Redis), async processing (message queues), and connection pooling to address these bottlenecks.</p>
            </div>
            <div class="analysis-card">
                <h4>🛡️ Failure Handling</h4>
                <p><strong>Circuit Breaker:</strong> When ${title.toLowerCase()} fails, the circuit breaker trips after N failures and returns cached/fallback responses.</p>
                <p><strong>Retry with Backoff:</strong> Failed requests are retried with exponential backoff (1s, 2s, 4s, 8s) to avoid thundering herd.</p>
                <p><strong>Replication:</strong> Critical data is replicated across 3+ nodes for fault tolerance.</p>
            </div>
            <div class="analysis-card">
                <h4>📈 Monitoring & Observability</h4>
                <p><strong>Metrics:</strong> Track P50/P95/P99 latency, throughput (QPS), error rate, and resource utilization.</p>
                <p><strong>Logging:</strong> Structured JSON logs with correlation IDs for request tracing.</p>
                <p><strong>Alerting:</strong> Set alerts for latency > 500ms, error rate > 1%, CPU > 80%.</p>
            </div>
            ${algos.length > 0 ? `
            <div class="analysis-card">
                <h4>🧮 Algorithms Used</h4>
                ${algos.map(a => `<p><strong>${a.name}</strong>: ${a.description}</p>`).join('')}
            </div>` : `
            <div class="analysis-card">
                <h4>🧮 Core Data Structures</h4>
                ${concepts.slice(0, 3).map(c => `<p>${c}</p>`).join('')}
            </div>`}
        </div>
    </div>`;
}

// ─── Algorithm Generator from Topic ───
function _generateAlgorithmsFromTopic(title, c) {
    const generic = [
        { name: 'Hash Table', type: 'Data Structure', description: `Used in ${title} for O(1) key-value lookups, caching, and deduplication`, complexity: 'O(1) avg' },
        { name: 'Binary Search', type: 'Search', description: `Efficiently find records in sorted data structures used by ${title}`, complexity: 'O(log n)' },
        { name: 'BFS/DFS', type: 'Graph Traversal', description: `Traverse dependency graphs and network topologies in ${title} implementations`, complexity: 'O(V + E)' },
        { name: 'Consistent Hashing', type: 'Distribution', description: `Distribute data evenly across nodes with minimal redistribution when nodes join/leave`, complexity: 'O(log n)' },
    ];
    return generic;
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

    // 🎨 Napkin AI — Visual Description button
    const napkinVisualBtn = $('#napkin-visual-btn');
    if (napkinVisualBtn) {
        napkinVisualBtn.addEventListener('click', () => {
            showVisualDescriptionPanel(currentTopic, null);
        });
    }
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

        // If this is a system design response, add a "Present This" button
        if (text.includes('SYSTEM DESIGN') || text.includes('Architecture') || text.includes('📐') || text.includes('🏗️')) {
            const presentBtn = document.createElement('button');
            presentBtn.className = 'rishi-present-btn';
            presentBtn.innerHTML = '🎬 Present This Design';
            presentBtn.title = 'Launch animated presentation of this design';
            presentBtn.addEventListener('click', () => presentRishiDesign(text));
            div.appendChild(presentBtn);
        }
    } else {
        div.textContent = text;
    }
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// ─── Present Rishi Design — synced to live visualization ───
function presentRishiDesign(designText) {

    // ── CASE 1: SystemDesignVisualizer is active ──
    // Walk through its own pre-built steps, highlight nodes, and narrate each step.
    const sdv = window._sdvInstance;
    const vizEl = document.getElementById('design-visualizer');
    const sdvActive = sdv && vizEl && vizEl.style.display !== 'none' && sdv.steps && sdv.steps.length > 0;

    if (sdvActive) {
        // Close AI panel so diagram is fully visible
        const aiPanelEl = document.getElementById('ai-panel');
        if (aiPanelEl) aiPanelEl.classList.remove('open');

        // Stop any auto-play the SDV might be doing
        sdv.stop();

        // Add a narration bar at the bottom of the visualizer (if not already there)
        let narrationBar = vizEl.querySelector('.sdv-narration-bar');
        if (!narrationBar) {
            narrationBar = document.createElement('div');
            narrationBar.className = 'sdv-narration-bar';
            narrationBar.style.cssText = `
                position: sticky; bottom: 0; left: 0; right: 0;
                background: linear-gradient(135deg, rgba(15,11,30,0.97), rgba(107,29,110,0.18));
                border-top: 1px solid rgba(107,29,110,0.4);
                padding: 12px 20px; display: flex; align-items: center; gap: 12px;
                z-index: 100; backdrop-filter: blur(8px);
            `;
            vizEl.appendChild(narrationBar);
        }

        let isPresenting = true;

        // Stop button
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹ Stop';
        stopBtn.style.cssText = 'background:rgba(220,38,38,0.2);border:1px solid #dc2626;color:#fca5a5;padding:5px 12px;border-radius:8px;cursor:pointer;font-size:0.8rem;white-space:nowrap;';
        stopBtn.onclick = () => {
            isPresenting = false;
            stopRishiVoice();
            narrationBar.remove();
        };

        const narrationText = document.createElement('span');
        narrationText.style.cssText = 'color:#e2e8f0;font-size:0.9rem;line-height:1.4;flex:1;';
        narrationText.textContent = '🎬 Starting presentation...';

        const stepCounter = document.createElement('span');
        stepCounter.style.cssText = 'color:#c084fc;font-size:0.8rem;font-weight:600;white-space:nowrap;';

        narrationBar.innerHTML = '';
        narrationBar.appendChild(stopBtn);
        narrationBar.appendChild(narrationText);
        narrationBar.appendChild(stepCounter);

        const totalSteps = sdv.steps.length;

        function narrateStep(idx) {
            if (!isPresenting || idx >= totalSteps) {
                if (isPresenting) {
                    narrationText.textContent = '✅ Presentation complete! Use the ← → buttons to review any step.';
                    speakRishiVoice('Presentation complete. Use the navigation buttons to revisit any step.');
                }
                return;
            }

            const step = sdv.steps[idx];

            // Highlight the nodes in the live diagram
            sdv._highlightStep(idx);

            // Update narration bar
            stepCounter.textContent = `Step ${idx + 1} / ${totalSteps}`;
            narrationText.textContent = `${step.title} — ${step.desc}`;

            // Build natural English narration from step data
            const narration = `Step ${idx + 1}. ${step.title}. ${step.desc} ${step.impl ? 'Implementation: ' + step.impl : ''} ${step.algo ? 'Algorithm used: ' + step.algo : ''}`;

            speakRishiVoice(narration, () => {
                if (!isPresenting) return;
                setTimeout(() => narrateStep(idx + 1), 600);
            });
        }

        narrateStep(0);
        return;
    }

    // ── CASE 2: No SDV active — fallback to canvas slide mode ──
    // Parse design text and show animated slides on the main canvas.

    const lines = designText.split('\n').map(l => l.trim()).filter(Boolean);

    function toSpeakable(raw) {
        return raw
            .replace(/[━─=\-]{3,}/g, '')
            .replace(/\b(GET|POST|PUT|PATCH|DELETE|WS)\s+\/[\w\/:\-\.]+/gi, (m) => {
                const method = m.split(' ')[0];
                return method === 'GET' ? 'read endpoint' : method === 'POST' ? 'create endpoint' : 'update or delete endpoint';
            })
            .replace(/\/[\w\/:\-\.\?=&]+/g, '').replace(/\/\/.*/g, '')
            .replace(/—/g, ', ').replace(/->/g, ' to ')
            .replace(/[*_`#<>{}[\]()]/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
    }

    const sectionMap = {};
    let currentKey = 'intro';
    sectionMap[currentKey] = [];
    for (const line of lines) {
        if (line.includes('ARCHITECTURE')) { currentKey = 'architecture'; sectionMap[currentKey] = []; }
        else if (line.includes('API ENDPOINT')) { currentKey = 'apis'; sectionMap[currentKey] = []; }
        else if (line.includes('ALGORITHM')) { currentKey = 'algorithms'; sectionMap[currentKey] = []; }
        else if (line.includes('DATABASE') || line.includes('SCHEMA')) { currentKey = 'database'; sectionMap[currentKey] = []; }
        else if (line.includes('SCALING')) { currentKey = 'scaling'; sectionMap[currentKey] = []; }
        else { if (!sectionMap[currentKey]) sectionMap[currentKey] = []; sectionMap[currentKey].push(line); }
    }

    const titleLine = lines.find(l => l.includes('SYSTEM DESIGN'));
    const appName = titleLine ? titleLine.replace(/[🏗️━─\-]/g, '').replace('SYSTEM DESIGN:', '').trim() : 'this application';

    const steps = [
        { title: `System Design: ${appName}`, display: `🏗️ ${appName}`, narration: `Welcome to the system design presentation for ${appName}. We will walk through the complete architecture including the frontend, backend, APIs, algorithms, database, and scaling strategy.` }
    ];

    const arch = (sectionMap.architecture || []).filter(l => l.length > 3);
    if (arch.length) steps.push({ title: 'Architecture Overview', display: arch.slice(0, 6).map(toSpeakable).join('\n'), narration: `Let us start with the architecture. ${arch.map(toSpeakable).join('. ')}. Together these components power ${appName}.` });

    const apis = (sectionMap.apis || []).filter(l => l.length > 3);
    if (apis.length) steps.push({ title: 'API Endpoints', display: apis.slice(0, 6).join('\n'), narration: `The key APIs handle: ${apis.map(l => l.replace(/\b(GET|POST|PUT|PATCH|DELETE|WS)\s+\/[\w\/:\-\.]+/gi, '').replace(/—/g, ', ').trim()).filter(Boolean).slice(0, 5).join('. ')}.` });

    const algos = (sectionMap.algorithms || []).filter(l => l.length > 3);
    if (algos.length) steps.push({ title: 'Algorithms & Data Structures', display: algos.slice(0, 6).join('\n'), narration: `Key algorithms for ${appName}: ${algos.map(toSpeakable).join('. ')}.` });

    const db = (sectionMap.database || []).filter(l => l.length > 3);
    if (db.length) steps.push({ title: 'Database Schema', display: db.slice(0, 8).join('\n'), narration: `The database schema for ${appName}: ${db.map(toSpeakable).join('. ')}.` });

    const scale = (sectionMap.scaling || []).filter(l => l.length > 3);
    if (scale.length) steps.push({ title: 'Scaling Strategy', display: scale.slice(0, 6).join('\n'), narration: `Scaling strategy: ${scale.map(toSpeakable).join('. ')}. With these techniques the system scales horizontally.` });

    steps.push({ title: 'Design Complete!', display: '✅ Done', narration: `That completes the system design for ${appName}. Explore Load Balancing, Caching, and Microservices in the sidebar for deeper dives.` });

    const aiPanelEl = document.getElementById('ai-panel');
    if (aiPanelEl) aiPanelEl.classList.remove('open');

    const subtitleEl = document.getElementById('canvas-subtitles');
    const descEl = document.getElementById('step-description');

    function drawStep(idx) {
        if (idx >= steps.length) { speakRishiVoice('Presentation complete.'); return; }
        const step = steps[idx];
        const cvs = document.getElementById('main-canvas');
        if (cvs && cvs.offsetParent !== null) {
            const ctx = cvs.getContext('2d');
            const w = cvs.width, h = cvs.height;
            ctx.fillStyle = '#0f0b1e'; ctx.fillRect(0, 0, w, h);
            const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 350);
            grd.addColorStop(0, 'rgba(107,29,110,0.22)'); grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(107,29,110,0.4)';
            ctx.beginPath(); ctx.roundRect(w/2 - 55, 24, 110, 32, 16); ctx.fill();
            ctx.fillStyle = '#c084fc'; ctx.font = '600 13px Outfit, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`Step ${idx + 1} of ${steps.length}`, w/2, 40);

            // Title
            ctx.fillStyle = '#f0abfc'; ctx.font = '700 20px Outfit, sans-serif';
            ctx.fillText(step.title.substring(0, 56), w/2, h/2 - 60);

            // Display content (word-wrapped)
            const displayLines = step.display.split('\n').slice(0, 8);
            ctx.fillStyle = '#94a3b8'; ctx.font = '400 13px Outfit, sans-serif';
            let ly = h/2 - 20;
            for (const dl of displayLines) {
                const line = toSpeakable(dl).substring(0, 72);
                if (line) { ctx.fillText(line, w/2, ly); ly += 22; }
            }

            ctx.fillStyle = 'rgba(148,163,184,0.4)'; ctx.font = '11px Outfit, sans-serif';
            ctx.fillText('🔊 Narrating...', w/2, h - 26);
        }

        if (subtitleEl) { subtitleEl.textContent = step.title; subtitleEl.classList.add('active'); }
        if (descEl) descEl.innerHTML = `<strong>${step.title}</strong>`;

        // Speak the natural English narration
        speakRishiVoice(step.narration, () => {
            setTimeout(() => {
                if (subtitleEl) subtitleEl.classList.remove('active');
                drawDesignStep(idx + 1);
            }, 700);
        });
    }

    drawDesignStep(0);
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

    // CODE QUESTIONS take priority — never send to design visualizer
    const codeKeywords = ['code', 'implement', 'implementation', 'write', 'snippet', 'example code',
        'boilerplate', 'starter', 'framework code', 'help me code', 'show me how', 'how do i',
        'how to implement', 'sample code', 'basic code', 'coding', 'function', 'class', 'method',
        'syntax', 'script', 'program', 'algorithm code', 'step by step code'];
    const isCodeRequest = codeKeywords.some(k => q.includes(k));

    const ideaKeywords = ['design an app', 'design a platform', 'design a system', 'design a service',
        'design like uber', 'design like netflix', 'design like whatsapp', 'design like instagram',
        'design like twitter', 'design like amazon', 'design like spotify',
        'architecture for', 'system design for', 'build an app', 'build a platform',
        'create an app', 'create a platform', 'e-commerce', 'ecommerce',
        'marketplace app', 'booking app', 'delivery app', 'streaming app',
        'ride sharing', 'food delivery', 'social media app', 'chat app'];
    const isAppIdea = !isCodeRequest && ideaKeywords.some(k => q.includes(k)) && q.length > 15;


    if (isAppIdea) {
        // Generate the structured design text (for presentation)
        const designText = generateSystemDesign(text);

        // Update chat message with design summary + Present button
        thinkingDiv.classList.remove('ai-thinking');
        thinkingDiv.innerHTML = `
          <div class="ai-md-content">
            <strong>🏗️ System design generated!</strong> Check the visual architecture in the main panel.<br>
            <em style="color:var(--text-3);font-size:0.82rem;">Scroll down in the main area to explore components, APIs, and scaling strategies.</em>
          </div>
          <button class="rishi-present-btn" id="rishi-present-design-btn" title="Animate through the design with voice narration">🎬 Present This Design</button>
        `;

        // Wire up the chat Present button
        setTimeout(() => {
            const btn = document.getElementById('rishi-present-design-btn');
            if (btn) btn.addEventListener('click', () => presentRishiDesign(designText));
        }, 100);

        // Show visual system design
        const homeViewEl = document.getElementById('home-view');
        const topicViewEl = document.getElementById('topic-view');
        const vizEl = document.getElementById('design-visualizer');
        if (homeViewEl) homeViewEl.style.display = 'none';
        if (topicViewEl) topicViewEl.style.display = 'none';
        if (vizEl) {
            vizEl.style.display = 'block';
            // Recreate instance each time for fresh state
            if (window._sdvInstance) window._sdvInstance.destroy();
            window._sdvInstance = new SystemDesignVisualizer(vizEl);

            // Inject a floating Present button into the design-visualizer panel
            const existingPresent = vizEl.querySelector('.sdv-present-btn');
            if (!existingPresent) {
                const presentOverlay = document.createElement('button');
                presentOverlay.className = 'sdv-present-btn rishi-present-btn';
                presentOverlay.innerHTML = '🎬 Present This Design';
                presentOverlay.title = 'Animate through the design with voice narration';
                presentOverlay.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;';
                presentOverlay.addEventListener('click', () => presentRishiDesign(designText));
                vizEl.appendChild(presentOverlay);
            }

            // Override back button to restore home view
            const origRender = window._sdvInstance._render.bind(window._sdvInstance);
            window._sdvInstance._render = function (design) {
                origRender(design);
                const backBtn = this.container.querySelector('.sdv-back-btn');
                if (backBtn) backBtn.onclick = () => {
                    this.container.style.display = 'none';
                    this.stop();
                    if (homeViewEl) homeViewEl.style.display = '';
                };
            };
            window._sdvInstance.generate(text);
        }
    } else {
        // Use RishiAgent for high-quality answers
        try {
            const result = await rishiAgent.askQuestion(text);
            thinkingDiv.textContent = result.answer;
            thinkingDiv.classList.remove('ai-thinking');

            // Add Markdown rendering
            thinkingDiv.innerHTML = `<div class="ai-md-content">${markdownToHtml(result.answer)}</div>`;

            if (isVoiceEnabled) speakRishiVoice(result.answer);
        } catch (e) {
            thinkingDiv.textContent = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
            thinkingDiv.classList.remove('ai-thinking');
        }
    }
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
