import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Candidate from '@/lib/models/Candidate';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { fullName, email, college, mobile, testSlug } = await request.json();

        if (!fullName || !email || !college || !mobile || !testSlug) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate mobile
        const mobileRegex = /^[0-9]{10,15}$/;
        if (!mobileRegex.test(mobile.replace(/[\s-+]/g, ''))) {
            return NextResponse.json(
                { error: 'Invalid mobile number' },
                { status: 400 }
            );
        }

        const test = await Test.findOne({ slug: testSlug, isActive: true });
        if (!test) {
            return NextResponse.json(
                { error: 'Test not found or inactive' },
                { status: 404 }
            );
        }

        // Check if candidate already registered
        const existing = await Candidate.findOne({
            email: email.toLowerCase(),
            testId: test._id,
        });

        if (existing) {
            if (existing.status === 'completed' || existing.status === 'timed-out') {
                return NextResponse.json(
                    { error: 'You have already completed this test' },
                    { status: 409 }
                );
            }
            // Return existing candidate if they're resuming
            return NextResponse.json({
                success: true,
                candidate: {
                    id: existing._id,
                    status: existing.status,
                },
                test: {
                    id: test._id,
                    title: test.title,
                    duration: test.duration,
                    problemCount: test.problems.length,
                },
            });
        }

        const candidate = await Candidate.create({
            fullName,
            email: email.toLowerCase(),
            college,
            mobile,
            testId: test._id,
        });

        return NextResponse.json({
            success: true,
            candidate: {
                id: candidate._id,
                status: candidate.status,
            },
            test: {
                id: test._id,
                title: test.title,
                duration: test.duration,
                problemCount: test.problems.length,
            },
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Candidate registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
