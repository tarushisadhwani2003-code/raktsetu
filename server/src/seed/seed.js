import { connectDB, disconnectDB, maskUri } from '../config/db.js';
import { env } from '../config/env.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './demoAccounts.js';
import { seedDemoData } from './demoData.js';

// Loading demo data deletes everything in the database first.
if (env.isProd && !process.argv.includes('--force')) {
  console.error('✖ Refusing to load demo data in production: it deletes all existing data.');
  console.error('  Run "npm run seed -- --force" if you are absolutely sure.');
  process.exit(1);
}

try {
  await connectDB(env.mongoUri);
  console.log(`Connected to ${maskUri(env.mongoUri)} — loading demo data…`);
  const summary = await seedDemoData();
  console.log(`✔ Demo data loaded: ${summary}\n`);
  console.log(`  Sign in with any of these accounts (password: ${DEMO_PASSWORD}):`);
  for (const account of DEMO_ACCOUNTS) console.log(`  • ${account.label.padEnd(17)} ${account.email}`);
  console.log('');
} catch (error) {
  console.error('✖ Could not load demo data:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
