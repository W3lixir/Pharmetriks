'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { requireAdmin, adminService } from '@/lib/admin';

export type RequestResult = { ok: true } | { ok: false; error: string };

function randomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  let p = '';
  for (let i = 0; i < 12; i++) p += chars[bytes[i] % chars.length];
  return p;
}

// Admin reviews a signup request → creates the real auth account (using the
// password the applicant suggested, so they can log in with what they typed) →
// auto-approves it → marks the request handled and CLEARS the stored password.
export async function createFromRequestAction(formData: FormData): Promise<RequestResult> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing request id.' };

  const svc = adminService();
  const { data: req, error: readErr } = await svc
    .from('signup_requests')
    .select('id, full_name, pharmacy_name, email, password, status')
    .eq('id', id)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!req) return { ok: false, error: 'Wala na ang request.' };
  // An account can be created from a still-pending OR an already-verified-paid
  // request; only fully-handled/rejected ones are off-limits.
  if (req.status === 'handled' || req.status === 'rejected') {
    return { ok: false, error: 'Na-aksyunan na ang request na ito.' };
  }

  const email = String(req.email).trim().toLowerCase();
  const password = (req.password && String(req.password).length >= 8) ? String(req.password) : randomPassword();

  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: req.full_name ?? '', pharmacy_name: req.pharmacy_name ?? '' },
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes('already') || m.includes('registered') || m.includes('exists')) {
      return { ok: false, error: 'May account na yang email address.' };
    }
    return { ok: false, error: error.message };
  }

  const uid = data.user?.id;
  if (uid) {
    await svc.from('profiles').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
      full_name: req.full_name ?? null,
      pharmacy_name: req.pharmacy_name ?? null,
    }).eq('id', uid);
    await svc.from('admin_actions').insert({
      admin_id: admin.userId, target_user_id: uid, action: 'approve', notes: 'created from signup request',
    });
  }

  // Mark handled + scrub the suggested password (no longer needed).
  await svc.from('signup_requests')
    .update({ status: 'handled', handled_by: admin.userId, handled_at: new Date().toISOString(), password: null })
    .eq('id', id);

  revalidatePath('/admin/requests');
  return { ok: true };
}

// Mark a pending request as PAID after the admin checks the receipt. This is a
// deliberate, separate step from account creation — the request then surfaces
// under "Paid — ready to approve". (A future PSP webhook would set this same
// status automatically instead of the admin tapping the button.)
export async function markRequestPaidAction(formData: FormData): Promise<RequestResult> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing request id.' };

  const svc = adminService();
  const { data: req, error: readErr } = await svc
    .from('signup_requests').select('status').eq('id', id).maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!req) return { ok: false, error: 'Wala na ang request.' };
  if (req.status !== 'pending') return { ok: false, error: 'Hindi na pending ang request na ito.' };

  const { error } = await svc.from('signup_requests')
    .update({ status: 'paid', paid_at: new Date().toISOString(), paid_by: admin.userId })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/requests');
  return { ok: true };
}

// Undo a mistaken "Mark as paid" — flips a paid request back to pending.
export async function markRequestUnpaidAction(formData: FormData): Promise<RequestResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing request id.' };

  const svc = adminService();
  const { error } = await svc.from('signup_requests')
    .update({ status: 'pending', paid_at: null, paid_by: null })
    .eq('id', id).eq('status', 'paid'); // only undo a still-paid one
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/requests');
  return { ok: true };
}

export async function rejectRequestAction(formData: FormData): Promise<RequestResult> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing request id.' };

  const svc = adminService();
  const { error } = await svc.from('signup_requests')
    .update({ status: 'rejected', handled_by: admin.userId, handled_at: new Date().toISOString(), password: null })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/requests');
  return { ok: true };
}
