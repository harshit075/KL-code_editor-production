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

interface Analytics {
    totalTests: number;
    totalCandidates: number;
    completedCandidates: number;
    completionRate: number;
    averageScore: number;
    totalSubmissions: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [tests, setTests] = useState<TestItem[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
                setAnalytics(data.analytics || null);
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
                setAnalytics(prev => prev ? { ...prev, totalTests: prev.totalTests - 1 } : null);
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
                setAnalytics(prev => prev ? { ...prev, totalTests: 0, totalCandidates: 0, completedCandidates: 0, totalSubmissions: 0 } : null);
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
                {analytics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    </div>
                )}

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
        
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 border border-slate-700/50 backdrop-blur-md">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-sm font-medium">{toastMessage}</span>
            </div>
        )}
        </>
    );
}
