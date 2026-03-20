/**
 * ArchitectQuizGame — Timed scenario-based multiple choice quiz
 */
const QUESTIONS = [
    {
        category: 'Scalability', difficulty: 1,
        q: 'Instagram needs to serve millions of profile images globally with sub-50ms latency. What is the BEST single addition?',
        options: ['Add more app servers', 'Use a CDN (Content Delivery Network)', 'Switch to NoSQL database', 'Increase RAM on existing servers'],
        correct: 1,
        explanation: 'CDN caches static content at edge nodes worldwide, dramatically reducing latency by serving from locations close to users.'
    },
    {
        category: 'Load Balancing', difficulty: 1,
        q: 'Your API server goes down for 30 seconds every few hours. Users experience errors. What prevents this?',
        options: ['Vertical scaling', 'Load Balancer with health checks + multiple app servers', 'Database replication', 'Rate limiting'],
        correct: 1,
        explanation: 'A load balancer with health checks detects the failed server and routes traffic only to healthy instances, eliminating single points of failure.'
    },
    {
        category: 'Caching', difficulty: 1,
        q: 'A product page makes the same database query 10,000 times per minute. What\'s the most impactful fix?',
        options: ['Rewrite the SQL query', 'Add a Redis cache layer', 'Add a database index', 'Migrate to PostgreSQL'],
        correct: 1,
        explanation: 'A Redis layer caches the query result and serves it in microseconds, reducing DB load by 95%+ for repeated identical reads.'
    },
    {
        category: 'Database Design', difficulty: 2,
        q: 'Twitter needs to store 500 million tweets/day and serve timelines for 300M users. Which database approach fits best?',
        options: ['Single relational MySQL instance', 'Horizontally sharded Cassandra or DynamoDB', 'SQLite for simplicity', 'Redis only'],
        correct: 1,
        explanation: 'Wide-column stores like Cassandra scale horizontally across nodes, handle massive write throughput, and serve denormalized timeline reads efficiently.'
    },
    {
        category: 'Message Queues', difficulty: 2,
        q: 'An e-commerce checkout takes 8 seconds because it sends confirmation emails synchronously. Best fix?',
        options: ['Faster email server', 'Decouple email sending via a message queue (SQS/Kafka)', 'Increase server timeout', 'Send emails in a batch at midnight'],
        correct: 1,
        explanation: 'Placing an async message queue between checkout and email sending decouples the services—checkout returns instantly, email is processed in the background.'
    },
    {
        category: 'Consistency', difficulty: 2,
        q: 'A banking app must ensure money deducted from account A is ALWAYS added to account B. What guarantees this?',
        options: ['Eventual consistency', 'ACID transactions', 'BASE model', 'Optimistic locking'],
        correct: 1,
        explanation: 'ACID transactions ensure Atomicity—the debit and credit are treated as a single atomic unit that either fully commits or fully rolls back.'
    },
    {
        category: 'System Design', difficulty: 3,
        q: 'WhatsApp needs to deliver messages to 2 billion users even when they are offline. What core pattern enables this?',
        options: ['Synchronous REST APIs', 'Persistent WebSocket connections + offline message store (inbox queues)', 'Polling every 5 seconds', 'Email forwarding'],
        correct: 1,
        explanation: 'WhatsApp uses server-side message persistence (inbox queues per user) + WebSocket push. When users come online, messages are delivered from their inbox.'
    },
    {
        category: 'Rate Limiting', difficulty: 2,
        q: 'Your public API is being DDoS\'d with 50,000 req/s from a single IP. Immediate best fix?',
        options: ['Scale horizontally', 'Rate limiting at the API Gateway / Load Balancer level', 'Block the continent', 'Add more RAM'],
        correct: 1,
        explanation: 'Rate limiting at the gateway level drops excess requests before they reach your app servers, protecting your backend infrastructure.'
    },
    {
        category: 'Replication', difficulty: 2,
        q: 'Your database master fails. Reads succeed but writes fail for 5 minutes. What architecture would prevent write downtime?',
        options: ['Read replicas only', 'Multi-master replication or automated failover (e.g. AWS RDS Multi-AZ)', 'More application servers', 'Database sharding'],
        correct: 1,
        explanation: 'Multi-AZ configurations maintain a hot standby that can automatically take over writes within seconds when the primary fails.'
    },
    {
        category: 'Microservices', difficulty: 3,
        q: 'Service A calls Service B which calls Service C. Service C is slow and causes timeouts cascading back. Best solution?',
        options: ['Retry everything automatically', 'Circuit Breaker pattern + timeout + fallback responses', 'Make all calls synchronous', 'Merge all services into one'],
        correct: 1,
        explanation: 'The Circuit Breaker pattern detects failure, "opens" the circuit to stop cascading failures, and returns fallback responses while the downstream service recovers.'
    },
    {
        category: 'Storage', difficulty: 1,
        q: 'Uber stores 50TB of GPS location data per day. They need cheap storage but fast analytics. Best choice?',
        options: ['Keep it all in MySQL', 'Move older data to S3, query with Athena (data lake pattern)', 'Delete data after 7 days', 'Store in Redis'],
        correct: 1,
        explanation: 'S3 + Athena is an extremely cost-effective data lake pattern. S3 stores petabytes cheaply, and Athena runs SQL queries directly on it without provisioning servers.'
    },
    {
        category: 'API Design', difficulty: 2,
        q: 'A stock trading app needs to push live price updates to 100,000 browser clients simultaneously. Best protocol?',
        options: ['REST polling every second', 'WebSocket persistent connections', 'GraphQL mutations', 'SMTP email updates'],
        correct: 1,
        explanation: 'WebSockets maintain persistent bidirectional connections, allowing the server to push price updates to all clients with ~50ms latency and minimal overhead.'
    }
];

