import mongoose from 'mongoose';
import { seedDemoDataIfEmpty } from './seedData';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless invocations in production (e.g., Vercel).
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer: any | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, memoryServer: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  let uri = process.env.MONGODB_URI;

  const isPlaceholderUri =
    !uri ||
    uri.includes('cluster0.mongodb.net') ||
    uri.includes('secure_password') ||
    uri === 'memory';

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = (async () => {
      // If running with placeholder credentials locally, start in-memory database
      if (isPlaceholderUri) {
        console.log('[SC-QPMS] Launching zero-config in-memory database for local testing...');
        if (!cached!.memoryServer) {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          cached!.memoryServer = await MongoMemoryServer.create();
        }
        uri = cached!.memoryServer.getUri();
      }

      try {
        const instance = await mongoose.connect(uri!, opts);
        // Automatically bootstrap demo users and sample papers
        await seedDemoDataIfEmpty();
        return instance;
      } catch (err: any) {
        // If connecting to external Atlas failed in local development, fallback gracefully
        if (!isPlaceholderUri && process.env.NODE_ENV !== 'production') {
          console.warn('[SC-QPMS] External MongoDB connection failed. Falling back to local in-memory database...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          cached!.memoryServer = await MongoMemoryServer.create();
          const memoryUri = cached!.memoryServer.getUri();
          const instance = await mongoose.connect(memoryUri, opts);
          await seedDemoDataIfEmpty();
          return instance;
        }
        throw err;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e: any) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
