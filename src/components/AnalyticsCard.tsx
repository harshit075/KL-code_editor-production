"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'indigo' | 'emerald' | 'amber' | 'rose';
    href?: string;
}

const colorMap = {
    indigo: {
        bg: 'bg-indigo-50 hover:bg-indigo-100/50',
        border: 'border-indigo-100',
        iconBg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        value: 'text-indigo-900',
        shadow: 'hover:shadow-indigo-500/20',
    },
    emerald: {
        bg: 'bg-emerald-50 hover:bg-emerald-100/50',
        border: 'border-emerald-100',
        iconBg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        value: 'text-emerald-900',
        shadow: 'hover:shadow-emerald-500/20',
    },
    amber: {
        bg: 'bg-amber-50 hover:bg-amber-100/50',
        border: 'border-amber-100',
        iconBg: 'bg-amber-100',
        icon: 'text-amber-600',
        value: 'text-amber-900',
        shadow: 'hover:shadow-amber-500/20',
    },
    rose: {
        bg: 'bg-rose-50 hover:bg-rose-100/50',
        border: 'border-rose-100',
        iconBg: 'bg-rose-100',
        icon: 'text-rose-600',
        value: 'text-rose-900',
        shadow: 'hover:shadow-rose-500/20',
    },
};

export default function AnalyticsCard({ title, value, subtitle, icon, color, href }: AnalyticsCardProps) {
    const colors = colorMap[color];

    const CardContent = (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`glass-card p-6 ${colors.bg} border ${colors.border} shadow-sm transition-all duration-300 ${colors.shadow} cursor-pointer relative overflow-hidden`}
        >
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 pointer-events-none">
                {icon}
            </div>
            
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{title}</p>
                    <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl font-extrabold mt-3 tracking-tight ${colors.value}`}
                    >
                        {value}
                    </motion.p>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-2 font-medium bg-white/50 inline-block px-2 py-1 rounded-md">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3.5 rounded-2xl ${colors.iconBg} ${colors.icon} shadow-sm`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );

    if (href) {
        return <Link href={href} className="block w-full">{CardContent}</Link>;
    }

    return CardContent;
}
