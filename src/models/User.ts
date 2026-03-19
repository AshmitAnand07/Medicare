import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'ngo' | 'admin';
    pincode?: string;
    phone?: string;
    address?: string; // For NGOs mostly
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'ngo', 'admin'], default: 'user' },
    pincode: { type: String },
    phone: { type: String },
    address: { type: String },
}, { timestamps: true });

// Prevent overwrite on hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
