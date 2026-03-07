/**
 * Bespoke Animation: Caching
 * Metaphor: The Library vs The Desk
 */
import { ServerNode, DatabaseNode, CacheNode, ArrowConnection, DataPacket, TextLabel, COLORS } from '../../engine/entities.js';

export function setupCachingBespoke(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // ─── Entities ───
    const title = new TextLabel(cx, 40, '⚡ Caching: The Desk vs The Library', { fontSize: 18, color: '#f4f0ff', bg: 'rgba(16,185,129,0.1)' });
    engine.addEntity(title);

    const app = new ServerNode(cx - 250, cy, 'Your App\n(You at a Desk)');
    app.color = COLORS.client;
    app.glowColor = COLORS.clientGlow;
    engine.addEntity(app);

    const cache = new CacheNode(cx, cy - 80, 'Redis Cache\n(Your Desk)');
    engine.addEntity(cache);

    const db = new DatabaseNode(cx + 250, cy, 'PostgreSQL DB\n(The Public Library)');
    engine.addEntity(db);

    // Connections
    const appToCache = new ArrowConnection(app, cache, { color: 'rgba(16,185,129,0.3)', dashed: true, label: 'Fast (1ms)' });
    const appToDb = new ArrowConnection(app, db, { color: 'rgba(59,130,246,0.3)', dashed: true, label: 'Slow (50ms)' });
    const cacheToDb = new ArrowConnection(cache, db, { color: 'rgba(255,255,255,0.1)', dashed: true, label: 'Sync' });

    engine.addConnection(appToCache);
    engine.addConnection(appToDb);
    engine.addConnection(cacheToDb);

    // Initial state
    cache.visible = false;
    appToCache.visible = false;
    cacheToDb.visible = false;

    // ─── Steps ───
    const steps = [
        {
            title: '1. Life Without a Cache',
            description: 'Imagine you need a specific book. Without a cache, you have to walk all the way to the public library (the Database), find the book, and walk back. It takes a long time.',
            duration: 6000,
            setup: () => {
                cache.visible = false;
                appToCache.visible = false;
                cacheToDb.visible = false;

                app.highlight = true;
                db.highlight = true;
                appToDb.active = true;

                // Slow DB query
                const req = new DataPacket(app, db, { color: COLORS.client, speed: 0.003, label: 'SELECT *' });
                req.onArrive = () => {
                    db.highlight = false;
                    db.drawGlow(engine.ctx, db.x, db.y, 80, COLORS.warning);

                    // Simulate DB thinking slowly
                    setTimeout(() => {
                        const res = new DataPacket(db, app, { color: COLORS.database, speed: 0.003, label: '{ data }' });
                        engine.addParticle(res);
                        db.highlight = true;
                    }, 1500);
                };
                engine.addParticle(req);
            }
        },
        {
            title: '2. The First Request (Cache Miss)',
            description: 'Now we add a Cache (like keeping the book on your desk). The first time you need the book, it\'s not on your desk (Cache Miss). You still have to go to the Library (DB).',
            duration: 7000,
            setup: () => {
                cache.visible = true;
                appToCache.visible = true;
                cacheToDb.visible = true;

                app.highlight = true;
                cache.highlight = true;
                db.highlight = true;

                appToCache.active = true;
                appToDb.active = false;

                // Check cache first
                const req = new DataPacket(app, cache, { color: COLORS.client, speed: 0.008, label: 'GET user:1' });
                req.onArrive = () => {
                    cache.flash(COLORS.error); // Miss

                    // Fallback to DB
                    setTimeout(() => {
                        cacheToDb.active = true;
                        const dbReq = new DataPacket(cache, db, { color: COLORS.client, speed: 0.003, label: 'SELECT *' });
                        dbReq.onArrive = () => {
                            setTimeout(() => {
                                const dbRes = new DataPacket(db, cache, { color: COLORS.database, speed: 0.003, label: '{ data }' });
                                dbRes.onArrive = () => {
                                    // Save to cache
                                    cache.flash(COLORS.success);

                                    // Return to app
                                    const finalRes = new DataPacket(cache, app, { color: COLORS.cache, speed: 0.008, label: '{ data }' });
                                    engine.addParticle(finalRes);
                                };
                                engine.addParticle(dbRes);
                            }, 1000);
                        };
                        engine.addParticle(dbReq);
                    }, 500);
                };
                engine.addParticle(req);
            }
        },
        {
            title: '3. The Second Request (Cache Hit)',
            description: 'You need the exact same book again. This time, it\'s right there on your desk! You grab it instantly (Cache Hit). The Database never even knows you needed it.',
            duration: 4000,
            setup: () => {
                db.highlight = false;
                cacheToDb.active = false;

                const repeatedHit = () => {
                    if (engine.currentStep !== 2) return; // Stop if step changed

                    const req = new DataPacket(app, cache, { color: COLORS.client, speed: 0.015, label: 'GET user:1' });
                    req.onArrive = () => {
                        cache.flash(COLORS.success); // Hit!

                        // Instant return
                        const res = new DataPacket(cache, app, { color: COLORS.cache, speed: 0.015, label: '{ data }' });
                        engine.addParticle(res);

                        // Trigger next hit soon
                        setTimeout(repeatedHit, 1500);
                    };
                    engine.addParticle(req);
                };
                repeatedHit();
            }
        },
        {
            title: '4. Cache Invalidation (The Problem)',
            description: 'What happens if the book at the library is updated? The copy on your desk is now old (Stale Data). The cache needs to be Invalidated (cleared) so you fetch the new version next time.',
            duration: 6000,
            setup: () => {
                db.highlight = true;

                // Write directly to DB
                const writeReq = new DataPacket(app, db, { color: COLORS.warning, speed: 0.005, label: 'UPDATE user:1' });
                appToDb.active = true;

                writeReq.onArrive = () => {
                    db.drawGlow(engine.ctx, db.x, db.y, 80, COLORS.success);

                    // Invalidate cache
                    setTimeout(() => {
                        cacheToDb.active = true;
                        const invReq = new DataPacket(db, cache, { color: COLORS.error, speed: 0.01, label: 'DEL user:1' });
                        invReq.onArrive = () => {
                            cache.flash(COLORS.error); // Cleared
                        };
                        engine.addParticle(invReq);
                    }, 500);
                };
                engine.addParticle(writeReq);
            }
        }
    ];

    engine.setSteps(steps);
}
