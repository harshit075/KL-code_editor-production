import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Problem from '@/lib/models/Problem';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get('difficulty');
        const limit = parseInt(searchParams.get('limit') || '50');

        const filter: Record<string, string> = {};
        if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
            filter.difficulty = difficulty;
        }

        const problems = await Problem.find(filter)
            .select('title slug difficulty tags')
            .limit(limit)
            .sort({ createdAt: -1 });

        return NextResponse.json({ problems });
    } catch (error: unknown) {
        console.error('Problems fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
