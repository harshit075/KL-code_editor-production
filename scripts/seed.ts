import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually since we're running outside Next.js
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
  console.log('Loaded .env.local successfully');
} catch (e) {
  console.log('Warning: Could not load .env.local:', (e as Error).message);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kadel-labs';
console.log('Connecting to:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));

const ProblemSchema = new mongoose.Schema({
  title: String, slug: String, description: String,
  difficulty: String, constraints: [String],
  sampleInput: String, sampleOutput: String,
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
  starterCode: { c: String, cpp: String, java: String, javascript: String },
  tags: [String], createdAt: { type: Date, default: Date.now },
});

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true }, password: String, name: String,
  createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const problems = [
  {
    title: 'Two Sum', slug: 'two-sum', difficulty: 'easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    sampleInput: '4\n2 7 11 15\n9', sampleOutput: '0 1',
    tags: ['array', 'hash-table'],
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
      { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true },
      { input: '5\n1 5 3 7 2\n9', expectedOutput: '1 3', isHidden: true },
    ],
    starterCode: {
      javascript: `// Read input and solve Two Sum
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  const target = parseInt(lines[2]);
  // Your solution here
});
`,
      c: `#include <stdio.h>
int main() {
    int n, target;
    scanf("%d", &n);
    int nums[n];
    for(int i=0;i<n;i++) scanf("%d",&nums[i]);
    scanf("%d",&target);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for(int i=0;i<n;i++) cin >> nums[i];
    cin >> target;
    // Your solution here
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for(int i=0;i<n;i++) nums[i]=sc.nextInt();
        int target = sc.nextInt();
        // Your solution here
    }
}
`,
    },
  },
  {
    title: 'Reverse String', slug: 'reverse-string', difficulty: 'easy',
    description: 'Write a function that reverses a string. The input string is given as a single line.',
    constraints: ['1 <= s.length <= 10^5'], sampleInput: 'hello', sampleOutput: 'olleh',
    tags: ['string'],
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false },
      { input: 'world', expectedOutput: 'dlrow', isHidden: false },
      { input: 'abcdefg', expectedOutput: 'gfedcba', isHidden: true },
    ],
    starterCode: { javascript: `const readline=require("readline");
const rl=readline.createInterface({input:process.stdin});
rl.on("line", s => {
  
  // reverse s and print
});
`, c: `#include<stdio.h>
#include<string.h>
int main() {
    
  char s[100001];
  scanf("%s",s);
  // reverse and print
  return 0;
}
`, cpp: `#include<iostream>
#include<algorithm>
using namespace std;
int main() {
    
  string s;
  cin>>s;
  // reverse and print
  return 0;
}
`, java: `import java.util.*;
public class Main{
  public static void main(String[] args) {
        
    Scanner sc = new Scanner(System.in);
        
    String s = sc.next();
        
    // reverse and print
  }
}
` },
  },
  {
    title: 'Palindrome Check', slug: 'palindrome-check', difficulty: 'easy',
    description: 'Given a string, determine if it is a palindrome. Print "true" or "false".',
    constraints: ['1 <= s.length <= 10^5'], sampleInput: 'racecar', sampleOutput: 'true',
    tags: ['string'],
    testCases: [
      { input: 'racecar', expectedOutput: 'true', isHidden: false },
      { input: 'hello', expectedOutput: 'false', isHidden: false },
      { input: 'a', expectedOutput: 'true', isHidden: true },
      { input: 'abba', expectedOutput: 'true', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });

rl.on("line", s => {
  
  // check palindrome
});
`, c: `#include<stdio.h>
#include<string.h>
int main() {
    char s[100001];
    scanf("%s", s);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    string s;
    cin >> s;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // Your solution here
    }}
` },
  },
  {
    title: 'FizzBuzz', slug: 'fizzbuzz', difficulty: 'easy',
    description: 'Given an integer n, print numbers from 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".',
    constraints: ['1 <= n <= 10^4'], sampleInput: '5', sampleOutput: '1\n2\nFizz\n4\nBuzz',
    tags: ['math'],
    testCases: [
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: false },
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });

rl.on("line", l => {
  const n = parseInt(l);
  
  // fizzbuzz
});
`, c: `#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // Your solution here
    }}
` },
  },
  {
    title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'medium',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum (Kadane\'s algorithm).',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    sampleInput: '9\n-2 1 -3 4 -1 2 1 -5 4', sampleOutput: '6',
    tags: ['array', 'dynamic-programming'],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
      { input: '1\n1', expectedOutput: '1', isHidden: false },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  
  // kadane
});
`, c: `#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
#include<vector>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[]arr=new int[n];for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        // Your solution here
    }}
