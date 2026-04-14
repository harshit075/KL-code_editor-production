'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AnalyticsCard from '@/components/AnalyticsCard';

interface TestItem {
    _id: string;
    title: string;
    slug: string;
    duration: number;
    isActive: boolean;
    createdAt: string;
    problems: { title: string; difficulty: string }[];
    candidateCount: number;
    completedCount: number;
}

interface FlaggedCandidate {
    _id: string;
    fullName: string;
    email: string;
    testId: { _id: string; title: string };
    tabSwitchCount: number;
    noFaceDetectCount: number;
    copyPasteDetected: boolean;
    violationScreenshots: {
        _id?: string;
        reason: string;
        cameraImage?: string;
        screenImage?: string;
        timestamp: string;
    }[];
}

interface Analytics {
    totalTests: number;
    totalCandidates: number;
    completedCandidates: number;
    completionRate: number;
    averageScore: number;
    highestScore: number;
    totalSubmissions: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [tests, setTests] = useState<TestItem[]>([]);
    const [flaggedCandidates, setFlaggedCandidates] = useState<FlaggedCandidate[]>([]);
    const [viewingEvidence, setViewingEvidence] = useState<FlaggedCandidate | null>(null);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalTests: 0,
        totalCandidates: 0,
        completedCandidates: 0,
        completionRate: 0,
        averageScore: 0,
        highestScore: 0,
        totalSubmissions: 0,
    });
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('');
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const name = localStorage.getItem('adminName');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setAdminName(name || 'Admin');

        const fetchData = async () => {
            try {
                // Single combined call — avoids 2 separate cold starts on Vercel
                const res = await fetch('/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                    return;
                }

                const data = await res.json();
                setTests(data.tests || []);
                setFlaggedCandidates(data.flaggedCandidates || []);
                if (data.analytics) {
                    setAnalytics(data.analytics);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);


    const copyLink = (slug: string) => {
        const link = `${window.location.origin}/test/${slug}`;
        navigator.clipboard.writeText(link);
        setCopiedSlug(slug);
        setToastMessage('Test link copied to clipboard! 📋');
        setTimeout(() => {
            setCopiedSlug(null);
            setToastMessage(null);
        }, 3000);
    };

    const handleDeleteTest = async (testId: string) => {
        if (!window.confirm('Are you sure you want to delete this test? All candidate attempts and submissions will also be deleted. This cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/tests/${testId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setTests(tests.filter(t => t._id !== testId));
                setAnalytics(prev => ({ ...prev, totalTests: prev.totalTests - 1 }));
            } else {
                alert('Failed to delete test.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('An error occurred while deleting the test.');
        }
    };

    const handleDeleteAllTests = async () => {
        if (tests.length === 0) return;

        if (!window.confirm('Are you ABSOLUTELY sure you want to delete ALL tests? All candidate attempts and submissions across all tests will also be permanently deleted.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/tests`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setTests([]);
                setAnalytics(prev => ({ ...prev, totalTests: 0, totalCandidates: 0, completedCandidates: 0, completionRate: 0, averageScore: 0, highestScore: 0, totalSubmissions: 0 }));
            } else {
                alert('Failed to delete all tests.');
            }
        } catch (err) {
            console.error('Delete all error:', err);
            alert('An error occurred while deleting all tests.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar isAdmin />
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-32" />
                        ))}
                    </div>
                    <div className="skeleton h-64" />
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-slate-50">
            <Navbar isAdmin />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, <span className="gradient-text">{adminName}</span>
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">Here&apos;s your assessment overview</p>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <AnalyticsCard
                        title="Total Tests"
                        value={analytics.totalTests}
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                        color="indigo"
                    />
                    <AnalyticsCard
                        title="Total Candidates"
                        value={analytics.totalCandidates}
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        color="emerald"
                        href="/admin/candidates"
                    />
                    <AnalyticsCard
                        title="Completion Rate"
                        value={`${analytics.completionRate}%`}
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        color="amber"
                    />
                    <AnalyticsCard
                        title="Avg Score"
                        value={`${analytics.averageScore}%`}
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        color="rose"
                    />
                    <AnalyticsCard
                        title="Highest Score"
                        value={`${analytics.highestScore}%`}
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                        color="indigo"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">Your Tests</h2>
                    <div className="flex items-center gap-3">
                        {tests.length > 0 && (
                            <button
                                onClick={handleDeleteAllTests}
                                className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 shadow-red-500/20 text-sm flex items-center gap-2"
                            >
                                🗑️ Delete All Tests
                            </button>
                        )}
                        <Link href="/admin/tests/create" className="btn-primary text-sm">
                            + Create Test
                        </Link>
                    </div>
                </div>

                {/* Tests table */}
                {tests.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-slate-700 mb-2">No tests yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Create your first coding test to start evaluating candidates</p>
                        <Link href="/admin/tests/create" className="btn-primary text-sm">
                            Create Your First Test
                        </Link>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-300/50">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Test</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Problems</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Candidates</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {tests.map((test) => (
                                        <tr key={test._id} className="hover:bg-slate-100/30 transition-smooth">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{test.title}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(test.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {test.problems?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {test.duration} min
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{test.completedCount}</span>
                                                <span className="text-slate-400"> / {test.candidateCount}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${test.isActive
                                                        ? 'bg-emerald-500/15 text-emerald-400'
                                                        : 'bg-slate-500/15 text-slate-600'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${test.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                                    {test.isActive ? 'Active' : 'Closed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => copyLink(test.slug)}
                                                        className={`text-xs px-3 py-1.5 rounded-lg transition-smooth ${copiedSlug === test.slug ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'}`}
                                                        title="Copy test link"
                                                    >
                                                        {copiedSlug === test.slug ? '✅ Copied!' : '📋 Copy Link'}
                                                    </button>
                                                    <Link
                                                        href={`/admin/tests/${test._id}`}
                                                        className="text-xs text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-smooth"
                                                    >
                                                        View Details →
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteTest(test._id)}
                                                        className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-smooth ml-1"
                                                        title="Delete test"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Recent Violations / Flagged Candidates section */}
        {flaggedCandidates.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <span>🚨</span> Recent Cheating Violations
                    </h2>
                </div>
                <div className="glass-card overflow-hidden border border-red-500/20">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-red-500/20 bg-red-50/50">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-red-700 uppercase tracking-wider">Candidate Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-red-700 uppercase tracking-wider">Test context</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-red-700 uppercase tracking-wider">Violations Type</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-red-700 uppercase tracking-wider">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {flaggedCandidates.map((fc) => (
                                    <tr key={fc._id} className="hover:bg-red-50 transition-smooth">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{fc.fullName}</div>
                                            <div className="text-xs text-slate-500">{fc.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/tests/${fc.testId?._id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline">
                                                {fc.testId?.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={fc.tabSwitchCount > 0 ? 'text-red-500 font-bold text-xs' : 'text-slate-500 text-xs'}>
                                                    Tabs Switched: {fc.tabSwitchCount}
                                                </span>
                                                {fc.noFaceDetectCount > 0 && (
                                                    <span className="text-amber-600 font-bold text-xs">
                                                        No-Face: {fc.noFaceDetectCount}
                                                    </span>
                                                )}
                                                {fc.copyPasteDetected && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded w-max font-bold uppercase tracking-wider">
                                                        Pasted Code
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {fc.violationScreenshots && fc.violationScreenshots.length > 0 ? (
                                                <button
                                                    onClick={() => setViewingEvidence(fc)}
                                                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-bold transition-smooth inline-flex items-center gap-1.5"
                                                >
                                                    📷 View Screens ({fc.violationScreenshots.length})
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                    No Images
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 border border-slate-700/50 backdrop-blur-md">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-sm font-medium">{toastMessage}</span>
            </div>
        )}

        {/* Evidence Modal */}
        {viewingEvidence && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}>
                <div className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Violation Evidence</h2>
                            <p className="text-sm text-slate-500">Candidate: {viewingEvidence.fullName} • Test: {viewingEvidence.testId?.title}</p>
                        </div>
                        <button onClick={() => setViewingEvidence(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
                        {viewingEvidence.violationScreenshots?.map((evidence, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-800 capitalize">
                                        Violation {idx + 1}: {evidence.reason.replace('-', ' ')}
                                    </h3>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {new Date(evidence.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-600 flex items-center gap-2">📷 Candidate Camera</h4>
                                        {evidence.cameraImage ? (
                                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={evidence.cameraImage} alt="Camera snapshot" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner text-slate-400 text-sm">
                                                No camera image available
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-600 flex items-center gap-2">💻 Laptop Screen</h4>
                                        {evidence.screenImage ? (
                                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={evidence.screenImage} alt="Screen snapshot" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner text-slate-400 text-sm">
                                                No screen image available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
