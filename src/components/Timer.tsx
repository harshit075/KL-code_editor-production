'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all ${isCritical
                    ? 'bg-red-500/20 text-red-400 timer-critical'
                    : isLow
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-slate-100/60 text-slate-700'
                }`}
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {hours > 0 && `${formatNum(hours)}:`}
                {formatNum(minutes)}:{formatNum(seconds)}
            </span>
        </div>
    );
}
