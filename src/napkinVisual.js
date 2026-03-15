/**
 * SysWizard Visual Engine
 * Generates architecture diagrams for any topic — zero API key needed
 */

// ─── Known topic templates ───────────────────────────────────────────────────
const TEMPLATES = {
    kafka: () => `flowchart LR
    classDef prod fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef broker fill:#1e1b4b,stroke:#7c3aed,color:#fff
    classDef cons fill:#312e81,stroke:#6366f1,color:#fff
    classDef topic fill:#4c1d95,stroke:#a78bfa,color:#f3f4f6
    P1["🏭 Producer 1"]:::prod
    P2["🏭 Producer 2"]:::prod
    T1[/"📨 Topic A"/]:::topic
    T2[/"📨 Topic B"/]:::topic
    B1["🖥 Broker 1"]:::broker
    B2["🖥 Broker 2"]:::broker
    B3["🖥 Broker 3"]:::broker
    C1["📥 Consumer 1"]:::cons
    C2["📥 Consumer 2"]:::cons
    P1 --> T1 & T2
    P2 --> T1
    T1 & T2 --> B1 & B2 & B3
    B1 & B2 --> C1
    B3 --> C2`,

    redis: () => `flowchart TD
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef cache fill:#713f12,stroke:#f59e0b,color:#fef3c7
    APP["🖥 Application"]:::main
    R1["⚡ Redis Primary"]:::cache
    R2["⚡ Replica 1"]:::cache
    R3["⚡ Replica 2"]:::cache
    DB[("🗄 Database")]:::node
    APP -->|"Read (cache hit)"| R1
    APP -->|"Cache miss → read"| DB
    DB -->|"Write-through"| R1
    R1 --> R2 & R3`,

    microservices: () => `flowchart TD
    classDef gw fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef svc fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef db fill:#134e4a,stroke:#14b8a6,color:#ccfbf1
    GW["🚪 API Gateway"]:::gw
    AUTH["🔐 Auth Service"]:::svc
    USER["👥 User Service"]:::svc
    ORDER["📦 Order Service"]:::svc
    NOTIF["🔔 Notification"]:::svc
    DB1[("Users DB")]:::db
    DB2[("Orders DB")]:::db
    CLIENT["🌐 Client"] --> GW
    GW --> AUTH & USER & ORDER
    ORDER --> NOTIF
    USER --> DB1
    ORDER --> DB2`,

    auth: () => `flowchart LR
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef token fill:#713f12,stroke:#f59e0b,color:#fef3c7
    C["🌐 Client"]:::node
    GW["🚪 API Gateway"]:::main
    AS["🔐 Auth Server"]:::main
    RS["🖥 Resource Server"]:::node
    DB[("🗄 User DB")]:::node
    JWT["🎫 JWT Token"]:::token
    C -->|"1. Login request"| GW
    GW -->|"2. Validate"| AS
    AS -->|"3. Check"| DB
    AS -->|"4. Issue"| JWT
    JWT -->|"5. Attach"| C
    C -->|"6. Request + JWT"| RS
    RS -->|"7. Verify token"| AS`,

    docker: () => `flowchart TD
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef pod fill:#134e4a,stroke:#14b8a6,color:#ccfbf1
    K8S["☸️ Kubernetes Cluster"]:::main
    NI["⚖️ Ingress / LB"]:::node
    P1["🐳 Pod: App-1"]:::pod
    P2["🐳 Pod: App-2"]:::pod
    P3["🐳 Pod: App-3"]:::pod
    SVC["🔗 Service"]:::node
    CM["⚙️ ConfigMap"]:::node
    SEC["🔒 Secrets"]:::node
    K8S --> NI --> SVC
    SVC --> P1 & P2 & P3
    P1 & P2 & P3 --> CM & SEC`,

    cdn: () => `flowchart LR
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef cdn fill:#713f12,stroke:#f59e0b,color:#fef3c7
    U["🌐 User"]:::node
    CDN["📦 CDN Edge"]:::cdn
    LB["⚖️ Load Balancer"]:::main
    S1["🖥 Server 1"]:::node
    S2["🖥 Server 2"]:::node
    DB[("🗄 DB")]:::node
    S3["🗃 Object Storage"]:::node
    U -->|"Request"| CDN
    CDN -->|"Cache miss"| LB
    LB --> S1 & S2
    S1 & S2 --> DB & S3
    CDN -.->|"Cache hit → serve"| U`,

    'load-balancing': () => `flowchart TD
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    classDef algo fill:#312e81,stroke:#6366f1,color:#e0e7ff
    C["🌐 Clients"]:::node
    LB["⚖️ Load Balancer"]:::main
    RR["🔄 Round Robin"]:::algo
    LC["📊 Least Connections"]:::algo
    IH["🔑 IP Hash"]:::algo
    S1["🖥 Server 1"]:::node
    S2["🖥 Server 2"]:::node
    S3["🖥 Server 3"]:::node
    HC["💓 Health Check"]:::algo
    C --> LB
    LB --> RR & LC & IH
    RR & LC --> S1 & S2 & S3
    IH --> S1 & S3
    HC -.->|"Monitor"| S1 & S2 & S3`,

    graphql: () => `flowchart LR
    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff
    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0
    C["🌐 Client"]:::node
    GQL["◈ GraphQL Gateway"]:::main
    US["👥 User Service"]:::node
    PS["📦 Product Service"]:::node
    OS["📋 Order Service"]:::node
    DB1[("Users DB")]:::node
    DB2[("Products DB")]:::node
    C -->|"Single Query"| GQL
    GQL -->|"Resolve"| US & PS & OS
    US --> DB1
    PS & OS --> DB2`,
};

