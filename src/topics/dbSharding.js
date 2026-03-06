/**
 * Topic: Database Sharding & Replication
 */
import { DatabaseNode, ClientNode, ServerNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'db-sharding',
    title: 'DB Sharding & Replication',
    icon: '🗄️',
    description: 'Partition data across multiple databases and replicate for fault tolerance and read scalability.',
    tags: ['Database', 'Horizontal Scaling', 'Replication'],
    accentGrad: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const app = new ServerNode(cx - 200, cy, 'App Server');
    engine.addEntity(app);

    // Shards
    const shards = [];
    const replicas = [];
    for (let i = 0; i < 3; i++) {
        const shard = new DatabaseNode(cx + 120, cy - 140 + i * 140, `Shard ${i + 1}`);
        shard.isMaster = true;
        engine.addEntity(shard);
        shards.push(shard);

        const replica = new DatabaseNode(cx + 300, cy - 140 + i * 140, `Replica ${i + 1}`);
        engine.addEntity(replica);
        replicas.push(replica);

        engine.addConnection(new ArrowConnection(app, shard, { color: 'rgba(139,92,246,0.2)', activeColor: COLORS.database }));
        engine.addConnection(new ArrowConnection(shard, replica, { color: 'rgba(245,158,11,0.15)', activeColor: COLORS.warning, dashed: true, label: 'sync' }));
    }

    const shardLabel = new TextLabel(cx + 120, cy - 220, '🔑 Shard Key: user_id % 3', {
        fontSize: 12, color: COLORS.violet, bg: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.2)'
    });
    shardLabel.visible = false;
    engine.addEntity(shardLabel);

    engine.setSteps([
        {
            title: 'Why Sharding?',
            description: 'When a single database can\'t handle the data volume or traffic, we split data across multiple databases called <strong>shards</strong>. Each shard holds a subset of the data.',
            duration: 4500,
            setup: () => {
                shards.forEach(s => s.highlight = true);
                shardLabel.visible = false;
            }
        },
        {
            title: 'Shard Key Selection',
            description: 'A <strong>shard key</strong> determines which shard stores each record. For example, <strong>user_id % 3</strong> distributes users across 3 shards. Good shard keys ensure <strong>even distribution</strong>.',
            duration: 5000,
            setup: () => {
                shardLabel.visible = true;
                shards.forEach(s => s.highlight = false);
            },
            update: (eng, stepTime) => {
                const t = Math.floor(stepTime / 1500);
                if (t < 3 && stepTime % 1500 < 50) {
                    shards[t].highlight = true;
                    eng.addParticle(new DataPacket(app, shards[t], {
                        speed: 0.002, color: COLORS.database,
                        label: `user_${t * 100 + 1}`,
                        onArrive: () => { setTimeout(() => { shards[t].highlight = false; }, 600); }
                    }));
                }
            }
        },
        {
            title: 'Write to Primary Shard',
            description: 'Write operations go to the <strong>primary (master) shard</strong>. The primary shard is the source of truth for its partition of data.',
            duration: 4500,
            setup: () => {
                shardLabel.visible = true;
                shards.forEach(s => { s.isMaster = true; s.highlight = false; });
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    eng.addParticle(new DataPacket(app, shards[1], {
                        speed: 0.002, color: COLORS.warning, label: 'WRITE',
                        onArrive: () => { shards[1].highlight = true; shards[1].flash && shards[1].flash; }
                    }));
                }
            }
        },
        {
            title: 'Replication for Fault Tolerance',
            description: 'Each primary shard <strong>replicates</strong> data to one or more <strong>read replicas</strong>. Replicas handle <strong>read traffic</strong> and provide <strong>failover</strong> if the primary goes down.',
            duration: 5000,
            setup: () => {
                replicas.forEach(r => r.highlight = true);
                shardLabel.visible = false;
            },
            update: (eng, stepTime) => {
                if (stepTime > 800 && stepTime < 900) {
                    shards.forEach((s, i) => {
                        setTimeout(() => {
                            eng.addParticle(new DataPacket(s, replicas[i], {
                                speed: 0.0015, color: COLORS.warning, label: 'SYNC'
                            }));
                        }, i * 500);
                    });
                }
            }
        },
        {
            title: 'Key Takeaways',
            description: '<strong>Sharding</strong> enables horizontal scaling. <strong>Replication</strong> provides high availability and read scalability. Challenges: cross-shard queries, rebalancing, and choosing the right shard key. Used by <strong>MongoDB</strong>, <strong>Cassandra</strong>, <strong>MySQL Vitess</strong>.',
            duration: 5000,
            setup: () => {
                shards.forEach(s => s.highlight = true);
                replicas.forEach(r => r.highlight = true);
                app.highlight = true;
            }
        }
    ]);
}
