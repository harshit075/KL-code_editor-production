'use client';

import { useEffect, useRef } from 'react';

interface AntiCheatProps {
    candidateId: string;
    initialSwitchCount?: number;
    onViolation?: (type: string, count: number) => void;
}

export default function AntiCheat({ candidateId, initialSwitchCount = 0, onViolation }: AntiCheatProps) {
    const switchCountRef = useRef(initialSwitchCount);

    useEffect(() => {
        if (initialSwitchCount > switchCountRef.current) {
            switchCountRef.current = initialSwitchCount;
        }
    }, [initialSwitchCount]);

    useEffect(() => {
        let lastViolationTime = 0;

        const triggerViolation = (reason: string) => {
            const now = Date.now();
            // Debounce violations by 2 seconds to avoid double counting blur+visibilitychange
            if (now - lastViolationTime < 2000) return;
            lastViolationTime = now;

            switchCountRef.current += 1;

            // Report to server
            fetch('/api/candidates/tab-switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, reason }),
            }).catch(() => { });

            if (onViolation) {
                onViolation('tab-switch', switchCountRef.current);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerViolation('tab-switch');
            }
        };

        const handleBlur = () => {
            triggerViolation('blur');
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block common copy shortcuts during test
            if (
                (e.ctrlKey || e.metaKey) &&
                ['c', 'v', 'u', 'p', 's'].includes(e.key.toLowerCase()) &&
                !e.target
            ) {
                // Allow copy/paste in the code editor, only block on the rest of the page
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Request fullscreen
        const requestFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // Fullscreen may be blocked by browser
            }
        };

        // Small delay to let component mount
        const timer = setTimeout(requestFullscreen, 1000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [candidateId, onViolation]);

    return null; // This is a behavior-only component
}
