import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { env } from '../server/src/config/env.js';
import { ensureAdminAccount } from '../server/src/services/bootstrap.service.js';

let bootstrapPromise;

async function initialize() {
  await connectDB(env.mongoUri);
  // Cache successful bootstrap, but allow the next request to retry a failed attempt.
  bootstrapPromise ??= ensureAdminAccount().catch((error) => {
    bootstrapPromise = undefined;
    throw error;
  });
  await bootstrapPromise;
}

// Vercel owns the HTTP listener. Static assets are served separately from client/dist.
export default createApp({ initialize, serveClient: false });
