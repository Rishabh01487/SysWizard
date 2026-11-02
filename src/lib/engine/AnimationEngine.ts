/**
 * AnimationEngine — Core canvas rendering and step-based animation system.
 * TypeScript port with rich step descriptions for in-depth explanations.
 */
import {
  Entity, ArrowConnection, DataPacket,
} from "./entities";

export interface AnimationStep {
  title: string;
  description: string;
  duration?: number;
  setup?: (engine: AnimationEngine) => void;
  update?: (engine: AnimationEngine, stepTime: number, delta: number) => void;
}

type Particle = DataPacket;

export class AnimationEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: Entity[] = [];
  connections: ArrowConnection[] = [];
  particles: Particle[] = [];
  steps: AnimationStep[] = [];
  currentStep = 0;
  isPlaying = false;
  speed = 1;
  time = 0;
  stepTime = 0;
  stepDuration = 4000;
  rafId: number | null = null;
  lastTimestamp = 0;
  width = 0;
  height = 0;
  onStepChange: ((index: number, step: AnimationStep) => void) | null = null;
  onComplete: (() => void) | null = null;
  bgParticles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.bgParticles = this._createBgParticles();
    this._resize();
  }
  attachResize() {
    const handler = () => this._resize();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }

  _resize() {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _createBgParticles(): { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] {
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.3 + 0.05,
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

  addEntity<T extends Entity>(entity: T): T {
    this.entities.push(entity);
    return entity;
  }

  addConnection<T extends ArrowConnection>(conn: T): T {
    this.connections.push(conn);
    return conn;
  }

  addParticle(p: DataPacket) {
    this.particles.push(p);
  }

  setSteps(steps: AnimationStep[]) {
    this.steps = steps;
    this.currentStep = 0;
    this.stepTime = 0;
  }

  getCurrentStepData(): AnimationStep | null {
    return this.steps[this.currentStep] || null;
  }

  goToStep(index: number) {
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
    if (this.currentStep > 0) this.goToStep(this.currentStep - 1);
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

  setSpeed(speed: number) {
    this.speed = speed;
  }

  restart() {
    this.pause();
    this.goToStep(0);
    this.renderFrame();
  }

  _loop(timestamp: number) {
    if (!this.isPlaying) return;
    const delta = (timestamp - this.lastTimestamp) * this.speed;
    this.lastTimestamp = timestamp;
    this.time += delta;
    this.stepTime += delta;
    const step = this.steps[this.currentStep];
    const duration = (step && step.duration) || this.stepDuration;
    if (this.stepTime >= duration && this.currentStep < this.steps.length - 1) {
      this.nextStep();
    }
    if (step && step.update) step.update(this, this.stepTime, delta);
    this.entities.forEach((e) => e.update && e.update());
    this.particles = this.particles.filter((p) => {
      p.update(this.time, delta);
      return !p.dead;
    });
    this._render();
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.fillStyle = "#0f0b1e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(168,85,247,0.03)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    this.bgParticles.forEach((p) => {
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
    this.connections.forEach((c) => c.render(ctx, this.time));
    this.particles.forEach((p) => p.render(ctx));
    this.entities.forEach((e) => {
      if (typeof (e as unknown as { render?: unknown }).render === "function") {
        (e as unknown as { render: (ctx: CanvasRenderingContext2D, time: number) => void }).render(ctx, this.time);
      }
    });
  }

  renderFrame() {
    this._render();
  }
}
