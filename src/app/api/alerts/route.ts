import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Alert from '@/models/Alert';
import { getVerifiedToken } from '@/lib/getVerifiedToken';

export async function GET(req: NextRequest) {
    try {
        const payload = await getVerifiedToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const alerts = await Alert.find({ 
            $or: [
                { caretakerId: payload.id },
                { patientId: payload.id }
            ]
        })
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
