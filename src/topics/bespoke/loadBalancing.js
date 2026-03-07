/**
 * Bespoke Animation: Load Balancing
 * Metaphor: The Traffic Cop
 */
import { ServerNode, LoadBalancerNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../../engine/entities.js';

export function setupLoadBalancingBespoke(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // ─── Entities ───
    const title = new TextLabel(cx, 40, '⚖️ Load Balancing: The Traffic Cop', { fontSize: 18, color: '#f4f0ff', bg: 'rgba(245,158,11,0.1)' });
    engine.addEntity(title);

    // Clients (left side)
    const clients = [];
    for (let i = 0; i < 4; i++) {
        const c = new ServerNode(cx - 300, cy - 90 + i * 60, `User ${i + 1}`);
        c.color = COLORS.client;
        c.glowColor = COLORS.clientGlow;
        clients.push(c);
        engine.addEntity(c);
    }

    // Load Balancer (center)
    const lb = new LoadBalancerNode(cx - 50, cy, 'Traffic Cop');
    engine.addEntity(lb);

    // Servers (right side)
    const servers = [];
    for (let i = 0; i < 3; i++) {
        const s = new ServerNode(cx + 150, cy - 80 + i * 80, `Server ${String.fromCharCode(65 + i)}`);
        servers.push(s);
        engine.addEntity(s);
    }

    // Connections
    const clientConns = [];
    clients.forEach(c => {
        const conn = new ArrowConnection(c, lb, { color: 'rgba(34,211,238,0.2)', dashed: true });
        clientConns.push(conn);
        engine.addConnection(conn);
    });

    const serverConns = [];
    servers.forEach(s => {
        const conn = new ArrowConnection(lb, s, { color: 'rgba(245,158,11,0.2)', dashed: true });
        serverConns.push(conn);
        engine.addConnection(conn);
    });

    // Initial state
    lb.alpha = 0; // Hidden initially
    lb.visible = false;
    serverConns.forEach(c => c.active = false);

    let packetTimer = 0;
    let roundRobinIdx = 0;

    // ─── Steps ───
    const steps = [
        {
            title: '1. The Overwhelmed Server',
            description: 'Without a Load Balancer, all 4 users send their traffic directly to Server A. Server A gets overwhelmed with too much work (load goes to 100%), while Server B and C sit idle.',
            duration: 5000,
            setup: () => {
                lb.visible = false;
                clientConns.forEach(c => { c.to = servers[0]; c.active = true; c.color = COLORS.error; });
                servers[0].highlight = true;
                servers[0].status = 'busy';
                servers[0].load = 0;
            },
            update: (eng, stepTime, delta) => {
                servers[0].load = Math.min(1.0, stepTime / 4000);
                if (servers[0].load > 0.8) servers[0].status = 'down';

                // Spam packets to Server A
                packetTimer += delta;
                if (packetTimer > 800) {
                    packetTimer = 0;
                    clients.forEach(c => {
                        const p = new DataPacket(c, servers[0], { color: COLORS.error, speed: 0.003 });
                        eng.addParticle(p);
                    });
                }
            }
        },
        {
            title: '2. Enter the Traffic Cop',
            description: 'We introduce a Load Balancer. Like a traffic cop at a busy intersection, it sits in front of the servers. Users now send traffic to the Cop, not the servers directly.',
            duration: 4000,
            setup: () => {
                lb.visible = true;
                lb.alpha = 1;
                lb.highlight = true;
                servers[0].status = 'active';
                servers[0].load = 0;
                servers[0].highlight = false;

                // Reroute client connections to LB
                clientConns.forEach(c => { c.to = lb; c.active = true; c.color = 'rgba(34,211,238,0.4)'; });
                serverConns.forEach(c => c.active = false);
            }
        },
        {
            title: '3. Round Robin Routing',
            description: 'The Traffic Cop starts dealing out requests like a deck of cards: "One for A, one for B, one for C, back to A...". This is Round Robin. Load is spread perfectly evenly.',
            duration: 6000,
            setup: () => {
                lb.highlight = true;
                serverConns.forEach(c => c.active = true);
                servers.forEach(s => s.load = 0);
                roundRobinIdx = 0;
            },
            update: (eng, stepTime, delta) => {
                packetTimer += delta;
                if (packetTimer > 600) {
                    packetTimer = 0;

                    // Pick client
                    const client = clients[Math.floor(Math.random() * clients.length)];

                    // Client to LB
                    const p1 = new DataPacket(client, lb, { color: COLORS.client, speed: 0.005 });

                    // LB to Server (Round Robin)
                    p1.onArrive = () => {
                        const targetSrv = servers[roundRobinIdx];
                        const srvConn = serverConns[roundRobinIdx];
                        srvConn.active = true;

                        const p2 = new DataPacket(lb, targetSrv, { color: COLORS.loadBalancer, speed: 0.005 });
                        p2.onArrive = () => {
                            targetSrv.load = Math.min(0.6, targetSrv.load + 0.15);
                            setTimeout(() => targetSrv.load = Math.max(0, targetSrv.load - 0.15), 1500);
                        };
                        eng.addParticle(p2);

                        roundRobinIdx = (roundRobinIdx + 1) % servers.length;
                    };
                    eng.addParticle(p1);
                }
            }
        },
        {
            title: '4. Handling Failure (Health Checks)',
            description: 'Ah! Server B just crashed! A smart Load Balancer constantly checks if servers are healthy ("Health Checks"). It instantly stops sending traffic to Server B and reroutes it to A and C.',
            duration: 6000,
            setup: () => {
                servers[1].status = 'down';
                servers[1].load = 0;
                serverConns[1].color = COLORS.error;
                serverConns[1].dashed = false;
                roundRobinIdx = 0;
            },
            update: (eng, stepTime, delta) => {
                packetTimer += delta;
                if (packetTimer > 800) {
                    packetTimer = 0;
                    const client = clients[Math.floor(Math.random() * clients.length)];
                    const p1 = new DataPacket(client, lb, { color: COLORS.client, speed: 0.005 });

                    p1.onArrive = () => {
                        // Skip broken server 1
                        if (roundRobinIdx === 1) roundRobinIdx = 2;

                        const targetSrv = servers[roundRobinIdx];
                        const srvConn = serverConns[roundRobinIdx];
                        srvConn.active = true;

                        const p2 = new DataPacket(lb, targetSrv, { color: COLORS.loadBalancer, speed: 0.005 });
                        p2.onArrive = () => {
                            targetSrv.load = Math.min(0.8, targetSrv.load + 0.2); // Load increases on remaining servers
                            setTimeout(() => targetSrv.load = Math.max(0, targetSrv.load - 0.2), 1500);
                        };
                        eng.addParticle(p2);

                        roundRobinIdx = (roundRobinIdx + 1) % servers.length;
                        if (roundRobinIdx === 1) roundRobinIdx = 2;
                    };
                    eng.addParticle(p1);
                }
            }
        }
    ];

    engine.setSteps(steps);
}
