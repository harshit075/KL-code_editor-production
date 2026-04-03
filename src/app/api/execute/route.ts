import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Problem from '@/lib/models/Problem';

export async function POST(request: NextRequest) {
    try {
        let { code, language, input, problemId } = await request.json();

        if (!code || !language) {
            return NextResponse.json(
                { error: 'Code and language are required' },
                { status: 400 }
            );
        }

        // Default wrappers: read stdin, call solution(), print result
        const DEFAULT_WRAPPERS: Record<string, string> = {
            javascript: `const fs = require('fs');\n{{USER_CODE}}\nconst data = fs.readFileSync(0, 'utf-8').trim();\nconst result = solution(data);\nif (result !== undefined) console.log(result);`,
            python: `import sys\n{{USER_CODE}}\ndata = sys.stdin.read().strip()\nresult = solution(data)\nif result is not None:\n    print(result)`,
            c: `#include <stdio.h>\n#include <stdlib.h>\n{{USER_CODE}}\nint main() {\n    int input;\n    if (scanf("%d", &input) == 1) {\n        printf("%d\\n", solution(input));\n    } else {\n        printf("%d\\n", solution(0));\n    }\n    return 0;\n}`,
            cpp: `#include <iostream>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int input;\n    if (cin >> input) {\n        cout << solution(input) << endl;\n    } else {\n        cout << solution(0) << endl;\n    }\n    return 0;\n}`,
            java: `import java.util.*;\npublic class Main {\n    {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            System.out.println(solution(scanner.nextInt()));\n        } else {\n            System.out.println(solution(0));\n        }\n    }\n}`,
        };

        const hasEntryPoint = (src: string, lang: string) => {
            // Returns true when the code already has a runnable entry point → skip wrapper
            if (lang === 'c' || lang === 'cpp') return /int\s+main\s*\(/.test(src);
            if (lang === 'java') return /public\s+static\s+void\s+main/.test(src);
            // JS/Python: if the code defines a solution() function we wrap it; if it doesn't, treat it as standalone
            if (lang === 'javascript') return !/function\s+solution|const\s+solution\s*=|let\s+solution\s*=/.test(src);
            if (lang === 'python') return !/def\s+solution\s*\(/.test(src);
            return false;
        };

        if (problemId) {
            await dbConnect();
            const problem = await Problem.findById(problemId);
            if (problem) {
                const customWrapper = problem.wrapperCode?.[language as keyof typeof problem.wrapperCode] as string | undefined;
                if (customWrapper && customWrapper.includes('{{USER_CODE}}')) {
                    // Use admin-defined wrapper
                    code = customWrapper.replace('{{USER_CODE}}', code);
                } else if (!hasEntryPoint(code, language)) {
                    // Fall back to built-in default wrapper only if user didn't write a complete execution block
                    const defaultWrapper = DEFAULT_WRAPPERS[language];
                    if (defaultWrapper) {
                        code = defaultWrapper.replace('{{USER_CODE}}', code);
                    }
                }
            }
        } else {
            // No problemId — apply default wrapper only if necessary
            if (!hasEntryPoint(code, language)) {
                const defaultWrapper = DEFAULT_WRAPPERS[language];
                if (defaultWrapper) {
                    code = defaultWrapper.replace('{{USER_CODE}}', code);
                }
            }
        }

        const langMap: Record<string, number> = {
            c: 50,
            cpp: 54,
            java: 62,
            javascript: 93,
            python: 71,
        };

        const langId = langMap[language];
        if (!langId) {
            return NextResponse.json(
                { error: 'Unsupported language' },
                { status: 400 }
            );
        }

        const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
        const apiKey = process.env.RAPIDAPI_KEY || ''; // Usually required for RapidAPI
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (judge0Url.includes('rapidapi.com')) {
            headers['X-RapidAPI-Key'] = apiKey;
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        }

        const response = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                source_code: Buffer.from(code).toString('base64'),
                language_id: langId,
                stdin: input ? Buffer.from(input).toString('base64') : '',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Judge0 Error:', errorText);
            return NextResponse.json(
                { error: 'Code execution service unavailable or invalid API key' },
                { status: 503 }
            );
        }

        const result = await response.json();

        // Helper to safely decode base64
        const decodeBase64 = (base64Str: string | null | undefined) => {
            if (!base64Str) return '';
            return Buffer.from(base64Str, 'base64').toString('utf-8');
        };

        const stdout = decodeBase64(result.stdout);
        const stderr = decodeBase64(result.stderr);
        const compile_output = decodeBase64(result.compile_output);
        const message = decodeBase64(result.message);

        // Handle compilation errors and runtime errors prominently
        if (result.status?.id === 6) { // Compilation Error
            return NextResponse.json({
                stdout: '',
                stderr: `Compilation Error:\n${compile_output || 'Unknown compilation error'}`,
                exitCode: 1,
                signal: 'Compilation Error',
            });
        }
        if (result.status?.id === 5) { // Time Limit Exceeded
            return NextResponse.json({
                stdout: stdout || '',
                stderr: 'Time Limit Exceeded — your code took too long to run.',
                exitCode: 1,
                signal: 'Time Limit Exceeded',
            });
        }
        if (result.status?.id !== 3 && result.status?.id !== 1 && result.status?.id !== 2) {
            // Non-accepted, non-queued, non-processing → runtime error
            return NextResponse.json({
                stdout: stdout || '',
                stderr: stderr || compile_output || message || result.status?.description || 'Runtime Error',
                exitCode: 1,
                signal: result.status?.description || 'Runtime Error',
            });
        }

        return NextResponse.json({
            stdout: stdout,
            stderr: stderr || compile_output || message || '',
            exitCode: result.status?.id === 3 ? 0 : 1, // 3 is Accepted
            signal: result.status?.description || null,
        });
    } catch (error: unknown) {
        console.error('Execute error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
