/**
 * ArrangeFlowGame — Drag-and-drop system architecture puzzle
 */
const LEVELS = [
    {
        id: 'basic-web', title: 'Basic Web Request',
        scenario: '🌐 A user opens your website. Arrange components in the correct request flow order.',
        correctOrder: ['client','dns','cdn','loadbalancer','server','database'],
        components: [
            { id:'client', icon:'💻', name:'Client Browser' },
            { id:'dns', icon:'📡', name:'DNS Resolver' },
            { id:'cdn', icon:'🌍', name:'CDN Edge' },
            { id:'loadbalancer', icon:'⚖️', name:'Load Balancer' },
            { id:'server', icon:'🖥️', name:'App Server' },
            { id:'database', icon:'🗄️', name:'Database' },
        ]
    },
    {
        id: 'api-cache', title: 'API with Caching',
        scenario: '⚡ A mobile app fetches user data. Arrange components to minimise DB hits.',
        correctOrder: ['client','apigateway','cache','server','database'],
        components: [
            { id:'client', icon:'📱', name:'Mobile App' },
            { id:'apigateway', icon:'🚪', name:'API Gateway' },
            { id:'cache', icon:'💾', name:'Redis Cache' },
            { id:'server', icon:'🖥️', name:'App Server' },
            { id:'database', icon:'🗄️', name:'Database' },
        ]
    },
    {
        id: 'event-stream', title: 'Event-Driven Order Pipeline',
        scenario: '📨 A user places an order. Arrange the components for an event-driven pipeline.',
        correctOrder: ['client','server','messagequeue','consumer','database','notification'],
        components: [
            { id:'client', icon:'🛒', name:'User Order' },
            { id:'server', icon:'🖥️', name:'Order Service' },
            { id:'messagequeue', icon:'📬', name:'Message Queue' },
            { id:'consumer', icon:'🔄', name:'Consumer Worker' },
            { id:'database', icon:'🗄️', name:'Orders DB' },
            { id:'notification', icon:'📲', name:'Notification' },
        ]
    },
    {
        id: 'microservice', title: 'Microservices Auth Flow',
        scenario: '🔐 A user logs in. Arrange the microservices in the correct authentication flow.',
        correctOrder: ['client','apigateway','authservice','tokenstore','userservice','database'],
        components: [
            { id:'client', icon:'💻', name:'Client' },
            { id:'apigateway', icon:'🚪', name:'API Gateway' },
            { id:'authservice', icon:'🔐', name:'Auth Service' },
            { id:'tokenstore', icon:'🔑', name:'Token Store' },
            { id:'userservice', icon:'👤', name:'User Service' },
            { id:'database', icon:'🗄️', name:'User DB' },
        ]
    }
];

export class ArrangeFlowGame {
    constructor(onComplete, completedTopics = []) {
        this.onComplete = onComplete;
        this.currentLevelIdx = 0;
        this.score = 0;
        this.totalXP = 0;
        this.timerInterval = null;
        this.timeLeft = 60;
        this.droppedOrder = [];
        this.unlockedLevels = Math.min(LEVELS.length, Math.max(1, Math.floor(completedTopics.length / 2) + 1));
    }

    get level() { return LEVELS[this.currentLevelIdx]; }

    render() {
        const wrap = document.createElement('div');
        wrap.className = 'arrange-game-wrap';
        this._renderLevel(wrap);
        return wrap;
    }

