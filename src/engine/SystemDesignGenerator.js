/**
 * System Design Generator — Generates complete system architecture for any application
 * Takes application description and outputs detailed design with all components
 */

export class SystemDesignGenerator {
  /**
   * Generate complete system design from application description
   * @param {string} appDescription - What the application does
   * @param {string} appType - e.g., 'marketplace', 'social', 'search', 'analytics'
   * @param {number} expectedUsers - Estimated concurrent users
   * @returns {object} Complete system design
   */
  static generateDesign(appDescription, appType = 'generic', expectedUsers = 10000) {
    // Analyze description to identify key features
    const features = this.analyzeFeatures(appDescription);
    const requirements = this.deriveRequirements(appDescription, expectedUsers);
    
    return {
      title: this.generateTitle(appDescription),
      description: appDescription,
      appType,
      expectedUsers,
      
      architecture: {
        frontend: this.designFrontend(features),
        apiGateway: this.designAPIGateway(requirements),
        services: this.designServices(features, requirements),
        databases: this.designDatabases(features),
        cache: this.designCache(features, requirements),
        storage: this.designStorage(features),
        messageQueue: this.designMessageQueue(features),
        cdn: this.designCDN(features),
        monitoring: this.designMonitoring()
      },
      
      dataFlow: this.generateDataFlows(features),
      scalingStrategy: this.generateScalingStrategy(expectedUsers),
      estimatedMetrics: this.estimateMetrics(expectedUsers, features),
      deployment: this.designDeployment(features),
      failureHandling: this.designFailureHandling()
    };
  }

  // ─── ANALYSIS ───
  static analyzeFeatures(description) {
    const desc = description.toLowerCase();
    const features = {
      hasRealtime: /real.?time|live|instant|notification/i.test(desc),
      hasSearch: /search|filter|query/i.test(desc),
      hasPayment: /payment|pay|transaction|billing|charge/i.test(desc),
      hasVideo: /video|stream|watch|play/i.test(desc),
      hasChat: /chat|message|messaging|communicate|comment/i.test(desc),
      hasLocationBased: /location|map|nearby|geo|distance/i.test(desc),
      hasNotification: /notification|notify|alert|push/i.test(desc),
      hasUploads: /upload|image|photo|file|media/i.test(desc),
      hasAnalytics: /analytic|track|report|insight|statistic/i.test(desc),
      hasRecommendation: /recommend|personalize|custom|suggest|feed/i.test(desc)
    };
    return features;
  }

  static deriveRequirements(description, expectedUsers) {
    const desc = description.toLowerCase();
    const isCritical = /banking|payment|health|medical/i.test(desc);
    
    return {
      consistency: isCritical ? 'strong' : 'eventual',
      uptime: isCritical ? '99.99%' : '99.9%',
      dataRetention: /analytics|history|archive/i.test(desc) ? 'years' : 'months',
      scalability: expectedUsers > 100000 ? 'extreme' : 'high',
      latencySensitivity: /real.?time|live/i.test(desc) ? 'critical' : 'normal'
    };
  }

  // ─── COMPONENT DESIGN ───
  static designFrontend(features) {
    const platforms = ['Web (React/Vue)', 'Mobile (iOS/Android)'];
    
    if (features.hasVideo) platforms.push('TV App (Roku/AppleTV)');
    if (features.hasRealtime) platforms.push('Desktop App (Electron)');
    
    return {
      platforms,
      architecture: 'Single Page Application (SPA)',
      stateManagement: 'Redux/Vuex (complex) or Context API (simple)',
      caching: 'LocalStorage for user data, IndexedDB for offline',
      technologies: {
        web: 'React 18 + TypeScript + Vite',
        mobile: 'React Native or Flutter',
        realtime: 'WebSocket connections'
      }
    };
  }

  static designAPIGateway(requirements) {
    return {
      purpose: 'Single entry point for all client requests',
      technologies: ['Kong', 'AWS API Gateway', 'Nginx'],
      features: {
        rateLimit: true,
        authentication: true,
        loadBalancing: true,
        requestValidation: true,
        responseCompression: true,
        circuitBreaker: true,
        logging: true
      },
      configuration: {
        rateLimit: '10,000 req/min per user',
        timeout: '30 seconds',
        retry: '3 times with exponential backoff',
        compression: 'gzip (savings: 80%)'
      }
    };
  }

