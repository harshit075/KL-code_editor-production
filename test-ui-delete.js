import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/admin/login');
        
        console.log('Logging in...');
        await page.type('input[type="email"]', 'admin@kadellabs.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('On dashboard page:', page.url());

        // check if there are any tests to delete, if not create one via API
        const token = await page.evaluate(() => localStorage.getItem('adminToken'));
        if (!token) throw new Error("No token in localStorage");
        
        console.log('Evaluating tests...');
        const tests = await page.evaluate(async (token) => {
            const res = await fetch('/api/admin/tests', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            return data.tests;
        }, token);
        
        if (tests.length === 0) {
            console.log("No test found... creating a mock test");
            await page.evaluate(async (token) => {
                await fetch('/api/admin/tests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ title: 'Puppeteer Test', duration: 30, mode: 'auto', problemCount: 1, difficulties: ['easy'] })
                });
            }, token);
            await page.reload({ waitUntil: 'networkidle0' });
        }
        
        console.log('Clicking delete on the first test...');
        page.on('dialog', async dialog => {
            console.log('Dialog appeared:', dialog.message());
            await dialog.accept();
        });
        
        const deleteBtn = await page.$('button[title="Delete test"]');
        if (deleteBtn) {
            await deleteBtn.click();
            console.log('Clicked delete');
            await new Promise(r => setTimeout(r, 2000));
            console.log('Waited 2 seconds after click');
        } else {
            console.log('No delete button found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
