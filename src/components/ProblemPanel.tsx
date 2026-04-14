'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Problem {
    _id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    constraints: string[];
    sampleInput: string;
    sampleOutput: string;
    type?: 'dsa' | 'sql';
    databaseSchema?: string;
}

interface ProblemPanelProps {
    problem: Problem;
    currentIndex: number;
    totalProblems: number;
    onNavigate: (index: number) => void;
    onLoadSample?: () => void;
    onRunSample?: () => void;
}

export default function ProblemPanel({ problem, currentIndex, totalProblems, onNavigate, onLoadSample, onRunSample }: ProblemPanelProps) {
    const difficultyClass = {
        easy: 'badge-easy',
        medium: 'badge-medium',
        hard: 'badge-hard',
    }[problem.difficulty];

    const sqlData = (() => {
        if (problem.type === 'sql') {
            try {
                const data = JSON.parse(problem.sampleOutput);
                if (Array.isArray(data) && data.length > 0) return data;
            } catch {}
        }
        return null;
    })();

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white/50 relative">
            {/* Problem navigation */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-10 sticky top-0 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Problems</span>
                <div className="flex gap-1.5 flex-wrap flex-1">
                    {Array.from({ length: totalProblems }, (_, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(i)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors relative flex items-center justify-center
                                ${i === currentIndex
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                                }`}
                        >
                            {i + 1}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Problem content */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={problem._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="p-6 space-y-6"
                    >
                        {/* Title + difficulty */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{problem.title}</h2>
                                <span className={`${difficultyClass} shadow-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent"></div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-slate prose-indigo max-w-none 
                            prose-headings:font-bold prose-headings:text-slate-900 
                            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-p:font-medium
                            prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-slate-200
                            prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:px-4 prose-th:py-2 prose-th:text-slate-800
                            prose-td:border prose-td:border-slate-200 prose-td:px-4 prose-td:py-2 prose-td:text-slate-600
                            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {problem.description}
                            </ReactMarkdown>
                        </div>

                        {/* Constraints */}
                        {problem.constraints && problem.constraints.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-amber-50/50 border border-amber-100 rounded-xl p-4"
                            >
                                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 min-w-1.5 min-h-1.5"></span>
                                    Constraints
                                </h3>
                                <ul className="space-y-2">
                                    {problem.constraints.map((c, i) => (
                                        <li key={i} className="text-sm text-slate-700 font-mono">
                                            <code className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{c}</code>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* SQL Schema */}
                        {problem.type === 'sql' && problem.databaseSchema && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                            >
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    Database Schema
                                </h3>
                                <pre className="text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-lg font-mono overflow-x-auto">
                                    {problem.databaseSchema}
                                </pre>
                            </motion.div>
                        )}

                        {/* Sample I/O */}
                        <div className="grid gap-4 mt-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></span>
                                        Sample Input
                                    </h3>
                                    {(onLoadSample || onRunSample) && (
                                        <div className="flex items-center gap-1.5">
                                            {onLoadSample && (
                                                <button
                                                    onClick={onLoadSample}
                                                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md transition-all"
                                                >
                                                    ↺ Load
                                                </button>
                                            )}
                                            {onRunSample && (
                                                <button
                                                    onClick={onRunSample}
                                                    className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-all flex items-center gap-1"
                                                >
                                                    ▶ Try Sample
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-emerald-400 font-mono overflow-x-auto shadow-inner leading-relaxed">
                                    {problem.sampleInput}
                                </pre>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="group"
                            >
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></span>
                                    Expected Output
                                </h3>
                                {sqlData ? (
                                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300 border-collapse">
                                            <thead className="bg-slate-800/80 text-xs uppercase border-b border-slate-700">
                                                <tr>
                                                    {Object.keys(sqlData[0]).map(k => <th key={k} className="px-4 py-2 font-semibold">{k}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="font-mono">
                                                {sqlData.map((row, i) => (
                                                    <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/50">
                                                        {Object.keys(sqlData[0]).map(k => (
                                                            <td key={k} className="px-4 py-2 whitespace-nowrap">
                                                                {row[k] !== null ? String(row[k]) : 'null'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-emerald-400 font-mono overflow-x-auto shadow-inner leading-relaxed">
                                        {problem.sampleOutput}
                                    </pre>
                                )}
                            </motion.div>

                            {/* How it works hint */}
                            {onRunSample && (
                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-700">
                                    <span className="shrink-0 mt-0.5">💡</span>
                                    <span>
                                        Click <strong>▶ Try Sample</strong> to auto-load this input and run your code.{' '}
                                        <strong>Run &amp; Test</strong> runs your code with custom input <em>and</em> checks all hidden test cases at once.
                                        Use <strong>Submit &amp; Test</strong> to save your final solution.
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
