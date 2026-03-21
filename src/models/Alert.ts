import mongoose, { Schema, Model } from 'mongoose';

export interface IAlert {
    _id?: string;
    patientId: mongoose.Types.ObjectId;
    caretakerId: mongoose.Types.ObjectId;
    medicineId: mongoose.Types.ObjectId;
    familyMemberId?: mongoose.Types.ObjectId; // Which family member this alert belongs to
    message: string;
    type: 'info' | 'critical';
    read: boolean;
    createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    familyMemberId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'critical'], default: 'info' },
    read: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent overwrite on hot reload
const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);

export default Alert;
