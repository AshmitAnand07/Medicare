import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Alert from '@/models/Alert';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token) as any;
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();

        // Fetch alerts where the current user is the caretaker
        const alerts = await Alert.find({ caretakerId: payload.id })
            .populate('patientId', 'name')
            .populate('medicineId', 'name')
            .populate('familyMemberId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error('Fetch Alerts Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