` },
  },
  {
    title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'medium',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. Print "true" or "false".',
    constraints: ['1 <= s.length <= 10^4'], sampleInput: '()[]{}', sampleOutput: 'true',
    tags: ['stack', 'string'],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false },
      { input: '{[()]}', expectedOutput: 'true', isHidden: true },
      { input: '((()))', expectedOutput: 'true', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });

rl.on("line", s => {
  
  // validate parentheses
});
`, c: `#include<stdio.h>
int main() {
    char s[10001];scanf("%s",s);// Your solution here
    return 0;
}
`, cpp: `#include<iostream>
#include<stack>
using namespace std;
int main() {
    string s;
    cin >> s;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        String s = new Scanner(System.in).next();
        // Your solution here
    }}
` },
  },
  {
    title: 'Binary Search', slug: 'binary-search', difficulty: 'easy',
    description: 'Given a sorted array and a target value, return the index if found. If not, return -1.',
    constraints: ['1 <= nums.length <= 10^4'], sampleInput: '6\n-1 0 3 5 9 12\n9', sampleOutput: '4',
    tags: ['binary-search', 'array'],
    testCases: [
      { input: '6\n-1 0 3 5 9 12\n9', expectedOutput: '4', isHidden: false },
      { input: '6\n-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
      { input: '1\n5\n5', expectedOutput: '0', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  const nums = lines[1].split(" ").map(Number);
  const t = parseInt(lines[2]);
  
  // binary search
});
`, c: `#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int t;
    scanf("%d", &t);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    int a[n];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int t;
    cin >> t;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[]arr=new int[n];for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int t = sc.nextInt();
        // Your solution here
    }}
` },
  },
  {
    title: 'Merge Two Sorted Arrays', slug: 'merge-sorted-arrays', difficulty: 'medium',
    description: 'Given two sorted arrays, merge them into one sorted array and print space-separated.',
    constraints: ['0 <= n, m <= 10^4'], sampleInput: '3\n1 3 5\n3\n2 4 6', sampleOutput: '1 2 3 4 5 6',
    tags: ['array', 'two-pointers'],
    testCases: [
      { input: '3\n1 3 5\n3\n2 4 6', expectedOutput: '1 2 3 4 5 6', isHidden: false },
      { input: '2\n1 2\n1\n3', expectedOutput: '1 2 3', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // merge
});
`, c: `#include<stdio.h>
int main() {
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        // Your solution here
    }}
` },
  },
  {
    title: 'Linked List Cycle Detection', slug: 'linked-list-cycle', difficulty: 'medium',
    description: 'Given n nodes and edges as pairs, detect if the directed graph has a cycle. Print "true" or "false".\nFirst line: n (nodes), m (edges). Next m lines: u v (edge from u to v).',
    constraints: ['1 <= n <= 10^4', '0 <= m <= 10^4'],
    sampleInput: '4 4\n0 1\n1 2\n2 3\n3 1', sampleOutput: 'true',
    tags: ['graph', 'dfs'],
    testCases: [
      { input: '4 4\n0 1\n1 2\n2 3\n3 1', expectedOutput: 'true', isHidden: false },
      { input: '3 2\n0 1\n1 2', expectedOutput: 'false', isHidden: false },
      { input: '1 0', expectedOutput: 'false', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // cycle detection
});
`, c: `#include<stdio.h>
int main() {
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        // Your solution here
    }}
` },
  },
  {
    title: 'Longest Common Subsequence', slug: 'lcs', difficulty: 'hard',
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence.',
    constraints: ['1 <= text1.length, text2.length <= 1000'],
    sampleInput: 'abcde\nace', sampleOutput: '3',
    tags: ['dynamic-programming', 'string'],
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3', isHidden: false },
      { input: 'abc\nabc', expectedOutput: '3', isHidden: false },
      { input: 'abc\ndef', expectedOutput: '0', isHidden: true },
      { input: 'abcdef\nacbcf', expectedOutput: '4', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // LCS
});
`, c: `#include<stdio.h>
int main() {
    char a[1001], b[1001];
    scanf("%s", a);
    scanf("%s", b);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    string a, b;
    cin >> a >> b;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s1 = sc.next();
        String s2 = sc.next();
        // Your solution here
    }}
` },
  },
  {
    title: 'N-Queens', slug: 'n-queens', difficulty: 'hard',
    description: 'Given an integer n, return the number of distinct solutions to the n-queens puzzle.',
    constraints: ['1 <= n <= 9'], sampleInput: '4', sampleOutput: '2',
    tags: ['backtracking'],
    testCases: [
      { input: '4', expectedOutput: '2', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '8', expectedOutput: '92', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });

rl.on("line", l => {
  
  const n=parseInt(l);
  // n-queens
});
`, c: `#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // Your solution here
    }}
