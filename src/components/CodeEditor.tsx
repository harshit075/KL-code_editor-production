'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, ChevronDown } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string) => void;
    onLanguageChange: (lang: string) => void;
    onPaste?: () => void;
}

const LANGUAGE_OPTIONS = [
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'c', label: 'C', monacoLang: 'c' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
    { value: 'java', label: 'Java', monacoLang: 'java' },
];

export default function CodeEditor({ code, language, onChange, onLanguageChange, onPaste }: CodeEditorProps) {
    const monacoLang = LANGUAGE_OPTIONS.find(l => l.value === language)?.monacoLang || 'javascript';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full bg-white relative rounded-tl-2xl overflow-hidden shadow-sm"
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-10 transition-colors">
                <div className="flex items-center gap-3">
                    <motion.div 
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="bg-indigo-50 p-1.5 rounded-lg text-indigo-500"
                    >
                        <Code2 size={18} />
                    </motion.div>
                    <span className="text-sm font-semibold text-slate-700 tracking-wide">Code Editor</span>
                </div>
                
                <div className="relative group">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer transition-all hover:bg-slate-100"
                    >
                        {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0 bg-white">
                <MonacoEditor
                    height="100%"
                    language={monacoLang}
                    theme="light"
                    value={code}
                    onChange={(val) => onChange(val || '')}
                    onMount={(editor) => {
                        editor.onDidPaste(() => {
                            if (onPaste) onPaste();
                        });
                    }}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Inter', 'Roboto Mono', monospace",
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        bracketPairColorization: { enabled: true },
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        renderLineHighlight: 'all',
                        scrollbar: {
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        }
                    }}
                />
            </div>
        </motion.div>
    );
}
