/**
 * Topic: Load Balancing
 * Visualizes clients sending requests through a load balancer to multiple servers
 * with round-robin distribution.
 */
import { ServerNode, ClientNode, LoadBalancerNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'load-balancing',
    title: 'Load Balancing',
    icon: '⚖️',
    description: 'Distributes incoming traffic across multiple servers to ensure no single server is overwhelmed.',
    tags: ['Scalability', 'High Availability', 'Round Robin'],
    accentGrad: 'linear-gradient(135deg, #f59e0b, #f97316)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // Clients
    const clients = [];
    for (let i = 0; i < 3; i++) {
        const c = new ClientNode(cx - 300, cy - 100 + i * 100, `Client ${i + 1}`);
        engine.addEntity(c);
        clients.push(c);
    }

    // Load Balancer
    const lb = new LoadBalancerNode(cx, cy, 'Load Balancer');
    lb.algorithm = 'Round Robin';
    engine.addEntity(lb);

    // Servers
    const servers = [];
    for (let i = 0; i < 4; i++) {
        const s = new ServerNode(cx + 280, cy - 150 + i * 100, `Server ${i + 1}`);
        s.load = Math.random() * 0.3;
        engine.addEntity(s);
        servers.push(s);
    }

    // Connections: clients → LB
    clients.forEach(c => {
        engine.addConnection(new ArrowConnection(c, lb, { color: 'rgba(34,211,238,0.2)', activeColor: COLORS.client }));
    });

    // Connections: LB → servers
    const lbConns = servers.map(s =>
        engine.addConnection(new ArrowConnection(lb, s, { color: 'rgba(245,158,11,0.2)', activeColor: COLORS.loadBalancer }))
    );

    // Algorithm label
    const algoLabel = new TextLabel(cx, cy - 80, '🔄 Round Robin Algorithm', {
        fontSize: 13, color: COLORS.warning, bg: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)'
    });
    algoLabel.visible = false;
    engine.addEntity(algoLabel);

    let rrIndex = 0;

    // Steps
    engine.setSteps([
        {
            title: 'Overview',
            description: '<strong>Load Balancing</strong> distributes incoming network traffic across multiple servers. This ensures no single server bears too much load, improving <strong>reliability</strong> and <strong>performance</strong>.',
            duration: 4000,
            setup: (eng) => {
                clients.forEach(c => c.highlight = false);
                servers.forEach(s => { s.highlight = false; s.load = Math.random() * 0.3; });
                lb.highlight = true;
            }
        },
        {
            title: 'Clients Send Requests',
            description: 'Multiple <strong>clients</strong> send requests to the application. Without a load balancer, all requests would hit a single server.',
            duration: 4000,
            setup: (eng) => {
                clients.forEach(c => c.highlight = true);
                lb.highlight = false;
                algoLabel.visible = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    clients.forEach(c => {
                        eng.addParticle(new DataPacket(c, lb, { speed: 0.001, color: COLORS.client, label: 'REQ' }));
                    });
                }
            }
        },
        {
            title: 'Round Robin Distribution',
            description: 'The load balancer uses <strong>Round Robin</strong> — it sends each new request to the next server in line, cycling through all servers sequentially.',
            duration: 6000,
            setup: (eng) => {
                algoLabel.visible = true;
                lb.highlight = true;
                rrIndex = 0;
            },
            update: (eng, stepTime) => {
                const interval = 1200;
                const tick = Math.floor(stepTime / interval);
                if (tick < 4 && stepTime % interval < 50) {
                    const targetServer = servers[tick % servers.length];
                    lbConns[tick % servers.length].active = true;
                    targetServer.highlight = true;
                    targetServer.load = Math.min(1, targetServer.load + 0.2);
                    eng.addParticle(new DataPacket(lb, targetServer, {
                        speed: 0.0015,
                        color: COLORS.loadBalancer,
                        label: `#${tick + 1}`,
                        onArrive: () => {
                            lbConns[tick % servers.length].active = false;
                            setTimeout(() => { targetServer.highlight = false; }, 500);
                        }
                    }));
                }
            }
        },
        {
            title: 'Even Load Distribution',
            description: 'After distributing requests, all servers share the load <strong>evenly</strong>. This prevents any single server from becoming a bottleneck.',
            duration: 4000,
            setup: (eng) => {
                algoLabel.visible = true;
                servers.forEach((s, i) => {
                    s.load = 0.4 + Math.random() * 0.15;
                    s.highlight = true;
                    s.status = 'active';
                });
                lbConns.forEach(c => c.active = false);
            }
        },
        {
            title: 'Server Failure & Health Checks',
            description: 'If a server goes <strong>down</strong>, the load balancer detects it via health checks and <strong>stops sending traffic</strong> to it. Requests are rerouted to healthy servers.',
            duration: 5000,
            setup: (eng) => {
                servers[2].status = 'down';
                servers[2].highlight = false;
                servers[2].load = 0;
                lbConns[2].visible = false;
                algoLabel.visible = false;

                // Redistribute load
                [0, 1, 3].forEach(i => {
                    servers[i].load = 0.6 + Math.random() * 0.2;
                    servers[i].status = 'busy';
                });
            },
            update: (eng, stepTime) => {
                if (stepTime > 1000 && stepTime < 1100) {
                    [0, 1, 3].forEach((si, i) => {
                        setTimeout(() => {
                            eng.addParticle(new DataPacket(lb, servers[si], {
                                speed: 0.0015, color: COLORS.loadBalancer
                            }));
                        }, i * 400);
                    });
                }
            }
        },
        {
            title: 'Key Takeaways',
            description: 'Load balancers improve <strong>scalability</strong>, <strong>fault tolerance</strong>, and <strong>throughput</strong>. Algorithms include Round Robin, Least Connections, IP Hash, and Weighted. Used by services like <strong>Nginx</strong>, <strong>HAProxy</strong>, and cloud providers.',
            duration: 5000,
            setup: (eng) => {
                servers.forEach(s => { s.status = 'active'; s.highlight = true; s.load = 0.5; });
                lbConns.forEach(c => { c.visible = true; c.active = true; });
                lb.highlight = true;
            }
        }
    ]);
}
