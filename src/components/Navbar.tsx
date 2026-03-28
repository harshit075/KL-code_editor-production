'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
    isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <svg className="h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold gradient-text">Kadel Labs</span>
                    </Link>

                    {/* Desktop nav */}
                    {isAdmin && (
                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { href: '/admin/dashboard', label: 'Dashboard' },
                                { href: '/admin/tests/create', label: 'Create Test' },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${pathname === item.href
                                            ? 'bg-indigo-500/15 text-indigo-400'
                                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button
                                onClick={handleLogout}
                                className="hidden md:block text-sm text-slate-600 hover:text-red-400 transition-smooth px-4 py-2 rounded-lg hover:bg-red-500/10"
                            >
                                Logout
                            </button>
                        )}

                        {/* Mobile menu button */}
                        {isAdmin && (
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                {isAdmin && mobileOpen && (
                    <div className="md:hidden py-3 border-t border-slate-200/50">
                        <Link href="/admin/dashboard" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100/50 rounded-lg">
                            Dashboard
                        </Link>
                        <Link href="/admin/tests/create" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100/50 rounded-lg">
                            Create Test
                        </Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
