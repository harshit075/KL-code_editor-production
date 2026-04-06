'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import IOConsole from '@/components/IOConsole';
import Timer from '@/components/Timer';
import AntiCheat from '@/components/AntiCheat';
import CameraMonitor from '@/components/CameraMonitor';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cameraViolationCount, setCameraViolationCount] = useState(0);
  const [cameraWarningMsg, setCameraWarningMsg] = useState('');
  const [noFaceWarningLog, setNoFaceWarningLog] = useState<string[]>([]);
  const [isEndingTest, setIsEndingTest] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentProblem = problems[currentProblemIndex];
  const currentCode = currentProblem ? (codes[currentProblem._id]?.[language] || '') : '';

  // Auto-fill sample input when switching problems
  useEffect(() => {
    if (currentProblem) {
      setInput(currentProblem.sampleInput || '');
      setOutput('');
      setStderr('');
      setTestResults(null);
    }
  }, [currentProblemIndex, currentProblem?.sampleInput]);

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

        // Initialize codes with starter code (wrapper is hidden, only the function stub is shown)
        const initialCodes: Record<string, Record<string, string>> = {};
        data.test.problems.forEach((p: Problem) => {
          initialCodes[p._id] = {
            javascript: p.starterCode?.javascript && p.starterCode.javascript.trim()
              ? p.starterCode.javascript
              : 'function solution(input) {\n  // Write your code here\n}\n',
            python: p.starterCode?.python && p.starterCode.python.trim()
              ? p.starterCode.python
              : 'def solution(data):\n    # Write your code here\n    pass\n',
            c: p.starterCode?.c && p.starterCode.c.trim()
              ? p.starterCode.c
              : 'int solution(int input) {\n    // Write your code here\n    return 0;\n}\n',
            cpp: p.starterCode?.cpp && p.starterCode.cpp.trim()
              ? p.starterCode.cpp
              : 'int solution(int input) {\n    // Write your code here\n    return 0;\n}\n',
            java: p.starterCode?.java && p.starterCode.java.trim()
              ? p.starterCode.java
              : 'int solution(int input) {\n    // Write your code here\n    return 0;\n}\n',
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

  const runWithInput = async (inputOverride?: string) => {
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
          input: inputOverride !== undefined ? inputOverride : input,
          problemId: currentProblem._id,
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

  const handleRun = () => runWithInput();

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
    if (!candidateId || isEndingTest) return;
    setIsEndingTest(true);

    try {
      // Fire all submissions in parallel (don't await each one)
      await Promise.allSettled(
        problems.map((problem) => {
          const code = codes[problem._id]?.[language];
          if (!code) return Promise.resolve();
          return fetch('/api/candidates/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId,
              problemId: problem._id,
              testId,
              code,
              language,
            }),
          });
        })
      );

      await fetch('/api/candidates/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      setSubmitted(true);
    } catch {
      console.error('Final submit failed');
      setIsEndingTest(false); // re-enable button on failure
    }
  }, [candidateId, problems, codes, language, testId, isEndingTest]);

  const handleRunSample = useCallback(() => {
    if (!currentProblem) return;
    const sample = currentProblem.sampleInput || '';
    setInput(sample);
    runWithInput(sample);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem]);

  const handleTabViolation = useCallback((_type: string, count: number) => {
    setTabSwitchCount(count);
    if (count >= 3) {
      handleFinalSubmit();
    }
  }, [handleFinalSubmit]);

  const handleCameraViolation = useCallback((type: 'no-face' | 'multiple-faces', count: number) => {
    // Report to server
    fetch('/api/candidates/tab-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, reason: type }),
    }).catch(() => {});

    if (type === 'no-face') {
      // No-face: log a warning, never auto-submit
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setNoFaceWarningLog((prev) => [
        ...prev,
        `[${now}] No face detected (occurrence #${count})`,
      ]);
      setCameraWarningMsg('No face detected — please stay in front of your camera.');
      setCameraViolationCount(count); // still update so the camera widget shows dots
    } else {
      // Multiple faces: treat as a serious violation, auto-submit at 3
      const msg = 'Multiple faces detected — outside assistance is not allowed.';
      setCameraViolationCount(count);
      setCameraWarningMsg(msg);
      if (count >= 3) {
        handleFinalSubmit();
      }
    }
  }, [candidateId, handleFinalSubmit]);

  const handleCameraPermissionDenied = useCallback(() => {
    setCameraWarningMsg('⚠️ Camera access is required for this proctored test. Please allow camera access and refresh.');
    setCameraViolationCount(-1); // sentinel: denied
  }, []);

  const handlePaste = useCallback(() => {
    if (!candidateId) return;
    fetch('/api/candidates/tab-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, reason: 'paste' }),
    }).catch(() => {});
  }, [candidateId]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your test...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass-card p-12 text-center max-w-md relative overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
            className="flex justify-center mb-6 text-emerald-500"
          >
            <CheckCircle2 size={80} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Test Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Your responses have been recorded. You will receive your results soon.
          </p>
          <div className="bg-slate-100/50 rounded-xl p-4 text-sm text-slate-600">
            Thank you for completing the assessment. You may close this tab now.
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentProblem || problems.length === 0) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-600">No problems found for this test.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <AntiCheat candidateId={candidateId} onViolation={handleTabViolation} />
      <CameraMonitor
        onViolation={handleCameraViolation}
        onPermissionDenied={handleCameraPermissionDenied}
        maxViolations={3}
      />

      {/* Tab switch warning banners */}
      {tabSwitchCount > 0 && tabSwitchCount < 3 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-400/50 animate-bounce">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold text-sm">Tab Switch Detected! ({tabSwitchCount}/3)</div>
            <div className="text-xs text-red-200">Your test will be auto-submitted on the 3rd switch.</div>
          </div>
        </div>
      )}
      {tabSwitchCount >= 3 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-500/50">
          <span className="text-xl">🚨</span>
          <div>
            <div className="font-bold text-sm">Auto-Submitting Your Test...</div>
            <div className="text-xs text-red-200">3 tab switches detected. Your solution is being submitted.</div>
          </div>
        </div>
      )}

      {/* Camera violation banners */}
      {cameraViolationCount === -1 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-orange-400/50">
          <span className="text-xl">📷</span>
          <div>
            <div className="font-bold text-sm">Camera Required</div>
            <div className="text-xs text-orange-200">Please allow camera access and refresh to continue.</div>
          </div>
        </div>
      )}
      {/* No-face: transient alert banner (fades after a moment via camera widget; here just for extra visibility) */}
      {noFaceWarningLog.length > 0 && noFaceWarningLog.length < 3 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-amber-400/50 animate-bounce">
          <span className="text-xl">🎥</span>
          <div>
            <div className="font-bold text-sm">No Face Detected! ({noFaceWarningLog.length}/3)</div>
            <div className="text-xs text-amber-200">Please stay in front of your camera during the test.</div>
          </div>
        </div>
      )}
      {noFaceWarningLog.length >= 3 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-500/50 animate-pulse">
          <span className="text-xl">🚨</span>
          <div>
            <div className="font-bold text-sm">No Face Detected {noFaceWarningLog.length} Times!</div>
            <div className="text-xs text-red-200">This has been flagged. See the warning log on your submission.</div>
          </div>
        </div>
      )}
      {/* Multiple-faces violations */}
      {cameraWarningMsg.includes('Multiple') && cameraViolationCount > 0 && cameraViolationCount < 3 && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-400/50 animate-bounce">
          <span className="text-xl">👥</span>
          <div>
            <div className="font-bold text-sm">Multiple Faces Detected! ({cameraViolationCount}/3)</div>
            <div className="text-xs text-red-200">Outside assistance is not allowed.</div>
          </div>
        </div>
      )}
      {cameraWarningMsg.includes('Multiple') && cameraViolationCount >= 3 && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-500/50">
          <span className="text-xl">🚨</span>
          <div>
            <div className="font-bold text-sm">Auto-Submitting — Multiple Faces Detected</div>
            <div className="text-xs text-red-200">3 violations detected. Your solution is being submitted.</div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/90 border-b border-slate-200/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-sm font-semibold gradient-text hidden sm:inline">Kadel Labs</span>
        </div>

        <div className="flex items-center gap-3">
          <Timer remainingMs={remainingMs} onTimeUp={handleFinalSubmit} />
          <button
            onClick={handleFinalSubmit}
            disabled={isEndingTest}
            className="btn-danger text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isEndingTest ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'End Test'
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Problem panel */}
        <div className="w-[400px] min-w-[320px] border-r border-slate-200/50 flex flex-col overflow-hidden">
          <ProblemPanel
            problem={currentProblem}
            currentIndex={currentProblemIndex}
            totalProblems={problems.length}
            onNavigate={setCurrentProblemIndex}
            onLoadSample={() => setInput(currentProblem.sampleInput || '')}
            onRunSample={handleRunSample}
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
              onPaste={handlePaste}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 border-t border-b border-slate-200 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] relative z-10">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRun}
                disabled={isRunning}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 font-medium transition-all"
                title="Run your code with custom input (stdin)"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-slate-700" />
                    Run Code
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitProblem}
                disabled={submitting || isRunning}
                className="btn-success text-sm py-2 px-4 flex items-center gap-2 font-medium transition-all shadow-emerald-500/20 shadow-lg"
                title="Submit and run against all hidden test cases"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Submit & Test
                  </>
                )}
              </motion.button>
              {/* Hint */}
              <span className="hidden md:block text-xs text-slate-400 border-l border-slate-200 pl-3 ml-1">
                <span className="font-medium text-slate-500">Run</span> = test with your input ·{' '}
                <span className="font-medium text-slate-500">Submit</span> = check all test cases
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <span>Problem {currentProblemIndex + 1}</span>
              <span className="text-slate-300">/</span>
              <span>{problems.length}</span>
            </div>
          </div>

          {/* No-face violation warning log — shown above test results permanently */}
          {noFaceWarningLog.length > 0 && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 shrink-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-amber-600 text-base">⚠️</span>
                <span className="text-sm font-semibold text-amber-800">
                  No Face Detected — {noFaceWarningLog.length} {noFaceWarningLog.length === 1 ? 'Occurrence' : 'Occurrences'}
                </span>
                {noFaceWarningLog.length >= 3 && (
                  <span className="ml-auto text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    Flagged
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {noFaceWarningLog.map((entry, i) => (
                  <div key={i} className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-lg font-mono">
                    {entry}
                  </div>
                ))}
              </div>
              {noFaceWarningLog.length >= 3 && (
                <div className="mt-2 text-xs text-red-600 font-semibold">
                  🚨 Your absence from camera has been recorded {noFaceWarningLog.length} times and will be reported to the administrator.
                </div>
              )}
            </div>
          )}

          {/* Test results */}
          {testResults && (
            <div className="px-4 py-3 bg-white border-b border-slate-200 shrink-0">
              {/* Summary row */}
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-sm font-bold ${
                  testResults.filter(r => r.passed).length === testResults.length
                    ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {testResults.filter(r => r.passed).length === testResults.length ? '✓ All Passed' : '✗ Some Failed'}
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {testResults.filter(r => r.passed).length}/{testResults.length} test cases passed
                </span>
              </div>
              {/* Per-case pills */}
              <div className="flex gap-1.5 flex-wrap">
                {testResults.map((r) => (
                  <div
                    key={r.testCase}
                    title={!r.isHidden && !r.passed && r.expected ? `Expected: ${r.expected}\nGot: ${r.actual}` : ''}
                    className={`group relative text-xs px-2.5 py-1 rounded-lg font-semibold cursor-default ${
                      r.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {r.isHidden ? `🔒 Hidden #${r.testCase}` : `#${r.testCase}`}{' '}
                    {r.passed ? '✓' : '✗'}
                    {/* Tooltip for failed visible cases */}
                    {!r.isHidden && !r.passed && r.expected && (
                      <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:flex flex-col gap-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl min-w-max max-w-xs">
                        <span className="text-slate-400">Expected:</span>
                        <code className="text-emerald-300 font-mono">{r.expected.substring(0, 60)}</code>
                        <span className="text-slate-400 mt-1">Got:</span>
                        <code className="text-red-300 font-mono">{(r.actual || '(empty)').substring(0, 60)}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* I/O Console */}
          <IOConsole
            input={input}
            output={output}
            stderr={stderr}
            isRunning={isRunning}
            onInputChange={setInput}
            sampleInput={currentProblem?.sampleInput}
            onRun={handleRun}
          />
        </div>
      </div>
    </div>
  );
}
