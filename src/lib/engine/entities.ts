/**
 * Animated entities for System Design visualizations.
 * Ported from SysWizard's canvas engine to TypeScript.
 */

export const COLORS = {
  server: "#3b82f6",
  serverGlow: "rgba(59,130,246,0.3)",
  database: "#8b5cf6",
  databaseGlow: "rgba(139,92,246,0.3)",
  client: "#22d3ee",
  clientGlow: "rgba(34,211,238,0.3)",
  loadBalancer: "#f59e0b",
  loadBalancerGlow: "rgba(245,158,11,0.3)",
  cache: "#10b981",
  cacheGlow: "rgba(16,185,129,0.3)",
  queue: "#ec4899",
  queueGlow: "rgba(236,72,153,0.3)",
  gateway: "#f97316",
  gatewayGlow: "rgba(249,115,22,0.3)",
  packet: "#22d3ee",
  packetGlow: "rgba(34,211,238,0.5)",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  white: "#f4f0ff",
  muted: "#9d8fc0",
  violet: "#a855f7",
  violetGlow: "rgba(168,85,247,0.3)",
  accent: "#c084fc",
};

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export interface EntityLike {
  x: number;
  y: number;
  visible: boolean;
  highlight: boolean;
  update?: (time: number, delta: number, engine: unknown) => void;
  render?: (ctx: CanvasRenderingContext2D, time: number) => void;
}

export class Entity {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  label: string;
  description?: string;
  alpha = 1;
  scale = 1;
  visible = true;
  highlight = false;
  highlightColor = COLORS.server;
  pulsePhase = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, label = "") {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.label = label;
  }

  moveTo(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  update() {
    this.x += (this.targetX - this.x) * 0.08;
    this.y += (this.targetY - this.y) * 0.08;
  }

  drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, color = COLORS.white) {
    if (!this.label) return;
    ctx.font = "600 12px Outfit, sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(this.label, x, y);
    if (this.description) {
      ctx.font = "400 10px Outfit, sans-serif";
      ctx.fillStyle = "rgba(184,174,208,0.6)";
      ctx.fillText(this.description, x, y + 16);
    }
  }

  drawGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ) {
    const pulse = Math.sin(performance.now() * 0.003 + this.pulsePhase) * 0.3 + 0.7;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, color.replace(/[\d.]+\)/, `${0.3 * pulse})`));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
}

export class ServerNode extends Entity {
  w = 70;
  h = 80;
  color = COLORS.server;
  glowColor = COLORS.serverGlow;
  status: "active" | "busy" | "down" = "active";
  load = 0;

  constructor(x: number, y: number, label = "Server") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 60, this.glowColor);
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.strokeStyle = this.status === "down" ? COLORS.error : this.color;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill();
    ctx.stroke();
    const statusColor =
      this.status === "active" ? COLORS.success : this.status === "busy" ? COLORS.warning : COLORS.error;
    ctx.beginPath();
    ctx.arc(w - 12, 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = statusColor;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const ly = h * (i / 4);
      ctx.beginPath();
      ctx.moveTo(8, ly);
      ctx.lineTo(w - 8, ly);
      ctx.stroke();
    }
    if (this.load > 0) {
      const barW = w - 16;
      const barH = 4;
      const barY = h - 14;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      roundRect(ctx, 8, barY, barW, barH, 2);
      ctx.fill();
      const loadColor =
        this.load > 0.8 ? COLORS.error : this.load > 0.5 ? COLORS.warning : COLORS.success;
      ctx.fillStyle = loadColor;
      roundRect(ctx, 8, barY, barW * this.load, barH, 2);
      ctx.fill();
    }
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 8, COLORS.muted);
  }
}

export class DatabaseNode extends Entity {
  w = 70;
  h = 70;
  color = COLORS.database;
  glowColor = COLORS.databaseGlow;
  isMaster = false;

