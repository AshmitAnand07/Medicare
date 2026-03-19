import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Ngo from '@/models/Ngo';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, pincode, address, phone, description, website } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        // Check if user exists in EITHER collection
        const existingUser = await User.findOne({ email });
        const existingNgo = await Ngo.findOne({ email });

        if (existingUser || existingNgo) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'ngo') {
            const newNgo = await Ngo.create({
                name,
                email,
                password: hashedPassword,
                role: 'ngo',
                pincode,
                address,
                phone,
                description,
                website,
                isVerified: false
            });
            return NextResponse.json({ message: 'NGO registered successfully', userId: newNgo._id }, { status: 201 });
        } else {
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'user', // Default to user
                pincode,
            });
            return NextResponse.json({ message: 'User registered successfully', userId: newUser._id }, { status: 201 });
        }

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
