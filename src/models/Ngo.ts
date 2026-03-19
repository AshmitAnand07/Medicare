import mongoose, { Schema, Model } from 'mongoose';

export interface INgo {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    role: 'ngo'; // Always 'ngo'
    pincode?: string;
    phone?: string;
    address?: string;
    description?: string;
    website?: string;
    verificationDocument?: string;
    images?: string[];
    isVerified: boolean;
    createdAt: Date;
}

const NgoSchema = new Schema<INgo>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'ngo' },
    pincode: { type: String },
    phone: { type: String },
    address: { type: String },
    description: { type: String },
    website: { type: String },
    verificationDocument: { type: String },
    images: { type: [String] },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent overwrite on hot reload
const Ngo: Model<INgo> = mongoose.models.Ngo || mongoose.model<INgo>('Ngo', NgoSchema);

export default Ngo;
