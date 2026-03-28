import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface IStarterCode {
    c: string;
    cpp: string;
    java: string;
    javascript: string;
    python: string;
}

export interface IProblem extends Document {
    title: string;
    slug: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    constraints: string[];
    sampleInput: string;
    sampleOutput: string;
    testCases: ITestCase[];
    starterCode: IStarterCode;
    tags: string[];
    createdAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
});

const ProblemSchema = new Schema<IProblem>({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard'],
    },
    constraints: [{ type: String }],
    sampleInput: { type: String, required: true },
    sampleOutput: { type: String, required: true },
    testCases: [TestCaseSchema],
    starterCode: {
        c: { type: String, default: '' },
        cpp: { type: String, default: '' },
        java: { type: String, default: '' },
        javascript: { type: String, default: '' },
        python: { type: String, default: '' },
    },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
