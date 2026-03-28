import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';
import Problem from '@/lib/models/Problem';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        Test.init();
        Problem.init();

        const candidates = await Candidate.find({})
            .populate('testId', 'title slug')
            .sort({ startedAt: -1 })
            .lean();

        const submissions = await Submission.find({})
            .populate('problemId', 'title')
            .lean();

        const candidatesWithDetails = candidates.map(candidate => {
            const candidateSubs = submissions.filter(sub => 
                sub.candidateId.toString() === candidate._id.toString()
            );

            return {
                ...candidate,
                testData: candidate.testId,
                submissions: candidateSubs.map(sub => ({
                    problemTitle: (sub.problemId as any)?.title || 'Unknown Problem',
                    code: sub.code,
                    language: sub.language,
                    score: sub.testCasesPassed,
                    totalCases: sub.totalTestCases
                }))
            };
        });

        return NextResponse.json({ success: true, candidates: candidatesWithDetails });
    } catch (error: any) {
        console.error('Fetch all candidates error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