` },
  },
  {
    title: 'Coin Change', slug: 'coin-change', difficulty: 'hard',
    description: 'Given coins of different denominations and a total amount, return the fewest number of coins needed. If not possible, return -1.\nFirst line: n (number of coin types). Second line: coin values. Third line: amount.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    sampleInput: '3\n1 2 5\n11', sampleOutput: '3',
    tags: ['dynamic-programming'],
    testCases: [
      { input: '3\n1 2 5\n11', expectedOutput: '3', isHidden: false },
      { input: '1\n2\n3', expectedOutput: '-1', isHidden: false },
      { input: '1\n1\n0', expectedOutput: '0', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // coin change
});
`, c: `#include<stdio.h>
int main() {
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        // Your solution here
    }}
` },
  },
  {
    title: 'Fibonacci Number', slug: 'fibonacci', difficulty: 'easy',
    description: 'Given n, calculate the nth Fibonacci number. F(0) = 0, F(1) = 1.',
    constraints: ['0 <= n <= 30'], sampleInput: '10', sampleOutput: '55',
    tags: ['math', 'dynamic-programming'],
    testCases: [
      { input: '10', expectedOutput: '55', isHidden: false },
      { input: '0', expectedOutput: '0', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: true },
      { input: '20', expectedOutput: '6765', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });

rl.on("line", l => {
  
  const n=parseInt(l);
  // fibonacci
});
`, c: `#include<stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // Your solution here
    }}
` },
  },
  {
    title: 'Graph BFS Shortest Path', slug: 'bfs-shortest-path', difficulty: 'hard',
    description: 'Given an unweighted undirected graph, find the shortest path length from node 0 to node n-1. Print -1 if no path exists.\nFirst line: n m. Next m lines: u v.',
    constraints: ['2 <= n <= 10^4', '0 <= m <= 10^4'],
    sampleInput: '4 4\n0 1\n1 2\n2 3\n0 3', sampleOutput: '1',
    tags: ['graph', 'bfs'],
    testCases: [
      { input: '4 4\n0 1\n1 2\n2 3\n0 3', expectedOutput: '1', isHidden: false },
      { input: '3 1\n0 1', expectedOutput: '-1', isHidden: false },
      { input: '2 1\n0 1', expectedOutput: '1', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // BFS
});
`, c: `#include<stdio.h>
int main() {
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
#include<queue>
using namespace std;
int main() {
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        // Your solution here
    }}
` },
  },
  {
    title: 'Sort an Array', slug: 'sort-array', difficulty: 'medium',
    description: 'Given an array of integers, sort it in ascending order and print space-separated.',
    constraints: ['1 <= n <= 10^5', '-10^5 <= nums[i] <= 10^5'],
    sampleInput: '5\n5 2 3 1 4', sampleOutput: '1 2 3 4 5',
    tags: ['sorting'],
    testCases: [
      { input: '5\n5 2 3 1 4', expectedOutput: '1 2 3 4 5', isHidden: false },
      { input: '3\n3 1 2', expectedOutput: '1 2 3', isHidden: true },
    ],
    starterCode: { javascript: `const rl = require("readline").createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l));
rl.on("close", () => {
  
  // sort
});
`, c: `#include<stdio.h>
#include<stdlib.h>
int cmp(const void*a,const void*b){return *(int*)a-*(int*)b;}
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // Your solution here
    return 0;
}
`, cpp: `#include<iostream>
#include<algorithm>
using namespace std;
int main() {
    int n;
    cin >> n;
    int a[n];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    // Your solution here
    return 0;
}
`, java: `import java.util.*;
public class Main{public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[]arr=new int[n];for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        // Your solution here
    }}
` },
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Seed problems
  await Problem.deleteMany({});
  await Problem.insertMany(problems);
  console.log(`Seeded ${problems.length} problems`);

  // Seed admin (password: admin123)
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await Admin.deleteMany({});
  await Admin.create({ email: 'admin@kadellabs.com', password: hashedPassword, name: 'Admin' });
  console.log('Seeded admin: admin@kadellabs.com / admin123');

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
