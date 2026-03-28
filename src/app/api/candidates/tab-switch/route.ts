import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId } = await request.json();

        if (!candidateId) {
            return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
        }

        await Candidate.findByIdAndUpdate(candidateId, {
            $inc: { tabSwitchCount: 1 },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Tab switch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
