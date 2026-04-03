'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface CameraMonitorProps {
  onViolation: (type: 'no-face' | 'multiple-faces', count: number) => void;
  onPermissionDenied?: () => void;
  maxViolations?: number;
}

type MonitorStatus = 'loading-models' | 'waiting-camera' | 'active' | 'warning' | 'denied' | 'error';

export default function CameraMonitor({
  onViolation,
  onPermissionDenied,
  maxViolations = 3,
}: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveMissRef = useRef(0);   // consecutive no-face frames before issuing warning
  const violationCountRef = useRef(0);

  const [status, setStatus] = useState<MonitorStatus>('loading-models');
  const [statusText, setStatusText] = useState('Loading AI models…');
  const [violationCount, setViolationCount] = useState(0);
  const [lastAlert, setLastAlert] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // ── 1. Load tiny face-detector model ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsReady(true);
        setStatus('waiting-camera');
        setStatusText('Waiting for camera…');
      } catch (err) {
        console.error('Failed to load face models:', err);
        setStatus('error');
        setStatusText('Model load failed');
      }
    };
    load();
  }, []);

  // ── 2. Start webcam ────────────────────────────────────────────────────
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
            setStatus('active');
            setStatusText('Monitoring active');
          };
        }
      } catch {
        setStatus('denied');
        setStatusText('Camera access denied');
        onPermissionDenied?.();
      }
    };
    startCam();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onPermissionDenied]);

  // ── 3. Detection loop ──────────────────────────────────────────────────
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !modelsReady || !cameraReady) return;
    if (violationCountRef.current >= maxViolations) return;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 })
      );
      const count = detections.length;

      if (count === 0) {
        consecutiveMissRef.current += 1;
        setStatusText(`No face (${consecutiveMissRef.current}/2)`);
        // Require 2 consecutive misses to avoid false positives
        if (consecutiveMissRef.current >= 2) {
          consecutiveMissRef.current = 0;
          violationCountRef.current += 1;
          setViolationCount(violationCountRef.current);
          setLastAlert('No face detected – possible absence');
          setStatus('warning');
          onViolation('no-face', violationCountRef.current);
          setTimeout(() => {
            setStatus('active');
            setStatusText('Monitoring active');
          }, 4000);
        }
      } else if (count > 1) {
        consecutiveMissRef.current = 0;
        violationCountRef.current += 1;
        setViolationCount(violationCountRef.current);
        setLastAlert(`${count} faces detected – possible assistance`);
        setStatus('warning');
        onViolation('multiple-faces', violationCountRef.current);
        setTimeout(() => {
          setStatus('active');
          setStatusText('Monitoring active');
        }, 4000);
      } else {
        consecutiveMissRef.current = 0;
        setStatusText('Face OK ✓');
        if (status === 'active') {
          setTimeout(() => setStatusText('Monitoring active'), 2000);
        }
      }
    } catch (err) {
      console.warn('Detection skipped:', err);
    }
  }, [modelsReady, cameraReady, maxViolations, onViolation, status]);

  useEffect(() => {
    if (!modelsReady || !cameraReady) return;
    intervalRef.current = setInterval(runDetection, 6000); // every 6 s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelsReady, cameraReady, runDetection]);

  // ── UI helpers ─────────────────────────────────────────────────────────
  const borderColor =
    status === 'warning' ? 'border-red-500 shadow-red-500/30' :
    status === 'active'  ? 'border-emerald-500 shadow-emerald-500/20' :
    status === 'denied'  ? 'border-gray-500' :
    'border-yellow-500 shadow-yellow-500/20';

  const badge =
    status === 'warning'       ? { text: '⚠ ALERT',   cls: 'bg-red-600 animate-pulse' } :
    status === 'active'        ? { text: '● LIVE',    cls: 'bg-emerald-600' } :
    status === 'denied'        ? { text: '✕ NO CAM',  cls: 'bg-gray-600' } :
    status === 'loading-models'? { text: '⟳ INIT',   cls: 'bg-yellow-600' } :
    status === 'error'         ? { text: '✕ ERROR',   cls: 'bg-red-700' } :
                                 { text: '⟳ CAM…',   cls: 'bg-yellow-600' };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5 select-none">
      {/* Minimized pill */}
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-lg border ${borderColor} bg-gray-900/90 backdrop-blur-sm`}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400' : status === 'warning' ? 'bg-red-400 animate-ping' : 'bg-gray-400'}`} />
          Proctored {violationCount > 0 && `· ${violationCount}/${maxViolations} warns`}
        </button>
      ) : (
        <>
          {/* Warning banner above widget */}
          {status === 'warning' && lastAlert && (
            <div className="flex items-start gap-2 bg-red-600 text-white text-[11px] px-3 py-2 rounded-xl shadow-lg max-w-[200px] border border-red-400/50">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <div>
                <div className="font-bold">Violation {violationCount}/{maxViolations}</div>
                <div className="text-red-200 mt-0.5">{lastAlert}</div>
              </div>
            </div>
          )}

          {/* Camera widget */}
          <div
            className={`relative rounded-2xl overflow-hidden border-2 shadow-xl transition-all duration-300 ${borderColor}`}
            style={{ width: 168, height: 126 }}
          >
            {/* Video */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}   // mirror
            />

            {/* Top badge */}
            <div className="absolute top-1.5 left-1.5">
              <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md ${badge.cls}`}>
                {badge.text}
              </span>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setMinimized(true)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 text-white text-[10px] flex items-center justify-center transition-colors"
              title="Minimize"
            >
              ─
            </button>

            {/* Violation dots */}
            {maxViolations > 0 && (
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {Array.from({ length: maxViolations }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full border border-white/50 transition-colors ${
                      i < violationCount ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom status text */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[9px] text-white/80 text-center py-1 px-1 truncate">
              {statusText}
            </div>

            {/* Camera denied overlay */}
            {status === 'denied' && (
              <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">📷</span>
                <span className="text-[10px] text-gray-300 text-center px-2">Camera access denied</span>
              </div>
            )}

            {/* Loading overlay */}
            {(status === 'loading-models' || status === 'waiting-camera') && (
              <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                <span className="text-[9px] text-yellow-300 text-center px-2">{statusText}</span>
              </div>
            )}
          </div>

          {/* Label */}
          <span className="text-[10px] text-slate-400 font-medium pr-0.5">🔒 Proctored Session</span>
        </>
      )}
    </div>
  );
}
