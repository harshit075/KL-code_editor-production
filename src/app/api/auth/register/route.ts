import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, password, name, secretKey } = await request.json();

        // Simple protection - require a secret key to register
        if (secretKey !== process.env.JWT_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid secret key' },
                { status: 403 }
            );
        }

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Name, email and password are required' },
                { status: 400 }
            );
        }

        const existing = await Admin.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { error: 'Admin with this email already exists' },
                { status: 409 }
            );
        }

        const admin = await Admin.create({ email, password, name });

        return NextResponse.json({
            success: true,
            admin: { id: admin._id, name: admin.name, email: admin.email },
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
