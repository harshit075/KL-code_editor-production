import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/admin/login');
        
        await page.type('input[type="email"]', 'admin@kadellabs.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        console.log('Running test fetch from browser...');
        const result = await page.evaluate(async () => {
            const token = localStorage.getItem('adminToken');
            
            // first get candidates
            const getRes = await fetch('/api/admin/candidates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const getData = await getRes.json();
            const candidates = getData.candidates;
            
            if (!candidates || candidates.length === 0) return "No candidates found";
            
            // Delete the first one
            const delRes = await fetch(`/api/admin/candidates/${candidates[0]._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            return {
                status: delRes.status,
                statusText: delRes.statusText,
                ok: delRes.ok,
                body: await delRes.text()
            };
        });
        
        console.log('Browser fetch result:', result);

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
