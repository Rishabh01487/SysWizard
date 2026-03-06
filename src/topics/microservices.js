/**
 * Topic: Microservices Architecture
 */
import { ServerNode, ClientNode, GatewayNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'microservices',
    title: 'Microservices Architecture',
    icon: '🧩',
    description: 'Break a monolithic application into independently deployable services that communicate via APIs.',
    tags: ['Architecture', 'API', 'Scalability'],
    accentGrad: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const client = new ClientNode(cx - 350, cy, 'Client');
    const gateway = new GatewayNode(cx - 160, cy, 'API Gateway');
    engine.addEntity(client);
    engine.addEntity(gateway);

    const services = [
        { name: 'User Service', y: cy - 160, color: '#3b82f6' },
        { name: 'Order Service', y: cy - 40, color: '#10b981' },
        { name: 'Payment Service', y: cy + 80, color: '#f59e0b' },
        { name: 'Notification Service', y: cy + 200, color: '#ec4899' },
    ];

    const serviceNodes = services.map(s => {
        const node = new ServerNode(cx + 100, s.y, s.name);
        node.color = s.color;
        engine.addEntity(node);
        return node;
    });

    // Gateway connections
    engine.addConnection(new ArrowConnection(client, gateway, { color: 'rgba(249,115,22,0.2)', activeColor: COLORS.gateway }));
    serviceNodes.forEach(s => {
        engine.addConnection(new ArrowConnection(gateway, s, { color: 'rgba(249,115,22,0.15)', activeColor: COLORS.gateway }));
    });

    // Inter-service connections
    const interConns = [
        engine.addConnection(new ArrowConnection(serviceNodes[1], serviceNodes[0], { color: 'rgba(255,255,255,0.06)', activeColor: COLORS.client, dashed: true, label: 'getUserInfo' })),
        engine.addConnection(new ArrowConnection(serviceNodes[1], serviceNodes[2], { color: 'rgba(255,255,255,0.06)', activeColor: COLORS.warning, dashed: true, label: 'processPayment' })),
        engine.addConnection(new ArrowConnection(serviceNodes[2], serviceNodes[3], { color: 'rgba(255,255,255,0.06)', activeColor: COLORS.queue, dashed: true, label: 'sendReceipt' })),
    ];

    engine.setSteps([
        {
            title: 'Monolith vs Microservices',
            description: 'Instead of one large <strong>monolithic</strong> application, <strong>microservices</strong> split the system into small, independent services, each handling a specific business capability.',
            duration: 4500,
            setup: () => {
                serviceNodes.forEach(s => s.highlight = true);
                interConns.forEach(c => c.visible = false);
            }
        },
        {
            title: 'API Gateway',
            description: 'An <strong>API Gateway</strong> is the single entry point. It handles <strong>routing</strong>, <strong>authentication</strong>, <strong>rate limiting</strong>, and <strong>load balancing</strong> before forwarding requests to services.',
            duration: 4500,
            setup: () => {
                gateway.highlight = true;
                serviceNodes.forEach(s => s.highlight = false);
            },
            update: (eng, stepTime) => {
                if (stepTime > 800 && stepTime < 900) {
                    eng.addParticle(new DataPacket(client, gateway, {
                        speed: 0.002, color: COLORS.gateway, label: 'API Call',
                        onArrive: () => {
                            eng.addParticle(new DataPacket(gateway, serviceNodes[1], {
                                speed: 0.002, color: COLORS.success, label: 'Route'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Inter-Service Communication',
            description: 'Services communicate with each other via <strong>REST APIs</strong> or <strong>gRPC</strong>. For example, the Order Service calls the User Service to get user data and the Payment Service to process payment.',
            duration: 5500,
            setup: () => {
                interConns.forEach(c => c.visible = true);
                gateway.highlight = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 800 && stepTime < 900) {
                    eng.addParticle(new DataPacket(serviceNodes[1], serviceNodes[0], {
                        speed: 0.0015, color: '#3b82f6', label: 'getUser'
                    }));
                }
                if (stepTime > 2000 && stepTime < 2100) {
                    eng.addParticle(new DataPacket(serviceNodes[1], serviceNodes[2], {
                        speed: 0.0015, color: '#f59e0b', label: 'pay'
                    }));
                }
                if (stepTime > 3200 && stepTime < 3300) {
                    eng.addParticle(new DataPacket(serviceNodes[2], serviceNodes[3], {
                        speed: 0.0015, color: '#ec4899', label: 'notify'
                    }));
                }
            }
        },
        {
            title: 'Independent Deployment',
            description: 'Each service can be <strong>developed</strong>, <strong>deployed</strong>, and <strong>scaled independently</strong>. The Payment Service can scale to 10 instances while the Notification Service runs on 2.',
            duration: 4500,
            setup: () => {
                serviceNodes[2].highlight = true;
                serviceNodes[2].status = 'busy';
                serviceNodes[2].load = 0.8;
            }
        },
        {
            title: 'Key Takeaways',
            description: '<strong>Benefits</strong>: Independent scaling, technology diversity, fault isolation. <strong>Challenges</strong>: Distributed complexity, data consistency, network latency. Used by <strong>Netflix</strong>, <strong>Amazon</strong>, <strong>Uber</strong>.',
            duration: 4500,
            setup: () => {
                serviceNodes.forEach(s => { s.highlight = true; s.status = 'active'; s.load = 0.5; });
                gateway.highlight = true;
                interConns.forEach(c => c.visible = true);
            }
        }
    ]);
}
