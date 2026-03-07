/**
 * Detailed Flow Visualizer - Enhanced visualization with data structures and backend details
 * Shows what's happening at each stage with actual data, caching, and database operations
 */

export class DetailedFlowVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.width = this.canvas?.width || 1200;
    this.height = this.canvas?.height || 2000;  // Large height for detailed flows
    this.padding = 20;
    this.colors = {
      client: '#3b82f6',
      gateway: '#8b5cf6',
      service: '#10b981',
      database: '#f59e0b',
      cache: '#ec4899',
      queue: '#06b6d4',
      storage: '#14b8a6',
      external: '#6366f1',
      background: '#0f172a'
    };
  }

  /**
   * Draw detailed flow with all components and data movement
   */
  drawDetailedFlow(flow) {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    let y = this.padding;

    // Title
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 22px Arial';
    this.ctx.fillText('📊 ' + (flow.name || 'Flow'), this.padding, y + 25);
    y += 45;

    if (flow.description) {
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText(flow.description, this.padding, y);
      y += 25;
    }

    // Draw each stage with detailed information
    const stages = flow.stages || [];
    for (const stage of stages) {
      y = this.drawDetailedStage(stage, y);
      if (y > this.height - 200) break;
    }

    // Add legend
    this.drawLegend();
  }

  /**
   * Draw a detailed stage card with data structures and operations
   */
  drawDetailedStage(stage, startY) {
    const cardWidth = this.width - 2 * this.padding;
    let y = startY;

    // Stage number and title
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.font = 'bold 14px Arial';
    const stageTitle = `▶ ${stage.stage}`;
    this.ctx.fillText(stageTitle, this.padding, y);
    y += 22;

    // Stage description (if exists)
    if (stage.description) {
      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.fillText(`   📝 ${stage.description}`, this.padding + 10, y);
      y += 18;
    }

    // Actors involved
    if (stage.actors && stage.actors.length > 0) {
      this.ctx.fillStyle = '#f97316';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`   👥 Actors: ${stage.actors.join(' → ')}`, this.padding + 10, y);
      y += 16;
    }

    // Process steps with detailed information
    if (stage.process && stage.process.length > 0) {
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.font = '10px Arial';
      
      for (const step of stage.process) {
        const lines = this.wrapText(step, cardWidth - 60);
        for (const line of lines) {
          this.ctx.fillText(`   • ${line}`, this.padding + 15, y);
          y += 14;
        }
      }
    }

    // Data structures (if exists)
    if (stage.dataStructure) {
      this.ctx.fillStyle = '#06b6d4';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`   💾 Data Structure:`, this.padding + 10, y);
      y += 13;
      
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.font = '9px Arial';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText(`   ${stage.dataStructure}`, this.padding + 20, y);
      y += 12;
    }

    // Database operations (if exists)
    if (stage.dbOperation) {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`   🗄️  Database:`, this.padding + 10, y);
      y += 13;
      
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(`   ${stage.dbOperation}`, this.padding + 20, y);
      y += 12;
    }

    // Cache operations (if exists)
    if (stage.cacheOp) {
      this.ctx.fillStyle = '#ec4899';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`   ⚡ Cache:`, this.padding + 10, y);
      y += 13;
      
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(`   ${stage.cacheOp}`, this.padding + 20, y);
      y += 12;
    }

    // Response/Output
    if (stage.output) {
      this.ctx.fillStyle = '#10b981';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`   ✓ Output:`, this.padding + 10, y);
      y += 13;
      
      const outputLines = this.wrapText(stage.output, cardWidth - 80);
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.font = '9px Arial';
      for (const line of outputLines) {
        this.ctx.fillText(`   ${line}`, this.padding + 20, y);
        y += 11;
      }
    }

    // Timing information
    if (stage.timing) {
      this.ctx.fillStyle = '#a78bfa';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(`   ⏱️  Timing: ${stage.timing}`, this.padding + 10, y);
      y += 13;
    }

    // Performance metrics (if exists)
    if (stage.metrics) {
      this.ctx.fillStyle = '#34d399';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(`   📈 Metrics: ${stage.metrics}`, this.padding + 10, y);
      y += 13;
    }

    // Separator
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, y + 8);
    this.ctx.lineTo(this.width - this.padding, y + 8);
    this.ctx.stroke();

    return y + 20;
  }

  /**
   * Wrap text to fit width
   */
  wrapText(text, maxWidth) {
    if (!this.ctx) return [text];
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    this.ctx.font = '10px Arial';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Draw legend for components
   */
  drawLegend() {
    const legendY = this.height - 100;
    
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 11px Arial';
    this.ctx.fillText('Legend:', this.padding, legendY);
    
    const items = [
      { color: this.colors.client, label: 'Client' },
      { color: this.colors.gateway, label: 'API Gateway' },
      { color: this.colors.service, label: 'Service' },
      { color: this.colors.database, label: 'Database' },
      { color: this.colors.cache, label: 'Cache' },
      { color: this.colors.queue, label: 'Queue' }
    ];

    let x = this.padding + 100;
    for (const item of items) {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(x, legendY - 8, 12, 12);
      
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(item.label, x + 18, legendY);
      
      x += 120;
      if (x > this.width - 150) {
        x = this.padding + 100;
        legendY += 20;
      }
    }
  }

  /**
   * Draw architecture diagram for a system
   */
  drawSystemArchitecture(flows) {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    let y = 30;

    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('System Architecture Overview', this.padding, y);
    y += 40;

    // Draw flow selector
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`Available Flows: ${flows.length}`, this.padding, y);
    y += 25;

    // List all flows
    for (let i = 0; i < flows.length; i++) {
      const flow = flows[i];
      this.ctx.fillStyle = '#60a5fa';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.fillText(`${i + 1}. ${flow.name}`, this.padding + 20, y);
      
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.font = '9px Arial';
      this.ctx.fillText(flow.description || '', this.padding + 40, y + 15);
      
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillText(`${flow.stages?.length || 0} stages`, this.padding + 40, y + 27);
      
      y += 40;
    }
  }
}

export default DetailedFlowVisualizer;
