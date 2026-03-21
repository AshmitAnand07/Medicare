import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FamilyLink from '@/models/FamilyLink';
import Alert from '@/models/Alert';
import Medicine from '@/models/Medicine';
import { verifyJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { medicineId, message } = body;

        if (!medicineId) {
            return NextResponse.json({ error: 'medicineId is required' }, { status: 400 });
        }

        await connectToDatabase();

        const medicine = await Medicine.findOne({ _id: String(medicineId), userId: String(payload.id) });
        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }

        // Find linked caretakers
        const links = await FamilyLink.find({ patientId: String(payload.id) });
        if (!links || links.length === 0) {
            return NextResponse.json({ message: 'No caretaker linked to alert. Setup a family link first.' }, { status: 200 });
        }

        const alertsCreated: any[] = [];

        for (const link of links) {
            const newAlert = await Alert.create({
                patientId: String(payload.id),
                caretakerId: link.caretakerId,
                medicineId,
                message: message || `Alert: The patient has not taken their medicine (${medicine.name}).`,
            });
            alertsCreated.push(newAlert);
        }

        // Simulating Push/SMS notification here via Console
        console.log(`[ALERT NOTIFICATION] SMS sent to caretakers covering patient ${payload.id} for medicine ${medicine.name}`);

        return NextResponse.json({
            message: 'Caretakers alerted successfully',
            alerts: alertsCreated
        }, { status: 200 });

    } catch (error) {
        console.error('Caretaker Alert Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
