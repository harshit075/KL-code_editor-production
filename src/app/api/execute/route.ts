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
            c: `#include <stdio.h>\n#include <string.h>\n{{USER_CODE}}\nint main() {\n    char buf[65536];\n    int n = fread(buf, 1, sizeof(buf)-1, stdin);\n    buf[n] = '\\0';\n    solution(buf);\n    return 0;\n}`,
            cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    string data, line;\n    while(getline(cin, line)) data += line + "\\n";\n    solution(data);\n    return 0;\n}`,
            java: `import java.util.*;\nimport java.io.*;\npublic class Main {\n    {{USER_CODE}}\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringBuilder sb = new StringBuilder();\n        String line;\n        while ((line = br.readLine()) != null) sb.append(line).append("\\n");\n        System.out.println(solution(sb.toString().trim()));\n    }\n}`,
        };

        if (problemId) {
            await dbConnect();
            const problem = await Problem.findById(problemId);
            if (problem) {
                const customWrapper = problem.wrapperCode?.[language as keyof typeof problem.wrapperCode] as string | undefined;
                if (customWrapper && customWrapper.includes('{{USER_CODE}}')) {
                    // Use admin-defined wrapper
                    code = customWrapper.replace('{{USER_CODE}}', code);
                } else {
                    // Fall back to built-in default wrapper
                    const defaultWrapper = DEFAULT_WRAPPERS[language];
                    if (defaultWrapper) {
                        code = defaultWrapper.replace('{{USER_CODE}}', code);
                    }
                }
            }
        } else {
            // No problemId — still apply default wrapper so function gets called
            const defaultWrapper = DEFAULT_WRAPPERS[language];
            if (defaultWrapper) {
                code = defaultWrapper.replace('{{USER_CODE}}', code);
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

        // Handle possible compilation errors (e.g. C/C++/Java)
        if (result.status?.id === 6) { // Compilation Error
            return NextResponse.json({
                stdout: '',
                stderr: compile_output || 'Compilation failed',
                exitCode: 1,
                signal: null,
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
