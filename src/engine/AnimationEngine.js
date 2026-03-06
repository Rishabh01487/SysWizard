/**
 * AnimationEngine — Core canvas rendering and step-based animation system
 */
export class AnimationEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.connections = [];
        this.particles = [];
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.speed = 1;
        this.time = 0;
        this.stepTime = 0;
        this.stepDuration = 3000; // ms per step
        this.rafId = null;
        this.lastTimestamp = 0;
        this.onStepChange = null;
        this.onComplete = null;
        this.bgParticles = this._createBgParticles();

        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    _createBgParticles() {
        const particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * 2000,
                y: Math.random() * 1200,
                r: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.3 + 0.05
            });
        }
        return particles;
    }

    clear() {
        this.entities = [];
        this.connections = [];
        this.particles = [];
        this.steps = [];
        this.currentStep = 0;
        this.time = 0;
        this.stepTime = 0;
    }

    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    addConnection(conn) {
        this.connections.push(conn);
        return conn;
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    setSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.stepTime = 0;
    }

    getCurrentStepData() {
        return this.steps[this.currentStep] || null;
    }

    goToStep(index) {
        if (index >= 0 && index < this.steps.length) {
            this.currentStep = index;
            this.stepTime = 0;
            const step = this.steps[index];
            if (step.setup) step.setup(this);
            if (this.onStepChange) this.onStepChange(index, step);
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.goToStep(this.currentStep + 1);
        } else if (this.onComplete) {
            this.onComplete();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastTimestamp = performance.now();
        this._loop(this.lastTimestamp);
    }

    pause() {
        this.isPlaying = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    restart() {
        this.pause();
        this.goToStep(0);
    }

    _loop(timestamp) {
        if (!this.isPlaying) return;
        const delta = (timestamp - this.lastTimestamp) * this.speed;
        this.lastTimestamp = timestamp;
        this.time += delta;
        this.stepTime += delta;

        // Auto-advance step
        const step = this.steps[this.currentStep];
        const duration = (step && step.duration) || this.stepDuration;
        if (this.stepTime >= duration && this.currentStep < this.steps.length - 1) {
            this.nextStep();
        }

        // Update
        if (step && step.update) step.update(this, this.stepTime, delta);
        this.entities.forEach(e => e.update && e.update(this.time, delta, this));
        this.connections.forEach(c => c.update && c.update(this.time, delta, this));
        this.particles = this.particles.filter(p => {
            if (p.update) p.update(this.time, delta, this);
            return !p.dead;
        });

        // Render
        this._render();

        this.rafId = requestAnimationFrame(t => this._loop(t));
    }

    _render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Background
        ctx.fillStyle = '#0f0b1e';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(168,85,247,0.03)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Background particles
        this.bgParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168,85,247,${p.alpha})`;
            ctx.fill();
        });

        // Render connections (behind entities)
        this.connections.forEach(c => c.render && c.render(ctx, this.time));

        // Render particles
        this.particles.forEach(p => p.render && p.render(ctx, this.time));

        // Render entities
        this.entities.forEach(e => e.render && e.render(ctx, this.time));
    }

    // Render a single frame (for when paused)
    renderFrame() {
        this._render();
    }
}
