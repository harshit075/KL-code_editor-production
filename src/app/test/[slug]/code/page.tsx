'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import IOConsole from '@/components/IOConsole';
import Timer from '@/components/Timer';
import AntiCheat from '@/components/AntiCheat';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode: Record<string, string>;
}

interface TestCaseResult {
  testCase: number;
  passed: boolean;
  isHidden: boolean;
  expected?: string;
  actual?: string;
}

export default function CodingEnvironment() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [codes, setCodes] = useState<Record<string, Record<string, string>>>({});
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [candidateId, setCandidateId] = useState('');
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentProblem = problems[currentProblemIndex];
  const currentCode = currentProblem ? (codes[currentProblem._id]?.[language] || '') : '';

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      const storedCandidateId = sessionStorage.getItem(`candidate_${slug}`);
      if (!storedCandidateId) {
        router.push(`/test/${slug}`);
        return;
      }

      try {
        const res = await fetch('/api/candidates/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: storedCandidateId }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 410 || res.status === 409) {
            setSubmitted(true);
          }
          return;
        }

        setCandidateId(storedCandidateId);
        setTestId(data.test.id);
        setProblems(data.test.problems);
        setRemainingMs(data.remainingMs);

        // Initialize codes with starter code
        const initialCodes: Record<string, Record<string, string>> = {};
        data.test.problems.forEach((p: Problem) => {
          initialCodes[p._id] = {
            javascript: p.starterCode?.javascript || '// Write your solution here\n',
            python: p.starterCode?.python || '# Write your solution here\nimport sys\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n',
            c: p.starterCode?.c || '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
            cpp: p.starterCode?.cpp || '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
            java: p.starterCode?.java || 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
          };
        });
        setCodes(initialCodes);
      } catch (err) {
        console.error('Failed to load test:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [slug, router]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (!candidateId || !currentProblem) return;

    autosaveTimerRef.current = setInterval(() => {
      const code = codes[currentProblem._id]?.[language];
      if (code) {
        fetch('/api/candidates/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId,
            problemId: currentProblem._id,
            testId,
            code,
            language,
          }),
        }).catch(() => {});
      }
    }, 30000);

    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [candidateId, currentProblem, language, codes, testId]);

  const updateCode = useCallback((value: string) => {
    if (!currentProblem) return;
    setCodes((prev) => ({
      ...prev,
      [currentProblem._id]: {
        ...prev[currentProblem._id],
        [language]: value,
      },
    }));
  }, [currentProblem, language]);

  const handleRun = async () => {
    if (!currentProblem) return;
    setIsRunning(true);
    setOutput('');
    setStderr('');
    setTestResults(null);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language,
          input: input || currentProblem.sampleInput,
        }),
      });

      const data = await res.json();
      setOutput(data.stdout || '');
      setStderr(data.stderr || '');
    } catch {
      setStderr('Execution service unavailable');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitProblem = async () => {
    if (!currentProblem || !candidateId) return;
    setSubmitting(true);
    setTestResults(null);

    try {
      const res = await fetch('/api/candidates/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          problemId: currentProblem._id,
          testId,
          code: currentCode,
          language,
        }),
      });

      const data = await res.json();
      if (data.results) {
        setTestResults(data.results);
      }
    } catch {
      setStderr('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = useCallback(async () => {
    if (!candidateId) return;

    try {
      // Submit all current code first
      for (const problem of problems) {
        const code = codes[problem._id]?.[language];
        if (code) {
          await fetch('/api/candidates/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId,
              problemId: problem._id,
              testId,
              code,
              language,
            }),
          }).catch(() => {});
        }
      }

      await fetch('/api/candidates/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      setSubmitted(true);
    } catch {
      console.error('Final submit failed');
    }
  }, [candidateId, problems, codes, language, testId]);

  const handleTabViolation = useCallback((_type: string, count: number) => {
    setTabWarning(true);
    setTimeout(() => setTabWarning(false), 5000);
    if (count >= 5) {
      handleFinalSubmit();
    }
  }, [handleFinalSubmit]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your test...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">Test Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Your responses have been recorded. You will receive your results soon.
          </p>
          <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-400">
            Thank you for completing the assessment. You may close this tab now.
          </div>
        </div>
      </div>
    );
  }

  if (!currentProblem || problems.length === 0) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-400">No problems found for this test.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      <AntiCheat candidateId={candidateId} onViolation={handleTabViolation} />

      {/* Tab switch warning */}
      {tabWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce">
          ⚠️ Tab switch detected! This is being recorded.
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-sm font-semibold gradient-text hidden sm:inline">Kadel Labs</span>
        </div>

        <div className="flex items-center gap-3">
          <Timer remainingMs={remainingMs} onTimeUp={handleFinalSubmit} />
          <button
            onClick={handleFinalSubmit}
            className="btn-danger text-sm px-4 py-2"
          >
            End Test
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Problem panel */}
        <div className="w-[400px] min-w-[320px] border-r border-gray-800/50 flex flex-col overflow-hidden">
          <ProblemPanel
            problem={currentProblem}
            currentIndex={currentProblemIndex}
            totalProblems={problems.length}
            onNavigate={setCurrentProblemIndex}
          />
        </div>

        {/* Right: Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={currentCode}
              language={language}
              onChange={updateCode}
              onLanguageChange={setLanguage}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-t border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="btn-secondary text-sm py-1.5 px-4 flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-300 rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>▶ Run Code</>
                )}
              </button>
              <button
                onClick={handleSubmitProblem}
                disabled={submitting || isRunning}
                className="btn-success text-sm py-1.5 px-4 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>✓ Submit</>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Problem {currentProblemIndex + 1} of {problems.length}
            </div>
          </div>

          {/* Test results */}
          {testResults && (
            <div className="px-4 py-3 bg-gray-900/60 border-b border-gray-700/50 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">Test Cases:</span>
                <span className="text-sm text-emerald-400">
                  {testResults.filter(r => r.passed).length}/{testResults.length} passed
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {testResults.map((r) => (
                  <div
                    key={r.testCase}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                      r.passed
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {r.isHidden ? `Hidden #${r.testCase}` : `Case #${r.testCase}`}: {r.passed ? '✓ Pass' : '✗ Fail'}
                    {!r.isHidden && !r.passed && r.expected && (
                      <span className="ml-2 text-gray-500">
                        (expected: {r.expected.substring(0, 30)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* I/O Console */}
          <div className="h-44 min-h-[120px] shrink-0">
            <IOConsole
              input={input}
              output={output}
              stderr={stderr}
              isRunning={isRunning}
              onInputChange={setInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
