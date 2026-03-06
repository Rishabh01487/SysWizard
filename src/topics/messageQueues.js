/**
 * Topic: Message Queues
 */
import { ServerNode, ClientNode, QueueNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'message-queues',
    title: 'Message Queues',
    icon: '📨',
    description: 'Decouple services with asynchronous communication using message queues like Kafka and RabbitMQ.',
    tags: ['Async', 'Kafka', 'RabbitMQ', 'Pub/Sub'],
    accentGrad: 'linear-gradient(135deg, #ec4899, #f472b6)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // Producers
    const producers = [];
    for (let i = 0; i < 2; i++) {
        const p = new ServerNode(cx - 300, cy - 70 + i * 140, `Producer ${i + 1}`);
        engine.addEntity(p);
        producers.push(p);
    }

    // Queue
    const queue = new QueueNode(cx, cy, 'Message Queue');
    engine.addEntity(queue);

    // Consumers
    const consumers = [];
    for (let i = 0; i < 3; i++) {
        const c = new ServerNode(cx + 300, cy - 120 + i * 120, `Consumer ${i + 1}`);
        engine.addEntity(c);
        consumers.push(c);
    }

    // Connections
    producers.forEach(p => {
        engine.addConnection(new ArrowConnection(p, queue, { color: 'rgba(236,72,153,0.2)', activeColor: COLORS.queue }));
    });
    consumers.forEach(c => {
        engine.addConnection(new ArrowConnection(queue, c, { color: 'rgba(236,72,153,0.2)', activeColor: COLORS.queue }));
    });

    engine.setSteps([
        {
            title: 'What are Message Queues?',
            description: 'A <strong>Message Queue</strong> acts as a buffer between services. Producers send messages to the queue, and consumers process them <strong>asynchronously</strong>. This <strong>decouples</strong> services.',
            duration: 4500,
            setup: () => {
                queue.highlight = true;
                queue.messages = 0;
            }
        },
        {
            title: 'Producers Publish Messages',
            description: '<strong>Producers</strong> send messages (events, tasks, data) to the queue. They don\'t need to know which consumer will process the message.',
            duration: 5000,
            setup: () => {
                producers.forEach(p => p.highlight = true);
                queue.messages = 0;
            },
            update: (eng, stepTime) => {
                const interval = 800;
                const tick = Math.floor(stepTime / interval);
                if (tick < 5 && stepTime % interval < 50) {
                    const pi = tick % producers.length;
                    eng.addParticle(new DataPacket(producers[pi], queue, {
                        speed: 0.002, color: COLORS.queue, label: `msg_${tick + 1}`,
                        onArrive: () => { queue.messages = Math.min(queue.maxMessages, queue.messages + 1); }
                    }));
                }
            }
        },
        {
            title: 'Queue Buffers Messages',
            description: 'The queue <strong>stores messages</strong> until consumers are ready. This handles <strong>traffic spikes</strong> — producers can publish faster than consumers process.',
            duration: 4000,
            setup: () => {
                queue.messages = 6;
                queue.highlight = true;
                producers.forEach(p => p.highlight = false);
            }
        },
        {
            title: 'Consumers Process Messages',
            description: '<strong>Consumers</strong> pull messages from the queue and process them. Multiple consumers can process messages <strong>in parallel</strong>, increasing throughput.',
            duration: 5500,
            setup: () => {
                queue.messages = 6;
                consumers.forEach(c => c.highlight = true);
            },
            update: (eng, stepTime) => {
                const interval = 900;
                const tick = Math.floor(stepTime / interval);
                if (tick < 4 && stepTime % interval < 50) {
                    const ci = tick % consumers.length;
                    eng.addParticle(new DataPacket(queue, consumers[ci], {
                        speed: 0.0018, color: COLORS.success, label: `process`,
                        onArrive: () => { queue.messages = Math.max(0, queue.messages - 1); }
                    }));
                }
            }
        },
        {
            title: 'Key Takeaways',
            description: 'Message queues provide <strong>decoupling</strong>, <strong>resilience</strong>, and <strong>scalability</strong>. Patterns: Point-to-Point, Pub/Sub, Fan-Out. Tools: <strong>Apache Kafka</strong>, <strong>RabbitMQ</strong>, <strong>Amazon SQS</strong>, <strong>Redis Streams</strong>.',
            duration: 4500,
            setup: () => {
                queue.highlight = true;
                producers.forEach(p => p.highlight = true);
                consumers.forEach(c => c.highlight = true);
                queue.messages = 3;
            }
        }
    ]);
}
