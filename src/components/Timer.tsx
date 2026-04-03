'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerProps {
    remainingMs: number;
    onTimeUp: () => void;
}

export default function Timer({ remainingMs, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor(remainingMs / 1000)));
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const calledRef = useRef(false);

    const handleTimeUp = useCallback(() => {
        if (!calledRef.current) {
            calledRef.current = true;
            onTimeUp();
        }
    }, [onTimeUp]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [handleTimeUp]);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const isLow = timeLeft < 300; // < 5 minutes
    const isCritical = timeLeft < 60; // < 1 minute

    const formatNum = (n: number) => n.toString().padStart(2, '0');

    return (
        <motion.div
            animate={{
                scale: isCritical ? [1, 1.05, 1] : 1,
            }}
            transition={{
                repeat: isCritical ? Infinity : 0,
                duration: 1,
                ease: 'easeInOut'
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-colors shadow-sm ${isCritical
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : isLow
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
        >
            <Clock size={16} className={isCritical ? 'animate-pulse text-red-500' : ''} />
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={`${hours}-${minutes}-${seconds}`}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {hours > 0 && <>{formatNum(hours)}<span className="opacity-50">:</span></>}
                    {formatNum(minutes)}<span className="opacity-50">:</span>{formatNum(seconds)}
                </motion.span>
            </AnimatePresence>
        </motion.div>
    );
}
