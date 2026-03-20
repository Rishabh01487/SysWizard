/**
 * DebugSystemGame — Find the bottleneck/broken node in a system diagram
 */
const SCENARIOS = [
    {
        title: 'The Slow Checkout',
        symptom: '🐢 Checkout takes 12 seconds. Users are abandoning carts. One component is the culprit.',
        nodes: [
            { id:'client', icon:'💻', name:'Client', metric:'200ms response', buggy:false },
            { id:'lb', icon:'⚖️', name:'Load Balancer', metric:'2ms routing', buggy:false },
            { id:'api', icon:'🖥️', name:'API Server', metric:'50ms processing', buggy:false },
            { id:'db', icon:'🗄️', name:'Database', metric:'11,800ms query!', buggy:true },
            { id:'cache', icon:'💾', name:'Cache', metric:'5ms lookup', buggy:false },
            { id:'email', icon:'📧', name:'Email Service', metric:'200ms send', buggy:false },
        ],
        buggyId: 'db',
        explanation: 'The Database is running a full table scan with no index on the orders table. Adding a composite index on (user_id, created_at) would fix this.',
        fix: 'Add a database index on the hottest query columns. Consider caching order aggregations in Redis for repeat lookups.'
    },
    {
        title: 'The Cascade Failure',
        symptom: '💥 All users get 503 errors. The app was fine 5 minutes ago after a deploy.',
        nodes: [
            { id:'client', icon:'💻', name:'Client', metric:'503 errors', buggy:false },
            { id:'lb', icon:'⚖️', name:'Load Balancer', metric:'Routing OK', buggy:false },
            { id:'api1', icon:'🖥️', name:'API Server 1', metric:'CRASHED', buggy:false },
            { id:'api2', icon:'🖥️', name:'API Server 2', metric:'CRASHED', buggy:false },
            { id:'config', icon:'⚙️', name:'Config Service', metric:'Connection refused', buggy:true },
            { id:'db', icon:'🗄️', name:'Database', metric:'Healthy', buggy:false },
        ],
        buggyId: 'config',
        explanation: 'The Config Service went down during deploy. All API servers depend on it for startup config — without it they\'re crashing on boot.',
        fix: 'Cache configs locally at startup. Implement graceful degradation with default configs so app servers don\'t hard-fail when config service is unreachable.'
    },
    {
        title: 'The Memory Leak',
        symptom: '📈 Server performance degrades every 6 hours, then crashes. Restarts temporarily fix it.',
        nodes: [
            { id:'lb', icon:'⚖️', name:'Load Balancer', metric:'Healthy', buggy:false },
            { id:'api', icon:'🖥️', name:'API Server', metric:'RAM: 98% 🔴', buggy:true },
            { id:'cache', icon:'💾', name:'Redis Cache', metric:'Hit rate: 92%', buggy:false },
            { id:'db', icon:'🗄️', name:'Database', metric:'CPU: 12%', buggy:false },
            { id:'queue', icon:'📬', name:'Message Queue', metric:'0 pending', buggy:false },
        ],
        buggyId: 'api',
        explanation: 'The API server has a memory leak — likely unclosed database connections or event listeners accumulating over time.',
        fix: 'Profile the heap with Node/Java profilers. Ensure connection pools have max size limits and connections are released after each request.'
    },
    {
        title: 'The Silent Data Loss',
        symptom: '🔇 Users report saved data disappearing occasionally. No errors in app logs.',
        nodes: [
            { id:'client', icon:'💻', name:'Client', metric:'Writes succeed', buggy:false },
            { id:'api', icon:'🖥️', name:'API Server', metric:'200 OK', buggy:false },
            { id:'dbmaster', icon:'🗄️', name:'DB Primary', metric:'Writes OK', buggy:false },
            { id:'dbreplica', icon:'📋', name:'DB Replica', metric:'Lag: 30s 🔴', buggy:true },
            { id:'lb', icon:'⚖️', name:'Read Load Balancer', metric:'Routing reads to replica', buggy:false },
        ],
        buggyId: 'dbreplica',
        explanation: 'The DB Replica has a 30-second replication lag. Reads are routed to it immediately after writes, returning stale/missing data.',
        fix: 'For critical reads (immediately after write), route to the primary. Implement "read-your-own-writes" consistency. Monitor replica lag with alerts.'
    },
    {
        title: 'The Thundering Herd',
        symptom: '⚡ Every night at midnight your system crashes under normal-looking traffic.',
        nodes: [
            { id:'clients', icon:'💻', name:'Clients (10k)', metric:'All connecting at midnight', buggy:false },
            { id:'lb', icon:'⚖️', name:'Load Balancer', metric:'Overloaded', buggy:false },
            { id:'cache', icon:'💾', name:'Cache Layer', metric:'MISS RATE: 100% 🔴', buggy:true },
            { id:'db', icon:'🗄️', name:'Database', metric:'CPU: 100%', buggy:false },
            { id:'api', icon:'🖥️', name:'API Servers', metric:'Timing out', buggy:false },
        ],
        buggyId: 'cache',
        explanation: 'At midnight all cache TTLs expire simultaneously (thundering herd). 10k clients suddenly hit the DB directly, overwhelming it.',
        fix: 'Add jitter to TTLs (vary expiry randomly ±10%). Use cache stampede protection (probabilistic early expiration). Pre-warm hot keys before midnight.'
    }
];

