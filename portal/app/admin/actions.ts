'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, adminService } from '@/lib/admin';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function logAction(args: {
  adminId: string;
  targetUserId: string;
  action: 'approve' | 'reject' | 'revoke' | 'extend' | 'note';
  notes?: string | null;
}) {
  const svc = adminService();
  await svc.from('admin_actions').insert({
    admin_id:        args.adminId,
    target_user_id:  args.targetUserId,
    action:          args.action,
    notes:           args.notes ?? null,
  });
}

// ── Approve ─────────────────────────────────────────────────────────────

export async function approveUserAction(formData: FormData): Promise<ActionResult> {
  const admin     = await requireAdmin();
  const targetId  = String(formData.get('target_user_id') ?? '');
  const notes     = String(formData.get('notes') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
      notes,
    })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'approve',
    notes,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Reject ─────────────────────────────────────────────────────────────

export async function rejectUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  const reason   = String(formData.get('reason') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({ status: 'rejected', notes: reason })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'reject',
    notes:        reason,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Revoke (approved → revoked) ─────────────────────────────────────────

export async function revokeUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  const reason   = String(formData.get('reason') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({ status: 'revoked', notes: reason })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'revoke',
    notes:        reason,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Restore (revoked/rejected → approved) ───────────────────────────────
// Useful when admin rejected/revoked by mistake.

export async function restoreUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
    })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'approve',
    notes:        'restored from revoked/rejected',
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Get signed URL for the receipt (admin only) ─────────────────────────

export async function getReceiptSignedUrl(receiptPath: string): Promise<string | null> {
  await requireAdmin();
  if (!receiptPath) return null;
  const svc = adminService();
  const { data, error } = await svc.storage
    .from('receipts')
    .createSignedUrl(receiptPath, 60 * 10); // 10-minute link
  if (error) return null;
  return data?.signedUrl ?? null;
}
