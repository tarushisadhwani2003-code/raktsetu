import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

// One pool per warm process; concurrent cold-start requests share the same connection attempt.
let connectionPromise;

/** Hide the password part of a connection string before logging it. */
export const maskUri = (uri) => uri.replace(/\/\/([^:/@]+):([^@]+)@/, '//$1:****@');

export async function connectDB(uri) {
  if (isDbConnected()) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 60000,
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }
  await connectionPromise;
  return mongoose.connection;
}

export async function disconnectDB() {
  if (connectionPromise) await connectionPromise.catch(() => {});
  await mongoose.disconnect();
}

export const isDbConnected = () => mongoose.connection.readyState === 1;
