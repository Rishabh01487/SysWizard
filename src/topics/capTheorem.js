/**
 * Topic: CAP Theorem
 */
import { DatabaseNode, ServerNode, ArrowConnection, TextLabel, COLORS, Entity } from '../engine/entities.js';

export const metadata = {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    icon: '🔺',
    description: 'Understand the trade-offs between Consistency, Availability, and Partition Tolerance in distributed systems.',
    tags: ['Distributed Systems', 'Trade-offs', 'Theory'],
    accentGrad: 'linear-gradient(135deg, #ef4444, #f59e0b)',
};

// Triangle vertex entity
class TriangleVertex extends Entity {
    constructor(x, y, letter, fullName, color) {
        super(x, y, fullName);
        this.letter = letter;
        this.color = color;
        this.size = 36;
        this.active = false;
        this.dimmed = false;
    }
    render(ctx, time) {
        if (!this.visible) return;
        const { x, y, size } = this;
        const pulse = Math.sin(time * 0.003 + this.pulsePhase) * 0.05 + 1;

        if (this.active) {
            this.drawGlow(ctx, x, y, 55, this.color + '60');
        }

        // Circle
        ctx.beginPath();
        ctx.arc(x, y, size * pulse, 0, Math.PI * 2);
        const alpha = this.dimmed ? 0.3 : 1;
        ctx.fillStyle = this.dimmed ? 'rgba(30,41,59,0.5)' : this.color + '20';
        ctx.fill();
        ctx.strokeStyle = this.dimmed ? COLORS.muted : this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;
        ctx.stroke();

        // Letter
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = this.dimmed ? COLORS.muted : this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.letter, x, y);

        // Label
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillStyle = this.dimmed ? COLORS.muted : COLORS.white;
        ctx.fillText(this.label, x, y + size + 16);
        ctx.globalAlpha = 1;
    }
}

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // Triangle vertices
    const C = new TriangleVertex(cx, cy - 140, 'C', 'Consistency', '#3b82f6');
    const A = new TriangleVertex(cx - 180, cy + 100, 'A', 'Availability', '#10b981');
    const P = new TriangleVertex(cx + 180, cy + 100, 'P', 'Partition Tolerance', '#ef4444');

    engine.addEntity(C);
    engine.addEntity(A);
    engine.addEntity(P);

    // Triangle edges
    const edgeCA = engine.addConnection(new ArrowConnection(C, A, { color: 'rgba(255,255,255,0.1)', lineWidth: 1 }));
    const edgeCP = engine.addConnection(new ArrowConnection(C, P, { color: 'rgba(255,255,255,0.1)', lineWidth: 1 }));
    const edgeAP = engine.addConnection(new ArrowConnection(A, P, { color: 'rgba(255,255,255,0.1)', lineWidth: 1 }));
    // Remove arrowheads for triangle display
    edgeCA.render = function (ctx) { drawLine(ctx, this.from, this.to, this.color); };
    edgeCP.render = function (ctx) { drawLine(ctx, this.from, this.to, this.color); };
    edgeAP.render = function (ctx) { drawLine(ctx, this.from, this.to, this.color); };

    const choiceLabel = new TextLabel(cx, cy + 200, '', { fontSize: 13, color: COLORS.warning });
    choiceLabel.visible = false;
    engine.addEntity(choiceLabel);

    engine.setSteps([
        {
            title: 'CAP Theorem',
            description: 'The <strong>CAP Theorem</strong> states that a distributed system can guarantee at most <strong>two</strong> of three properties: <strong>Consistency</strong>, <strong>Availability</strong>, and <strong>Partition Tolerance</strong>.',
            duration: 5000,
            setup: () => {
                C.active = true; C.dimmed = false;
                A.active = true; A.dimmed = false;
                P.active = true; P.dimmed = false;
                choiceLabel.visible = false;
            }
        },
        {
            title: 'Consistency (C)',
            description: '<strong>Consistency</strong> means every read receives the <strong>most recent write</strong>. All nodes see the same data at the same time. Example: bank account balance must always be accurate.',
            duration: 4500,
            setup: () => {
                C.active = true; C.dimmed = false;
                A.active = false; A.dimmed = true;
                P.active = false; P.dimmed = true;
                choiceLabel.visible = false;
            }
        },
        {
            title: 'Availability (A)',
            description: '<strong>Availability</strong> means every request receives a response (success or failure). The system remains <strong>operational</strong> even when some nodes are down.',
            duration: 4500,
            setup: () => {
                C.active = false; C.dimmed = true;
                A.active = true; A.dimmed = false;
                P.active = false; P.dimmed = true;
            }
        },
        {
            title: 'Partition Tolerance (P)',
            description: '<strong>Partition Tolerance</strong> means the system continues to operate despite network partitions (messages lost or delayed between nodes). In real systems, <strong>P is non-negotiable</strong>.',
            duration: 4500,
            setup: () => {
                C.active = false; C.dimmed = true;
                A.active = false; A.dimmed = true;
                P.active = true; P.dimmed = false;
            }
        },
        {
            title: 'CP: Consistency + Partition Tolerance',
            description: '<strong>CP systems</strong> sacrifice availability during partitions. They wait for consensus before responding. Examples: <strong>MongoDB</strong>, <strong>HBase</strong>, <strong>Redis</strong> (strict mode).',
            duration: 5000,
            setup: () => {
                C.active = true; C.dimmed = false;
                A.active = false; A.dimmed = true;
                P.active = true; P.dimmed = false;
                choiceLabel.text = 'CP: MongoDB, HBase, Redis';
                choiceLabel.visible = true;
            }
        },
        {
            title: 'AP: Availability + Partition Tolerance',
            description: '<strong>AP systems</strong> sacrifice strict consistency for availability. They may return stale data during partitions. Examples: <strong>Cassandra</strong>, <strong>DynamoDB</strong>, <strong>CouchDB</strong>.',
            duration: 5000,
            setup: () => {
                C.active = false; C.dimmed = true;
                A.active = true; A.dimmed = false;
                P.active = true; P.dimmed = false;
                choiceLabel.text = 'AP: Cassandra, DynamoDB, CouchDB';
                choiceLabel.visible = true;
            }
        },
        {
            title: 'Key Takeaways',
            description: 'In practice, you <strong>always need P</strong> (networks fail). The real choice is between <strong>C</strong> and <strong>A</strong> during partitions. Modern systems use <strong>eventual consistency</strong> as a practical middle ground.',
            duration: 5000,
            setup: () => {
                C.active = true; C.dimmed = false;
                A.active = true; A.dimmed = false;
                P.active = true; P.dimmed = false;
                choiceLabel.text = 'Pick 2: The fundamental trade-off';
                choiceLabel.visible = true;
            }
        }
    ]);
}

function drawLine(ctx, from, to, color) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}
