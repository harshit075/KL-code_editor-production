'use client';

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
        <div className="flex flex-col h-full overflow-hidden">
            {/* Problem navigation */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-gray-700/50">
                <span className="text-sm text-gray-400">Problems:</span>
                <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: totalProblems }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => onNavigate(i)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === currentIndex
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Problem content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Title + difficulty */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-100">{problem.title}</h2>
                        <span className={difficultyClass}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                        {problem.description}
                    </div>
                </div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Constraints</h3>
                        <ul className="space-y-1">
                            {problem.constraints.map((c, i) => (
                                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{c}</code>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sample I/O */}
                <div className="grid gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Sample Input</h3>
                        <pre className="bg-gray-800/80 border border-gray-700/50 rounded-lg p-3 text-sm text-green-400 font-mono overflow-x-auto">
                            {problem.sampleInput}
                        </pre>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Sample Output</h3>
                        <pre className="bg-gray-800/80 border border-gray-700/50 rounded-lg p-3 text-sm text-green-400 font-mono overflow-x-auto">
                            {problem.sampleOutput}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
