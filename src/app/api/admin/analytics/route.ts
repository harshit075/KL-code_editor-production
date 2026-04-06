import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Single-tenant: fetch ALL test IDs (no createdBy filter)
        const testIdDocs = await Test.find({}, '_id').lean();
        const testIdList = testIdDocs.map(t => (t as any)._id);
        const totalTests = testIdList.length;

        // Run all remaining queries in parallel — single round-trip
        const [totalCandidates, completedCandidates, candidates, totalSubmissions] = await Promise.all([
            Candidate.countDocuments({ testId: { $in: testIdList } }),
            Candidate.countDocuments({
                testId: { $in: testIdList },
                status: { $in: ['completed', 'timed-out'] },
            }),
            Candidate.find({
                testId: { $in: testIdList },
                status: { $in: ['completed', 'timed-out'] },
            })
                .select('score totalScore')
                .lean(),
            Submission.countDocuments({ testId: { $in: testIdList } }),
        ]);

        const scores = candidates.map(c =>
            (c as any).totalScore > 0 ? Math.round(((c as any).score / (c as any).totalScore) * 100) : 0
        );

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

        return NextResponse.json({
            analytics: {
                totalTests,
                totalCandidates,
                completedCandidates,
                completionRate: totalCandidates > 0
                    ? Math.round((completedCandidates / totalCandidates) * 100)
                    : 0,
                averageScore,
                highestScore,
                totalSubmissions,
            },
        });
    } catch (error: unknown) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
