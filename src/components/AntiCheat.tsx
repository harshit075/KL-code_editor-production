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

            if (onViolation) {
                onViolation(reason, switchCountRef.current);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerViolation('tab-switch');
            }
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
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Request fullscreen immediately and on first user interaction if blocked
        const requestFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // Fullscreen blocked, waiting for user click
            }
        };

        // Try immediately upon mount
        requestFullscreen();

        // Fallback: Enforce on first interaction if it didn't work immediately
        const handleInteraction = () => {
            requestFullscreen();
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, [candidateId, onViolation]);

    return null; // This is a behavior-only component
}
