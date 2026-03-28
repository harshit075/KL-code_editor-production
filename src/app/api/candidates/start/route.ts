import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Test from '@/lib/models/Test';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId } = await request.json();

        if (!candidateId) {
            return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        if (candidate.status === 'completed' || candidate.status === 'timed-out') {
            return NextResponse.json(
                { error: 'Test has already been submitted' },
                { status: 409 }
            );
        }

        const test = await Test.findById(candidate.testId).populate(
            'problems',
            'title slug description difficulty constraints sampleInput sampleOutput starterCode'
        );

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Start the test if not yet started
        if (candidate.status === 'registered') {
            candidate.status = 'in-progress';
            candidate.startedAt = new Date();
            await candidate.save();
        }

        // Calculate remaining time
        const startedAt = candidate.startedAt!;
        const elapsedMs = Date.now() - startedAt.getTime();
        const remainingMs = Math.max(0, test.duration * 60 * 1000 - elapsedMs);

        if (remainingMs <= 0) {
            candidate.status = 'timed-out';
            await candidate.save();
            return NextResponse.json(
                { error: 'Test time has expired' },
                { status: 410 }
            );
        }

        return NextResponse.json({
            test: {
                id: test._id,
                title: test.title,
                duration: test.duration,
                problems: test.problems,
            },
            candidate: {
                id: candidate._id,
                startedAt: candidate.startedAt,
                status: candidate.status,
            },
            remainingMs,
        });
    } catch (error: unknown) {
        console.error('Start test error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
