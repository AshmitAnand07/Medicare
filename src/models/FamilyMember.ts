import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IFamilyMember extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    age: number;
    relation: string;
    caretakerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    relation: { type: String, required: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for faster lookups
FamilyMemberSchema.index({ userId: 1 });

const FamilyMember: Model<IFamilyMember> = mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);

export default FamilyMember;