// ─── Match user text to a template ───────────────────────────────────────────
function detectTemplate(text) {
    const t = text.toLowerCase();
    if (t.includes('kafka') || (t.includes('producer') && t.includes('consumer'))) return TEMPLATES.kafka();
    if (t.includes('redis') || (t.includes('cache') && t.includes('replica'))) return TEMPLATES.redis();
    if (t.includes('microservice') || (t.includes('service') && t.includes('gateway') && t.includes('api'))) return TEMPLATES.microservices();
    if (t.includes('auth') || t.includes('jwt') || t.includes('oauth') || t.includes('login')) return TEMPLATES.auth();
    if (t.includes('docker') || t.includes('kubernetes') || t.includes('k8s') || t.includes('container') || t.includes('pod')) return TEMPLATES.docker();
    if (t.includes('cdn') || t.includes('content delivery')) return TEMPLATES.cdn();
    if (t.includes('load balanc') || t.includes('round robin') || t.includes('least connection')) return TEMPLATES['load-balancing']();
    if (t.includes('graphql')) return TEMPLATES.graphql();
    return null;
}

// ─── Build diagram from a topic object (64 built-in topics) ──────────────────
function buildDiagramFromTopic(topic) {
    const c = topic.content || {};
    const title = topic.title || 'System';

    // Try template first by topic id/title
    const titleLower = title.toLowerCase();
    const tmpl = detectTemplate(titleLower + ' ' + (c.keyConcepts || []).join(' '));
    if (tmpl) return tmpl;

    const steps = c.howItWorks || [];
    const concepts = c.keyConcepts || [];
    if (steps.length >= 2) return buildFlowchart(title, steps, concepts);
    if (concepts.length >= 2) return buildMindmap(title, concepts);
    return buildArchDiagram(title, []);
}

// ─── Build diagram from free-form user text ───────────────────────────────────
function buildDiagramFromText(text) {
    if (!text || text.trim().length < 3) return buildArchDiagram('System Design', []);

    // 1. Try known templates
    const tmpl = detectTemplate(text);
    if (tmpl) return tmpl;

    const lower = text.toLowerCase();
    const lines = text.split(/[\n,;]/).map(s => s.trim()).filter(Boolean);
    const title = lines[0].substring(0, 40) || 'System Design';

    // 2. Detect architecture keywords → component diagram
    const archKeywords = ['api', 'database', 'db', 'cache', 'queue', 'server',
        'client', 'balancer', 'cdn', 'gateway', 'service', 'auth',
        'storage', 'proxy', 'broker', 'node', 'worker', 'endpoint'];
    const matched = archKeywords.filter(k => lower.includes(k));
    if (matched.length >= 1) return buildArchDiagram(title, matched);

    // 3. Multi-line → flowchart steps
    if (lines.length >= 3) return buildFlowchart(title, lines.slice(0, 6), []);

    // 4. Few words → mindmap of words
    const words = text.trim().split(/\s+/).filter(w => w.length > 3);
    if (words.length >= 3) return buildMindmap(title, words.slice(0, 8));

    return buildArchDiagram(title, []);
}

// ─── Flowchart builder ────────────────────────────────────────────────────────
function buildFlowchart(title, steps, concepts) {
    const nodeIds = steps.map((_, i) => `S${i}`);
    return [
        `flowchart TD`,
        `    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff`,
        `    classDef step fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0`,
        `    classDef concept fill:#134e4a,stroke:#14b8a6,color:#ccfbf1`,
        `    TITLE["🏗️ ${san(title)}"]:::main`,
        ...steps.slice(0, 6).map((s, i) => `    ${nodeIds[i]}["${i + 1}. ${san(String(s)).substring(0, 38)}"]:::step`),
        `    TITLE --> ${nodeIds[0]}`,
        ...nodeIds.slice(0, Math.min(steps.length - 1, 5)).map((id, i) => `    ${id} --> ${nodeIds[i + 1]}`),
        ...concepts.slice(0, 3).map((c, i) => `    C${i}(["💡 ${san(String(c)).substring(0, 30)}"]):::concept\n    ${nodeIds[0]} -.-> C${i}`),
    ].join('\n');
}

