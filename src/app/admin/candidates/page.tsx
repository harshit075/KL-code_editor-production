'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Submission {
    problemTitle: string;
    code: string;
    language: string;
    score: number;
    totalCases: number;
}

interface CandidateData {
    _id: string;
    name: string;
    email: string;
    status: string;
    score: number;
    totalScore: number;
    testData?: { title: string; slug: string };
    submissions: Submission[];
}

export default function AllCandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<CandidateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

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
            <div className="min-h-screen bg-gray-950">
                <Navbar isAdmin />
                <div className="flex items-center justify-center p-20">
                    <p className="text-gray-400 animate-pulse">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar isAdmin />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-100">All Candidates</h1>
                    <p className="text-sm text-gray-400 mt-1">Detailed overview of candidate domains, scores, and code submissions across all tests.</p>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700/50 bg-gray-900/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Name & Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Domain / Test Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {candidates.map((c) => (
                                <React.Fragment key={c._id}>
                                    <tr className={`hover:bg-gray-800/30 transition-smooth ${expandedCandidate === c._id ? 'bg-gray-800/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-200">{c.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{c.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {c.testData?.title || 'Unknown Domain'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono">
                                            <span className="text-emerald-400 font-bold">{c.score}</span>
                                            <span className="text-gray-500"> / {c.totalScore || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => toggleExpand(c._id)}
                                                className={`text-xs px-3 py-1.5 rounded-lg transition-smooth ${expandedCandidate === c._id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
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
                                        <tr className="bg-gray-900/50">
                                            <td colSpan={5} className="px-6 py-6 border-b border-gray-800 relative shadow-inner">
                                                <div className="space-y-6">
                                                    {c.submissions.length === 0 ? (
                                                        <p className="text-gray-500 text-sm italic">No code submissions recorded for this candidate.</p>
                                                    ) : (
                                                        c.submissions.map((sub, i) => (
                                                            <div key={i} className="bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden shadow-sm">
                                                                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 bg-gray-900/40">
                                                                    <div className="flex items-center gap-3">
                                                                        <h4 className="font-semibold text-gray-200">{sub.problemTitle}</h4>
                                                                        <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                                            {sub.language}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                                                        <span>Passed:</span>
                                                                        <span className={sub.score === sub.totalCases ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                                                            {sub.score}/{sub.totalCases}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-4">
                                                                    <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                                                        <code dangerouslySetInnerHTML={{ __html: sub.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '// No code submitted' }} />
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        ))
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
                        <div className="p-12 text-center text-gray-500">
                            No candidates found across any tests yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
