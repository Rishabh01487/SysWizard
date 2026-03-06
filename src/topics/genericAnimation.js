/**
 * Generic Animation Generator
 * Creates automated visual diagrams for topics without custom animation modules.
 * Uses the topic's content data (howItWorks, keyConcepts) to generate
 * step-by-step animated visualizations with entities, connections, and labels.
 */
import {
    ServerNode, ClientNode, DatabaseNode, CacheNode, LoadBalancerNode,
    ArrowConnection, DataPacket, TextLabel, COLORS
} from '../engine/entities.js';

// Visual layout templates based on topic patterns
const LAYOUT_PATTERNS = {
    'client-server': { type: 'flow', icons: ['client', 'server'], flow: 'horizontal' },
    'http-rest-apis': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'vertical-horizontal-scaling': { type: 'scaling', icons: ['server'], flow: 'compare' },
    'latency-throughput': { type: 'metrics', icons: ['client', 'server'], flow: 'horizontal' },
    'proxies': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'database-indexing': { type: 'data', icons: ['database'], flow: 'vertical' },
    'sql-nosql': { type: 'compare', icons: ['database', 'database'], flow: 'compare' },
    'networking-basics': { type: 'network', icons: ['client', 'server'], flow: 'horizontal' },
    'acid-transactions': { type: 'data', icons: ['database'], flow: 'vertical' },
    'data-serialization': { type: 'flow', icons: ['client', 'server'], flow: 'horizontal' },
    'cdn': { type: 'distributed', icons: ['client', 'cache', 'server'], flow: 'tree' },
    'api-gateway': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'rate-limiting': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'database-sharding': { type: 'distributed', icons: ['database'], flow: 'tree' },
    'database-replication': { type: 'distributed', icons: ['database'], flow: 'tree' },
    'message-queues': { type: 'flow', icons: ['client', 'cache', 'server'], flow: 'horizontal' },
    'reverse-proxy': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'websockets': { type: 'flow', icons: ['client', 'server'], flow: 'bidirectional' },
    'grpc-protobuf': { type: 'flow', icons: ['client', 'server'], flow: 'bidirectional' },
    'graphql': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'api-design': { type: 'flow', icons: ['client', 'server'], flow: 'horizontal' },
    'oauth-jwt': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'encryption-tls': { type: 'flow', icons: ['client', 'server'], flow: 'bidirectional' },
    'ddos-protection': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'cap-theorem': { type: 'triangle', icons: ['server'], flow: 'triangle' },
    'consensus': { type: 'distributed', icons: ['server'], flow: 'ring' },
    'consistent-hashing': { type: 'distributed', icons: ['server'], flow: 'ring' },
    'event-driven': { type: 'flow', icons: ['client', 'cache', 'server'], flow: 'horizontal' },
    'distributed-transactions': { type: 'distributed', icons: ['server', 'database'], flow: 'tree' },
    'leader-election': { type: 'distributed', icons: ['server'], flow: 'ring' },
    'microservices': { type: 'distributed', icons: ['server'], flow: 'tree' },
    'cqrs': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'saga-pattern': { type: 'flow', icons: ['server'], flow: 'chain' },
    'circuit-breaker': { type: 'flow', icons: ['client', 'loadbalancer', 'server'], flow: 'horizontal' },
    'service-mesh': { type: 'distributed', icons: ['server'], flow: 'mesh' },
    'blob-storage': { type: 'data', icons: ['client', 'database'], flow: 'horizontal' },
    'data-lakes': { type: 'data', icons: ['database'], flow: 'tree' },
    'time-series-db': { type: 'data', icons: ['client', 'database'], flow: 'horizontal' },
    'data-partitioning': { type: 'distributed', icons: ['database'], flow: 'tree' },
    'logging': { type: 'flow', icons: ['server', 'database'], flow: 'horizontal' },
    'metrics-alerting': { type: 'flow', icons: ['server', 'database'], flow: 'horizontal' },
    'distributed-tracing': { type: 'flow', icons: ['server'], flow: 'chain' },
    'chaos-engineering': { type: 'distributed', icons: ['server'], flow: 'mesh' },
    'url-shortener': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'chat-system': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'bidirectional' },
    'notification-system': { type: 'flow', icons: ['server', 'cache', 'client'], flow: 'horizontal' },
    'news-feed': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'search-engine': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'video-streaming': { type: 'flow', icons: ['client', 'cache', 'server'], flow: 'horizontal' },
    'ride-sharing': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'payment-system': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'e-commerce': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'social-media': { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' },
    'system-design-process': { type: 'flow', icons: ['client', 'server'], flow: 'chain' },
};

