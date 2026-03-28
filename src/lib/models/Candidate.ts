import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    fullName: string;
    email: string;
    college: string;
    mobile: string;
    testId: mongoose.Types.ObjectId;
    startedAt: Date | null;
    submittedAt: Date | null;
    tabSwitchCount: number;
    score: number;
    totalScore: number;
    status: 'registered' | 'in-progress' | 'completed' | 'timed-out';
    createdAt: Date;
}

const CandidateSchema = new Schema<ICandidate>({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    college: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    tabSwitchCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['registered', 'in-progress', 'completed', 'timed-out'],
        default: 'registered',
    },
    createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate registrations
CandidateSchema.index({ email: 1, testId: 1 }, { unique: true });

export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