  static designServices(features, requirements) {
    const services = [];
    
    // Core services (always needed)
    services.push({
      name: 'User Service',
      responsibility: 'Authentication, profiles, preferences',
      technologies: 'Node.js / Python',
      scale: 'Medium (state-heavy)',
      dependencies: ['Database', 'Cache', 'Auth provider']
    });
    
    services.push({
      name: 'API Service',
      responsibility: 'Core business logic, main endpoints',
      technologies: 'Node.js / Go (high throughput)',
      scale: 'High (primary load)',
      dependencies: ['Database', 'Cache', 'Message Queue']
    });

    // Conditional services
    if (features.hasSearch) {
      services.push({
        name: 'Search Service',
        responsibility: 'Full-text search, filtering, sorting',
        technologies: 'Elasticsearch',
        scale: 'High (many queries)',
        dependencies: ['Elasticsearch cluster', 'Database for indexing']
      });
    }

    if (features.hasPayment) {
      services.push({
        name: 'Payment Service',
        responsibility: 'Payment processing, billing, settlements',
        technologies: 'Node.js (critical)',
        scale: 'Medium (but critical)',
        dependencies: ['Payment gateway', 'Database (ACID)', 'Audit log'],
        notes: 'Must guarantee ACID, retry logic for webhooks'
      });
    }

    if (features.hasChat) {
      services.push({
        name: 'Chat Service',
        responsibility: 'Message delivery, real-time updates',
        technologies: 'Node.js with WebSocket',
        scale: 'Very high (many concurrent users)',
        dependencies: ['WebSocket hub', 'Message Queue', 'Cache (user presence)']
      });
    }

    if (features.hasVideo) {
      services.push({
        name: 'Transcoding Service',
        responsibility: 'Convert videos to multiple qualities',
        technologies: 'FFmpeg, AWS Lambda',
        scale: 'Batch processing (runs asynchronously)',
        dependencies: ['S3', 'Message Queue', 'EC2 compute']
      });
    }

    if (features.hasRealtime) {
      services.push({
        name: 'Real-Time Service',
        responsibility: 'WebSocket connections, live updates',
        technologies: 'Node.js, Socket.io',
        scale: 'Very high (concurrent connections)',
        dependencies: ['Message Queue', 'Redis (pub/sub)']
      });
    }

    if (features.hasNotification) {
      services.push({
        name: 'Notification Service',
        responsibility: 'Email, SMS, push notifications',
        technologies: 'Node.js',
        scale: 'High throughput, asynchronous',
        dependencies: ['Message Queue', 'Email provider', 'Firebase/APNs']
      });
    }

    if (features.hasAnalytics) {
      services.push({
        name: 'Analytics Service',
        responsibility: 'Event collection, dashboards',
        technologies: 'Kafka, Spark, Snowflake',
        scale: 'Massive (1M+ events/sec)',
        dependencies: ['Kafka', 'Data warehouse', 'BI tool']
      });
    }

    return services;
  }

  static designDatabases(features) {
    const databases = [
      {
        type: 'Primary Database',
        name: 'PostgreSQL',
        purpose: 'Transactional data, user info, orders',
        replication: 'Primary + 2 Read Replicas',
        sharding: 'By user_id if > 100M records',
        backup: 'Daily snapshots to S3',
        estimatedSize: '500GB - 10TB'
      }
    ];

    if (features.hasSearch) {
      databases.push({
        type: 'Search Index',
        name: 'Elasticsearch',
        purpose: 'Full-text search',
        cluster: '3-6 nodes',
        sharding: '5 shards × 3 replicas',
        retention: 'Rolling (30 days for large datasets)',
        estimatedSize: '100GB - 1TB'
      });
    }

    if (features.hasAnalytics) {
      databases.push({
        type: 'Data Warehouse',
        name: 'Snowflake / BigQuery',
        purpose: 'Long-term analytics, historical data',
        updateFrequency: 'Batch (daily/nightly)',
        retention: '2-3 years',
        queryLatency: '10-60 seconds (batch processing)',
        estimatedSize: '1TB - 100TB'
      });
    }

    if (features.hasChat || features.hasRealtime) {
      databases.push({
        type: 'Time-Series Database',
        name: 'Redis Streams / TimescaleDB',
        purpose: 'Real-time events, chat history',
        retention: '24-48 hours (rolling window)',
        throughput: '1M+ events/sec',
        estimatedSize: '50GB - 500GB'
      });
    }

    return databases;
  }

