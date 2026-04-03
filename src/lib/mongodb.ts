import mongoose from 'mongoose';

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
            // Keep a small pool alive between lambda invocations on warm containers
            maxPoolSize: 10,
            minPoolSize: 1,

            // ── Timeouts ────────────────────────────────────────────────────
            // How long the driver waits to find a suitable server (ms)
            serverSelectionTimeoutMS: 10_000,
            // How long a socket stays inactive before being closed
            socketTimeoutMS: 45_000,
            // Initial connection timeout
            connectTimeoutMS: 10_000,
            // Close idle connections faster than default (avoid Vercel hanging)
            maxIdleTimeMS: 60_000,
        }).catch((err) => {
            // Reset so the next call retries rather than awaiting a failed promise
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;

