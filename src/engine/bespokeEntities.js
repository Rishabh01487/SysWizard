/**
 * Bespoke Metaphor Entities for core system design concepts
 */
import { Entity, COLORS, roundRect } from './entities.js';

// ─── Browser / Client Window ───
export class BrowserNode extends Entity {
    constructor(x, y, label = '') {
        super(x, y, label);
        this.w = 140;
        this.h = 100;
        this.color = COLORS.client;
        this.glowColor = COLORS.clientGlow;
        this.content = null; // 'loading', 'rendered', 'error'
    }

    render(ctx, time) {
        if (!this.visible) return;
        const { x, y, w, h } = this;

        if (this.highlight) this.drawGlow(ctx, x, y, 90, this.glowColor);

        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);

        // Window frame
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        roundRect(ctx, 0, 0, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Top bar
        ctx.fillStyle = '#1e293b';
        roundRect(ctx, 0, 0, w, 20, 6); // Just drawing over the top part
        ctx.fillRect(0, 10, w, 10); // cover bottom corners of top round rect
        ctx.fill();

        // Window buttons (Mac style)
        const btnColors = ['#ef4444', '#f59e0b', '#10b981'];
        btnColors.forEach((c, i) => {
            ctx.beginPath();
            ctx.arc(12 + i * 12, 10, 3, 0, Math.PI * 2);
            ctx.fillStyle = c;
            ctx.fill();
        });

        // URL bar
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, 45, 4, w - 50, 12, 4);
        ctx.fill();
        ctx.font = '8px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('https://example.com', 50, 13);

        // Content Area
        if (this.content === 'loading') {
            const rot = (time * 0.005) % (Math.PI * 2);
            ctx.translate(w / 2, h / 2 + 10);
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 1.5);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.rotate(-rot);
            ctx.translate(-w / 2, -h / 2 - 10);
        } else if (this.content === 'rendered') {
            ctx.fillStyle = '#334155';
            ctx.fillRect(10, 30, 40, 40); // Image mock

            ctx.fillStyle = '#475569';
            roundRect(ctx, 60, 30, w - 70, 6, 3);
            ctx.fill();
            roundRect(ctx, 60, 42, w - 70, 4, 2);
            ctx.fill();
            roundRect(ctx, 60, 50, w - 90, 4, 2);
            ctx.fill();

            // Button
            ctx.fillStyle = COLORS.accent;
            roundRect(ctx, 60, 60, 30, 10, 3);
            ctx.fill();
        }

        ctx.restore();
        this.drawLabel(ctx, x, y + h / 2 + 10, COLORS.muted);
    }
}

// ─── Envelope (Data Packet Metaphor) ───
export class EnvelopePacket extends Entity {
    constructor(x, y, type = 'request') {
        super(x, y, '');
        this.type = type; // 'request', 'response'
        this.w = 24;
        this.h = 16;
        this.color = type === 'request' ? COLORS.client : COLORS.server;
        this.progress = 0;
        this.speed = 0.0015;
        this.dead = false;
        this.from = null;
        this.to = null;
        this.onArrive = null;
    }

    update(time, delta) {
        if (!this.from || !this.to) return super.update(time, delta);

        this.progress += this.speed * delta;

        // Arc movement
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;

        this.x = this.from.x + dx * this.progress;
        // Add an arc offset
        const arcHeight = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) * -0.2 : Math.abs(dy) * -0.2;
        this.y = this.from.y + dy * this.progress + Math.sin(this.progress * Math.PI) * arcHeight;

        if (this.progress >= 1) {
            this.dead = true;
            if (this.onArrive) this.onArrive();
        }
    }

    render(ctx, time) {
        if (!this.visible || this.dead) return;
        const { x, y, w, h } = this;

        ctx.save();
        ctx.translate(x, y);

        // Rotation based on trajectory
        if (this.from && this.to) {
            const dx = this.to.x - this.from.x;
            const dy = this.to.y - this.from.y;
            const arcHeight = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) * -0.2 : Math.abs(dy) * -0.2;
            const currentDy = dy + Math.cos(this.progress * Math.PI) * Math.PI * arcHeight;
            let angle = Math.atan2(currentDy, dx);
            // Slight tilt effect
            ctx.rotate(angle * 0.2);
        }

        ctx.translate(-w / 2, -h / 2);

        // Envelope Body
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        roundRect(ctx, 0, 0, w, h, 2);
        ctx.fill();
        ctx.stroke();

        // Envelope Flap
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w / 2, h / 2 + 2);
        ctx.lineTo(w, 0);
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        // Icon inside (visible near center)
        ctx.fillStyle = this.color;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = this.type === 'request' ? '?' : '<>';
        ctx.fillText(icon, w / 2, h / 2 + 3);

        ctx.restore();
    }
}

// ─── File Folder (Server Internals Metaphor) ───
export class FolderNode extends Entity {
    constructor(x, y, label = '') {
        super(x, y, label);
        this.w = 50;
        this.h = 40;
        this.color = '#fbbf24'; // yellow-folder
        this.state = 'closed'; // closed, open
    }

    render(ctx, time) {
        if (!this.visible) return;
        const { x, y, w, h } = this;

        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);

        // Back flap
        ctx.fillStyle = '#d97706'; // dark amber
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(16, 8);
        ctx.lineTo(20, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Paper inside if open
        if (this.state === 'open') {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(4, -8, w - 12, h);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.strokeRect(4, -8, w - 12, h);

            // Code lines on paper
            ctx.fillStyle = '#64748b';
            ctx.fillRect(8, -2, w - 24, 2);
            ctx.fillRect(8, 2, w - 30, 2);
            ctx.fillRect(8, 6, w - 20, 2);
            ctx.fillStyle = COLORS.accent;
            ctx.fillText('<html />', 8, 16);
        }

        // Front flap
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const flapOffset = this.state === 'open' ? 14 : 8;
        ctx.moveTo(0, flapOffset);
        ctx.lineTo(w, flapOffset);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.stroke();

        ctx.restore();
    }
}
