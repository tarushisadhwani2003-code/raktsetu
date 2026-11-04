import { connectDB, disconnectDB, maskUri } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { ensureAdminAccount, seedDemoDataIfEmpty } from './services/bootstrap.service.js';

function explainDatabaseError(error) {
  console.error(`\n✖ Could not connect to MongoDB at ${maskUri(env.mongoUri)}`);
  console.error(`  ${error.message}\n`);
  console.error('  How to fix it:');
  console.error(
    '  • Using MongoDB on this computer? Install "MongoDB Community Server" and make sure the MongoDB service is running.',
  );
  console.error(
    '  • Using MongoDB Atlas? Put your connection string in server/.env as MONGODB_URI=... and allow your IP address in Atlas → Network Access.\n',
  );
}

async function start() {
  try {
    await connectDB(env.mongoUri);
    console.log(`✔ Connected to MongoDB (${maskUri(env.mongoUri)})`);
  } catch (error) {
    explainDatabaseError(error);
    process.exit(1);
  }

  await seedDemoDataIfEmpty();
  await ensureAdminAccount();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`✔ RaktSetu server running on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
