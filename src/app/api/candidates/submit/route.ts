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
    const normalize = (str: string) => str.replace(/\r\n/g, '\n').trim();

    // Run all test cases in parallel for speed & reliability
    const settled = await Promise.allSettled(
        testCases.map((tc) => executeCode(code, language, tc.input))
    );

    return settled.map((result, i) => {
        const expected = normalize(testCases[i].expectedOutput);
        if (result.status === 'fulfilled') {
            const actual = normalize(result.value);
            return { passed: actual === expected, expected, actual };
        } else {
            return {
                passed: false,
                expected,
                actual: (result.reason as Error)?.message || 'Runtime Error',
            };
        }
    });
}

async function executeCode(
    code: string,
    language: string,
    input: string,
    retries = 1
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

    for (let attempt = 0; attempt <= retries; attempt++) {
        let response: Response;
        try {
            response = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    source_code: Buffer.from(code).toString('base64'),
                    language_id: langId,
                    stdin: input ? Buffer.from(input).toString('base64') : '',
                }),
                signal: AbortSignal.timeout(15000), // 15s per call
            });
        } catch {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
                continue;
            }
            throw new Error('Code execution service unavailable');
        }

        if (!response.ok) {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
                continue;
            }
            throw new Error('Code execution failed (service error)');
        }

        const result = await response.json();

        const decodeBase64 = (b64: string | null | undefined) =>
            b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '';

        const stdout = decodeBase64(result.stdout);
        const stderr = decodeBase64(result.stderr);
        const compile_output = decodeBase64(result.compile_output);
        const message = decodeBase64(result.message);

        if (result.status?.id === 6) throw new Error(compile_output || 'Compilation failed');
        if (result.status?.id !== 3) {
            throw new Error(stderr || message || result.status?.description || 'Execution error');
        }

        return stdout || '';
    }

    throw new Error('Execution failed after retries');
}