// ─── Mindmap builder ─────────────────────────────────────────────────────────
function buildMindmap(title, items) {
    return [`mindmap`, `  root((${san(title)}))`,
        ...items.slice(0, 8).map(c => `    ${san(String(c)).substring(0, 35)}`)
    ].join('\n');
}

// ─── Architecture component diagram ──────────────────────────────────────────
function buildArchDiagram(title, comps) {
    const has = k => comps.some(c => c.includes(k));
    const nodes = [], edges = [];
    let n = 0; const id = () => `N${n++}`;

    const clientId = id();
    nodes.push(`    ${clientId}["🌐 Client"]:::client`);
    let prev = clientId;

    if (has('cdn')) { const x = id(); nodes.push(`    ${x}["📦 CDN"]:::node`); edges.push(`    ${prev} --> ${x}`); prev = x; }
    if (has('balancer') || has('proxy')) { const x = id(); nodes.push(`    ${x}["⚖️ Load Balancer"]:::main`); edges.push(`    ${prev} --> ${x}`); prev = x; }
    if (has('gateway') || has('api')) { const x = id(); nodes.push(`    ${x}["🚪 API Gateway"]:::main`); edges.push(`    ${prev} --> ${x}`); prev = x; }
    if (has('auth')) { const x = id(); nodes.push(`    ${x}["🔐 Auth"]:::node`); edges.push(`    ${prev} -.-> ${x}`); }
    const svcId = id();
    nodes.push(`    ${svcId}["🖥 ${has('service') ? 'Services' : 'Application'}"]:::node`);
    edges.push(`    ${prev} --> ${svcId}`);
    if (has('cache')) { const x = id(); nodes.push(`    ${x}["⚡ Cache"]:::cache`); edges.push(`    ${svcId} --> ${x}`); }
    if (has('queue') || has('broker')) { const x = id(); nodes.push(`    ${x}["📨 Queue"]:::node`); edges.push(`    ${svcId} --> ${x}`); }
    if (has('database') || has('db') || has('storage')) { const x = id(); nodes.push(`    ${x}[("🗄 Database")]:::node`); edges.push(`    ${svcId} --> ${x}`); }

    return [
        `flowchart TD`,
        `    classDef main fill:#6b1d6e,stroke:#9333ea,color:#fff`,
        `    classDef node fill:#1e1b4b,stroke:#7c3aed,color:#e2e8f0`,
        `    classDef client fill:#1e1035,stroke:#a855f7,color:#d8b4fe`,
        `    classDef cache fill:#713f12,stroke:#f59e0b,color:#fef3c7`,
        `    TITLE["🏗️ ${san(title)}"]:::main`,
        `    TITLE --> ${clientId}`,
        ...nodes, ...edges,
    ].join('\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const san = s => String(s).replace(/[<>"'&;{}]/g, '').trim().substring(0, 40);

function getDiagramUrl(code) {
    try { return `https://mermaid.ink/svg/${btoa(unescape(encodeURIComponent(code)))}`; }
    catch { return `https://mermaid.ink/svg/${btoa(code)}`; }
}

function formatTopicText(topic) {
    const c = topic.content || {};
    const lines = [`# ${topic.title}`];
    if (c.overview) lines.push(`\n${c.overview}`);
    if (c.howItWorks?.length) { lines.push('\n## How It Works'); c.howItWorks.forEach((s, i) => lines.push(`${i + 1}. ${s}`)); }
    if (c.keyConcepts?.length) { lines.push('\n## Key Concepts'); c.keyConcepts.forEach(k => lines.push(`• ${k}`)); }
    return lines.join('\n');
}

