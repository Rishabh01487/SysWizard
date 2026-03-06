/**
 * Topic: Rate Limiting
 */
import { ServerNode, ClientNode, GatewayNode, ArrowConnection, DataPacket, TextLabel, COLORS, Entity } from '../engine/entities.js';

export const metadata = {
    id: 'rate-limiting',
    title: 'Rate Limiting',
    icon: '🚦',
    description: 'Control the rate of requests to protect services from overload and abuse.',
    tags: ['Security', 'Performance', 'Token Bucket'],
    accentGrad: 'linear-gradient(135deg, #ef4444, #f97316)',
};

// Token Bucket visualization
class TokenBucket extends Entity {
    constructor(x, y, label) {
        super(x, y, label);
        this.capacity = 10;
        this.tokens = 10;
        this.w = 80;
        this.h = 120;
        this.color = COLORS.warning;
    }

    render(ctx, time) {
        if (!this.visible) return;
        const { x, y, w, h } = this;

        ctx.save();
        ctx.translate(x - w / 2, y - h / 2);

        // Bucket outline
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(0, h);
        ctx.lineTo(w, h);
        ctx.lineTo(w - 8, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245,158,11,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fill level
        const fillRatio = this.tokens / this.capacity;
        const fillH = h * fillRatio;
        const fillY = h - fillH;

        const fillColor = fillRatio > 0.5 ? COLORS.success :
            fillRatio > 0.2 ? COLORS.warning : COLORS.error;

        // Fill
        ctx.beginPath();
        const topInset = 8 * (1 - fillRatio);
        ctx.moveTo(topInset + (8 - topInset) * (fillY / h), fillY);
        ctx.lineTo(0, h);
        ctx.lineTo(w, h);
        ctx.lineTo(w - topInset - (8 - topInset) * (fillY / h), fillY);
        ctx.closePath();
        ctx.fillStyle = fillColor + '30';
        ctx.fill();

        // Token circles
        const cols = 4;
        const tokenR = 6;
        for (let i = 0; i < Math.floor(this.tokens); i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const tx = 14 + col * 17;
            const ty = h - 14 - row * 16;
            ctx.beginPath();
            ctx.arc(tx, ty, tokenR, 0, Math.PI * 2);
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        // Capacity label
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillStyle = COLORS.white;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(this.tokens)}/${this.capacity}`, w / 2, -8);

        ctx.restore();

        this.drawLabel(ctx, x, y + h / 2 + 10, COLORS.muted);
    }
}

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const client = new ClientNode(cx - 320, cy, 'Client');
    const gateway = new GatewayNode(cx - 100, cy, 'API Endpoint');
    const server = new ServerNode(cx + 200, cy, 'Server');
    const bucket = new TokenBucket(cx + 30, cy - 140, 'Token Bucket');

    engine.addEntity(client);
    engine.addEntity(gateway);
    engine.addEntity(server);
    engine.addEntity(bucket);

    engine.addConnection(new ArrowConnection(client, gateway, { color: 'rgba(249,115,22,0.2)', activeColor: COLORS.gateway }));
    engine.addConnection(new ArrowConnection(gateway, server, { color: 'rgba(249,115,22,0.15)', activeColor: COLORS.success }));

    const statusLabel = new TextLabel(cx, cy + 140, '', {
        fontSize: 14, color: COLORS.success
    });
    statusLabel.visible = false;
    engine.addEntity(statusLabel);

    engine.setSteps([
        {
            title: 'Why Rate Limiting?',
            description: '<strong>Rate Limiting</strong> controls how many requests a client can make in a given time window. It prevents <strong>abuse</strong>, <strong>DDoS attacks</strong>, and protects backend services from overload.',
            duration: 4500,
            setup: () => {
                gateway.highlight = true;
                bucket.tokens = 10;
                statusLabel.visible = false;
            }
        },
        {
            title: 'Token Bucket Algorithm',
            description: 'The <strong>Token Bucket</strong> algorithm: the bucket fills with tokens at a fixed rate. Each request <strong>consumes one token</strong>. If the bucket is empty, the request is <strong>rejected (429)</strong>.',
            duration: 5000,
            setup: () => {
                bucket.tokens = 10;
                bucket.highlight = true;
                statusLabel.visible = false;
            }
        },
        {
            title: 'Requests Consuming Tokens',
            description: 'Each incoming request <strong>consumes a token</strong> from the bucket. As long as tokens are available, requests are <strong>allowed through</strong> (✅ 200 OK).',
            duration: 6000,
            setup: () => {
                bucket.tokens = 8;
                statusLabel.visible = true;
                statusLabel.text = '✅ 200 OK — Request Allowed';
                statusLabel.color = COLORS.success;
            },
            update: (eng, stepTime) => {
                const interval = 1000;
                const tick = Math.floor(stepTime / interval);
                if (tick < 5 && stepTime % interval < 50) {
                    bucket.tokens = Math.max(0, bucket.tokens - 1);
                    eng.addParticle(new DataPacket(client, gateway, {
                        speed: 0.003, color: COLORS.gateway, label: `Req #${tick + 1}`,
                        onArrive: () => {
                            if (bucket.tokens > 0) {
                                eng.addParticle(new DataPacket(gateway, server, {
                                    speed: 0.002, color: COLORS.success
                                }));
                                statusLabel.text = `✅ 200 OK (${Math.floor(bucket.tokens)} tokens left)`;
                                statusLabel.color = COLORS.success;
                            }
                        }
                    }));
                }
            }
        },
        {
            title: 'Rate Limited! 429 Too Many Requests',
            description: 'When the bucket is <strong>empty</strong>, new requests are <strong>rejected</strong> with <strong>HTTP 429 Too Many Requests</strong>. The client must wait for the bucket to refill.',
            duration: 5000,
            setup: () => {
                bucket.tokens = 0;
                statusLabel.text = '🚫 429 Too Many Requests — Rate Limited!';
                statusLabel.color = COLORS.error;
                statusLabel.visible = true;
            },
            update: (eng, stepTime) => {
                if (stepTime > 2000) {
                    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + 0.02);
                    if (bucket.tokens > 3) {
                        statusLabel.text = `🔄 Tokens refilling... (${Math.floor(bucket.tokens)} tokens)`;
                        statusLabel.color = COLORS.warning;
                    }
                }
            }
        },
        {
            title: 'Key Takeaways',
            description: 'Rate limiting algorithms: <strong>Token Bucket</strong>, <strong>Sliding Window</strong>, <strong>Fixed Window</strong>, <strong>Leaky Bucket</strong>. Implemented at <strong>API Gateways</strong>, <strong>Nginx</strong>, <strong>Redis</strong>. Essential for API security and fair resource usage.',
            duration: 4500,
            setup: () => {
                bucket.tokens = 7;
                bucket.highlight = true;
                gateway.highlight = true;
                statusLabel.text = '✅ Healthy: Rate limiting active';
                statusLabel.color = COLORS.success;
            }
        }
    ]);
}