  static designCache(features, requirements) {
    return {
      provider: 'Redis (cluster mode)',
      nodes: 6,
      deployment: 'Multi-region for availability',
      cachedData: [
        { key: 'user:{id}', ttl: '24h', purpose: 'User profile' },
        { key: 'products:{search}', ttl: '5m', purpose: 'Search results' },
        { key: 'sessions:{id}', ttl: '30d', purpose: 'Auth sessions' },
        { key: 'active_users', ttl: '1m', purpose: 'Real-time count' },
        { key: 'config:{service}', ttl: '1h', purpose: 'Feature flags' }
      ],
      evictionPolicy: 'LRU',
      persistence: 'RDB snapshots every 6h + AOF (append-only file)',
      monitoring: 'Memory usage, hit rate, evictions'
    };
  }

  static designStorage(features) {
    const storage = [];

    if (features.hasUploads || features.hasVideo) {
      storage.push({
        type: 'Object Storage',
        provider: 'AWS S3 / Google Cloud Storage',
        purpose: 'Images, videos, files',
        organization: 'Buckets by type: users/, products/, videos/',
        lifecycle: 'Move to Glacier after 90 days',
        cdn: 'CloudFront for global distribution',
        estimatedSize: '10TB - 1PB'
      });
    }

    if (features.hasVideo) {
      storage.push({
        type: 'CDN',
        provider: 'CloudFront / Akamai',
        locations: '300+ edge locations globally',
        cache: '1 year (content-addressed URLs)',
        costOptimization: 'Serve S3 content via CDN (avoid direct S3)'
      });
    }

    return storage;
  }

  static designMessageQueue(features) {
    if (!features.hasRealtime && !features.hasNotification) {
      return {
        provider: 'optional',
        note: 'Not required for simple systems'
      };
    }

    return {
      provider: 'Kafka (distributed streaming)',
      brokers: 3,
      topics: [
        'order.created',
        'order.updated',
        'notification.send',
        'analytics.event',
        'user.action'
      ],
      retention: '7 days',
      throughput: '100k - 1M msg/sec',
      consumers: [
        'Notification Service',
        'Analytics Pipeline',
        'Real-time Dashboards',
        'Archive to Data Warehouse'
      ],
      replication: '3 replicas per message (durability)'
    };
  }

  static designCDN(features) {
    return {
      purpose: 'Serve static content from edge locations near users',
      provider: 'CloudFront / Akamai / Fastly',
      locations: '300+ edge locations worldwide',
      cachedContent: [
        'HTML, CSS, JavaScript (app)',
        'Images (JPG, PNG, WebP)',
        'API responses (for read-heavy endpoints)',
        'Video segments (if applicable)'
      ],
      cache: {
        static: '1 year (versioned URLs)',
        dynamic: '5-60 minutes (API responses)',
        invalidation: 'Instant on deployment'
      },
      costSavings: '80-90% bandwidth cost reduction'
    };
  }

  static designMonitoring() {
    return {
      logging: {
        provider: 'ELK Stack / Splunk / DataDog',
        services: 'All services send logs to central location',
        retention: '30 days',
        alarms: 'Error rate > 0.1%, Response time > 500ms'
      },
      metrics: {
        provider: 'Prometheus + Grafana',
        metrics: ['CPU', 'Memory', 'Latency', 'Throughput', 'Error rate'],
        scrapeInterval: '15 seconds',
        retention: '15 days'
      },
      tracing: {
        provider: 'Jaeger / Zipkin',
        samplingRate: '10% of requests',
        traces: 'Follow request through all services'
      },
      alerting: {
        provider: 'PagerDuty / Opsgenie',
        sla: 'Response < 5 minutes for critical alerts'
      }
    };
  }

