'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, LayoutDashboard, PlusCircle, LogOut, Menu, X } from 'lucide-react';

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
        <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-3 group">
                        <motion.div 
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow"
                        >
                            <Terminal className="h-5 w-5 text-white" />
                        </motion.div>
                        <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Kadel Labs</span>
                    </Link>

                    {/* Desktop nav */}
                    {isAdmin && (
                        <div className="hidden md:flex items-center gap-2">
                            {[
                                { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { href: '/admin/tests/create', label: 'Create Test', icon: PlusCircle },
                            ].map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all group overflow-hidden"
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeNavBg"
                                                className="absolute inset-0 bg-indigo-50 rounded-lg -z-10"
                                            />
                                        )}
                                        <div className={`flex items-center gap-2 z-10 relative ${isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                            <item.icon size={16} />
                                            {item.label}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                            >
                                <LogOut size={16} />
                                Logout
                            </motion.button>
                        )}

                        {/* Mobile menu button */}
                        {isAdmin && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isAdmin && mobileOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-slate-200/50"
                        >
                            <div className="py-3 px-2 space-y-1">
                                <Link 
                                    href="/admin/dashboard" 
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg ${pathname === '/admin/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/admin/tests/create" 
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg ${pathname === '/admin/tests/create' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <PlusCircle size={18} />
                                    Create Test
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg mt-2 pt-4 border-t border-slate-100"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
