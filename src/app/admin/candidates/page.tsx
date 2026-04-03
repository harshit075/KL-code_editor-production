'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Editor as MonacoEditor } from '@monaco-editor/react';

interface Submission {
    problemTitle: string;
    code: string;
    language: string;
    score: number;
    totalCases: number;
}

interface CandidateData {
    _id: string;
    fullName: string;
    email: string;
    status: string;
    score: number;
    totalScore: number;
    copyPasteDetected?: boolean;
    tabSwitchCount?: number;
    testData?: { title: string; slug: string };
    submissions: Submission[];
}

export default function AllCandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<CandidateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
    const [fullscreenCode, setFullscreenCode] = useState<{ code: string; language: string; title: string } | null>(null);
    const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

    const handleCopy = useCallback((code: string, key: string) => {
        navigator.clipboard.writeText(code);
        setCopiedIdx(key);
        setTimeout(() => setCopiedIdx(null), 2000);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        fetch('/api/admin/candidates', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.candidates) setCandidates(data.candidates);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, [router]);

    const toggleExpand = (id: string) => {
        setExpandedCandidate(expandedCandidate === id ? null : id);
    };

    const handleDeleteCandidate = async (candidateId: string) => {
        if (!window.confirm('Are you sure you want to delete this candidate? This will permanently delete their account and all their code submissions.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/candidates/${candidateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCandidates(prev => prev.filter(c => c._id !== candidateId));
            } else {
                alert('Failed to delete candidate');
            }
        } catch (err) {
            console.error('Delete error', err);
            alert('An error occurred trying to delete the candidate');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar isAdmin />
                <div className="flex items-center justify-center p-20">
                    <p className="text-slate-600 animate-pulse">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-slate-50">
            <Navbar isAdmin />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">All Candidates</h1>
                    <p className="text-sm text-slate-600 mt-1">Detailed overview of candidate domains, scores, and code submissions across all tests.</p>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-300/50 bg-white/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Name & Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Domain / Test Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {candidates.map((c) => (
                                <React.Fragment key={c._id}>
                                    <tr className={`hover:bg-slate-100/30 transition-smooth ${expandedCandidate === c._id ? 'bg-slate-100/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                                {c.fullName}
                                                {c.copyPasteDetected && (
                                                    <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                        Pasted
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{c.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {c.testData?.title || 'Unknown Domain'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono">
                                            <span className="text-emerald-400 font-bold">{c.score}</span>
                                            <span className="text-slate-500"> / {c.totalScore || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => toggleExpand(c._id)}
                                                className={`text-xs px-3 py-1.5 rounded-lg transition-smooth ${expandedCandidate === c._id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                            >
                                                {expandedCandidate === c._id ? 'Hide Code ▲' : 'View Code ▼'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCandidate(c._id)}
                                                className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-smooth"
                                                title="Delete Candidate"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedCandidate === c._id && (
                                        <tr style={{ backgroundColor: '#f8fafc' }}>
                                            <td colSpan={5} className="px-6 py-6 border-b border-slate-200">
                                                <div className="space-y-5">
                                                    {c.submissions.length === 0 ? (
                                                        <div className="flex flex-col items-center py-8 text-slate-400">
                                                            <span className="text-4xl mb-2">📭</span>
                                                            <p className="text-sm italic">No code submissions recorded for this candidate.</p>
                                                        </div>
                                                    ) : (
                                                        c.submissions.map((sub, i) => {
                                                            const copyKey = `${c._id}-${i}`;
                                                            const langMap: Record<string, string> = { c: 'c', cpp: 'cpp', python: 'python', java: 'java', javascript: 'javascript' };
                                                            const monacoLang = langMap[sub.language] || 'javascript';
                                                            const passed = sub.score;
                                                            const total = sub.totalCases;
                                                            const allPassed = passed === total;
                                                            return (
                                                                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden shadow-md" style={{ background: '#fff' }}>
                                                                    {/* Header toolbar */}
                                                                    <div className="flex items-center justify-between px-5 py-3" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e8effa 100%)', borderBottom: '1px solid #e2e8f0' }}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex gap-1.5">
                                                                                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                                                                                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                                                                                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                                                                            </div>
                                                                            <h4 className="font-semibold text-slate-800 text-sm">{sub.problemTitle}</h4>
                                                                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{sub.language}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${allPassed ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                                                {allPassed ? '✅' : '⚠️'} {passed}/{total} passed
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleCopy(sub.code, copyKey)}
                                                                                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1.5"
                                                                            >
                                                                                {copiedIdx === copyKey ? '✅ Copied!' : '📋 Copy'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setFullscreenCode({ code: sub.code || '', language: monacoLang, title: sub.problemTitle })}
                                                                                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
                                                                                title="Open fullscreen"
                                                                            >
                                                                                ⛶ Fullscreen
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {/* Monaco Editor */}
                                                                    <div style={{ height: '420px' }}>
                                                                        <MonacoEditor
                                                                            height="100%"
                                                                            language={monacoLang}
                                                                            theme="vs"
                                                                            value={sub.code || '// No code submitted'}
                                                                            options={{
                                                                                readOnly: true,
                                                                                minimap: { enabled: true },
                                                                                fontSize: 14,
                                                                                lineHeight: 22,
                                                                                scrollBeyondLastLine: false,
                                                                                wordWrap: 'on',
                                                                                renderLineHighlight: 'all',
                                                                                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                                                                                padding: { top: 12, bottom: 12 },
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {candidates.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No candidates found across any tests yet.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Fullscreen Code Modal */}
        {fullscreenCode != null && (
            <div
                className="fixed inset-0 z-50 flex flex-col"
                style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}
            >
                <div className="flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid #334155' }}>
                    <div className="flex items-center gap-3">
                        <span className="text-white font-semibold text-sm">📄 {fullscreenCode?.title}</span>
                        <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">{fullscreenCode?.language}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleCopy(fullscreenCode?.code ?? '', 'fullscreen')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                        >
                            {copiedIdx === 'fullscreen' ? '✅ Copied!' : '📋 Copy'}
                        </button>
                        <button
                            onClick={() => setFullscreenCode(null)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all font-medium"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    <MonacoEditor
                        height="100%"
                        language={fullscreenCode?.language ?? 'javascript'}
                        theme="vs-dark"
                        value={fullscreenCode?.code || '// No code submitted'}
                        options={{
                            readOnly: true,
                            minimap: { enabled: true },
                            fontSize: 15,
                            lineHeight: 24,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            renderLineHighlight: 'all',
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                </div>
            </div>
        )}
        </>
    );
}
