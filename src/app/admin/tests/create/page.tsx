'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CreateTest() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');
    const [problemCount, setProblemCount] = useState(3);
    const [difficulties, setDifficulties] = useState<string[]>(['easy', 'medium']);
    
    // Manual Selection state
    const [availableProblems, setAvailableProblems] = useState<any[]>([]);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [fetchingProblems, setFetchingProblems] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ link: string; slug: string } | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) router.push('/admin/login');
    }, [router]);

    useEffect(() => {
        if (mode === 'manual' && availableProblems.length === 0) {
            const fetchProblems = async () => {
                setFetchingProblems(true);
                try {
                    const token = localStorage.getItem('adminToken');
                    const res = await fetch('/api/problems?limit=100', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (res.ok) setAvailableProblems(data.problems || []);
                } catch {
                    setError('Failed to fetch problems');
                } finally {
                    setFetchingProblems(false);
                }
            };
            fetchProblems();
        }
    }, [mode, availableProblems.length]);

    const toggleDifficulty = (diff: string) => {
        setDifficulties((prev) =>
            prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'auto' && difficulties.length === 0) {
            setError('Select at least one difficulty level');
            setLoading(false);
            return;
        }

        if (mode === 'manual' && selectedProblems.length === 0) {
            setError('Select at least one problem to include in the test');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const payload = mode === 'auto' 
                ? { title, duration, problemCount, difficulties, mode }
                : { title, duration, problemIds: selectedProblems, mode };

            const res = await fetch('/api/admin/tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create test');
                return;
            }

            setResult({ link: data.test.link, slug: data.test.slug });
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar isAdmin />

            <div className="mx-auto max-w-2xl px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Test</h1>
                <p className="text-slate-600 text-sm mb-8">Configure your coding assessment</p>

                {result ? (
                    /* Success state */
                    <div className="glass-card p-8 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Test Created!</h2>
                        <p className="text-slate-600 text-sm mb-6">Share this link with your candidates</p>

                        <div className="flex items-center gap-2 bg-slate-100/80 rounded-xl p-4 mb-6">
                            <input
                                type="text"
                                value={result.link}
                                readOnly
                                className="flex-1 bg-transparent text-indigo-300 text-sm font-mono outline-none"
                            />
                            <button onClick={handleCopy} className="btn-primary text-sm whitespace-nowrap">
                                {copied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => { setResult(null); setTitle(''); }}
                                className="btn-secondary text-sm"
                            >
                                Create Another
                            </button>
                            <button
                                onClick={() => router.push('/admin/dashboard')}
                                className="btn-primary text-sm"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Test Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field"
                                placeholder="e.g. Frontend Developer Assessment"
                                required
                            />
                        </div>

                        <div className="flex bg-white/50 p-1 rounded-xl">
                            <button
                                type="button"
                                className={`flex-1 py-2 lg:text-sm text-xs font-medium rounded-lg transition-all ${mode === 'auto' ? 'bg-slate-100 text-slate-900 shadow' : 'text-slate-600 hover:text-slate-800'}`}
                                onClick={() => setMode('auto')}
                            >
                                Auto Generate (Random)
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 lg:text-sm text-xs font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-slate-100 text-slate-900 shadow' : 'text-slate-600 hover:text-slate-800'}`}
                                onClick={() => setMode('manual')}
                            >
                                Manual Selection
                            </button>
                        </div>

                        {mode === 'auto' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Difficulty Levels</label>
                                    <div className="flex flex-wrap gap-3">
                                        {(['easy', 'medium', 'hard'] as const).map((diff) => {
                                            const isActive = difficulties.includes(diff);
                                            const colors = {
                                                easy: isActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : '',
                                                medium: isActive ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : '',
                                                hard: isActive ? 'bg-red-500/20 border-red-500/40 text-red-400' : '',
                                            };
                                            return (
                                                <button
                                                    key={diff}
                                                    type="button"
                                                    onClick={() => toggleDifficulty(diff)}
                                                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${isActive
                                                            ? colors[diff]
                                                            : 'bg-slate-100/50 border-slate-300 text-slate-500 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Problems</label>
                                    <input
                                        type="number"
                                        value={problemCount}
                                        onChange={(e) => setProblemCount(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="input-field"
                                        min={1}
                                        max={20}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Select Problems</label>
                                {fetchingProblems ? (
                                    <div className="text-sm text-slate-600 py-4 text-center">Loading problems...</div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-slate-200 rounded-xl p-2 bg-white/30">
                                        {availableProblems.map((p) => {
                                            const isSelected = selectedProblems.includes(p._id);
                                            return (
                                                <div 
                                                    key={p._id}
                                                    onClick={() => {
                                                        setSelectedProblems(prev => 
                                                            isSelected ? prev.filter(id => id !== p._id) : [...prev, p._id]
                                                        );
                                                    }}
                                                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                                                        isSelected ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-slate-100/40 border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                                                            {p.title}
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                                p.difficulty === 'easy' ? 'border-emerald-500/30 text-emerald-400' :
                                                                p.difficulty === 'medium' ? 'border-amber-500/30 text-amber-400' :
                                                                'border-red-500/30 text-red-400'
                                                            }`}>
                                                                {p.difficulty}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1 flex gap-1">
                                                            {p.tags?.slice(0, 3).map((t: string) => (
                                                                <span key={t}>#{t}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                                        isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400 bg-slate-100'
                                                    }`}>
                                                        {isSelected && <svg className="w-3.5 h-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {availableProblems.length === 0 && <div className="text-sm text-slate-500 text-center p-4">No problems found.</div>}
                                    </div>
                                )}
                                <div className="text-xs text-slate-600 text-right">{selectedProblems.length} problem(s) selected</div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value) || 5))}
                                className="input-field"
                                min={5}
                                max={300}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (mode === 'manual' && selectedProblems.length === 0)}
                            className="btn-primary w-full py-3 text-center flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Test...
                                </div>
                            ) : (
                                'Generate Test Link'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