  constructor(x: number, y: number, label = "Database") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 60, this.glowColor);
    ctx.save();
    ctx.translate(x, y);
    const cw = w / 2;
    const ch = h / 2;
    const ovalH = 10;
    ctx.fillStyle = "#1e1035";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-cw, -ch + ovalH);
    ctx.lineTo(-cw, ch - ovalH);
    ctx.ellipse(0, ch - ovalH, cw, ovalH, 0, Math.PI, 0, true);
    ctx.lineTo(cw, -ch + ovalH);
    ctx.ellipse(0, -ch + ovalH, cw, ovalH, 0, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -ch + ovalH, cw, ovalH, 0, 0, Math.PI * 2);
    const topGrad = ctx.createLinearGradient(-cw, -ch, cw, -ch + ovalH * 2);
    topGrad.addColorStop(0, "#2d1b69");
    topGrad.addColorStop(1, "#1e1035");
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.stroke();
    if (this.isMaster) {
      ctx.font = "bold 9px Outfit, sans-serif";
      ctx.fillStyle = COLORS.warning;
      ctx.textAlign = "center";
      ctx.fillText("PRIMARY", 0, -ch - 6);
    }
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 4, COLORS.muted);
  }
}

export class ClientNode extends Entity {
  w = 56;
  h = 56;
  color = COLORS.client;
  glowColor = COLORS.clientGlow;

