import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        
        const members = await FamilyMember.find({ userId: decoded.id })
            .populate('caretakerId', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json(members);
    } catch (error: any) {
        console.error('Family Members Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, age, relation, caretakerId } = await req.json();

        if (!name || !age || !relation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const newMember = await FamilyMember.create({
            userId: decoded.id,
            name,
            age: Number(age),
            relation,
            caretakerId: caretakerId || null
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error: any) {
        console.error('Add Family Member Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
