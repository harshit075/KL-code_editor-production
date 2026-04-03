'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface IOConsoleProps {
    input: string;
    output: string;
    stderr: string;
    isRunning: boolean;
    onInputChange: (value: string) => void;
}

export default function IOConsole({ input, output, stderr, isRunning, onInputChange }: IOConsoleProps) {
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

    useEffect(() => {
        if (isRunning) {
            setActiveTab('output');
        }
    }, [isRunning]);

    return (
        <div className="flex flex-col h-full bg-white relative rounded-bl-2xl overflow-hidden shadow-inner border-t border-slate-200">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 backdrop-blur-sm z-10 sticky top-0 px-2 space-x-1 pt-2">
                <div className="flex items-center px-4 gap-2 text-slate-400 mr-2 border-r border-slate-200/50">
                    <TerminalSquare size={16} />
                </div>
                
                {(['input', 'output'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-5 py-2.5 text-sm font-semibold transition-all rounded-t-lg flex items-center gap-2
                             ${activeTab === tab 
                                ? 'text-indigo-600 bg-white' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                             }`}
                    >
                        {tab === 'input' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                        {tab === 'input' ? 'Input' : 'Output'}
                        
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeConsoleTab" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"
                            />
                        )}
                    </button>
                ))}

                {isRunning && (
                    <div className="ml-auto flex items-center px-4">
                        <div className="flex gap-1.5 items-center bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                            <motion.div 
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                            />
                            <motion.div 
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                            />
                            <motion.div 
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-0 relative bg-white overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'input' ? (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full p-4"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => onInputChange(e.target.value)}
                                placeholder="Enter your program input here..."
                                className="w-full h-full bg-slate-50 hover:bg-white text-sm text-slate-800 font-mono resize-none outline-none border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-xl p-4 transition-all shadow-inner placeholder:text-slate-400"
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="output"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full p-4 bg-slate-900 overflow-auto shadow-inner"
                        >
                            {stderr ? (
                                <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap leading-relaxed">{stderr}</pre>
                            ) : output ? (
                                <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{output}</pre>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm text-slate-500 font-mono flex items-center gap-2">
                                        <TerminalSquare size={16} />
                                        Waiting for execution...
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
