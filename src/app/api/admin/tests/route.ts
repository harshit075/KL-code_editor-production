import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/mongodb';
import Test from '@/lib/models/Test';
import Problem from '@/lib/models/Problem';
import Candidate from '@/lib/models/Candidate';
import Submission from '@/lib/models/Submission';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tests = await Test.find({ createdBy: admin.adminId })
            .populate('problems', 'title difficulty')
            .sort({ createdAt: -1 });

        // Get candidate counts for each test
        const testsWithStats = await Promise.all(
            tests.map(async (test) => {
                const candidateCount = await Candidate.countDocuments({ testId: test._id });
                const completedCount = await Candidate.countDocuments({
                    testId: test._id,
                    status: { $in: ['completed', 'timed-out'] },
                });
                return {
                    ...test.toObject(),
                    candidateCount,
                    completedCount,
                };
            })
        );

        return NextResponse.json({ tests: testsWithStats });
    } catch (error: unknown) {
        console.error('Tests fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { title, duration, difficulties, problemCount, mode, problemIds } = await request.json();

        if (!title || !duration) {
            return NextResponse.json(
                { error: 'Title and duration are required' },
                { status: 400 }
            );
        }

        let problems: { _id: string }[] = [];

        if (mode === 'manual') {
            if (!Array.isArray(problemIds) || problemIds.length === 0) {
                return NextResponse.json(
                    { error: 'Manual mode requires at least one problem selection' },
                    { status: 400 }
                );
            }
            const foundProblems = await Problem.find({ _id: { $in: problemIds } }, '_id');
            if (foundProblems.length !== problemIds.length) {
                 return NextResponse.json({ error: 'Some selected problems were not found.' }, { status: 400 });
            }
            problems = foundProblems;
        } else {
            if (!difficulties || !problemCount) {
                return NextResponse.json(
                    { error: 'Auto generation requires difficulties and problemCount' },
                    { status: 400 }
                );
            }

            if (Array.isArray(difficulties) && difficulties.length > 0) {
                const perDifficulty = Math.ceil(problemCount / difficulties.length);

                for (const diff of difficulties) {
                    const diffProblems = await Problem.aggregate([
                        { $match: { difficulty: diff } },
                        { $sample: { size: perDifficulty } },
                        { $project: { _id: 1 } },
                    ]);
                    problems.push(...diffProblems);
                }

                problems = problems.slice(0, problemCount);
            }
        }

        if (problems.length === 0) {
            return NextResponse.json(
                { error: 'No problems found for the selected criteria' },
                { status: 404 }
            );
        }

        const slug = `test-${uuidv4().substring(0, 8)}`;

        const test = await Test.create({
            title,
            slug,
            problems: problems.map((p) => p._id),
            duration,
            createdBy: admin.adminId,
        });

        const testLink = `${process.env.NEXT_PUBLIC_BASE_URL}/test/${slug}`;

        return NextResponse.json({
            success: true,
            test: {
                id: test._id,
                title: test.title,
                slug: test.slug,
                link: testLink,
                problemCount: problems.length,
                duration,
            },
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Test creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
