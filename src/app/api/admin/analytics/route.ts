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

        // Fetch test IDs first (needed for subsequent queries)
        const testIdDocs = await Test.find({ createdBy: admin.adminId }, '_id').lean();
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

        const averageScore =
            candidates.length > 0
                ? Math.round(
                    candidates.reduce(
                        (sum, c) => sum + ((c as any).totalScore > 0 ? ((c as any).score / (c as any).totalScore) * 100 : 0),
                        0
                    ) / candidates.length
                )
                : 0;

        return NextResponse.json({
            analytics: {
                totalTests,
                totalCandidates,
                completedCandidates,
                completionRate:
                    totalCandidates > 0
                        ? Math.round((completedCandidates / totalCandidates) * 100)
                        : 0,
                averageScore,
                totalSubmissions,
            },
        });
    } catch (error: unknown) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

