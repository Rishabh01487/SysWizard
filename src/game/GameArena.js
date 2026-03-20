/**
 * GameArena — Main hub for the gamified learning environment
 */
import './gameStyles.css';
import { ArrangeFlowGame } from './games/ArrangeFlowGame.js';
import { ArchitectQuizGame } from './games/ArchitectQuizGame.js';
import { DebugSystemGame } from './games/DebugSystemGame.js';
import { authService } from '../auth/authService.js';

const GAMES = [
    {
        id: 'arrange-flow',
        icon: '🧩',
        title: 'Arrange the Flow',
        description: 'Drag system components into the correct order. Build the architecture — from client to database — for real-world scenarios.',
        tags: ['Architecture', 'Flow Design', 'Drag & Drop'],
        unlockCount: 0,
        color: '#a855f7',
        glowColor: 'rgba(168,85,247,0.5)',
        GameClass: ArrangeFlowGame,
    },
    {
        id: 'architect-quiz',
        icon: '⚡',
        title: "Architect's Challenge",
        description: 'Race against the clock to pick the right system design solution for production-scale scenarios. 30 seconds per question.',
        tags: ['Decision Making', 'Timed', 'Scenario-Based'],
        unlockCount: 0,
        color: '#f47a20',
        glowColor: 'rgba(244,122,32,0.5)',
        GameClass: ArchitectQuizGame,
    },
    {
        id: 'debug-system',
        icon: '🐛',
        title: 'Debug the System',
        description: 'A system is failing. Identify the bottleneck or broken component from live metrics before time runs out.',
        tags: ['Debugging', 'Bottleneck Analysis', 'Incident Response'],
        unlockCount: 0,
        color: '#f87171',
        glowColor: 'rgba(248,113,113,0.5)',
        GameClass: DebugSystemGame,
    },
];

const XP_KEY = 'syswizard_game_xp';
const SCORES_KEY = 'syswizard_game_scores';

function getXP() {
    try { return JSON.parse(localStorage.getItem(XP_KEY)) || { total: 0, streak: 0, lastPlay: null }; } catch { return { total: 0, streak: 0, lastPlay: null }; }
}
function saveXP(data) { localStorage.setItem(XP_KEY, JSON.stringify(data)); }
function getScores() {
    try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {}; } catch { return {}; }
}
function saveScore(gameId, score) {
    const s = getScores();
    if (!s[gameId] || s[gameId] < score) s[gameId] = score;
    localStorage.setItem(SCORES_KEY, JSON.stringify(s));
}

