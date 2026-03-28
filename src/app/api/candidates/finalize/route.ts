import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';

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
            return NextResponse.json({ error: 'Test already finalized' }, { status: 409 });
        }

        candidate.status = 'completed';
        candidate.submittedAt = new Date();
        await candidate.save();

        return NextResponse.json({
            success: true,
            score: candidate.score,
            totalScore: candidate.totalScore,
        });
    } catch (error: unknown) {
        console.error('Finalize error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
