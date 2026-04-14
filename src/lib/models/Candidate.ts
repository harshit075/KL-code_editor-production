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
    noFaceDetectCount: number;
    copyPasteDetected: boolean;
    score: number;
    totalScore: number;
    status: 'registered' | 'in-progress' | 'completed' | 'timed-out';
    violationScreenshots: {
        reason: string;
        cameraImage?: string;
        screenImage?: string;
        timestamp: Date;
    }[];
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
    noFaceDetectCount: { type: Number, default: 0 },
    copyPasteDetected: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['registered', 'in-progress', 'completed', 'timed-out'],
        default: 'registered',
    },
    violationScreenshots: [{
        reason: String,
        cameraImage: String,
        screenImage: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate registrations
CandidateSchema.index({ email: 1, testId: 1 }, { unique: true });

// Performance indexes for admin dashboard aggregations
CandidateSchema.index({ testId: 1 });
CandidateSchema.index({ testId: 1, status: 1 });

export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
