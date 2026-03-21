import mongoose, { Schema, Model } from 'mongoose';

export interface IFamilyLink {
    _id?: string;
    patientId: mongoose.Types.ObjectId;
    caretakerId: mongoose.Types.ObjectId;
    relation: string;
    createdAt: Date;
}

const FamilyLinkSchema = new Schema<IFamilyLink>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relation: { type: String, required: true },
}, { timestamps: true });

// Prevent overwrite on hot reload
const FamilyLink: Model<IFamilyLink> = mongoose.models.FamilyLink || mongoose.model<IFamilyLink>('FamilyLink', FamilyLinkSchema);

export default FamilyLink;
