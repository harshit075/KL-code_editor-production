import axios from 'axios';

async function testGetTest() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@kadellabs.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        const allTestsRes = await axios.get('http://localhost:3000/api/admin/tests', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tests = allTestsRes.data.tests;
        if (tests.length === 0) {
            console.log('No tests found to fetch details for.');
            return;
        }
        const testId = tests[0]._id;
        console.log(`Fetching specific test: ${testId}`);
        const res = await axios.get(`http://localhost:3000/api/admin/tests/${testId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('GET /api/admin/tests/[testId] successful:', Object.keys(res.data));
    } catch (err) {
        console.error('Error in GET test:', err.response?.data || err.message);
    }
}
testGetTest();
