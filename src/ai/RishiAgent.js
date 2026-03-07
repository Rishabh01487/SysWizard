/**
 * Rishi AI Agent — Intelligent system design assistant
 * Answers ANY system design question descriptively and clearly
 * Uses knowledge base + LLM for comprehensive responses
 */

import { SYSTEM_DESIGN_KB } from '../content/systemDesignKnowledgeBase.js';
import { OllamaService } from './ollamaService.js';

export class RishiAIAgent {
  constructor() {
    this.name = 'Rishi';
    this.personality = 'Expert system design architect, explains concepts clearly with examples';
    this.knowledge = SYSTEM_DESIGN_KB;
    this.conversationHistory = [];
    this.ollama = new OllamaService();
  }

  /**
   * Ask Rishi any system design question
   * Returns comprehensive, descriptive answer
   */
  async askQuestion(question) {
    // Add to history
    this.conversationHistory.push({
      type: 'user',
      message: question,
      timestamp: new Date()
    });

    // Find relevant knowledge base entries
    const relevantAnswers = this.findRelevantAnswers(question);

    // Build context for AI
    const context = this.buildContext(question, relevantAnswers);

    // Get response from Ollama (or fallback to KB directly)
    let response;
    try {
      response = await this.generateResponse(question, context);
    } catch (e) {
      // Fallback if Ollama unavailable
      response = this.generateFallbackResponse(question, relevantAnswers);
    }

    // Add to history
    this.conversationHistory.push({
      type: 'assistant',
      message: response,
      timestamp: new Date(),
      sources: relevantAnswers.map(a => a.topic)
    });

    return {
      answer: response,
      sources: relevantAnswers,
      confidence: this.calculateConfidence(relevantAnswers)
    };
  }

