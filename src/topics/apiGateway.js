/**
 * Topic: API Gateway
 */
import { ServerNode, ClientNode, GatewayNode, CacheNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'api-gateway',
    title: 'API Gateway',
    icon: '🛡️',
    description: 'A single entry point that handles routing, authentication, rate limiting, and more for microservices.',
    tags: ['Architecture', 'Security', 'Routing'],
    accentGrad: 'linear-gradient(135deg, #f97316, #ef4444)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const clients = [];
    for (let i = 0; i < 3; i++) {
        const c = new ClientNode(cx - 350, cy - 100 + i * 100, ['Mobile App', 'Web App', 'Third Party'][i]);
        engine.addEntity(c);
        clients.push(c);
    }

    const gateway = new GatewayNode(cx - 80, cy, 'API Gateway');
    engine.addEntity(gateway);

    const rateLimit = new CacheNode(cx - 80, cy - 120, 'Rate Limiter');
    rateLimit.color = '#ef4444';
    engine.addEntity(rateLimit);

    const services = [
        new ServerNode(cx + 200, cy - 120, 'Auth Service'),
        new ServerNode(cx + 200, cy, 'User Service'),
        new ServerNode(cx + 200, cy + 120, 'Product Service'),
    ];
    services[0].color = '#ef4444';
    services[1].color = '#3b82f6';
    services[2].color = '#10b981';
    services.forEach(s => engine.addEntity(s));

    clients.forEach(c => {
        engine.addConnection(new ArrowConnection(c, gateway, { color: 'rgba(249,115,22,0.15)', activeColor: COLORS.gateway }));
    });
    services.forEach(s => {
        engine.addConnection(new ArrowConnection(gateway, s, { color: 'rgba(249,115,22,0.15)', activeColor: COLORS.gateway }));
    });
    engine.addConnection(new ArrowConnection(gateway, rateLimit, { color: 'rgba(239,68,68,0.15)', activeColor: COLORS.error, dashed: true }));

    engine.setSteps([
        {
            title: 'What is an API Gateway?',
            description: 'An <strong>API Gateway</strong> is a single entry point for all client requests. It handles <strong>routing</strong>, <strong>authentication</strong>, <strong>rate limiting</strong>, and <strong>load balancing</strong> before forwarding to backend services.',
            duration: 4500,
            setup: () => {
                gateway.highlight = true;
                rateLimit.visible = false;
            }
        },
        {
            title: 'Authentication & Authorization',
            description: 'The gateway <strong>validates tokens</strong> (JWT, OAuth) before forwarding requests. Unauthorized requests are <strong>rejected</strong> at the gateway level, protecting backend services.',
            duration: 5000,
            setup: () => {
                services[0].highlight = true;
                rateLimit.visible = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 600 && stepTime < 700) {
                    eng.addParticle(new DataPacket(clients[0], gateway, {
                        speed: 0.002, color: COLORS.gateway, label: 'JWT Token',
                        onArrive: () => {
                            eng.addParticle(new DataPacket(gateway, services[0], {
                                speed: 0.002, color: '#ef4444', label: 'Verify'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Request Routing',
            description: 'The gateway routes requests to the <strong>correct service</strong> based on the URL path. <code>/users/*</code> → User Service, <code>/products/*</code> → Product Service.',
            duration: 5000,
            setup: () => {
                services.forEach(s => s.highlight = false);
                services[0].highlight = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    eng.addParticle(new DataPacket(clients[1], gateway, {
                        speed: 0.002, color: COLORS.gateway, label: '/users/123',
                        onArrive: () => {
                            services[1].highlight = true;
                            eng.addParticle(new DataPacket(gateway, services[1], {
                                speed: 0.002, color: '#3b82f6', label: 'Route'
                            }));
                        }
                    }));
                }
                if (stepTime > 2000 && stepTime < 2100) {
                    eng.addParticle(new DataPacket(clients[2], gateway, {
                        speed: 0.002, color: COLORS.gateway, label: '/products',
                        onArrive: () => {
                            services[2].highlight = true;
                            eng.addParticle(new DataPacket(gateway, services[2], {
                                speed: 0.002, color: '#10b981', label: 'Route'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Rate Limiting',
            description: 'The gateway enforces <strong>rate limits</strong> — if a client sends too many requests, additional requests are <strong>rejected (429 Too Many Requests)</strong>. This prevents abuse and protects backend services.',
            duration: 5000,
            setup: () => {
                rateLimit.visible = true;
                rateLimit.highlight = true;
                services.forEach(s => s.highlight = false);
            },
            update: (eng, stepTime) => {
                if (stepTime > 600 && stepTime < 700) {
                    rateLimit.flash(COLORS.error);
                }
            }
        },
        {
            title: 'Key Takeaways',
            description: 'API Gateways provide <strong>centralized security</strong>, <strong>routing</strong>, <strong>rate limiting</strong>, <strong>logging</strong>, and <strong>response caching</strong>. Tools: <strong>Kong</strong>, <strong>AWS API Gateway</strong>, <strong>Nginx</strong>, <strong>Traefik</strong>.',
            duration: 4500,
            setup: () => {
                gateway.highlight = true;
                services.forEach(s => s.highlight = true);
                rateLimit.visible = true;
                rateLimit.highlight = true;
            }
        }
    ]);
}
