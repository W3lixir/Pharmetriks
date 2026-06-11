/**
 * import-users.ts
 *
 * Bulk-imports paying users into the NEW Supabase as APPROVED accounts, when
 * the old project's data is unavailable but you have a list of buyers.
 *
 * Reads:  supabase/users-to-import.csv   (columns: email, full_name, pharmacy_name)
 * Writes: supabase/imported-credentials.csv  (email, temp_password, result)
 *
 * For each row it creates an auth user with a generated temp password,
 * confirms the email (no confirmation email needed), and marks the profile
 * 'approved' with lifetime access (license_expires_at = null). Idempotent:
 * an email that already exists is left alone (password NOT reset) but its
 * profile is ensured 'approved'.
 *
 * Usage from portal/:   npm run import:users
 *
 * Requires in .env.local: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
 * SUPABASE_SERVICE_ROLE_KEY (the service-role secret).
 */
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// ─── load .env.local (no dotenv dep) ──────────────────────────────────────
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

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!URL || !KEY) {
  console.error('[import] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supa = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// ─── tiny CSV reader (handles "quoted, fields") ───────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some(x => x.trim() !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(r => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? '').trim()));
    return o;
  });
}

// Readable temp password, e.g. "Rx7k2m9q" — no ambiguous chars (0/O/1/l/I).
function tempPassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'Rx';
  for (let i = 0; i < 8; i++) s += chars[randomInt(chars.length)];
  return s;
}

async function existingEmails(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) if (u.email) map.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 1000) break;
  }
  return map;
}

async function main() {
  const csvPath = path.join(process.cwd(), 'supabase', 'users-to-import.csv');
  const rows = parseCsv(readFileSync(csvPath, 'utf8'));
  if (!rows.length) { console.error('[import] No rows in users-to-import.csv'); process.exit(1); }
  console.log(`[import] ${rows.length} rows from users-to-import.csv → ${URL}\n`);

  const dryRun = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
  if (dryRun) console.log('[import] DRY RUN — no accounts will be created.\n');

  const existing = await existingEmails();
  const out: string[] = ['email,temp_password,result'];
  let created = 0, skipped = 0, failed = 0;

  for (const r of rows) {
    const email = (r.email || '').toLowerCase();
    if (!email || !email.includes('@')) { console.log(`  ⚠ skip invalid email: "${r.email}"`); failed++; continue; }
    const full_name = r.full_name || '';
    const pharmacy_name = r.pharmacy_name || '';

    try {
      let userId = existing.get(email);
      let pw = '';

      if (dryRun) {
        const fields = [full_name && `name="${full_name}"`, pharmacy_name && `pharmacy="${pharmacy_name}"`].filter(Boolean).join(' ');
        console.log(`  ${userId ? '• would approve (exists)' : '✓ would create'}: ${email}  ${fields}`);
        if (userId) skipped++; else created++;
        out.push(`${email},${userId ? '' : '(would generate)'},${userId ? 'already_existed' : 'would_create'}`);
        continue;
      }

      if (userId) {
        console.log(`  • exists, ensuring approved: ${email}`);
        skipped++;
      } else {
        pw = tempPassword();
        const { data, error } = await supa.auth.admin.createUser({
          email,
          password: pw,
          email_confirm: true,
          user_metadata: { full_name, pharmacy_name },
        });
        if (error) throw error;
        userId = data.user!.id;
        existing.set(email, userId);
        console.log(`  ✓ created: ${email}`);
        created++;
      }

      // Ensure profile is approved (lifetime = null expiry). Upsert is safe.
      const { error: pErr } = await supa.from('profiles').upsert(
        {
          id: userId,
          email,
          full_name: full_name || null,
          pharmacy_name: pharmacy_name || null,
          status: 'approved',
          approved_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
      if (pErr) throw pErr;

      out.push(`${email},${pw},${pw ? 'created' : 'already_existed'}`);
    } catch (e: any) {
      console.log(`  ✗ FAILED ${email}: ${e?.message ?? e}`);
      out.push(`${email},,error: ${String(e?.message ?? e).replace(/,/g, ';')}`);
      failed++;
    }
  }

  const credPath = path.join(process.cwd(), 'supabase', 'imported-credentials.csv');
  writeFileSync(credPath, out.join('\n') + '\n', 'utf8');

  console.log(`\n[import] done.  created=${created}  already_existed=${skipped}  failed=${failed}`);
  console.log(`[import] credentials written to: supabase/imported-credentials.csv`);
  console.log('[import] ↑ send each user their email + temp_password; they change it after first login.');
}

main().catch(e => { console.error('[import] failed:', e); process.exit(1); });
