'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

type CameraStatus = 'checking' | 'granted' | 'denied' | 'prompt';

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

    // Camera permission state
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('checking');
    const [cameraChecking, setCameraChecking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Check if there's an existing candidateId in session
        const existingId = sessionStorage.getItem(`candidate_${slug}`);
        if (existingId) {
            router.push(`/test/${slug}/code`);
            return;
        }

        // Check if camera permission was already granted via the Permissions API
        if (typeof navigator !== 'undefined' && navigator.permissions) {
            navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
                if (result.state === 'granted') {
                    setCameraStatus('granted');
                } else if (result.state === 'denied') {
                    setCameraStatus('denied');
                } else {
                    setCameraStatus('prompt'); // needs to ask
                }
                result.onchange = () => {
                    if (result.state === 'granted') setCameraStatus('granted');
                    else if (result.state === 'denied') setCameraStatus('denied');
                };
            }).catch(() => {
                setCameraStatus('prompt'); // Permissions API not supported
            });
        } else {
            setCameraStatus('prompt');
        }

        return () => {
            // Clean up any open stream
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [slug, router]);

    const requestCamera = async () => {
        setCameraChecking(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            // Show live preview briefly
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraStatus('granted');
        } catch {
            // User blocked or device unavailable
            setCameraStatus('denied');
        } finally {
            setCameraChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block submission if camera not granted
        if (cameraStatus !== 'granted') {
            setError('Camera access is required to start the test. Please allow camera access first.');
            return;
        }

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

            // Navigate to coding page (keep stream alive — CameraMonitor will take over)
            router.push(`/test/${slug}/code`);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cameraBlocked = cameraStatus === 'denied';
    const cameraReady = cameraStatus === 'granted';

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
                        <svg className="h-7 w-7 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Coding Assessment</h1>
                    <p className="text-slate-600 text-sm mt-1">Enter your details to begin the test</p>
                </div>

                {/* ── CAMERA BLOCKED STATE ── */}
                {cameraBlocked ? (
                    <div className="glass-card p-8 text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-4xl">📷</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-2">Camera Access Required</h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                This is a <strong>proctored test</strong>. Camera access is <strong>mandatory</strong> to
                                ensure exam integrity. You cannot start the test with camera blocked.
                            </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left space-y-2">
                            <p className="font-semibold">How to enable camera:</p>
                            <ol className="list-decimal list-inside space-y-1 text-amber-700">
                                <li>Click the 🔒 lock icon in your browser address bar</li>
                                <li>Set <strong>Camera</strong> to <em>Allow</em></li>
                                <li>Refresh this page and try again</li>
                            </ol>
                        </div>
                        <button
                            onClick={requestCamera}
                            disabled={cameraChecking}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                            {cameraChecking ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                '🔄 Try Again — Enable Camera'
                            )}
                        </button>
                    </div>
                ) : (
                    /* ── FORM ── */
                    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">College / Organization</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="input-field"
                                placeholder="9876543210"
                                required
                            />
                        </div>

                        {/* Camera permission step */}
                        <div className={`rounded-xl border px-4 py-3 text-sm ${
                            cameraReady
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                            {cameraReady ? (
                                <div className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">✅</span>
                                    <div>
                                        <p className="font-semibold">Camera Access Granted</p>
                                        <p className="text-emerald-700 text-xs mt-0.5">
                                            Your camera is ready. Proctoring will be active during the test.
                                        </p>
                                        {/* Live preview thumbnail */}
                                        <video
                                            ref={videoRef}
                                            muted
                                            playsInline
                                            className="mt-2 rounded-lg w-24 h-16 object-cover border border-emerald-300"
                                            style={{ transform: 'scaleX(-1)' }}
                                        />
                                    </div>
                                </div>
                            ) : cameraStatus === 'checking' ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
                                    Checking camera permission...
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">📷</span>
                                    <div className="flex-1">
                                        <p className="font-semibold">Camera Access Required</p>
                                        <p className="text-amber-700 text-xs mt-0.5">
                                            This is a proctored test. You must allow camera access to begin.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={requestCamera}
                                            disabled={cameraChecking}
                                            className="mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
                                        >
                                            {cameraChecking ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Requesting...
                                                </>
                                            ) : (
                                                '🎥 Allow Camera Access'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm px-4 py-3 rounded-xl">
                            <strong>⚠️ Important:</strong> Once you start the test, the timer will begin immediately.
                            Make sure you have a stable internet connection.
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !cameraReady}
                            className={`w-full py-3 text-center flex items-center justify-center rounded-xl font-semibold text-sm transition-all ${
                                cameraReady
                                    ? 'btn-primary cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registering...
                                </div>
                            ) : !cameraReady ? (
                                '🔒 Allow Camera to Continue'
                            ) : (
                                'Start Coding Test →'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
