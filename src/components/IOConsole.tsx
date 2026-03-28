'use client';

import { useState, useEffect } from 'react';

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
        <div className="flex flex-col h-full bg-gray-900/60">
            {/* Tabs */}
            <div className="flex border-b border-gray-700/50">
                {(['input', 'output'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab
                                ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5'
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                    >
                        {tab === 'input' ? '📥 Input' : '📤 Output'}
                    </button>
                ))}

                {isRunning && (
                    <div className="ml-auto flex items-center px-3">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-3">
                {activeTab === 'input' ? (
                    <textarea
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Enter your input here..."
                        className="w-full h-full bg-transparent text-sm text-gray-200 font-mono resize-none outline-none placeholder:text-gray-600"
                    />
                ) : (
                    <div className="h-full overflow-auto">
                        {stderr ? (
                            <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">{stderr}</pre>
                        ) : output ? (
                            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
                        ) : (
                            <p className="text-sm text-gray-600 italic">Run your code to see output here...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
