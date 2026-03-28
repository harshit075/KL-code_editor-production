import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
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
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kadel-labs';

const ProblemSchema = new mongoose.Schema({
  title: String, slug: String, description: String,
  difficulty: String, constraints: [String],
  sampleInput: String, sampleOutput: String,
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
  starterCode: { c: String, cpp: String, java: String, javascript: String },
  tags: [String], createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

const difficulties = ['easy', 'medium', 'hard'];
const tagsList = ['array', 'string', 'math', 'dynamic-programming', 'graph', 'tree', 'linked-list', 'sorting', 'greedy'];

const generateProblems = () => {
  const problems = [];
  for (let i = 1; i <= 100; i++) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    const tag1 = tagsList[Math.floor(Math.random() * tagsList.length)];
    const tag2 = tagsList[Math.floor(Math.random() * tagsList.length)];
    
    // Create a generic problem that just asks to multiply an input number by i
    const title = `DSA Challenge ${i}: The Multiplier`;
    const slug = `dsa-challenge-${i}`;
    
    problems.push({
      title,
      slug,
      difficulty: diff,
      description: `Welcome to DSA Challenge ${i}!\n\nGiven an integer N, return the product of N and ${i}. Your input will be a single integer on the first line.\n\nThis problem tests your basic arithmetic and I/O skills.`,
      constraints: ['-10^5 <= N <= 10^5'],
      sampleInput: '5',
      sampleOutput: `${5 * i}`,
      tags: [...new Set([tag1, tag2])],
      testCases: [
        { input: '5', expectedOutput: `${5 * i}`, isHidden: false },
        { input: '10', expectedOutput: `${10 * i}`, isHidden: false },
        { input: '0', expectedOutput: '0', isHidden: true },
        { input: '-3', expectedOutput: `${-3 * i}`, isHidden: true },
      ],
      starterCode: {
        javascript: 'const rl=require("readline").createInterface({input:process.stdin});\nrl.on("line",l=>{\n  const n=parseInt(l);\n  // write your solution here\n});\n',
        c: '#include<stdio.h>\nint main(){\n  int n;\n  scanf("%d",&n);\n  // write your solution here\n  return 0;\n}\n',
        cpp: '#include<iostream>\nusing namespace std;\nint main(){\n  int n;\n  cin>>n;\n  // write your solution here\n  return 0;\n}\n',
        java: 'import java.util.*;\npublic class Main{\n  public static void main(String[] a){\n    int n=new Scanner(System.in).nextInt();\n    // write your solution here\n  }\n}\n'
      },
    });
  }
  return problems;
};

async function seed100() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const newProblems = generateProblems();
  
  await Problem.insertMany(newProblems);
  console.log(`Successfully added 100 new DSA problems to the database!`);

  await mongoose.disconnect();
}

seed100().catch(console.error);
