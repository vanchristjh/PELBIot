import { query } from './database.js';
import { hashPassword } from './authUtils.js';

const DEFAULT_USERS = [
  {
    username: 'superadmin',
    email: 'superadmin@pelbiot.com',
    password: 'SuperAdmin123@',
    role: 'super_admin',
    first_name: 'Super',
    last_name: 'Admin',
  },
  {
    username: 'admin',
    email: 'admin@pelbiot.com',
    password: 'Admin123@',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
  },
  {
    username: 'operator',
    email: 'operator@pelbiot.com',
    password: 'Operator123@',
    role: 'operator',
    first_name: 'Operator',
    last_name: 'User',
  },
  {
    username: 'user',
    email: 'user@pelbiot.com',
    password: 'User12345@',
    role: 'user',
    first_name: 'Regular',
    last_name: 'User',
  },
];

export const seedUsers = async (users = DEFAULT_USERS) => {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const u of users) {
    const passwordEnvKey = `SEED_PASSWORD_${u.username.toUpperCase()}`;
    const password = process.env[passwordEnvKey] || u.password;
    const existing = await query('SELECT id, role FROM users WHERE username = ? OR email = ?', [u.username, u.email]);

    if (existing.length > 0) {
      const hashed = await hashPassword(password);
      await query('UPDATE users SET password = ?, role = ?, email = ?, first_name = ?, last_name = ?, is_active = TRUE, updated_at = NOW() WHERE id = ?', [
        hashed,
        u.role,
        u.email,
        u.first_name,
        u.last_name,
        existing[0].id,
      ]);
      updated++;
      console.log(`  Updated: ${u.username} (${u.role})`);
    } else {
      const hashed = await hashPassword(password);
      await query(
        'INSERT INTO users (username, email, password, role, first_name, last_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())',
        [u.username, u.email, hashed, u.role, u.first_name, u.last_name]
      );
      inserted++;
      console.log(`  Inserted: ${u.username} (${u.role})`);
    }
  }

  return { inserted, updated, skipped };
};

const run = async () => {
  try {
    console.log('Seeding users...');
    const result = await seedUsers();
    console.log(`Done. Inserted: ${result.inserted}, Updated: ${result.updated}`);
    const rows = await query(
      "SELECT username, email, role, is_active FROM users WHERE username IN ('superadmin','admin','operator','user') ORDER BY id"
    );
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Seeding users failed:', error.message);
    if (error.code) console.error('  Code:', error.code);
    process.exit(1);
  }
};

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  run();
}
