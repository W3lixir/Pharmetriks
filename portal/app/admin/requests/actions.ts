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
  if (req.status !== 'pending') return { ok: false, error: 'Na-aksyunan na ang request na ito.' };

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
