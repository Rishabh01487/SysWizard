/**
 * Architecture Visualizer — Renders system design architectures on canvas
 * Creates visual diagrams of generated system architectures
 */

export class ArchitectureVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.width = this.canvas?.width || 1200;
    this.height = this.canvas?.height || 800;
    this.padding = 40;
    this.colors = {
      client: '#3b82f6',
      gateway: '#8b5cf6',
      service: '#10b981',
      database: '#f59e0b',
      cache: '#ec4899',
      queue: '#06b6d4',
      storage: '#14b8a6',
      external: '#6366f1'
    };
  }

  /**
   * Draw complete architecture diagram
   */
  drawArchitecture(design) {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Set up text
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = '#e2e8f0';

    let y = this.padding + 20;

    // Title
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText(design.title || 'System Architecture', this.padding, y);
    y += 40;

    // Draw layers
    this.ctx.font = 'bold 14px Arial';
    
    // 1. Client Layer
    this.drawLayer('CLIENT LAYER', ['Web', 'Mobile', 'Desktop'], this.colors.client, y);
    y += 100;

    // 2. API Gateway
    this.drawLayer('API GATEWAY', [design.architecture?.apiGateway?.technologies?.[0] || 'API Gateway'], this.colors.gateway, y);
    y += 100;

    // 3. Services
    const serviceNames = design.architecture?.services?.map(s => s.name).slice(0, 4) || ['Service 1', 'Service 2'];
    this.drawLayerGrid('MICROSERVICES', serviceNames, this.colors.service, y);
    y += 120;

    // 4. Databases & Cache
    const dbNames = design.architecture?.databases?.map(d => d.name).slice(0, 2) || ['PostgreSQL'];
    const cacheNames = [design.architecture?.cache?.provider || 'Redis'];
    
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('PERSISTENCE LAYER', this.padding, y);
    y += 25;

    let dbX = this.padding;
    for (const db of dbNames) {
      this.drawBox(db, dbX, y, 120, 60, this.colors.database);
      dbX += 150;
    }
    
    const cacheX = dbX;
    this.drawBox(cacheNames[0], cacheX, y, 120, 60, this.colors.cache);

    // Draw flow arrows
    this.drawArrows();
  }

  /**
   * Draw a horizontal layer with components
   */
  drawLayer(label, items, color, y) {
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(label, this.padding, y - 15);

    const itemWidth = (this.width - 2 * this.padding) / items.length - 20;
    let x = this.padding;

    for (const item of items) {
      this.drawBox(item, x, y, itemWidth, 50, color);
      x += itemWidth + 20;
    }
  }

  /**
   * Draw a grid of components
   */
  drawLayerGrid(label, items, color, y) {
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(label, this.padding, y - 15);

    const cols = 4;
    const itemWidth = (this.width - 2 * this.padding) / cols - 20;
    let x = this.padding;
    let row = 0;

    for (let i = 0; i < items.length; i++) {
      if (i % cols === 0 && i > 0) {
        x = this.padding;
        row++;
      }
      this.drawBox(items[i], x, y + row * 70, itemWidth, 50, color);
      x += itemWidth + 20;
    }
  }

  /**
   * Draw a single box component
   */
  drawBox(text, x, y, width, height, bgColor) {
    // Background
    this.ctx.fillStyle = bgColor;
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillRect(x, y, width, height);

    // Border
    this.ctx.globalAlpha = 1;
    this.ctx.strokeStyle = bgColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Text
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 11px Arial';
    this.ctx.textAlign = 'center';
    
    const lines = text.split(' ');
    const startY = y + height / 2 - (lines.length - 1) * 5;
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, x + width / 2, startY + i * 12);
    });
    
    this.ctx.textAlign = 'left';
  }

  /**
   * Draw connection arrows
   */
  drawArrows() {
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // Simple vertical flow lines
    const x = this.width / 2;
    for (let y = this.padding + 50; y < this.height - 100; y += 100) {
      this.drawArrow(x, y, x, y + 80);
    }

    this.ctx.setLineDash([]);
  }

  /**
   * Draw directional arrow
   */
  drawArrow(fromX, fromY, toX, toY) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();
  }

  /**
   * Draw topology map with detailed connections
   */
  drawTopology(design) {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw in a circular topology pattern
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = 200;

    // Services arranged in circle
    const services = design.architecture?.services || [];
    const serviceCount = Math.min(services.length, 6);

    services.slice(0, serviceCount).forEach((service, i) => {
      const angle = (i / serviceCount) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const color = this.colors.service;
      this.drawBox(service.name.substring(0, 10), x - 40, y - 25, 80, 50, color);

      // Draw lines to center
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });

    // Central gateway
    this.drawBox('API\nGW', centerX - 40, centerY - 25, 80, 50, this.colors.gateway);
  }
}

export default ArchitectureVisualizer;