  constructor(x: number, y: number, label = "Client") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D, time: number) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 50, this.glowColor);
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0d3044");
    grad.addColorStop(1, "#0a1f2d");
    ctx.fillStyle = grad;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 4, 0, w - 8, h * 0.65, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgba(34,211,238,${0.1 + Math.sin(time * 0.002) * 0.05})`;
    roundRect(ctx, 8, 4, w - 16, h * 0.55, 3);
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.65);
    ctx.lineTo(w / 2, h * 0.8);
    ctx.moveTo(w * 0.3, h * 0.82);
    ctx.lineTo(w * 0.7, h * 0.82);
    ctx.stroke();
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 4, COLORS.muted);
  }
}

export class LoadBalancerNode extends Entity {
  size = 50;
  color = COLORS.loadBalancer;
  glowColor = COLORS.loadBalancerGlow;
  algorithm = "Round Robin";

  constructor(x: number, y: number, label = "Load Balancer") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, size } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 60, this.glowColor);
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = (Math.cos(angle) * size) / 2;
      const py = (Math.sin(angle) * size) / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    grad.addColorStop(0, "#3d2800");
    grad.addColorStop(1, "#1a1100");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(3, -5);
    ctx.lineTo(8, 0);
    ctx.lineTo(3, 5);
    ctx.stroke();
    ctx.restore();
    this.drawLabel(ctx, x, y + size / 2 + 8, COLORS.muted);
  }
}

export class CacheNode extends Entity {
  w = 72;
  h = 52;
  color = COLORS.cache;
  glowColor = COLORS.cacheGlow;
  flashColor: string | null = null;
  flashAlpha = 0;

  constructor(x: number, y: number, label = "Cache") {
    super(x, y, label);
  }

  flash(color: string) {
    this.flashColor = color;
    this.flashAlpha = 1;
  }

  update() {
    super.update();
    if (this.flashAlpha > 0) {
      this.flashAlpha -= 0.003;
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight || this.flashAlpha > 0) {
      const gc = this.flashAlpha > 0 ? this.flashColor : this.glowColor;
      this.drawGlow(ctx, x, y, 55, gc || this.glowColor);
    }
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0d2e24");
    grad.addColorStop(1, "#071a14");
    ctx.fillStyle = grad;
    ctx.strokeStyle = this.flashAlpha > 0 ? this.flashColor || this.color : this.color;
    ctx.lineWidth = this.flashAlpha > 0 ? 2.5 : 1.5;
    roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡", w / 2, h / 2);
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 6, COLORS.muted);
  }
}

export class QueueNode extends Entity {
  w = 120;
  h = 44;
  color = COLORS.queue;
  glowColor = COLORS.queueGlow;
  messages = 0;
  maxMessages = 8;

  constructor(x: number, y: number, label = "Queue") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 70, this.glowColor);
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#2d1040");
    grad.addColorStop(1, "#1a0828");
    ctx.fillStyle = grad;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 0, 0, w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    const msgW = 10;
    const gap = 3;
    const startX = 12;
    for (let i = 0; i < Math.min(this.messages, this.maxMessages); i++) {
      ctx.fillStyle = `hsl(${330 + i * 8}, 70%, ${55 + i * 3}%)`;
      roundRect(ctx, startX + i * (msgW + gap), 8, msgW, h - 16, 3);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    const arrowX = w - 20;
    ctx.beginPath();
    ctx.moveTo(arrowX - 6, h / 2);
    ctx.lineTo(arrowX + 6, h / 2);
    ctx.moveTo(arrowX + 2, h / 2 - 4);
    ctx.lineTo(arrowX + 6, h / 2);
    ctx.lineTo(arrowX + 2, h / 2 + 4);
    ctx.stroke();
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 8, COLORS.muted);
  }
}

export class GatewayNode extends Entity {
  w = 80;
  h = 60;
  color = COLORS.gateway;
  glowColor = COLORS.gatewayGlow;

  constructor(x: number, y: number, label = "API Gateway") {
    super(x, y, label);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    const { x, y, w, h } = this;
    if (this.highlight) this.drawGlow(ctx, x, y, 60, this.glowColor);
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.quadraticCurveTo(w, 0, w, h * 0.4);
    ctx.quadraticCurveTo(w, h * 0.9, w / 2, h);
    ctx.quadraticCurveTo(0, h * 0.9, 0, h * 0.4);
    ctx.quadraticCurveTo(0, 0, w / 2, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#3d1d00");
    grad.addColorStop(1, "#1a0d00");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️", w / 2, h / 2);
    ctx.restore();
    this.drawLabel(ctx, x, y + h / 2 + 6, COLORS.muted);
  }
}

export class TextLabel extends Entity {
  text: string;
  fontSize: number;
  color: string;
  bg: string;
  padding: number;
  borderColor: string;

  constructor(x: number, y: number, text: string, options: Partial<{
    fontSize: number; color: string; bg: string; padding: number; borderColor: string;
  }> = {}) {
    super(x, y, "");
    this.text = text;
    this.fontSize = options.fontSize || 14;
    this.color = options.color || COLORS.white;
    this.bg = options.bg || "rgba(10,14,26,0.8)";
    this.padding = options.padding || 10;
    this.borderColor = options.borderColor || "rgba(255,255,255,0.1)";
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    ctx.font = `500 ${this.fontSize}px Outfit, sans-serif`;
    const metrics = ctx.measureText(this.text);
    const tw = metrics.width;
    const th = this.fontSize;
    const p = this.padding;
    ctx.fillStyle = this.bg;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    roundRect(ctx, this.x - tw / 2 - p, this.y - th / 2 - p, tw + p * 2, th + p * 2, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x, this.y);
  }
}

export class ArrowConnection {
  from: Entity;
  to: Entity;
  color: string;
  activeColor: string;
  lineWidth: number;
  active = false;
  dashed = false;
  label: string;
  visible = true;
  bidirectional: boolean;

  constructor(from: Entity, to: Entity, options: Partial<{
    color: string; activeColor: string; lineWidth: number; dashed: boolean;
    label: string; bidirectional: boolean;
  }> = {}) {
    this.from = from;
    this.to = to;
    this.color = options.color || "rgba(148,163,184,0.3)";
    this.activeColor = options.activeColor || COLORS.accent;
    this.lineWidth = options.lineWidth || 1.5;
    this.dashed = options.dashed || false;
    this.label = options.label || "";
    this.bidirectional = options.bidirectional || false;
  }

  render(ctx: CanvasRenderingContext2D, time: number) {
    if (!this.visible) return;
    const fx = this.from.x;
    const fy = this.from.y;
    const tx = this.to.x;
    const ty = this.to.y;
    ctx.save();
    ctx.strokeStyle = this.active ? this.activeColor : this.color;
    ctx.lineWidth = this.active ? this.lineWidth + 0.5 : this.lineWidth;
    if (this.dashed) {
      const dashOffset = (time * 0.05) % 20;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -dashOffset;
    }
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    const angle = Math.atan2(ty - fy, tx - fx);
    const headLen = 8;
    ctx.fillStyle = ctx.strokeStyle as string;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - headLen * Math.cos(angle - 0.4), ty - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(tx - headLen * Math.cos(angle + 0.4), ty - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.setLineDash([]);
    if (this.label) {
      const mx = (fx + tx) / 2;
      const my = (fy + ty) / 2;
      ctx.font = "500 10px Outfit, sans-serif";
      ctx.fillStyle = COLORS.muted;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(this.label, mx, my - 6);
    }
    ctx.restore();
  }
}

export class DataPacket {
  from: Entity;
  to: Entity;
  progress = 0;
  speed: number;
  color: string;
  glowColor: string;
  radius: number;
  dead = false;
  onArrive: (() => void) | null;
  trail: { x: number; y: number; alpha: number }[] = [];
  label: string;

  constructor(from: Entity, to: Entity, options: Partial<{
    speed: number; color: string; glowColor: string; radius: number;
    onArrive: () => void; label: string;
  }> = {}) {
    this.from = from;
    this.to = to;
    this.speed = options.speed || 0.002;
    this.color = options.color || COLORS.packet;
    this.glowColor = options.glowColor || COLORS.packetGlow;
    this.radius = options.radius || 5;
    this.onArrive = options.onArrive || null;
    this.label = options.label || "";
  }

  update(time: number, delta: number) {
    this.progress += this.speed * delta;
    const x = this.from.x + (this.to.x - this.from.x) * this.progress;
    const y = this.from.y + (this.to.y - this.from.y) * this.progress;
    this.trail.push({ x, y, alpha: 1 });
    if (this.trail.length > 12) this.trail.shift();
    this.trail.forEach((t) => (t.alpha *= 0.85));
    if (this.progress >= 1) {
      this.dead = true;
      if (this.onArrive) this.onArrive();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.dead) return;
    const x = this.from.x + (this.to.x - this.from.x) * this.progress;
    const y = this.from.y + (this.to.y - this.from.y) * this.progress;
    this.trail.forEach((t) => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(")", `,${t.alpha * 0.3})`).replace("rgb", "rgba");
      ctx.fill();
    });
    const grad = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 3);
    grad.addColorStop(0, this.glowColor);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(x - this.radius * 3, y - this.radius * 3, this.radius * 6, this.radius * 6);
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.label) {
      ctx.font = "500 9px Outfit, sans-serif";
      ctx.fillStyle = COLORS.white;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(this.label, x, y - this.radius - 4);
    }
  }
}

export class HashRing extends Entity {
  radius: number;
  nodes: { angle: number; label: string; color: string; scale: number }[] = [];
  keys: { angle: number; label: string; alpha: number }[] = [];
  color = COLORS.violet;

  constructor(x: number, y: number, radius = 120, label = "Hash Ring") {
    super(x, y, label);
    this.radius = radius;
  }

  addNode(angle: number, label: string, color = COLORS.server) {
    this.nodes.push({ angle, label, color, scale: 1 });
  }
  addKey(angle: number, label: string) {
    this.keys.push({ angle, label, alpha: 1 });
  }

  render(ctx: CanvasRenderingContext2D, time: number) {
    if (!this.visible) return;
    const { x, y, radius } = this;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -(time * 0.02) % 12;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.15)";
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    this.nodes.forEach((node) => {
      const nx = x + Math.cos(node.angle) * radius;
      const ny = y + Math.sin(node.angle) * radius;
      ctx.beginPath();
      ctx.arc(nx, ny, 10 * node.scale, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "bold 9px Outfit, sans-serif";
      ctx.fillStyle = COLORS.white;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, nx, ny);
      const lx = x + Math.cos(node.angle) * (radius + 22);
      const ly = y + Math.sin(node.angle) * (radius + 22);
      ctx.font = "500 10px Outfit, sans-serif";
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(node.label, lx, ly);
    });
    this.keys.forEach((key) => {
      const kx = x + Math.cos(key.angle) * (radius - 18);
      const ky = y + Math.sin(key.angle) * (radius - 18);
      ctx.globalAlpha = key.alpha;
      ctx.beginPath();
      ctx.arc(kx, ky, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.accent;
      ctx.fill();
      ctx.font = "500 8px JetBrains Mono, monospace";
      ctx.fillStyle = COLORS.white;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(key.label, kx, ky - 8);
      ctx.globalAlpha = 1;
    });
  }
}

export type EntityType = "client" | "server" | "database" | "cache" | "loadbalancer" | "gateway";

export function createEntity(type: string, x: number, y: number, label?: string): Entity {
  switch (type) {
    case "client": return new ClientNode(x, y, label || "Client");
    case "server": return new ServerNode(x, y, label || "Server");
    case "database": return new DatabaseNode(x, y, label || "Database");
    case "cache": return new CacheNode(x, y, label || "Cache");
    case "loadbalancer": return new LoadBalancerNode(x, y, label || "Gateway");
    case "gateway": return new GatewayNode(x, y, label || "API Gateway");
    default: return new ServerNode(x, y, label || "Node");
  }
}
