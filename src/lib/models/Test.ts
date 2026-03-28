import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
    title: string;
    slug: string;
    problems: mongoose.Types.ObjectId[];
    duration: number; // in minutes
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
}

const TestSchema = new Schema<ITest>({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    duration: { type: Number, required: true, min: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
