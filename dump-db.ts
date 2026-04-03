import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import Problem from './src/lib/models/Problem.ts';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function run() {
  await connect(process.env.MONGODB_URI as string);
  const problems = await Problem.find({});
  fs.writeFileSync('problems.json', JSON.stringify(problems, null, 2));
  console.log('Done');
  process.exit(0);
}
run();
