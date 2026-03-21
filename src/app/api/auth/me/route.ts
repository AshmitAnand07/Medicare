import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Ngo from '@/models/Ngo';

export async function GET(req: NextRequest) {
    try {
        // Try Authorization header first (localStorage-based token for cross-origin)
        let token: string | undefined;
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        // Fall back to cookie
        if (!token) {
            token = req.cookies.get('token')?.value;
        }

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = await verifyJWT(token);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await connectToDatabase();

        // Check collection based on role in token
        let user;
        if ((payload as any).role === 'ngo') {
            user = await Ngo.findById(payload.id).select('-password');
        } else {
            user = await User.findById(payload.id).select('-password');
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                pincode: user.pincode
            }
        });

    } catch (error) {
        console.error('Session Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
