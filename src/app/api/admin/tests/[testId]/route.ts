import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ testId: string }> }
) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { testId } = await params;

        const test = await Test.findById(testId).populate(
            'problems',
            'title difficulty slug'
        );

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        const candidates = await Candidate.find({ testId: test._id }).sort({
            score: -1,
            submittedAt: 1,
        });

        const submissions = await Submission.find({ testId: test._id })
            .populate('problemId', 'title')
            .sort({ submittedAt: -1 });

        // Analytics
        const totalCandidates = candidates.length;
        const completedCandidates = candidates.filter(
            (c) => c.status === 'completed' || c.status === 'timed-out'
        ).length;
        const averageScore =
            completedCandidates > 0
                ? candidates
                    .filter((c) => c.status === 'completed' || c.status === 'timed-out')
                    .reduce((sum, c) => sum + (c.totalScore > 0 ? (c.score / c.totalScore) * 100 : 0), 0) /
                completedCandidates
                : 0;

        return NextResponse.json({
            test,
            candidates,
            submissions,
            analytics: {
                totalCandidates,
                completedCandidates,
                completionRate: totalCandidates > 0
                    ? Math.round((completedCandidates / totalCandidates) * 100)
                    : 0,
                averageScore: Math.round(averageScore),
            },
        });
    } catch (error: unknown) {
        console.error('Test detail error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
