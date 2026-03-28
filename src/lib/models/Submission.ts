import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    candidateId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    testId: mongoose.Types.ObjectId;
    code: string;
    language: 'c' | 'cpp' | 'java' | 'javascript';
    testCasesPassed: number;
    totalTestCases: number;
    output: string;
    timeTaken: number; // seconds spent on this problem
    submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    code: { type: String, required: true },
    language: {
        type: String,
        required: true,
        enum: ['c', 'cpp', 'java', 'javascript'],
    },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    output: { type: String, default: '' },
    timeTaken: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
});

SubmissionSchema.index({ candidateId: 1, problemId: 1, testId: 1 });

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
