export const KNOWLEDGE_BASE_NOTES = [
    {
        id: 'fundamentals',
        title: 'System Design Fundamentals',
        icon: '🧱',
        content: `
### What is System Design?
System design is the process of defining the architecture, modules, interfaces, and data for a system to satisfy specified requirements.

### Key Concepts
1. **Scalability**: The capability of a system to handle a growing amount of work.
   - **Vertical Scaling (Scale Up)**: Adding more power (CPU, RAM) to an existing machine.
   - **Horizontal Scaling (Scale Out)**: Adding more machines into your pool of resources.
2. **Latency vs Throughput**:
   - **Latency**: The time to perform some action or to produce some result.
   - **Throughput**: The number of such actions or results per unit of time.
3. **Availability**: The percentage of time a system is operational. (e.g., 99.9% uptime).
4. **Consistency**: ensuring that all nodes in a distributed system see the same data at the same time.

### CAP Theorem
It is impossible for a distributed data store to simultaneously provide more than two out of the following three guarantees:
- **C**onsistency: Every read receives the most recent write or an error.
- **A**vailability: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
- **P**artition tolerance: The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.

<div class="note-chart-placeholder">
    <div class="bar-row">
        <span>Consistency</span>
        <div class="bar" style="width: 80%; background: #4ade80;"></div>
    </div>
    <div class="bar-row">
        <span>Availability</span>
        <div class="bar" style="width: 80%; background: #3b82f6;"></div>
    </div>
    <div class="bar-row">
        <span>Partition Tolerance</span>
        <div class="bar" style="width: 100%; background: #a855f7;"></div>
    </div>
    <p style="font-size:0.8rem; color:var(--text-3); text-align:center; margin-top:8px;">You can only pick two in a distributed system!</p>
</div>
        `
    },
    {
        id: 'ml_integration',
        title: 'Machine Learning Workflows',
        icon: '🧠',
        content: `
### ML System Architecture
Integrating Machine Learning into a production system requires distinct pipelines for training and inference.

### 1. Training Pipeline
- **Data Ingestion**: Collecting raw data from various sources (Logs, DBs, Events).
- **Data Preprocessing**: Cleaning, normalizing, and extracting features.
- **Model Training**: Utilizing distributed computing (e.g., Spark, Ray) to train models (TensorFlow, PyTorch).
- **Model Evaluation & Registry**: Testing the model against a validation set and storing it in a model registry (e.g., MLflow).

### 2. Inference Pipeline (Serving)
- **Batch Inference**: Generating predictions on a schedule for a large batch of data. (e.g., nightly product recommendations).
- **Real-time Inference**: Serving predictions via an API (e.g., REST/gRPC) in milliseconds. (e.g., Fraud detection on a credit card swipe).

### Feedback Loop
Predictions and actual outcomes must be logged and fed back into the training pipeline to detect **Data Drift** and retrain the model.

<div class="note-workflow">
    <code>Data → Feature Engineering → Training ↻ Evaluation → Model Registry → Serving API</code>
</div>
        `
    },
    {
        id: 'advanced_patterns',
        title: 'Advanced Architecture Patterns',
        icon: '🏗️',
        content: `
### Microservices vs Monolith
- **Monolith**: All components of an application are tightly coupled and deployable as a single unit. Easy to develop initially, hard to scale independently.
- **Microservices**: Application is composed of small, independent services that communicate over well-defined APIs. Enables independent scaling and deployment, but adds operational complexity (networking, tracing).

### Event-Driven Architecture
Services communicate by emitting and reacting to events rather than direct API calls.
- **Message Brokers**: RabbitMQ, ActiveMQ (Traditional queues).
- **Event Streaming**: Apache Kafka, AWS Kinesis (Append-only logs).
- **Benefits**: Decoupling, asynchronous processing, built-in retry mechanisms.

### Saga Pattern
Handling distributed transactions across multiple microservices.
- **Choreography**: Each service emits an event, and other services listen and react. Decentralized.
- **Orchestration**: A central Coordinator service tells other services what to do. Centralized control.

### API Gateway
A single entry point for all clients. Handles routing, rate limiting, authentication, and SSL termination.
        `
    }
];
