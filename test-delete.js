import axios from 'axios';

async function testDelete() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@kadellabs.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Token acquired:', token.substring(0, 10) + '...');

        console.log('\nFetching tests...');
        const testsRes = await axios.get('http://localhost:3000/api/admin/tests', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tests = testsRes.data.tests;
        if (!tests || tests.length === 0) {
            console.log('No tests found to delete. Try creating one.');
            
            // create a test so we can try
            console.log('Creating a test...');
            const createRes = await axios.post('http://localhost:3000/api/admin/tests', {
                title: 'Test Delete Test',
                duration: 60,
                mode: 'auto',
                difficulties: ['easy'],
                problemCount: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Test created:', createRes.data.test.id);
            tests.push({ _id: createRes.data.test.id });
        }
        
        const testId = tests[0]._id;
        console.log(`\nAttempting to delete test: ${testId}`);
        try {
            const delRes = await axios.delete(`http://localhost:3000/api/admin/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Delete successful:', delRes.data);
        } catch (e) {
            console.error('Delete failed:', e.response?.status, e.response?.data || e.message);
        }

    } catch (err) {
        console.error('Error in script:', err.response?.data || err.message);
    }
}
testDelete();
