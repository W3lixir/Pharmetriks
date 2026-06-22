'use server';

import { redirect } from 'next/navigation';
import { getServerClient, getServiceClient } from '@/lib/supabase/server';
import { sendAdminNotify, escapeHtml } from '@/lib/email';

export type SignupResult = { ok: false; error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email        = String(formData.get('email')         ?? '').trim().toLowerCase();
  const password     = String(formData.get('password')      ?? '');
  const fullName     = String(formData.get('full_name')     ?? '').trim();
  const pharmacyName = String(formData.get('pharmacy_name') ?? '').trim();

  if (!EMAIL_RE.test(email))             return { ok: false, error: 'Please enter a valid email address.' };
  if (password.length < 8)               return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!fullName)                         return { ok: false, error: 'Full name is required.' };
  if (!pharmacyName)                     return { ok: false, error: 'Pharmacy name is required.' };

  const supabase = getServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, pharmacy_name: pharmacyName },
    },
  });

  if (error) {
    // Surface friendly Taglish messages for common cases.
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('user already')) {
      return { ok: false, error: 'May account na yang email. Try mag-login na lang.' };
    }
    if (msg.includes('password')) {
      return { ok: false, error: 'Mahina ang password. Try mas mahabang password.' };
    }
    return { ok: false, error: error.message };
  }

  // Auto-confirm the email so the user can log in immediately. Access is still
  // gated by admin approval + receipt review; email confirmation only adds
  // friction and — when the confirmation email never arrives — silently makes a
  // correct password look "invalid" (Supabase returns "Invalid login
  // credentials" for unconfirmed users).
  const newUserId = data.user?.id;
  if (newUserId) {
    try {
      await getServiceClient().auth.admin.updateUserById(newUserId, { email_confirm: true });
    } catch (e) {
      console.error('[signup] auto-confirm failed:', e);
    }
  }

  // Notify the admin (best-effort — never blocks the signup).
  await sendAdminNotify(
    `🆕 Bagong Pharmetriks signup: ${pharmacyName}`,
    `<div style="font-family:system-ui,sans-serif;color:#1e0a47;line-height:1.6">
       <h2 style="margin:0 0 8px">Bagong signup 🎉</h2>
       <p style="margin:0">
         <b>Botika:</b> ${escapeHtml(pharmacyName)}<br>
         <b>Pangalan:</b> ${escapeHtml(fullName)}<br>
         <b>Email:</b> ${escapeHtml(email)}<br>
         <b>Petsa:</b> ${escapeHtml(new Date().toLocaleString('en-PH'))}
       </p>
       <p style="margin:12px 0 0;color:#64748b;font-size:13px">I-review sa admin panel para ma-approve.</p>
     </div>`,
  );

  // Supabase auth trigger inserts the matching profiles row with status='pending'.
  // Send the user straight to receipt upload.
  redirect('/upload-receipt');
}
