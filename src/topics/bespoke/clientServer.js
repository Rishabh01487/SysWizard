/**
 * Bespoke Animation: Client-Server Model
 * Metaphor: Restaurant Order / Mail Delivery
 */
import { ServerNode, ArrowConnection, TextLabel, COLORS } from '../../engine/entities.js';
import { BrowserNode, EnvelopePacket, FolderNode } from '../../engine/bespokeEntities.js';

export function setupClientServerBespoke(engine) {
    engine.clear();
    const cx = engine.width / 2;
    const cy = engine.height / 2;

    // ─── Entities ───
    const browser = new BrowserNode(cx - 200, cy, 'Client (Your Browser)');
    const server = new ServerNode(cx + 200, cy, 'Server Side');
    const dbFolder = new FolderNode(cx + 250, cy + 60, 'Filesystem & DB');

    // Title
    const title = new TextLabel(cx, 40, '🍔 The Client-Server Order Metaphor', { fontSize: 18, color: '#f4f0ff', bg: 'rgba(59,130,246,0.1)' });

    // Connections
    const reqLine = new ArrowConnection(browser, server, { color: 'rgba(148,163,184,0.3)', dashed: true, label: 'Internet' });

    engine.addEntity(browser);
    engine.addEntity(server);
    engine.addEntity(dbFolder);
    engine.addEntity(title);
    engine.addConnection(reqLine);

    // Initial state
    browser.content = null;
    dbFolder.state = 'closed';

    // ─── Steps ───
    const steps = [
        {
            title: '1. The Client (The Customer)',
            description: 'The Client is like a customer in a restaurant. When you open a website, your browser asks for the menu. It does not actually cook the food.',
            duration: 4000,
            setup: () => {
                browser.highlight = true;
                server.highlight = false;
                dbFolder.highlight = false;
                reqLine.active = false;
            }
        },
        {
            title: '2. Sending the Request',
            description: 'The browser sends an HTTP Request (like handing an order slip to a waiter). This message travels across the Internet to find the server.',
            duration: 4500,
            setup: () => {
                browser.highlight = true;
                server.highlight = false;
                reqLine.active = true;

                // Animate packet out
                const reqPacket = new EnvelopePacket(browser, server, 'request');
                reqPacket.speed = 0.008;
                engine.addParticle(reqPacket);
            }
        },
        {
            title: '3. The Server (The Kitchen)',
            description: 'The Server receives the request. Like a kitchen, it looks at the order, finds the right ingredients (files, database records), and prepares the response.',
            duration: 5000,
            setup: () => {
                browser.highlight = false;
                server.highlight = true;
                dbFolder.highlight = true;
                reqLine.active = false;

                // Animate server processing
                server.status = 'busy';
                server.load = 0.8;

                // Open folder to simulate finding ingredients
                setTimeout(() => {
                    dbFolder.state = 'open';
                }, 1000);
            }
        },
        {
            title: '4. The Response',
            description: 'The Server sends back an HTTP Response containing the HTML page, CSS, images, and data. The "food" is delivered back to your browser.',
            duration: 4500,
            setup: () => {
                server.status = 'active';
                server.load = 0.1;
                dbFolder.state = 'closed';
                server.highlight = true;
                browser.highlight = true;
                reqLine.active = true;
                reqLine.color = 'rgba(168,85,247,0.3)';

                // Animate response packet
                const resPacket = new EnvelopePacket(server, browser, 'response');
                resPacket.speed = 0.008;
                resPacket.color = COLORS.server;
                resPacket.onArrive = () => {
                    browser.content = 'rendered'; // Render the page
                };
                engine.addParticle(resPacket);
            }
        },
        {
            title: '5. Rendering',
            description: 'The browser unpacks the HTML, CSS, and JS, paints pixels on your screen, and makes the webpage interactive.',
            duration: 4000,
            setup: () => {
                server.highlight = false;
                browser.highlight = true;
                reqLine.active = false;
                browser.drawGlow(engine.ctx, browser.x, browser.y, 100, COLORS.success);
            }
        }
    ];

    engine.setSteps(steps);
}