export class DebugSystemGame {
    constructor(onComplete, completedTopics = []) {
        this.onComplete = onComplete;
        this.score = 0;
        this.totalXP = 0;
        this.currentIdx = 0;
        this.answered = false;
        this.timerInterval = null;
        this.timeLeft = 45;
        this.scenarios = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, Math.min(4, SCENARIOS.length));
    }

    get scenario() { return this.scenarios[this.currentIdx]; }

    render() {
        const wrap = document.createElement('div');
        wrap.className = 'debug-game-wrap';
        this._renderScenario(wrap);
        return wrap;
    }

    _renderScenario(wrap) {
        clearInterval(this.timerInterval);
        wrap.innerHTML = '';
        this.answered = false;
        this.timeLeft = 45;
        const s = this.scenario;
        const total = this.scenarios.length;

        wrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div>
                <div style="font-size:0.65rem;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px">Debug ${this.currentIdx+1} / ${total}</div>
                <div style="font-size:1rem;font-weight:800;color:#fff">${s.title}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.4)">Score: <span id="dbg-score" style="color:#f47a20;font-weight:700">${this.score}</span></div>
                <div style="background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.25);border-radius:8px;padding:4px 12px;font-size:0.78rem;font-weight:700;color:#f87171">🔴 <span id="dbg-timer">45s</span></div>
            </div>
        </div>

        <div class="arrange-timer-bar-wrap">
            <div class="arrange-timer-track" style="flex:1">
                <div class="arrange-timer-fill" id="dbg-timer-fill" style="width:100%;background:linear-gradient(90deg,#ef4444,#f87171)"></div>
            </div>
        </div>

        <div class="debug-scenario-box">
            <div class="debug-scenario-label">🐛 Incident Report</div>
            <div class="debug-scenario-text">${s.symptom}</div>
        </div>

        <div>
            <div style="font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🖱️ Click the broken/bottleneck component</div>
            <div class="debug-nodes-grid" id="dbg-grid">
                ${s.nodes.map(n => `
                <div class="debug-node-card" data-id="${n.id}">
                    <div class="debug-node-icon">${n.icon}</div>
                    <div class="debug-node-name">${n.name}</div>
                    <div class="debug-node-metric ${n.metric.includes('🔴') || n.metric.includes('!') || n.metric.includes('100%') ? 'danger' : ''}">${n.metric}</div>
                </div>`).join('')}
            </div>
        </div>

        <div id="dbg-feedback" style="display:none;padding:16px 20px;border-radius:14px;font-size:0.85rem;font-weight:600;line-height:1.7"></div>
        <div style="display:flex;justify-content:flex-end;display:none" id="dbg-next-row"></div>`;

        this._bindClicks(wrap);
        this._startTimer(wrap);
    }

    _bindClicks(wrap) {
        wrap.querySelectorAll('.debug-node-card').forEach(card => {
            card.addEventListener('click', () => {
                if (this.answered) return;
                this._evaluate(wrap, card.dataset.id);
            });
        });
    }

    _evaluate(wrap, chosenId) {
        clearInterval(this.timerInterval);
        this.answered = true;
        const s = this.scenario;
        const isCorrect = chosenId === s.buggyId;
        const timeBonus = Math.round((this.timeLeft / 45) * 25);
        const pts = isCorrect ? 75 + timeBonus : 0;
        this.score += pts;
        this.totalXP += Math.round(pts * 0.6);

        // Highlight
        wrap.querySelectorAll('.debug-node-card').forEach(card => {
            if (card.dataset.id === s.buggyId) card.classList.add('selected-correct');
            else if (card.dataset.id === chosenId) card.classList.add('selected-wrong');
        });

        const fb = wrap.querySelector('#dbg-feedback');
        fb.style.display = 'block';
        if (isCorrect) {
            fb.style.cssText = 'display:block;padding:16px 20px;border-radius:14px;font-size:0.85rem;font-weight:600;line-height:1.7;background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.2);color:rgba(255,255,255,0.8)';
            fb.innerHTML = `✅ <strong style="color:#4ade80">Found it! +${pts}pts</strong><br>${s.explanation}<br><br>💡 <strong style="color:#a855f7">Fix:</strong> ${s.fix}`;
        } else {
            const wrongNode = s.nodes.find(n => n.id === chosenId);
            const correctNode = s.nodes.find(n => n.id === s.buggyId);
            fb.style.cssText = 'display:block;padding:16px 20px;border-radius:14px;font-size:0.85rem;font-weight:600;line-height:1.7;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:rgba(255,255,255,0.8)';
            fb.innerHTML = `❌ <strong style="color:#f87171">${chosenId ? `${wrongNode?.icon} ${wrongNode?.name} is healthy` : 'Time\'s up'}</strong> — The real culprit was <strong style="color:#fbbf24">${correctNode?.icon} ${correctNode?.name}</strong>.<br><br>${s.explanation}<br><br>💡 <strong style="color:#a855f7">Fix:</strong> ${s.fix}`;
        }

        const nextRow = wrap.querySelector('#dbg-next-row');
        nextRow.style.display = 'flex';
        const isLast = this.currentIdx >= this.scenarios.length - 1;
        const btn = document.createElement('button');
        btn.className = 'game-btn primary';
        btn.textContent = isLast ? '🏁 Finish' : '⏭️ Next Incident';
        btn.addEventListener('click', () => {
            if (isLast) { this.onComplete({ score: this.score, xp: this.totalXP, game: 'Debug the System' }); }
            else { this.currentIdx++; this._renderScenario(wrap); }
        });
        nextRow.appendChild(btn);
        const sc = wrap.querySelector('#dbg-score');
        if (sc) sc.textContent = this.score;
    }

    _startTimer(wrap) {
        const timerEl = wrap.querySelector('#dbg-timer');
        const fillEl = wrap.querySelector('#dbg-timer-fill');
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
            if (fillEl) fillEl.style.width = `${(this.timeLeft / 45) * 100}%`;
            if (this.timeLeft <= 0) { clearInterval(this.timerInterval); if (!this.answered) this._evaluate(wrap, null); }
        }, 1000);
    }

    destroy() { clearInterval(this.timerInterval); }
}
