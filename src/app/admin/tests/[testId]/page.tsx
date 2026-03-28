'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface CandidateItem {
    _id: string;
    fullName: string;
    email: string;
    college: string;
    score: number;
    totalScore: number;
    status: string;
    tabSwitchCount: number;
    startedAt: string;
    submittedAt: string;
}

interface SubmissionItem {
    _id: string;
    candidateId: { _id: string; fullName: string } | string;
    problemId: { _id: string; title: string } | string;
    code: string;
    language: string;
    testCasesPassed: number;
    totalTestCases: number;
    timeTaken: number;
}

interface TestDetail {
    _id: string;
    title: string;
    slug: string;
    duration: number;
    problems: { _id: string; title: string; difficulty: string }[];
}

interface AnalyticsData {
    totalCandidates: number;
    completedCandidates: number;
    completionRate: number;
    averageScore: number;
}

export default function TestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.testId as string;

    const [test, setTest] = useState<TestDetail | null>(null);
    const [candidates, setCandidates] = useState<CandidateItem[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [viewingCode, setViewingCode] = useState<SubmissionItem | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/tests/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) { router.push('/admin/login'); return; }
                const data = await res.json();
                setTest(data.test);
                setCandidates(data.candidates);
                setSubmissions(data.submissions);
                setAnalytics(data.analytics);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [testId, router]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const copyLink = () => {
        if (test) {
            navigator.clipboard.writeText(`${window.location.origin}/test/${test.slug}`);
        }
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
                setAnalytics(prev => prev ? { ...prev, totalCandidates: prev.totalCandidates - 1 } : null);
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
            <div className="min-h-screen bg-gray-950">
                <Navbar isAdmin />
                <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
                    <div className="skeleton h-12 w-64" />
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
                    </div>
                    <div className="skeleton h-96" />
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-200 mb-2">Test not found</h2>
                    <Link href="/admin/dashboard" className="btn-primary text-sm">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const candidateSubmissions = selectedCandidate
        ? submissions.filter((s) => {
            const cid = typeof s.candidateId === 'object' ? s.candidateId._id : s.candidateId;
            return cid === selectedCandidate;
        })
        : [];

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar isAdmin />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-300 mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-100">{test.title}</h1>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>🕐 {test.duration} min</span>
                            <span>📝 {test.problems.length} problems</span>
                        </div>
                    </div>
                    <button onClick={copyLink} className="btn-secondary text-sm">
                        📋 Copy Test Link
                    </button>
                </div>

                {/* Analytics row */}
                {analytics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-indigo-400">{analytics.totalCandidates}</div>
                            <div className="text-xs text-gray-500 mt-1">Total Candidates</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{analytics.completedCandidates}</div>
                            <div className="text-xs text-gray-500 mt-1">Completed</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400">{analytics.completionRate}%</div>
                            <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <div className="text-2xl font-bold text-rose-400">{analytics.averageScore}%</div>
                            <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                        </div>
                    </div>
                )}

                {/* Candidates Table */}
                <h2 className="text-lg font-semibold text-gray-200 mb-4">Candidates</h2>
                {candidates.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <p className="text-gray-500">No candidates have taken this test yet.</p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700/50">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Name</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Email</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">College</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Score</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Tab Switches</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {candidates.map((c) => (
                                        <tr key={c._id} className={`hover:bg-gray-800/30 transition-smooth ${selectedCandidate === c._id ? 'bg-indigo-500/5' : ''}`}>
                                            <td className="px-5 py-3 text-sm font-medium text-gray-200">{c.fullName}</td>
                                            <td className="px-5 py-3 text-sm text-gray-400">{c.email}</td>
                                            <td className="px-5 py-3 text-sm text-gray-400">{c.college}</td>
                                            <td className="px-5 py-3 text-sm">
                                                <span className="text-emerald-400 font-medium">{c.score}</span>
                                                <span className="text-gray-600">/{c.totalScore}</span>
                                            </td>
                                            <td className="px-5 py-3 text-sm">
                                                <span className={c.tabSwitchCount > 3 ? 'text-red-400 font-medium' : 'text-gray-400'}>
                                                    {c.tabSwitchCount}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                                        c.status === 'in-progress' ? 'bg-amber-500/15 text-amber-400' :
                                                            c.status === 'timed-out' ? 'bg-red-500/15 text-red-400' :
                                                                'bg-gray-500/15 text-gray-400'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedCandidate(selectedCandidate === c._id ? null : c._id)}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10"
                                                >
                                                    {selectedCandidate === c._id ? 'Hide' : 'View Code'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCandidate(c._id)}
                                                    className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-smooth"
                                                    title="Delete Candidate"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Selected candidate submissions */}
                {selectedCandidate && candidateSubmissions.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-md font-semibold text-gray-300">
                            Submissions by {candidates.find(c => c._id === selectedCandidate)?.fullName}
                        </h3>
                        {candidateSubmissions.map((sub) => (
                            <div key={sub._id} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-200">
                                            {typeof sub.problemId === 'object' ? sub.problemId.title : 'Problem'}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{sub.language}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-emerald-400">{sub.testCasesPassed}/{sub.totalTestCases} passed</span>
                                        <span className="text-gray-500">{formatTime(sub.timeTaken)}</span>
                                        <button
                                            onClick={() => setViewingCode(viewingCode?._id === sub._id ? null : sub)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300"
                                        >
                                            {viewingCode?._id === sub._id ? 'Hide Code' : 'Show Code'}
                                        </button>
                                    </div>
                                </div>
                                {viewingCode?._id === sub._id && (
                                    <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-x-auto max-h-80 overflow-y-auto border border-gray-700/50">
                                        {sub.code}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
