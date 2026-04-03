'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Problem {
    _id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    constraints: string[];
    sampleInput: string;
    sampleOutput: string;
}

interface ProblemPanelProps {
    problem: Problem;
    currentIndex: number;
    totalProblems: number;
    onNavigate: (index: number) => void;
}

export default function ProblemPanel({ problem, currentIndex, totalProblems, onNavigate }: ProblemPanelProps) {
    const difficultyClass = {
        easy: 'badge-easy',
        medium: 'badge-medium',
        hard: 'badge-hard',
    }[problem.difficulty];

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
                        <div className="prose prose-slate max-w-none">
                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium">
                                {problem.description}
                            </div>
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

                        {/* Sample I/O */}
                        <div className="grid gap-4 mt-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="group"
                            >
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></span>
                                    Sample Input
                                </h3>
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
                                    Sample Output
                                </h3>
                                <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-emerald-400 font-mono overflow-x-auto shadow-inner leading-relaxed">
                                    {problem.sampleOutput}
                                </pre>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
