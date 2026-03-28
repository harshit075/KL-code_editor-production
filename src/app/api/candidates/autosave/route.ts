import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/lib/models/Submission';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId, problemId, testId, code, language } = await request.json();

        if (!candidateId || !problemId || !testId || !code || !language) {
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        }

        // Autosave - upsert without running test cases
        await Submission.findOneAndUpdate(
            { candidateId, problemId, testId },
            {
                code,
                language,
                submittedAt: new Date(),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Autosave error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
