'use server';

import { randomUUID } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/server';
import { sendAdminNotify, escapeHtml } from '@/lib/email';

export type SignupResult = { ok: false; error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
};

// Public signup is a REQUEST, not an account. We collect the details + the GCash
// receipt, store them in signup_requests, and notify the admin. The admin then
// creates the real auth account from /admin/requests (so the admin owns the
// credentials). Nothing here touches auth.users.
export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email        = String(formData.get('email')         ?? '').trim().toLowerCase();
  const password     = String(formData.get('password')      ?? '');
  const fullName     = String(formData.get('full_name')     ?? '').trim();
  const pharmacyName = String(formData.get('pharmacy_name') ?? '').trim();
  const reference    = String(formData.get('payment_reference') ?? '').trim().slice(0, 80);
  const file         = formData.get('receipt');

  if (!fullName)             return { ok: false, error: 'Pakilagay ang buong pangalan.' };
  if (!pharmacyName)         return { ok: false, error: 'Pakilagay ang pangalan ng botika.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Pakilagay ang wastong email address.' };
  if (password.length < 8)   return { ok: false, error: 'Ang password ay 8 character pataas.' };
  if (!(file instanceof File) || !file.size) {
    return { ok: false, error: 'Pakilagay ang screenshot ng resibo / GCash payment.' };
  }
  if (!EXT[file.type])       return { ok: false, error: 'Image file lang ang resibo (PNG, JPG, WebP, o HEIC).' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'Sobrang laki ng file — max 5 MB.' };

  const svc = getServiceClient();

  // Upload the receipt (service role → bypasses the per-user storage RLS).
  const receiptPath = `signup-requests/${randomUUID()}.${EXT[file.type]}`;
  const { error: upErr } = await svc.storage.from('receipts').upload(receiptPath, file, {
    contentType: file.type, upsert: false, cacheControl: '0',
  });
  if (upErr) return { ok: false, error: `Hindi ma-upload ang resibo: ${upErr.message}` };

  const row = {
    full_name: fullName,
    pharmacy_name: pharmacyName,
    email,
    password,                 // suggested by the user; cleared once the admin creates the account
    receipt_path: receiptPath,
    payment_reference: reference || null,
    status: 'pending' as const,
  };

  // Collapse repeat submissions: replace any still-pending request for this email.
  const { data: existing } = await svc
    .from('signup_requests')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  const { error: dbErr } = existing
    ? await svc.from('signup_requests').update(row).eq('id', existing.id)
    : await svc.from('signup_requests').insert(row);
  if (dbErr) return { ok: false, error: `Hindi ma-save ang request: ${dbErr.message}` };

  // Notify the admin (best-effort — never blocks the request).
  await sendAdminNotify(
    `🆕 Bagong Pharmetriks signup request: ${pharmacyName}`,
    `<div style="font-family:system-ui,sans-serif;color:#1e0a47;line-height:1.6">
       <h2 style="margin:0 0 8px">Bagong signup request 🎉</h2>
       <p style="margin:0">
         <b>Botika:</b> ${escapeHtml(pharmacyName)}<br>
         <b>Pangalan:</b> ${escapeHtml(fullName)}<br>
         <b>Email:</b> ${escapeHtml(email)}<br>
         <b>Password (mungkahi ng user):</b> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px">${escapeHtml(password)}</code><br>
         <b>Petsa:</b> ${escapeHtml(new Date().toLocaleString('en-PH'))}
       </p>
       <p style="margin:12px 0 0;color:#64748b;font-size:13px">
         I-review ang resibo at gumawa ng account sa <b>Admin → Requests</b>.
       </p>
     </div>`,
  );

  return { ok: true };
}
