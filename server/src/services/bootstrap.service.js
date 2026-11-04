import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { seedDemoData } from '../seed/demoData.js';

/**
 * Create the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if that account does not exist yet.
 * Useful on hosts without shell access (e.g. Render's free plan).
 */
export async function ensureAdminAccount() {
  const { email, password, name } = env.admin;
  if (!email || !password) return;

  // Ensure the unique email index exists before concurrent cold starts can insert.
  await User.init();
  if (await User.exists({ email })) return;
  if (password.length < 8) {
    console.warn('⚠  ADMIN_PASSWORD must be at least 8 characters. The admin account was not created.');
    return;
  }

  const account = {
    name,
    email,
    // A placeholder mobile number; the admin can change it on the profile page.
    phone: env.admin.phone || `9${crypto.randomInt(100_000_000, 999_999_999)}`,
    role: 'admin',
    city: 'Jaipur',
    passwordHash: await User.hashPassword(password),
  };

  try {
    // Only insert: a later cold start must never reset or promote an existing user.
    const result = await User.updateOne({ email }, { $setOnInsert: account }, { upsert: true, runValidators: true });
    if (result.upsertedCount) console.log(`✔ Admin account created for ${email}`);
  } catch (error) {
    // A different instance may have inserted this email after our initial lookup.
    if (error.code === 11000 && (await User.exists({ email }))) return;
    throw error;
  }
}

/** Load sample data on start-up when SEED_DEMO_DATA=true and the database has no users. */
export async function seedDemoDataIfEmpty() {
  if (!env.seedDemoData) return;
  if ((await User.countDocuments()) > 0) return;
  // On a live site the demo admin (whose password is public) is never created:
  // use ADMIN_EMAIL / ADMIN_PASSWORD for the real admin instead.
  const summary = await seedDemoData({ includeAdmin: !env.isProd });
  console.log(`✔ Demo data loaded (${summary})`);
}