function createEntity(type, x, y, label) {
    switch (type) {
        case 'client': return new ClientNode(x, y, label || 'Client');
        case 'server': return new ServerNode(x, y, label || 'Server');
        case 'database': return new DatabaseNode(x, y, label || 'Database');
        case 'cache': return new CacheNode(x, y, label || 'Cache');
        case 'loadbalancer': return new LoadBalancerNode(x, y, label || 'Gateway');
        default: return new ServerNode(x, y, label || 'Node');
    }
}

/**
 * Sets up a generic animation for any topic
 */
export function setupGenericAnimation(engine, topic) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;
    const content = topic.content || {};
    const howItWorks = content.howItWorks || [];
    const keyConcepts = content.keyConcepts || [];
    const layout = LAYOUT_PATTERNS[topic.id] || { type: 'flow', icons: ['client', 'server', 'database'], flow: 'horizontal' };

    const entities = [];
    const connections = [];
    const labels = [];

    // --- Create entities based on layout ---
    if (layout.flow === 'horizontal' || layout.flow === 'bidirectional') {
        const count = layout.icons.length;
        const spacing = Math.min(300, (engine.width - 200) / (count));
        const startX = cx - ((count - 1) * spacing) / 2;

        layout.icons.forEach((icon, i) => {
            const entityLabel = getEntityLabel(topic, icon, i);
            const e = createEntity(icon, startX + i * spacing, cy, entityLabel);
            engine.addEntity(e);
            entities.push(e);
        });

        // Connect sequentially
        for (let i = 0; i < entities.length - 1; i++) {
            const conn = new ArrowConnection(entities[i], entities[i + 1], {
                color: 'rgba(168,85,247,0.15)', activeColor: COLORS.accent
            });
            engine.addConnection(conn);
            connections.push(conn);

            if (layout.flow === 'bidirectional') {
                const backConn = new ArrowConnection(entities[i + 1], entities[i], {
                    color: 'rgba(59,130,246,0.15)', activeColor: COLORS.server
                });
                engine.addConnection(backConn);
                connections.push(backConn);
            }
        }
    } else if (layout.flow === 'tree' || layout.flow === 'mesh') {
        // Central node + surrounding nodes
        const centerEntity = createEntity(layout.icons[0], cx, cy - 30, getEntityLabel(topic, layout.icons[0], 0));
        engine.addEntity(centerEntity);
        entities.push(centerEntity);

        const surroundCount = 4;
        const radius = Math.min(200, engine.width / 4);
        for (let i = 0; i < surroundCount; i++) {
            const angle = (i / surroundCount) * Math.PI * 2 - Math.PI / 2;
            const sx = cx + Math.cos(angle) * radius;
            const sy = cy - 30 + Math.sin(angle) * radius;
            const icon = layout.icons[Math.min(i, layout.icons.length - 1)];
            const e = createEntity(icon, sx, sy, `Node ${i + 1}`);
            engine.addEntity(e);
            entities.push(e);
            const conn = new ArrowConnection(centerEntity, e, {
                color: 'rgba(168,85,247,0.15)', activeColor: COLORS.accent
            });
            engine.addConnection(conn);
            connections.push(conn);
        }

        if (layout.flow === 'mesh') {
            for (let i = 1; i < entities.length; i++) {
                const next = i < entities.length - 1 ? i + 1 : 1;
                const conn = new ArrowConnection(entities[i], entities[next], {
                    color: 'rgba(59,130,246,0.1)', activeColor: COLORS.server
                });
                engine.addConnection(conn);
                connections.push(conn);
            }
        }
    } else if (layout.flow === 'ring') {
        const nodeCount = 5;
        const radius = Math.min(180, engine.width / 4);
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
            const nx = cx + Math.cos(angle) * radius;
            const ny = cy - 20 + Math.sin(angle) * radius;
            const e = createEntity(layout.icons[0], nx, ny, `Node ${i + 1}`);
            engine.addEntity(e);
            entities.push(e);
        }
        for (let i = 0; i < entities.length; i++) {
            const next = (i + 1) % entities.length;
            const conn = new ArrowConnection(entities[i], entities[next], {
                color: 'rgba(168,85,247,0.15)', activeColor: COLORS.accent
            });
            engine.addConnection(conn);
            connections.push(conn);
        }
    } else if (layout.flow === 'compare') {
        // Two side-by-side groups
        const leftEntity = createEntity(layout.icons[0], cx - 180, cy, 'Option A');
        const rightEntity = createEntity(layout.icons[Math.min(1, layout.icons.length - 1)], cx + 180, cy, 'Option B');
        engine.addEntity(leftEntity);
        engine.addEntity(rightEntity);
        entities.push(leftEntity, rightEntity);
    } else if (layout.flow === 'triangle') {
        const radius = Math.min(160, engine.width / 5);
        const triPoints = [
            { x: cx, y: cy - radius, label: 'Consistency' },
            { x: cx - radius, y: cy + radius * 0.7, label: 'Availability' },
            { x: cx + radius, y: cy + radius * 0.7, label: 'Partition Tol.' }
        ];
        triPoints.forEach((p, i) => {
            const e = createEntity('server', p.x, p.y, p.label);
            engine.addEntity(e);
            entities.push(e);
        });
        for (let i = 0; i < 3; i++) {
            const conn = new ArrowConnection(entities[i], entities[(i + 1) % 3], {
                color: 'rgba(168,85,247,0.2)', activeColor: COLORS.accent
            });
            engine.addConnection(conn);
            connections.push(conn);
        }
    } else if (layout.flow === 'chain') {
        const chainLen = Math.min(howItWorks.length, 5);
        const spacing = Math.min(200, (engine.width - 200) / chainLen);
        const startX = cx - ((chainLen - 1) * spacing) / 2;
        for (let i = 0; i < chainLen; i++) {
            const e = createEntity('server', startX + i * spacing, cy, `Step ${i + 1}`);
            engine.addEntity(e);
            entities.push(e);
        }
        for (let i = 0; i < entities.length - 1; i++) {
            const conn = new ArrowConnection(entities[i], entities[i + 1], {
                color: 'rgba(245,158,11,0.15)', activeColor: COLORS.warning
            });
            engine.addConnection(conn);
            connections.push(conn);
        }
    }

    // --- Title label ---
    const titleLabel = new TextLabel(cx, 35, `${topic.icon} ${topic.title}`, {
        fontSize: 16, color: '#f4f0ff', bg: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)'
    });
    engine.addEntity(titleLabel);

    // --- Build steps from howItWorks ---
    const steps = [];

    // Step 0: Overview
    steps.push({
        title: 'Overview',
        description: content.overview || topic.description || 'Loading...',
        duration: 5000,
        setup: () => {
            entities.forEach(e => { e.highlight = true; });
            connections.forEach(c => { c.active = false; });
        }
    });

    // Steps from howItWorks
    howItWorks.forEach((step, i) => {
        steps.push({
            title: `Step ${i + 1}`,
            description: step,
            duration: 4500,
            setup: () => {
                entities.forEach(e => { e.highlight = false; });
                connections.forEach(c => { c.active = false; });

                // Highlight relevant entities for this step
                if (entities.length > 0) {
                    const primaryIdx = i % entities.length;
                    const secondaryIdx = (i + 1) % entities.length;
                    entities[primaryIdx].highlight = true;
                    if (entities[secondaryIdx] !== entities[primaryIdx]) {
                        entities[secondaryIdx].highlight = true;
                    }
                    // Activate connection
                    if (connections.length > 0) {
                        connections[Math.min(i, connections.length - 1)].active = true;
                    }
                }
            },
            update: (eng, stepTime) => {
                // Send data packets at intervals
                if (entities.length >= 2 && stepTime > 500 && stepTime < 600) {
                    const fromIdx = i % entities.length;
                    let toIdx = (i + 1) % entities.length;
                    if (fromIdx === toIdx && entities.length > 1) toIdx = (toIdx + 1) % entities.length;
                    eng.addParticle(new DataPacket(entities[fromIdx], entities[toIdx], {
                        speed: 0.0012, color: COLORS.accent, label: `${i + 1}`
                    }));
                }
            }
        });
    });

    // Key Concepts step
    if (keyConcepts.length > 0) {
        steps.push({
            title: 'Key Concepts',
            description: keyConcepts.slice(0, 4).join(' • '),
            duration: 5000,
            setup: () => {
                entities.forEach(e => { e.highlight = true; });
                connections.forEach(c => { c.active = true; });
            }
        });
    }

    // Tradeoffs step
    if (content.tradeoffs) {
        const pros = (content.tradeoffs.pros || []).slice(0, 2).join(', ');
        const cons = (content.tradeoffs.cons || []).slice(0, 2).join(', ');
        steps.push({
            title: 'Trade-offs',
            description: `✅ ${pros} ❌ ${cons}`,
            duration: 4000,
            setup: () => {
                entities.forEach((e, i) => { e.highlight = i % 2 === 0; });
                connections.forEach(c => { c.active = false; });
            }
        });
    }

    // Summary step
    steps.push({
        title: 'Summary',
        description: content.realWorld || topic.description,
        duration: 5000,
        setup: () => {
            entities.forEach(e => { e.highlight = true; });
            connections.forEach(c => { c.active = true; });
        }
    });

    engine.setSteps(steps);
}

