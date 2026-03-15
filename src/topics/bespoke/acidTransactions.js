/**
 * ACID Transactions — Bespoke Animation
 * Visualizes a bank transfer with Atomicity, Consistency, Isolation, Durability
 */
import {
    ServerNode, DatabaseNode, ClientNode, CacheNode,
    ArrowConnection, DataPacket, TextLabel, COLORS
} from '../../engine/entities.js';

export function setupAcidTransactionsBespoke(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // ── Nodes ──────────────────────────────────────────────────────────────
    const app       = new ClientNode  (cx - 280, cy - 60, 'App / Client');
    const txMgr     = new ServerNode  (cx,        cy - 60, 'Transaction Mgr');
    const dbA       = new DatabaseNode(cx - 130,  cy + 90, 'Account A\n(Debit)');
    const dbB       = new DatabaseNode(cx + 130,  cy + 90, 'Account B\n(Credit)');
    const commitLog = new CacheNode   (cx + 280,  cy - 60, 'Commit\nLog (WAL)');

    [app, txMgr, dbA, dbB, commitLog].forEach(e => engine.addEntity(e));

    // ── Connections ────────────────────────────────────────────────────────
    const c1 = new ArrowConnection(app,    txMgr,     { color: 'rgba(168,85,247,0.15)', activeColor: COLORS.accent });
    const c2 = new ArrowConnection(txMgr,  dbA,       { color: 'rgba(168,85,247,0.12)', activeColor: '#f59e0b' });
    const c3 = new ArrowConnection(txMgr,  dbB,       { color: 'rgba(168,85,247,0.12)', activeColor: '#10b981' });
    const c4 = new ArrowConnection(txMgr,  commitLog, { color: 'rgba(59,130,246,0.12)', activeColor: '#60a5fa' });
    const c5 = new ArrowConnection(txMgr,  app,       { color: 'rgba(34,197,94,0.12)',  activeColor: '#22c55e' });

    [c1, c2, c3, c4, c5].forEach(c => engine.addConnection(c));

    // ── Title ──────────────────────────────────────────────────────────────
    engine.addEntity(new TextLabel(cx, 28, '🔐 ACID Transactions — Bank Transfer Example', {
        fontSize: 14, color: '#f4f0ff',
        bg: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)'
    }));

    // ── Steps ──────────────────────────────────────────────────────────────
    engine.setSteps([
        {
            title: 'Overview — What is ACID?',
            description: 'ACID ensures database transactions are reliable: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent safety), Durability (survived crashes). Example: transfer $100 from Account A → B.',
            duration: 5500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = true; });
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
            }
        },
        {
            title: 'Step 1 — BEGIN TRANSACTION',
            description: 'The app calls BEGIN TRANSACTION. The Transaction Manager assigns a transaction ID and acquires locks on Account A and Account B rows to ensure isolation.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                app.highlight = true; txMgr.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c1.active = true;
            },
            update: (eng, t) => {
                if (t > 500 && t < 600) eng.addParticle(new DataPacket(app, txMgr, { speed: 0.0012, color: COLORS.accent, label: 'BEGIN' }));
            }
        },
        {
            title: 'A — Atomicity: Debit Account A',
            description: '🔴 Atomicity: The Transaction Manager debits $100 from Account A. If this step fails, the entire transaction rolls back — no money is lost, no partial update occurs.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                txMgr.highlight = true; dbA.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c2.active = true;
            },
            update: (eng, t) => {
                if (t > 400 && t < 500) eng.addParticle(new DataPacket(txMgr, dbA, { speed: 0.0010, color: '#f59e0b', label: '-$100' }));
            }
        },
        {
            title: 'A — Atomicity: Credit Account B',
            description: '🟢 Atomicity: Account B is credited $100. Both the debit and credit are treated as a single atomic unit — either both succeed, or both are rolled back. No partial state ever persists.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                txMgr.highlight = true; dbB.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c3.active = true;
            },
            update: (eng, t) => {
                if (t > 400 && t < 500) eng.addParticle(new DataPacket(txMgr, dbB, { speed: 0.0010, color: '#10b981', label: '+$100' }));
            }
        },
        {
            title: 'C — Consistency: Validate Constraints',
            description: '✅ Consistency: After both operations, the DB checks that all integrity constraints hold — account balances non-negative, sum preserved (A+B = same total). Transaction aborts if any constraint fails.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                dbA.highlight = true; dbB.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c2.active = true; c3.active = true;
            }
        },
        {
            title: 'I — Isolation: Lock-based Concurrency',
            description: '🔒 Isolation: During the transfer, concurrent transactions cannot see intermediate states. Another transfer from Account A is blocked (or sees the committed state). Read Committed / Snapshot Isolation prevents dirty reads.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                txMgr.highlight = true; dbA.highlight = true; dbB.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
            }
        },
        {
            title: 'D — Durability: Write-Ahead Log (WAL)',
            description: '💾 Durability: Before responding, the engine writes the committed transaction to the Write-Ahead Log (WAL/Commit Log). If the server crashes after COMMIT, on restart it replays the WAL — data is never lost.',
            duration: 4500,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                txMgr.highlight = true; commitLog.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c4.active = true;
            },
            update: (eng, t) => {
                if (t > 400 && t < 500) eng.addParticle(new DataPacket(txMgr, commitLog, { speed: 0.0010, color: '#60a5fa', label: 'WAL' }));
            }
        },
        {
            title: 'COMMIT — Transaction Complete',
            description: '🎉 COMMIT: All four ACID properties satisfied. The Transaction Manager returns SUCCESS to the app. Locks are released. Account A: -$100, Account B: +$100. Total money in system unchanged.',
            duration: 5000,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = true; });
                [c1, c2, c3, c4, c5].forEach(c => { c.active = true; });
            },
            update: (eng, t) => {
                if (t > 400 && t < 500) eng.addParticle(new DataPacket(txMgr, app, { speed: 0.0012, color: '#22c55e', label: '✓ OK' }));
            }
        },
        {
            title: 'ROLLBACK — When Things Go Wrong',
            description: '↩️ Rollback: If a crash or constraint violation occurs mid-transaction, all changes are undone. The WAL is used to reverse the debit. Atomicity guarantees neither account is left in an inconsistent state.',
            duration: 5000,
            setup: () => {
                [app, txMgr, dbA, dbB, commitLog].forEach(e => { e.highlight = false; });
                txMgr.highlight = true; dbA.highlight = true;
                [c1, c2, c3, c4, c5].forEach(c => { c.active = false; });
                c2.active = true;
            },
            update: (eng, t) => {
                if (t > 400 && t < 500) eng.addParticle(new DataPacket(txMgr, dbA, { speed: 0.0010, color: '#ef4444', label: 'UNDO' }));
            }
        }
    ]);
}
