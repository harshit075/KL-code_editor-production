const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const val = trimmed.substring(eqIndex + 1).trim();
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    // Delete only the problems with type: 'dsa'
    const result = await mongoose.connection.collection('problems').deleteMany({ type: 'dsa' });
    console.log(`Successfully removed ${result.deletedCount} interview problems.`);
    
    // Final check
    const remaining = await mongoose.connection.collection('problems').countDocuments();
    console.log(`Remaining problems in DB: ${remaining}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
