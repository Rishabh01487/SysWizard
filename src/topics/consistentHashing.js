/**
 * Topic: Consistent Hashing
 */
import { HashRing, ServerNode, TextLabel, COLORS, Entity } from '../engine/entities.js';

export const metadata = {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    icon: '💍',
    description: 'Distribute data across nodes with minimal redistribution when nodes are added or removed.',
    tags: ['Distributed Systems', 'Hash Ring', 'Scaling'],
    accentGrad: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const ring = new HashRing(cx, cy, 150, 'Hash Ring');
    engine.addEntity(ring);

    // Info label
    const info = new TextLabel(cx, cy + 220, '', {
        fontSize: 12, color: COLORS.warning, bg: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)'
    });
    info.visible = false;
    engine.addEntity(info);

    engine.setSteps([
        {
            title: 'The Problem with Simple Hashing',
            description: 'Simple <strong>hash(key) % N</strong> breaks when you add/remove servers — <strong>almost all keys</strong> need to be remapped. Consistent hashing solves this by minimizing redistribution.',
            duration: 5000,
            setup: () => {
                ring.nodes = [];
                ring.keys = [];
                info.visible = true;
                info.text = 'hash(key) % N → breaks when N changes!';
            }
        },
        {
            title: 'The Hash Ring',
            description: 'Imagine a circular <strong>hash ring</strong> (0 to 2³²). Both <strong>servers</strong> and <strong>keys</strong> are mapped onto this ring using a hash function.',
            duration: 4500,
            setup: () => {
                ring.nodes = [];
                ring.keys = [];
                ring.addNode(0, 'S1', COLORS.server);
                ring.addNode(Math.PI * 2 / 3, 'S2', COLORS.cache);
                ring.addNode(Math.PI * 4 / 3, 'S3', COLORS.gateway);
                info.text = 'Servers are placed on the ring by hashing their IDs';
                info.visible = true;
            }
        },
        {
            title: 'Mapping Keys to Servers',
            description: 'A key is mapped to the <strong>first server clockwise</strong> from its position on the ring. This determines which server stores the key.',
            duration: 5000,
            setup: () => {
                ring.keys = [];
                ring.addKey(0.3, 'K1');
                ring.addKey(1.2, 'K2');
                ring.addKey(2.8, 'K3');
                ring.addKey(4.5, 'K4');
                ring.addKey(5.5, 'K5');
                info.text = 'Each key → nearest server clockwise';
            }
        },
        {
            title: 'Adding a New Server',
            description: 'When a <strong>new server (S4)</strong> is added, only the keys between S4 and its predecessor need to move — <strong>most keys stay put</strong>! Only ~1/N of keys are affected.',
            duration: 5000,
            setup: () => {
                ring.addNode(Math.PI, 'S4', COLORS.queue);
                info.text = 'Only ~K/N keys move (vs ALL keys with simple hash)';
            }
        },
        {
            title: 'Removing a Server',
            description: 'When <strong>S2 goes down</strong>, only its keys move to the next server clockwise. Other servers are <strong>unaffected</strong>. This provides fault tolerance with minimal disruption.',
            duration: 5000,
            setup: () => {
                ring.nodes = ring.nodes.filter(n => n.label !== 'S2');
                info.text = 'Only S2\'s keys need reassignment';
            }
        },
        {
            title: 'Virtual Nodes',
            description: '<strong>Virtual nodes</strong> solve uneven distribution. Each physical server has multiple virtual positions on the ring, ensuring <strong>even load distribution</strong>. Used by <strong>DynamoDB</strong>, <strong>Cassandra</strong>, <strong>Memcached</strong>.',
            duration: 5000,
            setup: () => {
                ring.nodes = [];
                // S1 virtual nodes
                ring.addNode(0, 'S1', COLORS.server);
                ring.addNode(Math.PI, 'S1', COLORS.server);
                // S3 virtual nodes
                ring.addNode(Math.PI * 2 / 3, 'S3', COLORS.gateway);
                ring.addNode(Math.PI * 5 / 3, 'S3', COLORS.gateway);
                // S4 virtual nodes
                ring.addNode(Math.PI / 3, 'S4', COLORS.queue);
                ring.addNode(Math.PI * 4 / 3, 'S4', COLORS.queue);
                info.text = 'Virtual nodes → better load balance';
            }
        }
    ]);
}
