'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare, ChevronDown, ChevronUp, Play, Info, ClipboardCopy, Check } from 'lucide-react';

interface IOConsoleProps {
    input: string;
    output: string;
    stderr: string;
    isRunning: boolean;
    onInputChange: (value: string) => void;
    sampleInput?: string;
    onRun?: () => void;
    problemType?: 'dsa' | 'sql';
}

export default function IOConsole({
    input,
    output,
    stderr,
    isRunning,
    onInputChange,
    sampleInput,
    onRun,
    problemType = 'dsa',
}: IOConsoleProps) {
    const [expanded, setExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
    const [copied, setCopied] = useState(false);
    const outputRef = useRef<HTMLPreElement>(null);

    // Auto-switch to output tab when running finishes and there's output
    useEffect(() => {
        if (!isRunning && (output || stderr)) {
            setActiveTab('output');
            if (!expanded) setExpanded(true);
        }
    }, [isRunning, output, stderr]);

    // Auto-scroll output to bottom
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, stderr]);

    const handleCopyOutput = () => {
        const text = stderr || output;
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUseSample = () => {
        if (sampleInput) {
            onInputChange(sampleInput);
        }
    };

    const hasOutput = !isRunning && (output || stderr);
    const consoleHeight = expanded ? 'h-64' : 'h-11';

    return (
        <div
            className={`transition-all duration-300 ease-in-out shrink-0 flex flex-col bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] ${consoleHeight}`}
        >
            {/* Console Header — always visible */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0 cursor-pointer select-none"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Terminal icon + label */}
                <TerminalSquare size={15} className="text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-600 tracking-wide">Console</span>

                {/* Status dot */}
                {isRunning ? (
                    <span className="flex items-center gap-1 ml-2 text-indigo-500 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                        Running...
                    </span>
                ) : hasOutput ? (
                    <span className={`flex items-center gap-1 ml-2 text-xs font-semibold ${stderr ? 'text-red-500' : 'text-emerald-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${stderr ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {stderr ? 'Error' : 'Output ready'}
                    </span>
                ) : null}

                {/* Tabs */}
                <div className="ml-auto flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {(['input', 'output'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setExpanded(true);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                        >
                            {tab === 'input' && problemType === 'sql' ? 'Test Query' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'output' && hasOutput && (
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 mb-px ${stderr ? 'bg-red-400' : 'bg-emerald-400'}`} />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={e => { e.stopPropagation(); setExpanded(ex => !ex); }}
                    className="ml-2 p-1 rounded hover:bg-slate-200 text-slate-400 transition"
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
            </div>

            {/* Console Body */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="console-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col min-h-0 overflow-hidden"
                    >
                        {/* INPUT TAB */}
                        {activeTab === 'input' && (
                            <div className="flex-1 flex flex-col min-h-0 p-3 gap-2">
                                {/* Hint banner */}
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 shrink-0">
                                    <Info size={12} className="text-blue-400 shrink-0" />
                                    <span>
                                        {problemType === 'sql' 
                                            ? 'Enter test SQL query here (overwrites the main query area), then click Run.'
                                            : 'Type your custom input here, then click Run Code to test it.'
                                        }
                                    </span>
                                    {sampleInput && (
                                        <button
                                            onClick={handleUseSample}
                                            className="ml-auto shrink-0 text-indigo-600 hover:text-indigo-800 font-semibold"
                                        >
                                            ↺ Use Sample
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => onInputChange(e.target.value)}
                                    placeholder={sampleInput || 'Enter program input here (stdin)...\nExample: 5\nor: hello world'}
                                    spellCheck={false}
                                    className="flex-1 min-h-0 w-full bg-slate-50 hover:bg-white text-sm text-slate-800 font-mono resize-none outline-none border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 rounded-xl p-3 transition-all placeholder:text-slate-400 placeholder:text-xs"
                                />
                                {onRun && (
                                    <button
                                        onClick={onRun}
                                        disabled={isRunning}
                                        className="shrink-0 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                                    >
                                        {isRunning ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={13} />
                                                Run with this Input
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* OUTPUT TAB */}
                        {activeTab === 'output' && (
                            <div className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-hidden">
                                {isRunning ? (
                                    <div className="flex-1 flex items-center justify-center gap-3 text-slate-400">
                                        <div className="flex gap-1.5">
                                            {[0, 0.15, 0.3].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut', delay }}
                                                    className="w-2 h-2 rounded-full bg-indigo-400"
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-mono">Executing...</span>
                                    </div>
                                ) : !output && !stderr ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
                                        <TerminalSquare size={24} className="text-slate-600" />
                                        <p className="text-sm font-mono">No output yet</p>
                                        <p className="text-xs text-slate-600">Click <span className="text-white font-semibold">Run Code</span> to execute</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                                        {/* Output toolbar */}
                                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/50 shrink-0">
                                            <span className={`text-xs font-semibold ${stderr ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {stderr ? '✗ Error Output' : '✓ Program Output'}
                                            </span>
                                            <button
                                                onClick={handleCopyOutput}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-700"
                                            >
                                                {copied ? <Check size={11} /> : <ClipboardCopy size={11} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <pre
                                            ref={outputRef}
                                            className={`flex-1 min-h-0 overflow-auto text-sm font-mono whitespace-pre-wrap leading-relaxed p-3 ${stderr ? 'text-red-300' : 'text-emerald-300'}`}
                                        >
                                            {stderr || output}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
