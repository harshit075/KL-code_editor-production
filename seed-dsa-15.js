const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://kladminuser:klpassword@cluster0.hszmspe.mongodb.net/kadel-labs?appName=Cluster0";

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  constraints: [{ type: String }],
  sampleInput: { type: String, default: 'none' },
  sampleOutput: { type: String, required: true },
  testCases: [{
    input: { type: String, default: 'none' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  }],
  starterCode: {
    c: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    sql: { type: String, default: '' },
  },
  tags: [{ type: String }],
  type: { type: String, enum: ['dsa', 'sql'], default: 'dsa' },
  createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

const newDSAProblems = [

  // ─────────────────────────────────────────
  // 1. Climbing Stairs
  // ─────────────────────────────────────────
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'easy',
    type: 'dsa',
    tags: ['dynamic-programming', 'math'],
    description: `## Problem Statement

You are climbing a staircase with **n** steps. Each time you can climb either **1 step** or **2 steps**.

Return the number of **distinct ways** you can climb to the top.

### Input Format
- A single integer \`n\`

### Output Format
- A single integer: number of distinct ways

### Example
\`\`\`
Input:  5
Output: 8
\`\`\`

### Explanation
Ways to climb 5 stairs:
1+1+1+1+1, 1+1+1+2, 1+1+2+1, 1+2+1+1, 2+1+1+1, 1+2+2, 2+1+2, 2+2+1 → **8 ways**

### Hints
- This is similar to Fibonacci. \`ways(n) = ways(n-1) + ways(n-2)\`
- Base cases: \`ways(1) = 1\`, \`ways(2) = 2\``,
    constraints: ['1 <= n <= 45'],
    sampleInput: '5',
    sampleOutput: '8',
    testCases: [
      { input: '5', expectedOutput: '8', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '2', expectedOutput: '2', isHidden: true },
      { input: '10', expectedOutput: '89', isHidden: true },
      { input: '45', expectedOutput: '1836311903', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", line => {
  const n = parseInt(line.trim());
  // Your solution here
  // Hint: dp[i] = dp[i-1] + dp[i-2]
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // Your solution here
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
# Your solution here
`,
    },
  },

  // ─────────────────────────────────────────
  // 2. Single Number
  // ─────────────────────────────────────────
  {
    title: 'Single Number',
    slug: 'single-number',
    difficulty: 'easy',
    type: 'dsa',
    tags: ['array', 'bit-manipulation', 'XOR'],
    description: `## Problem Statement

Given a **non-empty** array of integers where every element appears **twice** except for one, find that single number.

You must implement a solution with **O(n) time** and **O(1) extra space**.

### Input Format
- Line 1: integer \`n\` (size of array)
- Line 2: \`n\` space-separated integers

### Output Format
- A single integer: the element that appears only once

### Example
\`\`\`
Input:
7
4 1 2 1 2 3 4

Output: 3
\`\`\`

### Hints
- XOR of a number with itself is 0: \`a ^ a = 0\`
- XOR of a number with 0 is itself: \`a ^ 0 = a\`
- XOR all elements → duplicates cancel out → result is the single number`,
    constraints: ['1 <= n <= 3 * 10^4', 'n is always odd', '-3 * 10^4 <= nums[i] <= 3 * 10^4'],
    sampleInput: '7\n4 1 2 1 2 3 4',
    sampleOutput: '3',
    testCases: [
      { input: '7\n4 1 2 1 2 3 4', expectedOutput: '3', isHidden: false },
      { input: '1\n42', expectedOutput: '42', isHidden: false },
      { input: '3\n2 2 1', expectedOutput: '1', isHidden: true },
      { input: '5\n7 3 7 5 3', expectedOutput: '5', isHidden: true },
      { input: '9\n10 20 10 30 40 30 50 40 20', expectedOutput: '50', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  // Your solution here: XOR all elements
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int nums[n], result = 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
        result ^= nums[i];
    }
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    int result = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        result ^= x;
    }
    // Your solution here
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int result = 0;
        for (int i = 0; i < n; i++) result ^= sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
nums = list(map(int, input().split()))
# Your solution here: XOR all elements
`,
    },
  },

  // ─────────────────────────────────────────
  // 3. Remove Duplicates from Sorted Array
  // ─────────────────────────────────────────
  {
    title: 'Remove Duplicates from Sorted Array',
    slug: 'remove-duplicates-sorted',
    difficulty: 'easy',
    type: 'dsa',
    tags: ['array', 'two-pointers'],
    description: `## Problem Statement

Given a **sorted** array of integers, remove the duplicates **in-place** such that each unique element appears only once.

Print the **count of unique elements** followed by the unique elements space-separated on the next line.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` sorted space-separated integers

### Output Format
- Line 1: count \`k\` of unique elements
- Line 2: the first \`k\` unique elements space-separated

### Example
\`\`\`
Input:
9
0 0 1 1 1 2 2 3 3

Output:
4
0 1 2 3
\`\`\`

### Hints
- Use a two-pointer approach: slow pointer tracks position of last unique, fast pointer scans ahead.
- When \`nums[fast] != nums[slow]\`, increment slow and copy.`,
    constraints: ['1 <= n <= 3 * 10^4', '-100 <= nums[i] <= 100', 'Array is sorted in non-decreasing order'],
    sampleInput: '9\n0 0 1 1 1 2 2 3 3',
    sampleOutput: '4\n0 1 2 3',
    testCases: [
      { input: '9\n0 0 1 1 1 2 2 3 3', expectedOutput: '4\n0 1 2 3', isHidden: false },
      { input: '3\n1 1 2', expectedOutput: '2\n1 2', isHidden: false },
      { input: '1\n5', expectedOutput: '1\n5', isHidden: true },
      { input: '5\n1 2 3 4 5', expectedOutput: '5\n1 2 3 4 5', isHidden: true },
      { input: '6\n1 1 2 2 3 3', expectedOutput: '3\n1 2 3', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  // Your solution here: two-pointer approach
  // Print k then the k unique elements
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    // Your solution here
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
nums = list(map(int, input().split()))
# Your solution here
`,
    },
  },

  // ─────────────────────────────────────────
  // 4. Majority Element
  // ─────────────────────────────────────────
  {
    title: 'Majority Element',
    slug: 'majority-element',
    difficulty: 'easy',
    type: 'dsa',
    tags: ['array', 'voting-algorithm', 'divide-and-conquer'],
    description: `## Problem Statement

Given an array of size **n**, find the **majority element** — the element that appears **more than ⌊n/2⌋ times**.

The majority element always exists in the given array.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers

### Output Format
- A single integer: the majority element

### Example
\`\`\`
Input:
7
2 2 1 1 1 2 2

Output: 2
\`\`\`

### Hints
- **Boyer-Moore Voting Algorithm**: maintain a candidate and a count. Increment count when current == candidate, decrement otherwise. Reset candidate when count hits 0.
- This runs in O(n) time and O(1) space.`,
    constraints: ['1 <= n <= 5 * 10^4', '-10^9 <= nums[i] <= 10^9'],
    sampleInput: '7\n2 2 1 1 1 2 2',
    sampleOutput: '2',
    testCases: [
      { input: '7\n2 2 1 1 1 2 2', expectedOutput: '2', isHidden: false },
      { input: '3\n3 2 3', expectedOutput: '3', isHidden: false },
      { input: '1\n1', expectedOutput: '1', isHidden: true },
      { input: '5\n5 5 5 3 3', expectedOutput: '5', isHidden: true },
      { input: '9\n1 1 2 2 1 2 1 1 2', expectedOutput: '1', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  // Your solution here (Boyer-Moore Voting)
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    // Your solution here (Boyer-Moore Voting)
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
nums = list(map(int, input().split()))
# Your solution here (Boyer-Moore Voting)
`,
    },
  },

  // ─────────────────────────────────────────
  // 5. Best Time to Buy and Sell Stock
  // ─────────────────────────────────────────
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'buy-sell-stock',
    difficulty: 'easy',
    type: 'dsa',
    tags: ['array', 'greedy', 'dynamic-programming'],
    description: `## Problem Statement

You are given an array \`prices\` where \`prices[i]\` is the price of a stock on day \`i\`.

You want to **maximize your profit** by choosing a single day to **buy** and a different future day to **sell**.

Return the **maximum profit** you can achieve. If no profit is possible, return **0**.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers (prices)

### Output Format
- A single integer: maximum profit

### Example
\`\`\`
Input:
6
7 1 5 3 6 4

Output: 5
\`\`\`

### Explanation
Buy on day 2 (price=1), sell on day 5 (price=6) → profit = 6 - 1 = **5**

### Hints
- Track the minimum price seen so far.
- At each step compute \`price - minPrice\` and update max profit.`,
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    sampleInput: '6\n7 1 5 3 6 4',
    sampleOutput: '5',
    testCases: [
      { input: '6\n7 1 5 3 6 4', expectedOutput: '5', isHidden: false },
      { input: '5\n7 6 4 3 1', expectedOutput: '0', isHidden: false },
      { input: '1\n5', expectedOutput: '0', isHidden: true },
      { input: '4\n1 2 3 4', expectedOutput: '3', isHidden: true },
      { input: '5\n3 8 1 4 7', expectedOutput: '6', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const prices = lines[1].split(" ").map(Number);
  // Your solution here
  // Hint: track minPrice and maxProfit
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int p[n];
    for (int i = 0; i < n; i++) scanf("%d", &p[i]);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> p(n);
    for (auto& x : p) cin >> x;
    // Your solution here
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
prices = list(map(int, input().split()))
# Your solution here
`,
    },
  },

  // ─────────────────────────────────────────
  // 6. Longest Substring Without Repeating Characters
  // ─────────────────────────────────────────
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-no-repeat',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['string', 'sliding-window', 'hash-table'],
    description: `## Problem Statement

Given a string \`s\`, find the length of the **longest substring without repeating characters**.

### Input Format
- A single string \`s\`

### Output Format
- A single integer: length of the longest substring without repeating characters

### Example
\`\`\`
Input:  abcabcbb
Output: 3
\`\`\`

### Explanation
The answer is \`"abc"\` with length **3**.

### More Examples
- \`"bbbbb"\` → **1** (substring \`"b"\`)
- \`"pwwkew"\` → **3** (substring \`"wke"\`)

### Hints
- Use a **sliding window** with two pointers \`left\` and \`right\`.
- Use a hash map / set to track characters in the current window.
- When a duplicate is found, move \`left\` forward until the duplicate is removed.`,
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols, and spaces'],
    sampleInput: 'abcabcbb',
    sampleOutput: '3',
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
      { input: 'bbbbb', expectedOutput: '1', isHidden: false },
      { input: 'pwwkew', expectedOutput: '3', isHidden: true },
      { input: 'dvdf', expectedOutput: '3', isHidden: true },
      { input: 'abcdefg', expectedOutput: '7', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", s => {
  s = s.trim();
  // Your solution here: sliding window
  // Use a Map to store last seen index of each character
});
`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char s[50001];
    scanf("%s", s);
    int n = strlen(s);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <unordered_map>
using namespace std;
int main() {
    string s;
    cin >> s;
    // Your solution here: sliding window
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        String s = new Scanner(System.in).next();
        // Your solution here: sliding window
    }
}
`,
      python: `s = input().strip()
# Your solution here: sliding window
`,
    },
  },

  // ─────────────────────────────────────────
  // 7. Product of Array Except Self
  // ─────────────────────────────────────────
  {
    title: 'Product of Array Except Self',
    slug: 'product-except-self',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['array', 'prefix-product'],
    description: `## Problem Statement

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is the **product of all elements** in \`nums\` **except** \`nums[i]\`.

Print the result as space-separated values.

You must run in **O(n)** time and **without using division**.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers

### Output Format
- A single line of space-separated integers

### Example
\`\`\`
Input:
4
1 2 3 4

Output: 24 12 8 6
\`\`\`

### Hints
- Compute **prefix products** (product of all elements to the left).
- Compute **suffix products** (product of all elements to the right).
- \`answer[i] = prefix[i] * suffix[i]\``,
    constraints: ['2 <= n <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer'],
    sampleInput: '4\n1 2 3 4',
    sampleOutput: '24 12 8 6',
    testCases: [
      { input: '4\n1 2 3 4', expectedOutput: '24 12 8 6', isHidden: false },
      { input: '2\n1 1', expectedOutput: '1 1', isHidden: false },
      { input: '3\n2 3 4', expectedOutput: '12 8 6', isHidden: true },
      { input: '4\n-1 1 0 -3', expectedOutput: '0 0 3 0', isHidden: true },
      { input: '5\n1 2 3 4 5', expectedOutput: '120 60 40 30 24', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  // Your solution here: prefix and suffix products
  // Print result as space-separated
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int a[n], out[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n), out(n, 1);
    for (auto& x : a) cin >> x;
    // Your solution here: prefix then suffix
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n], out = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
nums = list(map(int, input().split()))
# Your solution here: prefix and suffix products
`,
    },
  },

  // ─────────────────────────────────────────
  // 8. 3Sum
  // ─────────────────────────────────────────
  {
    title: '3Sum',
    slug: 'three-sum',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['array', 'two-pointers', 'sorting'],
    description: `## Problem Statement

Given an integer array \`nums\`, return all **unique triplets** \`[nums[i], nums[j], nums[k]]\` such that:
- \`i != j != k\`
- \`nums[i] + nums[j] + nums[k] == 0\`

Print each triplet space-separated on its own line, sorted in non-decreasing order. Triplets should be in ascending order by first element, then second, then third.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers

### Output Format
- Each triplet on a line, elements space-separated, sorted ascending within the triplet

### Example
\`\`\`
Input:
6
-1 0 1 2 -1 -4

Output:
-1 -1 2
-1 0 1
\`\`\`

### Hints
- **Sort** the array first.
- Fix one element, then use **two pointers** on the rest.
- Skip duplicate values to avoid duplicate triplets.`,
    constraints: ['3 <= n <= 3000', '-10^5 <= nums[i] <= 10^5'],
    sampleInput: '6\n-1 0 1 2 -1 -4',
    sampleOutput: '-1 -1 2\n-1 0 1',
    testCases: [
      { input: '6\n-1 0 1 2 -1 -4', expectedOutput: '-1 -1 2\n-1 0 1', isHidden: false },
      { input: '3\n0 0 0', expectedOutput: '0 0 0', isHidden: false },
      { input: '3\n1 2 -2', expectedOutput: '', isHidden: true },
      { input: '7\n-2 0 0 2 2 1 -1', expectedOutput: '-2 0 2\n-1 0 1', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number).sort((a, b) => a - b);
  const result = [];
  // Your solution here: fix i, two pointers l and r
  // Print each triplet on a new line
});
`,
      c: `#include <stdio.h>
#include <stdlib.h>
int cmp(const void* a, const void* b) { return *(int*)a - *(int*)b; }
int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(a, n, sizeof(int), cmp);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    sort(a.begin(), a.end());
    // Your solution here: fix i, two-pointer
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        Arrays.sort(a);
        // Your solution here
    }
}
`,
      python: `n = int(input())
nums = sorted(list(map(int, input().split())))
# Your solution here: fix i, two pointers
`,
    },
  },

  // ─────────────────────────────────────────
  // 9. Trapping Rain Water
  // ─────────────────────────────────────────
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'hard',
    type: 'dsa',
    tags: ['array', 'two-pointers', 'stack', 'dynamic-programming'],
    description: `## Problem Statement

Given \`n\` non-negative integers representing an elevation map where the width of each bar is **1**, compute how much water it can trap after raining.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers (elevation heights)

### Output Format
- A single integer: total water trapped

### Example
\`\`\`
Input:
12
0 1 0 2 1 0 1 3 2 1 2 1

Output: 6
\`\`\`

### Explanation
The above elevation map traps **6 units** of rain water.

### Hints
- **Two-pointer approach**: maintain \`leftMax\` and \`rightMax\` pointers.
- Water at position \`i\` = \`min(leftMax, rightMax) - height[i]\`
- Move the pointer with the smaller max inward.`,
    constraints: ['n >= 0', '0 <= height[i] <= 10^5'],
    sampleInput: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
    sampleOutput: '6',
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
      { input: '6\n4 2 0 3 2 5', expectedOutput: '9', isHidden: false },
      { input: '1\n0', expectedOutput: '0', isHidden: true },
      { input: '5\n3 0 2 0 4', expectedOutput: '7', isHidden: true },
      { input: '4\n1 0 1 0', expectedOutput: '1', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const h = lines[1].split(" ").map(Number);
  // Your solution here: two-pointer approach
});
`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int h[n];
    for (int i = 0; i < n; i++) scanf("%d", &h[i]);
    // Your solution here
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> h(n);
    for (auto& x : h) cin >> x;
    // Your solution here: two-pointer
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = sc.nextInt();
        // Your solution here
    }
}
`,
      python: `n = int(input())
h = list(map(int, input().split()))
# Your solution here: two-pointer approach
`,
    },
  },

  // ─────────────────────────────────────────
  // 10. Balanced BST Check
  // ─────────────────────────────────────────
  {
    title: 'Check Balanced Binary Tree',
    slug: 'balanced-binary-tree',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['tree', 'recursion', 'DFS'],
    description: `## Problem Statement

Given a binary tree as a **level-order (BFS) array representation**, determine if it is **height-balanced**.

A binary tree is balanced if for every node, the height difference between left and right subtrees is **at most 1**.

Use \`-1\` to represent \`null\` nodes in the BFS array.

### Input Format
- Line 1: integer \`n\` (total nodes including nulls)
- Line 2: \`n\` space-separated integers (level-order array, -1 = null)

### Output Format
- \`true\` if the tree is height-balanced, \`false\` otherwise

### Example
\`\`\`
Input:
3
3 9 20

Output: true
\`\`\`

\`\`\`
Input:
7
1 2 2 3 3 -1 -1

Output: false
\`\`\`

### Hints
- Build the tree from the array using a queue (BFS construction).
- Recursively check: for each node, get height of left and right subtrees.
- If height difference > 1 at any node, it's unbalanced.
- Return \`-1\` to indicate imbalance during recursion.`,
    constraints: ['0 <= n <= 5000', '-10^4 <= Node.val <= 10^4'],
    sampleInput: '3\n3 9 20',
    sampleOutput: 'true',
    testCases: [
      { input: '3\n3 9 20', expectedOutput: 'true', isHidden: false },
      { input: '7\n1 2 2 3 3 -1 -1', expectedOutput: 'false', isHidden: false },
      { input: '1\n1', expectedOutput: 'true', isHidden: true },
      { input: '5\n1 2 3 4 5', expectedOutput: 'true', isHidden: true },
      { input: '7\n1 2 2 3 -1 -1 -1 4', expectedOutput: 'false', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const vals = lines[1].split(" ").map(Number);
  // Build tree from level-order array, then check balance
  // Node class: { val, left: null, right: null }
  function height(node) {
    if (!node) return 0;
    const l = height(node.left);
    const r = height(node.right);
    if (l === -1 || r === -1 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  }
  // Build tree, then: console.log(height(root) !== -1 ? "true" : "false");
});
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#define ABS(x) ((x) < 0 ? -(x) : (x))
typedef struct Node { int val; struct Node *left, *right; } Node;
int height(Node* n) {
    if (!n) return 0;
    int l = height(n->left), r = height(n->right);
    if (l == -1 || r == -1 || ABS(l - r) > 1) return -1;
    return 1 + (l > r ? l : r);
}
int main() {
    // Build tree and check
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
using namespace std;
struct Node { int val; Node *l, *r; Node(int v): val(v), l(nullptr), r(nullptr){} };
int height(Node* n) {
    if (!n) return 0;
    int l = height(n->l), r = height(n->r);
    if (l == -1 || r == -1 || abs(l - r) > 1) return -1;
    return 1 + max(l, r);
}
int main() {
    int n; cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    // Build tree from level-order, then check
    return 0;
}
`,
      java: `import java.util.*;
public class Main {
    static int height(int[] v, int i) {
        if (i >= v.length || v[i] == -1) return 0;
        int l = height(v, 2*i+1), r = height(v, 2*i+2);
        if (l == -1 || r == -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = sc.nextInt();
        System.out.println(height(v, 0) != -1 ? "true" : "false");
    }
}
`,
      python: `import sys
from collections import deque
n = int(input())
vals = list(map(int, input().split()))
# Build tree and check if balanced
`,
    },
  },

  // ─────────────────────────────────────────
  // 11. Word Search
  // ─────────────────────────────────────────
  {
    title: 'Word Search in Grid',
    slug: 'word-search-grid',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['backtracking', 'DFS', 'matrix'],
    description: `## Problem Statement

Given an \`m × n\` grid of characters and a target word, return \`true\` if the word exists in the grid.

The word can be constructed from letters of sequentially **adjacent cells** (horizontally or vertically). The same cell may **not be used more than once**.

### Input Format
- Line 1: integers \`m\` and \`n\` (rows and columns)
- Next \`m\` lines: the grid rows (no spaces, each row is a single string)
- Last line: the word to search

### Output Format
- \`true\` or \`false\`

### Example
\`\`\`
Input:
4 4
ABCE
SFCS
ADEE
word: SEE

Output: true
\`\`\`

### Hints
- Use **DFS with backtracking** from every starting cell.
- Mark visited cells temporarily (e.g., set to \`#\`), then restore.
- Check all 4 directions at each step.`,
    constraints: ['1 <= m, n <= 6', '1 <= word.length <= 15', 'grid and word consist of uppercase English letters'],
    sampleInput: '4 4\nABCE\nSFCS\nADEE\nSEE',
    sampleOutput: 'true',
    testCases: [
      { input: '4 4\nABCE\nSFCS\nADEE\nSEE', expectedOutput: 'true', isHidden: false },
      { input: '3 4\nABCE\nSFCS\nADEE\nABCB', expectedOutput: 'false', isHidden: false },
      { input: '1 1\nA\nA', expectedOutput: 'true', isHidden: true },
      { input: '3 3\nABC\nDEF\nGHI\nAEI', expectedOutput: 'false', isHidden: true },
      { input: '3 3\nABC\nDEF\nGHI\nABCFED', expectedOutput: 'true', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const [m, n] = lines[0].split(" ").map(Number);
  const grid = lines.slice(1, m + 1).map(r => r.split(""));
  const word = lines[m + 1];
  function dfs(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== word[k]) return false;
    const tmp = grid[r][c]; grid[r][c] = '#';
    const found = dfs(r+1,c,k+1)||dfs(r-1,c,k+1)||dfs(r,c+1,k+1)||dfs(r,c-1,k+1);
    grid[r][c] = tmp;
    return found;
  }
  let res = false;
  for (let r = 0; r < m && !res; r++)
    for (let c = 0; c < n && !res; c++)
      if (dfs(r, c, 0)) res = true;
  console.log(res ? "true" : "false");
});
`,
      c: `#include <stdio.h>
#include <string.h>
char grid[10][10]; int m, n;
char word[20]; int wlen;
int dx[] = {1,-1,0,0}, dy[] = {0,0,1,-1};
int dfs(int r, int c, int k) {
    if (k == wlen) return 1;
    if (r<0||r>=m||c<0||c>=n||grid[r][c]!=word[k]) return 0;
    char t = grid[r][c]; grid[r][c] = '#';
    int found = 0;
    for (int d = 0; d < 4; d++) found |= dfs(r+dx[d], c+dy[d], k+1);
    grid[r][c] = t;
    return found;
}
int main() {
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++) scanf("%s", grid[i]);
    scanf("%s", word); wlen = strlen(word);
    int res = 0;
    for (int i = 0; i < m && !res; i++)
        for (int j = 0; j < n && !res; j++)
            if (dfs(i, j, 0)) res = 1;
    printf("%s\\n", res ? "true" : "false");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int m, n; string word;
bool dfs(vector<string>& g, int r, int c, int k) {
    if (k == (int)word.size()) return true;
    if (r<0||r>=m||c<0||c>=n||g[r][c]!=word[k]) return false;
    char t = g[r][c]; g[r][c] = '#';
    bool f = dfs(g,r+1,c,k+1)||dfs(g,r-1,c,k+1)||dfs(g,r,c+1,k+1)||dfs(g,r,c-1,k+1);
    g[r][c] = t; return f;
}
int main() {
    cin >> m >> n;
    vector<string> g(m);
    for (auto& row : g) cin >> row;
    cin >> word;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (dfs(g,i,j,0)) { cout << "true" << endl; return 0; }
    cout << "false" << endl;
}
`,
      java: `import java.util.*;
public class Main {
    static char[][] grid; static int m, n; static String word;
    static boolean dfs(int r, int c, int k) {
        if (k == word.length()) return true;
        if (r<0||r>=m||c<0||c>=n||grid[r][c]!=word.charAt(k)) return false;
        char t = grid[r][c]; grid[r][c] = '#';
        boolean f = dfs(r+1,c,k+1)||dfs(r-1,c,k+1)||dfs(r,c+1,k+1)||dfs(r,c-1,k+1);
        grid[r][c] = t; return f;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        m = sc.nextInt(); n = sc.nextInt();
        grid = new char[m][n];
        for (int i = 0; i < m; i++) grid[i] = sc.next().toCharArray();
        word = sc.next();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (dfs(i,j,0)) { System.out.println("true"); return; }
        System.out.println("false");
    }
}
`,
      python: `import sys
sys.setrecursionlimit(10000)
data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx+1]); idx += 2
grid = []
for i in range(m):
    grid.append(list(data[idx])); idx += 1
word = data[idx]
def dfs(r, c, k):
    if k == len(word): return True
    if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != word[k]: return False
    tmp, grid[r][c] = grid[r][c], '#'
    res = dfs(r+1,c,k+1) or dfs(r-1,c,k+1) or dfs(r,c+1,k+1) or dfs(r,c-1,k+1)
    grid[r][c] = tmp
    return res
found = any(dfs(i,j,0) for i in range(m) for j in range(n))
print("true" if found else "false")
`,
    },
  },

  // ─────────────────────────────────────────
  // 12. Rotate Array
  // ─────────────────────────────────────────
  {
    title: 'Rotate Array',
    slug: 'rotate-array',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['array', 'math', 'reverse'],
    description: `## Problem Statement

Given an integer array \`nums\`, rotate the array to the **right** by **k** steps, where k is non-negative.

Print the rotated array space-separated.

### Input Format
- Line 1: integer \`n\`
- Line 2: \`n\` space-separated integers
- Line 3: integer \`k\`

### Output Format
- Space-separated integers of the rotated array

### Example
\`\`\`
Input:
7
1 2 3 4 5 6 7
3

Output: 5 6 7 1 2 3 4
\`\`\`

### Hints
- Use \`k = k % n\` to handle k > n.
- **Reverse trick**: reverse the whole array, then reverse first k, then reverse rest.
- Or use extra array: \`result[i] = nums[(i - k + n) % n]\``,
    constraints: ['1 <= n <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1', '0 <= k <= 10^5'],
    sampleInput: '7\n1 2 3 4 5 6 7\n3',
    sampleOutput: '5 6 7 1 2 3 4',
    testCases: [
      { input: '7\n1 2 3 4 5 6 7\n3', expectedOutput: '5 6 7 1 2 3 4', isHidden: false },
      { input: '3\n-1 -100 3\n2', expectedOutput: '-100 3 -1', isHidden: false },
      { input: '5\n1 2 3 4 5\n0', expectedOutput: '1 2 3 4 5', isHidden: true },
      { input: '4\n1 2 3 4\n4', expectedOutput: '1 2 3 4', isHidden: true },
      { input: '6\n1 2 3 4 5 6\n2', expectedOutput: '5 6 1 2 3 4', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const nums = lines[1].split(" ").map(Number);
  let k = parseInt(lines[2]) % n;
  // Your solution here: reverse trick
  function rev(arr, l, r) { while(l<r){[arr[l],arr[r]]=[arr[r],arr[l]];l++;r--;} }
  rev(nums, 0, n-1);
  rev(nums, 0, k-1);
  rev(nums, k, n-1);
  console.log(nums.join(" "));
});
`,
      c: `#include <stdio.h>
void rev(int* a, int l, int r) { while(l<r){int t=a[l];a[l]=a[r];a[r]=t;l++;r--;} }
int main() {
    int n; scanf("%d", &n);
    int a[n]; for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int k; scanf("%d", &k); k %= n;
    rev(a, 0, n-1); rev(a, 0, k-1); rev(a, k, n-1);
    for (int i = 0; i < n; i++) printf("%d%s", a[i], i<n-1?" ":"\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n); for (auto& x : a) cin >> x;
    int k; cin >> k; k %= n;
    reverse(a.begin(), a.end());
    reverse(a.begin(), a.begin()+k);
    reverse(a.begin()+k, a.end());
    for (int i = 0; i < n; i++) cout << a[i] << (i<n-1?" ":"\\n");
}
`,
      java: `import java.util.*;
public class Main {
    static void rev(int[] a, int l, int r) { while(l<r){int t=a[l];a[l]=a[r];a[r]=t;l++;r--;} }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int k = sc.nextInt() % n;
        rev(a,0,n-1); rev(a,0,k-1); rev(a,k,n-1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(a[i]).append(i<n-1?" ":"");
        System.out.println(sb);
    }
}
`,
      python: `n = int(input())
nums = list(map(int, input().split()))
k = int(input()) % n
nums = nums[-k:] + nums[:-k]
print(" ".join(map(str, nums)))
`,
    },
  },

  // ─────────────────────────────────────────
  // 13. Number of Islands
  // ─────────────────────────────────────────
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['graph', 'BFS', 'DFS', 'matrix', 'union-find'],
    description: `## Problem Statement

Given an \`m × n\` 2D binary grid of \`'1'\`s (land) and \`'0'\`s (water), return the **number of islands**.

An island is surrounded by water and is formed by connecting adjacent lands **horizontally or vertically**. You may assume all four edges of the grid are surrounded by water.

### Input Format
- Line 1: integers \`m n\`
- Next \`m\` lines: each row of the grid (0s and 1s space-separated)

### Output Format
- A single integer: number of islands

### Example
\`\`\`
Input:
4 5
1 1 1 1 0
1 1 0 1 0
1 1 0 0 0
0 0 0 0 0

Output: 1
\`\`\`

### Hints
- DFS or BFS from each unvisited \`'1'\` cell.
- Mark visited cells as \`'0'\` (sink the island) or use a visited array.
- Each DFS/BFS call from an unvisited \`'1'\` = one island.`,
    constraints: ['1 <= m, n <= 300', "grid[i][j] is '0' or '1'"],
    sampleInput: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
    sampleOutput: '1',
    testCases: [
      { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1', isHidden: false },
      { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3', isHidden: false },
      { input: '1 1\n1', expectedOutput: '1', isHidden: true },
      { input: '3 3\n0 0 0\n0 0 0\n0 0 0', expectedOutput: '0', isHidden: true },
      { input: '3 3\n1 0 1\n0 1 0\n1 0 1', expectedOutput: '5', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const [m, n] = lines[0].split(" ").map(Number);
  const grid = lines.slice(1).map(l => l.split(" "));
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (grid[r][c] === "1") { count++; dfs(r, c); }
  console.log(count);
});
`,
      c: `#include <stdio.h>
int m, n; char g[310][310];
void dfs(int r, int c) {
    if (r<0||r>=m||c<0||c>=n||g[r][c]!='1') return;
    g[r][c]='0';
    dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1);
}
int main() {
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) { int x; scanf("%d",&x); g[i][j]='0'+x; }
    int cnt = 0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (g[i][j]=='1') { cnt++; dfs(i,j); }
    printf("%d\\n", cnt);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int m, n;
void dfs(vector<vector<int>>& g, int r, int c) {
    if (r<0||r>=m||c<0||c>=n||g[r][c]!=1) return;
    g[r][c]=0;
    dfs(g,r+1,c);dfs(g,r-1,c);dfs(g,r,c+1);dfs(g,r,c-1);
}
int main() {
    cin >> m >> n;
    vector<vector<int>> g(m, vector<int>(n));
    for (auto& row : g) for (auto& x : row) cin >> x;
    int cnt = 0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (g[i][j]) { cnt++; dfs(g,i,j); }
    cout << cnt << endl;
}
`,
      java: `import java.util.*;
public class Main {
    static int[][] g; static int m, n;
    static void dfs(int r, int c) {
        if (r<0||r>=m||c<0||c>=n||g[r][c]!=1) return;
        g[r][c]=0;
        dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        m = sc.nextInt(); n = sc.nextInt();
        g = new int[m][n];
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) g[i][j] = sc.nextInt();
        int cnt = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (g[i][j]==1) { cnt++; dfs(i,j); }
        System.out.println(cnt);
    }
}
`,
      python: `import sys
sys.setrecursionlimit(100000)
data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx+1]); idx += 2
g = []
for i in range(m):
    g.append([int(data[idx+j]) for j in range(n)]); idx += n
def dfs(r, c):
    if r < 0 or r >= m or c < 0 or c >= n or g[r][c] != 1: return
    g[r][c] = 0
    dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1)
cnt = 0
for i in range(m):
    for j in range(n):
        if g[i][j] == 1: cnt += 1; dfs(i, j)
print(cnt)
`,
    },
  },

  // ─────────────────────────────────────────
  // 14. Merge Intervals
  // ─────────────────────────────────────────
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['array', 'sorting', 'intervals'],
    description: `## Problem Statement

Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all **overlapping intervals** and return an array of the non-overlapping intervals.

Print each merged interval on its own line as \`start end\`.

### Input Format
- Line 1: integer \`n\` (number of intervals)
- Next \`n\` lines: two integers \`start end\` per interval

### Output Format
- Each merged interval on its own line: \`start end\`

### Example
\`\`\`
Input:
6
1 3
2 6
8 10
15 18
1 4
5 6

Output:
1 6
8 10
15 18
\`\`\`

### Hints
- Sort intervals by start time.
- Iterate, and if current interval overlaps with last merged, extend the end.
- Two intervals overlap if \`current.start <= last.end\`.`,
    constraints: ['1 <= intervals.length <= 10^4', '0 <= start_i <= end_i <= 10^4'],
    sampleInput: '4\n1 3\n2 6\n8 10\n15 18',
    sampleOutput: '1 6\n8 10\n15 18',
    testCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '1 6\n8 10\n15 18', isHidden: false },
      { input: '2\n1 4\n4 5', expectedOutput: '1 5', isHidden: false },
      { input: '1\n1 10', expectedOutput: '1 10', isHidden: true },
      { input: '3\n1 4\n0 4\n5 10', expectedOutput: '0 4\n5 10', isHidden: true },
      { input: '5\n1 2\n3 4\n5 6\n7 8\n9 10', expectedOutput: '1 2\n3 4\n5 6\n7 8\n9 10', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const n = parseInt(lines[0]);
  const intervals = lines.slice(1, n+1).map(l => l.split(" ").map(Number));
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < n; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);
    else merged.push(intervals[i]);
  }
  merged.forEach(([s, e]) => console.log(s + " " + e));
});
`,
      c: `#include <stdio.h>
