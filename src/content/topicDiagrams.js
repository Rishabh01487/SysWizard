/**
 * Topic Diagram Generator
 * Creates inline SVG architecture diagrams for the Learn tab content.
 * Each topic gets a visual flow diagram showing its architecture.
 */

const DIAGRAM_COLORS = {
    bg: '#1a1230',
    nodeFill: '#2a1f4e',
    nodeStroke: '#7c3aed',
    nodeText: '#e2d4f0',
    arrow: '#a855f7',
    arrowHead: '#c084fc',
    label: '#f4f0ff',
    highlight: '#f59e0b',
    client: '#22d3ee',
    server: '#3b82f6',
    database: '#8b5cf6',
    cache: '#10b981',
    gateway: '#f59e0b',
    queue: '#ec4899',
};

/**
 * Generates an SVG architecture diagram for a topic
 */
export function generateTopicDiagram(topicId, title) {
    const diagram = TOPIC_DIAGRAMS[topicId];
    if (!diagram) return generateGenericDiagram(topicId, title);
    return renderDiagram(diagram, title);
}

function renderDiagram(diagram, title) {
    const { nodes, arrows, annotations } = diagram;
    const w = 700, h = 300;

    let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px;border-radius:12px;background:${DIAGRAM_COLORS.bg};border:1px solid rgba(168,85,247,0.15);">`;

    // Grid pattern
    svg += `<defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(168,85,247,0.04)" stroke-width="0.5"/>
        </pattern>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="${DIAGRAM_COLORS.arrowHead}"/>
        </marker>
        <marker id="arrowhead-highlight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="${DIAGRAM_COLORS.highlight}"/>
        </marker>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
    </defs>`;
    svg += `<rect width="${w}" height="${h}" fill="url(#grid)"/>`;

    // Draw arrows first (behind nodes)
    (arrows || []).forEach(a => {
        const from = nodes.find(n => n.id === a.from);
        const to = nodes.find(n => n.id === a.to);
        if (!from || !to) return;
        const color = a.highlight ? DIAGRAM_COLORS.highlight : DIAGRAM_COLORS.arrow;
        const marker = a.highlight ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)';
        const opacity = a.highlight ? 0.9 : 0.5;

        // Calculate adjusted positions
        const fx = from.x + (from.w || 90) / 2;
        const fy = from.y + (from.h || 50) / 2;
        const tx = to.x + (to.w || 90) / 2;
        const ty = to.y + (to.h || 50) / 2;

        // Offset start/end to avoid overlapping nodes
        const dx = tx - fx, dy = ty - fy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const startOff = 45, endOff = 50;
        const sx = fx + (dx / dist) * startOff;
        const sy = fy + (dy / dist) * startOff;
        const ex = tx - (dx / dist) * endOff;
        const ey = ty - (dy / dist) * endOff;

        svg += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="2" stroke-opacity="${opacity}" marker-end="${marker}" stroke-dasharray="${a.dashed ? '6,4' : 'none'}"/>`;

        if (a.label) {
            const mx = (sx + ex) / 2, my = (sy + ey) / 2 - 8;
            svg += `<text x="${mx}" y="${my}" text-anchor="middle" fill="${color}" font-size="10" font-family="Inter,sans-serif" opacity="0.9">${a.label}</text>`;
        }
    });

    // Draw nodes
    nodes.forEach(n => {
        const nw = n.w || 90, nh = n.h || 50;
        const color = DIAGRAM_COLORS[n.type] || DIAGRAM_COLORS.nodeStroke;
        const glowColor = color + '40';

        // Glow
        svg += `<rect x="${n.x}" y="${n.y}" width="${nw}" height="${nh}" rx="8" fill="${glowColor}" filter="url(#glow)" opacity="0.3"/>`;
        // Node body
        svg += `<rect x="${n.x}" y="${n.y}" width="${nw}" height="${nh}" rx="8" fill="${DIAGRAM_COLORS.nodeFill}" stroke="${color}" stroke-width="1.5" opacity="0.95"/>`;
        // Icon
        if (n.icon) {
            svg += `<text x="${n.x + nw / 2}" y="${n.y + 20}" text-anchor="middle" font-size="16">${n.icon}</text>`;
        }
        // Label
        svg += `<text x="${n.x + nw / 2}" y="${n.y + (n.icon ? 38 : 30)}" text-anchor="middle" fill="${DIAGRAM_COLORS.nodeText}" font-size="11" font-family="Inter,sans-serif" font-weight="600">${n.label}</text>`;
    });

    // Draw annotations
    (annotations || []).forEach(a => {
        svg += `<text x="${a.x}" y="${a.y}" text-anchor="${a.align || 'middle'}" fill="${a.color || DIAGRAM_COLORS.label}" font-size="${a.size || 11}" font-family="Inter,sans-serif" opacity="${a.opacity || 0.7}" font-style="${a.italic ? 'italic' : 'normal'}">${a.text}</text>`;
    });

    svg += '</svg>';
    return svg;
}

function generateGenericDiagram(topicId, title) {
    // Generate a simple 3-node flow diagram for topics without custom diagrams
    return renderDiagram({
        nodes: [
            { id: 'a', x: 60, y: 120, label: 'Input', icon: '📥', type: 'client' },
            { id: 'b', x: 300, y: 120, label: 'Process', icon: '⚙️', type: 'server' },
            { id: 'c', x: 540, y: 120, label: 'Output', icon: '📤', type: 'database' },
        ],
        arrows: [
            { from: 'a', to: 'b', label: 'Request' },
            { from: 'b', to: 'c', label: 'Result' },
        ],
        annotations: [
            { x: 350, y: 30, text: `📊 ${title}`, size: 14, opacity: 0.9 }
        ]
    }, title);
}

// Pre-defined architecture diagrams for important topics
const TOPIC_DIAGRAMS = {
    'client-server': {
        nodes: [
            { id: 'browser', x: 50, y: 60, w: 100, h: 55, label: 'Browser', icon: '🖥️', type: 'client' },
            { id: 'mobile', x: 50, y: 170, w: 100, h: 55, label: 'Mobile App', icon: '📱', type: 'client' },
            { id: 'internet', x: 280, y: 115, w: 100, h: 55, label: 'Internet', icon: '🌐', type: 'gateway' },
            { id: 'server', x: 500, y: 60, w: 100, h: 55, label: 'Web Server', icon: '🖧', type: 'server' },
            { id: 'db', x: 500, y: 170, w: 100, h: 55, label: 'Database', icon: '🗄️', type: 'database' },
        ],
        arrows: [
            { from: 'browser', to: 'internet', label: 'HTTP Request' },
            { from: 'mobile', to: 'internet', label: 'API Call' },
            { from: 'internet', to: 'server', label: 'Route', highlight: true },
            { from: 'server', to: 'db', label: 'Query', dashed: true },
        ],
        annotations: [
            { x: 350, y: 25, text: '📊 Client-Server Architecture', size: 13, opacity: 0.9 },
            { x: 350, y: 280, text: 'Clients send requests → Server processes → Database stores', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'http-rest-apis': {
        nodes: [
            { id: 'client', x: 40, y: 115, w: 100, h: 55, label: 'Client', icon: '📱', type: 'client' },
            { id: 'get', x: 210, y: 40, w: 80, h: 45, label: 'GET', icon: '📖', type: 'cache' },
            { id: 'post', x: 210, y: 110, w: 80, h: 45, label: 'POST', icon: '✏️', type: 'highlight' },
            { id: 'put', x: 210, y: 180, w: 80, h: 45, label: 'PUT', icon: '🔄', type: 'gateway' },
            { id: 'del', x: 210, y: 247, w: 80, h: 45, label: 'DELETE', icon: '🗑️', type: 'queue' },
            { id: 'server', x: 380, y: 115, w: 100, h: 55, label: 'REST API', icon: '⚙️', type: 'server' },
            { id: 'db', x: 560, y: 115, w: 100, h: 55, label: 'Database', icon: '🗄️', type: 'database' },
        ],
        arrows: [
            { from: 'client', to: 'get', label: '' },
            { from: 'client', to: 'post', label: '', highlight: true },
            { from: 'client', to: 'put', label: '' },
            { from: 'client', to: 'del', label: '' },
            { from: 'get', to: 'server', label: '200 OK' },
            { from: 'post', to: 'server', label: '201', highlight: true },
            { from: 'server', to: 'db', label: 'CRUD' },
        ],
        annotations: [
            { x: 350, y: 25, text: '📊 REST API Methods', size: 13, opacity: 0.9 },
        ]
    },
    'vertical-horizontal-scaling': {
        nodes: [
            { id: 'user', x: 280, y: 20, w: 100, h: 50, label: 'Users', icon: '👥', type: 'client' },
            { id: 'vert', x: 60, y: 140, w: 120, h: 60, label: 'Scale UP ↑', icon: '🖥️', type: 'server' },
            { id: 'hz1', x: 380, y: 110, w: 80, h: 50, label: 'Server 1', icon: '🖥️', type: 'server' },
            { id: 'hz2', x: 500, y: 110, w: 80, h: 50, label: 'Server 2', icon: '🖥️', type: 'cache' },
            { id: 'hz3', x: 440, y: 200, w: 80, h: 50, label: 'Server 3', icon: '🖥️', type: 'gateway' },
        ],
        arrows: [
            { from: 'user', to: 'vert', label: 'Bigger Machine' },
            { from: 'user', to: 'hz1', label: 'More Machines', highlight: true },
            { from: 'user', to: 'hz2', label: '' },
            { from: 'user', to: 'hz3', label: '' },
        ],
        annotations: [
            { x: 350, y: 17, text: '📊 Vertical vs Horizontal Scaling', size: 13, opacity: 0.9 },
            { x: 120, y: 230, text: '💰 More CPU/RAM', size: 10, opacity: 0.5, italic: true },
            { x: 480, y: 275, text: '📈 Add more servers', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'load-balancing': {
        nodes: [
            { id: 'c1', x: 30, y: 50, w: 80, h: 45, label: 'Client 1', icon: '🖥️', type: 'client' },
            { id: 'c2', x: 30, y: 130, w: 80, h: 45, label: 'Client 2', icon: '📱', type: 'client' },
            { id: 'c3', x: 30, y: 210, w: 80, h: 45, label: 'Client 3', icon: '💻', type: 'client' },
            { id: 'lb', x: 260, y: 120, w: 110, h: 55, label: 'Load Balancer', icon: '⚖️', type: 'gateway' },
            { id: 's1', x: 510, y: 30, w: 80, h: 45, label: 'Server 1', icon: '🖧', type: 'server' },
            { id: 's2', x: 510, y: 120, w: 80, h: 45, label: 'Server 2', icon: '🖧', type: 'server' },
            { id: 's3', x: 510, y: 210, w: 80, h: 45, label: 'Server 3', icon: '🖧', type: 'server' },
        ],
        arrows: [
            { from: 'c1', to: 'lb', label: '' },
            { from: 'c2', to: 'lb', label: 'Requests', highlight: true },
            { from: 'c3', to: 'lb', label: '' },
            { from: 'lb', to: 's1', label: 'Round Robin' },
            { from: 'lb', to: 's2', label: '' },
            { from: 'lb', to: 's3', label: '' },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Load Balancer Architecture', size: 13, opacity: 0.9 },
        ]
    },
    'caching': {
        nodes: [
            { id: 'app', x: 50, y: 120, w: 90, h: 55, label: 'App Server', icon: '⚙️', type: 'server' },
            { id: 'cache', x: 280, y: 50, w: 100, h: 55, label: 'Redis Cache', icon: '⚡', type: 'cache' },
            { id: 'db', x: 280, y: 195, w: 100, h: 55, label: 'Database', icon: '🗄️', type: 'database' },
            { id: 'user', x: 530, y: 120, w: 90, h: 55, label: 'Response', icon: '📤', type: 'client' },
        ],
        arrows: [
            { from: 'app', to: 'cache', label: 'Check Cache', highlight: true },
            { from: 'cache', to: 'user', label: 'Cache HIT ✅' },
            { from: 'app', to: 'db', label: 'Cache MISS ❌', dashed: true },
            { from: 'db', to: 'cache', label: 'Update Cache', dashed: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Caching Strategy', size: 13, opacity: 0.9 },
        ]
    },
    'dns-resolution': {
        nodes: [
            { id: 'browser', x: 30, y: 120, w: 90, h: 50, label: 'Browser', icon: '🖥️', type: 'client' },
            { id: 'resolver', x: 180, y: 120, w: 90, h: 50, label: 'DNS Resolver', icon: '🔍', type: 'gateway' },
            { id: 'root', x: 340, y: 40, w: 90, h: 50, label: 'Root DNS', icon: '🏛️', type: 'server' },
            { id: 'tld', x: 340, y: 130, w: 90, h: 50, label: 'TLD Server', icon: '📂', type: 'database' },
            { id: 'auth', x: 340, y: 220, w: 90, h: 50, label: 'Auth DNS', icon: '🔐', type: 'cache' },
            { id: 'ip', x: 530, y: 120, w: 100, h: 50, label: '93.184.216.34', icon: '📍', type: 'highlight' },
        ],
        arrows: [
            { from: 'browser', to: 'resolver', label: 'google.com?', highlight: true },
            { from: 'resolver', to: 'root', label: '1st' },
            { from: 'resolver', to: 'tld', label: '2nd' },
            { from: 'resolver', to: 'auth', label: '3rd' },
            { from: 'auth', to: 'ip', label: 'IP Found!' },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 DNS Resolution Flow', size: 13, opacity: 0.9 },
        ]
    },
    'database-indexing': {
        nodes: [
            { id: 'query', x: 50, y: 120, w: 90, h: 55, label: 'SQL Query', icon: '🔍', type: 'client' },
            { id: 'index', x: 270, y: 50, w: 100, h: 55, label: 'B-Tree Index', icon: '🌳', type: 'cache' },
            { id: 'scan', x: 270, y: 195, w: 100, h: 55, label: 'Full Scan', icon: '🐢', type: 'queue' },
            { id: 'result', x: 520, y: 120, w: 90, h: 55, label: 'Result', icon: '✅', type: 'server' },
        ],
        arrows: [
            { from: 'query', to: 'index', label: 'With Index: O(log n)', highlight: true },
            { from: 'query', to: 'scan', label: 'No Index: O(n)', dashed: true },
            { from: 'index', to: 'result', label: '⚡ Fast!' },
            { from: 'scan', to: 'result', label: '🐢 Slow', dashed: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Database Indexing', size: 13, opacity: 0.9 },
            { x: 350, y: 285, text: 'Indexes speed up reads but slow down writes', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'proxies': {
        nodes: [
            { id: 'client', x: 50, y: 45, w: 90, h: 50, label: 'Client', icon: '🖥️', type: 'client' },
            { id: 'fwd', x: 250, y: 45, w: 100, h: 50, label: 'Forward Proxy', icon: '🛡️', type: 'gateway' },
            { id: 'internet', x: 470, y: 45, w: 90, h: 50, label: 'Internet', icon: '🌐', type: 'server' },
            { id: 'user', x: 50, y: 195, w: 90, h: 50, label: 'User', icon: '👤', type: 'client' },
            { id: 'rev', x: 250, y: 195, w: 100, h: 50, label: 'Reverse Proxy', icon: '🔄', type: 'cache' },
            { id: 'backend', x: 470, y: 195, w: 90, h: 50, label: 'Backend', icon: '🖧', type: 'server' },
        ],
        arrows: [
            { from: 'client', to: 'fwd', label: 'Hides client IP', highlight: true },
            { from: 'fwd', to: 'internet', label: '' },
            { from: 'user', to: 'rev', label: '' },
            { from: 'rev', to: 'backend', label: 'Hides server IP', highlight: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Forward vs Reverse Proxy', size: 13, opacity: 0.9 },
            { x: 500, y: 130, text: '↕ Key Difference', size: 11, opacity: 0.6, color: '#f59e0b' },
        ]
    },
    'sql-nosql': {
        nodes: [
            { id: 'sql', x: 60, y: 70, w: 110, h: 60, label: 'SQL (MySQL)', icon: '📊', type: 'server' },
            { id: 'nosql', x: 60, y: 185, w: 110, h: 60, label: 'NoSQL (Mongo)', icon: '📦', type: 'cache' },
            { id: 'table', x: 280, y: 40, w: 130, h: 45, label: 'Tables + Schema', icon: '📋', type: 'database' },
            { id: 'joins', x: 280, y: 105, w: 130, h: 45, label: 'JOIN + ACID', icon: '🔗', type: 'database' },
            { id: 'docs', x: 280, y: 185, w: 130, h: 45, label: 'Documents/KV', icon: '📝', type: 'gateway' },
            { id: 'scale', x: 280, y: 245, w: 130, h: 45, label: 'Horizontal Scale', icon: '📈', type: 'gateway' },
            { id: 'use', x: 520, y: 120, w: 120, h: 55, label: 'Choose Wisely!', icon: '🤔', type: 'highlight' },
        ],
        arrows: [
            { from: 'sql', to: 'table', label: '' },
            { from: 'sql', to: 'joins', label: '' },
            { from: 'nosql', to: 'docs', label: '' },
            { from: 'nosql', to: 'scale', label: '' },
            { from: 'table', to: 'use', label: '', dashed: true },
            { from: 'scale', to: 'use', label: '', dashed: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 SQL vs NoSQL Comparison', size: 13, opacity: 0.9 },
        ]
    },
    'message-queues': {
        nodes: [
            { id: 'p1', x: 40, y: 50, w: 80, h: 45, label: 'Producer A', icon: '📤', type: 'client' },
            { id: 'p2', x: 40, y: 180, w: 80, h: 45, label: 'Producer B', icon: '📤', type: 'client' },
            { id: 'q', x: 250, y: 110, w: 120, h: 60, label: 'Message Queue', icon: '📨', type: 'queue' },
            { id: 'c1', x: 510, y: 50, w: 90, h: 45, label: 'Consumer 1', icon: '⚙️', type: 'server' },
            { id: 'c2', x: 510, y: 130, w: 90, h: 45, label: 'Consumer 2', icon: '⚙️', type: 'server' },
            { id: 'c3', x: 510, y: 210, w: 90, h: 45, label: 'Consumer 3', icon: '⚙️', type: 'cache' },
        ],
        arrows: [
            { from: 'p1', to: 'q', label: 'Publish', highlight: true },
            { from: 'p2', to: 'q', label: '' },
            { from: 'q', to: 'c1', label: 'Subscribe' },
            { from: 'q', to: 'c2', label: '' },
            { from: 'q', to: 'c3', label: '' },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Message Queue Pattern', size: 13, opacity: 0.9 },
            { x: 350, y: 285, text: 'Decouples producers from consumers — async processing', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'microservices': {
        nodes: [
            { id: 'gw', x: 50, y: 115, w: 100, h: 55, label: 'API Gateway', icon: '🚪', type: 'gateway' },
            { id: 'auth', x: 250, y: 30, w: 90, h: 50, label: 'Auth Svc', icon: '🔐', type: 'cache' },
            { id: 'user', x: 250, y: 115, w: 90, h: 50, label: 'User Svc', icon: '👤', type: 'server' },
            { id: 'order', x: 250, y: 200, w: 90, h: 50, label: 'Order Svc', icon: '📦', type: 'server' },
            { id: 'db1', x: 450, y: 30, w: 80, h: 50, label: 'Auth DB', icon: '🗄️', type: 'database' },
            { id: 'db2', x: 450, y: 115, w: 80, h: 50, label: 'User DB', icon: '🗄️', type: 'database' },
            { id: 'db3', x: 450, y: 200, w: 80, h: 50, label: 'Order DB', icon: '🗄️', type: 'database' },
            { id: 'mq', x: 570, y: 115, w: 90, h: 50, label: 'Event Bus', icon: '📨', type: 'queue' },
        ],
        arrows: [
            { from: 'gw', to: 'auth', label: '' },
            { from: 'gw', to: 'user', label: '', highlight: true },
            { from: 'gw', to: 'order', label: '' },
            { from: 'auth', to: 'db1', label: '', dashed: true },
            { from: 'user', to: 'db2', label: '', dashed: true },
            { from: 'order', to: 'db3', label: '', dashed: true },
            { from: 'order', to: 'mq', label: 'Event' },
        ],
        annotations: [
            { x: 350, y: 17, text: '📊 Microservices Architecture', size: 13, opacity: 0.9 },
            { x: 350, y: 280, text: 'Each service owns its data — communicates via APIs & events', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'api-gateway': {
        nodes: [
            { id: 'web', x: 40, y: 40, w: 80, h: 45, label: 'Web App', icon: '🖥️', type: 'client' },
            { id: 'mobile', x: 40, y: 130, w: 80, h: 45, label: 'Mobile', icon: '📱', type: 'client' },
            { id: 'iot', x: 40, y: 220, w: 80, h: 45, label: 'IoT', icon: '📡', type: 'client' },
            { id: 'gw', x: 250, y: 110, w: 120, h: 65, label: 'API Gateway', icon: '🚪', type: 'gateway' },
            { id: 's1', x: 510, y: 40, w: 90, h: 45, label: 'Users API', icon: '👤', type: 'server' },
            { id: 's2', x: 510, y: 130, w: 90, h: 45, label: 'Orders API', icon: '📦', type: 'server' },
            { id: 's3', x: 510, y: 220, w: 90, h: 45, label: 'Payment API', icon: '💳', type: 'cache' },
        ],
        arrows: [
            { from: 'web', to: 'gw', label: '' },
            { from: 'mobile', to: 'gw', label: '', highlight: true },
            { from: 'iot', to: 'gw', label: '' },
            { from: 'gw', to: 's1', label: 'Route + Auth' },
            { from: 'gw', to: 's2', label: '' },
            { from: 'gw', to: 's3', label: '' },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 API Gateway Pattern', size: 13, opacity: 0.9 },
        ]
    },
    'cdn': {
        nodes: [
            { id: 'user1', x: 30, y: 50, w: 80, h: 45, label: 'User (India)', icon: '🇮🇳', type: 'client' },
            { id: 'user2', x: 30, y: 190, w: 80, h: 45, label: 'User (US)', icon: '🇺🇸', type: 'client' },
            { id: 'edge1', x: 230, y: 50, w: 100, h: 45, label: 'Edge Mumbai', icon: '⚡', type: 'cache' },
            { id: 'edge2', x: 230, y: 190, w: 100, h: 45, label: 'Edge Virginia', icon: '⚡', type: 'cache' },
            { id: 'origin', x: 490, y: 115, w: 110, h: 55, label: 'Origin Server', icon: '🖧', type: 'server' },
        ],
        arrows: [
            { from: 'user1', to: 'edge1', label: '~10ms', highlight: true },
            { from: 'user2', to: 'edge2', label: '~15ms', highlight: true },
            { from: 'edge1', to: 'origin', label: 'Cache Miss', dashed: true },
            { from: 'edge2', to: 'origin', label: 'Cache Miss', dashed: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 CDN Architecture', size: 13, opacity: 0.9 },
            { x: 350, y: 280, text: 'Content served from nearest edge — reduces latency globally', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'database-sharding': {
        nodes: [
            { id: 'app', x: 50, y: 120, w: 90, h: 55, label: 'App Server', icon: '⚙️', type: 'server' },
            { id: 'router', x: 250, y: 120, w: 100, h: 55, label: 'Shard Router', icon: '🔀', type: 'gateway' },
            { id: 's1', x: 470, y: 30, w: 100, h: 50, label: 'Shard 1 (A-H)', icon: '🗄️', type: 'database' },
            { id: 's2', x: 470, y: 120, w: 100, h: 50, label: 'Shard 2 (I-P)', icon: '🗄️', type: 'database' },
            { id: 's3', x: 470, y: 210, w: 100, h: 50, label: 'Shard 3 (Q-Z)', icon: '🗄️', type: 'database' },
        ],
        arrows: [
            { from: 'app', to: 'router', label: 'Query', highlight: true },
            { from: 'router', to: 's1', label: 'key=Apple' },
            { from: 'router', to: 's2', label: 'key=John', dashed: true },
            { from: 'router', to: 's3', label: 'key=Zara', dashed: true },
        ],
        annotations: [
            { x: 350, y: 17, text: '📊 Database Sharding (Range-Based)', size: 13, opacity: 0.9 },
        ]
    },
    'rate-limiting': {
        nodes: [
            { id: 'good', x: 40, y: 50, w: 80, h: 45, label: 'Normal User', icon: '👤', type: 'client' },
            { id: 'bad', x: 40, y: 185, w: 80, h: 45, label: 'Abuser/Bot', icon: '🤖', type: 'queue' },
            { id: 'limiter', x: 250, y: 110, w: 120, h: 60, label: 'Rate Limiter', icon: '🚦', type: 'gateway' },
            { id: 'api', x: 510, y: 50, w: 90, h: 45, label: 'API Server', icon: '⚙️', type: 'server' },
            { id: 'block', x: 510, y: 185, w: 90, h: 50, label: '429 Blocked', icon: '🚫', type: 'queue' },
        ],
        arrows: [
            { from: 'good', to: 'limiter', label: '5 req/min' },
            { from: 'bad', to: 'limiter', label: '1000 req/min' },
            { from: 'limiter', to: 'api', label: '✅ Allow', highlight: true },
            { from: 'limiter', to: 'block', label: '❌ Reject', dashed: true },
        ],
        annotations: [
            { x: 350, y: 20, text: '📊 Rate Limiting Flow', size: 13, opacity: 0.9 },
        ]
    },
    'consistent-hashing': {
        nodes: [
            { id: 'n1', x: 300, y: 30, w: 80, h: 45, label: 'Node A', icon: '🖧', type: 'server' },
            { id: 'n2', x: 500, y: 145, w: 80, h: 45, label: 'Node B', icon: '🖧', type: 'cache' },
            { id: 'n3', x: 300, y: 230, w: 80, h: 45, label: 'Node C', icon: '🖧', type: 'database' },
            { id: 'n4', x: 100, y: 145, w: 80, h: 45, label: 'Node D', icon: '🖧', type: 'gateway' },
        ],
        arrows: [
            { from: 'n1', to: 'n2', label: '' },
            { from: 'n2', to: 'n3', label: 'Hash Ring →', highlight: true },
            { from: 'n3', to: 'n4', label: '' },
            { from: 'n4', to: 'n1', label: '' },
        ],
        annotations: [
            { x: 340, y: 20, text: '📊 Consistent Hash Ring', size: 13, opacity: 0.9 },
            { x: 340, y: 155, text: 'Keys map to nearest\nnode clockwise', size: 10, opacity: 0.5, italic: true },
        ]
    },
    'cap-theorem': {
        nodes: [
            { id: 'c', x: 280, y: 30, w: 110, h: 55, label: 'Consistency', icon: '🔒', type: 'server' },
            { id: 'a', x: 100, y: 200, w: 110, h: 55, label: 'Availability', icon: '✅', type: 'cache' },
            { id: 'p', x: 460, y: 200, w: 120, h: 55, label: 'Partition Tol.', icon: '🌐', type: 'gateway' },
        ],
        arrows: [
            { from: 'c', to: 'a', label: 'CA: MySQL', dashed: true },
            { from: 'a', to: 'p', label: 'AP: Cassandra', highlight: true },
            { from: 'p', to: 'c', label: 'CP: MongoDB' },
        ],
        annotations: [
            { x: 340, y: 17, text: '📊 CAP Theorem', size: 14, opacity: 0.9 },
            { x: 340, y: 155, text: 'Pick any 2 of 3', size: 12, opacity: 0.7, color: '#f59e0b' },
        ]
    },
    'websockets': {
        nodes: [
            { id: 'client', x: 50, y: 100, w: 100, h: 55, label: 'Browser', icon: '🖥️', type: 'client' },
            { id: 'ws', x: 280, y: 100, w: 120, h: 55, label: 'WebSocket', icon: '🔌', type: 'gateway' },
            { id: 'server', x: 530, y: 100, w: 100, h: 55, label: 'Server', icon: '🖧', type: 'server' },
        ],
        arrows: [
            { from: 'client', to: 'ws', label: 'ws:// upgrade', highlight: true },
            { from: 'ws', to: 'server', label: 'Full Duplex ↔️' },
        ],
        annotations: [
            { x: 350, y: 35, text: '📊 WebSocket vs HTTP', size: 13, opacity: 0.9 },
            { x: 350, y: 200, text: 'HTTP: request → response (one-way)', size: 10, opacity: 0.4, italic: true },
            { x: 350, y: 220, text: 'WebSocket: bidirectional, persistent, low latency', size: 10, opacity: 0.6, italic: true, color: '#10b981' },
            { x: 350, y: 250, text: 'Use for: chat, gaming, live feeds, notifications', size: 10, opacity: 0.5, italic: true },
        ]
    },
};
