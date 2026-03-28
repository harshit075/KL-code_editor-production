'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TestRegistration() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [college, setCollege] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [testInfo, setTestInfo] = useState<{ title: string } | null>(null);

    useEffect(() => {
        // Check if there's an existing candidateId in session
        const existingId = sessionStorage.getItem(`candidate_${slug}`);
        if (existingId) {
            router.push(`/test/${slug}/code`);
        }
    }, [slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/candidates/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, college, mobile, testSlug: slug }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            // Store candidate ID in session
            sessionStorage.setItem(`candidate_${slug}`, data.candidate.id);
            sessionStorage.setItem(`test_${slug}`, JSON.stringify(data.test));

            // Navigate to coding page
            router.push(`/test/${slug}/code`);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5" />
            <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="relative w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100">Coding Assessment</h1>
                    <p className="text-gray-400 text-sm mt-1">Enter your details to begin the test</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">College / Organization</label>
                        <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="input-field"
                            placeholder="MIT Institute of Technology"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="input-field"
                            placeholder="9876543210"
                            required
                        />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm px-4 py-3 rounded-xl">
                        <strong>⚠️ Important:</strong> Once you start the test, the timer will begin immediately.
                        Make sure you have a stable internet connection.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-center flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Registering...
                            </div>
                        ) : (
                            'Start Coding Test →'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
