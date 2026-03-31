import axios from 'axios';

async function testDeleteCandidate() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@kadellabs.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        console.log('\nFetching candidates...');
        const candRes = await axios.get('http://localhost:3000/api/admin/candidates', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const candidates = candRes.data.candidates;
        
        if (!candidates || candidates.length === 0) {
            console.log('No candidates found.');
            // Attempt to fetch any candidate from DB directly to verify
            return;
        }
        
        const candId = candidates[0]._id;
        console.log(`\nAttempting to delete candidate: ${candId}`);
        try {
            const delRes = await axios.delete(`http://localhost:3000/api/admin/candidates/${candId}`, {
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
testDeleteCandidate();
