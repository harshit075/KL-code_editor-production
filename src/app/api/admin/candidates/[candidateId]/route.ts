import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Problem from '@/lib/models/Problem';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import { authenticateAdmin } from '@/lib/auth';

Test.init();
Problem.init();

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { candidateId } = await params;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        // Delete all code submissions from this candidate to prevent orphaned database records
        await Submission.deleteMany({ candidateId: candidate._id });

        // Delete the candidate
        await Candidate.findByIdAndDelete(candidateId);

        return NextResponse.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error: unknown) {
        console.error('Delete candidate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
