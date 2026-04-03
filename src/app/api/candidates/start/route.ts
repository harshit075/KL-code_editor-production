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
            'title slug description difficulty constraints sampleInput sampleOutput starterCode hints tags'
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

        // Fetch any existing autosaved submissions
        const mongoose = require('mongoose');
        const Submission = mongoose.models.Submission || require('@/lib/models/Submission').default;
        const autosaves = await Submission.find({ candidateId: candidate._id, testId: test._id }).lean() as any[];

        // Map over problems to inject autosaved code into starterCode object
        const problemsWithAutosaves = test.problems.map((p: any) => {
            const probObj = p.toObject ? p.toObject() : p;
            const saved = autosaves.find((s) => s.problemId.toString() === p._id.toString());
            if (saved && saved.code && saved.language) {
                if (!probObj.starterCode) probObj.starterCode = {};
                probObj.starterCode[saved.language] = saved.code;
            }
            return probObj;
        });

        return NextResponse.json({
            test: {
                id: test._id,
                title: test.title,
                duration: test.duration,
                problems: problemsWithAutosaves,
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
