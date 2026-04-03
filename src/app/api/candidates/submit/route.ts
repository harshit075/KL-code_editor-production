import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import Problem from '@/lib/models/Problem';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId, problemId, testId, code, language } = await request.json();

        if (!candidateId || !problemId || !testId || !code || !language) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate || candidate.status === 'completed' || candidate.status === 'timed-out') {
            return NextResponse.json(
                { error: 'Cannot submit - test is not in progress' },
                { status: 409 }
            );
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
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
            if (lang === 'c' || lang === 'cpp') return /int\s+main\s*\(/.test(src);
            if (lang === 'java') return /public\s+static\s+void\s+main/.test(src);
            // JS/Python: if code defines a solution() function we wrap it; if not, treat as standalone
            if (lang === 'javascript') return !/function\s+solution|const\s+solution\s*=|let\s+solution\s*=/.test(src);
            if (lang === 'python') return !/def\s+solution\s*\(/.test(src);
            return false;
        };

        // Wrap code: prefer admin-defined wrapper, fall back to default
        let finalCode = code;
        const customWrapper = problem.wrapperCode?.[language as keyof typeof problem.wrapperCode] as string | undefined;
        if (customWrapper && customWrapper.includes('{{USER_CODE}}')) {
            finalCode = customWrapper.replace('{{USER_CODE}}', code);
        } else if (!hasEntryPoint(code, language)) {
            const defaultWrapper = DEFAULT_WRAPPERS[language];
            if (defaultWrapper) {
                finalCode = defaultWrapper.replace('{{USER_CODE}}', code);
            }
        }

        // Run code against test cases
        const results = await runTestCases(finalCode, language, problem.testCases);

        const testCasesPassed = results.filter((r) => r.passed).length;
        const totalTestCases = problem.testCases.length;

        // Upsert submission
        await Submission.findOneAndUpdate(
            { candidateId, problemId, testId },
            {
                code,
                language,
                testCasesPassed,
                totalTestCases,
                output: JSON.stringify(results),
                timeTaken: Math.floor(
                    (Date.now() - new Date(candidate.startedAt!).getTime()) / 1000
                ),
                submittedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        // Recalculate total score
        const allSubmissions = await Submission.find({ candidateId, testId });
        const totalScore = allSubmissions.reduce((s, sub) => s + sub.totalTestCases, 0);
        const score = allSubmissions.reduce((s, sub) => s + sub.testCasesPassed, 0);

        await Candidate.findByIdAndUpdate(candidateId, { score, totalScore });

        return NextResponse.json({
            success: true,
            results: results.map((r, i) => ({
                testCase: i + 1,
                passed: r.passed,
                isHidden: problem.testCases[i].isHidden,
                ...(problem.testCases[i].isHidden
                    ? {}
                    : { expected: r.expected, actual: r.actual }),
            })),
            testCasesPassed,
            totalTestCases,
        });
    } catch (error: unknown) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

interface TestCaseResult {
    passed: boolean;
    expected: string;
    actual: string;
}

async function runTestCases(
    code: string,
    language: string,
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[]
): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];
    const normalize = (str: string) => str.replace(/\r\n/g, '\n').trim();

    for (const tc of testCases) {
        try {
            const output = await executeCode(code, language, tc.input);
            const actual = normalize(output);
            const expected = normalize(tc.expectedOutput);
            results.push({
                passed: actual === expected,
                expected,
                actual,
            });
        } catch (error: any) {
            results.push({
                passed: false,
                expected: normalize(tc.expectedOutput),
                actual: error.message || 'Runtime Error',
            });
        }
    }

    return results;
}

async function executeCode(
    code: string,
    language: string,
    input: string
): Promise<string> {
    const langMap: Record<string, number> = {
        c: 50,
        cpp: 54,
        java: 62,
        javascript: 93,
        python: 71,
    };

    const langId = langMap[language];
    if (!langId) throw new Error('Unsupported language');

    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey = process.env.RAPIDAPI_KEY || '';
    
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
        throw new Error('Code execution failed (Service unavailable or invalid API key)');
    }

    const result = await response.json();

    const decodeBase64 = (base64Str: string | null | undefined) => {
        if (!base64Str) return '';
        return Buffer.from(base64Str, 'base64').toString('utf-8');
    };

    const stdout = decodeBase64(result.stdout);
    const stderr = decodeBase64(result.stderr);
    const compile_output = decodeBase64(result.compile_output);
    const message = decodeBase64(result.message);

    if (result.status?.id === 6) { throw new Error(compile_output || 'Compilation failed'); }
    if (result.status?.id !== 3) {
        // Status ID 3 is "Accepted". Any other status means error (runtime error, time limit, memory limit, etc)
        throw new Error(stderr || message || result.status?.description || 'Execution error');
    }

    return stdout || '';
}
