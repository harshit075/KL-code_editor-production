import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId, reason } = await request.json();

        if (!candidateId) {
            return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
        }

        if (reason === 'paste') {
            await Candidate.findByIdAndUpdate(candidateId, {
                $set: { copyPasteDetected: true },
            });
        } else if (reason === 'tab-switch' || !reason) {
            await Candidate.findByIdAndUpdate(candidateId, {
                $inc: { tabSwitchCount: 1 },
            });
        }
        // If reason is 'no-face' or 'multiple-faces', we do nothing server-side currently except returning success.
        
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Tab switch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
