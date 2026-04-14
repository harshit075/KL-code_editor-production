'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScreenMonitorProps {
  onPermissionDenied?: () => void;
  onCaptureReady?: (captureFn: () => string | null) => void;
}

export default function ScreenMonitor({
  onPermissionDenied,
  onCaptureReady,
}: ScreenMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureReadyFired = useRef(false);
  const [, setStatus] = useState<'waiting' | 'active' | 'denied'>('waiting');

  // Store callbacks in refs
  const onCaptureReadyRef = useRef(onCaptureReady);
  const onPermissionDeniedRef = useRef(onPermissionDenied);
  onCaptureReadyRef.current = onCaptureReady;
  onPermissionDeniedRef.current = onPermissionDenied;

  // Stable capture function
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.warn('[ScreenMonitor] captureFrame: video not ready', video?.readyState);
      return null;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.5);
    } catch (e) {
      console.error('[ScreenMonitor] capture failed:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startScreenShare = async () => {
      try {
        console.log('[ScreenMonitor] Requesting getDisplayMedia...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' }
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Handle user stopping screen share via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setStatus('denied');
          onPermissionDeniedRef.current?.();
        });

        const handleReady = () => {
          if (cancelled) return;
          console.log('[ScreenMonitor] Video ready, readyState:', video.readyState);
          video.play().catch(e => console.log('Screen play error:', e));
          setStatus('active');

          if (!captureReadyFired.current) {
            captureReadyFired.current = true;
            onCaptureReadyRef.current?.(captureFrame);
          }
        };

        if (video.readyState >= 1) {
          handleReady();
        } else {
          video.onloadedmetadata = handleReady;
        }

      } catch (err) {
        console.error('[ScreenMonitor] getDisplayMedia failed:', err);
        if (!cancelled) {
          setStatus('denied');
          onPermissionDeniedRef.current?.();
        }
      }
    };

    startScreenShare();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="hidden"
    />
  );
}