    _renderLevel(wrap) {
        clearInterval(this.timerInterval);
        wrap.innerHTML = '';
        this.droppedOrder = [];
        this.timeLeft = 60;
        const level = this.level;
        const shuffled = [...level.components].sort(() => Math.random() - 0.5);

        wrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div>
                <div style="font-size:0.65rem;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px">Level ${this.currentLevelIdx+1} / ${this.unlockedLevels}</div>
                <div style="font-size:1rem;font-weight:800;color:#fff">${level.title}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.4)">Score: <span id="afg-score" style="color:#f47a20;font-weight:700">${this.score}</span></div>
                <div style="background:rgba(107,29,110,0.2);border:1px solid rgba(168,85,247,0.2);border-radius:8px;padding:4px 12px;font-size:0.78rem;font-weight:700;color:#c084fc">⏱️ <span id="afg-timer">60s</span></div>
            </div>
        </div>
        <div class="arrange-timer-bar-wrap">
            <div class="arrange-timer-track" style="flex:1"><div class="arrange-timer-fill" id="afg-timer-fill" style="width:100%"></div></div>
        </div>
        <div class="arrange-scenario-box">
            <div class="arrange-scenario-label">📋 Scenario</div>
            <div class="arrange-scenario-text">${level.scenario}</div>
        </div>
        <div>
            <div class="arrange-palette-label">🧩 Components — Drag them below in order</div>
            <div class="arrange-palette" id="afg-palette">${shuffled.map(c => this._compHTML(c)).join('')}</div>
        </div>
        <div>
            <div class="arrange-drop-label">➡️ Drop Here (Left = First, Right = Last)</div>
            <div class="arrange-drop-zone" id="afg-drop">
                <span id="afg-hint" style="color:rgba(255,255,255,0.2);font-size:0.8rem;pointer-events:none">Drop components here…</span>
            </div>
        </div>
        <div class="arrange-actions" id="afg-actions">
            <button class="game-btn secondary" id="afg-clear">🔄 Clear</button>
            <button class="game-btn secondary" id="afg-hint-btn">💡 Hint (−5pts)</button>
            <button class="game-btn primary" id="afg-submit">✅ Submit Flow</button>
        </div>
        <div id="afg-feedback" style="display:none;padding:14px 18px;border-radius:12px;font-size:0.85rem;font-weight:600;line-height:1.5"></div>`;

        this._attachDragDrop(wrap);
        this._startTimer(wrap);
        wrap.querySelector('#afg-submit').addEventListener('click', () => this._evaluate(wrap));
        wrap.querySelector('#afg-clear').addEventListener('click', () => this._clear(wrap));
        wrap.querySelector('#afg-hint-btn').addEventListener('click', () => this._hint(wrap));
    }

    _compHTML(c) {
        return `<div class="arrange-component" draggable="true" data-id="${c.id}" id="ac-${c.id}">
            <span class="arrange-component-icon">${c.icon}</span><span>${c.name}</span></div>`;
    }

    _attachDragDrop(wrap) {
        const palette = wrap.querySelector('#afg-palette');
        const dropZone = wrap.querySelector('#afg-drop');
        const rebind = () => {
            wrap.querySelectorAll('.arrange-component').forEach(el => {
                el.ondragstart = e => { this._dragId = el.dataset.id; el.classList.add('dragging'); e.dataTransfer.setData('text/plain', el.dataset.id); };
                el.ondragend = () => el.classList.remove('dragging');
            });
        };
        rebind();

        dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
        dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
        dropZone.ondrop = e => {
            e.preventDefault(); dropZone.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            if (!id || this.droppedOrder.includes(id)) return;
            const el = wrap.querySelector(`#ac-${id}`);
            if (!el) return;
            const hint = wrap.querySelector('#afg-hint');
            if (hint) hint.remove();
            if (this.droppedOrder.length > 0) {
                const arr = document.createElement('span');
                arr.className = 'arrange-arrow'; arr.dataset.after = id; arr.textContent = '→';
                dropZone.appendChild(arr);
            }
            dropZone.appendChild(el);
            this.droppedOrder.push(id);
            rebind();
        };
        palette.ondragover = e => e.preventDefault();
        palette.ondrop = e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            if (!id || !this.droppedOrder.includes(id)) return;
            const el = wrap.querySelector(`#ac-${id}`);
            if (!el) return;
            const arr = dropZone.querySelector(`[data-after="${id}"]`);
            if (arr) arr.remove();
            palette.appendChild(el);
            this.droppedOrder = this.droppedOrder.filter(i => i !== id);
            if (this.droppedOrder.length === 0) {
                const hint = document.createElement('span');
                hint.id='afg-hint'; hint.style.cssText='color:rgba(255,255,255,0.2);font-size:0.8rem;pointer-events:none';
                hint.textContent='Drop components here…'; dropZone.appendChild(hint);
            }
            rebind();
        };
    }

    _clear(wrap) {
        this.droppedOrder = [];
        const palette = wrap.querySelector('#afg-palette');
        const drop = wrap.querySelector('#afg-drop');
        drop.innerHTML = '<span id="afg-hint" style="color:rgba(255,255,255,0.2);font-size:0.8rem;pointer-events:none">Drop components here…</span>';
        palette.innerHTML = '';
        [...this.level.components].sort(() => Math.random() - 0.5).forEach(c => { palette.insertAdjacentHTML('beforeend', this._compHTML(c)); });
        this._attachDragDrop(wrap);
    }

    _hint(wrap) {
        const nextId = this.level.correctOrder[this.droppedOrder.length];
        if (!nextId) return;
        const palette = wrap.querySelector('#afg-palette');
        const el = palette.querySelector(`#ac-${nextId}`);
        if (!el) return;
        const drop = wrap.querySelector('#afg-drop');
        const hint = wrap.querySelector('#afg-hint');
        if (hint) hint.remove();
        if (this.droppedOrder.length > 0) {
            const arr = document.createElement('span');
            arr.className='arrange-arrow'; arr.dataset.after=nextId; arr.textContent='→';
            drop.appendChild(arr);
        }
        drop.appendChild(el);
        this.droppedOrder.push(nextId);
        this.score = Math.max(0, this.score - 5);
        const sc = wrap.querySelector('#afg-score');
        if (sc) sc.textContent = this.score;
        this._attachDragDrop(wrap);
    }

    _startTimer(wrap) {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const t = wrap.querySelector('#afg-timer');
            const f = wrap.querySelector('#afg-timer-fill');
            if (t) t.textContent = `${this.timeLeft}s`;
            if (f) f.style.width = `${(this.timeLeft/60)*100}%`;
            if (this.timeLeft <= 10 && f) f.style.background = 'linear-gradient(90deg,#ef4444,#f87171)';
            if (this.timeLeft <= 0) { clearInterval(this.timerInterval); this._evaluate(wrap, true); }
        }, 1000);
    }

    _evaluate(wrap, timeout = false) {
        clearInterval(this.timerInterval);
        const { correctOrder, components } = this.level;
        const dropped = this.droppedOrder;
        const correctCount = correctOrder.filter((id, i) => dropped[i] === id).length;
        const isFullyCorrect = dropped.join(',') === correctOrder.join(',');
        const base = isFullyCorrect ? 100 : Math.round((correctCount / correctOrder.length) * 60);
        const timeBonus = isFullyCorrect ? Math.round((this.timeLeft / 60) * 30) : 0;
        const roundScore = base + timeBonus;
        this.score += roundScore; this.totalXP += Math.round(roundScore * 0.5);

        const fb = wrap.querySelector('#afg-feedback');
        fb.style.display = 'block';
        const correctLabel = correctOrder.map(id => { const c = components.find(c => c.id === id); return c ? `${c.icon} ${c.name}` : id; }).join(' → ');
        if (isFullyCorrect) {
            fb.style.cssText = 'display:block;padding:14px 18px;border-radius:12px;font-size:0.85rem;font-weight:600;line-height:1.5;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);color:#4ade80';
            fb.innerHTML = `✅ <strong>Perfect Flow!</strong> ${base}pts + ${timeBonus}pts speed bonus = ${roundScore}pts`;
        } else {
            fb.style.cssText = 'display:block;padding:14px 18px;border-radius:12px;font-size:0.85rem;font-weight:600;line-height:1.5;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);color:#fbbf24';
            fb.innerHTML = `${timeout ? '⏰ Time\'s up!' : `⚠️ ${correctCount}/${correctOrder.length} correct`}. Correct order: ${correctLabel}`;
        }

        const actions = wrap.querySelector('#afg-actions');
        actions.innerHTML = '';
        const isLast = this.currentLevelIdx >= this.unlockedLevels - 1;
        const btn = document.createElement('button');
        btn.className = 'game-btn primary'; btn.style.marginLeft = 'auto';
        btn.textContent = isLast ? '🏁 Finish' : '⏭️ Next Level';
        btn.addEventListener('click', () => {
            if (isLast) { this.onComplete({ score: this.score, xp: this.totalXP, game: 'Arrange the Flow' }); }
            else { this.currentLevelIdx++; this._renderLevel(wrap); }
        });
        actions.appendChild(btn);
        const sc = wrap.querySelector('#afg-score');
        if (sc) sc.textContent = this.score;
    }

    destroy() { clearInterval(this.timerInterval); }
}
