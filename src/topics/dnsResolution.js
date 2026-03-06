/**
 * Topic: DNS Resolution
 */
import { ServerNode, ClientNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'dns-resolution',
    title: 'DNS Resolution',
    icon: '🌐',
    description: 'How domain names are translated into IP addresses through the DNS hierarchy.',
    tags: ['Networking', 'Internet', 'Domain Names'],
    accentGrad: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const client = new ClientNode(cx - 350, cy + 60, 'Your Browser');
    const resolver = new ServerNode(cx - 140, cy + 60, 'DNS Resolver');
    resolver.color = '#06b6d4';
    const root = new ServerNode(cx + 60, cy - 120, 'Root Server');
    root.color = '#ef4444';
    const tld = new ServerNode(cx + 220, cy - 40, 'TLD Server (.com)');
    tld.color = '#f59e0b';
    const auth = new ServerNode(cx + 220, cy + 120, 'Auth Nameserver');
    auth.color = '#10b981';
    const webServer = new ServerNode(cx + 60, cy + 200, 'Web Server');
    webServer.color = '#8b5cf6';

    [client, resolver, root, tld, auth, webServer].forEach(e => engine.addEntity(e));

    const c1 = engine.addConnection(new ArrowConnection(client, resolver, { color: 'rgba(6,182,212,0.2)', activeColor: '#06b6d4' }));
    const c2 = engine.addConnection(new ArrowConnection(resolver, root, { color: 'rgba(239,68,68,0.15)', activeColor: '#ef4444' }));
    const c3 = engine.addConnection(new ArrowConnection(resolver, tld, { color: 'rgba(245,158,11,0.15)', activeColor: '#f59e0b' }));
    const c4 = engine.addConnection(new ArrowConnection(resolver, auth, { color: 'rgba(16,185,129,0.15)', activeColor: '#10b981' }));
    const c5 = engine.addConnection(new ArrowConnection(client, webServer, { color: 'rgba(139,92,246,0.15)', activeColor: '#8b5cf6', dashed: true }));
    [c2, c3, c4, c5].forEach(c => c.visible = false);

    const urlLabel = new TextLabel(cx - 350, cy - 10, '🔍 www.example.com', {
        fontSize: 13, color: COLORS.client, bg: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)'
    });
    engine.addEntity(urlLabel);

    engine.setSteps([
        {
            title: 'What is DNS?',
            description: '<strong>DNS (Domain Name System)</strong> translates human-readable domain names (like www.example.com) into IP addresses (like 93.184.216.34) that computers use to communicate.',
            duration: 4500,
            setup: () => {
                resolver.highlight = true;
                [c2, c3, c4, c5].forEach(c => c.visible = false);
            }
        },
        {
            title: 'Step 1: Query DNS Resolver',
            description: 'Your browser asks the <strong>DNS Resolver</strong> (usually your ISP\'s) to find the IP address for www.example.com. The resolver checks its <strong>cache</strong> first.',
            duration: 4500,
            setup: () => {
                client.highlight = true;
                resolver.highlight = true;
                c1.active = true;
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    eng.addParticle(new DataPacket(client, resolver, {
                        speed: 0.0018, color: '#06b6d4', label: 'www.example.com?',
                        onArrive: () => { c1.active = false; }
                    }));
                }
            }
        },
        {
            title: 'Step 2: Ask Root Server',
            description: 'If not cached, the resolver asks a <strong>Root DNS Server</strong> (13 worldwide). The root server doesn\'t know the IP but knows which <strong>TLD server</strong> handles ".com".',
            duration: 5000,
            setup: () => {
                c2.visible = true;
                root.highlight = true;
                client.highlight = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 600 && stepTime < 700) {
                    eng.addParticle(new DataPacket(resolver, root, {
                        speed: 0.0018, color: '#ef4444', label: 'Who handles .com?',
                        onArrive: () => {
                            root.highlight = true;
                            eng.addParticle(new DataPacket(root, resolver, {
                                speed: 0.0018, color: '#ef4444', label: 'Ask .com TLD'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Step 3: Ask TLD Server',
            description: 'The resolver asks the <strong>.com TLD Server</strong>. It knows the <strong>authoritative nameserver</strong> for example.com and returns its address.',
            duration: 5000,
            setup: () => {
                c3.visible = true;
                tld.highlight = true;
                root.highlight = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 600 && stepTime < 700) {
                    eng.addParticle(new DataPacket(resolver, tld, {
                        speed: 0.0018, color: '#f59e0b', label: 'example.com NS?',
                        onArrive: () => {
                            eng.addParticle(new DataPacket(tld, resolver, {
                                speed: 0.0018, color: '#f59e0b', label: 'NS: ns1.example.com'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Step 4: Get IP from Authoritative Server',
            description: 'The resolver queries the <strong>authoritative nameserver</strong> for example.com. It returns the actual <strong>IP address: 93.184.216.34</strong>.',
            duration: 5000,
            setup: () => {
                c4.visible = true;
                auth.highlight = true;
                tld.highlight = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 600 && stepTime < 700) {
                    eng.addParticle(new DataPacket(resolver, auth, {
                        speed: 0.0018, color: '#10b981', label: 'IP for example.com?',
                        onArrive: () => {
                            eng.addParticle(new DataPacket(auth, resolver, {
                                speed: 0.0018, color: '#10b981', label: 'IP: 93.184.216.34'
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Step 5: Connect to Web Server',
            description: 'The resolver returns the IP to your browser. Your browser then connects to the <strong>web server</strong> at 93.184.216.34 and loads the website. The result is <strong>cached</strong> for future queries.',
            duration: 5000,
            setup: () => {
                c5.visible = true;
                webServer.highlight = true;
                auth.highlight = false;
                client.highlight = true;
            },
            update: (eng, stepTime) => {
                if (stepTime > 800 && stepTime < 900) {
                    eng.addParticle(new DataPacket(client, webServer, {
                        speed: 0.0012, color: '#8b5cf6', label: 'HTTP Request'
                    }));
                }
            }
        }
    ]);
}