function spawnConfetti() {
    const colors = ['#a855f7', '#f47a20', '#4ade80', '#f87171', '#fbbf24', '#60a5fa'];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.style.cssText = `
            left: ${Math.random() * 100}vw;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            width: ${4 + Math.random() * 8}px;
            height: ${4 + Math.random() * 8}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation-duration: ${1.5 + Math.random() * 2}s;
            animation-delay: ${Math.random() * 0.5}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 4000);
    }
}

export class GameArena {
    constructor(container) {
        this.container = container;
        this.activeGameInstance = null;
        this.modalEl = null;
    }

    render() {
        const completed = authService.getCompletedTopics();
        const xpData = getXP();
        const scores = getScores();
        const xpLevel = Math.floor(xpData.total / 200) + 1;
        const xpProgress = (xpData.total % 200) / 200;

        this.container.innerHTML = `
        <div class="arena-header">
            <div class="arena-title-row">
                <div class="arena-icon">🎮</div>
                <div>
                    <div class="arena-title">Sys<span>Wizard</span> Arena</div>
                    <div class="arena-subtitle">Prove your system design mastery — play, compete, level up</div>
                </div>
            </div>
            <div class="arena-xp-bar-wrap">
                <div class="arena-xp-label">Level ${xpLevel}</div>
                <div class="arena-xp-track"><div class="arena-xp-fill" id="arena-xp-fill"></div></div>
                <div class="arena-xp-count">${xpData.total} XP</div>
            </div>
            <div class="arena-stats-row">
                <div class="arena-stat"><span class="arena-stat-num">${completed.length}</span><span class="arena-stat-label">Topics Done</span></div>
                <div class="arena-stat"><span class="arena-stat-num">${Object.values(scores).reduce((a,b) => a+b, 0)}</span><span class="arena-stat-label">Best Score Total</span></div>
                <div class="arena-stat arena-streak"><span>🔥</span><span class="arena-stat-num">${xpData.streak}</span><span class="arena-stat-label">Day Streak</span></div>
                <div class="arena-stat"><span class="arena-stat-num">Lv.${xpLevel}</span><span class="arena-stat-label">Arena Rank</span></div>
            </div>
        </div>

        ${completed.length === 0 ? `
        <div class="arena-locked-banner">
            <div class="arena-locked-banner-icon">🔒</div>
            <div class="arena-locked-banner-text">
                <strong>Complete your first topic to unlock games!</strong><br>
                Head back to the topic list, study a concept, and mark it complete. Games unlock progressively as you learn.
            </div>
        </div>` : ''}

        <div class="arena-games-section">
            <div class="arena-section-label">⚔️ Available Games</div>
            <div class="arena-games-grid" id="arena-games-grid">
                ${GAMES.map(g => {
                    const isUnlocked = completed.length >= g.unlockCount;
                    const bestScore = scores[g.id] || 0;
                    return `
                    <div class="game-card ${isUnlocked ? '' : 'locked'}" data-game="${g.id}" id="gc-${g.id}">
                        <div class="game-card-glow" style="background:${g.glowColor}"></div>
                        <div class="game-card-header">
                            <div class="game-card-icon">${g.icon}</div>
                            <div class="game-card-badge ${isUnlocked ? 'unlocked' : 'locked'}">
                                ${isUnlocked ? '✅ Unlocked' : `🔒 ${g.unlockCount} topics`}
                            </div>
                        </div>
                        <div class="game-card-title">${g.title}</div>
                        <div class="game-card-desc">${g.description}</div>
                        <div class="game-card-meta">
                            ${g.tags.map(t => `<span class="game-meta-tag">${t}</span>`).join('')}
                        </div>
                        <div class="game-card-footer">
                            <button class="game-play-btn ${isUnlocked ? 'active-btn' : 'lock-btn'}" ${isUnlocked ? '' : 'disabled'}>
                                ${isUnlocked ? '▶ Play Now' : `🔒 Complete ${g.unlockCount} topics`}
                            </button>
                            ${bestScore > 0 ? `<div class="game-best-score">Best: <strong>${bestScore}pts</strong></div>` : ''}
                        </div>
                        ${!isUnlocked ? `<div class="game-lock-overlay">
                            <div class="game-lock-icon">🔒</div>
                            <div class="game-lock-msg">Complete ${g.unlockCount} topic${g.unlockCount > 1 ? 's' : ''} to unlock</div>
                        </div>` : ''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;

        // Animate XP bar
        requestAnimationFrame(() => {
            const fill = this.container.querySelector('#arena-xp-fill');
            if (fill) fill.style.width = `${xpProgress * 100}%`;
        });

        // Bind card clicks
        this.container.querySelectorAll('.game-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => this._openGame(card.dataset.game));
        });
    }

    _openGame(gameId) {
        const gameConfig = GAMES.find(g => g.id === gameId);
        if (!gameConfig) return;
        const completed = authService.getCompletedTopics();

        const overlay = document.createElement('div');
        overlay.className = 'game-modal-overlay';
        overlay.id = 'game-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.innerHTML = `
        <div class="game-modal-header">
            <div class="game-modal-title">${gameConfig.icon} ${gameConfig.title}</div>
            <button class="game-modal-close" id="gm-close">✕</button>
        </div>
        <div class="game-modal-body" id="gm-body"></div>`;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        this.modalEl = overlay;

        const body = modal.querySelector('#gm-body');
        const instance = new gameConfig.GameClass(
            (result) => this._onGameComplete(gameId, result, body),
            completed
        );
        this.activeGameInstance = instance;
        body.appendChild(instance.render());

        modal.querySelector('#gm-close').addEventListener('click', () => this._closeModal());
        overlay.addEventListener('click', e => { if (e.target === overlay) this._closeModal(); });
    }

    _onGameComplete(gameId, result, body) {
        if (this.activeGameInstance?.destroy) this.activeGameInstance.destroy();
        this.activeGameInstance = null;

        // Update XP
        const xpData = getXP();
        xpData.total += result.xp || 0;
        const today = new Date().toDateString();
        if (xpData.lastPlay !== today) {
            xpData.streak = (xpData.lastPlay === new Date(Date.now() - 86400000).toDateString())
                ? xpData.streak + 1 : 1;
            xpData.lastPlay = today;
        }
        saveXP(xpData);
        saveScore(gameId, result.score || 0);

        const xpLevel = Math.floor(xpData.total / 200) + 1;
        spawnConfetti();

        const correct = result.results ? result.results.filter(r => r.correct).length : null;
        const total = result.results ? result.results.length : null;

        body.innerHTML = `
        <div class="game-result-panel">
            <span class="game-result-emoji">${result.score >= 200 ? '🏆' : result.score >= 100 ? '🥈' : '🥉'}</span>
            <div class="game-result-title">${result.score >= 200 ? 'Outstanding!' : result.score >= 100 ? 'Great Work!' : 'Keep Practising!'}</div>
            ${correct !== null ? `<div style="font-size:0.85rem;color:rgba(255,255,255,0.45);margin-top:4px">${correct}/${total} correct answers</div>` : ''}
            <span class="game-result-score">${result.score}</span>
            <div class="game-result-sub">points scored in ${result.game}</div>
            <div class="game-result-xp">✨ +${result.xp} XP · Now Level ${xpLevel}</div>
            <div class="game-result-actions">
                <button class="game-result-btn secondary" id="gr-close">✕ Close</button>
                <button class="game-result-btn primary" id="gr-replay">↺ Play Again</button>
            </div>
        </div>`;

        body.querySelector('#gr-close').addEventListener('click', () => {
            this._closeModal();
            this.render(); // Re-render arena with updated scores
        });
        body.querySelector('#gr-replay').addEventListener('click', () => {
            this._closeModal();
            this.render();
            setTimeout(() => this._openGame(GAMES.find(g => g.GameClass.name === result.game?.replace(/\s/g,'') || g.title === result.game)?.id || GAMES[0].id), 100);
        });
    }

    _closeModal() {
        if (this.activeGameInstance?.destroy) this.activeGameInstance.destroy();
        this.activeGameInstance = null;
        if (this.modalEl) { this.modalEl.remove(); this.modalEl = null; }
    }

    destroy() { this._closeModal(); }
}