#include <stdlib.h>
typedef struct { int s, e; } Interval;
int cmp(const void* a, const void* b) { return ((Interval*)a)->s - ((Interval*)b)->s; }
int main() {
    int n; scanf("%d", &n);
    Interval iv[n];
    for (int i = 0; i < n; i++) scanf("%d %d", &iv[i].s, &iv[i].e);
    qsort(iv, n, sizeof(Interval), cmp);
    int ms = iv[0].s, me = iv[0].e;
    for (int i = 1; i < n; i++) {
        if (iv[i].s <= me) { if (iv[i].e > me) me = iv[i].e; }
        else { printf("%d %d\\n", ms, me); ms = iv[i].s; me = iv[i].e; }
    }
    printf("%d %d\\n", ms, me);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; cin >> n;
    vector<pair<int,int>> iv(n);
    for (auto& p : iv) cin >> p.first >> p.second;
    sort(iv.begin(), iv.end());
    vector<pair<int,int>> res = {iv[0]};
    for (int i = 1; i < n; i++) {
        if (iv[i].first <= res.back().second)
            res.back().second = max(res.back().second, iv[i].second);
        else res.push_back(iv[i]);
    }
    for (auto& p : res) cout << p.first << " " << p.second << "\\n";
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] iv = new int[n][2];
        for (int i = 0; i < n; i++) { iv[i][0] = sc.nextInt(); iv[i][1] = sc.nextInt(); }
        Arrays.sort(iv, (a, b) -> a[0] - b[0]);
        List<int[]> res = new ArrayList<>();
        res.add(iv[0]);
        for (int i = 1; i < n; i++) {
            int[] last = res.get(res.size()-1);
            if (iv[i][0] <= last[1]) last[1] = Math.max(last[1], iv[i][1]);
            else res.add(iv[i]);
        }
        for (int[] p : res) System.out.println(p[0] + " " + p[1]);
    }
}
`,
      python: `n = int(input())