  /**
   * Find relevant knowledge base entries for question
   */
  findRelevantAnswers(question) {
    const keywords = this.extractKeywords(question);
    const matches = [];

    // Search all KB categories
    for (const [category, entries] of Object.entries(this.knowledge)) {
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          const score = this.scoreRelevance(entry.topic, entry.answer, keywords);
          if (score > 0) {
            matches.push({ ...entry, category, score });
          }
        }
      }
    }

    // Sort by relevance and return top 5
    return matches.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Extract key concepts from question
   */
  extractKeywords(question) {
    const lowQ = question.toLowerCase();
    const keywords = [];

    // Common system design keywords
    const terms = [
      'scalability', 'load balancing', 'caching', 'database', 'replication',
      'sharding', 'consistency', 'availability', 'latency', 'throughput',
      'microservices', 'api', 'rest', 'grpc', 'message queue', 'kafka',
      'authentication', 'payment', 'search', 'real-time', 'websocket',
      'cdn', 'disaster recovery', 'failover', 'monitoring', 'tracing',
      'circuit breaker', 'retry', 'timeout', 'cap theorem', 'acid'
    ];

    for (const term of terms) {
      if (lowQ.includes(term)) {
        keywords.push(term);
      }
    }

    return keywords;
  }

  /**
   * Score how relevant an answer is to the question
   */
  scoreRelevance(topic, answer, keywords) {
    let score = 0;
    const topicLower = topic.toLowerCase();
    const answerLower = answer.toLowerCase();

    // Exact topic match is best
    for (const keyword of keywords) {
      if (topicLower.includes(keyword)) score += 10;
      if (answerLower.includes(keyword)) score += 3;
    }

    return score;
  }

  /**
   * Build context for AI to use when generating response
   */
  buildContext(question, relevantAnswers) {
    let context = `Question: ${question}\n\n`;
    context += `Relevant Knowledge Base Entries:\n`;

    for (const answer of relevantAnswers) {
      context += `\nTopic: ${answer.topic}\n`;
      context += `Answer: ${answer.answer}\n`;
      context += `---\n`;
    }

    context += `\nConversation History:\n`;
    for (const msg of this.conversationHistory.slice(-5)) {
      context += `${msg.type.toUpperCase()}: ${msg.message}\n`;
    }

    return context;
  }

  /**
   * Generate response using Ollama LLM
   */
  async generateResponse(question, context) {
    const systemPrompt = `You are Rishi, an expert system design architect with 15+ years of experience.
You explain complex concepts clearly with real-world examples.
Your goal is to answer questions descriptively and help users understand system design deeply.

Important guidelines:
1. Be descriptive and detailed (not brief)
2. Use real-world examples (Netflix, Uber, Amazon)
3. Show tradeoffs and why choices matter
4. Include concrete numbers and timings when relevant
5. Explain the "why" not just "how"
6. Use analogies when helpful
7. Mention when multiple approaches exist`;

    const userPrompt = `Based on this context, answer the user's question comprehensively and clearly:

${context}

Remember: Be descriptive, use examples, explain tradeoffs and the reasoning behind solutions.`;

    try {
      const response = await this.ollama.answerQuestion('System Design', userPrompt);
      return response;
    } catch (e) {
      throw new Error('LLM unavailable');
    }
  }

  /**
   * Fallback response using knowledge base directly
   */
  generateFallbackResponse(question, relevantAnswers) {
    if (relevantAnswers.length === 0) {
      return `I'm not sure about that specific question, but it sounds like it relates to system design. ` +
        `Could you ask more specifically about: scalability, databases, caching, microservices, ` +
        `load balancing, monitoring, or other system design topics?`;
    }

    let response = '';
    
    if (relevantAnswers.length > 0) {
      response = relevantAnswers[0].answer;
    }

    if (relevantAnswers.length > 1) {
      response += `\n\nRelated concepts:\n`;
      for (let i = 1; i < relevantAnswers.length; i++) {
        response += `\n• ${relevantAnswers[i].topic}: ${relevantAnswers[i].answer.substring(0, 100)}...`;
      }
    }

    return response;
  }

  /**
   * Calculate confidence in answer (0-100)
   */
  calculateConfidence(relevantAnswers) {
    if (relevantAnswers.length === 0) return 20; // Low confidence
    if (relevantAnswers.length >= 3) return 95; // High confidence

    const totalScore = relevantAnswers.reduce((sum, a) => sum + a.score, 0);
    const avgScore = totalScore / relevantAnswers.length;

    // Map score to confidence
    return Math.min(95, Math.max(30, avgScore * 5));
  }

  /**
   * Get suggested follow-up questions based on conversation
   */
  getSuggestedFollowups() {
    const lastTopic = this.conversationHistory[this.conversationHistory.length - 1];
    
    const suggestions = [
      'How would you scale this for 1 million users?',
      'What are the failure scenarios and how would you handle them?',
      'How would you monitor and debug this in production?',
      'What are the cost implications of this architecture?',
      'Can you walk through a request from end-to-end?',
      'What tradeoffs are we making here?',
      'How would you test this system?',
      'What tools and technologies would you use?'
    ];

    return suggestions.slice(0, 3);
  }

  /**
   * Explain system design topic with visual walkthrough
   */
  explainTopic(topicName) {
    const topic = topicName.toLowerCase();

    const explanations = {
      'load balancing': {
        title: 'Load Balancing',
        summary: 'Distributes requests across multiple servers',
        stages: [
          {
            stage: 'Incoming Request',
            description: 'User sends request to load balancer (single IP)'
          },
          {
            stage: 'Server Selection',
            description: 'Load balancer decides which server gets request (round-robin, least connections, IP hash)'
          },
          {
            stage: 'Forward Request',
            description: 'Forward request to selected server'
          },
          {
            stage: 'Return Response',
            description: 'Server processes and returns response through load balancer'
          }
        ],
        algorithms: [
          'Round-Robin: Server 1, Server 2, Server 3, Server 1, ...',
          'Least Connections: Route to server with fewest active connections',
          'IP Hash: Same IP always goes to same server (sticky sessions)',
          'Weighted: Different servers get different load (50% to Server 1, 30% to Server 2, etc)'
        ],
        examples: [
          'Netflix: 10M concurrent users across 1000s of servers',
          'Uber: Route requests to nearest data center',
          'Google: Distribute search queries globally'
        ]
      },
      'caching': {
        title: 'Caching Strategies',
        summary: 'Store frequently accessed data in fast memory',
        layers: [
          'Client Cache (Browser)',
          'CDN Cache (Edge)',
          'API Cache (Redis)',
          'Database Cache (Indices)',
          'Origin Database'
        ],
        strategies: [
          'TTL (Time To Live): Expire after 5 minutes',
          'LRU (Least Recently Used): Remove oldest when full',
          'Event-Driven: Invalidate when data changes',
          'Write-Through: Update cache on write',
          'Write-Behind: Update cache immediately, DB async'
        ]
      },
      'database sharding': {
        title: 'Database Sharding',
        summary: 'Split data across multiple databases horizontally',
        approach: 'Each shard holds subset of data, determined by sharding key',
        example: 'User ID sharding: users 1-1M in shard1, 1M-2M in shard2',
        advantages: [
          'Unlimited data size',
          'Parallel query processing',
          'Better performance (smaller dataset per shard)'
        ],
        challenges: [
          'Complex queries (must hit all shards)',
          'Shard management (rebalancing when uneven)',
          'Distributed transactions (harder)'
        ]
      }
    };

    return explanations[topic] || {
      title: topicName,
      message: 'Topic explanation not found. Ask me about specific concepts!'
    };
  }

  /**
   * Rate limit for responsible usage
   */
  getRateLimit() {
    return {
      maxQuestionsPerMinute: 10,
      maxQuestionsPerHour: 100,
      maxQuestionsPerDay: 500
    };
  }
}

// Create singleton instance
export const rishiAgent = new RishiAIAgent();

export default rishiAgent;
