/**
 * Topic: Caching
 * Visualizes cache hit/miss flow, TTL expiry, and cache invalidation.
 */
import { ServerNode, ClientNode, DatabaseNode, CacheNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../engine/entities.js';

export const metadata = {
    id: 'caching',
    title: 'Caching',
    icon: '⚡',
    description: 'Store frequently accessed data in fast storage to reduce latency and database load.',
    tags: ['Performance', 'Redis', 'CDN', 'TTL'],
    accentGrad: 'linear-gradient(135deg, #10b981, #34d399)',
};

export function setup(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    const client = new ClientNode(cx - 320, cy, 'Client');
    const appServer = new ServerNode(cx - 100, cy, 'App Server');
    const cache = new CacheNode(cx + 100, cy - 100, 'Redis Cache');
    const db = new DatabaseNode(cx + 100, cy + 100, 'Database');

    engine.addEntity(client);
    engine.addEntity(appServer);
    engine.addEntity(cache);
    engine.addEntity(db);

    const connClientApp = engine.addConnection(new ArrowConnection(client, appServer, { color: 'rgba(34,211,238,0.2)', activeColor: COLORS.client }));
    const connAppCache = engine.addConnection(new ArrowConnection(appServer, cache, { color: 'rgba(16,185,129,0.2)', activeColor: COLORS.cache }));
    const connAppDb = engine.addConnection(new ArrowConnection(appServer, db, { color: 'rgba(139,92,246,0.2)', activeColor: COLORS.database }));
    const connCacheApp = engine.addConnection(new ArrowConnection(cache, appServer, { color: 'rgba(16,185,129,0.15)', activeColor: COLORS.success, dashed: true }));
    const connDbApp = engine.addConnection(new ArrowConnection(db, appServer, { color: 'rgba(139,92,246,0.15)', activeColor: COLORS.database, dashed: true }));
    connCacheApp.visible = false;
    connDbApp.visible = false;

    const hitLabel = new TextLabel(cx + 160, cy - 150, '✅ CACHE HIT', {
        fontSize: 14, color: COLORS.success, bg: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)'
    });
    hitLabel.visible = false;
    engine.addEntity(hitLabel);

    const missLabel = new TextLabel(cx + 160, cy - 150, '❌ CACHE MISS', {
        fontSize: 14, color: COLORS.error, bg: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)'
    });
    missLabel.visible = false;
    engine.addEntity(missLabel);

    engine.setSteps([
        {
            title: 'What is Caching?',
            description: '<strong>Caching</strong> stores copies of frequently accessed data in a faster storage layer (like <strong>Redis</strong> or <strong>Memcached</strong>) so future requests can be served faster without hitting the database.',
            duration: 4000,
            setup: () => {
                cache.highlight = true;
                hitLabel.visible = false;
                missLabel.visible = false;
                connCacheApp.visible = false;
                connDbApp.visible = false;
            }
        },
        {
            title: 'Cache Hit — Fast Response',
            description: 'When data <strong>exists in the cache</strong>, the server retrieves it directly — this is a <strong>Cache Hit</strong>. Response time is <strong>~1ms</strong> vs <strong>~100ms</strong> from the database.',
            duration: 5000,
            setup: () => {
                hitLabel.visible = true;
                missLabel.visible = false;
                connCacheApp.visible = true;
                connDbApp.visible = false;
                cache.flash(COLORS.success);
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    connClientApp.active = true;
                    eng.addParticle(new DataPacket(client, appServer, {
                        speed: 0.002, color: COLORS.client, label: 'GET /user',
                        onArrive: () => {
                            connClientApp.active = false;
                            connAppCache.active = true;
                            eng.addParticle(new DataPacket(appServer, cache, {
                                speed: 0.002, color: COLORS.cache, label: 'LOOKUP',
                                onArrive: () => {
                                    connAppCache.active = false;
                                    cache.flash(COLORS.success);
                                    connCacheApp.active = true;
                                    eng.addParticle(new DataPacket(cache, appServer, {
                                        speed: 0.002, color: COLORS.success, label: 'HIT ✓',
                                        onArrive: () => { connCacheApp.active = false; }
                                    }));
                                }
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Cache Miss — Database Fallback',
            description: 'When data is <strong>NOT in the cache</strong>, the server must fetch it from the <strong>database</strong> — this is a <strong>Cache Miss</strong>. The data is then stored in the cache for future requests.',
            duration: 6000,
            setup: () => {
                hitLabel.visible = false;
                missLabel.visible = true;
                connCacheApp.visible = true;
                connDbApp.visible = true;
                cache.flash(COLORS.error);
            },
            update: (eng, stepTime) => {
                if (stepTime > 500 && stepTime < 600) {
                    connAppCache.active = true;
                    eng.addParticle(new DataPacket(appServer, cache, {
                        speed: 0.002, color: COLORS.cache, label: 'LOOKUP',
                        onArrive: () => {
                            connAppCache.active = false;
                            cache.flash(COLORS.error);
                            // Miss → go to DB
                            connAppDb.active = true;
                            eng.addParticle(new DataPacket(appServer, db, {
                                speed: 0.0015, color: COLORS.database, label: 'QUERY',
                                onArrive: () => {
                                    connAppDb.active = false;
                                    connDbApp.active = true;
                                    eng.addParticle(new DataPacket(db, appServer, {
                                        speed: 0.0015, color: COLORS.database, label: 'DATA',
                                        onArrive: () => {
                                            connDbApp.active = false;
                                            // Store in cache
                                            eng.addParticle(new DataPacket(appServer, cache, {
                                                speed: 0.002, color: COLORS.success, label: 'STORE',
                                                onArrive: () => { cache.flash(COLORS.success); }
                                            }));
                                        }
                                    }));
                                }
                            }));
                        }
                    }));
                }
            }
        },
        {
            title: 'Cache Eviction & TTL',
            description: 'Cached data has a <strong>TTL (Time To Live)</strong>. After the TTL expires, the data is evicted from the cache. Eviction policies include <strong>LRU</strong> (Least Recently Used) and <strong>LFU</strong> (Least Frequently Used).',
            duration: 4500,
            setup: () => {
                hitLabel.visible = false;
                missLabel.visible = false;
                cache.highlight = true;
                cache.flash(COLORS.warning);
            }
        },
        {
            title: 'Key Takeaways',
            description: 'Caching reduces <strong>latency</strong>, <strong>database load</strong>, and <strong>costs</strong>. Common tools: <strong>Redis</strong>, <strong>Memcached</strong>, <strong>CDN</strong> (CloudFlare, Akamai). Strategies: Cache-Aside, Write-Through, Write-Behind.',
            duration: 5000,
            setup: () => {
                cache.highlight = true;
                appServer.highlight = true;
                db.highlight = true;
                connCacheApp.visible = false;
                connDbApp.visible = false;
            }
        }
    ]);
}
