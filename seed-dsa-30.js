const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://kladminuser:klpassword@cluster0.hszmspe.mongodb.net/kadel-labs?appName=Cluster0";

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
});

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard'],
    },
    constraints: [{ type: String }],
    sampleInput: { type: String, default: '' },
    sampleOutput: { type: String, required: true },
    testCases: [TestCaseSchema],
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
    databaseSchema: { type: String },
    databaseSeed: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

const dsaProblems = [
  // ARRAYS (1-10)
  { title: "Two Sum", slug: "two-sum", difficulty: "easy", tags: ["array"], description: "Find two numbers in an array that add up to a target.", sampleInput: "4\n2 7 11 15\n9", sampleOutput: "0 1", testCases: [{ input: "4\n2 7 11 15\n9", expectedOutput: "0 1" }] },
  { title: "Maximum Subarray", slug: "max-subarray", difficulty: "medium", tags: ["array"], description: "Find the contiguous subarray with the largest sum.", sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4", sampleOutput: "6", testCases: [{ input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" }] },
  { title: "Reverse Array", slug: "reverse-array", difficulty: "easy", tags: ["array"], description: "Reverse an array of integers.", sampleInput: "5\n1 2 3 4 5", sampleOutput: "5 4 3 2 1", testCases: [{ input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1" }] },
  { title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "easy", tags: ["array"], description: "Check if any value appears at least twice.", sampleInput: "4\n1 2 3 1", sampleOutput: "true", testCases: [{ input: "4\n1 2 3 1", expectedOutput: "true" }] },
  { title: "Merge Sorted Arrays", slug: "merge-sorted-arrays", difficulty: "easy", tags: ["array"], description: "Merge two sorted arrays into one.", sampleInput: "3\n1 2 3\n3\n2 5 6", sampleOutput: "1 2 2 3 5 6", testCases: [{ input: "3\n1 2 3\n3\n2 5 6", expectedOutput: "1 2 2 3 5 6" }] },
  { title: "Move Zeroes", slug: "move-zeroes", difficulty: "easy", tags: ["array"], description: "Move all 0's to the end of the array.", sampleInput: "5\n0 1 0 3 12", sampleOutput: "1 3 12 0 0", testCases: [{ input: "5\n0 1 0 3 12", expectedOutput: "1 3 12 0 0" }] },
  { title: "3Sum", slug: "3sum", difficulty: "medium", tags: ["array"], description: "Find all unique triplets that sum to zero.", sampleInput: "6\n-1 0 1 2 -1 -4", sampleOutput: "-1 -1 2\n-1 0 1", testCases: [{ input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1" }] },
  { title: "Product of Array Except Self", slug: "product-except-self", difficulty: "medium", tags: ["array"], description: "Return an array where each element is the product of all other elements.", sampleInput: "4\n1 2 3 4", sampleOutput: "24 12 8 6", testCases: [{ input: "4\n1 2 3 4", expectedOutput: "24 12 8 6" }] },
  { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "hard", tags: ["array"], description: "Calculate how much water it can trap after raining.", sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1", sampleOutput: "6", testCases: [{ input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" }] },
  { title: "Rotate Array", slug: "rotate-array", difficulty: "medium", tags: ["array"], description: "Rotate the array to the right by k steps.", sampleInput: "7\n1 2 3 4 5 6 7\n3", sampleOutput: "5 6 7 1 2 3 4", testCases: [{ input: "7\n1 2 3 4 5 6 7\n3", expectedOutput: "5 6 7 1 2 3 4" }] },

  // STRINGS (11-20)
  { title: "Valid Anagram", slug: "valid-anagram", difficulty: "easy", tags: ["string"], description: "Check if two strings are anagrams of each other.", sampleInput: "anagram\nnagaram", sampleOutput: "true", testCases: [{ input: "anagram\nnagaram", expectedOutput: "true" }] },
  { title: "Longest Substring Without Repeating Characters", slug: "longest-substring", difficulty: "medium", tags: ["string"], description: "Find the length of the longest substring without repeating characters.", sampleInput: "abcabcbb", sampleOutput: "3", testCases: [{ input: "abcabcbb", expectedOutput: "3" }] },
  { title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "easy", tags: ["string"], description: "Check if a string is a palindrome.", sampleInput: "raceacar", sampleOutput: "false", testCases: [{ input: "raceacar", expectedOutput: "false" }] },
  { title: "String to Integer (atoi)", slug: "atoi", difficulty: "medium", tags: ["string"], description: "Convert a string to a 32-bit signed integer.", sampleInput: "  -42", sampleOutput: "-42", testCases: [{ input: "  -42", expectedOutput: "-42" }] },
  { title: "Longest Common Prefix", slug: "longest-common-prefix", difficulty: "easy", tags: ["string"], description: "Find the longest common prefix string amongst an array of strings.", sampleInput: "3\nflower flow flight", sampleOutput: "fl", testCases: [{ input: "3\nflower flow flight", expectedOutput: "fl" }] },
  { title: "Group Anagrams", slug: "group-anagrams", difficulty: "medium", tags: ["string"], description: "Group anagrams together.", sampleInput: "6\neat tea tan ate nat bat", sampleOutput: "bat\neat tea ate\ntan nat", testCases: [{ input: "6\neat tea tan ate nat bat", expectedOutput: "bat\neat tea ate\ntan nat" }] },
  { title: "Palindrome Substrings", slug: "palindrome-substrings", difficulty: "medium", tags: ["string"], description: "Count how many palindromic substrings in a string.", sampleInput: "abc", sampleOutput: "3", testCases: [{ input: "abc", expectedOutput: "3" }] },
  { title: "Edit Distance", slug: "edit-distance", difficulty: "hard", tags: ["string", "dp"], description: "Find minimum operations to convert one string to another.", sampleInput: "horse\nros", sampleOutput: "3", testCases: [{ input: "horse\nros", expectedOutput: "3" }] },
  { title: "Reverse words in string", slug: "reverse-words", difficulty: "medium", tags: ["string"], description: "Reverse the order of words in a string.", sampleInput: "the sky is blue", sampleOutput: "blue is sky the", testCases: [{ input: "the sky is blue", expectedOutput: "blue is sky the" }] },
  { title: "Wildcard Matching", slug: "wildcard-matching", difficulty: "hard", tags: ["string", "dp"], description: "Implement wildcard pattern matching with support for '?' and '*'.", sampleInput: "aa\n*", sampleOutput: "true", testCases: [{ input: "aa\n*", expectedOutput: "true" }] },

  // DP / MATH / RECURSION (21-30)
  { title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "easy", tags: ["dp"], description: "Find how many distinct ways to reach the top.", sampleInput: "3", sampleOutput: "3", testCases: [{ input: "3", expectedOutput: "3" }] },
  { title: "Longest Increasing Subsequence", slug: "lis", difficulty: "medium", tags: ["dp"], description: "Find the length of the longest strictly increasing subsequence.", sampleInput: "8\n10 9 2 5 3 7 101 18", sampleOutput: "4", testCases: [{ input: "8\n10 9 2 5 3 7 101 18", expectedOutput: "4" }] },
  { title: "House Robber", slug: "house-robber", difficulty: "medium", tags: ["dp"], description: "Find the maximum amount of money you can rob without alerting police.", sampleInput: "4\n1 2 3 1", sampleOutput: "4", testCases: [{ input: "4\n1 2 3 1", expectedOutput: "4" }] },
  { title: "Unique Paths", slug: "unique-paths", difficulty: "medium", tags: ["dp"], description: "Find number of possible unique paths from top-left to bottom-right.", sampleInput: "3 7", sampleOutput: "28", testCases: [{ input: "3 7", expectedOutput: "28" }] },
  { title: "Jump Game", slug: "jump-game", difficulty: "medium", tags: ["dp"], description: "Check if you are able to reach the last index.", sampleInput: "5\n2 3 1 1 4", sampleOutput: "true", testCases: [{ input: "5\n2 3 1 1 4", expectedOutput: "true" }] },
  { title: "Palindromic Number", slug: "palindrome-number", difficulty: "easy", tags: ["math"], description: "Determine whether an integer is a palindrome.", sampleInput: "121", sampleOutput: "true", testCases: [{ input: "121", expectedOutput: "true" }] },
  { title: "Power of Three", slug: "power-of-three", difficulty: "easy", tags: ["math"], description: "Check if an integer is a power of three.", sampleInput: "27", sampleOutput: "true", testCases: [{ input: "27", expectedOutput: "true" }] },
  { title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "medium", tags: ["array"], description: "Return all elements of the matrix in spiral order.", sampleInput: "3 3\n1 2 3\n4 5 6\n7 8 9", sampleOutput: "1 2 3 6 9 8 7 4 5", testCases: [{ input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5" }] },
  { title: "Search in Rotated Sorted Array", slug: "search-rotated", difficulty: "medium", tags: ["array"], description: "Find the index of target in rotated sorted array.", sampleInput: "7\n4 5 6 7 0 1 2\n0", sampleOutput: "4", testCases: [{ input: "7\n4 5 6 7 0 1 2\n0", expectedOutput: "4" }] },
  { title: "Median of Two Sorted Arrays", slug: "median-two-arrays", difficulty: "hard", tags: ["array"], description: "Find the median of the two sorted arrays.", sampleInput: "2\n1 3\n1\n2", sampleOutput: "2.0", testCases: [{ input: "2\n1 3\n1\n2", expectedOutput: "2.0" }] }
];

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Replacing all 30 DSA problems using upsert...');
    
    const starterCode = {
        javascript: "const rl = require('readline').createInterface({ input: process.stdin });\nrl.on('line', l => {\n  // Write your code here\n});",
        python: "import sys\n# Write your code here",
        cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}",
        java: "import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n  }\n}",
        c: "#include <stdio.h>\nint main() {\n  return 0;\n}"
    };

    for(const p of dsaProblems) {
        await Problem.findOneAndUpdate(
            { slug: p.slug },
            { ...p, type: 'dsa', starterCode },
            { upsert: true, new: true }
        );
        console.log('Upserted:', p.title);
    }
    
    console.log('Seeded 30 DSA problems successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
