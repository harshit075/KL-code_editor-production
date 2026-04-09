import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import '@/lib/models/Problem'; // registers Problem schema so Test.populate('problems') works
import { authenticateAdmin } from '@/lib/auth';

/**
 * Combined dashboard endpoint — returns tests list AND analytics in one request.
 * Single-tenant: shows ALL tests regardless of which admin account created them.
 */
export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // ── Step 1: Fetch ALL tests (single-tenant — one admin system) ───────
        const tests = await Test.find({})
            .populate('problems', 'title difficulty')
            .sort({ createdAt: -1 })
            .lean();

        const testIds = tests.map(t => (t._id as unknown));

        // ── Step 2: Run all aggregations in parallel ──────────────────────────
        const [candidateStats, completedCandidates, scoredCandidates, totalSubmissions] = await Promise.all([
            // Count + completion breakdown per test (for the tests table)
            Candidate.aggregate([
                { $match: { testId: { $in: testIds } } },
                {
                    $group: {
                        _id: '$testId',
                        candidateCount: { $sum: 1 },
                        completedCount: {
                            $sum: {
                                $cond: [{ $in: ['$status', ['completed', 'timed-out']] }, 1, 0],
                            },
                        },
                    },
                },
            ]),

            // Total completed candidates (for analytics)
            Candidate.countDocuments({
                testId: { $in: testIds },
                status: { $in: ['completed', 'timed-out'] },
            }),

            // Completed candidates with scores (for avg + highest score)
            Candidate.find({
                testId: { $in: testIds },
                status: { $in: ['completed', 'timed-out'] },
            })
                .select('score totalScore')
                .lean(),

            // Total submissions
            Submission.countDocuments({ testId: { $in: testIds } }),
        ]);

        // ── Step 3: Assemble tests with per-test stats ────────────────────────
        const statsMap = candidateStats.reduce((acc, s) => {
            acc[s._id.toString()] = s;
            return acc;
        }, {} as Record<string, { candidateCount: number; completedCount: number }>);

        const testsWithStats = tests.map(test => {
            const stat = statsMap[(test._id as { toString: () => string }).toString()] ?? { candidateCount: 0, completedCount: 0 };
            return { ...test, candidateCount: stat.candidateCount, completedCount: stat.completedCount };
        });

        // ── Step 4: Assemble analytics ────────────────────────────────────────
        const totalCandidates = candidateStats.reduce((sum, s) => sum + s.candidateCount, 0);

        const scores = scoredCandidates.map(c => {
            const typedC = c as { score: number; totalScore: number };
            return typedC.totalScore > 0 ? Math.round((typedC.score / typedC.totalScore) * 100) : 0;
        });

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        const highestScore = scores.length > 0
            ? Math.max(...scores)
            : 0;

        const analytics = {
            totalTests: tests.length,
            totalCandidates,
            completedCandidates,
            completionRate: totalCandidates > 0 ? Math.round((completedCandidates / totalCandidates) * 100) : 0,
            averageScore,
            highestScore,
            totalSubmissions,
        };

        return NextResponse.json({ tests: testsWithStats, analytics });
    } catch (error: unknown) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
