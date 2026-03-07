/**
 * Flow Visualizer — Renders detailed system flows and stages on canvas
 * Shows step-by-step process flows for topics like Food Delivery, E-Commerce, etc.
 */

export class FlowVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.width = this.canvas?.width || 1000;
    this.height = this.canvas?.height || 600;
    this.scrollOffset = 0;
  }

  /**
   * Draw a complete flow with all stages
   */
  drawFlow(flow) {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    let y = 20;

    // Flow title and description
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText(flow.name, 20, y);
    y += 25;

    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(flow.description || '', 20, y);
    y += 30;

    // Draw each stage
    const stages = flow.stages || [];
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      y = this.drawStage(stage, i, y, stages.length);

      // Check if we need to scroll
      if (y > this.height - 100) {
        break;
      }
    }

    // Draw scroll indicator if more stages exist
    if (stages.length > 3) {
      this.ctx.fillStyle = '#475569';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`↓ Scroll to see more (${stages.length} total stages)`, 20, this.height - 20);
    }
  }

  /**
   * Draw a single stage with details
   */
  drawStage(stage, index, y, totalStages) {
    const lineHeight = 15;
    const stageWidth = this.width - 60;
    const boxHeight = 140;

    // Stage number circle
    this.ctx.fillStyle = '#8b5cf6';
    this.ctx.beginPath();
    this.ctx.arc(25, y + 20, 18, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(index + 1, 25, y + 26);
    this.ctx.textAlign = 'left';

    // Stage card background
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.rect(50, y, stageWidth, boxHeight);
    this.ctx.stroke();

    let cardY = y + 10;

    // Stage name (header)
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.font = 'bold 13px Arial';
    this.ctx.fillText(stage.stage, 60, cardY);
    cardY += 18;

    // Actors involved
    if (stage.actors && stage.actors.length > 0) {
      this.ctx.fillStyle = '#f97316';
      this.ctx.font = '11px Arial';
      this.ctx.fillText('🔹 Actors: ' + stage.actors.join(', '), 60, cardY);
      cardY += 14;
    }

    // Process steps (with word wrap)
    if (stage.process && stage.process.length > 0) {
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.font = '10px Arial';
      
      for (let i = 0; i < Math.min(stage.process.length, 2); i++) {
        const text = '• ' + stage.process[i];
        const wrappedLines = this.wrapText(text, 300);
        
        wrappedLines.forEach((line, j) => {
          if (cardY < y + boxHeight - 15) {
            this.ctx.fillText(line, 65, cardY);
            cardY += 11;
          }
        });
      }

      if (stage.process.length > 2) {
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText('+' + (stage.process.length - 2) + ' more steps', 65, cardY);
        cardY += 11;
      }
    }

    // Timing
    if (stage.timing) {
      this.ctx.fillStyle = '#10b981';
      this.ctx.font = '10px Arial';
      this.ctx.fillText('⏱ ' + stage.timing, 60, y + boxHeight - 5);
    }

    // Arrow to next stage
    if (index < totalStages - 1) {
      this.drawDownArrow(this.width / 2, y + boxHeight + 5);
    }

    return y + boxHeight + 30;
  }

  /**
   * Draw downward arrow for next stage
   */
  drawDownArrow(x, y) {
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y + 20);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 20);
    this.ctx.lineTo(x - 6, y + 12);
    this.ctx.moveTo(x, y + 20);
    this.ctx.lineTo(x + 6, y + 12);
    this.ctx.stroke();
  }

  /**
   * Wrap text to fit width
   */
  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      this.ctx.font = '10px Arial';
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Draw multiple flows in overview (grid)
   */
  drawFlowsOverview(flows) {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cols = 2;
    const cardWidth = (this.width - 60) / cols;
    const cardHeight = 120;

    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Available Flows', 20, 30);

    let x = 20;
    let y = 60;
    let rowCount = 0;

    flows.forEach((flow, i) => {
      // Card background
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, cardWidth, cardHeight);

      // Flow name
      this.ctx.fillStyle = '#60a5fa';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(flow.name.substring(0, 25), x + 10, y + 30);

      // Description
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '10px Arial';
      const desc = (flow.description || '').substring(0, 45);
      this.ctx.fillText(desc, x + 10, y + 55);

      // Stage count
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillText('📊 ' + (flow.stages?.length || 0) + ' stages', x + 10, y + 75);

      // Move to next position
      if (i % cols === cols - 1) {
        x = 20;
        y += cardHeight + 30;
        rowCount++;
      } else {
        x += cardWidth + 20;
      }
    });
  }

  /**
   * Draw system metrics and KPIs
   */
  drawMetrics(metrics) {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    let y = 40;

    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('System Metrics & KPIs', 20, y);
    y += 40;

    const cols = 3;
    const metricsArray = Object.entries(metrics);
    const cardWidth = (this.width - 60) / cols;

    metricsArray.forEach((metric, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (cardWidth + 20);
      const metricY = y + row * 120;

      this.drawMetricCard(metric[0], metric[1], x, metricY, cardWidth);
    });
  }

  /**
   * Draw individual metric card
   */
  drawMetricCard(label, value, x, y, width) {
    // Background
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, 100);

    // Label
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.fillText(label, x + 10, y + 20);

    // Value
    this.ctx.fillStyle = '#10b981';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(value, x + width / 2, y + 60);

    this.ctx.textAlign = 'left';
  }
}

export default FlowVisualizer;
