import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import { authenticateAdmin } from '@/lib/auth';

/**
 * Combined dashboard endpoint — returns both tests list AND analytics in a
 * single request, so the client only needs one network round-trip.
 * This is the main fix for slow Vercel cold-start times.
 */
export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // ── Step 1: Fetch tests (one query) ───────────────────────────────
        const tests = await Test.find({ createdBy: admin.adminId })
            .populate('problems', 'title difficulty')
            .sort({ createdAt: -1 })
            .lean();  // .lean() returns plain JS objects — faster than Mongoose docs

        const testIds = tests.map(t => (t._id as any));

        // ── Step 2: Run all aggregations in parallel (single DB round-trip per query) ──
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

            // Completed candidates with scores (for avg score)
            Candidate.find({
                testId: { $in: testIds },
                status: { $in: ['completed', 'timed-out'] },
            })
                .select('score totalScore')
                .lean(),

            // Total submissions
            Submission.countDocuments({ testId: { $in: testIds } }),
        ]);

        // ── Step 3: Assemble tests with per-test stats ────────────────────
        const statsMap = candidateStats.reduce((acc, s) => {
            acc[s._id.toString()] = s;
            return acc;
        }, {} as Record<string, { candidateCount: number; completedCount: number }>);

        const testsWithStats = tests.map(test => {
            const stat = statsMap[(test._id as any).toString()] ?? { candidateCount: 0, completedCount: 0 };
            return { ...test, candidateCount: stat.candidateCount, completedCount: stat.completedCount };
        });

        // ── Step 4: Assemble analytics ────────────────────────────────────
        const totalCandidates = candidateStats.reduce((sum, s) => sum + s.candidateCount, 0);
        const averageScore =
            scoredCandidates.length > 0
                ? Math.round(
                      scoredCandidates.reduce(
                          (sum, c) => sum + ((c as any).totalScore > 0 ? ((c as any).score / (c as any).totalScore) * 100 : 0),
                          0
                      ) / scoredCandidates.length
                  )
                : 0;

        const analytics = {
            totalTests: tests.length,
            totalCandidates,
            completedCandidates,
            completionRate: totalCandidates > 0 ? Math.round((completedCandidates / totalCandidates) * 100) : 0,
            averageScore,
            totalSubmissions,
        };

        return NextResponse.json(
            { tests: testsWithStats, analytics },
            {
                headers: {
                    // Let browsers / Vercel Edge cache for 15 s, then revalidate in background
                    'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
                },
            }
        );
    } catch (error: unknown) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
