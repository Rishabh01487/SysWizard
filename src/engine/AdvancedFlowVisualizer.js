/**
 * Advanced Flow Visualizer — Shows request/response cycles and data flow
 * Animates how data travels through the system architecture
 */

export class AdvancedFlowVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.animationTime = 0;
        this.isPlaying = false;
        this.rafId = null;
        this.flowParticles = [];
        this.nodes = [];
        this.connections = [];
    }

    // ─── Request/Response Cycle Visualization ───
    generateRequestResponseCycle(topic = 'generic') {
        this.flowParticles = [];
        this.nodes = [];
        this.connections = [];

        const cycles = {
            foodDelivery: this._foodDeliveryFlow,
            ecommerce: this._ecommerceFlow,
            chat: this._chatFlow,
            generic: this._genericFlow
        };

        const flowFn = cycles[topic] || cycles.generic;
        flowFn.call(this);
        this.startAnimation();
    }

    _foodDeliveryFlow() {
        // Client → LB → API → Services → DB/Cache → Response → Client
        const nodePositions = [
            { id: 'client', label: '📱 User Device', x: 50, y: 200, color: '#a855f7' },
            { id: 'cdn', label: '🌐 CDN', x: 150, y: 100, color: '#06b6d4' },
            { id: 'lb', label: '⚖️ Load Balancer', x: 250, y: 200, color: '#f59e0b' },
            { id: 'api', label: '🚪 API Gateway', x: 350, y: 200, color: '#10b981' },
            { id: 'auth', label: '🔒 Auth Service', x: 450, y: 100, color: '#ef4444' },
            { id: 'geo', label: '📍 Geo Service', x: 450, y: 300, color: '#10b981' },
            { id: 'redis', label: '⚡ Redis Cache', x: 550, y: 150, color: '#ef4444' },
            { id: 'db', label: '🗄️ PostgreSQL', x: 550, y: 250, color: '#3b82f6' },
            { id: 'response', label: '📦 Response Builder', x: 650, y: 200, color: '#8b5cf6' },
        ];

        // Create flow: Request path (upward), Response path (downward)
        this.createRequestResponseFlows([
            { from: 'client', to: 'lb', label: 'HTTPS Request', dataSize: '2KB' },
            { from: 'lb', to: 'api', label: 'Route', dataSize: '2KB' },
            { from: 'api', to: 'auth', label: 'JWT Validate', dataSize: '1KB' },
            { from: 'api', to: 'geo', label: 'Geo Search', dataSize: '2KB' },
            { from: 'geo', to: 'redis', label: 'Check Cache', dataSize: '0.5KB', dashed: true },
            { from: 'redis', to: 'db', label: 'Cache Miss→DB', dataSize: '1KB' },
            { from: 'db', to: 'response', label: 'Restaurant Data (50 items)', dataSize: '80KB' },
            { from: 'response', to: 'client', label: 'Gzip Response', dataSize: '15KB' },
        ]);

        this.nodes = nodePositions;
    }

    _ecommerceFlow() {
        const nodePositions = [
            { id: 'client', label: '🛒 User App', x: 50, y: 200, color: '#a855f7' },
            { id: 'cdn', label: '🌐 CDN', x: 150, y: 100, color: '#06b6d4' },
            { id: 'lb', label: '⚖️ LB', x: 250, y: 200, color: '#f59e0b' },
            { id: 'api', label: '🚪 API', x: 350, y: 200, color: '#10b981' },
            { id: 'search', label: '🔍 Elasticsearch', x: 450, y: 100, color: '#f97316' },
            { id: 'inventory', label: '📦 Inventory', x: 450, y: 300, color: '#3b82f6' },
            { id: 'response', label: '📊 Compile', x: 550, y: 200, color: '#8b5cf6' },
        ];

        this.createRequestResponseFlows([
            { from: 'client', to: 'cdn', label: 'Images', dataSize: '500KB' },
            { from: 'client', to: 'lb', label: 'Search API', dataSize: '0.5KB' },
            { from: 'lb', to: 'api', label: 'Route', dataSize: '0.5KB' },
            { from: 'api', to: 'search', label: 'Full-text search', dataSize: '1KB' },
            { from: 'search', to: 'inventory', label: 'Get stock', dataSize: '1KB' },
            { from: 'inventory', to: 'response', label: 'Product details', dataSize: '50KB' },
            { from: 'response', to: 'client', label: 'Results (100 items)', dataSize: '25KB' },
        ]);

        this.nodes = nodePositions;
    }

    _chatFlow() {
        const nodePositions = [
            { id: 'client1', label: '📱 Sender', x: 50, y: 100, color: '#a855f7' },
            { id: 'client2', label: '📱 Receiver', x: 650, y: 100, color: '#a855f7' },
            { id: 'gateway', label: '🚪 API Gateway', x: 350, y: 50, color: '#10b981' },
            { id: 'queue', label: '📨 Message Queue', x: 350, y: 150, color: '#ef4444' },
            { id: 'db', label: '💾 Database', x: 350, y: 250, color: '#3b82f6' },
            { id: 'websocket', label: '⚡ WebSocket Hub', x: 350, y: 350, color: '#06b6d4' },
        ];

        this.createRequestResponseFlows([
            { from: 'client1', to: 'gateway', label: 'Send Message', dataSize: '1KB' },
            { from: 'gateway', to: 'queue', label: 'Enqueue', dataSize: '1KB' },
            { from: 'queue', to: 'db', label: 'Persist', dataSize: '1KB' },
            { from: 'queue', to: 'websocket', label: 'Broadcast', dataSize: '1KB' },
            { from: 'websocket', to: 'client2', label: 'Deliver', dataSize: '1KB' },
            { from: 'client2', to: 'gateway', label: 'Read Receipt', dataSize: '0.5KB' },
        ]);

        this.nodes = nodePositions;
    }

    _genericFlow() {
        const nodePositions = [
            { id: 'client', label: '👤 Client', x: 50, y: 200, color: '#a855f7' },
            { id: 'edge', label: '🌐 Edge/CDN', x: 150, y: 100, color: '#06b6d4' },
            { id: 'lb', label: '⚖️ LB', x: 250, y: 200, color: '#f59e0b' },
            { id: 'gateway', label: '🚪 Gateway', x: 350, y: 200, color: '#10b981' },
            { id: 'service1', label: '⚙️ Service A', x: 450, y: 100, color: '#8b5cf6' },
            { id: 'service2', label: '⚙️ Service B', x: 450, y: 300, color: '#8b5cf6' },
            { id: 'cache', label: '⚡ Cache', x: 550, y: 150, color: '#ef4444' },
            { id: 'db', label: '🗄️ Database', x: 550, y: 250, color: '#3b82f6' },
            { id: 'response', label: '📦 Response', x: 650, y: 200, color: '#6366f1' },
        ];

        this.createRequestResponseFlows([
            { from: 'client', to: 'edge', label: 'Static', dataSize: '100KB', dashed: true },
            { from: 'client', to: 'lb', label: 'Request', dataSize: '2KB' },
            { from: 'lb', to: 'gateway', label: 'Route', dataSize: '2KB' },
            { from: 'gateway', to: 'service1', label: 'Process', dataSize: '1KB' },
            { from: 'gateway', to: 'service2', label: 'Parallel', dataSize: '1KB' },
            { from: 'service1', to: 'cache', label: 'Check', dataSize: '0.5KB', dashed: true },
            { from: 'service2', to: 'db', label: 'Query', dataSize: '1KB' },
            { from: 'cache', to: 'response', label: 'Hit', dataSize: '10KB' },
            { from: 'db', to: 'response', label: 'Result', dataSize: '50KB' },
            { from: 'response', to: 'client', label: 'Response', dataSize: '15KB' },
        ]);

        this.nodes = nodePositions;
    }

    createRequestResponseFlows(connections) {
        this.connections = connections.map(conn => ({
            from: conn.from,
            to: conn.to,
            label: conn.label,
            dataSize: conn.dataSize,
            dashed: conn.dashed || false,
            particles: [] // Will be populated during animation
        }));
    }

    startAnimation() {
        this.isPlaying = true;
        this.animationTime = 0;
        this._animate();
    }

    stopAnimation() {
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawNodes();
        this.drawConnections();
        this.updateAndDrawParticles();
        
        this.animationTime += 16; // ~60fps
        if (this.animationTime > 5000) this.animationTime = 0; // Reset after 5 seconds

        if (this.isPlaying) {
            this.rafId = requestAnimationFrame(() => this._animate());
        }
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid pattern
        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawNodes() {
        this.nodes.forEach(node => {
            const x = node.x;
            const y = node.y;

            // Glow effect
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 35);
            glow.addColorStop(0, node.color + '33');
            glow.addColorStop(1, node.color + '00');
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 35, 0, Math.PI * 2);
            this.ctx.fill();

            // Node circle
            this.ctx.fillStyle = node.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Node stroke
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, x, y + 35);
        });
    }

    drawConnections() {
        this.connections.forEach(conn => {
            const from = this.nodes.find(n => n.id === conn.from);
            const to = this.nodes.find(n => n.id === conn.to);

            if (!from || !to) return;

            const x1 = from.x, y1 = from.y;
            const x2 = to.x, y2 = to.y;

            // Draw connection line
            this.ctx.strokeStyle = conn.dashed ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.6)';
            this.ctx.lineWidth = conn.dashed ? 1 : 2;
            if (conn.dashed) {
                this.ctx.setLineDash([5, 5]);
            }
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Arrow
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const arrowSize = 8;
            this.ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fill();

            // Label
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '11px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(conn.label, midX, midY - 8);
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.fillText(conn.dataSize, midX, midY + 6);

            // Create particles for animation
            this.createFlowParticles(x1, y1, x2, y2, conn.label);
        });
    }

    createFlowParticles(x1, y1, x2, y2, label) {
        const progress = (this.animationTime % 2000) / 2000;
        const x = x1 + (x2 - x1) * progress;
        const y = y1 + (y2 - y1) * progress;

        if (progress > 0.1 && progress < 0.9) {
            this.ctx.fillStyle = '#60a5fa';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
            glow.addColorStop(0, '#60a5fa44');
            glow.addColorStop(1, '#60a5fa00');
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    updateAndDrawParticles() {
        // Particles are drawn as part of createFlowParticles
    }

    // ─── Data Flow Through Layers ───
    generateDataFlowDiagram() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawDataFlowLayers();
    }

    drawDataFlowLayers() {
        const layers = [
            { name: 'Client', color: '#a855f7', y: 50 },
            { name: 'CDN', color: '#06b6d4', y: 100 },
            { name: 'Load Balancer', color: '#f59e0b', y: 150 },
            { name: 'API Gateway', color: '#10b981', y: 200 },
            { name: 'Service Layer', color: '#8b5cf6', y: 250 },
            { name: 'Cache (Redis)', color: '#ef4444', y: 300 },
            { name: 'Database', color: '#3b82f6', y: 350 },
            { name: 'Message Queue', color: '#6366f1', y: 400 },
        ];

        layers.forEach((layer, idx) => {
            const x = 50;
            const width = this.canvas.width - 100;

            // Layer box
            this.ctx.fillStyle = layer.color + '22';
            this.ctx.fillRect(x, layer.y, width, 35);

            // Border
            this.ctx.strokeStyle = layer.color + '77';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, layer.y, width, 35);

            // Label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Outfit';
            this.ctx.fillText(layer.name, x + 20, layer.y + 22);

            // Animated flow
            const progress = (this.animationTime + idx * 200) % 2000 / 2000;
            this.ctx.fillStyle = layer.color;
            const flowX = x + 10 + (width - 40) * progress;
            this.ctx.beginPath();
            this.ctx.arc(flowX, layer.y + 17.5, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // ─── Caching Visualization ───
    generateCachingVisualization() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCachingLayers();
    }

    drawCachingLayers() {
        const cacheLayers = [
            { layer: 1, name: 'Browser Cache', ttl: '1 year', hit: '0ms', y: 50, items: 50 },
            { layer: 2, name: 'CDN Cache', ttl: '24 hours', hit: '10ms', y: 120, items: 100000 },
            { layer: 3, name: 'Redis Cache Layer 1 (Session)', ttl: '24h', hit: '1ms', y: 190, items: 1000000 },
            { layer: 4, name: 'Redis Cache Layer 2 (Hot Data)', ttl: '5-30min', hit: '1ms', y: 260, items: 500000 },
            { layer: 5, name: 'Query Result Cache', ttl: '2-5min', hit: '2ms', y: 330, items: 10000 },
            { layer: 6, name: 'Database (Disk)', ttl: 'Permanent', hit: '20-50ms', y: 400, items: 'Billions' },
        ];

        cacheLayers.forEach(cache => {
            const x = 50;
            const width = 700;

            // Cache layer box
            this.ctx.fillStyle = `hsl(${cache.layer * 40}, 70%, 45%)` + '22';
            this.ctx.fillRect(x, cache.y, width, 50);

            // Border with color
            this.ctx.strokeStyle = `hsl(${cache.layer * 40}, 70%, 45%)`;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, cache.y, width, 50);

            // Layer info
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 13px Outfit';
            this.ctx.fillText(`${cache.name}`, x + 10, cache.y + 18);

            this.ctx.font = '11px Outfit';
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.fillText(`TTL: ${cache.ttl} | Hit: ${cache.hit} | Items: ${cache.items}`, x + 10, cache.y + 38);

            // Highlight rate visualization
            const hitRate = Math.max(0.3, 1 - cache.layer * 0.12); // Decreases as we go deeper
            this.ctx.fillStyle = `hsla(${cache.layer * 40}, 70%, 45%, ${hitRate * 0.5})`;
            this.ctx.fillRect(x + width - 80, cache.y + 5, 70 * hitRate, 40);

            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '10px Outfit';
            this.ctx.fillText(`${Math.round(hitRate * 100)}% hit`, x + width - 75, cache.y + 30);
        });
    }
}

export default AdvancedFlowVisualizer;
