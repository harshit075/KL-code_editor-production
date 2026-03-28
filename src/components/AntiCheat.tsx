'use client';

import { useEffect, useRef } from 'react';

interface AntiCheatProps {
    candidateId: string;
    onViolation?: (type: string, count: number) => void;
}

export default function AntiCheat({ candidateId, onViolation }: AntiCheatProps) {
    const switchCountRef = useRef(0);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                switchCountRef.current += 1;

                // Report to server
                fetch('/api/candidates/tab-switch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ candidateId }),
                }).catch(() => { });

                if (onViolation) {
                    onViolation('tab-switch', switchCountRef.current);
                }
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
            document.removeEventListener('contextmenu', handleContextMenu);
            clearTimeout(timer);
        };
    }, [candidateId, onViolation]);

    return null; // This is a behavior-only component
}