  // ─── WORKFLOWS ───
  static generateDataFlows(features) {
    const flows = [];

    flows.push({
      name: 'Request Pipeline',
      steps: [
        'Client request → CDN (serves static, cache hits)',
        'Dynamic request → API Gateway (rate limit, auth)',
        'Routed → Correct service (service mesh)',
        'Service → Database (or cache hit avoids DB)',
        'Response → Compress (gzip 80% reduction)',
        'CDN cache static parts',
        'Return to client'
      ]
    });

    if (features.hasSearch) {
      flows.push({
        name: 'Search Flow',
        steps: [
          'User types query',
          'Debounce 500ms',
          'Send to search service',
          'Query Elasticsearch index',
          'Return 1000 results ranked by TF-IDF',
          'Fetch full details from cache/DB',
          'Return paginated results'
        ]
      });
    }

    if (features.hasRealtime || features.hasChat) {
      flows.push({
        name: 'Real-Time Updates',
        steps: [
          'WebSocket connection established',
          'Action happens (order placed, message sent)',
          'Event published to message queue',
          'Service subscribes to event',
          'Event sent via WebSocket to relevant clients',
          'Clients update UI instantly'
        ]
      });
    }

    if (features.hasNotification) {
      flows.push({
        name: 'Notification Delivery',
        steps: [
          'Service publishes notification event',
          'Queue: notification.send',
          'Notification service polls queue',
          'Send email / SMS / push (external services)',
          'Retry failed notifications (exponential backoff)',
          'Log delivery status'
        ]
      });
    }

    return flows;
  }

  static generateScalingStrategy(expectedUsers) {
    const tiers = [
      { users: '< 10k', approach: 'Single server + DB' },
      { users: '10k - 100k', approach: 'Monolith + DB replicas' },
      { users: '100k - 1M', approach: 'Multiple service instances + sharding' },
      { users: '1M+', approach: 'Microservices + extreme sharding + multi-region' }
    ];

    const scaling = {
      horizontal: 'Add more machines (preferred)',
      vertical: 'Bigger machines (when needed)',
      database: 'Sharding by user_id / region',
      cache: 'Redis cluster expansion',
      cdn: 'Automatic (AWS handles)',
      messaging: 'Kafka partition scaling'
    };

    return { tiers, currentTier: this.scaleTier(expectedUsers), scaling };
  }

  static scaleTier(users) {
    if (users < 10000) return '< 10k';
    if (users < 100000) return '10k - 100k';
    if (users < 1000000) return '100k - 1M';
    return '1M+';
  }

  static estimateMetrics(expectedUsers, features) {
    // Estimate based on expected users and features
    const ordersPerDay = Math.max(expectedUsers * 0.1, 0); // 10% make orders
    const messagesPerDay = features.hasChat ? expectedUsers * 10 : 0; // 10 messages/user/day
    const requestsPerSecond = expectedUsers * 0.5; // 50% peak concurrent
    
    return {
      peakConcurrentUsers: expectedUsers,
      requestsPerSecond: Math.ceil(requestsPerSecond),
      requestsPerDay: Math.ceil(requestsPerSecond * 86400),
      dataGenerated: `${Math.ceil(requestsPerSecond * 1000 / 1000000)} GB/day`,
      estimatedDBSize: `${Math.ceil(expectedUsers * 0.5 / 1000)} GB`,
      estimatedCacheSize: `${Math.ceil(expectedUsers * 0.01)} GB`,
      estimatedMonthlyData: `${Math.ceil(requestsPerSecond * 2592000 / 1000000000)} TB`
    };
  }

  static designDeployment(features) {
    return {
      containerization: 'Docker for all services',
      orchestration: 'Kubernetes (EKS / GKE / AKS)',
      cicd: 'GitHub Actions → Build → Test → Deploy',
      deploymentStrategy: 'Canary (5% → 25% → 100%) with automatic rollback',
      environments: ['Dev', 'Staging', 'Production'],
      database: 'Managed (RDS, Cloud SQL) for ease',
      disaster: 'Multi-region failover, RTO: 5 min, RPO: 1 min',
      cost: 'Infrastructure as Code (Terraform / CloudFormation)'
    };
  }

  static designFailureHandling() {
    return {
      circuitBreaker: 'Fail fast when service down',
      timeout: '30 seconds per request',
      retry: '3 times with 1s, 2s, 4s exponential backoff',
      fallback: 'Return cached data if service fails',
      healthCheck: 'Every service exposes /health endpoint',
      autoScaling: 'Scale up on CPU > 70%',
      loadShedding: 'Return 429 when overloaded'
    };
  }

  // ─── HELPER ───
  static generateTitle(description) {
    const words = description.split(' ').slice(0, 3).join(' ');
    return `${words} System Architecture`;
  }
}

export default SystemDesignGenerator;
