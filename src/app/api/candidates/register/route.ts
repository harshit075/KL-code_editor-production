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

        // Trim inputs
        const name = fullName.trim();
        const emailAddr = email.trim();
        const org = college.trim();
        const mob = mobile.trim();

        // Validate full name — no special characters
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!name) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }
        if (!nameRegex.test(name)) {
            return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
        }

        // Validate email format — TLD must be at least 2 characters
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(emailAddr)) {
            return NextResponse.json(
                { error: 'Enter valid email format' },
                { status: 400 }
            );
        }

        // Validate college — must not be whitespace-only, and only alphabets/spaces
        if (!org) {
            return NextResponse.json(
                { error: 'College/Organization is required' },
                { status: 400 }
            );
        }
        const collegeRegex = /^[a-zA-Z\s]+$/;
        if (!collegeRegex.test(org)) {
            return NextResponse.json(
                { error: 'Invalid college format. Only letters and spaces are allowed.' },
                { status: 400 }
            );
        }

        // Validate mobile — digits only, exactly 10 digits
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mob)) {
            return NextResponse.json(
                { error: 'Enter valid mobile number (exactly 10 digits)' },
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
            fullName: name,
            email: emailAddr.toLowerCase(),
            college: org,
            mobile: mob,
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