function getEntityLabel(topic, iconType, index) {
    const id = topic.id || '';
    // Try to derive meaningful labels from topic context
    const labelMap = {
        'client-server': ['Browser', 'Web Server'],
        'http-rest-apis': ['Client App', 'REST API', 'Database'],
        'vertical-horizontal-scaling': ['Single Server', 'Server Cluster'],
        'latency-throughput': ['User', 'Server'],
        'proxies': ['Client', 'Proxy', 'Origin Server'],
        'database-indexing': ['Query', 'B-Tree Index', 'Data Store'],
        'sql-nosql': ['SQL DB', 'NoSQL DB'],
        'networking-basics': ['Source', 'Destination'],
        'acid-transactions': ['Transaction', 'DB Engine', 'Commit Log'],
        'data-serialization': ['Producer', 'Serializer', 'Consumer'],
        'cdn': ['User', 'CDN Edge', 'Origin'],
        'api-gateway': ['Mobile App', 'API Gateway', 'Microservice'],
        'rate-limiting': ['Client', 'Rate Limiter', 'API'],
        'database-sharding': ['Router', 'Shard 1', 'Shard 2'],
        'database-replication': ['Primary DB', 'Replica 1', 'Replica 2'],
        'message-queues': ['Producer', 'Queue', 'Consumer'],
        'reverse-proxy': ['Client', 'Reverse Proxy', 'Backend'],
        'websockets': ['Browser', 'WebSocket Server'],
        'grpc-protobuf': ['gRPC Client', 'gRPC Server'],
        'graphql': ['Client', 'GraphQL API', 'Data Sources'],
        'api-design': ['Consumer', 'API Endpoint'],
        'oauth-jwt': ['User', 'Auth Server', 'Resource'],
        'encryption-tls': ['Client', 'TLS Server'],
        'ddos-protection': ['Attacker', 'WAF / Shield', 'Server'],
        'cap-theorem': ['Consistency', 'Availability', 'Partition Tol.'],
        'consensus': ['Leader', 'Follower 1', 'Follower 2'],
        'event-driven': ['Event Source', 'Event Bus', 'Handler'],
        'distributed-transactions': ['Coordinator', 'Service A', 'Service B'],
        'leader-election': ['Candidate 1', 'Candidate 2', 'Voter'],
        'microservices': ['API GW', 'Service A', 'Service B'],
        'cqrs': ['Client', 'Write Model', 'Read Model'],
        'saga-pattern': ['Step 1', 'Step 2', 'Step 3'],
        'circuit-breaker': ['Client', 'Circuit Breaker', 'Service'],
        'service-mesh': ['Proxy', 'Service A', 'Service B'],
        'blob-storage': ['App', 'Blob Store'],
        'data-lakes': ['Ingestion', 'Data Lake', 'Analytics'],
        'time-series-db': ['Sensors', 'TSDB'],
        'data-partitioning': ['Router', 'Partition 1', 'Partition 2'],
        'logging': ['App', 'Log Aggregator', 'Dashboard'],
        'metrics-alerting': ['Service', 'Monitoring', 'Alert'],
        'distributed-tracing': ['Span 1', 'Span 2', 'Span 3'],
        'chaos-engineering': ['Chaos Agent', 'Target', 'Monitor'],
        'url-shortener': ['User', 'Shortener API', 'URL Database'],
        'chat-system': ['User A', 'Chat Server', 'User B'],
        'notification-system': ['Events', 'Notification Svc', 'User Device'],
        'news-feed': ['User', 'Feed Service', 'Post DB'],
        'search-engine': ['Query', 'Search Index', 'Results'],
        'video-streaming': ['Viewer', 'CDN / Edge', 'Transcoder'],
        'ride-sharing': ['Rider', 'Matching Svc', 'Driver'],
        'payment-system': ['Buyer', 'Payment GW', 'Bank'],
        'e-commerce': ['Shopper', 'Store API', 'Inventory'],
        'social-media': ['User', 'Feed Svc', 'Content DB'],
        'system-design-process': ['Requirements', 'Design', 'Scale'],
    };
    const topicLabels = labelMap[id];
    if (topicLabels && topicLabels[index] !== undefined) return topicLabels[index];
    // Fallback
    switch (iconType) {
        case 'client': return 'Client';
        case 'server': return 'Server';
        case 'database': return 'Database';
        case 'cache': return 'Cache';
        case 'loadbalancer': return 'Gateway';
        default: return `Node ${index + 1}`;
    }
}