// ─── Main: Show Visual Description Panel ─────────────────────────────────────
export function showVisualDescriptionPanel(topic, designText) {
    document.getElementById('syswizard-visual-panel')?.remove();

    const initialCode = topic ? buildDiagramFromTopic(topic) : buildDiagramFromText(designText || '');
    const initialUrl = getDiagramUrl(initialCode);
    const panelTitle = topic ? topic.title : 'Custom Diagram';
    const defaultPrompt = topic ? topic.title : (designText || '');

    const panel = document.createElement('div');
    panel.id = 'syswizard-visual-panel';
    panel.className = 'napkin-panel';
    panel.innerHTML = `
        <div class="napkin-overlay" id="sw-overlay"></div>
        <div class="napkin-modal sw-modal">
            <!-- Header -->
            <div class="sw-header">
                <div class="sw-title-row">
                    <span class="sw-icon">🎨</span>
                    <div>
                        <div class="sw-title-text">SysWizard Visual</div>
                        <div class="sw-subtitle">${panelTitle} — Architecture Diagram</div>
                    </div>
                </div>
                <button class="sw-close-btn" id="sw-close">✕</button>
            </div>

            <!-- Prompt input -->
            <div class="sw-prompt-section">
                <div class="sw-prompt-label">✨ Describe anything to visualize</div>
                <div class="sw-prompt-row">
                    <input type="text" class="sw-prompt-input" id="sw-prompt-input"
                        placeholder="e.g. Kafka with producers, brokers and consumers..."
                        value="${defaultPrompt}" />
                    <button class="sw-generate-btn" id="sw-prompt-btn">⚡ Generate</button>
                </div>
                <div class="sw-hint">Works for any system: Kafka, Redis, Docker, OAuth, GraphQL, microservices, or your own idea…</div>
            </div>

            <!-- Diagram preview -->
            <div class="sw-preview-area" id="sw-preview">
                <div class="sw-loading" id="sw-loading">
                    <div class="sw-spinner"></div>
                    <span class="sw-loading-text">Generating diagram…</span>
                </div>
                <img id="sw-result-img" class="sw-result-img" style="display:none;" alt="Architecture diagram" />
                <div id="sw-img-error" class="sw-error-text" style="display:none;">
                    ⚠️ Couldn't render this diagram. Try rephrasing your description.
                </div>
            </div>

            <!-- Action buttons -->
            <div class="sw-actions">
                <div class="sw-btn-row">
                    <button class="sw-btn sw-btn-primary" id="sw-regen-btn">🔄 Regenerate</button>
                    <a class="sw-btn sw-btn-secondary" id="sw-download-btn" href="${initialUrl}" target="_blank" download="syswizard-diagram.svg">⬇ Download SVG</a>
                    <button class="sw-btn sw-btn-ghost" id="sw-copy-btn">📋 Copy Code</button>
                </div>
                <div class="sw-status" id="sw-status"></div>
                <details class="sw-code-details">
                    <summary>🔧 View / Edit Diagram Code</summary>
                    <textarea class="sw-code-area" id="sw-code-area" spellcheck="false">${initialCode}</textarea>
                    <button class="sw-btn sw-btn-secondary" id="sw-render-btn" style="margin-top:8px;width:100%;">▶ Render</button>
                </details>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('napkin-panel--open'));
    loadDiagram(initialUrl);

    // ── Events ──
    const close = () => { panel.classList.remove('napkin-panel--open'); setTimeout(() => panel.remove(), 300); };
    document.getElementById('sw-close').onclick = close;
    document.getElementById('sw-overlay').onclick = close;

    const generate = () => {
        const input = document.getElementById('sw-prompt-input').value.trim();
        if (!input) return;
        const code = buildDiagramFromText(input);
        document.getElementById('sw-code-area').value = code;
        const url = getDiagramUrl(code);
        document.getElementById('sw-download-btn').href = url;
        loadDiagram(url);
    };

    document.getElementById('sw-prompt-btn').onclick = generate;
    document.getElementById('sw-prompt-input').addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
    document.getElementById('sw-regen-btn').onclick = () => {
        const code = document.getElementById('sw-code-area').value;
        const url = getDiagramUrl(code);
        document.getElementById('sw-download-btn').href = url;
        loadDiagram(url);
    };
    document.getElementById('sw-render-btn').onclick = () => {
        const code = document.getElementById('sw-code-area').value;
        const url = getDiagramUrl(code);
        document.getElementById('sw-download-btn').href = url;
        loadDiagram(url);
    };
    document.getElementById('sw-copy-btn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('sw-code-area').value)
            .then(() => showStatus('✅ Diagram code copied!', 'success'));
    };

    function loadDiagram(url) {
        const loading = document.getElementById('sw-loading');
        const img = document.getElementById('sw-result-img');
        const errEl = document.getElementById('sw-img-error');
        if (loading) loading.style.display = 'flex';
        if (img) img.style.display = 'none';
        if (errEl) errEl.style.display = 'none';
        const tmp = new Image();
        tmp.onload = () => { if (loading) loading.style.display = 'none'; img.src = url; img.style.display = 'block'; showStatus('✅ Diagram ready! Use "Download SVG" to save.', 'success'); };
        tmp.onerror = () => { if (loading) loading.style.display = 'none'; if (errEl) errEl.style.display = 'block'; showStatus('⚠️ Try rephrasing your input.', 'warn'); };
        tmp.src = url;
    }

    function showStatus(msg, type) {
        const el = document.getElementById('sw-status');
        if (el) { el.textContent = msg; el.className = `sw-status sw-status--${type}`; }
    }
}
