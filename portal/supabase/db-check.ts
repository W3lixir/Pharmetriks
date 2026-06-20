/**
 * db-check.ts — dev utility to inspect what's actually in Supabase for one user.
 *
 * Shows the user's profile status + active add-on features, and every synced
 * `user_data` collection (version + item/tombstone counts). Use it to verify
 * that actions taken in the app actually reached the database (cloud sync).
 *
 * Usage (from portal/):  npx tsx supabase/db-check.ts [email]
 *   - defaults to ADMIN_EMAIL from .env.local when no email arg is given.
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FEATURES, featureActive, type FeatureMap } from '../lib/features';

loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));
function loadEnv(file: string) {
  try {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch { /* no file — fine */ }
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] || process.env.ADMIN_EMAIL;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }
if (!email) { console.error('No email — pass one as an arg or set ADMIN_EMAIL.'); process.exit(1); }

const svc = createClient(url, key, { auth: { persistSession: false } });

const n = (x: unknown) => (Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.keys(x).length : 0);

(async () => {
  const { data: prof, error: pe } = await svc
    .from('profiles')
    .select('id, email, status, features, requested_features')
    .eq('email', email)
    .maybeSingle();
  if (pe) { console.error('profiles query failed:', pe.message); process.exit(1); }
  if (!prof) { console.error(`No profile for ${email}`); process.exit(1); }

  const feats = (prof.features ?? {}) as FeatureMap;
  const active = FEATURES.filter(f => featureActive(feats[f.key])).map(f => f.key);
  console.log(`\n── PROFILE ──────────────────────────────`);
  console.log(`email   : ${prof.email}`);
  console.log(`status  : ${prof.status}`);
  console.log(`active add-ons (${active.length}/${FEATURES.length}): ${active.join(', ') || '(none)'}`);

  const { data: rows, error: ue } = await svc
    .from('user_data')
    .select('collection, version, items, tombstones, updated_at')
    .eq('user_id', prof.id);
  if (ue) { console.error('user_data query failed:', ue.message); process.exit(1); }

  console.log(`\n── SYNCED DATA (user_data) ──────────────`);
  if (!rows || !rows.length) {
    console.log('(no rows yet — nothing has synced for this user)');
  } else {
    for (const r of rows.sort((a, b) => a.collection.localeCompare(b.collection))) {
      console.log(`${r.collection.padEnd(10)} v${String(r.version).padEnd(4)} items=${String(n(r.items)).padEnd(4)} tombstones=${n(r.tombstones)}  (${r.updated_at})`);
    }
  }
  console.log('');
  process.exit(0);
})();
