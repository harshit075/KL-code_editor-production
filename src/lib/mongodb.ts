import mongoose from 'mongoose';

// ── Pre-register all models so populate() never throws MissingSchemaError ──
// Next.js serverless routes each import only what they need, so a model
// referenced via populate() may not be in scope. Importing everything here
// ensures every schema is registered as soon as dbConnect() is first called.
import '@/lib/models/Problem';
import '@/lib/models/Test';
import '@/lib/models/Candidate';
import '@/lib/models/Submission';
import '@/lib/models/Admin';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache | undefined;
}

// Re-use connection across serverless invocations (same container/instance)
const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

async function dbConnect(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            // Don't buffer commands — fail fast if not connected
            bufferCommands: false,

            // ── Connection pool (key for Vercel cold-start perf) ──────────
            maxPoolSize: 10,
            minPoolSize: 1,

            // ── Timeouts ────────────────────────────────────────────────────
            serverSelectionTimeoutMS: 10_000,
            socketTimeoutMS: 45_000,
            connectTimeoutMS: 10_000,
            maxIdleTimeMS: 60_000,
        }).catch((err) => {
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
