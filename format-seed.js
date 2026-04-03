const fs = require('fs');

let content = fs.readFileSync('scripts/seed.ts', 'utf-8');

// A helper function to add basic newlines to C/C++/Java squished code.
// E.g. "int main(){int n;scanf(\"%d\",&n);/*check*/return 0;}" -> 
// "int main() {\n    int n;\n    scanf(\"%d\", &n);\n    /*check*/\n    return 0;\n}"
function formatCodeString(str) {
    if(!str) return str;
    
    // Replace typical squished snippets
    str = str.replace(/int main\(\)\{/g, 'int main() {\n    ');
    str = str.replace(/public static void main\(String\[\] a\)\{/g, 'public static void main(String[] args) {\n        ');
    str = str.replace(/Scanner sc=new Scanner\(System\.in\);/g, 'Scanner sc = new Scanner(System.in);\n        ');
    str = str.replace(/int n=sc\.nextInt\(\);/g, 'int n = sc.nextInt();\n        ');
    str = str.replace(/int \[]arr=new int\[n];/g, 'int[] arr = new int[n];\n        ');
    str = str.replace(/for\(int i=0;i<n;i\+\+\)arr\[i]=sc\.nextInt\(\);/g, 'for (int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        ');
    str = str.replace(/int t=sc\.nextInt\(\);/g, 'int t = sc.nextInt();\n        ');
    
    str = str.replace(/char s\[100001\];scanf\("%s",s\);/g, 'char s[100001];\n    scanf("%s", s);\n    ');
    str = str.replace(/string s;cin>>s;/g, 'string s;\n    cin >> s;\n    ');
    str = str.replace(/String s=sc\.next\(\);/g, 'String s = sc.next();\n        ');
    str = str.replace(/String s=new Scanner\(System\.in\)\.next\(\);/g, 'String s = new Scanner(System.in).next();\n        ');
    
    str = str.replace(/int n;scanf\("%d",&n\);/g, 'int n;\n    scanf("%d", &n);\n    ');
    str = str.replace(/int n;cin>>n;/g, 'int n;\n    cin >> n;\n    ');
    str = str.replace(/int n=new Scanner\(System\.in\)\.nextInt\(\);/g, 'int n = new Scanner(System.in).nextInt();\n        ');
    str = str.replace(/int a\[n\];for\(int i=0;i<n;i\+\+\)scanf\("%d",&a\[i\]\);/g, 'int a[n];\n    for (int i = 0; i < n; i++) {\n        scanf("%d", &a[i]);\n    }\n    ');
    str = str.replace(/vector<int>a\(n\);for\(int i=0;i<n;i\+\+\)cin>>a\[i];/g, 'vector<int> a(n);\n    for (int i = 0; i < n; i++) {\n        cin >> a[i];\n    }\n    ');
    str = str.replace(/int a\[n\];for\(int i=0;i<n;i\+\+\)cin>>a\[i];/g, 'int a[n];\n    for (int i = 0; i < n; i++) {\n        cin >> a[i];\n    }\n    ');

    str = str.replace(/int t;scanf\("%d",&t\);/g, 'int t;\n    scanf("%d", &t);\n    ');
    str = str.replace(/int t;cin>>t;/g, 'int t;\n    cin >> t;\n    ');
    str = str.replace(/char a\[1001\],b\[1001\];scanf\("%s%s",a,b\);/g, 'char a[1001], b[1001];\n    scanf("%s", a);\n    scanf("%s", b);\n    ');
    str = str.replace(/string a,b;cin>>a>>b;/g, 'string a, b;\n    cin >> a >> b;\n    ');
    str = str.replace(/String s1=sc\.next\(\),s2=sc\.next\(\);/g, 'String s1 = sc.next();\n        String s2 = sc.next();\n        ');
    
    str = str.replace(/\/\*check\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*fizzbuzz\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*kadane\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*validate\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*search\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*merge\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*cycle detect\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*LCS\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*n-queens\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*coin change\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*fib\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*BFS\*\//g, '// Your solution here\n    ');
    str = str.replace(/\/\*sort\*\//g, '// Your solution here\n    ');

    str = str.replace(/return 0;}/g, 'return 0;\n}');
    str = str.replace(/}}\n/g, '}\n}\n');
    
    // basic JS reformat
    str = str.replace(/const rl=require\("readline"\)\.createInterface\({input:process\.stdin}\);/g, 'const rl = require("readline").createInterface({ input: process.stdin });\n');
    str = str.replace(/rl\.on\("line",s=>\{/g, 'rl.on("line", s => {\n  ');
    str = str.replace(/rl\.on\("line",l=>\{const n=parseInt\(l\);/g, 'rl.on("line", l => {\n  const n = parseInt(l);\n  ');
    str = str.replace(/rl\.on\("line",l=>\{/g, 'rl.on("line", l => {\n  ');
    str = str.replace(/const L=\[\];rl\.on\("line",l=>L\.push\(l\)\);rl\.on\("close",\(\)=>\{/g, 'const lines = [];\nrl.on("line", l => lines.push(l));\nrl.on("close", () => {\n  ');
    str = str.replace(/const n=parseInt\(L\[0\]\);const nums=L\[1\]\.split\(" "\)\.map\(Number\);/g, 'const n = parseInt(lines[0]);\n  const nums = lines[1].split(" ").map(Number);\n  ');
    str = str.replace(/const nums=L\[1\]\.split\(" "\)\.map\(Number\);const t=parseInt\(L\[2\]\);/g, 'const nums = lines[1].split(" ").map(Number);\n  const t = parseInt(lines[2]);\n  ');

    return str;
}

// Rather than using complex regex, we can just rewrite the problematic fields
let mod = content.replace(/(javascript|c|cpp|java):\s*'([^']+)'/g, (match, lang, code) => {
    let formatted = formatCodeString(code);
    formatted = formatted.replace(/\\n/g, '\n');
    return `${lang}: \`${formatted}\``; // use backticks to allow actual newlines safely when we format
});

fs.writeFileSync('scripts/seed-formatted.ts', mod, 'utf-8');
console.log('Done mapping strings');
