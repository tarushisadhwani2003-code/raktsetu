import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { email as emailSchema, mobile, name as nameSchema, password as passwordSchema } from '../validators/common.js';

/*
 * Create (or promote) an admin account.
 *   npm run create-admin
 *   npm run create-admin -- --name "Asha Verma" --email asha@example.com --phone 9876543210 --password "Secret123"
 */

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    password: { type: 'string' },
  },
});

async function ask(rl, label, schema, preset) {
  let value = preset;
  for (;;) {
    if (value === undefined) value = await rl.question(`${label}: `);
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    console.log(`  ${result.error.issues[0].message}`);
    value = undefined;
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

try {
  const name = await ask(rl, 'Full name', nameSchema, values.name);
  const email = await ask(rl, 'Email', emailSchema, values.email);
  const phone = await ask(rl, 'Mobile number', mobile, values.phone);
  const password = await ask(rl, 'Password (min 8 characters, letters and numbers)', passwordSchema, values.password);

  await connectDB(env.mongoUri);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.setPassword(password);
    await existing.save({ validateModifiedOnly: true });
    console.log(`✔ ${email} is now an admin (password updated).`);
  } else {
    await User.create({
      name,
      email,
      phone,
      role: 'admin',
      city: 'Jaipur',
      passwordHash: await User.hashPassword(password),
    });
    console.log(`✔ Admin account created for ${email}.`);
  }
} catch (error) {
  console.error('✖ Could not create the admin:', error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await disconnectDB();
}
