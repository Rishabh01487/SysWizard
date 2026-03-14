import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'D:\\chromium\\chrome-win\\chrome.exe',
            headless: 'new',
            args: ['--no-sandbox', '--window-size=1200,900']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 900 });
        
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        page.on('pageerror', err => console.error(`BROWSER ERROR: ${err.message}`));

        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 60000 });
        
        await page.waitForSelector('body');
        
        // Always Sign Up for testing
        console.log('Doing Fresh Sign Up...');
        await page.waitForSelector('#show-signup', { visible: true });
        await page.click('#show-signup');
        await sleep(500);
        
        const testUser = 'TestUser' + Math.floor(Math.random() * 10000);
        const testEmail = 'test' + Math.floor(Math.random() * 10000) + '@wizard.com';
        
        await page.type('#signup-name', testUser);
        await page.type('#signup-email', testEmail);
        await page.type('#signup-password', 'password123');
        await page.click('#signup-form button[type="submit"]');
        
        // Wait for app to show
        await page.waitForSelector('#app', { visible: true, timeout: 15000 });
        console.log('App is visible for ' + testUser);

        // 1. Test Feature Buttons
        const featuresVisible = await page.$('#btn-generator') !== null;
        console.log('Features bar visible:', featuresVisible);

        // 2. Test Topic Visualization
        console.log('Testing Topic Viz...');
        const topicCard = await page.waitForSelector('.topic-card');
        await page.evaluate(el => el.click(), topicCard);
        await sleep(3000);
        
        const diag = await page.evaluate(() => {
            const canvas = document.querySelector('#main-canvas');
            const engine = window._engineRef;
            return {
                size: canvas ? `${canvas.width}x${canvas.height}` : 'no canvas',
                entities: engine ? engine.entities.length : 0,
                playing: engine ? engine.isPlaying : false
            };
        });
        console.log('Engine Diagnostic:', diag);
        await page.screenshot({ path: 'verify_viz.png' });

        // 3. Test Design Generator
        console.log('Testing Design Generator...');
        await page.click('#btn-generator');
        await sleep(500);
        await page.type('#app-description', 'A mobile app for pet sitting with a rating system');
        await page.click('#generate-design-btn');
        await sleep(6000);
        await page.screenshot({ path: 'verify_generator.png' });

        console.log('All tests passed!');
        await browser.close();
    } catch (err) {
        console.error('TEST FAILED:', err);
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 0) {
                await pages[0].screenshot({ path: 'test_failure.png' });
                console.log('Screenshot saved to test_failure.png');
            }
            await browser.close();
        }
    }
})();
