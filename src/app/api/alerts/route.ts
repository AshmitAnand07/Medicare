import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Alert from '@/models/Alert';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();

        const alerts = await Alert.find({ caretakerId: payload.id as string })
            .populate('patientId', 'name')
            .populate('medicineId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error('Fetch Alerts Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
