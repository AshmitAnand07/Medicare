import mongoose, { Schema, Model } from 'mongoose';

export interface IMedicine {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    name: string;
    expiryDate: Date;
    manufacturingDate?: Date;
    mrp?: number;
    category?: string;
    status: 'safe' | 'expiring' | 'expired';
    familyMember?: string; // e.g. "Father", "Self"
    
    // Smart Reminder Scheduling Fields
    dosage?: string;
    time?: string;      // e.g. "Morning", "Afternoon", "Night"
    frequency?: string; // e.g. "Once daily", "Twice daily"
    lastTakenDate?: Date;
    prescriptionImage?: string; // URL of uploaded prescription

    quantityStrips?: number;
    quantityTablets?: number;
    donatedStrips?: number;
    donatedTablets?: number;
    isDonated: boolean;
    createdAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    manufacturingDate: { type: Date },
    mrp: { type: Number },
    category: { type: String },
    status: { type: String, enum: ['safe', 'expiring', 'expired'], default: 'safe' },
    familyMember: { type: String, default: 'Self' },
    
    // Smart Reminder Scheduling Fields
    dosage: { type: String },
    time: { type: String },
    frequency: { type: String },
    lastTakenDate: { type: Date },
    prescriptionImage: { type: String },

    quantityStrips: { type: Number, default: 0 },
    quantityTablets: { type: Number, default: 0 },
    donatedStrips: { type: Number, default: 0 },
    donatedTablets: { type: Number, default: 0 },
    isDonated: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent overwrite on hot reload
const Medicine: Model<IMedicine> = mongoose.models.Medicine || mongoose.model<IMedicine>('Medicine', MedicineSchema);

export default Medicine;
