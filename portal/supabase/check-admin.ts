/**
 * check-admin.ts — temporary diagnostic. Verifies the admin account is set up:
 * exists in auth.users, email confirmed, profile approved, in admins allowlist.
 * Run from portal/:  npx tsx supabase/check-admin.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

for (const f of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(path.join(process.cwd(), f), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch { /* ignore */ }
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
const supa = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('[check] Supabase:', url);
  console.log('[check] admin email:', email);

  const { data: list, error } = await supa.auth.admin.listUsers();
  if (error) throw error;
  const u = list.users.find(x => x.email?.toLowerCase() === email);
  if (!u) { console.log('❌ NO auth user with that email — account does not exist.'); return; }
  console.log('✅ auth user exists:', u.id);
  console.log('   email_confirmed_at:', u.email_confirmed_at ?? '❌ NOT CONFIRMED');

  const { data: profile } = await supa.from('profiles').select('status').eq('id', u.id).maybeSingle();
  console.log('   profile.status:', profile?.status ?? '❌ no profile row');

  const { data: adminRow } = await supa.from('admins').select('user_id').eq('user_id', u.id).maybeSingle();
  console.log('   in admins allowlist:', adminRow ? '✅ yes' : '❌ NO');

  console.log('\nTotal users in this Supabase:', list.users.length);
}
main().catch(e => { console.error('[check] failed:', e); process.exit(1); });
