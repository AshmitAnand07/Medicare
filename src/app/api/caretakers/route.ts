import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
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
        
        // Fetch all users with role 'caretaker'
        // We only return id and name for the selection dropdown
        const caretakers = await User.find({ role: 'caretaker' })
            .select('name _id email phone')
            .sort({ name: 1 });

        return NextResponse.json(caretakers);
    } catch (error: any) {
        console.error('Caretakers Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
