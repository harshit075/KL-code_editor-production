import axios from 'axios';

async function testGetCands() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@kadellabs.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        const allRes = await axios.get('http://localhost:3000/api/admin/candidates', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cands = allRes.data.candidates;
        console.log(`Found ${cands?.length} candidates.`);
        if (cands && cands.length > 0) {
            console.log('First candidate keys:', Object.keys(cands[0]));
            console.log('First candidate _id:', cands[0]._id);
        }
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}
testGetCands();
