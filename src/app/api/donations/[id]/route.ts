import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import { verifyJWT } from '@/lib/auth';

import { z } from 'zod';

const statusSchema = z.object({
    status: z.enum(['accepted', 'rejected', 'collected'])
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (payload?.role !== 'ngo') {
            return NextResponse.json({ error: 'Only NGOs can accept donations' }, { status: 403 });
        }

        const body = await req.json();
        const parseResult = statusSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { status } = parseResult.data;

        await connectToDatabase();

        const { id } = await params;

        const donation = await Donation.findById(id);
        if (!donation) {
            return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
        }

        donation.status = status;
        donation.ngoId = payload.id as any;
        if (status === 'collected') {
            donation.completedAt = new Date();
        }

        await donation.save();

        return NextResponse.json(donation);
    } catch (error) {
        console.error('Donation PATCH Error:', (error as Error).message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