intervals = [list(map(int, input().split())) for _ in range(n)]
intervals.sort()
merged = [intervals[0]]
for s, e in intervals[1:]:
    if s <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], e)
    else: merged.append([s, e])
for s, e in merged: print(s, e)
`,
    },
  },

  // ─────────────────────────────────────────
  // 15. Spiral Matrix
  // ─────────────────────────────────────────
  {
    title: 'Spiral Matrix',
    slug: 'spiral-matrix',
    difficulty: 'medium',
    type: 'dsa',
    tags: ['matrix', 'simulation', 'array'],
    description: `## Problem Statement

Given an \`m × n\` matrix, return all elements of the matrix in **spiral order** (clockwise), space-separated on one line.

### Input Format
- Line 1: integers \`m n\`
- Next \`m\` lines: \`n\` space-separated integers per row

### Output Format
- All elements in clockwise spiral order, space-separated

### Example
\`\`\`
Input:
3 3
1 2 3
4 5 6
7 8 9

Output: 1 2 3 6 9 8 7 4 5
\`\`\`

### Hints
- Maintain four boundaries: \`top\`, \`bottom\`, \`left\`, \`right\`.
- Collect: top row → right col → bottom row → left col, then shrink boundaries.
- Repeat until all elements are collected.`,
    constraints: ['1 <= m, n <= 10', '-100 <= matrix[i][j] <= 100'],
    sampleInput: '3 3\n1 2 3\n4 5 6\n7 8 9',
    sampleOutput: '1 2 3 6 9 8 7 4 5',
    testCases: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 2 3 6 9 8 7 4 5', isHidden: false },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expectedOutput: '1 2 3 4 8 12 11 10 9 5 6 7', isHidden: false },
      { input: '1 1\n42', expectedOutput: '42', isHidden: true },
      { input: '1 4\n1 2 3 4', expectedOutput: '1 2 3 4', isHidden: true },
      { input: '4 1\n1\n2\n3\n4', expectedOutput: '1 2 3 4', isHidden: true },
    ],
    starterCode: {
      javascript: `const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on("line", l => lines.push(l.trim()));
rl.on("close", () => {
  const [m, n] = lines[0].split(" ").map(Number);
  const mat = lines.slice(1).map(l => l.split(" ").map(Number));
  const res = [];
  let top = 0, bot = m-1, left = 0, right = n-1;
  while (top <= bot && left <= right) {
    for (let c = left; c <= right; c++) res.push(mat[top][c]); top++;
    for (let r = top; r <= bot; r++) res.push(mat[r][right]); right--;
    if (top <= bot) { for (let c = right; c >= left; c--) res.push(mat[bot][c]); bot--; }
    if (left <= right) { for (let r = bot; r >= top; r--) res.push(mat[r][left]); left++; }
  }
  console.log(res.join(" "));
});
`,
      c: `#include <stdio.h>
int main() {
    int m, n; scanf("%d %d", &m, &n);
    int a[m][n];
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
    int t=0,b=m-1,l=0,r=n-1,first=1;
    while(t<=b&&l<=r){
        for(int c=l;c<=r;c++){if(!first)printf(" ");printf("%d",a[t][c]);first=0;}t++;
        for(int x=t;x<=b;x++){printf(" %d",a[x][r]);}r--;
        if(t<=b){for(int c=r;c>=l;c--)printf(" %d",a[b][c]);b--;}
        if(l<=r){for(int x=b;x>=t;x--)printf(" %d",a[x][l]);l++;}
    }
    printf("\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int m, n; cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (auto& row : a) for (auto& x : row) cin >> x;
    int t=0,b=m-1,l=0,r=n-1; bool first=true;
    auto pr=[&](int v){if(!first)cout<<" ";cout<<v;first=false;};
    while(t<=b&&l<=r){
        for(int c=l;c<=r;c++)pr(a[t][c]);t++;
        for(int x=t;x<=b;x++)pr(a[x][r]);r--;
        if(t<=b){for(int c=r;c>=l;c--)pr(a[b][c]);b--;}
        if(l<=r){for(int x=b;x>=t;x--)pr(a[x][l]);l++;}
    }
    cout<<endl;
}
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        int[][] a = new int[m][n];
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) a[i][j] = sc.nextInt();
        List<Integer> res = new ArrayList<>();
        int t=0,b=m-1,l=0,r=n-1;
        while(t<=b&&l<=r){
            for(int c=l;c<=r;c++)res.add(a[t][c]);t++;
            for(int x=t;x<=b;x++)res.add(a[x][r]);r--;
            if(t<=b){for(int c=r;c>=l;c--)res.add(a[b][c]);b--;}
            if(l<=r){for(int x=b;x>=t;x--)res.add(a[x][l]);l++;}
        }
        StringBuilder sb = new StringBuilder();
        for(int i=0;i<res.size();i++)sb.append(res.get(i)).append(i<res.size()-1?" ":"");
        System.out.println(sb);
    }
}
`,
      python: `data = []
import sys
for line in sys.stdin: data.append(line.strip())
m, n = map(int, data[0].split())
mat = [list(map(int, data[i+1].split())) for i in range(m)]
res = []
t, b, l, r = 0, m-1, 0, n-1
while t <= b and l <= r:
    res += mat[t][l:r+1]; t += 1
    res += [mat[x][r] for x in range(t, b+1)]; r -= 1
    if t <= b: res += mat[b][l:r+1][::-1]; b -= 1
    if l <= r: res += [mat[x][l] for x in range(b, t-1, -1)]; l += 1
print(" ".join(map(str, res)))
`,
    },
  },
];

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Upserting 15 new DSA problems...\n');

    for (const p of newDSAProblems) {
      await Problem.findOneAndUpdate(
        { slug: p.slug },
        { ...p },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✓ Upserted: [${p.difficulty.toUpperCase()}] ${p.title}`);
    }

    console.log('\n✅ Successfully seeded 15 new DSA problems!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
