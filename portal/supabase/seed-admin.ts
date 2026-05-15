/**
 * seed-admin.ts
 *
 * Creates (or finds) the bootstrap admin user, then inserts them into the
 * `admins` allowlist. Idempotent — safe to re-run.
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill SUPABASE_URL +
 *      SUPABASE_SERVICE_ROLE_KEY.
 *   2. From portal/, run:  npm run seed:admin
 *
 * Reads:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   ← MUST be the service-role secret, never the anon key
 *   - ADMIN_EMAIL                 (required — set in .env.local)
 *   - ADMIN_PASSWORD              (defaults to a one-time printed password)
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// ─── load .env.local without adding a dotenv dep ──────────────────────────
loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

function loadEnv(file: string) {
  try {
    const txt = readFileSync(file, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch { /* file not present — that's fine */ }
}

// ─── config ───────────────────────────────────────────────────────────────
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `[seed-admin] Missing env var ${name}.\n` +
      `             Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,\n` +
      `             and ADMIN_EMAIL in portal/.env.local`,
    );
    process.exit(1);
  }
  return v;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY  = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const ADMIN_EMAIL  = requireEnv('ADMIN_EMAIL');
const ADMIN_PASS   =
  process.env.ADMIN_PASSWORD || randomBytes(12).toString('base64url');

if (!SUPABASE_URL) {
  console.error('[seed-admin] Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in portal/.env.local');
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('[seed-admin] target email:', ADMIN_EMAIL);

  // 1. Find or create the user in auth.users.
  let userId: string | null = null;

  const { data: existing, error: listErr } = await supa.auth.admin.listUsers();
  if (listErr) throw listErr;
  const found = existing.users.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (found) {
    userId = found.id;
    console.log('[seed-admin] user already exists:', userId);

    // If ADMIN_PASSWORD is set explicitly, reset to that. Skip when blank
    // so accidental re-runs don't clobber a password the admin already set.
    if (process.env.ADMIN_PASSWORD) {
      const { error: pwErr } = await supa.auth.admin.updateUserById(userId, {
        password: process.env.ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (pwErr) throw pwErr;
      console.log('[seed-admin] password reset to ADMIN_PASSWORD from .env.local');
    }
  } else {
    const { data: created, error: createErr } = await supa.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'Karlit', pharmacy_name: 'RXaudit HQ' },
    });
    if (createErr) throw createErr;
    userId = created.user!.id;
    console.log('[seed-admin] created user:', userId);
    console.log('[seed-admin] one-time password:', ADMIN_PASS);
    console.log('[seed-admin] ↑ change this immediately via the login flow');
  }

  // 2. Mark the profile as approved so admin can also use /app personally.
  const { error: upsertErr } = await supa
    .from('profiles')
    .upsert(
      {
        id: userId!,
        email: ADMIN_EMAIL,
        full_name: 'Karlit',
        pharmacy_name: 'RXaudit HQ',
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
      },
      { onConflict: 'id' }
    );
  if (upsertErr) throw upsertErr;
  console.log('[seed-admin] profile approved');

  // 3. Add to admins allowlist.
  const { error: adminErr } = await supa
    .from('admins')
    .upsert({ user_id: userId! }, { onConflict: 'user_id' });
  if (adminErr) throw adminErr;
  console.log('[seed-admin] admin allowlist updated');

  console.log('\n[seed-admin] done. Log in at /login with:', ADMIN_EMAIL);
}

main().catch(err => {
  console.error('[seed-admin] failed:', err);
  process.exit(1);
});
