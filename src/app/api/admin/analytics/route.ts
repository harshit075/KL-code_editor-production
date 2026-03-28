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

        const totalTests = await Test.countDocuments({ createdBy: admin.adminId });
        const testIds = await Test.find({ createdBy: admin.adminId }).select('_id');
        const testIdList = testIds.map((t) => t._id);

        const totalCandidates = await Candidate.countDocuments({
            testId: { $in: testIdList },
        });
        const completedCandidates = await Candidate.countDocuments({
            testId: { $in: testIdList },
            status: { $in: ['completed', 'timed-out'] },
        });

        const candidates = await Candidate.find({
            testId: { $in: testIdList },
            status: { $in: ['completed', 'timed-out'] },
        }).select('score totalScore');

        const averageScore =
            candidates.length > 0
                ? Math.round(
                    candidates.reduce(
                        (sum, c) => sum + (c.totalScore > 0 ? (c.score / c.totalScore) * 100 : 0),
                        0
                    ) / candidates.length
                )
                : 0;

        const totalSubmissions = await Submission.countDocuments({
            testId: { $in: testIdList },
        });

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
