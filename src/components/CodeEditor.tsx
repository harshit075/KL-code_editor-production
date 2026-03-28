'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string) => void;
    onLanguageChange: (lang: string) => void;
}

const LANGUAGE_OPTIONS = [
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'c', label: 'C', monacoLang: 'c' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
    { value: 'java', label: 'Java', monacoLang: 'java' },
];

export default function CodeEditor({ code, language, onChange, onLanguageChange }: CodeEditorProps) {
    const monacoLang = LANGUAGE_OPTIONS.find(l => l.value === language)?.monacoLang || 'javascript';

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-300">Code Editor</span>
                </div>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-indigo-500 cursor-pointer"
                >
                    {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height="100%"
                    language={monacoLang}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => onChange(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        bracketPairColorization: { enabled: true },
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                    }}
                />
            </div>
        </div>
    );
}