export class ArchitectQuizGame {
    constructor(onComplete, completedTopics = []) {
        this.onComplete = onComplete;
        this.score = 0;
        this.totalXP = 0;
        this.currentIdx = 0;
        this.timeLeft = 30;
        this.timerInterval = null;
        this.answered = false;
        this.results = [];

        // Filter & randomize questions; more completed = harder questions available
        const maxDiff = Math.min(3, 1 + Math.floor(completedTopics.length / 3));
        const eligible = QUESTIONS.filter(q => q.difficulty <= maxDiff);
        this.questions = eligible.sort(() => Math.random() - 0.5).slice(0, Math.min(8, eligible.length));
    }

    get q() { return this.questions[this.currentIdx]; }

    render() {
        const wrap = document.createElement('div');
        wrap.className = 'quiz-game-wrap';
        this._renderQuestion(wrap);
        return wrap;
    }

    _renderQuestion(wrap) {
        clearInterval(this.timerInterval);
        wrap.innerHTML = '';
        this.answered = false;
        this.timeLeft = 30;
        const q = this.q;
        const total = this.questions.length;
        const circ = 2 * Math.PI * 20; // r=20

        wrap.innerHTML = `
        <div class="quiz-game-hud">
            <div>
                <div class="quiz-progress-dots" id="qg-dots">
                    ${this.questions.map((_, i) => `<div class="quiz-dot${i < this.currentIdx ? ' '+((this.results[i]?.correct)?'correct':'wrong') : ''}" data-i="${i}"></div>`).join('')}
                </div>
                <div class="quiz-game-progress" style="margin-top:6px">Question ${this.currentIdx+1} of ${total}</div>
            </div>
            <svg class="quiz-timer-ring" viewBox="0 0 44 44" id="qg-ring">
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(168,85,247,0.12)" stroke-width="3"/>
                <circle cx="22" cy="22" r="20" fill="none" stroke="#a855f7" stroke-width="3"
                    stroke-dasharray="${circ}" stroke-dashoffset="0"
                    stroke-linecap="round" transform="rotate(-90 22 22)" id="qg-ring-fill"/>
                <text x="22" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="#c084fc" id="qg-timer-text">30</text>
            </svg>
            <div class="quiz-game-score-badge">⚡ ${this.score} pts</div>
        </div>

        <div class="quiz-question-box">
            <div class="quiz-q-category">${q.category} · ${'★'.repeat(q.difficulty)}${'☆'.repeat(3-q.difficulty)}</div>
            <div class="quiz-q-text">${q.q}</div>
        </div>

        <div class="quiz-options-grid" id="qg-options">
            ${q.options.map((opt, i) => `<button class="quiz-option" data-i="${i}">${opt}</button>`).join('')}
        </div>

        <div class="quiz-explanation" id="qg-explanation"></div>

        <div style="display:flex;justify-content:flex-end" id="qg-next-row" style="display:none !important"></div>`;

        this._bindOptions(wrap);
        this._startTimer(wrap, circ);
    }

    _bindOptions(wrap) {
        wrap.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this._answer(wrap, parseInt(btn.dataset.i));
            });
        });
    }

    _answer(wrap, chosenIdx) {
        clearInterval(this.timerInterval);
        this.answered = true;
        const q = this.q;
        const isCorrect = chosenIdx === q.correct;
        const timeBonus = Math.round((this.timeLeft / 30) * 15);
        const pts = isCorrect ? 50 + timeBonus : 0;
        this.score += pts;
        this.totalXP += Math.round(pts * 0.5);
        this.results.push({ correct: isCorrect });

        wrap.querySelectorAll('.quiz-option').forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.correct) btn.classList.add('correct');
            else if (i === chosenIdx) btn.classList.add('wrong');
        });

        const exp = wrap.querySelector('#qg-explanation');
        exp.classList.add('visible');
        exp.innerHTML = `<strong>${isCorrect ? `✅ Correct! +${pts}pts` : '❌ Incorrect'}</strong> — ${q.explanation}`;

        const nextRow = wrap.querySelector('#qg-next-row');
        nextRow.style.display = 'flex';
        const isLast = this.currentIdx >= this.questions.length - 1;
        const btn = document.createElement('button');
        btn.className = 'game-btn primary';
        btn.textContent = isLast ? '🏁 See Results' : '⏭️ Next Question';
        btn.addEventListener('click', () => {
            if (isLast) { this.onComplete({ score: this.score, xp: this.totalXP, game: "Architect's Challenge", results: this.results }); }
            else { this.currentIdx++; this._renderQuestion(wrap); }
        });
        nextRow.appendChild(btn);

        const hud = wrap.querySelector('.quiz-game-score-badge');
        if (hud) hud.textContent = `⚡ ${this.score} pts`;
    }

    _startTimer(wrap, circ) {
        const fillEl = wrap.querySelector('#qg-ring-fill');
        const textEl = wrap.querySelector('#qg-timer-text');
        const offset = () => circ - (this.timeLeft / 30) * circ;
        if (fillEl) fillEl.setAttribute('stroke-dashoffset', offset());

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (fillEl) fillEl.setAttribute('stroke-dashoffset', offset());
            if (textEl) textEl.textContent = this.timeLeft;
            if (this.timeLeft <= 5 && fillEl) fillEl.setAttribute('stroke', '#ef4444');
            if (this.timeLeft <= 0) { clearInterval(this.timerInterval); if (!this.answered) this._answer(wrap, -1); }
        }, 1000);
    }

    destroy() { clearInterval(this.timerInterval); }
}
